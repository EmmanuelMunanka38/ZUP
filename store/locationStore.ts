import { create } from 'zustand';
import { Coordinate } from '@/types';
import { locationService } from '@/services/location.service';

interface LocationState {
  currentLocation: Coordinate | null;
  permissionGranted: boolean;
  isWatching: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  startWatching: () => Promise<void>;
  stopWatching: () => void;
  refreshLocation: () => Promise<void>;
  cleanup: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  permissionGranted: false,
  isWatching: false,
  error: null,

  initialize: async () => {
    const granted = await locationService.requestPermissions();
    set({ permissionGranted: granted });
    if (granted) {
      const location = await locationService.getCurrentLocation();
      if (location) {
        set({ currentLocation: location });
      }
    }
  },

  startWatching: async () => {
    if (get().isWatching) return;

    const started = await locationService.startWatching({
      timeInterval: 3000,
      distanceInterval: 10,
    });

    if (started) {
      set({ isWatching: true });

      locationService.onLocationUpdate((location) => {
        set({ currentLocation: location, error: null });
      });

      locationService.onError((error) => {
        set({ error });
      });
    }
  },

  stopWatching: () => {
    locationService.stopWatching();
    set({ isWatching: false });
  },

  refreshLocation: async () => {
    const location = await locationService.getCurrentLocation();
    if (location) {
      set({ currentLocation: location });
    }
  },

  cleanup: () => {
    locationService.cleanup();
    set({ currentLocation: null, isWatching: false, error: null });
  },
}));
