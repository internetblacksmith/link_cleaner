import { UrlParameter } from '../../../src/domain/entities/UrlParameter';

describe('UrlParameter', () => {
  test('should create URL parameter with all properties', () => {
    const parameter: UrlParameter = {
      key: 'utm_source',
      value: 'google',
      selected: true,
      isTracker: true,
      category: 'Google Analytics',
    };

    expect(parameter.key).toBe('utm_source');
    expect(parameter.value).toBe('google');
    expect(parameter.selected).toBe(true);
    expect(parameter.isTracker).toBe(true);
    expect(parameter.category).toBe('Google Analytics');
  });

  test('should create URL parameter without optional category', () => {
    const parameter: UrlParameter = {
      key: 'id',
      value: '123',
      selected: false,
      isTracker: false,
    };

    expect(parameter.key).toBe('id');
    expect(parameter.value).toBe('123');
    expect(parameter.selected).toBe(false);
    expect(parameter.isTracker).toBe(false);
    expect(parameter.category).toBeUndefined();
  });

  test('should handle empty key and value', () => {
    const parameter: UrlParameter = {
      key: '',
      value: '',
      selected: false,
      isTracker: false,
    };

    expect(parameter.key).toBe('');
    expect(parameter.value).toBe('');
    expect(parameter.selected).toBe(false);
    expect(parameter.isTracker).toBe(false);
  });

  test('should handle special characters in key and value', () => {
    const parameter: UrlParameter = {
      key: 'special_key-with.chars',
      value: 'value with spaces & symbols!',
      selected: true,
      isTracker: false,
    };

    expect(parameter.key).toBe('special_key-with.chars');
    expect(parameter.value).toBe('value with spaces & symbols!');
  });

  test('should handle URL encoded values', () => {
    const parameter: UrlParameter = {
      key: 'search',
      value: 'hello%20world%21',
      selected: true,
      isTracker: false,
    };

    expect(parameter.value).toBe('hello%20world%21');
  });

  test('should handle Unicode characters', () => {
    const parameter: UrlParameter = {
      key: 'query',
      value: 'тест 例え',
      selected: false,
      isTracker: false,
    };

    expect(parameter.value).toBe('тест 例え');
  });

  test('should handle very long values', () => {
    const longValue = 'a'.repeat(1000);
    const parameter: UrlParameter = {
      key: 'data',
      value: longValue,
      selected: true,
      isTracker: false,
    };

    expect(parameter.value.length).toBe(1000);
    expect(parameter.value).toBe(longValue);
  });

  test('should maintain boolean types', () => {
    const parameter: UrlParameter = {
      key: 'test',
      value: 'value',
      selected: true,
      isTracker: false,
    };

    expect(typeof parameter.selected).toBe('boolean');
    expect(typeof parameter.isTracker).toBe('boolean');
    expect(parameter.selected).toBe(true);
    expect(parameter.isTracker).toBe(false);
  });

  test('should handle category with special characters', () => {
    const parameter: UrlParameter = {
      key: 'utm_source',
      value: 'google',
      selected: true,
      isTracker: true,
      category: 'Analytics & Tracking (v2.0)',
    };

    expect(parameter.category).toBe('Analytics & Tracking (v2.0)');
  });

  test('should create multiple parameters with different states', () => {
    const parameters: UrlParameter[] = [
      { key: 'selected_tracker', value: 'val1', selected: true, isTracker: true },
      { key: 'unselected_tracker', value: 'val2', selected: false, isTracker: true },
      { key: 'selected_normal', value: 'val3', selected: true, isTracker: false },
      { key: 'unselected_normal', value: 'val4', selected: false, isTracker: false },
    ];

    expect(parameters[0].selected).toBe(true);
    expect(parameters[0].isTracker).toBe(true);
    expect(parameters[1].selected).toBe(false);
    expect(parameters[1].isTracker).toBe(true);
    expect(parameters[2].selected).toBe(true);
    expect(parameters[2].isTracker).toBe(false);
    expect(parameters[3].selected).toBe(false);
    expect(parameters[3].isTracker).toBe(false);
  });

  test('should handle common tracking parameters', () => {
    const trackingParameters: UrlParameter[] = [
      { key: 'utm_source', value: 'google', selected: false, isTracker: true, category: 'Google Analytics' },
      { key: 'utm_medium', value: 'cpc', selected: false, isTracker: true, category: 'Google Analytics' },
      { key: 'utm_campaign', value: 'summer_sale', selected: false, isTracker: true, category: 'Google Analytics' },
      { key: 'fbclid', value: 'IwAR123', selected: false, isTracker: true, category: 'Facebook' },
      { key: 'gclid', value: 'Cj123', selected: false, isTracker: true, category: 'Google Ads' },
      { key: '_ga', value: 'GA1.2.123', selected: false, isTracker: true, category: 'Google Analytics' },
    ];

    trackingParameters.forEach(param => {
      expect(param.isTracker).toBe(true);
      expect(param.selected).toBe(false);
      expect(param.category).toBeDefined();
    });
  });

  test('should handle common functional parameters', () => {
    const functionalParameters: UrlParameter[] = [
      { key: 'id', value: '12345', selected: true, isTracker: false },
      { key: 'page', value: '2', selected: true, isTracker: false },
      { key: 'sort', value: 'price', selected: true, isTracker: false },
      { key: 'filter', value: 'electronics', selected: true, isTracker: false },
      { key: 'q', value: 'search query', selected: true, isTracker: false },
    ];

    functionalParameters.forEach(param => {
      expect(param.isTracker).toBe(false);
      expect(param.selected).toBe(true);
    });
  });

  test('should handle array-like parameter values', () => {
    const parameter: UrlParameter = {
      key: 'tags',
      value: 'tag1,tag2,tag3',
      selected: true,
      isTracker: false,
    };

    expect(parameter.value).toBe('tag1,tag2,tag3');
  });

  test('should handle numeric-like parameter values as strings', () => {
    const parameter: UrlParameter = {
      key: 'price',
      value: '29.99',
      selected: true,
      isTracker: false,
    };

    expect(typeof parameter.value).toBe('string');
    expect(parameter.value).toBe('29.99');
  });

  test('should handle boolean-like parameter values as strings', () => {
    const parameter: UrlParameter = {
      key: 'debug',
      value: 'true',
      selected: true,
      isTracker: false,
    };

    expect(typeof parameter.value).toBe('string');
    expect(parameter.value).toBe('true');
  });

  test('should handle base64-encoded values', () => {
    const parameter: UrlParameter = {
      key: 'data',
      value: 'eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9',
      selected: true,
      isTracker: false,
    };

    expect(parameter.value).toBe('eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9');
  });

  test('should handle parameters with no value', () => {
    const parameter: UrlParameter = {
      key: 'flag',
      value: '',
      selected: true,
      isTracker: false,
    };

    expect(parameter.key).toBe('flag');
    expect(parameter.value).toBe('');
  });

  test('should handle parameters representing file paths', () => {
    const parameter: UrlParameter = {
      key: 'redirect',
      value: '/users/profile/settings',
      selected: true,
      isTracker: false,
    };

    expect(parameter.value).toBe('/users/profile/settings');
  });

  test('should handle parameters with complex query-like values', () => {
    const parameter: UrlParameter = {
      key: 'return_to',
      value: '/search?q=test&sort=date',
      selected: true,
      isTracker: false,
    };

    expect(parameter.value).toBe('/search?q=test&sort=date');
  });

  test('should create parameter objects consistently', () => {
    const createParameter = (key: string, value: string, isTracker: boolean = false): UrlParameter => ({
      key,
      value,
      selected: !isTracker, // Default: select non-trackers, deselect trackers
      isTracker,
      category: isTracker ? 'Tracking' : undefined,
    });

    const param1 = createParameter('id', '123');
    const param2 = createParameter('utm_source', 'google', true);

    expect(param1.selected).toBe(true);
    expect(param1.isTracker).toBe(false);
    expect(param1.category).toBeUndefined();

    expect(param2.selected).toBe(false);
    expect(param2.isTracker).toBe(true);
    expect(param2.category).toBe('Tracking');
  });
});