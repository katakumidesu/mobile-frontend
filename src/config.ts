import { Platform } from 'react-native';

/**
 * Laravel API base URL.
 * - Android emulator: 10.0.2.2 maps to your PC's localhost
 * - iOS simulator / web: 127.0.0.1
 * - Physical device: set EXPO_PUBLIC_API_URL to your PC's LAN IP (e.g. http://192.168.1.5:8000)
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  Platform.select({
    android: 'http://192.168.1.17:8000',
    default: 'http://127.0.0.1:8000',
  })!;
