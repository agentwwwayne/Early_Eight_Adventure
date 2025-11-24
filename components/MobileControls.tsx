import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileControlsProps {
  onInput: (direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onInput }) => {
  // Helper to prevent default touch behaviors (zooming, scrolling) when interacting with controls
  const handleTouch = (e: React.TouchEvent | React.MouseEvent, dir: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    e.preventDefault();
    e.stopPropagation();
    onInput(dir);
  };

  const btnClass = "w-14 h-14 bg-white/40 backdrop-blur-md rounded-full shadow-lg border-2 border-white/50 flex items-center justify-center active:bg-white/80 active:scale-95 transition-all touch-none";
  const iconClass = "text-slate-700 w-8 h-8";

  return (
    <div className="absolute bottom-6 left-0 right-0 z-40 flex flex-col items-center justify-end pb-4 pointer-events-none">
      <div className="relative w-48 h-48 pointer-events-auto">
        {/* UP */}
        <button
          className={`${btnClass} absolute top-0 left-1/2 -translate-x-1/2`}
          onPointerDown={(e) => handleTouch(e, 'UP')}
        >
          <ArrowUp className={iconClass} strokeWidth={3} />
        </button>

        {/* LEFT */}
        <button
          className={`${btnClass} absolute top-1/2 left-0 -translate-y-1/2`}
          onPointerDown={(e) => handleTouch(e, 'LEFT')}
        >
          <ArrowLeft className={iconClass} strokeWidth={3} />
        </button>

        {/* RIGHT */}
        <button
          className={`${btnClass} absolute top-1/2 right-0 -translate-y-1/2`}
          onPointerDown={(e) => handleTouch(e, 'RIGHT')}
        >
          <ArrowRight className={iconClass} strokeWidth={3} />
        </button>

        {/* DOWN */}
        <button
          className={`${btnClass} absolute bottom-0 left-1/2 -translate-x-1/2`}
          onPointerDown={(e) => handleTouch(e, 'DOWN')}
        >
          <ArrowDown className={iconClass} strokeWidth={3} />
        </button>
        
        {/* Center Decor (Optional) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/30 rounded-full" />
      </div>
    </div>
  );
};
