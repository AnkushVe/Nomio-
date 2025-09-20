#!/bin/bash

# Set up Node.js path
export PATH="$PWD/node-v20.10.0-darwin-x64/bin:$PATH"

echo "🚀 Starting Travel Planner..."
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# Start backend server
echo "📡 Starting backend server..."
node server/server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🌐 Starting frontend server..."
node serve-static.js &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
