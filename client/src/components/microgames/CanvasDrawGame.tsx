import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eraser, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

interface CanvasDrawGameProps {
  timeLimit: number;
}

const PROMPTS = [
  'A dancing robot',
  'A pizza eating cat',
  'An astronaut on Mars',
  'A sleepy penguin',
  'A happy tree',
];

export function CanvasDrawGame({ timeLimit }: CanvasDrawGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [prompt, setPrompt] = useState('');
  const { currentPlayer, addResponse } = useGameStore();

  useEffect(() => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#202225';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#202225';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const submitDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      addResponse(currentPlayer?.id || 0, canvas.toDataURL());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full gap-4"
    >
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-bold text-white">Draw This</h3>
        <p className="text-3xl font-display font-bold text-primary">{prompt}</p>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        className="border-2 border-primary/30 rounded-xl cursor-crosshair bg-[#202225] shadow-lg"
      />

      <div className="flex gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={clearCanvas}
          className="border-primary/30"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={submitDrawing}
        >
          Submit Drawing
        </Button>
      </div>

      <div className="p-4 bg-[#202225] rounded-xl">
        <p className="text-muted-foreground text-sm">Time Left: {Math.max(0, timeLeft)}s</p>
      </div>
    </motion.div>
  );
}
