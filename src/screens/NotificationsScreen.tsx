import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../api/notifications';
import { navigateFromNotification } from '../navigation/notificationNavigation';

function notificationIcon(type: string): React.ComponentProps<typeof Ionicons>['name'] {
  switch (type) {
    case 'application_hired':
      return 'ribbon';
    case 'application_rejected':
      return 'close-circle';
    case 'application_submitted':
      return 'person-add';
    case 'task_completed':
      return 'checkmark-done';
    default:
      return 'notifications';
  }
}

export function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    fetchNotifications()
      .then((res) => setItems(res.notifications))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePress = async (item: AppNotification) => {
    if (!item.read_at) {
      await markNotificationRead(item.id);
    }
    navigateFromNotification(navigation, item);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <Pressable
          style={styles.action}
          onPress={async () => {
            await markAllNotificationsRead();
            load();
          }}
        >
          <Text style={styles.actionText}>Mark all read</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => String(n.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No notifications yet.</Text>
          }
          renderItem={({ item }) => {
            const unread = !item.read_at;
            const tappable =
              item.type === 'application_submitted' ||
              item.type === 'application_hired' ||
              item.type === 'application_rejected' ||
              item.type === 'task_completed';

            return (
              <Pressable
                style={[styles.card, unread && styles.cardUnread]}
                onPress={() => {
                  if (tappable) {
                    handlePress(item);
                  } else if (unread) {
                    markNotificationRead(item.id).then(load);
                  }
                }}
              >
                <View style={styles.row}>
                  <Ionicons
                    name={notificationIcon(item.type)}
                    size={18}
                    color={unread ? colors.primary : colors.textMuted}
                  />
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {tappable ? (
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.textLight}
                    />
                  ) : null}
                </View>
                {item.body ? (
                  <Text style={styles.cardBody}>{item.body}</Text>
                ) : null}
                <Text style={styles.meta}>
                  {unread ? 'Unread' : 'Read'}
                  {tappable ? ' · Tap to view details' : ''}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  action: { padding: 8 },
  actionText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  loader: { marginTop: 40 },
  list: { paddingHorizontal: 16, paddingVertical: 16 },
  empty: { textAlign: 'center', marginTop: 24, color: colors.textMuted },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 10,
  },
  cardUnread: { borderColor: colors.primaryLight },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.text },
  cardBody: { marginTop: 6, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  meta: { marginTop: 8, fontSize: 11, color: colors.textLight },
});
