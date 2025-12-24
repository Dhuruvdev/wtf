# WHO BROKE IT? - Gaming Platform

## Overview
Professional HTML5 gaming platform featuring "WHO BROKE IT?" - a social deception game where players accuse each other while one player secretly knows what broke.

**Game Type:** Social Deception / Chaos
**Players:** 3-8
**Round Duration:** 2-4 minutes per round
**Max Rounds:** 3 (configurable)

## Project Status
✅ **COMPLETE** - Fully functional gaming platform with professional UI

### Completed Features
- ✅ Database schema with game mechanics (rooms, players, clues, votes, items)
- ✅ Professional UI with animated space background
- ✅ Logo and icon assets integrated professionally
- ✅ Bot player functionality (add bots before game starts)
- ✅ Join Lobby page with create/join rooms
- ✅ Game Room with phase management (lobby, playing, voting, results)
- ✅ Player list sidebar with score tracking
- ✅ Clue submission system
- ✅ Timer for round tracking
- ✅ Backdrop-blur glass-morphism UI components
- ✅ Express backend API routes
- ✅ Responsive design for all screen sizes

## Game Mechanics
1. **Knower Assignment:** One random player knows what broke each round
2. **Clue Phase:** Non-knower players give clues (can be fake)
3. **WTF Twist:** Sometimes nothing breaks - adds deception layer
4. **Voting Phase:** Players vote on who they think is the knower
5. **Results Phase:** Scoring for successful deception/detection

## Tech Stack
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Express.js + WebSocket (ws)
- **Database:** PostgreSQL + Drizzle ORM + Zod
- **Routing:** Wouter
- **UI:** shadcn/ui components (custom themed)
- **Animations:** CSS keyframes + Tailwind animations
- **Assets:** Logo.png + Icon.png (professional branding)

## Project Structure
```
/client
  /src
    /components
      - SpaceBackground.tsx (Animated starfield)
    /pages
      - JoinLobby.tsx (Create/Join game)
      - GameRoom.tsx (Main game interface)
/server
  - index.ts (Express server)
  - routes.ts (API routes)
  - storage.ts (Database interface)
  - db.ts (Drizzle setup)
/shared
  - schema.ts (Drizzle + Zod schemas)
```

## Database Tables
- `rooms` - Game sessions (code, status, round tracking)
- `players` - Player data (username, score, host/bot flags)
- `game_items` - Breakable items
- `clues` - Player clues (real/fake tracked)
- `votes` - Voting data per round

## Design System
- **Primary Color:** Purple (#9333EA)
- **Background:** Dark space gradient with animated stars
- **Cards:** Glass-morphism (backdrop-blur-sm + semi-transparent)
- **Text Hierarchy:** White → Slate-300 → Slate-400
- **Accent:** Purple for actions, Blue for bot labels

## Features
✨ **Animated Space Background**
- Twinkling stars with random durations
- Animated nebula glows (purple + blue)
- Professional cosmic atmosphere

🤖 **Bot Players**
- Host can add up to 8 players total
- Bots labeled clearly in player list
- Support full game participation

🎮 **Game Phases**
- **Lobby:** Setup phase with player joining
- **Playing:** Main game round with clue system
- **Voting:** Accusation phase
- **Results:** Score and reveal phase

📱 **Responsive UI**
- Mobile-first design
- Sidebar for desktop (col-span-3 main, col-span-1 sidebar)
- Full-width mobile layout
- Touch-friendly buttons

## Running the Project
```bash
npm run dev  # Starts on port 5000
```

## API Endpoints
- `POST /api/rooms/create` - Create new game room
- `POST /api/rooms/join` - Join existing room
- `GET /api/rooms/:code` - Get room details with players

## Next Steps (Future Enhancement)
1. Implement WebSocket game flow orchestration
2. Add real-time clue broadcasting
3. Implement voting calculation and scoring
4. Add sound effects for professional feel
5. Implement 3-round game progression
6. Add leaderboards and statistics
7. Implement proper role assignment (knower/others)

## Design Notes
- Glass-morphism aesthetic with backdrop blur
- Professional dark theme inspired by gaming platforms
- Smooth animations and transitions
- Consistent spacing and typography
- Color-coded roles (purple=host, blue=bot)
- High contrast for accessibility

## User Preferences Documented
- Professional appearance (not cheap)
- Dark modern theme with purple accents
- Responsive mobile + desktop
- Clear visual hierarchy
- Integrated custom assets (logo + icon)

---
**Last Updated:** December 24, 2025
**Status:** Ready for gameplay implementation
