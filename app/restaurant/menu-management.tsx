import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { useRestaurantStore } from '@/store/restaurantStore';
import { useAuthStore } from '@/store/authStore';
import { uploadService } from '@/services/upload.service';
import { MenuItem } from '@/types';

export default function MenuManagementScreen() {
  const theme = 'light';
  const user = useAuthStore((s) => s.user);
  const { restaurants, currentMenu, loadMyRestaurant, loadMenu, categories: storeCategories, loadCategories, isLoading, addMenuItem, updateMenuItem, removeMenuItem } = useRestaurantStore();
  const [activeCategory, setActiveCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
  });

  const myRestaurant = restaurants.length > 0 ? restaurants[0] : null;

  useEffect(() => {
    loadCategories();
    if (user?.id) {
      loadMyRestaurant(user.id);
    }
  }, [loadCategories, loadMyRestaurant, user?.id]);

  useEffect(() => {
    if (myRestaurant) {
      loadMenu(myRestaurant.id);
    }
  }, [loadMenu, myRestaurant?.id]);

  const menuCategoryNames = useMemo(() => {
    const cats = new Set(currentMenu.map((m) => m.category));
    storeCategories.forEach((c) => cats.add(c.name));
    return Array.from(cats);
  }, [currentMenu, storeCategories]);

  useEffect(() => {
    if (menuCategoryNames.length > 0 && !activeCategory) {
      setActiveCategory(menuCategoryNames[0]);
    }
  }, [menuCategoryNames, activeCategory]);

  const categoryMap = useMemo(() => {
    const map: Record<string, { name: string; image: string }> = {};
    storeCategories.forEach((c) => { map[c.name] = c; });
    return map;
  }, [storeCategories]);

  const currentItems = currentMenu.filter((item) => item.category === activeCategory);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', image: '', category: '' });
    setEditingItem(null);
  };

  const openAddModal = (category?: string) => {
    resetForm();
    if (category) setForm((f) => ({ ...f, category }));
    setShowAddModal(true);
  };

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

  const pickImage = async () => {
    let ImagePicker: typeof import('expo-image-picker');
    try {
      ImagePicker = await import('expo-image-picker');
    } catch {
      Alert.alert(
        'Image picker unavailable',
        'The current app build does not include image picking. Rebuild the app after installing expo-image-picker.'
      );
      return;
    }

    let result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } catch {
      Alert.alert(
        'Image picker unavailable',
        'The current app build does not include image picking. Rebuild the app after installing expo-image-picker.'
      );
      return;
    }

    if (!result.canceled && result.assets[0]) {
      setUploadingImage(true);
      try {
        const url = await uploadService.uploadImage(result.assets[0].uri);
        setForm((f) => ({ ...f, image: url }));
      } catch {
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setUploadingImage(false);
      }
    }
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
        image: form.image,
        category: form.category,
        isAvailable: true,
      });
      resetForm();
      setShowAddModal(false);
    } catch {
      Alert.alert('Error', 'Failed to add menu item');
    }
  };

  const totalItems = currentMenu.length;
  const availableItems = currentMenu.filter((m) => m.isAvailable).length;
  const outOfStock = totalItems - availableItems;

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
        <TouchableOpacity onPress={() => openAddModal()}>
          <View style={[styles.addBtn, { backgroundColor: Colors[theme].primary }]}>
            <MaterialCommunityIcons name="plus" size={20} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.restaurantCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
        <View style={[styles.restaurantIcon, { backgroundColor: Colors[theme]['surface-container'] }]}>
          <MaterialCommunityIcons name="store" size={28} color={Colors[theme].primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.restaurantName, { color: Colors[theme]['on-surface'] }]}>{myRestaurant.name}</Text>
          <Text style={[styles.itemCount, { color: Colors[theme]['on-surface-variant'] }]}>
            {totalItems} items · {availableItems} available
          </Text>
        </View>
        {outOfStock > 0 && (
          <View style={[styles.outOfStockBadge, { backgroundColor: Colors[theme]['error-container'] }]}>
            <Text style={[styles.outOfStockText, { color: Colors[theme].error }]}>{outOfStock} unavailable</Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {menuCategoryNames.map((categoryName) => {
          const cat = storeCategories.find((c) => c.name === categoryName);
          const catCount = currentMenu.filter((m) => m.category === categoryName && !m.isAvailable).length;
          const isSelected = activeCategory === categoryName;
          return (
            <TouchableOpacity
              key={cat?.id || categoryName}
              style={styles.categoryItem}
              onPress={() => setActiveCategory(categoryName)}
            >
              <View style={[styles.categoryIcon, { borderColor: isSelected ? Colors[theme].primary : Colors[theme]['surface-container-high'] }]}>
                {cat?.image ? (
                  <Image source={{ uri: cat.image }} style={styles.categoryFoodImage} />
                ) : (
                  <MaterialCommunityIcons name="food" size={28} color={Colors[theme]['on-surface-variant']} />
                )}
              </View>
              <Text style={[styles.categoryName, { color: isSelected ? Colors[theme].primary : Colors[theme]['on-surface'], fontWeight: isSelected ? '700' : '400' }]}>
                {categoryName}
              </Text>
              {catCount > 0 && (
                <View style={[styles.unavailableDot, { backgroundColor: Colors[theme].error }]}>
                  <Text style={styles.unavailableDotText}>{catCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors[theme].primary} style={{ marginTop: 60 }} />
        ) : currentItems.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: Colors[theme]['surface-container'] }]}>
              <MaterialCommunityIcons name="food" size={40} color={Colors[theme]['on-surface-variant']} />
            </View>
            <Text style={[styles.emptyTitle, { color: Colors[theme]['on-surface'] }]}>No items yet</Text>
            <Text style={[styles.emptyDesc, { color: Colors[theme]['on-surface-variant'] }]}>
              Add your first item to this category
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: Colors[theme].primary }]}
              onPress={() => openAddModal(activeCategory)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />
              <Text style={styles.emptyBtnText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          currentItems.map((item) => {
            const isUnavailable = !item.isAvailable;
            return (
              <View
                key={item.id}
                style={[
                  styles.menuCard,
                  {
                    backgroundColor: Colors[theme]['surface-container-lowest'],
                    opacity: isUnavailable ? 0.7 : 1,
                  },
                ]}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={[styles.menuImage, isUnavailable && styles.menuImageUnavailable]} />
                ) : (
                  <View style={[styles.menuImage, { backgroundColor: Colors[theme]['surface-container'], alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialCommunityIcons name="food" size={32} color={Colors[theme]['on-surface-variant']} />
                  </View>
                )}
                {isUnavailable && (
                  <View style={styles.unavailableOverlay}>
                    <MaterialCommunityIcons name="close-circle" size={20} color={Colors[theme].error} />
                  </View>
                )}
                <View style={styles.menuInfo}>
                  <View style={styles.menuTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuName, { color: Colors[theme]['on-surface'] }]}>{item.name}</Text>
                      {item.description ? (
                        <Text style={[styles.menuDesc, { color: Colors[theme]['on-surface-variant'] }]} numberOfLines={2}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.menuBottom}>
                    <Text style={[styles.menuPrice, { color: Colors[theme].primary }]}>{formatPrice(item.price)}</Text>
                    <View style={styles.menuActions}>
                      <TouchableOpacity
                        style={[styles.actionIcon, { backgroundColor: Colors[theme]['surface-container'] }]}
                        onPress={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <ActivityIndicator size="small" color={Colors[theme].error} />
                        ) : (
                          <MaterialCommunityIcons name="delete-outline" size={18} color={Colors[theme].error} />
                        )}
                      </TouchableOpacity>
                      {togglingId === item.id ? (
                        <ActivityIndicator size="small" color={Colors[theme].primary} />
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.availabilityToggle,
                            { backgroundColor: item.isAvailable ? 'rgba(15,169,88,0.1)' : Colors[theme]['surface-container'] },
                          ]}
                          onPress={() => handleToggleAvailability(item)}
                        >
                          <MaterialCommunityIcons
                            name={item.isAvailable ? 'check-circle' : 'close-circle'}
                            size={16}
                            color={item.isAvailable ? Colors[theme].primary : Colors[theme]['on-surface-variant']}
                          />
                          <Text
                            style={[
                              styles.availabilityText,
                              { color: item.isAvailable ? Colors[theme].primary : Colors[theme]['on-surface-variant'] },
                            ]}
                          >
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[theme].surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors[theme]['on-surface'] }]}>Add Menu Item</Text>
              <TouchableOpacity onPress={() => { resetForm(); setShowAddModal(false); }}>
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
              <View style={styles.categoryPicker}>
                {menuCategoryNames.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: form.category === cat ? Colors[theme].primary : Colors[theme]['surface-container-low'],
                      },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, category: cat }))}
                  >
                    <Text style={{ color: form.category === cat ? '#ffffff' : Colors[theme]['on-surface'], ...Typography['label-sm'] }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
                <TextInput
                  style={[styles.input, { flex: 1, backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
                  value={!menuCategoryNames.includes(form.category) ? form.category : ''}
                  onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
                  placeholder="Or type new"
                  placeholderTextColor={Colors[theme]['on-surface-variant']}
                />
              </View>

              <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Image (optional)</Text>
              <TouchableOpacity
                style={[styles.imagePickerBtn, { backgroundColor: Colors[theme]['surface-container-low'], borderColor: Colors[theme]['outline-variant'] }]}
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={Colors[theme].primary} />
                ) : form.image ? (
                  <Image source={{ uri: form.image }} style={styles.imagePickerPreview} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera" size={24} color={Colors[theme]['on-surface-variant']} />
                    <Text style={[styles.imagePickerText, { color: Colors[theme]['on-surface-variant'] }]}>Tap to add photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: Colors[theme].primary }]}
              onPress={handleAdd}
            >
              <Text style={styles.submitBtnText}>Add to Menu</Text>
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
  addBtn: { width: 36, height: 36, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },

  restaurantCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    marginHorizontal: Spacing['container-padding'], marginBottom: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.light['surface-variant'], ...Shadows.sm,
  },
  restaurantIcon: { width: 52, height: 52, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  restaurantName: { ...Typography.h2 },
  itemCount: { ...Typography['label-sm'], marginTop: 1 },
  outOfStockBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  outOfStockText: { ...Typography['label-sm'], fontWeight: '600' },

  categoriesRow: {
    paddingHorizontal: Spacing['container-padding'], gap: Spacing.md, paddingBottom: Spacing.md,
  },
  categoryItem: { alignItems: 'center', gap: 6, width: 76 },
  categoryIcon: {
    width: 68, height: 68, borderRadius: BorderRadius.full,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    borderWidth: 2.5,
  },
  categoryFoodImage: { width: '100%', height: '100%' },
  categoryName: { ...Typography['label-sm'], textAlign: 'center', fontWeight: '600' },
  unavailableDot: {
    position: 'absolute', top: 0, right: 2,
    minWidth: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  unavailableDotText: { color: '#ffffff', fontSize: 10, fontWeight: '800' },

  scrollContent: { paddingHorizontal: Spacing['container-padding'], paddingBottom: 40, gap: Spacing.md },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: Spacing.md },
  emptyIconBg: { width: 80, height: 80, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...Typography.h2 },
  emptyDesc: { ...Typography['body-sm'], textAlign: 'center' },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full },
  emptyBtnText: { ...Typography['label-md'], color: '#ffffff', fontWeight: '700' },

  menuCard: {
    flexDirection: 'row', borderRadius: BorderRadius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.light['surface-variant'],
    ...Shadows.sm, position: 'relative',
  },
  menuImage: { width: 100, height: 100, borderRadius: BorderRadius.md, margin: Spacing.sm },
  menuImageUnavailable: { opacity: 0.5 },
  unavailableOverlay: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: BorderRadius.full,
    padding: 2,
  },
  menuInfo: { flex: 1, padding: Spacing.md, justifyContent: 'space-between' },
  menuTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  menuName: { ...Typography['label-md'], fontWeight: '600' },
  menuDesc: { ...Typography['body-sm'], marginTop: 2 },
  menuBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  menuPrice: { ...Typography['label-md'], fontWeight: '700' },
  menuActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  actionIcon: { width: 32, height: 32, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  availabilityToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: BorderRadius.full,
  },
  availabilityText: { ...Typography['label-sm'], fontWeight: '600' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing['container-padding'],
    paddingBottom: 40,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.light['outline-variant'],
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { ...Typography.h1 },
  modalForm: { gap: Spacing.md },
  inputLabel: { ...Typography['label-md'], fontWeight: '600' },
  input: {
    borderWidth: 1, borderRadius: BorderRadius.xl,
    padding: Spacing.md, ...Typography['body-md'],
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, alignItems: 'center' },
  categoryOption: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full,
  },
  imagePickerBtn: {
    width: '100%', height: 140, borderRadius: BorderRadius.xl,
    borderWidth: 1.5, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  imagePickerPreview: { width: '100%', height: '100%' },
  imagePickerText: { ...Typography['label-md'], marginTop: Spacing.sm },
  submitBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  submitBtnText: { ...Typography['body-md'], color: '#ffffff', fontWeight: '700' },
});
