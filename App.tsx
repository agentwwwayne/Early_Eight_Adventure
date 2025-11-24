import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStatus, Entity, PlayerState, EntityType, LevelConfig } from './types';
import { GAME_CONFIG, ENTITY_CONFIG, LEVELS } from './constants';
import { checkCollision, spawnEntity, updateThiefLogic } from './services/gameEngine';
import { Road } from './components/Road';
import { Player, GameEntity } from './components/Entities';
import { GameOverlay } from './components/GameOverlay';

const App: React.FC = () => {
  // --- State (UI Rendering) ---
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [deathReason, setDeathReason] = useState<string>('');
  const [gameTimeStr, setGameTimeStr] = useState("08:00");
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  
  const [player, setPlayer] = useState<PlayerState>({
    lane: 2, 
    y: GAME_CONFIG.PLAYER_MAX_Y - 10,
    hasShield: false,
    speedMultiplier: 1,
    isInvulnerable: false,
    phoneCount: 1, 
  });
  const [entities, setEntities] = useState<Entity[]>([]);

  // --- Refs (Game Logic Stability) ---
  const statusRef = useRef<GameStatus>(GameStatus.START);
  const playerRef = useRef<PlayerState>(player);
  const distanceRef = useRef(0);
  const currentLevelRef = useRef<LevelConfig | null>(null); // Store level in ref for loop access
  
  // Track total thieves spawned this session to ensure guarantee
  const thievesSpawnedRef = useRef(0);
  
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const lastInputTimeRef = useRef<number>(0);

  // Sync Status & Level Effect
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  const updateGameTime = useCallback((currentDist: number, level: LevelConfig) => {
    // Calculate time based on current level start/end
    // End is always 8:30 (GAME_CONFIG.END_HOUR:END_MINUTE)
    
    const startTotalMins = level.startHour * 60 + level.startMinute;
    const endTotalMins = GAME_CONFIG.END_HOUR * 60 + GAME_CONFIG.END_MINUTE;
    const totalDuration = endTotalMins - startTotalMins;

    const percentage = Math.min(1, currentDist / level.winDistance);
    const elapsedMinutes = Math.floor(totalDuration * percentage);
    
    let currentTotalMins = startTotalMins + elapsedMinutes;
    
    let hour = Math.floor(currentTotalMins / 60);
    let minute = currentTotalMins % 60;
    
    const minStr = minute < 10 ? `0${minute}` : `${minute}`;
    setGameTimeStr(`0${hour}:${minStr}`);
  }, []);

  // --- Controls ---
  const handleInput = useCallback((direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (statusRef.current !== GameStatus.PLAYING) return;

    const now = Date.now();
    // Double check cooldown here, though event listener also checks it for smoother sliding
    if (now - lastInputTimeRef.current < GAME_CONFIG.INPUT_COOLDOWN_MS) {
        return; 
    }
    lastInputTimeRef.current = now;

    setPlayer(prev => {
      let newLane = prev.lane;
      let newY = prev.y;

      if (direction === 'LEFT') newLane = Math.max(0, prev.lane - 1);
      if (direction === 'RIGHT') newLane = Math.min(4, prev.lane + 1);
      
      if (direction === 'UP') newY = Math.max(GAME_CONFIG.PLAYER_MIN_Y, prev.y - GAME_CONFIG.PLAYER_Y_STEP);
      if (direction === 'DOWN') newY = Math.min(GAME_CONFIG.PLAYER_MAX_Y, prev.y + GAME_CONFIG.PLAYER_Y_STEP);

      const newState = { ...prev, lane: newLane, y: newY };
      playerRef.current = newState; // IMPORTANT: Sync ref immediately for the loop
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') handleInput('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd') handleInput('RIGHT');
      if (e.key === 'ArrowUp' || e.key === 'w') handleInput('UP');
      if (e.key === 'ArrowDown' || e.key === 's') handleInput('DOWN');
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // --- Continuous Touch Sliding Logic ---
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => { 
        touchStartX = e.touches[0].clientX; 
        touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
        // Prevent default browser scrolling behavior to ensure game control
        if (e.cancelable) e.preventDefault();

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        
        // Calculate distance from the last anchor point
        const diffX = currentX - touchStartX;
        const diffY = currentY - touchStartY;
        
        const swipeThreshold = 30; // Pixels to move one step

        // Pre-check cooldown to allow "buffering" of movement distance
        // If we are in cooldown, we DON'T trigger and we DON'T reset the anchor.
        // This means the distance accumulates until cooldown is over.
        if (Date.now() - lastInputTimeRef.current < GAME_CONFIG.INPUT_COOLDOWN_MS) {
            return;
        }

        // Determine dominant direction
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal
            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) handleInput('RIGHT');
                else handleInput('LEFT');
                
                // Reset anchor to current position for continuous sliding
                touchStartX = currentX;
                touchStartY = currentY;
            }
        } else {
            // Vertical
            if (Math.abs(diffY) > swipeThreshold) {
                if (diffY > 0) handleInput('DOWN');
                else handleInput('UP');

                // Reset anchor
                touchStartX = currentX;
                touchStartY = currentY;
            }
        }
    };
    
    // We don't need handleTouchEnd for continuous sliding logic
    
    // Use non-passive listener to allow preventDefault
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleInput]);

  // --- Game Loop ---
  const loop = useCallback((time: number) => {
    if (statusRef.current !== GameStatus.PLAYING) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
        return;
    }
    
    const activeLevel = currentLevelRef.current;
    if (!activeLevel) {
        // Fallback or safety exit
        return; 
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // READ FROM REFS (Stable)
    const currentPlayer = playerRef.current;
    const currentDistance = distanceRef.current;

    // Use Level Base Speed
    const speed = (activeLevel.baseSpeed * currentPlayer.speedMultiplier * deltaTime) / 1000; 
    
    // Update Distance
    setDistance(prev => {
        const newDist = prev + speed * 10; 
        distanceRef.current = newDist; // Sync Ref
        updateGameTime(newDist, activeLevel);
        
        // Use Level Win Distance
        if (newDist >= activeLevel.winDistance) {
            setStatus(GameStatus.VICTORY);
            statusRef.current = GameStatus.VICTORY;
        }
        return newDist;
    });
    setScore(prev => prev + speed);

    // Spawn Logic
    spawnTimerRef.current += deltaTime;
    // Spawn rate based on Level Config
    const currentSpawnRate = Math.max(400, activeLevel.spawnRateMs - (currentDistance / 2)); 
    
    if (spawnTimerRef.current > currentSpawnRate) {
      setEntities(prev => {
        // Pass Level Config to spawn logic
        const newSpawnedEntities = spawnEntity(
            prev, 
            currentDistance, 
            currentPlayer.y, 
            thievesSpawnedRef.current,
            activeLevel
        );
        
        // Count how many thieves were spawned in this batch
        const thiefCount = newSpawnedEntities.filter(e => e.type === EntityType.THIEF).length;
        if (thiefCount > 0) {
            thievesSpawnedRef.current += thiefCount;
        }

        return newSpawnedEntities.length > 0 ? [...prev, ...newSpawnedEntities] : prev;
      });
      spawnTimerRef.current = 0;
    }

    // Update Entities & Collision
    setEntities(prevEntities => {
      const nextEntities: Entity[] = [];
      let collisionDetected = false;
      let collisionEntity: Entity | null = null;

      prevEntities.forEach(entity => {
        let processedEntity = { ...entity };

        // Move Entities
        if (entity.type === EntityType.THIEF) {
             processedEntity = updateThiefLogic(processedEntity, currentPlayer, deltaTime);
        } else {
             // Traffic relative speed proportional to Level Speed
             const moveSpeed = (activeLevel.baseSpeed * 0.8 * deltaTime) / 16; 
             processedEntity.y += moveSpeed;
        }

        // Check Collision
        if (checkCollision(currentPlayer, processedEntity)) {
           collisionDetected = true;
           collisionEntity = processedEntity;
        }

        // Cleanup Bounds
        const isOffBottom = processedEntity.y > 120;
        const isWayOffSide = processedEntity.lane < -2 || processedEntity.lane > 7;
        
        if (!isOffBottom && !isWayOffSide) {
          nextEntities.push(processedEntity);
        }
      });

      if (collisionDetected && collisionEntity) {
        const entity = collisionEntity;
        
        // --- 1. PICKUP PHONE (COIN) ---
        if (entity.type === EntityType.COIN) {
            setScore(s => s + ENTITY_CONFIG[EntityType.COIN].score);
            setPlayer(p => {
                const np = { ...p, phoneCount: p.phoneCount + 1 };
                playerRef.current = np;
                return np;
            });
            return nextEntities.filter(e => e.id !== entity.id);
        }

        // --- 2. SHIELD PICKUP ---
        if (entity.type === EntityType.SHIELD) {
            setPlayer(p => {
                const np = { ...p, hasShield: true };
                playerRef.current = np;
                return np;
            });
            return nextEntities.filter(e => e.id !== entity.id);
        }

        if (entity.type === EntityType.SLOW_MO) {
            return nextEntities.filter(e => e.id !== entity.id);
        }

        // --- 3. DAMAGE / STEALING ---
        if (currentPlayer.hasShield) {
            // Shield Absorbs Hit
            setPlayer(p => {
                const np = { ...p, hasShield: false, isInvulnerable: true };
                playerRef.current = np;
                return np;
            });
            setTimeout(() => {
                setPlayer(p => {
                    const np = {...p, isInvulnerable: false};
                    playerRef.current = np;
                    return np;
                });
            }, 1000);
            
            if (entity.type === EntityType.THIEF || entity.type === EntityType.CAR || entity.type === EntityType.BUS) {
                 return nextEntities.filter(e => e.id !== entity.id);
            }
        } else if (!currentPlayer.isInvulnerable) {
             
             // THIEF LOGIC: STEAL PHONE
             if (entity.type === EntityType.THIEF) {
                if (currentPlayer.phoneCount > 1) {
                    // Lose 1 phone, survive
                     setPlayer(p => {
                        const np = { ...p, phoneCount: p.phoneCount - 1, isInvulnerable: true };
                        playerRef.current = np;
                        return np;
                    });
                    // Grant invulnerability
                    setTimeout(() => {
                        setPlayer(p => {
                            const np = {...p, isInvulnerable: false};
                            playerRef.current = np;
                            return np;
                        });
                    }, 1000);
                    // Remove thief
                    return nextEntities.filter(e => e.id !== entity.id);
                } else {
                    // Game Over
                    setDeathReason("汪汪唯一的手机被小偷偷走啦！没法打卡，痛失手机！");
                    setStatus(GameStatus.GAME_OVER);
                    statusRef.current = GameStatus.GAME_OVER;
                }
             } else {
                 // TRAFFIC ACCIDENT
                setDeathReason("汪汪处理车祸耽误了上班，这下全勤奖泡汤了。");
                setStatus(GameStatus.GAME_OVER);
                statusRef.current = GameStatus.GAME_OVER;
             }
        }
      }

      return nextEntities;
    });

    requestRef.current = requestAnimationFrame(loop);
  }, [updateGameTime]); 

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  const startGame = (level: LevelConfig) => {
    setCurrentLevel(level);
    currentLevelRef.current = level;
    
    setScore(0);
    setDistance(0);
    distanceRef.current = 0;
    thievesSpawnedRef.current = 0; 
    
    // Initial time based on level
    const minStr = level.startMinute < 10 ? `0${level.startMinute}` : `${level.startMinute}`;
    setGameTimeStr(`0${level.startHour}:${minStr}`);
    
    setEntities([]);
    
    const initialPlayer = {
        lane: 2, 
        y: GAME_CONFIG.PLAYER_MAX_Y - 10,
        hasShield: false,
        speedMultiplier: 1,
        isInvulnerable: false,
        phoneCount: 1, 
    };
    setPlayer(initialPlayer);
    playerRef.current = initialPlayer;
    
    setDeathReason('');
    setStatus(GameStatus.PLAYING);
    statusRef.current = GameStatus.PLAYING; 
    
    lastTimeRef.current = performance.now();
  };

  const restartGame = () => {
      setStatus(GameStatus.START);
      statusRef.current = GameStatus.START;
      setCurrentLevel(null); // Go back to level select
  };

  return (
    <div className="relative w-full h-screen bg-pink-50 flex justify-center overflow-hidden">
      <div className="relative w-full max-w-md h-full bg-slate-200 shadow-2xl overflow-hidden ring-4 ring-white/50">
        <Road 
            // Scale visual road speed based on level base speed
            speed={player.speedMultiplier * (currentLevel ? (currentLevel.baseSpeed / 1.5) : 1)} 
            isMoving={status === GameStatus.PLAYING} 
        />
        
        {entities.map(entity => (
            <GameEntity key={entity.id} entity={entity} />
        ))}

        <Player player={player} />

        <GameOverlay 
            status={status} 
            score={score} 
            distance={distance}
            highScore={highScore}
            onStart={startGame}
            onRestart={restartGame}
            causeOfDeath={deathReason}
            gameTimeStr={gameTimeStr}
            phoneCount={player.phoneCount}
            currentLevel={currentLevel}
        />
        
        {status === GameStatus.START && (
            <div className="absolute bottom-4 w-full text-center text-slate-400 text-[10px] font-medium px-4 opacity-50">
               Ver 2.1.0 Continuous Touch
            </div>
        )}
      </div>
    </div>
  );
};

export default App;