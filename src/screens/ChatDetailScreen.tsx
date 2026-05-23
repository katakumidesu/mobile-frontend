import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

const mockMessages = [
  { id: 1, text: 'Hi, are you available for the task?', user: 'other', time: '2:30 PM' },
  { id: 2, text: 'Yes, I am! When do you need it done?', user: 'me', time: '2:35 PM' },
  { id: 3, text: 'This weekend would be ideal', user: 'other', time: '2:40 PM' },
  { id: 4, text: 'Perfect! I can do that.', user: 'me', time: '2:42 PM' },
];

export function ChatDetailScreen() {
  const navigation = useNavigation();
  const [messageText, setMessageText] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>John Doe</Text>
          <Text style={styles.headerSubtitle}>Active now</Text>
        </View>
        <Ionicons name="call" size={20} color={colors.primary} />
      </View>

      {/* Messages */}
      <FlatList
        data={mockMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageRow,
              item.user === 'me' && styles.messageRowMe,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                item.user === 'me' && styles.messageBubbleMe,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.user === 'me' && styles.messageTextMe,
                ]}
              >
                {item.text}
              </Text>
            </View>
            <Text style={styles.messageTime}>{item.time}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContent}
        scrollEnabled={true}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          placeholderTextColor={colors.textLight}
          multiline
        />
        <Pressable style={styles.sendButton}>
          <Ionicons name="send" size={18} color={colors.card} />
        </Pressable>
      </View>
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
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageRow: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageRowMe: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageBubbleMe: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  messageText: {
    fontSize: 13,
    color: colors.text,
  },
  messageTextMe: {
    color: colors.card,
  },
  messageTime: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 13,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
