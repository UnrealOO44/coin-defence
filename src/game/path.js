// Path system for enemy movement
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/path.js',
  exports: ['Path']
});

window.Path = function(grid) {
  this.grid = grid;
  this.waypoints = [];
  this.createDefaultPath();
};

window.Path.prototype.createDefaultPath = function() {
  // Create a path that aligns perfectly with grid cells
  const rows = this.grid.rows;
  const cols = this.grid.cols;
  
  // Clear any existing path markings
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      this.grid.setPath(row, col, false);
    }
  }
  
  // Use exact grid coordinates for a 18x40 grid
  const middleRow = Math.floor(rows / 2); // Row 9 (middle of 18 rows)
  const upperRow = 4; // Row 4 (good strategic position)
  const lowerRow = 13; // Row 13 (good strategic position)
  
  // Define waypoints using exact grid coordinates for 40-column grid
  this.waypoints = [
    { row: middleRow, col: 0 },   // Start at left edge
    { row: middleRow, col: 8 },   // Move right
    { row: upperRow, col: 8 },    // Move up
    { row: upperRow, col: 16 },   // Move right
    { row: middleRow, col: 16 },  // Move down
    { row: middleRow, col: 24 },  // Move right
    { row: lowerRow, col: 24 },   // Move down
    { row: lowerRow, col: 32 },   // Move right
    { row: middleRow, col: 32 },  // Move up
    { row: middleRow, col: 39 }   // End at right edge (col 39 for 40 columns)
  ];

  // Ensure waypoints are within grid bounds
  this.waypoints = this.waypoints.map(point => ({
    row: Math.max(0, Math.min(rows - 1, point.row)),
    col: Math.max(0, Math.min(cols - 1, point.col))
  }));

  // Mark path cells on grid
  this.markPathOnGrid();
};

window.Path.prototype.markPathOnGrid = function() {
  for (let i = 0; i < this.waypoints.length - 1; i++) {
    const start = this.waypoints[i];
    const end = this.waypoints[i + 1];
    
    if (start.row === end.row) {
      // Horizontal path
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      for (let col = minCol; col <= maxCol; col++) {
        this.grid.setPath(start.row, col);
      }
    } else if (start.col === end.col) {
      // Vertical path
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      for (let row = minRow; row <= maxRow; row++) {
        this.grid.setPath(row, start.col);
      }
    }
  }
};

window.Path.prototype.getWaypoint = function(index) {
  if (index >= 0 && index < this.waypoints.length) {
    const point = this.waypoints[index];
    return {
      x: point.col * this.grid.cellSize + this.grid.cellSize / 2,
      y: point.row * this.grid.cellSize + this.grid.cellSize / 2
    };
  }
  return null;
};

window.Path.prototype.getWaypoints = function() {
  return this.waypoints.map(point => ({
    x: point.col * this.grid.cellSize + this.grid.cellSize / 2,
    y: point.row * this.grid.cellSize + this.grid.cellSize / 2
  }));
};

window.Path.prototype.getStartPoint = function() {
  return this.getWaypoint(0);
};

window.Path.prototype.getEndPoint = function() {
  return this.getWaypoint(this.waypoints.length - 1);
};

window.Path.prototype.isPathCell = function(row, col) {
  for (let point of this.waypoints) {
    if (point.row === row && point.col === col) {
      return true;
    }
  }
  
  // Check interpolated cells between waypoints
  for (let i = 0; i < this.waypoints.length - 1; i++) {
    const start = this.waypoints[i];
    const end = this.waypoints[i + 1];
    
    if (start.row === end.row && row === start.row) {
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      if (col >= minCol && col <= maxCol) {
        return true;
      }
    } else if (start.col === end.col && col === start.col) {
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      if (row >= minRow && row <= maxRow) {
        return true;
      }
    }
  }
  
  return false;
};

// Get progress percentage (0-1) along the path for a given position
window.Path.prototype.getProgressAtPosition = function(x, y) {
  let totalPathLength = 0;
  const segmentLengths = [];
  
  // Calculate total path length and segment lengths
  for (let i = 0; i < this.waypoints.length - 1; i++) {
    const start = this.getWaypoint(i);
    const end = this.getWaypoint(i + 1);
    const length = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    segmentLengths.push(length);
    totalPathLength += length;
  }
  
  if (totalPathLength === 0) return 0;
  
  // Find the closest point on the path
  let minDistance = Infinity;
  let accumulatedLength = 0;
  let closestProgress = 0;
  
  for (let i = 0; i < this.waypoints.length - 1; i++) {
    const start = this.getWaypoint(i);
    const end = this.getWaypoint(i + 1);
    
    // Project point onto line segment
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) continue;
    
    let t = ((x - start.x) * dx + (y - start.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t)); // Clamp to segment
    
    const closestX = start.x + t * dx;
    const closestY = start.y + t * dy;
    const distance = Math.sqrt(
      Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      const segmentProgress = accumulatedLength + t * segmentLengths[i];
      closestProgress = segmentProgress / totalPathLength;
    }
    
    accumulatedLength += segmentLengths[i];
  }
  
  return closestProgress;
};

// Update path when grid size changes
window.Path.prototype.updateGrid = function(newGrid) {
  this.grid = newGrid;
  this.waypoints = [];
  this.createDefaultPath();
};