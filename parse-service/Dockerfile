# Parser Service Dockerfile - Python FastAPI
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model (optional but recommended)
RUN python -m spacy download en_core_web_sm || true

# Copy application files
COPY app ./app
COPY run.py .

# Create uploads directory (if parser needs to access files)
RUN mkdir -p /app/uploads

EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

