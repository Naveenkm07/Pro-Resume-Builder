import os
import re
from typing import Dict, Any, List, Optional
import pdfplumber
from docx import Document
import spacy

# Load spaCy model (fallback to basic if not available)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # Fallback: create a basic nlp object if model not installed
    nlp = None


def extract_text_from_pdf(filepath: str) -> str:
    """Extract text from PDF file."""
    text = ""
    try:
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
    return text


def extract_text_from_docx(filepath: str) -> str:
    """Extract text from DOCX file."""
    try:
        doc = Document(filepath)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")


def extract_name(text: str) -> Optional[str]:
    """Extract name from resume text (usually first line or after 'Name:' pattern)."""
    lines = text.split("\n")
    # Try to find name after "Name:" or "Full Name:"
    name_pattern = re.compile(r"(?:name|full\s+name)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)", re.IGNORECASE)
    match = name_pattern.search(text)
    if match:
        return match.group(1).strip()
    
    # Fallback: first non-empty line that looks like a name (2-4 capitalized words)
    for line in lines[:10]:
        line = line.strip()
        if line and re.match(r"^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$", line):
            return line
    
    return None


def extract_contact(text: str) -> Optional[str]:
    """Extract contact information (email, phone)."""
    email_pattern = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
    phone_pattern = re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}")
    
    emails = email_pattern.findall(text)
    phones = phone_pattern.findall(text)
    
    contact_parts = []
    if emails:
        contact_parts.append(emails[0])
    if phones:
        contact_parts.append(phones[0])
    
    return " | ".join(contact_parts) if contact_parts else None


def extract_skills(text: str) -> List[str]:
    """Extract skills section using regex and heuristics."""
    skills = []
    
    # Look for "Skills:" section
    skills_pattern = re.compile(
        r"skills?[:\s]+(.*?)(?=\n\n|\n[A-Z][a-z]+:|$)",
        re.IGNORECASE | re.DOTALL
    )
    match = skills_pattern.search(text)
    if match:
        skills_text = match.group(1)
        # Split by comma, semicolon, or newline
        skills = [
            s.strip() 
            for s in re.split(r"[,;\n|]", skills_text)
            if s.strip() and len(s.strip()) < 50
        ]
        return skills[:20]  # Limit to 20 skills
    
    # Fallback: look for common tech keywords
    common_skills = [
        "React", "Node.js", "Python", "JavaScript", "TypeScript", "Java",
        "C++", "SQL", "MongoDB", "PostgreSQL", "Docker", "Kubernetes",
        "AWS", "Git", "HTML", "CSS", "Angular", "Vue", "Express", "Django",
        "Flask", "Spring", "TensorFlow", "PyTorch", "Machine Learning"
    ]
    
    found_skills = []
    for skill in common_skills:
        if re.search(rf"\b{re.escape(skill)}\b", text, re.IGNORECASE):
            found_skills.append(skill)
    
    return found_skills[:15]


def extract_experience(text: str) -> List[Dict[str, str]]:
    """Extract experience entries."""
    experiences = []
    
    # Look for "Experience:" or "Work Experience:" section
    exp_pattern = re.compile(
        r"(?:experience|work\s+experience|employment)[:\s]+(.*?)(?=\n\n(?:education|skills|projects)|$)",
        re.IGNORECASE | re.DOTALL
    )
    match = exp_pattern.search(text)
    if not match:
        return experiences
    
    exp_text = match.group(1)
    
    # Try to split by common patterns (dates, company names, etc.)
    # Look for entries with dates (YYYY-YYYY or YYYY to Present)
    entry_pattern = re.compile(
        r"(.+?)\s+-\s+(.+?)\s+\(?(\d{4})\s*(?:-|to)\s*(?:(\d{4})|present)\)?\s*\n(.*?)(?=\n\n|\n[A-Z]|\Z)",
        re.IGNORECASE | re.DOTALL
    )
    
    matches = entry_pattern.finditer(exp_text)
    for match in matches:
        title = match.group(1).strip()
        company = match.group(2).strip()
        from_year = match.group(3)
        to_year = match.group(4) or "Present"
        desc = match.group(5).strip()[:500]  # Limit description length
        
        experiences.append({
            "title": title,
            "company": company,
            "from": from_year,
            "to": to_year,
            "desc": desc
        })
    
    # If no structured entries found, try simpler pattern
    if not experiences:
        lines = exp_text.split("\n")
        current_entry = {}
        for line in lines:
            line = line.strip()
            if not line:
                continue
            # Check if line looks like a title/company
            if not current_entry.get("title"):
                current_entry["title"] = line
            elif not current_entry.get("company"):
                current_entry["company"] = line
            else:
                if "desc" not in current_entry:
                    current_entry["desc"] = line
                else:
                    current_entry["desc"] += " " + line
                
                if len(current_entry.get("desc", "")) > 200:
                    current_entry["from"] = "2020"
                    current_entry["to"] = "2024"
                    experiences.append(current_entry)
                    current_entry = {}
    
    return experiences[:10]  # Limit to 10 entries


def extract_education(text: str) -> List[Dict[str, str]]:
    """Extract education entries."""
    education = []
    
    # Look for "Education:" section
    edu_pattern = re.compile(
        r"education[:\s]+(.*?)(?=\n\n(?:experience|skills|projects)|$)",
        re.IGNORECASE | re.DOTALL
    )
    match = edu_pattern.search(text)
    if not match:
        return education
    
    edu_text = match.group(1)
    
    # Look for degree patterns
    degree_pattern = re.compile(
        r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:in|,)?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[,\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)?\s*[,\-]?\s*(\d{4})",
        re.IGNORECASE
    )
    
    matches = degree_pattern.finditer(edu_text)
    for match in matches:
        degree_type = match.group(1)  # e.g., "Bachelor"
        field = match.group(2)  # e.g., "Computer Science"
        college = match.group(3) or match.group(2)  # College name or fallback
        year = match.group(4)
        
        education.append({
            "degree": f"{degree_type} in {field}",
            "college": college,
            "year": year
        })
    
    # Simpler fallback if no structured matches
    if not education:
        lines = edu_text.split("\n")
        for line in lines[:5]:
            line = line.strip()
            if line and len(line) > 10:
                # Extract year if present
                year_match = re.search(r"\d{4}", line)
                year = year_match.group(0) if year_match else "2025"
                
                education.append({
                    "degree": line.split(",")[0] if "," in line else line,
                    "college": line.split(",")[1].strip() if "," in line else "University",
                    "year": year
                })
    
    return education[:5]  # Limit to 5 entries


def extract_summary(text: str) -> Optional[str]:
    """Extract summary/objective section."""
    summary_pattern = re.compile(
        r"(?:summary|objective|profile|about)[:\s]+(.*?)(?=\n\n(?:experience|education|skills)|$)",
        re.IGNORECASE | re.DOTALL
    )
    match = summary_pattern.search(text)
    if match:
        summary = match.group(1).strip()
        # Clean up: remove extra whitespace, limit length
        summary = re.sub(r"\s+", " ", summary)
        return summary[:500] if len(summary) > 500 else summary
    
    return None


def parse_file(filepath: str) -> Dict[str, Any]:
    """
    Parse a PDF or DOCX file and extract resume sections.
    
    Returns a dictionary with keys: name, contact, summary, skills, experience, education
    """
    if not os.path.exists(filepath):
        raise ValueError(f"File not found: {filepath}")
    
    # Determine file type
    _, ext = os.path.splitext(filepath.lower())
    
    if ext == ".pdf":
        text = extract_text_from_pdf(filepath)
    elif ext in [".docx", ".doc"]:
        text = extract_text_from_docx(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Only PDF and DOCX are supported.")
    
    if not text or len(text.strip()) < 50:
        raise ValueError("Could not extract sufficient text from file.")
    
    # Extract sections
    result = {
        "name": extract_name(text),
        "contact": extract_contact(text),
        "summary": extract_summary(text),
        "skills": extract_skills(text),
        "experience": extract_experience(text),
        "education": extract_education(text)
    }
    
    # Ensure all fields exist (set to None/empty if not found)
    if not result["name"]:
        result["name"] = "Unknown"
    if not result["contact"]:
        result["contact"] = ""
    if not result["summary"]:
        result["summary"] = ""
    if not result["skills"]:
        result["skills"] = []
    if not result["experience"]:
        result["experience"] = []
    if not result["education"]:
        result["education"] = []
    
    return result

