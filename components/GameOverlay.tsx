import React, { useState, useMemo } from 'react';
import { GameStatus, LevelConfig, Season, Rank, Language } from '../types';
import { Trophy, AlertTriangle, Play, RotateCcw, Clock, Smartphone, Bike, Star, Zap, BookOpen, X, Home, RefreshCw, Infinity, Award, ArrowRight, Pause, Flower, Leaf, Snowflake, Sun, ThumbsUp, Crown, Timer, CloudRain, Flame, Coffee, ThumbsDown, Share2, Download, Sparkles, Target, Languages } from 'lucide-react';
import { GAME_CONFIG, LEVELS, ENDLESS_LEVEL, RANKS, SEASON_STYLES, TRANSLATIONS } from '../constants';

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
  onToggleLanguage: () => void; // New
  language: Language; // New
  causeOfDeath?: string;
  gameTimeStr: string;
  phoneCount: number;
  currentLevel: LevelConfig | null;
  survivalTime: number; 
  currentSeason: Season; 
  countdown?: number; 
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

export const GameOverlay: React.FC<GameOverlayProps> = ({ 
  status, score, distance, onStart, onRetry, onReturn, onNextLevel, onPause, onResume, onToggleLanguage, language, causeOfDeath, gameTimeStr, phoneCount, currentLevel, survivalTime, currentSeason, countdown
}) => {
  
  const [showRules, setShowRules] = useState(false);
  const [shareImg, setShareImg] = useState<string | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  const t = TRANSLATIONS[language]; // Translation helper

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

  // ... (getSeasonPauseTheme, renderSeasonalDecor remain same, just omitted for brevity in thought process but included in file output) ...
  const getSeasonPauseTheme = (season: Season) => {
      // Same logic as before
      switch (season) {
          case Season.SPRING: return { bg: 'from-pink-50/95 to-emerald-50/95', border: 'border-emerald-200', iconColor: 'text-emerald-500', btnPrimary: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'};
          case Season.SUMMER: return { bg: 'from-yellow-50/95 to-sky-50/95', border: 'border-lime-300', iconColor: 'text-lime-600', btnPrimary: 'bg-lime-500 hover:bg-lime-600 shadow-lime-200'};
          case Season.AUTUMN: return { bg: 'from-orange-50/95 to-amber-50/95', border: 'border-orange-200', iconColor: 'text-orange-500', btnPrimary: 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'};
          case Season.WINTER: return { bg: 'from-slate-50/95 to-blue-50/95', border: 'border-blue-200', iconColor: 'text-sky-500', btnPrimary: 'bg-sky-500 hover:bg-sky-600 shadow-sky-200'};
          default: return { bg: 'from-white/95 to-slate-50/95', border: 'border-slate-200', iconColor: 'text-slate-500', btnPrimary: 'bg-slate-800 hover:bg-slate-700 shadow-slate-200'};
      }
  };

  const renderSeasonalDecor = (season: Season) => {
     // Same logic as before
     const items = [];
      const count = 5;
      for(let i = 0; i < count; i++) {
          let Decor = null;
          let animClass = '';
          const style = { top: `${Math.random() * 80 + 10}%`, left: `${Math.random() * 80 + 10}%`, animationDelay: `${i * 0.5}s`, opacity: 0.6 };
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
              if (i < RANKS.length - 1) nextRank = RANKS[i + 1];
              else nextRank = null;
          }
      }
      return { current: currentRank, next: nextRank };
  };
  
  // ... (renderResultParticles, getEndlessTheme same as before) ...
  const renderResultParticles = (type: 'win' | 'fail' | 'rank_high' | 'rank_low') => {
       if (type === 'fail' || type === 'rank_low') {
           return ( <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}> <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply"></div> {[...Array(30)].map((_,i) => ( <div key={i} className="absolute top-[-20%] w-0.5 h-6 bg-blue-500 rounded-full" style={{ left: `${Math.random()*100}%`, animation: `rain 0.8s linear infinite`, animationDelay: `${Math.random()}s`, opacity: 0.6 }}></div> ))} <style>{` @keyframes rain { 0% { transform: translateY(-20px); } 100% { transform: translateY(100vh); } } `}</style> </div> );
      } else {
           return ( <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}> {[...Array(50)].map((_,i) => ( <div key={i} className={`absolute top-[-10%] w-2 h-4 ${['bg-yellow-400','bg-rose-400','bg-emerald-400','bg-purple-400'][i%4]} rotate-45`} style={{ left: `${Math.random()*100}%`, animation: `confetti ${2+Math.random()*2}s linear infinite`, animationDelay: `${Math.random()*2}s`, opacity: 0.9 }}></div> ))} <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div> <style>{` @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(100vh) rotate(720deg); } } `}</style> </div> );
      }
  };

  const getEndlessTheme = (seconds: number) => {
      // Same logic...
      if (seconds < 20) return { bg: "from-slate-800 to-slate-900", iconBg: "bg-slate-600", MainIcon: CloudRain, textColor: "text-slate-200", subTextColor: "text-slate-400", emote: "⛈️", anim: "animate-none", panelBg: "bg-white/10 border-white/10 text-white", particleType: 'rank_low' as const };
      if (seconds < 40) return { bg: "from-emerald-50 to-teal-100", iconBg: "bg-emerald-400", MainIcon: Coffee, textColor: "text-emerald-800", subTextColor: "text-emerald-700", emote: "🍵", anim: "animate-bounce", panelBg: "bg-white/60 border-white/40 text-slate-800", particleType: 'rank_low' as const };
      if (seconds < 60) return { bg: "from-blue-50 to-indigo-100", iconBg: "bg-blue-500", MainIcon: Smartphone, textColor: "text-blue-900", subTextColor: "text-blue-700", emote: "📱", anim: "animate-pulse", panelBg: "bg-white/60 border-white/40 text-slate-800", particleType: 'rank_low' as const };
      if (seconds < 90) return { bg: "from-orange-50 to-amber-100", iconBg: "bg-orange-500", MainIcon: Zap, textColor: "text-orange-900", subTextColor: "text-orange-700", emote: "⚡", anim: "animate-[shake_0.5s_ease-in-out]", panelBg: "bg-white/60 border-white/40 text-slate-800", particleType: 'rank_high' as const };
      if (seconds < 120) return { bg: "from-rose-100 to-pink-200", iconBg: "bg-rose-500", MainIcon: Award, textColor: "text-rose-900", subTextColor: "text-rose-700", emote: "🎖️", anim: "animate-bounce", panelBg: "bg-white/60 border-white/40 text-slate-800", particleType: 'rank_high' as const };
      if (seconds < 150) return { bg: "from-violet-900 to-fuchsia-900", iconBg: "bg-fuchsia-500", MainIcon: Flame, textColor: "text-fuchsia-100", subTextColor: "text-fuchsia-200", emote: "🏎️", anim: "animate-spin-slow", panelBg: "bg-white/10 border-white/20 text-white", particleType: 'rank_high' as const };
      return { bg: "from-amber-100 via-yellow-100 to-orange-100", iconBg: "bg-yellow-500", MainIcon: Crown, textColor: "text-amber-900", subTextColor: "text-amber-700", emote: "👑", anim: "animate-[ping_1s_infinite]", panelBg: "bg-white/60 border-white/40 text-slate-800", particleType: 'rank_high' as const };
  };

  const failMessage = useMemo(() => {
      if (status === GameStatus.GAME_OVER) {
           // Simply return the cause for now or a translated encouragement
           return t.fail_encouragement;
      }
      return null;
  }, [status, progress, currentLevel, causeOfDeath, language]);

  const handleShare = async () => {
      setIsGeneratingShare(true);
      setTimeout(async () => {
          const element = document.getElementById('share-card');
          if (element && typeof html2canvas !== 'undefined') {
              try {
                  const canvas = await html2canvas(element, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true });
                  const data = canvas.toDataURL('image/png');
                  setShareImg(data);
              } catch (e) { console.error("Screenshot failed", e); }
          }
          setIsGeneratingShare(false);
      }, 200);
  };

  if (status === GameStatus.STORY_INTRO) return null;

  if (status === GameStatus.PLAYING) {
    return (
      <div className="absolute top-0 left-0 right-0 p-4 z-20 pointer-events-none">
        <div className="flex justify-between items-start mb-3">
            <div className="flex gap-2 items-center">
                <button onClick={onPause} className="pointer-events-auto bg-white/90 backdrop-blur-md p-2 rounded-xl border-2 border-slate-100 shadow-md text-slate-600 active:scale-90 transition-transform hover:bg-white"><Pause size={20} fill="currentColor" /></button>
                <div className="bg-white/90 backdrop-blur-md text-slate-700 px-3 py-1.5 rounded-xl border-2 border-slate-100 shadow-md flex items-center gap-2"><Clock size={16} className="text-sky-500" /><span className="font-bold font-mono text-lg">{currentLevel?.isEndless ? formatDuration(survivalTime) : gameTimeStr}</span></div>
            </div>
            <div className={`bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold border shadow-sm hidden sm:block ${currentLevel?.id === 'HARD' ? 'text-rose-600 border-rose-200' : 'text-slate-600 border-slate-200'}`}>
                {/* Look up level name from translations if possible, fallback to config name */}
                {TRANSLATIONS[language][`level_${currentLevel?.id}_name`] || currentLevel?.name}
            </div>
            <div className={`bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border-2 shadow-md flex items-center gap-2 transition-colors ${phoneCount === 1 ? 'border-rose-200 bg-rose-50' : 'border-emerald-100'}`}><Smartphone size={18} className={phoneCount === 1 ? "text-rose-500 animate-pulse" : "text-emerald-500"} /><span className={`font-black text-lg ${phoneCount === 1 ? "text-rose-600" : "text-emerald-600"}`}>x{phoneCount}</span></div>
        </div>
        {!currentLevel?.isEndless && (
            <div className="relative mt-2">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1"><span>{formatTime(startH, startM)}</span><span>{formatTime(8, 30)}</span></div>
                <div className="w-full bg-slate-200/80 h-4 rounded-full overflow-hidden border border-white/60 shadow-inner backdrop-blur-sm relative"><div className="h-full bg-gradient-to-r from-sky-400 via-blue-400 to-emerald-400" style={{ width: `${progress}%` }} /></div>
            </div>
        )}
      </div>
    );
  }

  if (status === GameStatus.PAUSED) {
      const pauseTheme = getSeasonPauseTheme(currentSeason);
      return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-sm p-6 animate-in fade-in duration-200">
            <div className={`bg-gradient-to-b ${pauseTheme.bg} rounded-3xl w-full max-w-xs p-6 shadow-2xl border-2 ${pauseTheme.border} relative overflow-hidden`}>
                <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/40 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-white/40 rounded-full blur-2xl"></div>
                {renderSeasonalDecor(currentSeason)}
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-slate-800 text-center mb-2 flex items-center justify-center gap-2"><Pause size={24} className={pauseTheme.iconColor} fill="currentColor"/> {t.paused}</h2>
                    <p className="text-xs text-slate-500 text-center mb-8 font-medium">{t.paused_hint}</p>
                    <div className="space-y-3">
                        <button onClick={onResume} className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${pauseTheme.btnPrimary}`}><Play size={20} fill="currentColor"/> {t.btn_resume}</button>
                        <button onClick={onRetry} className="w-full bg-white/60 hover:bg-white/80 active:scale-95 text-slate-700 font-bold py-3.5 rounded-xl border border-white/50 shadow-sm transition-all flex items-center justify-center gap-2"><RefreshCw size={18} /> {t.btn_restart}</button>
                        <button onClick={onReturn} className="w-full bg-white/40 hover:bg-white/60 active:scale-95 text-slate-600 font-bold py-3.5 rounded-xl border border-white/30 transition-all flex items-center justify-center gap-2"><Home size={18} /> {t.btn_quit}</button>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  if (status === GameStatus.START) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-pink-100 to-white z-50 flex flex-col items-center justify-start text-slate-800 px-4 py-8 overflow-y-auto no-scrollbar overflow-x-hidden">
        {/* Decor */}
        <div className="absolute top-[-10%] left-[-20%] w-64 h-64 bg-white/50 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite] pointer-events-none"></div>
        <div className="absolute top-[15%] right-[-10%] w-40 h-40 bg-yellow-200/40 rounded-full blur-2xl animate-[bounce_5s_infinite] delay-700 pointer-events-none"></div>
        <div className="absolute bottom-[15%] left-[5%] w-32 h-32 bg-pink-300/30 rounded-full blur-xl animate-[pulse_3s_ease-in-out_infinite] pointer-events-none"></div>
        <div className="absolute top-[40%] left-[30%] w-48 h-48 bg-sky-300/10 rounded-full blur-2xl animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none"></div>

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <button onClick={() => setShowRules(true)} className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-slate-200 text-slate-600 hover:bg-white hover:text-sky-500 active:scale-90 active:bg-slate-100 transition-all"><BookOpen size={20} /></button>
            <button onClick={onToggleLanguage} className="p-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-slate-200 text-slate-600 hover:bg-white hover:text-sky-500 active:scale-90 active:bg-slate-100 transition-all flex items-center justify-center text-xs font-bold h-9 w-9"><Languages size={20} /></button>
        </div>

        <div className="mb-4 mt-6 relative flex-shrink-0 z-10">
            <div className="absolute inset-0 bg-white/60 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-white p-4 rounded-3xl shadow-xl ring-4 ring-white/60 transform hover:scale-105 transition-transform duration-300"><Bike size={56} className="text-sky-500" /></div>
        </div>

        <h1 className="text-3xl font-black mb-1 text-slate-800 tracking-tight text-center drop-shadow-sm flex-shrink-0 z-10">{t.game_title}</h1>
        
        <div className="flex flex-col items-center gap-2 mb-6 flex-shrink-0 z-10">
            <p className="text-xs text-slate-600 font-medium flex items-center gap-1 bg-white/60 px-3 py-1 rounded-full border border-white/50 backdrop-blur-sm shadow-sm"><Zap size={12} className="text-amber-500 fill-amber-500"/> {t.goal_hint}</p>
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1 bg-rose-50/90 px-3 py-1 rounded-full border border-rose-200 shadow-sm animate-pulse"><AlertTriangle size={12} className="text-rose-500"/> {t.thief_warning}</p>
        </div>
        
        <div className="w-full max-w-xs flex flex-col gap-4 mb-6 flex-shrink-0 z-10">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{t.select_level}</div>
          {LEVELS.map((level, index) => {
             const theme = getThemeColors(level.id);
             return (
             <button key={level.id} onClick={() => onStart(level)} className="w-full group relative bg-white/90 backdrop-blur-sm rounded-2xl p-1 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-95 active:shadow-inner transition-all duration-200 overflow-visible flex-shrink-0">
                {index === 0 && <div className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm z-20">新手推荐 ✨</div>}
                <div className={`relative w-full rounded-xl p-3 overflow-hidden border group-active:bg-slate-50 transition-colors ${theme.bg} ${theme.border}`}>
                    <div className="flex justify-between items-center relative z-10">
                        <div className="text-left">
                            <div className="font-black text-lg text-slate-800 flex items-center gap-2">{TRANSLATIONS[language][`level_${level.id}_name`]}</div>
                            <div className="text-xs font-mono text-slate-500 mt-0.5 flex items-center gap-1"><Clock size={10} /> {formatTime(level.startHour, level.startMinute)} {t.depart}</div>
                        </div>
                        <div className={`p-2 rounded-full bg-white shadow-sm group-hover:shadow-md transition-all ${theme.icon}`}><Play size={20} fill="currentColor" className="ml-0.5"/></div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 text-left leading-tight">{TRANSLATIONS[language][`level_${level.id}_desc`]}</p>
                </div>
             </button>
             );
          })}
        </div>

        <div className="w-full max-w-xs flex-shrink-0 z-10 mb-8 relative group">
             <div className="absolute -top-8 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full rounded-br-none animate-bounce z-20 shadow-sm">{t.endless_hint_bubble}</div>
             <button onClick={() => onStart(ENDLESS_LEVEL)} className="w-full group relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-[2px] shadow-lg hover:shadow-purple-300/50 hover:-translate-y-1 active:scale-95 transition-all">
                <div className="absolute -top-3 left-4 bg-yellow-400 text-purple-900 text-[10px] font-black px-3 py-0.5 rounded-full shadow-sm z-20">{t.challenge_limit}</div>
                <div className="bg-white/10 backdrop-blur-md w-full h-full rounded-2xl p-4 flex items-center justify-between">
                    <div className="text-left text-white"><div className="font-black text-lg flex items-center gap-2"><Infinity size={20} /> {t.level_ENDLESS_name}</div><p className="text-xs text-purple-100/80">{t.endless_desc}</p></div>
                    <div className="p-2 rounded-full bg-white/20 text-white"><Play size={20} fill="currentColor" className="ml-0.5"/></div>
                </div>
             </button>
        </div>

        {showRules && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-sm relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center"><h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><BookOpen size={20} className="text-sky-500"/> {t.rules_title}</h2><button onClick={() => setShowRules(false)} className="p-1 bg-slate-200 rounded-full text-slate-500 hover:bg-slate-300 active:scale-90 transition-all"><X size={20} /></button></div>
                    <div className="p-6 space-y-5">
                        <div className="flex gap-4 items-start"><div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0 text-sky-600 font-bold">1</div><div><h3 className="font-bold text-slate-800 text-sm mb-1">{t.rule_1_title}</h3><p className="text-xs text-slate-500 leading-relaxed">{t.rule_1_desc}</p></div></div>
                        <div className="flex gap-4 items-start"><div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 font-bold">2</div><div><h3 className="font-bold text-slate-800 text-sm mb-1">{t.rule_2_title}</h3><p className="text-xs text-slate-500 leading-relaxed">{t.rule_2_desc}</p></div></div>
                        <div className="flex gap-4 items-start"><div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600 font-bold">3</div><div><h3 className="font-bold text-slate-800 text-sm mb-1">{t.rule_3_title}</h3><p className="text-xs text-slate-500 leading-relaxed">{t.rule_3_desc}</p></div></div>
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50"><button onClick={() => setShowRules(false)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 active:bg-slate-700 transition-all">{t.btn_start}</button></div>
                </div>
            </div>
        )}
      </div>
    );
  }

  // --- RESULT SCREEN ---
  if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
    const isWin = status === GameStatus.VICTORY;
    const isEndless = currentLevel?.isEndless;
    
    let title = t.fail_crash;
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

    const isStolen = causeOfDeath?.includes("偷") || causeOfDeath?.includes("stolen");

    if (isWin) {
      title = t.win_title;
      bgTheme = "bg-gradient-to-br from-emerald-100 via-yellow-100 to-orange-100"; 
      iconBg = "bg-yellow-400";
      MainIcon = Trophy;
      textColor = "text-emerald-800";
      subTextColor = "text-emerald-700";
      showEmote = <div className="absolute -top-6 right-0 text-5xl animate-bounce delay-100">🥳</div>;
      particleType = 'win';
      const extraPhones = phoneCount - 1;
      description = extraPhones > 0 ? t.win_desc_1.replace('{n}', extraPhones.toString()) : t.win_desc_2;
    } else if (isEndless) {
        const rankInfo = getRankInfo(survivalTime);
        const currentRankData = getRank(survivalTime);
        const theme = getEndlessTheme(survivalTime);
        
        title = survivalTime < 75 ? t.endless_finish : t.endless_success;
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
                    {TRANSLATIONS[language][currentRankData.messageKey]}
                </span>
            </>
        );
        
    } else {
        description = failMessage; 
        particleType = 'fail';
        if (isStolen) {
            title = t.fail_stolen;
            bgTheme = "bg-gradient-to-br from-indigo-100 to-slate-200"; 
            iconBg = "bg-indigo-500";
            MainIcon = Smartphone; 
            textColor = "text-indigo-900";
            subTextColor = "text-slate-600";
            showEmote = <div className="absolute -top-4 -right-4 text-5xl animate-bounce delay-100">😭</div>;
        } else {
             // Crash
            title = t.fail_crash;
            bgTheme = "bg-gradient-to-br from-red-100 to-orange-200"; 
            iconBg = "bg-red-500";
            MainIcon = AlertTriangle;
            textColor = "text-red-900";
            subTextColor = "text-red-700";
            overlayAnim += " animate-[shake_0.5s_ease-in-out]"; 
            showEmote = <div className="absolute -top-4 -left-4 text-5xl animate-spin-slow">😵‍💫</div>;
        }
    }

    let PrimaryAction = null;
    if (isWin) {
        if (currentLevel?.id === 'EASY' || currentLevel?.id === 'NORMAL') {
            PrimaryAction = (
                <button onClick={onNextLevel} className="w-full group relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 active:shadow-sm text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-emerald-900/20 transform transition-all flex items-center justify-center gap-2">
                <span className="text-xl drop-shadow-sm">{t.btn_next_level}</span><ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
            );
        } else {
            PrimaryAction = (
                <button onClick={() => onStart(ENDLESS_LEVEL)} className="w-full group relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 active:shadow-sm text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-indigo-900/20 transform transition-all flex items-center justify-center gap-2">
                <Infinity size={24} className="animate-pulse" /><span className="text-xl drop-shadow-sm">{t.btn_try_endless}</span>
                </button>
            );
        }
    } else {
        PrimaryAction = (
            <button onClick={onRetry} className="w-full group relative bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 active:shadow-sm text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-orange-900/20 transform transition-all flex items-center justify-center gap-2">
            <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" /><span className="text-xl drop-shadow-sm">{t.btn_retry}</span>
            </button>
        );
    }
    
    const rankInfo = isEndless ? getRankInfo(survivalTime) : null;
    const currentRankData = isEndless ? getRank(survivalTime) : null;
    const rankColorClass = isEndless ? getEndlessTheme(survivalTime).textColor : 'text-purple-600';

    const ShareCard = () => (
        <div id="share-card" className="absolute top-[-9999px] left-[-9999px] w-[500px] h-[900px] flex flex-col items-center p-0 overflow-hidden bg-white font-sans">
             <div className={`w-full h-[60%] relative flex flex-col items-center justify-center p-10 text-center ${bgTheme.replace('bg-gradient-to-br', 'bg-gradient-to-b')}`}>
                 <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle,rgba(255,255,255,0.8)_2px,transparent_2px)] bg-[length:20px_20px]"></div>
                 <div className={`relative z-10 p-10 rounded-full ${iconBg} text-white shadow-2xl mb-6 border-8 border-white/30`}>
                     <MainIcon size={96} strokeWidth={2} />
                 </div>
                 <div className={`relative z-10 text-5xl font-black text-white tracking-tight drop-shadow-md mb-2 leading-tight`}>{title}</div>
                 {isEndless && currentRankData && (
                     <div className="relative z-10 bg-white/20 backdrop-blur-md px-8 py-2 rounded-full border border-white/40 mt-4">
                         <div className="text-2xl font-bold text-white tracking-widest uppercase shadow-sm">{TRANSLATIONS[language][currentRankData.titleKey]}</div>
                     </div>
                 )}
             </div>
             <div className="w-full h-[40%] bg-white flex flex-col p-8 relative">
                 <div className="absolute top-[-10px] left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0 100%, 5% 0, 10% 100%, 15% 0, 20% 100%, 25% 0, 30% 100%, 35% 0, 40% 100%, 45% 0, 50% 100%, 55% 0, 60% 100%, 65% 0, 70% 100%, 75% 0, 80% 100%, 85% 0, 90% 100%, 95% 0, 100% 100%)' }}></div>
                 <div className="flex-1 flex flex-col justify-center gap-6">
                     <div className="flex justify-between items-center border-b-2 border-dashed border-slate-100 pb-6">
                         <div className="text-left">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{isEndless ? t.share_stat_survival : t.share_stat_time}</div>
                             <div className="text-6xl font-black text-slate-800 leading-none tracking-tighter">{isEndless ? formatDuration(survivalTime) : gameTimeStr}</div>
                         </div>
                         <div className="text-right">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.collect_phone}</div>
                             <div className="text-4xl font-black text-slate-800 leading-none flex items-center justify-end gap-2">{phoneCount} <Smartphone size={28} className="text-slate-300" /></div>
                         </div>
                     </div>
                     <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <div className="w-20 h-20 bg-white p-1 rounded-lg flex-shrink-0">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://woof-woof-early-eight-adventure.vercel.app/" alt="QR Code" className="w-full h-full object-contain mix-blend-multiply" crossOrigin="anonymous"/>
                         </div>
                         <div className="text-left">
                             <div className="text-xl font-black text-slate-800 leading-none mb-1">{t.game_title}</div>
                             <div className="text-xs text-slate-500 leading-tight">{t.scan_to_play}</div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );

    return (
      <div className={`absolute inset-0 ${bgTheme} z-50 flex flex-col items-center justify-start md:justify-center p-6 text-center ${overlayAnim} overflow-y-auto no-scrollbar`}>
        <ShareCard />
        {shareImg && (
            <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in">
                <div className="relative bg-white p-2 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95">
                    <button onClick={() => setShareImg(null)} className="absolute -top-3 -right-3 bg-slate-800 text-white p-2 rounded-full shadow-md hover:bg-slate-700"><X size={16}/></button>
                    <img src={shareImg} alt="Result" className="w-full h-auto rounded-xl border border-slate-100" />
                    <div className="text-center mt-4 mb-2 text-slate-600 text-sm font-bold flex items-center justify-center gap-2"><Smartphone size={16}/> {t.share_modal_hint}</div>
                </div>
            </div>
        )}

        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>{renderResultParticles(particleType)}</div>
        
        <div className="relative z-10 w-full max-w-xs flex flex-col items-center mt-auto mb-auto pt-4 pb-4">
             <div className="mb-4 relative flex-shrink-0">
                <div className={`p-5 rounded-full ring-8 ring-white/50 shadow-xl ${iconBg} ${isWin || (isEndless && survivalTime > 75) ? 'animate-bounce' : 'animate-pulse'}`}><MainIcon size={56} className="text-white drop-shadow-md" /></div>
                {showEmote}
            </div>
            <h2 className={`relative z-10 text-3xl font-black mb-3 drop-shadow-sm tracking-tight ${textColor}`}>{title}</h2>
            
            {isEndless && currentRankData && (
                <div className="w-full mb-4 space-y-2 relative z-10 flex-shrink-0">
                    <div className={`${panelBg} px-6 py-3 rounded-2xl backdrop-blur-md shadow-sm flex flex-col items-center transition-all duration-500`}>
                        <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest block mb-1">{t.rank_current}</span>
                        <div className={`text-2xl font-black drop-shadow-sm ${rankColorClass}`}>{TRANSLATIONS[language][currentRankData.titleKey]}</div>
                    </div>
                    {rankInfo && rankInfo.next && (
                        <div className="bg-white/40 p-3 rounded-xl border border-white/30 backdrop-blur-sm animate-in slide-in-from-bottom-2 delay-300">
                            <div className="flex justify-between items-center text-[10px] font-medium opacity-80 mb-1">
                                <span className="flex items-center gap-1"><Crown size={10}/> {TRANSLATIONS[language][rankInfo.current.titleKey]}</span>
                                <span className="flex items-center gap-1 font-bold"><Crown size={10}/> {TRANSLATIONS[language][rankInfo.next.titleKey]}</span>
                            </div>
                            <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-white/50 to-white transition-all duration-1000" style={{ width: `${((survivalTime - rankInfo.current.minTime) / (rankInfo.next.minTime - rankInfo.current.minTime)) * 100}%` }}></div>
                            </div>
                            <div className="text-center text-[10px] opacity-70 mt-1 font-bold">{t.next_rank_gap.replace('{n}', Math.ceil(rankInfo.next.minTime - survivalTime).toString())}</div>
                        </div>
                    )}
                </div>
            )}

            <div className={`relative z-10 text-base ${subTextColor} mb-6 font-medium px-2 leading-relaxed max-w-xs`}>{description}</div>

            <div className="grid grid-cols-2 gap-3 w-full mb-6 relative z-10 flex-shrink-0">
                <div className={`${panelBg} p-3 rounded-2xl backdrop-blur-md shadow-sm`}>
                    <div className="text-[10px] opacity-80 uppercase font-bold mb-0.5">{isEndless ? t.share_stat_survival : t.share_stat_time}</div>
                    <div className="text-xl font-black">{isEndless ? formatDuration(survivalTime) : gameTimeStr}</div>
                </div>
                <div className={`${panelBg} p-3 rounded-2xl backdrop-blur-md shadow-sm`}>
                    <div className="text-[10px] opacity-80 uppercase font-bold mb-0.5">{t.collect_phone}</div>
                    <div className={`text-xl font-black ${phoneCount === 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{phoneCount}</div>
                </div>
            </div>

            <div className="w-full space-y-3 relative z-10 flex-shrink-0">
                {PrimaryAction}
                <button onClick={handleShare} disabled={isGeneratingShare} className="w-full bg-white/80 hover:bg-white active:scale-95 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">{isGeneratingShare ? <RefreshCw size={18} className="animate-spin"/> : <Share2 size={18} />}{isGeneratingShare ? t.btn_generating : t.btn_share}</button>
                <button onClick={onReturn} className="w-full bg-white/40 hover:bg-white/60 active:bg-white/70 active:scale-95 text-slate-800 font-bold py-3 px-8 rounded-xl backdrop-blur-sm border border-white/50 transition-all flex items-center justify-center gap-2 shadow-sm"><Home size={18} /> {t.btn_return}</button>
            </div>
        </div>
      </div>
    );
  }

  return null;
};
