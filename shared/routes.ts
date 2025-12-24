import { z } from 'zod';
import { insertRoomSchema, insertPlayerSchema, rooms, players } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  rooms: {
    create: {
      method: 'POST' as const,
      path: '/api/rooms',
      input: z.object({
        username: z.string(),
        avatarUrl: z.string().optional(),
      }),
      responses: {
        201: z.object({
          code: z.string(),
          playerId: z.number(),
          socketId: z.string().optional() // Client might need to know their socket ID mapping
        }),
        400: errorSchemas.validation,
      },
    },
    join: {
      method: 'POST' as const,
      path: '/api/rooms/join',
      input: z.object({
        code: z.string(),
        username: z.string(),
        avatarUrl: z.string().optional(),
      }),
      responses: {
        200: z.object({
          roomId: z.number(),
          playerId: z.number(),
        }),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/rooms/:code',
      responses: {
        200: z.custom<typeof rooms.$inferSelect & { players: typeof players.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
