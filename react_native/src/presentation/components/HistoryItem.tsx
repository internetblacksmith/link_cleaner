import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { CleanedUrl, getUrlStatistics } from '../../domain/entities/CleanedUrl';
import { useTheme } from '../contexts/ThemeContext';

interface HistoryItemProps {
  cleanedUrl: CleanedUrl;
}

export default function HistoryItem({ cleanedUrl }: HistoryItemProps) {
  const { colors } = useTheme();
  const stats = getUrlStatistics(cleanedUrl);
  const styles = getStyles(colors);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const showDetails = () => {
    const paramDetails = cleanedUrl.parameters
      .map(p => `${p.selected ? '✓' : '✗'} ${p.key}=${p.value}`)
      .join('\n');
    
    Alert.alert(
      'URL Details',
      `Original URL:\n${cleanedUrl.originalUrl}\n\nCleaned URL:\n${cleanedUrl.cleanedUrl}\n\nParameters:\n${paramDetails}`,
      [{ text: 'Close' }]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={showDetails}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.icon, { color: colors.primary }]}>🔗</Text>
        <Text style={[styles.url, { color: colors.text }]} numberOfLines={1}>
          {cleanedUrl.baseUrl}
        </Text>
      </View>
      
      <View style={styles.chips}>
        <View style={[styles.chip, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[styles.chipText, { color: colors.onPrimaryContainer }]}>
            {cleanedUrl.charactersSaved} chars saved
          </Text>
        </View>
        {stats.trackerCount > 0 && (
          <View style={[styles.chip, { backgroundColor: colors.errorContainer }]}>
            <Text style={[styles.chipText, { color: colors.onErrorContainer }]}>
              {stats.trackerCount} trackers
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.date, { color: colors.textSecondary }]}>
        {formatDate(cleanedUrl.cleanedAt)}
      </Text>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  url: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
  },
});