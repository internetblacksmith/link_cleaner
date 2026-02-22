import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  DeviceEventEmitter,
  View,
  StatusBar,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  Checkbox,
  FAB,
  ActivityIndicator,
  Snackbar,
  IconButton,
  Surface,
  Divider,
  TouchableRipple,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UrlRepositoryImpl } from '../../data/repositories/UrlRepositoryImpl';
import { CleanedUrl, createCleanedUrl } from '../../domain/entities/CleanedUrl';
import { useMaterialTheme } from '../contexts/MaterialThemeContext';

const repository = new UrlRepositoryImpl();

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme, isDark } = useMaterialTheme();
  const [cleanedUrl, setCleanedUrl] = useState<CleanedUrl | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    // Listen for shared URLs from native Android code
    const subscription = DeviceEventEmitter.addListener(
      'onSharedUrl',
      (data: { url: string }) => {
        if (data.url) {
          handleSharedUrl(data.url);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [handleSharedUrl]);

  const handleSharedUrl = useCallback(async (urlString: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const parsed = await repository.parseUrl(urlString);
      setCleanedUrl(parsed);
      
      if (parsed.parameters.length === 0) {
        setError('No query parameters found in this URL');
        setSnackbarVisible(true);
      }
      
      // Save to history
      await repository.saveToHistory(parsed);
    } catch (err) {
      setError('Invalid URL format');
      setSnackbarVisible(true);
      console.error('URL parsing error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleParameter = useCallback((index: number) => {
    if (!cleanedUrl) return;
    
    const newParameters = [...cleanedUrl.parameters];
    newParameters[index] = {
      ...newParameters[index],
      selected: !newParameters[index].selected,
    };
    
    setCleanedUrl(createCleanedUrl(cleanedUrl.originalUrl, newParameters));
  }, [cleanedUrl]);

  const toggleSelectAllParams = useCallback(() => {
    if (!cleanedUrl) return;
    
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newParameters = cleanedUrl.parameters.map(p => ({
      ...p,
      selected: newSelectAll,
    }));
    
    setCleanedUrl(createCleanedUrl(cleanedUrl.originalUrl, newParameters));
  }, [cleanedUrl, selectAll]);

  const clearAll = useCallback(() => {
    if (!cleanedUrl) return;
    
    const newParameters = cleanedUrl.parameters.map(p => ({
      ...p,
      selected: false,
    }));
    
    setCleanedUrl(createCleanedUrl(cleanedUrl.originalUrl, newParameters));
    setSelectAll(false);
  }, [cleanedUrl]);

  const shareCleanedUrl = useCallback(async () => {
    if (!cleanedUrl) return;
    
    try {
      const { Share } = await import('react-native-share');
      await Share.open({
        url: cleanedUrl.cleanedUrl,
        title: 'Share cleaned URL',
        message: `Cleaned URL: ${cleanedUrl.cleanedUrl}`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  }, [cleanedUrl]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        <Appbar.Header>
          <Appbar.Content title="Link Cleaner" />
        </Appbar.Header>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating size="large" />
          <Text style={{ marginTop: 16, color: theme.colors.onSurface }}>
            Processing URL...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!cleanedUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.surface}
        />
        <Appbar.Header>
          <Appbar.Content title="Link Cleaner" />
          <Appbar.Action
            icon="history"
            onPress={() => navigation.navigate('History')}
          />
          <Appbar.Action
            icon="cog"
            onPress={() => navigation.navigate('Settings')}
          />
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
              icon="link"
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
              Share a URL to clean it
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
                maxWidth: 280,
              }}
            >
              Remove tracking parameters and clean your URLs before sharing them with others
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
        <Appbar.Content title="Link Cleaner" />
        <Appbar.Action
          icon="history"
          onPress={() => navigation.navigate('History')}
        />
        <Appbar.Action
          icon="cog"
          onPress={() => navigation.navigate('Settings')}
        />
      </Appbar.Header>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Original URL Card */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              Original URL
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                fontFamily: 'monospace',
              }}
              numberOfLines={3}
              ellipsizeMode="middle"
            >
              {cleanedUrl.originalUrl}
            </Text>
          </Card.Content>
        </Card>

        {/* Cleaned URL Card */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              Cleaned URL
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.primary,
                fontFamily: 'monospace',
                marginBottom: 12,
              }}
              numberOfLines={3}
              ellipsizeMode="middle"
            >
              {cleanedUrl.cleanedUrl}
            </Text>
            <Button
              mode="contained"
              icon="share"
              onPress={shareCleanedUrl}
            >
              Share Cleaned URL
            </Button>
          </Card.Content>
        </Card>

        {/* Parameters Section */}
        {cleanedUrl.parameters.length > 0 ? (
          <Card>
            <Card.Content>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text variant="titleMedium">
                  Parameters ({cleanedUrl.parameters.length})
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <IconButton
                    icon={selectAll ? 'checkbox-multiple-marked' : 'checkbox-multiple-blank-outline'}
                    mode="outlined"
                    size={20}
                    onPress={toggleSelectAllParams}
                  />
                  <IconButton
                    icon="close-box-multiple-outline"
                    mode="outlined"
                    size={20}
                    onPress={clearAll}
                  />
                </View>
              </View>
              
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}
              >
                Select which parameters to keep in the final URL
              </Text>

              {cleanedUrl.parameters.map((param, index) => (
                <TouchableRipple
                  key={`${param.key}-${index}`}
                  onPress={() => toggleParameter(index)}
                  style={{ paddingVertical: 8 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Checkbox
                      status={param.selected ? 'checked' : 'unchecked'}
                      onPress={() => toggleParameter(index)}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text variant="bodyLarge" style={{ fontWeight: '500' }}>
                          {param.displayName || param.key}
                        </Text>
                        {param.isTracker && (
                          <IconButton
                            icon="shield-alert"
                            size={16}
                            iconColor={theme.colors.error}
                            style={{ margin: 0 }}
                          />
                        )}
                      </View>
                      <Text 
                        variant="bodySmall" 
                        style={{ 
                          color: theme.colors.onSurfaceVariant,
                        }}
                      >
                        {param.description || 'Unknown parameter'}
                      </Text>
                      <Text 
                        variant="bodySmall" 
                        style={{ 
                          color: theme.colors.onSurfaceVariant,
                          fontFamily: 'monospace',
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                        ellipsizeMode="end"
                      >
                        {param.key}={param.value}
                      </Text>
                    </View>
                  </View>
                </TouchableRipple>
              ))}
            </Card.Content>
          </Card>
        ) : (
          <Card>
            <Card.Content style={{ alignItems: 'center', padding: 32 }}>
              <IconButton
                icon="check-circle-outline"
                size={48}
                iconColor={theme.colors.tertiary}
              />
              <Text
                variant="titleMedium"
                style={{ marginTop: 8, marginBottom: 4, textAlign: 'center' }}
              >
                This URL is already clean!
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
              >
                No tracking parameters found
              </Text>
            </Card.Content>
          </Card>
        )}

      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

