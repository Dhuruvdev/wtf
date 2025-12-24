import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Users, Copy, Plus, HelpCircle, Flame } from "lucide-react";
import iconUrl from "@assets/icon.png";
import { ArcadeBackground } from "@/components/ArcadeBackground";
import { SoundToggle } from "@/components/SoundToggle";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import { RoastBattleGame } from "@/components/microgames/RoastBattleGame";

export default function GameRoom() {
  const [, params] = useRoute("/room/:code");
  const [, navigate] = useLocation();
  const { playClick, playSuccess } = useSoundEffect();
  const code = params?.code;
  const [roomId, setRoomId] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<"lobby" | "waiting" | "roasting" | "voting" | "results">("lobby");
  const [players, setPlayers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(45);
  const [isHost, setIsHost] = useState(false);
  const [isAddingBot, setIsAddingBot] = useState(false);
  const [currentBattle, setCurrentBattle] = useState<any>(null);
  const [votesForPerformer1, setVotesForPerformer1] = useState(0);
  const [votesForPerformer2, setVotesForPerformer2] = useState(0);

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

  const handleCopyCode = () => {
    playClick();
    navigator.clipboard.writeText(code || "");
  };

  const handleStartRoastBattle = async () => {
    playClick();
    if (!roomId) {
      setError("Room not loaded");
      return;
    }
    try {
      const res = await fetch(`/api/rooms/${roomId}/start-roast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to start roast battle");
      const battle = await res.json();
      setCurrentBattle(battle);
      setGamePhase("waiting");
      setTimeLeft(45);
      playSuccess();
    } catch (err) {
      console.error("Start roast error", err);
      setError("Failed to start roast battle");
    }
  };

  const handleVote = async (votedForId: number) => {
    playClick();
    if (!currentBattle) return;
    try {
      const res = await fetch(`/api/roast-battles/${currentBattle.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: players[0]?.id, votedForId }),
      });
      if (!res.ok) throw new Error("Failed to vote");
      if (votedForId === currentBattle.performer1Id) {
        setVotesForPerformer1(prev => prev + 1);
      } else {
        setVotesForPerformer2(prev => prev + 1);
      }
      playSuccess();
    } catch (err) {
      console.error("Vote error", err);
      setError("Failed to submit vote");
    }
  };

  const handleEndBattle = async () => {
    if (!currentBattle) return;
    try {
      const res = await fetch(`/api/roast-battles/${currentBattle.id}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to end battle");
      setGamePhase("results");
      playSuccess();
    } catch (err) {
      console.error("End battle error", err);
      setError("Failed to end battle");
    }
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
              <h1 className="text-4xl font-bold text-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>ROAST BATTLE</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-700">Room: <span className="font-mono text-red-600 font-bold">{code}</span></p>
                <Button size="sm" variant="ghost" onClick={handleCopyCode} className="h-6 w-6 p-0" data-testid="button-copy-code">
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SoundToggle />
            <div className="text-right border-4 border-black bg-yellow-300 px-4 py-2">
              <p className="text-2xl font-bold text-black" style={{ fontFamily: "'Press Start 2P', cursive" }}>{formatTime(timeLeft)}</p>
              <p className="text-gray-900 text-sm font-bold">ROUND TIME</p>
            </div>
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
                <h2 className="text-3xl font-bold text-black mb-6" style={{ fontFamily: "'Press Start 2P', cursive" }}>PLAYER LOBBY</h2>
                <div className="space-y-4">
                  <p className="text-black font-bold text-lg">Players in room: {players.length}/8</p>
                  <div className="grid grid-cols-2 gap-3">
                    {players.map((p) => (
                      <div key={p.id} className="bg-white border-3 border-black p-4">
                        <p className="text-black font-bold">{p.username}</p>
                        <div className="flex gap-2 mt-1">
                          {p.isHost && <p className="text-red-600 text-xs font-bold">HOST</p>}
                          {p.isBot && <p className="text-blue-600 text-xs font-bold">BOT</p>}
                          {!p.isAlive && <p className="text-gray-600 text-xs font-bold">ELIMINATED</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {isHost && players.length < 8 && (
                    <Button 
                      onClick={handleAddBot}
                      disabled={isAddingBot}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold border-3 border-black"
                      data-testid="button-add-bot"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Bot Player
                    </Button>
                  )}
                  {isHost && (
                    <Button 
                      onClick={handleStartRoastBattle}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold border-3 border-black mt-6 text-lg" 
                      data-testid="button-start-game"
                    >
                      Start Game
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {(gamePhase === "waiting" || gamePhase === "roasting" || gamePhase === "voting") && currentBattle && (
              <div className="bg-white border-4 border-black p-8 min-h-96 flex items-center justify-center">
                <RoastBattleGame
                  performer1={{ id: currentBattle.performer1Id, username: currentBattle.performer1Id === players[0]?.id ? players[0]?.username : "Performer 1" }}
                  performer2={{ id: currentBattle.performer2Id, username: currentBattle.performer2Id === players[1]?.id ? players[1]?.username : "Performer 2" }}
                  currentPlayerId={players[0]?.id || 0}
                  timeLimit={45}
                  onVote={handleVote}
                  phase={gamePhase as "waiting" | "roasting" | "voting" | "results"}
                  votesForPerformer1={votesForPerformer1}
                  votesForPerformer2={votesForPerformer2}
                />
              </div>
            )}

            {gamePhase === "results" && currentBattle && (
              <Card className="border-4 border-black bg-orange-200 p-8">
                <h2 className="text-3xl font-bold text-black mb-6" style={{ fontFamily: "'Press Start 2P', cursive" }}>BATTLE RESULTS</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white border-3 border-black p-6 text-center">
                    <p className="text-xl font-bold text-black mb-2">Performer 1</p>
                    <p className="text-4xl font-bold text-yellow-500">{votesForPerformer1}</p>
                    <p className="text-gray-600 font-bold">VOTES</p>
                  </div>
                  <div className="bg-white border-3 border-black p-6 text-center">
                    <p className="text-xl font-bold text-black mb-2">Performer 2</p>
                    <p className="text-4xl font-bold text-yellow-500">{votesForPerformer2}</p>
                    <p className="text-gray-600 font-bold">VOTES</p>
                  </div>
                </div>
                <Button 
                  onClick={handleStartRoastBattle}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold border-3 border-black text-lg"
                  data-testid="button-next-battle"
                >
                  NEXT BATTLE
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          {gamePhase !== "lobby" && (
            <div className="space-y-6">
              {/* Players */}
              <Card className="border-4 border-black bg-red-200 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-black">ALIVE PLAYERS ({players.filter(p => p.isAlive).length}/8)</h3>
                </div>
                <div className="space-y-2">
                  {players.filter(p => p.isAlive).map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm font-bold bg-white p-2 border-2 border-black">
                      <span className="text-black">{p.username}</span>
                      <span className="text-yellow-600">{p.score}pts</span>
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
