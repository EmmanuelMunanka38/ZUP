import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/format';
import { useDriverStore } from '@/store/driverStore';

export default function DriverProfileScreen() {
  const theme = 'light';
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { earnings, totalDeliveries } = useDriverStore();

  const handleLogout = () => {
    logout();
    router.replace('/onboarding');
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Driver Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={[styles.avatar, { backgroundColor: Colors[theme]['primary-container'] }]}>
            <MaterialCommunityIcons name="bike" size={32} color="#ffffff" />
          </View>
          <Text style={[styles.name, { color: Colors[theme]['on-surface'] }]}>{user?.name || 'Driver'}</Text>
          <Text style={[styles.email, { color: Colors[theme]['on-surface-variant'] }]}>{user?.email || ''}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{totalDeliveries}</Text>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Deliveries</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{formatPrice(earnings)}</Text>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Earnings</Text>
            </View>
          </View>
        </View>

        <View style={[styles.menuCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: Colors[theme]['surface-variant'] }]}>
            <View style={[styles.menuIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="bike" size={20} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>Vehicle Info</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: Colors[theme]['surface-variant'] }]}>
            <View style={[styles.menuIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="bank" size={20} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>Payment Details</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: Colors[theme]['surface-variant'] }]}>
            <View style={[styles.menuIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="bell-outline" size={20} color={Colors[theme].primary} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>Notifications</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: Colors[theme]['surface-variant'] }]}>
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
  statsRow: { flexDirection: 'row', marginTop: Spacing.lg, alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.h2, fontWeight: '700' },
  statLabel: { ...Typography['label-sm'] },
  statDivider: { width: 1, height: 30 },
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
