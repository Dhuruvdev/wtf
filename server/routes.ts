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
  app.post(api.rooms.create.path, async (req, res) => {
    try {
      const input = api.rooms.create.input.parse(req.body);
      // For MVP, we assume a socket connection established first, 
      // but in REST flow we might just create room then connect socket.
      // We'll use a placeholder ID if no socket yet, or expect socketId in body if we were advanced.
      const room = await storage.createRoom("placeholder-socket-id");
      
      const player = await storage.addPlayer(room.id, {
        socketId: "placeholder-socket-id", // Update this when WS connects?
        username: input.username,
        avatarUrl: input.avatarUrl,
        isHost: true
      });

      res.status(201).json({ 
        code: room.code,
        playerId: player.id 
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.rooms.join.path, async (req, res) => {
    try {
      const input = api.rooms.join.input.parse(req.body);
      const room = await storage.getRoomByCode(input.code);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const player = await storage.addPlayer(room.id, {
        socketId: "placeholder-" + Date.now(),
        username: input.username,
        avatarUrl: input.avatarUrl,
      });

      res.status(200).json({
        roomId: room.id,
        playerId: player.id
      });
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.rooms.get.path, async (req, res) => {
    const room = await storage.getRoomByCode(req.params.code);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    const players = await storage.getPlayers(room.id);
    res.json({ ...room, players });
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
