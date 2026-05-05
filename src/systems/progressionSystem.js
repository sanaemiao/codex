const config = require('../config/gameConfig');

const upgradeOptions = [
  { label: '攻击 +8', desc: '提升子弹伤害', idx: 0 },
  { label: '射速提升', desc: '更频繁自动攻击', idx: 1 },
  { label: '生命 +20', desc: '提高生存能力', idx: 2 },
  { label: '穿透 +1', desc: '子弹可穿透更多敌人', idx: 3 },
];

function updatePickups(state) {
  const { pickups, player } = state;
  for (let i = pickups.length - 1; i >= 0; i -= 1) {
    const p = pickups[i];
    if (Math.hypot(p.x - player.x, p.y - player.y) < p.r + player.r) {
      if (p.type === 'heal') {
        player.hp = Math.min(player.maxHp, player.hp + 18);
      } else {
        state.score += config.progression.xpDropScore;
        if (state.score >= state.level * config.progression.levelScoreFactor) {
          state.level += 1;
          state.upgradePending = true;
        }
      }
      pickups.splice(i, 1);
    }
  }
}

function applyUpgrade(state, choice) {
  const { player } = state;
  if (choice === 0) player.damage += 8;
  if (choice === 1) player.fireRate = Math.max(4, player.fireRate - 2);
  if (choice === 2) { player.maxHp += 20; player.hp += 20; }
  if (choice === 3) player.pierce += 1;
  state.upgradePending = false;
}

module.exports = { upgradeOptions, updatePickups, applyUpgrade };
