import { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useDriverStore } from '@/store/driverStore';
import { useLocationStore } from '@/store/locationStore';
import { useDriverTracking } from '@/hooks/use-driver-tracking';
import { MapView } from '@/components/map/MapView';
import { AnimatedCarMarker } from '@/components/map/AnimatedCarMarker';
import { RestaurantMarker } from '@/components/map/RestaurantMarker';
import { UserLocationMarker } from '@/components/map/UserLocationMarker';
import { DeliveryRoute } from '@/components/map/DeliveryRoute';
import { MapControls } from '@/components/map/MapControls';
import { Coordinate } from '@/types';

const DAR_CENTER: Coordinate = { latitude: -6.7924, longitude: 39.2083 };
const RESTAURANT_LOCATION: Coordinate = { latitude: -6.789, longitude: 39.205 };
const CUSTOMER_LOCATION: Coordinate = { latitude: -6.797, longitude: 39.215 };

export default function ActiveDeliveryScreen() {
  const theme = 'light';
  const mapRef = useRef<any>(null);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const { activeDelivery, completeDelivery } = useDriverStore();

  const {
    driverLocation,
    driverHeading,
    route,
    estimatedMinutes,
  } = useDriverTracking(activeDelivery?.orderId || 'o1');

  const displayLocation = driverLocation || currentLocation || DAR_CENTER;

  const handleRecenter = useCallback(() => {
    mapRef.current?.flyTo(displayLocation, 15);
  }, [displayLocation]);

  const handleMyLocation = useCallback(() => {
    if (currentLocation) {
      mapRef.current?.flyTo(currentLocation, 16);
    }
  }, [currentLocation]);

  const handleNavigate = useCallback(() => {
    if (activeDelivery) {
      const destination = `${activeDelivery.restaurant.address || 'Unknown'}`;
    }
  }, [activeDelivery]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        initialCoordinate={displayLocation}
        zoomLevel={15}
        scrollEnabled
        zoomEnabled
        style={styles.mapFull}
      >
        <RestaurantMarker
          coordinate={RESTAURANT_LOCATION}
          name={activeDelivery?.restaurant.name || 'Restaurant'}
          id="restaurant-pickup"
        />
        <UserLocationMarker
          coordinate={CUSTOMER_LOCATION}
          id="customer-dropoff"
        />
        <AnimatedCarMarker
          coordinate={displayLocation}
          heading={driverHeading}
          id="driver-car"
          color={Colors[theme].primary}
        />
        <DeliveryRoute
          origin={displayLocation}
          destination={CUSTOMER_LOCATION}
          coordinates={route?.coordinates}
          id="nav-route"
        />
      </MapView>

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
              <Text style={styles.navTurnLabel}>Proceed to pickup</Text>
              <Text style={styles.navTurnStreet}>
                {activeDelivery?.restaurant.address || 'Head to restaurant'}
              </Text>
              {estimatedMinutes > 0 && (
                <Text style={styles.navEta}>{estimatedMinutes} min away</Text>
              )}
            </View>
          </View>
          <View style={[styles.navDistance, { borderLeftColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.navDistanceValue}>{activeDelivery?.distance || '0'}</Text>
            <Text style={styles.navDistanceUnit}>km</Text>
          </View>
        </View>
      </View>

      <MapControls
        onRecenter={handleRecenter}
        onMyLocation={handleMyLocation}
      />

      <View style={[styles.bottomSheet, { backgroundColor: Colors[theme].surface }]}>
        <View style={[styles.pullHandle, { backgroundColor: Colors[theme]['surface-container-highest'] }]} />

        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: Colors[theme]['secondary-container'] }]} />
          <Text style={[styles.statusText, { color: Colors[theme]['secondary'] }]}>
            On the way to pickup
          </Text>
          <View style={styles.avatarStack}>
            <View style={styles.avatarMini}>
              <Image source={{ uri: activeDelivery?.restaurant.image || '' }} style={styles.avatarMiniImg} />
            </View>
            <View style={[styles.avatarMini, { marginLeft: -12 }]}>
              <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjy6E5I4XwK9jG2KOF62ZuOL4JRv-ybFaR_x6-oPen6hTVJoo4rSw3-H9Ul_3c8ybX2LsIAdpptAmHsk_1we3xQmMqN9FKHRdlgNe7DTSBUf65PAQXc4ZXeUvw3ZARN7mRY6KQy19RzfBXFojbJh8_SkbxpXh5B8bVXEw6eJBn3mDfWh_3DY8V2_LhMmW2Cw6dAdV99q816STuMkdmcNaYehvQLhumQCUAmq7k0V9L-jV8Gu8grR4BJyCkmTTXJk_WfB8FRXLP7rw' }} style={styles.avatarMiniImg} />
            </View>
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
          <TouchableOpacity
            style={[styles.actionSecondary, { backgroundColor: Colors[theme]['secondary-fixed'] }]}
            onPress={handleNavigate}
          >
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
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'],
    paddingTop: 56,
    paddingBottom: Spacing.md,
    zIndex: 10,
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
    zIndex: 10,
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
  navEta: { ...Typography['label-sm'], color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  navDistance: { alignItems: 'center', paddingLeft: Spacing.md, borderLeftWidth: 1 },
  navDistanceValue: { ...Typography.display, color: '#ffffff', fontSize: 24 },
  navDistanceUnit: { ...Typography['label-sm'], color: 'rgba(255,255,255,0.8)' },
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
