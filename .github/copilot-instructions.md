# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an MCP (Model Context Protocol) server project for transporting Flutter runtime errors to AI systems.

## Project Context

- **Purpose**: Create a real-time error transport system that captures Flutter app runtime errors and streams them to AI systems for immediate debugging assistance
- **Technology Stack**: TypeScript, MCP SDK, WebSocket for real-time streaming, Zod for validation
- **Target Integration**: Flutter mobile apps with error monitoring and AI-powered debugging

## Key Features to Implement

1. **Error Transport Tools**:
   - `capture_flutter_error` - Capture and categorize Flutter runtime errors
   - `stream_error_events` - Real-time error streaming via WebSocket
   - `analyze_error_context` - AI-powered error analysis and suggestions
   - `debug_assistance` - Generate debugging steps based on error patterns

2. **Error Categories**:
   - Widget build errors
   - State management errors (Bloc/Cubit/Provider)
   - Navigation errors
   - HTTP/API errors
   - Platform channel errors
   - Memory/performance issues
  
3. **Integration Points**:
   - Flutter error boundary integration
   - Dio HTTP interceptor compatibility
   - Console error formatting
   - Real-time error streaming to Claude/AI systems

## Development Guidelines

- Use strict TypeScript typing for all error data structures
- Implement comprehensive error validation with Zod schemas
- Follow MCP protocol specifications for tool definitions
- Ensure real-time streaming capabilities for immediate AI assistance
- Include Flutter-specific error context and stack trace analysis

## Reference Information

You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt

The MCP SDK documentation: https://github.com/modelcontextprotocol/create-python-server
