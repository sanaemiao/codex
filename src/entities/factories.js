const config = require('../config/gameConfig');

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function createEnemy(level, width, height) {
  const edge = Math.floor(rand(0, 4));
  let x = 0;
  let y = 0;
  if (edge === 0) { x = rand(0, width); y = -30; }
  if (edge === 1) { x = width + 30; y = rand(0, height); }
  if (edge === 2) { x = rand(0, width); y = height + 30; }
  if (edge === 3) { x = -30; y = rand(0, height); }

  return {
    x,
    y,
    r: config.enemy.baseRadius,
    hp: config.enemy.baseHp + level * config.enemy.hpGrowth,
    speed: config.enemy.baseSpeed + level * config.enemy.speedGrowth,
    dmg: config.enemy.baseDamage + level,
    color: `hsl(${Math.floor(rand(0, 360))},70%,55%)`,
  };
}

function createPickup(x, y) {
  return { x, y, r: 14, type: Math.random() < 0.65 ? 'xp' : 'heal' };
}

module.exports = { createEnemy, createPickup };
