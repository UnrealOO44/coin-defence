// Tower system for defense
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/tower.js',
  exports: ['Tower', 'TowerManager']
});

window.Tower = function(row, col, type, cellSize) {
  cellSize = cellSize || 50;
  this.row = row;
  this.col = col;
  this.type = type;
  this.level = 1;
  this.upgradesMade = 0;
  this.maxUpgrades = 3;
  this.selected = false;
  this.lastFire = 0;
  this.cellSize = cellSize;
  this.kills = 0;
  this.maxHealth = 100;
  this.health = 100;
  this.setStatsByType();
};

window.Tower.prototype.setStatsByType = function() {
  // Set base stats first
  switch(this.type) {
    case 'miner':
      this.baseDamage = 10;
      this.baseRange = 80;
      this.baseFireRate = 1000;
      this.cost = 50;
      this.color = '#95a5a6';
      this.projectileSpeed = 200;
      this.projectileColor = '#ecf0f1';
      break;
    case 'lightning':
      this.baseDamage = 25;
      this.baseRange = 120;
      this.baseFireRate = 1500;
      this.cost = 100;
      this.color = '#3498db';
      this.projectileSpeed = 400;
      this.projectileColor = '#f1c40f';
      break;
    case 'fire':
      this.baseDamage = 40;
      this.baseRange = 100;
      this.baseFireRate = 2000;
      this.cost = 150;
      this.color = '#e74c3c';
      this.projectileSpeed = 150;
      this.projectileColor = '#ff6b35';
      this.slowEffect = true;
      this.slowDuration = 2000;
      break;
  }
  
  // Apply upgrade multipliers
  const damageMultiplier = 1 + (this.level - 1) * 0.3; // +30% per level
  const rangeMultiplier = 1 + (this.level - 1) * 0.15; // +15% per level
  const fireRateMultiplier = 1 + (this.level - 1) * 0.2; // +20% fire rate per level
  
  this.damage = Math.floor(this.baseDamage * damageMultiplier);
  this.range = Math.floor(this.baseRange * rangeMultiplier);
  this.fireRate = Math.floor(this.baseFireRate / fireRateMultiplier); // Faster = lower number
};

window.Tower.prototype.update = function(deltaTime, enemies, projectileManager) {
  const now = Date.now();
  
  if (now - this.lastFire >= this.fireRate) {
    const target = this.findTarget(enemies);
    if (target) {
      this.fire(target, projectileManager);
      this.lastFire = now;
    }
  }
};

window.Tower.prototype.findTarget = function(enemies) {
  const centerX = this.col * this.cellSize + this.cellSize / 2;
  const centerY = this.row * this.cellSize + this.cellSize / 2;
  
  // Find all enemies in range
  const enemiesInRange = [];
  
  for (let enemy of enemies) {
    const distance = Math.sqrt(
      Math.pow(enemy.x - centerX, 2) + 
      Math.pow(enemy.y - centerY, 2)
    );
    
    if (distance <= this.range) {
      enemiesInRange.push(enemy);
    }
  }
  
  if (enemiesInRange.length === 0) {
    return null;
  }
  
  // Find the enemy with lowest health
  let lowestHealthEnemy = enemiesInRange[0];
  for (let enemy of enemiesInRange) {
    if (enemy.health < lowestHealthEnemy.health) {
      lowestHealthEnemy = enemy;
    }
  }
  
  return lowestHealthEnemy;
};

window.Tower.prototype.fire = function(target, projectileManager) {
  const startX = this.col * this.cellSize + this.cellSize / 2;
  const startY = this.row * this.cellSize + this.cellSize / 2;
  
  // Record that a tower fired (for auto-speed management)
  if (window.game && window.game.recordTowerFire) {
    window.game.recordTowerFire();
  }
  
  // Play tower-specific shooting sound
  if (window.game && window.game.audioEngine) {
    switch(this.type) {
      case 'miner':
        window.game.audioEngine.play('minerShoot');
        break;
      case 'lightning':
        window.game.audioEngine.play('lightningShoot');
        break;
      case 'fire':
        window.game.audioEngine.play('fireShoot');
        break;
    }
  }
  
  projectileManager.createProjectile(
    startX, 
    startY, 
    target, 
    this.damage, 
    this.projectileSpeed, 
    this.projectileColor,
    this.slowEffect,
    this.slowDuration,
    this
  );
};

window.Tower.prototype.upgrade = function() {
  if (this.upgradesMade < this.maxUpgrades) {
    this.level++;
    this.upgradesMade++;
    this.setStatsByType();
    return true;
  }
  return false;
};

window.Tower.prototype.incrementKills = function() {
  this.kills++;
};

window.Tower.prototype.takeDamage = function(damage) {
  this.health -= damage;
  
  // Play damage sound
  if (window.game && window.game.audioEngine) {
    window.game.audioEngine.play('towerHit');
  }
  
  // Check if tower is destroyed
  if (this.health <= 0) {
    this.health = 0;
    
    // Remove tower from game
    if (window.game && window.game.towerManager) {
      window.game.towerManager.removeTower(this);
      
      // Play destruction sound
      if (window.game.audioEngine) {
        window.game.audioEngine.play('towerDestroyed');
      }
    }
  }
};

window.Tower.prototype.getHealthPercent = function() {
  return this.health / this.maxHealth;
};

window.Tower.prototype.repair = function() {
  this.health = this.maxHealth;
};

window.Tower.prototype.getUpgradeCost = function() {
  return Math.floor(this.cost * 0.5 * Math.pow(1.5, this.level - 1));
};

window.Tower.prototype.getTotalValue = function() {
  let totalValue = this.cost;
  for (let i = 1; i < this.level; i++) {
    totalValue += Math.floor(this.cost * 0.5 * Math.pow(1.5, i - 1));
  }
  return totalValue;
};

window.Tower.prototype.isDamaged = function() {
  return this.health < this.maxHealth;
};

window.Tower.prototype.getPixelPosition = function() {
  return {
    x: this.col * this.cellSize + this.cellSize / 2,
    y: this.row * this.cellSize + this.cellSize / 2
  };
};

window.TowerManager = function(grid) {
  this.towers = [];
  this.grid = grid;
  this.selectedTower = null;
};

window.TowerManager.prototype.placeTower = function(row, col, type) {
  if (this.grid.isOccupied(row, col)) {
    return null;
  }

  const tower = new window.Tower(row, col, type, this.grid.cellSize);
  this.towers.push(tower);
  this.grid.setOccupied(row, col, true);
  return tower;
};

window.TowerManager.prototype.removeTower = function(tower) {
  const index = this.towers.indexOf(tower);
  if (index > -1) {
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
    const towerX = tower.col * this.grid.cellSize + this.grid.cellSize / 2;
    const towerY = tower.row * this.grid.cellSize + this.grid.cellSize / 2;
    
    const distance = Math.sqrt(
      Math.pow(x - towerX, 2) + 
      Math.pow(y - towerY, 2)
    );
    
    if (distance <= this.grid.cellSize / 2) {
      this.selectedTower = tower;
      tower.selected = true;
    } else {
      tower.selected = false;
    }
  }
  
  return this.selectedTower;
};

window.TowerManager.prototype.update = function(deltaTime, enemies, projectileManager) {
  for (let tower of this.towers) {
    tower.update(deltaTime, enemies, projectileManager);
  }
};

window.TowerManager.prototype.clear = function() {
  this.towers = [];
  this.selectedTower = null;
};