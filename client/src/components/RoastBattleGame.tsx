import { useEffect, useState } from 'react';
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
  Hash,
  Play,
  UserPlus,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSoundEffect } from '@/hooks/useSoundEffect';

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
  const [spectatorCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [isSpectateMode, setIsSpectateMode] = useState(false);
  const { playRoastSubmitted, playMemeSound } = useSoundEffect();

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
    playRoastSubmitted();
    if (roastText.length > 100) playMemeSound('wow');
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: playerId,
      text: roastText,
      quality: Math.random() * 100
    };
    if (newMessage.quality > 85) {
      setTimeout(() => playMemeSound('airhorn'), 500);
    }
    setMessages([...messages, newMessage]);
    setRoastText('');
    onGameAction({ type: 'roast_submit', payload: newMessage });
  };

  const PlayerHUD = ({ player, side }: { player: Player, side: 'left' | 'right' }) => (
    <div className={`flex flex-col ${side === 'right' ? 'items-end' : 'items-start'} gap-2 w-full max-w-[220px]`}>
      <div className={`flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="relative">
          <motion.div 
            animate={{ 
              scale: isMyTurn && player._id === playerId ? [1, 1.05, 1] : 1,
              boxShadow: isMyTurn && player._id === playerId ? ["0 0 0px #a855f7", "0 0 20px #a855f7", "0 0 0px #a855f7"] : "none"
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-16 h-16 rounded-full border-4 ${side === 'left' ? 'border-primary shadow-[0_0_10px_#a855f7]' : 'border-secondary shadow-[0_0_10px_#06b6d4]'} p-1 bg-black`}
          >
            <div className="w-full h-full rounded-full bg-muted overflow-hidden flex items-center justify-center">
              {player.avatarUrl ? <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" /> : <Users className="w-8 h-8 opacity-50" />}
            </div>
          </motion.div>
          <Badge className={`absolute -bottom-1 ${side === 'left' ? '-right-1' : '-left-1'} bg-accent text-[8px] px-1 font-display border-black`}>
            RANK {Math.floor((player.score || 0) / 100) + 1}
          </Badge>
        </div>
        <div className={side === 'right' ? 'text-right' : 'text-left'}>
          <h3 className="text-[10px] font-display mb-1 truncate max-w-[100px] text-white tracking-tighter">{player.username}</h3>
          <div className={`flex items-center gap-1 ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-bold text-yellow-500">{player.score || 0}</span>
          </div>
        </div>
      </div>
      <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden border border-white/10 p-[2px] shadow-inner">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: `${Math.max(10, Math.min(100, (player.score % 100) || 75))}%` }}
          className={`h-full rounded-full transition-all duration-1000 ${side === 'left' ? 'bg-gradient-to-r from-purple-600 to-primary shadow-[0_0_10px_#a855f7]' : 'bg-gradient-to-r from-blue-600 to-secondary shadow-[0_0_10px_#06b6d4]'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full h-full max-h-[850px] p-4 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 scanline relative overflow-hidden">
      {/* Animated Stage Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
        <motion.div 
          animate={{ 
            x: ["-10%", "10%", "-10%"],
            y: ["-10%", "10%", "-10%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-[50%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent blur-3xl"
        />
      </div>

      {/* Top Bar / Topic Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 rounded-2xl border border-white/5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-display text-primary/80">CURRENT_ROAST_TOPIC</span>
          </div>
          <h2 className="text-xs md:text-sm font-bold text-white flex items-center gap-3">
            <Flame className="w-4 h-4 text-orange-500" />
            {currentTopic}
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={() => setCurrentTopic("Think your fashion sense is 'vintage'? It looks more like 'attic fire victim'.")}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border border-primary/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            <Users className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] font-display text-cyan-400">SPECTATORS: {spectatorCount}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsSpectateMode(!isSpectateMode)}
            className={`text-[10px] h-8 font-display border-primary/30 hover:bg-primary/20 ${isSpectateMode ? 'bg-primary/30 text-white border-primary shadow-[0_0_10px_#a855f7]' : 'text-primary'}`}
          >
            {isSpectateMode ? <Eye className="w-3 h-3 mr-2" /> : <Play className="w-3 h-3 mr-2" />}
            {isSpectateMode ? 'WATCHING' : 'BATTLE MODE'}
          </Button>
        </div>
      </div>

      {/* Main Arena */}
      <div className="flex-1 cyber-panel neon-border relative flex flex-col p-6 min-h-[450px] bg-black/60 shadow-2xl">
        {/* Battle Layout - HUDs */}
        <div className="flex justify-between items-start mb-12 gap-4">
          <PlayerHUD player={activePlayers[0] || players[0]} side="left" />
          <div className="flex flex-col items-center gap-3 pt-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <Zap className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]" />
              <div className="absolute inset-0 blur-xl bg-yellow-500/40 -z-10" />
            </motion.div>
            <Badge variant="outline" className="font-display text-[10px] py-1 px-3 border-white/20 text-white/40">ARENA V1.0</Badge>
          </div>
          <PlayerHUD player={activePlayers[1] || players[1]} side="right" />
        </div>

        {/* Roast Message Area */}
        <div className="flex-1 overflow-y-auto space-y-6 px-4 py-4 no-scrollbar scroll-smooth">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.8, x: msg.senderId === playerId ? 100 : -100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className={`flex ${msg.senderId === playerId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] p-5 rounded-3xl relative group ${
                  msg.senderId === playerId 
                  ? 'bg-primary/10 border-primary/30 text-white shadow-[0_0_20px_rgba(168,85,247,0.1)]' 
                  : 'bg-secondary/10 border-secondary/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                } border-2 backdrop-blur-xl transition-all hover:scale-[1.02]`}>
                  <div className="absolute -top-3 left-4 px-2 bg-black text-[8px] font-display text-muted-foreground uppercase tracking-widest">
                    {players.find(p => p._id === msg.senderId)?.username || 'Unknown'}
                  </div>
                  <p className="text-sm md:text-base font-medium leading-relaxed tracking-wide">{msg.text}</p>
                  
                  {/* Heat/Quality Meter */}
                  <div className="absolute -bottom-3 right-6 flex items-center gap-2 bg-black border border-white/10 px-3 py-1 rounded-full shadow-lg">
                    <Flame className={`w-3 h-3 ${msg.quality > 80 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`} />
                    <span className="text-[10px] font-bold text-white">{Math.round(msg.quality)}% HEAT</span>
                  </div>
                  
                  {/* Glitch & Sparks for High Impact */}
                  {msg.quality > 85 && (
                    <>
                      <div className="absolute inset-0 bg-primary/5 animate-glitch pointer-events-none rounded-3xl" />
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        className="absolute -inset-2 border border-primary/20 rounded-[2.5rem] pointer-events-none"
                      />
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Voting Overlay */}
        {phase === 'voting' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 gap-8"
          >
            <h2 className="text-2xl font-display text-primary animate-pulse">CAST YOUR VOTES!</h2>
            <div className="flex gap-12">
              {activePlayers.map((player) => (
                <motion.div key={player._id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="outline"
                    className="h-48 w-40 flex flex-col gap-4 bg-black/60 hover:bg-primary/20 border-2 border-primary/30 hover:border-primary transition-all group rounded-3xl"
                    onClick={() => onGameAction({ type: 'vote', payload: player._id })}
                  >
                    <div className="w-20 h-20 rounded-full border-4 border-primary/40 overflow-hidden bg-muted group-hover:border-primary">
                      {player.avatarUrl ? <img src={player.avatarUrl} alt="" className="w-full h-full object-cover" /> : <Users className="w-10 h-10 opacity-50 m-auto mt-4" />}
                    </div>
                    <div className="text-center">
                      <span className="font-display text-[12px] block text-white mb-2">{player.username}</span>
                      <Flame className="w-8 h-8 text-primary mx-auto group-hover:animate-bounce" />
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input / Control Deck */}
      <div className="cyber-panel p-6 flex flex-col gap-4 bg-black/80 border-t-2 border-primary/20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {/* Neon Turn Timer Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <Timer className={`w-4 h-4 ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-secondary'}`} />
              <span className={`text-[10px] font-display ${timeLeft < 10 ? 'text-destructive' : 'text-secondary'}`}>TIME_REMAINING: {timeLeft}S</span>
            </div>
            <span className="text-[8px] font-display text-white/20 tracking-[0.2em]">PHASE: {phase.toUpperCase()}</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5 shadow-inner">
            <motion.div 
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / 30) * 100}%` }}
              className={`h-full rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300 ${timeLeft < 10 ? 'bg-destructive' : 'bg-secondary'}`}
            />
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 group">
            <Input 
              value={roastText}
              onChange={(e) => setRoastText(e.target.value)}
              placeholder={isMyTurn ? "ENTER YOUR ROAST HERE..." : "WAITING FOR YOUR TURN..."}
              disabled={!isMyTurn}
              className={`h-14 bg-black/40 border-2 rounded-2xl transition-all font-medium text-base px-6 pr-20 ${isMyTurn ? 'border-primary/50 focus-visible:ring-primary shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'border-white/5 opacity-50 cursor-not-allowed'}`}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className={`text-[10px] font-display ${roastText.length > 130 ? 'text-destructive' : 'text-white/20'}`}>{roastText.length}/150</span>
            </div>
          </div>
          <Button 
            onClick={handleSend}
            disabled={!isMyTurn || !roastText.trim()}
            className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-display text-xs rounded-2xl group shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all"
          >
            SEND ROAST <Send className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>

        {/* Footer HUD elements */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-3">
            <Button variant="ghost" className="h-8 px-4 text-[9px] font-display text-white/30 hover:text-destructive hover:bg-destructive/10 rounded-xl">
              <ShieldAlert className="w-3.5 h-3.5 mr-2" /> REPORT
            </Button>
            <Button variant="ghost" className="h-8 px-4 text-[9px] font-display text-white/30 hover:text-white hover:bg-white/5 rounded-xl">
              <UserPlus className="w-3.5 h-3.5 mr-2" /> BLOCK
            </Button>
          </div>
          
          <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-2xl border border-white/5">
            <div className="flex flex-col gap-1 items-end">
              <span className="text-[8px] font-display text-white/40 tracking-widest">CREATIVITY_METER</span>
              <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  animate={{ width: `${Math.min(100, roastText.length * 0.7)}%` }}
                  className="heat-bar-fill"
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Flame className={`w-5 h-5 ${roastText.length > 100 ? 'text-red-500 animate-bounce' : 'text-muted-foreground'}`} />
              <span className="text-[8px] font-bold text-white/60">HOT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
