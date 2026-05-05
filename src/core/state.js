const config = require('../config/gameConfig');

function createState(width, height) {
  return {
    width,
    height,
    running: true,
    score: 0,
    level: 1,
    time: 0,
    upgradePending: false,
    spawnTimer: 0,
    player: {
      x: width / 2,
      y: height / 2,
      r: config.player.radius,
      hp: config.player.hp,
      maxHp: config.player.hp,
      speed: config.player.speed,
      fireCooldown: 0,
      fireRate: config.player.fireRate,
      damage: config.player.damage,
      pierce: 0,
    },
    joystick: {
      active: false,
      baseX: config.design.joystick.baseOffsetX,
      baseY: height - config.design.joystick.baseOffsetY,
      x: config.design.joystick.baseOffsetX,
      y: height - config.design.joystick.baseOffsetY,
      radius: config.design.joystick.radius,
      knob: config.design.joystick.knobRadius,
      vx: 0,
      vy: 0,
    },
    bullets: [],
    enemies: [],
    pickups: [],
  };
}

module.exports = { createState };
