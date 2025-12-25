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
  authenticate: () => Promise<any>;
  login: () => void;
  logout: () => void;
}

declare global {
  interface Window {
    DiscordSDK?: {
      ready: () => Promise<void>;
    };
    discordSdk?: any;
  }
}

const DiscordContext = createContext<DiscordContextType | undefined>(undefined);

export function DiscordProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeSDK = async () => {
    try {
      setIsLoading(true);
      const redirectUri = `${window.location.origin}/auth/discord/callback`;

      // Try new SDK first, then fallback to old
      if (window.discordSdk) {
        await window.discordSdk.ready();
        setIsInitialized(true);
      } else if (window.DiscordSDK) {
        await window.DiscordSDK.ready();
        setIsInitialized(true);
      } else {
        console.warn('Discord SDK not yet loaded');
      }
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

  const authenticate = async () => {
    if (!window.discordSdk) return null;
    try {
      const { code } = await window.discordSdk.commands.authenticate({
        scope: ["identify", "guilds", "rpc.voice.read"],
      });
      return code;
    } catch (error) {
      console.error("Discord auth failed:", error);
      return null;
    }
  };

  useEffect(() => {
    const initSDK = async () => {
      await initializeSDK();
    };
    initSDK();
  }, []);

  return (
    <DiscordContext.Provider value={{ user, isLoading, isInitialized, initializeSDK, authenticate, login, logout }}>
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
