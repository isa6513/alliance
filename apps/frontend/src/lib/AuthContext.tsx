// AuthProvider.tsx
import {
  authLogin,
  authLogout,
  authMe,
  authRefreshTokens,
  UserDto,
} from "@alliance/shared/client";
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import posthog from "posthog-js";
import { setRevalidate } from "../applayout";
import { testAuthUser } from "../stories/testData";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserDto | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = memo(
  ({ children }: React.PropsWithChildren) => {
    const [user, setUser] = useState<UserDto | undefined>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (user && import.meta.env.PROD) {
        posthog.identify(user.id.toString(), {
          email: user.email,
          name: user.name,
        });
      }
    }, [user]);

    useEffect(() => {
      let cancelled = false;

      const bootstrap = async () => {
        try {
          const { data } = await authMe();
          if (data) {
            if (!cancelled) setUser(data);
          } else {
            throw new Error("No user data");
          }
        } catch {
          try {
            await authRefreshTokens();

            setRevalidate();

            const { data } = await authMe();
            if (!cancelled) setUser(data);
          } catch {
            console.log("AuthContext", "refresh failed");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      bootstrap();
      return () => {
        cancelled = true;
      };
    }, []);

    // ---------- actions ----------
    const login = useCallback(async (email: string, password: string) => {
      setLoading(true);
      const { error } = await authLogin({
        body: { email, password, mode: "cookie" },
      });
      if (error) {
        console.error("login error", error);
        throw new Error("Login failed");
      }
      setRevalidate();

      const { data } = await authMe();
      setUser(data);
      setLoading(false);
    }, []);

    const logout = useCallback(async () => {
      await authLogout();
      window.location.href = "/login";
      setUser(undefined);
      setRevalidate();
    }, []);

    const value = useMemo<AuthContextType>(
      () => ({
        isAuthenticated: !!user,
        user,
        login,
        logout,
        loading,
      }),
      [user, loading, login, logout]
    );

    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  }
);

AuthProvider.displayName = "AuthProvider";

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);

  if (import.meta.env.STORYBOOK) {
    return {
      isAuthenticated: true,
      user: testAuthUser,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      loading: false,
    };
  }
  if (!ctx) {
    if (import.meta.env.PROD) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return {
      isAuthenticated: false,
      user: undefined,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      loading: false,
    };
  }
  return ctx;
};
