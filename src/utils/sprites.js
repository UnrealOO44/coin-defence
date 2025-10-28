// Pixel sprite rendering system
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/utils/sprites.js',
  exports: ['PixelSpriteRenderer']
});

window.PixelSpriteRenderer = function(ctx) {
  this.ctx = ctx;
  this.pixelSize = 2; // Scale factor for HD sprites
};

// Draw pixelated tower sprites
window.PixelSpriteRenderer.prototype.drawTower = function(tower) {
  const x = tower.col * 50 + 25;
  const y = tower.row * 50 + 25;
  const size = 20 + (tower.level - 1) * 4; // Grow with level
  
  this.ctx.save();
  
  // Enable crisp pixel rendering
  this.ctx.imageSmoothingEnabled = false;
  
  // Draw based on tower type
  switch(tower.type) {
    case 'miner':
      this.drawMinerTower(x, y, size, tower.level);
      break;
    case 'lightning':
      this.drawLightningTower(x, y, size, tower.level);
      break;
    case 'fire':
      this.drawFireTower(x, y, size, tower.level);
      break;
  }
  
  // Draw level indicator
  this.ctx.fillStyle = '#fff';
  this.ctx.font = 'bold 10px monospace';
  this.ctx.textAlign = 'center';
  this.ctx.textBaseline = 'middle';
  this.ctx.fillText(tower.level, x, y);
  
  // Draw upgrade status
  if (tower.upgradesMade > 0) {
    this.ctx.fillStyle = '#2ecc71';
    this.ctx.font = 'bold 8px monospace';
    this.ctx.fillText(`+${tower.upgradesMade}`, x + 15, y - 15);
  }
  
  this.ctx.restore();
};

// Miner tower pixel art (pickaxe/mine)
window.PixelSpriteRenderer.prototype.drawMinerTower = function(x, y, size, level) {
  const pixels = [
    // Base platform
    [-8, 8, '#95a5a6'], [-7, 8, '#95a5a6'], [-6, 8, '#95a5a6'], [-5, 8, '#95a5a6'],
    [-4, 8, '#95a5a6'], [-3, 8, '#95a5a6'], [-2, 8, '#95a5a6'], [-1, 8, '#95a5a6'],
    [0, 8, '#95a5a6'], [1, 8, '#95a5a6'], [2, 8, '#95a5a6'], [3, 8, '#95a5a6'],
    [4, 8, '#95a5a6'], [5, 8, '#95a5a6'], [6, 8, '#95a5a6'], [7, 8, '#95a5a6'],
    [8, 8, '#95a5a6'],
    
    // Tower structure
    [-6, -4, '#7f8c8d'], [-5, -4, '#95a5a6'], [-4, -4, '#95a5a6'], [-3, -4, '#95a5a6'],
    [-2, -4, '#95a5a6'], [-1, -4, '#95a5a6'], [0, -4, '#95a5a6'], [1, -4, '#95a5a6'],
    [2, -4, '#95a5a6'], [3, -4, '#95a5a6'], [4, -4, '#95a5a6'], [5, -4, '#95a5a6'], [6, -4, '#7f8c8d'],
    [-6, -3, '#7f8c8d'], [6, -3, '#7f8c8d'],
    [-6, -2, '#7f8c8d'], [6, -2, '#7f8c8d'],
    [-6, -1, '#7f8c8d'], [6, -1, '#7f8c8d'],
    [-6, 0, '#7f8c8d'], [6, 0, '#7f8c8d'],
    [-6, 1, '#7f8c8d'], [6, 1, '#7f8c8d'],
    [-6, 2, '#7f8c8d'], [6, 2, '#7f8c8d'],
    [-6, 3, '#7f8c8d'], [6, 3, '#7f8c8d'],
    [-6, 4, '#7f8c8d'], [6, 4, '#7f8c8d'],
    [-6, 5, '#7f8c8d'], [6, 5, '#7f8c8d'],
    [-6, 6, '#7f8c8d'], [6, 6, '#7f8c8d'],
    [-6, 7, '#7f8c8d'], [-5, 7, '#7f8c8d'], [-4, 7, '#7f8c8d'], [-3, 7, '#7f8c8d'],
    [-2, 7, '#7f8c8d'], [-1, 7, '#7f8c8d'], [0, 7, '#7f8c8d'], [1, 7, '#7f8c8d'],
    [2, 7, '#7f8c8d'], [3, 7, '#7f8c8d'], [4, 7, '#7f8c8d'], [5, 7, '#7f8c8d'], [6, 7, '#7f8c8d'],
    
    // Pickaxe
    [0, -8, '#8b4513'], [0, -7, '#8b4513'], [0, -6, '#8b4513'], [0, -5, '#8b4513'],
    [-3, -4, '#696969'], [-2, -4, '#c0c0c0'], [-1, -4, '#c0c0c0'], [0, -4, '#8b4513'],
    [1, -4, '#c0c0c0'], [2, -4, '#c0c0c0'], [3, -4, '#696969'],
    [-3, -3, '#696969'], [-2, -3, '#c0c0c0'], [-1, -3, '#c0c0c0'], [1, -3, '#c0c0c0'],
    [2, -3, '#c0c0c0'], [3, -3, '#696969'],
  ];
  
  // Draw pixels with scaling
  pixels.forEach(([px, py, color]) => {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x + px * this.pixelSize, 
      y + py * this.pixelSize, 
      this.pixelSize * 2, 
      this.pixelSize * 2
    );
  });
};

// Lightning tower pixel art (tesla coil)
window.PixelSpriteRenderer.prototype.drawLightningTower = function(x, y, size, level) {
  const pixels = [
    // Base platform
    [-8, 8, '#3498db'], [-7, 8, '#3498db'], [-6, 8, '#3498db'], [-5, 8, '#3498db'],
    [-4, 8, '#3498db'], [-3, 8, '#3498db'], [-2, 8, '#3498db'], [-1, 8, '#3498db'],
    [0, 8, '#3498db'], [1, 8, '#3498db'], [2, 8, '#3498db'], [3, 8, '#3498db'],
    [4, 8, '#3498db'], [5, 8, '#3498db'], [6, 8, '#3498db'], [7, 8, '#3498db'],
    [8, 8, '#3498db'],
    
    // Tesla coil structure
    [-4, -6, '#2980b9'], [-3, -6, '#3498db'], [-2, -6, '#3498db'], [-1, -6, '#3498db'],
    [0, -6, '#3498db'], [1, -6, '#3498db'], [2, -6, '#3498db'], [3, -6, '#3498db'], [4, -6, '#2980b9'],
    [-4, -5, '#2980b9'], [4, -5, '#2980b9'],
    [-4, -4, '#2980b9'], [4, -4, '#2980b9'],
    [-4, -3, '#2980b9'], [4, -3, '#2980b9'],
    [-5, -2, '#2980b9'], [-4, -2, '#2980b9'], [4, -2, '#2980b9'], [5, -2, '#2980b9'],
    [-5, -1, '#2980b9'], [5, -1, '#2980b9'],
    [-5, 0, '#2980b9'], [5, 0, '#2980b9'],
    [-5, 1, '#2980b9'], [5, 1, '#2980b9'],
    [-5, 2, '#2980b9'], [5, 2, '#2980b9'],
    [-5, 3, '#2980b9'], [5, 3, '#2980b9'],
    [-5, 4, '#2980b9'], [5, 4, '#2980b9'],
    [-5, 5, '#2980b9'], [5, 5, '#2980b9'],
    [-5, 6, '#2980b9'], [-4, 6, '#2980b9'], [-3, 6, '#2980b9'], [-2, 6, '#2980b9'],
    [-1, 6, '#2980b9'], [0, 6, '#2980b9'], [1, 6, '#2980b9'], [2, 6, '#2980b9'],
    [3, 6, '#2980b9'], [4, 6, '#2980b9'], [5, 6, '#2980b9'],
    
    // Electric arc (animated effect would go here)
    [0, -4, '#f1c40f'], [0, -3, '#f1c40f'], [0, -2, '#f1c40f'], [0, -1, '#f1c40f'],
    [-1, 0, '#f1c40f'], [0, 0, '#f39c12'], [1, 0, '#f1c40f'],
    [-1, 1, '#f1c40f'], [0, 1, '#f39c12'], [1, 1, '#f1c40f'],
  ];
  
  // Draw pixels with scaling
  pixels.forEach(([px, py, color]) => {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x + px * this.pixelSize, 
      y + py * this.pixelSize, 
      this.pixelSize * 2, 
      this.pixelSize * 2
    );
  });
};

// Fire tower pixel art (flamethrower)
window.PixelSpriteRenderer.prototype.drawFireTower = function(x, y, size, level) {
  const pixels = [
    // Base platform
    [-8, 8, '#e74c3c'], [-7, 8, '#e74c3c'], [-6, 8, '#e74c3c'], [-5, 8, '#e74c3c'],
    [-4, 8, '#e74c3c'], [-3, 8, '#e74c3c'], [-2, 8, '#e74c3c'], [-1, 8, '#e74c3c'],
    [0, 8, '#e74c3c'], [1, 8, '#e74c3c'], [2, 8, '#e74c3c'], [3, 8, '#e74c3c'],
    [4, 8, '#e74c3c'], [5, 8, '#e74c3c'], [6, 8, '#e74c3c'], [7, 8, '#e74c3c'],
    [8, 8, '#e74c3c'],
    
    // Flamethrower structure
    [-5, -2, '#c0392b'], [-4, -2, '#e74c3c'], [-3, -2, '#e74c3c'], [-2, -2, '#e74c3c'],
    [-1, -2, '#e74c3c'], [0, -2, '#e74c3c'], [1, -2, '#e74c3c'], [2, -2, '#e74c3c'],
    [3, -2, '#e74c3c'], [4, -2, '#e74c3c'], [5, -2, '#c0392b'],
    [-5, -1, '#c0392b'], [5, -1, '#c0392b'],
    [-5, 0, '#c0392b'], [5, 0, '#c0392b'],
    [-5, 1, '#c0392b'], [5, 1, '#c0392b'],
    [-6, 2, '#c0392b'], [-5, 2, '#c0392b'], [5, 2, '#c0392b'], [6, 2, '#c0392b'],
    [-6, 3, '#c0392b'], [6, 3, '#c0392b'],
    [-6, 4, '#c0392b'], [6, 4, '#c0392b'],
    [-6, 5, '#c0392b'], [6, 5, '#c0392b'],
    [-6, 6, '#c0392b'], [-5, 6, '#c0392b'], [-4, 6, '#c0392b'], [-3, 6, '#c0392b'],
    [-2, 6, '#c0392b'], [-1, 6, '#c0392b'], [0, 6, '#c0392b'], [1, 6, '#c0392b'],
    [2, 6, '#c0392b'], [3, 6, '#c0392b'], [4, 6, '#c0392b'], [5, 6, '#c0392b'], [6, 6, '#c0392b'],
    
    // Flame nozzle
    [-2, -4, '#34495e'], [-1, -4, '#34495e'], [0, -4, '#34495e'], [1, -4, '#34495e'], [2, -4, '#34495e'],
    [-2, -3, '#34495e'], [2, -3, '#34495e'],
    
    // Fire effect
    [0, -2, '#ff6b35'], [-1, -1, '#ff6b35'], [0, -1, '#f39c12'], [1, -1, '#ff6b35'],
    [-1, 0, '#ff6b35'], [0, 0, '#f39c12'], [1, 0, '#ff6b35'],
  ];
  
  // Draw pixels with scaling
  pixels.forEach(([px, py, color]) => {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x + px * this.pixelSize, 
      y + py * this.pixelSize, 
      this.pixelSize * 2, 
      this.pixelSize * 2
    );
  });
};

// Draw pixelated UI elements
window.PixelSpriteRenderer.prototype.drawUIButton = function(x, y, width, height, type) {
  this.ctx.save();
  this.ctx.imageSmoothingEnabled = false;
  
  // Button background
  let bgColor = '#34495e';
  let borderColor = '#2c3e50';
  
  switch(type) {
    case 'miner':
      bgColor = '#95a5a6';
      borderColor = '#7f8c8d';
      break;
    case 'lightning':
      bgColor = '#3498db';
      borderColor = '#2980b9';
      break;
    case 'fire':
      bgColor = '#e74c3c';
      borderColor = '#c0392b';
      break;
    case 'upgrade':
      bgColor = '#27ae60';
      borderColor = '#229954';
      break;
    case 'sell':
      bgColor = '#e67e22';
      borderColor = '#d35400';
      break;
  }
  
  // Draw button background with pixel border
  this.ctx.fillStyle = borderColor;
  this.ctx.fillRect(x, y, width, height);
  this.ctx.fillStyle = bgColor;
  this.ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
  
  this.ctx.restore();
};

// Draw tower button icon for UI
window.PixelSpriteRenderer.prototype.drawTowerButtonIcon = function(ctx, x, y, size, type) {
  this.ctx = ctx;
  this.ctx.save();
  this.ctx.imageSmoothingEnabled = false;
  
  // Create a temporary tower object for icon rendering
  const tempTower = {
    col: 0,
    row: 0,
    type: type,
    level: 1,
    upgradesMade: 0,
    maxUpgrades: 3
  };
  
  // Center the icon at the specified position
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  
  // Draw scaled down version of tower
  const iconSize = size * 0.4; // Scale down for button
  
  // Save current position temporarily
  const originalCol = tempTower.col;
  const originalRow = tempTower.row;
  
  // Manually position the tower for icon drawing
  switch(type) {
    case 'miner':
      this.drawMinerTowerIcon(centerX, centerY, iconSize);
      break;
    case 'lightning':
      this.drawLightningTowerIcon(centerX, centerY, iconSize);
      break;
    case 'fire':
      this.drawFireTowerIcon(centerX, centerY, iconSize);
      break;
  }
  
  this.ctx.restore();
};

// Mini miner tower icon
window.PixelSpriteRenderer.prototype.drawMinerTowerIcon = function(x, y, size) {
  const pixels = [
    // Base platform
    [-6, 6, '#95a5a6'], [-5, 6, '#95a5a6'], [-4, 6, '#95a5a6'], [-3, 6, '#95a5a6'],
    [-2, 6, '#95a5a6'], [-1, 6, '#95a5a6'], [0, 6, '#95a5a6'], [1, 6, '#95a5a6'],
    [2, 6, '#95a5a6'], [3, 6, '#95a5a6'], [4, 6, '#95a5a6'], [5, 6, '#95a5a6'], [6, 6, '#95a5a6'],
    
    // Tower structure
    [-4, -2, '#7f8c8d'], [-3, -2, '#95a5a6'], [-2, -2, '#95a5a6'], [-1, -2, '#95a5a6'],
    [0, -2, '#95a5a6'], [1, -2, '#95a5a6'], [2, -2, '#95a5a6'], [3, -2, '#95a5a6'], [4, -2, '#7f8c8d'],
    [-4, -1, '#7f8c8d'], [4, -1, '#7f8c8d'],
    [-4, 0, '#7f8c8d'], [4, 0, '#7f8c8d'],
    [-4, 1, '#7f8c8d'], [4, 1, '#7f8c8d'],
    [-4, 2, '#7f8c8d'], [4, 2, '#7f8c8d'],
    [-4, 3, '#7f8c8d'], [4, 3, '#7f8c8d'],
    [-4, 4, '#7f8c8d'], [-3, 4, '#7f8c8d'], [-2, 4, '#7f8c8d'], [-1, 4, '#7f8c8d'],
    [0, 4, '#7f8c8d'], [1, 4, '#7f8c8d'], [2, 4, '#7f8c8d'], [3, 4, '#7f8c8d'], [4, 4, '#7f8c8d'],
    
    // Pickaxe
    [0, -6, '#8b4513'], [0, -5, '#8b4513'],
    [-2, -4, '#696969'], [-1, -4, '#c0c0c0'], [0, -4, '#8b4513'],
    [1, -4, '#c0c0c0'], [2, -4, '#696969'],
    [-2, -3, '#696969'], [-1, -3, '#c0c0c0'], [1, -3, '#c0c0c0'], [2, -3, '#696969'],
  ];
  
  pixels.forEach(([px, py, color]) => {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x + px * this.pixelSize, 
      y + py * this.pixelSize, 
      this.pixelSize * 2, 
      this.pixelSize * 2
    );
  });
};

// Mini lightning tower icon
window.PixelSpriteRenderer.prototype.drawLightningTowerIcon = function(x, y, size) {
  const pixels = [
    // Base platform
    [-6, 6, '#3498db'], [-5, 6, '#3498db'], [-4, 6, '#3498db'], [-3, 6, '#3498db'],
    [-2, 6, '#3498db'], [-1, 6, '#3498db'], [0, 6, '#3498db'], [1, 6, '#3498db'],
    [2, 6, '#3498db'], [3, 6, '#3498db'], [4, 6, '#3498db'], [5, 6, '#3498db'], [6, 6, '#3498db'],
    
    // Tesla coil structure
    [-3, -4, '#2980b9'], [-2, -4, '#3498db'], [-1, -4, '#3498db'], [0, -4, '#3498db'],
    [1, -4, '#3498db'], [2, -4, '#3498db'], [3, -4, '#2980b9'],
    [-3, -3, '#2980b9'], [3, -3, '#2980b9'],
    [-3, -2, '#2980b9'], [3, -2, '#2980b9'],
    [-3, -1, '#2980b9'], [3, -1, '#2980b9'],
    [-4, 0, '#2980b9'], [-3, 0, '#2980b9'], [3, 0, '#2980b9'], [4, 0, '#2980b9'],
    [-4, 1, '#2980b9'], [4, 1, '#2980b9'],
    [-4, 2, '#2980b9'], [4, 2, '#2980b9'],
    [-4, 3, '#2980b9'], [4, 3, '#2980b9'],
    [-4, 4, '#2980b9'], [-3, 4, '#2980b9'], [-2, 4, '#2980b9'], [-1, 4, '#2980b9'],
    [0, 4, '#2980b9'], [1, 4, '#2980b9'], [2, 4, '#2980b9'], [3, 4, '#2980b9'], [4, 4, '#2980b9'],
    
    // Electric arc
    [0, -2, '#f1c40f'], [0, -1, '#f1c40f'],
    [-1, 0, '#f1c40f'], [0, 0, '#f39c12'], [1, 0, '#f1c40f'],
  ];
  
  pixels.forEach(([px, py, color]) => {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x + px * this.pixelSize, 
      y + py * this.pixelSize, 
      this.pixelSize * 2, 
      this.pixelSize * 2
    );
  });
};

// Mini fire tower icon
window.PixelSpriteRenderer.prototype.drawFireTowerIcon = function(x, y, size) {
  const pixels = [
    // Base platform
    [-6, 6, '#e74c3c'], [-5, 6, '#e74c3c'], [-4, 6, '#e74c3c'], [-3, 6, '#e74c3c'],
    [-2, 6, '#e74c3c'], [-1, 6, '#e74c3c'], [0, 6, '#e74c3c'], [1, 6, '#e74c3c'],
    [2, 6, '#e74c3c'], [3, 6, '#e74c3c'], [4, 6, '#e74c3c'], [5, 6, '#e74c3c'], [6, 6, '#e74c3c'],
    
    // Flamethrower structure
    [-4, -1, '#c0392b'], [-3, -1, '#e74c3c'], [-2, -1, '#e74c3c'], [-1, -1, '#e74c3c'],
    [0, -1, '#e74c3c'], [1, -1, '#e74c3c'], [2, -1, '#e74c3c'], [3, -1, '#e74c3c'], [4, -1, '#c0392b'],
    [-4, 0, '#c0392b'], [4, 0, '#c0392b'],
    [-4, 1, '#c0392b'], [4, 1, '#c0392b'],
    [-5, 2, '#c0392b'], [-4, 2, '#c0392b'], [4, 2, '#c0392b'], [5, 2, '#c0392b'],
    [-5, 3, '#c0392b'], [5, 3, '#c0392b'],
    [-5, 4, '#c0392b'], [-4, 4, '#c0392b'], [-3, 4, '#c0392b'], [-2, 4, '#c0392b'],
    [0, 4, '#c0392b'], [1, 4, '#c0392b'], [2, 4, '#c0392b'], [3, 4, '#c0392b'], [4, 4, '#c0392b'], [5, 4, '#c0392b'],
    
    // Flame nozzle
    [-2, -3, '#34495e'], [-1, -3, '#34495e'], [0, -3, '#34495e'], [1, -3, '#34495e'], [2, -3, '#34495e'],
    
    // Fire effect
    [0, -1, '#ff6b35'], [-1, 0, '#ff6b35'], [0, 0, '#f39c12'], [1, 0, '#ff6b35'],
  ];
  
  pixels.forEach(([px, py, color]) => {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      x + px * this.pixelSize, 
      y + py * this.pixelSize, 
      this.pixelSize * 2, 
      this.pixelSize * 2
    );
  });
};