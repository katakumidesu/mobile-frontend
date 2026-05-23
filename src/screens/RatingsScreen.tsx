import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={colors.warning}
        />
      ))}
    </View>
  );
}

export function RatingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<
    {
      id: number;
      author: string;
      rating: number;
      text: string;
      date: string;
      avatar: string;
    }[]
  >([]);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  const handleAddReview = () => {
    if (!newReviewText.trim()) {
      Alert.alert('Error', 'Please enter your review text.');
      return;
    }
    const newReview = {
      id: Date.now(),
      author: user ? `${user.name} (You)` : 'You',
      rating: newRating,
      text: newReviewText.trim(),
      date: 'Just now',
      avatar: '👤',
    };
    setReviews([newReview, ...reviews]);
    setNewReviewText('');
    setNewRating(5);
    Alert.alert('Success', 'Thank you for your feedback!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Ratings & Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Overall Rating */}
        <View style={styles.overallSection}>
          <Text style={styles.overallRating}>4.8</Text>
          <StarRating rating={5} />
          <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
        </View>

        {/* Leave a Review Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Leave a Review</Text>
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Rating</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((stars) => (
                <Pressable key={stars} onPress={() => setNewRating(stars)}>
                  <Ionicons
                    name={stars <= newRating ? 'star' : 'star-outline'}
                    size={28}
                    color={colors.warning}
                    style={styles.selectorStar}
                  />
                </Pressable>
              ))}
            </View>
            <Text style={styles.formLabel}>Review Comments</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe your experience with the helper..."
              value={newReviewText}
              onChangeText={setNewReviewText}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.textLight}
            />
            <Pressable style={styles.submitBtn} onPress={handleAddReview}>
              <Text style={styles.submitBtnText}>Submit Review</Text>
            </Pressable>
          </View>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{review.avatar} {review.author}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <StarRating rating={review.rating} />
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  overallSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  overallRating: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 8,
  },
  reviewCount: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  formSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  ratingSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  selectorStar: {
    padding: 2,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  reviewDate: {
    fontSize: 11,
    color: colors.textLight,
  },
  reviewText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
});
