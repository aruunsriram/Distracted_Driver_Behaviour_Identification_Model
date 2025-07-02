# ---------- Stage 1: Build React Frontend ----------
FROM node:18 AS frontend

WORKDIR /frontend

# Copy and build React app
COPY frontend/ ./
RUN npm install
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build


# ---------- Stage 2: Set up Python Backend ----------
FROM python:3.10-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# Copy backend app code
COPY backend/ .

# Copy React frontend build into Flask static folder
COPY --from=frontend /frontend/build ./static

# Expose Flask port
EXPOSE 5000

# Run Flask app via Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]