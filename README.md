# Crypto Tower Defense

## Game Overview
A cryptocurrency-themed tower defense game where players place mining towers to defend against waves of Bitcoin and other cryptocurrency enemies. Strategic tower placement and upgrades are key to surviving all 20 waves. Starting from wave 6, enemies will appear that can shoot back and destroy your towers!

## Architecture Summary
Modular system with separate managers for towers, enemies, projectiles, and waves. Grid-based tower placement with path-based enemy movement. Real-time projectile system with collision detection and responsive design supporting both desktop and mobile devices.

## File Index
### Core Systems
- `index.html` - Entry point, canvas, script loading with responsive mobile layout
- `src/core/input.js` - Mouse, keyboard, and touch input handling with mobile gestures
- `src/core/loop.js` - Game loop with delta-time timing
- `src/utils/math.js` - Vector math and utility functions
- `src/utils/grid.js` - Grid system for tower placement with consistent cell sizing

### Game Systems
- `src/engine/renderer.js` - Canvas rendering for all game objects
- `src/engine/audio.js` - Sound effects and background music system
- `src/game/path.js` - Enemy path system with waypoint navigation (responsive)
- `src/game/enemy.js` - Enemy entities with health, movement, and shooting behaviors
- `src/game/tower.js` - Tower system with targeting, upgrades, and health management
- `src/game/projectile.js` - Projectile system for tower attacks
- `src/game/waves.js` - Wave spawning and progression system
- `src/game/ui.js` - User interface and button management with mobile support
- `src/game/main.js` - Game controller and state management with responsive canvas

### Current Features
- ✅ **Tower Placement** - Click/tap to place 3 tower types (Miner, Lightning, Fire) with accurate mouse tracking
- ✅ **Wider Game Area** - Expanded to 20x9 grid (up from 16x9) for more strategic placement options
- ✅ **Enemy Waves** - 20 waves with 5 enemy types (Bitcoin, Ethereum, Dogecoin, Monero, Shooter)
- ✅ **Tower Health** - Towers can take damage from enemy attacks and be destroyed
- ✅ **Shooting Enemies** - Starting wave 6, red shooter enemies appear that can damage towers
- ✅ **Upgrades** - Each tower can be upgraded 3 times for increased damage/range
- ✅ **Economy** - Gold system for buying/upgrading towers (70% sell refund)
- ✅ **Game Speed** - Auto-speed management and manual toggle (1x/2x/3x)
- ✅ **Projectile System** - Real-time projectiles with different effects
- ✅ **Tower Health Bars** - Visual indicators show tower damage with color-coded health
- ✅ **Mobile Support** - Full touch controls, responsive layout, and mobile-optimized UI
- ✅ **Responsive Design** - Game adapts to any screen size from phones to desktop (1600x900 max canvas)

### Key Patterns
- **Global Namespace** - All game objects use `window.*` for production builds
- **Delta Time** - Frame-rate independent movement using deltaTime
- **Entity Management** - Managers handle collections of game objects
- **Event-Driven** - UI buttons and keyboard/touch controls trigger game actions
- **Component Architecture** - Separate systems for rendering, physics, and logic
- **Enemy Targeting** - Shooter enemies use proximity detection to attack nearest towers
- **Health Management** - Towers track damage and auto-remove when destroyed
- **Responsive Layout** - Canvas and UI scale appropriately for any device
- **Touch Gestures** - Tap to place towers, long-press for tower options on mobile

## Controls
### Desktop
- **Mouse Click** - Select towers, place towers, select placed towers
- **Double Click** - Open tower options (same as long-press on mobile)
- **Tower Buttons** - Choose tower type (Miner: 50g, Lightning: 100g, Fire: 150g)
- **U Key** - Upgrade selected tower
- **S Key** - Sell selected tower (70% refund)
- **Space** - Start next wave
- **P Key** - Pause/unpause game
- **M Key** - Mute/unmute audio
- **Speed Button** - Change game speed (1x/2x/3x)

### Mobile
- **Tap** - Place selected tower or select existing tower
- **Long Press** - Open tower options (upgrade/sell)
- **Tower Buttons** - Choose tower type (touch-friendly buttons)
- **Wave Button** - Start next wave
- **Speed Button** - Change game speed
- **No Zoom/Scroll** - Touch interactions are disabled for gameplay

## Game Mechanics
- **Lives**: Start with 20 lives, lose 1 per enemy that reaches the end
- **Gold**: Earn gold by defeating enemies, bonus gold for completing waves
- **Grid Layout**: 20x9 grid provides more space for strategic tower placement
- **Tower Types**:
  - Miner Tower: Basic damage, good fire rate, cheap
  - Lightning Tower: High damage, long range, slow fire rate
  - Fire Tower: Medium damage, applies slow effect to enemies
- **Enemy Types**: Unlock as waves progress (Bitcoin → Ethereum/Dogecoin → Monero → Shooter)
- **Tower Damage**: Shooter enemies can destroy towers if not eliminated quickly
- **Tower Health**: Each tower has 100 HP and shows health bars when damaged
- **Auto-Speed**: Game automatically speeds up to 3x when towers can't reach enemies
- **Victory**: Survive all 20 waves to win

## Mobile Features
- **Responsive Canvas**: Automatically scales to fit any screen size
- **Touch Controls**: Full touch support with tap and long-press gestures
- **Mobile UI**: Larger buttons and touch-friendly interface
- **No Double-Tap Zoom**: Prevents accidental zooming during gameplay
- **Optimized Layout**: UI elements reposition for mobile screens
- **Performance**: Smooth gameplay even on mobile devices

## Responsive Design
- **Canvas Sizing**: Automatically adjusts based on screen dimensions
- **Grid Adaptation**: Game grid scales properly on all devices
- **Path System**: Enemy paths adapt to canvas size changes
- **Button Scaling**: Tower buttons and controls scale appropriately
- **Text Sizing**: Font sizes adjust for readability on small screens
- **Layout Optimization**: UI reorganizes for portrait and landscape modes