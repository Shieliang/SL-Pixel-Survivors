class Player {
  constructor(type, shopStats) {
    this.type = type; // 'pistol' or 'sword'
    this.x = 400;
    this.y = 300;
    this.facing = 1;

    // Base stats modified by shop upgrades
    const baseHp = type === 'sword' ? 120 : 80;
    const baseSpeed = type === 'sword' ? 2.5 : 3.0;

    this.maxHp = baseHp + shopStats.maxHp * 15;
    this.hp = this.maxHp;
    this.speed = baseSpeed + shopStats.moveSpeed * 0.05 * baseSpeed;
    this.baseAttackCooldown = type === 'pistol' ? 30 : 50;
    this.attackCooldown = 0;
    this.shopStats = shopStats;

    // Level system
    this.xp = 0;
    this.level = 1;
    this.xpToNext = 20;
    this.levelBonuses = { damage: 0, speed: 0, atkSpeed: 0, area: 0, pierce: 0, regen: 1, magnet: 0, multishot: 0, spin: 0 };

    this.regenTimer = 0;
    this.invincibleTimer = 0;
    this.dead = false;
    this.pickupRange = 60;
  }

  get effectiveSpeed() {
    return this.speed * (1 + this.levelBonuses.speed * 0.1);
  }

  get effectiveAttackCooldown() {
    const reduction = (this.shopStats.attackSpeed * 0.1) + (this.levelBonuses.atkSpeed * 0.15);
    return Math.max(8, Math.floor(this.baseAttackCooldown * (1 - reduction)));
  }

  get effectivePickupRange() {
    return this.pickupRange + this.levelBonuses.magnet * 20;
  }

  update(keys, canvasW, canvasH) {
    // Movement
    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
    if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
    if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;

    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
    if (dx !== 0) this.facing = dx > 0 ? 1 : -1;

    const spd = this.effectiveSpeed;
    this.x = Math.max(16, Math.min(canvasW - 16, this.x + dx * spd));
    this.y = Math.max(16, Math.min(canvasH - 16, this.y + dy * spd));

    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.invincibleTimer > 0) this.invincibleTimer--;

    // HP regen — tick every 20 frames (~3x per second per regen stack)
    if (this.levelBonuses.regen > 0) {
      this.regenTimer++;
      if (this.regenTimer >= 20) {
        this.regenTimer = 0;
        this.hp = Math.min(this.maxHp, this.hp + this.levelBonuses.regen);
      }
    }
  }

  tryAttack(enemies) {
    if (this.attackCooldown > 0) return null;
    this.attackCooldown = this.effectiveAttackCooldown;
    if (this.type === 'pistol') {
      return Weapons.firePistol(this, enemies, this.shopStats); // returns array
    } else {
      return Weapons.fireSword(this, enemies, this.shopStats); // returns SlashEffect
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.invincibleTimer = 20; // brief flash only, no damage immunity
    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
  }

  gainXp(amount) {
    const bonus = 1 + this.shopStats.expBonus * 0.1 + this.levelBonuses.regen * 0; // regen separate
    const expMult = 1 + this.shopStats.expBonus * 0.1;
    this.xp += Math.floor(amount * expMult);
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.floor(this.xpToNext * 1.4);
      return true; // leveled up
    }
    return false;
  }

  draw(ctx) {
    ctx.save();
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    if (this.type === 'pistol') {
      Sprites.drawPistolPlayer(ctx, this.x, this.y, 32, this.facing);
    } else {
      Sprites.drawSwordPlayer(ctx, this.x, this.y, 32, this.facing);
    }
    ctx.restore();

    // HP bar above player
    const bw = 40, bh = 5;
    const bx = this.x - bw / 2;
    const by = this.y - 28;
    ctx.fillStyle = '#333';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = this.hp > this.maxHp * 0.3 ? '#2ecc71' : '#e74c3c';
    ctx.fillRect(bx, by, bw * (this.hp / this.maxHp), bh);
  }
}
