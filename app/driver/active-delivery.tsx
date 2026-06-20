import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Platform, Linking } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useDriverStore } from '@/store/driverStore';
import { useLocationStore } from '@/store/locationStore';
import { driverService } from '@/services/driver.service';
import { driverSocketService } from '@/services/driver-socket.service';
import { ordersService } from '@/services/orders.service';
import { mapService } from '@/services/map.service';
import { MapboxMap } from '@/components/map/MapboxMap';
import { MapControls } from '@/components/map/MapControls';
import { Coordinate } from '@/types';

type DriverStep = 'to_pickup' | 'picked_up' | 'on_the_way' | 'arrived' | 'completed';

const DAR_CENTER = { latitude: -6.7924, longitude: 39.2083 };

export default function ActiveDeliveryScreen() {
  const theme = 'light';
  const mapRef = useRef<any>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const { activeDelivery, completeDelivery } = useDriverStore();
  const [updating, setUpdating] = useState(false);
  const [step, setStep] = useState<DriverStep>('to_pickup');
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [hasFittedBounds, setHasFittedBounds] = useState(false);
  const [orderLocations, setOrderLocations] = useState<{ restaurant?: Coordinate; customer?: Coordinate } | null>(null);

  const restaurantLocation = orderLocations?.restaurant || activeDelivery?.restaurant.location || DAR_CENTER;
  const customerLocation = orderLocations?.customer || activeDelivery?.customer.location || DAR_CENTER;
  const displayLocation = currentLocation || DAR_CENTER;
  const destination = useMemo(() => {
    if (step === 'to_pickup' || step === 'picked_up') return restaurantLocation;
    return customerLocation;
  }, [step, restaurantLocation, customerLocation]);

  useEffect(() => {
    if (!activeDelivery?.orderId) return;
    driverSocketService.setActiveOrder(activeDelivery.orderId);
    let cancelled = false;
    ordersService.getById(activeDelivery.orderId).then((order) => {
      if (cancelled) return;
      const restLoc = order?.restaurant?.location;
      const custLoc = typeof order.deliveryAddress === 'object' && 'coordinate' in order.deliveryAddress
        ? order.deliveryAddress.coordinate
        : undefined;
      if (restLoc || custLoc) {
        setOrderLocations({
          ...(restLoc ? { restaurant: restLoc } : {}),
          ...(custLoc ? { customer: custLoc } : {}),
        });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [activeDelivery?.orderId]);

  const statusLabel = step === 'to_pickup' ? 'On the way to pickup'
    : step === 'picked_up' ? 'Picked up'
    : step === 'on_the_way' ? 'Heading to drop-off'
    : 'Completed';

  useEffect(() => {
    if (!currentLocation) return;
    setIsLoadingRoute(true);
    let cancelled = false;
    const fetchRoute = async () => {
      try {
        const result = await mapService.fetchRoute(
          [currentLocation.longitude, currentLocation.latitude],
          [destination.longitude, destination.latitude],
        );
        if (result && !cancelled) {
          setRouteCoords(result.coordinates);
        }
      } catch {
        // route fetch failed
      } finally {
        if (!cancelled) setIsLoadingRoute(false);
      }
    };
    fetchRoute();
    return () => { cancelled = true; };
  }, [currentLocation?.latitude, currentLocation?.longitude, destination.latitude, destination.longitude]);

  useEffect(() => {
    if (currentLocation) {
      driverSocketService.sendLocation(currentLocation);
    }
    if (currentLocation && !hasFittedBounds) {
      const points = [currentLocation, restaurantLocation, customerLocation];
      const lats = points.map((p) => p.latitude);
      const lngs = points.map((p) => p.longitude);
      mapRef.current?.fitBounds(
        { latitude: Math.max(...lats), longitude: Math.max(...lngs) },
        { latitude: Math.min(...lats), longitude: Math.min(...lngs) },
        100,
      );
      setHasFittedBounds(true);
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  const handleRecenter = useCallback(() => {
    mapRef.current?.flyTo(currentLocation || destination, 15);
  }, [currentLocation, destination]);

  const handleMyLocation = useCallback(() => {
    if (currentLocation) {
      mapRef.current?.flyTo(currentLocation, 16);
    }
  }, [currentLocation]);

  useEffect(() => {
    if (currentLocation) {
      mapRef.current?.flyTo(currentLocation, 15);
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  const handleCall = useCallback((phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  }, []);

  const handleMessage = useCallback((phone?: string) => {
    if (phone) {
      Linking.openURL(`sms:${phone}`);
    }
  }, []);

  const handleStatusUpdate = useCallback(async (newStatus: string, nextStep: DriverStep) => {
    if (!activeDelivery) return;
    setUpdating(true);
    try {
      await driverService.updateOrderStatus(activeDelivery.orderId, newStatus);
      setStep(nextStep);
    } catch {
      // status update failed
    } finally {
      setUpdating(false);
    }
  }, [activeDelivery]);

  const handleComplete = useCallback(async () => {
    if (!activeDelivery) return;
    setUpdating(true);
    try {
      await completeDelivery();
      router.back();
    } catch {
      setUpdating(false);
    }
  }, [activeDelivery, completeDelivery]);

  const snapPoints = useMemo(() => ['30%', '65%'], []);

  const markers = useMemo(() => [
    { id: 'restaurant', latitude: restaurantLocation.latitude, longitude: restaurantLocation.longitude, title: activeDelivery?.restaurant.name || 'Restaurant', icon: 'store' as const, color: Colors[theme].primary },
    { id: 'customer', latitude: customerLocation.latitude, longitude: customerLocation.longitude, title: 'Customer', icon: 'map-marker' as const, color: Colors[theme]['secondary-container'] },
    { id: 'driver', latitude: displayLocation.latitude, longitude: displayLocation.longitude, title: 'Driver', icon: 'bike' as const, color: Colors[theme].primary, rotation: 0 },
  ], [restaurantLocation, customerLocation, displayLocation, activeDelivery?.restaurant.name]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <MapboxMap
          ref={mapRef}
          initialCamera={{ latitude: displayLocation.latitude, longitude: displayLocation.longitude, zoom: 14 }}
          style={StyleSheet.absoluteFillObject}
          markers={markers}
          routePolyline={routeCoords && routeCoords.length >= 2 ? {
            coordinates: routeCoords,
            color: Colors[theme].primary,
            width: 4,
          } : undefined}
        />

        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>Active Delivery</Text>
            <Text style={styles.headerOrder}>#{activeDelivery?.orderId?.substring(0, 8) || '---'}</Text>
          </View>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: 'rgba(186,26,26,0.8)' }]}>
            <MaterialCommunityIcons name="alert-circle" size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {isLoadingRoute && (
          <View style={styles.routeLoadingOverlay}>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        )}

        <MapControls
          onRecenter={handleRecenter}
          onMyLocation={handleMyLocation}
        />

        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          handleIndicatorStyle={styles.handleIndicator}
          handleStyle={styles.handleContainer}
          backgroundStyle={[styles.sheetBackground, { backgroundColor: Colors[theme].surface }]}
          enablePanDownToClose={false}
          animateOnMount
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Status row */}
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: Colors[theme]['secondary-container'] }]} />
              <Text style={[styles.statusText, { color: Colors[theme]['secondary'] }]}>{statusLabel}</Text>
              {activeDelivery?.distance && (
                <View style={[styles.distanceBadge, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
                  <Text style={[styles.distanceBadgeText, { color: Colors[theme]['on-surface-variant'] }]}>{activeDelivery.distance} km</Text>
                </View>
              )}
            </View>

            {/* Stops */}
            <View style={styles.stopsSection}>
              <View style={styles.stopRow}>
                <View style={styles.stopIndicator}>
                  <MaterialCommunityIcons name="store" size={20} color={Colors[theme].primary} />
                  <View style={[styles.stopLine, { backgroundColor: Colors[theme]['surface-container-highest'] }]} />
                </View>
                <View style={styles.stopInfo}>
                  <Text style={[styles.stopLabel, { color: Colors[theme]['on-surface-variant'] }]}>Pickup from</Text>
                  <Text style={[styles.stopName, { color: Colors[theme]['on-surface'] }]}>
                    {activeDelivery?.restaurant.name || 'Restaurant'}
                  </Text>
                  <Text style={[styles.stopAddress, { color: Colors[theme]['on-surface-variant'] }]}>
                    {activeDelivery?.restaurant.address || activeDelivery?.pickup || ''}
                  </Text>
                </View>
                <View style={styles.stopActions}>
                  <TouchableOpacity
                    style={[styles.stopActionBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}
                    onPress={() => activeDelivery?.restaurant.phone && Linking.openURL(`tel:${activeDelivery.restaurant.phone}`)}
                  >
                    <MaterialCommunityIcons name="phone" size={18} color={Colors[theme].primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.stopActionBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}
                    onPress={() => activeDelivery?.restaurant.phone && Linking.openURL(`sms:${activeDelivery.restaurant.phone}`)}
                  >
                    <MaterialCommunityIcons name="chat-outline" size={18} color={Colors[theme].primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.stopRow}>
                <View style={styles.stopIndicator}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={Colors[theme]['secondary']} />
                </View>
                <View style={styles.stopInfo}>
                  <Text style={[styles.stopLabel, { color: Colors[theme]['on-surface-variant'] }]}>Deliver to</Text>
                  <Text style={[styles.stopName, { color: Colors[theme]['on-surface'] }]}>
                    {activeDelivery?.customer.name || 'Customer'}
                  </Text>
                  <Text style={[styles.stopAddress, { color: Colors[theme]['on-surface-variant'] }]}>
                    {activeDelivery?.customer.address || activeDelivery?.dropoff || ''}
                  </Text>
                </View>
                <View style={styles.stopActions}>
                  <TouchableOpacity
                    style={[styles.stopActionBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}
                    onPress={() => activeDelivery?.customer.phone && Linking.openURL(`tel:${activeDelivery.customer.phone}`)}
                  >
                    <MaterialCommunityIcons name="phone" size={18} color={Colors[theme]['secondary']} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.stopActionBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}
                    onPress={() => activeDelivery?.customer.phone && Linking.openURL(`sms:${activeDelivery.customer.phone}`)}
                  >
                    <MaterialCommunityIcons name="chat-outline" size={18} color={Colors[theme]['secondary']} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Items card */}
            <View style={[styles.itemsCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
              <View style={styles.itemsLeft}>
                <View style={[styles.itemsIcon, { backgroundColor: 'rgba(15,169,88,0.15)' }]}>
                  <MaterialCommunityIcons name="shopping-outline" size={20} color={Colors[theme]['on-primary-container']} />
                </View>
                <View>
                  <Text style={[styles.itemsTitle, { color: Colors[theme]['on-surface'] }]}>
                    {activeDelivery?.items.length || 0} Items to collect
                  </Text>
                  <Text style={[styles.itemsList, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={2}>
                    {activeDelivery?.items.join(', ') || ''}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.actionGrid}>
              {step === 'to_pickup' && (
                <TouchableOpacity
                  style={[styles.actionPrimary, { backgroundColor: Colors[theme].primary }]}
                  onPress={() => handleStatusUpdate('picked_up', 'picked_up')}                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <><MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" /><Text style={styles.actionPrimaryText}>Picked Up</Text></>
                  )}
                </TouchableOpacity>
              )}
              {step === 'picked_up' && (
                <TouchableOpacity
                  style={[styles.actionPrimary, { backgroundColor: Colors[theme].primary }]}
                  onPress={() => handleStatusUpdate('on_the_way', 'on_the_way')}                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <><MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" /><Text style={styles.actionPrimaryText}>On the Way</Text></>
                  )}
                </TouchableOpacity>
              )}
              {step === 'on_the_way' && (
                <TouchableOpacity
                  style={[styles.actionPrimary, { backgroundColor: Colors[theme].primary }]}
                  onPress={() => handleStatusUpdate('arrived', 'arrived')}                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <><MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" /><Text style={styles.actionPrimaryText}>Arrived</Text></>
                  )}
                </TouchableOpacity>
              )}
              {step === 'arrived' && (
                <TouchableOpacity
                  style={[styles.actionPrimary, { backgroundColor: Colors[theme].primary }]}
                  onPress={handleComplete}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <><MaterialCommunityIcons name="check-circle" size={20} color="#ffffff" /><Text style={styles.actionPrimaryText}>Delivered</Text></>
                  )}
                </TouchableOpacity>
              )}              {(step === 'to_pickup' || step === 'picked_up') && (
                <TouchableOpacity
                  style={[styles.actionSecondary, { backgroundColor: Colors[theme]['secondary-fixed'] }]}
                  onPress={handleMyLocation}
                >
                  <MaterialCommunityIcons name="crosshairs-gps" size={20} color={Colors[theme]['on-secondary-fixed']} />
                  <Text style={[styles.actionSecondaryText, { color: Colors[theme]['on-secondary-fixed'] }]}>Navigate</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 32 }} />
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  handleContainer: { paddingTop: Spacing.sm },
  handleIndicator: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: Colors.light['surface-container-highest'],
  },
  sheetBackground: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 24, elevation: 16,
  },
  sheetScrollContent: { paddingHorizontal: Spacing['container-padding'], paddingTop: Spacing.sm },

  headerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'], paddingTop: 54, paddingBottom: Spacing.md,
  },
  headerBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerLabel: { ...Typography['label-sm'], color: 'rgba(255,255,255,0.8)' },
  headerOrder: { ...Typography.h2, color: '#ffffff' },

  routeLoadingOverlay: {
    position: 'absolute', top: 100, alignSelf: 'center', zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },

  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm, marginBottom: Spacing.lg,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusText: { ...Typography['label-md'], fontWeight: '600', flex: 1 },
  distanceBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  distanceBadgeText: { ...Typography['label-sm'] },

  stopsSection: { gap: Spacing.sm, marginBottom: Spacing.md },
  stopRow: { flexDirection: 'row', gap: Spacing.md },
  stopIndicator: { alignItems: 'center', width: 24 },
  stopLine: { width: 2, flex: 1, marginVertical: 4 },
  stopInfo: { flex: 1 },
  stopLabel: { ...Typography['label-sm'] },
  stopName: { ...Typography.h2 },
  stopAddress: { ...Typography['body-sm'] },
  stopActions: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'flex-start' },
  stopActionBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },

  itemsCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.light['surface-variant'], ...Shadows.sm,
  },
  itemsLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  itemsIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  itemsTitle: { ...Typography['label-md'] },
  itemsList: { ...Typography['body-sm'] },

  actionGrid: { flexDirection: 'row', gap: Spacing.md },
  actionSecondary: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
  },
  actionSecondaryText: { ...Typography['label-md'] },
  actionPrimary: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
  },
  actionPrimaryText: { ...Typography['label-md'], color: '#ffffff' },
});
