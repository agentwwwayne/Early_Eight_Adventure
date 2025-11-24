import React, { useEffect, useState } from 'react';

interface RoadProps {
  speed: number;
  isMoving: boolean;
}

export const Road: React.FC<RoadProps> = ({ speed, isMoving }) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (isMoving) {
        setOffset((prev) => (prev + speed * 2) % 100);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [speed, isMoving]);

  // Generate 4 lane dividers for 5 lanes (at 20%, 40%, 60%, 80%)
  const dividers = [20, 40, 60, 80];

  return (
    <div className="absolute inset-0 bg-slate-200 overflow-hidden pointer-events-none z-0">
      {/* Grass Borders */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-300 border-r-2 border-emerald-400/50"></div>
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-emerald-300 border-l-2 border-emerald-400/50"></div>

      {/* Lane Markers */}
      <div className="absolute inset-0">
        {dividers.map((pos) => (
          <div 
            key={pos}
            className="absolute top-0 bottom-0 w-1 -ml-0.5 h-full"
            style={{ left: `${pos}%` }}
          >
             <div 
              className="absolute top-0 left-0 w-full h-[200%] bg-[repeating-linear-gradient(to_bottom,transparent_0%,transparent_10%,white_10%,white_20%)] opacity-60"
              style={{ transform: `translateY(${offset - 100}%)` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};