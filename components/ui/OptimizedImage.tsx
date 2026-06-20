import { useState, useMemo, useCallback, useEffect } from 'react';
import { Image, ImageProps, ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { optimizeImageUrl, getImageCDN, ImageOptions } from '@/services/imageOptimizer';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  optimization?: ImageOptions;
  fallbackIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  fallbackSize?: number;
  fallbackColor?: string;
}

export default function OptimizedImage({
  uri,
  style,
  optimization,
  fallbackIcon,
  fallbackSize = 40,
  fallbackColor,
  onError,
  ...props
}: OptimizedImageProps) {
  const optimizedUri = useMemo(() => optimizeImageUrl(uri, optimization), [uri, optimization]);
  const [useOriginal, setUseOriginal] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const hasCdn = !!getImageCDN();

  useEffect(() => {
    setUseOriginal(false);
    setShowFallback(false);
  }, [uri]);

  const handleError = useCallback((e: any) => {
    onError?.(e);
    if (hasCdn && !useOriginal) {
      setUseOriginal(true);
    } else {
      setShowFallback(true);
    }
  }, [hasCdn, useOriginal, onError]);

  const sourceUri = useOriginal ? uri : optimizedUri;
  const displayFallback = showFallback || !uri;

  if (displayFallback) {
    const bg = StyleSheet.flatten(style as ImageStyle);
    return (
      <View style={[style as ViewStyle, { backgroundColor: bg?.backgroundColor || Colors.light['surface-container'], alignItems: 'center', justifyContent: 'center' }]}>
        {fallbackIcon ? (
          <MaterialCommunityIcons name={fallbackIcon as any} size={fallbackSize} color={fallbackColor || Colors.light['on-surface-variant']} />
        ) : (
          <MaterialCommunityIcons name="food" size={fallbackSize} color={fallbackColor || Colors.light['on-surface-variant']} />
        )}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: sourceUri }}
      style={style}
      onError={handleError}
      {...props}
    />
  );
}
