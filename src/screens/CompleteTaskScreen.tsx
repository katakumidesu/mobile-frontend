import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { completeTask, fetchTaskDetail } from '../api/tasks';
import type { HiredWorker } from '../api/tasks';
import { UserAvatar } from '../components/UserAvatar';
import { formatPeso } from '../utils/currency';

function StarPicker({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (n: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} onPress={() => onChange(n)} hitSlop={8}>
          <Ionicons
            name={n <= rating ? 'star' : 'star-outline'}
            size={36}
            color={colors.warning}
          />
        </Pressable>
      ))}
    </View>
  );
}

export function CompleteTaskScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const taskId = route.params?.taskId as number;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPrice, setTaskPrice] = useState('');
  const [hiredWorker, setHiredWorker] = useState<HiredWorker | null>(null);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const load = useCallback(() => {
    if (!taskId) return;
    setLoading(true);
    fetchTaskDetail(taskId)
      .then(({ task, hired_worker, permissions }) => {
        if (!permissions.can_complete) {
          Alert.alert(
            'Not available',
            'This task cannot be completed right now.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
          return;
        }
        setTaskTitle(task.title);
        setTaskPrice(formatPeso(Number(task.price)));
        setHiredWorker(hired_worker ?? null);
      })
      .catch((e: Error) => {
        Alert.alert('Error', e.message);
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [taskId, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleSubmit = async () => {
    const comment = message.trim();
    if (rating < 1 || rating > 5) {
      Alert.alert('Rating required', 'Please select a star rating from 1 to 5.');
      return;
    }
    if (comment.length < 3) {
      Alert.alert('Message required', 'Please write at least a few words about the worker.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await completeTask(taskId, { rating, comment });
      Alert.alert('Task completed', res.message, [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  const worker = hiredWorker?.user;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Complete Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.taskCard}>
          <Text style={styles.taskLabel}>Task</Text>
          <Text style={styles.taskTitle}>{taskTitle}</Text>
          <Text style={styles.taskBudget}>Budget: {taskPrice}</Text>
        </View>

        {worker ? (
          <View style={styles.workerCard}>
            <Text style={styles.sectionTitle}>Rate your worker</Text>
            <UserAvatar
              name={worker.name}
              avatarUrl={worker.avatar_url}
              size={56}
            />
            <Text style={styles.workerName}>{worker.name}</Text>
            <View style={styles.workerMeta}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.workerMetaText}>
                {worker.average_rating.toFixed(1)} ({worker.review_count} reviews)
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noWorker}>
            No hired worker found. Hire someone before completing this task.
          </Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your rating *</Text>
          <StarPicker rating={rating} onChange={setRating} />
          <Text style={styles.ratingHint}>
            {rating === 5
              ? 'Excellent'
              : rating === 4
                ? 'Good'
                : rating === 3
                  ? 'Okay'
                  : rating === 2
                    ? 'Below average'
                    : 'Poor'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message to worker *</Text>
          <Text style={styles.helper}>
            Share how the work went. This will be visible on their profile.
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Great job, finished on time and exactly as described..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <Pressable
          style={[
            styles.submitButton,
            (!worker || submitting) && styles.submitDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!worker || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.card} />
              <Text style={styles.submitText}>Complete & Submit Review</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  placeholder: { width: 40 },
  scroll: { padding: 16, paddingBottom: 32 },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  taskBudget: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  workerCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  workerName: { fontSize: 18, fontWeight: '700', color: colors.text },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  workerMetaText: { fontSize: 12, color: colors.textMuted },
  noWorker: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  helper: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
    lineHeight: 18,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  ratingHint: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    fontSize: 14,
    color: colors.text,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontSize: 15, fontWeight: '700', color: colors.card },
});
