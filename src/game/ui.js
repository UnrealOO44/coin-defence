// UI management for game interface
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/ui.js',
  exports: ['UI', 'Button']
});

// Button class for UI buttons
window.Button = function(id, text, cost, callback) {
  this.element = document.getElementById(id);
  this.text = text;
  this.cost = cost || 0;
  this.callback = callback || null;
  this.enabled = true;
  
  if (this.element) {
    this.element.textContent = this.getDisplayText();
  }
};

window.Button.prototype.getDisplayText = function() {
  return this.cost > 0 ? `${this.text} (${this.cost})` : this.text;
};

window.Button.prototype.setEnabled = function(enabled) {
  this.enabled = enabled;
  if (this.element) {
    this.element.disabled = !enabled;
    // For tower buttons, update visual state
    if (this.element.classList.contains('tower-btn')) {
      if (!enabled) {
        this.element.style.opacity = '0.6';
      } else {
        this.element.style.opacity = '1';
      }
    }
  }
};

window.Button.prototype.updateCost = function(cost) {
  this.cost = cost;
  if (this.element) {
    // Update cost badge for tower buttons
    var costElement = this.element.querySelector('.tower-cost');
    if (costElement) {
      costElement.textContent = cost;
    } else {
      this.element.textContent = this.getDisplayText();
    }
  }
};

window.Button.prototype.onClick = function() {
  if (this.enabled && this.callback) {
    this.callback();
  }
};

// Main UI manager
window.UI = function(game) {
  this.game = game;
  this.goldElement = document.getElementById('gold');
  this.livesElement = document.getElementById('lives');
  this.waveElement = document.getElementById('wave');
  this.towerInfoElement = document.getElementById('towerInfo');
  this.towerControlsElement = document.getElementById('towerControls');
  this.towerNameElement = document.getElementById('towerName');
  this.towerLevelElement = document.getElementById('towerLevel');
  this.towerDamageElement = document.getElementById('towerDamage');
  this.towerRangeElement = document.getElementById('towerRange');
  this.towerFireRateElement = document.getElementById('towerFireRate');
  this.towerKillsElement = document.getElementById('towerKills');
  this.upgradeBtnElement = document.getElementById('upgradeBtn');
  this.sellBtnElement = document.getElementById('sellBtn');
  this.upgradeCostElement = document.getElementById('upgradeCost');
  this.sellPriceElement = document.getElementById('sellPrice');
  this.upgradeInfoElement = document.getElementById('upgradeInfo');
  
  this.selectedTowerType = null;
  this.buttons = {};
  this.initButtons();
  this.initTowerControls();
};

window.UI.prototype.initButtons = function() {
  // Tower placement buttons
  this.buttons.tower1 = new window.Button('tower1Btn', 'Miner Tower', 50, () => {
    this.selectTowerType('miner');
  });

  this.buttons.tower2 = new window.Button('tower2Btn', 'Lightning Tower', 100, () => {
    this.selectTowerType('lightning');
  });

  this.buttons.tower3 = new window.Button('tower3Btn', 'Fire Tower', 150, () => {
    this.selectTowerType('fire');
  });
  
  // Initialize pixel art for tower buttons
  this.initPixelArtButtons();

  this.buttons.startWave = new window.Button('startWaveBtn', '▶️ Start Wave', 0, () => {
    this.game.startWave();
  });

  this.buttons.speed = new window.Button('speedBtn', '⚡ Speed: 1x', 0, () => {
    this.game.toggleSpeed();
  });

  // Add event listeners
  var self = this;
  Object.values(this.buttons).forEach(function(button) {
    if (button.element) {
      button.element.addEventListener('click', function() {
        // Play button click sound
        if (window.game && window.game.audioEngine) {
          window.game.audioEngine.play('buttonClick');
        }
        button.onClick();
      });
      
      // Add hover sound
      button.element.addEventListener('mouseenter', function() {
        if (window.game && window.game.audioEngine) {
          window.game.audioEngine.play('buttonHover');
        }
      });
    }
  });
};

// Initialize pixel art for tower buttons
window.UI.prototype.initPixelArtButtons = function() {
  if (!window.PixelSpriteRenderer) return;
  
  // Create canvas elements for button icons
  const pixelRenderer = new window.PixelSpriteRenderer(null);
  
  // Create icons for each tower button
  this.createTowerIcon('tower1Btn', 'miner');
  this.createTowerIcon('tower2Btn', 'lightning');
  this.createTowerIcon('tower3Btn', 'fire');
};

// Create pixel art icon for a tower button
window.UI.prototype.createTowerIcon = function(buttonId, towerType) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  // Find and remove existing icon if any
  const existingIcon = button.querySelector('.tower-icon');
  if (existingIcon) {
    existingIcon.remove();
  }
  
  // Create canvas for pixel art
  const iconCanvas = document.createElement('canvas');
  iconCanvas.width = 40;
  iconCanvas.height = 40;
  iconCanvas.className = 'tower-icon';
  
  const ctx = iconCanvas.getContext('2d');
  const pixelRenderer = new window.PixelSpriteRenderer(ctx);
  
  // Draw the tower icon
  pixelRenderer.drawTowerButtonIcon(ctx, 0, 0, 40, towerType);
  
  // Insert the canvas at the beginning of the button
  button.insertBefore(iconCanvas, button.firstChild);
};

window.UI.prototype.selectTowerType = function(type) {
  if (this.selectedTowerType === type) {
    this.selectedTowerType = null;
  } else {
    this.selectedTowerType = type;
  }
  
  // Update button states
  var self = this;
  Object.keys(this.buttons).forEach(function(key) {
    if (key.startsWith('tower')) {
      var button = self.buttons[key];
      // Remove selected class from all tower buttons
      button.element.classList.remove('selected');
      
      // Add selected class to the matching button
      if (self.selectedTowerType && button.text.toLowerCase().includes(type)) {
        button.element.classList.add('selected');
      }
    }
  });
};

window.UI.prototype.getSelectedTowerType = function() {
  return this.selectedTowerType;
};

window.UI.prototype.updateGold = function(gold) {
  if (this.goldElement) {
    this.goldElement.textContent = gold;
  }
  
  // Update button states based on gold
  this.buttons.tower1.setEnabled(gold >= 50);
  this.buttons.tower2.setEnabled(gold >= 100);
  this.buttons.tower3.setEnabled(gold >= 150);
};

window.UI.prototype.updateLives = function(lives) {
  if (this.livesElement) {
    this.livesElement.textContent = lives;
  }
};

window.UI.prototype.updateWave = function(wave) {
  if (this.waveElement) {
    this.waveElement.textContent = wave;
  }
};

window.UI.prototype.updateStartWaveButton = function(canStart) {
  this.buttons.startWave.setEnabled(canStart);
};

window.UI.prototype.updateSpeedButton = function(speedMultiplier, autoEnabled) {
  const speedText = speedMultiplier === 1 ? '1x' : speedMultiplier === 2 ? '2x' : '3x';
  const autoText = autoEnabled && speedMultiplier === 1 ? ' (AUTO)' : '';
  this.buttons.speed.element.textContent = `⚡ Speed: ${speedText}${autoText}`;
};

window.UI.prototype.initTowerControls = function() {
  var self = this;
  
  if (this.upgradeBtnElement) {
    this.upgradeBtnElement.addEventListener('click', function() {
      self.game.upgradeSelectedTower();
    });
  }
  
  if (this.sellBtnElement) {
    this.sellBtnElement.addEventListener('click', function() {
      self.game.sellSelectedTower();
    });
  }
};

window.UI.prototype.showGameOver = function(wavesCompleted) {
  var hint = document.querySelector('.hint');
  if (hint) {
    hint.textContent = `💀 Game Over! You survived ${wavesCompleted} waves. Refresh to play again.`;
    hint.style.color = '#e74c3c';
  }
  
  // Disable all buttons
  var self = this;
  Object.values(this.buttons).forEach(function(button) {
    button.setEnabled(false);
  });
  
  // Hide tower controls
  this.hideTowerControls();
};

window.UI.prototype.showVictory = function() {
  var hint = document.querySelector('.hint');
  if (hint) {
    hint.textContent = '🎉 Victory! All waves defeated! Refresh to play again.';
    hint.style.color = '#27ae60';
  }
  
  // Hide tower controls
  this.hideTowerControls();
};

window.UI.prototype.clearSelection = function() {
  this.selectedTowerType = null;
  
  // Reset button styles
  var self = this;
  Object.keys(this.buttons).forEach(function(key) {
    if (key.startsWith('tower')) {
      var button = self.buttons[key];
      button.element.classList.remove('selected');
    }
  });
};

window.UI.prototype.showTowerControls = function(tower) {
  if (!tower) {
    this.hideTowerControls();
    return;
  }
  
  if (this.towerControlsElement) {
    this.towerControlsElement.classList.add('active');
    
    // Position the controls near the tower
    const towerX = tower.col * 50 + 25;
    const towerY = tower.row * 50 + 25;
    const controlsRect = this.towerControlsElement.getBoundingClientRect();
    const canvasRect = this.game.canvas.getBoundingClientRect();
    
    let left = canvasRect.left + towerX + 30;
    let top = canvasRect.top + towerY - controlsRect.height / 2;
    
    // Keep controls within viewport
    if (left + controlsRect.width > window.innerWidth) {
      left = canvasRect.left + towerX - controlsRect.width - 30;
    }
    if (top < 0) {
      top = 0;
    }
    if (top + controlsRect.height > window.innerHeight) {
      top = window.innerHeight - controlsRect.height;
    }
    
    this.towerControlsElement.style.left = left + 'px';
    this.towerControlsElement.style.top = top + 'px';
  }
  
  // Update tower name
  if (this.towerNameElement) {
    this.towerNameElement.textContent = tower.type.charAt(0).toUpperCase() + tower.type.slice(1) + ' Tower';
  }
  
  // Update tower level
  if (this.towerLevelElement) {
    this.towerLevelElement.textContent = 'Lvl ' + tower.level;
  }
  
  // Update tower stats
  if (this.towerDamageElement) {
    this.towerDamageElement.textContent = tower.damage;
  }
  if (this.towerRangeElement) {
    this.towerRangeElement.textContent = tower.range;
  }
  if (this.towerFireRateElement) {
    this.towerFireRateElement.textContent = (1000/tower.fireRate).toFixed(1) + '/sec';
  }
  if (this.towerKillsElement) {
    this.towerKillsElement.textContent = tower.kills || 0;
  }
  
  // Update upgrade button
  if (this.upgradeBtnElement && this.upgradeCostElement) {
    const upgradeCost = tower.getUpgradeCost();
    const canUpgrade = tower.upgradesMade < tower.maxUpgrades;
    
    this.upgradeCostElement.textContent = '💰 ' + upgradeCost;
    this.upgradeBtnElement.disabled = !canUpgrade || this.game.gold < upgradeCost;
  }
  
  // Update sell button
  if (this.sellBtnElement && this.sellPriceElement) {
    const sellPrice = Math.floor(tower.getTotalValue() * 0.7); // 70% of total value
    this.sellPriceElement.textContent = '💰 ' + sellPrice;
  }
  
  // Update upgrade info
  if (this.upgradeInfoElement) {
    this.upgradeInfoElement.textContent = `Upgrades: ${tower.upgradesMade}/${tower.maxUpgrades}`;
  }
};

window.UI.prototype.hideTowerControls = function() {
  if (this.towerControlsElement) {
    this.towerControlsElement.classList.remove('active');
  }
};

window.UI.prototype.displayTowerInfo = function(tower) {
  // This will be handled by the renderer
};

window.UI.prototype.hideTowerInfo = function() {
  // This will be handled by the renderer
};