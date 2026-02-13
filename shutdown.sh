#!/bin/bash

echo "🛑 Shutting down Hardware Lab System..."

# Stop MongoDB using Homebrew
echo "Stopping MongoDB..."
brew services stop mongodb-community

# Kill Flask backend if running on port 5001
echo "Stopping Flask backend..."
lsof -ti:5001 | xargs kill -15 2>/dev/null || echo "Flask backend not running"

# Kill React frontend if running on port 3000
echo "Stopping React frontend..."
lsof -ti:3000 | xargs kill -15 2>/dev/null || echo "React frontend not running"

echo "✅ All services stopped successfully!"
echo ""
echo "To restart the system, run:"
echo "  1. brew services start mongodb-community"
echo "  2. cd backend && python app.py"
echo "  3. cd frontend && npm start"
