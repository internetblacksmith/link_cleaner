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
  ActivityIndicator,
  IconButton,
  Surface,
  List,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UrlRepositoryImpl } from '../../data/repositories/UrlRepositoryImpl';
import { CleanedUrl } from '../../domain/entities/CleanedUrl';
import { useMaterialTheme } from '../contexts/MaterialThemeContext';

const repository = new UrlRepositoryImpl();

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { theme, isDark } = useMaterialTheme();
  const [history, setHistory] = useState<CleanedUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await repository.getHistory();
      setHistory(data);
    } catch (err) {
      setError('Failed to load history');
      console.error('Error loading history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await repository.clearHistory();
              setHistory([]);
            } catch (err) {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };


  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="History" />
        </Appbar.Header>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating size="large" />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
            Loading history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="History" />
        </Appbar.Header>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Surface
            style={{
              padding: 32,
              borderRadius: 16,
              alignItems: 'center',
              elevation: 2,
            }}
          >
            <IconButton
              icon="alert-circle-outline"
              size={64}
              iconColor={theme.colors.error}
            />
            <Text
              variant="headlineSmall"
              style={{
                marginTop: 16,
                marginBottom: 8,
                textAlign: 'center',
                color: theme.colors.onSurface,
              }}
            >
              Error
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
              }}
            >
              {error}
            </Text>
          </Surface>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.surface}
      />
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="History" />
        {history.length > 0 && (
          <Appbar.Action
            icon="delete-outline"
            onPress={handleClearHistory}
          />
        )}
      </Appbar.Header>

      {history.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Surface
            style={{
              padding: 32,
              borderRadius: 16,
              alignItems: 'center',
              elevation: 2,
            }}
          >
            <IconButton
              icon="history"
              size={64}
              iconColor={theme.colors.primary}
            />
            <Text
              variant="headlineSmall"
              style={{
                marginTop: 16,
                marginBottom: 8,
                textAlign: 'center',
                color: theme.colors.onSurface,
              }}
            >
              No history yet
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
                maxWidth: 280,
              }}
            >
              Your cleaned URLs will appear here
            </Text>
          </Surface>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {history.map((item, index) => (
            <Card key={`${item.cleanedAt}-${index}`} style={{ marginBottom: 12 }}>
              <Card.Content>
                <Text variant="titleSmall" style={{ marginBottom: 4 }}>
                  {new Date(item.cleanedAt).toLocaleDateString()} {new Date(item.cleanedAt).toLocaleTimeString()}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    fontFamily: 'monospace',
                    marginBottom: 8,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="middle"
                >
                  {item.originalUrl}
                </Text>
                <Divider style={{ marginVertical: 8 }} />
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.primary,
                    fontFamily: 'monospace',
                  }}
                  numberOfLines={2}
                  ellipsizeMode="middle"
                >
                  {item.cleanedUrl}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

