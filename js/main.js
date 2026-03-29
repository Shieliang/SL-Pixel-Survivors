// ---- Game State Machine ----
// States: 'charSelect' | 'shop' | 'playing' | 'levelUp' | 'gameOver'

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas
function resize() {
  const maxW = 800, maxH = 600;
  const scale = Math.min(window.innerWidth / maxW, window.innerHeight / maxH, 1);
  canvas.width = maxW;
  canvas.height = maxH;
  canvas.style.width = Math.floor(maxW * scale) + 'px';
  canvas.style.height = Math.floor(maxH * scale) + 'px';
}
resize();
window.addEventListener('resize', resize);

// ---- Global game data ----
let state = 'title';
let titleTime = 0;
let saveData = Storage.load();
let selectedChar = null;
let player = null;
let enemies = [];
let projectiles = [];
let drops = [];
let gameTime = 0;
let difficulty = 0;
let waveCount = 0;
let waveAlertTimer = 0;
let goldEarned = 0;
let levelUpOptions = [];
let hoveredLevelUp = -1;
let hoveredChar = null;
let hoveredShop = -1;
let playButtonRect = null;
let keys = {};

// Background tiles
const BG_TILE_SIZE = 32;
const bgColors = ['#0d1117', '#0e1219', '#0f1318'];

// ---- Input ----
window.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (state === 'title') {
    Audio.init(); Audio.resume(); Audio.startBGM();
    // Stay on title briefly so music is heard, transition handled by titleTime
    state = 'charSelect';
    return;
  }
  Audio.init(); Audio.resume();
});
window.addEventListener('keyup', e => { keys[e.key] = false; });

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;
  handleMouseMove(mx, my);
});

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top) * scaleY;
  if (state === 'title') {
    Audio.init(); Audio.resume(); Audio.startBGM();
    state = 'charSelect'; return;
  }
  Audio.init(); Audio.resume();
  handleClick(mx, my);
});

function handleMouseMove(mx, my) {
  const W = canvas.width, H = canvas.height;

  if (state === 'charSelect') {
    const card1x = W / 2 - 160, card2x = W / 2 + 20, cardy = 140, cardW = 140, cardH = 200;
    if (mx >= card1x && mx <= card1x + cardW && my >= cardy && my <= cardy + cardH) hoveredChar = 'pistol';
    else if (mx >= card2x && mx <= card2x + cardW && my >= cardy && my <= cardy + cardH) hoveredChar = 'sword';
    else hoveredChar = null;
  }

  if (state === 'levelUp') {
    const options = levelUpOptions;
    const cardW = 140, cardH = 120, gap = 20;
    const totalW = options.length * cardW + (options.length - 1) * gap;
    const startX = W / 2 - totalW / 2;
    const startY = H / 2 - 60;
    hoveredLevelUp = -1;
    options.forEach((_, i) => {
      const cx = startX + i * (cardW + gap);
      if (mx >= cx && mx <= cx + cardW && my >= startY && my <= startY + cardH) hoveredLevelUp = i;
    });
  }

  if (state === 'shop') {
    const shopUpgrades = Upgrades.getShopUpgrades();
    const cols = 3, cardW = 160, cardH = 110, gap = 16;
    const totalW = cols * cardW + (cols - 1) * gap;
    const startX = W / 2 - totalW / 2;
    const startY = 130;
    hoveredShop = -1;
    shopUpgrades.forEach((_, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = startX + col * (cardW + gap);
      const cy = startY + row * (cardH + gap);
      if (mx >= cx && mx <= cx + cardW && my >= cy && my <= cy + cardH) hoveredShop = i;
    });
    // Play button
    if (mx >= W / 2 - 100 && mx <= W / 2 + 100 && my >= H - 68 && my <= H - 24) hoveredShop = -2;
    else if (hoveredShop === -2) hoveredShop = -1;
  }

  if (state === 'gameOver') {
    // handled in click
  }
}

function handleClick(mx, my) {
  const W = canvas.width, H = canvas.height;

  if (state === 'charSelect') {
    const card1x = W / 2 - 160, card2x = W / 2 + 20, cardy = 140, cardW = 140, cardH = 200;
    if (mx >= card1x && mx <= card1x + cardW && my >= cardy && my <= cardy + cardH) {
      selectedChar = 'pistol'; state = 'shop';
    } else if (mx >= card2x && mx <= card2x + cardW && my >= cardy && my <= cardy + cardH) {
      selectedChar = 'sword'; state = 'shop';
    }
  }

  if (state === 'shop') {
    const shopUpgrades = Upgrades.getShopUpgrades();
    const cols = 3, cardW = 160, cardH = 110, gap = 16;
    const totalW = cols * cardW + (cols - 1) * gap;
    const startX = W / 2 - totalW / 2;
    const startY = 130;

    shopUpgrades.forEach((upg, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const cx = startX + col * (cardW + gap);
      const cy = startY + row * (cardH + gap);
      if (mx >= cx && mx <= cx + cardW && my >= cy && my <= cy + cardH) {
        const lvl = saveData.shopUpgrades[upg.id] || 0;
        const cost = upg.cost(lvl);
        if (saveData.gold >= cost && lvl < upg.maxLevel) {
          saveData.gold -= cost;
          saveData.shopUpgrades[upg.id] = lvl + 1;
          Storage.save(saveData);
        }
      }
    });

    // Play button
    if (mx >= W / 2 - 100 && mx <= W / 2 + 100 && my >= H - 68 && my <= H - 24) {
      startGame();
    }
  }

  if (state === 'playing' || state === 'levelUp') {
    // Mute toggle top-right
    if (mx >= canvas.width - 30 && mx <= canvas.width && my >= 28 && my <= 54) {
      Audio.init(); Audio.toggleMute();
    }
  }

  if (state === 'levelUp' && hoveredLevelUp >= 0) {
    levelUpOptions[hoveredLevelUp].apply(player);
    levelUpOptions = [];
    hoveredLevelUp = -1;
    state = 'playing';
  }

  if (state === 'gameOver') {
    if (mx >= W / 2 - 80 && mx <= W / 2 + 80 && my >= H / 2 + 65 && my <= H / 2 + 101) {
      Audio.startBGM();
      state = 'charSelect';
    }
  }
}

function startGame() {
  player = new Player(selectedChar, saveData.shopUpgrades);
  enemies = [];
  projectiles = [];
  drops = [];
  gameTime = 0;
  difficulty = 0;
  waveCount = 0;
  waveAlertTimer = 0;
  goldEarned = 0;
  EnemySpawner.reset();
  if (!Audio.bgmPlaying) Audio.startBGM();
  state = 'playing';}

// ---- Collision helpers ----
function circleCollide(ax, ay, ar, bx, by, br) {
  return Math.hypot(ax - bx, ay - by) < ar + br;
}

// ---- Main update ----
function update() {
  if (state === 'title') { titleTime++; return; }
  if (state !== 'playing') return;

  gameTime++;
  difficulty = Math.floor(gameTime / 3600); // increases every 60 seconds

  player.update(keys, canvas.width, canvas.height);

  // Attack
  const attack = player.tryAttack(enemies);
  if (attack) {
    if (Array.isArray(attack)) {
      for (const b of attack) projectiles.push(b);
      Audio.shoot();
      if (attack.length > 1) Audio.shootExtra();
    } else {
      projectiles.push(attack);
      Audio.swordSwing();
    }
  }

  // Update projectiles / slashes
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.update();

    if (p instanceof Bullet) {
      for (const e of enemies) {
        if (!p.hit.has(e) && circleCollide(p.x, p.y, 5, e.x, e.y, e.size / 2)) {
          e.takeDamage(p.damage);
          Audio.enemyHit();
          p.hit.add(e);
          if (p.hit.size >= p.pierce) { p.dead = true; break; }
        }
      }
    } else if (p instanceof SlashEffect) {
      for (const e of enemies) {
        if (p.hit.has(e)) continue;
        const dx = e.x - p.x, dy = e.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > p.radius + e.size / 2) continue;
        // Check if enemy angle is within swept arc so far
        let angle = Math.atan2(dy, dx);
        // Normalize angle into sweep range
        let start = p.startAngle, end = p.currentAngle;
        // Normalize angle relative to start
        while (angle < start - Math.PI) angle += Math.PI * 2;
        while (angle > start + Math.PI) angle -= Math.PI * 2;
        if (angle >= start && angle <= end) {
          e.takeDamage(p.damage);
          Audio.enemyHit();
          p.hit.add(e);
        }
      }
    }

    if (p.dead) projectiles.splice(i, 1);
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.update(player);

    // Enemy hits player - flat damage with cooldown per enemy
    if (circleCollide(e.x, e.y, e.size / 2 - 4, player.x, player.y, 12)) {
      if (!e.damageCooldown || e.damageCooldown <= 0) {
        player.takeDamage(e.damage);
        Audio.playerHurt();
        e.damageCooldown = 60;
      }
    }
    if (e.damageCooldown > 0) e.damageCooldown--;

    if (e.dead) {
      if (e.type === 'boss') Audio.bossDie();
      else Audio.enemyDie();
      // Drop XP
      drops.push(new Drop(e.x, e.y, 'xp', e.xp));
      // Drop gold
      const goldMult = 1 + (saveData.shopUpgrades.goldBonus || 0) * 0.1;
      const goldAmt = Math.floor(e.gold * goldMult);
      if (goldAmt > 0) drops.push(new Drop(e.x, e.y, 'gold', goldAmt));
      enemies.splice(i, 1);
    }
  }

  // Pickup drops
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    if (circleCollide(player.x, player.y, player.effectivePickupRange, d.x, d.y, 6)) {
      if (d.type === 'xp') {
        const leveled = player.gainXp(d.value);
        if (leveled) {
          Audio.levelUp();
          levelUpOptions = Upgrades.getRandomLevelUps(3, player.type);
          state = 'levelUp';
        } else {
          Audio.xpPickup();
        }
      } else {
        saveData.gold += d.value;
        goldEarned += d.value;
        Audio.goldPickup();
        Storage.save(saveData);
      }
      drops.splice(i, 1);
    }
  }

  // Spawn enemies
  const waved = EnemySpawner.update(enemies, canvas.width, canvas.height, player.x, player.y, difficulty);
  if (waved) { waveCount++; waveAlertTimer = 180; Audio.waveAlert(); }
  if (waveAlertTimer > 0) waveAlertTimer--;

  // Player dead
  if (player.dead) {
    if (gameTime > saveData.bestTime) {
      saveData.bestTime = gameTime;
      Storage.save(saveData);
    }
    Audio.stopBGM();
    Audio.gameOver();
    state = 'gameOver';
  }
}

// ---- Draw background ----
function drawBackground() {
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(0, 0, W, H);

  // Subtle grid
  ctx.strokeStyle = '#111a24';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += BG_TILE_SIZE) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += BG_TILE_SIZE) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

// ---- Main draw ----
function draw() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (state === 'title') {
    UI.drawTitle(ctx, titleTime);
    return;
  }

  if (state === 'charSelect') {
    UI.drawCharSelect(ctx, hoveredChar);
    return;
  }

  if (state === 'shop') {
    UI.drawShop(ctx, Upgrades.getShopUpgrades(), saveData.shopUpgrades, saveData.gold, hoveredShop);
    return;
  }

  if (state === 'gameOver') {
    drawBackground();
    UI.drawGameOver(ctx, gameTime, saveData.gold, goldEarned, saveData.bestTime);
    return;
  }

  // Playing / levelUp
  drawBackground();

  // Draw drops
  for (const d of drops) d.draw(ctx, gameTime);

  // Draw enemies
  for (const e of enemies) e.draw(ctx);

  // Draw projectiles
  for (const p of projectiles) p.draw(ctx);

  // Draw player
  if (player) player.draw(ctx);

  // HUD
  UI.drawHUD(ctx, player, gameTime, saveData.gold, waveCount);

  // Wave alert
  if (waveAlertTimer > 0) {
    const alpha = Math.min(1, waveAlertTimer / 30) * Math.min(1, waveAlertTimer / 30);
    UI.drawWaveAlert(ctx, alpha);
  }

  // Level up overlay
  if (state === 'levelUp') {
    UI.drawLevelUp(ctx, levelUpOptions, hoveredLevelUp);
  }
}

// ---- Game loop ----
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
