import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice } from '@/utils/format';

interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'tigo_pesa' | 'airtel_money' | 'card' | 'cash';
  label: string;
  details: string;
  isDefault: boolean;
}

const paymentMethods: PaymentMethod[] = [
  { id: '1', type: 'mpesa', label: 'M-Pesa', details: '+255 712 345 678', isDefault: true },
  { id: '2', type: 'card', label: 'Visa Card', details: '**** 4821', isDefault: false },
];

const typeIcons: Record<string, string> = {
  mpesa: 'cellphone',
  tigo_pesa: 'cellphone',
  airtel_money: 'cellphone',
  card: 'credit-card',
  cash: 'cash',
};

export default function PaymentMethodsScreen() {
  const theme = 'light';
  const [methods] = useState(paymentMethods);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {methods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}
            activeOpacity={0.7}
          >
            <View style={[styles.methodIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name={typeIcons[method.type] as any} size={24} color={Colors[theme].primary} />
            </View>
            <View style={styles.methodInfo}>
              <View style={styles.methodNameRow}>
                <Text style={[styles.methodLabel, { color: Colors[theme]['on-surface'] }]}>{method.label}</Text>
                {method.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: Colors[theme]['primary-container'] }]}>
                    <Text style={[styles.defaultText, { color: Colors[theme]['on-primary-container'] }]}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.methodDetails, { color: Colors[theme]['on-surface-variant'] }]}>{method.details}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: Colors[theme].primary }]}
          activeOpacity={0.8}
          onPress={() => Alert.alert('Coming Soon', 'Adding new payment methods will be available soon.')}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#ffffff" />
          <Text style={styles.addBtnText}>Add Payment Method</Text>
        </TouchableOpacity>

        <View style={[styles.cashCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <View style={[styles.methodIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
            <MaterialCommunityIcons name="cash" size={24} color={Colors[theme].primary} />
          </View>
          <View style={styles.methodInfo}>
            <Text style={[styles.methodLabel, { color: Colors[theme]['on-surface'] }]}>Cash on Delivery</Text>
            <Text style={[styles.methodDetails, { color: Colors[theme]['on-surface-variant'] }]}>Pay when you receive your order</Text>
          </View>
          <MaterialCommunityIcons name="check-circle" size={24} color={Colors[theme].primary} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'], paddingTop: 56, paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: { ...Typography.h2 },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100, gap: Spacing.md },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: BorderRadius.xl, padding: Spacing.md, ...Shadows.sm,
  },
  methodIcon: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  methodInfo: { flex: 1 },
  methodNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  methodLabel: { ...Typography['label-md'], fontWeight: '600' },
  defaultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  defaultText: { ...Typography['label-sm'], fontSize: 10 },
  methodDetails: { ...Typography['body-sm'], marginTop: 2 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, ...Shadows.sm,
  },
  addBtnText: { ...Typography['body-md'], color: '#ffffff', fontWeight: '700' },
  cashCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    borderRadius: BorderRadius.xl, padding: Spacing.md, ...Shadows.sm,
  },
});
