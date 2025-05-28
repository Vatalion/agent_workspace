void triggerConsoleErrors() {
  print('🔥 Triggering Flutter errors for extension testing...');
  
  // Error 1: Exception
  try {
    throw Exception('Test console exception for AI analysis');
  } catch (e) {
    print('Exception caught: $e');
  }
  
  // Error 2: RenderFlex overflow simulation
  print('RenderFlex overflowed by 42.0 pixels on the right.');
  
  // Error 3: NoSuchMethodError simulation
  print("NoSuchMethodError: The method 'testMethod' was called on null.");
  
  // Error 4: StateError simulation
  print('StateError: Cannot add to a fixed-length list');
  
  print('✅ All test errors generated for console monitoring');
}
