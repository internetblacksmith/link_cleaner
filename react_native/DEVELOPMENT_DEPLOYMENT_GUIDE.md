# React Native Development & Deployment Best Practices

## Development Environment Setup

### 1. Version Management
```bash
# Use Node Version Manager (nvm)
echo "18.19.0" > .nvmrc
nvm use

# Lock dependencies
npm install --save-exact
# or
yarn install --frozen-lockfile
```

### 2. Environment Configuration
Create environment files for different stages:

```bash
# .env.development
API_URL=http://localhost:3000
ENVIRONMENT=development

# .env.staging
API_URL=https://staging.linkcleanerapp.com
ENVIRONMENT=staging

# .env.production
API_URL=https://api.linkcleanerapp.com
ENVIRONMENT=production
```

Install react-native-config:
```bash
npm install react-native-config
```

### 3. TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2017"],
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": "./",
    "paths": {
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@utils/*": ["src/utils/*"],
      "@assets/*": ["src/assets/*"]
    }
  },
  "exclude": ["node_modules", "build", "dist"]
}
```

## Project Structure

```
react_native/
├── src/
│   ├── components/
│   │   ├── UrlCard.tsx
│   │   ├── ParameterItem.tsx
│   │   └── EmptyState.tsx
│   ├── screens/
│   │   └── MainScreen.tsx
│   ├── services/
│   │   ├── urlParser.ts
│   │   └── sharingService.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   └── trackers.ts
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
├── __tests__/
├── android/
├── ios/
└── package.json
```

## Code Quality Tools

### 1. ESLint Configuration
```json
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    '@react-native',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### 2. Prettier Configuration
```json
// .prettierrc
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### 3. Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## Testing Strategy

### 1. Unit Tests
```typescript
// __tests__/utils/urlParser.test.ts
import { parseUrl, cleanUrl } from '@utils/urlParser';

describe('URL Parser', () => {
  it('should parse URL with query parameters', () => {
    const url = 'https://example.com?utm_source=test&id=123';
    const result = parseUrl(url);
    expect(result.parameters).toHaveLength(2);
    expect(result.baseUrl).toBe('https://example.com');
  });
});
```

### 2. Component Tests
```typescript
// __tests__/components/UrlCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UrlCard } from '@components/UrlCard';

describe('UrlCard', () => {
  it('should display cleaned URL', () => {
    const { getByText } = render(
      <UrlCard url="https://example.com" onShare={jest.fn()} />
    );
    expect(getByText('https://example.com')).toBeTruthy();
  });
});
```

### 3. E2E Tests with Detox
```javascript
// e2e/firstTest.e2e.js
describe('Link Cleaner App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show welcome screen', async () => {
    await expect(element(by.text('Share a URL to clean it'))).toBeVisible();
  });
});
```

## Build & Deployment

### 1. Android Build Configuration

```gradle
// android/app/build.gradle
android {
    defaultConfig {
        applicationId "com.yourcompany.linkcleaner"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
    
    signingConfigs {
        release {
            storeFile file('linkcleaner-release-key.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 2. iOS Build Configuration

```ruby
# ios/Podfile
platform :ios, '12.4'

target 'LinkCleaner' do
  config = use_native_modules!
  
  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true
  )
  
  # Permissions
  permissions_path = '../node_modules/react-native-permissions/ios'
  pod 'Permission-AppTrackingTransparency', :path => "#{permissions_path}/AppTrackingTransparency"
end
```

### 3. Fastlane Setup

```ruby
# fastlane/Fastfile
platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number
    build_app(
      scheme: "LinkCleaner",
      export_method: "app-store"
    )
    upload_to_testflight
  end
  
  desc "Deploy to App Store"
  lane :release do
    build_app(scheme: "LinkCleaner")
    upload_to_app_store(
      submit_for_review: true,
      automatic_release: true
    )
  end
end

platform :android do
  desc "Build and upload to Play Store Beta"
  lane :beta do
    gradle(
      task: "bundle",
      build_type: "Release"
    )
    upload_to_play_store(track: 'beta')
  end
  
  desc "Deploy to Play Store"
  lane :release do
    gradle(
      task: "bundle",
      build_type: "Release"
    )
    upload_to_play_store
  end
end
```

## CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm test
      
  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '11'
          
      - run: npm ci
      - run: cd android && ./gradlew bundleRelease
      
      - uses: actions/upload-artifact@v3
        with:
          name: android-bundle
          path: android/app/build/outputs/bundle/release/
  
  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - run: npm ci
      - run: cd ios && pod install
      - run: fastlane ios build
```

## Monitoring & Analytics

### 1. Crash Reporting (Sentry)
```typescript
// src/services/sentry.ts
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.ENVIRONMENT,
  tracesSampleRate: 1.0,
});

export const logError = (error: Error, context?: any) => {
  Sentry.captureException(error, { extra: context });
};
```

### 2. Analytics (Firebase)
```typescript
// src/services/analytics.ts
import analytics from '@react-native-firebase/analytics';

export const trackEvent = async (eventName: string, params?: any) => {
  await analytics().logEvent(eventName, params);
};

export const trackScreenView = async (screenName: string) => {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenName,
  });
};
```

## Performance Optimization

### 1. Bundle Optimization
```javascript
// metro.config.js
module.exports = {
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      keep_fnames: true,
      mangle: {
        keep_fnames: true,
      },
    },
  },
};
```

### 2. Image Optimization
- Use WebP format for Android
- Use HEIC for iOS where supported
- Implement lazy loading for images
- Use react-native-fast-image for better performance

### 3. Code Splitting
```typescript
// Lazy load heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Use Suspense
<Suspense fallback={<LoadingView />}>
  <HeavyComponent />
</Suspense>
```

## Security Best Practices

1. **No hardcoded secrets** - Use react-native-config
2. **Certificate pinning** for API calls
3. **Obfuscate JavaScript bundle** in production
4. **Implement jailbreak/root detection**
5. **Use secure storage** for sensitive data

## Release Checklist

- [ ] Update version number in package.json
- [ ] Update version in android/app/build.gradle
- [ ] Update version in ios/LinkCleaner/Info.plist
- [ ] Run all tests
- [ ] Test on physical devices
- [ ] Update changelog
- [ ] Create git tag
- [ ] Build release binaries
- [ ] Upload to stores
- [ ] Monitor crash reports
- [ ] Update documentation

## Recommended Tools

1. **Development**: React Native Debugger, Flipper
2. **Testing**: Jest, Detox, React Native Testing Library
3. **CI/CD**: GitHub Actions, Bitrise, CircleCI
4. **Monitoring**: Sentry, Firebase Crashlytics
5. **Analytics**: Firebase Analytics, Mixpanel
6. **Code Push**: CodePush for OTA updates
7. **State Management**: Redux Toolkit, Zustand, or MobX
8. **Navigation**: React Navigation v6