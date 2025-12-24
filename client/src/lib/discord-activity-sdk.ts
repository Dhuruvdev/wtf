export interface DiscordActivitySDKConfig {
  clientId: string;
}

interface DiscordSDKInstance {
  ready: () => Promise<void>;
  user?: {
    getUser: () => Promise<any>;
  };
  guild?: {
    getGuild: () => Promise<any>;
  };
  getInstance?: () => Promise<any>;
  activityManager?: {
    setActivity: (activity: any) => void;
    clearActivity: () => void;
  };
}

export class DiscordActivitySDK {
  private clientId: string;
  private initialized: boolean = false;

  constructor(config: DiscordActivitySDKConfig) {
    this.clientId = config.clientId;
  }

  async initialize(): Promise<void> {
    try {
      // Load Discord SDK
      const sdk = (window as any).discordSdk as DiscordSDKInstance | undefined;
      if (sdk) {
        await sdk.ready();
        this.initialized = true;
        console.log('Discord Activity SDK initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Discord SDK:', error);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async getUser() {
    if (!this.initialized) return null;
    try {
      const sdk = (window as any).discordSdk as DiscordSDKInstance | undefined;
      if (sdk?.user?.getUser) {
        return await sdk.user.getUser();
      }
      return null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async getGuildId() {
    if (!this.initialized) return null;
    try {
      const sdk = (window as any).discordSdk as DiscordSDKInstance | undefined;
      if (sdk?.guild?.getGuild) {
        const guild = await sdk.guild.getGuild();
        return guild.id;
      }
      return null;
    } catch (error) {
      console.error('Failed to get guild:', error);
      return null;
    }
  }

  async getInstanceId() {
    if (!this.initialized) return null;
    try {
      const sdk = (window as any).discordSdk as DiscordSDKInstance | undefined;
      if (sdk?.getInstance) {
        const instance = await sdk.getInstance();
        return instance.id;
      }
      return null;
    } catch (error) {
      console.error('Failed to get instance:', error);
      return null;
    }
  }

  setActivity(activity: {
    state?: string;
    details?: string;
    timestamps?: { start?: number; end?: number };
    assets?: { large_image?: string; large_text?: string };
  }): void {
    if (!this.initialized) return;
    try {
      const sdk = (window as any).discordSdk as DiscordSDKInstance | undefined;
      if (sdk?.activityManager?.setActivity) {
        sdk.activityManager.setActivity(activity);
      }
    } catch (error) {
      console.error('Failed to set activity:', error);
    }
  }

  clearActivity(): void {
    if (!this.initialized) return;
    try {
      const sdk = (window as any).discordSdk as DiscordSDKInstance | undefined;
      if (sdk?.activityManager?.clearActivity) {
        sdk.activityManager.clearActivity();
      }
    } catch (error) {
      console.error('Failed to clear activity:', error);
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
