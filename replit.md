# Land.io Game - thats.wtf Edition

## Project Overview
A real-time multiplayer territory-claiming game built with Phaser 3, Express, React, PostgreSQL, and WebSocket. Players expand their territory by creating trails and closing loops to claim land. Features Discord integration, pixel-perfect rendering, and high-performance game loop.

## Latest Update (2025-12-25)

### Land.io Game Engine Implementation ✅
- **Phaser 3 Game Scene**: Pixel-perfect 2D rendering with optimized canvas
  - Trail system with collision detection
  - Territory management using flood-fill algorithm
  - Real-time player synchronization
  - 5-minute match timer with leaderboard tracking
- **Game Mechanics**:
  - WASD/Arrow keys to move and create trails
  - Space to finalize territory claims
  - Mouse/touch controls for mobile
  - Player elimination on trail collision
  - Automatic territory transfer on elimination
- **thats.wtf Branding**: Integrated throughout UI with purple accent color

### Frontend Architecture
- **LandIOScene.ts**: Phaser game engine with physics, rendering, and state management
- **LandIOGame.tsx**: React wrapper with game lifecycle and HUD overlay
- **GameRoom.tsx**: Lobby, game lobby, and results screens with player management
- **Features**:
  - Bot player addition for testing
  - Real-time game state synchronization
  - Score tracking and leaderboard ranking
  - Responsive pixel art UI matching Land.io aesthetic

### Backend Game Service
- **server/routes.ts**: 
  - `POST /api/rooms/:roomId/start-land-io` - Initialize game
  - `POST /api/rooms/:roomId/game-action` - Sync player actions
  - `GET /api/rooms/:roomId/game-state` - Fetch current state
- **server/land-io-service.ts**: Game state management (planned)
- **WebSocket Broadcasting**: Real-time updates to all players in room

### Performance Optimizations
- **Phaser Rendering**: pixelArt: true for crisp pixel-perfect visuals
- **Efficient Collision Detection**: Trail checking with spatial awareness
- **Flood-Fill Territory**: Optimized territory claiming algorithm
- **Canvas Rendering**: GPU-accelerated with fallback support
- **Bundle**: Phaser (3.90.0), Matter.js (0.20.0), Konva (10.0.12)

## Tech Stack

### Frontend
- **Game Engine**: Phaser 3.90.0 (2D, pixel art optimized)
- **Rendering**: Konva.js 10.0.12, Canvas API
- **Physics**: Matter.js 0.20.0
- **Framework**: React 18.3.1 with TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **Routing**: wouter
- **Build**: Vite with React plugin

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Real-time**: WebSocket (ws library)
- **Auth**: Discord OAuth2
- **HTTP Client**: axios

### Libraries
- **Advanced Game Dev**: phaser, matter-js, konva
- **State Management**: Zustand, React Context
- **Query**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Styling**: Tailwind CSS + shadcn/ui

## File Structure
```
src/
├── server/
│   ├── index.ts                    # Express server + HTTP setup
│   ├── routes.ts                   # API endpoints + WebSocket + Land.io routes
│   ├── storage.ts                  # Database operations
│   ├── land-io-service.ts          # Game state management
│   └── db.ts                       # Drizzle connection
├── client/
│   ├── src/
│   │   ├── App.tsx                 # Root with providers
│   │   ├── main.tsx                # Entry point
│   │   ├── games/
│   │   │   └── LandIOScene.ts      # Phaser game scene (pixel art, trails, territory)
│   │   ├── components/
│   │   │   ├── LandIOGame.tsx      # React wrapper for Phaser game
│   │   │   └── ...other components
│   │   ├── pages/
│   │   │   ├── GameRoom.tsx        # Lobby + game UI (with thats.wtf branding)
│   │   │   └── JoinLobby.tsx
│   │   └── lib/                    # Utilities
│   └── index.css                   # Global styles
├── shared/
│   └── schema.ts                   # Zod + Drizzle types
└── dist/
    └── public/                     # Built frontend
```

## Game Mechanics

### Core Loop
1. **Lobby Phase**: Players join room (max 8)
2. **Game Start**: Players spawn with initial territory (60x60 pixel square)
3. **Expansion**: WASD to move and create trails
4. **Territory Claim**: Space bar or loop closure to finalize territory
5. **Elimination**: Hit own trail or opponent's active trail = eliminated
6. **Territory Transfer**: Eliminated player's land becomes unclaimed
7. **Victory**: 5-minute timer ends - highest score wins

### Controls
- **PC**: WASD/Arrow keys + Space
- **Mobile**: Drag to move, tap to finalize
- **Victory Condition**: Highest territory score after 5 minutes

## API Endpoints

### Game Management
- `POST /api/rooms/create` - Create room
- `POST /api/rooms/join` - Join room
- `GET /api/rooms/:code` - Get room + players
- `POST /api/rooms/:roomId/add-ai` - Add bot player

### Land.io Game
- `POST /api/rooms/:roomId/start-land-io` - Start game with players
- `POST /api/rooms/:roomId/game-action` - Send player action (territory claim, elimination)
- `GET /api/rooms/:roomId/game-state` - Fetch current game state

## Branding
**thats.wtf Edition**
- Purple (#a855f7) accent color
- Integrated in header, lobby, and game HUD
- Press Start 2P font for retro pixel aesthetic
- Consistent across all game screens

## Development Workflow

### Running
```bash
npm run dev          # Start dev server on port 5000
npm run build        # Build for production
npm run check        # TypeScript type checking
npm run db:push      # Sync database schema
```

### Environment
```bash
# Secrets (Replit)
DISCORD_CLIENT_ID=your_id
DISCORD_CLIENT_SECRET=your_secret

# Frontend env
VITE_DISCORD_CLIENT_ID=your_id
```

## Performance Notes
- **Phaser pixelArt mode**: Disables antialiasing for crisp pixel rendering
- **Flood-fill capped**: Territory limited to 2000 cells for performance
- **Trail checking**: Optimized collision detection with O(n) algorithm
- **WebSocket**: Real-time sync with broadcast to all players in room
- **Canvas API**: Fallback rendering if WebGL unavailable

## Next Steps
1. ✅ Implement Land.io core mechanics (trail, territory, collision)
2. ✅ Add Phaser game scene with pixel art rendering
3. ✅ WebSocket real-time multiplayer sync
4. ✅ Add thats.wtf branding throughout UI
5. 📋 Test with multiple players
6. 📋 Optimize performance for 8+ concurrent games
7. 📋 Add sound effects and animations
8. 📋 Deploy to production

## Technical Decisions
- **Phaser over Pixi/Babylon**: Complete 2D game framework with built-in features
- **Flood-fill for territory**: Simple, efficient spatial claiming algorithm
- **WebSocket broadcast**: Lower latency than HTTP polling for multiplayer
- **Canvas + Graphics API**: Cross-browser compatibility with performance
- **React + TypeScript**: Type-safe component architecture with hot reload

## Known Limitations
- LSP diagnostics for Phaser types (runtime compatible)
- Territory capped at 2000 cells to prevent memory issues
- 8 player limit per room (configurable)
- 5-minute match duration (hardcoded)

## User Preferences & Notes
- Pixel-perfect art style matching Land.io theme
- Fast-paced competitive gameplay
- Clean, retro UI with modern React stack
- WebSocket for seamless real-time multiplayer
