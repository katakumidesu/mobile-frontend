import React, { useCallback, useState } from 'react';
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
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
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
  const [proposedPrice, setProposedPrice] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskBudget, setTaskBudget] = useState('');
  const [posterName, setPosterName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [submittedBid, setSubmittedBid] = useState<string | null>(null);

  const loadScreen = useCallback(() => {
    if (!taskId) return;
    setInitialLoading(true);
    Promise.all([fetchTaskDetail(taskId), fetchProfile()])
      .then(([{ task, permissions, user_application, display_status }, profile]) => {
        if (permissions.is_owner) {
          Alert.alert('Not allowed', PERMISSION_MESSAGES.cannotApplyOwn, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }

        setTaskTitle(task.title);
        setTaskBudget(formatPeso(Number(task.price)));
        setPosterName(task.user?.name ?? 'the poster');
        setProfileName(profile.name);
        setProfileAvatar(profile.avatar_url);

        const appStatus = user_application?.status ?? permissions.application_status;
        setApplicationStatus(appStatus ?? null);
        setRejectionReason(user_application?.rejection_reason ?? null);

        if (
          display_status === 'hired' ||
          appStatus === 'accepted'
        ) {
          setAlreadyApplied(true);
          setSubmittedBid(
            formatPeso(Number(user_application?.proposed_price ?? task.price)),
          );
          setCoverLetter(user_application?.message ?? '');
          return;
        }

        if (display_status === 'declined' || appStatus === 'declined') {
          setAlreadyApplied(true);
          setSubmittedBid(
            formatPeso(Number(user_application?.proposed_price ?? task.price)),
          );
          setCoverLetter(user_application?.message ?? '');
          return;
        }

        if (permissions.has_applied || user_application) {
          setAlreadyApplied(true);
          setSubmittedBid(
            formatPeso(Number(user_application?.proposed_price ?? task.price)),
          );
          setCoverLetter(user_application?.message ?? '');
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

        setAlreadyApplied(false);
        setProposedPrice(String(Number(task.price)));
        setCoverLetter('');
      })
      .catch((e: Error) => {
        Alert.alert('Error', e.message);
        navigation.goBack();
      })
      .finally(() => setInitialLoading(false));
  }, [taskId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadScreen();
    }, [loadScreen]),
  );

  const handleSubmit = async () => {
    if (alreadyApplied) return;

    if (!proposedPrice.trim() || !coverLetter.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    const proposed = parseFloat(proposedPrice);
    if (isNaN(proposed) || proposed <= 0) {
      Alert.alert('Error', 'Enter a valid proposed price.');
      return;
    }

    setLoading(true);
    try {
      const result = await applyToTask(taskId, {
        message: coverLetter.trim(),
        proposed_price: proposed,
      });
      setAlreadyApplied(true);
      setSubmittedBid(formatPeso(proposed));
      Alert.alert('Application sent', result.message, [
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

        {alreadyApplied ? (
          applicationStatus === 'accepted' ? (
            <View style={styles.hiredBanner}>
              <Ionicons name="ribbon" size={22} color={colors.primary} />
              <View style={styles.appliedBannerText}>
                <Text style={styles.hiredTitle}>Hired!</Text>
                <Text style={styles.appliedSubtitle}>
                  You were hired for this task. Check Notifications for updates.
                </Text>
                {submittedBid ? (
                  <Text style={styles.appliedBid}>Your offer: {submittedBid}</Text>
                ) : null}
              </View>
            </View>
          ) : applicationStatus === 'declined' ? (
            <View style={styles.declinedBanner}>
              <Ionicons name="close-circle" size={22} color={colors.error} />
              <View style={styles.appliedBannerText}>
                <Text style={styles.declinedTitle}>Declined</Text>
                <Text style={styles.appliedSubtitle}>
                  {rejectionReason ?? 'Your application was not selected.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.appliedBanner}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <View style={styles.appliedBannerText}>
                <Text style={styles.appliedTitle}>Applied</Text>
                <Text style={styles.appliedSubtitle}>
                  Waiting for {posterName} to review your application.
                </Text>
                {submittedBid ? (
                  <Text style={styles.appliedBid}>Your offer: {submittedBid}</Text>
                ) : null}
              </View>
            </View>
          )
        ) : (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              {PERMISSION_MESSAGES.applyPrompt(posterName)}
            </Text>
          </View>
        )}

        <View style={styles.taskInfoSection}>
          <Text style={styles.emoji}>📝</Text>
          <Text style={styles.taskTitle}>{taskTitle}</Text>
          <Text style={styles.budget}>Poster&apos;s budget: {taskBudget}</Text>
        </View>

        {!alreadyApplied && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your proposed price (₱) *</Text>
              <Text style={styles.helperText}>
                This is the amount you want to be paid to complete the task. It can
                match the poster&apos;s budget or be your own offer.
              </Text>
              <View style={styles.bidContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.currencySymbol}>₱</Text>
                  <TextInput
                    style={styles.bidInput}
                    placeholder="Enter your price"
                    value={proposedPrice}
                    onChangeText={setProposedPrice}
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.textLight}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Message to poster *</Text>
              <Text style={styles.helperText}>
                Explain why you&apos;re a good fit and when you can do the work.
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="I can start tomorrow and have done similar tasks before..."
                value={coverLetter}
                onChangeText={setCoverLetter}
                multiline
                numberOfLines={5}
                placeholderTextColor={colors.textLight}
                textAlignVertical="top"
              />
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <View style={styles.profilePreview}>
            <UserAvatar name={profileName} avatarUrl={profileAvatar} size={40} />
            <Text style={styles.profileName}>{profileName}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {alreadyApplied ? (
            <Pressable style={styles.appliedButton} disabled>
              <Text style={styles.appliedButtonText}>
                {applicationStatus === 'accepted'
                  ? 'Hired — Task occupied'
                  : applicationStatus === 'declined'
                    ? 'Application declined'
                    : 'Applied — Waiting for confirmation'}
              </Text>
            </Pressable>
          ) : (
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
          )}
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Back</Text>
          </Pressable>
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
  infoBanner: {
    margin: 16,
    padding: 12,
    backgroundColor: '#E6FFFA',
    borderRadius: 10,
  },
  infoBannerText: { fontSize: 12, color: colors.text, lineHeight: 18 },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    margin: 16,
    padding: 14,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.success,
  },
  appliedBannerText: { flex: 1 },
  appliedTitle: { fontSize: 15, fontWeight: '700', color: colors.success },
  hiredBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    margin: 16,
    padding: 14,
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  hiredTitle: { fontSize: 15, fontWeight: '700', color: colors.primary },
  declinedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    margin: 16,
    padding: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
  },
  declinedTitle: { fontSize: 15, fontWeight: '700', color: colors.error },
  appliedSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  appliedBid: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 6 },
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
  taskTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  budget: { fontSize: 14, color: colors.primary, marginTop: 8, fontWeight: '600' },
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 10,
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
  profileName: { fontSize: 14, fontWeight: '600', color: colors.text },
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
  submitButtonText: { fontSize: 14, fontWeight: '700', color: colors.card },
  appliedButton: {
    backgroundColor: colors.tabBg,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  appliedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 13, fontWeight: '600', color: colors.text },
});
