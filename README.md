# Link Cleaner - Cross-Platform URL Cleaning App

<p align="center">
  <img src="flutter/assets/icon/icon.png" width="128" height="128" alt="Link Cleaner Logo">
</p>

<p align="center">
  <strong>Clean tracking parameters from URLs before sharing</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#development">Development</a> •
  <a href="#testing">Testing</a> •
  <a href="#deployment">Deployment</a>
</p>

## Overview

Link Cleaner is a privacy-focused mobile application available in both Flutter and React Native implementations. It helps users remove tracking parameters from URLs before sharing them, protecting privacy and creating cleaner links.

## Features

- 🔗 **URL Cleaning**: Remove tracking parameters from any URL
- 🎯 **Smart Detection**: Automatically identifies 50+ types of tracking parameters
- 📊 **Statistics**: Track how many characters and trackers you've removed
- 📜 **History**: View previously cleaned URLs
- 🎨 **Themes**: Light, dark, and system theme support
- 📱 **Cross-Platform**: Identical features on both Flutter and React Native

## Quick Start

### Prerequisites

- **Flutter**: 3.0.0 or higher
- **Node.js**: 18.0.0 or higher
- **Platform Tools**:
  - Android: Android Studio & Android SDK
  - iOS: Xcode 14+ (macOS only)

### Using the Quick Start Script

```bash
# Clone the repository
git clone https://github.com/yourusername/link_cleaner.git
cd link_cleaner

# Run the interactive quick start
./quickstart.sh
```

### Using Make Commands

```bash
# Setup everything
make setup

# Run Flutter app
make dev-flutter

# Run React Native app
make dev-rn-android  # or make dev-rn-ios

# Run all tests
make test

# Build for production
make build
```

## Development

### Available Make Commands

Run `make help` to see all available commands:

```
setup                          Setup development environment for both platforms
dev-flutter                    Start Flutter in development mode
dev-rn                         Start React Native in development mode
lint                           Lint both Flutter and React Native code
format                         Format code for both platforms
test                           Run all tests (unit + integration)
build                          Build both apps for all platforms
clean                          Clean build artifacts for both platforms
doctor                         Check development environment health
```

### Project Structure

```
link_cleaner/
├── flutter/                   # Flutter implementation
│   ├── lib/
│   │   ├── core/             # Constants and themes
│   │   ├── domain/           # Business logic
│   │   ├── data/             # Data layer
│   │   └── presentation/     # UI layer
│   └── test/                 # Flutter tests
├── react_native/             # React Native implementation
│   ├── src/
│   │   ├── domain/           # Business logic
│   │   ├── data/             # Data layer
│   │   └── presentation/     # UI layer
│   └── __tests__/            # React Native tests
├── test/                     # Cross-platform integration tests
│   ├── features/             # Gherkin test scenarios
│   ├── step-definitions/     # Test implementations
│   └── support/              # Test framework
└── Makefile                  # Automation commands
```

### Architecture

Both apps follow Clean Architecture principles:

1. **Domain Layer**: Business entities and use cases
2. **Data Layer**: Repository implementations and data sources
3. **Presentation Layer**: UI components and state management

## Testing

### Unit Tests

```bash
# Run unit tests for both platforms
make test-unit

# Flutter only
make test-unit-flutter

# React Native only
make test-unit-rn
```

### Integration Tests

The project uses Cucumber + Appium for cross-platform integration testing:

```bash
# Run integration tests on both platforms
make test-integration

# Run specific test scenarios
cd test
./run-tests.sh --tags "@core"

# Compare results between platforms
make test-compare
```

### Test Coverage

- Unit tests for business logic
- Widget/Component tests
- End-to-end integration tests
- Cross-platform parity validation

## Building

### Debug Builds

```bash
# Build debug versions for testing
make build-debug
```

### Production Builds

```bash
# Build for all platforms
make build

# Create a new release
make release VERSION=1.0.1
```

### Platform-Specific Builds

```bash
# Flutter
cd flutter
flutter build apk --release
flutter build appbundle --release
flutter build ios --release

# React Native
cd react_native
npm run build:android
npm run build:ios
```

## Deployment

### Android (Google Play Store)

1. Build the release bundles:
   ```bash
   make build
   ```

2. Upload to Play Console:
   - Flutter: `flutter/build/app/outputs/bundle/release/app-release.aab`
   - React Native: `react_native/android/app/build/outputs/bundle/release/app-release.aab`

### iOS (App Store)

1. Build for iOS (macOS required):
   ```bash
   make build
   ```

2. Upload using Xcode or Transporter

## CI/CD

The project includes GitHub Actions workflows for:

- ✅ Automated testing
- 📦 Building artifacts
- 🚀 Release automation

See `.github/workflows/ci.yml` for the complete pipeline.

## Troubleshooting

### Check Environment

```bash
# Run health check
make doctor

# View logs
make logs

# Clean and rebuild
make clean
make setup
```

### Common Issues

1. **Build failures**: Run `make clean` then `make setup`
2. **Test failures**: Ensure emulators/simulators are running
3. **Permission issues**: Check platform-specific setup in respective README files

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`make test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Flutter team for the amazing framework
- React Native team for the cross-platform solution
- All contributors and testers

---

<p align="center">
  Made with ❤️ for privacy
</p>