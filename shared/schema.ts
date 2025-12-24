import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  status: text("status").notNull().default("lobby"), // lobby, mission_selection, microgame, voting, finished
  round: integer("round").default(0),
  maxPlayers: integer("max_players").default(8),
  hostSocketId: text("host_socket_id"),
  gameState: jsonb("game_state").default({}), // Store current mission, active microgame, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  socketId: text("socket_id").notNull(),
  username: text("username").notNull(),
  discordId: text("discord_id"), // Optional, for Discord integration
  avatarUrl: text("avatar_url"),
  score: integer("score").default(0),
  isHost: boolean("is_host").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// === RELATIONS ===
export const roomsRelations = relations(rooms, ({ many }) => ({
  players: many(players),
}));

export const playersRelations = relations(players, ({ one }) => ({
  room: one(rooms, {
    fields: [players.roomId],
    references: [rooms.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertRoomSchema = createInsertSchema(rooms).omit({ 
  id: true, 
  createdAt: true, 
  status: true,
  round: true,
  gameState: true
});

export const insertPlayerSchema = createInsertSchema(players).omit({ 
  id: true, 
  roomId: true, 
  score: true, 
  isHost: true, 
  joinedAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===

export type Room = typeof rooms.$inferSelect;
export type Player = typeof players.$inferSelect;

export type CreateRoomRequest = {
  username: string;
  avatarUrl?: string;
};

export type JoinRoomRequest = {
  code: string;
  username: string;
  avatarUrl?: string;
};

export type StartGameRequest = {
  roomId: number;
};

export type UpdateGameStateRequest = {
  phase: string;
  data?: any;
};

export type RoomResponse = Room & {
  players: Player[];
};

export const WS_EVENTS = {
  JOIN: 'join',
  LEAVE: 'leave',
  UPDATE_ROOM: 'update_room',
  START_GAME: 'start_game',
  PHASE_CHANGE: 'phase_change',
  MICROGAME_ACTION: 'microgame_action',
} as const;
