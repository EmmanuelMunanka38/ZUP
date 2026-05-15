import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { useRestaurantStore } from '@/store/restaurantStore';
import { MenuItem } from '@/types';

export default function MenuManagementScreen() {
  const theme = 'light';
  const { restaurants, currentMenu, loadMenu, isLoading, addMenuItem, updateMenuItem, removeMenuItem } = useRestaurantStore();
  const [activeCategory, setActiveCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
  });

  const myRestaurant = restaurants.length > 0 ? restaurants[0] : null;

  useEffect(() => {
    if (myRestaurant) {
      loadMenu(myRestaurant.id);
    }
  }, [myRestaurant?.id]);

  const categories = useMemo(() => {
    const cats = new Set(currentMenu.map((m) => m.category));
    return Array.from(cats);
  }, [currentMenu]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const currentItems = currentMenu.filter((item) => item.category === activeCategory);

  const handleToggleAvailability = async (item: MenuItem) => {
    setTogglingId(item.id);
    try {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    } catch {
      Alert.alert('Error', 'Failed to update item availability');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = (item: MenuItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(item.id);
            try {
              await removeMenuItem(item.id);
            } catch {
              Alert.alert('Error', 'Failed to delete item');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.category || !myRestaurant) {
      Alert.alert('Required', 'Name, price, and category are required');
      return;
    }

    try {
      await addMenuItem(myRestaurant.id, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        image: form.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        category: form.category,
        isAvailable: true,
      });
      setForm({ name: '', description: '', price: '', image: '', category: '' });
      setShowAddModal(false);
    } catch {
      Alert.alert('Error', 'Failed to add menu item');
    }
  };

  if (!myRestaurant) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: Colors[theme].background }]}>
        <ActivityIndicator size="large" color={Colors[theme].primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>Menu</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <MaterialCommunityIcons name="plus" size={24} color={Colors[theme].primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.restaurantInfo}>
        <View style={[styles.avatar, { backgroundColor: Colors[theme]['surface-container'] }]}>
          <MaterialCommunityIcons name="store" size={24} color={Colors[theme].primary} />
        </View>
        <View>
          <Text style={[styles.restaurantName, { color: Colors[theme]['on-surface'] }]}>{myRestaurant.name}</Text>
          <Text style={[styles.itemCount, { color: Colors[theme]['on-surface-variant'] }]}>
            {currentMenu.length} menu items
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              {
                backgroundColor: activeCategory === cat ? Colors[theme].primary : Colors[theme]['surface-container-high'],
              },
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: activeCategory === cat ? '#ffffff' : Colors[theme]['on-surface'] },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors[theme].primary} style={{ marginTop: 40 }} />
        ) : currentItems.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-off" size={48} color={Colors[theme]['surface-variant']} />
            <Text style={[styles.emptyText, { color: Colors[theme]['on-surface-variant'] }]}>
              No items in this category
            </Text>
          </View>
        ) : (
          currentItems.map((item) => (
            <View key={item.id} style={[styles.menuCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
              <Image source={{ uri: item.image }} style={styles.menuImage} />
              <View style={styles.menuInfo}>
                <View style={styles.menuTop}>
                  <Text style={[styles.menuName, { color: Colors[theme]['on-surface'] }]}>{item.name}</Text>
                  <View style={styles.menuActions}>
                    {togglingId === item.id ? (
                      <ActivityIndicator size="small" color={Colors[theme].primary} />
                    ) : (
                      <Switch
                        value={item.isAvailable}
                        onValueChange={() => handleToggleAvailability(item)}
                        trackColor={{ false: Colors[theme]['surface-variant'], true: Colors[theme]['primary-container'] }}
                        thumbColor={item.isAvailable ? Colors[theme].primary : Colors[theme]['on-surface-variant']}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      style={styles.deleteBtn}
                    >
                      {deletingId === item.id ? (
                        <ActivityIndicator size="small" color={Colors[theme].error} />
                      ) : (
                        <MaterialCommunityIcons name="delete-outline" size={20} color={Colors[theme].error} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.menuDesc, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={[styles.menuPrice, { color: Colors[theme].primary }]}>{formatPrice(item.price)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[theme].surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors[theme]['on-surface'] }]}>Add Menu Item</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors[theme]['on-surface-variant']} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="Item name"
                placeholderTextColor={Colors[theme]['on-surface-variant']}
              />

              <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Description</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Brief description"
                placeholderTextColor={Colors[theme]['on-surface-variant']}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Price (TZS) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
                value={form.price}
                onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
                placeholder="e.g. 12000"
                placeholderTextColor={Colors[theme]['on-surface-variant']}
                keyboardType="numeric"
              />

              <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Category *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
                value={form.category}
                onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
                placeholder="e.g. Mains, Drinks, Appetizers"
                placeholderTextColor={Colors[theme]['on-surface-variant']}
              />

              <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Image URL</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
                value={form.image}
                onChangeText={(v) => setForm((f) => ({ ...f, image: v }))}
                placeholder="https://..."
                placeholderTextColor={Colors[theme]['on-surface-variant']}
                autoCapitalize="none"
              />
            </ScrollView>

            <TouchableOpacity style={[styles.addBtn, { backgroundColor: Colors[theme].primary }]} onPress={handleAdd}>
              <Text style={styles.addBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing['container-padding'], paddingTop: 56, paddingBottom: Spacing.md,
  },
  headerTitle: { ...Typography.h1 },
  restaurantInfo: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing['container-padding'], paddingBottom: Spacing.md,
  },
  avatar: { width: 48, height: 48, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  restaurantName: { ...Typography.h2 },
  itemCount: { ...Typography['label-sm'] },
  categoriesRow: {
    paddingHorizontal: Spacing['container-padding'], gap: Spacing.sm, paddingBottom: Spacing.md,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
  },
  categoryChipText: { ...Typography['label-md'] },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 40, gap: Spacing.md },
  emptyState: { alignItems: 'center', gap: Spacing.sm, marginTop: 60 },
  emptyText: { ...Typography['body-md'] },
  menuCard: {
    flexDirection: 'row', borderRadius: BorderRadius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.light['surface-variant'],
  },
  menuImage: { width: 100, height: 100 },
  menuInfo: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  menuTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  menuName: { ...Typography['label-md'], flex: 1 },
  menuActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  deleteBtn: { padding: 4 },
  menuDesc: { ...Typography['body-sm'] },
  menuPrice: { ...Typography['label-md'], fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing['container-padding'],
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { ...Typography.h1 },
  modalForm: { gap: Spacing.md },
  inputLabel: { ...Typography['label-md'], fontWeight: '600' },
  input: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    padding: Spacing.md, ...Typography['body-md'],
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  addBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  addBtnText: { ...Typography['body-md'], color: '#ffffff', fontWeight: '700' },
});
