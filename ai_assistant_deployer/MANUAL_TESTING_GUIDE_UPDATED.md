# Manual Testing Guide - AI Assistant Deployer v1.0.0
## Custom Mode Builder Feature Testing

**Status**: ✅ READY FOR TESTING
**Last Updated**: December 2024
**Package**: `ai-assistant-deployer-1.0.0.vsix` (308.37KB, 124 files)

## IMPORTANT: Command Registration Fixed! 🎉

**Issue Resolved**: The Custom Mode Builder command was not appearing in Command Palette
**Fix Applied**: Added command registration to `package.json` 
- ✅ Added to `activationEvents`
- ✅ Added to `commands` section  
- ✅ Extension repackaged and reinstalled

---

## Testing Prerequisites

1. **VS Code Version**: 1.74.0 or higher
2. **Extension**: AI Assistant Deployer v1.0.0 installed
3. **Project**: Any workspace (Flutter project recommended for full testing)

## Installation Verification

### Step 1: Verify Extension Installation
```bash
code --list-extensions | grep ai-assistant
# Should show: ai-assistant-tools.ai-assistant-deployer
```

### Step 2: Check Command Availability
1. Open VS Code
2. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
3. Type "AI Assistant: Custom Mode Builder"
4. **Expected**: Command should appear in the list
5. **If missing**: Check VS Code Developer Console (F12) for errors

---

## Custom Mode Builder Testing

### Test 1: Access Custom Mode Builder
1. **Method A - Command Palette**:
   - Press `Ctrl+Shift+P` / `Cmd+Shift+P`
   - Type "AI Assistant: Custom Mode Builder"
   - Select the command
   
2. **Method B - Activity Bar**:
   - Look for rocket icon (🚀) in Activity Bar
   - Click to open AI Assistant Deployer panel
   - Click "Custom Mode Builder" button

3. **Expected Result**: Custom Mode Builder interface opens

### Test 2: Basic Mode Creation
1. **Fill Mode Details**:
   - Mode Name: "Test Mode"
   - Description: "A test mode for validation"
   
2. **Add Rules**:
   - Add 2-3 simple rules
   - Examples: "Use TypeScript", "Include error handling", "Add documentation"
   
3. **Set Features**:
   - Toggle some features on/off
   - Example: Enable "Task Management", disable "MCP Server"
   
4. **Preview**: Click "Preview Instructions"
5. **Expected**: Should show generated instruction content

### Test 3: Mode Deployment  
1. **Deploy Mode**: Click "Deploy Custom Mode"
2. **Expected Results**:
   - Success message appears
   - Instructions file created (check workspace)
   - Mode appears in mode list (if applicable)

### Test 4: Error Handling
1. **Empty Fields**: Try deploying without name/description
2. **Expected**: Validation errors shown
3. **Invalid Characters**: Use special characters in mode name
4. **Expected**: Appropriate error handling

---

## Debugging Help

### Common Issues

1. **Command Not Found**
   - Check if extension is activated: Look for "AI Assistant Deployer" in Activity Bar
   - Check Developer Console (F12) for activation errors
   - Try reloading VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")

2. **Webview Not Opening**
   - Check VS Code output panel for errors
   - Verify webview provider is registered correctly
   - Try opening Activity Bar panel first

3. **Deployment Fails**
   - Ensure workspace is open
   - Check file permissions
   - Verify target directory exists

### Log Locations
- **VS Code Output**: View → Output → "AI Assistant Deployer"  
- **Developer Console**: F12 → Console tab
- **Extension Host**: Help → Show Extension Host Log

---

## Test Results Template

```
## Custom Mode Builder Test Results

**Date**: ___________
**VS Code Version**: ___________
**OS**: ___________

### Command Access
- [ ] Command appears in Command Palette
- [ ] Command executes without errors
- [ ] Activity Bar integration works

### UI Functionality  
- [ ] Mode name input works
- [ ] Description input works
- [ ] Rules can be added/removed
- [ ] Features can be toggled
- [ ] Preview generates content

### Deployment
- [ ] Mode deploys successfully
- [ ] Files created correctly
- [ ] Success message appears
- [ ] Error handling works

### Issues Found
(List any bugs, errors, or unexpected behavior)

### Overall Assessment
- [ ] ✅ Ready for production
- [ ] ⚠️ Minor issues found
- [ ] ❌ Major issues found
```

---

## Next Steps

After successful testing:
1. **Report Results**: Document any issues found
2. **Feature Requests**: Suggest improvements
3. **Integration Testing**: Test with real Flutter projects
4. **Performance Testing**: Test with large rule sets

**Happy Testing!** 🚀
