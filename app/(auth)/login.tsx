import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';

export default function AuthScreen() {
  const { mode: modeParam, type } = useLocalSearchParams<{ mode?: string; type?: string }>();
  const theme = 'light';
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(modeParam === 'sign-up' ? 'sign-up' : 'sign-in');
  const [contact, setContact] = useState('');
  const [otpMethod, setOtpMethod] = useState<'sms' | 'email'>('sms');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendOtp } = useAuthStore();

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^\+?\d{7,15}$/.test(contact.replace(/[\s-]/g, ''));
  const isContactValid = isEmail || isPhone;
  const isNameValid = mode === 'sign-up' ? name.trim().length >= 2 : true;
  const canSubmit = isContactValid && isNameValid && !isSubmitting;

  const handleSendOtp = useCallback(async () => {
    if (!canSubmit) return;
    setError('');
    setIsSubmitting(true);

    const sanitizedContact = isEmail ? contact.trim().toLowerCase() : contact.trim().replace(/[\s-]/g, '');

    try {
      await sendOtp(sanitizedContact, otpMethod);
      const params = new URLSearchParams({
        contact: sanitizedContact,
        method: otpMethod,
        mode,
      });
      if (mode === 'sign-up') params.set('name', name.trim());
      router.push(`/verify-otp?${params.toString()}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, contact, otpMethod, mode, name, sendOtp, isEmail]);

  const switchMode = useCallback(() => {
    setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'));
    setError('');
  }, []);

  const detectMethod = (text: string) => {
    setContact(text);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
      setOtpMethod('email');
    } else if (text.length > 0) {
      setOtpMethod('sms');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={[styles.backButtonInner, { backgroundColor: Colors[theme]['surface-container-low'] }]}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={Colors[theme]['on-surface']} />
          </View>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.brandIcon, { backgroundColor: Colors[theme].primary }]}>
            <MaterialCommunityIcons name="moped" size={32} color="#ffffff" />
          </View>
          <Text style={[styles.brandName, { color: Colors[theme].primary }]}>Piki Food</Text>
        </View>

        <View style={[styles.card, { backgroundColor: Colors[theme].surface }]}>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === 'sign-in' && { backgroundColor: Colors[theme].primary },
              ]}
              onPress={() => mode !== 'sign-in' && switchMode()}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: mode === 'sign-in' ? '#ffffff' : Colors[theme]['on-surface-variant'] },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === 'sign-up' && { backgroundColor: Colors[theme].primary },
              ]}
              onPress={() => mode !== 'sign-up' && switchMode()}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: mode === 'sign-up' ? '#ffffff' : Colors[theme]['on-surface-variant'] },
                ]}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: Colors[theme]['on-surface'] }]}>
            {mode === 'sign-in' ? 'Welcome back' : type === 'agent' ? 'Agent Login' : 'Create account'}
          </Text>
          <Text style={[styles.subtitle, { color: Colors[theme]['on-surface-variant'] }]}>
            {mode === 'sign-in'
              ? 'Enter your phone or email to receive a code'
              : 'Enter your details to get started'}
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: Colors[theme]['error-container'] + '60' }]}>
              <MaterialCommunityIcons name="alert-circle" size={18} color={Colors[theme].error} />
              <Text style={[styles.errorText, { color: Colors[theme].error }]}>{error}</Text>
            </View>
          ) : null}

          {mode === 'sign-up' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>
                Full Name
              </Text>
              <View style={[styles.inputWrap, { backgroundColor: Colors[theme]['surface-container-low'], borderColor: name ? Colors[theme].primary : Colors[theme]['outline-variant'] }]}>
                <MaterialCommunityIcons name="account-outline" size={20} color={Colors[theme]['on-surface-variant']} />
                <TextInput
                  style={[styles.input, { color: Colors[theme]['on-surface'] }]}
                  placeholder="Name "
                  placeholderTextColor={Colors[theme]['on-surface-variant'] + '80'}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>
              Phone Number or Email
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: Colors[theme]['surface-container-low'], borderColor: contact ? (isContactValid ? Colors[theme].primary : Colors[theme].tertiary) : Colors[theme]['outline-variant'] }]}>
              <MaterialCommunityIcons
                name={isEmail ? 'email-outline' : 'phone-outline'}
                size={20}
                color={Colors[theme]['on-surface-variant']}
              />
              <TextInput
                style={[styles.input, { color: Colors[theme]['on-surface'] }]}
                placeholder="Email or phone "
                placeholderTextColor={Colors[theme]['on-surface-variant'] + '80'}
                value={contact}
                onChangeText={detectMethod}
                keyboardType={otpMethod === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {!isEmail && (
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>
                Receive OTP via
              </Text>
              <View style={styles.methodRow}>
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    otpMethod === 'sms' && { backgroundColor: Colors[theme].primary, borderColor: Colors[theme].primary },
                  ]}
                  onPress={() => setOtpMethod('sms')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={18}
                    color={otpMethod === 'sms' ? '#ffffff' : Colors[theme]['on-surface-variant']}
                  />
                  <Text style={[styles.methodText, { color: otpMethod === 'sms' ? '#ffffff' : Colors[theme]['on-surface-variant'] }]}>
                    SMS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.methodBtn,
                    otpMethod === 'email' && { backgroundColor: Colors[theme].primary, borderColor: Colors[theme].primary },
                  ]}
                  onPress={() => setOtpMethod('email')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={18}
                    color={otpMethod === 'email' ? '#ffffff' : Colors[theme]['on-surface-variant']}
                  />
                  <Text style={[styles.methodText, { color: otpMethod === 'email' ? '#ffffff' : Colors[theme]['on-surface-variant'] }]}>
                    Email
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: canSubmit ? Colors[theme].primary : Colors[theme]['surface-container-high'] },
            ]}
            onPress={handleSendOtp}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={[styles.submitText, { color: canSubmit ? '#ffffff' : Colors[theme]['on-surface-variant'] }]}>
                {mode === 'sign-in' ? 'Send OTP' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchText, { color: Colors[theme]['on-surface-variant'] }]}>
            {mode === 'sign-in' ? 'No account yet?' : 'Already registered?'}
          </Text>
          <TouchableOpacity onPress={switchMode}>
            <Text style={[styles.switchLink, { color: Colors[theme].primary }]}>
              {mode === 'sign-in' ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.terms, { color: Colors[theme]['on-surface-variant'] }]}>
          By continuing, you agree to Piki's Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: Spacing['container-padding'], paddingBottom: Spacing.xl },
  backButton: { marginTop: 60, marginBottom: Spacing.md },
  backButtonInner: { width: 40, height: 40, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  brandIcon: { width: 64, height: 64, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', ...Shadows.md },
  brandName: { ...Typography.h1, fontSize: 28 },
  card: { borderRadius: 24, padding: Spacing.xl, borderWidth: 1, borderColor: Colors.light['outline-variant'], gap: Spacing.md, ...Shadows.md },
  toggleRow: { flexDirection: 'row', backgroundColor: Colors.light['surface-container-low'], borderRadius: BorderRadius.full, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, alignItems: 'center' },
  toggleText: { ...Typography['label-md'], fontWeight: '600' },
  title: { ...Typography.h1, fontSize: 26, marginTop: Spacing.sm },
  subtitle: { ...Typography['body-sm'], marginTop: -Spacing.sm },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md },
  errorText: { ...Typography['body-sm'], flex: 1 },
  inputGroup: { gap: Spacing.xs },
  inputLabel: { ...Typography['label-sm'], fontWeight: '500', marginLeft: 4 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1.5, height: 52 },
  input: { flex: 1, ...Typography['body-md'], height: '100%' },
  methodRow: { flexDirection: 'row', gap: Spacing.sm },
  methodBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.light['outline-variant'] },
  methodText: { ...Typography['label-md'], fontWeight: '600' },
  submitBtn: { paddingVertical: Spacing.md, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', height: 52 },
  submitText: { ...Typography['label-md'], fontWeight: '700', fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.lg },
  switchText: { ...Typography['body-md'] },
  switchLink: { ...Typography['label-md'], fontWeight: '700' },
  terms: { ...Typography['body-sm'], textAlign: 'center', marginTop: Spacing.lg, lineHeight: 18, paddingHorizontal: Spacing.md },
});
