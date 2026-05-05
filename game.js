const { createState } = require('./src/core/state');
const { createEnemy } = require('./src/entities/factories');
const { autoShoot, updateBullets } = require('./src/systems/combatSystem');
const { movePlayer, moveEnemies } = require('./src/systems/movementSystem');
const { updatePickups, applyUpgrade, upgradeOptions } = require('./src/systems/progressionSystem');
const { render } = require('./src/ui/renderer');
const { initAd, showReviveAd } = require('./src/services/adService');
const { loadProfile, saveProfile, applyMetaToState, rewardSettlement, tryUpgrade, getUpgradeCost, MAX_LV } = require('./src/meta/profile');

const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');
const width = canvas.width = wx.getSystemInfoSync().windowWidth;
const height = canvas.height = wx.getSystemInfoSync().windowHeight;

const profile = loadProfile();
let state = createState(width, height);
applyMetaToState(profile, state);
state.scene = 'menu';
state.settlementGain = 0;
state.reviveUsed = false;
state.adLoading = false;
state.toast = '';
state.toastUntil = 0;

initAd();

function startRun() {
  state = createState(width, height);
  applyMetaToState(profile, state);
  state.scene = 'running';
  state.settlementGain = 0;
  state.reviveUsed = false;
  state.adLoading = false;
  state.toast = '';
  state.toastUntil = 0;
}

function settleRun() {
  if (state.scene === 'dead') return;
  state.scene = 'dead';
  state.settlementGain = rewardSettlement(profile, state.score);
  saveProfile(profile);
}

function update() {
  if (state.scene !== 'running' || state.upgradePending) return;
  state.time += 1;
  movePlayer(state);
  autoShoot(state);
  updateBullets(state);
  moveEnemies(state);
  updatePickups(state);

  if (!state.running) {
    settleRun();
    return;
  }

  state.spawnTimer -= 1;
  if (state.spawnTimer <= 0) {
    state.enemies.push(createEnemy(state.level, width, height));
    state.spawnTimer = Math.max(10, 45 - state.level * 2);
  }
}

function inRect(t, x, y, w, h) { return t.x >= x && t.x <= x + w && t.y >= y && t.y <= y + h; }

function setToast(msg) {
  state.toast = msg;
  state.toastUntil = Date.now() + 1400;
}

function handleMenuTap(t) {
  if (inRect(t, width / 2 - 120, height - 220, 240, 70)) startRun();
  if (inRect(t, 40, height - 320, 260, 60)) {
    if (tryUpgrade(profile, 'atk')) saveProfile(profile); else setToast(`升级失败(需${getUpgradeCost(profile,'atk')}金币或已满级${MAX_LV})`);
  }
  if (inRect(t, 40, height - 250, 260, 60)) {
    if (tryUpgrade(profile, 'hp')) saveProfile(profile); else setToast(`升级失败(需${getUpgradeCost(profile,'hp')}金币或已满级${MAX_LV})`);
  }
  if (inRect(t, 40, height - 180, 260, 60)) {
    if (tryUpgrade(profile, 'fire')) saveProfile(profile); else setToast(`升级失败(需${getUpgradeCost(profile,'fire')}金币或已满级${MAX_LV})`);
  }
}

async function handleDeadTap(t) {
  if (!state.reviveUsed && !state.adLoading && inRect(t, width / 2 - 140, height / 2 + 40, 280, 70)) {
    state.adLoading = true;
    const result = await showReviveAd();
    state.adLoading = false;
    if (result.ok) {
      state.running = true;
      state.scene = 'running';
      state.reviveUsed = true;
      state.player.hp = Math.max(30, state.player.maxHp * 0.4);
      return;
    }
    setToast(result.reason === 'ad_unavailable' ? '广告暂不可用，请稍后重试' : '广告未看完，无法复活');
  }
  if (inRect(t, width / 2 - 120, height / 2 + 130, 240, 70)) state.scene = 'menu';
}

function loop() {
  update();
  if (state.toastUntil && Date.now() > state.toastUntil) state.toast = '';
  render(ctx, state, profile);
  canvas.requestAnimationFrame(loop);
}

wx.onTouchStart((e) => {
  const t = e.touches[0];
  if (state.scene === 'menu') return handleMenuTap(t);
  if (state.scene === 'dead') return handleDeadTap(t);

  if (state.upgradePending) {
    upgradeOptions.forEach((b, i) => {
      const y = 190 + i * 110;
      if (t.x >= 50 && t.x <= width - 50 && t.y >= y && t.y <= y + 90) applyUpgrade(state, b.idx);
    });
    return;
  }

  const d = Math.hypot(t.x - state.joystick.baseX, t.y - state.joystick.baseY);
  if (d <= state.joystick.radius * 1.6) {
    state.joystick.active = true;
    state.joystick.x = t.x;
    state.joystick.y = t.y;
  }
});

wx.onTouchMove((e) => {
  if (!state.joystick.active || state.scene !== 'running' || state.upgradePending) return;
  const t = e.touches[0];
  const dx = t.x - state.joystick.baseX;
  const dy = t.y - state.joystick.baseY;
  const len = Math.hypot(dx, dy) || 1;
  const lim = state.joystick.radius;
  const k = Math.min(1, lim / len);
  state.joystick.x = state.joystick.baseX + dx * k;
  state.joystick.y = state.joystick.baseY + dy * k;
  state.joystick.vx = (state.joystick.x - state.joystick.baseX) / lim;
  state.joystick.vy = (state.joystick.y - state.joystick.baseY) / lim;
});

wx.onTouchEnd(() => {
  state.joystick.active = false;
  state.joystick.x = state.joystick.baseX;
  state.joystick.y = state.joystick.baseY;
  state.joystick.vx = 0;
  state.joystick.vy = 0;
});

loop();
