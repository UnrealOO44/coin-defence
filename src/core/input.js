// Input handling for mouse, keyboard, and touch
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/core/input.js',
  exports: ['Input', 'MouseState', 'KeyboardState', 'TouchState']
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
  this.doubleClicked = false;
  this.lastClickTime = 0;
};

window.MouseState.prototype.update = function(x, y, leftPressed, rightPressed) {
  this.x = x;
  this.y = y;
  
  if (leftPressed && !this.leftPressed) {
    const now = Date.now();
    this.clicked = true;
    
    // Check for double click
    if (now - this.lastClickTime < 300) {
      this.doubleClicked = true;
    } else {
      this.doubleClicked = false;
    }
    this.lastClickTime = now;
  } else {
    this.clicked = false;
    this.doubleClicked = false;
  }
  
  this.leftPressed = leftPressed;
  this.rightPressed = rightPressed;
};

// Helper function for touch state
window.TouchState = function() {
  this.touches = [];
  this.singleTouch = null;
  this.longPressTimer = null;
  this.longPressCallback = null;
  this.tapCallback = null;
  this.moveCallback = null;
  this.endCallback = null;
};

window.TouchState.prototype.setCallbacks = function(tapCallback, longPressCallback, moveCallback, endCallback) {
  this.tapCallback = tapCallback;
  this.longPressCallback = longPressCallback;
  this.moveCallback = moveCallback;
  this.endCallback = endCallback;
};

window.TouchState.prototype.handleTouchStart = function(touches) {
  this.touches = Array.from(touches);
  if (touches.length === 1) {
    this.singleTouch = {
      x: touches[0].clientX,
      y: touches[0].clientY,
      startX: touches[0].clientX,
      startY: touches[0].clientY
    };
    
    // Set up long press detection
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    
    this.longPressTimer = setTimeout(() => {
      if (this.singleTouch && this.longPressCallback) {
        this.longPressCallback(this.singleTouch.x, this.singleTouch.y);
      }
    }, 500);
  }
};

window.TouchState.prototype.handleTouchMove = function(touches) {
  if (this.longPressTimer) {
    clearTimeout(this.longPressTimer);
    this.longPressTimer = null;
  }
  
  this.touches = Array.from(touches);
  if (touches.length === 1 && this.singleTouch) {
    this.singleTouch.x = touches[0].clientX;
    this.singleTouch.y = touches[0].clientY;
    
    if (this.moveCallback) {
      this.moveCallback(this.singleTouch.x, this.singleTouch.y);
    }
  }
};

window.TouchState.prototype.handleTouchEnd = function(touches) {
  if (this.longPressTimer) {
    clearTimeout(this.longPressTimer);
    this.longPressTimer = null;
  }
  
  if (this.singleTouch && this.tapCallback) {
    const distance = Math.sqrt(
      Math.pow(this.singleTouch.x - this.singleTouch.startX, 2) + 
      Math.pow(this.singleTouch.y - this.singleTouch.startY, 2)
    );
    
    // Only trigger tap if it's a small movement
    if (distance < 10) {
      this.tapCallback(this.singleTouch.x, this.singleTouch.y);
    }
  }
  
  this.touches = Array.from(touches);
  if (touches.length === 0) {
    this.singleTouch = null;
    
    if (this.endCallback) {
      this.endCallback();
    }
  }
};

// Main input manager
window.Input = function() {
  this.mouse = new window.MouseState();
  this.keyboard = new window.KeyboardState();
  this.touch = new window.TouchState();
  this.canvas = null;
  this.isMobile = this.detectMobile();
  this.lastTapTime = 0;
};

window.Input.prototype.detectMobile = function() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         'ontouchstart' in window || 
         window.innerWidth <= 768;
};

window.Input.prototype.init = function(canvas) {
  this.canvas = canvas;
  const self = this;

  // Mouse events (for desktop)
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    this.mouse.x = x;
    this.mouse.y = y;
    
    if (this.touch.moveCallback) {
      this.touch.moveCallback(x, y);
    }
  });

  // Also update mouse on canvas hover (for immediate feedback)
  canvas.addEventListener('mouseenter', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    this.mouse.x = x;
    this.mouse.y = y;
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.leftPressed = true;
      this.mouse.clicked = true;
      
      // Check for double click
      const now = Date.now();
      if (now - this.lastTapTime < 300) {
        if (this.touch.longPressCallback) {
          this.touch.longPressCallback(x, y);
        }
      }
      this.lastTapTime = now;
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      this.mouse.leftPressed = false;
    }
  });

  // Touch events (for mobile)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    this.touch.handleTouchStart(e.touches);
    
    // Update mouse state for compatibility
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.leftPressed = true;
      this.mouse.clicked = true;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    this.touch.handleTouchMove(e.touches);
    
    // Update mouse state for compatibility
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      
      this.mouse.x = x;
      this.mouse.y = y;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.touch.handleTouchEnd(e.changedTouches);
    
    // Update mouse state for compatibility
    if (e.touches.length === 0) {
      this.mouse.leftPressed = false;
    }
  }, { passive: false });

  // Keyboard events
  window.addEventListener('keydown', (e) => {
    this.keyboard.setKeyDown(e.key);
    
    // Prevent default for game keys
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'm', 'M', 'u', 'U', 's', 'S', 'p', 'P'].includes(e.key)) {
      e.preventDefault();
    }
    
    // Mute audio with M key
    if (e.key.toLowerCase() === 'm' && window.game && window.game.audioEngine) {
      const muted = window.game.audioEngine.toggleMute();
      console.log(muted ? 'Audio muted' : 'Audio unmuted');
    }
  });

  window.addEventListener('keyup', (e) => {
    this.keyboard.setKeyUp(e.key);
  });

  // Prevent scrolling and zooming on mobile
  document.addEventListener('touchmove', (e) => {
    if (e.target === canvas) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
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

window.Input.prototype.setTapCallback = function(callback) {
  this.touch.tapCallback = callback;
};

window.Input.prototype.setLongPressCallback = function(callback) {
  this.touch.longPressCallback = callback;
};

window.Input.prototype.setTouchMoveCallback = function(callback) {
  this.touch.moveCallback = callback;
};

window.Input.prototype.setTouchEndCallback = function(callback) {
  this.touch.endCallback = callback;
};