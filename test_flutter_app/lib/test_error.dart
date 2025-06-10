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
