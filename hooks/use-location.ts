import { useEffect, useRef, useCallback } from 'react';
import { useLocationStore } from '@/store/locationStore';

export function useLocation() {
  const initialized = useRef(false);
  const {
    currentLocation,
    permissionGranted,
    isWatching,
    error,
    initialize,
    startWatching,
    stopWatching,
    refreshLocation,
  } = useLocationStore();

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize();
    }

    return () => {
      stopWatching();
      initialized.current = false;
    };
  }, [initialize, stopWatching]);

  const requestRefresh = useCallback(() => {
    refreshLocation();
  }, [refreshLocation]);

  return {
    currentLocation,
    permissionGranted,
    isWatching,
    error,
    startWatching,
    stopWatching,
    refreshLocation: requestRefresh,
  };
}
