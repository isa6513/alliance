import * as SecureStore from "expo-secure-store";
import { AuthTokenStore } from "./AuthContext";

const SecureStorage: AuthTokenStore = {
  setItem: (key: string, value: string) => {
    return Promise.resolve(SecureStore.setItem(key, value));
  },
  getItem: (key: string) => {
    return Promise.resolve(SecureStore.getItem(key));
  },
  deleteItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

export default SecureStorage;
