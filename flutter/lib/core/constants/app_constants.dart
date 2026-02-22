class AppConstants {
  static const String appName = 'Link Cleaner';
  static const String appVersion = '1.0.0';
  static const int buildNumber = 2;
  
  // Timeouts
  static const Duration shareTimeout = Duration(seconds: 30);
  static const Duration animationDuration = Duration(milliseconds: 300);
  
  // UI Constants
  static const double defaultPadding = 16.0;
  static const double defaultRadius = 12.0;
  static const double cardElevation = 2.0;
  
  // Regex patterns
  static final RegExp urlPattern = RegExp(
    r'^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?.*)?$',
    caseSensitive: false,
  );
}