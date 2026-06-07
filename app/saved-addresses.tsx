import { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useLocationStore } from '@/store/locationStore';
import { Coordinate } from '@/types';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  street: string;
  area: string;
  city: string;
}

async function searchMapbox(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=TZ&limit=6&types=address,poi,neighborhood,locality,place`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.features) return [];

    return data.features.map((f: any) => {
      const ctx = f.context || [];
      const getCtx = (prefix: string) =>
        ctx.find((c: any) => c.id.startsWith(prefix))?.text || '';
      return {
        id: f.id,
        place_name: f.place_name,
        center: f.center,
        street: f.text || '',
        area: getCtx('neighborhood') || getCtx('locality') || '',
        city: getCtx('place') || getCtx('region') || 'Dar es Salaam',
      };
    });
  } catch {
    return [];
  }
}

export default function SavedAddressesScreen() {
  const theme = 'light';
  const {
    savedAddresses, currentAddress, currentLocation,
    addAddress, removeAddress, setDefaultAddress,
    reverseGeocodeCurrent,
  } = useLocationStore();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Dar es Salaam');
  const [selectedCoord, setSelectedCoord] = useState<Coordinate | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const results = await searchMapbox(text);
      setSearchResults(results);
      setSearching(false);
    }, 400);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    setStreet(result.street);
    setArea(result.area);
    setCity(result.city);
    setSelectedCoord({ latitude: result.center[1], longitude: result.center[0] });
    setSearchQuery(result.place_name);
    setSearchResults([]);
  };

  const handleAddAddress = () => {
    if (!street.trim()) {
      Alert.alert('Error', 'Street address is required');
      return;
    }
    addAddress({
      label: label.trim() || 'Other',
      street: street.trim(),
      area: area.trim(),
      city: city.trim() || 'Dar es Salaam',
      coordinate: selectedCoord || currentLocation || undefined,
      isDefault: savedAddresses.length === 0,
    });
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setLabel('');
    setStreet('');
    setArea('');
    setCity('Dar es Salaam');
    setSelectedCoord(undefined);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUseCurrentLocation = async () => {
    await reverseGeocodeCurrent();
    setShowForm(false);
  };

  const openForm = () => {
    resetForm();
    setShowForm(true);
  };

  const allAddresses = [
    ...(currentAddress ? [currentAddress] : []),
    ...savedAddresses,
  ];

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Colors[theme].primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Saved Addresses</Text>
        <TouchableOpacity onPress={openForm}>
          <MaterialCommunityIcons name="plus" size={28} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {allAddresses.map((addr) => (
          <TouchableOpacity
            key={addr.id}
            style={[styles.addressCard, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['surface-variant'] }]}
            onPress={() => {
              if (addr.id !== 'current') {
                setDefaultAddress(addr.id);
              }
            }}
          >
            <View style={styles.addressRow}>
              <View style={[styles.addressIcon, { backgroundColor: addr.id === 'current' ? Colors[theme]['primary-container'] : Colors[theme]['surface-container'] }]}>
                <MaterialCommunityIcons
                  name={addr.id === 'current' ? 'crosshairs-gps' : 'map-marker'}
                  size={24}
                  color={Colors[theme].primary}
                />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.addressTop}>
                  <Text style={[styles.addressLabel, { color: Colors[theme]['on-surface'] }]}>
                    {addr.label}
                  </Text>
                  {addr.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: Colors[theme]['primary-container'] }]}>
                      <Text style={[styles.defaultBadgeText, { color: Colors[theme]['on-primary-container'] }]}>
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.addressStreet, { color: Colors[theme]['on-surface-variant'] }]}>
                  {addr.street}
                </Text>
                {(addr.area || addr.city) && (
                  <Text style={[styles.addressCity, { color: Colors[theme]['on-surface-variant'] }]}>
                    {[addr.area, addr.city].filter(Boolean).join(', ')}
                  </Text>
                )}
              </View>
              {addr.id !== 'current' && (
                <TouchableOpacity onPress={() => {
                  Alert.alert('Remove Address', `Remove "${addr.label}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeAddress(addr.id) },
                  ]);
                }}>
                  <MaterialCommunityIcons name="delete-outline" size={22} color={Colors[theme].error} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {allAddresses.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="map-marker-off" size={48} color={Colors[theme]['outline-variant']} />
            <Text style={[styles.emptyText, { color: Colors[theme]['on-surface-variant'] }]}>
              No saved addresses yet
            </Text>
            <Text style={[styles.emptySubtext, { color: Colors[theme]['outline-variant'] }]}>
              Add your home, work, or frequent locations
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.useCurrentBtn, { backgroundColor: Colors[theme].primary }]}
          onPress={handleUseCurrentLocation}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#ffffff" />
          <Text style={styles.useCurrentText}>Use Current Location</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => { setShowForm(false); resetForm(); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[theme].surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors[theme]['on-surface'] }]}>Add Address</Text>
              <TouchableOpacity onPress={() => { setShowForm(false); resetForm(); }}>
                <MaterialCommunityIcons name="close" size={24} color={Colors[theme]['on-surface-variant']} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Search location</Text>
            <View style={[styles.searchWrap, { backgroundColor: Colors[theme]['surface-container-low'], borderColor: Colors[theme]['outline-variant'] }]}>
              <MaterialCommunityIcons name="magnify" size={20} color={Colors[theme]['on-surface-variant']} />
              <TextInput
                style={[styles.searchInput, { color: Colors[theme]['on-surface'] }]}
                placeholder="Search for a place, address..."
                placeholderTextColor={Colors[theme]['outline-variant']}
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {searching && <ActivityIndicator size="small" color={Colors[theme].primary} />}
              {searchQuery.length > 0 && !searching && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                  <MaterialCommunityIcons name="close-circle" size={18} color={Colors[theme]['outline-variant']} />
                </TouchableOpacity>
              )}
            </View>

            {searchResults.length > 0 && (
              <View style={[styles.resultsCard, { backgroundColor: Colors[theme]['surface-container-lowest'], borderColor: Colors[theme]['outline-variant'] }]}>
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.resultRow, { borderBottomColor: Colors[theme]['surface-variant'] }]}
                      onPress={() => handleSelectResult(item)}
                    >
                      <MaterialCommunityIcons name="map-marker" size={18} color={Colors[theme].primary} />
                      <View style={styles.resultInfo}>
                        <Text style={[styles.resultName, { color: Colors[theme]['on-surface'] }]} numberOfLines={1}>
                          {item.place_name.split(',')[0]}
                        </Text>
                        <Text style={[styles.resultDetail, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={1}>
                          {[item.area, item.city].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Label</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
              placeholder="e.g. Home, Work, Gym"
              placeholderTextColor={Colors[theme]['outline-variant']}
              value={label}
              onChangeText={setLabel}
            />

            <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Street *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
              placeholder="Street address"
              placeholderTextColor={Colors[theme]['outline-variant']}
              value={street}
              onChangeText={setStreet}
            />

            <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Area</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
              placeholder="Area / Neighborhood"
              placeholderTextColor={Colors[theme]['outline-variant']}
              value={area}
              onChangeText={setArea}
            />

            <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>City</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
              placeholder="City"
              placeholderTextColor={Colors[theme]['outline-variant']}
              value={city}
              onChangeText={setCity}
            />

            {selectedCoord && (
              <Text style={[styles.coordText, { color: Colors[theme]['on-surface-variant'] }]}>
                {selectedCoord.latitude.toFixed(5)}, {selectedCoord.longitude.toFixed(5)}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: Colors[theme].primary }]}
              onPress={handleAddAddress}
            >
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 120, gap: Spacing.md },
  addressCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadows.sm,
  },
  addressRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  addressIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: { flex: 1, gap: 2 },
  addressTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  addressLabel: { ...Typography['label-md'] },
  defaultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  defaultBadgeText: { ...Typography['label-sm'], fontWeight: '600' },
  addressStreet: { ...Typography['body-sm'] },
  addressCity: { ...Typography['body-sm'] },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: Spacing.sm },
  emptyText: { ...Typography.h2 },
  emptySubtext: { ...Typography['body-sm'] },
  useCurrentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
  },
  useCurrentText: { ...Typography['label-md'], color: '#ffffff' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing['container-padding'],
    paddingBottom: 48,
    gap: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: { ...Typography.h1 },
  inputLabel: { ...Typography['label-sm'] },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography['body-md'],
  },
  saveBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnText: { ...Typography['label-md'], color: '#ffffff' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography['body-md'],
  },
  resultsCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    maxHeight: 200,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  resultInfo: { flex: 1 },
  resultName: { ...Typography['body-md'], fontWeight: '600' },
  resultDetail: { ...Typography['body-sm'], marginTop: 1 },
  coordText: { ...Typography['body-sm'], textAlign: 'center' },
});
