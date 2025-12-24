export function SpaceBackground() {
  const stars = Array.from({ length: 150 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: 2 + Math.random() * 4,
    delay: Math.random() * 2,
    opacity: Math.random() * 0.7 + 0.3,
  }));

  return (
    <>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--min-opacity); }
          50% { opacity: 1; }
        }
        @keyframes nebulaPulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
        .star {
          position: absolute;
          background: radial-gradient(circle, #fff, #aaa);
          border-radius: 50%;
          animation: twinkle var(--duration) ease-in-out infinite;
        }
        .nebula {
          position: absolute;
          border-radius: 50%;
          animation: nebulaPulse 8s ease-in-out infinite;
          filter: blur(80px);
        }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" style={{ background: '#000000' }}>
        {/* Deep space nebula clouds */}
        <div className="nebula absolute top-20 left-20 w-80 h-80 bg-purple-500" style={{ opacity: 0.1 }} />
        <div className="nebula absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500" style={{ opacity: 0.08, animationDelay: '2s' }} />
        <div className="nebula absolute bottom-40 left-1/3 w-72 h-72 bg-indigo-500" style={{ opacity: 0.12, animationDelay: '4s' }} />
        
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
              '--min-opacity': star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite ${star.delay}s`,
            } as React.CSSProperties}
          />
        ))}
        
        {/* Glow effects for atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-indigo-900/10" />
      </div>
    </>
  );
}
