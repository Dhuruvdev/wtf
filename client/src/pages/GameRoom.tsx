import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Users, Copy, Plus } from "lucide-react";
import { RoastBattleGame } from "@/components/RoastBattleGame";

export default function GameRoom() {
  const [, params] = useRoute("/room/:code");
  const [, navigate] = useLocation();
  const code = params?.code;
  const [roomId, setRoomId] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<"lobby" | "playing" | "results">("lobby");
  const [players, setPlayers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [isAddingBot, setIsAddingBot] = useState(false);
  const [gameResults, setGameResults] = useState<any>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const autoJoin = async () => {
      if ((window as any).discord?.activity) {
        const user = (window as any).discord.user;
        if (user && !localStorage.getItem(`user_${code}`)) {
          try {
            const res = await fetch("/api/rooms/join", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code,
                username: user.username,
                avatarUrl: user.avatarUrl
              }),
            });
            const data = await res.json();
            localStorage.setItem(`user_${code}`, data.playerId);
            window.location.reload();
          } catch (e) {
            console.error("Auto-join failed", e);
          }
        }
      }
    };
    autoJoin();

    const loadRoom = async () => {
      if (!code) return;
      try {
        const res = await fetch(`/api/rooms/${code}`);
        const data = await res.json();
        setRoomId(data._id);
        setPlayers(data.players || []);

        const storedUserId = localStorage.getItem(`user_${code}`);
        if (storedUserId) {
          setCurrentPlayerId(storedUserId);
        }

        const hostPlayer = data.players?.find((p: any) => p.isHost);
        if (hostPlayer) setIsHost(hostPlayer._id === storedUserId);
      } catch (err) {
        setError("Failed to load room");
      }
    };
    loadRoom();
  }, [code]);

  const handleAddBot = async () => {
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
    } catch (err) {
      console.error("Add bot error", err);
      setError("Failed to add bot player");
    } finally {
      setIsAddingBot(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code || "");
  };

  const handleStartGame = async () => {
    if (!roomId || players.length < 2) {
      setError("Need at least 2 players to start");
      return;
    }
    try {
      const endpoint = `/api/rooms/${roomId}/start`;
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to start game");
      setGamePhase("playing");
    } catch (err) {
      console.error("Start game error", err);
      setError(`Failed to start Roast Battle game`);
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
    <div className="min-h-screen p-4 bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                WTF LAND
              </h1>
              <span className="text-2xl font-bold text-purple-300">@ thats.wtf</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-gray-400 font-mono">Room: <span className="text-cyan-400 font-bold">{code}</span></p>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                className="text-purple-400 hover:text-purple-300"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-4 border-2 border-red-500 bg-red-950/50 p-4 mb-6">
            <div className="flex gap-2 text-red-300 font-bold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {gamePhase === "lobby" && (
              <Card className="border-4 border-purple-500 bg-black/70 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-purple-300" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                    LOBBY
                  </h2>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-300 font-bold">Players: {players.length}/8</p>
                  <div className="grid grid-cols-2 gap-3">
                    {players.map((p) => (
                      <div key={p._id} className="bg-purple-950 border-2 border-purple-500 p-4 rounded">
                        <p className="text-white font-bold">{p.username}</p>
                        <div className="flex gap-2 mt-2">
                          {p.isHost && <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold">HOST</span>}
                          {p.isBot && <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold">BOT</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isHost && players.length < 8 && (
                    <Button
                      onClick={handleAddBot}
                      disabled={isAddingBot}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold border-2 border-blue-400 h-10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Bot
                    </Button>
                  )}

                  {isHost && players.length >= 2 && (
                    <Button
                      onClick={handleStartGame}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold border-2 border-purple-400 h-12 text-lg mt-6"
                    >
                      START ROAST BATTLE
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {gamePhase === "playing" && currentPlayerId && (
              <RoastBattleGame
                playerId={currentPlayerId}
                players={players}
                roomCode={code || ""}
                onGameAction={handleGameAction}
                onGameEnd={handleGameEnd}
              />
            )}

            {gamePhase === "results" && gameResults && (
              <Card className="border-4 border-cyan-500 bg-black/70 p-8">
                <h2 className="text-3xl font-bold text-cyan-300 mb-6" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                  FINAL RANKINGS
                </h2>
                <div className="space-y-3 mb-6">
                  {gameResults.map((winner: any, idx: number) => (
                    <div key={idx} className="bg-purple-950 border-2 border-purple-500 p-4 flex justify-between items-center rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-purple-400">#{idx + 1}</span>
                        <span className="text-white font-bold">{winner.username}</span>
                      </div>
                      <span className="text-cyan-400 font-bold text-lg">{winner.score} pts</span>
                    </div>
                  ))}
                </div>
                {isHost && (
                  <Button
                    onClick={handleStartGame}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold border-2 border-cyan-400 h-12 text-lg"
                  >
                    PLAY AGAIN
                  </Button>
                )}
              </Card>
            )}
          </div>

          {gamePhase !== "lobby" && (
            <div>
              <Card className="border-4 border-cyan-500 bg-black/70 p-4 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-cyan-300">PLAYERS ({players.filter(p => p.isAlive !== false).length}/{players.length})</h3>
                </div>
                <div className="space-y-2">
                  {players.filter(p => p.isAlive !== false).map((p) => (
                    <div key={p._id} className="flex items-center justify-between text-sm font-bold bg-purple-950 p-2 border border-purple-500 rounded">
                      <span className="text-white">{p.username}</span>
                      <span className="text-cyan-400">{p.score || 0}pts</span>
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
