import { useState, useEffect, useCallback } from 'react';
import { getDiscordActivitySDK, type DiscordVoiceState } from '@/lib/discord-activity-sdk';

export function useVoiceState() {
  const [voiceStates, setVoiceStates] = useState<DiscordVoiceState[]>([]);
  const [localVoiceState, setLocalVoiceState] = useState<DiscordVoiceState | null>(null);
  const [isInVoice, setIsInVoice] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchVoiceStates = useCallback(async () => {
    const sdk = getDiscordActivitySDK();
    if (!sdk?.isInitialized()) return;

    setLoading(true);
    try {
      const states = await sdk.getVoiceStates();
      const local = await sdk.getLocalVoiceState();

      setVoiceStates(states);
      setLocalVoiceState(local);
      setIsInVoice(local?.channel_id !== null && local?.channel_id !== undefined);
    } catch (error) {
      console.error('Failed to fetch voice states:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVoiceStates();

    const interval = setInterval(fetchVoiceStates, 1000);
    return () => clearInterval(interval);
  }, [fetchVoiceStates]);

  const getParticipants = useCallback((): string[] => {
    return voiceStates
      .filter(state => state.channel_id === localVoiceState?.channel_id && state.channel_id)
      .map(state => state.user_id);
  }, [voiceStates, localVoiceState]);

  return {
    voiceStates,
    localVoiceState,
    isInVoice,
    loading,
    getParticipants,
    refresh: fetchVoiceStates,
  };
}
