# 🚀 Flutter Debug Assistant - Usage Guide

## Quick Start (3 Easy Steps)

### Step 1: Start Flutter App for Testing
```bash
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/test_flutter_app
flutter run
```

### Step 2: Open VS Code with Flutter Project
```bash
code /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/test_flutter_app
```

### Step 3: Watch the Magic Happen!
The extension automatically detects errors and shows AI assistance buttons.

---

## 🎯 Three Ways to Get AI Help

### 1. 📱 **Console Error Detection** (Automatic)
**What it does**: Monitors Flutter debug console and shows AI buttons when errors appear.

**How to test:**
1. Run your Flutter app (`flutter run`)
2. In the running app, tap the **"🔥 Trigger Console Errors"** button
3. Watch VS Code for error notifications with **"🤖 Fix This Error"** buttons
4. Click the button to send error to AI chat

**Example errors detected:**
- `Exception: Test console exception for AI analysis`
- `RenderFlex overflowed by 42.0 pixels`
- `NoSuchMethodError: The method 'testMethod' was called on null`

### 2. 🔴 **Exception Breakpoint Detection** (During Debug)
**What it does**: Shows AI help buttons when debugger stops at exceptions.

**How to test:**
1. Open `lib/test_breakpoint_errors.dart` in VS Code
2. Set a breakpoint on line with `nullString!.length;`
3. Run Flutter app in **debug mode** (F5 or Debug menu)
4. In the app, tap **"🔴 Test Null Pointer"** button
5. When debugger stops, look for **"🤖 Fix Error"** decoration in editor
6. Click notification **"🤖 Fix This Exception"**

### 3. 🤖 **Claude Desktop MCP Integration** (Advanced)
**What it does**: Provides Flutter debugging tools directly in Claude Desktop.

**How to use:**
1. Open Claude Desktop app
2. Start a new conversation
3. Use these Flutter debugging commands:
   ```
   Use capture_flutter_error to analyze this Flutter error: [paste error]
   
   Use analyze_flutter_debug_session to help with my current debugging session
   
   Use suggest_flutter_fix for RenderFlex overflow error
   ```

---

## 🎮 **Interactive Demo Script**

Run this to see all features in action:

```bash
# 1. Start the Flutter app
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/test_flutter_app
flutter run

# 2. In another terminal, open VS Code
code /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/test_flutter_app

# 3. In the Flutter app simulator:
#    - Tap "🔥 Trigger Console Errors" → Watch for console error notifications
#    - Tap "🔴 Test Null Pointer" → Watch for breakpoint error decorations
#    - Tap the counter 3 times → Automatic console error at count 3
#    - Tap the counter 5 times → Automatic exception at count 5
```

---

## 🔧 **VS Code Commands** (Cmd+Shift+P)

| Command | What it does |
|---------|-------------|
| `Flutter Debug Assistant: View Errors` | Show all detected errors in a list |
| `Flutter Debug Assistant: Configure MCP` | Set up Claude Desktop integration |
| `Flutter Debug Assistant: Analyze Debug Session` | Send current debug context to AI |

---

## 🎛️ **Settings & Configuration**

Open VS Code Settings and search for "Flutter Debug Assistant":

- **AI Provider**: Choose between Copilot, Claude, or MCP server
- **Auto Detect Errors**: Enable/disable automatic error detection
- **Show Inline Buttons**: Toggle AI assistance buttons
- **Debug Context Depth**: How many stack frames to include

---

## 🔍 **What to Look For**

### Console Error Detection:
- ✅ **Error notifications** appear when Flutter prints errors
- ✅ **"🤖 Fix This Error"** buttons in notifications
- ✅ **Status bar updates** showing error count

### Breakpoint Exception Detection:
- ✅ **Orange highlighting** in editor at exception lines
- ✅ **"🤖 Fix Error"** text decoration after exception code
- ✅ **Notification popup** with "🤖 Fix This Exception" button

### MCP Server Integration:
- ✅ **Claude Desktop** shows flutter-debug-assistant in MCP servers list
- ✅ **MCP tools available** in Claude chat
- ✅ **Specialized Flutter debugging** commands work

---

## 🔥 **Live Testing Right Now**

Your Flutter app should already be running! Here's what to do:

1. **Check VS Code status bar** - Look for Flutter Debug Assistant icon
2. **Open Debug Console** (View → Debug Console) - Watch for error patterns
3. **In Flutter app**: Tap the error trigger buttons
4. **Watch for notifications** with AI assistance buttons

---

## 🚨 **Troubleshooting**

### Extension not working?
```bash
# Reinstall extension
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/flutter_debug_extension
code --install-extension flutter-debug-assistant-0.0.1.vsix --force
```

### No error notifications?
- Make sure VS Code is open with a Dart/Flutter file
- Check that the extension is activated (look for status bar icon)
- Try triggering errors manually in the Flutter app

### MCP server not in Claude?
```bash
# Check Claude config
cat ~/.config/claude-desktop/claude_desktop_config.json
# Should show flutter-debug-assistant server
```

---

## 🎯 **Expected Results**

After following this guide, you should see:

- **Immediate error detection** when Flutter app generates errors
- **AI assistance buttons** appearing automatically
- **One-click error analysis** sent to AI chat
- **Intelligent debugging suggestions** from AI
- **Seamless integration** with your debugging workflow

**The extension transforms Flutter debugging from manual error analysis to AI-powered instant assistance!** 🚀
