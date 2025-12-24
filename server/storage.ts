import { db } from "./db";
import {
  users,
  rooms,
  players,
  gameItems,
  clues,
  votes,
  type Room,
  type Player,
  type GameItem,
  type Clue,
  type Vote,
  type User,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  createRoom(hostId: number): Promise<Room>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  getRoom(id: number): Promise<Room | undefined>;
  addPlayer(roomId: number, player: { username: string; avatarUrl?: string; isHost?: boolean; isBot?: boolean; isAlive?: boolean }): Promise<Player>;
  getPlayers(roomId: number): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  removePlayer(id: number): Promise<void>;
  updatePlayerAlive(playerId: number, isAlive: boolean): Promise<void>;
  getAlivePlayers(roomId: number): Promise<Player[]>;
  updateRoomStatus(roomId: number, status: string): Promise<void>;
  updateRoomRound(roomId: number, round: number): Promise<void>;
  setGameItem(roomId: number, itemId: number, knowerPlayerId: number, somethingBroke: boolean): Promise<void>;
  addClue(roundId: number, playerId: number, clueText: string, isFake: boolean): Promise<Clue>;
  addVote(roundId: number, voterId: number, accusedId: number): Promise<Vote>;
  getVotes(roundId: number): Promise<Vote[]>;
  addGameItem(roomId: number, name: string, category: string): Promise<GameItem>;
  getGameItems(roomId: number): Promise<GameItem[]>;
  getClues(roundId: number): Promise<Clue[]>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(discordId: string, discordUsername: string, discordAvatar: string | undefined, discordEmail: string | undefined, discordToken: string): Promise<User>;
  updateUserToken(userId: number, discordToken: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createRoom(hostId: number): Promise<Room> {
    const code = nanoid(4).toUpperCase();
    const [room] = await db.insert(rooms).values({
      code,
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

  async addPlayer(roomId: number, player: { username: string; avatarUrl?: string; isHost?: boolean; isBot?: boolean }): Promise<Player> {
    const [newPlayer] = await db.insert(players).values({
      roomId,
      username: player.username,
      avatarUrl: player.avatarUrl,
      isHost: player.isHost || false,
      isBot: player.isBot || false,
    }).returning();
    return newPlayer;
  }

  async getPlayers(roomId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.roomId, roomId));
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  async removePlayer(id: number): Promise<void> {
    await db.delete(players).where(eq(players.id, id));
  }

  async updatePlayerAlive(playerId: number, isAlive: boolean): Promise<void> {
    await db.update(players).set({ isAlive }).where(eq(players.id, playerId));
  }

  async getAlivePlayers(roomId: number): Promise<Player[]> {
    return await db.select().from(players).where(
      and(eq(players.roomId, roomId), eq(players.isAlive, true))
    );
  }

  async updateRoomStatus(roomId: number, status: string): Promise<void> {
    await db.update(rooms).set({ status }).where(eq(rooms.id, roomId));
  }

  async updateRoomRound(roomId: number, round: number): Promise<void> {
    await db.update(rooms).set({ round }).where(eq(rooms.id, roomId));
  }

  async setGameItem(roomId: number, itemId: number, knowerPlayerId: number, somethingBroke: boolean): Promise<void> {
    await db.update(rooms).set({
      brokenItemId: itemId,
      knowerPlayerId,
      somethingBroke,
    }).where(eq(rooms.id, roomId));
  }

  async addClue(roundId: number, playerId: number, clueText: string, isFake: boolean): Promise<Clue> {
    const [clue] = await db.insert(clues).values({
      roundId,
      playerId,
      clueText,
      isFake,
    }).returning();
    return clue;
  }

  async addVote(roundId: number, voterId: number, accusedId: number): Promise<Vote> {
    const [vote] = await db.insert(votes).values({
      roundId,
      voterId,
      accusedId,
    }).returning();
    return vote;
  }

  async getVotes(roundId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.roundId, roundId));
  }

  async addGameItem(roomId: number, name: string, category: string): Promise<GameItem> {
    const [item] = await db.insert(gameItems).values({
      roomId,
      name,
      category,
    }).returning();
    return item;
  }

  async getGameItems(roomId: number): Promise<GameItem[]> {
    return await db.select().from(gameItems).where(eq(gameItems.roomId, roomId));
  }

  async getClues(roundId: number): Promise<Clue[]> {
    return await db.select().from(clues).where(eq(clues.roundId, roundId));
  }

  async addAIPlayer(roomId: number): Promise<Player> {
    const aiNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon', 'Bot Zeta', 'Bot Eta', 'Bot Theta'];
    const randomName = aiNames[Math.floor(Math.random() * aiNames.length)];
    
    const [newPlayer] = await db.insert(players).values({
      roomId,
      username: randomName,
      isBot: true,
    }).returning();
    return newPlayer;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user;
  }

  async createUser(discordId: string, discordUsername: string, discordAvatar: string | undefined, discordEmail: string | undefined, discordToken: string): Promise<User> {
    const [user] = await db.insert(users).values({
      discordId,
      discordUsername,
      discordAvatar,
      discordEmail,
      discordToken,
    }).returning();
    return user;
  }

  async updateUserToken(userId: number, discordToken: string): Promise<void> {
    await db.update(users).set({ discordToken }).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
