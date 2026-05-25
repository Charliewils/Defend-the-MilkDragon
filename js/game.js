import { getMapTheme, getEndlessMapModifier } from './config/mapThemes.js';
import {
  CANVAS_H,
  CANVAS_W,
  CELL,
  COLORS,
  INITIAL_GOLD,
  INITIAL_LIVES,
  ROWS,
  COLS,
  SPAWN_INTERVAL,
  TOWER_TYPES,
  TOWER_ORDER
} from './config/constants.js';
import { createSpawnedEnemies, spawnWormSplitParticles } from './entities/enemies/index.js';
import { Radish } from './entities/Radish.js';
import { createTower } from './entities/towers/index.js';
import { spawnEnemyExplosion } from './systems/explosionParticles.js';
import {
  cellCenter,
  getPathCells,
  getPathEndCell,
  isGrassCell,
  isObstacleCell,
  isPathCell,
  setLevelPath
} from './map/grid.js';
import { getEndlessMapLayout, getPathCellsForEndlessMap, getPathCellsForLevel } from './map/paths.js';
import {
  buildEndlessSpawnQueue,
  describeEndlessWaveComposition,
  ENDLESS_INITIAL_GOLD,
  ENDLESS_MAX_LIVES,
  ENDLESS_PREVIEW_DURATION,
  getEndlessPreviewOpacity,
  getEndlessSpawnInterval,
  getEndlessWaveIntermission,
  getEndlessWaveProgressState
} from './wave/endless.js';
import {
  awardBossKillGems,
  awardEndlessWaveGems,
  awardPerfectStarGems
} from './storage/gemInventory.js';
import { getEndlessBestWave, recordEndlessBestWave } from './storage/endlessProgress.js';
import {
  describeCampaignWaveComposition,
  expandCampaignSpawnQueue,
  getWaveProgressState,
  TOTAL_WAVES,
  WAVE_INTERMISSION
} from './wave/system.js';
import { analyzeSpawnQueue, GameAI } from './ai/GameAI.js';
import { rollWaveSpawnDelay } from './wave/spawnTiming.js';
import { ItemManager } from './items/ItemManager.js';
import { getItemLoadout } from './storage/itemLoadout.js';
import { Particle } from './entities/Particle.js';
import {
  clearModeSession,
  hasModeSession,
  loadModeSession,
  saveModeSession,
  sessionMatchesStart
} from './storage/sessionSave.js';
import {
  deserializeEnemy,
  deserializeTower,
  serializeEnemy,
  serializeTower
} from './game/sessionSnapshot.js';

export function createGame({
  canvas,
  hud,
  towerBar,
  towerPanel,
  gameControls,
  speedControls,
  resultScreen,
  wavePreview,
  itemSlotBar = null,
  freezeCountdownEl = null,
  powerSurgeHudEl = null,
  powerSurgeFillEl = null,
  audioManager: audio = null,
  gameAI = null,
  difficultyPanel = null,
  onLevelEnd
}) {
  const ctx = canvas.getContext('2d');

  let gold = INITIAL_GOLD;
  let lives = INITIAL_LIVES;
  let wave = 1;
  let gameOver = false;
  let paused = false;

  let enemies = [];
  let towers = [];
  let bullets = [];
  let particles = [];
  let muzzleFlashes = [];
  let ripples = [];
  let damageNumbers = [];

  let spawnTimer = 0;
  let spawnedInWave = 0;
  let waveActive = true;
  let wavePhase = 'active';
  let intermissionTimer = 0;
  let previewTimer = 0;
  let waveEnemiesTotal = 0;
  let waveEnemiesCleared = 0;
  let allWavesComplete = false;
  let currentLevelId = 1;
  let sessionMode = 'campaign';
  let endlessMapId = 'grass';
  let mapTheme = getMapTheme('grass');
  let battleModifiers = {};
  let spawnQueue = [];
  let spawnInterval = SPAWN_INTERVAL;
  let nextSpawnDelay = SPAWN_INTERVAL;
  let screenShakeTimer = 0;
  let victoryReported = false;
  let levelFinished = false;
  let radishDamageCount = 0;
  let enemiesKilledCount = 0;
  let goldFromKills = 0;
  let sessionElapsed = 0;
  let sessionGemsEarned = 0;
  let animationFrameId = 0;
  let running = false;
  let gameSpeed = 1;
  let targetGameSpeed = 1;

  const GAME_SPEED_TRANSITION = 5;

  let timeFreezeRemaining = 0;
  let powerSurgeRemaining = 0;
  let powerSurgePhase = 0;
  let powerSurgeRippleT = 0;
  let lightningFlashT = 0;
  /** @type {{ tx: number, ty: number, t: number }[]} */
  let lightningBolts = [];
  /** @type {{ x: number, y: number, vx: number, vy: number, spin: number, landed: boolean, bounce: number }[]} */
  let goldRainCoins = [];
  let goldRainActive = false;

  const ai = gameAI || new GameAI();
  const BASE_CLEAR_TIME = 30;
  const MAX_GOLD_CAP = 500;

  let totalGoldEarned = INITIAL_GOLD;
  let totalGoldSpent = 0;
  let waveClearTimes = [];
  let waveStartTime = 0;
  let currentWaveLeaks = 0;
  let currentWaveEnemyUnits = 0;
  let waveTowerBusyTime = 0;
  let waveActiveDuration = 0;
  let campaignPreviewShown = false;

  function spawnShatterParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 80;
      particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 40,
          radius: 2 + Math.random() * 2,
          color,
          lifetime: 0.35 + Math.random() * 0.25
        })
      );
    }
  }

  function spawnOrangeBurst(x, y) {
    for (let i = 0; i < 14; i += 1) {
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
      const sp = 60 + Math.random() * 50;
      particles.push(
        new Particle({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          radius: 2 + Math.random() * 2.5,
          color: 'rgba(230, 126, 34, 0.95)',
          lifetime: 0.28 + Math.random() * 0.12
        })
      );
    }
  }

  function drawFreezeBorder(ctx) {
    const g = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    g.addColorStop(0, 'rgba(52, 152, 219, 0.55)');
    g.addColorStop(0.5, 'rgba(174, 214, 241, 0.25)');
    g.addColorStop(1, 'rgba(52, 152, 219, 0.55)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, CANVAS_W - 10, CANVAS_H - 10);
    ctx.strokeStyle = 'rgba(133, 193, 233, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, CANVAS_W - 28, CANVAS_H - 28);
  }

  function drawIceLayer(ctx, x, y, radius) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(174, 214, 241, 0.42)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 7; i += 1) {
      const ang = (i / 7) * Math.PI * 2 + powerSurgePhase * 0.2;
      const px = Math.cos(ang) * radius * 0.75;
      const py = Math.sin(ang) * radius * 0.75;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(px + 4, py - 2);
      ctx.lineTo(px - 2, py + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(52, 152, 219, 0.12)';
    ctx.fill();
    ctx.restore();
  }

  function activateLightningStorm() {
    lightningFlashT = 0.3;
    lightningBolts = [];
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const { x, y } = enemy.position;
      lightningBolts.push({ tx: x, ty: y, t: 0 });
      enemy.takeDamage(damageNumbers, 150, {
        variant: 'lightning',
        isBonus: true,
        showDamageNumber: true
      });
    }
    audio?.playSound('hit_normal');
    reapDeadEnemies();
    updateHud();
  }

  function activateTimeFreeze() {
    timeFreezeRemaining = Math.max(timeFreezeRemaining, 3);
    audio?.playSound('hit_ice');
  }

  function activateGoldRain() {
    if (goldRainActive) return;
    goldRainActive = true;
    goldRainCoins = [];
    const startGold = gold;
    gold += 120;
    totalGoldEarned += 120;
    hud.setSkipGoldTextUpdate?.(true);
    hud.animateGoldCount?.(startGold, gold, 480, () => {
      hud.setSkipGoldTextUpdate?.(false);
      hud.playGoldBump?.();
    });
    for (let i = 0; i < 20; i += 1) {
      const x = 40 + Math.random() * (CANVAS_W - 80);
      const vx = (Math.random() - 0.5) * 90;
      const vy = 40 + Math.random() * 40;
      goldRainCoins.push({
        x,
        y: -20 - Math.random() * 40,
        vx,
        vy,
        spin: (Math.random() - 0.5) * 8,
        landed: false,
        bounce: 0
      });
    }
    audio?.playSound('upgrade');
    updateHud();
  }

  function activatePowerSurge() {
    powerSurgeRemaining = 8;
    powerSurgeRippleT = 0.45;
    for (const tower of towers) {
      tower.fireRateMultiplier = 2;
    }
    audio?.playSound('placeTower');
  }

  function activateItemById(itemId) {
    switch (itemId) {
      case 'lightning_storm':
        activateLightningStorm();
        break;
      case 'time_freeze':
        activateTimeFreeze();
        break;
      case 'gold_rain':
        activateGoldRain();
        break;
      case 'power_surge':
        activatePowerSurge();
        break;
      default:
        break;
    }
  }

  const itemManager = new ItemManager(getItemLoadout(), {
    onUse: (_slot, itemId) => {
      activateItemById(itemId);
    }
  });

  function buildBattleSnapshot() {
    return {
      gold,
      lives,
      wave,
      gameOver,
      paused,
      levelFinished,
      allWavesComplete,
      victoryReported,
      radishDamageCount,
      enemiesKilledCount,
      goldFromKills,
      sessionElapsed,
      sessionGemsEarned,
      gameSpeed,
      targetGameSpeed,
      screenShakeTimer,
      waveActive,
      wavePhase,
      intermissionTimer,
      previewTimer,
      spawnTimer,
      spawnedInWave,
      spawnInterval,
      nextSpawnDelay,
      waveEnemiesTotal,
      waveEnemiesCleared,
      spawnQueue: spawnQueue.map((e) => ({ type: e.type })),
      enemies: enemies.map(serializeEnemy),
      towers: towers.map(serializeTower),
      itemSlots: itemManager.getSnapshot(),
      itemLoadoutIds: getItemLoadout(),
      radish: {
        lives: radish.lives,
        maxLives: radish.maxLives,
        hurtTimer: radish.hurtTimer,
        shakeTimer: radish.shakeTimer
      },
      timeFreezeRemaining,
      powerSurgeRemaining,
      powerSurgePhase,
      powerSurgeRippleT,
      lightningFlashT,
      lightningBolts: lightningBolts.map((b) => ({ ...b })),
      goldRainActive,
      goldRainCoins: goldRainCoins.map((c) => ({ ...c })),
      selectedTowerType,
      selectedTower: selectedTower ? { col: selectedTower.col, row: selectedTower.row } : null,
      hoverCol,
      hoverRow
    };
  }

  function applyBattleSnapshot(snap) {
    gold = snap.gold;
    lives = snap.lives;
    radish.lives = snap.radish.lives;
    radish.maxLives = snap.radish.maxLives;
    radish.hurtTimer = snap.radish.hurtTimer ?? 0;
    radish.shakeTimer = snap.radish.shakeTimer ?? 0;

    wave = snap.wave;
    gameOver = snap.gameOver;
    paused = snap.paused;
    levelFinished = snap.levelFinished;
    allWavesComplete = snap.allWavesComplete;
    victoryReported = snap.victoryReported;
    radishDamageCount = snap.radishDamageCount;
    enemiesKilledCount = snap.enemiesKilledCount;
    goldFromKills = snap.goldFromKills;
    sessionElapsed = snap.sessionElapsed;
    sessionGemsEarned = snap.sessionGemsEarned;
    gameSpeed = snap.gameSpeed;
    targetGameSpeed = snap.targetGameSpeed;
    screenShakeTimer = snap.screenShakeTimer ?? 0;
    waveActive = snap.waveActive;
    wavePhase = snap.wavePhase;
    intermissionTimer = snap.intermissionTimer;
    previewTimer = snap.previewTimer ?? 0;
    spawnTimer = snap.spawnTimer;
    spawnedInWave = snap.spawnedInWave;
    spawnInterval = snap.spawnInterval;
    nextSpawnDelay = snap.nextSpawnDelay;
    waveEnemiesTotal = snap.waveEnemiesTotal;
    waveEnemiesCleared = snap.waveEnemiesCleared;
    spawnQueue = (snap.spawnQueue || []).map((e) => ({ type: e.type }));

    enemies = (snap.enemies || []).map(deserializeEnemy);
    towers = (snap.towers || []).map((t) => deserializeTower(t, battleModifiers));
    bullets = [];
    particles = [];
    muzzleFlashes = [];
    ripples = [];
    damageNumbers = [];

    if (Array.isArray(snap.itemLoadoutIds) && snap.itemLoadoutIds.length > 0) {
      itemManager.setLoadout(snap.itemLoadoutIds);
    }
    itemManager.applySnapshot(snap.itemSlots);

    timeFreezeRemaining = snap.timeFreezeRemaining ?? 0;
    powerSurgeRemaining = snap.powerSurgeRemaining ?? 0;
    powerSurgePhase = snap.powerSurgePhase ?? 0;
    powerSurgeRippleT = snap.powerSurgeRippleT ?? 0;
    lightningFlashT = snap.lightningFlashT ?? 0;
    lightningBolts = (snap.lightningBolts || []).map((b) => ({ ...b }));
    goldRainActive = Boolean(snap.goldRainActive);
    goldRainCoins = (snap.goldRainCoins || []).map((c) => ({ ...c }));

    selectedTowerType = snap.selectedTowerType ?? towerBar.getSelectedType();
    towerBar.setSelectedType(selectedTowerType);
    hoverCol = snap.hoverCol ?? -1;
    hoverRow = snap.hoverRow ?? -1;

    selectedTower = null;
    if (snap.selectedTower) {
      const { col, row } = snap.selectedTower;
      selectedTower = towerAt(col, row);
    }

    if (isEndlessMode()) {
      audio?.setEndlessWave(wave);
    }

    if (isEndlessMode() && wavePhase === 'preview') {
      wavePreview.show(describeEndlessWaveComposition(wave));
      const elapsed = ENDLESS_PREVIEW_DURATION - previewTimer;
      wavePreview.setOpacity(getEndlessPreviewOpacity(Math.max(0, elapsed)));
    } else {
      wavePreview.hide();
    }

    gameControls.setPaused(paused);
    speedControls.setActive(targetGameSpeed);

    if (enemies.some((e) => e.alive && e.typeId === 'boss')) {
      audio?.enterBossBattle();
    }

    syncItemOverlayUi();
    updateHud();
    refreshTowerPanel();
  }

  function persistMidGameSave() {
    if (gameOver || levelFinished) return;
    saveModeSession(sessionMode, {
      savedAt: Date.now(),
      paused,
      snapshot: buildBattleSnapshot(),
      campaignLevelId: sessionMode === 'campaign' ? currentLevelId : null,
      endlessMapId: sessionMode === 'endless' ? endlessMapId : null
    });
  }

  /** 无尽模式：当前波次超过历史最高时立即写入本地记录 */
  function syncEndlessBestWave() {
    if (!isEndlessMode()) return 0;
    return recordEndlessBestWave(endlessMapId, wave);
  }

  function reapDeadEnemies() {
    const killed = enemies.filter((enemy) => !enemy.alive && !enemy.reachedEnd && enemy.hp === 0);
    const killedBoss = killed.some((enemy) => enemy.isBoss);
    if (killed.length > 0) {
      const splitChildren = [];
      for (const enemy of killed) {
        const deathFx = enemy.onDeath();
        spawnEnemyExplosion(enemy, particles, deathFx.explosionScale);
        if (deathFx.wormGreenBurst) {
          spawnWormSplitParticles(particles, enemy);
        }
        let didSplit = false;
        if (enemy.shouldSplitOnDeath()) {
          const children = enemy.createSplitChildren();
          splitChildren.push(...children);
          waveEnemiesTotal += children.length;
          didSplit = true;
          audio?.playSound('worm_split');
        }
        if (enemy.isBoss) {
          audio?.playSound('boss_die');
          sessionGemsEarned += awardBossKillGems();
        } else if (!didSplit) {
          audio?.playSound('enemy_die');
        }
      }
      if (splitChildren.length > 0) {
        enemies.push(...splitChildren);
      }
      const killGold = killed.reduce((sum, enemy) => sum + enemy.reward, 0);
      gold += killGold;
      totalGoldEarned += killGold;
      goldFromKills += killGold;
      enemiesKilledCount += killed.length;
      waveEnemiesCleared += killed.length;
    }

    enemies = enemies.filter((enemy) => enemy.alive);
    if (killedBoss && !enemies.some((enemy) => enemy.isBoss)) {
      audio?.exitBossBattle();
    }
  }

  let hoverCol = -1;
  let hoverRow = -1;
  let selectedTowerType = towerBar.getSelectedType();
  let selectedTower = null;
  const radish = new Radish(INITIAL_LIVES);

  function countSpawnUnits(type) {
    return type === 'squad' ? 4 : 1;
  }

  function countQueueLength(queue) {
    return queue.reduce((sum, entry) => sum + countSpawnUnits(entry.type), 0);
  }

  function rollNextSpawnDelay() {
    return rollWaveSpawnDelay(spawnInterval, spawnedInWave, spawnQueue.length);
  }

  function getDifficultyScaleForWave(targetWave) {
    return ai.getAppliedDifficultyScale(targetWave);
  }

  function prepareWaveSpawns() {
    const diffScale = getDifficultyScaleForWave(wave);
    if (isEndlessMode()) {
      spawnInterval = getEndlessSpawnInterval(wave);
      spawnQueue = buildEndlessSpawnQueue(wave);
    } else {
      const plan = expandCampaignSpawnQueue(wave);
      spawnInterval = plan.interval;
      spawnQueue = [...plan.queue];
    }
    if (diffScale !== 1) {
      spawnInterval /= ai.getSpawnIntervalDivisor(diffScale);
    }
    waveEnemiesTotal = countQueueLength(spawnQueue);
    currentWaveEnemyUnits = waveEnemiesTotal;
  }

  function collectDifficultyFeatures() {
    const hpRatio = radish.maxLives > 0 ? radish.lives / radish.maxLives : 0;
    const avgClear =
      waveClearTimes.length === 0
        ? 0.5
        : waveClearTimes.reduce((a, b) => a + b, 0) / waveClearTimes.length;
    const avgClearTime = Math.min(1, avgClear / BASE_CLEAR_TIME);
    const goldUsageRate =
      totalGoldEarned > 0 ? Math.min(1, totalGoldSpent / totalGoldEarned) : 0;
    const towerUtilization =
      waveActiveDuration > 0 && towers.length > 0
        ? Math.min(1, waveTowerBusyTime / (waveActiveDuration * towers.length))
        : 0;
    const leakRate =
      currentWaveEnemyUnits > 0
        ? Math.min(1, currentWaveLeaks / currentWaveEnemyUnits)
        : 0;

    return {
      hpRatio,
      avgClearTime,
      goldUsageRate,
      towerUtilization,
      leakRate
    };
  }

  function runDifficultyAIAfterWave() {
    const features = collectDifficultyFeatures();
    ai.updateDifficultyAfterWave(features, wave);
    ai.displayDifficultyScale = ai.targetDifficultyScale;
    difficultyPanel?.update({
      features: ai.lastFeatures,
      scale: ai.displayDifficultyScale,
      label: ai.getDifficultyLabel(ai.displayDifficultyScale)
    });
  }

  function getBuiltTowerTypes() {
    return [...new Set(towers.map((t) => t.typeId))];
  }

  function runTowerRecommendationForWave(targetWave) {
    let queue;
    if (isEndlessMode()) {
      queue = buildEndlessSpawnQueue(targetWave);
    } else {
      queue = expandCampaignSpawnQueue(targetWave).queue;
    }
    const ratios = analyzeSpawnQueue(queue);
    const rec = ai.recommendTowers(
      {
        ...ratios,
        goldRatio: Math.min(1, gold / MAX_GOLD_CAP),
        avgTowerLevel:
          towers.length === 0
            ? 0
            : towers.reduce((s, t) => s + t.level, 0) / towers.length / 3
      },
      getBuiltTowerTypes()
    );

    const ranked = rec.scores
      .map((score, i) => ({ type: TOWER_ORDER[i], score }))
      .sort((a, b) => b.score - a.score);

    towerBar.setRecommendations({
      primary: rec.primary,
      secondary: rec.secondary,
      confidence: rec.confidence,
      secondaryConfidence: Math.round((ranked[1]?.score ?? 0) * 100)
    });

    const secondaryName = ai.getTowerDisplayName(rec.secondary);
    const adviceText =
      rec.secondary !== rec.primary
        ? `AI建议：${ai.getTowerDisplayName(rec.primary)} + ${secondaryName} — ${rec.reason}`
        : `AI建议：${ai.getTowerDisplayName(rec.primary)} — ${rec.reason}`;
    wavePreview.setAiAdvice(adviceText);
    return rec;
  }

  function triggerScreenShake(duration = 0.3) {
    screenShakeTimer = duration;
  }

  function getMaxLives() {
    return isEndlessMode() ? ENDLESS_MAX_LIVES : INITIAL_LIVES;
  }

  function getCurrentWaveEnemyCount() {
    if (isEndlessMode()) {
      return countQueueLength(buildEndlessSpawnQueue(wave));
    }
    return countQueueLength(expandCampaignSpawnQueue(wave).queue);
  }

  function loadCampaignLevel(levelId) {
    currentLevelId = levelId;
    sessionMode = 'campaign';
    battleModifiers = {};
    mapTheme = getMapTheme('grass');
    setLevelPath(getPathCellsForLevel(levelId));
    const [endCol, endRow] = getPathEndCell();
    radish.setEndCell(endCol, endRow);
  }

  function loadEndlessMap(mapId) {
    currentLevelId = 0;
    sessionMode = 'endless';
    endlessMapId = mapId;
    const modifier = getEndlessMapModifier(mapId);
    battleModifiers = {
      freezeDamageBonus: modifier.freezeDamageBonus
    };
    mapTheme = getMapTheme(modifier.theme);
    const layout = getEndlessMapLayout(mapId);
    setLevelPath(layout.path, layout.obstacles);
    const [endCol, endRow] = getPathEndCell();
    radish.setEndCell(endCol, endRow);
  }

  function isEndlessMode() {
    return sessionMode === 'endless';
  }

  function calculateStars() {
    if (radishDamageCount === 0) return 3;
    if (radishDamageCount <= 2) return 2;
    return 1;
  }

  function finishLevel(success) {
    if (levelFinished) return;
    clearModeSession(sessionMode);
    levelFinished = true;

    timeFreezeRemaining = 0;
    powerSurgeRemaining = 0;
    powerSurgeRippleT = 0;
    for (const tower of towers) {
      tower.fireRateMultiplier = 1;
    }
    goldRainActive = false;
    goldRainCoins = [];
    lightningBolts = [];
    lightningFlashT = 0;
    syncItemOverlayUi();

    const stars = success ? calculateStars() : 0;
    if (success && !isEndlessMode() && stars >= 3) {
      sessionGemsEarned += awardPerfectStarGems(currentLevelId);
    }
    const endlessBestWave = isEndlessMode() ? syncEndlessBestWave() : 0;
    const payload = {
      levelId: currentLevelId,
      mode: sessionMode,
      endlessMapId,
      success,
      stars,
      enemiesKilled: enemiesKilledCount,
      goldEarned: goldFromKills,
      elapsedSeconds: sessionElapsed,
      endlessWaveReached: wave,
      endlessBestWave,
      gemsEarned: sessionGemsEarned
    };

    if (success) {
      audio?.playSound('victory');
    } else {
      audio?.playSound('defeat');
    }

    resultScreen.show(payload);
    onLevelEnd(payload);
    updateHud();
  }

  function reportVictoryIfNeeded() {
    if (!allWavesComplete || victoryReported || isEndlessMode()) return;
    victoryReported = true;
    finishLevel(true);
  }

  function refreshTowerPanel() {
    if (!selectedTower) {
      towerPanel.hide();
      return;
    }
    towerPanel.show(selectedTower, gold);
  }

  function selectTower(tower) {
    selectedTower = tower;
    refreshTowerPanel();
  }

  function clearTowerSelection() {
    selectedTower = null;
    towerPanel.hide();
  }

  function resetGameState() {
    const maxLives = getMaxLives();
    gold = isEndlessMode() ? ENDLESS_INITIAL_GOLD : INITIAL_GOLD;
    lives = maxLives;
    radish.reset(maxLives);
    wave = 1;
    if (isEndlessMode()) {
      audio?.setEndlessWave(1);
    }
    gameOver = false;
    paused = false;
    victoryReported = false;
    levelFinished = false;
    allWavesComplete = false;
    radishDamageCount = 0;
    enemiesKilledCount = 0;
    goldFromKills = 0;
    sessionElapsed = 0;
    sessionGemsEarned = 0;
    gameSpeed = 1;
    targetGameSpeed = 1;
    speedControls.reset();

    totalGoldEarned = isEndlessMode() ? ENDLESS_INITIAL_GOLD : INITIAL_GOLD;
    totalGoldSpent = 0;
    waveClearTimes = [];
    waveStartTime = 0;
    currentWaveLeaks = 0;
    currentWaveEnemyUnits = 0;
    waveTowerBusyTime = 0;
    waveActiveDuration = 0;
    campaignPreviewShown = false;
    ai.difficultyScale = 1;
    ai.targetDifficultyScale = 1;
    ai.displayDifficultyScale = 1;
    ai.lastFeatures = {
      hpRatio: 1,
      avgClearTime: 0.5,
      goldUsageRate: 0,
      towerUtilization: 0,
      leakRate: 0
    };
    towerBar.clearRecommendations?.();
    difficultyPanel?.update({
      features: ai.lastFeatures,
      scale: 1,
      label: ai.getDifficultyLabel(1)
    });

    enemies = [];
    towers = [];
    bullets = [];
    particles = [];
    muzzleFlashes = [];
    ripples = [];
    damageNumbers = [];

    timeFreezeRemaining = 0;
    powerSurgeRemaining = 0;
    powerSurgePhase = 0;
    powerSurgeRippleT = 0;
    lightningFlashT = 0;
    lightningBolts = [];
    goldRainCoins = [];
    goldRainActive = false;
    itemManager.setLoadout(getItemLoadout());
    itemManager.resetCooldowns();
    hud.setSkipGoldTextUpdate?.(false);

    spawnTimer = 0;
    spawnedInWave = 0;
    waveActive = true;
    wavePhase = 'active';
    intermissionTimer = 0;
    previewTimer = 0;

    hoverCol = -1;
    hoverRow = -1;
    selectedTowerType = towerBar.getSelectedType();
    selectedTower = null;

    clearTowerSelection();
    gameControls.setPaused(false);
    resultScreen.hide();
    wavePreview.hide();
    startWave();
    updateHud();
    clearModeSession(sessionMode);
  }

  function beginActiveWave() {
    wavePhase = 'active';
    waveActive = true;
    spawnedInWave = 0;
    spawnTimer = 0;
    nextSpawnDelay = rollNextSpawnDelay();
    waveStartTime = sessionElapsed;
    currentWaveLeaks = 0;
    waveTowerBusyTime = 0;
    waveActiveDuration = 0;
    if (isEndlessMode()) {
      syncEndlessBestWave();
    }
    campaignPreviewShown = false;
    if (isEndlessMode()) {
      wavePreview.hide();
    } else {
      wavePreview.hide();
    }
  }

  function startWave() {
    prepareWaveSpawns();
    waveEnemiesCleared = 0;
    spawnedInWave = 0;
    spawnTimer = 0;
    waveActive = false;

    if (isEndlessMode()) {
      wavePhase = 'preview';
      previewTimer = ENDLESS_PREVIEW_DURATION;
      const comp = describeEndlessWaveComposition(wave);
      runTowerRecommendationForWave(wave);
      wavePreview.show({
        ...comp,
        aiAdvice: `AI建议：优先建 ${ai.getTowerDisplayName(ai.towerRecommendation.primary)} — ${ai.towerRecommendation.reason}`
      });
      updateHud();
      return;
    }

    beginActiveWave();
  }

  function spawnEnemy() {
    const entry = spawnQueue[spawnedInWave];
    if (!entry) return;

    const spawned = createSpawnedEnemies(entry, {
      wave,
      mode: sessionMode,
      difficultyScale: getDifficultyScaleForWave(wave)
    });

    for (const enemy of spawned) {
      if (enemy.typeId === 'boss') {
        triggerScreenShake(0.3);
        audio?.enterBossBattle();
      }
      enemies.push(enemy);
    }

    spawnedInWave += 1;
  }

  function updateWavePreview(dt) {
    if (!isEndlessMode() || wavePhase !== 'preview' || gameOver) return;

    previewTimer -= dt;
    const elapsed = ENDLESS_PREVIEW_DURATION - previewTimer;
    wavePreview.setOpacity(getEndlessPreviewOpacity(elapsed));

    if (previewTimer > 0) return;

    beginActiveWave();
    updateHud();
  }

  function updateWaveSpawning(dt) {
    if (!waveActive || gameOver || wavePhase !== 'active' || allWavesComplete) return;
    if (spawnedInWave >= spawnQueue.length) {
      waveActive = false;
      return;
    }

    spawnTimer += dt;
    if (spawnTimer >= nextSpawnDelay) {
      spawnTimer = 0;
      spawnEnemy();
      nextSpawnDelay = rollNextSpawnDelay();
    }
  }

  function updateIntermission(dt) {
    if (wavePhase !== 'intermission' || gameOver) return;

    intermissionTimer -= dt;
    if (intermissionTimer > 0) return;

    wave += 1;
    if (isEndlessMode()) {
      audio?.setEndlessWave(wave);
      syncEndlessBestWave();
    }
    startWave();
  }

  function tryAdvanceWave() {
    if (gameOver || wavePhase !== 'active' || waveActive || allWavesComplete) return;
    if (enemies.some((enemy) => enemy.alive)) return;

    if (isEndlessMode() && wave % 10 === 0) {
      sessionGemsEarned += awardEndlessWaveGems(wave);
    }

    if (!isEndlessMode() && wave >= TOTAL_WAVES) {
      allWavesComplete = true;
      wavePhase = 'complete';
      reportVictoryIfNeeded();
      return;
    }

    if (waveStartTime > 0) {
      const clearTime = sessionElapsed - waveStartTime;
      waveClearTimes.push(clearTime);
      if (waveClearTimes.length > 3) waveClearTimes.shift();
    }

    runDifficultyAIAfterWave();

    if (isEndlessMode()) {
      syncEndlessBestWave();
    }

    const nextWave = wave + 1;
    if (!isEndlessMode() && nextWave <= TOTAL_WAVES) {
      const comp = describeCampaignWaveComposition(nextWave);
      runTowerRecommendationForWave(nextWave);
      wavePreview.show({
        ...comp,
        aiAdvice: `AI建议：优先建 ${ai.getTowerDisplayName(ai.towerRecommendation.primary)} — ${ai.towerRecommendation.reason}`
      });
      campaignPreviewShown = true;
    } else if (isEndlessMode()) {
      runTowerRecommendationForWave(nextWave);
    }

    wavePhase = 'intermission';
    intermissionTimer = isEndlessMode() ? getEndlessWaveIntermission(wave) : WAVE_INTERMISSION;
  }

  function screenToCell(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return {
      col: Math.floor(x / CELL),
      row: Math.floor(y / CELL)
    };
  }

  function towerAt(col, row) {
    return towers.find((tower) => tower.col === col && tower.row === row) || null;
  }

  function syncItemOverlayUi() {
    if (freezeCountdownEl) {
      if (timeFreezeRemaining > 0) {
        freezeCountdownEl.textContent = timeFreezeRemaining.toFixed(1);
        freezeCountdownEl.classList.remove('hidden');
      } else {
        freezeCountdownEl.classList.add('hidden');
      }
    }
    if (powerSurgeHudEl && powerSurgeFillEl) {
      if (powerSurgeRemaining > 0) {
        powerSurgeHudEl.classList.remove('hidden');
        powerSurgeFillEl.style.width = `${(powerSurgeRemaining / 8) * 100}%`;
      } else {
        powerSurgeHudEl.classList.add('hidden');
      }
    }
  }

  function updateGoldRainCoins(dt) {
    if (!goldRainActive || goldRainCoins.length === 0) return;
    const GRAV = 340;
    const floorY = CANVAS_H - 24;
    for (const c of goldRainCoins) {
      if (c.landed) continue;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += GRAV * dt;
      c.spin += dt * 6;
      if (c.y >= floorY) {
        c.y = floorY;
        if (Math.abs(c.vy) > 70) {
          c.vy = -Math.abs(c.vy) * 0.28;
          c.vx *= 0.82;
        } else {
          c.landed = true;
        }
      }
    }
    const anyFlying = goldRainCoins.some((c) => !c.landed);
    if (!anyFlying) {
      goldRainCoins = [];
      goldRainActive = false;
    }
  }

  function updateHud() {
    const progressState = isEndlessMode()
      ? getEndlessWaveProgressState({
          wave,
          wavePhase,
          waveEnemiesTotal,
          waveEnemiesCleared,
          intermissionTimer
        })
      : getWaveProgressState({
          wave,
          wavePhase,
          waveEnemiesTotal,
          waveEnemiesCleared,
          intermissionTimer
        });

    hud.update({
      gold,
      wave,
      totalWaves: isEndlessMode() ? '∞' : TOTAL_WAVES,
      lives,
      waveProgress: progressState.ratio,
      waveProgressLabel: progressState.label,
      showEndlessBadge: isEndlessMode(),
      showEndlessStats: isEndlessMode(),
      endlessBestWave: isEndlessMode() ? getEndlessBestWave(endlessMapId) : 0
    });
    towerBar.refresh();
    refreshTowerPanel();
    syncItemOverlayUi();
    itemSlotBar?.render(itemManager.getSnapshot());
  }

  function updateGameSpeed(realDt) {
    if (Math.abs(targetGameSpeed - gameSpeed) < 0.01) {
      gameSpeed = targetGameSpeed;
      return;
    }
    gameSpeed += (targetGameSpeed - gameSpeed) * (1 - Math.exp(-GAME_SPEED_TRANSITION * realDt));
  }

  function update(dt) {
    if (gameOver || paused || levelFinished) return;

    sessionElapsed += dt;

    updateWavePreview(dt);
    updateWaveSpawning(dt);
    updateIntermission(dt);

    if (wavePhase === 'active' && !paused) {
      waveActiveDuration += dt;
      for (const tower of towers) {
        if (tower.findNearestTarget(enemies)) {
          waveTowerBusyTime += dt;
        }
      }
    }

    ai.tickDisplayDifficulty(dt);
    if (difficultyPanel) {
      difficultyPanel.update(
        {
          features: ai.lastFeatures,
          scale: ai.displayDifficultyScale,
          label: ai.getDifficultyLabel(ai.displayDifficultyScale)
        },
        dt
      );
    }

    const worldFrozen = timeFreezeRemaining > 0;

    if (powerSurgeRemaining > 0) {
      powerSurgeRemaining -= dt;
      powerSurgePhase += dt;
      if (powerSurgeRemaining <= 0) {
        powerSurgeRemaining = 0;
        for (const tower of towers) {
          spawnOrangeBurst(tower.x, tower.y);
        }
      }
    } else {
      powerSurgePhase += dt * 0.2;
    }

    if (powerSurgeRippleT > 0) {
      powerSurgeRippleT = Math.max(0, powerSurgeRippleT - dt);
    }

    for (const tower of towers) {
      tower.fireRateMultiplier = powerSurgeRemaining > 0 ? 2 : 1;
    }

    updateGoldRainCoins(dt);

    for (const enemy of enemies) {
      if (enemy.typeId === 'stealth' && !worldFrozen) {
        const wasInvisible = enemy._audioWasInvisible ?? enemy.isInvisible;
        if (!wasInvisible && enemy.isInvisible) {
          audio?.playSound('stealth_vanish');
        } else if (wasInvisible && !enemy.isInvisible) {
          audio?.playSound('stealth_appear');
        }
        enemy._audioWasInvisible = enemy.isInvisible;
      }
      enemy.update(dt, damageNumbers, { worldFrozen });
    }

    if (worldFrozen) {
      timeFreezeRemaining -= dt;
      if (timeFreezeRemaining <= 0) {
        timeFreezeRemaining = 0;
        for (const enemy of enemies) {
          if (enemy.alive) {
            const p = enemy.position;
            spawnShatterParticles(p.x, p.y, 'rgba(174, 214, 241, 0.95)');
          }
        }
      }
    }

    for (const tower of towers) {
      tower.update(dt, enemies, bullets, muzzleFlashes, damageNumbers);
    }

    for (const bullet of bullets) {
      bullet.update(dt, enemies, ripples, damageNumbers);
    }

    for (const enemy of enemies) {
      if (!enemy.reachedEnd) continue;
      enemy.reachedEnd = false;
      radish.loseLife();
      lives = radish.lives;
      radishDamageCount += 1;
      currentWaveLeaks += 1;
      audio?.playSound('carrot_hurt');
      waveEnemiesCleared += 1;
      if (lives <= 0) {
        lives = 0;
        gameOver = true;
        finishLevel(false);
      }
    }

    reapDeadEnemies();
    bullets = bullets.filter((bullet) => bullet.alive);

    if (lightningFlashT > 0) {
      lightningFlashT = Math.max(0, lightningFlashT - dt);
    }
    for (const b of lightningBolts) {
      b.t += dt;
    }
    lightningBolts = lightningBolts.filter((b) => b.t < 0.2);

    tryAdvanceWave();
    reportVictoryIfNeeded();
    itemManager.update(dt);
    updateHud();
  }

  function renderGrid() {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * CELL;
        const y = row * CELL;
        const onPath = isPathCell(col, row);
        const onObstacle = isObstacleCell(col, row);
        if (onPath) {
          ctx.fillStyle = (col + row) % 2 === 0 ? mapTheme.path : mapTheme.pathDark;
        } else if (onObstacle) {
          ctx.fillStyle = (col + row) % 2 === 0
            ? (mapTheme.obstacle || '#5d4037')
            : (mapTheme.obstacleDark || '#4e342e');
        } else {
          ctx.fillStyle = (col + row) % 2 === 0 ? mapTheme.grass : mapTheme.grassDark;
        }
        ctx.fillRect(x, y, CELL, CELL);
      }
    }

    renderPathHighlights();
    renderObstacleDetails();
  }

  function renderPathHighlights() {
    const edgeColor = mapTheme.pathEdge || '#6d4c41';
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!isPathCell(col, row)) continue;
        const x = col * CELL;
        const y = row * CELL;

        if (!isPathCell(col - 1, row)) {
          ctx.beginPath();
          ctx.moveTo(x + 1, y);
          ctx.lineTo(x + 1, y + CELL);
          ctx.stroke();
        }
        if (!isPathCell(col + 1, row)) {
          ctx.beginPath();
          ctx.moveTo(x + CELL - 1, y);
          ctx.lineTo(x + CELL - 1, y + CELL);
          ctx.stroke();
        }
        if (!isPathCell(col, row - 1)) {
          ctx.beginPath();
          ctx.moveTo(x, y + 1);
          ctx.lineTo(x + CELL, y + 1);
          ctx.stroke();
        }
        if (!isPathCell(col, row + 1)) {
          ctx.beginPath();
          ctx.moveTo(x, y + CELL - 1);
          ctx.lineTo(x + CELL, y + CELL - 1);
          ctx.stroke();
        }
      }
    }

    if (getPathCells().length > 1) {
      const pathCells = getPathCells();
      const start = cellCenter(pathCells[0][0], pathCells[0][1]);
      const end = cellCenter(pathCells[pathCells.length - 1][0], pathCells[pathCells.length - 1][1]);
      ctx.fillStyle = 'rgba(46, 204, 113, 0.9)';
      ctx.beginPath();
      ctx.arc(start.x, start.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
      ctx.beginPath();
      ctx.arc(end.x, end.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function renderObstacleDetails() {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!isObstacleCell(col, row)) continue;
        const x = col * CELL + 8;
        const y = row * CELL + 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fillRect(x - 2, y + 10, CELL - 12, 8);
        ctx.fillStyle = mapTheme.obstacleDark || '#3e2723';
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = mapTheme.obstacle || '#5d4037';
        ctx.beginPath();
        ctx.arc(x + 6, y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 16, y + 8, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function renderPlacementPreview() {
    if (gameOver || paused || levelFinished || hoverCol < 0 || hoverRow < 0) return;
    if (!isGrassCell(hoverCol, hoverRow) || towerAt(hoverCol, hoverRow)) return;

    const config = TOWER_TYPES[selectedTowerType];
    const previewRange = config.range;
    const x = hoverCol * CELL;
    const y = hoverRow * CELL;
    const canAfford = gold >= config.cost;

    ctx.strokeStyle = canAfford ? 'rgba(241, 196, 15, 0.9)' : 'rgba(231, 76, 60, 0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, CELL - 4, CELL - 4);

    const center = cellCenter(hoverCol, hoverRow);
    ctx.beginPath();
    ctx.arc(center.x, center.y, previewRange, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.towerRange;
    ctx.fill();
  }

  function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.save();
    if (screenShakeTimer > 0) {
      const shake = (Math.random() * 2 - 1) * 3;
      ctx.translate(shake, shake);
    }

    renderGrid();
    renderPlacementPreview();

    if (powerSurgeRippleT > 0 || powerSurgeRemaining > 0) {
      const rippleProg = 1 - powerSurgeRippleT / 0.45;
      if (powerSurgeRippleT > 0) {
        for (const tower of towers) {
          const r = 24 + rippleProg * 100;
          ctx.strokeStyle = `rgba(230, 126, 34, ${0.55 * (1 - rippleProg)})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(tower.x, tower.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      if (powerSurgeRemaining > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(powerSurgePhase * 7);
        for (const tower of towers) {
          ctx.fillStyle = `rgba(230, 126, 34, ${0.07 + pulse * 0.06})`;
          ctx.beginPath();
          ctx.arc(tower.x, tower.y, tower.radius + 10 + pulse * 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(241, 196, 15, ${0.4 + pulse * 0.35})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tower.x, tower.y, tower.radius + 10 + pulse * 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    for (const tower of towers) {
      const showRange = tower === selectedTower;
      tower.render(ctx, showRange);
    }

    for (const flash of muzzleFlashes) {
      flash.render(ctx);
    }

    for (const enemy of enemies) {
      enemy.render(ctx);
      if (timeFreezeRemaining > 0 && enemy.alive && !enemy.ignoresWorldFreeze?.()) {
        const { x, y } = enemy.position;
        drawIceLayer(ctx, x, y, enemy.radius);
      }
    }

    for (const particle of particles) {
      particle.render(ctx);
    }

    for (const bullet of bullets) {
      bullet.render(ctx);
    }

    for (const ripple of ripples) {
      ripple.render(ctx);
    }

    for (const number of damageNumbers) {
      number.render(ctx);
    }

    if (goldRainCoins.length > 0) {
      for (const c of goldRainCoins) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.spin || 0);
        ctx.fillStyle = '#f4d03f';
        ctx.strokeStyle = '#b7950b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#9a7d0a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('¥', 0, 0);
        ctx.restore();
      }
    }

    radish.render(ctx);

    if (timeFreezeRemaining > 0) {
      drawFreezeBorder(ctx);
    }

    if (lightningBolts.length > 0) {
      for (const b of lightningBolts) {
        const p = Math.min(1, b.t / 0.2);
        const y = b.ty * p;
        ctx.strokeStyle = `rgba(241, 196, 15, ${0.4 + 0.5 * (1 - p)})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(b.tx, 0);
        ctx.lineTo(b.tx, y);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 220, ${0.75 * (1 - p)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(b.tx, 0);
        ctx.lineTo(b.tx, y);
        ctx.stroke();
      }
    }

    if (lightningFlashT > 0) {
      const alpha = 0.8 * (lightningFlashT / 0.3);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    if (paused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = COLORS.text;
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('已暂停', CANVAS_W / 2, CANVAS_H / 2);
    }
    ctx.restore();
  }

  canvas.addEventListener('mousemove', (event) => {
    const { col, row } = screenToCell(event.clientX, event.clientY);
    hoverCol = col;
    hoverRow = row;
  });

  canvas.addEventListener('mouseleave', () => {
    hoverCol = -1;
    hoverRow = -1;
  });

  canvas.addEventListener('click', () => {
    if (gameOver || paused || levelFinished) return;
    if (!isGrassCell(hoverCol, hoverRow)) return;

    const existingTower = towerAt(hoverCol, hoverRow);
    if (existingTower) {
      selectTower(existingTower);
      return;
    }

    clearTowerSelection();

    const config = TOWER_TYPES[selectedTowerType];
    if (gold < config.cost) return;

    gold -= config.cost;
    totalGoldSpent += config.cost;
    towers.push(createTower(hoverCol, hoverRow, selectedTowerType, battleModifiers));
    runTowerRecommendationForWave(wave);
    audio?.playSound('placeTower');
    updateHud();
  });

  let lastTime = performance.now();

  function loop(now) {
    if (!running) return;
    const realDt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    updateGameSpeed(realDt);
    const dt = realDt * gameSpeed;
    radish.update(dt);
    if (!paused) {
      update(dt);
    }
    if (screenShakeTimer > 0) {
      screenShakeTimer = Math.max(0, screenShakeTimer - realDt);
    }
    particles = particles.filter((particle) => particle.update(dt));
    muzzleFlashes = muzzleFlashes.filter((flash) => flash.update(dt));
    ripples = ripples.filter((ripple) => ripple.update(dt));
    damageNumbers = damageNumbers.filter((number) => number.update(dt));
    render();
    animationFrameId = requestAnimationFrame(loop);
  }

  return {
    setSelectedTowerType(typeId) {
      selectedTowerType = typeId;
      if (!gameOver && !levelFinished) {
        runTowerRecommendationForWave(wave);
      }
    },
    getGameAI() {
      return ai;
    },
    getGold() {
      return gold;
    },
    useItemSlot(index) {
      if (gameOver || paused || levelFinished) return;
      const result = itemManager.tryUseSlot(index);
      if (result === 'cooldown') {
        audio?.playSound('no_gold');
      }
      updateHud();
    },
    pause() {
      if (gameOver || paused || levelFinished) return;
      if (!isEndlessMode() && allWavesComplete) return;
      paused = true;
      gameControls.setPaused(true);
      persistMidGameSave();
    },
    resume() {
      if (!paused) return;
      paused = false;
      lastTime = performance.now();
      gameControls.setPaused(false);
    },
    restart() {
      if (levelFinished) return;
      resetGameState();
    },
    retryLevel() {
      resultScreen.hide();
      levelFinished = false;
      resetGameState();
    },
    stop() {
      running = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
    },
    startCampaignLevel(levelId, opts = {}) {
      loadCampaignLevel(levelId);
      if (opts.resumeFromSave) {
        const doc = loadModeSession('campaign');
        if (doc && sessionMatchesStart(doc, { mode: 'campaign', levelId, mapId: null })) {
          applyBattleSnapshot(doc.snapshot);
          if (!running) {
            running = true;
            lastTime = performance.now();
            animationFrameId = requestAnimationFrame(loop);
            return;
          }
          lastTime = performance.now();
          return;
        }
      }
      resetGameState();
      if (!running) {
        running = true;
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      lastTime = performance.now();
    },
    startEndlessMap(mapId, opts = {}) {
      loadEndlessMap(mapId);
      if (opts.resumeFromSave) {
        const doc = loadModeSession('endless');
        if (doc && sessionMatchesStart(doc, { mode: 'endless', levelId: null, mapId })) {
          applyBattleSnapshot(doc.snapshot);
          if (!running) {
            running = true;
            lastTime = performance.now();
            animationFrameId = requestAnimationFrame(loop);
            return;
          }
          lastTime = performance.now();
          return;
        }
      }
      resetGameState();
      if (!running) {
        running = true;
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(loop);
        return;
      }
      lastTime = performance.now();
    },
    getSessionMode() {
      return sessionMode;
    },
    clearTowerSelection() {
      selectedTower = null;
      towerPanel.hide();
    },
    upgradeSelectedTower() {
      if (gameOver || paused || levelFinished || !selectedTower || !selectedTower.canUpgrade()) return;

      const cost = selectedTower.upgradeCost;
      if (gold < cost) return;

      gold -= cost;
      totalGoldSpent += cost;
      selectedTower.upgrade();
      audio?.playSound('upgrade');
      refreshTowerPanel();
      updateHud();
    },
    sellSelectedTower() {
      if (gameOver || paused || levelFinished || !selectedTower) return;

      const sellValue = selectedTower.getSellValue();
      gold += sellValue;
      totalGoldEarned += sellValue;
      towers = towers.filter((tower) => tower !== selectedTower);
      clearTowerSelection();
      updateHud();
    },
    setTargetGameSpeed(speed) {
      targetGameSpeed = speed;
    },
    persistMidGameSave,
    clearSessionSave(mode) {
      clearModeSession(mode ?? sessionMode);
    },
    shouldOfferResumeFor({ mode, levelId, mapId }) {
      return hasModeSession(mode, { levelId, mapId });
    }
  };
}
