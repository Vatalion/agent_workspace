#!/bin/bash

# Comprehensive Flutter Debug Assistant Extension Test
echo "🧪 Flutter Debug Assistant Extension - Debug Console Test"
echo "========================================================="

# Step 1: Check extension status
echo "1️⃣ Checking extension installation..."
if code --list-extensions | grep -q "flutter-debug-team.flutter-debug-assistant"; then
    echo "✅ Flutter Debug Assistant extension is installed"
else
    echo "❌ Extension not found"
    exit 1
fi

# Step 2: Open VS Code Debug Console
echo ""
echo "2️⃣ Opening VS Code Debug Console..."
osascript -e 'tell application "Visual Studio Code" to activate'
sleep 1

# Step 3: Create a test Flutter error
echo ""
echo "3️⃣ Creating test Flutter error..."
cd /Users/vitalijsimko/workspace/projects/flutter/agent_workspace/test_flutter_app

# Generate a temporary error file
cat > lib/test_error.dart << 'EOF'
import 'package:flutter/material.dart';

void triggerTestError() {
  print('FLUTTER ERROR TEST: Starting error generation...');
  
  try {
    var nullMap = <String, dynamic>{};
    var result = nullMap['nonexistent'].toString(); // Will throw error
  } catch (e) {
    print('ERROR CAPTURED: $e');
    throw Exception('Flutter Debug Assistant Test Error: $e');
  }
}
EOF

echo "✅ Test error file created"

# Step 4: Import and trigger the error in main.dart
echo ""
echo "4️⃣ Triggering Flutter error..."

# Backup current main.dart
cp lib/main.dart lib/main_backup.dart

# Add error import and trigger
sed -i '' '2i\
import '\''test_error.dart'\'';
' lib/main.dart

# Add error trigger to build method
sed -i '' '/print.*Hot reload test/a\
    triggerTestError(); // This will generate a test error
' lib/main.dart

echo "✅ Error trigger added to main.dart"

# Step 5: Check the result
echo ""
echo "5️⃣ Test completed!"
echo "📋 What to check next:"
echo "   • Open VS Code and check the Debug Console"
echo "   • Look for error notifications with '🤖 Fix This Error' buttons"
echo "   • Check if the extension detected the Flutter error"
echo "   • Test clicking the error fix button"
echo ""
echo "🔧 To restore original code:"
echo "   mv lib/main_backup.dart lib/main.dart"
echo "   rm lib/test_error.dart"
echo ""
echo "⏰ The extension should now be monitoring debug console output..."
