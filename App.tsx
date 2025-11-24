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
  const containerRef = useRef<HTMLDivElement>(null); // Reference to game container for touch calculation
  const statusRef = useRef<GameStatus>(GameStatus.START);
  const playerRef = useRef<PlayerState>(player);
  const distanceRef = useRef(0);
  const currentLevelRef = useRef<LevelConfig | null>(null); 
  
  const thievesSpawnedRef = useRef(0);
  
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const lastInputTimeRef = useRef<number>(0);

  // Sync Status & Level Effect
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  const updateGameTime = useCallback((currentDist: number, level: LevelConfig) => {
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

  // --- Keyboard Controls (Discrete) ---
  const handleKeyboardInput = useCallback((direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (statusRef.current !== GameStatus.PLAYING) return;

    const now = Date.now();
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
      playerRef.current = newState; 
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') handleKeyboardInput('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd') handleKeyboardInput('RIGHT');
      if (e.key === 'ArrowUp' || e.key === 'w') handleKeyboardInput('UP');
      if (e.key === 'ArrowDown' || e.key === 's') handleKeyboardInput('DOWN');
    };

    window.addEventListener('keydown', handleKeyDown);

    // --- Touch "Follow Finger" Logic ---
    const handleTouch = (e: TouchEvent) => {
        if (statusRef.current !== GameStatus.PLAYING) return;
        
        // Prevent default only if we are inside the game area interactions
        if (e.cancelable && e.target === containerRef.current) e.preventDefault();
        
        const container = containerRef.current;
        if (!container) return;
        
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        
        // 1. Calculate Horizontal Lane (0-4)
        // Map touch X relative to container width to 5 distinct zones
        const relativeX = touch.clientX - rect.left;
        // Clamp X within container bounds for calculation
        const clampedX = Math.max(0, Math.min(rect.width, relativeX));
        const laneWidth = rect.width / 5;
        const targetLane = Math.floor(clampedX / laneWidth);
        
        // 2. Calculate Vertical Y (0-100%)
        const relativeY = touch.clientY - rect.top;
        const yPercent = (relativeY / rect.height) * 100;
        const clampedY = Math.max(GAME_CONFIG.PLAYER_MIN_Y, Math.min(GAME_CONFIG.PLAYER_MAX_Y, yPercent));
        
        // Direct Update (Bypass cooldown for 1:1 feel)
        setPlayer(prev => {
            // Only update if changed to avoid excessive re-renders (React handles this mostly, but good practice)
            if (prev.lane === targetLane && Math.abs(prev.y - clampedY) < 0.5) {
                return prev; 
            }
            
            const newState = { ...prev, lane: targetLane, y: clampedY };
            playerRef.current = newState;
            return newState;
        });
    };

    const container = containerRef.current;
    if (container) {
        // Use non-passive to allow preventing scroll
        container.addEventListener('touchstart', handleTouch, { passive: false });
        container.addEventListener('touchmove', handleTouch, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (container) {
          container.removeEventListener('touchstart', handleTouch);
          container.removeEventListener('touchmove', handleTouch);
      }
    };
  }, [handleKeyboardInput]);

  // --- Game Loop ---
  const loop = useCallback((time: number) => {
    if (statusRef.current !== GameStatus.PLAYING) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
        return;
    }
    
    const activeLevel = currentLevelRef.current;
    if (!activeLevel) {
        return; 
    }

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const currentPlayer = playerRef.current;
    const currentDistance = distanceRef.current;

    const speed = (activeLevel.baseSpeed * currentPlayer.speedMultiplier * deltaTime) / 1000; 
    
    setDistance(prev => {
        const newDist = prev + speed * 10; 
        distanceRef.current = newDist; 
        updateGameTime(newDist, activeLevel);
        
        if (newDist >= activeLevel.winDistance) {
            setStatus(GameStatus.VICTORY);
            statusRef.current = GameStatus.VICTORY;
        }
        return newDist;
    });
    setScore(prev => prev + speed);

    spawnTimerRef.current += deltaTime;
    const currentSpawnRate = Math.max(400, activeLevel.spawnRateMs - (currentDistance / 2)); 
    
    if (spawnTimerRef.current > currentSpawnRate) {
      setEntities(prev => {
        const newSpawnedEntities = spawnEntity(
            prev, 
            currentDistance, 
            currentPlayer.y, 
            thievesSpawnedRef.current,
            activeLevel
        );
        
        const thiefCount = newSpawnedEntities.filter(e => e.type === EntityType.THIEF).length;
        if (thiefCount > 0) {
            thievesSpawnedRef.current += thiefCount;
        }

        return newSpawnedEntities.length > 0 ? [...prev, ...newSpawnedEntities] : prev;
      });
      spawnTimerRef.current = 0;
    }

    setEntities(prevEntities => {
      const nextEntities: Entity[] = [];
      let collisionDetected = false;
      let collisionEntity: Entity | null = null;

      prevEntities.forEach(entity => {
        let processedEntity = { ...entity };

        if (entity.type === EntityType.THIEF) {
             processedEntity = updateThiefLogic(processedEntity, currentPlayer, deltaTime);
        } else {
             const moveSpeed = (activeLevel.baseSpeed * 0.8 * deltaTime) / 16; 
             processedEntity.y += moveSpeed;
        }

        if (checkCollision(currentPlayer, processedEntity)) {
           collisionDetected = true;
           collisionEntity = processedEntity;
        }

        const isOffBottom = processedEntity.y > 120;
        const isWayOffSide = processedEntity.lane < -2 || processedEntity.lane > 7;
        
        if (!isOffBottom && !isWayOffSide) {
          nextEntities.push(processedEntity);
        }
      });

      if (collisionDetected && collisionEntity) {
        const entity = collisionEntity;
        
        if (entity.type === EntityType.COIN) {
            setScore(s => s + ENTITY_CONFIG[EntityType.COIN].score);
            setPlayer(p => {
                const np = { ...p, phoneCount: p.phoneCount + 1 };
                playerRef.current = np;
                return np;
            });
            return nextEntities.filter(e => e.id !== entity.id);
        }

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

        if (currentPlayer.hasShield) {
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
             
             if (entity.type === EntityType.THIEF) {
                if (currentPlayer.phoneCount > 1) {
                     setPlayer(p => {
                        const np = { ...p, phoneCount: p.phoneCount - 1, isInvulnerable: true };
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
                    return nextEntities.filter(e => e.id !== entity.id);
                } else {
                    // Update: Explicitly set phones to 0 for UI correct display
                    setPlayer(p => {
                        const np = { ...p, phoneCount: 0 };
                        playerRef.current = np;
                        return np;
                    });
                    setDeathReason("汪汪唯一的手机被小偷偷走啦！没法打卡，痛失手机！");
                    setStatus(GameStatus.GAME_OVER);
                    statusRef.current = GameStatus.GAME_OVER;
                }
             } else {
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
      setCurrentLevel(null); 
  };

  return (
    // BG set to neutral-900 for letterboxing effect on large screens
    <div className="relative w-full h-screen bg-neutral-900 flex justify-center items-center overflow-hidden touch-none">
      <div 
        ref={containerRef}
        // MD: Limit max width to resemble a phone, but allow height to fill freely up to 95vh for "auto aspect"
        // Mobile: w-full h-full
        className="relative w-full h-full md:w-auto md:max-w-[450px] md:h-[95vh] md:rounded-3xl md:border-[8px] md:border-neutral-800 bg-slate-200 shadow-2xl overflow-hidden touch-none"
      >
        <Road 
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
               Ver 3.3.1 More Dynamic Fun
            </div>
        )}
      </div>
    </div>
  );
};

export default App;