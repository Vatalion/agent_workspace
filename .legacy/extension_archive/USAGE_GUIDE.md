# Flutter Debug Assistant - Usage Guide

This guide shows you how to use the Flutter Debug Assistant VS Code extension to get AI-powered debugging help.

## 🚀 Quick Start

### 1. Install and Configure

1. **Install the Extension**: Search for "Flutter Debug Assistant" in VS Code Extensions
2. **Configure AI Provider**: 
   - Open Settings (`Cmd+,` / `Ctrl+,`)
   - Search "Flutter Debug Assistant"
   - Set your preferred AI provider (Copilot recommended)

### 2. Basic Usage Scenarios

## 🔴 Scenario 1: Analyzing Runtime Errors

### When you see an error in your code:

```dart
// Example error in your Flutter code
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      child: Text('Hello World'),
    ); // RenderFlex overflowed error occurs here
  }
}
```

**Steps:**
1. **Select the error text** in your editor
2. **Right-click** → **"🤖 Send Error to AI"**
3. **AI Context is automatically generated:**

```
**Flutter Error Analysis Request**

**File:** /path/to/your/file.dart
**Line:** 15
**Timestamp:** 2025-05-28T10:30:00.000Z

**Selected Error:**
```dart
RenderFlex overflowed by 42 pixels on the right.
```

**Surrounding Code:**
```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: double.infinity,
      child: Text('Hello World'),
    );
  }
}
```

**Instructions:** Please analyze this Flutter error, explain the root cause, and provide specific solutions with code examples if applicable.
```

## 🛑 Scenario 2: Debug Session Assistance

### When your debugger stops at a breakpoint:

1. **Start Flutter Debug Session**:
   ```bash
   flutter run --debug
   ```

2. **Set breakpoints** in your code
3. **When debugger stops**: Right-click in **Call Stack** → **"🤖 Send Debug Context to AI"**

**AI receives comprehensive context:**
```
**Flutter Debug Context**

**Session:** Flutter (Debug)
**Timestamp:** 2025-05-28T10:30:00.000Z
**Error:** Exception: Invalid state

**Stack Frames:** 5 frames
1. MyWidget.build (package:my_app/widgets/my_widget.dart:25)
2. StatelessElement.build (package:flutter/src/widgets/framework.dart:4756)
3. ComponentElement.performRebuild (package:flutter/src/widgets/framework.dart:4642)
4. Element.rebuild (package:flutter/src/widgets/framework.dart:4336)
5. BuildOwner.buildScope (package:flutter/src/widgets/framework.dart:2786)

**Variables:** 3 variables
- context: BuildContext instance
- data: List<String> (length: 0)
- isLoading: true

**Instructions:** Please analyze this Flutter debug context and provide debugging assistance, potential root causes, and suggested solutions.
```

## 📟 Scenario 3: Terminal Error Analysis

### When a Flutter command fails:

```bash
$ flutter build apk
Building with sound null safety
Running Gradle task 'assembleRelease'...
> Task :app:lintVitalRelease FAILED
```

**Steps:**
1. **Right-click in terminal** → **"🤖 Send Terminal Output to AI"**
2. **Copy the error output** when prompted
3. **Paste it in your AI chat** along with the generated context

## ⚙️ Advanced Configuration

### Custom AI Provider Setup

#### GitHub Copilot Integration (Recommended)
```json
{
  "flutterDebugAssistant.aiProvider": "copilot",
  "flutterDebugAssistant.autoDetectErrors": true,
  "flutterDebugAssistant.showInlineButtons": true
}
```

#### Custom Context Depth
```json
{
  "flutterDebugAssistant.debugContextDepth": 10
}
```

## 🎯 Tips for Better Results

### 1. **Provide Context in Your Questions**
When the AI context is sent, add your own context:

```
**Additional Context:**
- This error started happening after I added a new ListView
- The app works fine on iOS but crashes on Android
- I'm using Provider for state management
```

### 2. **Use Descriptive Error Selection**
Select more than just the error message - include relevant code:

```dart
// ✅ Good selection
Container(
  width: MediaQuery.of(context).size.width,
  height: 200,
  child: ListView.builder(
    itemCount: items.length,
    itemBuilder: (context, index) {
      return Text(items[index]); // Error occurs here
    },
  ),
)

// ❌ Poor selection  
// Error occurs here
```

### 3. **Include Relevant Dependencies**
Mention relevant packages in your questions:

```
I'm using:
- flutter_bloc: ^8.1.0
- dio: ^5.0.0
- provider: ^6.0.0
```

## 🔧 Troubleshooting

### Extension Not Working?

1. **Check Extension is Active**:
   - Open Command Palette (`Cmd+Shift+P`)
   - Type "Flutter Debug Assistant"
   - Commands should appear

2. **Verify Dart/Flutter Project**:
   - Extension activates for `.dart` files
   - Make sure you're in a Flutter project

3. **Debug Session Issues**:
   - Start Flutter debug session first
   - Use `flutter run --debug` or VS Code debug launch

### AI Provider Issues

#### Copilot Not Working?
- Install **GitHub Copilot Chat** extension
- Sign in to GitHub Copilot
- Check if Copilot is active

#### Context Not Formatted Correctly?
- Try copying the generated context manually
- Check your AI provider settings

## 📱 Example Flutter Error Types

### Widget Build Errors
```dart
// Common: RenderFlex overflow
Row(
  children: [
    Container(width: 200, child: Text('Long text that will overflow')),
    Container(width: 200, child: Text('More long text')),
    Container(width: 200, child: Text('Even more text')),
  ],
)
```

### State Management Errors
```dart
// BLoC error example
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  CounterBloc() : super(CounterInitial()) {
    on<Increment>((event, emit) {
      emit(CounterValue(state.value + 1)); // Error: state doesn't have value
    });
  }
}
```

### Navigation Errors
```dart
// Navigation error example
Navigator.pushNamed(context, '/nonexistent-route'); // Error: route not defined
```

## 🤝 Best Practices

1. **Always include relevant code context**
2. **Mention your Flutter/Dart versions**
3. **Describe what you were trying to achieve**
4. **Include error reproduction steps**
5. **Specify target platforms (iOS/Android/Web)**

## 📞 Getting Help

- **Extension Issues**: Use VS Code's issue reporting
- **Flutter Debugging**: Include Flutter doctor output
- **AI Provider Issues**: Check provider-specific documentation

---

**Happy Debugging! 🚀**

*The Flutter Debug Assistant is designed to make your debugging experience faster and more efficient by providing intelligent AI assistance right in your development workflow.*
