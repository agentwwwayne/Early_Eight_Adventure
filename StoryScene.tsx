import React, { useState, useEffect } from 'react';
import { Coffee, Clock, Zap, Bike, Sparkles, MapPin, Cloud } from 'lucide-react';

interface StorySceneProps {
  countdown: number;
}

export const StoryScene: React.FC<StorySceneProps> = ({ countdown }) => {
  // Use internal state to manage precise transition timing if needed, 
  // but here we rely on the prop 'countdown' which updates every second.
  // We use CSS classes to handle entry/exit animations.

  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-white">
      
      {/* --- SCENE 1: RELAXED (Countdown 3) --- */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-sky-50 transition-opacity duration-500 ${countdown === 3 ? 'opacity-100 z-30' : 'opacity-0 z-0'}`}
      >
        {/* Moving Clouds */}
        <div className="absolute top-10 left-[-10%] text-white/80 animate-[slide-right_20s_linear_infinite]"><Cloud size={64} fill="currentColor"/></div>
        <div className="absolute top-24 right-[-10%] text-white/60 animate-[slide-left_25s_linear_infinite]"><Cloud size={48} fill="currentColor"/></div>

        {/* Shop Scene Component */}
        <div className="relative scale-110 animate-[bounce-slow_3s_infinite]">
            {/* Floor */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-4 bg-slate-200/50 rounded-[100%] blur-sm"></div>
            
            {/* Shop */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Awning */}
                <div className="w-40 h-8 bg-orange-300 rounded-t-lg relative overflow-hidden shadow-md z-20">
                    <div className="absolute inset-0 flex">
                        {[...Array(6)].map((_, i) => <div key={i} className={`flex-1 ${i%2===0 ? 'bg-orange-100' : 'bg-orange-400'}`}></div>)}
                    </div>
                </div>
                {/* Storefront */}
                <div className="w-32 h-24 bg-white border-x-4 border-b-4 border-orange-200 relative shadow-inner flex justify-center items-end pb-2">
                    <div className="w-24 h-12 bg-blue-100/50 border-2 border-blue-200 rounded-t-md relative overflow-hidden">
                        {/* Clerk */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-800 rounded-full"></div>
                    </div>
                    <div className="absolute top-2 bg-orange-100 px-2 py-0.5 text-[8px] font-bold text-orange-800 rounded shadow-sm">OPEN</div>
                </div>
            </div>

            {/* WangWang with Boba */}
            <div className="absolute bottom-0 right-[-20px] z-30 animate-[sway_2s_ease-in-out_infinite]">
                {/* Boba Cup - Huge */}
                <div className="absolute -left-4 bottom-8 w-8 h-10 bg-amber-100 border-2 border-amber-400 rounded-b-lg flex items-center justify-center shadow-sm transform -rotate-12 z-20">
                    <div className="w-1 h-6 bg-slate-800 -mt-8 rotate-12"></div>
                    <div className="absolute bottom-1 flex gap-0.5"><div className="w-1 h-1 bg-black rounded-full"></div><div className="w-1 h-1 bg-black rounded-full"></div></div>
                </div>
                {/* Character */}
                <div className="w-12 h-12 bg-pink-200 rounded-full border-2 border-pink-300 relative shadow-md">
                    <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-slate-800 rounded-full animate-pulse"></div>
                    <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-slate-800 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-rose-400 rounded-b-full"></div>
                </div>
                <div className="w-8 h-8 bg-sky-400 rounded-b-xl mx-auto -mt-1"></div>
            </div>
        </div>

        <div className="relative z-20 mt-12 text-center">
            <h2 className="text-3xl font-black text-slate-700 mb-2 drop-shadow-sm animate-[slide-up_0.5s_ease-out]">
                美滋滋买杯奶茶~
            </h2>
            <div className="flex gap-2 justify-center">
                <span className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-xs font-bold text-amber-600 shadow-sm animate-[pop-in_0.3s_ease-out_0.2s_both]">🧋 半糖</span>
                <span className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-xs font-bold text-sky-600 shadow-sm animate-[pop-in_0.3s_ease-out_0.4s_both]">🧊 去冰</span>
            </div>
        </div>
        
        <div className="absolute bottom-24 text-8xl font-black text-sky-200/40 select-none">3</div>
      </div>


      {/* --- SCENE 2: SHOCK (Countdown 2) --- */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center bg-amber-50 transition-all duration-300 ${countdown === 2 ? 'opacity-100 scale-100 z-30' : 'opacity-0 scale-90 z-0'}`}
      >
        {/* Panic Lines BG */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
             <div className="w-[200%] h-[200%] bg-[repeating-conic-gradient(#fef3c7_0deg,#fef3c7_15deg,#fffbeb_15deg,#fffbeb_30deg)] animate-[spin_10s_linear_infinite] opacity-50"></div>
        </div>

        <div className="relative mb-8 animate-[shake_0.1s_ease-in-out_infinite]">
            {/* Character Face Close-up */}
            <div className="w-40 h-40 bg-pink-200 rounded-full border-8 border-white shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                {/* Sweat */}
                <div className="absolute top-4 right-6 text-4xl animate-[drip_1s_infinite]">💧</div>
                <div className="absolute top-8 left-4 text-3xl animate-[drip_1.2s_infinite]">💦</div>
                
                {/* Eyes - Wide Open */}
                <div className="flex gap-6 mb-2">
                    <div className="w-8 h-8 bg-white rounded-full border-4 border-slate-800 flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-800 rounded-full animate-[ping_0.2s_infinite]"></div>
                    </div>
                    <div className="w-8 h-8 bg-white rounded-full border-4 border-slate-800 flex items-center justify-center">
                        <div className="w-2 h-2 bg-slate-800 rounded-full animate-[ping_0.2s_infinite]"></div>
                    </div>
                </div>
                {/* Mouth - Open */}
                <div className="w-10 h-12 bg-rose-800 rounded-full border-4 border-slate-800"></div>
            </div>

            {/* Clock Overlay */}
            <div className="absolute -bottom-6 -right-10 bg-white p-2 rounded-2xl shadow-lg border-4 border-red-500 rotate-12 animate-[pulse_0.2s_infinite]">
                <div className="text-3xl font-black text-red-600 font-mono">08:29</div>
            </div>
        </div>
        
        <h2 className="relative z-10 text-4xl font-black text-orange-600 mb-2 text-center drop-shadow-md animate-[scale-in_0.2s_ease-out]">
            糟糕！要迟到了！
        </h2>
        <p className="relative z-10 text-lg text-orange-800/80 font-bold bg-orange-100/80 px-6 py-2 rounded-full animate-bounce">
            全勤奖危在旦夕！😱
        </p>
        
        <div className="absolute bottom-24 text-8xl font-black text-orange-200/40 select-none">2</div>
      </div>


      {/* --- SCENE 3: SPRINT (Countdown 1) --- */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center bg-rose-50 overflow-hidden transition-transform duration-200 ${countdown <= 1 ? 'translate-x-0 opacity-100 z-30' : 'translate-x-full opacity-0 z-0'}`}
      >
        {/* Speed Lines */}
        <div className="absolute inset-0">
            {[...Array(10)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute h-2 bg-slate-800/10 rounded-full"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: '-10%',
                        width: `${Math.random() * 50 + 50}%`,
                        animation: `speed-line ${0.2 + Math.random() * 0.3}s linear infinite`,
                        animationDelay: `${Math.random()}s`
                    }}
                ></div>
            ))}
        </div>

        <div className="relative mb-12 animate-[slide-in-left_0.3s_ease-out_forwards]">
            {/* Dust */}
            <div className="absolute bottom-2 -left-16 flex">
                 <div className="w-12 h-12 bg-slate-300/50 rounded-full animate-[puff_0.5s_ease-out_infinite]"></div>
                 <div className="w-8 h-8 bg-slate-300/50 rounded-full animate-[puff_0.5s_ease-out_infinite_0.1s] -ml-4 mt-4"></div>
            </div>

            {/* Bike Rider */}
            <div className="relative z-10 transform rotate-[-10deg] origin-bottom-right scale-150">
                <Bike size={100} className="text-rose-600 drop-shadow-2xl" />
                <div className="absolute top-0 right-0 text-yellow-400 animate-[ping_0.5s_infinite]">
                    <Zap size={40} fill="currentColor" />
                </div>
            </div>
        </div>
        
        <div className="relative z-20 text-center transform -skew-x-12">
            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500 mb-4 italic tracking-tighter drop-shadow-sm animate-[shake_0.2s_infinite]">
                冲啊！！！
            </h2>
        </div>
        
        <div className="absolute bottom-24 text-9xl font-black text-rose-200/40 select-none animate-[ping_0.5s_infinite]">1</div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slide-right { from { transform: translateX(-100%); } to { transform: translateX(500%); } }
        @keyframes slide-left { from { transform: translateX(100%); } to { transform: translateX(-500%); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0) scale(1.1); } 50% { transform: translateY(-10px) scale(1.1); } }
        @keyframes sway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(5deg); } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pop-in { 0% { transform: scale(0); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
        @keyframes drip { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(20px); opacity: 0; } }
        @keyframes scale-in { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes speed-line { from { transform: translateX(0); } to { transform: translateX(200vw); } }
        @keyframes slide-in-left { from { transform: translateX(-100vw) skewX(20deg); } to { transform: translateX(0) skewX(0); } }
        @keyframes puff { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
      `}</style>
    </div>
  );
};
