import { Lane, EntityType, LevelConfig, Rank, Season, SeasonStyle } from './types';

export const GAME_CONFIG = {
  LANES: 5,
  LANE_WIDTH_PERCENT: 20, 
  PLAYER_FIXED_Y: 80, 
  PLAYER_MIN_Y: 20, 
  PLAYER_MAX_Y: 90, 
  PLAYER_Y_STEP: 10, 
  FPS: 60,
  INPUT_COOLDOWN_MS: 100, 
  END_HOUR: 8,
  END_MINUTE: 30,
  PLAYER_WIDTH: 10,  
  PLAYER_HEIGHT: 10, 
  WIN_DISTANCE: 300,
};

export const SEASONS_ORDER = [Season.SPRING, Season.SUMMER, Season.AUTUMN, Season.WINTER];

export const SEASON_STYLES: Record<Season, SeasonStyle> = {
    [Season.SPRING]: {
        roadColor: 'bg-slate-200',
        borderColor: 'bg-emerald-300', // Fresh grass
        accentColor: 'border-emerald-400',
        laneOpacity: 0.6,
        carPalette: ['#f9a8d4', '#86efac', '#fde047'], // Pastel Pink, Green, Yellow
        busPalette: ['#fdba74', '#67e8f9'], // Pastel Orange, Cyan
    },
    [Season.SUMMER]: {
        roadColor: 'bg-stone-300', // Hot asphalt
        borderColor: 'bg-lime-400', // Vibrant grass
        accentColor: 'border-lime-500',
        laneOpacity: 0.7,
        carPalette: ['#ef4444', '#3b82f6', '#eab308'], // Vivid Red, Blue, Yellow
        busPalette: ['#f97316', '#06b6d4'], // Vivid Orange, Cyan
    },
    [Season.AUTUMN]: {
        roadColor: 'bg-orange-100/50', // Warm tone road
        borderColor: 'bg-amber-600', // Fallen leaves
        accentColor: 'border-amber-700',
        laneOpacity: 0.5,
        carPalette: ['#78350f', '#b45309', '#991b1b'], // Brown, Amber, Dark Red
        busPalette: ['#ea580c', '#ca8a04'], // Burnt Orange, Dark Yellow
    },
    [Season.WINTER]: {
        roadColor: 'bg-slate-300', // Cold road
        borderColor: 'bg-slate-100', // Snow
        accentColor: 'border-blue-200',
        laneOpacity: 0.4,
        carPalette: ['#334155', '#475569', '#64748b'], // Cool Greys/Blues
        busPalette: ['#94a3b8', '#cbd5e1'], // Light Greys
    },
};

// --- Level Definitions ---
export const LEVELS: LevelConfig[] = [
  {
    id: 'EASY',
    name: '悠闲实习生',
    description: '8:00 出发，路况良好，慢慢骑不着急。',
    baseSpeed: 1.3,
    spawnRateMs: 1000,
    minThieves: 2,
    thiefChance: 0.015,
    blockadeChance: 0.2,
    startHour: 8,
    startMinute: 0,
    winDistance: 250,
    colorTheme: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'NORMAL',
    name: '资深打工人',
    description: '8:10 出发，稍微有点晚，需要加速超车！',
    baseSpeed: 1.6,
    spawnRateMs: 800,
    minThieves: 3,
    thiefChance: 0.025,
    blockadeChance: 0.4,
    startHour: 8,
    startMinute: 10,
    winDistance: 300,
    colorTheme: 'from-blue-400 to-blue-600',
  },
  {
    id: 'HARD',
    name: '极限踩点王',
    description: '8:20 出发！全速冲刺！小偷和堵车都别挡道！',
    baseSpeed: 1.9,
    spawnRateMs: 700,
    minThieves: 3,
    thiefChance: 0.035,
    blockadeChance: 0.55,
    startHour: 8,
    startMinute: 20,
    winDistance: 350,
    colorTheme: 'from-rose-400 to-rose-600',
  },
];

export const ENDLESS_LEVEL: LevelConfig = {
    id: 'ENDLESS',
    name: '无尽摸鱼地狱',
    description: '没有尽头，看看你能坚持多久！',
    // Updated Base Stats to match NORMAL difficulty
    baseSpeed: 1.6, 
    spawnRateMs: 800, 
    minThieves: 999, // Always spawn
    thiefChance: 0.025,
    blockadeChance: 0.4,
    startHour: 0,
    startMinute: 0,
    winDistance: 999999,
    colorTheme: 'from-purple-500 to-indigo-600',
    isEndless: true,
};

// Ranks based on survival seconds
export const RANKS: Rank[] = [
    { minTime: 0, title: '早起困难户', message: '刚出门就倒下了...' },
    { minTime: 20, title: '悠闲实习生', message: '虽然迟到了，但心态很好。' },
    { minTime: 45, title: '资深打工人', message: '这种程度的早高峰已经是家常便饭。' },
    { minTime: 75, title: '极限踩点王', message: '只要我骑得够快，迟到就追不上我！' },
    { minTime: 100, title: '全勤奖猎人', message: '风里雨里，公司等你！' },
    { minTime: 125, title: '秋名山车神', message: '连小偷都看不清你的车尾灯。' },
    { minTime: 150, title: '时间管理大师', message: '你已经超越了时间的概念。' },
];

export const ENTITY_CONFIG: Record<EntityType, { width: number; height: number; speed: number; color: string; score: number }> = {
  [EntityType.CAR]: { width: 12, height: 10, speed: 0.3, color: 'bg-sky-200', score: 0 },
  [EntityType.BUS]: { width: 14, height: 18, speed: 0.2, color: 'bg-orange-200', score: 0 },
  [EntityType.THIEF]: { width: 10, height: 10, speed: 0.04, color: 'bg-rose-300', score: 0 }, 
  [EntityType.COIN]: { width: 8, height: 6, speed: 0, color: 'bg-yellow-200', score: 50 },
  [EntityType.SHIELD]: { width: 10, height: 8, speed: 0, color: 'bg-cyan-200', score: 0 },
  [EntityType.SLOW_MO]: { width: 10, height: 8, speed: 0, color: 'bg-purple-200', score: 0 },
};

export const getLaneCenter = (lane: number): number => {
  return 10 + (lane * 20);
};
