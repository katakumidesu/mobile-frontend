import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fetchTaskDetail, updateTask } from '../api/tasks';
import { PERMISSION_MESSAGES } from '../utils/taskPermissions';

import { TASK_CATEGORIES } from '../constants/taskCategories';

const CATEGORIES = [...TASK_CATEGORIES];

export function EditTaskScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const taskId = route.params?.taskId as number;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadTask = useCallback(() => {
    if (!taskId) {
      Alert.alert('Error', 'No task selected to edit.');
      navigation.goBack();
      return;
    }

    setInitialLoading(true);
    fetchTaskDetail(taskId)
      .then(({ task, permissions }) => {
        if (!permissions.is_owner) {
          Alert.alert('Access denied', PERMISSION_MESSAGES.notOwner, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }
        if (!permissions.can_edit) {
          Alert.alert(
            'Not allowed',
            'This task can no longer be edited while in progress.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
          return;
        }

        setTitle(task.title);
        setDescription(task.description);
        setCategory(task.category ?? '');
        setBudget(String(Number(task.price)));
        const remote = task.location === 'Remote';
        setIsRemote(remote);
        setLocation(remote ? '' : task.location);
        setDeadline(task.deadline ? task.deadline.slice(0, 10) : '');
      })
      .catch((e: Error) => {
        Alert.alert('Error', e.message);
        navigation.goBack();
      })
      .finally(() => setInitialLoading(false));
  }, [taskId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadTask();
    }, [loadTask]),
  );

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !budget.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(budget);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid budget greater than 0.');
      return;
    }

    setLoading(true);
    try {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        location: isRemote ? 'Remote' : location.trim() || 'Not specified',
        category: category || null,
        deadline: deadline.trim() || null,
      });

      Alert.alert('Saved', 'Your task was updated successfully.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.navigate('Post', {
              screen: 'ManageTask',
              params: { taskId },
            }),
        },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update task.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={styles.subtitle}>
          Update your published task. Changes apply only to this task.
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryItem,
                  category === cat && styles.categoryItemActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryItemText,
                    category === cat && styles.categoryItemTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Budget (₱) *</Text>
          <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.locationHeader}>
            <Text style={styles.label}>Location *</Text>
            <View style={styles.remoteToggle}>
              <Text style={styles.remoteLabel}>Remote</Text>
              <Switch
                value={isRemote}
                onValueChange={setIsRemote}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>
          </View>
          {!isRemote && (
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={colors.textLight}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Deadline</Text>
          <TextInput
            style={styles.input}
            value={deadline}
            onChangeText={setDeadline}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textLight}
          />
        </View>

        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, justifyContent: 'center' },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  placeholder: { width: 40 },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
  },
  section: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  textArea: { minHeight: 100, paddingTop: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryItem: {
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  categoryItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryItemText: { fontSize: 13, fontWeight: '600', color: colors.text },
  categoryItemTextActive: { color: colors.card },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  remoteToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  remoteLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: colors.card },
});
