import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../providers/url_provider.dart';
import '../widgets/empty_state.dart';
import '../../domain/entities/cleaned_url.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(urlHistoryProvider);
    final theme = Theme.of(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('History'),
        actions: [
          historyAsync.maybeWhen(
            data: (history) => history.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.delete_outline),
                    onPressed: () => _showClearHistoryDialog(context, ref),
                    tooltip: 'Clear History',
                  )
                : const SizedBox.shrink(),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: historyAsync.when(
        data: (history) {
          if (history.isEmpty) {
            return const EmptyState(
              icon: Icons.history,
              title: 'No history yet',
              subtitle: 'Your cleaned URLs will appear here',
            );
          }
          
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: history.length,
            itemBuilder: (context, index) {
              final item = history[index];
              return _HistoryItem(cleanedUrl: item);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => EmptyState(
          icon: Icons.error_outline,
          title: 'Error loading history',
          subtitle: error.toString(),
        ),
      ),
    );
  }

  Future<void> _showClearHistoryDialog(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear History'),
        content: const Text('Are you sure you want to clear all history?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
    
    if (confirmed == true) {
      await ref.read(urlRepositoryProvider).clearHistory();
      ref.invalidate(urlHistoryProvider);
    }
  }
}

class _HistoryItem extends StatelessWidget {
  final CleanedUrl cleanedUrl;
  
  const _HistoryItem({
    Key? key,
    required this.cleanedUrl,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dateFormat = DateFormat('MMM dd, yyyy • HH:mm');
    
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _showDetailsDialog(context),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.link,
                    size: 20,
                    color: theme.colorScheme.primary,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      cleanedUrl.baseUrl,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
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
                  const SizedBox(width: 8),
                  if (cleanedUrl.trackerCount > 0)
                    Chip(
                      label: Text(
                        '${cleanedUrl.trackerCount} trackers',
                        style: const TextStyle(fontSize: 11),
                      ),
                      backgroundColor: theme.colorScheme.errorContainer,
                      labelStyle: TextStyle(
                        color: theme.colorScheme.onErrorContainer,
                      ),
                      visualDensity: VisualDensity.compact,
                    ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                dateFormat.format(cleanedUrl.cleanedAt),
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  void _showDetailsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('URL Details'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDetailRow('Original URL', cleanedUrl.originalUrl),
              const SizedBox(height: 16),
              _buildDetailRow('Cleaned URL', cleanedUrl.cleanedUrl),
              const SizedBox(height: 16),
              Text(
                'Parameters (${cleanedUrl.totalParameters})',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 8),
              ...cleanedUrl.parameters.map(
                (p) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      Icon(
                        p.selected ? Icons.check_box : Icons.check_box_outline_blank,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '${p.key}=${p.value}',
                          style: Theme.of(context).textTheme.bodySmall,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
  
  Widget _buildDetailRow(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.w500,
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.grey.withOpacity(0.1),
            borderRadius: BorderRadius.circular(4),
          ),
          child: SelectableText(
            value,
            style: const TextStyle(
              fontSize: 12,
              fontFamily: 'monospace',
            ),
          ),
        ),
      ],
    );
  }
}