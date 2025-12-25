import mongoose from "mongoose";
import { Room, User, type IRoom, type IUser, type IPlayer } from "@shared/schema";
import { nanoid } from "nanoid";

export class DatabaseStorage {
  constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is required");
    mongoose.connect(uri);
  }

  async createRoom(hostId?: string): Promise<IRoom> {
    const code = nanoid(4).toUpperCase();
    const room = await Room.create({ code, hostId });
    return room.toObject() as IRoom;
  }

  async getRoomByCode(code: string): Promise<IRoom | undefined> {
    const room = await Room.findOne({ code });
    return room ? (room.toObject() as IRoom) : undefined;
  }

  async getRoom(id: string): Promise<IRoom | undefined> {
    const room = await Room.findById(id);
    return room ? (room.toObject() as IRoom) : undefined;
  }

  async addPlayer(roomId: string, player: Partial<IPlayer>): Promise<IPlayer> {
    const room = await Room.findById(roomId);
    if (!room) throw new Error("Room not found");
    
    // Check if player already exists by username to avoid duplicates
    const existingPlayer = room.players.find(p => p.username === player.username);
    if (existingPlayer) return existingPlayer.toObject() as IPlayer;

    room.players.push(player);
    await room.save();
    return room.players[room.players.length - 1].toObject() as IPlayer;
  }

  async getPlayers(roomId: string): Promise<IPlayer[]> {
    const room = await Room.findById(roomId);
    return room ? (room.players.toObject() as IPlayer[]) : [];
  }

  async updateRoomStatus(roomId: string, status: string): Promise<void> {
    await Room.findByIdAndUpdate(roomId, { status });
  }

  async addAIPlayer(roomId: string): Promise<IPlayer> {
    const aiNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma'];
    const randomName = aiNames[Math.floor(Math.random() * aiNames.length)];
    return this.addPlayer(roomId, { username: randomName, isBot: true });
  }

  async getUserByDiscordId(discordId: string): Promise<IUser | undefined> {
    const user = await User.findOne({ discordId });
    return user ? (user.toObject() as IUser) : undefined;
  }

  async createUser(data: Partial<IUser>): Promise<IUser> {
    const user = await User.create(data);
    return user.toObject() as IUser;
  }

  async updateUserToken(userId: string, discordToken: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { discordToken });
  }
}

export const storage = new DatabaseStorage();
