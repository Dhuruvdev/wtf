import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { RoastBattleScene } from '@/games/RoastBattleScene';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface Player {
  id: number;
  username: string;
}

interface RoastBattleGameProps {
  playerId: number;
  players: Player[];
  roomCode: string;
  onGameAction: (action: any) => void;
  onGameEnd: (winners: any[]) => void;
}

export function RoastBattleGame({ playerId, players, roomCode, onGameAction, onGameEnd }: RoastBattleGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RoastBattleScene | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [roastText, setRoastText] = useState('');
  const [phase, setPhase] = useState('selecting');
  const [timeLeft, setTimeLeft] = useState(15);
  const { playRoastSubmitted, playVoteSound, playElimination } = useSoundEffect();

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: containerRef.current,
      backgroundColor: '#0a0014',
      pixelArt: true,
      render: {
        antialias: false,
        antialiasGL: false,
        pixelPerfect: true,
      },
      scene: RoastBattleScene,
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!gameRef.current) return;

    const scene = gameRef.current.scene.getScene('RoastBattle') as RoastBattleScene;
    if (!scene) return;

    sceneRef.current = scene;

    const data = {
      playerId,
      onGameAction: (action: any) => {
        if (action.type === 'round_start') {
          setPhase('performing');
          setTimeLeft(15);
        }
        onGameAction(action);
      },
    };
    scene.events.emit('init', data);

    players.forEach((player) => {
      scene.addPlayer(player.id, player.username);
    });

    setGameStarted(true);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playerId, players, onGameAction]);

  const handleRoastSubmit = () => {
    if (sceneRef.current && roastText.trim()) {
      playRoastSubmitted();
      sceneRef.current.submitRoast(playerId, roastText);
      setRoastText('');
    }
  };

  const handleVote = (votedForId: number) => {
    if (sceneRef.current) {
      playVoteSound();
      sceneRef.current.submitVote(playerId, votedForId);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Game Canvas */}
      <div
        ref={containerRef}
        className="w-full rounded-lg border-4 border-purple-500 overflow-hidden bg-black"
        style={{ width: '100%', height: '600px' }}
      />

      {/* Input Section */}
      <div className="bg-black border-4 border-purple-500 rounded-lg p-6">
        {phase === 'performing' && (
          <div className="space-y-3">
            <label className="block text-purple-300 font-bold">Your Roast (15 seconds):</label>
            <textarea
              value={roastText}
              onChange={(e) => setRoastText(e.target.value)}
              placeholder="Write your roast here... 🔥"
              className="w-full bg-purple-950 border-2 border-purple-500 text-white p-3 rounded font-mono text-sm min-h-24"
              maxLength={200}
            />
            <div className="flex justify-between items-center">
              <span className="text-cyan-400 font-bold">Time: {timeLeft}s</span>
              <button
                onClick={handleRoastSubmit}
                disabled={!roastText.trim()}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold px-6 py-2 rounded border-2 border-red-400"
              >
                SUBMIT ROAST 🔥
              </button>
            </div>
            <p className="text-gray-400 text-xs">{roastText.length}/200</p>
          </div>
        )}

        {phase === 'voting' && (
          <div className="space-y-3">
            <label className="block text-cyan-300 font-bold text-lg">WHO HAS THE BETTER ROAST? (10 seconds)</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleVote(1)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded border-2 border-red-400 text-lg"
              >
                PLAYER 1 🎤
              </button>
              <button
                onClick={() => handleVote(2)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-6 rounded border-2 border-cyan-400 text-lg"
              >
                PLAYER 2 🎤
              </button>
            </div>
            <span className="text-cyan-400 font-bold text-center block">Time: {timeLeft}s</span>
          </div>
        )}

        {phase === 'results' && (
          <div className="text-center py-4">
            <p className="text-purple-300 font-bold text-lg">Round Results Being Calculated...</p>
            <p className="text-cyan-400 text-sm mt-2">{timeLeft}s until next round</p>
          </div>
        )}
      </div>
    </div>
  );
}
