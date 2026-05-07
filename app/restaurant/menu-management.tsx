import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PikiCard } from '@/components/ui/PikiCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Images } from '@/constants/images';
import { formatPrice } from '@/utils/format';
import { mockMenuItems } from '@/services/mock-data';

const categories = ['Appetizers', 'Mains', 'Drinks'];

export default function MenuManagementScreen() {
  const theme = 'light';
  const [activeCategory, setActiveCategory] = useState('Appetizers');

  const currentItems = mockMenuItems.filter((item) => item.category === activeCategory);

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={Colors[theme]['on-surface']} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[theme]['on-surface'] }]}>
          Menu Management
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.subtitle, { color: Colors[theme]['on-surface-variant'] }]}>
          Update your restaurant offerings and availability
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    activeCategory === cat
                      ? Colors[theme]['primary-container']
                      : Colors[theme]['surface-container-low'],
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      activeCategory === cat
                        ? Colors[theme]['on-primary-container']
                        : Colors[theme]['on-surface-variant'],
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.addCategoryBtn, { backgroundColor: Colors[theme]['secondary-container'] }]}
          >
            <MaterialCommunityIcons name="plus" size={18} color={Colors[theme]['on-secondary-container']} />
            <Text style={[styles.addCategoryText, { color: Colors[theme]['on-secondary-container'] }]}>
              Add Category
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.categoryHeader}>
          <Text style={[styles.categoryTitle, { color: Colors[theme]['on-surface'] }]}>
            {activeCategory}
          </Text>
          <TouchableOpacity style={styles.sortBtnRow}>
            <MaterialCommunityIcons name="sort" size={20} color={Colors[theme].primary} />
            <Text style={[styles.sortBtn, { color: Colors[theme].primary }]}>Rearrange</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuList}>
          {currentItems.map((item, index) => (
            <PikiCard key={item.id} style={styles.menuCard}>
              <View style={styles.menuRow}>
                <View style={[styles.menuImage, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
                <Image source={{ uri: Images.menuManagement.appetizers[index] }} style={styles.menuItemImage} />
                </View>
                <View style={styles.menuInfo}>
                  <View style={styles.menuTop}>
                    <Text style={[styles.menuName, { color: Colors[theme]['on-surface'] }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.menuPrice, { color: Colors[theme].primary }]}>
                      {formatPrice(item.price)}
                    </Text>
                  </View>
                  <View style={styles.menuBottom}>
                    <View style={styles.stockRow}>
                      <Switch
                        value={item.isAvailable}
                        trackColor={{ false: Colors[theme]['surface-container-high'], true: Colors[theme]['primary-container'] }}
                        thumbColor={item.isAvailable ? '#ffffff' : '#f4f3f4'}
                      />
                      <Text style={[styles.stockLabel, { color: Colors[theme]['on-surface-variant'] }]}>
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </Text>
                    </View>
                    <View style={styles.menuActions}>
                      <TouchableOpacity>
                        <MaterialCommunityIcons name="pencil" size={18} color={Colors[theme]['on-surface-variant']} />
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <MaterialCommunityIcons name="delete" size={18} color={Colors[theme]['on-surface-variant']} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </PikiCard>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: Colors[theme].surface }]}>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="magnify" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Search</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="receipt" size={24} color={Colors[theme]['on-surface-variant']} />
          <Text style={[styles.navLabel, { color: Colors[theme]['on-surface-variant'] }]}>Orders</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialCommunityIcons name="account" size={24} color={Colors[theme].primary} />
          <Text style={[styles.navLabel, { color: Colors[theme].primary }]}>Profile</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors[theme]['primary-container'] }]}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>
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
  },
  headerTitle: { ...Typography.h1 },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 160 },
  subtitle: { ...Typography['body-sm'], marginBottom: Spacing.lg },
  categoryRow: { gap: Spacing.sm, marginBottom: Spacing.lg },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryText: { ...Typography['label-md'] },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addCategoryText: { ...Typography['label-md'] },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryTitle: { ...Typography.h2 },
  sortBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortBtn: { ...Typography['label-md'] },
  menuList: { gap: Spacing.md },
  menuCard: {},
  menuRow: { flexDirection: 'row', gap: Spacing.md },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemImage: { width: 60, height: 60, borderRadius: BorderRadius.md },
  menuInfo: { flex: 1, justifyContent: 'center' },
  menuTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  menuName: { ...Typography['label-md'] },
  menuPrice: { ...Typography['label-md'] },
  menuBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  stockLabel: { ...Typography['label-sm'] },
  menuActions: { flexDirection: 'row', gap: Spacing.sm },
  fab: {
    position: 'absolute',
    bottom: 88,
    right: Spacing['container-padding'],
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0fa958',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: 32,
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
    shadowColor: '#0fa958', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 8,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navLabel: { ...Typography['label-sm'] },
});
