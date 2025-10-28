// Audio system for game sound effects and music
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/engine/audio.js',
  exports: ['AudioEngine']
});

window.AudioEngine = function() {
  this.sounds = {};
  this.musicVolume = 0.3;
  this.sfxVolume = 0.5;
  this.masterVolume = 0.8;
  this.muted = false;
  this.isMuted = false;
  this.audioContext = null;
  this.initialized = false;
};

// Initialize audio context (must be called after user interaction)
window.AudioEngine.prototype.init = function() {
  if (this.initialized) return;
  
  try {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.initialized = true;
    this.createSounds();
    console.log('Audio system initialized');
  } catch (error) {
    console.log('Audio not supported:', error);
  }
};

// Create all game sounds using Web Audio API
window.AudioEngine.prototype.createSounds = function() {
  if (!this.audioContext) return;
  
  // Tower placement sounds
  this.sounds.placeTower = () => this.playSound('place', 200, 0.3);
  this.sounds.upgradeTower = () => this.playSound('upgrade', 300, 0.4);
  this.sounds.sellTower = () => this.playSound('sell', 150, 0.3);
  
  // Tower attack sounds
  this.sounds.minerShoot = () => this.playSound('miner', 100, 0.2);
  this.sounds.lightningShoot = () => this.playSound('lightning', 150, 0.3);
  this.sounds.fireShoot = () => this.playSound('fire', 200, 0.25);
  
  // Enemy sounds
  this.sounds.enemyHit = () => this.playSound('hit', 80, 0.3);
  this.sounds.enemyDie = () => this.playSound('die', 300, 0.4);
  this.sounds.enemySpawn = () => this.playSound('spawn', 100, 0.2);
  this.sounds.enemyShoot = () => this.playSound('enemyShoot', 250, 0.3);
  
  // UI sounds
  this.sounds.buttonClick = () => this.playSound('click', 50, 0.2);
  this.sounds.buttonHover = () => this.playSound('hover', 30, 0.1);
  this.sounds.error = () => this.playSound('error', 200, 0.3);
  
  // Game state sounds
  this.sounds.waveStart = () => this.playSound('waveStart', 500, 0.4);
  this.sounds.waveComplete = () => this.playSound('waveComplete', 800, 0.5);
  this.sounds.victory = () => this.playSound('victory', 1200, 0.6);
  this.sounds.gameOver = () => this.playSound('gameOver', 1000, 0.5);
  
  // Money sounds
  this.sounds.goldEarn = () => this.playSound('gold', 150, 0.3);
  this.sounds.notEnoughGold = () => this.playSound('noGold', 200, 0.3);
  
  // Tower damage sounds
  this.sounds.towerHit = () => this.playSound('towerHit', 100, 0.3);
  this.sounds.towerDestroyed = () => this.playSound('towerDestroyed', 400, 0.5);
  
  // Background music
  this.sounds.backgroundMusic = () => this.playBackgroundMusic();
};

// Generate sound effects using Web Audio API oscillators
window.AudioEngine.prototype.playSound = function(type, duration, volume) {
  if (!this.audioContext || this.muted) return;
  
  const ctx = this.audioContext;
  const gainNode = ctx.createGain();
  gainNode.connect(ctx.destination);
  
  const actualVolume = volume * this.sfxVolume * this.masterVolume;
  gainNode.gain.value = actualVolume;
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
  
  const oscillator = ctx.createOscillator();
  oscillator.connect(gainNode);
  
  // Different sound types with different waveforms and frequencies
  switch(type) {
    case 'place':
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      oscillator.type = 'triangle';
      break;
      
    case 'upgrade':
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      oscillator.type = 'sine';
      break;
      
    case 'sell':
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      oscillator.type = 'sawtooth';
      break;
      
    case 'miner':
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.type = 'square';
      break;
      
    case 'lightning':
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      oscillator.type = 'sawtooth';
      break;
      
    case 'fire':
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
      oscillator.type = 'triangle';
      break;
      
    case 'hit':
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.type = 'sine';
      break;
      
    case 'die':
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      oscillator.type = 'sawtooth';
      break;
      
    case 'spawn':
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      oscillator.type = 'sine';
      break;
      
    case 'click':
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.type = 'square';
      break;
      
    case 'hover':
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.type = 'sine';
      break;
      
    case 'error':
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
      oscillator.type = 'sawtooth';
      break;
      
    case 'waveStart':
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.4);
      oscillator.type = 'sine';
      break;
      
    case 'waveComplete':
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.6);
      oscillator.type = 'triangle';
      break;
      
    case 'victory':
      oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.2); // E5
      oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.4); // G5
      oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.6); // C6
      oscillator.type = 'sine';
      break;
      
    case 'gameOver':
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.8);
      oscillator.type = 'sawtooth';
      break;
      
    case 'gold':
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.05);
      oscillator.type = 'square';
      break;
      
    case 'noGold':
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      oscillator.type = 'sawtooth';
      break;
      
    case 'enemyShoot':
      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.1);
      oscillator.type = 'triangle';
      break;
      
    case 'towerHit':
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
      oscillator.type = 'square';
      break;
      
    case 'towerDestroyed':
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      oscillator.type = 'sawtooth';
      break;
      
    default:
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      oscillator.type = 'sine';
  }
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration / 1000);
};

// Play background music (cryptocurrency-themed rhythmic melody)
window.AudioEngine.prototype.playBackgroundMusic = function() {
  if (!this.audioContext || this.muted || this.backgroundMusicPlaying) return;
  
  this.backgroundMusicPlaying = true;
  const ctx = this.audioContext;
  
  const playMelody = () => {
    if (!this.backgroundMusicPlaying || this.muted) return;
    
    // Crypto-themed scale with more interesting harmony
    const notes = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659]; // C4 to E5 scale
    
    // Upward trending melody pattern (like crypto charts!)
    const melody = [
      0, 2, 4, 2, 5, 4, 2, 0,  // Main theme
      3, 5, 7, 5, 8, 7, 5, 3,  // Variation
      6, 8, 9, 8, 6, 5, 4, 2,  // Climax
      0, 1, 2, 3, 4, 5, 6, 7   // Ascending pattern
    ];
    
    // Rhythm pattern for more dynamic feel
    const rhythm = [250, 250, 500, 250, 250, 500, 250, 250, 500, 250, 250, 500, 250, 250, 750, 250];
    
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.backgroundMusicPlaying || this.muted) return;
      
      const noteIndexInMelody = melody[noteIndex % melody.length];
      const frequency = notes[noteIndexInMelody];
      const noteDuration = rhythm[noteIndex % rhythm.length];
      
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.value = this.musicVolume * this.masterVolume * 0.25;
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + noteDuration / 1000);
      
      const oscillator = ctx.createOscillator();
      oscillator.connect(gainNode);
      oscillator.frequency.value = frequency;
      
      // Vary the waveform for interest
      const waveTypes = ['triangle', 'sine', 'triangle', 'square'];
      oscillator.type = waveTypes[Math.floor(noteIndex / 4) % waveTypes.length];
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + noteDuration / 1000);
      
      noteIndex++;
      
      if (noteIndex >= melody.length) {
        setTimeout(playMelody, 500); // Shorter pause for continuity
      } else {
        setTimeout(playNote, noteDuration); // Use rhythm pattern
      }
    };
    
    // Add bass line for depth
    const playBass = () => {
      if (!this.backgroundMusicPlaying || this.muted) return;
      
      const bassNotes = [130, 164, 196, 130]; // Lower octave foundation
      
      bassNotes.forEach((freq, index) => {
        setTimeout(() => {
          if (!this.backgroundMusicPlaying || this.muted) return;
          
          const gainNode = ctx.createGain();
          gainNode.connect(ctx.destination);
          gainNode.gain.value = this.musicVolume * this.masterVolume * 0.15;
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          
          const oscillator = ctx.createOscillator();
          oscillator.connect(gainNode);
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.5);
        }, index * 1000);
      });
      
      setTimeout(playBass, 4000); // Repeat bass pattern
    };
    
    playNote();
    playBass(); // Start bass line
  };
  
  playMelody();
};

// Stop background music
window.AudioEngine.prototype.stopBackgroundMusic = function() {
  this.backgroundMusicPlaying = false;
};

// Play specific sound by name
window.AudioEngine.prototype.play = function(soundName) {
  if (!this.initialized) this.init();
  if (this.sounds[soundName]) {
    this.sounds[soundName]();
  }
};

// Toggle mute
window.AudioEngine.prototype.toggleMute = function() {
  this.muted = !this.muted;
  this.isMuted = this.muted;
  if (this.muted) {
    this.stopBackgroundMusic();
  } else {
    this.sounds.backgroundMusic();
  }
  return this.muted;
};

// Set volume levels
window.AudioEngine.prototype.setVolume = function(type, volume) {
  volume = Math.max(0, Math.min(1, volume));
  
  switch(type) {
    case 'master':
      this.masterVolume = volume;
      break;
    case 'music':
      this.musicVolume = volume;
      break;
    case 'sfx':
      this.sfxVolume = volume;
      break;
  }
};

// Get current volume level
window.AudioEngine.prototype.getVolume = function(type) {
  switch(type) {
    case 'master':
      return this.masterVolume;
    case 'music':
      return this.musicVolume;
    case 'sfx':
      return this.sfxVolume;
    default:
      return 1;
  }
};