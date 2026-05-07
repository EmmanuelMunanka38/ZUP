import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';

interface PikiInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function PikiInput({
  label,
  error,
  leftElement,
  containerStyle,
  style,
  ...props
}: PikiInputProps) {
  const theme = 'light';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: Colors[theme]['on-surface'] }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: Colors[theme]['surface-container-low'],
            borderColor: error
              ? Colors[theme].error
              : Colors[theme]['outline-variant'],
          },
        ]}
      >
        {leftElement}
        <TextInput
          placeholderTextColor={Colors[theme]['on-surface-variant']}
          style={[
            styles.input,
            { color: Colors[theme]['on-surface'] },
            leftElement ? { paddingLeft: Spacing.sm } : undefined,
            style,
          ]}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: Colors[theme].error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography['label-md'],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    ...Typography['body-md'],
    paddingVertical: Spacing.md,
  },
  error: {
    ...Typography['label-sm'],
  },
});
