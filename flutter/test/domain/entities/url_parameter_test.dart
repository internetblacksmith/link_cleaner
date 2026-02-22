import 'package:flutter_test/flutter_test.dart';
import 'package:link_cleaner/domain/entities/url_parameter.dart';

void main() {
  group('UrlParameter', () {
    test('should create URL parameter from constructor', () {
      final parameter = UrlParameter(
        key: 'utm_source',
        value: 'google',
        selected: true,
        isTracker: true,
        category: 'Google Analytics',
      );

      expect(parameter.key, 'utm_source');
      expect(parameter.value, 'google');
      expect(parameter.selected, true);
      expect(parameter.isTracker, true);
      expect(parameter.category, 'Google Analytics');
    });

    test('should handle null category', () {
      final parameter = UrlParameter(
        key: 'id',
        value: '123',
        selected: false,
        isTracker: false,
      );

      expect(parameter.key, 'id');
      expect(parameter.value, '123');
      expect(parameter.selected, false);
      expect(parameter.isTracker, false);
      expect(parameter.category, isNull);
    });

    test('should handle empty key and value', () {
      final parameter = UrlParameter(
        key: '',
        value: '',
        selected: false,
        isTracker: false,
      );

      expect(parameter.key, '');
      expect(parameter.value, '');
      expect(parameter.selected, false);
      expect(parameter.isTracker, false);
    });

    test('should handle special characters in key and value', () {
      final parameter = UrlParameter(
        key: 'special_key-with.chars',
        value: 'value with spaces & symbols!',
        selected: true,
        isTracker: false,
      );

      expect(parameter.key, 'special_key-with.chars');
      expect(parameter.value, 'value with spaces & symbols!');
    });

    test('should handle URL encoded values', () {
      final parameter = UrlParameter(
        key: 'search',
        value: 'hello%20world%21',
        selected: true,
        isTracker: false,
      );

      expect(parameter.value, 'hello%20world%21');
    });

    test('should handle Unicode characters', () {
      final parameter = UrlParameter(
        key: 'query',
        value: 'тест 例え',
        selected: false,
        isTracker: false,
      );

      expect(parameter.value, 'тест 例え');
    });

    test('should handle very long values', () {
      final longValue = 'a' * 1000;
      final parameter = UrlParameter(
        key: 'data',
        value: longValue,
        selected: true,
        isTracker: false,
      );

      expect(parameter.value.length, 1000);
      expect(parameter.value, longValue);
    });

    test('should preserve boolean types', () {
      final parameter = UrlParameter(
        key: 'test',
        value: 'value',
        selected: true,
        isTracker: false,
      );

      expect(parameter.selected, isA<bool>());
      expect(parameter.isTracker, isA<bool>());
      expect(parameter.selected, true);
      expect(parameter.isTracker, false);
    });

    test('should generate query string correctly', () {
      final parameter = UrlParameter(
        key: 'utm_campaign',
        value: 'summer_sale',
        selected: false,
        isTracker: true,
        category: 'Marketing',
      );

      expect(parameter.toQueryString(), 'utm_campaign=summer_sale');
    });

    test('should generate query string with empty value', () {
      final parameter = UrlParameter(
        key: 'empty',
        value: '',
        selected: true,
        isTracker: false,
      );

      expect(parameter.toQueryString(), 'empty=');
    });

    test('should create copy with modified values', () {
      final original = UrlParameter(
        key: 'original_key',
        value: 'original_value',
        selected: false,
        isTracker: true,
        category: 'Original Category',
      );

      final modified = original.copyWith(
        selected: true,
        category: 'Modified Category',
      );

      expect(modified.key, 'original_key');
      expect(modified.value, 'original_value');
      expect(modified.selected, true); // Changed
      expect(modified.isTracker, true);
      expect(modified.category, 'Modified Category'); // Changed
    });

    test('should create copy without changes when no parameters provided', () {
      final original = UrlParameter(
        key: 'test',
        value: 'value',
        selected: true,
        isTracker: false,
      );

      final copy = original.copyWith();

      expect(copy.key, original.key);
      expect(copy.value, original.value);
      expect(copy.selected, original.selected);
      expect(copy.isTracker, original.isTracker);
      expect(copy.category, original.category);
    });

    test('should handle category with special characters', () {
      final parameter = UrlParameter(
        key: 'utm_source',
        value: 'google',
        selected: true,
        isTracker: true,
        category: 'Analytics & Tracking (v2.0)',
      );

      expect(parameter.category, 'Analytics & Tracking (v2.0)');
    });

    test('should create multiple parameters with different states', () {
      final parameters = [
        UrlParameter(key: 'selected_tracker', value: 'val1', selected: true, isTracker: true),
        UrlParameter(key: 'unselected_tracker', value: 'val2', selected: false, isTracker: true),
        UrlParameter(key: 'selected_normal', value: 'val3', selected: true, isTracker: false),
        UrlParameter(key: 'unselected_normal', value: 'val4', selected: false, isTracker: false),
      ];

      expect(parameters[0].selected, true);
      expect(parameters[0].isTracker, true);
      expect(parameters[1].selected, false);
      expect(parameters[1].isTracker, true);
      expect(parameters[2].selected, true);
      expect(parameters[2].isTracker, false);
      expect(parameters[3].selected, false);
      expect(parameters[3].isTracker, false);
    });

    test('should support Equatable comparison', () {
      final param1 = UrlParameter(
        key: 'test',
        value: 'value',
        selected: true,
        isTracker: false,
        category: 'Test',
      );
      
      final param2 = UrlParameter(
        key: 'test',
        value: 'value',
        selected: true,
        isTracker: false,
        category: 'Test',
      );

      expect(param1, equals(param2));
    });

    test('should not be equal if any property differs', () {
      final param1 = UrlParameter(
        key: 'test',
        value: 'value',
        selected: true,
        isTracker: false,
      );
      
      final param2 = UrlParameter(
        key: 'test',
        value: 'value',
        selected: false, // Different
        isTracker: false,
      );

      expect(param1, isNot(equals(param2)));
    });

    test('should handle common tracking parameters', () {
      final trackingParameters = [
        UrlParameter(key: 'utm_source', value: 'google', selected: false, isTracker: true, category: 'Google Analytics'),
        UrlParameter(key: 'utm_medium', value: 'cpc', selected: false, isTracker: true, category: 'Google Analytics'),
        UrlParameter(key: 'utm_campaign', value: 'summer_sale', selected: false, isTracker: true, category: 'Google Analytics'),
        UrlParameter(key: 'fbclid', value: 'IwAR123', selected: false, isTracker: true, category: 'Facebook'),
        UrlParameter(key: 'gclid', value: 'Cj123', selected: false, isTracker: true, category: 'Google Ads'),
      ];

      for (final param in trackingParameters) {
        expect(param.isTracker, true);
        expect(param.selected, false);
        expect(param.category, isNotNull);
      }
    });

    test('should handle common functional parameters', () {
      final functionalParameters = [
        UrlParameter(key: 'id', value: '12345', selected: true, isTracker: false),
        UrlParameter(key: 'page', value: '2', selected: true, isTracker: false),
        UrlParameter(key: 'sort', value: 'price', selected: true, isTracker: false),
        UrlParameter(key: 'filter', value: 'electronics', selected: true, isTracker: false),
        UrlParameter(key: 'q', value: 'search query', selected: true, isTracker: false),
      ];

      for (final param in functionalParameters) {
        expect(param.isTracker, false);
        expect(param.selected, true);
      }
    });

    test('should handle array-like parameter values', () {
      final parameter = UrlParameter(
        key: 'tags',
        value: 'tag1,tag2,tag3',
        selected: true,
        isTracker: false,
      );

      expect(parameter.value, 'tag1,tag2,tag3');
      expect(parameter.toQueryString(), 'tags=tag1,tag2,tag3');
    });

    test('should handle numeric-like parameter values as strings', () {
      final parameter = UrlParameter(
        key: 'price',
        value: '29.99',
        selected: true,
        isTracker: false,
      );

      expect(parameter.value, isA<String>());
      expect(parameter.value, '29.99');
    });

    test('should handle boolean-like parameter values as strings', () {
      final parameter = UrlParameter(
        key: 'debug',
        value: 'true',
        selected: true,
        isTracker: false,
      );

      expect(parameter.value, isA<String>());
      expect(parameter.value, 'true');
    });

    test('should handle base64-encoded values', () {
      final parameter = UrlParameter(
        key: 'data',
        value: 'eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9',
        selected: true,
        isTracker: false,
      );

      expect(parameter.value, 'eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9');
    });

    test('should handle parameters with complex query-like values', () {
      final parameter = UrlParameter(
        key: 'return_to',
        value: '/search?q=test&sort=date',
        selected: true,
        isTracker: false,
      );

      expect(parameter.value, '/search?q=test&sort=date');
      expect(parameter.toQueryString(), 'return_to=/search?q=test&sort=date');
    });

    test('should stringify correctly', () {
      final parameter = UrlParameter(
        key: 'test',
        value: 'value',
        selected: true,
        isTracker: false,
      );

      final stringified = parameter.toString();
      expect(stringified, contains('test'));
      expect(stringified, contains('value'));
      expect(stringified, contains('true'));
      expect(stringified, contains('false'));
    });
  });
}