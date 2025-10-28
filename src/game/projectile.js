// Projectile system
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/projectile.js',
  exports: ['Projectile', 'ProjectileManager'],
  dependencies: ['Vector2D']
});

window.Projectile = function(x, y, target, damage, speed, size, color, slowEffect) {
  this.x = x;
  this.y = y;
  this.target = target;
  this.damage = damage;
  this.speed = speed;
  this.size = size;
  this.color = color;
  this.slowEffect = slowEffect;
  this.active = true;
  
  // For trail effect
  this.trailPositions = [];
  this.maxTrailLength = 3;
  
  // Track if this is an enemy projectile (targeting towers)
  this.isEnemyProjectile = color === '#e74c3c';
};

window.Projectile.prototype.update = function(deltaTime) {
  if (!this.active || !this.target || this.target.isDead()) {
    this.active = false;
    return;
  }
  
  const adjustedDelta = deltaTime / 1000;
  const dx = this.target.x - this.x;
  const dy = this.target.y - this.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Debug: Log distance occasionally
  if (Math.random() < 0.01) {
    console.log('Projectile at', this.x, this.y, 'Target at', this.target.x, this.target.y, 'Distance:', distance, 'Hit radius:', Math.max(this.target.size || 16, 15), 'Speed:', this.speed);
  }
  
  // Check for collision - larger hit radius for better accuracy
  const hitRadius = Math.max(this.target.size || 16, 15); // Increased to 15
  if (distance <= hitRadius) {
    // Hit target
    console.log('HIT! Projectile hit target');
    if (this.isEnemyProjectile && this.target.takeDamage) {
      // Enemy projectile hitting tower
      this.target.takeDamage(this.damage);
    } else if (!this.isEnemyProjectile && this.target.takeDamage) {
      // Tower projectile hitting enemy
      this.target.takeDamage(this.damage);
      if (this.slowEffect) {
        this.target.applySlow(this.slowEffect, 1000);
      }
    }
    this.active = false;
    return;
  }
  
  // Move towards target
  const moveX = (dx / distance) * this.speed * adjustedDelta;
  const moveY = (dy / distance) * this.speed * adjustedDelta;
  
  // Add current position to trail
  this.trailPositions.push({ x: this.x, y: this.y });
  if (this.trailPositions.length > this.maxTrailLength) {
    this.trailPositions.shift();
  }
  
  this.x += moveX;
  this.y += moveY;
};

window.ProjectileManager = function() {
  this.projectiles = [];
};

window.ProjectileManager.prototype.createProjectile = function(x, y, target, damage, speed, size, color, slowEffect) {
  console.log('Creating projectile at', x, y, 'with speed', speed, 'target at', target.x, target.y);
  this.projectiles.push(new window.Projectile(x, y, target, damage, speed, size, color, slowEffect));
};

window.ProjectileManager.prototype.update = function(deltaTime, enemyManager, game) {
  // Update all projectiles (tower and enemy projectiles)
  for (let i = this.projectiles.length - 1; i >= 0; i--) {
    const projectile = this.projectiles[i];
    projectile.update(deltaTime);
    
    if (!projectile.active) {
      this.projectiles.splice(i, 1);
    }
  }
  
  // Enemy projectile system - create new projectiles from enemies
  if (enemyManager && enemyManager.enemies) {
    for (let enemy of enemyManager.enemies) {
      if (enemy.type === 'shooter' && enemy.hasTarget(game.towerManager) && enemy.canFire()) {
        const target = enemy.selectTarget(game.towerManager);
        if (target) {
          // Create enemy projectile
          this.createProjectile(
            enemy.x,
            enemy.y,
            target,
            enemy.damage,
            50, // projectile speed
            3, // projectile size
            '#e74c3c', // red color for enemy projectiles
            null // no slow effect
          );
          enemy.lastShot = Date.now();
        }
      }
    }
  }
};