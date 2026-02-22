import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CleanedUrl, getUrlStatistics } from '../../domain/entities/CleanedUrl';
import { useTheme } from '../contexts/ThemeContext';

interface ParameterHeaderProps {
  cleanedUrl: CleanedUrl;
  selectAll: boolean;
  onToggleSelectAll: () => void;
  onClearAll: () => void;
}

export default function ParameterHeader({
  cleanedUrl,
  selectAll,
  onToggleSelectAll,
  onClearAll,
}: ParameterHeaderProps) {
  const { colors } = useTheme();
  const stats = getUrlStatistics(cleanedUrl);
  const styles = getStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]}>
          Parameters ({stats.selectedParameters}/{stats.totalParameters} selected)
        </Text>
        {stats.trackerCount > 0 && (
          <Text style={[styles.subtitle, { color: colors.error }]}>
            {stats.trackerCount} tracking parameters detected
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onToggleSelectAll} style={styles.actionButton}>
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {selectAll ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClearAll} style={styles.actionButton}>
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Clear All
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    opacity: 0.3,
  },
  info: {
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});