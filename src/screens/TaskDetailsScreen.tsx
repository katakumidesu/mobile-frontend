import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

export function TaskDetailsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Task Image/Icon */}
        <View style={styles.imageContainer}>
          <Text style={styles.largeEmoji}>🏠</Text>
        </View>

        {/* Task Info */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>House Cleaning Service</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.rating}>4.8 (24 reviews)</Text>
            <Text style={styles.location}>• 5km away</Text>
          </View>

          {/* Price and Budget */}
          <View style={styles.priceSection}>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Budget</Text>
              <Text style={styles.priceValue}>₱50</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Duration</Text>
              <Text style={styles.priceValue}>2-3 hours</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>Deadline</Text>
              <Text style={styles.priceValue}>5 days</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              Looking for someone to help clean my house. Main areas: kitchen,
              living room, and 2 bathrooms. Please bring your own cleaning supplies.
            </Text>
          </View>

          {/* Poster Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posted by</Text>
            <View style={styles.posterCard}>
              <Text style={styles.posterAvatar}>👤</Text>
              <View style={styles.posterInfo}>
                <Text style={styles.posterName}>John Doe</Text>
                <Text style={styles.posterMeta}>24 tasks posted • 4.9★</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <Pressable 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('ApplyTask', { taskId: 1 })}
          >
            <Text style={styles.buttonText}>Apply Now</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.secondaryButton]}>
            <Ionicons name="heart-outline" size={18} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Save Task</Text>
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
  imageContainer: {
    height: 200,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  largeEmoji: {
    fontSize: 80,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  location: {
    fontSize: 13,
    color: colors.textMuted,
  },
  priceSection: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 20,
  },
  priceBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    marginBottom: 20,
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
  posterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  posterAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  posterInfo: {
    flex: 1,
  },
  posterName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  posterMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
