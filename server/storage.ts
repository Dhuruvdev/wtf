import { db } from "./db";
import {
  rooms,
  players,
  type Room,
  type Player,
  type CreateRoomRequest,
  type JoinRoomRequest
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  createRoom(hostSocketId: string): Promise<Room>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  getRoom(id: number): Promise<Room | undefined>;
  addPlayer(roomId: number, player: { socketId: string, username: string, avatarUrl?: string, isHost?: boolean }): Promise<Player>;
  getPlayers(roomId: number): Promise<Player[]>;
  getPlayerBySocketId(socketId: string): Promise<Player | undefined>;
  removePlayer(socketId: string): Promise<void>;
  updateRoomStatus(roomId: number, status: string): Promise<void>;
  addAIPlayer(roomId: number): Promise<Player>;
}

export class DatabaseStorage implements IStorage {
  async createRoom(hostSocketId: string): Promise<Room> {
    const code = nanoid(4).toUpperCase();
    const [room] = await db.insert(rooms).values({
      code,
      hostSocketId,
      status: "lobby",
    }).returning();
    return room;
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.code, code));
    return room;
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async addPlayer(roomId: number, player: { socketId: string, username: string, avatarUrl?: string, isHost?: boolean }): Promise<Player> {
    const [newPlayer] = await db.insert(players).values({
      roomId,
      socketId: player.socketId,
      username: player.username,
      avatarUrl: player.avatarUrl,
      isHost: player.isHost || false,
    }).returning();
    return newPlayer;
  }

  async getPlayers(roomId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.roomId, roomId));
  }

  async getPlayerBySocketId(socketId: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.socketId, socketId));
    return player;
  }

  async removePlayer(socketId: string): Promise<void> {
    await db.delete(players).where(eq(players.socketId, socketId));
  }

  async updateRoomStatus(roomId: number, status: string): Promise<void> {
    await db.update(rooms).set({ status }).where(eq(rooms.id, roomId));
  }

  async addAIPlayer(roomId: number): Promise<Player> {
    const aiNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon'];
    const randomName = aiNames[Math.floor(Math.random() * aiNames.length)];
    const aiSocketId = `ai-${nanoid()}`;
    
    const [newPlayer] = await db.insert(players).values({
      roomId,
      socketId: aiSocketId,
      username: randomName,
      avatarUrl: undefined,
    }).returning();
    return newPlayer;
  }
}

export const storage = new DatabaseStorage();
