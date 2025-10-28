// Projectile system for tower attacks
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/projectile.js',
  exports: ['Projectile', 'ProjectileManager']
});

window.Projectile = function(x, y, target, damage, speed, color, slowEffect, slowDuration, sourceTower) {
  this.x = x;
  this.y = y;
  this.target = target;
  this.damage = damage;
  this.speed = speed;
  this.color = color;
  this.size = 4;
  this.slowEffect = slowEffect || false;
  this.slowDuration = slowDuration || 0;
  this.sourceTower = sourceTower || null;
  this.active = true;
};

window.Projectile.prototype.update = function(deltaTime) {
  if (!this.active || !this.target) {
    this.active = false;
    return false;
  }

  const dx = this.target.x - this.x;
  const dy = this.target.y - this.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 10) {
    // Hit target
    const killed = this.target.takeDamage(this.damage);
    
    // Play hit sound
    if (window.game && window.game.audioEngine) {
      window.game.audioEngine.play('enemyHit');
    }
    
    if (this.slowEffect) {
      this.target.applySlow(this.slowDuration);
    }
    
    this.active = false;
    return killed;
  }

  // Move towards target
  const dt = deltaTime / 1000;
  const moveX = (dx / distance) * this.speed * dt;
  const moveY = (dy / distance) * this.speed * dt;

  this.x += moveX;
  this.y += moveY;

  return true;
};

window.ProjectileManager = function() {
  this.projectiles = [];
};

window.ProjectileManager.prototype.createProjectile = function(x, y, target, damage, speed, color, slowEffect, slowDuration, sourceTower) {
  const projectile = new window.Projectile(x, y, target, damage, speed, color, slowEffect, slowDuration, sourceTower);
  this.projectiles.push(projectile);
};

window.ProjectileManager.prototype.update = function(deltaTime, enemyManager, game) {
  for (let i = this.projectiles.length - 1; i >= 0; i--) {
    const projectile = this.projectiles[i];
    const killed = projectile.update(deltaTime);
    
    if (!projectile.active) {
      if (killed && projectile.target) {
        game.addGold(projectile.target.reward);
        enemyManager.removeEnemy(projectile.target);
        
        // Award kill to the tower that fired this projectile
        if (projectile.sourceTower) {
          projectile.sourceTower.incrementKills();
        }
      }
      this.projectiles.splice(i, 1);
    }
  }
};

window.ProjectileManager.prototype.clear = function() {
  this.projectiles = [];
};