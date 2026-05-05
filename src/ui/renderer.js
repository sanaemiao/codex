const { upgradeOptions } = require('../systems/progressionSystem');

function drawCircle(ctx, color, x, y, r) {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawButton(ctx, x, y, w, h, text, color = '#1f6feb') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#fff';
  ctx.font = '26px sans-serif';
  ctx.fillText(text, x + 20, y + 42);
}

function renderRunning(ctx, state, profile) {
  const { width, height, pickups, enemies, bullets, player, joystick } = state;
  ctx.fillStyle = '#111318';
  ctx.fillRect(0, 0, width, height);
  pickups.forEach((p) => drawCircle(ctx, p.type === 'heal' ? '#30d158' : '#ffd60a', p.x, p.y, p.r));
  enemies.forEach((e) => drawCircle(ctx, e.color, e.x, e.y, e.r));
  bullets.forEach((b) => drawCircle(ctx, '#4cc9f0', b.x, b.y, b.r));
  drawCircle(ctx, '#f5f5f7', player.x, player.y, player.r);

  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText(`分数: ${state.score}  等级: ${state.level}`, 20, 36);
  ctx.fillText(`金币: ${profile.coins}  历史: ${profile.bestScore}`, 20, 64);
  ctx.fillStyle = '#2a2d34';
  ctx.fillRect(20, 80, 220, 16);
  ctx.fillStyle = '#30d158';
  ctx.fillRect(20, 80, 220 * (player.hp / player.maxHp), 16);

  ctx.globalAlpha = 0.35;
  drawCircle(ctx, '#8e8e93', joystick.baseX, joystick.baseY, joystick.radius);
  drawCircle(ctx, '#d1d1d6', joystick.x, joystick.y, joystick.knob);
  ctx.globalAlpha = 1;

  if (state.upgradePending) {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px sans-serif';
    ctx.fillText('升级选择', width / 2 - 60, 130);
    upgradeOptions.forEach((opt, i) => {
      const y = 190 + i * 110;
      drawButton(ctx, 50, y, width - 100, 90, opt.label);
      ctx.font = '20px sans-serif';
      ctx.fillText(opt.desc, 70, y + 70);
    });
  }
}

function renderMenu(ctx, state, profile) {
  const { width, height } = state;
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.font = '42px sans-serif';
  ctx.fillText('肉鸽生存', width / 2 - 90, 120);
  ctx.font = '26px sans-serif';
  ctx.fillText(`金币: ${profile.coins}   历史最高: ${profile.bestScore}`, 40, 170);
  ctx.fillText(`局外成长 攻击Lv${profile.atkLv}  生命Lv${profile.hpLv}  射速Lv${profile.fireLv}`, 40, 210);

  drawButton(ctx, 40, height - 320, 260, 60, `升级攻击`);
  drawButton(ctx, 40, height - 250, 260, 60, `升级生命`);
  drawButton(ctx, 40, height - 180, 260, 60, `升级射速`);
  if (state.toast) {
    ctx.fillStyle = '#ffb86b';
    ctx.font = '20px sans-serif';
    ctx.fillText(state.toast, 40, height - 340);
  }
  drawButton(ctx, width / 2 - 120, height - 220, 240, 70, '开始游戏', '#238636');
}

function renderDead(ctx, state) {
  const { width, height } = state;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#fff';
  ctx.font = '38px sans-serif';
  ctx.fillText('你倒下了', width / 2 - 80, height / 2 - 40);
  ctx.font = '24px sans-serif';
  ctx.fillText(`本局得分: ${state.score}  获得金币: +${state.settlementGain || 0}`, width / 2 - 150, height / 2);
  if (!state.reviveUsed) drawButton(ctx, width / 2 - 140, height / 2 + 40, 280, 70, state.adLoading ? '广告加载中...' : '看广告复活');
  if (state.toast) {
    ctx.fillStyle = '#ffb86b';
    ctx.font = '20px sans-serif';
    ctx.fillText(state.toast, width / 2 - 140, height / 2 + 28);
  }
  drawButton(ctx, width / 2 - 120, height / 2 + 130, 240, 70, '返回主菜单', '#6e7681');
}

function render(ctx, state, profile) {
  if (state.scene === 'menu') return renderMenu(ctx, state, profile);
  renderRunning(ctx, state, profile);
  if (state.scene === 'dead') renderDead(ctx, state);
}

module.exports = { render };
