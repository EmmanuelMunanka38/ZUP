import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const { width } = Dimensions.get('window');

const faqs: FAQItem[] = [
  { id: '1', question: 'How do I place an order?', answer: 'Browse restaurants, select items, add to cart, choose payment method, and confirm your order. You will receive real-time updates.' },
  { id: '2', question: 'How can I track my order?', answer: 'After placing an order, go to Orders tab and tap the active order to see live tracking with driver location and ETA.' },
  { id: '3', question: 'What payment methods are accepted?', answer: 'We accept M-Pesa, Tigo Pesa, Airtel Money, card payments, and cash on delivery.' },
  { id: '4', question: 'How do I contact the driver?', answer: 'While tracking your order, use the call or message buttons on the tracking screen to contact your driver directly.' },
  { id: '5', question: 'Can I cancel my order?', answer: 'Orders can be cancelled while pending or after the restaurant confirms, before the driver is assigned.' },
  { id: '6', question: 'How do I report an issue?', answer: 'For any issues with your order, contact our support team through the app or email support@pikifood.com.' },
];

const quickTopics = [
  { icon: 'food', label: 'Orders & Delivery', color: Colors.light.primary },
  { icon: 'credit-card', label: 'Payments', color: Colors.light['secondary-container'] },
  { icon: 'account', label: 'Account Issues', color: Colors.light['tertiary-container'] },
  { icon: 'message-text', label: 'Contact Support', color: Colors.light.error },
];

export default function HelpCenterScreen() {
  const theme = 'light';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.quickTopicsGrid, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          {quickTopics.map((topic) => (
            <TouchableOpacity key={topic.label} style={[styles.topicCard, { backgroundColor: topic.color + '15' }]} activeOpacity={0.7}>
              <MaterialCommunityIcons name={topic.icon as any} size={24} color={topic.color} />
              <Text style={[styles.topicLabel, { color: Colors[theme]['on-surface'] }]}>{topic.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>Frequently Asked Questions</Text>

        {faqs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={[styles.faqCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}
            activeOpacity={0.7}
            onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: Colors[theme]['on-surface'] }]}>{faq.question}</Text>
              <MaterialCommunityIcons
                name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={Colors[theme].outline}
              />
            </View>
            {expandedId === faq.id && (
              <Text style={[styles.faqAnswer, { color: Colors[theme]['on-surface-variant'] }]}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        <View style={[styles.contactCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <MaterialCommunityIcons name="headset" size={32} color={Colors[theme].primary} />
          <Text style={[styles.contactTitle, { color: Colors[theme]['on-surface'] }]}>Still need help?</Text>
          <Text style={[styles.contactDesc, { color: Colors[theme]['on-surface-variant'] }]}>
            Our support team is available 24/7 to assist you.
          </Text>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: Colors[theme].primary }]} activeOpacity={0.8}>
            <MaterialCommunityIcons name="email" size={18} color="#ffffff" />
            <Text style={styles.contactBtnText}>Contact Support</Text>
          </TouchableOpacity>
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
  quickTopicsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md,
    borderRadius: BorderRadius.xl, padding: Spacing.md, ...Shadows.sm,
  },
  topicCard: {
    width: (width - Spacing['container-padding'] * 2 - Spacing.md * 3) / 2,
    borderRadius: BorderRadius.xl, padding: Spacing.md, alignItems: 'center', gap: Spacing.sm,
  },
  topicLabel: { ...Typography['label-sm'], textAlign: 'center' },
  sectionTitle: { ...Typography.h2, marginTop: Spacing.sm },
  faqCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.md, ...Shadows.sm,
  },
  faqHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  faqQuestion: { flex: 1, ...Typography['label-md'], fontWeight: '600' },
  faqAnswer: { ...Typography['body-sm'], marginTop: Spacing.sm, lineHeight: 20 },
  contactCard: {
    alignItems: 'center', borderRadius: BorderRadius.xl,
    padding: Spacing.lg, marginTop: Spacing.sm, gap: Spacing.sm, ...Shadows.sm,
  },
  contactTitle: { ...Typography.h2 },
  contactDesc: { ...Typography['body-sm'], textAlign: 'center' },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full, marginTop: Spacing.sm,
  },
  contactBtnText: { ...Typography['label-md'], color: '#ffffff' },
});
