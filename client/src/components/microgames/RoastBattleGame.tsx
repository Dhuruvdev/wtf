import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, Flame, Trophy } from 'lucide-react';

interface RoastBattleGameProps {
  performer1: { id: number; username: string };
  performer2: { id: number; username: string };
  currentPlayerId: number;
  timeLimit: number;
  onVote: (votedForId: number) => void;
  phase: 'waiting' | 'roasting' | 'voting' | 'results';
  votesForPerformer1?: number;
  votesForPerformer2?: number;
  winner?: number;
}

export function RoastBattleGame({
  performer1,
  performer2,
  currentPlayerId,
  timeLimit,
  onVote,
  phase,
  votesForPerformer1 = 0,
  votesForPerformer2 = 0,
  winner,
}: RoastBattleGameProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [hasVoted, setHasVoted] = useState(false);
  const isPerformer = currentPlayerId === performer1.id || currentPlayerId === performer2.id;
  const isPerformer1 = currentPlayerId === performer1.id;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setHasVoted(false);
  }, [phase, timeLimit]);

  const handleVote = (performerId: number) => {
    if (!hasVoted) {
      onVote(performerId);
      setHasVoted(true);
    }
  };

  if (phase === 'waiting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full gap-8"
      >
        <div className="text-center space-y-4">
          <Flame className="w-16 h-16 mx-auto text-orange-500 animate-pulse" />
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
            ROAST BATTLE INCOMING
          </h2>
          <p className="text-lg text-gray-300">Get ready for battle!</p>
        </div>
      </motion.div>
    );
  }

  if (phase === 'roasting') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-8"
      >
        <div className="text-center space-y-6 w-full max-w-4xl">
          <h2 className="text-3xl font-bold text-white">
            {isPerformer ? '🎤 YOUR ROAST TIME 🎤' : 'Watch the roasts...'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`p-6 rounded-xl border-2 ${
                isPerformer1
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-600 bg-gray-900/30'
              }`}
            >
              <div className="text-2xl font-bold text-orange-400 mb-2">
                {performer1.username}
              </div>
              {isPerformer1 && (
                <div className="text-gray-300 italic text-sm">
                  [Prepare your roast...]
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`p-6 rounded-xl border-2 ${
                !isPerformer1
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-900/30'
              }`}
            >
              <div className="text-2xl font-bold text-red-400 mb-2">
                {performer2.username}
              </div>
              {!isPerformer1 && (
                <div className="text-gray-300 italic text-sm">
                  [Prepare your roast...]
                </div>
              )}
            </motion.div>
          </div>

          <div className="p-4 bg-gray-800 rounded-lg inline-block">
            <span className="text-yellow-400 font-bold text-2xl">
              {Math.max(0, timeLeft)}s
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (phase === 'voting') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-8"
      >
        <h2 className="text-3xl font-bold text-white">WHO WAS BETTER?</h2>

        {!isPerformer && (
          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote(performer1.id)}
              disabled={hasVoted}
              className={`p-6 rounded-xl font-bold text-lg transition-all ${
                hasVoted
                  ? 'opacity-50'
                  : 'hover:scale-105'
              } ${
                !hasVoted
                  ? 'border-2 border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400'
                  : 'border-2 border-gray-600 bg-gray-900/30 text-gray-400'
              }`}
            >
              <Zap className="w-8 h-8 mx-auto mb-2" />
              {performer1.username}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleVote(performer2.id)}
              disabled={hasVoted}
              className={`p-6 rounded-xl font-bold text-lg transition-all ${
                hasVoted
                  ? 'opacity-50'
                  : 'hover:scale-105'
              } ${
                !hasVoted
                  ? 'border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400'
                  : 'border-2 border-gray-600 bg-gray-900/30 text-gray-400'
              }`}
            >
              <Zap className="w-8 h-8 mx-auto mb-2" />
              {performer2.username}
            </motion.button>
          </div>
        )}

        {isPerformer && (
          <div className="text-center text-gray-300">
            <p className="text-lg">Waiting for votes...</p>
          </div>
        )}

        {hasVoted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-400 font-bold text-lg"
          >
            ✓ Vote submitted!
          </motion.div>
        )}

        <div className="p-4 bg-gray-800 rounded-lg inline-block">
          <span className="text-yellow-400 font-bold text-2xl">
            {Math.max(0, timeLeft)}s
          </span>
        </div>
      </motion.div>
    );
  }

  // Results phase
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full gap-8"
    >
      <div className="text-center space-y-8">
        <Trophy className="w-16 h-16 mx-auto text-yellow-400 animate-bounce" />
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
          {winner === performer1.id ? performer1.username : performer2.username} WINS!
        </h2>

        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl ${
              winner === performer1.id
                ? 'border-2 border-yellow-400 bg-yellow-400/10'
                : 'border-2 border-gray-600 bg-gray-900/30'
            }`}
          >
            <div className="text-2xl font-bold mb-2 text-orange-400">
              {performer1.username}
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {votesForPerformer1}
            </div>
            <div className="text-sm text-gray-400">votes</div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl ${
              winner === performer2.id
                ? 'border-2 border-yellow-400 bg-yellow-400/10'
                : 'border-2 border-gray-600 bg-gray-900/30'
            }`}
          >
            <div className="text-2xl font-bold mb-2 text-red-400">
              {performer2.username}
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {votesForPerformer2}
            </div>
            <div className="text-sm text-gray-400">votes</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
