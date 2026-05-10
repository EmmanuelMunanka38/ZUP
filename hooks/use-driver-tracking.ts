import { useEffect, useCallback } from 'react';
import { useTrackingStore, getStatusLabel, getStatusIndex } from '@/store/trackingStore';

export function useDriverTracking(orderId: string, wsUrl?: string) {
  const {
    isConnected,
    currentStatus,
    estimatedMinutes,
    estimatedArrival,
    driverLocation,
    driverHeading,
    route,
    connect,
    disconnect,
  } = useTrackingStore();

  useEffect(() => {
    if (orderId) {
      connect(orderId, wsUrl);
    }

    return () => {
      disconnect();
    };
  }, [orderId, wsUrl, connect, disconnect]);

  const statusLabel = currentStatus ? getStatusLabel(currentStatus) : '';
  const statusIndex = currentStatus ? getStatusIndex(currentStatus) : 0;

  return {
    isConnected,
    currentStatus,
    statusLabel,
    statusIndex,
    estimatedMinutes,
    estimatedArrival,
    driverLocation,
    driverHeading,
    route,
  };
}
