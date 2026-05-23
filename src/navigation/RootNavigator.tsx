import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { colors } from '../theme/colors';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { AppNavigator } from './AppNavigator';
import type { AuthUser } from '../api/auth';

type Props = {
  user: AuthUser | null;
  booting: boolean;
  onAuthenticated: (user: AuthUser) => void;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator({ user, booting, onAuthenticated }: Props) {
  if (booting) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen
          name="AuthStack"
          options={{
            headerShown: false,
          }}
        >
          {() => <AuthScreen onAuthenticated={onAuthenticated} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen
          name="AppStack"
          options={{
            headerShown: false,
          }}
        >
          {() => <AppNavigator user={user} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
