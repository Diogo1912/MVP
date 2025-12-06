#!/bin/bash
# Quick test frontend script

echo "🌐 Starting GOLEXAI Frontend..."
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000/api/"
echo ""
echo "Make sure backend is running!"
echo "Press Ctrl+C to stop"
echo ""

python3 -m http.server 3000

