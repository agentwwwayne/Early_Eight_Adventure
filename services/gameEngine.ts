import { Entity, EntityType, GameConfig, Lane, PlayerState, LevelConfig } from '../types';
import { ENTITY_CONFIG, GAME_CONFIG, getLaneCenter } from '../constants';

export const checkCollision = (player: PlayerState, entity: Entity): boolean => {
  // --- Bounding Box Collision (Visual Accuracy) ---
  const playerX = getLaneCenter(player.lane); 
  const playerY = player.y; 
  const playerHalfW = GAME_CONFIG.PLAYER_WIDTH / 2;
  const playerHalfH = (GAME_CONFIG.PLAYER_HEIGHT * 0.7) / 2; 

  const entityConfig = ENTITY_CONFIG[entity.type];
  const entityX = getLaneCenter(entity.lane); 
  const entityY = entity.y; 
  const entityHalfW = entityConfig.width / 2;
  const entityHalfH = (entityConfig.height * 0.8) / 2; 

  const diffX = Math.abs(playerX - entityX);
  const diffY = Math.abs(playerY - entityY);

  const overlapX = diffX < (playerHalfW + entityHalfW);
  const overlapY = diffY < (playerHalfH + entityHalfH);

  return overlapX && overlapY;
};

// Helper to check if a specific spot is free
const isLaneFree = (entities: Entity[], lane: number, yThreshold: number = 15) => {
    return !entities.some(e => Math.abs(e.lane - lane) < 0.5 && e.y < yThreshold);
};

// Helper: Create Entity
const createEntity = (type: EntityType, lane: number, difficultyMult: number, yPos: number = -20): Entity => {
     return {
        id: Date.now() + Math.random(),
        type,
        lane,
        y: yPos, 
        speed: (ENTITY_CONFIG[type].speed + (type !== EntityType.COIN && type !== EntityType.SHIELD ? 0.05 : 0)) * (difficultyMult || 1),
        width: ENTITY_CONFIG[type].width,
        height: ENTITY_CONFIG[type].height,
        isTargeting: type === EntityType.THIEF,
    };
}

export const spawnEntity = (
  currentEntities: Entity[], 
  distanceTraveled: number, 
  playerY: number, 
  thievesSpawnedSoFar: number,
  level: LevelConfig // NEW: Accept level config
): Entity[] => {
  
  // Difficulty scaling based on distance within the level
  const progressRatio = distanceTraveled / level.winDistance;
  const difficultyMultiplier = 1 + (progressRatio * 0.2); // Speed increases up to 20%
  
  const newEntities: Entity[] = [];
  const lanes = [0, 1, 2, 3, 4];
  
  // 1. Thief Spawning Logic (Based on Level Config)
  let shouldSpawnThief = false;
  
  // Random Chance scaled by Level
  // e.g. Easy: 0.015, Hard: 0.04
  const currentThiefChance = distanceTraveled > 20 ? level.thiefChance + (progressRatio * 0.01) : 0;
  if (Math.random() < currentThiefChance) {
      shouldSpawnThief = true;
  }

  // GUARANTEE MECHANISM:
  // Distributed based on level.minThieves
  const checkPoint1 = level.winDistance * 0.33;
  const checkPoint2 = level.winDistance * 0.66;
  const checkPoint3 = level.winDistance * 0.85;

  if (distanceTraveled > checkPoint1 && thievesSpawnedSoFar < Math.ceil(level.minThieves * 0.3)) shouldSpawnThief = true;
  if (distanceTraveled > checkPoint2 && thievesSpawnedSoFar < Math.ceil(level.minThieves * 0.6)) shouldSpawnThief = true;
  if (distanceTraveled > checkPoint3 && thievesSpawnedSoFar < level.minThieves) shouldSpawnThief = true;
  
  if (shouldSpawnThief) {
      // In hard mode, higher chance of double spawn
      const doubleSpawnChance = level.id === 'HARD' ? 0.5 : (level.id === 'NORMAL' ? 0.3 : 0.1);
      const count = (Math.random() < doubleSpawnChance) ? 2 : 1;

      for (let i = 0; i < count; i++) {
        const startLeft = Math.random() > 0.5;
        const startLane = startLeft ? -1 : 5;
        const spawnY = Math.max(20, Math.min(90, playerY + (Math.random() * 50 - 25)));

        newEntities.push({
            id: Date.now() + Math.random() + i,
            type: EntityType.THIEF,
            lane: startLane, 
            y: spawnY,
            // Harder levels have faster thieves
            speed: ENTITY_CONFIG[EntityType.THIEF].speed * (1 + (level.id === 'HARD' ? 0.5 : 0.2)), 
            width: ENTITY_CONFIG[EntityType.THIEF].width,
            height: ENTITY_CONFIG[EntityType.THIEF].height,
            isTargeting: true, 
            directionX: startLeft ? 1 : -1,
        });
      }
      return newEntities;
  }

  // 2. Traffic / Items
  const rand = Math.random();
  if (rand > 0.96) {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      if (isLaneFree(currentEntities, lane)) {
        let type = EntityType.COIN;
        if (Math.random() > 0.65) type = EntityType.SHIELD; 
        newEntities.push(createEntity(type, lane, 0));
      }
      return newEntities;
  }

  // Traffic Blockades (Based on Level Config)
  // Harder levels have higher blockade chance and density
  const currentBlockadeChance = Math.min(0.7, level.blockadeChance + (progressRatio * 0.1));
  
  if (Math.random() < currentBlockadeChance) {
      let numBlockers = 2; 
      
      const r = Math.random();
      // Hard mode has chance for 3 or 4 cars
      if (level.id === 'HARD') {
          if (r > 0.6) numBlockers = 3;
          if (r > 0.9) numBlockers = 4;
      } else if (level.id === 'NORMAL') {
          if (r > 0.8) numBlockers = 3;
      }

      const shuffledLanes = [...lanes].sort(() => 0.5 - Math.random());
      const selectedLanes = shuffledLanes.slice(0, numBlockers);

      for (const lane of selectedLanes) {
         if (isLaneFree(currentEntities, lane)) {
             const isBus = Math.random() > 0.7; 
             newEntities.push(createEntity(isBus ? EntityType.BUS : EntityType.CAR, lane, difficultyMultiplier));
         }
      }
  } else {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      if (isLaneFree(currentEntities, lane)) {
           newEntities.push(createEntity(Math.random() > 0.8 ? EntityType.BUS : EntityType.CAR, lane, difficultyMultiplier));
      }
  }

  return newEntities;
};

export const updateThiefLogic = (thief: Entity, player: PlayerState, deltaTime: number): Entity => {
  if (thief.type !== EntityType.THIEF) return thief;

  const baseSpeed = thief.speed * (deltaTime / 16);
  
  if (thief.isTargeting) {
      const diff = thief.lane - player.lane;
      
      let dir = 0;
      if (diff < -0.2) dir = 1;      
      else if (diff > 0.2) dir = -1; 
      
      if (dir !== 0) {
          thief.lane += dir * baseSpeed;
          thief.directionX = dir;
      }

      const verticalSpeed = 0.02; 
      if (thief.y < player.y) thief.y += verticalSpeed;
      else if (thief.y > player.y) thief.y -= verticalSpeed;

      if (Math.abs(diff) < 0.5) {
          thief.isTargeting = false; 
          if (dir === 0) {
              thief.directionX = Math.random() > 0.5 ? 1 : -1;
          } else {
              thief.directionX = dir;
          }
      }

  } else {
      const fleeSpeed = baseSpeed * 1.5;
      if (thief.directionX) {
          thief.lane += thief.directionX * fleeSpeed;
      }
  }

  return thief;
};