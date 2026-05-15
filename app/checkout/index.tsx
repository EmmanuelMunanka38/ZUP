import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';
import { ordersService } from '@/services/orders.service';
import { useAuthStore } from '@/store/authStore';

type PaymentOption = 'mpesa' | 'tigo' | 'airtel' | 'card' | 'cash';

const PAYMENT_MAP: Record<PaymentOption, string> = {
  mpesa: 'mpesa',
  tigo: 'tigo_pesa',
  airtel: 'airtel_money',
  card: 'card',
  cash: 'cash',
};

const paymentMethods: { id: PaymentOption; name: string; color: string; label?: string; iconName?: string }[] = [
  { id: 'mpesa', name: 'Vodacom M-Pesa', color: '#E60000', label: 'M-PESA' },
  { id: 'tigo', name: 'Tigo Pesa', color: '#0066B3', label: 'Tigo' },
  { id: 'airtel', name: 'Airtel Money', color: '#FF0000', label: 'Airtel' },
  { id: 'card', name: 'Visa / Mastercard', color: '#3D4A3E', iconName: 'credit-card-outline' },
  { id: 'cash', name: 'Cash on Delivery', color: '#FDC003', iconName: 'cash' },
];

export default function CheckoutScreen() {
  const theme = 'light';
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption>('mpesa');
  const [isPlacing, setIsPlacing] = useState(false);

  const { items, restaurantId, restaurantName, subtotal, clearCart } = useCartStore();

  const deliveryFee = 2500;
  const serviceFee = 500;
  const total = subtotal() + deliveryFee + serviceFee;

  const handlePlaceOrder = async () => {
    if (!restaurantId || items.length === 0) {
      Alert.alert('Cart Empty', 'Add items to your cart before placing an order.');
      return;
    }

    setIsPlacing(true);
    try {
      const user = useAuthStore.getState().user;
      const order = await ordersService.placeOrder({
        restaurantId,
        items: items,
        paymentMethod: PAYMENT_MAP[selectedPayment] as any,
        deliveryAddress: {
          id: 'a1',
          label: 'Home',
          street: 'Chole Road',
          area: 'Masaki',
          city: 'Dar es Salaam',
          isDefault: true,
        },
      });

      clearCart();
      router.replace(`/checkout/track-order?id=${order.id}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to place order';
      Alert.alert('Order Failed', message);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Colors[theme].primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Checkout</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="help-circle-outline" size={22} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
          Delivery Address
        </Text>
        <View style={[styles.addressCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={styles.addressRow}>
            <View style={[styles.addressIcon, { backgroundColor: Colors[theme]['primary-container'] }]}>
              <MaterialCommunityIcons name="map-marker" size={24} color={Colors[theme].primary} />
            </View>
            <View style={styles.addressInfo}>
              <Text style={[styles.addressLabel, { color: Colors[theme]['on-surface'] }]}>Home</Text>
              <Text style={[styles.addressText, { color: Colors[theme]['on-surface-variant'] }]}>
                Chole Road, Masaki, Dar es Salaam
              </Text>
            </View>
          </View>
        </View>

        {restaurantName && (
          <>
            <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
              Restaurant
            </Text>
            <View style={[styles.addressCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
              <View style={styles.addressRow}>
                <View style={[styles.addressIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
                  <MaterialCommunityIcons name="store" size={24} color={Colors[theme].primary} />
                </View>
                <View style={styles.addressInfo}>
                  <Text style={[styles.addressLabel, { color: Colors[theme]['on-surface'] }]}>
                    {restaurantName}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
          Payment Method
        </Text>
        <View style={[styles.paymentCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          {paymentMethods.map((method, index) => (
            <TouchableOpacity
              key={method.id}
              onPress={() => setSelectedPayment(method.id)}
              style={[
                styles.paymentRow,
                {
                  borderBottomWidth: index < paymentMethods.length - 1 ? 1 : 0,
                  borderBottomColor: Colors[theme]['surface-variant'],
                },
              ]}
            >
              <View style={styles.paymentLeft}>
                <View style={[styles.paymentIcon, { backgroundColor: method.color }]}>
                  {method.iconName ? (
                    <MaterialCommunityIcons name={method.iconName as any} size={20} color="#ffffff" />
                  ) : (
                    <Text style={styles.paymentIconText}>{method.label}</Text>
                  )}
                </View>
                <Text style={[styles.paymentName, { color: Colors[theme]['on-surface'] }]}>
                  {method.name}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor:
                      selectedPayment === method.id
                        ? Colors[theme].primary
                        : Colors[theme]['outline'],
                  },
                ]}
              >
                {selectedPayment === method.id && (
                  <View style={[styles.radioInner, { backgroundColor: Colors[theme].primary }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
          Order Summary
        </Text>
        <View style={[styles.summaryCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          {items.map((item) => (
            <View key={item.id}>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryItemImage, { backgroundColor: Colors[theme]['surface-container'] }]}>
                  <MaterialCommunityIcons name="food" size={24} color={Colors[theme]['on-surface-variant']} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.summaryItemName, { color: Colors[theme]['on-surface'] }]}>
                    {item.menuItem.name} x{item.quantity}
                  </Text>
                  {item.specialInstructions && (
                    <Text style={[styles.summaryItemNote, { color: Colors[theme]['on-surface-variant'] }]}>
                      {item.specialInstructions}
                    </Text>
                  )}
                </View>
                <Text style={[styles.summaryItemPrice, { color: Colors[theme]['on-surface'] }]}>
                  {formatPrice(item.menuItem.price * item.quantity)}
                </Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            </View>
          ))}

          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors[theme]['on-surface-variant'] }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: Colors[theme]['on-surface-variant'] }]}>{formatPrice(subtotal())}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors[theme]['on-surface-variant'] }]}>Delivery Fee</Text>
              <Text style={[styles.summaryValue, { color: Colors[theme]['on-surface-variant'] }]}>{formatPrice(deliveryFee)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors[theme]['on-surface-variant'] }]}>Service Fee</Text>
              <Text style={[styles.summaryValue, { color: Colors[theme]['on-surface-variant'] }]}>{formatPrice(serviceFee)}</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: Colors[theme]['on-surface'] }]}>Total</Text>
              <Text style={[styles.totalValue, { color: Colors[theme].primary }]}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: Colors[theme].surface, borderTopColor: Colors[theme]['surface-container'] }]}>
        <View>
          <Text style={[styles.bottomLabel, { color: Colors[theme]['on-surface-variant'] }]}>Total Payment</Text>
          <Text style={[styles.bottomTotal, { color: Colors[theme].primary }]}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderBtn, { backgroundColor: isPlacing ? Colors[theme]['surface-container-high'] : Colors[theme].primary }]}
          onPress={handlePlaceOrder}
          disabled={isPlacing}
        >
          {isPlacing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#ffffff" />
            </>
          )}
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
  },
  headerTitle: { ...Typography.h1 },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 140 },
  sectionTitle: { ...Typography.h2, marginBottom: Spacing.md, marginTop: Spacing.md },
  addressCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.light['surface-variant'],
  },
  addressRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  addressIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  addressInfo: { flex: 1, gap: 4 },
  addressLabel: { ...Typography['label-md'] },
  addressText: { ...Typography['body-sm'] },
  paymentCard: {
    borderRadius: BorderRadius.xl,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.light['surface-variant'],
    overflow: 'hidden',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },
  paymentName: { ...Typography['label-md'] },
  radio: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 12, height: 12, borderRadius: BorderRadius.full },
  summaryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.light['surface-variant'],
  },
  summaryItem: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  summaryItemImage: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  summaryItemName: { ...Typography['label-md'] },
  summaryItemNote: { ...Typography['body-sm'] },
  summaryItemPrice: { ...Typography['label-md'] },
  summaryDivider: { height: 1, marginVertical: Spacing.md },
  summaryRows: { gap: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { ...Typography['body-sm'] },
  summaryValue: { ...Typography['body-sm'] },
  totalLabel: { ...Typography.h2 },
  totalValue: { ...Typography.h2 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'],
    paddingVertical: Spacing.md,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  bottomLabel: { ...Typography['label-sm'] },
  bottomTotal: { ...Typography.h1 },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  placeOrderText: { ...Typography['label-md'], color: '#ffffff' },
});