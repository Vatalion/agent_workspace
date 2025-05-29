// Test file for Flutter Debug Assistant error detection
import 'package:flutter/material.dart';

class TestErrorWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // This will cause a RenderFlex overflow error
    return Container(
      width: 100,
      child: Row(
        children: [
          Container(width: 200, height: 50, color: Colors.red),
          Container(width: 200, height: 50, color: Colors.blue),
        ],
      ),
    );
  }
  
  void testExceptionMethod() {
    // This will throw an exception
    throw Exception('Test exception for AI analysis');
  }
  
  void testAssertionError() {
    // This will cause an assertion error
    assert(false, 'Test assertion failed');
  }
  
  void testNullError() {
    // This will cause a null error
    String? nullString;
    print(nullString!.length); // Null check operator used on a null value
  }
}

// flutter: Exception caught: Exception: Test console exception for AI analysis
// flutter: RenderFlex overflowed by 42.0 pixels on the right.
// flutter: NoSuchMethodError: The method 'testMethod' was called on null.
// ═══════ Exception caught by widgets library ═══════
// The following assertion was thrown building TestErrorWidget:
// Test assertion failed
