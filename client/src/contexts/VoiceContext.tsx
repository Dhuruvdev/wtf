import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface VoiceContextType {
  voiceChannelId: string | null;
  userId: number | null;
  isConnected: boolean;
  setVoiceContext: (userId: number, channelId: string) => void;
  clearVoiceContext: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceContextProvider({ children }: { children: ReactNode }) {
  const [voiceChannelId, setVoiceChannelId] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const setVoiceContext = useCallback((userId: number, channelId: string) => {
    setUserId(userId);
    setVoiceChannelId(channelId);
    setIsConnected(true);
    console.log(`Voice context set: User ${userId} in channel ${channelId}`);
  }, []);

  const clearVoiceContext = useCallback(() => {
    setUserId(null);
    setVoiceChannelId(null);
    setIsConnected(false);
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        voiceChannelId,
        userId,
        isConnected,
        setVoiceContext,
        clearVoiceContext,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoiceContext(): VoiceContextType {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceContext must be used within VoiceContextProvider');
  }
  return context;
}
