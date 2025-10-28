// Enemy system for crypto coins
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/enemy.js',
  exports: ['Enemy', 'EnemyManager']
});

window.Enemy = function(type, health, speed, reward, path) {
  this.type = type;
  this.maxHealth = health;
  this.health = health;
  this.speed = speed;
  this.reward = reward;
  this.path = path;
  this.currentWaypoint = 0;
  this.position = this.path.getWaypoint(0);
  this.x = this.position.x;
  this.y = this.position.y;
  this.size = type === 'shooter' ? 10 : 8; // Adjusted for 20px cell size
  this.color = this.getColorByType(type);
  this.slowed = false;
  this.slowTimer = 0;
  
  // Shooting enemy properties - scaled for larger grid
  if (type === 'shooter') {
    this.lastShot = 0;
    this.fireRate = 2000; // Shoot every 2 seconds
    this.range = 100; // 5 grids (5 * 20px) for shooter enemies
    this.damage = 20; // Damage dealt to towers
  }
};

window.Enemy.prototype.getColorByType = function(type) {
  switch(type) {
    case 'bitcoin': return '#f39c12';
    case 'ethereum': return '#627eea';
    case 'dogecoin': return '#c2a633';
    case 'monero': return '#ff6600';
    case 'shooter': return '#e74c3c'; // Red color for shooter enemies
    default: return '#95a5a6';
  }
};

window.Enemy.prototype.update = function(deltaTime) {
  // Handle shooting behavior for shooter enemies
  if (this.type === 'shooter') {
    this.updateShooting(deltaTime);
  }
  
  if (this.currentWaypoint >= this.path.waypoints.length - 1) {
    return false; // Reached end
  }

  const target = this.path.getWaypoint(this.currentWaypoint + 1);
  if (!target) return false;

  const dx = target.x - this.x;
  const dy = target.y - this.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 5) {
    this.currentWaypoint++;
    if (this.currentWaypoint >= this.path.waypoints.length - 1) {
      return false; // Reached end
    }
  } else {
    const moveSpeed = this.slowed ? this.speed * 0.5 : this.speed;
    const dt = deltaTime / 1000;
    this.x += (dx / distance) * moveSpeed * dt;
    this.y += (dy / distance) * moveSpeed * dt;
  }

  // Update slow effect
  if (this.slowed) {
    this.slowTimer -= deltaTime;
    if (this.slowTimer <= 0) {
      this.slowed = false;
    }
  }

  return true; // Still alive and moving
};

window.Enemy.prototype.takeDamage = function(damage) {
  this.health -= damage;
  const killed = this.health <= 0;
  
  // Play death sound if enemy is killed
  if (killed && window.game && window.game.audioEngine) {
    window.game.audioEngine.play('enemyDie');
  }
  
  return killed;
};

window.Enemy.prototype.applySlow = function(duration) {
  this.slowed = true;
  this.slowTimer = duration;
};

window.Enemy.prototype.getPixelPosition = function() {
  return { x: this.x, y: this.y };
};

window.Enemy.prototype.getPixelPosition = function() {
  return { x: this.x, y: this.y };
};

window.Enemy.prototype.isAtEnd = function() {
  return this.currentWaypoint >= this.path.waypoints.length - 1;
};

window.Enemy.prototype.canShoot = function() {
  return this.type === 'shooter';
};

window.Enemy.prototype.hasTarget = function(towerManager) {
  return this.findTowerTarget() !== null;
};

window.Enemy.prototype.selectTarget = function(towerManager) {
  return this.findTowerTarget();
};

window.Enemy.prototype.canFire = function() {
  const now = Date.now();
  return now - this.lastShot >= this.fireRate;
};

window.Enemy.prototype.fire = function(projectileManager, towerManager) {
  const target = this.findTowerTarget();
  if (target) {
    // Create projectile for enemy shooting
    projectileManager.createProjectile(
      this.x,
      this.y,
      target,
      this.damage,
      5, // projectile speed
      3, // projectile size
      '#e74c3c', // red color for enemy projectiles
      null // no slow effect
    );
    this.lastShot = Date.now();
  }
};

window.Enemy.prototype.isDead = function() {
  return this.health <= 0;
};

window.Enemy.prototype.updateShooting = function(deltaTime) {
  const now = Date.now();
  
  if (now - this.lastShot >= this.fireRate) {
    const target = this.findTowerTarget();
    if (target) {
      this.shootAtTower(target);
      this.lastShot = now;
    }
  }
};

window.Enemy.prototype.findTowerTarget = function() {
  // Find the nearest tower within range
  let nearestTower = null;
  let nearestDistance = Infinity;
  
  if (window.game && window.game.towerManager) {
    for (let tower of window.game.towerManager.towers) {
      const towerPos = tower.getPixelPosition();
      const distance = Math.sqrt(
        Math.pow(towerPos.x - this.x, 2) + 
        Math.pow(towerPos.y - this.y, 2)
      );
      
      if (distance <= this.range && distance < nearestDistance) {
        nearestDistance = distance;
        nearestTower = tower;
      }
    }
  }
  
  return nearestTower;
};

window.Enemy.prototype.shootAtTower = function(tower) {
  // Damage the tower
  if (tower.takeDamage) {
    tower.takeDamage(this.damage);
    
    // Play shooting sound
    if (window.game && window.game.audioEngine) {
      window.game.audioEngine.play('enemyShoot');
    }
  }
};

window.EnemyManager = function(path) {
  this.enemies = [];
  this.path = path;
};

window.EnemyManager.prototype.addEnemy = function(type, health, speed, reward) {
  const enemy = new window.Enemy(type, health, speed, reward, this.path);
  this.enemies.push(enemy);
  return enemy;
};

window.EnemyManager.prototype.update = function(deltaTime) {
  for (let i = this.enemies.length - 1; i >= 0; i--) {
    const enemy = this.enemies[i];
    if (!enemy.update(deltaTime)) {
      this.enemies.splice(i, 1);
    }
  }
};

window.EnemyManager.prototype.getEnemiesInRange = function(x, y, range) {
  return this.enemies.filter(enemy => {
    const dx = enemy.x - x;
    const dy = enemy.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= range;
  });
};

window.EnemyManager.prototype.removeEnemy = function(enemy) {
  const index = this.enemies.indexOf(enemy);
  if (index > -1) {
    this.enemies.splice(index, 1);
  }
};

window.EnemyManager.prototype.getEnemyAt = function(x, y, radius) {
  radius = radius || 20;
  for (let enemy of this.enemies) {
    const dx = enemy.x - x;
    const dy = enemy.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= radius) {
      return enemy;
    }
  }
  return null;
};

window.EnemyManager.prototype.clear = function() {
  this.enemies = [];
};