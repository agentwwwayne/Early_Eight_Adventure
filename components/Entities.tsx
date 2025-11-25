import React from 'react';
import { Entity, EntityType, PlayerState, Season } from '../types';
import { ENTITY_CONFIG, getLaneCenter, GAME_CONFIG, SEASON_STYLES } from '../constants';
import { Smartphone, Shield, Zap, Bike } from 'lucide-react';

// --- Custom Graphics ---

const PlayerGraphic = ({ hasShield, isInvulnerable }: { hasShield: boolean, isInvulnerable: boolean }) => (
  <div className={`w-full h-full relative ${isInvulnerable ? 'opacity-50' : 'opacity-100'}`}>
     {/* Shield Effect */}
     {hasShield && (
       <div className="absolute inset-[-10px] rounded-full border-2 border-cyan-300 bg-cyan-300/20 animate-pulse shadow-[0_0_10px_rgba(103,232,249,0.5)]" />
     )}

    <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-xl overflow-visible">
        {/* Bike Body (Frame) */}
        <path d="M28,15 L28,70" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <rect x="24" y="70" width="8" height="4" rx="2" fill="#334155" /> {/* Rear Hub */}
        <path d="M15,20 L45,20" stroke="#334155" strokeWidth="3" strokeLinecap="round" /> {/* Handlebars */}
        
        {/* Pigtails (Hair) */}
        <path d="M20,30 Q10,35 12,50" stroke="#fcd34d" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M40,30 Q50,35 48,50" stroke="#fcd34d" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* Rider Body (Dress/Shirt) */}
        <ellipse cx="30" cy="50" rx="10" ry="9" fill="#f472b6" /> {/* Pink Shirt */}
        
        {/* Backpack */}
        <rect x="24" y="52" width="12" height="10" rx="2" fill="#be185d" />
        
        {/* Arms */}
        <path d="M22,48 Q18,35 18,22" stroke="#f472b6" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M38,48 Q42,35 42,22" stroke="#f472b6" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        
        {/* Helmet */}
        <circle cx="30" cy="30" r="11" fill="#f9a8d4" stroke="#db2777" strokeWidth="2" /> 
        <path d="M24,26 L36,26" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

        {/* Phone on Handlebar */}
        <rect x="27" y="16" width="6" height="8" rx="1" fill="#fff" stroke="#333" strokeWidth="0.5" className="animate-pulse" />
    </svg>
  </div>
);

const CarGraphic = ({ color }: { color: string }) => (
  <svg viewBox="0 0 60 90" className="w-full h-full drop-shadow-lg overflow-visible">
    {/* Wheels */}
    <rect x="2" y="12" width="6" height="12" rx="2" fill="#1e293b" />
    <rect x="52" y="12" width="6" height="12" rx="2" fill="#1e293b" />
    <rect x="2" y="66" width="6" height="12" rx="2" fill="#1e293b" />
    <rect x="52" y="66" width="6" height="12" rx="2" fill="#1e293b" />
    
    {/* Chassis */}
    <path d="M8,10 Q8,0 30,0 Q52,0 52,10 L52,80 Q52,90 30,90 Q8,90 8,80 Z" fill={color} /> 
    
    {/* Roof / Cabin */}
    <rect x="10" y="25" width="40" height="40" rx="5" fill="#0c4a6e" opacity="0.8" /> 
    <rect x="12" y="30" width="36" height="30" rx="3" fill="#e2e8f0" opacity="0.5" /> 
    
    {/* Windshield Reflections */}
    <path d="M12,28 L48,28 L46,30 L14,30 Z" fill="#e0f2fe" opacity="0.5" />
    
    {/* Lights */}
    <path d="M10,2 L16,6" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
    <path d="M50,2 L44,6" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" />
    
    <rect x="10" y="86" width="8" height="4" rx="1" fill="#ef4444" />
    <rect x="42" y="86" width="8" height="4" rx="1" fill="#ef4444" />
  </svg>
);

const BusGraphic = ({ color }: { color: string }) => (
  <svg viewBox="0 0 60 110" className="w-full h-full drop-shadow-xl overflow-visible">
     {/* Body */}
    <rect x="4" y="0" width="52" height="110" rx="4" fill={color} stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
    
    {/* Windshield */}
    <rect x="6" y="4" width="48" height="18" rx="2" fill="#bfdbfe" />
    
    {/* Vents/Details */}
    <rect x="15" y="95" width="30" height="10" rx="1" fill="rgba(0,0,0,0.2)" />
    
    {/* Mirrors */}
    <rect x="0" y="10" width="4" height="8" rx="1" fill={color} />
    <rect x="56" y="10" width="4" height="8" rx="1" fill={color} />
    
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
    
    {/* Arms Reaching out */}
    <path d="M15,35 Q10,25 12,15" stroke="#9f1239" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M35,35 Q40,25 38,15" stroke="#9f1239" strokeWidth="3" fill="none" strokeLinecap="round" />
    
    {/* Sack/Bag on back */}
    <rect x="20" y="40" width="10" height="12" rx="2" fill="#92400e" />
  </svg>
);

// --- Main Components ---

export const Player: React.FC<{ player: PlayerState; isTouchMode?: boolean }> = ({ player, isTouchMode = false }) => {
  const xPos = getLaneCenter(player.lane);
  
  return (
    <div 
      className={`absolute z-10 ease-out -translate-x-1/2 -translate-y-1/2 ${isTouchMode ? 'transition-none duration-0' : 'transition-all duration-200'}`}
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

export const GameEntity: React.FC<{ entity: Entity; season: Season }> = ({ entity, season }) => {
  const config = ENTITY_CONFIG[entity.type];
  const xPos = getLaneCenter(entity.lane);
  const seasonStyle = SEASON_STYLES[season];
  
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

  // Generate random color based on ID to keep it consistent per entity
  const getColor = (palette: string[]) => {
      const index = Math.floor(entity.id) % palette.length;
      return palette[index];
  };

  switch (entity.type) {
    case EntityType.BUS: 
        Content = <BusGraphic color={getColor(seasonStyle.busPalette)} />; 
        break;
    case EntityType.THIEF: 
        Content = <ThiefGraphic />; 
        break;
    case EntityType.CAR: 
        Content = <CarGraphic color={getColor(seasonStyle.carPalette)} />; 
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