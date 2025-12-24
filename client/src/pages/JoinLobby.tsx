import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import logoUrl from "@assets/logo.png";

export default function JoinLobby() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      setError("Please enter your username");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      navigate(`/room/${data.code}`);
    } catch (err) {
      setError("Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim() || !roomCode.trim()) {
      setError("Please enter username and room code");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: roomCode }),
      });
      const data = await res.json();
      navigate(`/room/${roomCode}`);
    } catch (err) {
      setError("Failed to join room");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="WHO BROKE IT?" className="h-32 w-auto drop-shadow-lg" data-testid="img-logo" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 text-center">WHO BROKE IT?</h1>
          <p className="text-slate-400 text-center mb-8">Social Deception • Chaos • Accusations</p>

          <div className="space-y-4 mb-6">
            <Input
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              data-testid="input-username"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-md flex gap-2 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full bg-purple-600 hover:bg-purple-700"
              data-testid="button-create-room"
            >
              Create Game
            </Button>

            <div className="relative flex items-center my-6">
              <div className="flex-1 border-t border-slate-600"></div>
              <span className="px-3 text-slate-500 text-sm">OR</span>
              <div className="flex-1 border-t border-slate-600"></div>
            </div>

            <div>
              <Input
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 mb-3"
                data-testid="input-room-code"
              />
              <Button
                onClick={handleJoinRoom}
                disabled={isCreating}
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-700"
                data-testid="button-join-room"
              >
                Join Game
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
