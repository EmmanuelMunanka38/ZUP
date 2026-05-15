import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image, Animated, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useOrderStore } from '@/store/orderStore';
import { useTrackingStore } from '@/store/trackingStore';
import { useLocationStore } from '@/store/locationStore';
import { formatPrice, getStatusLabel } from '@/utils/format';
import { OrderStatus, Coordinate } from '@/types';
import { MapView } from '@/components/map/MapView';
import { MapControls } from '@/components/map/MapControls';
import { RestaurantMarker } from '@/components/map/RestaurantMarker';
import { AnimatedCarMarker } from '@/components/map/AnimatedCarMarker';
import { UserLocationMarker } from '@/components/map/UserLocationMarker';
import { DeliveryRoute } from '@/components/map/DeliveryRoute';

const DAR_CENTER: Coordinate = { latitude: -6.7924, longitude: 39.2083 };

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Restaurant confirmed', icon: 'clipboard-check-outline' as const },
  { key: 'preparing', label: 'Preparing your order', icon: 'food-variant' as const },
  { key: 'on_the_way', label: 'On the way', icon: 'bike-fast' as const },
  { key: 'arrived', label: 'Arrived', icon: 'map-marker-check' as const },
  { key: 'delivered', label: 'Delivered', icon: 'check-circle-outline' as const },
];

const ORDER_STATUS_MAP: Record<string, number> = {
  pending: -1,
  confirmed: 0,
  preparing: 1,
  on_the_way: 2,
  arrived: 3,
  delivered: 4,
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#fdc003',
  confirmed: '#0fa958',
  preparing: '#0fa958',
  on_the_way: '#0fa958',
  arrived: '#0fa958',
  delivered: '#0fa958',
  cancelled: '#ba1a1a',
};

export default function TrackOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = 'light';
  const mapRef = useRef<any>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const statusAnim = useRef(new Animated.Value(0)).current;

  const currentOrder = useOrderStore((s) => s.currentOrder);
  const loadCurrentOrder = useOrderStore((s) => s.loadCurrentOrder);
  const cancelOrder = useOrderStore((s) => s.cancelOrder);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetIndex, setSheetIndex] = useState(0);

  const {
    estimatedMinutes,
    estimatedArrival,
    driverLocation,
    driverHeading,
    route,
    connect: connectTracking,
    disconnect: disconnectTracking,
  } = useTrackingStore();

  const userLocation = useLocationStore((s) => s.currentLocation);
  const deliveryCoord = userLocation || DAR_CENTER;

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    loadCurrentOrder(id)
      .then(() => connectTracking(id))
      .catch(() => setError('Failed to load order'))
      .finally(() => setIsLoading(false));
    return () => disconnectTracking();
  }, [id, loadCurrentOrder, connectTracking, disconnectTracking]);

  useEffect(() => {
    Animated.timing(statusAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [currentOrder?.status]);

  const handleCancel = useCallback(() => {
    if (!id) return;
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setIsCancelling(true);
          try {
            await cancelOrder(id);
          } catch {
            Alert.alert('Error', 'Failed to cancel order');
          } finally {
            setIsCancelling(false);
          }
        },
      },
    ]);
  }, [id, cancelOrder]);

  const handleSheetChange = useCallback((index: number) => {
    setSheetIndex(index);
  }, []);

  const snapPoints = useMemo(() => ['20%', '45%', '85%'], []);

  const order = currentOrder;
  const isCancelled = order?.status === 'cancelled';
  const isDelivered = order?.status === 'delivered';
  const isActive = !isCancelled && !isDelivered;
  const canCancel = order && ['pending', 'confirmed'].includes(order.status);
  const rider = order?.rider;

  const statusIndex = order ? ORDER_STATUS_MAP[order.status] ?? -1 : -1;

  const handleRecenter = useCallback(() => {
    if (driverLocation) {
      mapRef.current?.flyTo(driverLocation, 15);
    } else {
      mapRef.current?.flyTo(DAR_CENTER, 14);
    }
  }, [driverLocation]);

  const handleMyLocation = useCallback(() => {
    if (userLocation) {
      mapRef.current?.flyTo(userLocation, 16);
    } else {
      handleRecenter();
    }
  }, [userLocation, handleRecenter]);

  const handleCall = useCallback(() => {
    if (rider?.phone) {
      // Linking.openURL(`tel:${rider.phone}`);
    }
  }, [rider]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors[theme].primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.center, { backgroundColor: Colors[theme].background }]}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors[theme]['on-surface-variant']} />
        <Text style={[styles.errorText, { color: Colors[theme]['on-surface-variant'] }]}>
          {error || 'Order not found'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: Colors[theme].primary }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[order.status] || Colors[theme].primary;

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Full-screen Map */}
        <MapView
          ref={mapRef}
          initialCoordinate={DAR_CENTER}
          zoomLevel={14}
          scrollEnabled
          zoomEnabled
          showUserLocation
          style={StyleSheet.absoluteFillObject}
        >
          <RestaurantMarker
            coordinate={{ latitude: -6.7924, longitude: 39.2083 }}
            name={order.restaurant.name}
            id="order-restaurant"
          />
          {driverLocation && (
            <AnimatedCarMarker
              coordinate={driverLocation}
              heading={driverHeading}
              id="tracking-driver"
              color={Colors[theme].primary}
            />
          )}
          <UserLocationMarker coordinate={deliveryCoord} id="delivery-location" />
          {driverLocation && (
            <DeliveryRoute
              origin={driverLocation}
              destination={deliveryCoord}
              coordinates={route?.coordinates}
              id="tracking-route"
            />
          )}
        </MapView>

        {/* Header overlay */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerLabel}>Order #{order.orderNumber}</Text>
            <Text style={[styles.headerEta, { color: '#ffffff' }]}>
              {estimatedArrival || (order.estimatedDelivery
                ? new Date(order.estimatedDelivery).toLocaleTimeString('en-US', {
                    hour: 'numeric', minute: '2-digit', hour12: true,
                  })
                : '')}
            </Text>
          </View>
          {canCancel && (
            <TouchableOpacity
              onPress={handleCancel}
              disabled={isCancelling}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>{isCancelling ? '...' : 'Cancel'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Map controls */}
        <MapControls
          onRecenter={handleRecenter}
          onMyLocation={handleMyLocation}
          showZoom={false}
          showMyLocation
        />

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
          handleIndicatorStyle={styles.handleIndicator}
          handleStyle={styles.handleContainer}
          backgroundStyle={[styles.sheetBackground, { backgroundColor: Colors[theme].surface }]}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={0} appearsOnIndex={1} opacity={0.3} />
          )}
          enablePanDownToClose={false}
          animateOnMount
        >
          <BottomSheetScrollView
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Collapsed view (always visible) */}
            <View style={styles.collapsedRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <View style={styles.collapsedInfo}>
                <Text style={[styles.collapsedStatus, { color: Colors[theme]['on-surface'] }]}>
                  {getStatusLabel(order.status)}
                </Text>
                <Text style={[styles.collapsedEta, { color: Colors[theme]['on-surface-variant'] }]}>
                  {estimatedMinutes > 0 ? `${estimatedMinutes} min away` : 'Arriving now'}
                </Text>
              </View>
              {rider && (
                <View style={styles.collapsedDriver}>
                  <View style={[styles.driverAvatarSmall, { backgroundColor: Colors[theme]['surface-container'] }]}>
                    <MaterialCommunityIcons name="account" size={20} color={Colors[theme].primary} />
                  </View>
                  <Text style={[styles.driverNameSmall, { color: Colors[theme]['on-surface'] }]}>{rider.name}</Text>
                </View>
              )}
            </View>

            {/* Driver info card */}
            {rider && (
              <View style={[styles.driverCard, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['surface-variant'] }]}>
                <View style={styles.driverCardLeft}>
                  <View style={[styles.driverAvatar, { backgroundColor: Colors[theme]['surface-container'] }]}>
                    <MaterialCommunityIcons name="account" size={32} color={Colors[theme].primary} />
                  </View>
                  <View>
                    <Text style={[styles.driverName, { color: Colors[theme]['on-surface'] }]}>{rider.name}</Text>
                    <Text style={[styles.driverVehicle, { color: Colors[theme]['on-surface-variant'] }]}>
                      {rider.vehicle} · {rider.plateNumber}
                    </Text>
                    <View style={styles.driverRating}>
                      <MaterialCommunityIcons name="star" size={14} color={Colors[theme]['secondary-container']} />
                      <Text style={[styles.driverRatingText, { color: Colors[theme]['on-surface-variant'] }]}>{rider.rating}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.driverActions}>
                  <TouchableOpacity onPress={handleCall} style={[styles.driverActionBtn, { backgroundColor: Colors[theme].primary }]}>
                    <MaterialCommunityIcons name="phone" size={20} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.driverActionBtn, { backgroundColor: Colors[theme]['surface-container-high'] }]}>
                    <MaterialCommunityIcons name="message-text" size={20} color={Colors[theme].primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Delivery info */}
            <View style={[styles.infoCard, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['surface-variant'] }]}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={Colors[theme].primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: Colors[theme]['on-surface-variant'] }]}>Estimated arrival</Text>
                  <Text style={[styles.infoValue, { color: Colors[theme]['on-surface'] }]}>
                    {estimatedArrival || (order.estimatedDelivery
                      ? new Date(order.estimatedDelivery).toLocaleTimeString('en-US', {
                          hour: 'numeric', minute: '2-digit', hour12: true,
                        })
                      : '--')}
                  </Text>
                </View>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors[theme].primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: Colors[theme]['on-surface-variant'] }]}>Delivering to</Text>
                  <Text style={[styles.infoValue, { color: Colors[theme]['on-surface'] }]}>
                    {typeof order.deliveryAddress === 'object' && 'street' in order.deliveryAddress
                      ? `${order.deliveryAddress.street}, ${order.deliveryAddress.area}`
                      : 'Your location'}
                  </Text>
                </View>
              </View>
              <View style={[styles.infoDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="store-outline" size={20} color={Colors[theme].primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: Colors[theme]['on-surface-variant'] }]}>From</Text>
                  <Text style={[styles.infoValue, { color: Colors[theme]['on-surface'] }]}>{order.restaurant.name}</Text>
                </View>
              </View>
            </View>

            {/* Status timeline */}
            <View style={[styles.timelineCard, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['surface-variant'] }]}>
              <Text style={[styles.timelineTitle, { color: Colors[theme]['on-surface'] }]}>Order status</Text>
              {isCancelled ? (
                <View style={styles.cancelledRow}>
                  <MaterialCommunityIcons name="close-circle" size={24} color={Colors[theme].error} />
                  <Text style={[styles.cancelledText, { color: Colors[theme].error }]}>Order was cancelled</Text>
                </View>
              ) : (
                STATUS_STEPS.map((step, i) => {
                  const isCompleted = statusIndex >= i;
                  const isCurrent = statusIndex === i;
                  const isActiveDelivery = order.status === 'on_the_way' || order.status === 'arrived';

                  return (
                    <View key={step.key} style={styles.timelineStep}>
                      <View style={styles.timelineLeft}>
                        <View style={[
                          styles.timelineDot,
                          {
                            backgroundColor: isCompleted ? Colors[theme].primary : Colors[theme]['surface-container-high'],
                            borderColor: isCurrent ? Colors[theme].primary : 'transparent',
                            borderWidth: isCurrent ? 3 : 0,
                          },
                        ]}>
                          {isCompleted && (
                            <MaterialCommunityIcons
                              name="check"
                              size={10}
                              color="#ffffff"
                              style={styles.timelineDotCheck}
                            />
                          )}
                        </View>
                        {i < STATUS_STEPS.length - 1 && (
                          <View style={[
                            styles.timelineLine,
                            { backgroundColor: isCompleted ? Colors[theme].primary : Colors[theme]['surface-container-high'] },
                          ]} />
                        )}
                      </View>
                      <View style={styles.timelineRight}>
                        <Text style={[
                          styles.timelineLabel,
                          {
                            color: isCompleted ? Colors[theme]['on-surface'] : Colors[theme]['on-surface-variant'],
                            fontWeight: isCurrent ? '700' : '400',
                          },
                        ]}>
                          {step.label}
                        </Text>
                        {isCurrent && isActiveDelivery && estimatedMinutes > 0 && (
                          <Text style={[styles.timelineEta, { color: Colors[theme].primary }]}>
                            {estimatedMinutes} min remaining
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Order items summary */}
            <View style={[styles.itemsCard, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['surface-variant'] }]}>
              <Text style={[styles.itemsTitle, { color: Colors[theme]['on-surface'] }]}>Order items</Text>
              {order.items.map((item) => (
                <View key={item.id || item.menuItemId} style={styles.itemRow}>
                  <Text style={[styles.itemQty, { color: Colors[theme]['on-surface-variant'] }]}>{item.quantity}x</Text>
                  <Text style={[styles.itemName, { color: Colors[theme]['on-surface'] }]}>{item.name}</Text>
                  <Text style={[styles.itemPrice, { color: Colors[theme]['on-surface'] }]}>{formatPrice(item.price * item.quantity)}</Text>
                </View>
              ))}
              <View style={[styles.itemsDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: Colors[theme]['on-surface-variant'] }]}>Subtotal</Text>
                <Text style={[styles.totalValue, { color: Colors[theme]['on-surface'] }]}>{formatPrice(order.subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: Colors[theme]['on-surface-variant'] }]}>Delivery fee</Text>
                <Text style={[styles.totalValue, { color: Colors[theme]['on-surface'] }]}>{formatPrice(order.deliveryFee)}</Text>
              </View>
              {order.serviceFee > 0 && (
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: Colors[theme]['on-surface-variant'] }]}>Service fee</Text>
                  <Text style={[styles.totalValue, { color: Colors[theme]['on-surface'] }]}>{formatPrice(order.serviceFee)}</Text>
                </View>
              )}
              <View style={[styles.totalDivider, { backgroundColor: Colors[theme].primary }]} />
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabelBold, { color: Colors[theme]['on-surface'] }]}>Total</Text>
                <Text style={[styles.totalValueBold, { color: Colors[theme].primary }]}>{formatPrice(order.total)}</Text>
              </View>
            </View>

            {/* Payment method */}
            <View style={[styles.paymentCard, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['surface-variant'] }]}>
              <View style={styles.paymentRow}>
                <MaterialCommunityIcons name="credit-card-outline" size={20} color={Colors[theme].primary} />
                <Text style={[styles.paymentLabel, { color: Colors[theme]['on-surface'] }]}>
                  Paid via {order.paymentMethod === 'mpesa' ? 'M-Pesa' : order.paymentMethod}
                </Text>
              </View>
            </View>

            {/* Spacer for safe area */}
            <View style={{ height: 32 }} />
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  errorText: { ...Typography['body-md'] },
  backBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.xl },
  backBtnText: { ...Typography['label-md'], color: '#ffffff' },

  // Header
  headerOverlay: {
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
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerLabel: { ...Typography['label-sm'], color: 'rgba(255,255,255,0.8)' },
  headerEta: { ...Typography.h2 },
  cancelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(186,26,26,0.8)',
  },
  cancelBtnText: { ...Typography['label-md'], color: '#ffffff', fontWeight: '600' },

  // Bottom sheet
  handleContainer: { paddingTop: Spacing.sm },
  handleIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.light['surface-container-highest'],
  },
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 16,
  },
  sheetScrollContent: { paddingHorizontal: Spacing['container-padding'], paddingTop: Spacing.sm },

  // Collapsed
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  collapsedInfo: { flex: 1 },
  collapsedStatus: { ...Typography.h2 },
  collapsedEta: { ...Typography['body-sm'], marginTop: 2 },
  collapsedDriver: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  driverAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverNameSmall: { ...Typography['label-md'], fontWeight: '600' },

  // Driver card
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  driverCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: { ...Typography.h2 },
  driverVehicle: { ...Typography['body-sm'], marginTop: 2 },
  driverRating: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  driverRatingText: { ...Typography['label-sm'] },
  driverActions: { flexDirection: 'row', gap: Spacing.sm },
  driverActionBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },

  // Info card
  infoCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  infoContent: { flex: 1 },
  infoLabel: { ...Typography['label-sm'] },
  infoValue: { ...Typography['body-md'], fontWeight: '600', marginTop: 1 },
  infoDivider: { height: 1, marginVertical: Spacing.xs, marginLeft: 36 },

  // Timeline
  timelineCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  timelineTitle: { ...Typography.h2, marginBottom: Spacing.md },
  timelineStep: { flexDirection: 'row', minHeight: 52 },
  timelineLeft: { alignItems: 'center', width: 24, marginRight: Spacing.md },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCheck: { lineHeight: 12 },
  timelineLine: { width: 2, flex: 1, marginVertical: 2 },
  timelineRight: { flex: 1, justifyContent: 'center', paddingBottom: Spacing.sm },
  timelineLabel: { ...Typography['body-md'] },
  timelineEta: { ...Typography['label-sm'], marginTop: 2 },
  cancelledRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cancelledText: { ...Typography['body-md'], fontWeight: '600' },

  // Items
  itemsCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  itemsTitle: { ...Typography.h2, marginBottom: Spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  itemQty: { ...Typography['body-md'], width: 32 },
  itemName: { ...Typography['body-md'], flex: 1 },
  itemPrice: { ...Typography['body-md'], fontWeight: '600' },
  itemsDivider: { height: 1, marginVertical: Spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  totalLabel: { ...Typography['body-sm'] },
  totalValue: { ...Typography['body-sm'] },
  totalDivider: { height: 2, marginVertical: Spacing.sm },
  totalLabelBold: { ...Typography['body-md'], fontWeight: '700' },
  totalValueBold: { ...Typography['body-md'], fontWeight: '700' },

  // Payment
  paymentCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  paymentLabel: { ...Typography['body-md'] },

  // Status dot (shared)
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
