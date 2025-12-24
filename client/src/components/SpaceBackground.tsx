export function SpaceBackground() {
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        .star {
          position: absolute;
          background: radial-gradient(circle, #fff, #aaa);
          border-radius: 50%;
          animation: twinkle var(--duration) ease-in-out infinite;
        }
      `}</style>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 overflow-hidden pointer-events-none z-0">
        {/* Animated stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`,
              animation: `twinkle ${star.duration}s ease-in-out infinite ${star.delay}s`,
            } as React.CSSProperties}
          />
        ))}
        
        {/* Animated nebula glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </>
  );
}
