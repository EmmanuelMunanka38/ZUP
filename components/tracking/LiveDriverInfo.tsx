import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import { Rider } from '@/types';

interface LiveDriverInfoProps {
  rider: Rider;
  estimatedMinutes?: number;
  onCall?: () => void;
  onMessage?: () => void;
  theme?: 'light' | 'dark';
}

export function LiveDriverInfo({
  rider,
  estimatedMinutes,
  onCall,
  onMessage,
  theme = 'light',
}: LiveDriverInfoProps) {
  return (
    <View style={[styles.container, { backgroundColor: Colors[theme].surface }]}>
      <View style={styles.mainRow}>
        <View style={styles.riderSection}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: rider.avatar }} style={styles.avatar} />
            <View style={[styles.ratingBadge, { backgroundColor: Colors[theme]['secondary-container'] }]}>
              <MaterialCommunityIcons name="star" size={12} color={Colors[theme]['on-secondary-container']} />
              <Text style={[styles.ratingText, { color: Colors[theme]['on-secondary-container'] }]}>
                {rider.rating}
              </Text>
            </View>
          </View>
          <View style={styles.riderInfo}>
            <Text style={[styles.riderName, { color: Colors[theme]['on-surface'] }]}>
              {rider.name}
            </Text>
            <View style={styles.vehicleRow}>
              <MaterialCommunityIcons
                name="bike"
                size={16}
                color={Colors[theme]['on-surface-variant']}
              />
              <Text style={[styles.vehicleText, { color: Colors[theme]['on-surface-variant'] }]}>
                {rider.vehicle} ({rider.plateNumber})
              </Text>
            </View>
            {estimatedMinutes !== undefined && (
              <Text style={[styles.etaText, { color: Colors[theme].primary }]}>
                Arriving in {estimatedMinutes} min
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors[theme]['surface-container-low'] }]}
            onPress={onMessage}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chat-outline"
              size={20}
              color={Colors[theme].primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors[theme].primary }]}
            onPress={onCall}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="phone"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['container-padding'],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...Shadows.lg,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    ...Typography.h2,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  vehicleText: {
    ...Typography['body-sm'],
  },
  etaText: {
    ...Typography['label-md'],
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
