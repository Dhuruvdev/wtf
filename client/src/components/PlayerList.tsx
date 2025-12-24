import { Player } from "@shared/schema";
import { Avatar } from "./Avatar";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: number;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
      <AnimatePresence>
        {players.map((player) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            layout
            className={`
              relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-colors
              ${player.id === currentPlayerId 
                ? "bg-primary/10 border-primary" 
                : "bg-[#2f3136] border-[#202225]"
              }
            `}
          >
            <Avatar 
              name={player.username} 
              url={player.avatarUrl} 
              isHost={player.isHost || false}
              size="md"
              className="mb-2"
            />
            <span className="font-medium text-sm truncate w-full text-center">
              {player.username}
            </span>
            <div className="mt-1 px-2 py-0.5 bg-[#202225] rounded-full text-xs font-mono text-muted-foreground">
              {player.score} pts
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Empty slots placeholders to fill grid visually if needed */}
      {Array.from({ length: Math.max(0, 8 - players.length) }).map((_, i) => (
        <div 
          key={`empty-${i}`} 
          className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#2f3136] opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-[#2f3136] mb-2" />
          <div className="h-4 w-16 bg-[#2f3136] rounded" />
        </div>
      ))}
    </div>
  );
}
