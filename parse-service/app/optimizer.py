import os
from typing import Dict, Any, List, Optional
import json


def call_llm(prompt: str) -> str:
    """
    Call LLM API (OpenAI or other). 
    Returns a dummy deterministic response if OPENAI_API_KEY is not set.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        # Dummy deterministic response for testing
        if "optimize" in prompt.lower() and "experience" in prompt.lower():
            return json.dumps({
                "experience": [
                    {
                        "title": "Frontend Developer (Intern)",
                        "company": "X",
                        "desc": "Built responsive UI using React, improving load time by 30%"
                    }
                ]
            })
        return '{"result": "Optimized content"}'
    
    # TODO: Implement actual OpenAI API call
    # import openai
    # client = openai.OpenAI(api_key=api_key)
    # response = client.chat.completions.create(
    #     model="gpt-4",
    #     messages=[{"role": "user", "content": prompt}]
    # )
    # return response.choices[0].message.content
    
    # For now, return dummy
    return '{"result": "Optimized content"}'


def generate_optimize_text(
    resume: Dict[str, Any],
    mode: str,
    job_description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate optimized resume text based on mode.
    
    Args:
        resume: Parsed resume dictionary
        mode: "short", "long", or "job-tailor"
        job_description: Optional job description for job-tailor mode
    
    Returns:
        Dictionary with optimized experience entries
    """
    experience = resume.get("experience", [])
    
    if not experience:
        return {"experience": []}
    
    # Build prompt based on mode
    if mode == "short":
        prompt = f"""Optimize the following resume experience entries to be concise and impactful. 
        Use action verbs and add quantification where possible. Keep descriptions brief (1-2 sentences).
        
        Current experience:
        {json.dumps(experience, indent=2)}
        
        Return JSON with optimized experience array in the same format."""
    
    elif mode == "long":
        prompt = f"""Expand and enhance the following resume experience entries with more detail.
        Use strong action verbs, quantify achievements, and add context. Make descriptions more comprehensive.
        
        Current experience:
        {json.dumps(experience, indent=2)}
        
        Return JSON with optimized experience array in the same format."""
    
    elif mode == "job-tailor":
        jd_text = job_description or "General software development role"
        prompt = f"""Tailor the following resume experience entries to match this job description.
        Emphasize relevant skills and achievements. Use keywords from the job description.
        
        Job Description:
        {jd_text}
        
        Current experience:
        {json.dumps(experience, indent=2)}
        
        Return JSON with optimized experience array in the same format, emphasizing relevant aspects."""
    
    else:
        raise ValueError(f"Invalid mode: {mode}")
    
    # Call LLM
    llm_response = call_llm(prompt)
    
    # Parse response
    try:
        # Try to extract JSON from response
        if "{" in llm_response and "}" in llm_response:
            # Find JSON object in response
            start = llm_response.find("{")
            end = llm_response.rfind("}") + 1
            json_str = llm_response[start:end]
            result = json.loads(json_str)
            
            # Ensure we have experience array
            if "experience" in result:
                return {"experience": result["experience"]}
            elif isinstance(result, list):
                return {"experience": result}
            else:
                # Fallback: return original with minor enhancements
                return enhance_experience_fallback(experience, mode)
        else:
            return enhance_experience_fallback(experience, mode)
    except json.JSONDecodeError:
        # If LLM response is not valid JSON, use fallback
        return enhance_experience_fallback(experience, mode)


def enhance_experience_fallback(
    experience: List[Dict[str, str]],
    mode: str
) -> Dict[str, Any]:
    """
    Fallback enhancement when LLM response is invalid.
    Adds basic improvements like action verbs and formatting.
    """
    optimized = []
    
    action_verbs = {
        "short": ["Built", "Developed", "Improved", "Created", "Optimized"],
        "long": ["Architected", "Implemented", "Designed", "Led", "Delivered"],
        "job-tailor": ["Developed", "Collaborated", "Enhanced", "Streamlined", "Delivered"]
    }
    
    verbs = action_verbs.get(mode, action_verbs["short"])
    
    for i, exp in enumerate(experience):
        title = exp.get("title", "Position")
        company = exp.get("company", "Company")
        desc = exp.get("desc", "")
        from_year = exp.get("from", "2020")
        to_year = exp.get("to", "2024")
        
        # Enhance title
        if "intern" in title.lower() or "internship" in title.lower():
            enhanced_title = title.replace("intern", "Intern").replace("Internship", "Intern")
        else:
            enhanced_title = title
        
        # Enhance description
        verb = verbs[i % len(verbs)]
        if mode == "short":
            # Make concise
            if len(desc) > 100:
                desc = desc[:97] + "..."
            enhanced_desc = f"{verb} {desc.lower()}"
        elif mode == "long":
            # Expand
            enhanced_desc = f"{verb} {desc}. Implemented best practices and collaborated with cross-functional teams."
        else:  # job-tailor
            enhanced_desc = f"{verb} {desc} with focus on delivering measurable results."
        
        # Add quantification if not present
        if "%" not in enhanced_desc and "x" not in enhanced_desc.lower():
            if mode != "short":
                enhanced_desc += " Achieved significant improvements in efficiency."
        
        optimized.append({
            "title": enhanced_title,
            "company": company,
            "from": from_year,
            "to": to_year,
            "desc": enhanced_desc
        })
    
    return {"experience": optimized}

