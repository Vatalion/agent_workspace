# Real-time Error Detection & Streaming Guide

This guide explains how to use the Flutter Error Transport MCP Server's real-time error detection and streaming capabilities.

## 🌐 Real-time Streaming Overview

The MCP server includes a built-in WebSocket server that provides real-time streaming of Flutter errors to connected AI systems. This enables immediate error analysis and debugging assistance as errors occur in your Flutter applications.

## 🚀 Getting Started

### 1. Start the MCP Server

```bash
npm start
```

The server will initialize with real-time streaming capabilities enabled on port 8080.

### 2. Control Real-time Streaming

Use the `streaming_control` MCP tool to manage the WebSocket server:

#### Check Streaming Status
```json
{
  "name": "streaming_control",
  "arguments": {
    "action": "status"
  }
}
```

#### Start/Restart Streaming
```json
{
  "name": "streaming_control", 
  "arguments": {
    "action": "start",
    "port": 8080
  }
}
```

#### Stop Streaming
```json
{
  "name": "streaming_control",
  "arguments": {
    "action": "stop"
  }
}
```

#### List Connected Clients
```json
{
  "name": "streaming_control",
  "arguments": {
    "action": "list_clients"
  }
}
```

## 📡 WebSocket Connection

### Connection URL
```
ws://localhost:8080
```

### Message Format

All messages are JSON with the following structure:

#### Error Event (Real-time)
```json
{
  "type": "flutter_error",
  "timestamp": "2025-05-27T10:30:00.000Z",
  "event": {
    "id": "error_1716804600000_abc123",
    "error": {
      "timestamp": "2025-05-27T10:30:00.000Z",
      "errorType": "widget_build",
      "severity": "high", 
      "message": "RenderFlex overflowed by 42 pixels",
      "stackTrace": "...",
      "context": {
        "widgetPath": "MaterialApp > Scaffold > Column",
        "userAction": "User scrolled to bottom"
      },
      "deviceInfo": {
        "platform": "ios",
        "osVersion": "17.0"
      }
    },
    "capturedAt": "2025-05-27T10:30:00.000Z",
    "autoAnalysis": "Widget rendering issue detected...",
    "urgency": "urgent",
    "suggested_actions": [
      "Check widget constraints and parent/child relationships",
      "Verify all required properties are provided"
    ]
  }
}
```

#### Connection Established
```json
{
  "type": "connection_established",
  "timestamp": "2025-05-27T10:30:00.000Z",
  "message": "Connected to Flutter Error Transport Stream",
  "server_version": "1.0.0"
}
```

#### Streaming Statistics
```json
{
  "type": "streaming_stats",
  "timestamp": "2025-05-27T10:30:00.000Z",
  "stats": {
    "totalErrors": 15,
    "connectedClients": 2,
    "serverStatus": "running",
    "errorPatterns": {
      "widget_build:high": 5,
      "state_management:critical": 2
    },
    "recentErrors": [...]
  }
}
```

## 🧪 Testing Real-time Streaming

### 1. Run the Test Client

```bash
node examples/websocket_test_client.js
```

This will connect to the WebSocket server and display real-time error events.

### 2. Capture Test Errors

Use the `capture_flutter_error` tool to generate test errors:

```json
{
  "name": "capture_flutter_error",
  "arguments": {
    "timestamp": "2025-05-27T10:30:00.000Z",
    "errorType": "widget_build",
    "severity": "high",
    "message": "RenderFlex overflowed by 42 pixels on the right",
    "context": {
      "widgetPath": "MaterialApp > Scaffold > Column > TestWidget"
    }
  }
}
```

### 3. Run Automated Tests

```bash
./test_realtime.sh
```

This script will:
- Start the MCP server
- Connect a test client
- Generate various test errors
- Display real-time streaming results

## 🔧 AI System Integration

### WebSocket Client Example (JavaScript)

```javascript
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to Flutter Error Transport');
  
  // Subscribe to error streams
  ws.send(JSON.stringify({
    type: 'subscribe',
    filters: {
      errorTypes: ['widget_build', 'state_management'],
      severityLevels: ['high', 'critical']
    }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  if (message.type === 'flutter_error') {
    // Process real-time error
    const error = message.event;
    console.log('Real-time error:', error.error.message);
    console.log('Auto-analysis:', error.autoAnalysis);
    console.log('Suggested actions:', error.suggested_actions);
    
    // Implement your AI-powered analysis here
    analyzeErrorWithAI(error);
  }
});
```

### Python Client Example

```python
import asyncio
import websockets
import json

async def connect_to_flutter_errors():
    uri = "ws://localhost:8080"
    
    async with websockets.connect(uri) as websocket:
        print("Connected to Flutter Error Transport")
        
        # Subscribe to errors
        await websocket.send(json.dumps({
            "type": "subscribe",
            "filters": {
                "errorTypes": ["all"],
                "severityLevels": ["all"]
            }
        }))
        
        async for message in websocket:
            data = json.loads(message)
            
            if data["type"] == "flutter_error":
                error = data["event"]
                print(f"Real-time error: {error['error']['message']}")
                
                # Implement AI analysis
                await analyze_with_ai(error)

asyncio.run(connect_to_flutter_errors())
```

## 🎯 Error Categories & Auto-Analysis

The system provides immediate analysis for different error types:

### Widget Build Errors
- **Auto-Analysis**: Widget rendering issues, constraints, null values
- **Immediate Actions**: Check widget hierarchy, verify properties
- **Urgency**: Based on impact on user experience

### State Management Errors  
- **Auto-Analysis**: State mutations, provider issues, bloc/cubit problems
- **Immediate Actions**: Verify state initialization, check listeners
- **Urgency**: Critical for app functionality

### Navigation Errors
- **Auto-Analysis**: Route issues, parameter problems, context errors
- **Immediate Actions**: Verify route definitions, check navigation stack
- **Urgency**: Moderate, affects user flow

### HTTP/API Errors
- **Auto-Analysis**: Network issues, endpoint problems, auth failures
- **Immediate Actions**: Check connectivity, verify endpoints
- **Urgency**: High for data-dependent features

### Platform Channel Errors
- **Auto-Analysis**: Native code integration issues
- **Immediate Actions**: Verify platform code, check method channels
- **Urgency**: High for platform-specific features

### Memory/Performance Errors
- **Auto-Analysis**: Memory leaks, excessive rebuilds, async issues
- **Immediate Actions**: Monitor memory usage, check subscriptions
- **Urgency**: Moderate to high based on impact

## 🔄 Real-time Workflow

1. **Error Occurs** in Flutter app
2. **Error Captured** via MCP tool
3. **Immediate Analysis** performed automatically
4. **Real-time Broadcast** to all connected AI systems
5. **AI Processing** of error data and context
6. **Instant Feedback** and debugging assistance

## 📊 Monitoring & Statistics

The system tracks:
- Total errors captured
- Error patterns and frequencies
- Connected AI clients
- Real-time streaming status
- Recent error trends

Access streaming statistics via:
```json
{
  "name": "streaming_control",
  "arguments": {
    "action": "list_clients"
  }
}
```

## 🛠️ Production Deployment

### Security Considerations
- Run WebSocket server on internal network
- Implement authentication for production use
- Use secure WebSocket (WSS) for encrypted connections
- Monitor connected clients and implement rate limiting

### Scaling
- Support for multiple WebSocket servers
- Load balancing for high-volume error streams
- Database storage for error persistence
- Analytics and reporting dashboards

## 🔗 Integration with Flutter Apps

See `INTEGRATION_GUIDE.md` for detailed instructions on integrating the error transport system into your Flutter applications.

## 🧪 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MCP server is running
   - Check WebSocket server is started (`streaming_control` status)
   - Verify port 8080 is available

2. **No Real-time Events**
   - Confirm errors are being captured via `capture_flutter_error`
   - Check WebSocket client connection
   - Verify streaming server status

3. **Performance Issues**
   - Monitor connected client count
   - Implement error filtering
   - Consider rate limiting for high-volume scenarios

### Debug Commands

```bash
# Check server status
npm start

# Test WebSocket connection
node examples/websocket_test_client.js

# Run full integration test
./test_realtime.sh
```

## 🎉 Ready for Real-time Error Detection!

Your Flutter Error Transport system now provides:
- ✅ Real-time error streaming via WebSocket
- ✅ Automatic error analysis and urgency assessment
- ✅ Immediate action suggestions
- ✅ Multi-client support for AI systems
- ✅ Comprehensive error categorization
- ✅ Production-ready streaming infrastructure

Connect your AI systems to `ws://localhost:8080` and start receiving real-time Flutter error data for immediate debugging assistance!
