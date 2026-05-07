import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const popularSearches = ['Pizza', 'Swahili', 'Burgers', 'Juice', 'Pilau', 'Seafood'];

export default function SearchScreen() {
  const theme = 'light';
  const [query, setQuery] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <Text style={[styles.headerTitle, { color: Colors[theme].primary }]}>Search</Text>
        <TouchableOpacity style={[styles.cartButton, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
          <MaterialCommunityIcons name="cart-outline" size={20} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.searchBar, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors[theme]['on-surface-variant']} />
          <TextInput
            style={[styles.searchInput, { color: Colors[theme]['on-surface'] }]}
            placeholder="Search restaurants, dishes..."
            placeholderTextColor={Colors[theme]['on-surface-variant']}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: Colors[theme]['on-surface'] }]}>
          Popular Searches
        </Text>
        <View style={styles.chipsRow}>
          {popularSearches.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.chip, { backgroundColor: Colors[theme]['surface-container-high'] }]}
              onPress={() => setQuery(item)}
            >
              <Text style={[styles.chipText, { color: Colors[theme]['on-surface'] }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  headerTitle: { ...Typography.h2 },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  searchInput: { flex: 1, ...Typography['body-md'] },
  sectionTitle: { ...Typography.h2, marginBottom: Spacing.md },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  chipText: { ...Typography['label-md'] },
});
