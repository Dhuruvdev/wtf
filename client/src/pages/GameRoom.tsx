import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Users, Copy, Plus, HelpCircle, Flame } from "lucide-react";
import iconUrl from "@assets/icon.png";
import { ArcadeBackground } from "@/components/ArcadeBackground";
import { SoundToggle } from "@/components/SoundToggle";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import { LandIOGame } from "@/components/LandIOGame";

export default function GameRoom() {
  const [, params] = useRoute("/room/:code");
  const [, navigate] = useLocation();
  const { playClick, playSuccess } = useSoundEffect();
  const code = params?.code;
  const [roomId, setRoomId] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<"lobby" | "playing" | "results">("lobby");
  const [players, setPlayers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [isAddingBot, setIsAddingBot] = useState(false);
  const [gameResults, setGameResults] = useState<any>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<number | null>(null);

  // Load room data on mount
  useEffect(() => {
    const loadRoom = async () => {
      if (!code) return;
      try {
        const res = await fetch(`/api/rooms/${code}`);
        const data = await res.json();
        setRoomId(data.id);
        setPlayers(data.players || []);
        
        const storedUserId = localStorage.getItem(`user_${code}`);
        if (storedUserId) {
          setCurrentPlayerId(parseInt(storedUserId));
        }
        
        const hostPlayer = data.players?.find((p: any) => p.isHost);
        if (hostPlayer) setIsHost(hostPlayer.id === parseInt(storedUserId || "0"));
      } catch (err) {
        setError("Failed to load room");
      }
    };
    loadRoom();
  }, [code]);

  const handleAddBot = async () => {
    playClick();
    if (!roomId) {
      setError("Room not loaded");
      return;
    }
    setIsAddingBot(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/add-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const botPlayer = await res.json();
      setPlayers([...players, botPlayer]);
      playSuccess();
    } catch (err) {
      console.error("Add bot error", err);
      setError("Failed to add bot player");
    } finally {
      setIsAddingBot(false);
    }
  };

  const handleCopyCode = () => {
    playClick();
    navigator.clipboard.writeText(code || "");
  };

  const handleStartGame = async () => {
    playClick();
    if (!roomId || players.length < 2) {
      setError("Need at least 2 players to start");
      return;
    }
    try {
      const res = await fetch(`/api/rooms/${roomId}/start-land-io`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to start game");
      setGamePhase("playing");
      playSuccess();
    } catch (err) {
      console.error("Start game error", err);
      setError("Failed to start Land.io game");
    }
  };

  const handleGameAction = async (action: any) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/game-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      if (!res.ok) throw new Error("Failed to process game action");
    } catch (err) {
      console.error("Game action error", err);
    }
  };

  const handleGameEnd = (winners: any[]) => {
    setGameResults(winners);
    setGamePhase("results");
  };

  return (
    <div className="min-h-screen p-4 bg-white">
      <ArcadeBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Flame className="w-12 h-12 text-red-600 animate-bounce" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-bold text-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>LAND.IO</h1>
                <span className="text-2xl font-bold text-purple-600" style={{ fontFamily: "'Press Start 2P', cursive" }}>@ thats.wtf</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-700">Room: <span className="font-mono text-red-600 font-bold">{code}</span></p>
                <Button size="sm" variant="ghost" onClick={handleCopyCode} className="h-6 w-6 p-0">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SoundToggle />
          </div>
        </div>

        {error && (
          <Card className="mb-4 border-4 border-red-600 bg-red-200 p-4">
            <div className="flex gap-2 text-red-900 font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Main Content */}
          <div>
            {gamePhase === "lobby" && (
              <Card className="border-4 border-black bg-yellow-200 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-3xl font-bold text-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>LOBBY</h2>
                  <span className="text-lg font-bold text-purple-600" style={{ fontFamily: "'Press Start 2P', cursive" }}>thats.wtf</span>
                </div>
                <div className="space-y-4">
                  <p className="text-black font-bold text-lg">Players: {players.length}/8</p>
                  <div className="grid grid-cols-2 gap-3">
                    {players.map((p) => (
                      <div key={p.id} className="bg-white border-3 border-black p-4">
                        <p className="text-black font-bold">{p.username}</p>
                        <div className="flex gap-2 mt-1">
                          {p.isHost && <p className="text-red-600 text-xs font-bold">HOST</p>}
                          {p.isBot && <p className="text-blue-600 text-xs font-bold">BOT</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {isHost && players.length < 8 && (
                    <Button 
                      onClick={handleAddBot}
                      disabled={isAddingBot}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold border-3 border-black"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Bot Player
                    </Button>
                  )}
                  {isHost && players.length >= 2 && (
                    <Button 
                      onClick={handleStartGame}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold border-3 border-black text-lg mt-6"
                    >
                      START GAME
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {gamePhase === "playing" && currentPlayerId && (
              <LandIOGame
                playerId={currentPlayerId}
                players={players}
                roomCode={code || ""}
                onGameAction={handleGameAction}
                onGameEnd={handleGameEnd}
              />
            )}

            {gamePhase === "results" && gameResults && (
              <Card className="border-4 border-black bg-orange-200 p-8">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-3xl font-bold text-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>GAME RESULTS</h2>
                  <span className="text-lg font-bold text-purple-600" style={{ fontFamily: "'Press Start 2P', cursive" }}>thats.wtf</span>
                </div>
                <div className="space-y-3 mb-6">
                  {gameResults.map((winner: any, idx: number) => (
                    <div key={idx} className="bg-white border-3 border-black p-4 flex justify-between">
                      <span className="font-bold text-black">{idx + 1}. {winner.username}</span>
                      <span className="font-bold text-yellow-600">{winner.score} pts</span>
                    </div>
                  ))}
                </div>
                {isHost && (
                  <Button 
                    onClick={handleStartGame}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold border-3 border-black text-lg"
                  >
                    PLAY AGAIN
                  </Button>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          {gamePhase !== "lobby" && (
            <div className="space-y-6">
              <Card className="border-4 border-black bg-red-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-black">PLAYERS ({players.filter(p => p.isAlive).length}/{players.length})</h3>
                </div>
                <div className="space-y-2">
                  {players.filter(p => p.isAlive).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm font-bold bg-white p-2 border-2 border-black">
                      <span className="text-black">{p.username}</span>
                      <span className="text-yellow-600">{p.score || 0}pts</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
