import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

interface VoiceActGameProps {
  starPlayerId: number;
  timeLimit: number;
}

const PROMPTS = [
  'Sound like a robot ordering pizza',
  'Convince us you\'re a time traveler',
  'Act out a scared kitten',
  'Be a detective investigating a missing cake',
  'Mimic an angry chef',
  'Sound like an alien learning English',
];

export function VoiceActGame({ starPlayerId, timeLimit }: VoiceActGameProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isRecording, setIsRecording] = useState(false);
  const [prompt, setPrompt] = useState('');
  const { currentPlayer } = useGameStore();

  useEffect(() => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isStarPlayer = currentPlayer?.id === starPlayerId;

  if (!isStarPlayer) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full gap-6 text-center"
      >
        <div className="text-6xl">👂</div>
        <h3 className="text-2xl font-bold text-white">Listen Carefully</h3>
        <p className="text-muted-foreground max-w-sm">
          Pay attention to the prompt and get ready to guess what {currentPlayer?.username} is acting out!
        </p>
        <div className="mt-4 p-6 bg-primary/10 rounded-xl border border-primary/20">
          <p className="text-4xl font-display font-bold text-primary">{Math.max(0, timeLeft)}s</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full gap-8"
    >
      <div className="space-y-4 text-center">
        <h3 className="text-2xl font-bold text-white">Your Challenge</h3>
        <div className="p-6 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl border border-primary/30">
          <p className="text-3xl font-display font-bold text-white">{prompt}</p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsRecording(!isRecording)}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-red-500 shadow-lg shadow-red-500/50'
            : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'
        }`}
      >
        {isRecording ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
            <Mic className="w-10 h-10 text-white" />
          </motion.div>
        ) : (
          <MicOff className="w-10 h-10 text-white" />
        )}
      </motion.button>

      <div className="p-6 bg-[#202225] rounded-xl text-center">
        <p className="text-muted-foreground mb-2">Time Remaining</p>
        <p className="text-4xl font-display font-bold text-primary">{Math.max(0, timeLeft)}s</p>
      </div>

      <p className="text-sm text-muted-foreground">
        {isRecording ? 'Recording... voice detection active' : 'Click to start acting!'}
      </p>
    </motion.div>
  );
}
