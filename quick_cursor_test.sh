#!/bin/bash

echo "🚀 Quick Cursor Testing Setup for Copilot Chat Fix"
echo "=================================================="

# Check if we're in the right directory
if [ ! -d "flutter_debug_extension" ]; then
    echo "❌ Error: Please run this script from the agent_workspace directory"
    exit 1
fi

echo "📋 Step 1: Verifying the fix is applied..."
if grep -q "const formattedMessage = this.formatErrorForAI(context, errorType);" flutter_debug_extension/src/extension.ts; then
    echo "✅ Fix is applied in extension.ts"
else
    echo "❌ Fix not found in extension.ts"
    exit 1
fi

echo "📋 Step 2: Testing error formatting..."
node test_copilot_integration.js | grep -E "(✅|❌)" | tail -5

echo "📋 Step 3: Setting up test Flutter app..."
cd test_flutter_app

# Check if Flutter is available
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter not found. Please install Flutter first."
    echo "   Visit: https://flutter.dev/docs/get-started/install"
    exit 1
fi

echo "✅ Flutter found: $(flutter --version | head -1)"

# Get dependencies
echo "📦 Getting Flutter dependencies..."
flutter pub get

echo "📋 Step 4: Creating test error in main.dart..."
cat > lib/main.dart << 'EOF'
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Debug Test',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: 'Test Copilot Chat Fix'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key? key, required this.title}) : super(key: key);
  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Text(
              'Testing Copilot Chat Integration',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            Text(
              'Counter: $_counter',
              style: Theme.of(context).textTheme.headline4,
            ),
            SizedBox(height: 20),
            // This Row will cause an overflow error for testing
            Row(
              children: [
                Container(
                  width: 400, 
                  height: 60, 
                  color: Colors.red,
                  child: Center(child: Text('Box 1', style: TextStyle(color: Colors.white))),
                ),
                Container(
                  width: 400, 
                  height: 60, 
                  color: Colors.blue,
                  child: Center(child: Text('Box 2', style: TextStyle(color: Colors.white))),
                ),
                Container(
                  width: 400, 
                  height: 60, 
                  color: Colors.green,
                  child: Center(child: Text('Box 3', style: TextStyle(color: Colors.white))),
                ),
              ],
            ),
            SizedBox(height: 20),
            Text(
              'The row above should cause an overflow error.',
              style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: Icon(Icons.add),
      ),
    );
  }
}
EOF

echo "✅ Test app created with intentional overflow error"

echo ""
echo "🎯 Ready to Test in Cursor!"
echo "=========================="
echo ""
echo "Next steps:"
echo "1. Open Cursor"
echo "2. Open this project folder: $(pwd)"
echo "3. Make sure Flutter Debug Assistant extension is installed"
echo "4. Make sure GitHub Copilot is installed and activated"
echo "5. Run: flutter run"
echo "6. Watch for overflow errors in debug console"
echo "7. Look for 'Send to Copilot Chat' button"
echo "8. Click it and verify the message is properly formatted"
echo ""
echo "Expected message format:"
echo "------------------------"
echo "I need help fixing this Flutter error that just occurred in my debug console:"
echo ""
echo "**Error Details:**"
echo "- Session: flutter-debug-session-[ID]"
echo "- Timestamp: [ISO timestamp]"
echo "- Severity: ERROR"
echo "- Error Text: RenderFlex overflowed by X pixels..."
echo ""
echo "**What I need:**"
echo "1. Explanation of what this error means"
echo "2. Common causes of this error"
echo "3. Step-by-step solution to fix it"
echo "4. Best practices to prevent this error in the future"
echo ""
echo "✅ If you see a message like this, the fix is working!"
echo "❌ If you see empty message or [object Object], the fix needs work"
echo ""
echo "📱 To test, run: flutter run" 