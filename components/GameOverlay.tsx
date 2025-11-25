import React, { useState, useMemo } from 'react';
import { GameStatus, LevelConfig, Season, Rank } from '../types';
import { Trophy, AlertTriangle, Play, RotateCcw, Clock, Smartphone, Bike, Star, Zap, BookOpen, X, Home, RefreshCw, Infinity, Award, ArrowRight, Pause, Flower, Leaf, Snowflake, Sun, ThumbsUp, Crown, Timer, CloudRain, Flame, Coffee, ThumbsDown, Share2, Download, Sparkles } from 'lucide-react';
import { GAME_CONFIG, LEVELS, ENDLESS_LEVEL, RANKS, SEASON_STYLES } from '../constants';

// Declare html2canvas globally as it is loaded via script tag
declare const html2canvas: any;

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
  countdown?: number; 
}

// Helper defined outside component
const getRank = (seconds: number) => {
    let bestRank = RANKS[0];
    for (const rank of RANKS) {
        if (seconds >= rank.minTime) {
            bestRank = rank;
        }
    }
    return bestRank;
};

export const GameOverlay: React.FC<GameOverlayProps> = ({ 
  status, score, distance, onStart, onRetry, onReturn, onNextLevel, onPause, onResume, causeOfDeath, gameTimeStr, phoneCount, currentLevel, survivalTime, currentSeason, countdown
}) => {
  
  const [showRules, setShowRules] = useState(false);
  const [shareImg, setShareImg] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  // Progress Bar Calculation
  const winDistance = currentLevel ? currentLevel.winDistance : GAME_CONFIG.WIN_DISTANCE; 
  const progress = Math.min(100, (distance / winDistance) * 100);

  const startH = currentLevel ? currentLevel.startHour : GAME_CONFIG.END_HOUR;
  const startM = currentLevel ? currentLevel.startMinute : 0;
  
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
          if (season === Season.SPRING) { Decor = <Flower size={16} className="text-pink-300" fill="currentColor" />; animClass = 'animate-bounce'; } 
          else if (season === Season.SUMMER) { Decor = <Sun size={16} className="text-yellow-400" fill="currentColor" />; animClass = 'animate-pulse'; } 
          else if (season === Season.AUTUMN) { Decor = <Leaf size={16} className="text-orange-400" fill="currentColor" />; animClass = 'animate-spin-slow'; } 
          else if (season === Season.WINTER) { Decor = <Snowflake size={16} className="text-sky-200" />; animClass = 'animate-pulse'; }
          if (Decor) { items.push(<div key={`pause-decor-${i}`} className={`absolute ${animClass} pointer-events-none`} style={style}>{Decor}</div>); }
      }
      return items;
  }

  const getRankInfo = (seconds: number) => {
      let currentRank = RANKS[0];
      let nextRank = null;
      
      for (let i = 0; i < RANKS.length; i++) {
          if (seconds >= RANKS[i].minTime) {
              currentRank = RANKS[i];
              if (i < RANKS.length - 1) {
                  nextRank = RANKS[i + 1];
              } else {
                  nextRank = null; 
              }
          }
      }
      return { current: currentRank, next: nextRank };
  };

  // --- VISUAL THEMES FOR RESULT SCREENS (BOTH ENDLESS & NORMAL) ---
  // This function now handles ALL particle effects for the result screen
  const renderResultParticles = (type: 'win' | 'fail' | 'rank_high' | 'rank_low') => {
      if (type === 'fail' || type === 'rank_low') {
           // Rain / Gloomy Particles
           return (
             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                 <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply"></div>
                 {[...Array(30)].map((_,i) => (
                     <div key={i} className="absolute top-[-20%] w-0.5 h-6 bg-blue-400/40 rounded-full" 
                          style={{ 
                              left: `${Math.random()*100}%`, 
                              animation: `rain 0.8s linear infinite`, 
                              animationDelay: `${Math.random()}s`
                          }}></div>
                 ))}
             </div>
           );
      } else {
           // Confetti / Celebration Particles
           return (
             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                 {[...Array(40)].map((_,i) => (
                     <div key={i} className={`absolute top-[-10%] w-2 h-4 ${['bg-yellow-400','bg-rose-400','bg-emerald-400','bg-purple-400'][i%4]} rotate-45`} 
                          style={{ 
                              left: `${Math.random()*100}%`, 
                              animation: `confetti ${2+Math.random()*2}s linear infinite`,
                              animationDelay: `${Math.random()*2}s`,
                              opacity: 0.8
                          }}></div>
                 ))}
                 <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
             </div>
           );
      }
  };

  const getEndlessTheme = (seconds: number) => {
      if (seconds < 20) return {
          bg: "from-slate-800 to-slate-900", 
          iconBg: "bg-slate-600",
          MainIcon: CloudRain,
          textColor: "text-slate-200",
          subTextColor: "text-slate-400",
          emote: "⛈️",
          anim: "animate-none",
          panelBg: "bg-white/10 border-white/10 text-white",
          particleType: 'rank_low' as const
      };
      if (seconds < 40) return {
          bg: "from-emerald-50 to-teal-100",
          iconBg: "bg-emerald-400",
          MainIcon: Coffee, 
          textColor: "text-emerald-800",
          subTextColor: "text-emerald-700",
          emote: "🍵",
          anim: "animate-bounce",
          panelBg: "bg-white/60 border-white/40 text-slate-800",
          particleType: 'rank_low' as const
      };
      if (seconds < 60) return {
          bg: "from-blue-50 to-indigo-100",
          iconBg: "bg-blue-500",
          MainIcon: Smartphone, 
          textColor: "text-blue-900",
          subTextColor: "text-blue-700",
          emote: "📱",
          anim: "animate-pulse",
          panelBg: "bg-white/60 border-white/40 text-slate-800",
          particleType: 'rank_low' as const
      };
      // ... (Other ranks upgraded to high visual)
      if (seconds < 90) return {
          bg: "from-orange-50 to-amber-100",
          iconBg: "bg-orange-500",
          MainIcon: Zap,
          textColor: "text-orange-900",
          subTextColor: "text-orange-700",
          emote: "⚡",
          anim: "animate-[shake_0.5s_ease-in-out]",
          panelBg: "bg-white/60 border-white/40 text-slate-800",
          particleType: 'rank_high' as const
      };
      if (seconds < 120) return {
          bg: "from-rose-100 to-pink-200",
          iconBg: "bg-rose-500",
          MainIcon: Award,
          textColor: "text-rose-900",
          subTextColor: "text-rose-700",
          emote: "🎖️",
          anim: "animate-bounce",
          panelBg: "bg-white/60 border-white/40 text-slate-800",
          particleType: 'rank_high' as const
      };
      if (seconds < 150) return {
          bg: "from-violet-900 to-fuchsia-900",
          iconBg: "bg-fuchsia-500",
          MainIcon: Flame, 
          textColor: "text-fuchsia-100",
          subTextColor: "text-fuchsia-200",
          emote: "🏎️",
          anim: "animate-spin-slow",
          panelBg: "bg-white/10 border-white/20 text-white",
          particleType: 'rank_high' as const
      };
      return {
          bg: "from-amber-100 via-yellow-100 to-orange-100", 
          iconBg: "bg-yellow-500",
          MainIcon: Crown, 
          textColor: "text-amber-900",
          subTextColor: "text-amber-700",
          emote: "👑",
          anim: "animate-[ping_1s_infinite]",
          panelBg: "bg-white/60 border-white/40 text-slate-800",
          particleType: 'rank_high' as const
      };
  };

  // Generate witty fail message based on progress
  const getFailMessage = (progressPct: number, isEndless: boolean, baseCause: string) => {
      if (isEndless) return baseCause; 

      const failQuotesLow = [
          "刚出门就翻车？这波操作有点迷... 🤔",
          "还没热身就结束了？再试一次！💪",
          "早高峰确实凶险，下次小心点！🚦"
      ];
      const failQuotesMid = [
          "哎呀！只差亿点点运气，下次一定稳！🔥",
          "手滑了一下？再来一把绝对能过！✨",
          "可惜可惜！全勤奖离你只有一步之遥！💸"
      ];
      const failQuotesHigh = [
          "啊啊啊！终点就在眼前！这能忍？再来一把！😡",
          "就差最后几米！这不科学！🤯",
          "我不服！这局必须赢回来！🚀"
      ];

      let quote = "";
      if (progressPct < 20) quote = failQuotesLow[Math.floor(Math.random() * failQuotesLow.length)];
      else if (progressPct < 80) quote = failQuotesMid[Math.floor(Math.random() * failQuotesMid.length)];
      else quote = failQuotesHigh[Math.floor(Math.random() * failQuotesHigh.length)];

      return (
          <>
            <span className="block mb-2 opacity-80 text-sm">{baseCause}</span>
            <span className="block font-bold text-lg">{quote}</span>
          </>
      );
  };

  const failMessage = useMemo(() => {
      if (status === GameStatus.GAME_OVER) {
          const isEndless = currentLevel?.isEndless || false;
          return getFailMessage(progress, isEndless, causeOfDeath || "");
      }
      return null;
  }, [status, progress, currentLevel, causeOfDeath]);

  // --- SHARE FUNCTIONALITY ---
  const handleShare = async () => {
      setIsGeneratingShare(true);
      setTimeout(async () => {
          const element = document.getElementById('share-card');
          if (element && typeof html2canvas !== 'undefined') {
              try {
                  const canvas = await html2canvas(element, { 
                      backgroundColor: null, 
                      scale: 2,
                      useCORS: true,
                      allowTaint: true 
                  });
                  const data = canvas.toDataURL('image/png');
                  setShareImg(data);
              } catch (e) {
                  console.error("Screenshot failed", e);
              }
          }
          setIsGeneratingShare(false);
      }, 100);
  };


  if (status === GameStatus.STORY_INTRO) {
      return null;
  }

  if (status === GameStatus.PLAYING) {
    return (
      <div className="absolute top-0 left-0 right-0 p-4 z-20 pointer-events-none">
        {/* Top Header - Info Cards */}
        <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2 items-center">
                <button 
                    onClick={onPause}
                    className="pointer-events-auto bg-white/90 backdrop-blur-md p-2 rounded-xl border-2 border-slate-100 shadow-md text-slate-600 active:scale-90 transition-transform hover:bg-white"
                >
                    <Pause size={20} fill="currentColor" />
                </button>

                <div className="bg-white/90 backdrop-blur-md text-slate-700 px-3 py-1.5 rounded-xl border-2 border-slate-100 shadow-md flex items-center gap-2">
                    <Clock size={16} className="text-sky-500" />
                    <span className="font-bold font-mono text-lg">
                        {currentLevel?.isEndless ? formatDuration(survivalTime) : gameTimeStr}
                    </span>
                </div>
            </div>

            <div className={`bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold border shadow-sm hidden sm:block ${currentLevel?.id === 'HARD' ? 'text-rose-600 border-rose-200' : 'text-slate-600 border-slate-200'}`}>
                {currentLevel?.name}
            </div>

            <div className={`bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border-2 shadow-md flex items-center gap-2 transition-colors ${phoneCount === 1 ? 'border-rose-200 bg-rose-50' : 'border-emerald-100'}`}>
              <Smartphone size={18} className={phoneCount === 1 ? "text-rose-500 animate-pulse" : "text-emerald-500"} />
              <span className={`font-black text-lg ${phoneCount === 1 ? "text-rose-600" : "text-emerald-600"}`}>
                x{phoneCount}
              </span>
            </div>
        </div>

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
                <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/40 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white/40 rounded-full blur-2xl"></div>
                {renderSeasonalDecor(currentSeason)}
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-slate-800 text-center mb-2 flex items-center justify-center gap-2">
                        <Pause size={24} className={pauseTheme.iconColor} fill="currentColor"/> 暂停中
                    </h2>
                    <p className="text-xs text-slate-500 text-center mb-8 font-medium">休息一下，马上出发</p>
                    <div className="space-y-3">
                        <button onClick={onResume} className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${pauseTheme.btnPrimary}`}>
                            <Play size={20} fill="currentColor"/> 继续游戏
                        </button>
                        <button onClick={onRetry} className="w-full bg-white/60 hover:bg-white/80 active:scale-95 text-slate-700 font-bold py-3.5 rounded-xl border border-white/50 shadow-sm transition-all flex items-center justify-center gap-2">
                            <RefreshCw size={18} /> 重新开始
                        </button>
                        <button onClick={onReturn} className="w-full bg-white/40 hover:bg-white/60 active:scale-95 text-slate-600 font-bold py-3.5 rounded-xl border border-white/30 transition-all flex items-center justify-center gap-2">
                            <Home size={18} /> 退出本局
                        </button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- START SCREEN ---
  if (status === GameStatus.START) {
    // ... (Same as before)
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-pink-100 to-white z-50 flex flex-col items-center justify-start text-slate-800 px-4 py-8 overflow-y-auto no-scrollbar overflow-x-hidden">
        {/* ... Decor ... */}
        <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-white/50 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>
        <div className="absolute top-[15%] right-[-10%] w-40 h-40 bg-yellow-200/40 rounded-full blur-2xl animate-[bounce_5s_infinite] delay-700 pointer-events-none"></div>
        <div className="absolute bottom-[15%] left-[5%] w-32 h-32 bg-pink-300/30 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite] pointer-events-none"></div>
        <div className="absolute top-[40%] left-[30%] w-48 h-48 bg-sky-300/10 rounded-full blur-2xl animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>

        <button onClick={() => setShowRules(true)} className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-slate-200 text-slate-600 hover:bg-white hover:text-sky-500 active:scale-90 active:bg-slate-100 transition-all z-20">
            <BookOpen size={20} />
        </button>

        <div className="mb-4 mt-6 relative flex-shrink-0 z-10">
            <div className="absolute inset-0 bg-white/60 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-white p-4 rounded-3xl shadow-xl ring-4 ring-white/60 transform hover:scale-105 transition-transform duration-300">
                <Bike size={56} className="text-sky-500" />
            </div>
        </div>

        <h1 className="text-3xl font-black mb-1 text-slate-800 tracking-tight text-center drop-shadow-sm flex-shrink-0 z-10">
          早八大冒险
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
             <button key={level.id} onClick={() => onStart(level)} className="w-full group relative bg-white/90 backdrop-blur-sm rounded-2xl p-1 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-inner transition-all duration-200 overflow-visible flex-shrink-0">
                {index === 0 && <div className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm z-20">新手推荐 ✨</div>}
                <div className={`relative w-full rounded-xl p-3 overflow-hidden border group-active:bg-slate-50 transition-colors ${theme.bg} ${theme.border}`}>
                    <div className="flex justify-between items-center relative z-10">
                        <div className="text-left">
                            <div className="font-black text-lg text-slate-800 flex items-center gap-2">{level.name}</div>
                            <div className="text-xs font-mono text-slate-500 mt-0.5 flex items-center gap-1"><Clock size={10} /> {formatTime(level.startHour, level.startMinute)} 出发</div>
                        </div>
                        <div className={`p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all ${theme.icon}`}><Play size={20} fill="currentColor" className="ml-0.5"/></div>
                    </div>
                </div>
             </button>
             );
          })}
        </div>

        <div className="w-full max-w-xs flex-shrink-0 z-10 mb-8 relative group">
             <div className="absolute -top-8 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full rounded-br-none animate-bounce z-20 shadow-sm">看看谁是时间管理大师！</div>
             <button onClick={() => onStart(ENDLESS_LEVEL)} className="w-full group relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-[2px] shadow-lg hover:shadow-purple-300/50 hover:-translate-y-1 active:scale-95 transition-all">
                <div className="absolute -top-3 left-4 bg-yellow-400 text-purple-900 text-[10px] font-black px-3 py-0.5 rounded-full shadow-sm z-20">挑战极限</div>
                <div className="bg-white/10 backdrop-blur-md w-full h-full rounded-2xl p-4 flex items-center justify-between">
                    <div className="text-left text-white">
                        <div className="font-black text-lg flex items-center gap-2"><Infinity size={20} /> 无尽早高峰冲刺</div>
                        <p className="text-xs text-purple-100/80">难度随时间增加，测测你的极限！</p>
                    </div>
                    <div className="p-2 rounded-full bg-white/20 text-white"><Play size={20} fill="currentColor" className="ml-0.5"/></div>
                </div>
             </button>
        </div>

        {showRules && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-sm relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><BookOpen size={20} className="text-sky-500"/> 游戏规则</h2>
                        <button onClick={() => setShowRules(false)} className="p-1 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 active:scale-90 transition-all"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 text-sky-600 font-bold">1</div>
                            <div><h3 className="font-bold text-slate-800 text-sm mb-1">按住滑动or键盘操控</h3><p className="text-xs text-slate-500 leading-relaxed">手指滑动屏幕or键盘控制，控制主角左右变道或上下加速/减速。</p></div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold">2</div>
                            <div><h3 className="font-bold text-slate-800 text-sm mb-1">收集手机</h3><p className="text-xs text-slate-500 leading-relaxed">路上会有散落的手机，收集它们！如果你没有手机，就无法打卡！</p></div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600 font-bold">3</div>
                            <div><h3 className="font-bold text-slate-800 text-sm mb-1">躲避危险</h3><p className="text-xs text-slate-500 leading-relaxed"><span className="font-bold text-rose-500">不要撞车！</span> 撞车会迟到，游戏结束。<br/><span className="font-bold text-rose-500">小心小偷！</span> 他们会偷走你的一部手机。如果你没有手机了，游戏结束。</p></div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <button onClick={() => setShowRules(false)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 active:bg-slate-700 transition-all">明白了，出发！</button>
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
    let description = null; 
    
    let bgTheme = "bg-gradient-to-br from-slate-200 to-slate-300"; 
    let iconBg = "bg-rose-400";
    let MainIcon = AlertTriangle;
    let textColor = "text-slate-800";
    let subTextColor = "text-slate-600";
    let overlayAnim = "animate-in fade-in duration-500";
    let showEmote = null;
    let panelBg = "bg-white/60 border-white/40"; 
    let particleType: 'win' | 'fail' | 'rank_high' | 'rank_low' = 'fail';

    const isStolen = causeOfDeath?.includes("偷") || causeOfDeath?.includes("抢");
    const isCrash = causeOfDeath?.includes("车") || causeOfDeath?.includes("撞");

    if (isWin) {
      title = "打卡成功！";
      bgTheme = "bg-gradient-to-br from-emerald-100 via-yellow-100 to-orange-100"; 
      iconBg = "bg-yellow-400";
      MainIcon = Trophy;
      textColor = "text-emerald-800";
      subTextColor = "text-emerald-700";
      showEmote = <div className="absolute -top-6 right-0 text-5xl animate-bounce delay-100">🥳</div>;
      particleType = 'win';
      const extraPhones = phoneCount - 1;
      if (extraPhones > 0) {
        description = `你不仅在8:30前赶到了公司，还顺手捡了 ${extraPhones} 部手机，简直是打工人之神！`;
      } else {
        description = "你在8:30前安全抵达了公司，保住了这个月的全勤奖！";
      }
    } else if (isEndless) {
        const rankInfo = getRankInfo(survivalTime);
        const currentRankData = getRank(survivalTime);
        const theme = getEndlessTheme(survivalTime);
        
        title = survivalTime < 75 ? "冲刺结束" : "冲刺成功";
        bgTheme = `bg-gradient-to-br ${theme.bg}`;
        iconBg = theme.iconBg;
        MainIcon = theme.MainIcon;
        textColor = theme.textColor;
        subTextColor = theme.subTextColor || "text-slate-600";
        showEmote = <div className={`absolute -top-6 right-0 text-5xl delay-100 ${theme.anim}`}>{theme.emote}</div>;
        if (survivalTime >= 75) overlayAnim += " animate-[pulse_3s_infinite]";
        panelBg = theme.panelBg || "bg-white/60 border-white/40";
        particleType = theme.particleType;

        description = (
            <>
                <span className="block mb-2 opacity-80 text-sm">
                    {survivalTime >= 75 ? "太强了！这波操作行云流水！" : "别灰心，下次一定能冲更远！"}
                </span>
                <span className={`block font-bold text-lg ${theme.textColor}`}>
                    {currentRankData.message}
                </span>
            </>
        );
        
    } else {
        description = failMessage; 
        particleType = 'fail';
        if (isStolen) {
            title = "手机被偷啦！";
            bgTheme = "bg-gradient-to-br from-indigo-100 to-slate-200"; 
            iconBg = "bg-indigo-500";
            MainIcon = Smartphone; 
            textColor = "text-indigo-900";
            subTextColor = "text-slate-600";
            showEmote = <div className="absolute -top-4 -right-4 text-5xl animate-bounce delay-100">😭</div>;
        } else if (isCrash) {
            title = "撞到车啦！";
            bgTheme = "bg-gradient-to-br from-red-100 to-orange-200"; 
            iconBg = "bg-red-500";
            MainIcon = AlertTriangle;
            textColor = "text-red-900";
            subTextColor = "text-red-700";
            overlayAnim += " animate-[shake_0.5s_ease-in-out]"; 
            showEmote = <div className="absolute -top-4 -left-4 text-5xl animate-spin-slow">😵‍💫</div>;
        }
    }

    // Define Button
    let PrimaryAction = null;
    if (isWin) {
        if (currentLevel?.id === 'EASY' || currentLevel?.id === 'NORMAL') {
            PrimaryAction = (
                <button onClick={onNextLevel} className="w-full group relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 active:shadow-sm text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-emerald-900/20 transform transition-all flex items-center justify-center gap-2">
                <span className="text-xl drop-shadow-sm">下一关</span><ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
            );
        } else {
            PrimaryAction = (
                <button onClick={() => onStart(ENDLESS_LEVEL)} className="w-full group relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 active:shadow-sm text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-indigo-900/20 transform transition-all flex items-center justify-center gap-2">
                <Infinity size={24} className="animate-pulse" /><span className="text-xl drop-shadow-sm">试试无尽模式</span>
                </button>
            );
        }
    } else {
        PrimaryAction = (
            <button onClick={onRetry} className="w-full group relative bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 active:shadow-sm text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-orange-900/20 transform transition-all flex items-center justify-center gap-2">
            <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" /><span className="text-xl drop-shadow-sm">再来一次</span>
            </button>
        );
    }
    
    const rankInfo = isEndless ? getRankInfo(survivalTime) : null;
    const currentRankData = isEndless ? getRank(survivalTime) : null;
    const rankColorClass = isEndless ? getEndlessTheme(survivalTime).textColor : 'text-purple-600';

    // --- RENDER SHARE CARD (HIDDEN) ---
    // Completely redesigned for high aesthetic appeal
    const ShareCard = () => (
        <div id="share-card" className="absolute top-[-9999px] left-[-9999px] w-[600px] h-[900px] flex flex-col overflow-hidden bg-white">
             
             {/* Top 2/3: Visual Area with Gradient */}
             <div className={`w-full h-[65%] relative ${bgTheme.replace('bg-gradient-to-br', 'bg-gradient-to-b')} flex flex-col items-center justify-center p-8`}>
                 {/* Background Decor */}
                 <div className="absolute top-0 left-0 w-full h-full opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                 <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
                 <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
                 
                 {/* Floating Particles on Card */}
                 <div className="absolute inset-0 opacity-60">
                     {[...Array(15)].map((_,i) => (
                         <div key={i} className="absolute bg-white/40 rounded-full" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, width: `${4+Math.random()*8}px`, height: `${4+Math.random()*8}px` }}></div>
                     ))}
                 </div>

                 {/* Main Icon Container */}
                 <div className={`relative z-10 p-10 rounded-full ${iconBg} text-white shadow-2xl mb-6 border-8 border-white/30`}>
                     <MainIcon size={100} strokeWidth={1.5} />
                 </div>

                 {/* Title */}
                 <div className={`relative z-10 text-6xl font-black text-white tracking-tight drop-shadow-md mb-2`}>
                     {title}
                 </div>
                 
                 {/* Rank Title (Endless Only) */}
                 {isEndless && currentRankData && (
                     <div className="relative z-10 bg-white/20 backdrop-blur-md px-8 py-2 rounded-full border border-white/40 mt-2">
                         <div className="text-3xl font-bold text-white drop-shadow-sm tracking-widest uppercase">
                             {currentRankData.title}
                         </div>
                     </div>
                 )}
             </div>

             {/* Bottom 1/3: Info & QR */}
             <div className="w-full h-[35%] bg-white flex flex-col p-8 relative">
                 {/* Zigzag tear effect separator */}
                 <div className="absolute top-[-10px] left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0 100%, 2% 0, 4% 100%, 6% 0, 8% 100%, 10% 0, 12% 100%, 14% 0, 16% 100%, 18% 0, 20% 100%, 22% 0, 24% 100%, 26% 0, 28% 100%, 30% 0, 32% 100%, 34% 0, 36% 100%, 38% 0, 40% 100%, 42% 0, 44% 100%, 46% 0, 48% 100%, 50% 0, 52% 100%, 54% 0, 56% 100%, 58% 0, 60% 100%, 62% 0, 64% 100%, 66% 0, 68% 100%, 70% 0, 72% 100%, 74% 0, 76% 100%, 78% 0, 80% 100%, 82% 0, 84% 100%, 86% 0, 88% 100%, 90% 0, 92% 100%, 94% 0, 96% 100%, 98% 0, 100% 100%)' }}></div>

                 <div className="flex-1 flex items-center justify-between gap-8">
                     {/* Stats */}
                     <div className="flex-1">
                         <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                             {isEndless ? "SURVIVAL TIME" : "TIME RECORD"}
                         </div>
                         <div className="text-6xl font-black text-slate-800 mb-4 leading-none">
                             {isEndless ? formatDuration(survivalTime) : gameTimeStr}
                         </div>
                         
                         <div className="flex items-center gap-2 text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-xl w-fit">
                             <Smartphone size={20} className="text-emerald-500" />
                             <span>Collected: {phoneCount}</span>
                         </div>
                     </div>

                     {/* QR Code Area */}
                     <div className="flex flex-col items-center gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <div className="w-24 h-24 bg-white p-1 rounded-lg shadow-sm">
                            <img 
                                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://woof-woof-early-eight-adventure.vercel.app/" 
                                alt="QR Code" 
                                className="w-full h-full object-contain" 
                                crossOrigin="anonymous"
                            />
                         </div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scan to Play</div>
                     </div>
                 </div>
                 
                 <div className="mt-4 flex justify-between items-end">
                      <div className="flex items-center gap-2">
                          <Bike size={20} className="text-slate-400"/>
                          <span className="text-lg font-black text-slate-800 tracking-tight">早八大冒险</span>
                      </div>
                      <div className="text-xs font-mono text-slate-400">{new Date().toDateString()}</div>
                 </div>
             </div>
        </div>
    );

    return (
      // Added "overflow-y-auto no-scrollbar" to main container to handle overflow on small screens
      <div className={`absolute inset-0 ${bgTheme} z-50 flex flex-col items-center justify-start md:justify-center p-6 text-center ${overlayAnim} overflow-y-auto no-scrollbar`}>
        
        <ShareCard />
        
        {/* Share Modal */}
        {shareImg && (
            <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in">
                <div className="relative bg-white p-2 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95">
                    <button onClick={() => setShareImg(null)} className="absolute -top-3 -right-3 bg-slate-800 text-white p-2 rounded-full shadow-md hover:bg-slate-700"><X size={16}/></button>
                    <img src={shareImg} alt="Result" className="w-full h-auto rounded-xl border border-slate-100" />
                    <div className="text-center mt-4 mb-2 text-slate-600 text-sm font-bold flex items-center justify-center gap-2">
                        <Smartphone size={16}/> 长按图片保存分享
                    </div>
                </div>
            </div>
        )}

        {/* RENDER GLOBAL PARTICLES ON OVERLAY */}
        {renderResultParticles(particleType)}

        <div className="mb-6 relative z-10">
             <div className={`p-6 rounded-full ring-8 ring-white/50 shadow-xl ${iconBg} ${isWin || (isEndless && survivalTime > 75) ? 'animate-bounce' : 'animate-pulse'}`}>
                <MainIcon size={64} className="text-white drop-shadow-md" />
             </div>
             {showEmote}
        </div>
        
        <h2 className={`relative z-10 text-4xl font-black mb-3 drop-shadow-sm tracking-tight ${textColor}`}>
          {title}
        </h2>
        
        {isEndless && currentRankData && (
            <div className="w-full max-w-xs mb-4 space-y-2 relative z-10 flex-shrink-0">
                <div className={`${panelBg} px-6 py-3 rounded-2xl backdrop-blur-md shadow-sm flex flex-col items-center transition-all duration-500`}>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest block mb-1">本次称号</span>
                    <div className={`text-2xl font-black drop-shadow-sm ${rankColorClass}`}>
                        {currentRankData.title}
                    </div>
                </div>
                
                {rankInfo && rankInfo.next && (
                    <div className="bg-white/40 p-3 rounded-xl border border-white/30 backdrop-blur-sm animate-in slide-in-from-bottom-2 delay-300">
                        <div className="flex justify-between items-center text-[10px] font-medium opacity-80 mb-1">
                            <span className="flex items-center gap-1"><Crown size={10}/> {rankInfo.current.title}</span>
                            <span className="flex items-center gap-1 font-bold"><Crown size={10}/> {rankInfo.next.title}</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-white/50 to-white transition-all duration-1000"
                                style={{ width: `${((survivalTime - rankInfo.current.minTime) / (rankInfo.next.minTime - rankInfo.current.minTime)) * 100}%` }}
                            ></div>
                        </div>
                        <div className="text-center text-[10px] opacity-70 mt-1 font-bold">
                            再坚持 {Math.ceil(rankInfo.next.minTime - survivalTime)} 秒升级！加油！
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className={`relative z-10 text-base ${subTextColor} mb-6 font-medium px-2 leading-relaxed max-w-xs`}>
            {description}
        </div>

        <div className="grid grid-cols-2 gap-3 w-full mb-6 relative z-10 flex-shrink-0">
            <div className={`${panelBg} p-3 rounded-2xl backdrop-blur-md shadow-sm`}>
                <div className="text-[10px] opacity-80 uppercase font-bold mb-0.5">{isEndless ? '坚持时长' : '最终时间'}</div>
                <div className="text-xl font-black">{isEndless ? formatDuration(survivalTime) : gameTimeStr}</div>
            </div>
            <div className={`${panelBg} p-3 rounded-2xl backdrop-blur-md shadow-sm`}>
                <div className="text-[10px] opacity-80 uppercase font-bold mb-0.5">剩余手机</div>
                <div className={`text-xl font-black ${phoneCount === 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{phoneCount}</div>
            </div>
        </div>

        <div className="w-full space-y-3 relative z-10 flex-shrink-0">
            {PrimaryAction}
            
            <button 
                onClick={handleShare}
                disabled={isGeneratingShare}
                className="w-full bg-white/80 hover:bg-white active:scale-95 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
                {isGeneratingShare ? <RefreshCw size={18} className="animate-spin"/> : <Share2 size={18} />}
                {isGeneratingShare ? "生成中..." : "分享战绩"}
            </button>

            <button 
                onClick={onReturn}
                className="w-full bg-white/40 hover:bg-white/60 active:bg-white/70 active:scale-95 text-slate-800 font-bold py-3 px-8 rounded-xl backdrop-blur-sm border border-white/50 transition-all flex items-center justify-center gap-2 shadow-sm"
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
