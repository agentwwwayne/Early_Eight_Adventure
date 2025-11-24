import { Lane, EntityType, LevelConfig } from './types';

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
    baseSpeed: 2.0,
    spawnRateMs: 600,
    minThieves: 4,
    thiefChance: 0.04,
    blockadeChance: 0.6,
    startHour: 8,
    startMinute: 20,
    winDistance: 350,
    colorTheme: 'from-rose-400 to-rose-600',
  },
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