import 'package:flutter/material.dart';
import '../../domain/entities/url_parameter.dart';

class ParameterItem extends StatelessWidget {
  final UrlParameter parameter;
  final ValueChanged<bool?> onChanged;

  const ParameterItem({
    Key? key,
    required this.parameter,
    required this.onChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      elevation: 1,
      child: CheckboxListTile(
        activeColor: theme.colorScheme.primary,
        value: parameter.selected,
        onChanged: onChanged,
        title: Row(
          children: [
            Expanded(
              child: Text(
                parameter.key,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            if (parameter.isTracker) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: theme.colorScheme.errorContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.visibility_off,
                      size: 12,
                      color: theme.colorScheme.onErrorContainer,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      parameter.category ?? 'Tracker',
                      style: TextStyle(
                        fontSize: 10,
                        color: theme.colorScheme.onErrorContainer,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Text(
            parameter.value.length > 50
                ? '${parameter.value.substring(0, 50)}...'
                : parameter.value,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      ),
    );
  }
}