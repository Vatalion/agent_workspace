# Flutter Debug Assistant Extension - Testing Guide

## Overview
This guide helps you test the Flutter Debug Assistant VS Code extension using the comprehensive error examples provided in this Flutter test application.

## Setup Instructions

### 1. Install the VS Code Extension
```bash
cd flutter_debug_extension
code --install-extension ./flutter-debug-assistant-*.vsix
```

### 2. Launch Flutter Test App
```bash
cd test_flutter_app
flutter run
```

### 3. Open VS Code with Extension Development Host
Press `F5` in VS Code while in the extension directory to launch Extension Development Host.

## Testing Scenarios

### 🎨 Widget Build Errors

#### RenderFlex Overflow
1. **Trigger**: Tap "RenderFlex Overflow" button
2. **Expected Error**: `RenderFlex overflowed by X pixels on the right`
3. **Test Extension**: 
   - Right-click on error text → "🤖 Send Error to AI"
   - Extension should format error with widget tree context

#### Constraint Violation
1. **Trigger**: Tap "Constraint Violation" button
2. **Expected Error**: Constraint violation errors
3. **Test Extension**: Use debug context menu during breakpoint

#### Invalid Widget Tree
1. **Trigger**: Tap "Invalid Widget Tree" button
2. **Expected Error**: `Scaffold inside ListView` error
3. **Test Extension**: Send widget tree error to AI chat

### 🔄 State Management Errors

#### setState After Dispose
1. **Trigger**: Tap "setState After Dispose" button
2. **Expected Error**: `setState() called after dispose()`
3. **Test Extension**: 
   - Error appears after 2 seconds in console
   - Right-click terminal → "🤖 Send Terminal Output to AI"

#### Null State Access
1. **Trigger**: Tap "Null State Access" button
2. **Expected Error**: Null reference exception
3. **Test Extension**: Send runtime error to AI

#### Invalid State Update
1. **Trigger**: Tap "Invalid State Update" button
2. **Expected Error**: `StateError: Invalid state update triggered for testing`
3. **Test Extension**: Use debug session context menu

### 🧭 Navigation Errors

#### Invalid Route
1. **Trigger**: Tap "Invalid Route" button
2. **Expected Error**: Route not found error
3. **Test Extension**: Send navigation error with stack trace

#### Missing Route Arguments
1. **Trigger**: Tap "Missing Route Arguments" button
2. **Expected Error**: Missing arguments error
3. **Test Extension**: Test AI context formatting

#### Navigator Stack Error
1. **Trigger**: Tap "Navigator Stack Error" button
2. **Expected Error**: Navigator stack manipulation error
3. **Test Extension**: Send complex error context

### 🌐 HTTP/API Errors

#### Network Request Failure
1. **Trigger**: Tap "Network Request Failure" button
2. **Expected Error**: Network connection error
3. **Test Extension**: 
   - Error includes HTTP context
   - Test async error handling

#### JSON Parse Error
1. **Trigger**: Tap "JSON Parse Error" button
2. **Expected Error**: `FormatException: JSON parsing failed`
3. **Test Extension**: Send parsing error with data context

#### Timeout Error
1. **Trigger**: Tap "Timeout Error" button
2. **Expected Error**: Request timeout after 2 seconds
3. **Test Extension**: Test timeout error formatting

### ⚡ Memory/Performance Errors

#### Memory Leak Simulation
1. **Trigger**: Tap "Memory Leak Simulation" button
2. **Expected Behavior**: Creates large objects, adds to state
3. **Test Extension**: Monitor for memory warnings

#### Infinite Loop
1. **Trigger**: Tap "Infinite Loop" button
2. **Expected Behavior**: App freezes briefly
3. **Test Extension**: Test performance error detection

#### Heavy Computation
1. **Trigger**: Tap "Heavy Computation" button
2. **Expected Behavior**: UI blocks for several seconds
3. **Test Extension**: Send performance context to AI

### 📱 Platform Channel Errors

#### Missing Platform Method
1. **Trigger**: Tap "Missing Platform Method" button
2. **Expected Error**: `MissingPluginException`
3. **Test Extension**: Test platform-specific error handling

#### Platform Exception
1. **Trigger**: Tap "Platform Exception" button
2. **Expected Error**: Platform-specific error with details
3. **Test Extension**: Send platform error with full context

### 🎬 Animation/Controller Errors

#### Ticker After Dispose
1. **Trigger**: Tap "Ticker After Dispose" button, then navigate back quickly
2. **Expected Error**: Ticker disposed error after navigation
3. **Test Extension**: Test animation lifecycle errors

#### Animation Controller Leak
1. **Trigger**: Tap "Animation Controller Leak" button, start animation, navigate back
2. **Expected Behavior**: Controller not disposed properly
3. **Test Extension**: Send controller leak warning

#### Invalid Animation Value
1. **Trigger**: Tap "Invalid Animation Value" button
2. **Expected Error**: Animation value out of bounds error
3. **Test Extension**: Test animation error context

### 📝 Focus/Form Errors

#### Focus Node After Dispose
1. **Trigger**: Tap "Focus Node After Dispose" button, navigate back
2. **Expected Error**: Focus node disposal error
3. **Test Extension**: Test focus management errors

#### Form Validation Error
1. **Trigger**: Tap "Form Validation Error" button, then "Validate Form"
2. **Expected Error**: Validation exception
3. **Test Extension**: Send form validation error

#### Text Controller Leak
1. **Trigger**: Tap "Text Controller Leak" button, navigate back
2. **Expected Behavior**: Text controller not disposed
3. **Test Extension**: Test resource leak detection

### ⏰ Async/Future Errors

#### Unhandled Future Error
1. **Trigger**: Tap "Unhandled Future Error" button
2. **Expected Error**: Unhandled exception in console after 100ms
3. **Test Extension**: Test async error capture

#### Stream Error
1. **Trigger**: Tap "Stream Error" button
2. **Expected Error**: Stream error with stack trace
3. **Test Extension**: Send stream error context

#### Completer Error
1. **Trigger**: Tap "Completer Error" button
2. **Expected Error**: Completer completed with error
3. **Test Extension**: Test future error handling

## Extension Feature Testing

### 1. Error Text Selection
- Select any error message in the console or debug output
- Right-click → "🤖 Send Error to AI"
- Verify error is sent to AI chat with proper formatting

### 2. Debug Session Context
- Set breakpoint in any error method
- When breakpoint hits, right-click in call stack
- Select "🤖 Send Debug Context to AI"
- Verify debug context includes variables and stack trace

### 3. Terminal Integration
- When commands fail in terminal, right-click in terminal
- Select "🤖 Send Terminal Output to AI"
- Verify terminal output is captured and formatted

### 4. Real-time Error Detection
- Enable extension's auto-detection feature
- Trigger any error that doesn't hit breakpoints
- Verify extension automatically detects and offers AI assistance

## Configuration Testing

### 1. AI Provider Selection
- Test with GitHub Copilot (if available)
- Test with other configured AI providers
- Verify provider switching works correctly

### 2. Extension Settings
- Test auto-detection toggle
- Test inline button display
- Test debug context depth settings

### 3. Context Formatting
- Verify error messages include surrounding code
- Verify stack traces are properly formatted
- Verify debug variable context is included

## Expected Outcomes

### Successful Tests Should Show:
1. ✅ Error text properly formatted for AI
2. ✅ Debug context includes relevant variables
3. ✅ Stack traces are clean and readable
4. ✅ AI receives comprehensive error context
5. ✅ Extension integrates seamlessly with VS Code workflow

### Common Issues to Watch For:
1. ❌ Error text truncated or malformed
2. ❌ Debug context missing variables
3. ❌ AI provider communication failures
4. ❌ Extension commands not appearing in context menus
5. ❌ Auto-detection not working for runtime errors

## Troubleshooting

### Extension Not Loading
- Check VS Code developer console for errors
- Verify extension is activated for Dart/Flutter files
- Restart Extension Development Host

### Commands Not Appearing
- Verify you're right-clicking in correct contexts
- Check extension activation events
- Ensure debug session is active for debug commands

### AI Integration Issues
- Verify AI provider is properly configured
- Check network connectivity for external AI services
- Test with GitHub Copilot first (most reliable)

## Advanced Testing

### Performance Testing
- Test with large error messages
- Test with deep call stacks
- Monitor memory usage during extended testing

### Edge Cases
- Test with malformed error messages
- Test with very long stack traces
- Test with errors containing special characters

### Integration Testing
- Test with multiple debug sessions
- Test with concurrent error conditions
- Test with rapid error succession

## Reporting Results

Document your testing results including:
- Which error types work correctly
- Any formatting issues discovered
- AI provider compatibility
- Performance observations
- User experience feedback

This comprehensive testing ensures the Flutter Debug Assistant extension provides reliable, helpful AI-powered debugging assistance for Flutter developers.
