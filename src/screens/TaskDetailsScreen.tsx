import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fetchTaskDetail } from '../api/tasks';
import type { Task } from '../api/tasks';
import type { TaskPermissions } from '../utils/taskPermissions';
import { PERMISSION_MESSAGES, formatTaskStatusLabel } from '../utils/taskPermissions';
import { formatPeso } from '../utils/currency';
import { UserAvatar } from '../components/UserAvatar';

export function TaskDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const taskId = route.params?.taskId as number;
  const [task, setTask] = useState<Task | null>(null);
  const [permissions, setPermissions] = useState<TaskPermissions | null>(null);
  const [displayStatus, setDisplayStatus] = useState('open');
  const [loading, setLoading] = useState(true);

  const loadTask = useCallback(() => {
    if (!taskId) return;
    setLoading(true);
    fetchTaskDetail(taskId)
      .then(({ task: t, permissions: p, display_status }) => {
        setTask(t);
        setPermissions(p);
        setDisplayStatus(display_status);
      })
      .catch((e: Error) => {
        Alert.alert('Error', e.message);
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [taskId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadTask();
    }, [loadTask]),
  );

  if (loading || !task || !permissions) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const posterName = task.user?.name ?? 'Unknown';
  const statusLabel = formatTaskStatusLabel(displayStatus);
  const isHired =
    displayStatus === 'hired' || permissions.application_status === 'accepted';
  const isDeclined =
    displayStatus === 'declined' || permissions.application_status === 'declined';
  const isAppliedView =
    displayStatus === 'applied' ||
    (permissions.has_applied && !isHired && !isDeclined);
  const rejectionReason = task.user_application?.rejection_reason;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.placeholder} />
        </View>

        {permissions.is_owner ? (
          <View style={styles.bannerOwner}>
            <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
            <Text style={styles.bannerText}>{PERMISSION_MESSAGES.ownerPrompt}</Text>
          </View>
        ) : isHired ? (
          <View style={styles.bannerHired}>
            <Ionicons name="ribbon" size={18} color={colors.primary} />
            <Text style={styles.bannerText}>
              You were hired for this task! Check your notifications for details.
            </Text>
          </View>
        ) : isDeclined ? (
          <View style={styles.bannerDeclined}>
            <Ionicons name="close-circle" size={18} color={colors.error} />
            <Text style={styles.bannerText}>
              Your application was not selected.
              {rejectionReason ? ` Reason: ${rejectionReason}` : ''}
            </Text>
          </View>
        ) : isAppliedView ? (
          <View style={styles.bannerApplied}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.bannerText}>
              You applied for this task. The poster will review your offer
              {task.user_application?.proposed_price
                ? ` of ${formatPeso(Number(task.user_application.proposed_price))}`
                : ''}
              .
            </Text>
          </View>
        ) : displayStatus === 'occupied' ? (
          <View style={styles.closedBanner}>
            <Text style={styles.closedText}>
              This task is occupied — someone was already hired.
            </Text>
          </View>
        ) : (
          <View style={styles.bannerApplicant}>
            <Ionicons name="information-circle" size={18} color={colors.secondary} />
            <Text style={styles.bannerText}>
              {PERMISSION_MESSAGES.applyPrompt(posterName)}
            </Text>
          </View>
        )}

        <View style={styles.imageContainer}>
          <Text style={styles.largeEmoji}>📝</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={14} color={colors.textMuted} />
            <Text style={styles.location}>{task.location}</Text>
            {task.category ? (
              <Text style={styles.category}>• {task.category}</Text>
            ) : null}
          </View>

          <View style={styles.priceSection}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Budget</Text>
              <Text style={styles.priceValue}>{formatPeso(Number(task.price))}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Your status</Text>
              <Text
                style={[
                  styles.priceValue,
                  isAppliedView && styles.statusApplied,
                  isHired && styles.statusHired,
                  isDeclined && styles.statusDeclined,
                ]}
              >
                {statusLabel}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted by</Text>
            <View style={styles.posterCard}>
              <UserAvatar name={posterName} size={40} />
              <View style={styles.posterInfo}>
                <Text style={styles.posterName}>{posterName}</Text>
                <Text style={styles.posterMeta}>Task creator</Text>
              </View>
            </View>
          </View>

          {permissions.is_owner ? (
            <>
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={() =>
                  navigation.navigate('Post', {
                    screen: 'ManageTask',
                    params: { taskId: task.id },
                  })
                }
              >
                <Ionicons name="settings" size={18} color={colors.card} />
                <Text style={styles.buttonText}>Manage Task</Text>
              </Pressable>
              {permissions.can_view_applications && (
                <Pressable
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() =>
                    navigation.navigate('Post', {
                      screen: 'TaskApplications',
                      params: { taskId: task.id },
                    })
                  }
                >
                  <Ionicons name="people" size={18} color={colors.primary} />
                  <Text style={styles.secondaryButtonText}>View Applications</Text>
                </Pressable>
              )}
            </>
          ) : isHired ? (
            <Pressable style={[styles.button, styles.hiredButton]} disabled>
              <Text style={styles.hiredButtonText}>Hired — Task in progress</Text>
            </Pressable>
          ) : isDeclined ? (
            <Pressable style={[styles.button, styles.declinedButton]} disabled>
              <Text style={styles.declinedButtonText}>Application declined</Text>
            </Pressable>
          ) : isAppliedView ? (
            <Pressable style={[styles.button, styles.appliedButton]} disabled>
              <Text style={styles.appliedButtonText}>
                Applied — Waiting for confirmation
              </Text>
            </Pressable>
          ) : permissions.can_apply ? (
            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={() =>
                navigation.navigate('ApplyTask', { taskId: task.id })
              }
            >
              <Text style={styles.buttonText}>Apply for This Task</Text>
            </Pressable>
          ) : (
            <View style={styles.closedBanner}>
              <Text style={styles.closedText}>
                This task is not accepting applications.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  placeholder: { width: 40 },
  bannerOwner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    margin: 16,
    marginBottom: 0,
    padding: 12,
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  bannerApplicant: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    margin: 16,
    marginBottom: 0,
    padding: 12,
    backgroundColor: '#E6FFFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.success,
  },
  bannerApplied: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    margin: 16,
    marginBottom: 0,
    padding: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.success,
  },
  bannerHired: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    margin: 16,
    marginBottom: 0,
    padding: 12,
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  bannerDeclined: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    margin: 16,
    marginBottom: 0,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
  },
  bannerText: { flex: 1, fontSize: 12, color: colors.text, lineHeight: 18 },
  imageContainer: {
    height: 120,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  largeEmoji: { fontSize: 56 },
  contentContainer: { paddingHorizontal: 16, paddingVertical: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  location: { fontSize: 13, color: colors.textMuted },
  category: { fontSize: 13, color: colors.textMuted },
  priceSection: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  priceBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  priceLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  statusApplied: { color: colors.success },
  statusHired: { color: colors.primary },
  statusDeclined: { color: colors.error },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  posterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  posterInfo: { flex: 1 },
  posterName: { fontSize: 14, fontWeight: '600', color: colors.text },
  posterMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  button: {
    flexDirection: 'row',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  primaryButton: { backgroundColor: colors.primary },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.card },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  appliedButton: {
    backgroundColor: colors.tabBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appliedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  hiredButton: {
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  hiredButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  declinedButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: colors.error,
  },
  declinedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  closedBanner: {
    padding: 14,
    backgroundColor: colors.tabBg,
    borderRadius: 10,
    alignItems: 'center',
  },
  closedText: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
