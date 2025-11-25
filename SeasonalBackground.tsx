import React, { useEffect, useState, useMemo } from 'react';
import { Season } from '../types';
import { Flower, Leaf, Snowflake, CloudFog } from 'lucide-react';

interface SeasonalBackgroundProps {
  season: Season;
}

interface Particle {
  id: number;
  left: number; // 0-100%
  duration: number; // seconds
  delay: number; // seconds
  size: number; // px
  swing: number; // px (horizontal sway)
}

export const SeasonalBackground: React.FC<SeasonalBackgroundProps> = ({ season }) => {
  // Generate static particles configuration once
  const particles = useMemo(() => {
    const items: Particle[] = [];
    const count = 12; // Sparse count
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        left: Math.random() * 100,
        duration: 15 + Math.random() * 15, // Slow falling (15-30s)
        delay: -(Math.random() * 30), // Start mid-air
        size: 16 + Math.random() * 16, // 16-32px
        swing: 20 + Math.random() * 40, // Horizontal sway amount
      });
    }
    return items;
  }, []);

  // Determine icon and color based on season
  const getSeasonConfig = (s: Season) => {
    switch (s) {
      case Season.SPRING:
        return { Icon: Flower, color: 'text-pink-300', opacity: 'opacity-60' };
      case Season.SUMMER:
        // Summer uses green leaves or pollen (using small Leaf for simplicity)
        return { Icon: Leaf, color: 'text-emerald-400', opacity: 'opacity-50' };
      case Season.AUTUMN:
        return { Icon: Leaf, color: 'text-amber-500', opacity: 'opacity-70' };
      case Season.WINTER:
        return { Icon: Snowflake, color: 'text-white', opacity: 'opacity-80' };
      default:
        return { Icon: Flower, color: 'text-pink-300', opacity: 'opacity-60' };
    }
  };

  const config = getSeasonConfig(season);
  const Icon = config.Icon;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-40">
      {/* Inline styles for the keyframes to ensure self-contained animation */}
      <style>{`
        @keyframes falling {
          0% {
            top: -10%;
            transform: translateX(0) rotate(0deg);
          }
          100% {
            top: 110%;
            transform: translateX(var(--swing)) rotate(360deg);
          }
        }
      `}</style>

      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute top-[-10%] ${config.color} ${config.opacity} drop-shadow-sm`}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            // Use CSS variables to pass random values to animation
            ['--swing' as any]: `${p.id % 2 === 0 ? p.swing : -p.swing}px`,
            animation: `falling ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <Icon size={p.size} fill={season === Season.WINTER ? 'none' : 'currentColor'} />
        </div>
      ))}
      
      {/* Optional: Add a subtle overlay tint for atmosphere */}
      <div className={`absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 
        ${season === Season.SPRING ? 'bg-pink-100' : ''}
        ${season === Season.SUMMER ? 'bg-yellow-100' : ''}
        ${season === Season.AUTUMN ? 'bg-orange-100' : ''}
        ${season === Season.WINTER ? 'bg-blue-50' : ''}
      `}></div>
    </div>
  );
};