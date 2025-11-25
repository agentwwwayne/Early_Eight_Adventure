import React, { useEffect, useState } from 'react';
import { Season } from '../types';
import { SEASON_STYLES } from '../constants';
import { Flower, Leaf, Snowflake, Sun } from 'lucide-react';

interface RoadProps {
  speed: number;
  isMoving: boolean;
  season: Season;
}

export const Road: React.FC<RoadProps> = ({ speed, isMoving, season }) => {
  const [offset, setOffset] = useState(0);
  const style = SEASON_STYLES[season];

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (isMoving) {
        // Drastically reduced speed multiplier from 2 to 0.25
        // This allows the player to clearly see the decorations
        // while still scaling with the game's difficulty speed.
        setOffset((prev) => (prev + speed * 0.25) % 100);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [speed, isMoving]);

  // Generate 4 lane dividers for 5 lanes (at 20%, 40%, 60%, 80%)
  const dividers = [20, 40, 60, 80];

  // Seasonal Decorations (Side strips)
  const renderDecorations = (side: 'left' | 'right') => {
      const items = [];
      // Render decorative items that move with offset simulation
      for (let i = 0; i < 8; i++) {
          const topPos = ((i * 15) + offset) % 120 - 20; // Loop position, 15% spacing
          
          let Decor = null;
          
          // Randomize slight rotation/scale for variety based on index
          const rotation = (i * 45) % 360;
          const scale = 0.8 + (i % 3) * 0.2;

          if (season === Season.SPRING) {
              // Flowers - Pink/Yellow/Purple
              const color = i % 3 === 0 ? 'text-pink-400' : (i % 3 === 1 ? 'text-yellow-400' : 'text-purple-400');
              Decor = <Flower size={20} className={`${color} drop-shadow-sm`} fill="currentColor" />;
          } else if (season === Season.SUMMER) {
              // Lush Green Leaves / Bushes
              Decor = <div className={`w-5 h-5 rounded-full ${i % 2 === 0 ? 'bg-lime-500' : 'bg-emerald-500'} shadow-sm border-2 border-white/20`} />;
          } else if (season === Season.AUTUMN) {
              // Falling Leaves - Orange/Red/Brown
              const color = i % 3 === 0 ? 'text-orange-500' : (i % 3 === 1 ? 'text-red-500' : 'text-amber-600');
              Decor = <Leaf size={18} className={`${color} drop-shadow-sm`} fill="currentColor" />;
          } else if (season === Season.WINTER) {
              // Snowflakes & Ice chunks
              Decor = <Snowflake size={18} className="text-sky-100 drop-shadow-md" />;
          }

          items.push(
              <div 
                key={`decor-${side}-${i}`}
                className={`absolute ${side === 'left' ? 'left-0.5' : 'right-0.5'} transition-transform duration-75`}
                style={{ 
                    top: `${topPos}%`,
                    transform: `rotate(${rotation}deg) scale(${scale})`
                }}
              >
                  {Decor}
              </div>
          );
      }
      return items;
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-1000 ${style.roadColor}`}>
      
      {/* Left Border */}
      <div className={`absolute left-0 top-0 bottom-0 w-8 ${style.borderColor} border-r-4 ${style.accentColor} transition-colors duration-1000 shadow-inner`}>
          {renderDecorations('left')}
      </div>
      
      {/* Right Border */}
      <div className={`absolute right-0 top-0 bottom-0 w-8 ${style.borderColor} border-l-4 ${style.accentColor} transition-colors duration-1000 shadow-inner`}>
          {renderDecorations('right')}
      </div>

      {/* Lane Markers */}
      <div className="absolute inset-0 left-8 right-8"> 
        {dividers.map((pos) => (
          <div 
            key={pos}
            className="absolute top-0 bottom-0 w-1 -ml-0.5 h-full"
            style={{ left: `${pos}%` }}
          >
             <div 
              className="absolute top-0 left-0 w-full h-[200%] bg-[repeating-linear-gradient(to_bottom,transparent_0%,transparent_10%,white_10%,white_20%)] transition-opacity duration-1000"
              style={{ 
                  transform: `translateY(${offset - 100}%)`,
                  opacity: style.laneOpacity 
                }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};