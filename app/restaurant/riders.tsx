import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { restaurantsService } from '@/services/restaurants.service';
import { User } from '@/types';

export default function RidersScreen() {
  const theme = 'light';
  const [drivers, setDrivers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const data = await restaurantsService.getDrivers();
      setDrivers(data);
    } catch {
      Alert.alert('Error', 'Failed to load drivers');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Riders</Text>
        <TouchableOpacity onPress={loadDrivers}>
          <MaterialCommunityIcons name="refresh" size={24} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.statsCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors[theme].primary }]}>{drivers.length}</Text>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Registered Drivers</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors[theme].primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>On Delivery</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors[theme].primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Available</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>All Drivers</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors[theme].primary} style={{ marginTop: 40 }} />
        ) : drivers.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="truck" size={56} color={Colors[theme]['surface-variant']} />
            <Text style={[styles.emptyTitle, { color: Colors[theme]['on-surface-variant'] }]}>No drivers registered</Text>
            <Text style={[styles.emptySubtitle, { color: Colors[theme]['surface-variant'] }]}>
              Drivers register on the platform and will appear here
            </Text>
          </View>
        ) : (
          drivers.map((driver) => (
            <View key={driver.id} style={[styles.driverCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
              <View style={[styles.driverAvatar, { backgroundColor: Colors[theme]['surface-container'] }]}>
                {driver.avatar ? (
                  <Image source={{ uri: driver.avatar }} style={styles.driverAvatarImage} />
                ) : (
                  <MaterialCommunityIcons name="account" size={24} color={Colors[theme]['on-surface-variant']} />
                )}
              </View>
              <View style={styles.driverInfo}>
                <Text style={[styles.driverName, { color: Colors[theme]['on-surface'] }]}>{driver.name || 'Driver'}</Text>
                <Text style={[styles.driverPhone, { color: Colors[theme]['on-surface-variant'] }]}>{driver.phone || 'No phone'}</Text>
              </View>
              <View style={[styles.availableBadge, { backgroundColor: 'rgba(15,169,88,0.1)' }]}>
                <View style={styles.availableDot} />
                <Text style={[styles.availableText, { color: Colors[theme].primary }]}>Available</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>How it works</Text>
        </View>

        {[
          { icon: 'account-plus', title: 'Drivers register on the platform', desc: 'Drivers sign up with D+255 prefix and become available for deliveries' },
          { icon: 'map-marker-path', title: 'Real-time tracking', desc: 'Track driver location and delivery progress from your dashboard' },
          { icon: 'check-circle', title: 'Automatic assignment', desc: 'When an order is placed, nearby available drivers receive the request' },
        ].map((step, i) => (
          <View key={i} style={[styles.stepCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <View style={[styles.stepIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name={step.icon as any} size={24} color={Colors[theme].primary} />
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, { color: Colors[theme]['on-surface'] }]}>{step.title}</Text>
              <Text style={[styles.stepDesc, { color: Colors[theme]['on-surface-variant'] }]}>{step.desc}</Text>
            </View>
          </View>
        ))}
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
  statsCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.sm },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.h1, fontWeight: '700' },
  statLabel: { ...Typography['label-sm'], marginTop: 2 },
  statDivider: { width: 1, height: 36, marginHorizontal: Spacing.md },
  sectionHeader: { marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h2 },
  emptyState: { alignItems: 'center', gap: Spacing.sm, marginTop: 40 },
  emptyTitle: { ...Typography['body-md'] },
  emptySubtitle: { ...Typography['label-sm'] },
  driverCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.light['surface-variant'], ...Shadows.sm,
  },
  driverAvatar: { width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  driverAvatarImage: { width: '100%', height: '100%' },
  driverInfo: { flex: 1 },
  driverName: { ...Typography['label-md'], fontWeight: '600' },
  driverPhone: { ...Typography['body-sm'], marginTop: 1 },
  availableBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  availableDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0fa958' },
  availableText: { ...Typography['label-sm'], fontWeight: '600' },
  stepCard: { flexDirection: 'row', gap: Spacing.md, borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
  stepIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  stepInfo: { flex: 1 },
  stepTitle: { ...Typography['label-md'], fontWeight: '600' },
  stepDesc: { ...Typography['body-sm'], marginTop: 2, lineHeight: 18 },
});
