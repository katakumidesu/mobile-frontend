import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { fetchTaskDetail } from '../api/tasks';
import { applyToTask } from '../api/applications';
import { fetchProfile } from '../api/profile';
import { PERMISSION_MESSAGES } from '../utils/taskPermissions';
import { formatPeso } from '../utils/currency';
import { UserAvatar } from '../components/UserAvatar';

export function ApplyTaskScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const taskId = route.params?.taskId as number;
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskBudget, setTaskBudget] = useState('');
  const [posterName, setPosterName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    Promise.all([fetchTaskDetail(taskId), fetchProfile()])
      .then(([{ task, permissions }, profile]) => {
        if (permissions.is_owner) {
          Alert.alert('Not allowed', PERMISSION_MESSAGES.cannotApplyOwn, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }
        if (!permissions.can_apply) {
          Alert.alert(
            'Not available',
            'This task is no longer accepting applications.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
          return;
        }
        setTaskTitle(task.title);
        setTaskBudget(formatPeso(Number(task.price)));
        setBidAmount(String(Number(task.price)));
        setPosterName(task.user?.name ?? 'the poster');
        setProfileName(profile.name);
        setProfileAvatar(profile.avatar_url);
      })
      .catch((e: Error) => {
        Alert.alert('Error', e.message);
        navigation.goBack();
      })
      .finally(() => setInitialLoading(false));
  }, [taskId, navigation]);

  const handleSubmit = async () => {
    if (!bidAmount.trim() || !coverLetter.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    const proposed = parseFloat(bidAmount);
    if (isNaN(proposed) || proposed <= 0) {
      Alert.alert('Error', 'Enter a valid bid amount.');
      return;
    }

    setLoading(true);
    try {
      const result = await applyToTask(taskId, {
        message: coverLetter.trim(),
        proposed_price: proposed,
      });
      Alert.alert('Success', result.message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Apply for Task</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            {PERMISSION_MESSAGES.applyPrompt(posterName)}
          </Text>
        </View>

        <View style={styles.taskInfoSection}>
          <Text style={styles.emoji}>📝</Text>
          <Text style={styles.taskTitle}>{taskTitle}</Text>
          <Text style={styles.budget}>Budget: {taskBudget}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Bid (₱)</Text>
          <View style={styles.bidContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.currencySymbol}>₱</Text>
              <TextInput
                style={styles.bidInput}
                placeholder="Enter your bid"
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Explain why you're the right person for this task..."
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            numberOfLines={5}
            placeholderTextColor={colors.textLight}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <View style={styles.profilePreview}>
            <UserAvatar name={profileName} avatarUrl={profileAvatar} size={40} />
            <Text style={styles.profileName}>{profileName}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <Ionicons name="send" size={18} color={colors.card} />
                <Text style={styles.submitButtonText}>Submit Application</Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
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
  infoBanner: {
    margin: 16,
    padding: 12,
    backgroundColor: '#E6FFFA',
    borderRadius: 10,
  },
  infoBannerText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  taskInfoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  budget: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
  },
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  bidContainer: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 4,
  },
  bidInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    color: colors.text,
  },
  textArea: { minHeight: 120, paddingTop: 12 },
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
