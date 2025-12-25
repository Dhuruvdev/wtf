import { Schema, model } from "mongoose";
import { z } from "zod";

// === MONGOOSE SCHEMAS ===

const UserSchema = new Schema({
  discordId: { type: String, required: true, unique: true },
  discordUsername: { type: String, required: true },
  discordAvatar: String,
  discordEmail: String,
  discordToken: { type: String, required: true },
}, { timestamps: true });

const PlayerSchema = new Schema({
  username: { type: String, required: true },
  avatarUrl: String,
  score: { type: Number, default: 0 },
  isHost: { type: Boolean, default: false },
  isBot: { type: Boolean, default: false },
  isAlive: { type: Boolean, default: true },
});

const RoomSchema = new Schema({
  code: { type: String, required: true, unique: true },
  status: { type: String, default: "lobby" },
  round: { type: Number, default: 0 },
  maxRounds: { type: Number, default: 3 },
  maxPlayers: { type: Number, default: 8 },
  hostId: { type: Schema.Types.ObjectId, ref: 'User' },
  players: [PlayerSchema],
  gameState: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// === MODELS ===
export const User = model("User", UserSchema);
export const Room = model("Room", RoomSchema);

// === ZOD SCHEMAS (for validation) ===
export const insertUserSchema = z.object({
  discordId: z.string(),
  discordUsername: z.string(),
  discordAvatar: z.string().optional(),
  discordEmail: z.string().optional(),
  discordToken: z.string(),
});

export const insertRoomSchema = z.object({
  maxPlayers: z.number().optional(),
});

export const insertPlayerSchema = z.object({
  username: z.string(),
  avatarUrl: z.string().optional(),
});

// === TYPES ===
export type IUser = {
  _id: any;
  discordId: string;
  discordUsername: string;
  discordAvatar?: string;
  discordEmail?: string;
  discordToken: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IPlayer = {
  _id: any;
  username: string;
  avatarUrl?: string;
  score: number;
  isHost: boolean;
  isBot: boolean;
  isAlive: boolean;
};

export type IRoom = {
  _id: any;
  code: string;
  status: string;
  round: number;
  maxRounds: number;
  maxPlayers: number;
  hostId?: any;
  players: IPlayer[];
  gameState: any;
  createdAt?: Date;
  updatedAt?: Date;
};

export const WS_EVENTS = {
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  START_GAME: 'start_game',
  GAME_OVER: 'game_over',
  AI_JOINED: 'ai_joined',
} as const;
