import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface NotificationItem {
  id: string;
  type: 'order' | 'promo' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const notifications: NotificationItem[] = [
  { id: '1', type: 'order', title: 'Order Delivered', message: 'Your order #ORD-001 has been delivered successfully.', time: '5 min ago', read: false },
  { id: '2', type: 'order', title: 'Driver Assigned', message: 'John has been assigned to your order.', time: '30 min ago', read: false },
  { id: '3', type: 'promo', title: '50% Off First Order', message: 'Use code FIRST50 on your next order.', time: '2 hours ago', read: true },
  { id: '4', type: 'system', title: 'Welcome to Piki Food', message: 'Thank you for joining! Enjoy your first meal.', time: '1 day ago', read: true },
  { id: '5', type: 'order', title: 'Order Confirmed', message: 'Your order from Mama\u2019s Kitchen has been confirmed.', time: '2 days ago', read: true },
];

const typeIcons: Record<string, string> = {
  order: 'food',
  promo: 'sale',
  system: 'information',
};

const typeColors: Record<string, string> = {
  order: Colors.light.primary,
  promo: Colors.light['secondary-container'],
  system: Colors.light['on-surface-variant'],
};

export default function NotificationsScreen() {
  const theme = 'light';
  const [items] = useState(notifications);
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: Colors[theme].error }]}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off-outline" size={48} color={Colors[theme]['surface-variant']} />
            <Text style={[styles.emptyText, { color: Colors[theme]['on-surface-variant'] }]}>No notifications yet</Text>
          </View>
        ) : (
          items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.notifCard, { backgroundColor: item.read ? Colors[theme]['surface-container-lowest'] : Colors[theme]['surface-container'] }]}
              activeOpacity={0.7}
            >
              <View style={[styles.notifIcon, { backgroundColor: typeColors[item.type] + '20' }]}>
                <MaterialCommunityIcons name={typeIcons[item.type] as any} size={22} color={typeColors[item.type]} />
              </View>
              <View style={styles.notifInfo}>
                <View style={styles.notifTitleRow}>
                  <Text style={[styles.notifTitle, { color: Colors[theme]['on-surface'] }]}>{item.title}</Text>
                  {!item.read && <View style={[styles.unreadDot, { backgroundColor: Colors[theme].primary }]} />}
                </View>
                <Text style={[styles.notifMessage, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={[styles.notifTime, { color: Colors[theme]['surface-variant'] }]}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'], paddingTop: 56, paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: { ...Typography.h2 },
  unreadBadge: {
    minWidth: 24, height: 24, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  unreadBadgeText: { ...Typography['label-sm'], color: '#ffffff', fontWeight: '700' },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100, gap: Spacing.md },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: Spacing.md },
  emptyText: { ...Typography['body-md'] },
  notifCard: {
    flexDirection: 'row', gap: Spacing.md,
    borderRadius: BorderRadius.xl, padding: Spacing.md, ...Shadows.sm,
  },
  notifIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  notifInfo: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  notifTitle: { ...Typography['label-md'], fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifMessage: { ...Typography['body-sm'], marginTop: 2 },
  notifTime: { ...Typography['label-sm'], marginTop: 4 },
});
