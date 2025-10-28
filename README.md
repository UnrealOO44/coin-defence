# Crypto Tower Defense

## Game Overview
A cryptocurrency-themed tower defense game where players place mining towers to defend against waves of Bitcoin and other cryptocurrency enemies. Strategic tower placement and upgrades are key to surviving all 20 waves. Starting from wave 6, enemies will appear that can shoot back and destroy your towers!

## Architecture Summary
- Modular system with separate managers for towers, enemies, projectiles, and waves
- Grid-based tower placement with path-based enemy movement
- Real-time projectile system with collision detection
- UI-driven tower selection and upgrades

## File Index
### Core Systems
- `index.html` - Entry point, canvas, script loading
- `src/core/input.js` - Mouse and keyboard input handling
- `src/core/loop.js` - Game loop with delta-time timing
- `src/utils/math.js` - Vector math and utility functions
- `src/utils/grid.js` - Grid system for tower placement

### Game Systems
- `src/engine/renderer.js` - Canvas rendering for all game objects
- `src/engine/audio.js` - Sound effects and background music system
- `src/game/path.js` - Enemy path system with waypoint navigation
- `src/game/enemy.js` - Enemy entities with health, movement, and shooting behaviors
- `src/game/tower.js` - Tower system with targeting, upgrades, and health management
- `src/game/tower.js` - Tower system with targeting and upgrades
- `src/game/projectile.js` - Projectile system for tower attacks
- `src/game/waves.js` - Wave spawning and progression system
- `src/game/ui.js` - User interface and button management
- `src/game/main.js` - Game controller and state management

### Current Features
- ✅ **Tower Placement** - Click to place 3 tower types (Miner, Lightning, Fire)
- ✅ **Enemy Waves** - 20 waves with 5 enemy types (Bitcoin, Ethereum, Dogecoin, Monero, Shooter)
- ✅ **Tower Health** - Towers can now take damage from enemy attacks and be destroyed
- ✅ **Shooting Enemies** - Starting wave 6, red shooter enemies appear that can damage towers
- ✅ **Upgrades** - Each tower can be upgraded 3 times for increased damage/range
- ✅ **Economy** - Gold system for buying/upgrading towers
- ✅ **Game Speed** - Toggle between 1x, 2x, and 3x speed
- ✅ **Projectile System** - Real-time projectiles with different effects
- ✅ **Tower Health Bars** - Visual indicators show tower damage with color-coded health

### Key Patterns
- **Global Namespace** - All game objects use `window.*` for production builds
- **Delta Time** - Frame-rate independent movement using deltaTime
- **Entity Management** - Managers handle collections of game objects
- **Event-Driven** - UI buttons and keyboard controls trigger game actions
- **Component Architecture** - Separate systems for rendering, physics, and logic
- **Enemy Targeting** - Shooter enemies use proximity detection to attack nearest towers
- **Health Management** - Towers track damage and auto-remove when destroyed

## Controls
- **Mouse Click** - Select towers, place towers, select placed towers
- **Tower Buttons** - Choose tower type (Miner: 50g, Lightning: 100g, Fire: 150g)
- **U Key** - Upgrade selected tower
- **S Key** - Sell selected tower (70% refund)
- **Space** - Start next wave
- **P Key** - Pause/unpause game
- **Speed Button** - Change game speed (1x/2x/3x)

## Game Mechanics
- **Lives**: Start with 20 lives, lose 1 per enemy that reaches the end
- **Gold**: Earn gold by defeating enemies, bonus gold for completing waves
- **Tower Types**:
  - Miner Tower: Basic damage, good fire rate, cheap
  - Lightning Tower: High damage, long range, slow fire rate
  - Fire Tower: Medium damage, applies slow effect to enemies
- **Enemy Types**: Unlock as waves progress (Bitcoin → Ethereum/Dogecoin → Monero → Shooter)
- **Tower Damage**: Shooter enemies can destroy towers if not eliminated quickly
- **Tower Health**: Each tower has 100 HP and shows health bars when damaged
- **Victory**: Survive all 20 waves to win