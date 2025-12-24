import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useRoom } from "@/hooks/use-rooms";
import { useGameSocket } from "@/hooks/use-socket";
import { GameHeader } from "@/components/GameHeader";
import { PlayerList } from "@/components/PlayerList";
import { Button } from "@/components/ui/button";
import { WS_EVENTS } from "@shared/schema";
import { Loader2, Play, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { motion } from "framer-motion";
import { useGameStore } from "@/stores/gameStore";
import { VoiceActGame } from "@/components/microgames/VoiceActGame";
import { CanvasDrawGame } from "@/components/microgames/CanvasDrawGame";
import { EmojiRelayGame } from "@/components/microgames/EmojiRelayGame";
import { BluffVoteGame } from "@/components/microgames/BluffVoteGame";

export default function GameRoom() {
  const [, params] = useRoute("/room/:code");
  const [, setLocation] = useLocation();
  const roomCode = params?.code;
  const { data: room, isLoading, error } = useRoom(roomCode);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    setRoom,
    setCurrentPlayer,
    setActiveMicrogame,
    setMicrogamePhase,
    activeMicrogame,
    currentPlayer,
  } = useGameStore();
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  // Get current player ID from storage
  const currentPlayerId = roomCode ? Number(localStorage.getItem(`player_${roomCode}`)) : undefined;
  
  useEffect(() => {
    if (room) {
      setRoom(room);
      const player = room.players.find((p) => p.id === currentPlayerId);
      if (player) setCurrentPlayer(player);
    }
  }, [room, currentPlayerId, setRoom, setCurrentPlayer]);

  // Game loop - rotate through games every 8 seconds
  useEffect(() => {
    if (!gameStartTime || !room || room.status !== 'playing') return;

    const games: Array<'voice-act' | 'canvas-draw' | 'emoji-relay' | 'bluff-vote'> = [
      'voice-act', 'canvas-draw', 'emoji-relay', 'bluff-vote'
    ];

    const interval = setInterval(() => {
      const elapsed = Date.now() - gameStartTime;
      const gameIndex = Math.floor(elapsed / 8000) % games.length;
      
      if (gameIndex < games.length) {
        setActiveMicrogame(games[gameIndex]);
        setMicrogamePhase('playing');
      }
    }, 500);

    return () => clearInterval(interval);
  }, [gameStartTime, room, setActiveMicrogame, setMicrogamePhase]);

  const isHost = room?.players.find(p => p.id === currentPlayerId)?.isHost;

  // Socket connection
  const { sendMessage } = useGameSocket(room?.code, (type, payload) => {
    console.log("WS Received:", type, payload);
    
    if (type === WS_EVENTS.PHASE_CHANGE) {
      setActiveMicrogame(payload.microgame);
      setMicrogamePhase(payload.phase);
    }

    // Invalidate room query on updates to sync state
    if ([WS_EVENTS.UPDATE_ROOM, WS_EVENTS.JOIN, WS_EVENTS.LEAVE, WS_EVENTS.START_GAME].includes(type as any)) {
      queryClient.invalidateQueries({ queryKey: [api.rooms.get.path, roomCode] });
    }

    if (type === "ERROR") {
      toast({
        title: "Error",
        description: payload.message,
        variant: "destructive",
      });
    }
  });

  const handleStartGame = async () => {
    if (!room) return;
    try {
      const res = await fetch(`/api/rooms/${room.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to start game');
      
      // Start game loop on client
      setGameStartTime(Date.now());
      setActiveMicrogame('voice-act');
      setMicrogamePhase('playing');
      
      // Also send WS message for server tracking
      sendMessage(WS_EVENTS.START_GAME, { roomId: room.id });
      
      // Refresh room to get updated status
      queryClient.invalidateQueries({ queryKey: [api.rooms.get.path, roomCode] });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to start game',
        variant: 'destructive',
      });
    }
  };

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Copied!",
      description: "Room link copied to clipboard",
    });
  };

  // Error / Loading Handling
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#36393f] text-white">
        <h2 className="text-xl font-bold text-red-400">Failed to load room</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => setLocation("/")}>Back to Lobby</Button>
      </div>
    );
  }

  if (isLoading || !room) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#36393f]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // GAME PHASES RENDERER
  const renderGameContent = () => {
    switch (room.status) {
      case "lobby":
        return (
          <div className="flex flex-col items-center justify-center h-full gap-8 max-w-2xl mx-auto text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-bold text-white">Waiting for players...</h2>
              <div className="p-4 bg-[#202225] rounded-xl inline-flex items-center gap-4 border border-[#2f3136]">
                <span className="text-muted-foreground uppercase text-xs font-bold tracking-wider">Room Code</span>
                <span className="text-2xl font-mono font-bold tracking-widest text-primary">{room.code}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8 ml-2" onClick={handleCopyInvite}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {isHost && (
              <div className="space-y-2">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-12 h-14 text-lg shadow-lg shadow-green-900/20"
                  onClick={handleStartGame}
                  disabled={room.players.length < 2}
                >
                  <Play className="mr-2 w-5 h-5" />
                  START GAME
                </Button>
                {room.players.length < 2 && (
                  <p className="text-yellow-500/80 text-sm">Need at least 2 players to start</p>
                )}
              </div>
            )}
            
            {!isHost && (
              <p className="text-muted-foreground animate-pulse">
                Waiting for host to start...
              </p>
            )}
          </div>
        );

      case "playing":
      case "microgame":
        return (
          <div className="flex flex-col items-center justify-center h-full w-full px-4">
            {activeMicrogame === 'voice-act' && currentPlayer && (
              <VoiceActGame starPlayerId={room.players[0]?.id || 0} timeLimit={20} />
            )}
            {activeMicrogame === 'canvas-draw' && (
              <CanvasDrawGame timeLimit={25} />
            )}
            {activeMicrogame === 'emoji-relay' && (
              <EmojiRelayGame timeLimit={15} />
            )}
            {activeMicrogame === 'bluff-vote' && currentPlayer && (
              <BluffVoteGame starPlayerId={room.players[0]?.id || 0} timeLimit={20} />
            )}
            {!activeMicrogame && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-4"
              >
                <h2 className="text-4xl font-display font-bold text-primary">Round {room.round}</h2>
                <div className="p-12 bg-[#202225] rounded-3xl border border-[#2f3136] shadow-2xl">
                  <p className="text-xl text-muted-foreground">Get ready!</p>
                </div>
              </motion.div>
            )}
          </div>
        );

      default:
        return <div>Unknown game state: {room.status}</div>;
    }
  };

  return (
    <div className="h-screen bg-[#36393f] flex flex-col overflow-hidden text-foreground font-sans">
      <GameHeader 
        roomCode={room.code} 
        roomId={room.id}
        round={room.round || 0}
        isLobby={room.status === 'lobby'}
      />
      
      {/* Main Game Area */}
      <main className="flex-1 relative overflow-y-auto p-4 md:p-8">
        {renderGameContent()}
      </main>

      {/* Player Strip Footer */}
      <footer className="bg-[#2f3136] border-t border-[#202225] p-4 pb-8 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto">
          <PlayerList players={room.players} currentPlayerId={currentPlayerId} />
        </div>
      </footer>
    </div>
  );
}
