import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export function ManageTaskScreen() {
  const navigation = useNavigation<any>();
  const [status, setStatus] = useState<'in_progress' | 'completed'>('in_progress');

  const handleCompleteTask = () => {
    Alert.alert(
      'Complete Task',
      'Are you sure you want to mark this task as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            setStatus('completed');
            Alert.alert(
              'Task Completed!',
              'Task marked as completed. Would you like to leave a review for the helper now?',
              [
                { text: 'Later', style: 'cancel' },
                {
                  text: 'Leave a Review',
                  onPress: () => {
                    // Navigate to Ratings screen
                    navigation.navigate('Ratings');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Manage Task</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Task Status */}
        <View style={styles.statusSection}>
          <View style={[
            styles.statusBadge,
            status === 'completed' && styles.statusBadgeCompleted
          ]}>
            <Text style={styles.statusBadgeText}>
              {status === 'in_progress' ? 'In Progress' : 'Completed'}
            </Text>
          </View>
          <Text style={styles.taskTitle}>House Cleaning Service</Text>
          <Text style={styles.taskPrice}>₱50</Text>
        </View>

        {/* Task Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={18} color={colors.textMuted} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Posted</Text>
              <Text style={styles.detailValue}>May 20, 2024</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="hourglass" size={18} color={colors.textMuted} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Deadline</Text>
              <Text style={styles.detailValue}>May 25, 2024</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="people" size={18} color={colors.textMuted} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Applications</Text>
              <Text style={styles.detailValue}>3 submissions</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            Looking for someone to help clean my house. Main areas: kitchen,
            living room, and 2 bathrooms.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {status === 'in_progress' ? (
            <>
              <Pressable style={[styles.button, styles.primaryButton]} onPress={handleCompleteTask}>
                <Ionicons name="checkmark-circle" size={18} color={colors.card} />
                <Text style={styles.buttonText}>Complete Task</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.secondaryButton]}
                onPress={() => navigation.navigate('TaskApplications', { taskId: 1 })}
              >
                <Ionicons name="people" size={18} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>View Applications</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={[styles.button, styles.primaryButton]} onPress={() => navigation.navigate('Ratings')}>
              <Ionicons name="star" size={18} color={colors.card} />
              <Text style={styles.buttonText}>Rate Helper / Write Review</Text>
            </Pressable>
          )}

          <Pressable style={[styles.button, styles.secondaryButton]}>
            <Ionicons name="pencil" size={18} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Edit Task</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.dangerButton]}>
            <Ionicons name="trash" size={18} color={colors.error} />
            <Text style={styles.dangerButtonText}>Delete Task</Text>
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
  statusBadgeCompleted: {
    backgroundColor: colors.success,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.card,
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
  detailsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
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
  primaryButton: {
    backgroundColor: colors.primary,
  },
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
});
