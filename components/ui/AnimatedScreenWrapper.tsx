import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noSafe?: boolean;
}

export function AnimatedScreenWrapper({
  children,
  style,
  noSafe = false,
}: AnimatedScreenWrapperProps) {
  const theme = 'light';

  const Container = noSafe ? View : SafeAreaView;

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: Colors[theme].background },
        style,
      ]}
    >
      <Animated.View
        entering={FadeInDown.duration(400).springify()}
        style={styles.content}
      >
        {children}
      </Animated.View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
