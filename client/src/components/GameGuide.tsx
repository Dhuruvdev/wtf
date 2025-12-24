import { Card } from "@/components/ui/card";
import { Users, Brain, Vote, Trophy } from "lucide-react";

export function GameGuide() {
  return (
    <Card className="border-purple-700 bg-purple-900/30 backdrop-blur-sm p-6 mb-6">
      <h2 className="text-2xl font-bold text-purple-300 mb-4">How to Play</h2>
      
      <div className="space-y-4">
        {/* Setup Phase */}
        <div className="border-l-4 border-purple-500 pl-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white">SETUP</h3>
              <p className="text-slate-300 text-sm">Gather 2-8 players. One player is secretly the "Knower" who knows what broke.</p>
            </div>
          </div>
        </div>

        {/* Clue Phase */}
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white">CLUE PHASE (4 Minutes)</h3>
              <p className="text-slate-300 text-sm"><span className="font-semibold">Knower:</span> Gives misleading clues to hide their identity.</p>
              <p className="text-slate-300 text-sm"><span className="font-semibold">Others:</span> Give honest clues to help guess what broke.</p>
            </div>
          </div>
        </div>

        {/* Voting Phase */}
        <div className="border-l-4 border-amber-500 pl-4">
          <div className="flex items-start gap-3">
            <Vote className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white">VOTING PHASE</h3>
              <p className="text-slate-300 text-sm"><span className="font-semibold">All Players:</span> Vote on who the Knower is (the liar).</p>
            </div>
          </div>
        </div>

        {/* Scoring */}
        <div className="border-l-4 border-green-500 pl-4">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white">SCORING</h3>
              <p className="text-slate-300 text-sm">✓ <span className="font-semibold">Knower:</span> +2 points if not caught</p>
              <p className="text-slate-300 text-sm">✓ <span className="font-semibold">Others:</span> +1 point if they guess correctly OR catch the Knower</p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-slate-800/50 rounded p-3 mt-4">
          <p className="text-yellow-300 text-sm font-semibold mb-2">💡 TIPS:</p>
          <ul className="text-slate-300 text-sm space-y-1">
            <li>• Listen carefully - the Knower's clues won't match the item</li>
            <li>• Be vague with your clues if you're the Knower</li>
            <li>• Ask questions to identify the liar</li>
            <li>• Work together with other honest players</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
