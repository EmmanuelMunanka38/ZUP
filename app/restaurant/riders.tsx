import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function RidersScreen() {
  const theme = 'light';

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Riders</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="plus" size={24} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <MaterialCommunityIcons name="truck" size={48} color={Colors[theme]['surface-variant']} />
          <Text style={[styles.infoTitle, { color: Colors[theme]['on-surface'] }]}>Delivery Partners</Text>
          <Text style={[styles.infoSubtitle, { color: Colors[theme]['on-surface-variant'] }]}>
            Riders assigned to your restaurant will appear here. They handle deliveries to your customers.
          </Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors[theme].primary }]}>0</Text>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-surface-variant'] }]}>Active Riders</Text>
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
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>How it works</Text>
        </View>

        {[
          { icon: 'account-plus', title: 'Riders are assigned', desc: 'When an order is placed, a nearby rider is assigned automatically' },
          { icon: 'map-marker-path', title: 'Real-time tracking', desc: 'Track rider location and delivery progress from your dashboard' },
          { icon: 'check-circle', title: 'Delivery confirmation', desc: 'Get notified when orders are successfully delivered' },
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
  infoCard: { alignItems: 'center', borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.md, gap: Spacing.md, ...Shadows.sm },
  infoTitle: { ...Typography.h2 },
  infoSubtitle: { ...Typography['body-sm'], textAlign: 'center', lineHeight: 20, paddingHorizontal: Spacing.md },
  statsCard: { borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.sm },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.h1, fontWeight: '700' },
  statLabel: { ...Typography['label-sm'], marginTop: 2 },
  statDivider: { width: 1, height: 36, marginHorizontal: Spacing.md },
  sectionHeader: { marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h2 },
  stepCard: { flexDirection: 'row', gap: Spacing.md, borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
  stepIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  stepInfo: { flex: 1 },
  stepTitle: { ...Typography['label-md'], fontWeight: '600' },
  stepDesc: { ...Typography['body-sm'], marginTop: 2, lineHeight: 18 },
});
