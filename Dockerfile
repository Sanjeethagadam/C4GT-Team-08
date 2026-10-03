FROM node:22-bookworm-slim

# Install Python, pip, venv, Tesseract OCR, and required system libraries
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set up application directory
WORKDIR /app

# Copy result-processor and install Python dependencies
COPY result-processor /app/result-processor
RUN pip install --no-cache-dir -r /app/result-processor/requirements.txt

# Copy backend package files and install Node dependencies
COPY backend/package*.json /app/backend/
WORKDIR /app/backend
RUN npm install --omit=dev

# Copy the rest of the backend code
COPY backend /app/backend/

# Expose port and start
EXPOSE 5000
CMD ["npm", "start"]
