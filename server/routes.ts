import type { Express } from "express";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { WS_EVENTS } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // WebSocket Setup - Track room membership
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const roomConnections = new Map<number, Set<WebSocket>>();

  wss.on('connection', (ws) => {
    console.log('Client connected');
    let currentRoomId: number | null = null;

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
          }
        }
      } catch (err) {
        console.error('Failed to parse message', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId && roomConnections.has(currentRoomId)) {
        roomConnections.get(currentRoomId)?.delete(ws);
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

  return httpServer;
}
