import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { deleteTask, fetchTaskDetail } from '../api/tasks';
import type { Task } from '../api/tasks';
import type { TaskPermissions } from '../utils/taskPermissions';
import { PERMISSION_MESSAGES } from '../utils/taskPermissions';
import { formatPeso } from '../utils/currency';
import { openEditTaskForm } from '../navigation/taskNavigation';

export function ManageTaskScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const taskId = route.params?.taskId as number;
  const [task, setTask] = useState<Task | null>(null);
  const [permissions, setPermissions] = useState<TaskPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTask = useCallback(() => {
    if (!taskId) return;
    setLoading(true);
    fetchTaskDetail(taskId)
      .then(({ task: t, permissions: p }) => {
        if (!p.is_owner) {
          Alert.alert('Access denied', PERMISSION_MESSAGES.notOwner, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }
        setTask(t);
        setPermissions(p);
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

  const handleDelete = () => {
    if (!task || !permissions?.can_delete) {
      Alert.alert(
        'Not allowed',
        permissions?.is_owner
          ? 'This task cannot be deleted while in progress.'
          : PERMISSION_MESSAGES.notOwner,
      );
      return;
    }

    Alert.alert(
      'Delete Task',
      'Are you sure? This will permanently remove the task.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              Alert.alert('Deleted', 'Task removed successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ],
    );
  };

  const handleCompleteTask = () => {
    navigation.navigate('CompleteTask', { taskId: task!.id });
  };

  if (loading || !task || !permissions) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const locked = !permissions.can_edit;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Manage Task</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.ownerBanner}>
          <Text style={styles.ownerBannerText}>{PERMISSION_MESSAGES.ownerPrompt}</Text>
        </View>

        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              task.status === 'completed' && styles.statusBadgeCompleted,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {task.status === 'in_progress' ? 'occupied' : task.status.replace('_', ' ')}
            </Text>
          </View>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskPrice}>{formatPeso(Number(task.price))}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {(task.status === 'occupied' || task.status === 'in_progress') &&
            permissions.can_complete && (
            <>
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={handleCompleteTask}
              >
                <Ionicons name="checkmark-circle" size={18} color={colors.card} />
                <Text style={styles.buttonText}>Complete Task</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={() =>
                  navigation.navigate('TaskApplications', { taskId: task.id })
                }
              >
                <Ionicons name="people" size={18} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>View Applications</Text>
              </Pressable>
            </>
          )}

          {task.status === 'open' && (
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={() =>
                navigation.navigate('TaskApplications', { taskId: task.id })
              }
            >
              <Ionicons name="people" size={18} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>View Applications</Text>
            </Pressable>
          )}

          {permissions.can_edit && (
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={() => openEditTaskForm(navigation, task.id)}
            >
              <Ionicons name="pencil" size={18} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Edit Task</Text>
            </Pressable>
          )}

          {locked && (
            <Text style={styles.lockedHint}>
              Editing is locked while this task is in progress.
            </Text>
          )}

          {permissions.can_delete && (
            <Pressable
              style={[styles.button, styles.dangerButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={18} color={colors.error} />
              <Text style={styles.dangerButtonText}>Delete Task</Text>
            </Pressable>
          )}
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: { width: 40 },
  ownerBanner: {
    margin: 16,
    padding: 12,
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
  },
  ownerBannerText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  statusSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusBadgeCompleted: { backgroundColor: colors.success },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.card,
    textTransform: 'capitalize',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  taskPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
  },
  section: { paddingHorizontal: 16, paddingVertical: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  primaryButton: { backgroundColor: colors.primary },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
  },
  lockedHint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
