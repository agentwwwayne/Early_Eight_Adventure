import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStatus, Entity, PlayerState, EntityType, LevelConfig, Season, Language } from './types';
import { GAME_CONFIG, ENTITY_CONFIG, LEVELS, ENDLESS_LEVEL, SEASONS_ORDER } from './constants';
import { checkCollision, spawnEntity, updateThiefLogic } from './services/gameEngine';
import { Road } from './components/Road';
import { Player, GameEntity } from './components/Entities';
import { GameOverlay } from './components/GameOverlay';
import { SeasonalBackground } from './components/SeasonalBackground';
import { StoryScene } from './components/StoryScene'; 

const App: React.FC = () => {
  // --- State (UI Rendering) ---
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [deathReason, setDeathReason] = useState<string>('');
  const [gameTimeStr, setGameTimeStr] = useState("08:00");
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [survivalTime, setSurvivalTime] = useState(0); 
  const [currentSeason, setCurrentSeason] = useState<Season>(Season.SPRING);
  const [countdown, setCountdown] = useState(3);
  
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [language, setLanguage] = useState<Language>('zh'); // Language state
  
  const [player, setPlayer] = useState<PlayerState>({
    lane: 2, 
    y: GAME_CONFIG.PLAYER_MAX_Y - 10,
    hasShield: false,
    speedMultiplier: 1,
    isInvulnerable: false,
    phoneCount: 1, 
  });
  const [entities, setEntities] = useState<Entity[]>([]);

  // ... (Refs same as before)
  const containerRef = useRef<HTMLDivElement>(null); 
  const statusRef = useRef<GameStatus>(GameStatus.START);
  const playerRef = useRef<PlayerState>(player);
  const distanceRef = useRef(0);
  const currentLevelRef = useRef<LevelConfig | null>(null); 
  const currentSeasonRef = useRef<Season>(Season.SPRING);
  
  const thievesSpawnedRef = useRef(0);
  
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const lastInputTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0); 
  const pauseStartTimeRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);

  // Sync Status & Level Effect
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);
  useEffect(() => { currentSeasonRef.current = currentSeason; }, [currentSeason]);

  // Toggle Language
  const toggleLanguage = () => {
      setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  // --- Countdown Logic ---
  useEffect(() => {
    let timer: number;
    if (status === GameStatus.STORY_INTRO && countdown > 0) {
        timer = window.setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    } else if (status === GameStatus.STORY_INTRO && countdown === 0) {
        // Countdown finished, start game
        setStatus(GameStatus.PLAYING);
        statusRef.current = GameStatus.PLAYING;
        lastTimeRef.current = performance.now();
        startTimeRef.current = lastTimeRef.current;
    }
    return () => clearTimeout(timer);
  }, [status, countdown]);

  // ... (updateGameTime, pauseGame, resumeGame same as before) ...
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

  const pauseGame = useCallback(() => {
      if (statusRef.current !== GameStatus.PLAYING) return;
      setStatus(GameStatus.PAUSED);
      statusRef.current = GameStatus.PAUSED;
      pauseStartTimeRef.current = performance.now();
  }, []);

  const resumeGame = useCallback(() => {
      if (statusRef.current !== GameStatus.PAUSED) return;
      const now = performance.now();
      const pausedDuration = now - pauseStartTimeRef.current;
      totalPausedTimeRef.current += pausedDuration;
      
      setStatus(GameStatus.PLAYING);
      statusRef.current = GameStatus.PLAYING;
      lastTimeRef.current = now; 
  }, []);

  // ... (Input Handlers same as before) ...
  const handleKeyboardInput = useCallback((direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (statusRef.current !== GameStatus.PLAYING) return;
    setIsTouchMode(false);
    const now = Date.now();
    if (now - lastInputTimeRef.current < GAME_CONFIG.INPUT_COOLDOWN_MS) return;
    lastInputTimeRef.current = now;

    setPlayer(prev => {
      let newLane = prev.lane;
      let newY = prev.y;
      if (direction === 'LEFT') newLane = Math.max(0, Math.floor(prev.lane) - 1);
      if (direction === 'RIGHT') newLane = Math.min(4, Math.ceil(prev.lane) + 1);
      if (direction === 'UP') newY = Math.max(GAME_CONFIG.PLAYER_MIN_Y, prev.y - GAME_CONFIG.PLAYER_Y_STEP);
      if (direction === 'DOWN') newY = Math.min(GAME_CONFIG.PLAYER_MAX_Y, prev.y + GAME_CONFIG.PLAYER_Y_STEP);
      newLane = Math.round(newLane);
      const newState = { ...prev, lane: newLane, y: newY };
      playerRef.current = newState; 
      return newState;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
          e.preventDefault();
          if (statusRef.current === GameStatus.PLAYING) pauseGame();
          else if (statusRef.current === GameStatus.PAUSED) resumeGame();
          return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') handleKeyboardInput('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd') handleKeyboardInput('RIGHT');
      if (e.key === 'ArrowUp' || e.key === 'w') handleKeyboardInput('UP');
      if (e.key === 'ArrowDown' || e.key === 's') handleKeyboardInput('DOWN');
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleTouch = (e: TouchEvent) => {
        if (statusRef.current !== GameStatus.PLAYING) return;
        setIsTouchMode(true);
        if (e.cancelable && e.target === containerRef.current) e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const relativeX = touch.clientX - rect.left;
        const clampedX = Math.max(0, Math.min(rect.width, relativeX));
        const percentageX = (clampedX / rect.width) * 100;
        let targetLane = (percentageX - 10) / 20;
        targetLane = Math.max(0, Math.min(4, targetLane));
        const relativeY = touch.clientY - rect.top;
        const yPercent = (relativeY / rect.height) * 100;
        const clampedY = Math.max(GAME_CONFIG.PLAYER_MIN_Y, Math.min(GAME_CONFIG.PLAYER_MAX_Y, yPercent));
        setPlayer(prev => {
            const newState = { ...prev, lane: targetLane, y: clampedY };
            playerRef.current = newState;
            return newState;
        });
    };

    const container = containerRef.current;
    if (container) {
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
  }, [handleKeyboardInput, pauseGame, resumeGame]);


  // ... (Game Loop same as before) ...
  const loop = useCallback((time: number) => {
    if (statusRef.current === GameStatus.STORY_INTRO || statusRef.current === GameStatus.PAUSED) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
        return;
    }
    if (statusRef.current !== GameStatus.PLAYING) {
        lastTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
        return;
    }
    
    const activeLevel = currentLevelRef.current;
    if (!activeLevel) return; 

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const actualElapsedTime = time - startTimeRef.current - totalPausedTimeRef.current;
    
    if (activeLevel.isEndless) {
        const elapsedSeconds = actualElapsedTime / 1000;
        setSurvivalTime(elapsedSeconds);
        const seasonIndex = Math.floor(elapsedSeconds / 20) % 4;
        if (SEASONS_ORDER[seasonIndex] !== currentSeasonRef.current) {
            const nextSeason = SEASONS_ORDER[seasonIndex];
            setCurrentSeason(nextSeason);
            currentSeasonRef.current = nextSeason;
        }
    }

    const currentPlayer = playerRef.current;
    const currentDistance = distanceRef.current;

    let currentBaseSpeed = activeLevel.baseSpeed;
    if (activeLevel.isEndless) {
        const elapsedSec = actualElapsedTime / 1000;
        currentBaseSpeed += Math.min(1.0, elapsedSec / 120); 
    }

    const speed = (currentBaseSpeed * currentPlayer.speedMultiplier * deltaTime) / 1000; 
    
    setDistance(prev => {
        const newDist = prev + speed * 10; 
        distanceRef.current = newDist; 
        
        if (!activeLevel.isEndless) {
            updateGameTime(newDist, activeLevel);
            if (newDist >= activeLevel.winDistance) {
                setStatus(GameStatus.VICTORY);
                statusRef.current = GameStatus.VICTORY;
            }
        }
        return newDist;
    });
    
    if (!activeLevel.isEndless) {
        setScore(prev => prev + speed);
    } else {
        setScore(Math.floor(actualElapsedTime / 100)); 
    }

    spawnTimerRef.current += deltaTime;
    let currentSpawnRate = activeLevel.spawnRateMs;
    if (activeLevel.isEndless) {
        const elapsedSec = actualElapsedTime / 1000;
        currentSpawnRate = Math.max(400, 1000 - (elapsedSec * 5)); 
    } else {
        currentSpawnRate = Math.max(400, activeLevel.spawnRateMs - (currentDistance / 2)); 
    }
    
    if (spawnTimerRef.current > currentSpawnRate) {
      setEntities(prev => {
        const elapsedTimeSec = activeLevel.isEndless ? actualElapsedTime / 1000 : 0;
        const newSpawnedEntities = spawnEntity(prev, currentDistance, currentPlayer.y, thievesSpawnedRef.current, activeLevel, elapsedTimeSec);
        const thiefCount = newSpawnedEntities.filter(e => e.type === EntityType.THIEF).length;
        if (thiefCount > 0) thievesSpawnedRef.current += thiefCount;
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
             const moveSpeed = (currentBaseSpeed * 0.8 * deltaTime) / 16; 
             processedEntity.y += moveSpeed;
        }
        if (checkCollision(currentPlayer, processedEntity)) {
           collisionDetected = true;
           collisionEntity = processedEntity;
        }
        const isOffBottom = processedEntity.y > 120;
        const isWayOffSide = processedEntity.lane < -2 || processedEntity.lane > 7;
        if (!isOffBottom && !isWayOffSide) nextEntities.push(processedEntity);
      });

      if (collisionDetected && collisionEntity) {
        const entity = collisionEntity;
        if (entity.type === EntityType.COIN) {
            setPlayer(p => { const np = { ...p, phoneCount: p.phoneCount + 1 }; playerRef.current = np; return np; });
            return nextEntities.filter(e => e.id !== entity.id);
        }
        if (entity.type === EntityType.SHIELD) {
            setPlayer(p => { const np = { ...p, hasShield: true }; playerRef.current = np; return np; });
            return nextEntities.filter(e => e.id !== entity.id);
        }
        if (entity.type === EntityType.SLOW_MO) return nextEntities.filter(e => e.id !== entity.id);

        if (currentPlayer.hasShield) {
            setPlayer(p => { const np = { ...p, hasShield: false, isInvulnerable: true }; playerRef.current = np; return np; });
            setTimeout(() => { setPlayer(p => { const np = {...p, isInvulnerable: false}; playerRef.current = np; return np; }); }, 1000);
            if (entity.type === EntityType.THIEF || entity.type === EntityType.CAR || entity.type === EntityType.BUS) return nextEntities.filter(e => e.id !== entity.id);
        } else if (!currentPlayer.isInvulnerable) {
             if (entity.type === EntityType.THIEF) {
                if (currentPlayer.phoneCount > 1) {
                     setPlayer(p => { const np = { ...p, phoneCount: p.phoneCount - 1, isInvulnerable: true }; playerRef.current = np; return np; });
                     setTimeout(() => { setPlayer(p => { const np = {...p, isInvulnerable: false}; playerRef.current = np; return np; }); }, 1000);
                     return nextEntities.filter(e => e.id !== entity.id);
                } else {
                    setPlayer(p => { const np = { ...p, phoneCount: 0 }; playerRef.current = np; return np; });
                    setDeathReason('fail_stolen'); // Use Key
                    setStatus(GameStatus.GAME_OVER);
                    statusRef.current = GameStatus.GAME_OVER;
                }
             } else {
                setDeathReason('fail_crash'); // Use Key
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
    
    let startingSeason = SEASONS_ORDER[Math.floor(Math.random() * 4)];
    if (level.isEndless) startingSeason = Season.SPRING;
    setCurrentSeason(startingSeason);
    currentSeasonRef.current = startingSeason;
    
    setScore(0); setDistance(0); distanceRef.current = 0; thievesSpawnedRef.current = 0; setSurvivalTime(0);
    const minStr = level.startMinute < 10 ? `0${level.startMinute}` : `${level.startMinute}`;
    setGameTimeStr(`0${level.startHour}:${minStr}`);
    setEntities([]);
    const initialPlayer = { lane: 2, y: GAME_CONFIG.PLAYER_MAX_Y - 10, hasShield: false, speedMultiplier: 1, isInvulnerable: false, phoneCount: 1 };
    setPlayer(initialPlayer);
    playerRef.current = initialPlayer;
    setIsTouchMode(false); 
    setDeathReason('');
    
    setStatus(GameStatus.STORY_INTRO);
    statusRef.current = GameStatus.STORY_INTRO;
    setCountdown(3); 
    totalPausedTimeRef.current = 0;
  };

  const restartLevel = () => {
      if (currentLevel) startGame(currentLevel);
      else returnToMenu();
  };

  const nextLevel = () => {
      if (!currentLevel) return;
      const idx = LEVELS.findIndex(l => l.id === currentLevel.id);
      if (idx >= 0 && idx < LEVELS.length - 1) startGame(LEVELS[idx + 1]);
      else startGame(ENDLESS_LEVEL);
  };

  const returnToMenu = () => {
      setStatus(GameStatus.START);
      statusRef.current = GameStatus.START;
      setCurrentLevel(null); 
  };

  const getBgStyle = () => {
      const s = currentSeason;
      if (s === Season.SPRING) return 'from-pink-100 via-white to-emerald-100';
      if (s === Season.SUMMER) return 'from-sky-100 via-yellow-100 to-lime-100';
      if (s === Season.AUTUMN) return 'from-amber-100 via-orange-50 to-red-100';
      if (s === Season.WINTER) return 'from-slate-100 via-blue-50 to-sky-200';
      return 'from-slate-100 to-slate-200';
  };

  return (
    <div className={`relative w-full h-screen bg-gradient-to-br ${getBgStyle()} flex justify-center items-center overflow-hidden transition-colors duration-1000`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block opacity-50 blur-3xl">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/40 rounded-full animate-pulse delay-1000"></div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-full md:w-[450px] md:h-auto md:aspect-[9/19.5] md:max-h-[90vh] md:rounded-3xl md:border-[8px] md:border-white/50 md:ring-4 md:ring-black/5 bg-slate-200 shadow-2xl overflow-hidden touch-none z-10"
      >
        {status === GameStatus.STORY_INTRO && <StoryScene countdown={countdown} language={language} />}

        <Road 
            speed={player.speedMultiplier * (currentLevel ? (currentLevel.baseSpeed / 1.5) : 1)} 
            isMoving={status === GameStatus.PLAYING} 
            season={currentSeason}
        />
        
        <SeasonalBackground season={currentSeason} />
        
        {entities.map(entity => (
            <GameEntity key={entity.id} entity={entity} season={currentSeason} />
        ))}

        <Player player={player} isTouchMode={isTouchMode} />

        <GameOverlay 
            status={status} 
            score={score} 
            distance={distance}
            highScore={highScore}
            onStart={startGame}
            onRetry={restartLevel}
            onReturn={returnToMenu}
            onNextLevel={nextLevel}
            onPause={pauseGame}
            onResume={resumeGame}
            onToggleLanguage={toggleLanguage}
            language={language}
            causeOfDeath={deathReason}
            gameTimeStr={gameTimeStr}
            phoneCount={player.phoneCount}
            currentLevel={currentLevel}
            survivalTime={survivalTime}
            currentSeason={currentSeason}
            countdown={countdown}
        />

        {status === GameStatus.START && (
            <div className="absolute bottom-4 w-full text-center text-slate-400 text-[10px] font-medium px-4 opacity-50 pointer-events-none">
               Ver 11.0.0 Bilingual
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
