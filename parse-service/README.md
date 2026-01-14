# Resume Parser & Optimizer Service

FastAPI microservice for parsing resumes (PDF/DOCX) and optimizing resume content using LLM.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install spaCy language model (optional but recommended):
```bash
python -m spacy download en_core_web_sm
```

3. Set environment variable for LLM (optional):
```bash
export OPENAI_API_KEY=your_key_here
```

## Running the Service

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the provided script:
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Endpoints

### POST /parse
Parse a PDF or DOCX file and extract resume sections.

**Request:**
```json
{
  "filepath": "/path/to/resume.pdf"
}
```

**Response:**
```json
{
  "name": "Naveen Kumar",
  "contact": "naveen@example.com | +91-98xxxxxxx",
  "summary": "3rd-year CSE student...",
  "skills": ["React", "Node.js", "Python"],
  "experience": [
    {
      "title": "Intern",
      "company": "ABC",
      "desc": "Built features",
      "from": "2024",
      "to": "2024"
    }
  ],
  "education": [
    {
      "degree": "B.E CSE",
      "college": "NHCE",
      "year": "2025"
    }
  ]
}
```

### POST /optimize
Optimize resume experience entries using LLM.

**Request:**
```json
{
  "resume": {
    "experience": [
      {
        "title": "Worked on website",
        "company": "X",
        "desc": "Worked on frontend"
      }
    ]
  },
  "mode": "short",
  "job_description": "Optional job description for job-tailor mode"
}
```

**Modes:**
- `short`: Concise, impactful descriptions
- `long`: Detailed, comprehensive descriptions
- `job-tailor`: Tailored to match job description

**Response:**
```json
{
  "experience": [
    {
      "title": "Frontend Developer (Intern)",
      "company": "X",
      "desc": "Built responsive UI using React, improving load time by 30%"
    }
  ]
}
```

### GET /health
Health check endpoint.

## Testing

Run tests with pytest:
```bash
pytest tests/
```

## Notes

- The service uses `pdfplumber` for PDF parsing and `python-docx` for DOCX parsing
- Text extraction uses regex patterns and spaCy for NLP heuristics
- LLM integration: Set `OPENAI_API_KEY` to use real API, otherwise returns deterministic mock responses
- File paths in `/parse` must be absolute server paths (files should be accessible to the service)

