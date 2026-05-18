import * as Location from 'expo-location';
import { Coordinate } from '@/types';

type LocationCallback = (location: Coordinate) => void;
type ErrorCallback = (error: string) => void;

class LocationService {
  private watcher: Location.LocationSubscription | null = null;
  private listeners: Set<LocationCallback> = new Set();
  private errorListeners: Set<ErrorCallback> = new Set();
  private _currentLocation: Coordinate | null = null;
  private _permissionGranted = false;

  get currentLocation(): Coordinate | null {
    return this._currentLocation;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this._permissionGranted = status === 'granted';
      return this._permissionGranted;
    } catch {
      this._permissionGranted = false;
      return false;
    }
  }

  async getCurrentLocation(): Promise<Coordinate | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      this._currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      return this._currentLocation;
    } catch {
      return null;
    }
  }

  async startWatching(options?: {
    accuracy?: Location.Accuracy;
    timeInterval?: number;
    distanceInterval?: number;
  }): Promise<boolean> {
    if (!this._permissionGranted) {
      const granted = await this.requestPermissions();
      if (!granted) {
        this.notifyError('Location permission denied');
        return false;
      }
    }

    if (this.watcher) {
      await this.stopWatching();
    }

    try {
      this.watcher = await Location.watchPositionAsync(
        {
          accuracy: options?.accuracy ?? Location.Accuracy.High,
          timeInterval: options?.timeInterval ?? 3000,
          distanceInterval: options?.distanceInterval ?? 10,
        },
        (location) => {
          const coord: Coordinate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          this._currentLocation = coord;
          this.listeners.forEach((cb) => cb(coord));
        },
      );
      return true;
    } catch (error) {
      this.notifyError('Failed to start location watching');
      return false;
    }
  }

  async stopWatching(): Promise<void> {
    if (this.watcher) {
      this.watcher.remove();
      this.watcher = null;
    }
  }

  onLocationUpdate(callback: LocationCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  onError(callback: ErrorCallback): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private notifyError(message: string) {
    this.errorListeners.forEach((cb) => cb(message));
  }

  cleanup() {
    this.stopWatching();
    this.listeners.clear();
    this.errorListeners.clear();
    this._currentLocation = null;
  }
}

export const locationService = new LocationService();
