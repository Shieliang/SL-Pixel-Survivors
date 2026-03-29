// Pixel art drawn via canvas 2D API
const Sprites = {
  // Draw pistol character (blue)
  drawPistolPlayer(ctx, x, y, size, facing) {
    const s = size / 16;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);

    // Body
    ctx.fillStyle = '#3a7bd5';
    ctx.fillRect(-4*s, -6*s, 8*s, 8*s);
    // Head
    ctx.fillStyle = '#f5c89a';
    ctx.fillRect(-3*s, -10*s, 6*s, 5*s);
    // Eyes
    ctx.fillStyle = '#222';
    ctx.fillRect(-1*s, -9*s, 1*s, 1*s);
    ctx.fillRect(1*s, -9*s, 1*s, 1*s);
    // Gun
    ctx.fillStyle = '#888';
    ctx.fillRect(4*s, -4*s, 4*s, 2*s);
    // Legs
    ctx.fillStyle = '#1a3a6e';
    ctx.fillRect(-4*s, 2*s, 3*s, 4*s);
    ctx.fillRect(1*s, 2*s, 3*s, 4*s);

    ctx.restore();
  },

  // Draw sword character (red)
  drawSwordPlayer(ctx, x, y, size, facing) {
    const s = size / 16;
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);

    // Body
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-5*s, -6*s, 10*s, 8*s);
    // Head
    ctx.fillStyle = '#f5c89a';
    ctx.fillRect(-3*s, -11*s, 6*s, 5*s);
    // Eyes
    ctx.fillStyle = '#222';
    ctx.fillRect(-1*s, -10*s, 1*s, 1*s);
    ctx.fillRect(1*s, -10*s, 1*s, 1*s);
    // Arm holding sword handle at side
    ctx.fillStyle = '#f5c89a';
    ctx.fillRect(4*s, -3*s, 2*s, 4*s);
    // Sword handle (held at hip, blade hidden)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(3*s, 0*s, 4*s, 2*s);
    ctx.fillStyle = '#aaa';
    ctx.fillRect(5*s, -4*s, 2*s, 4*s);
    // Legs
    ctx.fillStyle = '#7b241c';
    ctx.fillRect(-4*s, 2*s, 3*s, 4*s);
    ctx.fillRect(1*s, 2*s, 3*s, 4*s);

    ctx.restore();
  },

  // Basic enemy (green goblin)
  drawBasicEnemy(ctx, x, y, size) {
    const s = size / 16;
    ctx.save();
    ctx.translate(x, y);
    // Body
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(-4*s, -5*s, 8*s, 7*s);
    // Head
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(-3*s, -9*s, 6*s, 5*s);
    // Eyes
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-2*s, -8*s, 1*s, 1*s);
    ctx.fillRect(1*s, -8*s, 1*s, 1*s);
    // Ears
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(-5*s, -8*s, 2*s, 2*s);
    ctx.fillRect(3*s, -8*s, 2*s, 2*s);
    // Legs
    ctx.fillStyle = '#1e8449';
    ctx.fillRect(-3*s, 2*s, 2*s, 3*s);
    ctx.fillRect(1*s, 2*s, 2*s, 3*s);
    ctx.restore();
  },

  // Fast enemy (yellow)
  drawFastEnemy(ctx, x, y, size) {
    const s = size / 16;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-3*s, -4*s, 6*s, 6*s);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-2*s, -7*s, 4*s, 4*s);
    ctx.fillStyle = '#222';
    ctx.fillRect(-1*s, -6*s, 1*s, 1*s);
    ctx.fillRect(1*s, -6*s, 1*s, 1*s);
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(-2*s, 2*s, 2*s, 3*s);
    ctx.fillRect(1*s, 2*s, 2*s, 3*s);
    ctx.restore();
  },

  // Tank enemy (purple)
  drawTankEnemy(ctx, x, y, size) {
    const s = size / 16;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(-6*s, -6*s, 12*s, 10*s);
    ctx.fillStyle = '#9b59b6';
    ctx.fillRect(-4*s, -11*s, 8*s, 6*s);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-2*s, -10*s, 2*s, 2*s);
    ctx.fillRect(1*s, -10*s, 2*s, 2*s);
    ctx.fillStyle = '#6c3483';
    ctx.fillRect(-5*s, 4*s, 4*s, 4*s);
    ctx.fillRect(1*s, 4*s, 4*s, 4*s);
    ctx.restore();
  },

  // Boss enemy (dark red)
  drawBossEnemy(ctx, x, y, size) {
    const s = size / 16;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#922b21';
    ctx.fillRect(-8*s, -8*s, 16*s, 14*s);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-6*s, -14*s, 12*s, 8*s);
    // Horns
    ctx.fillStyle = '#7b241c';
    ctx.fillRect(-8*s, -18*s, 3*s, 5*s);
    ctx.fillRect(5*s, -18*s, 3*s, 5*s);
    ctx.fillStyle = '#f9ebea';
    ctx.fillRect(-3*s, -12*s, 2*s, 2*s);
    ctx.fillRect(1*s, -12*s, 2*s, 2*s);
    ctx.fillStyle = '#7b241c';
    ctx.fillRect(-6*s, 6*s, 5*s, 5*s);
    ctx.fillRect(1*s, 6*s, 5*s, 5*s);
    ctx.restore();
  },

  // XP orb
  drawXpOrb(ctx, x, y, value) {
    const r = value > 5 ? 6 : 4;
    ctx.save();
    ctx.translate(x, y);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    grad.addColorStop(0, '#a8edea');
    grad.addColorStop(1, '#1abc9c');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  },

  // Gold coin
  drawGold(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    const grad = ctx.createRadialGradient(-1, -1, 0, 0, 0, 5);
    grad.addColorStop(0, '#f9ca24');
    grad.addColorStop(1, '#f0932b');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e55039';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('G', 0, 0);
    ctx.restore();
  },

  // Main bullet — cyan tint + glow ring when pierce > 1
  drawBullet(ctx, x, y, angle, pierce) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Glow halo for pierce bullets
    if (pierce > 1) {
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 6 + pierce * 2;
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(-7, -2, 14, 4);
      ctx.shadowBlur = 0;
      // Bright core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5, -1, 10, 2);
    } else {
      // Normal yellow bullet
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(-5, -2, 10, 4);
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(3, -2, 4, 4);
    }

    ctx.restore();
  },

  // Extra bullet (multishot) — small, orange, round
  drawExtraBullet(ctx, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(-4, -1.5, 8, 3);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-4, -1.5, 4, 3);
    ctx.restore();
  },

  // Slash effect
  drawSlash(ctx, x, y, radius, progress) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius * progress, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius * progress * 0.7, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();
    ctx.restore();
  }
};
