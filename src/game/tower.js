// Tower system
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/tower.js',
  exports: ['Tower', 'TowerManager'],
  dependencies: ['Vector2D', 'gridToPixel']
});

window.Tower = function(row, col, type, grid) {
  this.row = row;
  this.col = col;
  this.type = type;
  this.grid = grid;
  
  // Position in pixels
  const pos = window.gridToPixel(row, col, grid.cellSize);
  this.x = pos.x + grid.cellSize / 2;
  this.y = pos.y + grid.cellSize / 2;
  
  // Tower properties based on type - scaled for 20px cells
  switch(type) {
    case 'miner':
      this.damage = 10;
      this.range = 40; // 2 grids (2 * 20px)
      this.fireRate = 1.5; // Fires per second
      this.color = '#3498db';
      this.cost = 50;
      this.projectileSpeed = 80;
      this.projectileSize = 3;
      break;
    case 'lightning':
      this.damage = 40;
      this.range = 80; // 4 grids (4 * 20px)
      this.fireRate = 0.3;
      this.color = '#9b59b6';
      this.cost = 100;
      this.projectileSpeed = 100;
      this.projectileSize = 2;
      break;
    case 'fire':
      this.damage = 25;
      this.range = 60; // 3 grids (3 * 20px)
      this.fireRate = 0.8;
      this.color = '#e67e22';
      this.cost = 150;
      this.projectileSpeed = 60;
      this.projectileSize = 4;
      this.slowEffect = 0.5; // 50% slow
      break;
  }
  
  this.level = 1;
  this.maxLevel = 3;
  this.upgradesMade = 0;
  this.lastFireTime = 0;
  this.target = null;
  this.selected = false;
  this.maxHealth = 100;
  this.health = this.maxHealth;
  this.blinking = false;
  this.blinkDuration = 0;
  this.showHealthBar = false;
  this.destroyed = false;
};

window.Tower.prototype.update = function(deltaTime, enemies, projectileManager, gameTime) {
  // Update blinking effect
  if (this.blinking) {
    this.blinkDuration -= deltaTime;
    if (this.blinkDuration <= 0) {
      this.blinking = false;
    }
  }
  
  // Hide health bar if health is full and not recently damaged
  if (this.health >= this.maxHealth && !this.blinking) {
    this.showHealthBar = false;
  }
  
  // Don't fire if tower is destroyed
  if (this.destroyed) return;
  
  const adjustedDelta = deltaTime / 1000; // Convert to seconds
  const fireInterval = 1000 / this.fireRate;
  
  // Find target if we don't have one or if current target left range
  if (!this.target || !enemies.includes(this.target) || this.target.isDead() || 
      Math.hypot(this.target.x - this.x, this.target.y - this.y) > this.range) {
    this.target = this.findTarget(enemies);
  }
  
  // Fire at target if ready and still in range
  if (this.target && gameTime - this.lastFireTime >= fireInterval && 
      Math.hypot(this.target.x - this.x, this.target.y - this.y) <= this.range) {
    this.fire(projectileManager);
    this.lastFireTime = gameTime;
  }
};

window.Tower.prototype.findTarget = function(enemies) {
  let closestEnemy = null;
  let closestDistance = Infinity;
  
  for (let enemy of enemies) {
    if (!enemy || enemy.isDead()) continue;
    
    const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
    if (distance <= this.range && distance < closestDistance) {
      closestDistance = distance;
      closestEnemy = enemy;
    }
  }
  
  return closestEnemy;
};

window.Tower.prototype.fire = function(projectileManager) {
  if (this.target) {
    console.log('Tower firing at target at', this.target.x, this.target.y, 'from', this.x, this.y);
    projectileManager.createProjectile(
      this.x,
      this.y,
      this.target,
      this.damage,
      this.projectileSpeed,
      this.projectileSize,
      this.color,
      this.slowEffect
    );
    
    // Notify game about tower fire
    if (window.game) {
      window.game.recordTowerFire();
    }
  }
};

window.Tower.prototype.upgrade = function() {
  if (this.level < this.maxLevel) {
    this.level++;
    this.upgradesMade++;
    
    // Upgrade stats
    this.damage *= 1.4;
    this.range *= 1.2;
    this.fireRate *= 1.2;
    
    return true;
  }
  return false;
};

window.Tower.prototype.getUpgradeCost = function() {
  if (this.level >= this.maxLevel) return 0;
  return Math.floor(this.cost * this.level * 0.7);
};

window.Tower.prototype.getTotalValue = function() {
  let totalValue = this.cost;
  for (let i = 1; i < this.level; i++) {
    totalValue += this.getUpgradeCost();
  }
  return totalValue;
};

window.Tower.prototype.takeDamage = function(damage) {
  if (this.destroyed) return;
  
  this.health -= damage;
  this.showHealthBar = true;
  this.blinking = true;
  this.blinkDuration = 200;
  
  if (this.health <= 0) {
    this.health = 0;
    this.destroyed = true;
  }
  
  return this.destroyed;
};

window.Tower.prototype.getHealthPercent = function() {
  return this.health / this.maxHealth;
};

window.Tower.prototype.isDamaged = function() {
  return this.health < this.maxHealth;
};

window.Tower.prototype.getPixelPosition = function() {
  return { x: this.x, y: this.y };
};

window.Tower.prototype.isDead = function() {
  return this.destroyed;
};

window.Tower.isClicked = function(tower, x, y) {
  const distance = Math.hypot(x - tower.x, y - tower.y);
  return distance <= tower.grid.cellSize / 2;
};

window.TowerManager = function(grid) {
  this.grid = grid;
  this.towers = [];
  this.selectedTower = null;
};

window.TowerManager.prototype.placeTower = function(row, col, type) {
  if (!this.grid.isValidCell(row, col) || this.grid.isOccupied(row, col)) {
    return null;
  }
  
  const tower = new window.Tower(row, col, type, this.grid);
  this.towers.push(tower);
  this.grid.setOccupied(row, col, true);
  
  return tower;
};

window.TowerManager.prototype.removeTower = function(tower) {
  const index = this.towers.indexOf(tower);
  if (index !== -1) {
    this.towers.splice(index, 1);
    this.grid.setOccupied(tower.row, tower.col, false);
    
    if (this.selectedTower === tower) {
      this.selectedTower = null;
    }
  }
};

window.TowerManager.prototype.selectTower = function(x, y) {
  this.selectedTower = null;
  
  for (let tower of this.towers) {
    tower.selected = false;
    if (window.Tower.isClicked(tower, x, y) && !tower.destroyed) {
      this.selectedTower = tower;
      tower.selected = true;
    }
  }
  
  return this.selectedTower;
};

window.TowerManager.prototype.update = function(deltaTime, enemies, projectileManager) {
  const gameTime = performance.now();
  
  for (let i = this.towers.length - 1; i >= 0; i--) {
    const tower = this.towers[i];
    tower.update(deltaTime, enemies, projectileManager, gameTime);
    
    // Remove destroyed towers
    if (tower.destroyed) {
      this.grid.setOccupied(tower.row, tower.col, false);
      if (this.selectedTower === tower) {
        this.selectedTower = null;
      }
      this.towers.splice(i, 1);
    }
  }
};