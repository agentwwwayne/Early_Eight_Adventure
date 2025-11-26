export enum GameStatus {
  START = 'START',
  STORY_INTRO = 'STORY_INTRO',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export enum EntityType {
  CAR = 'CAR', 
  BUS = 'BUS', 
  THIEF = 'THIEF', 
  COIN = 'COIN', 
  SHIELD = 'SHIELD', 
  SLOW_MO = 'SLOW_MO', 
}

export enum Lane {
  L1 = 0,
  L2 = 1,
  L3 = 2,
  L4 = 3,
  L5 = 4,
}

export enum Season {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER',
}

export type Language = 'zh' | 'en';

export interface Entity {
  id: number;
  type: EntityType;
  lane: number; 
  y: number; 
  speed: number; 
  width: number; 
  height: number; 
  color?: string;
  isTargeting?: boolean; 
  directionX?: number; 
}

export interface PlayerState {
  lane: number;
  y: number; 
  hasShield: boolean;
  speedMultiplier: number;
  isInvulnerable: boolean;
  phoneCount: number; 
}

export interface GameConfig {
  totalDistance: number;
  baseSpeed: number;
}

export interface LevelConfig {
  id: string;
  // Name and Desc will be looked up via translation key based on ID
  baseSpeed: number;        
  spawnRateMs: number;      
  minThieves: number;       
  thiefChance: number;      
  blockadeChance: number;   
  startHour: number;
  startMinute: number;
  winDistance: number; 
  colorTheme: string;       
  isEndless?: boolean;      
}

export interface Rank {
    minTime: number;
    titleKey: string; // Changed from literal title to translation key
    messageKey: string; // Changed from literal message to translation key
}

export interface SeasonStyle {
    roadColor: string;
    borderColor: string;
    accentColor: string;
    laneOpacity: number;
    carPalette: string[];
    busPalette: string[];
}
