import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';

interface EmojiRelayGameProps {
  timeLimit: number;
}

const EMOJIS = ['🍕', '🎮', '🚀', '🎸', '🏆', '💎', '🌟', '🦖', '🎨', '⚡'];

export function EmojiRelayGame({ timeLimit }: EmojiRelayGameProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [chain, setChain] = useState<string[]>(['🎮']);
  const [selected, setSelected] = useState<string | null>(null);
  const { currentPlayer, addResponse } = useGameStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEmojiSelect = (emoji: string) => {
    setSelected(emoji);
    setTimeout(() => {
      setChain([...chain, emoji]);
      setSelected(null);
      if (chain.length >= 5) {
        addResponse(currentPlayer?.id || 0, chain.join(''));
      }
    }, 200);
  };

  const selectedEmojis = EMOJIS.sort(() => Math.random() - 0.5).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full gap-8"
    >
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold text-white">Emoji Relay</h3>
        <p className="text-muted-foreground">Pick emojis to continue the chain!</p>
      </div>

      <div className="p-6 bg-[#202225] rounded-2xl border border-primary/20">
        <div className="flex flex-wrap gap-3 justify-center min-h-12">
          <AnimatePresence mode="popLayout">
            {chain.map((emoji, i) => (
              <motion.div
                key={`${emoji}-${i}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="text-4xl"
              >
                {emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {selectedEmojis.map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEmojiSelect(emoji)}
            className={`text-4xl p-4 rounded-lg transition-all ${
              selected === emoji
                ? 'bg-primary/30 scale-110'
                : 'bg-[#2f3136] hover:bg-primary/20'
            }`}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      <div className="p-4 bg-[#202225] rounded-xl">
        <p className="text-muted-foreground text-sm">
          Chain length: {chain.length} | Time Left: {Math.max(0, timeLeft)}s
        </p>
      </div>
    </motion.div>
  );
}
