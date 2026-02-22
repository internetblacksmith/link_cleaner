import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../domain/entities/cleaned_url.dart';

class UrlCard extends StatelessWidget {
  final CleanedUrl cleanedUrl;
  final VoidCallback? onCopy;

  const UrlCard({
    Key? key,
    required this.cleanedUrl,
    this.onCopy,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'CLEANED URL',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                if (cleanedUrl.charactersSaved > 0)
                  Chip(
                    label: Text(
                      '${cleanedUrl.charactersSaved} chars saved',
                      style: const TextStyle(fontSize: 11),
                    ),
                    backgroundColor: theme.colorScheme.primaryContainer,
                    labelStyle: TextStyle(
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                    visualDensity: VisualDensity.compact,
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceVariant.withOpacity(0.5),
                borderRadius: BorderRadius.circular(8),
              ),
              child: SelectableText(
                cleanedUrl.cleanedUrl,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontFamily: 'monospace',
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.analytics_outlined,
                      size: 16,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${cleanedUrl.compressionRatio.toStringAsFixed(0)}% reduced',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton.icon(
                      icon: const Icon(Icons.copy, size: 18),
                      label: const Text('Copy'),
                      onPressed: () {
                        Clipboard.setData(
                          ClipboardData(text: cleanedUrl.cleanedUrl),
                        );
                        onCopy?.call();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('URL copied to clipboard'),
                            behavior: SnackBarBehavior.floating,
                            duration: const Duration(seconds: 2),
                            action: SnackBarAction(
                              label: 'OK',
                              onPressed: () {},
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(width: 8),
                    FilledButton.icon(
                      icon: const Icon(Icons.share, size: 18),
                      label: const Text('Share'),
                      onPressed: () => Share.share(cleanedUrl.cleanedUrl),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}