# Flutter Debug Assistant MCP Server

A Model Context Protocol (MCP) server that captures, organizes, and prepares Flutter application debugging data for AI analysis.

## Features

- **Real-time Data Capture**: HTTP server receives live debugging data from Flutter apps
- **Smart Filtering**: Configurable capture settings for errors, logs, and performance metrics
- **AI Integration**: Formats selected debugging data as structured context for AI assistance
- **Multi-type Support**: Handles Flutter errors, logs, and performance metrics

## Usage

### Starting the Server

```bash
npm install
npm run build
npm start
```

The server will start:
- MCP Server: stdio communication for MCP protocol
- HTTP Server: http://localhost:3000 for receiving Flutter data

### Flutter Integration

Configure your Flutter app to send debugging data to:
```
POST http://localhost:3000/flutter-data
```

### MCP Tools Available

- `configure_flutter_listener` - Set what data to capture
- `get_captured_data` - View captured debugging data
- `select_for_ai` - Choose items for AI analysis
- `get_ai_context` - Get formatted data for AI
- `clear_captured_data` - Reset capture buffer
- `get_debug_stats` - View capture statistics

## Data Types Supported

### Errors
- Widget build errors
- State management issues
- Navigation problems
- HTTP/API errors
- Platform channel errors
- Memory/performance issues

### Logs
- Debug, info, warning, error levels
- Source tracking
- Context metadata

### Performance
- Frame time measurements
- Memory usage tracking
- CPU usage monitoring
- Network latency metrics

## Development

```bash
npm run dev  # Build and start in development mode
```

## Build

The build system (`build.sh`) can create self-contained distributions:

```bash
./build.sh mcp-server production
```
