# Debug Rules Test Instructions

## Test the Rules Tab Issue

1. **Open VS Code with this workspace**
2. **Open Developer Console** (Help > Toggle Developer Tools > Console tab)
3. **Open AI Assistant Deployer panel** (View > Open View > AI Assistant Deployer)
4. **Ensure you're in Enterprise mode** (should show deployment status)
5. **Click the Rules tab** - this should trigger `handleLoadRules()`
6. **Watch console output** for our debug messages:

### Expected Debug Messages:
```
🔍 handleLoadRules: Starting rule discovery...
✅ handleLoadRules: Rule discovery completed, found: [RuleSet object]
📊 Rule counts: { totalRules: 42, enabledRules: X, categories: Y }
💾 handleLoadRules: Updated currentState.currentRuleSet
🎨 handleLoadRules: UI updated
```

### If No Debug Messages Appear:
- The Rules tab click is not calling `handleLoadRules()`
- Check if `switchTab('rules')` JavaScript function is working
- Verify webview message handling

### If Error Messages Appear:
- Check what specific error is thrown during rule discovery
- Verify the workspace root path is correct
- Check if deployed files exist in `.github/` directory

## Current Status
- ✅ Backend `RuleDiscoveryService.discoverDeployedRules()` works (tested directly)
- ✅ Extension compiles and installs successfully
- ❓ Need to verify if `handleLoadRules()` is being called from UI
