import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = TextInputProps & {
  label: string;
  icon: IconName;
  secure?: boolean;
  rightLabel?: string;
  onRightLabelPress?: () => void;
};

export function AuthTextField({
  label,
  icon,
  secure,
  rightLabel,
  onRightLabelPress,
  ...inputProps
}: Props) {
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {rightLabel ? (
          <Pressable onPress={onRightLabelPress} hitSlop={8}>
            <Text style={styles.link}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.inputWrap}>
        <Ionicons
          name={icon}
          size={20}
          color={colors.textLight}
          style={styles.leadingIcon}
        />
        <TextInput
          {...inputProps}
          secureTextEntry={hidden}
          placeholderTextColor={colors.textLight}
          style={styles.input}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            style={styles.trailingBtn}
            hitSlop={8}
          >
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textLight}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  link: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.card,
    minHeight: 48,
  },
  leadingIcon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  trailingBtn: {
    paddingHorizontal: 14,
  },
});
