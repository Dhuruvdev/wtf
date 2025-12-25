import Phaser from 'phaser';

declare module 'phaser' {
  namespace Geom {
    class Circle {
      constructor(x: number, y: number, radius: number);
    }
  }
}

interface Player {
  id: number;
  x: number;
  y: number;
  color: number;
  trails: Array<{ x: number; y: number }>;
  territory: Array<{ x: number; y: number }>;
  isAlive: boolean;
  score: number;
}

interface GameState {
  players: Map<number, Player>;
  gameTime: number;
  gameActive: boolean;
  gridSize: number;
  canvas: OffscreenCanvas | HTMLCanvasElement;
}

export class LandIOScene extends Phaser.Scene {
  private gameState: GameState;
  private graphics: Phaser.GameObjects.Graphics;
  private playerColors: number[] = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf7b731, 0x5f27cd, 0x00d2d3, 0xff9ff3, 0x54a0ff];
  private tileSize = 4;
  private worldWidth = 800;
  private worldHeight = 600;
  private gameTime = 300; // 5 minutes
  private onGameAction: ((action: any) => void) | null = null;
  private localPlayerId: number = 0;
  private territoryCounts: Map<number, number> = new Map();

  constructor() {
    super('LandIO');
    this.gameState = {
      players: new Map(),
      gameTime: 300,
      gameActive: true,
      gridSize: 4,
      canvas: typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(800, 600) : document.createElement('canvas')
    };
  }

  init(data: any) {
    this.localPlayerId = data.playerId || 0;
    this.onGameAction = data.onGameAction;
  }

  create() {
    this.graphics = this.add.graphics();
    
    // Input handling - WASD for movement
    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      this.handleInput(event);
    });

    // Mouse/Touch controls
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handlePointerMove(pointer);
    });

    // Game loop
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.gameState.gameActive) {
          this.gameState.gameTime -= 0.1;
          if (this.gameState.gameTime <= 0) {
            this.gameState.gameActive = false;
          }
        }
      },
      loop: true
    });

    // Render loop
    this.events.on('update', () => {
      this.renderGame();
    });
  }

  private handleInput(event: KeyboardEvent) {
    const key = event.key.toUpperCase();
    const player = this.gameState.players.get(this.localPlayerId);
    if (!player || !this.gameState.gameActive) return;

    const speed = 2;
    let moved = false;

    if (key === 'W' || event.key === 'ArrowUp') {
      player.y = Math.max(0, player.y - speed);
      moved = true;
    } else if (key === 'S' || event.key === 'ArrowDown') {
      player.y = Math.min(this.worldHeight - 1, player.y + speed);
      moved = true;
    } else if (key === 'A' || event.key === 'ArrowLeft') {
      player.x = Math.max(0, player.x - speed);
      moved = true;
    } else if (key === 'D' || event.key === 'ArrowRight') {
      player.x = Math.min(this.worldWidth - 1, player.x + speed);
      moved = true;
    } else if (key === ' ') {
      // Space to stop/finalize
      this.finalizeTrail();
      moved = true;
    }

    if (moved) {
      this.updatePlayerTrail(player);
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    const player = this.gameState.players.get(this.localPlayerId);
    if (!player || !this.gameState.gameActive) return;

    const dx = pointer.x - player.x;
    const dy = pointer.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 2) {
      const speed = 2;
      player.x += (dx / distance) * speed;
      player.y += (dy / distance) * speed;
      player.x = Math.max(0, Math.min(this.worldWidth - 1, player.x));
      player.y = Math.max(0, Math.min(this.worldHeight - 1, player.y));
      this.updatePlayerTrail(player);
    }
  }

  private updatePlayerTrail(player: Player) {
    if (player.trails.length === 0 || 
        Math.hypot(player.x - player.trails[player.trails.length - 1].x,
                   player.y - player.trails[player.trails.length - 1].y) > 2) {
      player.trails.push({ x: Math.round(player.x), y: Math.round(player.y) });

      // Check collision with own trail
      if (player.trails.length > 10) {
        const collision = this.checkTrailCollision(player);
        if (collision && this.onGameAction) {
          this.onGameAction({
            type: 'player_eliminated',
            playerId: this.localPlayerId,
            message: 'Hit your own trail!'
          });
          player.isAlive = false;
        }
      }
    }
  }

  private finalizeTrail() {
    const player = this.gameState.players.get(this.localPlayerId);
    if (!player || player.trails.length < 4) return;

    const startPoint = player.trails[0];
    const endPoint = player.trails[player.trails.length - 1];
    
    if (Math.hypot(startPoint.x - endPoint.x, startPoint.y - endPoint.y) < 20) {
      const newTerritory = this.floodFillTerritory(player.trails);
      player.territory = player.territory.concat(newTerritory);
      player.score += newTerritory.length;

      this.territoryCounts.set(this.localPlayerId, (this.territoryCounts.get(this.localPlayerId) || 0) + newTerritory.length);

      if (this.onGameAction) {
        this.onGameAction({
          type: 'territory_claimed',
          playerId: this.localPlayerId,
          territory: newTerritory,
          score: player.score
        });
      }

      player.trails = [];
    }
  }

  private checkTrailCollision(player: Player): boolean {
    const currentPos = { x: Math.round(player.x), y: Math.round(player.y) };
    
    // Check collision with trail (excluding last few points)
    for (let i = 0; i < player.trails.length - 5; i++) {
      const trail = player.trails[i];
      if (Math.hypot(currentPos.x - trail.x, currentPos.y - trail.y) < 5) {
        return true;
      }
    }
    return false;
  }

  private floodFillTerritory(trail: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
    const territory: Array<{ x: number; y: number }> = [];
    const visited = new Set<string>();
    const queue = [];

    // Find interior point
    if (trail.length > 0) {
      const centerX = Math.round(trail.reduce((sum, p) => sum + p.x, 0) / trail.length);
      const centerY = Math.round(trail.reduce((sum, p) => sum + p.y, 0) / trail.length);
      
      queue.push({ x: centerX, y: centerY });
      
      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) break;

        const key = `${current.x},${current.y}`;
        if (visited.has(key) || current.x < 0 || current.x >= this.worldWidth || 
            current.y < 0 || current.y >= this.worldHeight) continue;

        visited.add(key);
        territory.push(current);

        // Check 4 adjacent cells
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          const nextX = current.x + dx;
          const nextY = current.y + dy;
          const isOnTrail = trail.some(p => p.x === nextX && p.y === nextY);
          if (!isOnTrail && !visited.has(`${nextX},${nextY}`)) {
            queue.push({ x: nextX, y: nextY });
          }
        }
      }
    }

    return territory.slice(0, 2000); // Limit territory size
  }

  addPlayer(id: number, startX: number, startY: number, colorIndex: number) {
    const player: Player = {
      id,
      x: startX,
      y: startY,
      color: this.playerColors[colorIndex % this.playerColors.length],
      trails: [],
      territory: [],
      isAlive: true,
      score: 0
    };

    // Create initial territory square
    const initialSize = 30;
    for (let x = startX - initialSize; x < startX + initialSize; x++) {
      for (let y = startY - initialSize; y < startY + initialSize; y++) {
        if (x >= 0 && x < this.worldWidth && y >= 0 && y < this.worldHeight) {
          player.territory.push({ x, y });
        }
      }
    }

    this.gameState.players.set(id, player);
    this.territoryCounts.set(id, player.territory.length);
  }

  updatePlayerPosition(id: number, x: number, y: number) {
    const player = this.gameState.players.get(id);
    if (player) {
      player.x = x;
      player.y = y;
    }
  }

  applyTerritoryClaim(playerId: number, territory: Array<{ x: number; y: number }>) {
    const player = this.gameState.players.get(playerId);
    if (player) {
      player.territory = territory;
      this.territoryCounts.set(playerId, territory.length);
    }
  }

  eliminatePlayer(id: number) {
    const player = this.gameState.players.get(id);
    if (player) {
      player.isAlive = false;
      player.trails = [];
    }
  }

  private renderGame() {
    this.graphics.clear();
    
    // Draw background
    this.graphics.fillStyle(0xfafafa);
    this.graphics.fillRect(0, 0, this.worldWidth, this.worldHeight);

    // Draw territories
    this.gameState.players.forEach((player) => {
      if (!player.isAlive) return;
      
      this.graphics.fillStyle(player.color, 0.3);
      player.territory.forEach(point => {
        this.graphics.fillRect(point.x, point.y, 1, 1);
      });
    });

    // Draw trails
    this.gameState.players.forEach((player) => {
      if (!player.isAlive || player.trails.length === 0) return;
      
      this.graphics.lineStyle(2, player.color, 1);
      this.graphics.beginPath();
      this.graphics.moveTo(player.trails[0].x, player.trails[0].y);
      
      for (let i = 1; i < player.trails.length; i++) {
        this.graphics.lineTo(player.trails[i].x, player.trails[i].y);
      }
      this.graphics.strokePath();
    });

    // Draw players
    this.gameState.players.forEach((player) => {
      if (!player.isAlive) return;
      
      this.graphics.fillStyle(player.color);
      this.graphics.fillCircle(player.x, player.y, 4);
      
      // Draw player border
      this.graphics.lineStyle(2, 0xffffff);
      const circle = new Phaser.Geom.Circle(player.x, player.y, 4);
      this.graphics.strokeCircleShape(circle);
    });

    // Draw game info
    this.graphics.fillStyle(0x000000);
    this.graphics.fillRect(0, 0, 200, 80);
    this.graphics.fillStyle(0xffffff);
    
    const timeSeconds = Math.max(0, Math.floor(this.gameTime));
    const mins = Math.floor(timeSeconds / 60);
    const secs = timeSeconds % 60;
    
    this.graphics.fillText(`TIME: ${mins}:${secs.toString().padStart(2, '0')}`, 10, 15);
    
    const localPlayer = this.gameState.players.get(this.localPlayerId);
    if (localPlayer) {
      this.graphics.fillText(`SCORE: ${localPlayer.score}`, 10, 35);
      this.graphics.fillText(`TERRITORY: ${this.territoryCounts.get(this.localPlayerId) || 0}`, 10, 55);
    }

    // Draw leaderboard
    const sortedPlayers = Array.from(this.gameState.players.values())
      .filter(p => p.isAlive)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    this.graphics.fillStyle(0x000000);
    this.graphics.fillRect(this.worldWidth - 200, 0, 200, 100);
    this.graphics.fillStyle(0xffffff);
    this.graphics.fillText('TOP PLAYERS', this.worldWidth - 195, 15);
    
    sortedPlayers.forEach((player, idx) => {
      this.graphics.fillText(`${idx + 1}. ${player.score} pts`, this.worldWidth - 195, 35 + idx * 20);
    });
  }

  getGameState() {
    return {
      players: Array.from(this.gameState.players.entries()).map(([id, player]) => ({
        id,
        x: player.x,
        y: player.y,
        isAlive: player.isAlive,
        score: player.score,
        territory: player.territory.length
      })),
      gameTime: Math.max(0, Math.floor(this.gameTime)),
      gameActive: this.gameState.gameActive
    };
  }

  endGame() {
    this.gameState.gameActive = false;
    this.gameState.gameTime = 0;
  }
}
