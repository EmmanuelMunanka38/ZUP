import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useDriverStore } from '@/store/driverStore';

export default function ActiveDeliveryScreen() {
  const theme = 'light';
  const { activeDelivery, completeDelivery } = useDriverStore();

  return (
    <View style={styles.container}>
      <View style={[styles.mapFull, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
        <Image source={{ uri: Images.activeDelivery.map }} style={styles.mapImageFull} />

        <View style={[styles.topBar, { backgroundColor: 'rgba(252,249,248,0.95)' }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={Colors[theme].primary} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={[styles.topBarLabel, { color: Colors[theme]['on-surface-variant'] }]}>
              Active Delivery
            </Text>
            <Text style={[styles.topBarOrder, { color: Colors[theme]['on-surface'] }]}>
              Order #{activeDelivery?.orderId || 'N/A'}
            </Text>
          </View>
          <TouchableOpacity style={[styles.reportBtn, { backgroundColor: Colors[theme]['error-container'] }]}>
            <MaterialCommunityIcons name="alert-circle" size={22} color={Colors[theme].error} />
          </TouchableOpacity>
        </View>

        <View style={styles.navOverlay}>
          <View style={[styles.navCard, { backgroundColor: Colors[theme].primary }]}>
            <View style={styles.navCardLeft}>
              <View style={styles.navTurnIcon}>
                <MaterialCommunityIcons name="arrow-right-bold" size={28} color="rgba(255,255,255,0.9)" />
              </View>
              <View>
                <Text style={styles.navTurnLabel}>Then turn right in 200m</Text>
                <Text style={styles.navTurnStreet}>Head North on Ali Hassan Mwinyi Rd</Text>
              </View>
            </View>
            <View style={[styles.navDistance, { borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.navDistanceValue}>1.2</Text>
              <Text style={styles.navDistanceUnit}>km</Text>
            </View>
          </View>
        </View>

        <View style={styles.mapActions}>
          <TouchableOpacity style={[styles.mapActionBtn, { backgroundColor: '#ffffff' }]}>
            <MaterialCommunityIcons name="crosshairs" size={22} color={Colors[theme].primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mapActionBtn, { backgroundColor: '#ffffff' }]}>
            <MaterialCommunityIcons name="layers" size={22} color={Colors[theme]['on-surface-variant']} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.bottomSheet, { backgroundColor: Colors[theme].surface }]}>
        <View style={styles.pullHandle} />

        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: Colors[theme]['secondary-container'] }]} />
          <Text style={[styles.statusText, { color: Colors[theme]['secondary'] }]}>
            On the way to pickup
          </Text>
          <View style={styles.avatarStack}>
            <View style={styles.avatarMini}><Image source={{ uri: activeDelivery?.restaurant.image || Images.activeDelivery.restaurant }} style={styles.avatarMiniImg} /></View>
            <View style={[styles.avatarMini, { marginLeft: -12 }]}><Image source={{ uri: Images.activeDelivery.customer }} style={styles.avatarMiniImg} /></View>
          </View>
        </View>

        <View style={styles.stopsSection}>
          <View style={styles.stopRow}>
            <View style={styles.stopIndicator}>
              <MaterialCommunityIcons name="store" size={20} color={Colors[theme].primary} />
              <View style={[styles.stopLine, { backgroundColor: Colors[theme]['surface-container-highest'] }]} />
            </View>
            <View style={styles.stopInfo}>
              <View style={styles.stopTop}>
                <View>
                  <Text style={[styles.stopLabel, { color: Colors[theme]['on-surface-variant'] }]}>
                    Pickup from
                  </Text>
                  <Text style={[styles.stopName, { color: Colors[theme]['on-surface'] }]}>
                    {activeDelivery?.restaurant.name || 'Mama Ntilie Gourmet'}
                  </Text>
                  <Text style={[styles.stopAddress, { color: Colors[theme]['on-surface-variant'] }]}>
                    {activeDelivery?.restaurant.address || 'Msasani Peninsula, Plot 12'}
                  </Text>
                </View>
                <View style={styles.stopActions}>
                  <TouchableOpacity style={[styles.stopActionBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
                    <MaterialCommunityIcons name="phone" size={18} color={Colors[theme].primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.stopActionBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
                    <MaterialCommunityIcons name="chat-outline" size={18} color={Colors[theme].primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.stopRow}>
            <View style={styles.stopIndicator}>
              <MaterialCommunityIcons name="map-marker" size={20} color={Colors[theme]['secondary']} />
            </View>
            <View style={styles.stopInfo}>
              <View style={styles.stopTop}>
                <View>
                  <Text style={[styles.stopLabel, { color: Colors[theme]['on-surface-variant'] }]}>
                    Deliver to
                  </Text>
                  <Text style={[styles.stopName, { color: Colors[theme]['on-surface'] }]}>
                    {activeDelivery?.customer.name || 'John Doe'}
                  </Text>
                  <Text style={[styles.stopAddress, { color: Colors[theme]['on-surface-variant'] }]}>
                    {activeDelivery?.customer.address || 'Masaki Towers, Appt 4B'}
                  </Text>
                </View>
                <View style={styles.stopActions}>
                  <TouchableOpacity style={[styles.stopActionBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
                    <MaterialCommunityIcons name="phone" size={18} color={Colors[theme]['secondary']} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.stopActionBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
                    <MaterialCommunityIcons name="chat-outline" size={18} color={Colors[theme]['secondary']} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.itemsCard, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
          <View style={styles.itemsLeft}>
            <View style={[styles.itemsIcon, { backgroundColor: 'rgba(15,169,88,0.15)' }]}>
              <MaterialCommunityIcons name="shopping-outline" size={20} color={Colors[theme]['on-primary-container']} />
            </View>
            <View>
              <Text style={[styles.itemsTitle, { color: Colors[theme]['on-surface'] }]}>
                {activeDelivery?.items.length || 0} Items to collect
              </Text>
              <Text style={[styles.itemsList, { color: Colors[theme]['on-surface-variant'] }]}>
                {activeDelivery?.items.join(', ').substring(0, 30) || 'Pilau Kuku, Wali wa Nazi, Juice...'}
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={[styles.viewListBtn, { color: Colors[theme].primary }]}>View List</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionSecondary, { backgroundColor: Colors[theme]['secondary-fixed'] }]}>
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color={Colors[theme]['on-secondary-fixed']} />
            <Text style={[styles.actionSecondaryText, { color: Colors[theme]['on-secondary-fixed'] }]}>
              Navigate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionPrimary, { backgroundColor: Colors[theme].primary }]}
            onPress={() => {
              completeDelivery();
              router.back();
            }}
          >
            <MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" />
            <Text style={styles.actionPrimaryText}>Arrived</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapFull: { flex: 1, position: 'relative' },
  mapImageFull: { width: '100%', height: '100%', resizeMode: 'cover', position: 'absolute' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'],
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  topBarCenter: { flex: 1, alignItems: 'center' },
  topBarLabel: { ...Typography['label-sm'], textTransform: 'uppercase', letterSpacing: 0.5 },
  topBarOrder: { ...Typography.h2 },
  reportBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navOverlay: {
    position: 'absolute',
    top: 100,
    left: Spacing['container-padding'],
    right: Spacing['container-padding'],
  },
  navCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  navCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  navTurnIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTurnLabel: { ...Typography['label-sm'], color: 'rgba(255,255,255,0.8)' },
  navTurnStreet: { ...Typography['body-md'], color: '#ffffff', fontWeight: '600' },
  navDistance: { alignItems: 'center', paddingLeft: Spacing.md, borderLeftWidth: 1 },
  navDistanceValue: { ...Typography.display, color: '#ffffff', fontSize: 24 },
  navDistanceUnit: { ...Typography['label-sm'], color: 'rgba(255,255,255,0.8)' },
  mapActions: {
    position: 'absolute',
    bottom: 320,
    right: Spacing['container-padding'],
    gap: Spacing.sm,
  },
  mapActionBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing['container-padding'],
    paddingTop: Spacing.sm,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 16,
  },
  pullHandle: {
    width: 48,
    height: 4,
    backgroundColor: '#e5e2e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusText: { ...Typography['label-md'], fontWeight: '600', flex: 1 },
  avatarStack: { flexDirection: 'row' },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniImg: { width: 28, height: 28, borderRadius: 14 },
  stopsSection: { gap: Spacing.sm, marginBottom: Spacing.md },
  stopRow: { flexDirection: 'row', gap: Spacing.md },
  stopIndicator: { alignItems: 'center', width: 24 },
  stopLine: { width: 2, flex: 1, marginVertical: 4 },
  stopInfo: { flex: 1 },
  stopTop: { flexDirection: 'row', justifyContent: 'space-between' },
  stopLabel: { ...Typography['label-sm'] },
  stopName: { ...Typography.h2 },
  stopAddress: { ...Typography['body-sm'] },
  stopActions: { flexDirection: 'row', gap: Spacing.xs },
  stopActionBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  itemsLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  itemsIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsTitle: { ...Typography['label-md'] },
  itemsList: { ...Typography['body-sm'] },
  viewListBtn: { ...Typography['label-md'] },
  actionGrid: { flexDirection: 'row', gap: Spacing.md },
  actionSecondary: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  actionSecondaryText: { ...Typography['label-md'] },
  actionPrimary: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  actionPrimaryText: { ...Typography['label-md'], color: '#ffffff' },
});
