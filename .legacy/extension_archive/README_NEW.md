# Flutter Debug Assistant

An intelligent VS Code extension that provides AI-powered debugging assistance for Flutter applications. Get instant help with runtime errors, breakpoint analysis, and terminal output directly in your development workflow.

## 🚀 Features

### 🔴 **Error Detection & Analysis**
- **Automatic Error Detection**: Monitors Flutter applications for runtime errors
- **Smart Error Patterns**: Recognizes common Flutter error types (Widget build errors, State management issues, etc.)
- **One-Click AI Analysis**: Send error context directly to AI for debugging assistance

### 🛑 **Debug Session Integration**
- **Breakpoint Assistance**: Get AI help when debugging stops at breakpoints
- **Debug Context Capture**: Automatically gathers stack frames, variables, and session info
- **Real-time Debug Monitoring**: Monitors Flutter debug sessions for exceptions and events

### 📟 **Terminal Integration**
- **Terminal Error Monitoring**: Detects failed commands and compilation errors
- **Output Analysis**: Send terminal output to AI for build failure analysis
- **Command Context**: Provides intelligent context about Flutter CLI operations

### 🤖 **AI Integration**
- **Multiple AI Providers**: Support for GitHub Copilot, OpenAI, and Claude
- **Smart Context Formatting**: Formats debug information optimally for AI analysis
- **Instant Access**: Right-click context menus and command palette integration

## 📥 Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Flutter Debug Assistant"
4. Click Install

Or install from VSIX:
```bash
code --install-extension flutter-debug-assistant-0.0.1.vsix
```

## 🎯 Usage

### Error Analysis
1. **Select Error Text**: Highlight any error in your Dart/Flutter code
2. **Right-click** → **"🤖 Send Error to AI"**
3. Error context (including surrounding code) is sent to your configured AI provider

### Debug Session Assistance
1. **Start Flutter Debug Session**: Run your app in debug mode
2. **When debugger stops**: Right-click in call stack → **"🤖 Send Debug Context to AI"**
3. Complete debug context (stack frames, variables, session info) is formatted and sent to AI

### Terminal Output Analysis
1. **When command fails in terminal**: Right-click in terminal → **"🤖 Send Terminal Output to AI"**
2. Terminal context and failure information is sent to AI for analysis

### Quick Access Commands
- `Ctrl+Shift+P` → **"Flutter Debug Assistant: Send Error to AI"**
- `Ctrl+Shift+P` → **"Flutter Debug Assistant: Send Debug Context to AI"**
- `Ctrl+Shift+P` → **"Flutter Debug Assistant: Send Terminal Output to AI"**

## ⚙️ Configuration

Access settings via: **File** → **Preferences** → **Settings** → Search "Flutter Debug Assistant"

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `flutterDebugAssistant.aiProvider` | `"copilot"` | AI provider to use (`copilot`, `openai`, `claude`) |
| `flutterDebugAssistant.autoDetectErrors` | `true` | Automatically detect and highlight Flutter errors |
| `flutterDebugAssistant.showInlineButtons` | `true` | Show inline AI assist buttons next to errors |
| `flutterDebugAssistant.debugContextDepth` | `5` | Number of stack frames to include in debug context |

### AI Provider Setup

#### GitHub Copilot (Recommended)
1. Install **GitHub Copilot Chat** extension
2. Set `flutterDebugAssistant.aiProvider` to `"copilot"`
3. Context will be automatically sent to Copilot Chat

#### OpenAI / Claude
1. Set provider in settings
2. Context will be copied to clipboard for manual pasting

## 🐛 Supported Flutter Error Types

The extension recognizes and provides specialized assistance for:

- **Widget Build Errors**: `RenderFlex overflowed`, layout constraint issues
- **State Management**: Bloc/Cubit/Provider state errors
- **Navigation Errors**: Route and navigation failures
- **HTTP/API Errors**: Network request failures and parsing errors
- **Platform Channel Errors**: iOS/Android integration issues
- **Memory/Performance**: Performance warnings and memory leaks
- **Framework Errors**: Flutter framework exceptions
- **Compilation Errors**: Build failures and dependency issues

## 🔧 Development

### Building from Source

```bash
# Clone the repository
git clone <repository-url>
cd flutter_debug_extension

# Install dependencies
npm install

# Compile the extension
npm run compile

# Package the extension
vsce package
```

### Testing

```bash
# Run tests
npm test

# Watch mode for development
npm run watch
```

### Debug the Extension

1. Open this project in VS Code
2. Press `F5` to open Extension Development Host
3. Test the extension features in the new window

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Requirements

- **VS Code**: Version 1.100.0 or higher
- **Flutter SDK**: Any version
- **Dart Extension**: Recommended for full Flutter support

### Optional Dependencies
- **GitHub Copilot Chat**: For integrated AI assistance
- **Flutter Extension**: Enhanced Flutter development experience

## 🗒️ Release Notes

### Version 0.0.1

#### Features
- ✅ Error detection and AI analysis
- ✅ Debug session integration
- ✅ Terminal output monitoring
- ✅ Multiple AI provider support
- ✅ Context menu integration
- ✅ Configurable settings

#### Supported Platforms
- ✅ macOS
- ✅ Windows
- ✅ Linux

## 🐞 Known Issues

- Terminal content reading is limited by VS Code API
- Some debug context features require active debug sessions
- AI provider integrations may require manual clipboard operations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/flutter-debug-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/flutter-debug-assistant/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/flutter-debug-assistant/wiki)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for Flutter developers**

*Accelerate your Flutter debugging with AI-powered assistance!*
