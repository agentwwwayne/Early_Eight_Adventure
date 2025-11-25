import React from 'react';
import { Coffee, Clock, Zap, Bike, Sparkles, MapPin, Cloud } from 'lucide-react';

interface StorySceneProps {
  countdown: number;
}

export const StoryScene: React.FC<StorySceneProps> = ({ countdown }) => {
  
  // --- REFINED SVG ASSETS ---

  const ShopScene = () => (
    <div className="relative w-80 h-60 mx-auto mt-4">
      
      {/* --- Background Elements --- */}
      <div className="absolute bottom-0 w-full h-2 bg-slate-300 rounded-full opacity-50"></div>
      
      {/* --- Subway Station Entrance (Left) --- */}
      <div className="absolute left-0 bottom-2 z-0">
          {/* Stairs container */}
          <div className="w-24 h-20 bg-slate-700 clip-path-stairs relative overflow-hidden rounded-tr-md shadow-inner">
             {/* Steps illusion */}
             <div className="absolute top-0 w-full h-2 bg-slate-600"></div>
             <div className="absolute top-4 w-full h-2 bg-slate-600"></div>
             <div className="absolute top-8 w-full h-2 bg-slate-600"></div>
             <div className="absolute top-12 w-full h-2 bg-slate-600"></div>
          </div>
          {/* Railing */}
          <div className="absolute bottom-0 right-0 w-1 h-12 bg-slate-400"></div>
          <div className="absolute bottom-12 right-0 w-24 h-1 bg-slate-400 rotate-12 origin-right"></div>
          
          {/* Subway Sign Post */}
          <div className="absolute -left-4 bottom-0 flex flex-col items-center animate-[bounce_4s_infinite]">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-lg relative z-10">
                M
            </div>
            <div className="w-1.5 h-24 bg-slate-500 rounded-full -mt-1"></div>
            <div className="w-6 h-1 bg-slate-600 rounded-full"></div>
          </div>
      </div>

      {/* --- Boba Shop (Center/Right) --- */}
      <div className="absolute right-4 bottom-2 z-10">
         {/* Shop Structure */}
         <div className="w-40 h-36 bg-orange-50 border-l-4 border-r-4 border-orange-200 relative shadow-xl flex flex-col items-center justify-end">
             
             {/* Awning (Stripes) */}
             <div className="absolute -top-4 w-48 h-10 bg-white rounded-t-md overflow-hidden shadow-md flex">
                 {[...Array(8)].map((_, i) => (
                     <div key={i} className={`w-6 h-full ${i % 2 === 0 ? 'bg-rose-400' : 'bg-white'}`}></div>
                 ))}
                 <div className="absolute bottom-0 w-full h-2 bg-rose-500/20 border-t border-rose-300 wavy-border"></div>
             </div>

             {/* Main Window */}
             <div className="w-32 h-20 bg-sky-100 border-4 border-orange-100 shadow-inner relative overflow-hidden rounded-t-lg mb-8">
                 {/* Reflections */}
                 <div className="absolute top-0 right-0 w-20 h-40 bg-white/30 rotate-45 transform translate-x-10"></div>
                 
                 {/* Shelf with cups */}
                 <div className="absolute bottom-6 w-full h-1 bg-orange-200"></div>
                 <div className="absolute bottom-6 left-4 w-3 h-4 bg-purple-300 rounded-sm"></div>
                 <div className="absolute bottom-6 left-8 w-3 h-4 bg-green-300 rounded-sm"></div>
                 <div className="absolute bottom-6 left-12 w-3 h-4 bg-yellow-300 rounded-sm"></div>

                 {/* Clerk */}
                 <div className="absolute bottom-0 right-6 w-10 h-10 bg-slate-800 rounded-t-full"></div>
             </div>

             {/* Counter Top */}
             <div className="absolute bottom-8 w-44 h-3 bg-orange-300 rounded-sm shadow-sm"></div>

             {/* Signage */}
             <div className="absolute top-8 w-24 h-8 bg-white border-2 border-orange-400 rounded-lg flex items-center justify-center shadow-sm">
                 <span className="text-[10px] font-bold text-orange-600 tracking-widest">BOBA TEA</span>
             </div>
             
             {/* Menu Board */}
             <div className="absolute bottom-0 -right-8 w-8 h-12 bg-slate-700 border-2 border-orange-800 rounded-t-sm transform rotate-6 shadow-lg flex flex-col items-center p-0.5">
                 <div className="w-full h-0.5 bg-white/20 mb-1"></div>
                 <div className="w-full h-0.5 bg-white/20 mb-1"></div>
                 <div className="w-full h-0.5 bg-white/20"></div>
             </div>
         </div>
      </div>

      {/* --- Character (Player) --- */}
      <div className="absolute bottom-0 left-1/2 translate-x-4 z-20 animate-[bounce_2s_infinite]">
         <div className="relative">
            {/* Giant Boba Cup in hand */}
            <div className="absolute -left-5 bottom-6 w-10 h-12 bg-amber-100 border-2 border-amber-300 rounded-b-xl flex items-center justify-center overflow-hidden shadow-sm transform -rotate-12 z-20">
                <div className="absolute bottom-0 w-full h-1/2 bg-amber-800/80 rounded-b-lg flex flex-wrap justify-center gap-0.5 p-1">
                    {/* Pearls */}
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                </div> 
                <div className="absolute -top-4 w-1.5 h-10 bg-slate-800 rotate-6"></div> {/* Straw */}
            </div>
            
            {/* Head */}
            <div className="w-16 h-16 bg-pink-200 rounded-full border-2 border-pink-300 relative shadow-md z-10">
                {/* Hair */}
                <div className="absolute -top-1 -left-3 w-5 h-10 bg-yellow-300 rounded-full rotate-[-25deg] border border-yellow-400"></div>
                <div className="absolute -top-1 -right-3 w-5 h-10 bg-yellow-300 rounded-full rotate-[25deg] border border-yellow-400"></div>
                
                {/* Face */}
                <div className="absolute top-5 left-3.5 w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
                <div className="absolute top-5 right-3.5 w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
                
                {/* Blush */}
                <div className="absolute top-7 left-2 w-3 h-1.5 bg-rose-300 rounded-full opacity-60"></div>
                <div className="absolute top-7 right-2 w-3 h-1.5 bg-rose-300 rounded-full opacity-60"></div>

                {/* Happy Mouth */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-2 border-b-2 border-rose-500 rounded-b-full"></div>
            </div>
            
            {/* Body */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-10 h-10 bg-sky-400 rounded-b-xl rounded-t-md z-0"></div>
         </div>
      </div>
      
      {/* Decor: Potted Plant */}
      <div className="absolute bottom-2 right-20 z-20">
          <div className="w-6 h-6 bg-emerald-600 rounded-full -mb-3 ml-1"></div>
          <div className="w-8 h-8 bg-emerald-500 rounded-full -mb-4"></div>
          <div className="w-6 h-8 bg-amber-700 rounded-b-md border-t-4 border-amber-800"></div>
      </div>

    </div>
  );

  // SCENE 1: Buying Bubble Tea (Countdown 3)
  if (countdown === 3) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-sky-50 animate-in fade-in zoom-in duration-500 overflow-hidden">
        {/* Background Clouds */}
        <div className="absolute top-10 left-10 text-white/60 animate-[pulse_4s_infinite]"><Sparkles size={32}/></div>
        <div className="absolute top-20 right-10 text-white/40 animate-[pulse_5s_infinite]"><Sparkles size={24}/></div>
        
        {/* Moving Clouds */}
        <div className="absolute top-10 left-[-10%] text-white/80 animate-[slide-right_20s_linear_infinite]"><Cloud size={64} fill="currentColor"/></div>
        <div className="absolute top-24 right-[-10%] text-white/60 animate-[slide-left_25s_linear_infinite]"><Cloud size={48} fill="currentColor"/></div>

        <div className="scale-110 animate-[bounce-slow_3s_infinite]">
            <ShopScene />
        </div>
        
        <div className="relative z-20 mt-12 text-center bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white">
            <h2 className="text-2xl font-black text-slate-700 mb-1 flex items-center justify-center gap-2">
                <Coffee size={24} className="text-amber-600" />
                美滋滋买杯奶茶...
            </h2>
            <p className="text-xs text-slate-500 font-medium bg-sky-100 px-3 py-1 rounded-full inline-block text-sky-700">
                半糖去冰，快乐加倍
            </p>
        </div>
        
        <div className="absolute bottom-20 text-8xl font-black text-sky-200/50 select-none animate-pulse">3</div>
      </div>
    );
  }

  // SCENE 2: Realization (Countdown 2)
  if (countdown === 2) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-amber-50 animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Panic Background Lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_deg,orange_20deg,transparent_40deg)] animate-spin-slow"></div>
        </div>

        <div className="relative mb-10 mt-[-40px] animate-[shake_0.2s_ease-in-out_infinite]">
            {/* Shock Effect */}
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-ping"></div>
            
            {/* Giant Watch / Clock */}
            <div className="relative z-10 bg-white p-8 rounded-full shadow-2xl border-8 border-orange-200">
                <Clock size={100} className="text-orange-600 animate-spin" />
                <div className="absolute top-0 right-0 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full animate-bounce border-2 border-white shadow-md rotate-12">
                    8:29!!
                </div>
            </div>
            
            {/* Player Panicked Face Overlay */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden z-20">
                 <div className="text-5xl animate-pulse">😱</div>
            </div>
        </div>
        
        <div className="relative z-20 text-center">
            <h2 className="text-4xl font-black text-orange-600 mb-2 text-center scale-110 transition-transform drop-shadow-sm">
                糟糕！一看时间...
            </h2>
            <p className="text-base text-orange-900 font-bold bg-orange-200 px-6 py-2 rounded-full inline-block border-2 border-orange-300 shadow-md animate-bounce">
                全勤奖危在旦夕！
            </p>
        </div>
        
        <div className="absolute bottom-20 text-8xl font-black text-orange-200/50 select-none">2</div>
      </div>
    );
  }

  // SCENE 3: Sprint Start (Countdown 1)
  if (countdown <= 1) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-rose-50 animate-in zoom-in duration-200 overflow-hidden">
        {/* Speed Lines Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute top-1/4 -left-10 w-[120%] h-4 bg-slate-900 rotate-6"></div>
            <div className="absolute top-3/4 -left-10 w-[120%] h-8 bg-slate-900 -rotate-3"></div>
            <div className="absolute top-1/2 -left-10 w-[120%] h-12 bg-slate-900 rotate-12 scale-x-150 blur-sm"></div>
        </div>

        <div className="relative mb-12 translate-x-[-50px] animate-[slide-in-from-left_0.4s_cubic-bezier(0.25,1,0.5,1)_forwards]">
            {/* Dust Cloud */}
            <div className="absolute bottom-0 -left-20 flex gap-2 opacity-60">
                <div className="w-10 h-10 bg-slate-300 rounded-full animate-ping delay-75"></div>
                <div className="w-6 h-6 bg-slate-300 rounded-full animate-ping"></div>
            </div>

            {/* Bike & Rider - HUGE */}
            <div className="relative z-10 transform rotate-[-5deg] origin-bottom-right scale-125">
                <Bike size={120} className="text-rose-600 drop-shadow-2xl" />
                {/* Speed Streak */}
                <div className="absolute top-1/2 left-0 w-full h-2 bg-white/80 blur-sm"></div>
            </div>
            
            {/* Spark */}
            <div className="absolute bottom-4 -right-4 text-yellow-400">
                <Zap size={48} className="animate-pulse fill-current" />
            </div>
        </div>
        
        <div className="relative z-20 text-center transform -skew-x-12">
            <h2 className="text-5xl font-black text-rose-600 mb-2 text-center italic tracking-tighter drop-shadow-md">
                要迟到了！
            </h2>
            <h2 className="text-6xl font-black text-rose-500 text-center italic tracking-tighter drop-shadow-md">
                冲啊！！！
            </h2>
        </div>
        
        <div className="absolute bottom-10 text-9xl font-black text-rose-300/30 select-none animate-ping">1</div>
      </div>
    );
  }

  return null;
};
