# WTF Land - Discord Activity Game

## Project Overview
A high-performance multiplayer territory-claiming game built for Discord Activities on voice channels. Players expand their territory by creating trails and closing loops. Built with Phaser 3, Express, React, PostgreSQL, and WebSocket for real-time multiplayer synchronization.

## Latest Update (2025-12-25) - Complete Website Overhaul

### ✅ Completed
- **Removed all old content**: Old roast battle, mini-games, outdated UI
- **New WTF Land branding**: Purple/cyan gradient theme, Press Start 2P retro font
- **Clean landing page**: Simple join/create room interface
- **Game UI overhaul**: Dark theme with gradient backgrounds matching thats.wtf aesthetic
- **Ready for Discord Activities**: Voice channel-compatible multiplayer setup

### 🎮 WTF Land Game Features
- **Territory Claiming**: WASD/Arrow keys to move and create trails
- **Flood-Fill Algorithm**: Intelligent territory claiming via loop closure
- **Player Elimination**: Collision detection with own/opponent trails
- **5-Minute Matches**: Real-time leaderboard tracking
- **2-8 Player Multiplayer**: Bot support for testing
- **Pixel-Perfect Rendering**: Phaser 3 with pixelArt mode enabled
- **Discord Activity Ready**: Voice channel multiplayer sync

## Tech Stack

### Frontend
- **Game Engine**: Phaser 3.90.0 (2D pixel art)
- **Framework**: React 18.3.1 + TypeScript
- **Rendering**: Canvas API with Phaser Graphics
- **UI**: shadcn/ui + Tailwind CSS (dark theme)
- **Build**: Vite with React plugin
- **State**: React Context, Zustand, TanStack Query

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Real-time**: WebSocket (ws library)
- **Auth**: Discord OAuth2
- **Physics**: Matter.js 0.20.0

### Game Libraries
- **phaser**: 3.90.0 (2D game engine)
- **matter-js**: 0.20.0 (physics)
- **konva**: 10.0.12 (rendering optimization)

## File Structure
```
src/
├── server/
│   ├── index.ts                    # Express server
│   ├── routes.ts                   # API + WebSocket + Land.io routes
│   ├── storage.ts                  # Database operations
│   ├── land-io-service.ts          # Game state management
│   └── db.ts                       # Drizzle connection
├── client/
│   ├── src/
│   │   ├── App.tsx                 # Root with providers
│   │   ├── pages/
│   │   │   ├── JoinLobby.tsx       # Landing with WTF Land branding
│   │   │   └── GameRoom.tsx        # Lobby + game UI
│   │   ├── games/
│   │   │   └── LandIOScene.ts      # Phaser scene (800x600)
│   │   ├── components/
│   │   │   └── LandIOGame.tsx      # React wrapper
│   │   └── lib/                    # Utilities
│   └── index.css                   # Global styles
├── shared/
│   └── schema.ts                   # Zod types
└── dist/                           # Built output
```

## Branding
**WTF Land @ thats.wtf**
- Purple to Cyan gradient (#a855f7 → #06b6d4)
- Press Start 2P font for retro pixel aesthetic
- Dark theme with purple borders
- Consistent branding on all screens

## Game API

### Room Management
- `POST /api/rooms/create` - Create new room
- `POST /api/rooms/join` - Join existing room
- `GET /api/rooms/:code` - Get room details + players
- `POST /api/rooms/:roomId/add-ai` - Add bot player

### WTF Land Game
- `POST /api/rooms/:roomId/start-land-io` - Start game
- `POST /api/rooms/:roomId/game-action` - Send player action
- `GET /api/rooms/:roomId/game-state` - Fetch game state

## Development

### Running
```bash
npm run dev          # Start on port 5000
npm run build        # Optimize build
npm run check        # Type check
```

### Environment
```bash
DISCORD_CLIENT_ID=your_id
DISCORD_CLIENT_SECRET=your_secret
VITE_DISCORD_CLIENT_ID=your_id
```

## Game Mechanics

### Gameplay
1. **Start**: 2-8 players in room
2. **Move**: WASD/Arrow keys to create trails
3. **Claim**: Close loops to claim territory
4. **Compete**: Avoid collisions, maximize score
5. **Win**: Highest territory after 5 minutes

### Territory System
- Each player starts with 60x60 pixel base territory
- Creating loops claims enclosed area via flood-fill
- Hit own trail or opponent's trail = eliminated
- Eliminated territory becomes unclaimed

### Score
- 1 point = 1 pixel of territory
- Territory transfers on elimination
- Real-time leaderboard updates

## Discord Activity Integration (Ready)
- Voice channel compatible
- Real-time multiplayer sync via WebSocket
- Bot-friendly architecture for Setu bot integration
- Supports concurrent games

## Performance
- **Phaser pixelArt mode**: Crisp pixel rendering
- **Efficient collision detection**: O(n) trail checking
- **Flood-fill capped**: Territory limited to 2000 cells
- **WebSocket broadcasting**: <100ms sync latency
- **Bundle size**: 1.4MB (Phaser + game code)

## Removed Content
- ❌ Roast Battle game
- ❌ Mini-games (Voice Act, Canvas Draw, Emoji Relay, Bluff Vote)
- ❌ Old dark blue UI theme
- ❌ Arcade background components
- ❌ Game guides and tutorials
- ✅ Replaced with: Clean WTF Land landing page and focused game

## Next Steps
1. 📋 Discord bot setup (Setu bot configuration)
2. 📋 Activity SDK voice channel binding
3. 📋 Multi-game concurrent support
4. 📋 Sound effects and animations
5. 📋 Mobile touch controls refinement
6. 📋 Production deployment

## Notes
- LSP diagnostics are for Phaser types (runtime compatible)
- Server fully operational and serving game
- All old game routes removed
- Clean, maintainable codebase ready for Discord Activity integration

## User Preferences
- Pixel-perfect art style
- Fast-paced competitive gameplay
- Dark theme with purple/cyan branding
- Real-time multiplayer focus
- Ready for Discord Activities on voice channels

## 🤖 Discord Bot Integration

### Bot Setup

#### 1. Create Discord Bot
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "WTF Land Bot"
4. Go to "Bot" section → Click "Add Bot"
5. Copy the TOKEN and set it as `DISCORD_BOT_TOKEN` env var
6. Enable "Message Content Intent"
7. Go to OAuth2 → URL Generator
8. Scopes: `bot`
9. Permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
10. Copy generated URL and invite bot to your server

#### 2. Environment Setup
```bash
DISCORD_BOT_TOKEN=your_bot_token_here
GAME_API_URL=http://localhost:5000
GAME_WEB_URL=https://your-replit-domain.replit.dev
```

#### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 4. Run Bot (Separate Terminal)
```bash
python discord_bot.py
```

### Bot Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/create [max_players]` | Create new game room | `/create 4` |
| `/join [room_code]` | Join existing room | `/join ABC123` |
| `/invite` | Get room invite link | `/invite` |
| `/status` | Check game status | `/status` |
| `/info` | Game information | `/info` |
| `/help` | Show help | `/help` |

### Features
- ✅ Slash commands for easy game management
- ✅ Automatic room creation with shareable codes
- ✅ Player tracking and status updates
- ✅ Embed-based UI with rich formatting
- ✅ Direct links to game web interface
- ✅ Multi-guild support (multiple servers)

### Workflow
1. User runs `/create` in Discord → Bot creates room
2. Bot sends room code + direct play link
3. Players can `/join` or click link
4. All players land in game room together
5. Bot tracks game status with `/status`

### Architecture
- **discord_bot.py**: Slash commands + API integration
- **aiohttp**: Async HTTP client for game API calls
- **discord.py 2.3**: Latest slash command support
- **Embeds**: Rich Discord message formatting
