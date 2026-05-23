import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export function ApplyTaskScreen() {
  const navigation = useNavigation();
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!bidAmount.trim() || !coverLetter.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      // API call will be made here
      console.log({ bidAmount, coverLetter });
      Alert.alert('Success', 'Your application was submitted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Apply for Task</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Task Info */}
        <View style={styles.taskInfoSection}>
          <Text style={styles.emoji}>🏠</Text>
          <Text style={styles.taskTitle}>House Cleaning Service</Text>
          <Text style={styles.budget}>Budget: ₱50</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.rating}>4.8 (24 reviews)</Text>
          </View>
        </View>

        {/* Your Bid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Bid</Text>
          <View style={styles.bidContainer}>
            <Text style={styles.bidLabel}>Suggested: ₱50</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.currencySymbol}>₱</Text>
              <TextInput
                style={styles.bidInput}
                placeholder="Enter your bid amount"
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>
        </View>

        {/* Cover Letter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Letter</Text>
          <Text style={styles.helperText}>
            Tell the employer why you're the right person for this task
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="I have 2 years of experience in professional house cleaning..."
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
            numberOfLines={5}
            placeholderTextColor={colors.textLight}
            textAlignVertical="top"
          />
        </View>

        {/* Your Profile Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <View style={styles.profilePreview}>
            <Text style={styles.profileAvatar}>👤</Text>
            <View style={styles.profileContent}>
              <Text style={styles.profileName}>Your Name</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={colors.warning} />
                <Text style={styles.profileRating}>4.9 (145 reviews)</Text>
              </View>
              <Text style={styles.profileMeta}>312 tasks completed</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  taskInfoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  rating: {
    fontSize: 12,
    color: colors.text,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  bidContainer: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bidLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
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
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  profileContent: {
    flex: 1,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  profileRating: {
    fontSize: 11,
    color: colors.text,
  },
  profileMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
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
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
