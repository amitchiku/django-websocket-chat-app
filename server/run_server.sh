#!/bin/bash
# Run Django with Daphne ASGI server for WebSocket support

echo "Starting Django with Daphne ASGI server..."
echo ""
echo "WebSocket Server: ws://localhost:8000/ws/chat/"
echo "API Server: http://localhost:8000/api/"
echo ""

daphne -b 0.0.0.0 -p 8000 server.asgi:application
