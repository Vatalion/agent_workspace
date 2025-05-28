class BreakpointErrorTester {
  static void testNullPointerException() {
    print('🔴 Testing null pointer exception at breakpoint...');
    
    String? nullString;
    // This will trigger an exception that should be caught by the debugger
    int length = nullString!.length; // Exception here!
    print('Length: $length');
  }
  
  static void testRangeError() {
    print('🔴 Testing range error at breakpoint...');
    
    List<int> numbers = [1, 2, 3];
    // This will trigger a range error
    int value = numbers[10]; // Exception here!
    print('Value: $value');
  }
  
  static void testAssertionError() {
    print('🔴 Testing assertion error at breakpoint...');
    
    int value = -5;
    assert(value > 0, 'Value must be positive'); // Exception here!
    print('Value is positive: $value');
  }
  
  static void testStateError() {
    print('🔴 Testing state error at breakpoint...');
    
    List<int> fixedList = List.filled(3, 0, growable: false);
    fixedList.add(4); // Exception here!
    print('List: $fixedList');
  }
}
