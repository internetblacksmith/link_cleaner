/**
 * @format
 */

import React from 'react';

// Simple smoke test to ensure the app exports correctly
test('App exports correctly', () => {
  const App = require('../App').default;
  expect(App).toBeDefined();
  expect(typeof App).toBe('function');
});
