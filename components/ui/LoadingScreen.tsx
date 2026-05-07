import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = 'Loading...',
  fullScreen = true,
}: LoadingScreenProps) {
  const theme = 'light';

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: Colors[theme].background },
      ]}
    >
      <ActivityIndicator size="large" color={Colors[theme].primary} />
      {message && (
        <Text
          style={[
            styles.text,
            { color: Colors[theme]['on-surface-variant'] },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  fullScreen: {
    flex: 1,
  },
  text: {
    ...Typography['body-md'],
  },
});
