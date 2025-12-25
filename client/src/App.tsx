import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DiscordProvider } from "@/contexts/DiscordContext";
import { VoiceContextProvider } from "@/contexts/VoiceContext";
import { useDiscordSdk } from "@/hooks/use-discord-sdk";
import JoinLobby from "@/pages/JoinLobby";
import GameRoom from "@/pages/GameRoom";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={JoinLobby} />
      <Route path="/room/:code" component={GameRoom} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  useDiscordSdk();
  return (
    <TooltipProvider>
      <Router />
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DiscordProvider>
        <VoiceContextProvider>
          <AppContent />
        </VoiceContextProvider>
      </DiscordProvider>
    </QueryClientProvider>
  );
}

export default App;
