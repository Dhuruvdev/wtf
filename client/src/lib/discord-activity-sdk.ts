export interface DiscordActivitySDKConfig {
  clientId: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export interface DiscordGuild {
  id: string;
  name: string;
}

export interface DiscordInstance {
  id: string;
  guild_id: string;
  channel_id: string;
}

export interface DiscordVoiceState {
  user_id: string;
  guild_id: string;
  channel_id: string | null;
  session_id: string;
  self_mute: boolean;
  self_deaf: boolean;
}

export interface DiscordActivityManager {
  setActivity: (activity: {
    state?: string;
    details?: string;
    timestamps?: { start?: number; end?: number };
    assets?: { large_image?: string; large_text?: string };
  }) => void;
  clearActivity: () => void;
}

export interface DiscordSDKType {
  ready: () => Promise<void>;
  user: {
    getUser: () => Promise<DiscordUser>;
  };
  guild: {
    getGuild: () => Promise<DiscordGuild>;
  };
  getInstance: () => Promise<DiscordInstance>;
  voiceManager?: {
    getVoiceStates: () => Promise<DiscordVoiceState[]>;
    getLocalVoiceState: () => Promise<DiscordVoiceState | null>;
  };
  activityManager?: DiscordActivityManager;
}

declare global {
  interface Window {
    discordSdk?: DiscordSDKType;
  }
}

export class DiscordActivitySDK {
  private clientId: string;
  private initialized: boolean = false;
  private sdk: DiscordSDKType | null = null;

  constructor(config: DiscordActivitySDKConfig) {
    this.clientId = config.clientId;
  }

  async initialize(): Promise<void> {
    try {
      if (!window.discordSdk) {
        console.warn('Discord SDK not loaded');
        return;
      }

      this.sdk = window.discordSdk;
      await this.sdk.ready();
      this.initialized = true;
      console.log('Discord Activity SDK initialized');
    } catch (error) {
      console.error('Failed to initialize Discord SDK:', error);
      this.initialized = false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async getUser(): Promise<DiscordUser | null> {
    if (!this.initialized || !this.sdk) return null;
    try {
      return await this.sdk.user.getUser();
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async getGuild(): Promise<DiscordGuild | null> {
    if (!this.initialized || !this.sdk) return null;
    try {
      return await this.sdk.guild.getGuild();
    } catch (error) {
      console.error('Failed to get guild:', error);
      return null;
    }
  }

  async getInstance(): Promise<DiscordInstance | null> {
    if (!this.initialized || !this.sdk) return null;
    try {
      return await this.sdk.getInstance();
    } catch (error) {
      console.error('Failed to get instance:', error);
      return null;
    }
  }

  async getVoiceStates(): Promise<DiscordVoiceState[]> {
    if (!this.initialized || !this.sdk?.voiceManager) return [];
    try {
      return await this.sdk.voiceManager.getVoiceStates();
    } catch (error) {
      console.error('Failed to get voice states:', error);
      return [];
    }
  }

  async getLocalVoiceState(): Promise<DiscordVoiceState | null> {
    if (!this.initialized || !this.sdk?.voiceManager) return null;
    try {
      return await this.sdk.voiceManager.getLocalVoiceState();
    } catch (error) {
      console.error('Failed to get local voice state:', error);
      return null;
    }
  }

  setActivity(activity: {
    state?: string;
    details?: string;
    timestamps?: { start?: number; end?: number };
    assets?: { large_image?: string; large_text?: string };
  }): void {
    if (!this.initialized || !this.sdk?.activityManager) return;
    try {
      this.sdk.activityManager.setActivity(activity);
    } catch (error) {
      console.error('Failed to set activity:', error);
    }
  }

  clearActivity(): void {
    if (!this.initialized || !this.sdk?.activityManager) return;
    try {
      this.sdk.activityManager.clearActivity();
    } catch (error) {
      console.error('Failed to clear activity:', error);
    }
  }

  getChannelId(): string | null {
    if (!this.initialized || !this.sdk) return null;
    try {
      // This would need to be implemented based on SDK
      return null;
    } catch (error) {
      return null;
    }
  }
}

let sdkInstance: DiscordActivitySDK | null = null;

export async function initializeDiscordActivity(): Promise<DiscordActivitySDK | null> {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;

  if (!clientId) {
    console.warn('Discord Client ID not configured');
    return null;
  }

  sdkInstance = new DiscordActivitySDK({ clientId });
  await sdkInstance.initialize();
  return sdkInstance;
}

export function getDiscordActivitySDK(): DiscordActivitySDK | null {
  return sdkInstance;
}
