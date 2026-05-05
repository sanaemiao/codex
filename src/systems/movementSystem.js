function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function movePlayer(state) {
  const { player, joystick, width, height } = state;
  player.x = clamp(player.x + joystick.vx * player.speed, player.r, width - player.r);
  player.y = clamp(player.y + joystick.vy * player.speed, player.r, height - player.r);
}

function moveEnemies(state) {
  const { enemies, player } = state;
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const e = enemies[i];
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const len = Math.hypot(dx, dy) || 1;
    e.x += (dx / len) * e.speed;
    e.y += (dy / len) * e.speed;
    if (len < player.r + e.r) {
      player.hp -= 0.25 * e.dmg;
      if (player.hp <= 0) state.running = false;
    }
  }
}

module.exports = { movePlayer, moveEnemies };
