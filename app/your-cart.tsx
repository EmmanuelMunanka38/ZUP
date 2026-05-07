import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';

export default function CartScreen() {
  const theme = 'light';

  const items = useCartStore((s) => s.items);
  const storeUpdateQty = useCartStore((s) => s.updateQty);
  const subtotal = useCartStore((s) => s.subtotal());
  const itemCount = useCartStore((s) => s.itemCount());
  const deliveryFee = 3500;
  const total = subtotal + deliveryFee;

  const updateQty = (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      storeUpdateQty(id, item.quantity + delta);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Colors[theme].primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerLabel, { color: Colors[theme]['on-surface-variant'] }]}>Review Order</Text>
          <Text style={[styles.restaurantName, { color: Colors[theme].primary }]}>
            The Terrace Swahili Bistro
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="cart-outline" size={22} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>Your Basket</Text>
          <Text style={[styles.itemCount, { color: Colors[theme].primary }]}>{itemCount} Items</Text>
        </View>

        <View style={styles.itemsSection}>
          {items.map((item) => (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
              <View style={styles.itemRow}>
                <Image source={{ uri: item.menuItem.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: Colors[theme]['on-surface'] }]} numberOfLines={1}>
                    {item.menuItem.name}
                  </Text>
                  {item.specialInstructions && (
                    <Text style={[styles.itemNote, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={1}>
                      {item.specialInstructions}
                    </Text>
                  )}
                  <View style={styles.itemBottom}>
                    <Text style={[styles.itemPrice, { color: Colors[theme].primary }]}>
                      {formatPrice(item.menuItem.price)}
                    </Text>
                    <View style={[styles.qtyRow, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
                      <TouchableOpacity
                        onPress={() => updateQty(item.id, -1)}
                        style={[styles.qtyBtn, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}
                      >
                        <MaterialCommunityIcons name="minus" size={18} color={Colors[theme].primary} />
                      </TouchableOpacity>
                      <Text style={[styles.qtyValue, { color: Colors[theme]['on-surface'] }]}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateQty(item.id, 1)}
                        style={[styles.qtyBtnPlus, { backgroundColor: Colors[theme].primary }]}
                      >
                        <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.promoCard, { backgroundColor: Colors[theme]['surface-container-low'], borderColor: Colors[theme]['outline-variant'] }]}>
          <MaterialCommunityIcons name="ticket-outline" size={24} color={Colors[theme]['secondary-container']} />
          <Text style={[styles.promoInput, { color: Colors[theme]['on-surface-variant'] }]}>Enter Promo Code</Text>
          <TouchableOpacity style={[styles.applyBtn, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
            <Text style={[styles.applyText, { color: Colors[theme].primary }]}>Apply</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: Colors[theme]['surface-container-highest'] }]}>
          <Text style={[styles.summaryTitle, { color: Colors[theme]['on-surface'] }]}>
            Order Summary
          </Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors[theme]['on-surface-variant'] }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: Colors[theme]['on-surface-variant'] }]}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors[theme]['on-surface-variant'] }]}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, { color: Colors[theme]['on-surface-variant'] }]}>{formatPrice(deliveryFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors[theme]['on-surface-variant'] }]}>Service Fee</Text>
            <Text style={[styles.summaryValue, { color: Colors[theme]['on-surface-variant'] }]}>TSh 1,200</Text>
          </View>
          <View style={[styles.summaryDivider, { borderTopColor: Colors[theme]['outline-variant'] }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: Colors[theme]['on-surface'] }]}>Total</Text>
            <Text style={[styles.totalValue, { color: Colors[theme].primary }]}>{formatPrice(total)}</Text>
          </View>
        </View>


      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: Colors[theme].surface, borderTopColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.bottomRow}>
          <View style={styles.bottomLeft}>
            <Text style={[styles.bottomTotalLabel, { color: Colors[theme]['on-surface-variant'] }]}>
              Estimated Delivery
            </Text>
            <View style={styles.estDeliveryRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={Colors[theme].secondary} />
              <Text style={[styles.estDeliveryText, { color: Colors[theme]['on-surface'] }]}>
                25 - 35 mins
              </Text>
            </View>
          </View>
          <View style={styles.bottomRight}>
            <Text style={[styles.bottomTotalLabel, { color: Colors[theme]['on-surface-variant'] }]}>
              Total Payable
            </Text>
            <Text style={[styles.bottomTotalValue, { color: Colors[theme].primary }]}>
              {formatPrice(total)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, { backgroundColor: Colors[theme].primary }]}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" />
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerLabel: { ...Typography['label-sm'] },
  restaurantName: { ...Typography.h2 },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 200 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h2 },
  itemCount: { ...Typography['label-md'] },
  itemsSection: { gap: Spacing.md, marginBottom: Spacing.md },
  itemCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: 'rgba(229, 226, 225, 0.2)',
  },
  itemRow: { flexDirection: 'row', gap: Spacing.md },
  itemImage: { width: 80, height: 80, borderRadius: BorderRadius.md },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { ...Typography['label-md'] },
  itemNote: { ...Typography['body-sm'] },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  itemPrice: { ...Typography.h2 },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    padding: 2,
    gap: Spacing.sm,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  qtyBtnPlus: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  qtyValue: { ...Typography['label-md'], minWidth: 16, textAlign: 'center' },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  promoInput: { flex: 1, ...Typography['body-md'] },
  applyBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  applyText: { ...Typography['label-md'] },
  summaryCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  summaryTitle: { ...Typography['label-md'], textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { ...Typography['body-md'] },
  summaryValue: { ...Typography['body-md'] },
  summaryDivider: { borderTopWidth: 1, marginVertical: Spacing.sm },
  totalLabel: { ...Typography.h2 },
  totalValue: { ...Typography.h1 },
  upsellTitle: { ...Typography.h2, marginBottom: Spacing.md },
  upsellRow: { gap: Spacing.md },
  upsellCard: {
    width: 140,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  upsellImage: { height: 140 },
  upsellInfo: { padding: Spacing.sm },
  upsellName: { ...Typography['label-sm'] },
  upsellPrice: { ...Typography['label-sm'], fontWeight: '700' },
  upsellAddBtn: {
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  upsellAddText: { ...Typography['label-sm'] },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing['container-padding'],
    paddingVertical: Spacing.md,
    paddingBottom: 32,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bottomLeft: { gap: 4 },
  estDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  estDeliveryText: { ...Typography['label-md'] },
  bottomRight: { alignItems: 'flex-end' },
  bottomTotalLabel: { ...Typography['label-sm'] },
  bottomTotalValue: { ...Typography.h2 },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  checkoutBtnText: { ...Typography.h2, color: '#ffffff' },
});
