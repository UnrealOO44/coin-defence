// Wave system for enemy spawning
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/waves.js',
  exports: ['WaveManager', 'WaveDefinition']
});

window.WaveDefinition = function(waveNumber) {
  this.waveNumber = waveNumber;
  this.enemies = [];
  this.generateEnemies();
};

window.WaveDefinition.prototype.generateEnemies = function() {
  const baseCount = 5 + this.waveNumber * 2;
  const enemyTypes = ['bitcoin'];
  
  // Add new enemy types as waves progress
  if (this.waveNumber >= 3) enemyTypes.push('ethereum');
  if (this.waveNumber >= 5) enemyTypes.push('dogecoin');
  if (this.waveNumber >= 8) enemyTypes.push('monero');
  if (this.waveNumber >= 6) enemyTypes.push('shooter'); // Shooter enemies start at wave 6

  // Generate enemies with increasing difficulty
  for (let i = 0; i < baseCount; i++) {
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const stats = this.getEnemyStats(type, this.waveNumber);
    const delay = i * 1000; // 1 second between spawns
    
    this.enemies.push({
      type: type,
      health: stats.health,
      speed: stats.speed,
      reward: stats.reward,
      delay: delay
    });
  }
  
  // Add extra shooter enemies starting from wave 6
  if (this.waveNumber >= 6) {
    const shooterCount = Math.floor((this.waveNumber - 5) * 0.8); // Gradually increase shooter count
    for (let i = 0; i < shooterCount; i++) {
      const stats = this.getEnemyStats('shooter', this.waveNumber);
      const delay = (baseCount + i) * 1000 + 2000; // Spawn after normal enemies
      
      this.enemies.push({
        type: 'shooter',
        health: stats.health,
        speed: stats.speed,
        reward: stats.reward,
        delay: delay
      });
    }
  }
};

window.WaveDefinition.prototype.getEnemyStats = function(type, waveNumber) {
  const multiplier = 1 + (waveNumber - 1) * 0.15;
  
  switch(type) {
    case 'bitcoin':
      return {
        health: Math.floor(50 * multiplier),
        speed: 50, // Slowed down for better balance
        reward: Math.floor(10 * multiplier)
      };
    case 'ethereum':
      return {
        health: Math.floor(80 * multiplier),
        speed: 45, // Slowed down for better balance
        reward: Math.floor(15 * multiplier)
      };
    case 'dogecoin':
      return {
        health: Math.floor(30 * multiplier),
        speed: 80, // Still fastest but more reasonable
        reward: Math.floor(8 * multiplier)
      };
    case 'monero':
      return {
        health: Math.floor(120 * multiplier),
        speed: 35, // Slow tank movement
        reward: Math.floor(25 * multiplier)
      };
    case 'shooter':
      return {
        health: Math.floor(100 * multiplier), // Higher health than regular enemies
        speed: 40, // Slow but dangerous enemy
        reward: Math.floor(30 * multiplier) // Higher reward due to danger
      };
    default:
      return {
        health: 50,
        speed: 80,
        reward: 10
      };
  }
};

window.WaveManager = function(enemyManager, game) {
  this.enemyManager = enemyManager;
  this.game = game;
  this.currentWave = 1;
  this.waveInProgress = false;
  this.waveDefinition = null;
  this.spawnTimer = 0;
  this.enemiesSpawned = 0;
  this.wavesCompleted = 0;
};

window.WaveManager.prototype.startWave = function() {
  if (this.waveInProgress) return false;
  
  this.waveInProgress = true;
  this.waveDefinition = new window.WaveDefinition(this.currentWave);
  this.spawnTimer = 0;
  this.enemiesSpawned = 0;
  this.game.updateWaveDisplay(this.currentWave);
  
  return true;
};

window.WaveManager.prototype.update = function(deltaTime) {
  if (!this.waveInProgress || !this.waveDefinition) return;

  this.spawnTimer += deltaTime;

  // Spawn enemies based on their delay
  while (this.enemiesSpawned < this.waveDefinition.enemies.length) {
    const enemyData = this.waveDefinition.enemies[this.enemiesSpawned];
    
    if (this.spawnTimer >= enemyData.delay) {
      this.enemyManager.addEnemy(
        enemyData.type,
        enemyData.health,
        enemyData.speed,
        enemyData.reward
      );
      
      // Play spawn sound
      if (window.game && window.game.audioEngine) {
        window.game.audioEngine.play('enemySpawn');
      }
      
      this.enemiesSpawned++;
    } else {
      break;
    }
  }

  // Check if wave is complete
  if (this.enemiesSpawned >= this.waveDefinition.enemies.length && 
      this.enemyManager.enemies.length === 0) {
    this.completeWave();
  }
};

window.WaveManager.prototype.completeWave = function() {
  this.waveInProgress = false;
  this.wavesCompleted++;
  this.currentWave++;
  
  // Play wave completion sound
  if (window.game && window.game.audioEngine) {
    window.game.audioEngine.play('waveComplete');
  }
  
  // Wave completion bonus
  const bonus = 50 + this.wavesCompleted * 10;
  this.game.addGold(bonus);
};

window.WaveManager.prototype.isWaveInProgress = function() {
  return this.waveInProgress;
};

window.WaveManager.prototype.getCurrentWave = function() {
  return this.currentWave;
};

window.WaveManager.prototype.getWavesCompleted = function() {
  return this.wavesCompleted;
};

window.WaveManager.prototype.getEnemiesRemaining = function() {
  if (!this.waveDefinition) return 0;
  return Math.max(0, this.waveDefinition.enemies.length - this.enemiesSpawned) + this.enemyManager.enemies.length;
};