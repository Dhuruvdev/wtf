import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  discordUsername: text("discord_username").notNull(),
  discordDiscriminator: text("discord_discriminator"),
  discordAvatar: text("discord_avatar"),
  discordEmail: text("discord_email"),
  discordToken: text("discord_token").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  status: text("status").notNull().default("lobby"), // lobby, playing, voting, results, finished
  round: integer("round").default(0),
  maxRounds: integer("max_rounds").default(3),
  maxPlayers: integer("max_players").default(8),
  hostId: integer("host_id"),
  knowerPlayerId: integer("knower_player_id"), // Player who knows what broke
  brokenItemId: integer("broken_item_id"),
  somethingBroke: boolean("something_broke").default(true), // WTF twist - sometimes nothing broke
  roundStartTime: timestamp("round_start_time"),
  gameState: jsonb("game_state").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  score: integer("score").default(0),
  isHost: boolean("is_host").default(false),
  isBot: boolean("is_bot").default(false),
  isAlive: boolean("is_alive").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameItems = pgTable("game_items", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull(),
  name: text("name").notNull(), // What broke (e.g., "Lamp", "Phone", "Coffee Cup")
  category: text("category").notNull(), // office, home, tech, etc.
});

export const clues = pgTable("clues", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  playerId: integer("player_id").notNull(),
  clueText: text("clue_text").notNull(),
  isFake: boolean("is_fake").default(true), // true = fake clue, false = real clue (knower only)
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  roundId: integer("round_id").notNull(),
  voterId: integer("voter_id").notNull(),
  accusedId: integer("accused_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const roomsRelations = relations(rooms, ({ many, one }) => ({
  players: many(players),
  items: many(gameItems),
  clues: many(clues),
  votes: many(votes),
}));

export const playersRelations = relations(players, ({ one }) => ({
  room: one(rooms, {
    fields: [players.roomId],
    references: [rooms.id],
  }),
}));

export const gameItemsRelations = relations(gameItems, ({ one }) => ({
  room: one(rooms, {
    fields: [gameItems.roomId],
    references: [rooms.id],
  }),
}));

export const cluesRelations = relations(clues, ({ one }) => ({
  player: one(players, {
    fields: [clues.playerId],
    references: [players.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  voter: one(players, {
    fields: [votes.voterId],
    references: [players.id],
  }),
  accused: one(players, {
    fields: [votes.accusedId],
    references: [players.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  rooms: many(rooms),
}));

export const roomsRelationsWithUser = relations(rooms, ({ many, one }) => ({
  players: many(players),
  items: many(gameItems),
  clues: many(clues),
  votes: many(votes),
  host: one(users, {
    fields: [rooms.hostId],
    references: [users.id],
  }),
}));

// === SCHEMAS ===
export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  status: true,
  round: true,
  gameState: true,
  knowerPlayerId: true,
  brokenItemId: true,
  roundStartTime: true,
  somethingBroke: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  roomId: true,
  score: true,
  isHost: true,
  isBot: true,
  createdAt: true,
});

export const insertGameItemSchema = createInsertSchema(gameItems).omit({
  id: true,
});

export const insertClueSchema = createInsertSchema(clues).omit({
  id: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

// === TYPES ===
export type Room = typeof rooms.$inferSelect;
export type Player = typeof players.$inferSelect;
export type GameItem = typeof gameItems.$inferSelect;
export type Clue = typeof clues.$inferSelect;
export type Vote = typeof votes.$inferSelect;

export const WS_EVENTS = {
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  GAME_STARTED: 'game_started',
  START_GAME: 'start_game',
  PHASE_CHANGE: 'phase_change',
  ROUND_START: 'round_start',
  ITEM_BROKEN: 'item_broken',
  CLUE_PHASE: 'clue_phase',
  CLUE_SUBMITTED: 'clue_submitted',
  VOTING_PHASE: 'voting_phase',
  VOTE_SUBMITTED: 'vote_submitted',
  ROUND_RESULTS: 'round_results',
  GAME_OVER: 'game_over',
  AI_JOINED: 'ai_joined',
} as const;

// === ZODS ===
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
