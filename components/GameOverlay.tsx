import React, { useState } from 'react';
import { GameStatus, LevelConfig, Season } from '../types';
import { Trophy, AlertTriangle, Play, RotateCcw, Clock, Smartphone, Bike, Star, Zap, BookOpen, X, Home, RefreshCw, Infinity, Award, ArrowRight, Pause, Flower, Leaf, Snowflake, Sun } from 'lucide-react';
import { GAME_CONFIG, LEVELS, ENDLESS_LEVEL, RANKS, SEASON_STYLES } from '../constants';

interface GameOverlayProps {
  status: GameStatus;
  score: number;
  distance: number;
  highScore: number;
  onStart: (level: LevelConfig) => void;
  onRetry: () => void;
  onReturn: () => void;
  onNextLevel: () => void;
  onPause: () => void;
  onResume: () => void;
  causeOfDeath?: string;
  gameTimeStr: string;
  phoneCount: number;
  currentLevel: LevelConfig | null;
  survivalTime: number; 
  currentSeason: Season; 
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ 
  status, score, distance, onStart, onRetry, onReturn, onNextLevel, onPause, onResume, causeOfDeath, gameTimeStr, phoneCount, currentLevel, survivalTime, currentSeason
}) => {
  
  const [showRules, setShowRules] = useState(false);

  // Progress Bar Calculation
  const winDistance = currentLevel ? currentLevel.winDistance : GAME_CONFIG.WIN_DISTANCE; 
  const progress = Math.min(100, (distance / winDistance) * 100);

  // Time labels for progress bar
  const startH = currentLevel ? currentLevel.startHour : GAME_CONFIG.END_HOUR;
  const startM = currentLevel ? currentLevel.startMinute : 0;
  
  // Helper to format time
  const formatTime = (h: number, m: number) => `${h}:${m < 10 ? '0'+m : m}`;
  
  const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? '0'+secs : secs}`;
  };

  const getThemeColors = (id: string) => {
      switch(id) {
          case 'EASY': return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500' };
          case 'NORMAL': return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' };
          case 'HARD': return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-500' };
          default: return { text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: 'text-slate-500' };
      }
  };

  const getSeasonPauseTheme = (season: Season) => {
      switch (season) {
          case Season.SPRING: return { 
              bg: 'from-pink-50/95 to-emerald-50/95', 
              border: 'border-emerald-200',
              iconColor: 'text-emerald-500',
              btnPrimary: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
          };
          case Season.SUMMER: return { 
              bg: 'from-yellow-50/95 to-sky-50/95', 
              border: 'border-lime-300',
              iconColor: 'text-lime-600',
              btnPrimary: 'bg-lime-500 hover:bg-lime-600 shadow-lime-200'
          };
          case Season.AUTUMN: return { 
              bg: 'from-orange-50/95 to-amber-50/95', 
              border: 'border-orange-200',
              iconColor: 'text-orange-500',
              btnPrimary: 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
          };
          case Season.WINTER: return { 
              bg: 'from-slate-50/95 to-blue-50/95', 
              border: 'border-blue-200',
              iconColor: 'text-sky-500',
              btnPrimary: 'bg-sky-500 hover:bg-sky-600 shadow-sky-200'
          };
          default: return { 
              bg: 'from-white/95 to-slate-50/95', 
              border: 'border-slate-200',
              iconColor: 'text-slate-500',
              btnPrimary: 'bg-slate-800 hover:bg-slate-700 shadow-slate-200'
          };
      }
  };

  // Helper to render seasonal floating elements
  const renderSeasonalDecor = (season: Season) => {
      const items = [];
      const count = 5;
      
      for(let i = 0; i < count; i++) {
          let Decor = null;
          let animClass = '';
          
          const style = {
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.6
          };

          if (season === Season.SPRING) {
              Decor = <Flower size={16} className="text-pink-300" fill="currentColor" />;
              animClass = 'animate-bounce'; 
          } else if (season === Season.SUMMER) {
              Decor = <Sun size={16} className="text-yellow-400" fill="currentColor" />;
              animClass = 'animate-pulse';
          } else if (season === Season.AUTUMN) {
              Decor = <Leaf size={16} className="text-orange-400" fill="currentColor" />;
              animClass = 'animate-spin-slow'; // Custom slow spin logic or reuse bounce
          } else if (season === Season.WINTER) {
              Decor = <Snowflake size={16} className="text-sky-200" />;
              animClass = 'animate-pulse';
          }

          if (Decor) {
              items.push(
                  <div key={`pause-decor-${i}`} className={`absolute ${animClass} pointer-events-none`} style={style}>
                      {Decor}
                  </div>
              );
          }
      }
      return items;
  }

  const getRank = (seconds: number) => {
      let bestRank = RANKS[0];
      for (const rank of RANKS) {
          if (seconds >= rank.minTime) {
              bestRank = rank;
          }
      }
      return bestRank;
  };

  if (status === GameStatus.PLAYING) {
    return (
      <div className="absolute top-0 left-0 right-0 p-4 z-20 pointer-events-none">
        {/* Top Header - Info Cards */}
        <div className="flex justify-between items-start mb-3">
            
            <div className="flex gap-2 items-center">
                {/* Pause Button - Pointer events auto to allow clicking */}
                <button 
                    onClick={onPause}
                    className="pointer-events-auto bg-white/90 backdrop-blur-md p-2 rounded-xl border-2 border-slate-100 shadow-md text-slate-600 active:scale-90 transition-transform hover:bg-white"
                >
                    <Pause size={20} fill="currentColor" />
                </button>

                {/* Time Card */}
                <div className="bg-white/90 backdrop-blur-md text-slate-700 px-3 py-1.5 rounded-xl border-2 border-slate-100 shadow-md flex items-center gap-2">
                    <Clock size={16} className="text-sky-500" />
                    <span className="font-bold font-mono text-lg">
                        {currentLevel?.isEndless ? formatDuration(survivalTime) : gameTimeStr}
                    </span>
                </div>
            </div>

            {/* Level Badge (Hidden on very small screens if needed, but flex handles it) */}
            <div className={`bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold border shadow-sm hidden sm:block ${currentLevel?.id === 'HARD' ? 'text-rose-600 border-rose-200' : 'text-slate-600 border-slate-200'}`}>
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

        {/* Commute Progress Bar (Hidden in Endless) */}
        {!currentLevel?.isEndless && (
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
        )}
      </div>
    );
  }

  // --- PAUSE MENU ---
  if (status === GameStatus.PAUSED) {
      const pauseTheme = getSeasonPauseTheme(currentSeason);
      
      return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-sm p-6 animate-in fade-in duration-200">
            <div className={`bg-gradient-to-b ${pauseTheme.bg} rounded-3xl w-full max-w-xs p-6 shadow-2xl border-2 ${pauseTheme.border} relative overflow-hidden`}>
                
                {/* Decorative background blobs */}
                <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/40 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white/40 rounded-full blur-2xl"></div>
                
                {/* Seasonal Floating Elements */}
                {renderSeasonalDecor(currentSeason)}

                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-slate-800 text-center mb-2 flex items-center justify-center gap-2">
                        <Pause size={24} className={pauseTheme.iconColor} fill="currentColor"/> 暂停中
                    </h2>
                    <p className="text-xs text-slate-500 text-center mb-8 font-medium">休息一下，马上出发</p>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={onResume}
                            className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${pauseTheme.btnPrimary}`}
                        >
                            <Play size={20} fill="currentColor"/> 继续游戏
                        </button>
                        
                        <button 
                            onClick={onRetry}
                            className="w-full bg-white/60 hover:bg-white/80 active:scale-95 text-slate-700 font-bold py-3.5 rounded-xl border border-white/50 shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} /> 重新开始
                        </button>
                        
                        <button 
                            onClick={onReturn}
                            className="w-full bg-white/40 hover:bg-white/60 active:scale-95 text-slate-600 font-bold py-3.5 rounded-xl border border-white/30 transition-all flex items-center justify-center gap-2"
                        >
                            <Home size={18} /> 退出本局
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (status === GameStatus.START) {
    return (
      // Updated Background: Morning Sky Gradient
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-pink-100 to-white z-50 flex flex-col items-center justify-start text-slate-800 px-4 py-8 overflow-y-auto no-scrollbar overflow-x-hidden">
        
        {/* ... Decorations ... */}
        <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-white/50 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>
        <div className="absolute top-[15%] right-[-10%] w-40 h-40 bg-yellow-200/40 rounded-full blur-2xl animate-[bounce_5s_infinite] delay-700 pointer-events-none"></div>
        <div className="absolute bottom-[15%] left-[5%] w-32 h-32 bg-pink-300/30 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite] pointer-events-none"></div>
        <div className="absolute top-[40%] left-[30%] w-48 h-48 bg-sky-300/10 rounded-full blur-2xl animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>

        <button 
            onClick={() => setShowRules(true)}
            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-slate-200 text-slate-600 hover:bg-white hover:text-sky-500 active:scale-90 active:bg-slate-100 transition-all z-20"
        >
            <BookOpen size={20} />
        </button>

        <div className="mb-4 mt-6 relative flex-shrink-0 z-10">
            <div className="absolute inset-0 bg-white/60 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-white p-4 rounded-3xl shadow-xl ring-4 ring-white/60 transform hover:scale-105 transition-transform duration-300">
                <Bike size={56} className="text-sky-500" />
            </div>
        </div>

        <h1 className="text-3xl font-black mb-1 text-slate-800 tracking-tight text-center drop-shadow-sm flex-shrink-0 z-10">
          汪汪早八<span className="text-sky-600">大冒险</span>
        </h1>
        
        <div className="flex flex-col items-center gap-2 mb-6 flex-shrink-0 z-10">
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1 bg-white/60 px-3 py-1 rounded-full border border-white/50 backdrop-blur-sm shadow-sm">
                <Zap size={12} className="text-amber-500 fill-amber-500"/> 
                目标: 8:30 前打卡保住全勤奖
            </p>
        </div>
        
        <div className="w-full max-w-xs flex flex-col gap-4 mb-6 flex-shrink-0 z-10">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">选择今日通勤姿势</div>
          
          {LEVELS.map((level, index) => {
             const theme = getThemeColors(level.id);
             return (
             <button 
                key={level.id}
                onClick={() => onStart(level)}
                className="w-full group relative bg-white/90 backdrop-blur-sm rounded-2xl p-1 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-inner transition-all duration-200 overflow-visible flex-shrink-0"
             >
                {index === 0 && (
                    <div className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm z-20">
                        新手推荐 ✨
                    </div>
                )}
                <div className={`relative w-full rounded-xl p-3 overflow-hidden border group-active:bg-slate-50 transition-colors ${theme.bg} ${theme.border}`}>
                    <div className="flex justify-between items-center relative z-10">
                        <div className="text-left">
                            <div className="font-black text-lg text-slate-800 flex items-center gap-2">
                                {level.name}
                            </div>
                            <div className="text-xs font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                                <Clock size={10} /> {formatTime(level.startHour, level.startMinute)} 出发
                            </div>
                        </div>
                        <div className={`p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all ${theme.icon}`}>
                            <Play size={20} fill="currentColor" className="ml-0.5"/>
                        </div>
                    </div>
                </div>
             </button>
             );
          })}
        </div>

        <div className="w-full max-w-xs flex-shrink-0 z-10 mb-8">
             <button 
                onClick={() => onStart(ENDLESS_LEVEL)}
                className="w-full group relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-[2px] shadow-lg hover:shadow-purple-300/50 hover:-translate-y-1 active:scale-95 transition-all"
             >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-purple-900 text-[10px] font-black px-3 py-0.5 rounded-full shadow-sm z-20 animate-bounce">
                    挑战极限!
                </div>
                <div className="bg-white/10 backdrop-blur-md w-full h-full rounded-2xl p-4 flex items-center justify-between">
                    <div className="text-left text-white">
                        <div className="font-black text-lg flex items-center gap-2">
                            <Infinity size={20} /> 无尽摸鱼地狱
                        </div>
                        <p className="text-xs text-purple-100/80">难度随时间增加，测测你的极限！</p>
                    </div>
                    <div className="p-2 rounded-full bg-white/20 text-white">
                        <Play size={20} fill="currentColor" className="ml-0.5"/>
                    </div>
                </div>
             </button>
        </div>

        {showRules && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-sm relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <BookOpen size={20} className="text-sky-500"/> 游戏规则
                        </h2>
                        <button 
                            onClick={() => setShowRules(false)}
                            className="p-1 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 active:scale-90 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 text-sky-600 font-bold">1</div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm mb-1">按住滑动or键盘操控</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">手指滑动屏幕or键盘控制，控制汪汪左右变道或上下加速/减速。</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold">2</div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm mb-1">收集手机</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">路上会有散落的手机，收集它们！如果你没有手机，就无法打卡！</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600 font-bold">3</div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm mb-1">躲避危险</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    <span className="font-bold text-rose-500">不要撞车！</span> 撞车会迟到，游戏结束。<br/>
                                    <span className="font-bold text-rose-500">小心小偷！</span> 他们会偷走你的一部手机。如果你没有手机了，游戏结束。
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <button 
                            onClick={() => setShowRules(false)}
                            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 active:bg-slate-700 transition-all"
                        >
                            明白了，出发！
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    );
  }

  if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
    const isWin = status === GameStatus.VICTORY;
    const isEndless = currentLevel?.isEndless;
    
    let title = "通勤失败";
    let description = causeOfDeath;
    
    // --- HIGH EMOTION LIGHT GRADIENTS ---
    let bgTheme = "bg-gradient-to-br from-slate-200 to-slate-300"; 
    let iconBg = "bg-rose-400";
    let MainIcon = AlertTriangle;
    let textColor = "text-slate-800";
    let subTextColor = "text-slate-600";
    let overlayAnim = "animate-in fade-in duration-500";

    const isStolen = causeOfDeath?.includes("偷") || causeOfDeath?.includes("抢");
    const isCrash = causeOfDeath?.includes("车") || causeOfDeath?.includes("撞");

    if (isWin) {
      title = "打卡成功！";
      // Victory: Golden Sunlight / Mint Freshness (Stronger joy)
      bgTheme = "bg-gradient-to-br from-emerald-100 via-yellow-100 to-orange-100"; 
      iconBg = "bg-yellow-400";
      MainIcon = Trophy;
      textColor = "text-emerald-800";
      subTextColor = "text-emerald-700";
      const extraPhones = phoneCount - 1;
      if (extraPhones > 0) {
        description = `汪汪不仅在8:30前赶到了公司，还顺手捡了 ${extraPhones} 部手机，简直是打工人之神！`;
      } else {
        description = "汪汪在8:30前安全抵达了公司，保住了这个月的全勤奖！";
      }
    } else if (isEndless) {
        // Endless: Dreamy Purple
        title = "摸鱼结束";
        bgTheme = "bg-gradient-to-br from-violet-100 to-fuchsia-100";
        const rank = getRank(survivalTime);
        description = rank.message;
        MainIcon = Award;
        iconBg = "bg-purple-500";
        textColor = "text-purple-900";
    } else {
        // Normal Game Over
        if (isStolen) {
            title = "手机被偷啦！";
            // Stolen: Deep Blue / Grey (Sadness, cold)
            bgTheme = "bg-gradient-to-br from-indigo-100 to-slate-200"; 
            iconBg = "bg-indigo-500";
            MainIcon = Smartphone; 
            textColor = "text-indigo-900";
            subTextColor = "text-slate-600";
        } else if (isCrash) {
            title = "撞到车啦！";
            // Crash: Red / Orange (Alarming, hot)
            bgTheme = "bg-gradient-to-br from-red-100 to-orange-200"; 
            iconBg = "bg-red-500";
            MainIcon = AlertTriangle;
            textColor = "text-red-900";
            subTextColor = "text-red-700";
            // Add shake effect for crash
            overlayAnim += " animate-[shake_0.5s_ease-in-out]"; 
        }
    }

    // Determine Next Action Button
    let PrimaryAction = null;
    
    if (isWin) {
        if (currentLevel?.id === 'EASY' || currentLevel?.id === 'NORMAL') {
            PrimaryAction = (
                <button 
                onClick={onNextLevel}
                className="w-full group relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 active:shadow-sm text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-emerald-900/20 transform transition-all flex items-center justify-center gap-2"
                >
                <span className="text-xl drop-shadow-sm">下一关</span>
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
            );
        } else {
            PrimaryAction = (
                <button 
                onClick={() => onStart(ENDLESS_LEVEL)}
                className="w-full group relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 active:shadow-sm text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-indigo-900/20 transform transition-all flex items-center justify-center gap-2"
                >
                <Infinity size={24} className="animate-pulse" />
                <span className="text-xl drop-shadow-sm">试试无尽模式</span>
                </button>
            );
        }
    } else {
        PrimaryAction = (
            <button 
            onClick={onRetry}
            className="w-full group relative bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 active:shadow-sm text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-orange-900/20 transform transition-all flex items-center justify-center gap-2"
            >
            <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-xl drop-shadow-sm">再来一次</span>
            </button>
        );
    }

    return (
      <div className={`absolute inset-0 ${bgTheme} z-50 flex flex-col items-center justify-center p-6 text-center ${overlayAnim}`}>
        
        {/* Background Elements for Emotion */}
        {isCrash && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent animate-pulse pointer-events-none"></div>
        )}
        {isWin && (
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-1/4 w-32 h-32 bg-yellow-300/30 rounded-full blur-3xl animate-[ping_3s_infinite]"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-3xl animate-[pulse_4s_infinite]"></div>
            </div>
        )}

        <div className="mb-6 relative">
             <div className={`p-6 rounded-full ring-8 ring-white/50 shadow-xl ${iconBg} ${isWin ? 'animate-bounce' : 'animate-pulse'}`}>
                <MainIcon size={64} className="text-white drop-shadow-md" />
             </div>
             {/* Emotes */}
             {isStolen && <div className="absolute -top-4 -right-4 text-5xl animate-bounce delay-100">😭</div>}
             {isCrash && <div className="absolute -top-4 -left-4 text-5xl animate-spin-slow">😵‍💫</div>}
             {isWin && <div className="absolute -top-6 right-0 text-5xl animate-bounce delay-100">🥳</div>}
        </div>
        
        <h2 className={`text-4xl font-black mb-3 drop-shadow-sm tracking-tight ${textColor}`}>
          {title}
        </h2>
        
        {isEndless && (
            <div className="mb-4 bg-white/60 px-6 py-2 rounded-full border border-white/50 backdrop-blur-md animate-in zoom-in delay-200 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">本次称号</span>
                <div className="text-2xl font-black text-purple-600 drop-shadow-sm">{getRank(survivalTime).title}</div>
            </div>
        )}

        <p className={`text-lg ${subTextColor} mb-8 font-medium px-4 leading-relaxed max-w-xs`}>
            {description}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
           <div className="bg-white/60 p-4 rounded-2xl backdrop-blur-md border border-white/40 shadow-sm">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">
                {isEndless ? '坚持时长' : '最终时间'}
            </div>
            <div className="text-2xl font-black text-slate-800">
                {isEndless ? formatDuration(survivalTime) : gameTimeStr}
            </div>
          </div>
           <div className="bg-white/60 p-4 rounded-2xl backdrop-blur-md border border-white/40 shadow-sm">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">剩余手机</div>
            <div className={`text-2xl font-black ${phoneCount === 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{phoneCount}</div>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-4">
            {PrimaryAction}

            <button 
            onClick={onReturn}
            className="w-full bg-white/40 hover:bg-white/60 active:bg-white/70 active:scale-95 text-slate-600 font-bold py-3 px-8 rounded-xl backdrop-blur-sm border border-white/50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
            <Home size={18} />
            返回选关
            </button>
        </div>
      </div>
    );
  }

  return null;
};