# Stage 1: Base
FROM python:3.11.5-slim as base

# Set environment variables for Python (common to both dev and prod)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/srv/www/src

# Set the working directory.
WORKDIR /srv/www

# Copy the dependency list and install dependencies.
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code.
COPY . .

# Stage 2: Development Image
FROM base as app_dev

# Expose the application port.
EXPOSE 8000

# Development command using hot-reload.
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Stage 3: Production Image
FROM base as app_prod

# Expose the application port.
EXPOSE 8000

# Production command (without hot-reload).
CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
