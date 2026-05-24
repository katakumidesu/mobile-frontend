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
import {
  fetchApplication,
  hireApplicant,
  rejectApplicant,
  canRespondToApplication,
} from '../api/applications';
import { UserAvatar } from '../components/UserAvatar';
import { RejectReasonModal } from '../components/RejectReasonModal';
import { formatPeso } from '../utils/currency';
import { formatTaskStatusLabel } from '../utils/taskPermissions';

export function ApplicantDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const applicationId = route.params?.applicationId as number;
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [application, setApplication] = useState<Awaited<
    ReturnType<typeof fetchApplication>
  > | null>(null);

  const load = useCallback(() => {
    if (!applicationId) return;
    setLoading(true);
    fetchApplication(applicationId)
      .then(setApplication)
      .catch(() => setApplication(null))
      .finally(() => setLoading(false));
  }, [applicationId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const applicant = application?.applicant;
  const task = application?.task;
  const canAct =
    application && task
      ? canRespondToApplication(application.status, task.status)
      : false;

  const handleHire = () => {
    if (!applicant || !application) return;
    Alert.alert(
      'Hire applicant',
      `Hire ${applicant.name}? The task will be marked occupied.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hire',
          onPress: async () => {
            setActionLoading(true);
            try {
              const res = await hireApplicant(application.id);
              Alert.alert('Success', res.message, [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              Alert.alert('Error', e.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const submitReject = async (reason: string) => {
    if (!application) return;
    setActionLoading(true);
    try {
      const res = await rejectApplicant(application.id, reason);
      setRejectModalVisible(false);
      Alert.alert('Rejected', res.message, [
        { text: 'OK', onPress: () => load() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!application || !applicant) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.errorText}>Application not found.</Text>
      </SafeAreaView>
    );
  }

  const proposedBudget = formatPeso(
    Number(application.proposed_price ?? task?.price ?? 0),
  );

  const statusLabel =
    application.status === 'accepted'
      ? 'Hired'
      : application.status === 'declined'
        ? 'Declined'
        : 'Applied';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Applicant Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {task ? (
          <View style={styles.taskBanner}>
            <Text style={styles.taskBannerLabel}>Task</Text>
            <Text style={styles.taskBannerTitle}>{task.title}</Text>
            <Text style={styles.taskBannerBudget}>
              Budget: {formatPeso(Number(task.price))}
            </Text>
          </View>
        ) : null}

        <View style={styles.profileCard}>
          <UserAvatar
            name={applicant.name}
            avatarUrl={applicant.avatar_url}
            size={56}
          />
          <Text style={styles.name}>{applicant.name}</Text>

          <View
            style={[
              styles.statusBadge,
              application.status === 'accepted' && styles.statusHired,
              application.status === 'declined' && styles.statusDeclined,
            ]}
          >
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.ratingText}>
                {applicant.average_rating.toFixed(1)}
              </Text>
            </View>
            <Text style={styles.reviewsText}>
              ({applicant.review_count} reviews)
            </Text>
          </View>

          <View style={styles.budgetPill}>
            <Text style={styles.budgetText}>Offer: {proposedBudget}</Text>
          </View>
        </View>

        {application.status === 'declined' && application.rejection_reason ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejection reason</Text>
            <Text style={styles.rejectionText}>{application.rejection_reason}</Text>
          </View>
        ) : null}

        {applicant.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{applicant.bio}</Text>
          </View>
        ) : null}

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{applicant.tasks_done}</Text>
            <Text style={styles.statLabel}>Tasks Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{applicant.success_rate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {formatPeso(applicant.total_earned)}
            </Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Message</Text>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              {application.message ?? 'No message provided.'}
            </Text>
          </View>
        </View>

        {canAct ? (
          <View style={styles.actionContainer}>
            <Pressable
              style={[
                styles.button,
                styles.hireButton,
                actionLoading && styles.buttonDisabled,
              ]}
              onPress={handleHire}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={colors.card} size="small" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.card}
                  />
                  <Text style={styles.hireButtonText}>Hire Applicant</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={[styles.button, styles.rejectButton]}
              onPress={() => setRejectModalVisible(true)}
              disabled={actionLoading}
            >
              <Ionicons name="close-circle" size={18} color={colors.error} />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.resolvedBanner}>
            <Ionicons name="information-circle" size={18} color={colors.textMuted} />
            <Text style={styles.resolvedText}>
              {application.status === 'accepted'
                ? 'This applicant has been hired.'
                : application.status === 'declined'
                  ? 'This application was declined.'
                  : `This task is ${formatTaskStatusLabel('occupied')} — no further actions.`}
            </Text>
          </View>
        )}
      </ScrollView>

      <RejectReasonModal
        visible={rejectModalVisible}
        applicantName={applicant?.name ?? ''}
        loading={actionLoading}
        onClose={() => {
          if (!actionLoading) setRejectModalVisible(false);
        }}
        onSubmit={submitReject}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  errorText: { textAlign: 'center', marginTop: 40, color: colors.textMuted },
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
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16 },
  taskBanner: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskBannerLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  taskBannerTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  taskBannerBudget: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
  },
  statusHired: { backgroundColor: '#EDE9FE' },
  statusDeclined: { backgroundColor: '#FEF2F2' },
  statusBadgeText: { fontSize: 12, fontWeight: '700', color: colors.text },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: { fontSize: 14, fontWeight: '700', color: colors.text },
  reviewsText: { fontSize: 12, color: colors.textMuted },
  budgetPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  budgetText: { fontSize: 16, fontWeight: '700', color: colors.card },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  bioText: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  rejectionText: { fontSize: 13, color: colors.error, lineHeight: 20 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  messageBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: { fontSize: 13, color: colors.textMuted, lineHeight: 20 },
  actionContainer: { gap: 12, marginBottom: 24 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  hireButton: { backgroundColor: colors.primary },
  hireButtonText: { fontSize: 14, fontWeight: '700', color: colors.card },
  rejectButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.error,
  },
  rejectButtonText: { fontSize: 14, fontWeight: '700', color: colors.error },
  buttonDisabled: { opacity: 0.6 },
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 14,
    backgroundColor: colors.tabBg,
    borderRadius: 10,
    marginBottom: 24,
  },
  resolvedText: { flex: 1, fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
