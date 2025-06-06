# 🎯 DETAILED FLUTTER DEBUG ASSISTANT TESTING GUIDE

## ✅ **STATUS CHECK**
- Extension installed: ✅ flutter-debug-team.flutter-debug-assistant
- Flutter app: ✅ Running
- VS Code: Ready for testing

---

## 📋 **DETAILED STEP-BY-STEP INSTRUCTIONS**

### **STEP 1: Open VS Code and Test Command Palette**

#### **1A. Open Command Palette**
```
1. Click on VS Code window to make sure it's active
2. Press: Cmd + Shift + P (hold all three keys together)
3. You should see a search box at the top of VS Code
```

#### **1B. Search for Extension Commands**
```
1. Type exactly: Flutter Debug
2. As you type, you should see commands appear below
3. Look for these EXACT commands with robot icons:
   🤖 Flutter Debug Assistant: Send Error to AI
   🤖 Flutter Debug Assistant: Send Debug Context to AI
   🤖 Flutter Debug Assistant: Send Terminal Output to AI
   ⚙️ Flutter Debug Assistant: Flutter Debug Assistant Settings
```

#### **1C. What This Means**
- ✅ If you see all 4 commands = Extension is working perfectly
- ❌ If you see 0 commands = Extension not working, we need to troubleshoot
- ⚠️ If you see some commands = Partial installation issue

#### **1D. Test One Command**
```
1. Click on "🤖 Flutter Debug Assistant: Send Error to AI"
2. You should see a popup or message appear
3. This proves the extension is responding to commands
```

---

### **STEP 2: Test Right-Click Context Menu**

#### **2A. Open the Error Examples File**
```
1. In VS Code left sidebar, look for "EXPLORER" panel
2. Find and expand: test_flutter_app folder
3. Expand: lib folder
4. Click on: error_examples.dart
5. The file should open in the main editor area
```

#### **2B. Test Right-Click Menu**
```
1. Right-click ANYWHERE in the error_examples.dart file
2. A context menu should appear
3. Look for these items in the menu:
   🤖 Send Error to AI
   🤖 Send Debug Context to AI
   🤖 Send Terminal Output to AI
```

#### **2C. What This Means**
- ✅ If you see the 🤖 robot icons = Right-click integration working
- ❌ If no robot icons = Context menu not registered properly

---

### **STEP 3: Generate a Real Flutter Error**

#### **3A. Find the Flutter App on Your iPhone Simulator**
```
1. Look at your iPhone simulator screen
2. Find your Flutter test app (should be running already)
3. If you don't see it, look for an app icon on the home screen
4. The app should show a screen with error category buttons
```

#### **3B. Generate a Widget Build Error**
```
1. In the Flutter app, tap the button: "Widget Build Errors"
2. You should see a new screen with different error types
3. Tap the button: "RenderFlex Overflow Error"
4. The app should show a RED ERROR SCREEN with error details
```

#### **3C. Check VS Code Terminal for Error Output**
```
1. In VS Code, look at the bottom panel (Terminal area)
2. You should see RED text with error messages like:
   "RenderFlex overflowed by X pixels on the right"
3. This proves the error was generated successfully
```

---

### **STEP 4: Test Extension Error Detection**

#### **4A. Send Error to AI**
```
1. After seeing the red error in VS Code terminal
2. Right-click anywhere in the error_examples.dart file
3. Click: "🤖 Send Error to AI"
4. You should see a popup or dialog with error information
```

#### **4B. Alternative Method - Command Palette**
```
1. Press: Cmd + Shift + P
2. Type: Send Terminal
3. Click: "🤖 Flutter Debug Assistant: Send Terminal Output to AI"
4. Should show the same error information popup
```

#### **4C. What You Should See**
```
The popup should contain formatted text like:
**Flutter Terminal Analysis Request**
**Terminal:** [terminal name]
**Error Context:** [error details]
**Instructions:** Please analyze this Flutter error...
```

---

### **STEP 5: Test Different Error Types**

#### **5A. State Management Error**
```
1. In Flutter app, tap "Back" to go to main menu
2. Tap: "State Management Errors"
3. Tap: "setState After Dispose"
4. Check VS Code terminal for new error
5. Test extension with: Right-click → "🤖 Send Error to AI"
```

#### **5B. Navigation Error**
```
1. Go back to main menu in Flutter app
2. Tap: "Navigation Errors"
3. Tap: "Invalid Route Navigation"
4. Check VS Code terminal
5. Test extension response
```

---

## 🔍 **TROUBLESHOOTING GUIDE**

### **Problem 1: Don't See Extension Commands in Command Palette**

**Check Extension Status:**
```bash
# Run this in terminal to verify installation:
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --list-extensions | grep flutter-debug
```

**Expected Output:** `flutter-debug-team.flutter-debug-assistant`

**If Not Installed:**
```bash
# Reinstall the extension:
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/flutter_debug_extension
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension flutter-debug-assistant-0.0.1.vsix
```

### **Problem 2: Flutter App Not Running**

**Check if App is Running:**
```bash
# Check if Flutter process exists:
ps aux | grep "flutter run"
```

**Restart Flutter App:**
```bash
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/test_flutter_app
flutter run
```

### **Problem 3: No Error Output in VS Code Terminal**

**Possible Causes:**
- Flutter app not connected to VS Code terminal
- Using wrong VS Code instance (Insiders vs Regular)
- Terminal not showing Flutter output

**Solution:**
```bash
# Make sure you're using the correct VS Code:
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/test_flutter_app
```

### **Problem 4: Extension Commands Don't Work**

**Check Developer Console:**
```
1. In VS Code: Help → Toggle Developer Tools
2. Go to Console tab
3. Look for any error messages when clicking extension commands
4. Share any red error messages you see
```

---

## 📱 **QUICK SUCCESS TEST (2 minutes)**

**Follow this exact sequence:**

1. **Command Test (30 seconds)**:
   - `Cmd + Shift + P`
   - Type: `Flutter Debug`
   - ✅ Should see 4 commands with 🤖 icons

2. **Right-Click Test (30 seconds)**:
   - Open `lib/error_examples.dart`
   - Right-click in file
   - ✅ Should see 🤖 menu items

3. **Error Generation (30 seconds)**:
   - Flutter app → "Widget Build Errors" → "RenderFlex Overflow Error"
   - ✅ Should see red error screen

4. **Extension Response (30 seconds)**:
   - Right-click in VS Code → "🤖 Send Error to AI"
   - ✅ Should see formatted error popup

**If all 4 steps work = Extension is fully functional! 🎉**

---

## 🎯 **WHAT TO EXPECT**

### **Successful Extension Usage Looks Like:**
1. Commands appear in Command Palette with 🤖 icons
2. Right-click menus show AI options
3. Flutter errors appear in VS Code terminal
4. Extension captures and formats errors for AI analysis
5. Popup shows detailed error context ready for debugging

### **The Extension's Purpose:**
- **Detects Flutter errors automatically**
- **Formats them for AI analysis**
- **Saves you time copying/pasting error details**
- **Provides context like stack traces and file paths**
- **Makes Flutter debugging with AI seamless**

---

**Follow these detailed steps exactly, and let me know at which step something doesn't work as expected!** 🎯
