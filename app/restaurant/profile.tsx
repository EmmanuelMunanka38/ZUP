import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/format';
import { useRestaurantStore } from '@/store/restaurantStore';

export default function RestaurantProfileScreen() {
  const theme = 'light';
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { restaurants } = useRestaurantStore();
  const myRestaurant = restaurants[0];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/onboarding'); } },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={[styles.avatar, { backgroundColor: Colors[theme]['primary-container'] }]}>
            <MaterialCommunityIcons name="store" size={36} color="#ffffff" />
          </View>
          <Text style={[styles.name, { color: Colors[theme]['on-surface'] }]}>{user?.name || 'Restaurant Owner'}</Text>
          <Text style={[styles.email, { color: Colors[theme]['on-surface-variant'] }]}>{user?.email || ''}</Text>
          {myRestaurant && (
            <View style={[styles.restaurantInfo, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="store-outline" size={18} color={Colors[theme].primary} />
              <Text style={[styles.restaurantName, { color: Colors[theme]['on-surface'] }]}>{myRestaurant.name}</Text>
              <Text style={[styles.restaurantStatus, { color: myRestaurant.isOpen ? Colors[theme].primary : Colors[theme]['on-surface-variant'] }]}>
                {myRestaurant.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.menuCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: Colors[theme]['surface-variant'] }]} onPress={() => router.push('/restaurant/menu-management')}>
            <View style={[styles.menuIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="food" size={20} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>Manage Menu</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: Colors[theme]['surface-variant'] }]}>
            <View style={[styles.menuIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>Business Hours</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: Colors[theme]['surface-variant'] }]}>
            <View style={[styles.menuIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="bank" size={20} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>Payout Details</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: Colors[theme]['surface-variant'] }]}>
            <View style={[styles.menuIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, {}]}>
            <View style={[styles.menuIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="help-circle" size={20} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>Help Center</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: Colors[theme]['surface-container-highest'] }]} onPress={handleLogout}>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'], paddingTop: 56, paddingBottom: Spacing.md,
  },
  headerTitle: { ...Typography.h2 },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100 },
  profileCard: {
    alignItems: 'center', borderRadius: BorderRadius.xl, padding: Spacing.lg,
    marginBottom: Spacing.lg, ...Shadows.sm,
  },
  avatar: { width: 72, height: 72, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  name: { ...Typography.h1 },
  email: { ...Typography['body-sm'], marginTop: 2 },
  restaurantInfo: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginTop: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  restaurantName: { ...Typography['label-md'], fontWeight: '600' },
  restaurantStatus: { ...Typography['label-sm'] },
  menuCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.lg, ...Shadows.sm },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md,
    borderBottomWidth: 1,
  },
  menuIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, ...Typography['label-md'] },
  logoutBtn: {
    borderRadius: BorderRadius.xl, padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
  },
  logoutText: { ...Typography['label-md'] },
});
