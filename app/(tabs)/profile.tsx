import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

const menuItems = [
  { icon: 'home-map-marker', label: 'Saved Addresses' },
  { icon: 'receipt', label: 'Order History' },
  { icon: 'credit-card-outline', label: 'Payment Methods' },
  { icon: 'bell-outline', label: 'Notifications' },
  { icon: 'weather-night', label: 'Dark Mode', hasToggle: true },
  { icon: 'help-circle', label: 'Help Center' },
];

export default function ProfileScreen() {
  const theme = 'light';
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="map-marker" size={24} color={Colors[theme].primary} />
          <Text style={[styles.headerTitle, { color: Colors[theme].primary }]}>Deliver to Current Location</Text>
        </View>
        <TouchableOpacity style={[styles.cartButton, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
          <MaterialCommunityIcons name="cart-outline" size={20} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileHeader, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="account" size={36} color={Colors[theme]['on-surface']} />
            </View>
            <View style={[styles.editBadge, { backgroundColor: Colors[theme].primary }]}>
              <MaterialCommunityIcons name="pencil" size={12} color="#ffffff" />
            </View>
          </View>
          <View>
            <Text style={[styles.profileName, { color: Colors[theme]['on-surface'] }]}>{user?.name}</Text>
            <Text style={[styles.profileEmail, { color: Colors[theme]['on-surface-variant'] }]}>
              {user?.email ? `Platinum Member • ${user.email}` : 'Platinum Member'}
            </Text>
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme]['primary-container'] }]}>
            <MaterialCommunityIcons name="wallet" size={32} color={Colors[theme]['on-primary-container']} />
            <View>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-primary-container'] }]}>Balance</Text>
              <Text style={[styles.statValue, { color: Colors[theme]['on-primary-container'] }]}>TSh 45,000</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme]['secondary-container'] }]}>
            <MaterialCommunityIcons name="cards-heart" size={32} color={Colors[theme]['on-secondary-container']} />
            <View>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-secondary-container'] }]}>Points</Text>
              <Text style={[styles.statValue, { color: Colors[theme]['on-secondary-container'] }]}>1,240</Text>
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
