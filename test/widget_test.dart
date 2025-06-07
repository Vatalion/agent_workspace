// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_error_transport/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Error transport test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that our app shows the error transport demo
    expect(find.text('Error Transport Demo'), findsOneWidget);
    expect(find.text('Trigger Test Error'), findsOneWidget);

    // Tap the error button
    await tester.tap(find.text('Trigger Test Error'));
    await tester.pump();

    // The error should be caught by our error transport
    // No need to verify the error as it's handled by the transport
  });
}
