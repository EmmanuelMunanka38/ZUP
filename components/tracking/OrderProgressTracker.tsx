import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { OrderTrackingStatus } from '@/types';

interface OrderProgressTrackerProps {
  currentStatus: OrderTrackingStatus;
  statusSequence: OrderTrackingStatus[];
  getStatusLabel: (status: OrderTrackingStatus) => string;
  theme?: 'light' | 'dark';
}

export function OrderProgressTracker({
  currentStatus,
  statusSequence,
  getStatusLabel,
  theme = 'light',
}: OrderProgressTrackerProps) {
  const currentIndex = statusSequence.indexOf(currentStatus);
  const progressPercent = ((currentIndex + 1) / statusSequence.length) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.progressTrack, { backgroundColor: Colors[theme]['surface-container-highest'] }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: Colors[theme].primary,
              width: `${Math.min(progressPercent, 100)}%` as any,
            },
          ]}
        />
      </View>

      <View style={styles.stepsContainer}>
        {statusSequence.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;

          return (
            <View key={status} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: isCompleted
                      ? Colors[theme].primary
                      : isActive
                      ? Colors[theme]['secondary-container']
                      : Colors[theme]['surface-container-highest'],
                  },
                ]}
              >
                {isCompleted && status !== currentStatus ? (
                  <MaterialCommunityIcons name="check" size={12} color="#ffffff" />
                ) : isActive ? (
                  <View style={[styles.activeDot, { backgroundColor: Colors[theme].surface }]} />
                ) : null}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: isActive
                      ? Colors[theme].primary
                      : isCompleted
                      ? Colors[theme]['on-surface']
                      : Colors[theme]['on-surface-variant'],
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
                numberOfLines={2}
              >
                {getStatusLabel(status)}
              </Text>
              {index < statusSequence.length - 1 && (
                <View style={[styles.connector, { backgroundColor: Colors[theme]['surface-container-highest'] }]}>
                  <View
                    style={[
                      styles.connectorFill,
                      {
                        backgroundColor: Colors[theme].primary,
                        width: isCompleted ? '100%' : '0%',
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    position: 'relative',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLabel: {
    ...Typography['label-sm'],
    textAlign: 'center',
    fontSize: 10,
    maxWidth: 64,
  },
  connector: {
    position: 'absolute',
    top: 11,
    left: 24,
    right: -8,
    height: 2,
    zIndex: 1,
  },
  connectorFill: {
    height: '100%',
  },
});
