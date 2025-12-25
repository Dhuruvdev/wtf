import Phaser from 'phaser';

interface Player {
  id: number;
  username: string;
  isAlive: boolean;
  score: number;
  isPerformer: boolean;
  votes: number;
}

interface GameState {
  players: Map<number, Player>;
  round: number;
  maxRounds: number;
  performer1Id: number | null;
  performer2Id: number | null;
  voterIds: number[];
  timeLeft: number;
  roundTimeLimit: number;
  gameActive: boolean;
  phase: 'selecting' | 'performing' | 'voting' | 'results';
}

export class RoastBattleScene extends Phaser.Scene {
  private gameState: GameState;
  private graphics: Phaser.GameObjects.Graphics;
  private onGameAction: ((action: any) => void) | null = null;
  private localPlayerId: number = 0;

  constructor() {
    super('RoastBattle');
    this.gameState = {
      players: new Map(),
      round: 1,
      maxRounds: 3,
      performer1Id: null,
      performer2Id: null,
      voterIds: [],
      timeLeft: 15,
      roundTimeLimit: 15,
      gameActive: true,
      phase: 'selecting'
    };
  }

  init(data: any) {
    this.localPlayerId = data.playerId || 0;
    this.onGameAction = data.onGameAction;
  }

  create() {
    this.graphics = this.add.graphics();

    // Game tick
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (this.gameState.gameActive && this.gameState.timeLeft > 0) {
          this.gameState.timeLeft -= 0.1;
          if (this.gameState.timeLeft <= 0) {
            this.handlePhaseEnd();
          }
        }
      },
      loop: true
    });

    // Render
    this.events.on('update', () => {
      this.renderGame();
    });
  }

  private handlePhaseEnd() {
    if (this.gameState.phase === 'performing') {
      this.gameState.phase = 'voting';
      this.gameState.timeLeft = 10;
    } else if (this.gameState.phase === 'voting') {
      this.gameState.phase = 'results';
      this.gameState.timeLeft = 3;
    } else if (this.gameState.phase === 'results') {
      this.nextRound();
    }
  }

  private nextRound() {
    const alive = Array.from(this.gameState.players.values()).filter(p => p.isAlive);
    
    if (alive.length <= 2 || this.gameState.round >= this.gameState.maxRounds) {
      this.gameState.gameActive = false;
      if (this.onGameAction) {
        this.onGameAction({
          type: 'game_ended',
          winners: alive.sort((a, b) => b.score - a.score).slice(0, 3)
        });
      }
      return;
    }

    // Randomly select 2 performers
    const shuffled = alive.sort(() => Math.random() - 0.5);
    this.gameState.performer1Id = shuffled[0].id;
    this.gameState.performer2Id = shuffled[1].id;
    this.gameState.voterIds = shuffled.slice(2).map(p => p.id);
    
    this.gameState.round++;
    this.gameState.phase = 'performing';
    this.gameState.timeLeft = 15;

    if (this.onGameAction) {
      this.onGameAction({
        type: 'round_start',
        round: this.gameState.round,
        performer1: this.gameState.performer1Id,
        performer2: this.gameState.performer2Id,
        voters: this.gameState.voterIds
      });
    }
  }

  addPlayer(id: number, username: string) {
    this.gameState.players.set(id, {
      id,
      username,
      isAlive: true,
      score: 0,
      isPerformer: false,
      votes: 0
    });
  }

  submitRoast(playerId: number, roastText: string) {
    if (this.onGameAction) {
      this.onGameAction({
        type: 'roast_submitted',
        playerId,
        roast: roastText
      });
    }
  }

  submitVote(voterId: number, votedForId: number) {
    const player = this.gameState.players.get(votedForId);
    if (player) {
      player.votes++;
      player.score++;
    }

    if (this.onGameAction) {
      this.onGameAction({
        type: 'vote_submitted',
        voterId,
        votedFor: votedForId
      });
    }
  }

  eliminatePlayer(playerId: number) {
    const player = this.gameState.players.get(playerId);
    if (player) {
      player.isAlive = false;
    }
  }

  private renderGame() {
    this.graphics.clear();

    // Background
    this.graphics.fillStyle(0x0a0014);
    this.graphics.fillRect(0, 0, 800, 600);

    const canvas = this.game.canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const phaseText: { [key: string]: string } = {
      'selecting': 'SELECTING PERFORMERS...',
      'performing': 'ROAST TIME! 🔥',
      'voting': 'VOTE FOR THE BETTER ROAST! ⭐',
      'results': 'RESULTS'
    };

    // Title
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROAST BATTLE RAGE', 400, 40);

    // Phase
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(phaseText[this.gameState.phase], 400, 70);

    // Round info
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ROUND ${this.gameState.round}/${this.gameState.maxRounds}`, 20, 100);
    ctx.fillText(`TIME: ${Math.ceil(this.gameState.timeLeft)}s`, 20, 120);

    // Performers
    if (this.gameState.performer1Id && this.gameState.performer2Id) {
      const p1 = this.gameState.players.get(this.gameState.performer1Id);
      const p2 = this.gameState.players.get(this.gameState.performer2Id);

      if (p1 && p2) {
        // P1
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(p1.username, 50, 180);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${p1.score} pts`, 50, 200);

        // VS
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VS', 400, 190);

        // P2
        ctx.fillStyle = '#4ecdc4';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(p2.username, 750, 180);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${p2.score} pts`, 750, 200);
      }
    }

    // Players list
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    let yPos = 250;
    ctx.fillText('PLAYERS:', 20, yPos);
    yPos += 20;

    let aliveCount = 0;
    this.gameState.players.forEach(player => {
      if (player.isAlive) {
        const status = player.id === this.gameState.performer1Id ? '🎤' : 
                       player.id === this.gameState.performer2Id ? '🎤' : 
                       this.gameState.voterIds.includes(player.id) ? '🗳️' : '⏳';
        
        ctx.fillStyle = player.id === this.localPlayerId ? '#06b6d4' : '#ffffff';
        ctx.fillText(`${status} ${player.username}: ${player.score}pts`, 20, yPos);
        yPos += 18;
        aliveCount++;
      }
    });

    // Bottom bar
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 550, 800, 50);
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`ALIVE: ${aliveCount} | Ready to ${this.gameState.phase === 'performing' ? 'ROAST' : 'VOTE'}`, 400, 575);
  }

  getGameState() {
    return {
      round: this.gameState.round,
      phase: this.gameState.phase,
      timeLeft: Math.ceil(this.gameState.timeLeft),
      performers: {
        id1: this.gameState.performer1Id,
        id2: this.gameState.performer2Id
      },
      players: Array.from(this.gameState.players.values()).map(p => ({
        id: p.id,
        username: p.username,
        isAlive: p.isAlive,
        score: p.score,
        votes: p.votes
      }))
    };
  }

  endGame() {
    this.gameState.gameActive = false;
  }
}
