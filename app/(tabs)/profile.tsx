import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { formatPrice } from '@/utils/format';
import { uploadService } from '@/services/upload.service';

const menuItems = [
  { icon: 'home-map-marker', label: 'Saved Addresses', route: '/saved-addresses' },
  { icon: 'receipt', label: 'Order History', route: '/(tabs)/orders' },
  { icon: 'credit-card-outline', label: 'Payment Methods', route: '/payment-methods' },
  { icon: 'bell-outline', label: 'Notifications', route: '/notifications' },
  { icon: 'help-circle', label: 'Help Center', route: '/help-center' },
];

export default function ProfileScreen() {
  const theme = 'light';
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const { orders, loadOrders } = useOrderStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/onboarding'); } },
    ]);
  };

  const openEditModal = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setShowEditModal(true);
  };

  const pickAvatar = async () => {
    let ImagePicker: typeof import('expo-image-picker');
    try {
      ImagePicker = await import('expo-image-picker');
    } catch {
      Alert.alert('Unavailable', 'Image picker is not available');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadingAvatar(true);
      try {
        const url = await uploadService.uploadImage(result.assets[0].uri);
        await updateProfile({ avatar: url });
      } catch {
        Alert.alert('Error', 'Failed to upload avatar');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Required', 'Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: editName.trim(), email: editEmail.trim() });
      setShowEditModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].background }]}>
      <View style={[styles.header, { backgroundColor: Colors[theme].surface, borderBottomColor: Colors[theme]['surface-container'] }]}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="account-circle" size={24} color={Colors[theme].primary} />
          <Text style={[styles.headerTitle, { color: Colors[theme].primary }]}>My Profile</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity activeOpacity={0.8} style={[styles.profileHeader, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} disabled={uploadingAvatar}>
            <View style={[styles.avatar, { backgroundColor: Colors[theme]['surface-container'] }]}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={Colors[theme].primary} />
              ) : user?.avatar ? (
                <OptimizedImage uri={user.avatar || ''} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons name="account" size={36} color={Colors[theme]['on-surface']} />
              )}
            </View>
            <View style={[styles.editBadge, { backgroundColor: Colors[theme].primary }]}>
              <MaterialCommunityIcons name="camera" size={12} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: Colors[theme]['on-surface'] }]}>{user?.name || 'User'}</Text>
            <Text style={[styles.profileEmail, { color: Colors[theme]['on-surface-variant'] }]}>
              {user?.email || 'No email'}
            </Text>
            {/**
             * This crown icon and the pratinum must be changed 
             * to normal and only show it to Resturant owners that
             * pay us since they give money to our SaaS.
             */}
            <View style={styles.memberBadge}>
              <MaterialCommunityIcons name="crown" size={14} color={Colors[theme].secondary} />
              <Text style={[styles.memberText, { color: Colors[theme].secondary }]}>Platinum Member</Text>
            </View>
          </View>
          <TouchableOpacity onPress={openEditModal}>
            <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.quickStats}>
          <View style={[styles.statCard, { backgroundColor: Colors[theme]['primary-container'] }]}>
            <MaterialCommunityIcons name="wallet" size={28} color={Colors[theme]['on-primary-container']} />
            <View>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-primary-container'] }]}>Total Spent</Text>
              <Text style={[styles.statValue, { color: Colors[theme]['on-primary-container'] }]}>{formatPrice(totalSpent)}</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors[theme]['secondary-container'] }]}>
            <MaterialCommunityIcons name="receipt" size={28} color={Colors[theme]['on-secondary-container']} />
            <View>
              <Text style={[styles.statLabel, { color: Colors[theme]['on-secondary-container'] }]}>Orders</Text>
              <Text style={[styles.statValue, { color: Colors[theme]['on-secondary-container'] }]}>{orderCount}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.menuCard, { backgroundColor: Colors[theme]['surface-container-lowest'] }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                { borderBottomWidth: index < menuItems.length - 1 ? 1 : 0, borderBottomColor: Colors[theme]['surface-variant'] },
              ]}
              onPress={() => {
                if (item.route) router.push(item.route as any);
              }}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: Colors[theme]['surface-container'] }]}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors[theme].primary} />
              </View>
              <Text style={[styles.menuLabel, { color: Colors[theme]['on-surface'] }]}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={Colors[theme].outline} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: Colors[theme]['surface-container-highest'] }]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={20} color={Colors[theme].error} />
          <Text style={[styles.logoutText, { color: Colors[theme].error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[theme].surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors[theme]['on-surface'] }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors[theme]['on-surface-variant']} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={Colors[theme]['on-surface-variant']}
            />

            <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'], marginTop: Spacing.md }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Colors[theme]['surface-container-low'], color: Colors[theme]['on-surface'], borderColor: Colors[theme]['outline-variant'] }]}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="your@email.com"
              placeholderTextColor={Colors[theme]['on-surface-variant']}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: Colors[theme].primary, opacity: saving ? 0.7 : 1 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  headerTitle: { ...Typography.h2 },
  scrollContent: { padding: Spacing['container-padding'], paddingBottom: 100 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light['primary-container'],
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileName: { ...Typography.h1 },
  profileEmail: { ...Typography['body-sm'], marginTop: 2 },
  avatarImage: { width: '100%', height: '100%', borderRadius: BorderRadius.full },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  memberText: { ...Typography['label-sm'], fontWeight: '600' },
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  statLabel: { ...Typography['label-sm'] },
  statValue: { ...Typography.h2 },
  menuCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, ...Typography['label-md'] },
  logoutBtn: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoutText: { ...Typography['label-md'] },
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
  inputLabel: { ...Typography['label-md'], fontWeight: '600' },
  input: {
    borderWidth: 1, borderRadius: BorderRadius.xl,
    padding: Spacing.md, ...Typography['body-md'],
  },
  saveBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  saveBtnText: { ...Typography['body-md'], color: '#ffffff', fontWeight: '700' },
});
