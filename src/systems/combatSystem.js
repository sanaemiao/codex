const config = require('../config/gameConfig');
const { createPickup } = require('../entities/factories');

function autoShoot(state) {
  const { player, enemies, bullets } = state;
  if (player.fireCooldown > 0) {
    player.fireCooldown -= 1;
    return;
  }
  if (!enemies.length) return;

  let target = enemies[0];
  let best = Infinity;
  enemies.forEach((e) => {
    const d = (e.x - player.x) ** 2 + (e.y - player.y) ** 2;
    if (d < best) { best = d; target = e; }
  });

  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const len = Math.hypot(dx, dy) || 1;
  bullets.push({
    x: player.x,
    y: player.y,
    vx: (dx / len) * 9,
    vy: (dy / len) * 9,
    r: 6,
    dmg: player.damage,
    pierce: player.pierce,
  });
  player.fireCooldown = player.fireRate;
}

function updateBullets(state) {
  const { bullets, enemies, pickups, width, height } = state;
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;

    if (b.x < -20 || b.x > width + 20 || b.y < -20 || b.y > height + 20) {
      bullets.splice(i, 1);
      continue;
    }

    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const e = enemies[j];
      if (Math.hypot(b.x - e.x, b.y - e.y) < b.r + e.r) {
        e.hp -= b.dmg;
        if (e.hp <= 0) {
          pickups.push(createPickup(e.x, e.y));
          enemies.splice(j, 1);
          state.score += config.progression.killScore;
        }
        if (b.pierce > 0) b.pierce -= 1;
        else { bullets.splice(i, 1); break; }
      }
    }
  }
}

module.exports = { autoShoot, updateBullets };
