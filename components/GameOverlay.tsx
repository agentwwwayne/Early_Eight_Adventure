import React from 'react';
import { GameStatus, LevelConfig } from '../types';
import { Trophy, AlertTriangle, Play, RotateCcw, Clock, Smartphone, Bike, Star, Zap } from 'lucide-react';
import { GAME_CONFIG, LEVELS } from '../constants';

interface GameOverlayProps {
  status: GameStatus;
  score: number;
  distance: number;
  highScore: number;
  onStart: (level: LevelConfig) => void;
  onRestart: () => void;
  causeOfDeath?: string;
  gameTimeStr: string;
  phoneCount: number;
  currentLevel: LevelConfig | null;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ 
  status, score, distance, onStart, onRestart, causeOfDeath, gameTimeStr, phoneCount, currentLevel
}) => {
  
  // Progress Bar Calculation
  const winDistance = currentLevel ? currentLevel.winDistance : GAME_CONFIG.WIN_DISTANCE; 
  const progress = Math.min(100, (distance / winDistance) * 100);

  // Time labels for progress bar
  const startH = currentLevel ? currentLevel.startHour : GAME_CONFIG.END_HOUR;
  const startM = currentLevel ? currentLevel.startMinute : 0;
  
  // Helper to format time
  const formatTime = (h: number, m: number) => `${h}:${m < 10 ? '0'+m : m}`;

  // Helper to get theme colors
  const getThemeColors = (id: string) => {
      switch(id) {
          case 'EASY': return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500' };
          case 'NORMAL': return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' };
          case 'HARD': return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-500' };
          default: return { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-500' };
      }
  };

  if (status === GameStatus.PLAYING) {
    return (
      <div className="absolute top-0 left-0 right-0 p-4 z-20 pointer-events-none">
        {/* Top Header - Info Cards */}
        <div className="flex justify-between items-start mb-3">
            {/* Time Card */}
            <div className="bg-white/90 backdrop-blur-md text-slate-700 px-3 py-1.5 rounded-xl border-2 border-slate-100 shadow-md flex items-center gap-2">
              <Clock size={16} className="text-sky-500" />
              <span className="font-bold font-mono text-lg">{gameTimeStr}</span>
            </div>

            {/* Level Badge */}
            <div className={`bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold border shadow-sm ${currentLevel?.id === 'HARD' ? 'text-rose-600 border-rose-200' : 'text-slate-600 border-slate-200'}`}>
                {currentLevel?.name}
            </div>

            {/* Phone Counter (Important) */}
            <div className={`bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border-2 shadow-md flex items-center gap-2 transition-colors ${phoneCount === 1 ? 'border-rose-200 bg-rose-50' : 'border-emerald-100'}`}>
              <Smartphone size={18} className={phoneCount === 1 ? "text-rose-500 animate-pulse" : "text-emerald-500"} />
              <span className={`font-black text-lg ${phoneCount === 1 ? "text-rose-600" : "text-emerald-600"}`}>
                x{phoneCount}
              </span>
            </div>
        </div>

        {/* Commute Progress Bar */}
        <div className="relative mt-2">
            <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                <span>{formatTime(startH, startM)}</span>
                <span>{formatTime(8, 30)}</span>
            </div>
            <div className="w-full bg-slate-200/80 h-4 rounded-full overflow-hidden border border-white/60 shadow-inner backdrop-blur-sm relative">
                <div 
                    className="h-full bg-gradient-to-r from-sky-400 via-blue-400 to-emerald-400"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.START) {
    return (
      // Updated Background: Morning Sky Gradient
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-pink-100 to-white z-50 flex flex-col items-center justify-start text-slate-800 px-4 py-8 overflow-y-auto no-scrollbar overflow-x-hidden">
        
        {/* --- Dynamic Background Elements (Decorations) --- */}
        {/* Top Left - Large Soft Blob */}
        <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-white/50 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>
        
        {/* Top Right - Yellow Sun Glow */}
        <div className="absolute top-[15%] right-[-10%] w-40 h-40 bg-yellow-200/40 rounded-full blur-2xl animate-[bounce_5s_infinite] delay-700 pointer-events-none"></div>
        
        {/* Bottom Left - Pink Accent */}
        <div className="absolute bottom-[15%] left-[5%] w-32 h-32 bg-pink-300/30 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite] pointer-events-none"></div>
        
        {/* Center - Subtle Blue Drift */}
        <div className="absolute top-[40%] left-[30%] w-48 h-48 bg-sky-300/10 rounded-full blur-2xl animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>

        {/* Logo Section */}
        <div className="mb-6 mt-8 relative flex-shrink-0 z-10">
            <div className="absolute inset-0 bg-white/60 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-white p-4 rounded-3xl shadow-xl ring-4 ring-white/60 transform hover:scale-105 transition-transform duration-300">
                <Bike size={64} className="text-sky-500" />
                <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white animate-bounce">
                    HOT!
                </div>
            </div>
        </div>

        <h1 className="text-3xl font-black mb-1 text-slate-800 tracking-tight text-center drop-shadow-sm flex-shrink-0 z-10">
          汪汪早八<span className="text-sky-600">大冒险</span>
        </h1>
        
        {/* Info Tags Group */}
        <div className="flex flex-col items-center gap-2 mb-8 flex-shrink-0 z-10">
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1 bg-white/60 px-3 py-1 rounded-full border border-white/50 backdrop-blur-sm shadow-sm">
                <Zap size={12} className="text-amber-500 fill-amber-500"/> 
                目标: 8:30 前打卡保住全勤奖
            </p>
            
            {/* Warning Tag */}
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1 bg-rose-50/90 px-3 py-1 rounded-full border border-rose-200 shadow-sm animate-pulse">
                <AlertTriangle size={12} className="text-rose-500"/> 
                警报: 务必小心路上的偷手机贼！
            </p>
        </div>
        
        {/* Level Selection */}
        <div className="w-full max-w-xs flex flex-col gap-5 mb-8 flex-shrink-0 z-10">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 -mb-1">选择今日通勤姿势</div>
          
          {LEVELS.map((level, index) => {
             const theme = getThemeColors(level.id);
             return (
             <button 
                key={level.id}
                onClick={() => onStart(level)}
                className="w-full group relative bg-white/90 backdrop-blur-sm rounded-2xl p-1 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-visible flex-shrink-0"
             >
                {/* Special Tag for Easy Mode */}
                {index === 0 && (
                    <div className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm z-20">
                        新手推荐 ✨
                    </div>
                )}
                 {index === 2 && (
                    <div className="absolute -top-2.5 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm z-20 animate-pulse">
                        挑战极限 🔥
                    </div>
                )}

                <div className={`relative w-full rounded-xl p-4 overflow-hidden border group-active:scale-[0.98] transition-transform ${theme.bg} ${theme.border}`}>
                    {/* Background Gradient Accent */}
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${level.colorTheme} opacity-10 rounded-full blur-2xl -mr-8 -mt-8 transition-opacity group-hover:opacity-20`}></div>
                    
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                            <div className="font-black text-lg text-slate-800 flex items-center gap-2">
                                {level.name}
                            </div>
                            <div className="text-xs font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                                <Clock size={10} /> {formatTime(level.startHour, level.startMinute)} 出发
                            </div>
                        </div>
                        
                        {/* Play Button */}
                        <div className={`p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all ${theme.icon}`}>
                            <Play size={20} fill="currentColor" className="ml-0.5"/>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed text-left relative z-10">
                        {level.description}
                    </p>
                </div>
             </button>
             );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-auto mb-4 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 w-full max-w-xs shadow-sm flex-shrink-0 z-10">
             <div className="flex justify-around text-[10px] text-slate-600 font-bold">
                 <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Smartphone size={14} />
                    </div>
                    <span>捡手机</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                        <AlertTriangle size={14} />
                    </div>
                    <span>躲小偷</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                        <Star size={14} />
                    </div>
                    <span>拿全勤</span>
                 </div>
             </div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
    const isWin = status === GameStatus.VICTORY;
    
    // Logic for Titles and Descriptions
    let title = "通勤失败";
    let description = causeOfDeath;

    if (isWin) {
      title = "打卡成功！";
      const extraPhones = phoneCount - 1;
      if (extraPhones > 0) {
        description = `汪汪不仅在8:30前赶到了公司，还顺手捡了 ${extraPhones} 部手机，简直是打工人之神！`;
      } else {
        description = "汪汪在8:30前安全抵达了公司，保住了这个月的全勤奖！";
      }
    } else {
      if (causeOfDeath?.includes("偷") || causeOfDeath?.includes("抢")) {
        title = "手机被偷啦！";
      } else if (causeOfDeath?.includes("车") || causeOfDeath?.includes("撞")) {
        title = "撞到车啦！";
      }
    }

    return (
      <div className="absolute inset-0 bg-slate-800/90 z-50 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="mb-6">
          {isWin ? (
             <div className="p-6 bg-emerald-400 rounded-full ring-8 ring-emerald-400/30 animate-pulse">
                <Trophy size={64} className="text-white" fill="white" />
             </div>
          ) : (
            <div className="p-6 bg-rose-400 rounded-full ring-8 ring-rose-400/30">
                <AlertTriangle size={64} className="text-white" />
            </div>
          )}
        </div>
        
        <h2 className="text-3xl font-bold mb-2">
          {title}
        </h2>
        <p className="text-lg text-slate-300 mb-6 font-medium px-4 leading-relaxed">
            {description}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
           <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <div className="text-xs text-slate-400 uppercase font-bold">最终时间</div>
            <div className="text-2xl font-black text-sky-300">{gameTimeStr}</div>
          </div>
           <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <div className="text-xs text-slate-400 uppercase font-bold">剩余手机</div>
            <div className="text-2xl font-black text-emerald-300">{phoneCount}</div>
          </div>
        </div>

        <button 
          onClick={onRestart}
          className="bg-white text-slate-900 font-bold py-3 px-10 rounded-full flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-lg shadow-white/20"
        >
          <RotateCcw size={20} /> {isWin ? "返回选关" : "重新出发"}
        </button>
      </div>
    );
  }

  return null;
};