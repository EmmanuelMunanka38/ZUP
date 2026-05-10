let SecureStoreModule: any = null;

function getSecureStore() {
  if (!SecureStoreModule) {
    try {
      SecureStoreModule = require('expo-secure-store');
    } catch {
      SecureStoreModule = {};
    }
  }
  return SecureStoreModule;
}

export const tokenCache = {
  async getToken(key: string) {
    try {
      const store = getSecureStore();
      if (!store.getItemAsync) return null;
      return await store.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      const store = getSecureStore();
      if (!store.setItemAsync) return;
      return await store.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};
