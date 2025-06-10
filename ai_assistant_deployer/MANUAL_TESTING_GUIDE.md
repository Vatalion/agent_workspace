# 🧪 Custom Mode Builder - Manual Testing Guide

## ✅ Extension Successfully Installed!

The AI Assistant Deployer extension with the new Custom Mode Builder feature has been installed and is ready for testing.

## 🚀 Testing the Custom Mode Builder

### Step 1: Reload VS Code
1. **Reload VS Code** to ensure the extension is fully activated
   - Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Developer: Reload Window" and press Enter

### Step 2: Access the Custom Mode Builder
1. **Open Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. **Type**: `AI Assistant: Custom Mode Builder`
3. **Press Enter** - This should open the Custom Mode Builder modal

### Step 3: Test the UI Components
✅ **Verify these elements are present:**
- [ ] Modal title: "🛠️ Custom Mode Builder"
- [ ] Mode Name input field (required)
- [ ] Description textarea (required)
- [ ] Target Project input field (optional)
- [ ] Rules & Instructions section with "Add Rule" button
- [ ] Estimated Setup Time display
- [ ] "Cancel" and "🚀 Deploy Custom Mode" buttons

### Step 4: Create a Test Custom Mode
Fill out the form with test data:
```
Mode Name: Test Flutter Development
Description: A custom mode for Flutter app development with clean architecture
Target Project: Flutter
```

**Add a test rule:**
1. Click "Add Rule" button
2. Fill in rule details (if the functionality is available)

### Step 5: Deploy the Custom Mode
1. **Click "🚀 Deploy Custom Mode"**
2. **Check for success feedback** (should show success message)
3. **Verify deployment** - Check if `.github/ai-assistant-instructions.md` is created in your workspace

### Step 6: Verify Deployment Output
Check that the following file is created:
```
📁 .github/
   └── ai-assistant-instructions.md
```

The file should contain:
- Mode name and description
- Generated instructions
- Custom rules (if added)
- Target project information

## 🎯 Expected Behavior

### ✅ Success Indicators:
- Modal opens without errors
- All UI elements are properly styled
- Form validation works (required fields)
- Deploy button triggers the deployment process
- Success message appears after deployment
- Instructions file is created in `.github/` directory
- File contains properly formatted content

### ⚠️ Potential Issues to Watch For:
- Modal doesn't open (check browser console in Dev Tools)
- UI elements are missing or broken
- Form submission doesn't work
- No success feedback after deployment
- Instructions file not created
- Malformed content in generated file

## 🔧 Debugging Tips

### If the modal doesn't open:
1. **Check Dev Tools Console**:
   - Press `F12` or `Cmd+Option+I` to open Dev Tools
   - Look for JavaScript errors in Console tab
   
2. **Check Extension is Active**:
   - Open Command Palette
   - Type "Extensions: Show Installed Extensions"
   - Verify "AI Assistant Deployer" is enabled

3. **Check Extension Output**:
   - Open Output panel (`Cmd+Shift+U`)
   - Select "AI Assistant Deployer" from dropdown
   - Look for error messages

### If deployment fails:
1. **Check file permissions** in workspace
2. **Verify workspace has write access**
3. **Check Extension Output panel** for error details

## 📋 Test Checklist

- [ ] Extension installs successfully
- [ ] Command "AI Assistant: Custom Mode Builder" is available
- [ ] Modal opens and displays correctly
- [ ] All UI elements are present and functional
- [ ] Form validation works properly
- [ ] Custom mode deployment completes successfully
- [ ] Instructions file is generated correctly
- [ ] Generated content matches input data
- [ ] No errors in Dev Tools console
- [ ] Extension Output panel shows success messages

## 🎉 Ready for Testing!

The Custom Mode Builder is now installed and ready for comprehensive manual testing. Please test each feature thoroughly and report any issues or unexpected behavior.

**Package Info:**
- Extension: `ai-assistant-deployer-1.0.0.vsix`
- Size: 306.36 KB
- Installation: ✅ Complete

---
*Testing Guide Created: June 8, 2025*
