class Bullet {
  constructor(x, y, angle, damage, speed, pierce, isExtra) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.pierce = pierce || 1;
    this.isExtra = isExtra || false; // side bullets from multishot
    this.hit = new Set();
    this.life = 180;
    this.dead = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    if (this.isExtra) {
      Sprites.drawExtraBullet(ctx, this.x, this.y, this.angle);
    } else {
      Sprites.drawBullet(ctx, this.x, this.y, this.angle, this.pierce);
    }
  }
}

class SlashEffect {
  // targetAngle: direction of swing center
  // arcWidth: total arc in radians
  constructor(x, y, radius, damage, targetAngle, arcWidth) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.damage = damage;
    this.targetAngle = targetAngle;
    this.arcWidth = arcWidth || Math.PI * 0.7;
    this.progress = 0;
    this.duration = 14; // frames for full sweep
    this.dead = false;
    this.hit = new Set();
  }

  get startAngle() { return this.targetAngle - this.arcWidth / 2; }
  get endAngle()   { return this.targetAngle + this.arcWidth / 2; }
  get currentAngle() { return this.startAngle + this.arcWidth * this.progress; }

  update() {
    this.progress += 1 / this.duration;
    if (this.progress >= 1) this.dead = true;
  }

  draw(ctx) {
    const alpha = this.progress < 0.5
      ? this.progress * 2
      : 1 - (this.progress - 0.5) * 2;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalAlpha = Math.max(0, alpha);

    const sweepEnd = this.currentAngle;
    const sweepStart = this.startAngle;

    // Outer glow arc (swept so far)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this.radius, sweepStart, sweepEnd);
    ctx.closePath();
    ctx.fillStyle = 'rgba(231, 76, 60, 0.18)';
    ctx.fill();

    // Main slash arc edge
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, sweepStart, sweepEnd);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner bright edge
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.75, sweepStart, sweepEnd);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.max(0, alpha * 0.6);
    ctx.stroke();

    // Leading edge line (sword tip trail)
    const lx = Math.cos(sweepEnd) * this.radius;
    const ly = Math.sin(sweepEnd) * this.radius;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(lx, ly);
    ctx.strokeStyle = '#f5b7b1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}

const Weapons = {
  // Pistol: fires toward nearest enemy, supports multishot
  firePistol(player, enemies, stats) {
    const nearest = Weapons.findNearest(player, enemies, 400);
    if (!nearest) return null;
    const baseAngle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
    const dmg = (10 + stats.attackDamage * 3) * (1 + player.levelBonuses.damage * 0.1);
    const pierce = 1 + player.levelBonuses.pierce;
    const extra = player.levelBonuses.multishot;
    const bullets = [];
    // Center bullet (pierce bullet — longer, cyan glow)
    bullets.push(new Bullet(player.x, player.y, baseAngle, dmg, 10, pierce, false));
    // Extra bullets spread around center (smaller, orange, pierce=1)
    for (let i = 1; i <= extra; i++) {
      const spread = (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2) * 0.18;
      bullets.push(new Bullet(player.x, player.y, baseAngle + spread, dmg * 0.8, 10, 1, true));
    }
    return bullets;
  },

  // Sword: animated sweep arc toward nearest enemy
  fireSword(player, enemies, stats) {
    const nearest = Weapons.findNearest(player, enemies, 500);
    const targetAngle = nearest
      ? Math.atan2(nearest.y - player.y, nearest.x - player.x)
      : Math.atan2(player.facing, 0) - Math.PI / 2;
    const dmg = (20 + stats.attackDamage * 5) * (1 + player.levelBonuses.damage * 0.1);
    const radius = 65 + player.levelBonuses.area * 20;
    const arcWidth = (Math.PI * 0.75) + player.levelBonuses.spin * 0.28;
    return new SlashEffect(player.x, player.y, radius, dmg, targetAngle, arcWidth);
  },

  findNearest(player, enemies, maxRange) {
    let nearest = null;
    let minDist = maxRange;
    for (const e of enemies) {
      const d = Math.hypot(e.x - player.x, e.y - player.y);
      if (d < minDist) { minDist = d; nearest = e; }
    }
    return nearest;
  }
};
