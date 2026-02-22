# Flutter Link Cleaner - Development & Deployment Guide

## Architecture Overview

The app follows Clean Architecture principles with the following layers:

### 1. Domain Layer (`lib/domain/`)
- **Entities**: Core business objects (`UrlParameter`, `CleanedUrl`)
- **Repositories**: Abstract interfaces for data operations
- **Use Cases**: Business logic implementation

### 2. Data Layer (`lib/data/`)
- **Repository Implementations**: Concrete implementations using SharedPreferences
- **Data Sources**: Local storage management

### 3. Presentation Layer (`lib/presentation/`)
- **Screens**: Main UI screens (Home, History, Settings)
- **Widgets**: Reusable UI components
- **Providers**: State management with Riverpod

### 4. Core Layer (`lib/core/`)
- **Constants**: App-wide constants and configurations
- **Theme**: Material 3 theme definitions
- **Utils**: Helper functions and utilities

## Development Setup

### Prerequisites
```bash
# Flutter SDK (stable channel)
flutter --version  # Should be 3.0.0 or higher

# Development tools
flutter doctor
```

### Installation
```bash
# Clone the repository
cd flutter/

# Install dependencies
flutter pub get

# Generate launcher icons
flutter pub run flutter_launcher_icons:main
```

### Running the App
```bash
# Development mode with hot reload
flutter run

# Release mode
flutter run --release

# Specific device
flutter run -d <device_id>
```

## State Management

The app uses Riverpod for state management:

```dart
// Example: Accessing the URL cleaner state
final state = ref.watch(urlCleanerProvider);

// Example: Triggering actions
ref.read(urlCleanerProvider.notifier).parseUrl(url);
```

### Key Providers
- `urlCleanerProvider`: Main app state
- `themeModeProvider`: Theme management
- `urlHistoryProvider`: URL cleaning history
- `urlStatisticsProvider`: Usage statistics

## Testing

### Running Tests
```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Generate coverage report
genhtml coverage/lcov.info -o coverage/html
```

### Test Structure
```
test/
├── domain/
│   ├── entities/        # Entity tests
│   └── usecases/        # Use case tests
├── data/
│   └── repositories/    # Repository tests
├── presentation/
│   ├── widgets/         # Widget tests
│   └── screens/         # Screen integration tests
└── integration/         # End-to-end tests
```

### Writing Tests
```dart
// Widget test example
testWidgets('ParameterItem shows tracker badge', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: ParameterItem(
        parameter: trackerParameter,
        onChanged: (_) {},
      ),
    ),
  );
  
  expect(find.text('Tracker'), findsOneWidget);
});
```

## Building for Production

### Android

1. **Configure signing**:
```bash
# Generate keystore
keytool -genkey -v -keystore ~/link-cleaner.jks -keyalg RSA -keysize 2048 -validity 10000 -alias link-cleaner
```

2. **Create `android/key.properties`**:
```properties
storePassword=<password>
keyPassword=<password>
keyAlias=link-cleaner
storeFile=/Users/<username>/link-cleaner.jks
```

3. **Update `android/app/build.gradle`**:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

4. **Build APK/AAB**:
```bash
# Build APK
flutter build apk --release

# Build App Bundle (recommended for Play Store)
flutter build appbundle --release
```

### iOS

1. **Open in Xcode**:
```bash
open ios/Runner.xcworkspace
```

2. **Configure signing**:
- Select your team in Xcode
- Update bundle identifier
- Configure provisioning profiles

3. **Build**:
```bash
# Build for iOS
flutter build ios --release

# Archive in Xcode for App Store
Product > Archive
```

### Web

```bash
# Build for web
flutter build web --release --web-renderer canvaskit

# Deploy to hosting
# Copy build/web/* to your hosting service
```

## CI/CD with GitHub Actions

Create `.github/workflows/flutter.yml`:

```yaml
name: Flutter CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.16.0'
    - run: flutter pub get
    - run: flutter test
    - run: flutter analyze

  build-android:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: subosito/flutter-action@v2
    - run: flutter pub get
    - run: flutter build apk --release
    - uses: actions/upload-artifact@v3
      with:
        name: android-apk
        path: build/app/outputs/flutter-apk/app-release.apk

  build-ios:
    needs: test
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v3
    - uses: subosito/flutter-action@v2
    - run: flutter pub get
    - run: flutter build ios --release --no-codesign
```

## Performance Optimization

### 1. Widget Optimization
```dart
// Use const constructors
const Icon(Icons.share)

// Use keys for stateful widgets in lists
ParameterItem(
  key: ValueKey(parameter.key),
  parameter: parameter,
)
```

### 2. State Management
```dart
// Use select to avoid unnecessary rebuilds
final selectedCount = ref.watch(
  urlCleanerProvider.select((state) => state.cleanedUrl?.selectedParameters ?? 0),
);
```

### 3. Build Optimization
```bash
# Optimize app size
flutter build apk --split-per-abi

# Tree shaking icons
flutter build apk --tree-shake-icons
```

## Monitoring & Analytics

### Firebase Integration (Optional)

1. **Add Firebase**:
```bash
flutterfire configure
```

2. **Add dependencies**:
```yaml
dependencies:
  firebase_core: ^2.24.0
  firebase_analytics: ^10.7.0
  firebase_crashlytics: ^3.4.0
```

3. **Initialize**:
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
  runApp(MyApp());
}
```

### Sentry Integration (Alternative)

```yaml
dependencies:
  sentry_flutter: ^7.14.0
```

```dart
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = 'YOUR_DSN_HERE';
      options.tracesSampleRate = 1.0;
    },
    appRunner: () => runApp(MyApp()),
  );
}
```

## Debugging

### Flutter Inspector
```bash
# Run with Flutter Inspector
flutter run --debug

# Performance overlay
flutter run --profile
```

### Common Issues

1. **Shared URL not received**:
   - Check AndroidManifest.xml intent filters
   - Verify Info.plist URL schemes on iOS

2. **State not updating**:
   - Check Riverpod provider dependencies
   - Verify ref.watch vs ref.read usage

3. **Performance issues**:
   - Use Flutter DevTools
   - Check for unnecessary rebuilds
   - Profile with `flutter run --profile`

## Release Checklist

- [ ] Update version in `pubspec.yaml`
- [ ] Update CHANGELOG.md
- [ ] Run all tests
- [ ] Test on physical devices
- [ ] Update app icons if needed
- [ ] Build release artifacts
- [ ] Test release builds
- [ ] Tag release in Git
- [ ] Upload to stores
- [ ] Monitor crash reports

## Resources

- [Flutter Documentation](https://docs.flutter.dev/)
- [Riverpod Documentation](https://riverpod.dev/)
- [Material Design 3](https://m3.material.io/)
- [Flutter DevTools](https://docs.flutter.dev/development/tools/devtools)