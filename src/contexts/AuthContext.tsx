import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, Client } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  client: Client | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName?: string;
  }) => Promise<{ message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.me();
        setUser(userData);
        if (userData.client) {
          setClient(userData.client);
        }
      } catch (error) {
        // Token inválido, limpar
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    localStorage.setItem('auth_token', response.token);
    setUser(response.user);
    if (response.client) {
      setClient(response.client);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName?: string;
  }) => {
    const response = await authApi.register(data);
    return { message: response.message };
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setClient(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        client,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
