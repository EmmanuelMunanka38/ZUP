import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { formatPrice } from '@/utils/format';

const menuItems = [
  { icon: 'home-map-marker', label: 'Saved Addresses', route: '/saved-addresses' },
  { icon: 'receipt', label: 'Order History', route: '/(tabs)/orders' },
  { icon: 'credit-card-outline', label: 'Payment Methods', route: '/saved-addresses' },
  { icon: 'bell-outline', label: 'Notifications', route: '' },
  { icon: 'weather-night', label: 'Dark Mode', hasToggle: true },
  { icon: 'help-circle', label: 'Help Center', route: '' },
];

export default function ProfileScreen() {
  const theme = 'light';
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { orders, loadOrders } = useOrderStore();

  useEffect(() => {
    loadOrders();
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/onboarding'); } },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="account-circle" size={24} color={Colors[theme].primary} />
          <Text style={[styles.headerTitle, { color: Colors[theme].primary }]}>My Profile</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity activeOpacity={0.8} style={[styles.profileHeader, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: Colors[theme]['surface-container'] }]}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons name="account" size={36} color={Colors[theme]['on-surface']} />
              )}
            </View>
            <View style={[styles.editBadge, { backgroundColor: Colors[theme].primary }]}>
              <MaterialCommunityIcons name="camera" size={12} color="#ffffff" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: Colors[theme]['on-surface'] }]}>{user?.name || 'User'}</Text>
            <Text style={[styles.profileEmail, { color: Colors[theme]['on-surface-variant'] }]}>
              {user?.email || 'No email'}
            </Text>
            <View style={styles.memberBadge}>
              <MaterialCommunityIcons name="crown" size={14} color={Colors[theme].secondary} />
              <Text style={[styles.memberText, { color: Colors[theme].secondary }]}>Platinum Member</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
        </TouchableOpacity>

        <View style={styles.quickStats}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme]['primary-container'] }]}>
            <MaterialCommunityIcons name="wallet" size={28} color={Colors[theme]['on-primary-container']} />
            <View>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-primary-container'] }]}>Total Spent</Text>
              <Text style={[styles.statValue, { color: Colors[theme]['on-primary-container'] }]}>{formatPrice(totalSpent)}</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme]['secondary-container'] }]}>
            <MaterialCommunityIcons name="receipt" size={28} color={Colors[theme]['on-secondary-container']} />
            <View>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-secondary-container'] }]}>Orders</Text>
              <Text style={[styles.statValue, { color: Colors[theme]['on-secondary-container'] }]}>{orderCount}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.menuCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                { borderBottomWidth: index < menuItems.length - 1 ? 1 : 0, borderBottomColor: Colors[theme]['surface-variant'] },
              ]}
              onPress={() => {
                if (item.route) router.push(item.route as any);
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: Colors[theme]['surface-container'] }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors[theme].primary} />
              </View>
              <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>{item.label}</Text>
              {item.hasToggle ? (
                <View style={[styles.toggle, { backgroundColor: Colors[theme]['surface-container-high'] }]}>
                  <View style={[styles.toggleKnob, { backgroundColor: Colors[theme].primary }]} />
                </View>
              ) : (
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: Colors[theme]['surface-container-highest'] }]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} color={Colors[theme].error} />
          <Text style={[styles.logoutText, { color: Colors[theme].error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'],
    paddingTop: 56,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  headerTitle: { ...Typography.h2 },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light['primary-container'],
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileName: { ...Typography.h1 },
  profileEmail: { ...Typography['body-sm'], marginTop: 2 },
  avatarImage: { width: '100%', height: '100%', borderRadius: BorderRadius.full },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  memberText: { ...Typography['label-sm'], fontWeight: '600' },
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  statLabel: { ...Typography['label-sm'] },
  statValue: { ...Typography.h2 },
  menuCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, ...Typography['label-md'] },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
  },
  logoutBtn: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoutText: { ...Typography['label-md'] },
});
