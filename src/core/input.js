// Input handling for mouse and keyboard
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/core/input.js',
  exports: ['Input', 'MouseState', 'KeyboardState']
});

// Helper function for keyboard state
window.KeyboardState = function() {
  this.keys = {};
};

window.KeyboardState.prototype.isPressed = function(key) {
  return this.keys[key] === true;
};

window.KeyboardState.prototype.setKeyDown = function(key) {
  this.keys[key] = true;
};

window.KeyboardState.prototype.setKeyUp = function(key) {
  this.keys[key] = false;
};

// Helper function for mouse state
window.MouseState = function() {
  this.x = 0;
  this.y = 0;
  this.leftPressed = false;
  this.rightPressed = false;
  this.clicked = false;
};

window.MouseState.prototype.update = function(x, y, leftPressed, rightPressed) {
  this.x = x;
  this.y = y;
  
  if (leftPressed && !this.leftPressed) {
    this.clicked = true;
  } else {
    this.clicked = false;
  }
  
  this.leftPressed = leftPressed;
  this.rightPressed = rightPressed;
};

// Main input manager
window.Input = function() {
  this.mouse = new window.MouseState();
  this.keyboard = new window.KeyboardState();
  this.canvas = null;
};

window.Input.prototype.init = function(canvas) {
  this.canvas = canvas;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.mouse.x = x;
    this.mouse.y = y;
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      this.mouse.leftPressed = true;
      this.mouse.clicked = true;
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      this.mouse.leftPressed = false;
    }
  });

  window.addEventListener('keydown', (e) => {
    this.keyboard.setKeyDown(e.key);
    
    // Mute audio with M key
    if (e.key.toLowerCase() === 'm' && window.game && window.game.audioEngine) {
      const muted = window.game.audioEngine.toggleMute();
      console.log(muted ? 'Audio muted' : 'Audio unmuted');
    }
  });

  window.addEventListener('keyup', (e) => {
    this.keyboard.setKeyUp(e.key);
  });
};

window.Input.prototype.update = function() {
  // Reset click state after frame
  if (this.mouse.clicked) {
    setTimeout(() => {
      this.mouse.clicked = false;
    }, 50);
  }
};

window.Input.prototype.getGridPosition = function(cellSize) {
  cellSize = cellSize || 50;
  return {
    row: Math.floor(this.mouse.y / cellSize),
    col: Math.floor(this.mouse.x / cellSize)
  };
};