class Enemy {
  constructor(x, y, type, difficulty) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.dead = false;
    this.flashTimer = 0;

    const d = difficulty;
    switch (type) {
      case 'basic':
        this.hp = this.maxHp = (20 + d * 10);
        this.speed = 1.0 + d * 0.04;
        this.damage = 5 + d * 2;
        this.xp = 2; this.gold = Math.random() < 0.3 ? 1 : 0;
        this.size = 24; this.drawFn = 'drawBasicEnemy';
        break;
      case 'fast':
        this.hp = this.maxHp = (12 + d * 6);
        this.speed = 1.4 + d * 0.06;
        this.damage = 4 + d * 1.5;
        this.xp = 3; this.gold = Math.random() < 0.2 ? 1 : 0;
        this.size = 20; this.drawFn = 'drawFastEnemy';
        break;
      case 'tank':
        this.hp = this.maxHp = (80 + d * 20);
        this.speed = 0.6 + d * 0.02;
        this.damage = 12 + d * 3;
        this.xp = 8; this.gold = Math.random() < 0.6 ? 2 : 1;
        this.size = 32; this.drawFn = 'drawTankEnemy';
        break;
      case 'boss':
        this.hp = this.maxHp = (300 + d * 80);
        this.speed = 0.8 + d * 0.03;
        this.damage = 20 + d * 4;
        this.xp = 50; this.gold = 10 + Math.floor(d * 2);
        this.size = 48; this.drawFn = 'drawBossEnemy';
        break;
    }
  }

  update(player) {
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 0) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
    if (this.flashTimer > 0) this.flashTimer--;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.flashTimer = 6;
    if (this.hp <= 0) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    if (this.flashTimer > 0) {
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(this.flashTimer * 0.8);
    }
    Sprites[this.drawFn](ctx, this.x, this.y, this.size);
    ctx.restore();

    // HP bar
    if (this.hp < this.maxHp) {
      const bw = this.size;
      const bh = 4;
      const bx = this.x - bw / 2;
      const by = this.y - this.size / 2 - 8;
      ctx.fillStyle = '#333';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = this.type === 'boss' ? '#e74c3c' : '#2ecc71';
      ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
    }
  }
}

class Drop {
  constructor(x, y, type, value) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.type = type; // 'xp' or 'gold'
    this.value = value;
    this.dead = false;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  draw(ctx, time) {
    const bob = Math.sin(time * 0.05 + this.bobOffset) * 2;
    if (this.type === 'xp') {
      Sprites.drawXpOrb(ctx, this.x, this.y + bob, this.value);
    } else {
      Sprites.drawGold(ctx, this.x, this.y + bob);
    }
  }
}

const EnemySpawner = {
  spawnTimer: 0,
  waveTimer: 0,
  waveInterval: 30 * 60, // 30 seconds
  waveCount: 0,

  reset() {
    this.spawnTimer = 0;
    this.waveTimer = 0;
    this.waveCount = 0;
  },

  update(enemies, canvasW, canvasH, playerX, playerY, difficulty) {
    this.spawnTimer++;
    this.waveTimer++;

    // Normal continuous spawning
    const spawnRate = Math.max(30, 120 - difficulty * 5);
    if (this.spawnTimer >= spawnRate) {
      this.spawnTimer = 0;
      const count = 1 + Math.floor(difficulty / 8);
      for (let i = 0; i < count; i++) {
        const e = this.spawnRandom(canvasW, canvasH, playerX, playerY, difficulty);
        if (e) enemies.push(e);
      }
    }

    // Strong wave
    if (this.waveTimer >= this.waveInterval) {
      this.waveTimer = 0;
      this.waveCount++;
      this.spawnWave(enemies, canvasW, canvasH, playerX, playerY, difficulty);
      return true; // signal wave happened
    }
    return false;
  },

  spawnRandom(cw, ch, px, py, diff) {
    const pos = this.edgePosition(cw, ch);
    const roll = Math.random();
    let type = 'basic';
    if (diff > 5 && roll < 0.2) type = 'fast';
    else if (diff > 10 && roll < 0.1) type = 'tank';
    return new Enemy(pos.x, pos.y, type, diff);
  },

  spawnWave(enemies, cw, ch, px, py, diff) {
    const waveSize = 10 + this.waveCount * 5;
    for (let i = 0; i < waveSize; i++) {
      const pos = this.edgePosition(cw, ch);
      const roll = Math.random();
      let type = roll < 0.3 ? 'fast' : roll < 0.6 ? 'tank' : 'basic';
      enemies.push(new Enemy(pos.x, pos.y, type, diff + 5));
    }
    // Spawn boss every 3 waves
    if (this.waveCount % 3 === 0) {
      const pos = this.edgePosition(cw, ch);
      enemies.push(new Enemy(pos.x, pos.y, 'boss', diff));
    }
  },

  edgePosition(cw, ch) {
    const side = Math.floor(Math.random() * 4);
    switch (side) {
      case 0: return { x: Math.random() * cw, y: -30 };
      case 1: return { x: Math.random() * cw, y: ch + 30 };
      case 2: return { x: -30, y: Math.random() * ch };
      case 3: return { x: cw + 30, y: Math.random() * ch };
    }
  }
};
