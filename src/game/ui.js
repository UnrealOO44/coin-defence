// User interface system
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/ui.js',
  exports: ['UI'],
  dependencies: []
});

window.UI = function(game) {
  this.game = game;
  this.selectedTowerType = null;
  this.score = 0;
  
  // Cache UI elements with null checks
  this.elements = {
    gold: document.getElementById('gold'),
    lives: document.getElementById('lives'),
    wave: document.getElementById('wave'),
    score: document.getElementById('score'),
    startWaveBtn: document.getElementById('startWaveBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    speedBtn: document.getElementById('speedBtn'),
    muteBtn: document.getElementById('muteBtn'),
    gameMessage: document.getElementById('gameMessage')
  };
  
  this.initializeControls();
};

window.UI.prototype.initializeControls = function() {
  const self = this;
  
  // Tower selection buttons
  const towerButtons = document.querySelectorAll('.tower-btn');
  towerButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', function() {
        const towerType = this.getAttribute('data-tower');
        if (towerType) {
          self.selectTowerType(towerType);
        }
      });
    }
  });
  
  // Initialize button states on load
  this.updateTowerButtonStates(parseInt(this.elements.gold?.textContent || 0));
  
  // Start wave button
  if (this.elements.startWaveBtn) {
    this.elements.startWaveBtn.addEventListener('click', function() {
      if (self.game && self.game.startWave) {
        self.game.startWave();
      }
    });
  }
  
  // Pause button (if exists)
  if (this.elements.pauseBtn) {
    this.elements.pauseBtn.addEventListener('click', function() {
      if (self.game && self.game.togglePause) {
        self.game.togglePause();
        this.textContent = self.game.paused ? 'Resume' : 'Pause';
      }
    });
  }
  
  // Speed button
  if (this.elements.speedBtn) {
    this.elements.speedBtn.addEventListener('click', function() {
      if (self.game && self.game.toggleSpeed) {
        self.game.toggleSpeed();
      }
    });
  }
  
  // Mute button (if exists)
  if (this.elements.muteBtn) {
    this.elements.muteBtn.addEventListener('click', function() {
      if (self.game && self.game.audioEngine) {
        self.game.audioEngine.toggleMute();
        this.textContent = self.game.audioEngine.isMuted ? '🔇 Sound' : '🔊 Sound';
      }
    });
  }
};

window.UI.prototype.selectTowerType = function(type) {
  // Check if user can afford this tower type
  const costs = { miner: 50, lightning: 100, fire: 150 };
  const currentGold = parseInt(this.elements.gold?.textContent || 0);
  
  if (currentGold < costs[type]) {
    // Cannot afford - don't select
    return;
  }
  
  // Clear previous selection
  this.clearSelection();
  
  // Set new selection
  this.selectedTowerType = type;
  const button = document.querySelector(`[data-tower="${type}"]`);
  if (button) {
    button.classList.add('selected');
  }
};

window.UI.prototype.clearSelection = function() {
  this.selectedTowerType = null;
  const towerButtons = document.querySelectorAll('.tower-btn');
  towerButtons.forEach(button => {
    button.classList.remove('selected');
  });
};

window.UI.prototype.getSelectedTowerType = function() {
  return this.selectedTowerType;
};

window.UI.prototype.showTowerControls = function(tower) {
  let controlsContainer = document.getElementById('towerControls');
  if (!controlsContainer) {
    controlsContainer = document.createElement('div');
    controlsContainer.id = 'towerControls';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.zIndex = '1000';
    controlsContainer.style.background = 'rgba(0,0,0,0.8)';
    controlsContainer.style.padding = '10px';
    controlsContainer.style.borderRadius = '5px';
    controlsContainer.style.border = '2px solid #f39c12';
    controlsContainer.style.color = '#fff';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.gap = '10px';
    controlsContainer.style.pointerEvents = 'auto'; // Ensure interaction
    document.body.appendChild(controlsContainer);
  }
  
  const rect = this.game.canvas.getBoundingClientRect();
  
  // Position the controls relative to the canvas
  const canvasX = rect.left + (tower.x * (rect.width / this.game.canvas.width));
  const canvasY = rect.top + (tower.y * (rect.height / this.game.canvas.height));
  
  const newLeft = Math.min(canvasX + 30, window.innerWidth - 220) + 'px';
  const newTop = Math.min(canvasY - 20, window.innerHeight - 100) + 'px';
  
  // Only update position if it changed
  if (controlsContainer.style.left !== newLeft || controlsContainer.style.top !== newTop) {
    controlsContainer.style.left = newLeft;
    controlsContainer.style.top = newTop;
  }
  
  // Only update content if tower changed or tower upgraded
  const currentLevel = tower.level;
  const currentDamage = tower.damage.toFixed(1);
  const currentRange = tower.range.toFixed(0);
  const currentUpgradeCost = tower.getUpgradeCost();
  const currentSellValue = Math.floor(tower.getTotalValue() * 0.7);
  
  const towerDataKey = `${currentLevel}_${currentDamage}_${currentRange}_${currentUpgradeCost}_${currentSellValue}`;
  
  if (controlsContainer.dataset.towerData !== towerDataKey) {
    controlsContainer.dataset.towerData = towerDataKey;
    
    controlsContainer.innerHTML = `
      <div>
        <div style="margin-bottom: 5px;">Tower Level: ${tower.level}/${tower.maxLevel}</div>
        <div style="margin-bottom: 5px;">Damage: ${tower.damage.toFixed(1)}</div>
        <div style="margin-bottom: 10px;">Range: ${tower.range.toFixed(0)}</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        ${tower.level < tower.maxLevel ? 
          `<button onclick="game.upgradeSelectedTower()" style="padding: 5px 10px; background: #27ae60; color: white; border: none; border-radius: 3px; cursor: pointer;">Upgrade (${tower.getUpgradeCost()}g)</button>` : 
          '<div style="color: #95a5a6; font-size: 12px;">Max Level</div>'}
        <button onclick="game.sellSelectedTower()" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 3px; cursor: pointer;">Sell (${Math.floor(tower.getTotalValue() * 0.7)}g)</button>
      </div>
    `;
  }
  
  controlsContainer.style.display = 'block';
};

window.UI.prototype.hideTowerControls = function() {
  const container = document.getElementById('towerControls');
  if (container) {
    container.style.display = 'none';
  }
};

window.UI.prototype.updateGold = function(amount) {
  if (this.elements.gold) {
    this.elements.gold.textContent = amount;
  }
  this.updateTowerButtonStates(amount);
};

window.UI.prototype.updateLives = function(amount) {
  if (this.elements.lives) {
    this.elements.lives.textContent = amount;
  }
};

// Note: Lives display is currently handled in game status but function remains for compatibility

window.UI.prototype.updateWave = function(amount) {
  if (this.elements.wave) {
    this.elements.wave.textContent = amount;
  }
};

window.UI.prototype.updateScore = function(points) {
  this.score += points;
  if (this.elements.score) {
    this.elements.score.textContent = this.score;
  }
};

window.UI.prototype.updateStartWaveButton = function(enabled) {
  if (this.elements.startWaveBtn) {
    this.elements.startWaveBtn.disabled = !enabled;
    this.elements.startWaveBtn.style.opacity = enabled ? '1' : '0.5';
  }
};

window.UI.prototype.updateSpeedButton = function(speedMultiplier, autoSpeedEnabled) {
  if (this.elements.speedBtn) {
    this.elements.speedBtn.textContent = `Speed: ${speedMultiplier}x`;
  }
};

window.UI.prototype.updateTowerButtonStates = function(currentGold) {
  const costs = { miner: 50, lightning: 100, fire: 150 };
  
  Object.keys(costs).forEach(type => {
    const button = document.querySelector(`[data-tower="${type}"]`);
    if (button) {
      if (currentGold < costs[type]) {
        button.classList.add('disabled');
        button.disabled = true;
      } else {
        button.classList.remove('disabled');
        button.disabled = false;
      }
    }
  });
};

window.UI.prototype.showGameOver = function(wavesCompleted) {
  const message = this.elements.gameMessage || this.createGameMessage();
  if (message) {
    message.innerHTML = `
      <h2>Game Over</h2>
      <p>You survived ${wavesCompleted} waves!</p>
      <p>Final Score: ${this.score}</p>
      <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Play Again</button>
    `;
    message.style.display = 'block';
    message.classList.add('defeat');
  }
};

window.UI.prototype.showVictory = function() {
  const message = this.elements.gameMessage || this.createGameMessage();
  if (message) {
    message.innerHTML = `
      <h2>Victory!</h2>
      <p>You survived all 20 waves!</p>
      <p>Final Score: ${this.score}</p>
      <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">Play Again</button>
    `;
    message.style.display = 'block';
    message.classList.add('victory');
  }
};

window.UI.prototype.createGameMessage = function() {
  let message = document.getElementById('gameMessage');
  if (!message) {
    message = document.createElement('div');
    message.id = 'gameMessage';
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.background = 'rgba(0,0,0,0.9)';
    message.style.color = '#fff';
    message.style.padding = '30px';
    message.style.borderRadius = '10px';
    message.style.textAlign = 'center';
    message.style.fontSize = '18px';
    message.style.border = '2px solid #f39c12';
    message.style.zIndex = '2000';
    message.style.display = 'none';
    document.body.appendChild(message);
    // Cache it for future use
    this.elements.gameMessage = message;
  }
  return message;
};