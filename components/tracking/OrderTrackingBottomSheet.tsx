import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Rider, OrderTrackingStatus } from '@/types';
import { OrderProgressTracker } from './OrderProgressTracker';
import { LiveDriverInfo } from './LiveDriverInfo';
import { ETAIndicator } from './ETAIndicator';
import { BottomSheetSkeleton } from '@/components/ui/SkeletonLoader';

interface OrderTrackingBottomSheetProps {
  currentStatus: OrderTrackingStatus;
  statusSequence: OrderTrackingStatus[];
  getStatusLabel: (status: OrderTrackingStatus) => string;
  estimatedMinutes: number;
  estimatedArrival: string;
  rider: Rider | null;
  orderNumber: string;
  isLoading?: boolean;
  onViewDetails?: () => void;
  onCall?: () => void;
  onMessage?: () => void;
  theme?: 'light' | 'dark';
}

export function OrderTrackingBottomSheet({
  currentStatus,
  statusSequence,
  getStatusLabel,
  estimatedMinutes,
  estimatedArrival,
  rider,
  orderNumber,
  isLoading = false,
  onViewDetails,
  onCall,
  onMessage,
  theme = 'light',
}: OrderTrackingBottomSheetProps) {
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[theme].surface }]}>
        <BottomSheetSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].surface }]}>
      <View style={[styles.pullHandle, { backgroundColor: Colors[theme]['surface-container-highest'] }]} />

      <ETAIndicator
        estimatedMinutes={estimatedMinutes}
        estimatedArrival={estimatedArrival}
        theme={theme}
      />

      <View style={styles.progressSection}>
        <OrderProgressTracker
          currentStatus={currentStatus}
          statusSequence={statusSequence}
          getStatusLabel={getStatusLabel}
          theme={theme}
        />
      </View>

      <View style={styles.orderInfoRow}>
        <MaterialCommunityIcons name="receipt" size={18} color={Colors[theme]['on-surface-variant']} />
        <Text style={[styles.orderLabel, { color: Colors[theme]['on-surface-variant'] }]}>
          Order
        </Text>
        <Text style={[styles.orderNumber, { color: Colors[theme]['on-surface'] }]}>
          #{orderNumber}
        </Text>
      </View>

      {rider && (
        <LiveDriverInfo
          rider={rider}
          estimatedMinutes={estimatedMinutes}
          onCall={onCall}
          onMessage={onMessage}
          theme={theme}
        />
      )}

      <TouchableOpacity
        style={[styles.detailBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}
        onPress={onViewDetails}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color={Colors[theme]['on-surface-variant']}
        />
        <Text style={[styles.detailBtnText, { color: Colors[theme]['on-surface'] }]}>
          View Order Details & Receipt
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={Colors[theme]['on-surface-variant']}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.sm,
    paddingBottom: 36,
    ...Shadows.lg,
  },
  pullHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  progressSection: {
    paddingHorizontal: Spacing['container-padding'],
    marginTop: Spacing.md,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing['container-padding'],
    marginBottom: Spacing.md,
  },
  orderLabel: {
    ...Typography['label-sm'],
  },
  orderNumber: {
    ...Typography['label-md'],
    fontWeight: '700',
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing['container-padding'],
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  detailBtnText: {
    ...Typography['label-md'],
    flex: 1,
  },
});
