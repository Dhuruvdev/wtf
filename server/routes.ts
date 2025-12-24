import type { Express } from "express";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { WS_EVENTS } from "@shared/schema";
import axios from "axios";
import { z } from "zod";

// Discord OAuth Types
interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUserResponse {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string;
}

async function exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = `${process.env.REPLIT_DOMAINS || 'http://localhost:5000'}/auth/discord/callback`;

  const response = await axios.post('https://discord.com/api/v10/oauth2/token', {
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    scope: 'identify email rpc',
  });

  return response.data;
}

async function getDiscordUser(accessToken: string): Promise<DiscordUserResponse> {
  const response = await axios.get('https://discord.com/api/v10/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

async function handleDiscordCallback(code: string) {
  try {
    const tokenData = await exchangeCodeForToken(code);
    const userData = await getDiscordUser(tokenData.access_token);

    let user = await storage.getUserByDiscordId(userData.id);

    if (!user) {
      user = await storage.createUser(
        userData.id,
        userData.username,
        userData.avatar || undefined,
        userData.email,
        tokenData.access_token
      );
    } else {
      await storage.updateUserToken(user.id, tokenData.access_token);
    }

    return {
      user,
      accessToken: tokenData.access_token,
    };
  } catch (error) {
    console.error('Discord OAuth error:', error);
    throw new Error('Failed to authenticate with Discord');
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // WebSocket Setup - Track room membership
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const roomConnections = new Map<number, Set<WebSocket>>();
  const userVoiceChannels = new Map<number, string>(); // userId -> voiceChannelId

  wss.on('connection', (ws) => {
    console.log('Client connected');
    let currentRoomId: number | null = null;
    let currentUserId: number | null = null;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join' && data.roomCode) {
          const room = await storage.getRoomByCode(data.roomCode);
          if (room) {
            currentRoomId = room.id;
            if (!roomConnections.has(room.id)) {
              roomConnections.set(room.id, new Set());
            }
            roomConnections.get(room.id)?.add(ws);
            console.log(`Client joined room ${room.id}`);
            
            // Broadcast player joined event
            broadcast(room.id, WS_EVENTS.PLAYER_JOINED, { playerId: data.playerId });
          }
        }
        
        // Voice channel context detection
        if (data.type === 'voice_context' && data.voiceChannelId) {
          currentUserId = data.userId;
          userVoiceChannels.set(data.userId, data.voiceChannelId);
          console.log(`User ${data.userId} in voice channel ${data.voiceChannelId}`);
        }

        // Real-time multiplayer sync
        if (data.type === 'game_action' && currentRoomId) {
          broadcast(currentRoomId, data.eventType, data.payload);
        }
      } catch (err) {
        console.error('Failed to parse message', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && roomConnections.has(currentRoomId)) {
        roomConnections.get(currentRoomId)?.delete(ws);
        if (currentUserId) {
          userVoiceChannels.delete(currentUserId);
        }
      }
      console.log('Client disconnected');
    });
  });

  function broadcast(roomId: number, type: string, payload: any) {
    const connections = roomConnections.get(roomId);
    if (connections) {
      const message = JSON.stringify({ type, payload });
      connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  // Discord OAuth callback endpoint
  app.get('/auth/discord/callback', async (req, res) => {
    try {
      const code = req.query.code as string;
      if (!code) {
        return res.status(400).json({ message: 'Missing authorization code' });
      }

      const { user, accessToken } = await handleDiscordCallback(code);
      
      // Store token in session/cookie and redirect
      res.cookie('discord_token', accessToken, { httpOnly: true, secure: true });
      res.redirect(`/?userId=${user.id}&token=${accessToken}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  // API Routes
  app.post("/api/rooms/create", async (req, res) => {
    try {
      const { username, avatarUrl } = req.body;
      if (!username) {
        return res.status(400).json({ message: "Username required" });
      }
      
      const room = await storage.createRoom(0);
      const player = await storage.addPlayer(room.id, {
        username,
        avatarUrl,
        isHost: true,
      });

      res.status(201).json({ 
        code: room.code,
        playerId: player.id,
        roomId: room.id
      });
    } catch (err) {
      console.error("Create room error", err);
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  app.post("/api/rooms/join", async (req, res) => {
    try {
      const { code, username, avatarUrl } = req.body;
      if (!code || !username) {
        return res.status(400).json({ message: "Code and username required" });
      }
      
      const room = await storage.getRoomByCode(code);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const player = await storage.addPlayer(room.id, {
        username,
        avatarUrl,
      });

      res.status(200).json({
        roomId: room.id,
        playerId: player.id,
        code: room.code
      });
    } catch (err) {
      console.error("Join room error", err);
      res.status(500).json({ message: "Failed to join room" });
    }
  });

  app.get("/api/rooms/:code", async (req, res) => {
    try {
      const room = await storage.getRoomByCode(req.params.code);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      const players = await storage.getPlayers(room.id);
      res.json({ ...room, players });
    } catch (err) {
      console.error("Get room error", err);
      res.status(500).json({ message: "Failed to get room" });
    }
  });

  // Add AI player endpoint
  app.post('/api/rooms/:roomId/add-ai', async (req, res) => {
    try {
      const roomId = Number(req.params.roomId);
      const room = await storage.getRoom(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const players_list = await storage.getPlayers(roomId);
      if (players_list.length >= 8) {
        return res.status(400).json({ message: "Room is full (max 8 players)" });
      }

      const aiPlayer = await storage.addAIPlayer(roomId);
      broadcast(roomId, 'AI_JOINED', { player: aiPlayer });
      
      res.json(aiPlayer);
    } catch (err) {
      console.error('Failed to add AI player', err);
      res.status(500).json({ message: "Failed to add AI player" });
    }
  });

  // Start game endpoint
  app.post('/api/rooms/:roomId/start', async (req, res) => {
    try {
      const roomId = Number(req.params.roomId);
      const room = await storage.getRoom(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      console.log(`Starting game for room ${roomId}`);

      // Update room status to playing
      await storage.updateRoomStatus(roomId, 'playing');
      
      // Broadcast start game event
      broadcast(roomId, WS_EVENTS.START_GAME, { roomId });
      
      // Schedule microgame rotation
      const games: Array<'voice-act' | 'canvas-draw' | 'emoji-relay' | 'bluff-vote'> = [
        'voice-act', 'canvas-draw', 'emoji-relay', 'bluff-vote'
      ];
      let gameIndex = 0;
      
      const scheduleNextGame = () => {
        const game = games[gameIndex % games.length];
        const delay = gameIndex === 0 ? 2000 : 8000; // Initial delay, then 8s per game
        
        const timeoutId = setTimeout(() => {
          console.log(`Broadcasting PHASE_CHANGE for game: ${game}`);
          broadcast(roomId, WS_EVENTS.PHASE_CHANGE, {
            microgame: game,
            phase: 'playing'
          });
          
          gameIndex++;
          if (gameIndex < 8) scheduleNextGame(); // 8 rounds total
        }, delay);

        console.log(`Scheduled ${game} in ${delay}ms`);
      };
      
      scheduleNextGame();
      
      res.json({ success: true });
    } catch (err) {
      console.error('Failed to start game', err);
      res.status(500).json({ message: "Failed to start game" });
    }
  });

  // Roast Battle endpoints
  app.post('/api/rooms/:roomId/start-roast', async (req, res) => {
    try {
      const roomId = Number(req.params.roomId);
      const players = await storage.getPlayers(roomId);
      const alivePlayers = players.filter(p => p.isAlive);
      
      if (alivePlayers.length < 2) {
        return res.status(400).json({ message: "Need at least 2 alive players" });
      }

      const performer1 = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      let performer2 = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      while (performer2.id === performer1.id && alivePlayers.length > 1) {
        performer2 = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      }

      const battle = await storage.createRoastBattle(roomId, performer1.id, performer2.id);
      broadcast(roomId, 'ROAST_BATTLE_START', {
        battleId: battle.id,
        performer1: { id: performer1.id, username: performer1.username },
        performer2: { id: performer2.id, username: performer2.username },
      });

      res.json(battle);
    } catch (err) {
      console.error('Failed to start roast battle', err);
      res.status(500).json({ message: "Failed to start roast battle" });
    }
  });

  app.post('/api/roast-battles/:battleId/vote', async (req, res) => {
    try {
      const battleId = Number(req.params.battleId);
      const { voterId, votedForId } = req.body;

      const vote = await storage.addRoastVote(battleId, voterId, votedForId);
      const battle = await storage.getRoastBattle(battleId);
      if (battle) {
        broadcast(battle.roomId, 'ROAST_VOTE_SUBMITTED', { battleId, voterId });
      }

      res.json(vote);
    } catch (err) {
      console.error('Failed to submit roast vote', err);
      res.status(500).json({ message: "Failed to submit vote" });
    }
  });

  app.post('/api/roast-battles/:battleId/end', async (req, res) => {
    try {
      const battleId = Number(req.params.battleId);
      const battle = await storage.getRoastBattle(battleId);
      if (!battle) return res.status(404).json({ message: "Battle not found" });

      const votes = await storage.getRoastVotes(battleId);
      const votesForPerformer1 = votes.filter(v => v.votedForId === battle.performer1Id).length;
      const votesForPerformer2 = votes.filter(v => v.votedForId === battle.performer2Id).length;

      const winnerId = votesForPerformer1 > votesForPerformer2 
        ? battle.performer1Id 
        : battle.performer2Id;

      await storage.updateRoastBattleWinner(battleId, winnerId, votesForPerformer1, votesForPerformer2);
      
      const loserId = winnerId === battle.performer1Id ? battle.performer2Id : battle.performer1Id;
      await storage.updatePlayerAlive(loserId, false);

      broadcast(battle.roomId, 'ROAST_BATTLE_END', {
        battleId,
        winner: winnerId,
        votesForPerformer1,
        votesForPerformer2,
      });

      res.json({ success: true });
    } catch (err) {
      console.error('Failed to end roast battle', err);
      res.status(500).json({ message: "Failed to end battle" });
    }
  });

  return httpServer;
}
