# WHO BROKE IT? - Gaming Platform

## Overview
Professional HTML5 gaming platform featuring "WHO BROKE IT?" - a social deception game where players accuse each other while one player secretly knows what broke.

**Game Type:** Social Deception / Chaos
**Players:** 3-8
**Round Duration:** 2-4 minutes per round
**Max Rounds:** 3 (configurable)

## Project Status
- ✅ Database schema updated with game mechanics
- ✅ Professional UI with gradient dark theme
- ✅ Frontend pages: JoinLobby, GameRoom
- ✅ Game state management (phases: lobby, playing, voting, results)
- 🔄 Backend game logic implementation in progress
- ⚠️ WebSocket real-time multiplayer in progress

## Game Mechanics
1. **Knower Assignment:** One random player knows what broke each round
2. **Clue Phase:** Non-knower players give clues (can be fake)
3. **WTF Twist:** Sometimes nothing breaks - adds deception layer
4. **Voting Phase:** Players vote on who they think is the knower
5. **Results Phase:** Scoring for successful deception

## Tech Stack
- Frontend: React 18 + TypeScript + Tailwind CSS
- Backend: Express.js + WebSocket (ws)
- Database: PostgreSQL + Drizzle ORM
- Routing: Wouter
- UI Components: shadcn/ui (custom styled)

## Project Structure
```
/client
  /src
    /pages
      - JoinLobby.tsx (Create/Join game)
      - GameRoom.tsx (Main game interface)
    /components (shadcn UI + custom)
/server
  - index.ts (Express server)
  - routes.ts (API + WebSocket)
  - storage.ts (Database interface)
  - db.ts (Drizzle setup)
/shared
  - schema.ts (Drizzle + Zod schemas)
  - routes.ts (API routes definition)
```

## Database Tables
- `rooms` - Game sessions with code/status/round tracking
- `players` - Player data (username, score, role)
- `game_items` - Breakable items in game
- `clues` - Player clues (real/fake tracked)
- `votes` - Voting data per round

## Color Scheme
- **Primary:** Purple (#9333EA)
- **Background:** Dark slate gradient
- **Cards:** Semi-transparent slate-800
- **Text:** White/slate-300/slate-400 (hierarchy)

## Next Steps
1. Implement WebSocket multiplayer game flow
2. Add game logic for item selection and knower assignment
3. Create voting calculation and scoring system
4. Add sound effects and animations for professional feel
5. Implement 3-round game progression

## User Preferences
- Professional, non-cheap appearance
- Dark modern theme with purple accents
- Responsive design for mobile/desktop
- Clear game state communication
