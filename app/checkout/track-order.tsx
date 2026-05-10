import { useEffect, useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useOrderStore } from '@/store/orderStore';
import { useLocationStore } from '@/store/locationStore';
import { useDriverTracking } from '@/hooks/use-driver-tracking';
import { useDriverStore } from '@/store/driverStore';
import { MapView } from '@/components/map/MapView';
import { AnimatedCarMarker } from '@/components/map/AnimatedCarMarker';
import { UserLocationMarker } from '@/components/map/UserLocationMarker';
import { RestaurantMarker } from '@/components/map/RestaurantMarker';
import { DeliveryRoute } from '@/components/map/DeliveryRoute';
import { MapControls } from '@/components/map/MapControls';
import { OrderTrackingBottomSheet } from '@/components/tracking/OrderTrackingBottomSheet';
import { getStatusLabel, getStatusSequence } from '@/store/trackingStore';
import { Coordinate } from '@/types';

const DAR_CENTER: Coordinate = { latitude: -6.7924, longitude: 39.2083 };
const RESTAURANT_LOCATION: Coordinate = { latitude: -6.789, longitude: 39.205 };
const CUSTOMER_LOCATION: Coordinate = { latitude: -6.797, longitude: 39.215 };

export default function TrackOrderScreen() {
  const theme = 'light';
  const [isLoading, setIsLoading] = useState(true);
  const trackedOrder = useOrderStore((s) => s.trackedOrder);
  const loadTrackedOrder = useOrderStore((s) => s.loadTrackedOrder);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const rider = useDriverStore((s) => s.rider);

  const {
    currentStatus,
    estimatedMinutes,
    estimatedArrival,
    driverLocation,
    driverHeading,
    route,
  } = useDriverTracking('o1');

  const mapRef = useRef<any>(null);

  useEffect(() => {
    loadTrackedOrder('order-1');
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [loadTrackedOrder]);

  const statusSequence = getStatusSequence();

  const handleRecenter = useCallback(() => {
    if (driverLocation) {
      mapRef.current?.flyTo(driverLocation, 15);
    } else if (currentLocation) {
      mapRef.current?.flyTo(currentLocation, 14);
    } else {
      mapRef.current?.flyTo(DAR_CENTER, 13);
    }
  }, [driverLocation, currentLocation]);

  const handleMyLocation = useCallback(() => {
    if (currentLocation) {
      mapRef.current?.flyTo(currentLocation, 16);
    }
  }, [currentLocation]);

  const handleZoomIn = useCallback(() => {}, []);
  const handleZoomOut = useCallback(() => {}, []);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme].primary} />
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
        <MapView
          ref={mapRef}
          initialCoordinate={DAR_CENTER}
          zoomLevel={13}
          scrollEnabled
          zoomEnabled
        >
          {currentLocation && (
            <UserLocationMarker coordinate={currentLocation} id="customer-location" />
          )}

          <RestaurantMarker
            coordinate={RESTAURANT_LOCATION}
            name="Chui's Italian Kitchen"
            rating={4.8}
            deliveryTime="25-35 min"
            id="restaurant-marker"
          />

          {driverLocation && (
            <AnimatedCarMarker
              coordinate={driverLocation}
              heading={driverHeading}
              id="driver-marker"
            />
          )}

          {driverLocation && currentLocation && (
            <DeliveryRoute
              origin={driverLocation}
              destination={currentLocation}
              coordinates={route?.coordinates}
              id="delivery-route"
            />
          )}
        </MapView>

        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
          onMyLocation={handleMyLocation}
        />
      </View>

      <OrderTrackingBottomSheet
        currentStatus={currentStatus || 'restaurant_confirmed'}
        statusSequence={statusSequence}
        getStatusLabel={getStatusLabel}
        estimatedMinutes={estimatedMinutes}
        estimatedArrival={estimatedArrival}
        rider={rider}
        orderNumber="PIKI-8829"
        isLoading={isLoading}
        onViewDetails={() => {}}
        onCall={() => {}}
        onMessage={() => {}}
        theme={theme}
      />
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
});
