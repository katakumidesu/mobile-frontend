import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fetchTaskApplications, TaskApplication } from '../api/applications';
import { UserAvatar } from '../components/UserAvatar';
import { formatPeso } from '../utils/currency';

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function TaskApplicationsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const taskId = route.params?.taskId as number;
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    fetchTaskApplications(taskId)
      .then(setApplications)
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [taskId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>
          Applicants ({applications.length})
        </Text>
        <View style={styles.placeholder} />
      </View>

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
          renderItem={({ item }) => (
            <Pressable style={styles.applicantCard}>
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
                <View style={styles.budgetPill}>
                  <Text style={styles.budgetText}>
                    {formatPeso(
                      Number(item.proposed_price ?? 0),
                    )}
                  </Text>
                </View>
              </View>

              <Text style={styles.message} numberOfLines={2}>
                {item.message ?? 'No message provided.'}
              </Text>
              <Text style={styles.time}>{timeAgo(item.created_at)}</Text>

              <View style={styles.actionContainer}>
                <Pressable
                  style={[styles.actionPill, styles.hirePill]}
                  onPress={() =>
                    navigation.navigate('ApplicantDetail', {
                      applicantId: item.id,
                    })
                  }
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.card}
                  />
                  <Text style={styles.hirePillText}>View & Hire</Text>
                </Pressable>
                <Pressable style={[styles.actionPill, styles.rejectPill]}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={colors.error}
                  />
                  <Text style={styles.rejectPillText}>Reject</Text>
                </Pressable>
              </View>
            </Pressable>
          )}
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
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
    alignItems: 'center',
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  applicantInfo: {
    flex: 1,
  },
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
  budgetPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.card,
  },
  message: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  time: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
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
  hirePill: {
    backgroundColor: colors.primary,
  },
  hirePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
  },
  rejectPill: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  rejectPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
  },
});
