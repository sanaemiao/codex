module.exports = {
  design: {
    joystick: { baseOffsetX: 120, baseOffsetY: 180, radius: 70, knobRadius: 35 },
  },
  player: {
    radius: 22,
    hp: 100,
    speed: 5,
    fireRate: 12,
    damage: 20,
  },
  enemy: {
    baseRadius: 18,
    baseHp: 30,
    hpGrowth: 8,
    baseSpeed: 1.2,
    speedGrowth: 0.08,
    baseDamage: 8,
  },
  progression: {
    xpDropScore: 15,
    killScore: 10,
    levelScoreFactor: 220,
  },
};
