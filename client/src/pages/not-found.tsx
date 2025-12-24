import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#36393f] text-foreground">
      <div className="flex flex-col items-center space-y-4 text-center p-8 bg-[#2f3136] rounded-2xl border border-[#202225] shadow-xl max-w-md mx-4">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold font-display tracking-tighter">404</h1>
        <p className="text-muted-foreground text-lg">
          Whoops! This page must have been lost in the void.
        </p>
        
        <Link href="/" className="w-full pt-4">
          <Button className="w-full bg-primary hover:bg-primary/90">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
