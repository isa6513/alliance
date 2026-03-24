import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  appHealthCheck,
  authLogin,
  authLogout,
  authMe,
  UserDto,
} from "../../../shared/client";
import { useRouter } from "expo-router";
import { client } from "@alliance/shared/client/client.gen";
import { getApiUrl } from "./config";
import {
  getVisualTestAutoLoginCredentials,
  isVisualTestMode,
} from "./visualTest";
import { usePostHog } from "posthog-react-native";
import { run } from "@alliance/shared/lib/utils";

interface AuthContextType {
  isAuthenticated: boolean;
  canConnectToServer: boolean;
  user: UserDto | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthTokenStore {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  deleteItem: (key: string) => Promise<void>;
}

export const AuthProvider: React.FC<
  React.PropsWithChildren<{
    tokenStore: AuthTokenStore;
  }>
> = ({ children, tokenStore }) => {
  const [user, setUser] = useState<UserDto | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [canConnectToServer, setCanConnectToServer] = useState<boolean>(false);
  const router = useRouter();

  const saveTokens = useCallback(
    async (access: string, refresh: string) => {
      await tokenStore.setItem(ACCESS_TOKEN_KEY, access);
      await tokenStore.setItem(REFRESH_TOKEN_KEY, refresh);
    },
    [tokenStore],
  );

  const clearTokens = useCallback(async () => {
    await tokenStore.deleteItem(ACCESS_TOKEN_KEY);
    await tokenStore.deleteItem(REFRESH_TOKEN_KEY);
  }, [tokenStore]);

  const getAccessToken = useCallback(async () => {
    return await tokenStore.getItem(ACCESS_TOKEN_KEY);
  }, [tokenStore]);
  const logout = useCallback(async () => {
    authLogout();
    clearTokens();
    setUser(undefined);
    if (!isVisualTestMode) {
      router.replace("/auth/login");
    }
  }, [router, clearTokens]);

  const posthog = usePostHog();

  useEffect(() => {
    (async () => {
      try {
        const accessToken = await getAccessToken();
        if (accessToken) {
          client.setConfig({
            baseUrl: getApiUrl(),
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }
        // If the access token is expired, the fetch wrapper in _layout.tsx
        // will intercept the 401 and transparently refresh before retrying.
        const profile = (await authMe()).data;
        setUser(profile?.user);
      } catch {
        posthog?.capture("auth_failed_to_refresh");
        logout();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [logout, getAccessToken, posthog]);

  useEffect(() => {
    let cancelled = false;
    run(async () => {
      try {
        const resp = await appHealthCheck();
        if (!cancelled) {
          setCanConnectToServer(resp.response.ok);
        }
      } catch {
        if (!cancelled) {
          setCanConnectToServer(false);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await authLogin({
          body: { email, password, mode: "header" },
        });

        if (response.error || !response.data) {
          throw new Error("Login failed");
        }

        client.setConfig({
          baseUrl: getApiUrl(),
          headers: {
            Authorization: `Bearer ${response.data.access_token}`,
          },
        });

        if (response.data.access_token && response.data.refresh_token) {
          await saveTokens(
            response.data.access_token,
            response.data.refresh_token,
          );
        } else {
          console.error("didn't recieve tokens: something went wrong");
        }

        const userProfile = await authMe();
        if (!userProfile.data) {
          throw new Error("Failed to fetch user profile");
        }

        const user = userProfile.data?.user;
        setUser(user);
        if (user) {
          posthog?.identify(user.id.toString(), {
            email: user.email,
            name: user.name,
          });
        }

        if (!isVisualTestMode) {
          router.replace("/");
        }
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router, saveTokens, posthog],
  );

  useEffect(() => {
    const visualTestCredentials = getVisualTestAutoLoginCredentials();
    const devAutoLoginEnabled =
      __DEV__ && process.env.EXPO_PUBLIC_DEV_AUTO_LOGIN === "true";

    const credentials = visualTestCredentials
      ? visualTestCredentials
      : devAutoLoginEnabled &&
          process.env.EXPO_PUBLIC_DEV_EMAIL &&
          process.env.EXPO_PUBLIC_DEV_PASSWORD
        ? {
            email: process.env.EXPO_PUBLIC_DEV_EMAIL,
            password: process.env.EXPO_PUBLIC_DEV_PASSWORD,
          }
        : null;

    if (!credentials || isLoading || user) {
      return;
    }

    login(credentials.email, credentials.password)
      .then(() => {
        console.log("auto login successful");
      })
      .catch((error) => {
        console.error("auto login failed", error);
      });
  }, [isLoading, login, user]);

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    canConnectToServer,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
