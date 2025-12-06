#!/bin/bash
# Quick test server script

echo "🚀 Starting GOLEXAI Backend Test Server..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run: python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file - please add your OPENAI_API_KEY"
    fi
fi

# Run migrations
echo "📦 Running migrations..."
python manage.py migrate

# Check for superuser
echo ""
echo "👤 Checking for superuser..."
python manage.py shell -c "from accounts.models import User; print('Users:', User.objects.count())" 2>/dev/null || echo "No users found"

# Start server
echo ""
echo "🌐 Starting development server..."
echo "📍 Backend: http://localhost:8000"
echo "📍 Admin: http://localhost:8000/admin/"
echo "📍 API: http://localhost:8000/api/"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python manage.py runserver

