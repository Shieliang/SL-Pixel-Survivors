// Level-up upgrades (random pick from pool)
// 'for' field: 'all' | 'pistol' | 'sword'
const LEVEL_UP_POOL = [
  { id: 'damage',    label: '+15% Damage',       desc: 'All attacks hit harder',            icon: '⚔️',  for: 'all',    apply: p => p.levelBonuses.damage++ },
  { id: 'speed',     label: '+10% Move Speed',   desc: 'Move faster across the arena',      icon: '👟',  for: 'all',    apply: p => p.levelBonuses.speed++ },
  { id: 'hp',        label: '+20 Max HP',        desc: 'Increase max health by 20',         icon: '❤️',  for: 'all',    apply: p => { p.maxHp += 20; p.hp = Math.min(p.hp + 20, p.maxHp); } },
  { id: 'atkspeed',  label: '+15% Atk Speed',    desc: 'Attack more frequently',            icon: '⚡',  for: 'all',    apply: p => p.levelBonuses.atkSpeed++ },
  { id: 'regen',     label: '+1 HP Regen/sec',   desc: 'Slowly recover HP over time',       icon: '💚',  for: 'all',    apply: p => p.levelBonuses.regen++ },
  { id: 'magnet',    label: '+Pickup Range',     desc: 'Collect XP & gold from further',    icon: '🧲',  for: 'all',    apply: p => p.levelBonuses.magnet++ },
  { id: 'pierce',    label: '+1 Bullet Pierce',  desc: 'Bullet passes through +1 enemy',    icon: '🔫',  for: 'pistol', apply: p => p.levelBonuses.pierce++ },
  { id: 'multishot', label: '+1 Extra Bullet',   desc: 'Fire an extra spread-angle bullet', icon: '💥',  for: 'pistol', apply: p => p.levelBonuses.multishot++ },
  { id: 'area',      label: '+Slash Radius',     desc: 'Sword swing reaches further out',   icon: '🌀',  for: 'sword',  apply: p => p.levelBonuses.area++ },
  { id: 'spin',      label: '+Spin Arc Width',   desc: 'Sword sweeps a wider angle',        icon: '🗡️',  for: 'sword',  apply: p => p.levelBonuses.spin++ },
];

// Gold shop upgrades (persistent, meta-progression)
const SHOP_UPGRADES = [
  { id: 'attackDamage', label: 'Attack Damage',  desc: '+5 base damage per level',  maxLevel: 10, cost: lvl => 20 + lvl * 15 },
  { id: 'expBonus',     label: 'EXP Bonus',      desc: '+10% EXP per level',        maxLevel: 10, cost: lvl => 15 + lvl * 10 },
  { id: 'maxHp',        label: 'Max HP',         desc: '+15 max HP per level',      maxLevel: 10, cost: lvl => 20 + lvl * 15 },
  { id: 'moveSpeed',    label: 'Move Speed',     desc: '+5% speed per level',       maxLevel: 5,  cost: lvl => 25 + lvl * 20 },
  { id: 'attackSpeed',  label: 'Attack Speed',   desc: '+10% attack speed/level',   maxLevel: 5,  cost: lvl => 30 + lvl * 20 },
  { id: 'goldBonus',    label: 'Gold Bonus',     desc: '+10% gold drops per level', maxLevel: 5,  cost: lvl => 40 + lvl * 25 },
];

const Upgrades = {
  getRandomLevelUps(count, playerType) {
    const pool = LEVEL_UP_POOL.filter(u => u.for === 'all' || u.for === playerType);
    const available = [...pool];
    const result = [];
    for (let i = 0; i < count && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      result.push(available.splice(idx, 1)[0]);
    }
    return result;
  },

  getShopUpgrades() {
    return SHOP_UPGRADES;
  }
};
