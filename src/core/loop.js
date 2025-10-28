// Game loop and timing
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/core/loop.js',
  exports: ['gameLoop', 'startGame'],
  dependencies: ['update', 'render']
});

window.lastTime = 0;
window.maxFPS = 60;
window.frameDelay = 1000 / window.maxFPS;

window.gameLoop = function(timestamp) {
    // Calculate delta time in milliseconds
    const deltaTime = timestamp - window.lastTime;

    // Cap at 60 fps - skip frame if running too fast
    if (deltaTime < window.frameDelay) {
        requestAnimationFrame(window.gameLoop);
        return;
    }

    // Cap delta time to prevent spiral of death (if tab was inactive)
    const cappedDelta = Math.min(deltaTime, 100);

    window.update(cappedDelta);
    window.render();
    window.lastTime = timestamp;

    requestAnimationFrame(window.gameLoop);
};

window.startGame = function() {
    window.lastTime = performance.now();
    requestAnimationFrame(window.gameLoop);
};