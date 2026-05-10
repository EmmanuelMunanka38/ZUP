import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface MapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter?: () => void;
  onMyLocation?: () => void;
  showRecenter?: boolean;
  showMyLocation?: boolean;
  showZoom?: boolean;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onMyLocation,
  showRecenter = true,
  showMyLocation = true,
  showZoom = true,
}: MapControlsProps) {
  const btnBg = Colors.light.surface;

  return (
    <View style={styles.container}>
      {showZoom && (
        <View style={[styles.zoomGroup, { backgroundColor: btnBg }]}>
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={onZoomIn}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="plus"
              size={22}
              color={Colors.light['on-surface']}
            />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: Colors.light['surface-container-high'] }]} />
          <TouchableOpacity
            style={styles.zoomBtn}
            onPress={onZoomOut}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="minus"
              size={22}
              color={Colors.light['on-surface']}
            />
          </TouchableOpacity>
        </View>
      )}

      {showMyLocation && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: btnBg }]}
          onPress={onMyLocation}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={22}
            color={Colors.light.primary}
          />
        </TouchableOpacity>
      )}

      {showRecenter && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: btnBg }]}
          onPress={onRecenter}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="target"
            size={22}
            color={Colors.light.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Platform.OS === 'ios' ? 300 : 280,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  zoomGroup: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  zoomBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
});
