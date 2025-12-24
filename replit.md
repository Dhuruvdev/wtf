# Who Broke It? - Discord Activity Game

## Project Overview
A real-time multiplayer deception game built with Express, React, PostgreSQL, and WebSocket. Players experience social deception through mini-games with Discord integration and Activity SDK support.

## Recent Updates (2025-12-24)

### Phase 1: Discord OAuth2 Setup ✅
- **Database Schema**: Added `users` table with Discord profile data
  - `discordId` (unique)
  - `discordUsername`, `discordAvatar`, `discordEmail`
  - `discordToken` for API access
- **Backend OAuth Flow**: 
  - `exchangeCodeForToken()`: Handles Discord authorization code exchange
  - `getDiscordUser()`: Fetches authenticated user profile
  - `handleDiscordCallback()`: Creates or updates user in database
  - Route: `GET /auth/discord/callback` - OAuth redirect endpoint
- **Secrets**: DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET (stored securely)

### Phase 2: Activity SDK Initialization ✅
- **DiscordContext** (`client/src/contexts/DiscordContext.tsx`):
  - Manages Discord SDK initialization
  - Handles OAuth login flow
  - Provides user state and loading indicators
  - TypeScript support for global `window.DiscordSDK`
- **Frontend Env**: `VITE_DISCORD_CLIENT_ID` for OAuth flow

### Phase 3: Voice Channel Context Detection ✅
- **VoiceContext** (`client/src/contexts/VoiceContext.tsx`):
  - Tracks current user voice channel context
  - `setVoiceContext()`: Sets active voice channel
  - `clearVoiceContext()`: Cleans up on disconnect
  - Integrated with WebSocket for server awareness
- **WebSocket Support**: `voice_context` message type for channel updates

### Phase 4: Real-time Multiplayer Sync ✅
- **WebSocket Enhancements**:
  - `roomConnections`: Map tracking active connections per room
  - `userVoiceChannels`: Map for voice channel detection
  - `broadcast()`: Sends events to all players in a room
- **useWebSocketSync Hook** (`client/src/hooks/useWebSocketSync.ts`):
  - `send()`: Sends raw WebSocket messages
  - `sendGameAction()`: Broadcasts game events to room
  - `sendVoiceContext()`: Notifies server of voice channel
  - Auto-connect/disconnect lifecycle
- **Message Types**:
  - `join`: Connect to room
  - `voice_context`: Voice channel updates
  - `game_action`: Game state synchronization

## Architecture

### Backend Stack
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Real-time**: WebSocket (ws library)
- **Auth**: Discord OAuth2
- **HTTP Client**: axios

### Frontend Stack
- **Framework**: React with TypeScript
- **Build**: Vite with React plugin
- **Routing**: wouter
- **State**: React Context, Zustand, TanStack Query
- **UI**: shadcn/ui components
- **Styling**: Tailwind CSS

### Database Schema
- **users**: Discord authentication
- **rooms**: Game lobbies
- **players**: Player instances in rooms
- **gameItems**: Objects that can break
- **clues**: Player hints during rounds
- **votes**: Accusation votes

## File Structure
```
src/
├── server/
│   ├── index.ts              # Express server setup
│   ├── routes.ts             # API & WebSocket handlers (Discord OAuth + real-time sync)
│   ├── storage.ts            # Database operations
│   ├── db.ts                 # Drizzle connection
│   └── vite.ts               # Vite setup for dev
├── client/
│   ├── src/
│   │   ├── App.tsx           # Root with Discord + Voice providers
│   │   ├── contexts/
│   │   │   ├── DiscordContext.tsx      # OAuth2 & SDK
│   │   │   └── VoiceContext.tsx        # Voice channel tracking
│   │   ├── hooks/
│   │   │   └── useWebSocketSync.ts     # Real-time multiplayer
│   │   ├── pages/
│   │   │   ├── JoinLobby.tsx
│   │   │   └── GameRoom.tsx
│   │   └── components/
├── shared/
│   └── schema.ts             # Zod + Drizzle types
└── dist/
    └── public/               # Built frontend assets
```

## Development Workflow

### Prerequisites
1. Discord Developer Application with OAuth2 enabled
2. PostgreSQL database (managed by Replit)
3. Node.js 20+ (configured)

### Environment Setup
```bash
# Secrets (in Replit)
DISCORD_CLIENT_ID=your_app_id
DISCORD_CLIENT_SECRET=your_app_secret

# Environment Variables
VITE_DISCORD_CLIENT_ID=your_app_id (for frontend OAuth link)
```

### Running Development Server
```bash
npm run dev        # Starts on port 5000
npm run build      # TypeScript + bundling
npm run check      # Type checking
npm run db:push    # Sync database schema
```

## Key Features Implemented

✅ **Discord OAuth2 Authentication**
- Authorization code flow
- Secure token storage
- User profile sync

✅ **Activity SDK Integration**
- SDK initialization hooks
- Context management
- Ready state tracking

✅ **Voice Channel Detection**
- WebSocket voice context messages
- Per-user channel tracking
- Context cleanup

✅ **Real-time Multiplayer**
- WebSocket broadcast to rooms
- Game action synchronization
- Player presence tracking
- Voice context awareness

## Next Steps for User

1. **Complete Discord App Setup**:
   - Set Redirect URI: `https://{your-replit-domain}/auth/discord/callback`
   - Enable necessary OAuth2 scopes (identify, email, rpc)

2. **Test OAuth Flow**:
   - Login button triggers Discord auth
   - Callback creates/updates user
   - Token stored for API access

3. **Extend Voice Integration**:
   - Implement Discord Activity SDK full initialization
   - Add voice state updates
   - Connect to actual voice channels

4. **Optimize Real-time Sync**:
   - Add message queuing for reliability
   - Implement reconnection logic
   - Add latency compensation

## Deployment

Configuration is set in `replit.ts`:
- **Build**: `npm run build`
- **Run**: `node ./dist/index.cjs`
- **Port**: 5000 (auto-exposed)

## Security Notes
- Discord tokens stored in database with httpOnly cookies
- OAuth code exchange happens server-side
- All secrets managed via Replit Secrets
- WebSocket connections tracked per room

## Tech Decisions
- **WebSocket over HTTP polling**: Lower latency for multiplayer
- **Voice channel detection at WebSocket level**: Tracks Discord context automatically
- **React Context for state**: Lightweight, no additional dependencies
- **Drizzle ORM**: Type-safe database layer with migrations