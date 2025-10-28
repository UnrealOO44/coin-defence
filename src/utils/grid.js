// Grid system for tower placement
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/utils/grid.js',
  exports: ['Grid', 'gridToPixel', 'pixelToGrid']
});

window.Grid = function(canvasWidth, canvasHeight, cellSize) {
  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.cellSize = cellSize;
  this.cols = Math.floor(canvasWidth / cellSize);
  this.rows = Math.floor(canvasHeight / cellSize);
  this.cells = [];
  
  // Initialize grid cells
  for (let row = 0; row < this.rows; row++) {
    this.cells[row] = [];
    for (let col = 0; col < this.cols; col++) {
      this.cells[row][col] = {
        occupied: false,
        type: 'empty',
        path: false
      };
    }
  }
};

window.Grid.prototype.isValidCell = function(row, col) {
  return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
};

window.Grid.prototype.isOccupied = function(row, col) {
  if (!this.isValidCell(row, col)) return true;
  return this.cells[row][col].occupied || this.cells[row][col].path;
};

window.Grid.prototype.setOccupied = function(row, col, occupied) {
  occupied = occupied !== undefined ? occupied : true;
  if (this.isValidCell(row, col)) {
    this.cells[row][col].occupied = occupied;
  }
};

window.Grid.prototype.setPath = function(row, col, isPath) {
  isPath = isPath !== undefined ? isPath : true;
  if (this.isValidCell(row, col)) {
    this.cells[row][col].path = isPath;
  }
};

window.Grid.prototype.getPixelPosition = function(row, col) {
  return {
    x: col * this.cellSize,
    y: row * this.cellSize
  };
};

window.Grid.prototype.getGridPosition = function(x, y) {
  return {
    row: Math.floor(y / this.cellSize),
    col: Math.floor(x / this.cellSize)
  };
};

window.Grid.prototype.updateSize = function(newCanvasWidth, newCanvasHeight) {
  this.canvasWidth = newCanvasWidth;
  this.canvasHeight = newCanvasHeight;
  this.cols = Math.floor(newCanvasWidth / this.cellSize);
  this.rows = Math.floor(newCanvasHeight / this.cellSize);
  
  // Reinitialize grid with new dimensions
  this.cells = [];
  for (let row = 0; row < this.rows; row++) {
    this.cells[row] = [];
    for (let col = 0; col < this.cols; col++) {
      this.cells[row][col] = {
        occupied: false,
        type: 'empty',
        path: false
      };
    }
  }
};

window.gridToPixel = function(row, col, cellSize) {
  return {
    x: col * cellSize,
    y: row * cellSize
  };
};

window.pixelToGrid = function(x, y, cellSize) {
  return {
    row: Math.floor(y / cellSize),
    col: Math.floor(x / cellSize)
  };
};