import { createGame } from './game.js';
import { createEndlessMapSelect } from './ui/endlessMapSelect.js';
import { createGameControls } from './ui/gameControls.js';
import { createHud } from './ui/hud.js';
import { createLevelSelect } from './ui/levelSelect.js';
import { createMainMenu } from './ui/mainMenu.js';
import { createResultScreen } from './ui/resultScreen.js';
import { createAudioControls } from './ui/audioControls.js';
import { createSpeedControls } from './ui/speedControls.js';
import { createTowerBar } from './ui/towerBar.js';
import { createTowerPanel } from './ui/towerPanel.js';
import { createWavePreview } from './ui/wavePreview.js';
import { recordLevelVictory } from './storage/levelProgress.js';
import { getGemBalance } from './storage/gemInventory.js';
import { setItemLoadout } from './storage/itemLoadout.js';
import { clearSessionDocument, loadSessionDocument, sessionMatchesStart } from './storage/sessionSave.js';
import { audioManager } from './audio/index.js';
import { createGemShop } from './ui/gemShop.js';
import { createItemLoadoutModal } from './ui/itemLoadoutModal.js';
import { createItemSlotBar } from './ui/itemSlotBar.js';
import { GameAI } from './ai/GameAI.js';
import { createDifficultyPanel } from './ui/difficultyPanel.js';
import { createAiInfoModal } from './ui/aiInfoModal.js';

audioManager.bindUserGesture();

const gameAI = new GameAI();
gameAI.trainAll();

const aiInfoModal = createAiInfoModal();
aiInfoModal.mount(document.body);

const difficultyPanel = createDifficultyPanel();
difficultyPanel.mount(document.getElementById('ai-difficulty-mount'));

const mainMenuScreen = document.getElementById('main-menu');
const mainMenuMadeByEl = document.getElementById('main-menu-made-by');
const levelSelectScreen = document.getElementById('level-select');
const endlessSelectScreen = document.getElementById('endless-select');
const gameScreen = document.getElementById('game-screen');
const canvas = document.getElementById('game');

const screens = [mainMenuScreen, levelSelectScreen, endlessSelectScreen, gameScreen];

const hud = createHud({
  goldEl: document.getElementById('gold'),
  waveEl: document.getElementById('wave'),
  waveTotalEl: document.getElementById('wave-total'),
  livesEl: document.getElementById('lives'),
  waveProgressFillEl: document.getElementById('wave-progress-fill'),
  waveProgressLabelEl: document.getElementById('wave-progress-label'),
  modeBadgeEl: document.getElementById('mode-badge'),
  endlessStatsEl: document.getElementById('endless-stats'),
  endlessWaveEl: document.getElementById('endless-wave'),
  endlessBestEl: document.getElementById('endless-best')
});

let mainMenu = null;
let gemShop = null;

let pendingGameStart = null;

const itemLoadoutModal = createItemLoadoutModal(document.body, {
  onConfirm: (ids) => {
    setItemLoadout(ids);
    const next = pendingGameStart;
    pendingGameStart = null;
    if (!next) return;
    let resumeFromSave = false;
    if (game.shouldOfferResumeFor?.(next)) {
      if (
        window.confirm(
          '检测到上次中断的游戏进度（暂停或离开地图时已保存），是否继续？\n确定：继续上次进度\n取消：重新开始本关'
        )
      ) {
        resumeFromSave = true;
      } else {
        game.clearSessionSave?.();
      }
    }
    showGame({ ...next, resumeFromSave });
  },
  onCancel: () => {
    pendingGameStart = null;
  }
});

function openItemLoadoutConfigureOnly() {
  pendingGameStart = null;
  itemLoadoutModal.open();
}

mainMenu = createMainMenu(mainMenuScreen, {
  onCampaign: () => {
    audioManager.playSound('uiClick');
    showScreen('campaign');
  },
  onEndless: () => {
    audioManager.playSound('uiClick');
    showScreen('endless');
  },
  onShop: () => {
    audioManager.playSound('uiClick');
    gemShop.open();
  },
  onAiInfo: () => {
    audioManager.playSound('uiClick');
    aiInfoModal.open();
  },
  getGemBalance
});

createAudioControls(document.getElementById('menu-audio-controls'), audioManager);

gemShop = createGemShop(document.getElementById('gem-shop'), {
  onChange: () => mainMenu?.refresh()
});

const levelSelect = createLevelSelect(levelSelectScreen, {
  onSelectLevel: (levelId) => {
    audioManager.playSound('uiClick');
    pendingGameStart = { mode: 'campaign', levelId };
    itemLoadoutModal.open();
  },
  onBack: () => showScreen('menu'),
  onConfigureItems: () => {
    audioManager.playSound('uiClick');
    openItemLoadoutConfigureOnly();
  }
});

createEndlessMapSelect(endlessSelectScreen, {
  onSelectMap: (mapId) => {
    audioManager.playSound('uiClick');
    pendingGameStart = { mode: 'endless', mapId };
    itemLoadoutModal.open();
  },
  onBack: () => showScreen('menu'),
  onConfigureItems: () => {
    audioManager.playSound('uiClick');
    openItemLoadoutConfigureOnly();
  }
});

const resultScreen = createResultScreen(document.getElementById('result-screen'), {
  onRetry: () => game.retryLevel(),
  onBackToMap: () => showMapForSession(),
  onStarEarn: (index) => audioManager.playSound(`star_earn_${index}`)
});

const wavePreview = createWavePreview(document.getElementById('wave-preview'));

createAudioControls(document.getElementById('audio-controls'), audioManager);

const itemSlotWrap = document.getElementById('item-slot-wrap');
const freezeCountdownEl = document.getElementById('freeze-countdown');
const powerSurgeHudEl = document.getElementById('power-surge-hud');
const powerSurgeFillEl = document.getElementById('power-surge-fill');

let game;
const itemSlotBar = createItemSlotBar(itemSlotWrap, {
  onUseSlot: (index) => {
    game.useItemSlot(index);
  }
});

game = createGame({
  canvas,
  hud,
  towerBar: createTowerBar(document.getElementById('tower-bar'), {
    onSelect: (typeId) => game.setSelectedTowerType(typeId),
    getGold: () => game.getGold(),
    onClosePanel: () => game.clearTowerSelection()
  }),
  towerPanel: createTowerPanel(document.getElementById('tower-panel'), {
    onUpgrade: () => game.upgradeSelectedTower(),
    onSell: () => game.sellSelectedTower(),
    onClose: () => game.clearTowerSelection()
  }),
  gameControls: createGameControls(document.getElementById('game-controls'), {
    onPause: () => game.pause(),
    onResume: () => game.resume(),
    onRestart: () => game.restart(),
    onBackToMap: () => showMapForSession()
  }),
  speedControls: createSpeedControls(document.getElementById('speed-controls'), {
    onSelect: (speed) => game.setTargetGameSpeed(speed)
  }),
  resultScreen,
  wavePreview,
  itemSlotBar,
  freezeCountdownEl,
  powerSurgeHudEl,
  powerSurgeFillEl,
  audioManager,
  gameAI,
  difficultyPanel,
  onLevelEnd: ({ mode, levelId, success, stars }) => {
    if (mode === 'campaign' && success) {
      recordLevelVictory(levelId, stars);
    }
  }
});

window.addEventListener('keydown', (event) => {
  if (!document.body.classList.contains('in-game')) return;
  if (event.repeat) return;
  if (event.code === 'KeyQ') {
    event.preventDefault();
    game.useItemSlot(0);
  } else if (event.code === 'KeyE') {
    event.preventDefault();
    game.useItemSlot(1);
  }
});

gameScreen.addEventListener('click', (event) => {
  const panel = document.getElementById('tower-panel');
  if (!panel || panel.classList.contains('hidden')) return;
  if (event.target.closest('#tower-panel')) return;
  if (event.target.closest('#tower-bar')) return;
  if (event.target.closest('#game')) return;
  if (event.target.closest('#item-slot-wrap')) return;
  game.clearTowerSelection();
});

function hideAllScreens() {
  for (const screen of screens) {
    screen.classList.add('hidden');
  }
  mainMenuMadeByEl?.classList.add('hidden');
}

function showScreen(screenName) {
  resultScreen.hide();
  if (document.body.classList.contains('in-game')) {
    game.persistMidGameSave?.();
  }
  game.stop();
  gemShop.close();
  hideAllScreens();
  document.body.classList.remove('in-game');
  difficultyPanel.hide();
  gameScreen.classList.remove('is-endless');

  if (screenName === 'menu') {
    mainMenuScreen.classList.remove('hidden');
    mainMenuMadeByEl?.classList.remove('hidden');
    mainMenu.refresh();
    gemShop.close();
    audioManager.setBGM('mainMenuBGM');
    return;
  }

  if (screenName === 'campaign') {
    levelSelectScreen.classList.remove('hidden');
    levelSelect.render();
    audioManager.setBGM('mainMenuBGM');
    return;
  }

  if (screenName === 'endless') {
    endlessSelectScreen.classList.remove('hidden');
    audioManager.setBGM('mainMenuBGM');
  }
}

function showMapForSession() {
  if (game.getSessionMode() === 'endless') {
    showScreen('endless');
    return;
  }
  showScreen('campaign');
}

function showGame(next) {
  const { mode, levelId, mapId, resumeFromSave } = next;
  resultScreen.hide();
  gemShop.close();
  if (!resumeFromSave) {
    const doc = loadSessionDocument();
    if (doc && !sessionMatchesStart(doc, { mode, levelId: levelId ?? null, mapId: mapId ?? null })) {
      clearSessionDocument();
    }
  }
  hideAllScreens();
  gameScreen.classList.remove('hidden');
  gameScreen.classList.toggle('is-endless', mode === 'endless');
  document.body.classList.add('in-game');
  difficultyPanel.show();
  difficultyPanel.update({
    features: gameAI.lastFeatures,
    scale: gameAI.displayDifficultyScale,
    label: gameAI.getDifficultyLabel()
  });

  if (mode === 'endless') {
    const doc = resumeFromSave ? loadSessionDocument() : null;
    const waveForBgm = doc?.snapshot?.wave ?? 1;
    audioManager.setBGM('endlessBGM', { wave: waveForBgm });
    game.startEndlessMap(mapId, { resumeFromSave: Boolean(resumeFromSave) });
    return;
  }

  audioManager.setBGM('stageBGM');
  game.startCampaignLevel(levelId, { resumeFromSave: Boolean(resumeFromSave) });
}

audioManager.setBGM('mainMenuBGM');
showScreen('menu');

window.addEventListener('pagehide', () => {
  if (document.body.classList.contains('in-game')) {
    game.persistMidGameSave?.();
  }
});
