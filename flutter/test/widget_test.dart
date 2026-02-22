import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:link_cleaner/main.dart';

void main() {
  testWidgets('Link Cleaner app loads successfully', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(
      const ProviderScope(
        child: MyApp(),
      ),
    );

    // Verify that the app loads with expected UI elements
    expect(find.text('Link Cleaner'), findsOneWidget);
    expect(find.text('Share a URL to clean it'), findsOneWidget);
  });
}
