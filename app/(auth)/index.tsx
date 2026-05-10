import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/constants/theme';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(barAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      router.replace('/onboarding');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.topDecoration}>
        <View style={styles.topBar} />
      </View>

      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="moped" size={56} color="#ffffff" />
        </View>
        <View style={styles.brandWrapper}>
          <Text style={styles.brandName}>Piki Food</Text>
        </View>
        <Text style={styles.tagline}>Haraka Sana</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.footerText}>Brought to you by Piki Tech</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#006d36',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing['container-padding'],
  },
  bgCircle1: {
    position: 'absolute',
    bottom: -96,
    left: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(253, 192, 3, 0.1)',
  },
  bgCircle2: {
    position: 'absolute',
    top: -96,
    right: -96,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  topDecoration: {
    width: '100%',
    alignItems: 'center',
    opacity: 0.2,
  },
  topBar: {
    width: 64,
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  centerContent: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  brandWrapper: {
    alignItems: 'center',
  },
  brandName: {
    ...Typography.display,
    color: '#ffffff',
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography['label-md'],
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: Spacing.xs,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.lg,
    maxWidth: 320,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fdc003',
    borderRadius: 3,
    shadowColor: '#fdc003',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  footerText: {
    ...Typography['body-sm'],
    color: 'rgba(255,255,255,0.6)',
  },
});
