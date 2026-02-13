#!/bin/bash

echo "🚀 Starting Hardware Lab System..."

# Start MongoDB using Homebrew
echo "Starting MongoDB..."
brew services start mongodb-community
sleep 2

# Check if MongoDB is running
if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ MongoDB is running on port 27017"
else
    echo "❌ MongoDB failed to start"
    exit 1
fi

echo ""
echo "✅ MongoDB started successfully!"
echo ""
echo "Now run the following commands in separate terminals:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  source ../.venv/bin/activate  # or your virtual environment"
echo "  python app.py"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5001"
