import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Users, Copy, Plus } from "lucide-react";
import iconUrl from "@assets/icon.png";
import { SpaceBackground } from "@/components/SpaceBackground";

export default function GameRoom() {
  const [, params] = useRoute("/room/:code");
  const [, navigate] = useLocation();
  const code = params?.code;
  const [roomId, setRoomId] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<"lobby" | "playing" | "voting" | "results">("lobby");
  const [players, setPlayers] = useState<any[]>([]);
  const [isKnower, setIsKnower] = useState(false);
  const [broken, setBroken] = useState("");
  const [clueInput, setClueInput] = useState("");
  const [clues, setClues] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(240);
  const [isHost, setIsHost] = useState(false);
  const [isAddingBot, setIsAddingBot] = useState(false);

  // Load room data on mount
  useEffect(() => {
    const loadRoom = async () => {
      if (!code) return;
      try {
        const res = await fetch(`/api/rooms/${code}`);
        const data = await res.json();
        setRoomId(data.id);
        setPlayers(data.players || []);
        // Check if current user is host
        const currentUserId = localStorage.getItem(`user_${code}`);
        const hostPlayer = data.players?.find((p: any) => p.isHost);
        if (hostPlayer) setIsHost(hostPlayer.id === parseInt(currentUserId || "0"));
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [gamePhase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitClue = () => {
    if (clueInput.trim()) {
      setClues([...clues, clueInput]);
      setClueInput("");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code || "");
  };

  return (
    <div className="min-h-screen p-4">
      <SpaceBackground />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={iconUrl} alt="Icon" className="h-10 w-10 drop-shadow-lg" data-testid="img-icon" />
            <div>
              <h1 className="text-3xl font-bold text-white">WHO BROKE IT?</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-400">Room: <span className="font-mono text-purple-400">{code}</span></p>
                <Button size="sm" variant="ghost" onClick={handleCopyCode} className="h-6 w-6 p-0" data-testid="button-copy-code">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-400">{formatTime(timeLeft)}</p>
            <p className="text-slate-400 text-sm">Round time</p>
          </div>
        </div>

        {error && (
          <Card className="mb-4 border-red-700 bg-red-900/30 backdrop-blur-sm p-4">
            <div className="flex gap-2 text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {gamePhase === "lobby" && (
              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Waiting for Host to Start...</h2>
                <div className="space-y-4">
                  <p className="text-slate-300">Players in room: {players.length}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {players.map((p) => (
                      <div key={p.id} className="bg-slate-700 rounded-lg p-4">
                        <p className="text-white font-medium">{p.username}</p>
                        <div className="flex gap-2 mt-1">
                          {p.isHost && <p className="text-purple-400 text-xs">Host</p>}
                          {p.isBot && <p className="text-blue-400 text-xs">Bot</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {isHost && players.length < 8 && (
                    <Button 
                      onClick={handleAddBot}
                      disabled={isAddingBot}
                      variant="outline"
                      className="w-full border-slate-600 hover:bg-slate-700"
                      data-testid="button-add-bot"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Bot Player
                    </Button>
                  )}
                  {isHost && (
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-6" data-testid="button-start-game">
                      Start Game
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {gamePhase === "playing" && (
              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm p-8">
                {isKnower ? (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">You Know What Broke!</h2>
                    <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-6 mb-6">
                      <p className="text-slate-400 text-sm mb-2">ITEM BROKEN:</p>
                      <p className="text-3xl font-bold text-purple-300">{broken}</p>
                    </div>
                    <p className="text-slate-300 mb-4">Listen to others' clues and try to stay suspicious. Be vague and misleading!</p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Clue Phase</h2>
                    <div className="bg-slate-700/30 rounded-lg p-6 mb-6">
                      <p className="text-slate-300">You don't know what broke. Listen to the clues and figure out who's lying!</p>
                    </div>
                    <div className="space-y-3">
                      {clues.map((clue, i) => (
                        <div key={i} className="bg-slate-700 rounded-lg p-4">
                          <p className="text-white">{clue}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {gamePhase === "voting" && (
              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Who Did It? Vote!</h2>
                <div className="grid grid-cols-2 gap-4">
                  {players.map((p) => (
                    <Button
                      key={p.id}
                      variant="outline"
                      className="border-slate-600 hover:bg-slate-700 h-20 text-white"
                      data-testid={`button-vote-${p.id}`}
                    >
                      {p.username}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {gamePhase === "results" && (
              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Round Results</h2>
                <div className="bg-slate-700 rounded-lg p-6 mb-6">
                  <p className="text-slate-400 text-sm mb-2">ITEM BROKEN:</p>
                  <p className="text-2xl font-bold text-white">{broken}</p>
                </div>
                <div className="space-y-3">
                  <p className="text-white">Knower received points for staying hidden!</p>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-6" data-testid="button-next-round">
                  Next Round
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Players */}
            <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">Players ({players.length}/8)</h3>
              </div>
              <div className="space-y-2">
                {players.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm text-slate-300">
                    <span>{p.username}</span>
                    <span className="font-bold text-white">{p.score}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Actions */}
            {gamePhase === "playing" && !isKnower && (
              <Card className="border-slate-700 bg-slate-800/80 backdrop-blur-sm p-4">
                <h3 className="font-bold text-white mb-3">Give a Clue</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your clue..."
                    value={clueInput}
                    onChange={(e) => setClueInput(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-500 text-sm"
                    data-testid="input-clue"
                  />
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={handleSubmitClue}
                    data-testid="button-submit-clue"
                  >
                    Submit Clue
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
