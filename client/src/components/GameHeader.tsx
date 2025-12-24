import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Volume2 } from "lucide-react";

interface GameHeaderProps {
  roomCode: string;
  round?: number;
}

export function GameHeader({ roomCode, round }: GameHeaderProps) {
  const [, setLocation] = useLocation();

  const handleLeave = () => {
    if (confirm("Are you sure you want to leave the game?")) {
      setLocation("/");
    }
  };

  return (
    <header className="h-16 border-b border-[#202225] bg-[#2f3136] px-4 md:px-6 flex items-center justify-between shadow-sm z-10">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          thats.wtf
        </h1>
        <div className="hidden md:block h-6 w-px bg-[#40444b]" />
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <span>Room Code:</span>
          <span className="font-mono font-bold text-foreground bg-[#202225] px-2 py-0.5 rounded select-all">
            {roomCode}
          </span>
        </div>
      </div>

      {round !== undefined && round > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 bg-[#202225] px-4 py-1 rounded-full border border-primary/20 shadow-lg shadow-primary/5">
          <span className="font-bold text-primary">ROUND {round}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Volume2 className="w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
          onClick={handleLeave}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Leave
        </Button>
      </div>
    </header>
  );
}
