#!/bin/bash
# Quick start script for development

echo "Starting GOLEXAI Backend..."

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Copy .env.example to .env and configure it."
fi

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Start server
echo "Starting development server on http://localhost:8000"
python manage.py runserver

