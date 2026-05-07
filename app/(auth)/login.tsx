import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PikiButton } from '@/components/ui/PikiButton';
import { PikiInput } from '@/components/ui/PikiInput';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const theme = 'light';
  const [phone, setPhone] = useState('');
  const { login, isLoading } = useAuthStore();

  const isValid = phone.length >= 9;

  const handleLogin = async () => {
    if (!isValid || isLoading) return;
    try {
      await login(phone);
      router.push('/(auth)/verify-otp');
    } catch {
      // error handled by store
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroSection}>
        <Image source={{ uri: Images.login.hero }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={[styles.backButtonInner, { backgroundColor: 'rgba(252,249,248,0.8)' }]}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors[theme]['on-surface']} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.cardWrapper}>
        <View style={[styles.card, { backgroundColor: Colors[theme].surface }]}>
          <View style={styles.brandSection}>
            <View style={[styles.brandIcon, { backgroundColor: Colors[theme]['primary-container'] }]}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={32} color="#ffffff" />
            </View>
            <Text style={[styles.brandName, { color: Colors[theme]['on-surface'] }]}>Piki Food</Text>
          </View>

          <Text style={[styles.title, { color: Colors[theme]['on-surface'] }]}>
            Join the Piki family
          </Text>
          <Text style={[styles.subtitle, { color: Colors[theme]['on-surface-variant'] }]}>
            Delicious meals from Dar&apos;s best kitchens delivered to your doorstep.
          </Text>

          <PikiInput
            label="Enter Phone Number"
            placeholder="712 345 678"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
            leftElement={
              <View style={[styles.countryCode, { borderRightColor: Colors[theme]['outline-variant'] }]}>
                <Text style={[styles.countryCodeText, { color: Colors[theme]['on-surface'] }]}>
                  +255
                </Text>
              </View>
            }
            containerStyle={styles.phoneInput}
          />

          <PikiButton
            title="Continue"
            onPress={handleLogin}
            disabled={!isValid}
            loading={isLoading}
            fullWidth
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: Colors[theme]['surface-variant'] }]} />
            <Text style={[styles.dividerText, { color: Colors[theme]['on-surface-variant'] }]}>
              or continue with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: Colors[theme]['surface-variant'] }]} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={[styles.socialButton, { borderColor: Colors[theme]['outline-variant'] }]}>
              <Text style={[styles.socialIcon, { color: '#4285F4' }]}>G</Text>
              <Text style={[styles.socialLabel, { color: Colors[theme]['on-surface'] }]}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { borderColor: Colors[theme]['outline-variant'] }]}>
              <MaterialCommunityIcons name="apple" size={20} color={Colors[theme]['on-surface']} />
              <Text style={[styles.socialLabel, { color: Colors[theme]['on-surface'] }]}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bentoGrid}>
        <View style={styles.bentoLeft}>
          <Image source={{ uri: Images.login.pizza }} style={styles.bentoImage} />
          <View style={styles.bentoOverlay} />
          <Text style={styles.bentoLabel}>Hot Pizza</Text>
        </View>
        <View style={styles.bentoRight}>
          <Image source={{ uri: Images.login.salad }} style={styles.bentoImage} />
          <View style={styles.bentoOverlay} />
          <Text style={styles.bentoLabel}>Healthy Choices</Text>
        </View>
      </View>

      <Text style={[styles.terms, { color: Colors[theme]['on-surface-variant'] }]}>
        By continuing, you agree to Piki&apos;s Terms of Service and Privacy Policy.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  heroSection: { height: 200, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#fcf9f8', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  backButton: { position: 'absolute', top: 60, left: Spacing['container-padding'], zIndex: 10 },
  backButtonInner: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardWrapper: { paddingHorizontal: Spacing['container-padding'], marginTop: -40, zIndex: 10 },
  card: { borderRadius: 24, padding: Spacing.xl, borderWidth: 1, borderColor: '#e5e2e1', gap: Spacing.lg, shadowColor: '#0fa958', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 4 },
  brandSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  brandIcon: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center' },
  brandName: { ...Typography.h2 },
  title: { ...Typography.h1 },
  subtitle: { ...Typography['body-md'] },
  phoneInput: {},
  countryCode: { paddingRight: Spacing.md, borderRightWidth: 1, paddingVertical: Spacing.md },
  countryCodeText: { ...Typography['body-md'], fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { ...Typography['body-sm'], textTransform: 'uppercase', letterSpacing: 0.5 },
  socialRow: { flexDirection: 'row', gap: Spacing.md },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1.5 },
  socialIcon: { fontSize: 20, fontWeight: '700' },
  socialLabel: { ...Typography['label-md'] },
  bentoGrid: { flexDirection: 'row', gap: Spacing.md, height: 160, paddingHorizontal: Spacing['container-padding'], marginTop: Spacing.xl },
  bentoLeft: { flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden', position: 'relative' },
  bentoRight: { flex: 1, borderRadius: BorderRadius.xl, overflow: 'hidden', position: 'relative' },
  bentoImage: { width: '100%', height: '100%' },
  bentoOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1 },
  bentoLabel: { position: 'absolute', bottom: Spacing.sm, left: Spacing.sm, zIndex: 2, ...Typography['label-sm'], color: '#ffffff' },
  terms: { ...Typography['body-sm'], textAlign: 'center', marginTop: Spacing.xl, paddingHorizontal: Spacing['container-padding'], paddingBottom: Spacing.xl, lineHeight: 18 },
});
