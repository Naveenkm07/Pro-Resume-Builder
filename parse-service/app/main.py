from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os

from app.parsers import parse_file
from app.optimizer import generate_optimize_text

app = FastAPI(title="Resume Parser & Optimizer Service")


class ParseRequest(BaseModel):
    filepath: str


class OptimizeRequest(BaseModel):
    resume: Dict[str, Any]
    mode: str  # "short" | "long" | "job-tailor"
    job_description: Optional[str] = None


@app.post("/parse")
async def parse_endpoint(request: ParseRequest):
    """
    Parse a PDF or DOCX file and extract resume sections.
    """
    filepath = request.filepath
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"File not found: {filepath}")
    
    try:
        result = parse_file(filepath)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.post("/optimize")
async def optimize_endpoint(request: OptimizeRequest):
    """
    Optimize resume content using LLM based on mode.
    """
    if request.mode not in ["short", "long", "job-tailor"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mode: {request.mode}. Must be 'short', 'long', or 'job-tailor'"
        )
    
    try:
        result = generate_optimize_text(
            request.resume,
            request.mode,
            request.job_description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

