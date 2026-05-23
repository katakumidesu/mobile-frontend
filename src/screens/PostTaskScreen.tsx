import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { createTask } from '../api/tasks';

export function PostTaskScreen() {
  const navigation = useNavigation<any>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
      await createTask({
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        location: isRemote ? 'Remote' : (location.trim() || 'Not specified'),
        category: category || null,
        deadline: deadline.trim() || null,
      });

      Alert.alert('Success', 'Task posted successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setTitle('');
            setDescription('');
            setCategory('');
            setBudget('');
            setLocation('');
            setIsRemote(false);
            setDeadline('');
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to post task.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Cleaning',
    'Delivery',
    'Moving',
    'Tech Support',
    'Writing',
    'Design',
    'Other',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Post a Task</Text>
          <Text style={styles.subtitle}>
            Describe what you need help with and set your budget
          </Text>
        </View>

        {/* Task Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Task Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Help with house cleaning"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Provide details about your task..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor={colors.textLight}
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
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

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.label}>Budget (₱) *</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            value={budget}
            onChangeText={setBudget}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.locationHeader}>
            <Text style={styles.label}>Location *</Text>
            <View style={styles.remoteToggle}>
              <Text style={styles.remoteLabel}>Remote</Text>
              <Switch
                value={isRemote}
                onValueChange={setIsRemote}
                trackColor={{
                  false: colors.border,
                  true: colors.primary,
                }}
                thumbColor={colors.card}
              />
            </View>
          </View>
          {!isRemote && (
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={colors.textLight}
            />
          )}
          <Text style={styles.helperText}>
            {isRemote ? 'This task can be done from anywhere' : 'Specify where the task needs to be done'}
          </Text>
        </View>

        {/* Deadline */}
        <View style={styles.section}>
          <Text style={styles.label}>Deadline</Text>
          <TextInput
            style={styles.input}
            placeholder="Select a deadline"
            value={deadline}
            onChangeText={setDeadline}
            placeholderTextColor={colors.textLight}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Post Task</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.card} />
            </>
          )}
        </Pressable>

        <View style={styles.spacer} />
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
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
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
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    minWidth: 72,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  categoryItemTextActive: {
    color: colors.card,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  remoteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remoteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  helperText: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  spacer: {
    height: 24,
  },
});
