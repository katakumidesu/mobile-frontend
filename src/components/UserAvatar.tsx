import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
};

export function UserAvatar({ name, avatarUrl, size = 40 }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const isRemoteImage =
    avatarUrl?.startsWith('http://') || avatarUrl?.startsWith('https://');

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {isRemoteImage ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Text style={[styles.emoji, { fontSize: size * 0.45 }]}>
          {avatarUrl || initial}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emoji: {
    textAlign: 'center',
  },
});
