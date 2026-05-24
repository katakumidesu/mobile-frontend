import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import {
  fetchTaskApplications,
  hireApplicant,
  rejectApplicant,
  canRespondToApplication,
  TaskApplication,
} from '../api/applications';
import { UserAvatar } from '../components/UserAvatar';
import { formatPeso } from '../utils/currency';
import { formatTaskStatusLabel } from '../utils/taskPermissions';

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function applicationStatusLabel(status: string): string {
  switch (status) {
    case 'accepted':
      return 'Hired';
    case 'declined':
      return 'Declined';
    case 'applied':
      return 'Applied';
    default:
      return status;
  }
}

function applicationStatusStyle(status: string) {
  switch (status) {
    case 'accepted':
      return styles.statusHired;
    case 'declined':
      return styles.statusDeclined;
    default:
      return styles.statusApplied;
  }
}

export function TaskApplicationsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const taskId = route.params?.taskId as number;
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [taskStatus, setTaskStatus] = useState('open');
  const [taskTitle, setTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const load = useCallback(() => {
    if (!taskId) return;
    setLoading(true);
    fetchTaskApplications(taskId)
      .then(({ task, applications: apps }) => {
        setTaskStatus(task.status);
        setTaskTitle(task.title);
        setApplications(apps);
      })
      .catch(() => {
        setApplications([]);
      })
      .finally(() => setLoading(false));
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const taskLocked = taskStatus !== 'open';

  const handleReject = (item: TaskApplication) => {
    const runReject = async (reason: string) => {
      const msg = reason.trim();
      if (msg.length < 3) {
        Alert.alert('Reason required', 'Please enter at least 3 characters.');
        return;
      }
      try {
        setActionLoadingId(item.id);
        const res = await rejectApplicant(item.id, msg);
        Alert.alert('Rejected', res.message);
        load();
      } catch (e: any) {
        Alert.alert('Error', e.message);
      } finally {
        setActionLoadingId(null);
      }
    };

    if (Alert.prompt) {
      Alert.prompt(
        'Reject applicant',
        `Tell ${item.applicant.name} why they were rejected.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: (reason?: string) => runReject(reason ?? ''),
          },
        ],
        'plain-text',
      );
    } else {
      Alert.alert(
        'Reject applicant',
        'Open this applicant from Notifications to reject with a reason, or use a device that supports text input in alerts.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Applicants ({applications.length})</Text>
        <View style={styles.placeholder} />
      </View>

      {taskLocked ? (
        <View style={styles.lockedBanner}>
          <Ionicons name="lock-closed" size={16} color={colors.primary} />
          <Text style={styles.lockedBannerText}>
            {taskTitle ? `"${taskTitle}"` : 'This task'} is{' '}
            {formatTaskStatusLabel(taskStatus === 'in_progress' ? 'occupied' : taskStatus)}.
            Hiring is complete.
          </Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No applications yet.</Text>
          }
          renderItem={({ item }) => {
            const canAct = canRespondToApplication(item.status, taskStatus);

            return (
              <Pressable
                style={styles.applicantCard}
                onPress={() =>
                  navigation.navigate('ApplicantDetail', {
                    applicationId: item.id,
                  })
                }
              >
                <View style={styles.cardHeader}>
                  <View style={styles.profileSection}>
                    <UserAvatar
                      name={item.applicant.name}
                      avatarUrl={item.applicant.avatar_url}
                      size={36}
                    />
                    <View style={styles.applicantInfo}>
                      <Text style={styles.name}>{item.applicant.name}</Text>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color={colors.warning} />
                        <Text style={styles.ratingText}>
                          {item.applicant.average_rating.toFixed(1)} (
                          {item.applicant.review_count})
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.headerRight}>
                    <View
                      style={[
                        styles.statusPill,
                        applicationStatusStyle(item.status),
                      ]}
                    >
                      <Text style={styles.statusPillText}>
                        {applicationStatusLabel(item.status)}
                      </Text>
                    </View>
                    <View style={styles.budgetPill}>
                      <Text style={styles.budgetText}>
                        {formatPeso(Number(item.proposed_price ?? 0))}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.message} numberOfLines={2}>
                  {item.message ?? 'No message provided.'}
                </Text>
                {item.status === 'declined' && item.rejection_reason ? (
                  <Text style={styles.rejectionReason}>
                    Reason: {item.rejection_reason}
                  </Text>
                ) : null}
                <Text style={styles.time}>{timeAgo(item.created_at)}</Text>

                {canAct ? (
                  <View style={styles.actionContainer}>
                    <Pressable
                      style={[styles.actionPill, styles.hirePill]}
                      disabled={actionLoadingId === item.id}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        Alert.alert(
                          'Hire applicant',
                          `Hire ${item.applicant.name}? The task will be marked occupied and other applicants will be declined.`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Hire',
                              onPress: async () => {
                                try {
                                  setActionLoadingId(item.id);
                                  const res = await hireApplicant(item.id);
                                  Alert.alert('Success', res.message);
                                  load();
                                } catch (err: any) {
                                  Alert.alert('Error', err.message);
                                } finally {
                                  setActionLoadingId(null);
                                }
                              },
                            },
                          ],
                        );
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.card}
                      />
                      <Text style={styles.hirePillText}>
                        {actionLoadingId === item.id ? 'Hiring...' : 'Hire'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionPill, styles.rejectPill]}
                      disabled={actionLoadingId === item.id}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleReject(item);
                      }}
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={colors.error}
                      />
                      <Text style={styles.rejectPillText}>
                        {actionLoadingId === item.id ? '...' : 'Reject'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  placeholder: { width: 40 },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  lockedBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  loader: { marginTop: 40 },
  listContent: { paddingHorizontal: 16, paddingVertical: 16 },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 24,
  },
  applicantCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  applicantInfo: { flex: 1 },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: { fontSize: 10, fontWeight: '700', color: colors.text },
  statusHired: { backgroundColor: '#EDE9FE' },
  statusDeclined: { backgroundColor: '#FEF2F2' },
  statusApplied: { backgroundColor: '#ECFDF5' },
  budgetPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  budgetText: { fontSize: 13, fontWeight: '700', color: colors.card },
  message: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  rejectionReason: {
    fontSize: 11,
    color: colors.error,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  time: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 12,
  },
  actionContainer: { flexDirection: 'row', gap: 8 },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  hirePill: { backgroundColor: colors.primary },
  hirePillText: { fontSize: 12, fontWeight: '700', color: colors.card },
  rejectPill: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  rejectPillText: { fontSize: 12, fontWeight: '700', color: colors.error },
});
