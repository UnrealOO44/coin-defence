// Main game controller and state management
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/main.js',
  exports: ['Game'],
  dependencies: ['Grid', 'Path', 'Input', 'Renderer', 'TowerManager', 'EnemyManager', 'ProjectileManager', 'WaveManager', 'UI']
});

window.Game = function() {
  this.canvas = document.getElementById('gameCanvas');
  this.ctx = this.canvas.getContext('2d');
  
  // Game state
  this.gold = 100;
  this.lives = 20;
  this.wave = 1;
  this.gameOver = false;
  this.victory = false;
  this.paused = false;
  this.speedMultiplier = 1;
  
  // Initialize canvas size
  this.setupResponsiveCanvas();
  
  // Game status tracking
  this.lastTowerFireTime = 0;
  this.projectilesFired = 0;
  this.enemiesKilled = 0;
  this.towersPlaced = 0;
  
  // Initialize systems with fixed cell size
  this.grid = new window.Grid(this.canvas.width, this.canvas.height, this.cellSize);
  this.path = new window.Path(this.grid);
  this.input = new window.Input();
  this.renderer = new window.Renderer(this.canvas);
  this.towerManager = new window.TowerManager(this.grid);
  this.enemyManager = new window.EnemyManager(this.path);
  this.projectileManager = new window.ProjectileManager();
  this.ui = new window.UI(this);
  this.waveManager = new window.WaveManager(this.enemyManager, this);
  this.audioEngine = new window.AudioEngine();
  
  // Initialize input
  this.input.init(this.canvas);
  
  // Game speed options
  this.speedOptions = [1, 2, 3];
  this.currentSpeedIndex = 0;
  this.autoSpeedEnabled = true;
  this.lastAutoSpeedCheck = 0;
  this.autoSpeedCheckInterval = 500; // Check every 500ms
  this.speedUpDelay = 5000; // 5 seconds delay before speeding up
  this.enemiesPassedTime = 0; // When enemies first passed the defense area
  this.currentlySpeededUp = false;
  this.towerLastFiredTime = Date.now(); // Initialize tower fire time tracking
  
  // Setup event listeners
  this.setupEventListeners();
  
  // Initial UI update
  this.updateUI();
};

window.Game.prototype.setupResponsiveCanvas = function() {
  // Set canvas dimensions for consistent 40x18 grid
  const cols = 40; // Grid columns
  const rows = 18; // Grid rows
  const targetCellSize = 20; // Target cell size for better fit
  
  // Force cell size to exactly 20px and calculate canvas dimensions
  this.cellSize = 20;
  const finalWidth = cols * this.cellSize;
  const finalHeight = rows * this.cellSize;
  
  // Remove CSS scaling to show actual canvas size
  this.canvas.style.width = '';
  this.canvas.style.height = '';
  
  // Set canvas to exact grid dimensions
  this.canvas.width = cols * this.cellSize;
  this.canvas.height = rows * this.cellSize;
  
  // Handle resize
  window.addEventListener('resize', () => {
    this.setupResponsiveCanvas();
    // Reinitialize systems that depend on canvas size
    this.grid = new window.Grid(this.canvas.width, this.canvas.height, this.cellSize);
    this.path = new window.Path(this.grid);
    this.towerManager.grid = this.grid;
    this.enemyManager.path = this.path;
    // Update renderer cell size
    this.renderer.updateCellSize(this.cellSize);
  });
};

window.Game.prototype.setupEventListeners = function() {
  const self = this;
  
  // Mouse/Touch input handlers
  const handleCanvasClick = (x, y) => {
    if (self.gameOver || self.paused) return;
    
    // Use canvas coordinates directly (already converted by input system)
    const canvasX = x;
    const canvasY = y;
    
    // Convert to grid coordinates
    const gridPos = {
      row: Math.floor(canvasY / self.grid.cellSize),
      col: Math.floor(canvasX / self.grid.cellSize)
    };
    
    // Check for tower selection
    const clickedTower = self.towerManager.selectTower(canvasX, canvasY);
    
    if (clickedTower) {
      self.ui.showTowerControls(clickedTower);
      return;
    }
    
    // Check for tower placement
    const towerType = self.ui.getSelectedTowerType();
    if (towerType) {
      self.placeTower(gridPos.row, gridPos.col, towerType);
      self.ui.clearSelection();
    }
  };
  
  const handleCanvasLongPress = (x, y) => {
    if (self.gameOver || self.paused) return;
    
    // Use canvas coordinates directly (already converted by input system)
    const canvasX = x;
    const canvasY = y;
    
    // Check for tower selection (long press selects tower)
    const clickedTower = self.towerManager.selectTower(canvasX, canvasY);
    if (clickedTower) {
      self.ui.showTowerControls(clickedTower);
    }
  };
  
  const handleCanvasMove = (x, y) => {
    // Mouse coordinates are already updated by input system
    
    // Update tower controls if tower is selected
    if (self.towerManager.selectedTower) {
      self.ui.showTowerControls(self.towerManager.selectedTower);
    }
  };
  
  // Set up input callbacks
  if (self.input.isMobile) {
    self.input.setTapCallback(handleCanvasClick);
    self.input.setLongPressCallback(handleCanvasLongPress);
    self.input.setTouchMoveCallback(handleCanvasMove);
  } else {
    // Desktop mouse events - input system already handles coordinate conversion
    self.canvas.addEventListener('click', function(e) {
      handleCanvasClick(self.input.mouse.x, self.input.mouse.y);
    });

    self.canvas.addEventListener('dblclick', function(e) {
      handleCanvasLongPress(self.input.mouse.x, self.input.mouse.y);
    });

    self.canvas.addEventListener('mousemove', function(e) {
      handleCanvasMove(self.input.mouse.x, self.input.mouse.y);
    });
  }

  // Keyboard shortcuts
  window.addEventListener('keydown', function(e) {
    if (e.key === 'u' || e.key === 'U') {
      self.upgradeSelectedTower();
    }
    if (e.key === 's' || e.key === 'S') {
      self.sellSelectedTower();
    }
    if (e.key === ' ') {
      e.preventDefault();
      self.startWave();
    }
    if (e.key === 'p' || e.key === 'P') {
      self.togglePause();
    }
  });
};

window.Game.prototype.placeTower = function(row, col, type) {
  const costs = { miner: 50, lightning: 100, fire: 150 };
  const cost = costs[type];
  
  if (this.gold >= cost && !this.grid.isOccupied(row, col)) {
    const tower = this.towerManager.placeTower(row, col, type);
    if (tower) {
      this.gold -= cost;
      this.towersPlaced++;
      this.updateUI();
      if (this.audioEngine) {
        this.audioEngine.play('placeTower');
      }
    }
  }
};

window.Game.prototype.upgradeSelectedTower = function() {
  const tower = this.towerManager.selectedTower;
  if (tower) {
    const upgradeCost = tower.getUpgradeCost();
    if (this.gold >= upgradeCost && tower.upgrade()) {
      this.gold -= upgradeCost;
      this.ui.showTowerControls(tower); // Refresh controls to update costs
      this.updateUI();
      if (this.audioEngine) {
        this.audioEngine.play('upgradeTower');
      }
    }
  }
};

window.Game.prototype.sellSelectedTower = function() {
  const tower = this.towerManager.selectedTower;
  if (tower) {
    const sellValue = Math.floor(tower.getTotalValue() * 0.7); // 70% refund of total value
    this.gold += sellValue;
    this.towerManager.removeTower(tower);
    this.ui.hideTowerControls();
    this.updateUI();
    if (this.audioEngine) {
      this.audioEngine.play('sellTower');
    }
  }
};

window.Game.prototype.startWave = function() {
  if (!this.waveManager.isWaveInProgress()) {
    this.waveManager.startWave();
  }
};

window.Game.prototype.toggleSpeed = function() {
  this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.speedOptions.length;
  this.speedMultiplier = this.speedOptions[this.currentSpeedIndex];
  this.autoSpeedEnabled = this.currentSpeedIndex === 0; // Auto speed only works on manual 1x
  this.ui.updateSpeedButton(this.speedMultiplier, this.autoSpeedEnabled);
};

// Check if any enemies are still in tower defense area
window.Game.prototype.checkEnemiesInDefenseArea = function() {
  if (this.towerManager.towers.length === 0) return false;
  
  // Find furthest tower position along the path
  let maxTowerProgress = 0;
  for (let tower of this.towerManager.towers) {
    const towerProgress = this.path.getProgressAtPosition(
      tower.col * this.grid.cellSize + this.grid.cellSize / 2,
      tower.row * this.grid.cellSize + this.grid.cellSize / 2
    );
    maxTowerProgress = Math.max(maxTowerProgress, towerProgress);
  }
  
  // Check if any enemy is still before or at furthest tower position
  for (let enemy of this.enemyManager.enemies) {
    const enemyProgress = this.path.getProgressAtPosition(enemy.x, enemy.y);
    if (enemyProgress <= maxTowerProgress) {
      return true; // Enemy is still in defense area
    }
  }
  
  return false; // All enemies have passed the defense area
};

// Auto speed management
window.Game.prototype.updateAutoSpeed = function(deltaTime) {
  if (!this.autoSpeedEnabled || this.paused || this.gameOver) return;
  
  this.lastAutoSpeedCheck += deltaTime;
  if (this.lastAutoSpeedCheck < this.autoSpeedCheckInterval) return;
  
  this.lastAutoSpeedCheck = 0;
  
  const enemiesInDefenseArea = this.checkEnemiesInDefenseArea();
  const hasEnemies = this.enemyManager.enemies.length > 0;
  const timeSinceLastFire = Date.now() - this.towerLastFiredTime;
  
  if (hasEnemies && !enemiesInDefenseArea && timeSinceLastFire >= this.speedUpDelay) {
    // Enemies exist, towers can't shoot them, AND towers haven't fired for 5+ seconds
    this.speedMultiplier = 3;
    this.currentlySpeededUp = true;
  } else {
    // No enemies, enemies are in range, or towers are still firing - normal speed
    this.speedMultiplier = 1;
    this.currentlySpeededUp = false;
    
    // Reset delay timer if towers are still active
    if (enemiesInDefenseArea || !hasEnemies) {
      this.towerLastFiredTime = Date.now();
    }
  }
  
  this.ui.updateSpeedButton(this.speedMultiplier, this.autoSpeedEnabled);
};

// Call this when any tower fires
window.Game.prototype.recordTowerFire = function() {
  this.lastTowerFireTime = Date.now();
  this.projectilesFired++;
  this.currentlySpeededUp = false;
  this.speedMultiplier = 1;
};

window.Game.prototype.recordEnemyKill = function() {
  this.enemiesKilled++;
};

window.Game.prototype.togglePause = function() {
  this.paused = !this.paused;
  const hint = document.querySelector('.hint');
  if (hint) {
    hint.textContent = this.paused ? 'PAUSED - Press P to resume' : '📱 Tap to place towers • Long press towers for options • Don\'t let coins reach the end!';
  }
};

window.Game.prototype.update = function(deltaTime) {
  if (this.gameOver || this.paused) return;
  
  // Update auto speed before applying multiplier
  this.updateAutoSpeed(deltaTime);
  
  // Apply speed multiplier
  const adjustedDelta = deltaTime * this.speedMultiplier;
  
  // Update all systems
  this.towerManager.update(deltaTime, this.enemyManager.enemies, this.projectileManager);
  this.enemyManager.update(adjustedDelta);
  this.projectileManager.update(deltaTime, this.enemyManager, this);
  this.waveManager.update(adjustedDelta);
  
  // Check for enemies reaching the end
  this.checkEnemyEscapes();
  
  // Update UI
  this.updateUI();
  
  // Update status icons
  this.updateStatusIcons();
  
  // Check game over
  this.checkGameOver();
};

window.Game.prototype.render = function() {
  this.renderer.clear();
  this.renderer.drawGrid(this.grid);
  this.renderer.drawPath(this.path);
  
  // Draw tower placement preview
  if (!this.gameOver && !this.paused) {
    const gridPos = {
      row: Math.floor(this.input.mouse.y / this.grid.cellSize),
      col: Math.floor(this.input.mouse.x / this.grid.cellSize)
    };
    const selectedTowerType = this.ui.getSelectedTowerType();
    const canPlace = !this.grid.isOccupied(gridPos.row, gridPos.col) && selectedTowerType;
    
    // Draw preview with range if tower type is selected
    this.renderer.drawPreview(gridPos.row, gridPos.col, canPlace, selectedTowerType);
    
    // Draw tower icon preview if placement is valid
    if (canPlace && selectedTowerType) {
      this.renderer.drawTowerIconPreview(gridPos.row, gridPos.col, selectedTowerType);
    }
  }
  
  // Draw towers
  for (let tower of this.towerManager.towers) {
    this.renderer.drawTower(tower);
  }
  
  // Draw enemies
  for (let enemy of this.enemyManager.enemies) {
    this.renderer.drawEnemy(enemy);
  }
  
  // Draw projectiles
  for (let projectile of this.projectileManager.projectiles) {
    this.renderer.drawProjectile(projectile);
  }
  
  // Update tower controls UI
  if (this.towerManager.selectedTower) {
    this.ui.showTowerControls(this.towerManager.selectedTower);
  } else {
    this.ui.hideTowerControls();
  }
  
  // Draw paused overlay
  if (this.paused) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderer.drawText('PAUSED', this.canvas.width / 2, this.canvas.height / 2, '#fff', '48px Arial');
  }
};

window.Game.prototype.checkEnemyEscapes = function() {
  for (let i = this.enemyManager.enemies.length - 1; i >= 0; i--) {
    const enemy = this.enemyManager.enemies[i];
    
    // Check if enemy died (not just escaped)
    if (enemy.health <= 0) {
      this.recordEnemyKill();
      this.gold += enemy.reward;
      this.enemyManager.removeEnemy(enemy);
    } else if (enemy.isAtEnd()) {
      this.lives--;
      this.enemyManager.removeEnemy(enemy);
      
      if (this.lives <= 0) {
        this.gameOver = true;
        this.ui.showGameOver(this.waveManager.getWavesCompleted());
      }
    }
  }
};

window.Game.prototype.checkGameOver = function() {
  // Check victory condition (survive 20 waves)
  if (this.waveManager.getWavesCompleted() >= 20 && !this.gameOver) {
    this.victory = true;
    this.gameOver = true;
    this.ui.showVictory();
  }
};

window.Game.prototype.addGold = function(amount) {
  this.gold += amount;
};

window.Game.prototype.updateUI = function() {
  this.ui.updateGold(this.gold);
  this.ui.updateLives(this.lives);
  this.ui.updateWave(this.waveManager.getCurrentWave());
  this.ui.updateStartWaveButton(!this.waveManager.isWaveInProgress());
};

window.Game.prototype.updateWaveDisplay = function(wave) {
  this.wave = wave;
};

window.Game.prototype.updateStatusIcons = function() {
  let statusDiv = document.getElementById('gameStatus');
  if (!statusDiv) {
    // Create status div if it doesn't exist
    statusDiv = document.createElement('div');
    statusDiv.id = 'gameStatus';
    statusDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
    `;
    document.body.appendChild(statusDiv);
  }
  statusDiv.innerHTML = `
    <div style="margin-bottom: 5px;">🎮 Game Status</div>
    <div>🏰 Towers: ${this.towersPlaced}</div>
    <div>🔫 Projectiles: ${this.projectilesFired}</div>
    <div>💀 Enemies Killed: ${this.enemiesKilled}</div>
    <div>⚡ Speed: ${this.speedMultiplier}x</div>
    <div>🎯 Wave: ${this.waveManager.getCurrentWave()}/20</div>
  `;
};

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', function() {
  window.game = new window.Game();
  
  // Set up global update and render functions for game loop
  window.update = function(deltaTime) {
    window.game.update(deltaTime);
  };
  
  window.render = function() {
    window.game.render();
  };
  
  // Initialize audio on first user interaction
  const initAudioOnFirstInteraction = () => {
    if (window.game && window.game.audioEngine) {
      window.game.audioEngine.init();
      window.game.audioEngine.play('backgroundMusic');
      document.removeEventListener('click', initAudioOnFirstInteraction);
      document.removeEventListener('keydown', initAudioOnFirstInteraction);
      document.removeEventListener('touchstart', initAudioOnFirstInteraction);
    }
  };
  
  document.addEventListener('click', initAudioOnFirstInteraction);
  document.addEventListener('keydown', initAudioOnFirstInteraction);
  document.addEventListener('touchstart', initAudioOnFirstInteraction);
  
  // Start game loop
  window.startGame();
});