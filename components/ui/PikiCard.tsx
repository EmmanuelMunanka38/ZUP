import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface PikiCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  variant?: 'elevated' | 'outlined';
}

export function PikiCard({
  children,
  style,
  noPadding = false,
  variant = 'elevated',
}: PikiCardProps) {
  const theme = 'light';

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: Colors[theme]['surface-container-lowest'],
          borderColor:
            variant === 'outlined'
              ? Colors[theme]['surface-variant']
              : 'transparent',
        },
        variant === 'elevated' && Shadows.sm,
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  padding: {
    padding: Spacing.md,
  },
});
