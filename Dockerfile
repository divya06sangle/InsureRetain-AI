FROM python:3.11-slim

WORKDIR /app

# Install system build dependencies needed by shap/scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend code and trained ML artifacts
COPY backend /app/backend
COPY ml_pipeline/artifacts /app/ml_pipeline/artifacts

# Hugging Face Spaces runs as user 1000 on port 7860
RUN useradd -m -u 1000 user && chown -R user:user /app
USER user

WORKDIR /app/backend
EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]