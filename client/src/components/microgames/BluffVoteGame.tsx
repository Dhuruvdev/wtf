import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { CheckCircle2, XCircle } from 'lucide-react';

interface BluffVoteGameProps {
  starPlayerId: number;
  timeLimit: number;
}

const STATEMENTS = [
  'I have visited 5 countries',
  'I can speak 3 languages',
  'I have won a coding competition',
  'I learned to code in 2 weeks',
  'I have never eaten pizza',
];

export function BluffVoteGame({ starPlayerId, timeLimit }: BluffVoteGameProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [statement, setStatement] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [phase, setPhase] = useState<'reading' | 'voting' | 'reveal'>('reading');
  const { currentPlayer, addVote } = useGameStore();

  useEffect(() => {
    setStatement(STATEMENTS[Math.floor(Math.random() * STATEMENTS.length)]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          if (phase === 'reading') setPhase('voting');
          return timeLimit;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLimit]);

  const handleVote = (isTruth: boolean) => {
    addVote(currentPlayer?.id || 0, isTruth ? 1 : 0);
    setHasVoted(true);
  };

  const isStarPlayer = currentPlayer?.id === starPlayerId;

  if (phase === 'reading') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-8"
      >
        <h3 className="text-2xl font-bold text-white">
          {isStarPlayer ? 'Make Your Statement' : 'Listen Carefully...'}
        </h3>

        <div className="p-8 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl border border-primary/30 max-w-2xl">
          <p className="text-3xl font-display font-bold text-white text-center">{statement}</p>
        </div>

        <div className="p-4 bg-[#202225] rounded-xl">
          <p className="text-muted-foreground text-sm">Time Left: {Math.max(0, timeLeft)}s</p>
        </div>

        {isStarPlayer && (
          <p className="text-muted-foreground text-center">
            Is this statement true or false? Stay in character!
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full gap-8"
    >
      <h3 className="text-2xl font-bold text-white">
        {isStarPlayer ? 'Await Votes' : 'True or Bluff?'}
      </h3>

      {!isStarPlayer && (
        <div className="space-y-4 w-full max-w-sm">
          <Button
            size="lg"
            className="w-full h-16 text-lg bg-green-600 hover:bg-green-700"
            onClick={() => handleVote(true)}
            disabled={hasVoted}
          >
            <CheckCircle2 className="mr-2 w-5 h-5" />
            TRUE
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full h-16 text-lg border-red-500/30"
            onClick={() => handleVote(false)}
            disabled={hasVoted}
          >
            <XCircle className="mr-2 w-5 h-5" />
            BLUFF
          </Button>
        </div>
      )}

      {hasVoted && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-400 font-bold"
        >
          Vote submitted!
        </motion.p>
      )}

      <div className="p-4 bg-[#202225] rounded-xl">
        <p className="text-muted-foreground text-sm">Time Left: {Math.max(0, timeLeft)}s</p>
      </div>
    </motion.div>
  );
}
