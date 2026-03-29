const UI = {
  // Pixel-style text
  drawText(ctx, text, x, y, size, color, align) {
    ctx.save();
    ctx.font = `bold ${size}px monospace`;
    ctx.fillStyle = color || '#fff';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    // Shadow
    ctx.fillStyle = '#000';
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = color || '#fff';
    ctx.fillText(text, x, y);
    ctx.restore();
  },

  drawHUD(ctx, player, time, gold, waveCount) {
    const W = ctx.canvas.width;

    // HP bar
    const hpW = 160, hpH = 14;
    ctx.fillStyle = '#111';
    ctx.fillRect(10, 10, hpW, hpH);
    const hpColor = player.hp > player.maxHp * 0.5 ? '#2ecc71' : player.hp > player.maxHp * 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillStyle = hpColor;
    ctx.fillRect(10, 10, hpW * (player.hp / player.maxHp), hpH);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, hpW, hpH);
    this.drawText(ctx, `HP ${Math.ceil(player.hp)}/${player.maxHp}`, 14, 17, 9, '#fff');

    // XP bar
    const xpW = 160, xpH = 8;
    ctx.fillStyle = '#111';
    ctx.fillRect(10, 28, xpW, xpH);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(10, 28, xpW * (player.xp / player.xpToNext), xpH);
    ctx.strokeStyle = '#555';
    ctx.strokeRect(10, 28, xpW, xpH);
    this.drawText(ctx, `LV ${player.level}`, 14, 32, 8, '#a8d8ea');

    // Gold
    this.drawText(ctx, `💰 ${gold}`, 10, 50, 12, '#f1c40f');

    // Time
    const secs = Math.floor(time / 60);
    const mins = Math.floor(secs / 60);
    const ss = String(secs % 60).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    this.drawText(ctx, `${mm}:${ss}`, W / 2, 18, 16, '#fff', 'center');

    // Wave
    this.drawText(ctx, `Wave ${waveCount}`, W - 10, 18, 12, '#e67e22', 'right');

    // Mute button
    const muted = typeof Audio !== 'undefined' && Audio.muted;
    this.drawText(ctx, muted ? '🔇' : '🔊', W - 14, 40, 14, '#aaa', 'right');
  },

  drawWaveAlert(ctx, alpha) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    ctx.fillText('⚠ STRONG WAVE ⚠', W / 2 + 2, H / 2 - 48 + 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('⚠ STRONG WAVE ⚠', W / 2, H / 2 - 48);
    ctx.restore();
  },

  // Title screen
  drawTitle(ctx, time) {
    const W = ctx.canvas.width, H = ctx.canvas.height;

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Animated grid
    ctx.strokeStyle = '#111a24';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Title glow
    const pulse = 0.85 + Math.sin(time * 0.04) * 0.15;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.shadowColor = '#f1c40f';
    ctx.shadowBlur = 24;
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText('PIXEL', W / 2, H / 2 - 60);
    ctx.fillStyle = '#e74c3c';
    ctx.fillText('SURVIVORS', W / 2, H / 2 - 5);
    ctx.shadowBlur = 0;
    ctx.restore();

    // Subtitle
    this.drawText(ctx, 'Survive as long as you can', W / 2, H / 2 + 50, 13, '#888', 'center');

    // Blinking prompt
    if (Math.floor(time / 30) % 2 === 0) {
      this.drawText(ctx, 'PRESS ANY KEY OR CLICK TO START', W / 2, H / 2 + 90, 13, '#2ecc71', 'center');
    }

    // Best time
    const save = Storage.load();
    if (save.bestTime > 0) {
      const secs = Math.floor(save.bestTime / 60);
      const mm = String(Math.floor(secs / 60)).padStart(2, '0');
      const ss = String(secs % 60).padStart(2, '0');
      this.drawText(ctx, `Best: ${mm}:${ss}`, W / 2, H - 30, 11, '#555', 'center');
    }

    // Draw two characters as preview
    Sprites.drawPistolPlayer(ctx, W / 2 - 80, H / 2 + 145, 40, 1);
    Sprites.drawSwordPlayer(ctx, W / 2 + 80, H / 2 + 145, 40, -1);
  },

  // Character select screen
  drawCharSelect(ctx, hoveredChar) {
    const W = ctx.canvas.width, H = ctx.canvas.height;

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Grid bg
    ctx.strokeStyle = '#1a2332';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    this.drawText(ctx, 'PIXEL SURVIVORS', W / 2, 60, 28, '#f1c40f', 'center');
    this.drawText(ctx, 'SELECT CHARACTER', W / 2, 100, 14, '#aaa', 'center');

    // Pistol card
    const card1x = W / 2 - 160, cardy = 140, cardW = 140, cardH = 200;
    ctx.fillStyle = hoveredChar === 'pistol' ? '#1a2a4a' : '#111827';
    ctx.fillRect(card1x, cardy, cardW, cardH);
    ctx.strokeStyle = hoveredChar === 'pistol' ? '#3a7bd5' : '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(card1x, cardy, cardW, cardH);
    Sprites.drawPistolPlayer(ctx, card1x + cardW / 2, cardy + 80, 48, 1);
    this.drawText(ctx, 'GUNNER', card1x + cardW / 2, cardy + 130, 14, '#3a7bd5', 'center');
    this.drawText(ctx, 'HP: 80', card1x + cardW / 2, cardy + 150, 10, '#aaa', 'center');
    this.drawText(ctx, 'Ranged Auto-Fire', card1x + cardW / 2, cardy + 165, 9, '#888', 'center');
    this.drawText(ctx, 'Fast & Agile', card1x + cardW / 2, cardy + 178, 9, '#888', 'center');
    this.drawText(ctx, '[CLICK TO SELECT]', card1x + cardW / 2, cardy + 195, 8, hoveredChar === 'pistol' ? '#3a7bd5' : '#555', 'center');

    // Sword card
    const card2x = W / 2 + 20;
    ctx.fillStyle = hoveredChar === 'sword' ? '#2a1a1a' : '#111827';
    ctx.fillRect(card2x, cardy, cardW, cardH);
    ctx.strokeStyle = hoveredChar === 'sword' ? '#c0392b' : '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(card2x, cardy, cardW, cardH);
    Sprites.drawSwordPlayer(ctx, card2x + cardW / 2, cardy + 80, 48, 1);
    this.drawText(ctx, 'WARRIOR', card2x + cardW / 2, cardy + 130, 14, '#c0392b', 'center');
    this.drawText(ctx, 'HP: 120', card2x + cardW / 2, cardy + 150, 10, '#aaa', 'center');
    this.drawText(ctx, 'Melee Spin Attack', card2x + cardW / 2, cardy + 165, 9, '#888', 'center');
    this.drawText(ctx, 'Tanky & Strong', card2x + cardW / 2, cardy + 178, 9, '#888', 'center');
    this.drawText(ctx, '[CLICK TO SELECT]', card2x + cardW / 2, cardy + 195, 8, hoveredChar === 'sword' ? '#c0392b' : '#555', 'center');

    // Controls hint
    this.drawText(ctx, 'WASD / Arrow Keys to move', W / 2, H - 40, 11, '#555', 'center');
  },

  // Level up screen
  drawLevelUp(ctx, options, hoveredIdx) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, H);

    this.drawText(ctx, 'LEVEL UP!', W / 2, H / 2 - 120, 28, '#f1c40f', 'center');
    this.drawText(ctx, 'Choose an upgrade', W / 2, H / 2 - 85, 13, '#aaa', 'center');

    const cardW = 140, cardH = 120, gap = 20;
    const totalW = options.length * cardW + (options.length - 1) * gap;
    const startX = W / 2 - totalW / 2;

    options.forEach((opt, i) => {
      const cx = startX + i * (cardW + gap);
      const cy = H / 2 - 60;
      const hovered = hoveredIdx === i;

      ctx.fillStyle = hovered ? '#1a2a1a' : '#111827';
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = hovered ? '#2ecc71' : '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cardW, cardH);

      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opt.icon, cx + cardW / 2, cy + 30);

      this.drawText(ctx, opt.label, cx + cardW / 2, cy + 60, 10, hovered ? '#2ecc71' : '#fff', 'center');
      this.drawText(ctx, opt.desc,  cx + cardW / 2, cy + 78, 8,  '#888', 'center');
    });
  },

  // Gold shop screen
  drawShop(ctx, shopUpgrades, currentLevels, gold, hoveredIdx) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    this.drawText(ctx, 'UPGRADE SHOP', W / 2, 50, 24, '#f1c40f', 'center');
    this.drawText(ctx, `Gold: ${gold}`, W / 2, 80, 16, '#f1c40f', 'center');
    this.drawText(ctx, 'Upgrades persist between runs', W / 2, 100, 10, '#666', 'center');

    const cols = 3, cardW = 160, cardH = 110, gap = 16;
    const totalW = cols * cardW + (cols - 1) * gap;
    const startX = W / 2 - totalW / 2;
    const startY = 130;

    shopUpgrades.forEach((upg, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = startX + col * (cardW + gap);
      const cy = startY + row * (cardH + gap);
      const lvl = currentLevels[upg.id] || 0;
      const maxed = lvl >= upg.maxLevel;
      const cost = upg.cost(lvl);
      const canAfford = gold >= cost && !maxed;
      const hovered = hoveredIdx === i;

      ctx.fillStyle = hovered && canAfford ? '#1a2a1a' : '#111827';
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = maxed ? '#f1c40f' : (hovered && canAfford ? '#2ecc71' : '#333');
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, cy, cardW, cardH);

      this.drawText(ctx, upg.label, cx + cardW / 2, cy + 20, 12, maxed ? '#f1c40f' : '#fff', 'center');
      this.drawText(ctx, upg.desc, cx + cardW / 2, cy + 40, 8, '#888', 'center');

      // Level dots
      for (let d = 0; d < upg.maxLevel; d++) {
        ctx.fillStyle = d < lvl ? '#f1c40f' : '#333';
        ctx.fillRect(cx + 10 + d * (cardW - 20) / upg.maxLevel, cy + 58, (cardW - 20) / upg.maxLevel - 2, 6);
      }
      this.drawText(ctx, `Lv ${lvl}/${upg.maxLevel}`, cx + cardW / 2, cy + 75, 9, '#aaa', 'center');

      if (maxed) {
        this.drawText(ctx, 'MAXED', cx + cardW / 2, cy + 92, 11, '#f1c40f', 'center');
      } else {
        this.drawText(ctx, `Cost: ${cost}G`, cx + cardW / 2, cy + 92, 11, canAfford ? '#2ecc71' : '#e74c3c', 'center');
      }
    });

    // Play button
    const btnW = 200, btnH = 44;
    const btnX = W / 2 - btnW / 2;
    const btnY = H - 68;
    const btnHovered = hoveredIdx === -2;

    ctx.fillStyle = btnHovered ? '#27ae60' : '#1a2a1a';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    ctx.strokeStyle = btnHovered ? '#2ecc71' : '#27ae60';
    ctx.lineWidth = 2;
    ctx.strokeRect(btnX, btnY, btnW, btnH);
    this.drawText(ctx, '▶  START GAME', W / 2, btnY + btnH / 2, 15, btnHovered ? '#fff' : '#2ecc71', 'center');
    this.drawText(ctx, 'Click upgrade to buy', W / 2, H - 16, 9, '#444', 'center');
  },

  // Game over screen
  drawGameOver(ctx, time, gold, earned, bestTime) {
    const W = ctx.canvas.width, H = ctx.canvas.height;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    this.drawText(ctx, 'GAME OVER', W / 2, H / 2 - 100, 32, '#e74c3c', 'center');

    const secs = Math.floor(time / 60);
    const mins = Math.floor(secs / 60);
    const ss = String(secs % 60).padStart(2, '0');
    this.drawText(ctx, `Survived: ${mins}:${ss}`, W / 2, H / 2 - 50, 16, '#fff', 'center');
    this.drawText(ctx, `Gold earned: +${earned}`, W / 2, H / 2 - 20, 14, '#f1c40f', 'center');
    this.drawText(ctx, `Total gold: ${gold}`, W / 2, H / 2 + 10, 14, '#f1c40f', 'center');

    const bsecs = Math.floor(bestTime / 60);
    const bmins = Math.floor(bsecs / 60);
    const bss = String(bsecs % 60).padStart(2, '0');
    this.drawText(ctx, `Best: ${bmins}:${bss}`, W / 2, H / 2 + 40, 12, '#aaa', 'center');

    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(W / 2 - 80, H / 2 + 65, 160, 36);
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - 80, H / 2 + 65, 160, 36);
    this.drawText(ctx, 'PLAY AGAIN', W / 2, H / 2 + 83, 14, '#2ecc71', 'center');
  }
};
