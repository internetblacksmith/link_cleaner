module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|svg)$': 'jest-transform-stub',
  },
};
