import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { PikiButton } from '@/components/ui/PikiButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
    title: 'Premium Dining at Home',
    subtitle: 'Explore a curated selection of the finest restaurants across Dar es Salaam and Arusha.',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600',
    title: 'Fast delivery across Tanzania',
    subtitle: 'Your favorite local delicacies delivered to your doorstep in record time, every day.',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600',
    title: 'Real-time tracking',
    subtitle: "Watch your meal's journey from the kitchen to your hand with precision GPS tracking.",
  },
];

export default function OnboardingScreen() {
  const theme = 'light';
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleSignUp = () => {
    router.replace('/(auth)/login');
  };

  const handleLogin = () => {
    router.replace('/(auth)/login');
  };

  const handleGuest = () => {
    router.replace('/(tabs)');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>
      <View style={styles.slideContent}>
        <Text style={[styles.title, { color: Colors[theme]['on-surface'] }]}>
          {item.title}
        </Text>
        <Text style={[styles.subtitle, { color: Colors[theme]['on-surface-variant'] }]}>
          {item.subtitle}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].surface }]}>
      <View style={styles.header}>
        <Text style={[styles.brandName, { color: Colors[theme].primary }]}>
          Piki Food
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? Colors[theme].primary
                      : Colors[theme]['surface-variant'],
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <PikiButton
            title="Sign Up"
            onPress={handleSignUp}
            fullWidth
          />
          <PikiButton
            title="Login"
            variant="outline"
            onPress={handleLogin}
            fullWidth
          />
          <PikiButton
            title="Continue as Guest"
            variant="ghost"
            onPress={handleGuest}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  brandName: {
    ...Typography.display,
    fontSize: 28,
    letterSpacing: -0.3,
  },
  slide: {
    width,
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    marginHorizontal: Spacing['container-padding'],
    marginTop: 100,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  slideContent: {
    paddingHorizontal: Spacing['container-padding'],
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography['body-md'],
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing['container-padding'],
    paddingBottom: 60,
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    gap: Spacing.sm,
  },
});
