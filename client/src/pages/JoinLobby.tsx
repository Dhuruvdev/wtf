import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function JoinLobby() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new Error("Failed to create room");
      const data = await res.json();
      localStorage.setItem(`user_${data.code}`, data.playerId?.toString() || "");
      navigate(`/room/${data.code}`);
    } catch (err) {
      console.error("Create error", err);
      setError("Failed to create room");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim() || !roomCode.trim()) {
      setError("Please enter username and room code");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: roomCode }),
      });
      if (!res.ok) throw new Error("Failed to join room");
      const data = await res.json();
      localStorage.setItem(`user_${roomCode}`, data.playerId?.toString() || "");
      navigate(`/room/${roomCode}`);
    } catch (err) {
      console.error("Join error", err);
      setError("Failed to join room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black flex items-center justify-center p-4">
      {/* Pixel pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <Card className="border-4 border-purple-500 bg-black/80 backdrop-blur-sm shadow-2xl">
          <div className="p-12">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>
                WTF LAND
              </h1>
              <p className="text-lg font-bold text-purple-300 mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>@ thats.wtf</p>
              <p className="text-sm text-gray-400">Territory Claiming • Discord Activity • Multiplayer Chaos</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 rounded-lg flex gap-3 text-red-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* Main Content */}
            <div className="space-y-6">
              {/* Username Input */}
              <div>
                <label className="block text-purple-300 font-bold mb-2 text-sm">YOUR USERNAME</label>
                <Input
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                  className="bg-purple-950 border-2 border-purple-500 text-white placeholder:text-purple-400 h-12 font-bold"
                />
              </div>

              {/* Create Room Button */}
              <Button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg border-2 border-purple-400 shadow-lg"
              >
                {isLoading ? "CREATING..." : "CREATE ROOM"}
              </Button>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-1 border-t-2 border-purple-500"></div>
                <span className="px-4 text-purple-400 font-bold text-sm">OR JOIN EXISTING</span>
                <div className="flex-1 border-t-2 border-purple-500"></div>
              </div>

              {/* Join Room */}
              <div>
                <label className="block text-purple-300 font-bold mb-2 text-sm">ROOM CODE</label>
                <Input
                  placeholder="Enter room code (e.g., ABC123)"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  className="bg-purple-950 border-2 border-purple-500 text-white placeholder:text-purple-400 h-12 font-bold"
                />
              </div>

              <Button
                onClick={handleJoinRoom}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-lg border-2 border-cyan-400 shadow-lg"
              >
                {isLoading ? "JOINING..." : "JOIN ROOM"}
              </Button>
            </div>

            {/* How to Play */}
            <div className="mt-12 p-6 bg-purple-950/50 border-2 border-purple-500 rounded-lg">
              <h3 className="text-purple-300 font-bold text-sm mb-3" style={{ fontFamily: "'Press Start 2P', cursive" }}>HOW TO PLAY</h3>
              <ul className="text-xs text-gray-300 space-y-2 font-mono">
                <li>🎮 <span className="text-purple-300 font-bold">WASD</span> or Arrow Keys to move</li>
                <li>🌍 Close loops with your trail to claim territory</li>
                <li>💥 Hit your own trail or opponent's trail = eliminated</li>
                <li>🏆 Highest territory score in 5 minutes wins</li>
                <li>👥 Play with 2-8 players on Discord Voice Chat</li>
              </ul>
            </div>

            {/* Discord Activity Note */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 font-mono">Discord Activity • Voice Channel Support • Cross-Platform Play</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
