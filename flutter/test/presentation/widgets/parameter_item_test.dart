import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:link_cleaner/presentation/widgets/parameter_item.dart';
import 'package:link_cleaner/domain/entities/url_parameter.dart';

void main() {
  group('ParameterItem Widget', () {
    testWidgets('displays parameter key and value', (WidgetTester tester) async {
      const parameter = UrlParameter(
        key: 'utm_source',
        value: 'google',
        selected: true,
        isTracker: true,
        category: 'Google Analytics',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ParameterItem(
              parameter: parameter,
              onChanged: (_) {},
            ),
          ),
        ),
      );

      expect(find.text('utm_source'), findsOneWidget);
      expect(find.text('google'), findsOneWidget);
    });

    testWidgets('shows tracker badge for tracking parameters', (WidgetTester tester) async {
      const parameter = UrlParameter(
        key: 'fbclid',
        value: 'abc123',
        selected: true,
        isTracker: true,
        category: 'Facebook',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ParameterItem(
              parameter: parameter,
              onChanged: (_) {},
            ),
          ),
        ),
      );

      expect(find.text('Facebook'), findsOneWidget);
      expect(find.byIcon(Icons.visibility_off), findsOneWidget);
    });

    testWidgets('checkbox reflects selected state', (WidgetTester tester) async {
      const parameter = UrlParameter(
        key: 'id',
        value: '123',
        selected: false,
        isTracker: false,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ParameterItem(
              parameter: parameter,
              onChanged: (_) {},
            ),
          ),
        ),
      );

      final checkbox = tester.widget<CheckboxListTile>(find.byType(CheckboxListTile));
      expect(checkbox.value, isFalse);
    });

    testWidgets('calls onChanged when tapped', (WidgetTester tester) async {
      const parameter = UrlParameter(
        key: 'test',
        value: 'value',
        selected: true,
        isTracker: false,
      );

      bool? changedValue;
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ParameterItem(
              parameter: parameter,
              onChanged: (value) {
                changedValue = value;
              },
            ),
          ),
        ),
      );

      await tester.tap(find.byType(CheckboxListTile));
      expect(changedValue, isFalse);
    });

    testWidgets('truncates long values', (WidgetTester tester) async {
      final parameter = UrlParameter(
        key: 'long_param',
        value: 'a' * 100, // 100 character string
        selected: true,
        isTracker: false,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ParameterItem(
              parameter: parameter,
              onChanged: (_) {},
            ),
          ),
        ),
      );

      // Should show truncated value with ellipsis
      expect(find.text('a' * 50 + '...'), findsOneWidget);
    });
  });
}