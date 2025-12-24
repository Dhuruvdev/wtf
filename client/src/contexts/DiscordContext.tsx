import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  email: string;
}

interface DiscordContextType {
  user: DiscordUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  initializeSDK: () => Promise<void>;
  login: () => void;
  logout: () => void;
}

const DiscordContext = createContext<DiscordContextType | undefined>(undefined);

export function DiscordProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeSDK = async () => {
    try {
      setIsLoading(true);
      const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/discord/callback`;

      if (!window.DiscordSDK) {
        console.warn('Discord SDK not yet loaded');
        return;
      }

      await window.DiscordSDK.ready();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Discord SDK:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/discord/callback`;
    const scope = ['identify', 'email', 'rpc'];
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope.join('%20')}`;
    window.location.href = authUrl;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('discord_token');
  };

  useEffect(() => {
    const initSDK = async () => {
      await initializeSDK();
    };
    initSDK();
  }, []);

  return (
    <DiscordContext.Provider value={{ user, isLoading, isInitialized, initializeSDK, login, logout }}>
      {children}
    </DiscordContext.Provider>
  );
}

export function useDiscord(): DiscordContextType {
  const context = useContext(DiscordContext);
  if (!context) {
    throw new Error('useDiscord must be used within DiscordProvider');
  }
  return context;
}
