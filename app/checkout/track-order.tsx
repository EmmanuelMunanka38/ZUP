import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useOrderStore } from '@/store/orderStore';

export default function TrackOrderScreen() {
  const theme = 'light';

  const trackedOrder = useOrderStore((s) => s.trackedOrder);
  const loadTrackedOrder = useOrderStore((s) => s.loadTrackedOrder);

  useEffect(() => {
    loadTrackedOrder('order-1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = trackedOrder?.steps ?? [
    { label: 'Ordered', completed: true },
    { label: 'Preparing', completed: true },
    { label: 'On the Way', active: true },
    { label: 'Arrived' },
  ];

  const riderName = trackedOrder?.rider?.name ?? 'Juma Bakari';
  const riderAvatar = trackedOrder?.rider?.avatar ?? Images.trackOrder.rider;
  const riderRating = trackedOrder?.rider?.rating ?? 4.9;
  const riderVehicle = trackedOrder?.rider?.vehicle ?? 'Piki-Piki';
  const riderPlate = trackedOrder?.rider?.plateNumber ?? 'TZ-384-A';
  const estimatedMinutes = trackedOrder?.estimatedMinutes ?? 12;
  const estimatedArrival = trackedOrder?.estimatedArrival ?? 'Arriving by 14:45';

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <MaterialCommunityIcons name="map-marker" size={20} color={Colors[theme].primary} />
          <View>
            <Text style={[styles.headerLabel, { color: Colors[theme]['on-surface-variant'] }]}>
              Deliver to Current Location
            </Text>
            <Text style={[styles.headerOrder, { color: Colors[theme].primary }]}>
              Order #PIKI-8829
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={Colors[theme]['on-surface-variant']} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <MaterialCommunityIcons name="cart-outline" size={22} color={Colors[theme]['on-surface-variant']} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <Image source={{ uri: Images.trackOrder.map }} style={styles.mapImage} />

        <View style={[styles.etaBubble, { backgroundColor: Colors[theme]['surface'] }]}>
          <View style={styles.etaLeft}>
            <Text style={[styles.etaMinutes, { color: Colors[theme].primary }]}>{estimatedMinutes}</Text>
            <Text style={[styles.etaLabel, { color: Colors[theme]['on-surface-variant'] }]}>Mins</Text>
          </View>
          <View style={[styles.etaDivider, { backgroundColor: Colors[theme]['outline-variant'] }]} />
          <View>
            <Text style={[styles.etaTitle, { color: Colors[theme].primary }]}>Estimated Arrival</Text>
            <Text style={[styles.etaTime, { color: Colors[theme]['on-surface-variant'] }]}>{estimatedArrival}</Text>
          </View>
        </View>

        <View style={styles.mapMarkerRider}>
          <View style={[styles.markerPulse, { backgroundColor: Colors[theme]['primary-container'] }]} />
          <View style={[styles.markerIcon, { backgroundColor: Colors[theme].primary }]}>
            <MaterialCommunityIcons name="bike" size={20} color="#ffffff" />
          </View>
        </View>
        <View style={styles.mapMarkerDest}>
          <View style={[styles.markerDestIcon, { backgroundColor: Colors[theme].tertiary }]}>
            <MaterialCommunityIcons name="home" size={20} color="#ffffff" />
          </View>
        </View>
      </View>

      <View style={[styles.bottomCard, { backgroundColor: Colors[theme].surface }]}>
        <View style={[styles.pullHandle, { backgroundColor: Colors[theme]['surface-container-highest'] }]} />

        <View style={styles.riderSection}>
          <View style={styles.riderLeft}>
            <View style={styles.riderAvatarWrap}>
              <Image source={{ uri: riderAvatar }} style={styles.riderAvatar} />
              <View style={[styles.riderBadge, { backgroundColor: Colors[theme]['secondary-container'] }]}>
                <MaterialCommunityIcons name="star" size={14} color={Colors[theme]['on-secondary-container']} />
                <Text style={styles.riderBadgeText}> {riderRating}</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.riderName, { color: Colors[theme]['on-surface'] }]}>{riderName}</Text>
              <View style={styles.riderVehicleRow}>
                <MaterialCommunityIcons name="bike" size={18} color={Colors[theme]['on-surface-variant']} />
                <Text style={[styles.riderVehicle, { color: Colors[theme]['on-surface-variant'] }]}>
                  {riderVehicle} ({riderPlate})
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.riderActions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="chat-outline" size={20} color={Colors[theme].primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors[theme].primary }]}>
              <MaterialCommunityIcons name="phone" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={[styles.timelineTrack, { backgroundColor: Colors[theme]['surface-container-highest'] }]}>
            <View style={[styles.timelineProgress, { backgroundColor: Colors[theme].primary, width: '66%' }]} />
          </View>
          <View style={styles.timelineSteps}>
            {steps.map((step, index) => (
              <View key={index} style={styles.timelineStep}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor: step.completed
                        ? Colors[theme].primary
                        : step.active
                        ? Colors[theme]['secondary-container']
                        : Colors[theme]['surface-container-highest'],
                      borderWidth: step.active ? 0 : 0,
                    },
                  ]}
                >
                  {step.completed && (
                    <MaterialCommunityIcons name="check" size={14} color="#ffffff" />
                  )}
                  {step.active && <View style={[styles.stepActiveInner, { backgroundColor: Colors[theme].surface }]} />}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: step.active
                        ? Colors[theme].primary
                        : Colors[theme]['on-surface-variant'],
                      fontWeight: step.active ? '600' : '400',
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.detailBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
          <MaterialCommunityIcons name="information" size={20} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.detailBtnText, { color: Colors[theme]['on-surface'] }]}>
            View Order Details & Receipt
          </Text>
        </TouchableOpacity>
      </View>
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
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  headerLabel: { ...Typography['label-sm'] },
  headerOrder: { ...Typography.h2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerIconBtn: { padding: Spacing.sm, borderRadius: BorderRadius.full },
  mapContainer: { flex: 1, position: 'relative' },
  mapImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  etaBubble: {
    position: 'absolute',
    top: 20,
    left: Spacing['container-padding'],
    right: Spacing['container-padding'],
    borderRadius: BorderRadius.full,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadows.md,
  },
  etaLeft: { alignItems: 'center', minWidth: 50 },
  etaMinutes: { ...Typography.display, fontSize: 28 },
  etaLabel: { ...Typography['label-sm'], textTransform: 'uppercase', letterSpacing: 1 },
  etaDivider: { width: 1, height: 32 },
  etaTitle: { ...Typography['label-md'] },
  etaTime: { ...Typography['body-sm'] },
  mapMarkerRider: {
    position: 'absolute',
    top: '45%',
    left: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    opacity: 0.2,
  },
  markerIcon: {
    padding: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: '#ffffff',
    ...Shadows.md,
  },
  mapMarkerDest: {
    position: 'absolute',
    top: '65%',
    left: '60%',
  },
  markerDestIcon: {
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: '#ffffff',
    ...Shadows.md,
  },
  bottomCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing['container-padding'],
    paddingBottom: 40,
    ...Shadows.lg,
  },
  pullHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  riderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  riderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  riderAvatarWrap: { position: 'relative' },
  riderAvatar: { width: 56, height: 56, borderRadius: BorderRadius.md },
  riderBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    paddingHorizontal: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderBadgeText: { fontSize: 10, fontWeight: '600' },
  riderName: { ...Typography.h2 },
  riderVehicleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  riderVehicle: { ...Typography['body-sm'] },
  riderActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: { marginBottom: Spacing.lg },
  timelineTrack: {
    height: 3,
    borderRadius: 1.5,
    marginBottom: -12,
    marginHorizontal: 4,
    overflow: 'hidden',
  },
  timelineProgress: { height: '100%', borderRadius: 1.5 },
  timelineSteps: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineStep: { alignItems: 'center', gap: 4, width: 72 },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepActiveInner: { width: 10, height: 10, borderRadius: 5 },
  stepLabel: { ...Typography['label-sm'], textAlign: 'center' },
  detailBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  detailBtnText: { ...Typography['label-md'] },
});
