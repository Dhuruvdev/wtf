import { useEffect, useState } from "react";
import { useDiscord } from "@/contexts/DiscordContext";

// The Discord SDK is loaded via script tag in index.html
// and managed by DiscordContext.tsx

export function useDiscordSdk() {
  const { isInitialized, initializeSDK } = useDiscord();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initializeSDK().then(() => setIsReady(true));
    } else {
      setIsReady(true);
    }
  }, [isInitialized, initializeSDK]);

  return { isReady };
}
