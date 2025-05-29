#!/bin/bash

echo "🔧 TESTING BUTTONS RIGHT NOW"
echo "================================"

# Start the MCP server first
echo "1. Starting MCP server..."
cd ../src
node index.js &
SERVER_PID=$!
echo "   Server started with PID: $SERVER_PID"

# Wait for server to start
sleep 3

# Test server health
echo "2. Testing server health..."
curl -s http://localhost:3000/health || echo "   ❌ Server not responding"

# Open VS Code with the extension
echo "3. Opening VS Code..."
cd ../flutter_debug_extension
code . &

echo ""
echo "🎯 MANUAL TESTING STEPS:"
echo "1. In VS Code, press Cmd+Shift+P"
echo "2. Type: 'Flutter AI Debug Assistant'"
echo "3. Select: 'Flutter AI Debug Assistant: Open Panel'"
echo "4. Try clicking the buttons:"
echo "   - Start Server"
echo "   - Stop Server" 
echo "   - Restart Server"
echo "   - Refresh Status"
echo ""
echo "🔍 WHAT TO LOOK FOR:"
echo "✅ Buttons should be clickable (not grayed out)"
echo "✅ Console should show: '🔥 Button clicked: start'"
echo "✅ Server status should update"
echo ""
echo "❌ IF BUTTONS STILL DON'T WORK:"
echo "1. Open VS Code Developer Console (Help → Toggle Developer Tools)"
echo "2. Look for JavaScript errors"
echo "3. Check if handleServerAction function exists"
echo ""
echo "Press Ctrl+C to stop the MCP server when done testing"

# Keep script running until user stops it
wait $SERVER_PID 