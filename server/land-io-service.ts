// Land.io Game State Management Service

interface LandIOPlayer {
  id: number;
  username: string;
  x: number;
  y: number;
  color: number;
  isAlive: boolean;
  score: number;
  territoryCells: number;
}

interface LandIOGame {
  roomId: number;
  players: Map<number, LandIOPlayer>;
  gameTime: number;
  gameActive: boolean;
  startTime: number;
  maxDuration: number;
  gridWidth: number;
  gridHeight: number;
}

const activeGames = new Map<number, LandIOGame>();

export const landIOService = {
  createGame(roomId: number, players: Array<{ id: number; username: string }>) {
    const game: LandIOGame = {
      roomId,
      players: new Map(),
      gameTime: 300, // 5 minutes
      gameActive: true,
      startTime: Date.now(),
      maxDuration: 300000, // 5 minutes in milliseconds
      gridWidth: 800,
      gridHeight: 600,
    };

    players.forEach((player, index) => {
      game.players.set(player.id, {
        id: player.id,
        username: player.username,
        x: 100 + index * 150,
        y: 100 + (index % 2) * 150,
        color: [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf7b731, 0x5f27cd, 0x00d2d3, 0xff9ff3, 0x54a0ff][index % 8],
        isAlive: true,
        score: 0,
        territoryCells: 3600, // 60x60 starting territory
      });
    });

    activeGames.set(roomId, game);
    return game;
  },

  getGame(roomId: number) {
    return activeGames.get(roomId);
  },

  updatePlayerPosition(roomId: number, playerId: number, x: number, y: number) {
    const game = activeGames.get(roomId);
    if (!game) return null;

    const player = game.players.get(playerId);
    if (player) {
      player.x = x;
      player.y = y;
    }
    return player;
  },

  claimTerritory(roomId: number, playerId: number, territoryCells: number) {
    const game = activeGames.get(roomId);
    if (!game) return null;

    const player = game.players.get(playerId);
    if (player) {
      player.territoryCells += territoryCells;
      player.score += territoryCells;
    }
    return player;
  },

  eliminatePlayer(roomId: number, playerId: number, killedById?: number) {
    const game = activeGames.get(roomId);
    if (!game) return null;

    const player = game.players.get(playerId);
    if (player) {
      player.isAlive = false;

      // Transfer territory to killer if specified
      if (killedById) {
        const killer = game.players.get(killedById);
        if (killer) {
          killer.score += Math.floor(player.territoryCells * 0.5);
          player.territoryCells = 0;
        }
      }
    }
    return player;
  },

  updateGameTime(roomId: number) {
    const game = activeGames.get(roomId);
    if (!game) return null;

    const elapsed = (Date.now() - game.startTime) / 1000;
    game.gameTime = Math.max(0, 300 - elapsed);

    if (game.gameTime <= 0) {
      game.gameActive = false;
    }

    return game;
  },

  getGameLeaderboard(roomId: number) {
    const game = activeGames.get(roomId);
    if (!game) return [];

    return Array.from(game.players.values())
      .sort((a, b) => b.score - a.score)
      .map(p => ({
        id: p.id,
        username: p.username,
        score: p.score,
        territory: p.territoryCells,
        isAlive: p.isAlive,
      }));
  },

  getGameState(roomId: number) {
    const game = activeGames.get(roomId);
    if (!game) return null;

    return {
      roomId: game.roomId,
      gameTime: Math.floor(game.gameTime),
      gameActive: game.gameActive,
      players: Array.from(game.players.values()).map(p => ({
        id: p.id,
        username: p.username,
        x: p.x,
        y: p.y,
        isAlive: p.isAlive,
        score: p.score,
        territory: p.territoryCells,
      })),
    };
  },

  endGame(roomId: number) {
    const game = activeGames.get(roomId);
    if (!game) return null;

    game.gameActive = false;

    const results = {
      roomId,
      gameTime: Math.floor(game.gameTime),
      winners: Array.from(game.players.values())
        .filter(p => p.isAlive)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(p => ({
          id: p.id,
          username: p.username,
          score: p.score,
          territory: p.territoryCells,
        })),
      allScores: Array.from(game.players.values())
        .sort((a, b) => b.score - a.score)
        .map(p => ({
          id: p.id,
          username: p.username,
          score: p.score,
          territory: p.territoryCells,
          isAlive: p.isAlive,
        })),
    };

    activeGames.delete(roomId);
    return results;
  },

  deleteGame(roomId: number) {
    activeGames.delete(roomId);
  },
};
