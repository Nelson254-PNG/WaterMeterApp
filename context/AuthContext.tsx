// ============================================================
//  context/AuthContext.tsx
//
//  A React Context is a way to share state across MANY screens
//  without manually passing it down through every navigation
//  call. Think of it like a global variable, but one that
//  triggers re-renders correctly when it changes — unlike a
//  real global variable, which React wouldn't notice changing.
//
//  Every screen that needs to know "am I logged in?" or "what's
//  my token?" wraps itself with useAuth() instead of receiving
//  these as props passed down manually.
// ============================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  token: string | null;
  role: string | null;
  userId: string | null;
  loading: boolean;   // true while we're checking AsyncStorage on startup
  login: (token: string, role: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

// createContext needs a default value matching the shape —
// these defaults are never actually used once AuthProvider
// wraps the app, but TypeScript needs them for typing.
const AuthContext = createContext<AuthState>({
  token: null,
  role: null,
  userId: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

// Keys used to store values in AsyncStorage — kept as
// constants so we never typo a string key in two places.
const TOKEN_KEY = "admin_app_token";
const ROLE_KEY = "admin_app_role";
const USERID_KEY = "admin_app_userId";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── ON APP STARTUP: check if we already have a saved token ───
  // This is what makes login "stick" across app restarts —
  // without this, the user would have to log in every single
  // time they open the app, even minutes later.
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedRole = await AsyncStorage.getItem(ROLE_KEY);
        const storedUserId = await AsyncStorage.getItem(USERID_KEY);
        if (storedToken && storedRole && storedUserId) {
          setToken(storedToken);
          setRole(storedRole);
          setUserId(storedUserId);
        }
      } finally {
        setLoading(false);
      }
    }
    loadStoredAuth();
  }, []);

  // ── LOGIN: save to both React state AND AsyncStorage ──────────
  const login = async (newToken: string, newRole: string, newUserId: string) => {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    await AsyncStorage.setItem(ROLE_KEY, newRole);
    await AsyncStorage.setItem(USERID_KEY, newUserId);
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
  };

  // ── LOGOUT: clear both ──────────────────────────────────────
  const logout = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY, USERID_KEY]);
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// The hook every screen actually calls: const { token, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}