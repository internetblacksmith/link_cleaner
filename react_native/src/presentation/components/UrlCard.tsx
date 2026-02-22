import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { CleanedUrl, getUrlStatistics } from '../../domain/entities/CleanedUrl';
import { useTheme } from '../contexts/ThemeContext';

interface UrlCardProps {
  cleanedUrl: CleanedUrl;
}

export default function UrlCard({ cleanedUrl }: UrlCardProps) {
  const { colors } = useTheme();
  const stats = getUrlStatistics(cleanedUrl);
  
  const handleCopy = () => {
    Clipboard.setString(cleanedUrl.cleanedUrl);
    Alert.alert('Success', 'URL copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: cleanedUrl.cleanedUrl,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share URL');
    }
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textSecondary }]}>CLEANED URL</Text>
        {cleanedUrl.charactersSaved > 0 && (
          <View style={[styles.chip, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.chipText, { color: colors.onPrimaryContainer }]}>
              {cleanedUrl.charactersSaved} chars saved
            </Text>
          </View>
        )}
      </View>
      
      <View style={[styles.urlContainer, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.urlText, { color: colors.text }]} numberOfLines={3}>
          {cleanedUrl.cleanedUrl}
        </Text>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.stats}>
          <Text style={[styles.statsIcon, { color: colors.textSecondary }]}>📊</Text>
          <Text style={[styles.statsText, { color: colors.textSecondary }]}>
            {Math.round(stats.compressionRatio * 100)}% reduced
          </Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleCopy} style={styles.actionButton}>
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              📋 Copy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleShare} 
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              ↗️ Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
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
  urlContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  urlText: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  statsText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    borderWidth: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
});