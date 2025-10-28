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
  // Create a simple S-shaped path
  this.waypoints = [
    { row: 7, col: 0 },
    { row: 7, col: 6 },
    { row: 2, col: 6 },
    { row: 2, col: 12 },
    { row: 10, col: 12 },
    { row: 10, col: 18 },
    { row: 5, col: 18 },
    { row: 5, col: 24 }
  ];

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