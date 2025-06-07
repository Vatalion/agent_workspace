# 🔍 CodeLens Buttons Troubleshooting Guide

## 🎯 Where to Find the 🤖 Buttons

### 1. **After Triggering Errors in Debug Console**
When you see errors in the VS Code Debug Console (like "flat locks"), the extension now:
- ✅ Detects the error automatically
- ✅ Creates CodeLens buttons in your Dart files
- ✅ Shows popup notifications with "🤖 Fix This Error" buttons

### 2. **CodeLens Button Locations**
Look for 🤖 buttons in these places:

#### **A. Above Error Lines in Code**
```dart
// 🤖 Send Console Error to Copilot    <- This button appears here
void problematicFunction() {
  setState(() {  // Error detected here
    // your code
  });
}
```

#### **B. Above Common Error Patterns**
```dart
// 🤖 Analyze Potential Error    <- This button appears here
RenderFlex(  // Potential overflow pattern
  children: [...]
)
```

#### **C. At File Top for General Errors**
```dart
// 🤖 Send Console Error to Copilot    <- General error button
import 'package:flutter/material.dart';
```

## 🚀 How to See the Buttons

### Step 1: Ensure Extension is Active
1. Check status bar for "🤖 Flutter Debug Assistant"
2. If not visible, reload VS Code window (Cmd+R)

### Step 2: Open the Right File
1. Open `lib/error_examples.dart` in VS Code
2. Make sure it's a `.dart` file (CodeLens only works on Dart files)

### Step 3: Trigger an Error
1. Run your Flutter app in debug mode (F5)
2. Tap error buttons in the app
3. Watch the Debug Console for error output
4. **Wait 2-3 seconds** for CodeLens to refresh

### Step 4: Look for Buttons
- Scroll through your Dart file
- Look for gray text above lines: "🤖 Send Console Error to Copilot"
- Look for gray text above error-prone patterns: "🤖 Analyze Potential Error"

## 🔧 If You Still Don't See Buttons

### Option 1: Use Popup Notifications
When errors occur, you should see popup notifications:
```
🤖 Flutter error detected: RenderFlex overflowed...
[🤖 Fix This Error] [Dismiss]
```
Click "🤖 Fix This Error" to send to Copilot Chat.

### Option 2: Use Command Palette
1. Press `Cmd+Shift+P`
2. Type "Flutter Debug"
3. Select "Flutter Debug: Send to Copilot Chat"

### Option 3: Use Right-Click Menu
1. Select error text in your code
2. Right-click
3. Choose "🤖 Send Error to AI"

### Option 4: Use Status Bar
1. Click the "🤖 Flutter Debug Assistant" in status bar
2. This will send the latest error to AI

## 🐛 Common Issues

### Issue 1: CodeLens Not Enabled
**Solution**: Check VS Code settings
```json
{
  "editor.codeLens": true
}
```

### Issue 2: Extension Not Detecting Errors
**Solution**: Check Debug Console output
- Make sure you see actual error text in Debug Console
- Errors should contain patterns like "Exception", "Error", "RenderFlex"

### Issue 3: Wrong File Open
**Solution**: Make sure you have a `.dart` file open
- CodeLens only works on Dart files
- Open `lib/error_examples.dart` specifically

### Issue 4: Extension Not Active
**Solution**: Reload VS Code
1. Press `Cmd+Shift+P`
2. Type "Developer: Reload Window"
3. Press Enter

## 🎮 Quick Test

1. **Open**: `test_flutter_app/lib/error_examples.dart`
2. **Start debugging**: Press F5
3. **Trigger error**: Tap "RenderFlex Overflow Error" in app
4. **Wait**: 2-3 seconds
5. **Look**: For 🤖 buttons above lines in the Dart file

## 📱 Alternative: Use Error Notifications

If CodeLens buttons don't appear, you can still use the extension:

1. **Watch for popup notifications** when errors occur
2. **Click "🤖 Fix This Error"** in the notification
3. **Use Command Palette** → "Flutter Debug: Send to Copilot Chat"
4. **Right-click** on error text → "🤖 Send Error to AI"

## ✅ Success Indicators

You'll know it's working when you see:
- 🤖 Gray text buttons above lines in Dart files
- Popup notifications when errors occur
- Status bar shows "🚨 Flutter Error Detected" when errors happen
- Copilot Chat opens with error context when you click buttons

---

**💡 Pro Tip**: The extension works best when you have both the Flutter app running AND the Dart file open in VS Code simultaneously. 