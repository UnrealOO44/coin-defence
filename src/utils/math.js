// Math utilities for game calculations
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/utils/math.js',
  exports: ['Vector2D', 'distance', 'lerp', 'clamp', 'circleRectCollision']
});

window.Vector2D = function(x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

window.Vector2D.prototype.add = function(other) {
  return new window.Vector2D(this.x + other.x, this.y + other.y);
};

window.Vector2D.prototype.subtract = function(other) {
  return new window.Vector2D(this.x - other.x, this.y - other.y);
};

window.Vector2D.prototype.multiply = function(scalar) {
  return new window.Vector2D(this.x * scalar, this.y * scalar);
};

window.Vector2D.prototype.normalize = function() {
  const mag = this.magnitude();
  if (mag === 0) return new window.Vector2D(0, 0);
  return new window.Vector2D(this.x / mag, this.y / mag);
};

window.Vector2D.prototype.magnitude = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

window.Vector2D.prototype.distanceTo = function(other) {
  const dx = this.x - other.x;
  const dy = this.y - other.y;
  return Math.sqrt(dx * dx + dy * dy);
};

window.distance = function(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

window.lerp = function(start, end, t) {
  return start + (end - start) * t;
};

window.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

window.circleRectCollision = function(cx, cy, radius, rx, ry, rw, rh) {
  const testX = (cx < rx) ? rx : ((cx > rx + rw) ? rx + rw : cx);
  const testY = (cy < ry) ? ry : ((cy > ry + rh) ? ry + rh : cy);
  const distX = cx - testX;
  const distY = cy - testY;
  const distance = Math.sqrt(distX * distX + distY * distY);
  return distance <= radius;
};