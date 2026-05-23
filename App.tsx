import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import type { AuthUser } from './src/api/auth';
import { fetchCurrentUser, logout } from './src/api/auth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setBooting(false));
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const handleAuthenticated = useCallback((user: AuthUser) => {
    setUser(user);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider user={user} setUser={setUser}>
        <NavigationContainer>
          <RootNavigator
            user={user}
            booting={booting}
            onAuthenticated={handleAuthenticated}
          />
        </NavigationContainer>
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
