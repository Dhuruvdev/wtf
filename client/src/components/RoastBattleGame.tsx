import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Timer, 
  Trophy, 
  Users, 
  Zap, 
  Send, 
  RotateCcw, 
  Eye, 
  ShieldAlert,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
  _id: string;
  username: string;
  score: number;
  avatarUrl?: string;
  isBot?: boolean;
}

interface RoastBattleGameProps {
  playerId: string;
  players: Player[];
  roomCode: string;
  onGameAction: (action: any) => void;
  onGameEnd: (winners: any[]) => void;
}

export function RoastBattleGame({ playerId, players, roomCode, onGameAction, onGameEnd }: RoastBattleGameProps) {
  const [roastText, setRoastText] = useState('');
  const [phase, setPhase] = useState<'lobby' | 'performing' | 'voting' | 'results'>('performing');
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentTopic, setCurrentTopic] = useState("Your haircut looks like a failed science experiment.");
  const [messages, setMessages] = useState<any[]>([]);
  const [spectatorCount, setSpectatorCount] = useState(42);
  const [isSpectateMode, setIsSpectateMode] = useState(false);

  // Derived state
  const activePlayers = players.slice(0, 2);
  const isMyTurn = phase === 'performing' && !isSpectateMode;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSend = () => {
    if (!roastText.trim()) return;
    const newMessage = {
      id: Date.now(),
      senderId: playerId,
      text: roastText,
      quality: Math.random() * 100
    };
    setMessages([...messages, newMessage]);
    setRoastText('');
    onGameAction({ type: 'roast_submit', payload: newMessage });
  };

  const PlayerHUD = ({ player, side }: { player: Player, side: 'left' | 'right' }) => (
    <div className={`flex flex-col ${side === 'right' ? 'items-end' : 'items-start'} gap-2 w-full max-w-[200px]`}>
      <div className={`flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className={`w-16 h-16 rounded-full border-4 ${side === 'left' ? 'border-primary' : 'border-secondary'} p-1`}
          >
            <div className="w-full h-full rounded-full bg-muted overflow-hidden flex items-center justify-center">
              {player.avatarUrl ? <img src={player.avatarUrl} alt="" /> : <Users className="w-8 h-8 opacity-50" />}
            </div>
          </motion.div>
          <Badge className="absolute -bottom-1 -right-1 bg-accent text-[8px] px-1 font-display">
            LVL.{Math.floor(player.score / 100) + 1}
          </Badge>
        </div>
        <div className={side === 'right' ? 'text-right' : 'text-left'}>
          <h3 className="text-xs font-display mb-1 truncate max-w-[100px]">{player.username}</h3>
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-500">{player.score}</span>
          </div>
        </div>
      </div>
      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
        <motion.div 
          initial={{ width: "100%" }}
          animate={{ width: `${Math.max(20, 100 - (player.score % 100))}%` }}
          className={`h-full rounded-full ${side === 'left' ? 'bg-primary shadow-[0_0_8px_#a855f7]' : 'bg-secondary shadow-[0_0_8px_#06b6d4]'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full h-full max-h-[800px] p-4 bg-background/50 rounded-2xl border border-white/5 scanline relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            <span className="text-xs font-display text-primary/80">TOPIC_BATTLE</span>
          </div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            {currentTopic}
            <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-primary">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-bold text-cyan-400">{spectatorCount}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsSpectateMode(!isSpectateMode)}
            className={`text-[10px] h-7 font-display border border-white/10 ${isSpectateMode ? 'bg-accent/20 text-accent' : ''}`}
          >
            {isSpectateMode ? 'SPECTATING' : 'JOINED'}
          </Button>
        </div>
      </div>

      {/* Main Arena */}
      <div className="flex-1 cyber-panel neon-border relative flex flex-col p-6 min-h-[400px]">
        {/* Battle Layout */}
        <div className="flex justify-between items-start mb-8 gap-4">
          <PlayerHUD player={activePlayers[0] || players[0]} side="left" />
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="relative">
              <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
              <div className="absolute inset-0 blur-lg bg-yellow-500/50 -z-10" />
            </div>
            <span className="text-[10px] font-display text-white/40">VS</span>
          </div>
          <PlayerHUD player={activePlayers[1] || players[1]} side="right" />
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto space-y-4 px-2 py-4 no-scrollbar">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.senderId === playerId ? 50 : -50, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                className={`flex ${msg.senderId === playerId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl relative group ${
                  msg.senderId === playerId 
                  ? 'bg-primary/20 border-primary/40 text-primary-foreground' 
                  : 'bg-muted/40 border-white/10 text-foreground'
                } border-2 backdrop-blur-md`}>
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                  
                  {/* Heat Meter for this roast */}
                  <div className="absolute -bottom-2 right-4 flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded-full border border-white/20">
                    <Flame className={`w-2.5 h-2.5 ${msg.quality > 80 ? 'text-red-500' : 'text-orange-400'}`} />
                    <span className="text-[8px] font-bold">{Math.round(msg.quality)}%</span>
                  </div>
                  
                  {/* Glitch effect on high quality */}
                  {msg.quality > 90 && (
                    <div className="absolute inset-0 bg-primary/10 animate-glitch pointer-events-none rounded-2xl" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Overlay */}
        {phase === 'voting' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          >
            <div className="flex gap-8">
              {[0, 1].map((idx) => (
                <Button 
                  key={idx}
                  variant="outline"
                  className="h-32 w-32 flex flex-col gap-2 bg-card/80 hover:bg-primary/20 border-2 hover:border-primary transition-all group"
                  onClick={() => onGameAction({ type: 'vote', payload: activePlayers[idx]._id })}
                >
                  <Flame className="w-8 h-8 text-primary group-hover:scale-125 transition-transform" />
                  <span className="font-display text-[10px]">{activePlayers[idx]?.username}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="cyber-panel p-4 flex flex-col gap-3">
        {/* Turn Timer Bar */}
        <div className="flex items-center gap-3">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / 30) * 100}%` }}
              className={`h-full ${timeLeft < 5 ? 'bg-destructive shadow-[0_0_8px_red]' : 'bg-secondary shadow-[0_0_8px_cyan]'}`}
            />
          </div>
          <div className="flex items-center gap-1 min-w-[50px]">
            <Timer className={`w-3 h-3 ${timeLeft < 5 ? 'text-destructive animate-pulse' : 'text-secondary'}`} />
            <span className={`text-[10px] font-bold ${timeLeft < 5 ? 'text-destructive' : 'text-secondary'}`}>{timeLeft}s</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input 
              value={roastText}
              onChange={(e) => setRoastText(e.target.value)}
              placeholder={isMyTurn ? "UNLEASH THE ROAST..." : "WAITING FOR TURN..."}
              disabled={!isMyTurn}
              className="h-12 bg-black/40 border-white/10 focus-visible:ring-primary text-sm font-medium pr-10"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className="text-[8px] text-white/20 font-display">{roastText.length}/150</span>
            </div>
          </div>
          <Button 
            onClick={handleSend}
            disabled={!isMyTurn || !roastText.trim()}
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-display text-[10px] group"
          >
            SEND <Send className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center px-1">
          <div className="flex gap-4">
            <Button variant="ghost" className="h-6 px-2 text-[8px] font-display text-white/30 hover:text-destructive">
              <ShieldAlert className="w-3 h-3 mr-1" /> REPORT
            </Button>
            <Button variant="ghost" className="h-6 px-2 text-[8px] font-display text-white/30 hover:text-primary">
               BLOCK
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-display text-white/20">QUALITY:</span>
            <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="heat-bar-fill" style={{ width: `${Math.min(100, roastText.length * 0.8)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
