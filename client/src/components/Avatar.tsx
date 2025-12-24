import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  url?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  isHost?: boolean;
}

export function Avatar({ url, name, size = "md", className, isHost }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-lg",
  };

  const statusColor = isHost ? "bg-yellow-500" : "bg-primary";

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-[#202225] shadow-sm",
          sizeClasses[size]
        )}
      >
        {url ? (
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="text-muted-foreground w-1/2 h-1/2" />
        )}
      </div>
      {isHost && (
        <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-[#202225] shadow-sm">
          HOST
        </div>
      )}
    </div>
  );
}
