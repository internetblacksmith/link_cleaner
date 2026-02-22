import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { UrlParameter } from '../../domain/entities/UrlParameter';
import { useTheme } from '../contexts/ThemeContext';

interface ParameterItemProps {
  parameter: UrlParameter;
  onToggle: () => void;
}

export default function ParameterItem({ parameter, onToggle }: ParameterItemProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.key, { color: colors.text }]}>{parameter.key}</Text>
            {parameter.isTracker && (
              <View style={[styles.badge, { backgroundColor: colors.errorContainer }]}>
                <Text style={styles.badgeIcon}>👁️‍🗨️</Text>
                <Text style={[styles.badgeText, { color: colors.onErrorContainer }]}>
                  {parameter.category || 'Tracker'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.value, { color: colors.textSecondary }]} numberOfLines={1}>
            {parameter.value.length > 50 
              ? parameter.value.substring(0, 50) + '...'
              : parameter.value}
          </Text>
        </View>
        <View style={[
          styles.checkbox,
          { borderColor: parameter.selected ? colors.primary : colors.border },
          parameter.selected && { backgroundColor: colors.primary }
        ]}>
          {parameter.selected && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  key: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  value: {
    fontSize: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});