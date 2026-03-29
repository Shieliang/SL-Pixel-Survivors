const Storage = {
  KEY: 'pixelSurvivors',

  load() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : this.defaultData();
    } catch {
      return this.defaultData();
    }
  },

  save(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch {}
  },

  defaultData() {
    return {
      gold: 0,
      shopUpgrades: {
        attackDamage: 0,
        expBonus: 0,
        maxHp: 0,
        moveSpeed: 0,
        attackSpeed: 0,
        goldBonus: 0
      },
      bestTime: 0
    };
  }
};
