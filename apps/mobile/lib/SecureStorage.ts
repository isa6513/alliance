import * as SecureStore from "expo-secure-store";

export enum SecureStorageKey {
  ACCESS_TOKEN = "accessToken",
  REFRESH_TOKEN = "refreshToken",
}

const SecureStorage = {
  setItem: (key: SecureStorageKey, value: string) =>
    SecureStore.setItemAsync(key, value),
  getItem: (key: SecureStorageKey) => SecureStore.getItemAsync(key),
  deleteItem: (key: SecureStorageKey) => SecureStore.deleteItemAsync(key),
};

export default SecureStorage;
