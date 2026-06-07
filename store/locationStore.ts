import { create } from 'zustand';
import { Coordinate, Address } from '@/types';
import { locationService } from '@/services/location.service';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

async function reverseGeocode(coord: Coordinate): Promise<Pick<Address, 'street' | 'area' | 'city'> | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coord.longitude},${coord.latitude}.json?access_token=${MAPBOX_TOKEN}&types=address,locality,place&country=TZ&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.features?.length) return null;

    const place = data.features[0];
    const context = place.context || [];
    const getContext = (idPrefix: string) =>
      context.find((c: any) => c.id.startsWith(idPrefix))?.text || '';

    return {
      street: place.place_name?.split(',')[0] || place.text || '',
      area: getContext('neighborhood') || getContext('locality') || '',
      city: getContext('place') || getContext('region') || 'Dar es Salaam',
    };
  } catch {
    return null;
  }
}

interface LocationState {
  currentLocation: Coordinate | null;
  currentAddress: Address | null;
  savedAddresses: Address[];
  permissionGranted: boolean;
  isWatching: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  startWatching: () => Promise<void>;
  stopWatching: () => void;
  refreshLocation: () => Promise<void>;
  reverseGeocodeCurrent: () => Promise<void>;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  cleanup: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  currentAddress: null,
  savedAddresses: [],
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

  reverseGeocodeCurrent: async () => {
    const currentLocation = get().currentLocation;
    if (!currentLocation) return;

    const geo = await reverseGeocode(currentLocation);
    if (geo) {
      set({
        currentAddress: {
          id: 'current',
          label: 'Current Location',
          street: geo.street,
          area: geo.area,
          city: geo.city,
          coordinate: currentLocation,
          isDefault: true,
        },
      });
    } else {
      set({
        currentAddress: {
          id: 'current',
          label: 'Current Location',
          street: 'Unknown',
          area: '',
          city: 'Dar es Salaam',
          coordinate: currentLocation,
          isDefault: true,
        },
      });
    }
  },

  addAddress: (addr) => {
    const saved = get().savedAddresses;
    const newAddr: Address = { ...addr, id: `addr_${Date.now()}` };
    if (newAddr.isDefault) {
      saved.forEach((a) => { a.isDefault = false; });
    }
    set({ savedAddresses: [...saved, newAddr] });
  },

  removeAddress: (id) => {
    set({ savedAddresses: get().savedAddresses.filter((a) => a.id !== id) });
  },

  setDefaultAddress: (id) => {
    set({
      savedAddresses: get().savedAddresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    });
  },

  cleanup: () => {
    locationService.cleanup();
    set({ currentLocation: null, isWatching: false, error: null });
  },
}));
