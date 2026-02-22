import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialThemeProvider } from './src/presentation/contexts/MaterialThemeContext';
import HomeScreen from './src/presentation/screens/HomeScreen';
import HistoryScreen from './src/presentation/screens/HistoryScreen';
import SettingsScreen from './src/presentation/screens/SettingsScreen';
import { ParameterDefinitionsUpdateService } from './src/services/ParameterDefinitionsUpdateService';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize parameter definitions update service
    ParameterDefinitionsUpdateService.getInstance().initialize();
  }, []);

  return (
    <MaterialThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </MaterialThemeProvider>
  );
}

export default App;