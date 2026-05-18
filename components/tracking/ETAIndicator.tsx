import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Shadows, Spacing } from '@/constants/theme';

interface ETAIndicatorProps {
  estimatedMinutes: number;
  estimatedArrival: string;
  theme?: 'light' | 'dark';
}

export function ETAIndicator({
  estimatedMinutes,
  estimatedArrival,
  theme = 'light',
}: ETAIndicatorProps) {
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].surface }]}>
      <View style={styles.leftSection}>
        <View style={styles.minutesContainer}>
          <Text style={[styles.minutes, { color: Colors[theme].primary }]}>
            {estimatedMinutes}
          </Text>
          <Text style={[styles.minutesLabel, { color: Colors[theme]['on-surface-variant'] }]}>
            min
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: Colors[theme]['outline-variant'] }]} />
        <View>
          <View style={styles.arrivalRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={Colors[theme].primary}
            />
            <Text style={[styles.arrivalTitle, { color: Colors[theme].primary }]}>
              Estimated Arrival
            </Text>
          </View>
          <Text style={[styles.arrivalTime, { color: Colors[theme]['on-surface-variant'] }]}>
            {estimatedArrival}
          </Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: Colors[theme]['primary-container'] + '20' }]}>
        <View style={[styles.statusDot, { backgroundColor: Colors[theme].primary }]} />
        <Text style={[styles.statusText, { color: Colors[theme].primary }]}>Live</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Shadows.md,
    marginHorizontal: Spacing['container-padding'],
    marginTop: Spacing.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  minutesContainer: {
    alignItems: 'center',
    minWidth: 48,
  },
  minutes: {
    ...Typography.display,
    fontSize: 28,
    lineHeight: 32,
  },
  minutesLabel: {
    ...Typography['label-sm'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 32,
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrivalTitle: {
    ...Typography['label-md'],
  },
  arrivalTime: {
    ...Typography['body-sm'],
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...Typography['label-sm'],
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
