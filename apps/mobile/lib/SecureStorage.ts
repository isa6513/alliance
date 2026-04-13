import { setItemAsync, getItemAsync, deleteItemAsync } from "expo-secure-store";

export enum SecureStorageKey {
  ACCESS_TOKEN = "accessToken",
  REFRESH_TOKEN = "refreshToken",
  DEVICE_ID = "deviceId",
  REGISTERED_TOKEN = "registeredToken",
}

export const SecureStorage = {
  setItem: async (key: SecureStorageKey, value: string) =>
    await setItemAsync(key, value),
  getItem: async (key: SecureStorageKey) => await getItemAsync(key),
  deleteItem: async (key: SecureStorageKey) => await deleteItemAsync(key),
};
