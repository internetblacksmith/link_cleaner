import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StatusBar,
  Alert,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  IconButton,
  Surface,
  List,
  Divider,
  Switch,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UrlRepositoryImpl } from '../../data/repositories/UrlRepositoryImpl';
import { UrlStatistics } from '../../domain/repositories/UrlRepository';
import { useMaterialTheme } from '../contexts/MaterialThemeContext';
import { ParameterDefinitionsUpdateService } from '../../services/ParameterDefinitionsUpdateService';

const repository = new UrlRepositoryImpl();

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, isDark, toggleTheme } = useMaterialTheme();
  const [statistics, setStatistics] = useState<UrlStatistics>({
    totalUrls: 0,
    totalCharactersSaved: 0,
    totalTrackersRemoved: 0,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await repository.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleThemeChange = () => {
    toggleTheme();
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all history and statistics. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await repository.clearHistory();
              setStatistics({
                totalUrls: 0,
                totalCharactersSaved: 0,
                totalTrackersRemoved: 0,
              });
              Alert.alert('Success', 'All data cleared');
            } catch (err) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const getThemeName = () => {
    return isDark ? 'Dark' : 'Light';
  };

  const handleUpdateDefinitions = async () => {
    setIsUpdating(true);
    try {
      const updated = await ParameterDefinitionsUpdateService.getInstance().checkForUpdates(true);
      if (updated) {
        Alert.alert('Success', 'Parameter definitions updated successfully');
      } else {
        Alert.alert('Info', 'Parameter definitions are already up to date');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update parameter definitions');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Appearance Section */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Appearance
            </Text>
            <List.Item
              title="Dark Theme"
              description={`Currently using ${getThemeName()} theme`}
              left={props => <List.Icon {...props} icon="palette" />}
              right={() => (
                <Switch
                  value={isDark}
                  onValueChange={handleThemeChange}
                />
              )}
            />
          </Card.Content>
        </Card>

        {/* Statistics Section */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Statistics
            </Text>
            <List.Item
              title="Total URLs Cleaned"
              description={statistics.totalUrls.toString()}
              left={props => <List.Icon {...props} icon="link" />}
            />
            <Divider />
            <List.Item
              title="Characters Saved"
              description={formatNumber(statistics.totalCharactersSaved)}
              left={props => <List.Icon {...props} icon="chart-line" />}
            />
            <Divider />
            <List.Item
              title="Trackers Removed"
              description={statistics.totalTrackersRemoved.toString()}
              left={props => <List.Icon {...props} icon="shield-check" />}
            />
          </Card.Content>
        </Card>

        {/* Data Section */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Data Management
            </Text>
            <List.Item
              title="Clear All Data"
              description="Remove all history and statistics"
              left={props => <List.Icon {...props} icon="delete" />}
              onPress={handleClearData}
            />
          </Card.Content>
        </Card>

        {/* Updates Section */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              Updates
            </Text>
            <List.Item
              title="Update Parameter Definitions"
              description="Check for new tracking parameter definitions"
              left={props => <List.Icon {...props} icon="download" />}
              right={() => (
                isUpdating ? (
                  <ActivityIndicator animating size="small" />
                ) : (
                  <IconButton
                    icon="refresh"
                    size={20}
                    onPress={handleUpdateDefinitions}
                  />
                )
              )}
              onPress={isUpdating ? undefined : handleUpdateDefinitions}
              disabled={isUpdating}
            />
          </Card.Content>
        </Card>

        {/* About Section */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 16 }}>
              About
            </Text>
            <List.Item
              title="Version"
              description="1.0.0 (Build 1)"
              left={props => <List.Icon {...props} icon="information" />}
            />
            <Divider />
            <List.Item
              title="Privacy"
              description="All data is stored locally on your device"
              left={props => <List.Icon {...props} icon="lock" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

