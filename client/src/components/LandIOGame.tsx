import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { LandIOScene } from '@/games/LandIOScene';

interface Player {
  id: number;
  username: string;
  color?: string;
}

interface LandIOGameProps {
  playerId: number;
  players: Player[];
  roomCode: string;
  onGameAction: (action: any) => void;
  onGameEnd: (winners: any[]) => void;
}

export function LandIOGame({ playerId, players, roomCode, onGameAction, onGameEnd }: LandIOGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LandIOScene | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameTime, setGameTime] = useState(300);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      scene: LandIOScene,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
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

    const scene = gameRef.current.scene.getScene('LandIO') as LandIOScene;
    if (!scene) return;

    sceneRef.current = scene;

    const data = {
      playerId,
      onGameAction: onGameAction || (() => {}),
    };
    scene.events.emit('init', data);

    players.forEach((player, index) => {
      const x = 100 + index * 150;
      const y = 100 + (index % 2) * 150;
      scene.addPlayer(player.id, x, y, index);
    });

    setGameStarted(true);

    gameTimerRef.current = setInterval(() => {
      setGameTime((prev) => {
        if (prev <= 1) {
          if (gameTimerRef.current) clearInterval(gameTimerRef.current);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [playerId, players, onGameAction]);

  const endGame = () => {
    if (!sceneRef.current) return;

    sceneRef.current.endGame();

    const gameState = sceneRef.current.getGameState();
    const winners = gameState.players
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3);

    onGameEnd(winners);

    if (onGameAction) {
      onGameAction({
        type: 'game_ended',
        winners,
      });
    }
  };

  return (
    <div className="w-full rounded-lg border-4 border-purple-500 overflow-hidden shadow-2xl bg-black">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ width: '100%', height: '600px' }}
      />

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 bg-black/80 border-2 border-purple-500 text-white p-4 rounded font-mono text-sm">
        <div className="font-bold mb-2">
          <span className="text-purple-400">WTF LAND</span>
          <span className="text-cyan-400 ml-2">@ thats.wtf</span>
        </div>
        <div className="text-gray-300">Time: {Math.floor(gameTime / 60)}:{String(gameTime % 60).padStart(2, '0')}</div>
        <div className="text-gray-300">Players: {players.length}</div>
        {gameStarted && <div className="text-green-400 mt-2 font-bold">GAME ACTIVE</div>}
      </div>

      {gameTime <= 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95">
          <div className="bg-gradient-to-r from-purple-600 to-cyan-600 border-4 border-white p-8 text-center rounded-lg shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              TIME'S UP
            </h2>
            <p className="text-white font-bold text-lg">Calculating final scores...</p>
          </div>
        </div>
      )}
    </div>
  );
}
