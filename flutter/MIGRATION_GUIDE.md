# Migration Guide: From Original to Clean Architecture

## Overview

This guide helps migrate from the original `main.dart` implementation to the new clean architecture structure.

## Key Changes

### 1. Architecture
- **Before**: Single file with all logic in `main.dart`
- **After**: Clean architecture with separation of concerns

### 2. State Management
- **Before**: `setState()` in StatefulWidget
- **After**: Riverpod for reactive state management

### 3. Dependencies
- **Before**: Minimal dependencies
- **After**: Added Riverpod, SharedPreferences, Equatable, Intl

## Migration Steps

### Step 1: Update Dependencies

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter_riverpod: ^2.4.9
  shared_preferences: ^2.2.2
  equatable: ^2.0.5
  intl: ^0.18.1
```

Run:
```bash
flutter pub get
```

### Step 2: Create New Project Structure

```bash
# Create directories
mkdir -p lib/core/constants
mkdir -p lib/core/theme
mkdir -p lib/domain/entities
mkdir -p lib/domain/repositories
mkdir -p lib/domain/usecases
mkdir -p lib/data/repositories
mkdir -p lib/presentation/screens
mkdir -p lib/presentation/widgets
mkdir -p lib/presentation/providers
```

### Step 3: Copy New Files

Copy all the new files from this improved implementation to their respective directories.

### Step 4: Update Main Entry Point

Replace the content of `lib/main.dart` with `lib/main_new.dart`:
```dart
// Backup original
mv lib/main.dart lib/main_old.dart

// Use new main
mv lib/main_new.dart lib/main.dart
```

### Step 5: Update Imports

The `ArgumentModel` class has been replaced with `UrlParameter`:
```dart
// Old
import 'package:link_cleaner/argument.dart';

// New
import 'package:link_cleaner/domain/entities/url_parameter.dart';
```

## Feature Mapping

### URL Parsing
**Before:**
```dart
void _populateSharedUri(List<SharedMediaFile> value) {
  // Direct URI parsing in UI
  Uri? uri = Uri.tryParse(url);
  // ...
}
```

**After:**
```dart
// Handled by use case
ref.read(urlCleanerProvider.notifier).parseUrl(url);
```

### Parameter Selection
**Before:**
```dart
void itemChange(bool val, int index) {
  setState(() {
    _arguments[index].selected = val;
  });
  _cleanUrl();
}
```

**After:**
```dart
ref.read(urlCleanerProvider.notifier).toggleParameter(index);
```

## New Features

1. **History Tracking**: Automatically saves cleaned URLs
2. **Statistics**: Track usage metrics
3. **Theme Support**: Light/Dark/System themes
4. **Better Error Handling**: Proper error states and messages
5. **Performance**: Optimized rebuilds with Riverpod

## Testing the Migration

1. **Run existing functionality tests**:
   - Share a URL to the app
   - Toggle parameters
   - Share cleaned URL
   - Copy to clipboard

2. **Test new features**:
   - Check history screen
   - View statistics
   - Switch themes
   - Clear data

3. **Performance check**:
   - Scroll through long parameter lists
   - Check for smooth animations
   - Monitor memory usage

## Rollback Plan

If issues arise:
```bash
# Restore original main.dart
mv lib/main_old.dart lib/main.dart

# Remove new dependencies from pubspec.yaml
# Run: flutter pub get
```

## Benefits of Migration

1. **Maintainability**: Clear separation of concerns
2. **Testability**: Easy to unit test business logic
3. **Scalability**: Easy to add new features
4. **Performance**: Better state management
5. **Code Quality**: Type-safe with better error handling

## Common Issues

### Issue: SharedPreferences not initialized
**Solution**: Ensure `main()` is async and initializes SharedPreferences

### Issue: Provider not found
**Solution**: Wrap app with `ProviderScope`

### Issue: State not updating
**Solution**: Check if using `ref.watch` vs `ref.read` correctly

## Next Steps

After migration:
1. Run comprehensive tests
2. Update CI/CD pipelines
3. Train team on new architecture
4. Document any custom modifications