import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/theme_provider.dart';
import '../providers/url_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final statsAsync = ref.watch(urlStatisticsProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          _buildSection(
            title: 'Appearance',
            children: [
              ListTile(
                leading: const Icon(Icons.palette_outlined),
                title: const Text('Theme'),
                subtitle: Text(_getThemeName(themeMode)),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => _showThemeDialog(context, ref),
              ),
            ],
          ),
          _buildSection(
            title: 'Statistics',
            children: [
              statsAsync.when(
                data: (stats) => Column(
                  children: [
                    _buildStatTile(
                      icon: Icons.link,
                      title: 'Total URLs Cleaned',
                      value: stats['totalUrls']?.toString() ?? '0',
                    ),
                    _buildStatTile(
                      icon: Icons.compress,
                      title: 'Characters Saved',
                      value: _formatNumber(stats['totalCharactersSaved'] ?? 0),
                    ),
                    _buildStatTile(
                      icon: Icons.visibility_off,
                      title: 'Trackers Removed',
                      value: stats['totalTrackersRemoved']?.toString() ?? '0',
                    ),
                  ],
                ),
                loading: () => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(),
                  ),
                ),
                error: (_, __) => const ListTile(
                  leading: Icon(Icons.error_outline),
                  title: Text('Error loading statistics'),
                ),
              ),
            ],
          ),
          _buildSection(
            title: 'Data',
            children: [
              ListTile(
                leading: const Icon(Icons.delete_outline),
                title: const Text('Clear History'),
                subtitle: const Text('Remove all saved URLs from history'),
                onTap: () => _showClearDataDialog(context, ref),
              ),
            ],
          ),
          _buildSection(
            title: 'About',
            children: [
              ListTile(
                leading: const Icon(Icons.info_outline),
                title: const Text('Version'),
                subtitle: const Text('1.0.0 (Build 2)'),
              ),
              ListTile(
                leading: const Icon(Icons.privacy_tip_outlined),
                title: const Text('Privacy'),
                subtitle: const Text('All data is stored locally on your device'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Colors.grey,
            ),
          ),
        ),
        ...children,
      ],
    );
  }

  Widget _buildStatTile({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: Text(
        value,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatNumber(int number) {
    if (number < 1000) return number.toString();
    if (number < 1000000) return '${(number / 1000).toStringAsFixed(1)}K';
    return '${(number / 1000000).toStringAsFixed(1)}M';
  }

  String _getThemeName(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.system:
        return 'System default';
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
    }
  }

  Future<void> _showThemeDialog(BuildContext context, WidgetRef ref) async {
    final currentMode = ref.read(themeModeProvider);
    
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Choose Theme'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: ThemeMode.values.map((mode) {
            return RadioListTile<ThemeMode>(
              title: Text(_getThemeName(mode)),
              value: mode,
              groupValue: currentMode,
              onChanged: (value) {
                if (value != null) {
                  ref.read(themeModeProvider.notifier).setThemeMode(value);
                  Navigator.of(context).pop();
                }
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  Future<void> _showClearDataDialog(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear All Data'),
        content: const Text(
          'This will remove all history and statistics. This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
    
    if (confirmed == true) {
      await ref.read(urlRepositoryProvider).clearHistory();
      ref.invalidate(urlHistoryProvider);
      ref.invalidate(urlStatisticsProvider);
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('All data cleared'),
          ),
        );
      }
    }
  }
}