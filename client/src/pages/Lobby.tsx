import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateRoom, useJoinRoom } from "@/hooks/use-rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/GameCard";
import { Dice5, Users, ArrowRight, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Lobby() {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [, setLocation] = useLocation();

  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();

  const handleCreate = async () => {
    if (!username.trim()) return;
    try {
      const data = await createRoom.mutateAsync({ username });
      // Store socketId if needed for initial connection logic in GameRoom
      localStorage.setItem(`player_${data.code}`, String(data.playerId));
      setLocation(`/room/${data.code}`);
    } catch (e) {
      // Error handled by hook
    }
  };

  const handleJoin = async () => {
    if (!username.trim() || !roomCode.trim()) return;
    try {
      const data = await joinRoom.mutateAsync({ 
        code: roomCode.toUpperCase(), 
        username 
      });
      localStorage.setItem(`player_${roomCode.toUpperCase()}`, String(data.playerId));
      setLocation(`/room/${roomCode.toUpperCase()}`);
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-[#36393f] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md w-full relative z-10 space-y-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg mb-4 animate-float">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            thats.wtf
          </h1>
          <p className="text-muted-foreground text-lg">
            The ultimate party game on Discord
          </p>
        </motion.div>

        <GameCard className="space-y-6 bg-[#2f3136]/90 backdrop-blur border-[#202225]">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Your Name
            </label>
            <Input
              placeholder="Enter your nickname..."
              className="bg-[#202225] border-none h-12 text-lg focus-visible:ring-primary/50"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={12}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                onClick={handleCreate}
                disabled={!username.trim() || createRoom.isPending}
              >
                {createRoom.isPending ? (
                  "Creating..."
                ) : (
                  <>
                    <Dice5 className="mr-2 w-5 h-5" />
                    New Game
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Start a new lobby and invite friends
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="CODE"
                  className="bg-[#202225] border-none h-14 text-center font-mono uppercase tracking-widest text-lg focus-visible:ring-primary/50"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button
                size="lg"
                variant="secondary"
                className="w-full bg-[#40444b] hover:bg-[#3ba55c] hover:text-white transition-all duration-300"
                onClick={handleJoin}
                disabled={!username.trim() || !roomCode.trim() || joinRoom.isPending}
              >
                {joinRoom.isPending ? "Joining..." : "Join Game"}
              </Button>
            </div>
          </div>
        </GameCard>
        
        <p className="text-center text-xs text-muted-foreground/50">
          By playing, you agree to have fun and maybe lose friends.
        </p>
      </div>
    </div>
  );
}
