import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GameCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export function GameCard({ children, className, onClick, hoverEffect = true }: GameCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { scale: 1.02, y: -4 } : undefined}
      whileTap={hoverEffect ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "bg-[#2f3136] rounded-2xl border border-[#202225] shadow-lg p-6 relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-primary/10 transition-colors",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
