// Rendering system for the game
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/engine/renderer.js',
  exports: ['Renderer']
});

window.Renderer = function(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.cellSize = 20; // Fixed cell size for 20x20 pixel grid
};

window.Renderer.prototype.updateCellSize = function(cellSize) {
  this.cellSize = cellSize;
};

window.Renderer.prototype.clear = function() {
  this.ctx.fillStyle = '#1a1a1a';
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

window.Renderer.prototype.drawGrid = function(grid) {
  this.ctx.strokeStyle = '#2c3e50';
  this.ctx.lineWidth = 1;

  for (let row = 0; row <= grid.rows; row++) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, row * this.cellSize);
    this.ctx.lineTo(grid.cols * this.cellSize, row * this.cellSize);
    this.ctx.stroke();
  }

  for (let col = 0; col <= grid.cols; col++) {
    this.ctx.beginPath();
    this.ctx.moveTo(col * this.cellSize, 0);
    this.ctx.lineTo(col * this.cellSize, grid.rows * this.cellSize);
    this.ctx.stroke();
  }
};

window.Renderer.prototype.drawPath = function(path) {
  this.ctx.strokeStyle = '#34495e';
  this.ctx.lineWidth = this.cellSize * 0.8; // Wider path that fills most of the cell
  this.ctx.lineCap = 'square';
  this.ctx.lineJoin = 'miter';

  // Draw filled path cells first for solid appearance
  for (let row = 0; row < path.grid.rows; row++) {
    for (let col = 0; col < path.grid.cols; col++) {
      if (path.grid.cells[row][col].path) {
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(
          col * this.cellSize + this.cellSize * 0.1,
          row * this.cellSize + this.cellSize * 0.1,
          this.cellSize * 0.8,
          this.cellSize * 0.8
        );
      }
    }
  }
};

window.Renderer.prototype.drawTower = function(tower) {
  // Draw simple tower shapes
  const x = tower.col * this.cellSize + this.cellSize / 2;
  const y = tower.row * this.cellSize + this.cellSize / 2;
  
  // Blinking effect when damaged
  if (tower.blinking && Math.floor(tower.blinkDuration / 100) % 2 === 0) {
    this.ctx.globalAlpha = 0.5;
  }
  
  // Draw tower based on type
  const towerSize = this.cellSize * 0.4; // Larger relative to 20px cells
  switch(tower.type) {
    case 'miner':
      this.drawMinerTowerShape(x, y, towerSize, tower.level);
      break;
    case 'lightning':
      this.drawLightningTowerShape(x, y, towerSize, tower.level);
      break;
    case 'fire':
      this.drawFireTowerShape(x, y, towerSize, tower.level);
      break;
  }
  
  this.ctx.globalAlpha = 1.0;
  
  // Draw level indicator
  if (tower.level > 1) {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(tower.level, x, y);
  }
  
  // Draw health bar if damaged
  if (tower.showHealthBar || tower.health < tower.maxHealth) {
    this.drawTowerHealthBar(tower, x, y);
  }

  // Draw range when selected
  if (tower.selected) {
    this.ctx.fillStyle = this.getRangeColor(tower.type, 0.15);
    this.ctx.beginPath();
    this.ctx.arc(x, y, tower.range, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = this.getRangeColor(tower.type, 0.6);
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.arc(x, y, tower.range, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }
};

window.Renderer.prototype.getRangeColor = function(towerType, alpha) {
  switch(towerType) {
    case 'miner':
      return `rgba(149, 165, 166, ${alpha})`;
    case 'lightning':
      return `rgba(52, 152, 219, ${alpha})`;
    case 'fire':
      return `rgba(231, 76, 60, ${alpha})`;
    default:
      return `rgba(52, 152, 219, ${alpha})`;
  }
};

window.Renderer.prototype.drawEnemy = function(enemy) {
  // Draw enemy based on type with unique visual designs
  this.drawEnemySprite(enemy);

  // Draw health bar
  const healthPercent = enemy.health / enemy.maxHealth;
  const barWidth = enemy.size * 2;
  const barHeight = 4;
  const barY = enemy.y - enemy.size - 8;

  this.ctx.fillStyle = '#e74c3c';
  this.ctx.fillRect(enemy.x - barWidth/2, barY, barWidth, barHeight);

  this.ctx.fillStyle = '#27ae60';
  this.ctx.fillRect(enemy.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
};

window.Renderer.prototype.drawEnemySprite = function(enemy) {
  const ctx = this.ctx;
  const x = enemy.x;
  const y = enemy.y;
  const size = enemy.size;
  
  switch(enemy.type) {
    case 'bitcoin':
      this.drawBitcoinEnemy(x, y, size);
      break;
    case 'ethereum':
      this.drawEthereumEnemy(x, y, size);
      break;
    case 'dogecoin':
      this.drawDogecoinEnemy(x, y, size);
      break;
    case 'monero':
      this.drawMoneroEnemy(x, y, size);
      break;
    case 'shooter':
      this.drawShooterEnemy(x, y, size);
      break;
    default:
      // Fallback to circle with symbol
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', x, y);
  }
};

window.Renderer.prototype.drawBitcoinEnemy = function(x, y, size) {
  const ctx = this.ctx;
  
  // Draw hexagon shape for Bitcoin
  ctx.fillStyle = '#f7931a';
  ctx.strokeStyle = '#c97a16';
  ctx.lineWidth = 2;
  
  // Draw hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Draw Bitcoin symbol
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size * 0.8}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₿', x, y);
};

window.Renderer.prototype.drawEthereumEnemy = function(x, y, size) {
  const ctx = this.ctx;
  
  // Draw diamond shape for Ethereum
  ctx.fillStyle = '#627eea';
  ctx.strokeStyle = '#4e5eb0';
  ctx.lineWidth = 2;
  
  // Draw diamond
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.8, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.8, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Draw Ethereum symbol (simplified Greek letter xi)
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size * 0.7}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Ξ', x, y);
};

window.Renderer.prototype.drawDogecoinEnemy = function(x, y, size) {
  const ctx = this.ctx;
  
  // Draw circle with dog face design for Dogecoin
  ctx.fillStyle = '#c2a633';
  ctx.strokeStyle = '#9b8529';
  ctx.lineWidth = 2;
  
  // Draw main circle
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  // Draw dog face details
  ctx.fillStyle = '#9b8529';
  
  // Left ear
  ctx.beginPath();
  ctx.arc(x - size * 0.7, y - size * 0.7, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Right ear
  ctx.beginPath();
  ctx.arc(x + size * 0.7, y - size * 0.7, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.3, y - size * 0.1, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x, y + size * 0.1, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  // Dogecoin symbol
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size * 0.5}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Ð', x, y + size * 0.6);
};

window.Renderer.prototype.drawMoneroEnemy = function(x, y, size) {
  const ctx = this.ctx;
  
  // Draw triangle shape for Monero
  ctx.fillStyle = '#ff6600';
  ctx.strokeStyle = '#cc5200';
  ctx.lineWidth = 2;
  
  // Draw triangle
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.866, y + size * 0.5);
  ctx.lineTo(x - size * 0.866, y + size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Draw Monero M symbol
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size * 0.8}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', x, y);
  
  // Add privacy mask effect (semi-transparent overlay)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
  ctx.fill();
};

window.Renderer.prototype.drawProjectile = function(projectile) {
  // Draw projectile with trail effect
  if (projectile.trailPositions && projectile.trailPositions.length > 0) {
    // Draw trail
    projectile.trailPositions.forEach((pos, index) => {
      const alpha = (index + 1) / projectile.trailPositions.length * 0.5;
      this.ctx.fillStyle = projectile.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, projectile.size * 0.7, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
  
  // Draw main projectile
  this.ctx.fillStyle = projectile.color;
  this.ctx.beginPath();
  this.ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
  this.ctx.fill();
};

window.Renderer.prototype.drawMinerTowerShape = function(x, y, size, level) {
  // Draw pickaxe/mine shape
  this.ctx.fillStyle = '#95a5a6';
  this.ctx.strokeStyle = '#7f8c8d';
  this.ctx.lineWidth = 2;
  
  // Base platform
  this.ctx.fillRect(x - size, y - size/2, size * 2, size);
  this.ctx.strokeRect(x - size, y - size/2, size * 2, size);
  
  // Pickaxe handle
  this.ctx.fillStyle = '#8b4513';
  this.ctx.fillRect(x - size/6, y - size * 1.5, size/3, size);
  
  // Pickaxe head
  this.ctx.fillStyle = '#c0c0c0';
  this.ctx.fillRect(x - size/2, y - size * 1.7, size, size/3);
  
  // Level indicator with size
  if (level > 1) {
    this.ctx.strokeStyle = '#f39c12';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size + level * 2, 0, Math.PI * 2);
    this.ctx.stroke();
  }
};

window.Renderer.prototype.drawLightningTowerShape = function(x, y, size, level) {
  // Draw tesla coil shape
  this.ctx.fillStyle = '#3498db';
  this.ctx.strokeStyle = '#2980b9';
  this.ctx.lineWidth = 2;
  
  // Base
  this.ctx.fillRect(x - size/2, y - size/3, size, size * 2/3);
  this.ctx.strokeRect(x - size/2, y - size/3, size, size * 2/3);
  
  // Coil
  this.ctx.beginPath();
  this.ctx.arc(x, y - size/3, size/2, 0, Math.PI * 2);
  this.ctx.fill();
  this.ctx.stroke();
  
  // Electric effect
  this.ctx.strokeStyle = '#f1c40f';
  this.ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI * 2 / 3) * i;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - size/3);
    this.ctx.lineTo(x + Math.cos(angle) * size * 1.5, y - size/3 + Math.sin(angle) * size * 1.5);
    this.ctx.stroke();
  }
  
  // Level indicator with size
  if (level > 1) {
    this.ctx.strokeStyle = '#f39c12';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size + level * 2, 0, Math.PI * 2);
    this.ctx.stroke();
  }
};

window.Renderer.prototype.drawFireTowerShape = function(x, y, size, level) {
  // Draw flamethrower shape
  this.ctx.fillStyle = '#e74c3c';
  this.ctx.strokeStyle = '#c0392b';
  this.ctx.lineWidth = 2;
  
  // Base
  this.ctx.fillRect(x - size/2, y - size/2, size, size);
  this.ctx.strokeRect(x - size/2, y - size/2, size, size);
  
  // Nozzle
  this.ctx.fillStyle = '#34495e';
  this.ctx.fillRect(x - size/4, y - size * 0.8, size/2, size/3);
  
  // Fire effect
  this.ctx.fillStyle = '#f39c12';
  for (let i = 0; i < 3; i++) {
    const offset = (i - 1) * size/6;
    this.ctx.beginPath();
    this.ctx.arc(x + offset, y - size * 0.9, size/6, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  // Level indicator with size
  if (level > 1) {
    this.ctx.strokeStyle = '#f39c12';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size + level * 2, 0, Math.PI * 2);
    this.ctx.stroke();
  }
};

window.Renderer.prototype.drawPreview = function(row, col, canPlace, towerType) {
  const x = col * this.cellSize;
  const y = row * this.cellSize;

  // Draw placement preview
  this.ctx.fillStyle = canPlace ? 'rgba(39, 174, 96, 0.3)' : 'rgba(231, 76, 60, 0.3)';
  this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

  this.ctx.strokeStyle = canPlace ? '#27ae60' : '#e74c3c';
  this.ctx.lineWidth = 2;
  this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);

  // Draw range preview if tower type is specified
  if (towerType && canPlace) {
    this.drawRangePreview(row, col, towerType);
  }
};

window.Renderer.prototype.drawRangePreview = function(row, col, towerType) {
  const centerX = col * this.cellSize + this.cellSize / 2;
  const centerY = row * this.cellSize + this.cellSize / 2;
  let range = 0;
  let color = 'rgba(52, 152, 219, 0.2)';

  switch(towerType) {
    case 'miner':
      range = 40; // 2 grids (2 * 20px)
      color = 'rgba(149, 165, 166, 0.2)';
      break;
    case 'lightning':
      range = 80; // 4 grids (4 * 20px)
      color = 'rgba(52, 152, 219, 0.2)';
      break;
    case 'fire':
      range = 60; // 3 grids (3 * 20px)
      color = 'rgba(231, 76, 60, 0.2)';
      break;
  }

  // Draw range circle
  this.ctx.fillStyle = color;
  this.ctx.beginPath();
  this.ctx.arc(centerX, centerY, range, 0, Math.PI * 2);
  this.ctx.fill();

  // Draw range outline
  this.ctx.strokeStyle = color.replace('0.2', '0.5');
  this.ctx.lineWidth = 2;
  this.ctx.setLineDash([5, 5]);
  this.ctx.beginPath();
  this.ctx.arc(centerX, centerY, range, 0, Math.PI * 2);
  this.ctx.stroke();
  this.ctx.setLineDash([]);
};

window.Renderer.prototype.drawTowerIconPreview = function(row, col, towerType) {
  const x = col * this.cellSize + this.cellSize / 2;
  const y = row * this.cellSize + this.cellSize / 2;
  const size = this.cellSize * 0.4; // Larger for 20px cells
  
  this.ctx.save();
  this.ctx.globalAlpha = 0.7;
  
  // Draw tower preview
  switch(towerType) {
    case 'miner':
      this.drawMinerTowerShape(x, y, size, 1);
      break;
    case 'lightning':
      this.drawLightningTowerShape(x, y, size, 1);
      break;
    case 'fire':
      this.drawFireTowerShape(x, y, size, 1);
      break;
  }
  
  this.ctx.restore();
};

window.Renderer.prototype.drawText = function(text, x, y, color, font) {
  color = color || '#fff';
  font = font || '14px Arial';
  this.ctx.fillStyle = color;
  this.ctx.font = font;
  this.ctx.fillText(text, x, y);
};

window.Renderer.prototype.drawRangeCircle = function(x, y, range, color, alpha) {
  color = color || 'rgba(52, 152, 219, 0.2)';
  alpha = alpha || 0.2;
  
  this.ctx.fillStyle = color.replace(/[\d.]+\)/, `${alpha})`);
  this.ctx.beginPath();
  this.ctx.arc(x, y, range, 0, Math.PI * 2);
  this.ctx.fill();

  this.ctx.strokeStyle = color.replace(/[\d.]+\)/, `${alpha * 2.5})`);
  this.ctx.lineWidth = 2;
  this.ctx.setLineDash([5, 5]);
  this.ctx.beginPath();
  this.ctx.arc(x, y, range, 0, Math.PI * 2);
  this.ctx.stroke();
  this.ctx.setLineDash([]);
};

window.Renderer.prototype.drawTowerInfo = function(tower) {
  const info = document.getElementById('towerInfo');
  if (tower) {
    const healthStatus = tower.isDamaged() ? `<span style="color: #e74c3c;">Health: ${Math.floor(tower.health)}/${tower.maxHealth}</span>` : `Health: ${Math.floor(tower.health)}/${tower.maxHealth}`;
    info.innerHTML = `
      <strong>${tower.type.charAt(0).toUpperCase() + tower.type.slice(1)} Tower</strong><br>
      Damage: ${tower.damage} | Range: ${tower.range}<br>
      Fire Rate: ${(1000/tower.fireRate).toFixed(1)}/sec | Level: ${tower.level}<br>
      ${healthStatus} | Upgrades: ${tower.upgradesMade}/3
    `;
    info.classList.add('active');
  } else {
    info.classList.remove('active');
  }
};

window.Renderer.prototype.drawTowerHealthBar = function(tower, x, y) {
  const healthPercent = tower.getHealthPercent();
  const barWidth = 30;
  const barHeight = 3;
  const barY = y - this.cellSize / 2 - 15;

  // Background
  this.ctx.fillStyle = '#34495e';
  this.ctx.fillRect(x - barWidth/2, barY, barWidth, barHeight);

  // Health
  const healthColor = healthPercent > 0.5 ? '#27ae60' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
  this.ctx.fillStyle = healthColor;
  this.ctx.fillRect(x - barWidth/2, barY, barWidth * healthPercent, barHeight);

  // Border
  this.ctx.strokeStyle = '#2c3e50';
  this.ctx.lineWidth = 1;
  this.ctx.strokeRect(x - barWidth/2, barY, barWidth, barHeight);
};

window.Renderer.prototype.drawShooterEnemy = function(x, y, size) {
  const ctx = this.ctx;
  
  // Draw red square with cannon design for shooter enemies
  ctx.fillStyle = '#e74c3c';
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 2;
  
  // Draw square body
  ctx.fillRect(x - size, y - size, size * 2, size * 2);
  ctx.strokeRect(x - size, y - size, size * 2, size * 2);
  
  // Draw cannon pointing towards center
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(x - size * 0.3, y - size * 0.3, size * 0.6, size * 1.5);
  
  // Draw cannon tip
  ctx.beginPath();
  ctx.arc(x, y + size * 0.75, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw targeting crosshair
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y);
  ctx.lineTo(x + size * 0.5, y);
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x, y + size * 0.5);
  ctx.stroke();
  
  // Draw gun symbol
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🔫', x, y - size * 0.3);
};