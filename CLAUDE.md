# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Link Cleaner is a Flutter application designed to clean URLs by removing tracking parameters. The app receives shared URLs from other applications, parses query parameters, and allows users to selectively keep or remove parameters before sharing the cleaned URL.

## Development Commands

### Flutter Commands
```bash
# Install dependencies
flutter pub get

# Run the app in debug mode
flutter run

# Run tests
flutter test

# Analyze code for issues
flutter analyze

# Build for production
flutter build apk        # Android APK
flutter build appbundle  # Android App Bundle
flutter build ios        # iOS (requires macOS)
flutter build web        # Web
flutter build linux      # Linux desktop
flutter build macos      # macOS desktop
flutter build windows    # Windows desktop
```

### Icon Generation
```bash
# Generate launcher icons (configured in pubspec.yaml)
flutter pub run flutter_launcher_icons:main
```

## Architecture Overview

The application follows a simple Flutter architecture with stateful widgets:

### Core Components
- **lib/main.dart**: Main application file containing:
  - `MyApp`: The root stateful widget
  - URL sharing intent handling via `receive_sharing_intent` package
  - Query parameter parsing and display logic
  - Cleaned URL generation based on selected parameters
  - Share functionality via `share_plus` package

- **lib/argument.dart**: Simple model class representing URL query parameters with:
  - `key`: Parameter name
  - `value`: Parameter value
  - `selected`: Boolean for user selection state

### Key Features Implementation
1. **Receiving Shared URLs**: Handled by `ReceiveSharingIntent` listeners in `initState()`
2. **URL Parsing**: Uses Dart's built-in `Uri` class to parse and extract query parameters
3. **Parameter Selection**: CheckboxListTile widgets allow toggling individual parameters
4. **URL Reconstruction**: `_cleanUrl()` method rebuilds URL with selected parameters only
5. **Sharing**: Uses `share_plus` package to share cleaned URLs

### Platform Support
The app is configured for multiple platforms:
- Android (Kotlin)
- iOS (Swift)
- Web
- Linux, macOS, Windows (desktop)

## Dependencies

Key packages used:
- `share_plus: 10.0.2` - Cross-platform sharing functionality
- `receive_sharing_intent: ^1.8.0` - Handle incoming shared content
- `ogp_data_extract: ^0.1.4` - Open Graph data extraction (dependency included but not actively used)
- `flutter_launcher_icons: ^0.13.1` - Generate app icons

## Testing

Currently minimal test coverage exists. When adding tests:
- Place widget tests in `test/`
- Use Flutter's built-in testing framework
- Run with `flutter test`