import React from 'react';
import { Entity, EntityType, PlayerState } from '../types';
import { ENTITY_CONFIG, getLaneCenter, GAME_CONFIG } from '../constants';
import { Smartphone, Shield, Zap, Bike } from 'lucide-react';

// --- Custom Graphics ---

const PlayerGraphic = ({ hasShield, isInvulnerable }: { hasShield: boolean, isInvulnerable: boolean }) => (
  <div className={`w-full h-full relative ${isInvulnerable ? 'opacity-50' : 'opacity-100'}`}>
     {/* Shield Effect */}
     {hasShield && (
       <div className="absolute inset-[-10px] rounded-full border-2 border-cyan-300 bg-cyan-300/20 animate-pulse shadow-[0_0_10px_rgba(103,232,249,0.5)]" />
     )}

    <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow-xl overflow-visible">
        {/* Bike Body */}
        <rect x="19" y="5" width="2" height="50" rx="1" fill="#64748b" /> 
        <rect x="15" y="52" width="10" height="3" rx="1" fill="#1e293b" /> {/* Rear Wheel Hub */}
        <rect x="12" y="6" width="16" height="2" rx="1" fill="#1e293b" /> {/* Front Handlebar */}
        
        {/* Rider Helmet */}
        <circle cx="20" cy="28" r="8" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1.5" /> 
        
        {/* Rider Body */}
        <ellipse cx="20" cy="40" rx="8" ry="7" fill="#0ea5e9" /> 
        
        {/* Arms */}
        <path d="M13,38 Q10,25 12,10" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M27,38 Q30,25 28,10" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round"/>
        
        {/* Phone on Handlebar */}
        <rect x="18" y="8" width="4" height="6" rx="1" fill="#fff" stroke="#333" strokeWidth="0.5" className="animate-pulse" />
    </svg>
  </div>
);

const CarGraphic = () => (
  <svg viewBox="0 0 60 90" className="w-full h-full drop-shadow-lg overflow-visible">
    {/* Wheels */}
    <rect x="2" y="12" width="6" height="12" rx="2" fill="#1e293b" />
    <rect x="52" y="12" width="6" height="12" rx="2" fill="#1e293b" />
    <rect x="2" y="66" width="6" height="12" rx="2" fill="#1e293b" />
    <rect x="52" y="66" width="6" height="12" rx="2" fill="#1e293b" />
    
    {/* Chassis */}
    <path d="M8,10 Q8,0 30,0 Q52,0 52,10 L52,80 Q52,90 30,90 Q8,90 8,80 Z" fill="#38bdf8" /> 
    
    {/* Roof / Cabin */}
    <rect x="10" y="25" width="40" height="40" rx="5" fill="#0c4a6e" opacity="0.8" /> 
    <rect x="12" y="30" width="36" height="30" rx="3" fill="#bae6fd" /> 
    
    {/* Windshield Reflections */}
    <path d="M12,28 L48,28 L46,30 L14,30 Z" fill="#e0f2fe" opacity="0.5" />
    
    {/* Lights */}
    <path d="M10,2 L16,6" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
    <path d="M50,2 L44,6" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
    
    <rect x="10" y="86" width="8" height="4" rx="1" fill="#ef4444" />
    <rect x="42" y="86" width="8" height="4" rx="1" fill="#ef4444" />
  </svg>
);

const BusGraphic = () => (
  <svg viewBox="0 0 60 110" className="w-full h-full drop-shadow-xl overflow-visible">
     {/* Body */}
    <rect x="4" y="0" width="52" height="110" rx="4" fill="#fb923c" stroke="#c2410c" strokeWidth="2" />
    
    {/* Windshield */}
    <rect x="6" y="4" width="48" height="18" rx="2" fill="#bfdbfe" />
    
    {/* Vents/Details */}
    <rect x="15" y="95" width="30" height="10" rx="1" fill="#7c2d12" opacity="0.3" />
    
    {/* Mirrors */}
    <rect x="0" y="10" width="4" height="8" rx="1" fill="#fb923c" />
    <rect x="56" y="10" width="4" height="8" rx="1" fill="#fb923c" />
    
    {/* Roof Pattern */}
    <line x1="10" y1="30" x2="50" y2="30" stroke="#fff" strokeWidth="1" opacity="0.5" />
    <line x1="10" y1="50" x2="50" y2="50" stroke="#fff" strokeWidth="1" opacity="0.5" />
    <line x1="10" y1="70" x2="50" y2="70" stroke="#fff" strokeWidth="1" opacity="0.5" />
  </svg>
);

const ThiefGraphic = () => (
  <svg viewBox="0 0 50 70" className="w-full h-full drop-shadow-lg overflow-visible">
    {/* Motorbike Body */}
    <path d="M22,5 L28,5 L28,55 L22,55 Z" fill="#475569" />
    
    {/* Rear Wheel */}
    <rect x="20" y="55" width="10" height="4" rx="1" fill="#000" />
    
    {/* Handlebars */}
    <path d="M10,15 L40,15" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
    
    {/* Rider Helmet (Red/Aggressive) */}
    <circle cx="25" cy="25" r="9" fill="#e11d48" stroke="#881337" strokeWidth="2" />
    <path d="M22,22 L28,22" stroke="#fecdd3" strokeWidth="2" strokeLinecap="round" /> {/* Goggles */}
    
    {/* Arms Reaching out (The key visual for thief) */}
    <path d="M15,35 Q10,25 12,15" stroke="#9f1239" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M35,35 Q40,25 38,15" stroke="#9f1239" strokeWidth="3" fill="none" strokeLinecap="round" />
    
    {/* Sack/Bag on back */}
    <rect x="20" y="40" width="10" height="12" rx="2" fill="#92400e" />
  </svg>
);

// --- Main Components ---

export const Player: React.FC<{ player: PlayerState }> = ({ player }) => {
  const xPos = getLaneCenter(player.lane);
  
  return (
    <div 
      // Use Tailwind classes for transform to be safe and consistent
      className="absolute z-10 transition-all duration-200 ease-out -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${xPos}%`,
        top: `${player.y}%`,
        width: `${GAME_CONFIG.PLAYER_WIDTH}%`, 
        height: `${GAME_CONFIG.PLAYER_HEIGHT}%`,
      }}
    >
        <PlayerGraphic hasShield={player.hasShield} isInvulnerable={player.isInvulnerable} />
    </div>
  );
};

export const GameEntity: React.FC<{ entity: Entity }> = ({ entity }) => {
  const config = ENTITY_CONFIG[entity.type];
  const xPos = getLaneCenter(entity.lane);
  
  const isThief = entity.type === EntityType.THIEF;
  
  // Rotation for thief
  let rotation = 'rotate-0';
  if (isThief) {
      if (entity.directionX) {
          rotation = entity.directionX > 0 ? 'rotate-[20deg]' : '-rotate-[20deg]';
      } else {
          const fromLeft = entity.lane < 2.5;
          rotation = fromLeft ? 'rotate-[20deg]' : '-rotate-[20deg]';
      }
  }

  let Content = <div />;

  switch (entity.type) {
    case EntityType.BUS: 
        Content = <BusGraphic />; 
        break;
    case EntityType.THIEF: 
        Content = <ThiefGraphic />; 
        break;
    case EntityType.CAR: 
        Content = <CarGraphic />; 
        break;
    default:
        // Items
        let Icon = Smartphone;
        let color = "bg-yellow-400";
        if (entity.type === EntityType.SHIELD) { Icon = Shield; color = "bg-cyan-400"; }
        if (entity.type === EntityType.SLOW_MO) { Icon = Zap; color = "bg-purple-400"; }
        
        Content = (
             <div className={`flex items-center justify-center rounded-lg shadow-lg border-2 border-white w-full h-full ${color} animate-bounce`}>
                <Icon size={20} className="text-white drop-shadow-md" />
            </div>
        );
        break;
  }

  return (
    <div
      // Fix: Use Tailwind utilities for transform. 
      // -translate-x-1/2 -translate-y-1/2 handles centering.
      // ${rotation} adds rotation if needed.
      className={`absolute transition-transform duration-100 linear -translate-x-1/2 -translate-y-1/2 ${rotation} ${isThief ? `z-20` : 'z-0'}`}
      style={{
        left: `${xPos}%`,
        top: `${entity.y}%`,
        width: `${config.width}%`, 
        height: `${config.height}%`, 
      }}
    >
      {Content}
      
      {isThief && (
        <div className={`absolute -top-5 bg-rose-600 text-[10px] text-white px-2 py-0.5 rounded-md font-bold shadow-sm whitespace-nowrap z-30 border border-white`}>
            抢!
        </div>
      )}
    </div>
  );
};