import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { fetchTasks, Task } from '../api/tasks';
import {
  fetchDashboardStats,
  fetchRecentApplicants,
  RecentApplicant,
  DashboardStats,
} from '../api/dashboard';
import { UserAvatar } from '../components/UserAvatar';

export function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const firstName = user?.name?.split(' ')[0] ?? 'Guest';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applicants, setApplicants] = useState<RecentApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [applicantsLoading, setApplicantsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTasks({ mine: true }).then((res) => setTasks(res.data.slice(0, 3))),
      fetchDashboardStats().then(setStats),
      fetchRecentApplicants().then(setApplicants),
    ])
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setApplicantsLoading(false);
      });
  }, []);

  const firstApplicantTaskId = applicants[0]?.task_id;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <View style={styles.profileIcon}>
            <Ionicons name="person-circle" size={48} color={colors.primary} />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statPrimary]}>
            <Ionicons name="briefcase" size={24} color={colors.card} />
            <Text style={styles.statValue}>{stats?.tasks_posted ?? 0}</Text>
            <Text style={styles.statLabel}>Tasks Posted</Text>
          </View>
          <View style={[styles.statCard, styles.statSecondary]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.card} />
            <Text style={styles.statValue}>{stats?.tasks_completed ?? 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, styles.statSuccess]}>
            <Ionicons name="star" size={24} color={colors.card} />
            <Text style={styles.statValue}>
              {stats ? stats.average_rating.toFixed(1) : '0.0'}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        <View style={styles.actionContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionPrimary,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Post')}
          >
            <Ionicons name="add-circle" size={32} color={colors.card} />
            <Text style={styles.actionTitle}>Post a Task</Text>
            <Text style={styles.actionSubtitle}>Hire someone to help</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionSecondary,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Browse')}
          >
            <Ionicons name="search" size={32} color={colors.card} />
            <Text style={styles.actionTitle}>Find a Task</Text>
            <Text style={styles.actionSubtitle}>Earn money completing tasks</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Recent Tasks</Text>

        <View style={styles.taskList}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : tasks.length === 0 ? (
            <Text style={styles.emptyText}>No recent tasks found.</Text>
          ) : (
            tasks.map((task) => (
              <Pressable
                key={task.id}
                style={styles.taskItem}
                onPress={() =>
                  navigation.navigate('TaskDetails', { taskId: task.id })
                }
              >
                <View style={styles.taskIcon}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskStatus}>
                    {task.status === 'open' ? 'Open' : task.status}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textLight}
                />
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.applicantsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Applicants</Text>
            {firstApplicantTaskId != null && (
              <Pressable
                onPress={() =>
                  navigation.navigate('Post', {
                    screen: 'TaskApplications',
                    params: { taskId: firstApplicantTaskId },
                  })
                }
              >
                <Text style={styles.viewAllLink}>View All</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.applicantsList}>
            {applicantsLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : applicants.length === 0 ? (
              <Text style={styles.emptyText}>No applicants yet.</Text>
            ) : (
              applicants.map((applicant) => (
                <Pressable
                  key={applicant.application_id}
                  style={styles.applicantItem}
                  onPress={() =>
                    navigation.navigate('WorkerProfile', {
                      workerId: applicant.worker_id,
                    })
                  }
                >
                  <UserAvatar
                    name={applicant.name}
                    avatarUrl={applicant.avatar_url}
                    size={40}
                  />
                  <View style={styles.applicantContent}>
                    <Text style={styles.applicantName}>{applicant.name}</Text>
                    {applicant.task_title ? (
                      <Text style={styles.applicantTask} numberOfLines={1}>
                        {applicant.task_title}
                      </Text>
                    ) : null}
                    <View style={styles.applicantRating}>
                      <Ionicons
                        name="star"
                        size={11}
                        color={colors.warning}
                      />
                      <Text style={styles.applicantRatingText}>
                        {applicant.average_rating.toFixed(1)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.textLight}
                  />
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  profileIcon: {
    borderRadius: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  statPrimary: {
    backgroundColor: colors.primary,
  },
  statSecondary: {
    backgroundColor: colors.secondary,
  },
  statSuccess: {
    backgroundColor: colors.success,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.card,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: colors.card,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  actionContainer: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: colors.primary,
  },
  actionSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    marginTop: 12,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.card,
    marginTop: 4,
    opacity: 0.9,
  },
  taskList: {
    gap: 12,
    marginBottom: 24,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  taskStatus: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
  },
  applicantsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  applicantsList: {
    gap: 12,
  },
  applicantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  applicantContent: {
    flex: 1,
  },
  applicantName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  applicantTask: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  applicantRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  applicantRatingText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 12,
    marginBottom: 12,
  },
});
