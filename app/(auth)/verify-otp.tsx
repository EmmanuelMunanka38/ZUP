import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PikiButton } from '@/components/ui/PikiButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Images } from '@/constants/images';
import { useAuthStore } from '@/store/authStore';

export default function VerifyOTPScreen() {
  const theme = 'light';
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(45);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { verifyOTP, isLoading } = useAuthStore();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d !== '');

  const handleVerify = async () => {
    if (!isComplete || isLoading) return;
    try {
      const code = otp.join('');
      await verifyOTP(code);
      router.replace('/');
    } catch {
      // handled by store
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(45);
    setOtp(['', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[theme].background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroSection}>
        <Image source={{ uri: Images.verifyOtp.hero }} style={styles.heroImage} />
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
            OTP Verification
          </Text>
          <Text style={[styles.subtitle, { color: Colors[theme]['on-surface-variant'] }]}>
            Enter the code sent to your number{' '}
            <Text style={[styles.phoneHighlight, { color: Colors[theme]['on-surface'] }]}>
              +255 7## ### 123
            </Text>
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: Colors[theme]['surface-container-low'],
                    borderColor: digit ? Colors[theme].primary : Colors[theme]['outline-variant'],
                    color: Colors[theme]['on-surface'],
                  },
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text.replace(/[^0-9]/g, ''), index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0}
              />
            ))}
          </View>

          <View style={styles.timerSection}>
            <View style={styles.timerRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={Colors[theme]['on-surface-variant']} />
              <Text style={[styles.timerText, { color: Colors[theme]['on-surface-variant'] }]}>
                Resend code in{' '}
                <Text style={[styles.timerHighlight, { color: Colors[theme]['secondary-container'] }]}>
                  00:{timer.toString().padStart(2, '0')}
                </Text>
              </Text>
            </View>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
              <Text style={[styles.resend, { color: timer > 0 ? Colors[theme]['on-surface-variant'] : Colors[theme].primary, opacity: timer > 0 ? 0.5 : 1 }]}>
                Resend Now
              </Text>
            </TouchableOpacity>
          </View>

          <PikiButton
            title="Verify"
            onPress={handleVerify}
            disabled={!isComplete}
            loading={isLoading}
            fullWidth
          />

          <PikiButton
            title="Change phone number"
            variant="outline"
            onPress={() => router.back()}
            fullWidth
            style={styles.changeButton}
          />
        </View>
      </View>

      <View style={styles.securityBadge}>
        <MaterialCommunityIcons name="shield-check" size={18} color={Colors[theme].primary} />
        <Text style={[styles.securityText, { color: Colors[theme]['on-surface-variant'] }]}>
          Secure verification powered by Piki
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: Spacing.xl },
  heroSection: { height: 200, width: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#fcf9f8', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  backButton: { position: 'absolute', top: 60, left: Spacing['container-padding'], zIndex: 10 },
  backButtonInner: { width: 40, height: 40, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardWrapper: { paddingHorizontal: Spacing['container-padding'], marginTop: -40, zIndex: 10 },
  card: { borderRadius: 24, padding: Spacing.xl, borderWidth: 1, borderColor: '#e5e2e1', alignItems: 'center', gap: Spacing.lg, shadowColor: '#0fa958', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 4 },
  brandSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, alignSelf: 'flex-start' },
  brandIcon: { width: 48, height: 48, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.light['primary-container'], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  brandName: { ...Typography.h2 },
  title: { ...Typography.h1, marginBottom: -Spacing.sm, textAlign: 'center' },
  subtitle: { ...Typography['body-md'], textAlign: 'center', lineHeight: 24, paddingHorizontal: Spacing.md },
  phoneHighlight: { fontWeight: '700' },
  otpRow: { flexDirection: 'row', gap: Spacing.md },
  otpInput: { width: 64, height: 72, borderRadius: BorderRadius.xl, borderWidth: 2, textAlign: 'center', ...Typography.h1, fontSize: 28 },
  timerSection: { alignItems: 'center', gap: Spacing.sm },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  timerText: { ...Typography['label-md'] },
  timerHighlight: { fontWeight: '700' },
  resend: { ...Typography['label-md'] },
  changeButton: { marginTop: -Spacing.sm },
  securityBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: Spacing.xs, backgroundColor: 'rgba(15, 169, 88, 0.08)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, marginTop: Spacing.xl },
  securityText: { ...Typography['label-sm'] },
});
