import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const theme = 'light';
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();

  const isLoaded = mode === 'sign-in' ? signInLoaded : signUpLoaded;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const isNameValid = mode === 'sign-up' ? name.trim().length >= 2 : true;
  const canSubmit = isEmailValid && isPasswordValid && isNameValid && isLoaded && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'sign-in') {
        const result = await signIn!.create({
          identifier: email,
          password,
        });
        if (result.status === 'complete') {
          await setSignInActive!({ session: result.createdSessionId });
          router.replace('/');
        }
      } else {
        const result = await signUp!.create({
          emailAddress: email,
          password,
          firstName: name.trim(),
        });
        if (result.status === 'complete') {
          await setSignUpActive!({ session: result.createdSessionId });
          router.replace('/');
        }
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage
        || err?.errors?.[0]?.message
        || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, email, password, name, canSubmit, signIn, signUp, setSignInActive, setSignUpActive]);

  const switchMode = useCallback(() => {
    setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'));
    setError('');
  }, []);

  const handleSocialAuth = useCallback(async (strategy: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) return;
    setError('');
    setIsSubmitting(true);
    try {
      if (mode === 'sign-in') {
        const result = await signIn!.authenticateWithRedirect({
          strategy,
          redirectUrl: '/',
          redirectUrlComplete: '/',
        });
      } else {
        const result = await signUp!.authenticateWithRedirect({
          strategy,
          redirectUrl: '/',
          redirectUrlComplete: '/',
        });
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || 'Social sign-in failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, isLoaded, signIn, signUp]);

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
            {mode === 'sign-in' ? 'Welcome back' : 'Create account'}
          </Text>
          <Text style={[styles.subtitle, { color: Colors[theme]['on-surface-variant'] }]}>
            {mode === 'sign-in'
              ? 'Sign in to continue your food journey'
              : 'Join Piki and start ordering'}
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
                  placeholder="John Doe"
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
              Email Address
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: Colors[theme]['surface-container-low'], borderColor: email ? (isEmailValid ? Colors[theme].primary : Colors[theme].tertiary) : Colors[theme]['outline-variant'] }]}>
              <MaterialCommunityIcons name="email-outline" size={20} color={Colors[theme]['on-surface-variant']} />
              <TextInput
                style={[styles.input, { color: Colors[theme]['on-surface'] }]}
                placeholder="you@example.com"
                placeholderTextColor={Colors[theme]['on-surface-variant'] + '80'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: Colors[theme]['on-surface-variant'] }]}>
              Password
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: Colors[theme]['surface-container-low'], borderColor: password ? (isPasswordValid ? Colors[theme].primary : Colors[theme].tertiary) : Colors[theme]['outline-variant'] }]}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={Colors[theme]['on-surface-variant']} />
              <TextInput
                style={[styles.input, { color: Colors[theme]['on-surface'] }]}
                placeholder="Min. 8 characters"
                placeholderTextColor={Colors[theme]['on-surface-variant'] + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors[theme]['on-surface-variant']}
                />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'sign-in' && (
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={[styles.forgotText, { color: Colors[theme].primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: canSubmit ? Colors[theme].primary : Colors[theme]['surface-container-high'] },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={[styles.submitText, { color: canSubmit ? '#ffffff' : Colors[theme]['on-surface-variant'] }]}>
                {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: Colors[theme]['outline-variant'] }]} />
            <Text style={[styles.dividerText, { color: Colors[theme]['on-surface-variant'] }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: Colors[theme]['outline-variant'] }]} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: Colors[theme]['outline-variant'] }]}
              onPress={() => handleSocialAuth('oauth_google')}
              activeOpacity={0.7}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={[styles.socialLabel, { color: Colors[theme]['on-surface'] }]}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialBtn, { borderColor: Colors[theme]['outline-variant'] }]}
              onPress={() => handleSocialAuth('oauth_apple')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="apple" size={22} color={Colors[theme]['on-surface']} />
              <Text style={[styles.socialLabel, { color: Colors[theme]['on-surface'] }]}>Apple</Text>
            </TouchableOpacity>
          </View>
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
          By continuing, you agree to Piki\x27s Terms of Service and Privacy Policy.
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
  forgotRow: { alignItems: 'flex-end' },
  forgotText: { ...Typography['label-md'] },
  submitBtn: { paddingVertical: Spacing.md, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center', height: 52 },
  submitText: { ...Typography['label-md'], fontWeight: '700', fontSize: 16 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { ...Typography['body-sm'], color: Colors.light['on-surface-variant'] },
  socialRow: { flexDirection: 'row', gap: Spacing.md },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1.5 },
  googleIcon: { fontSize: 20, fontWeight: '700', color: '#4285F4' },
  socialLabel: { ...Typography['label-md'] },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.lg },
  switchText: { ...Typography['body-md'] },
  switchLink: { ...Typography['label-md'], fontWeight: '700' },
  terms: { ...Typography['body-sm'], textAlign: 'center', marginTop: Spacing.lg, lineHeight: 18, paddingHorizontal: Spacing.md },
});
