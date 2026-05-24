import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  applicantName: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export function RejectReasonModal({
  visible,
  applicantName,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (visible) {
      setReason('');
    }
  }, [visible]);

  const handleSubmit = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Reject applicant</Text>
          <Text style={styles.subtitle}>
            Tell {applicantName} why they were not selected. They will receive a
            notification with your message.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Budget does not match, timeline too late..."
            placeholderTextColor={colors.textLight}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
            autoFocus
          />
          {reason.trim().length > 0 && reason.trim().length < 3 ? (
            <Text style={styles.hint}>At least 3 characters required.</Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.rejectButton,
                (loading || reason.trim().length < 3) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || reason.trim().length < 3}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} size="small" />
              ) : (
                <Text style={styles.rejectText}>Reject</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  hint: {
    fontSize: 11,
    color: colors.error,
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  rejectText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
