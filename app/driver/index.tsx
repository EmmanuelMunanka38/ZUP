import { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { useDriverStore } from '@/store/driverStore';
import { useLocationStore } from '@/store/locationStore';
import { MapboxMap } from '@/components/map/MapboxMap';
import { MapControls } from '@/components/map/MapControls';

export default function DriverDashboardScreen() {
  const theme = 'light';
  const mapRef = useRef<any>(null);
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const {
    isOnline, earnings, totalDeliveries, requests,
    toggleOnline, fetchRequests, acceptDelivery, ignoreDelivery,
  } = useDriverStore();
  const request = requests[0];

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRecenter = useCallback(() => {
    if (currentLocation) {
      mapRef.current?.flyTo(currentLocation, 15);
    }
  }, [currentLocation]);

  const handleMyLocation = useCallback(() => {
    if (currentLocation) {
      mapRef.current?.flyTo(currentLocation, 16);
    }
  }, [currentLocation]);

  return (
    <View style={styles.container}>
      <MapboxMap
        ref={mapRef}
        initialCamera={{
          latitude: currentLocation?.latitude || -6.7924,
          longitude: currentLocation?.longitude || 39.2083,
          zoom: 14,
        }}
        style={styles.mapBg}
        markers={[
          ...(request ? [{ id: 'restaurant', latitude: currentLocation?.latitude || -6.7924, longitude: currentLocation?.longitude || 39.2083, title: request.restaurant.name, icon: 'store' as const, color: Colors[theme].primary }] : []),
          { id: 'driver', latitude: currentLocation?.latitude || -6.7924, longitude: currentLocation?.longitude || 39.2083, title: 'Driver', icon: 'bike' as const, color: Colors[theme].primary },
        ]}
      />

      <MapControls
        onRecenter={handleRecenter}
        onMyLocation={handleMyLocation}
      />

      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoIcon, { backgroundColor: Colors[theme]['primary-container'] }]}>
            <MaterialCommunityIcons name="bike" size={22} color="#ffffff" />
          </View>
          <View>
            <Text style={[styles.greeting, { color: Colors[theme]['on-surface-variant'] }]}>Good to see you</Text>
            <Text style={[styles.driverName, { color: Colors[theme]['on-surface'] }]}>Driver</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={Colors[theme]['on-surface']} />
          </TouchableOpacity>
          <View style={[styles.avatar, { borderColor: Colors[theme].primary }]}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="account" size={20} color={Colors[theme]['on-surface-variant']} />
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={styles.statusTop}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? Colors[theme].primary : Colors[theme]['on-surface-variant'] }]} />
              <Text style={[styles.statusText, { color: isOnline ? Colors[theme].primary : Colors[theme]['on-surface-variant'] }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleSwitch, { backgroundColor: isOnline ? Colors[theme].primary : Colors[theme]['surface-container-high'] }]}
              onPress={toggleOnline}
            >
              <View style={[styles.toggleKnob, { backgroundColor: '#ffffff', alignSelf: isOnline ? 'flex-end' : 'flex-start' }]} />
            </TouchableOpacity>
          </View>
          <View style={styles.earningsGrid}>
            <View style={[styles.earningBox, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
              <Text style={[styles.earningLabel, { color: Colors[theme]['on-surface-variant'] }]}>Today's Earnings</Text>
              <Text style={[styles.earningValue, { color: Colors[theme].primary }]}>{formatPrice(earnings)}</Text>
            </View>
            <View style={[styles.earningBox, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
              <Text style={[styles.earningLabel, { color: Colors[theme]['on-surface-variant'] }]}>Total Orders</Text>
              <Text style={[styles.earningValueLg, { color: Colors[theme]['on-surface'] }]}>{totalDeliveries}</Text>
            </View>
          </View>
        </View>

        {request ? (
          <View style={[styles.requestCard, { backgroundColor: Colors[theme]['surface'] }]}>
            <View style={[styles.requestHeader, { backgroundColor: Colors[theme]['surface-container-low'], borderBottomColor: Colors[theme]['surface-container'] }]}>
              <Text style={[styles.requestTitle, { color: Colors[theme].primary }]}>New Request Available</Text>
              <Text style={[styles.requestTimer, { color: Colors[theme]['on-surface-variant'] }]}>
                {`${String(Math.floor(request.timeLeft / 60)).padStart(2, '0')}:${String(request.timeLeft % 60).padStart(2, '0')} min left`}
              </Text>
            </View>

            <View style={styles.requestBody}>
              <View style={styles.requestRestaurant}>
                <View style={[styles.requestIcon, { backgroundColor: Colors[theme]['surface-container-high'] }]}>
                  <Image source={{ uri: request.restaurant.image }} style={styles.requestImage} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.requestName, { color: Colors[theme]['on-surface'] }]}>{request.restaurant.name}</Text>
                  <View style={styles.distanceRow}>
                    <MaterialCommunityIcons name="crosshairs-gps" size={14} color={Colors[theme]['on-surface-variant']} />
                    <Text style={[styles.requestDistance, { color: Colors[theme]['on-surface-variant'] }]}>{request.distance} km away from you</Text>
                  </View>
                </View>
                <View style={styles.feeBox}>
                  <Text style={[styles.feeValue, { color: Colors[theme]['secondary-container'] }]}>{formatPrice(request.deliveryFee)}</Text>
                  <Text style={[styles.feeLabel, { color: Colors[theme]['on-surface-variant'] }]}>Delivery Fee</Text>
                </View>
              </View>

              <View style={styles.routeSection}>
                <View style={styles.routeLine}>
                  <View style={[styles.routeDot, { backgroundColor: Colors[theme].primary }]} />
                  <View style={[styles.routeDash, { borderColor: Colors[theme]['outline-variant'] }]} />
                  <View style={[styles.routeDot, { backgroundColor: Colors[theme]['secondary-container'] }]} />
                </View>
                <View style={styles.routeInfo}>
                  <View>
                    <Text style={[styles.routeLabel, { color: Colors[theme]['on-surface-variant'] }]}>PICKUP</Text>
                    <Text style={[styles.routeAddress, { color: Colors[theme]['on-surface'] }]}>{request.pickup}</Text>
                  </View>
                  <View>
                    <Text style={[styles.routeLabel, { color: Colors[theme]['on-surface-variant'] }]}>DROP-OFF</Text>
                    <Text style={[styles.routeAddress, { color: Colors[theme]['on-surface'] }]}>{request.dropoff}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.requestActions}>
              <TouchableOpacity
                style={[styles.ignoreBtn, { borderColor: Colors[theme]['outline-variant'] }]}
                onPress={() => ignoreDelivery(request.id)}
              >
                <Text style={[styles.ignoreBtnText, { color: Colors[theme]['on-surface-variant'] }]}>Ignore</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: Colors[theme]['primary-container'] }]}
                onPress={async () => {
                  await acceptDelivery(request.id);
                  router.push('/driver/active-delivery');
                }}
              >
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.requestCard, { backgroundColor: Colors[theme]['surface'], padding: Spacing.lg, alignItems: 'center' }]}>
            <Text style={[styles.requestTitle, { color: Colors[theme]['on-surface-variant'] }]}>No new requests</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color={Colors[theme].primary} />
          <Text style={[styles.navLabel, { color: Colors[theme].primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="magnify" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="receipt" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="account" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Profile</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.chatFab, { backgroundColor: Colors[theme]['secondary-container'] }]}>
        <MaterialCommunityIcons name="chat-outline" size={24} color={Colors[theme]['on-secondary-container']} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  mapBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'], paddingTop: 56, paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoIcon: {
    width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center',
  },
  greeting: { ...Typography['label-sm'] },
  driverName: { ...Typography.h2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 40, height: 40, borderRadius: BorderRadius.full, borderWidth: 2, overflow: 'hidden' },
  avatarPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: Spacing['container-padding'], paddingTop: 0, paddingBottom: 200 },
  statusCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.md, marginBottom: Spacing.lg, ...Shadows.sm,
    borderWidth: 1, borderColor: Colors.light['outline-variant'],
  },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  statusText: { ...Typography['label-md'], fontWeight: '700' },
  toggleSwitch: { width: 56, height: 32, borderRadius: BorderRadius.full, padding: 2, justifyContent: 'center' },
  toggleKnob: { width: 28, height: 28, borderRadius: BorderRadius.full },
  earningsGrid: { flexDirection: 'row', gap: Spacing.md },
  earningBox: { flex: 1, borderRadius: BorderRadius.md, padding: Spacing.md },
  earningLabel: { ...Typography['label-sm'], textTransform: 'uppercase', letterSpacing: 0.5 },
  earningValue: { ...Typography.h1, marginTop: 4 },
  earningValueLg: { ...Typography.h1, marginTop: 4 },
  requestCard: {
    borderRadius: BorderRadius.xl, overflow: 'hidden',
    ...Shadows.lg, borderWidth: 1, borderColor: 'rgba(15,169,88,0.1)',
  },
  requestHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1,
  },
  requestTitle: { ...Typography['label-md'], fontWeight: '700' },
  requestTimer: { ...Typography['label-sm'] },
  requestBody: { padding: Spacing.md },
  requestRestaurant: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  requestIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, overflow: 'hidden' },
  requestImage: { width: '100%', height: '100%' },
  requestName: { ...Typography.h2 },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  requestDistance: { ...Typography['body-sm'] },
  feeBox: { alignItems: 'flex-end' },
  feeValue: { ...Typography.h2 },
  feeLabel: { ...Typography['label-sm'] },
  routeSection: { flexDirection: 'row', gap: Spacing.md },
  routeLine: { alignItems: 'center', width: 8, gap: 2 },
  routeDot: { width: 8, height: 8, borderRadius: 4 },
  routeDash: { flex: 1, width: 0, borderLeftWidth: 2, borderStyle: 'dashed', marginVertical: 2 },
  routeInfo: { flex: 1, justifyContent: 'space-between', gap: Spacing.md },
  routeLabel: { ...Typography['label-sm'], letterSpacing: 1 },
  routeAddress: { ...Typography['body-md'] },
  requestActions: {
    flexDirection: 'row', gap: Spacing.md, padding: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.light['surface-container'],
  },
  ignoreBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1.5, alignItems: 'center' },
  ignoreBtnText: { ...Typography['label-md'] },
  acceptBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, alignItems: 'center' },
  acceptBtnText: { ...Typography['label-md'], color: '#ffffff' },
  chatFab: {
    position: 'absolute', bottom: 96, right: Spacing['container-padding'],
    width: 56, height: 56, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center',
    ...Shadows.lg,
  },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 32,
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
    shadowColor: '#0fa958', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 8,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { ...Typography['label-sm'] },
});
