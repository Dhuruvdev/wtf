export function ArcadeBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* White arcade background */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Arcade grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Neon glows - red and yellow arcade colors */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-300 rounded-full blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-orange-300 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Arcade scanlines effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)'
      }} />
    </div>
  );
}
