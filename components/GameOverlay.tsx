import React from 'react';
import { GameStatus, LevelConfig } from '../types';
import { Trophy, AlertTriangle, Play, RotateCcw, Clock, Smartphone, Bike } from 'lucide-react';
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
  const winDistance = currentLevel ? currentLevel.winDistance : GAME_CONFIG.WIN_DISTANCE; // Use level default or fallback
  const progress = Math.min(100, (distance / winDistance) * 100);

  // Time labels for progress bar
  const startH = currentLevel ? currentLevel.startHour : GAME_CONFIG.END_HOUR;
  const startM = currentLevel ? currentLevel.startMinute : 0;
  
  // Helper to format time
  const formatTime = (h: number, m: number) => `${h}:${m < 10 ? '0'+m : m}`;

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
      <div className="absolute inset-0 bg-pink-50/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-slate-800 px-4 py-8 overflow-y-auto no-scrollbar">
        <div className="mb-4 animate-bounce">
            <div className="relative inline-block">
                <Bike size={60} className="text-sky-500 mx-auto" />
                <div className="absolute -bottom-2 -right-6 bg-rose-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm -rotate-6">
                    全勤奖!
                </div>
            </div>
        </div>
        <h1 className="text-2xl font-black mb-1 text-slate-800 tracking-tight">
          汪汪早八大冒险
        </h1>
        <p className="text-xs text-slate-500 mb-6 font-medium">请选择今日通勤难度</p>
        
        <div className="w-full max-w-xs space-y-3">
          {LEVELS.map((level) => (
             <button 
                key={level.id}
                onClick={() => onStart(level)}
                className="w-full group relative bg-white border-2 border-slate-100 hover:border-transparent hover:ring-2 hover:ring-offset-2 hover:ring-emerald-400 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-200 text-left"
             >
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 bg-gradient-to-r ${level.colorTheme}`}></div>
                <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-lg text-slate-800">{level.name}</span>
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                        {formatTime(level.startHour, level.startMinute)} 出发
                    </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{level.description}</p>
             </button>
          ))}
        </div>

        <div className="mt-6 text-[10px] text-slate-400 flex gap-4">
             <span className="flex items-center gap-1"><Smartphone size={10}/> 收集手机</span>
             <span className="flex items-center gap-1"><AlertTriangle size={10}/> 躲避小偷</span>
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