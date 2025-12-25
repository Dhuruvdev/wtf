#!/bin/bash

# Multi-service startup script for WTF Land
# Runs: Web Server (Express/React) + Discord Bot in parallel

set -e

echo "🚀 Starting WTF Land - All Services"
echo "===================================="

# Create .env from .env.example if missing
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example"
    cp .env.example .env
    echo "📝 Edit .env with your credentials"
fi

# Start web server
echo ""
echo "🌐 Starting Web Server (Port 5000)..."
npm run dev &
WEB_PID=$!
echo "   Web Server PID: $WEB_PID"

# Wait for web server to be ready
sleep 3

# Start Discord bot (only if token is set)
if [ -z "$DISCORD_BOT_TOKEN" ]; then
    echo ""
    echo "⚠️  DISCORD_BOT_TOKEN not set. Skipping bot startup."
    echo "   Set DISCORD_BOT_TOKEN in .env to run bot"
else
    echo ""
    echo "🤖 Starting Discord Bot..."
    python discord_bot.py &
    BOT_PID=$!
    echo "   Bot PID: $BOT_PID"
fi

echo ""
echo "✅ All services started!"
echo "   Web: http://localhost:5000"
echo "   Bot: Discord (@WTF Land Bot)"
echo ""
echo "📚 Running services:"
echo "   - Express.js API + React frontend"
echo "   - WebSocket multiplayer sync"
echo "   - Discord bot with slash commands"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for all background processes
wait
