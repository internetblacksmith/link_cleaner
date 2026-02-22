// Mock react-native-share
jest.mock('react-native-share', () => ({
  default: jest.fn(),
}));


// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Clipboard
jest.mock('@react-native-clipboard/clipboard', () => ({
  getString: jest.fn(),
  setString: jest.fn(),
}));

// Mock react-native-receive-sharing-intent
jest.mock('react-native-receive-sharing-intent', () => ({
  getReceivedFiles: jest.fn(),
  clearReceivedFiles: jest.fn(),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock specific React Native APIs
global.alert = jest.fn();

// Mock DevMenu specifically  
jest.mock('react-native/Libraries/Utilities/DevMenu', () => ({}), { virtual: true });