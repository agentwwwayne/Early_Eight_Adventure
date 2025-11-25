export enum GameStatus {
  START = 'START',
  STORY_INTRO = 'STORY_INTRO', // New status for plot countdown
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

export enum EntityType {
  CAR = 'CAR', // Normal traffic
  BUS = 'BUS', // Large traffic
  THIEF = 'THIEF', // Enemy targeting player
  COIN = 'COIN', // Score bonus (Now represents EXTRA PHONE)
  SHIELD = 'SHIELD', // Invulnerability
  SLOW_MO = 'SLOW_MO', // Slows time
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

export interface Entity {
  id: number;
  type: EntityType;
  lane: number; // 0 to 4
  y: number; // % of screen height (0 is top, 100 is bottom)
  speed: number; // relative speed
  width: number; // relative width
  height: number; // relative height
  color?: string;
  isTargeting?: boolean; // For thieves: true = hunting, false = fleeing
  directionX?: number; // 1 = Right, -1 = Left
}

export interface PlayerState {
  lane: number;
  y: number; // fixed mostly, but can shimmy
  hasShield: boolean;
  speedMultiplier: number;
  isInvulnerable: boolean;
  phoneCount: number; // New: Track number of phones
}

export interface GameConfig {
  totalDistance: number;
  baseSpeed: number;
}

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  baseSpeed: number;        // Meters per second
  spawnRateMs: number;      // Lower is harder
  minThieves: number;       // Guarantee count
  thiefChance: number;      // Random probability
  blockadeChance: number;   // Traffic jam probability
  startHour: number;
  startMinute: number;
  winDistance: number; // For endless, this is ignored or set very high
  colorTheme: string;       // For UI styling
  isEndless?: boolean;      // Flag for endless mode
}

export interface Rank {
    minTime: number;
    title: string;
    message: string;
}

export interface SeasonStyle {
    roadColor: string;
    borderColor: string;
    accentColor: string;
    laneOpacity: number;
    carPalette: string[];
    busPalette: string[];
}
