import type { User } from '@entities/user/model/types';
import {
  type LoginPayload,
  loginRequest,
  meRequest,
  type RegisterPayload,
  registerRequest,
} from '@features/auth/api/auth-api';
import { tokenStorage } from '@shared/lib/token-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (input: LoginPayload) => Promise<void>;
  register: (input: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(() => tokenStorage.get());

  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { user } = await meRequest();
      return user;
    },
    enabled: token !== null && token.length > 0,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.isError && token !== null) {
      tokenStorage.clear();
      setToken(null);
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    }
  }, [meQuery.isError, token, queryClient]);

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      tokenStorage.set(data.accessToken);
      setToken(data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      tokenStorage.set(data.accessToken);
      setToken(data.accessToken);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
  });

  const login = useCallback(
    async (input: LoginPayload) => {
      await loginMutation.mutateAsync(input);
    },
    [loginMutation]
  );

  const register = useCallback(
    async (input: RegisterPayload) => {
      await registerMutation.mutateAsync(input);
    },
    [registerMutation]
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
  }, [queryClient]);

  const user = meQuery.data ?? null;
  const isBootstrapping =
    token !== null && token.length > 0 && (meQuery.isPending || meQuery.isFetching);
  const isAuthenticated = user !== null && token !== null && token.length > 0;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isBootstrapping,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [user, token, isBootstrapping, isAuthenticated, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
