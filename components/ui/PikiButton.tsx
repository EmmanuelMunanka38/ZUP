import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface PikiButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function PikiButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: PikiButtonProps) {
  const theme = 'light';

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1, { damping: 15 }) }],
  }));

  const bgColor = {
    primary: Colors[theme].primary,
    secondary: Colors[theme]['secondary-container'],
    outline: 'transparent' as const,
    ghost: 'transparent' as const,
  }[variant];

  const txtColor = {
    primary: Colors[theme]['on-primary'],
    secondary: Colors[theme]['on-secondary-container'],
    outline: Colors[theme].primary,
    ghost: Colors[theme].primary,
  }[variant];

  const borderColor = variant === 'outline'
    ? Colors[theme].primary
    : 'transparent';

  return (
    <AnimatedTouchable
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.base,
        {
          backgroundColor: disabled ? Colors[theme]['surface-container-high'] : bgColor,
          borderColor: disabled ? Colors[theme]['surface-container-high'] : borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
        animStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={Colors[theme]['on-primary']}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: disabled ? Colors[theme]['on-surface-variant'] : txtColor,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...Typography['label-md'],
  },
});
