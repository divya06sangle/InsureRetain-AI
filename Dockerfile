
FROM python:3.14-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install backend dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend and trained model artifacts
COPY backend /app/backend
COPY ml_pipeline/artifacts /app/ml_pipeline/artifacts

# Create a non-root application user
RUN useradd -m -u 1000 user && chown -R user:user /app

USER user

WORKDIR /app/backend

# Render supplies PORT; use 10000 as the fallback
EXPOSE 10000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
