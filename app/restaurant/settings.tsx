import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function SettingsScreen() {
  const theme = 'light';
  const [autoAccept, setAutoAccept] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const sections: {
    title: string;
    items: { icon: string; label: string; value?: boolean; toggle?: (v: boolean) => void; subtitle?: string }[];
  }[] = [
    {
      title: 'Order Settings',
      items: [
        { icon: 'clock-auto', label: 'Auto-accept orders', value: autoAccept, toggle: setAutoAccept },
        { icon: 'bell-ring-outline', label: 'New order sound', value: soundEnabled, toggle: setSoundEnabled },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: 'bell-outline', label: 'Push notifications', value: notifications, toggle: setNotifications },
      ],
    },
    {
      title: 'General',
      items: [
        { icon: 'translate', label: 'Language' },
        { icon: 'currency-usd', label: 'Currency' },
        { icon: 'information-outline', label: 'App version', subtitle: '1.0.0' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface-variant'] }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[
                    styles.settingsItem,
                    ii < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors[theme]['surface-variant'] },
                  ]}
                  disabled={!item.toggle}
                >
                  <View style={[styles.settingsIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors[theme].primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.settingsLabel, { color: Colors[theme]['on-surface'] }]}>{item.label}</Text>
                    {item.subtitle && (
                      <Text style={[styles.settingsSubtitle, { color: Colors[theme]['on-surface-variant'] }]}>{item.subtitle}</Text>
                    )}
                  </View>
                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.toggle}
                      trackColor={{ false: Colors[theme]['surface-variant'], true: Colors[theme]['primary-container'] }}
                      thumbColor={item.value ? Colors[theme].primary : Colors[theme]['on-surface-variant']}
                    />
                  ) : (
                    <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'], paddingTop: 56, paddingBottom: Spacing.md,
  },
  headerTitle: { ...Typography.h2 },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { ...Typography['label-md'], fontWeight: '600', marginBottom: Spacing.sm, paddingLeft: 4 },
  sectionCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.sm },
  settingsItem: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md,
  },
  settingsIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { ...Typography['label-md'] },
  settingsSubtitle: { ...Typography['body-sm'], marginTop: 1 },
});
