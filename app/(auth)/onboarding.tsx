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
    image: require('@/assets/images/fast-food-bro.png'),
    title: 'Delicious Fast Food',
    subtitle: 'Enjoy a wide variety of burgers, fries, and your favorite fast food meals, all in one place. From classic beef burgers to crispy chicken wraps, we have something for every craving. Satisfy your hunger with our quickly prepared and freshly served meals that bring the taste of your favorite fast food joints straight to you.',
  },
  {
    id: '2',
    image: require('@/assets/images/Take-Away-pana.png'),
    title: 'Easy Take Away',
    subtitle: 'Order your favorite meals and pick them up on the go, quickly and conveniently. Skip the wait and enjoy restaurant-quality food wherever you are. With just a few taps, you can browse menus, place your order, and have your food ready for pickup at your convenience, making your busy schedule a little easier to manage.',
  },
  {
    id: '3',
    image: require('@/assets/images/Chef-bro.png'),
    title: 'Prepared by Expert Chefs',
    subtitle: 'Every dish is carefully prepared by skilled chefs using the freshest ingredients sourced from local markets. From traditional Tanzanian flavors to international cuisine, our chefs bring passion and expertise to every plate. Taste the difference that professional culinary craftsmanship makes in every single bite you take.',
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
    router.replace('/login?mode=sign-up');
  };

  const handleLogin = () => {
    router.replace('/login?mode=sign-in');
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageWrapper}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
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
    justifyContent: 'center',
    paddingTop: 60,
  },
  imageWrapper: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  slideContent: {
    paddingHorizontal: Spacing['container-padding'],
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
