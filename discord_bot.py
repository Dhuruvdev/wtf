import discord
from discord.ext import commands
import aiohttp
import os
from dotenv import load_dotenv
import random

load_dotenv()

# Bot configuration
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.guild_messages = True
intents.direct_messages = True

bot = commands.Bot(command_prefix="!", intents=intents)

# Game API configuration
GAME_API_URL = os.getenv("GAME_API_URL", "http://localhost:5000")
GAME_WEB_URL = os.getenv("GAME_WEB_URL", "https://your-replit-domain.replit.dev")

# Store active games per guild
active_games = {}

# Roast generator with AI bots
def generate_bot_roast(target_username: str) -> str:
    """Generate a brutal roast for AI bots"""
    roasts = [
        f"I'd roast you harder but your internet connection already did that, {target_username}",
        f"Your roasts are like your gameplay - absolutely non-existent",
        f"{target_username}? More like {target_username}-TOTALLY-DESTROYED 💀",
        "That roast was as weak as wet bread, honestly pathetic",
        "I've seen better comebacks from a 1990s dial-up modem",
        f"{target_username} walked so you could run... directly into a WALL",
        "Your jokes are like your ping - completely lagging behind",
        f"I'd explain this roast to you but you'd still not understand, {target_username}",
        "That was so bad, even your ISP is roasting you right now",
        f"{target_username}: Professional Roast Punching Bag since forever"
    ]
    return random.choice(roasts)


@bot.event
async def on_ready():
    print(f"✅ WTF Land Bot ready as {bot.user}")
    # Sync commands with Discord
    await bot.tree.sync()
    print("📋 Slash commands synced")


@bot.tree.command(name="create", description="Create a new WTF Land room")
@discord.app_commands.describe(max_players="Maximum players (2-8, default 4)", mode="Game mode: roast or land")
async def create_room(interaction: discord.Interaction, max_players: int = 4, mode: str = "roast"):
    """Create a new game room"""
    await interaction.response.defer()
    
    if max_players < 2 or max_players > 8:
        await interaction.followup.send("❌ Max players must be between 2 and 8")
        return
    
    if mode.lower() not in ["roast", "land"]:
        await interaction.followup.send("❌ Mode must be 'roast' or 'land'")
        return
    
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "username": interaction.user.name,
                "avatarUrl": interaction.user.avatar.url if interaction.user.avatar else None,
                "maxPlayers": max_players,
                "gameMode": mode.lower()
            }
            
            async with session.post(f"{GAME_API_URL}/api/rooms/create", json=payload) as resp:
                if resp.status != 201:
                    await interaction.followup.send("❌ Failed to create room")
                    return
                
                data = await resp.json()
                room_code = data["code"]
                room_id = data["roomId"]
                
                # Store room reference
                active_games[interaction.guild_id] = {
                    "code": room_code,
                    "id": room_id,
                    "creator": interaction.user.id,
                    "players": [interaction.user.name],
                    "mode": mode.lower()
                }
                
                # Create invite embed
                mode_emoji = "🔥" if mode.lower() == "roast" else "🌍"
                embed = discord.Embed(
                    title=f"{mode_emoji} WTF LAND ROOM CREATED",
                    description=f"A new {mode.lower()} battle game is ready!",
                    color=discord.Color.red() if mode.lower() == "roast" else discord.Color.cyan()
                )
                embed.add_field(name="Room Code", value=f"```{room_code}```", inline=False)
                embed.add_field(name="Game Mode", value=f"{mode.upper()}", inline=True)
                embed.add_field(name="Max Players", value=f"{max_players} players", inline=True)
                embed.add_field(name="Created by", value=interaction.user.mention, inline=True)
                embed.add_field(
                    name="Join Game",
                    value=f"[Click here to join]({GAME_WEB_URL}/room/{room_code})",
                    inline=False
                )
                embed.set_footer(text="Bots with Grok AI will automatically join!" if mode.lower() == "roast" else "")
                
                await interaction.followup.send(embed=embed)
                
    except Exception as e:
        print(f"Error creating room: {e}")
        await interaction.followup.send(f"❌ Error: {str(e)}")


@bot.tree.command(name="join", description="Join an existing WTF Land room")
@discord.app_commands.describe(room_code="Room code to join (e.g., ABC123)")
async def join_room(interaction: discord.Interaction, room_code: str):
    """Join an existing game room"""
    await interaction.response.defer()
    
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "username": interaction.user.name,
                "avatarUrl": interaction.user.avatar.url if interaction.user.avatar else None,
                "code": room_code.upper()
            }
            
            async with session.post(f"{GAME_API_URL}/api/rooms/join", json=payload) as resp:
                if resp.status != 200:
                    await interaction.followup.send(f"❌ Room not found: {room_code}")
                    return
                
                data = await resp.json()
                
                # Update game reference
                if interaction.guild_id in active_games:
                    active_games[interaction.guild_id]["players"].append(interaction.user.name)
                
                embed = discord.Embed(
                    title="✅ JOINED WTF LAND",
                    description=f"{interaction.user.mention} joined the game!",
                    color=discord.Color.green()
                )
                embed.add_field(name="Room Code", value=f"```{room_code.upper()}```", inline=False)
                embed.add_field(
                    name="Play Now",
                    value=f"[Open game]({GAME_WEB_URL}/room/{room_code.upper()})",
                    inline=False
                )
                
                await interaction.followup.send(embed=embed)
                
    except Exception as e:
        print(f"Error joining room: {e}")
        await interaction.followup.send(f"❌ Error: {str(e)}")


@bot.tree.command(name="info", description="Get WTF Land game info")
async def game_info(interaction: discord.Interaction):
    """Show game information"""
    embed = discord.Embed(
        title="🎮 WTF LAND @ thats.wtf",
        description="Roast Battle & Territory-Claiming Games",
        color=discord.Color.purple()
    )
    
    embed.add_field(
        name="🔥 ROAST BATTLE",
        value="```\n"
              "8 players → 2 compete with roasts\n"
              "6 vote for the better roast\n"
              "Losers eliminated each round\n"
              "Winner crowned after 3 rounds\n"
              "AI Bots powered by Grok!\n"
              "```",
        inline=False
    )
    
    embed.add_field(
        name="🌍 LAND.IO",
        value="```\n"
              "WASD/Arrow Keys to move\n"
              "Close loops to claim territory\n"
              "Hit trails = eliminated\n"
              "Highest score in 5 minutes wins\n"
              "```",
        inline=False
    )
    
    embed.add_field(
        name="⚡ Commands",
        value="```\n"
              "/create - Create a new game room\n"
              "/join [code] - Join existing room\n"
              "/invite - Get room invite link\n"
              "/status - Check game status\n"
              "```",
        inline=False
    )
    
    embed.add_field(
        name="👥 Players",
        value="2-8 players per room",
        inline=True
    )
    
    embed.add_field(
        name="⏱️ Duration",
        value="5 minutes per match",
        inline=True
    )
    
    embed.set_footer(text="Made with ❤️ for Discord Activities")
    
    await interaction.response.send_message(embed=embed)


@bot.tree.command(name="invite", description="Get invite link for current room")
async def invite_room(interaction: discord.Interaction):
    """Get the invite link for the current room"""
    if interaction.guild_id not in active_games:
        await interaction.response.send_message(
            "❌ No active room in this server. Use `/create` to start a new game!"
        )
        return
    
    room_code = active_games[interaction.guild_id]["code"]
    invite_url = f"{GAME_WEB_URL}/room/{room_code}"
    
    embed = discord.Embed(
        title="🎮 JOIN WTF LAND",
        description="Click the button below to join!",
        color=discord.Color.purple()
    )
    embed.add_field(name="Room Code", value=f"```{room_code}```", inline=False)
    embed.add_field(name="Direct Link", value=f"[Play Here]({invite_url})", inline=False)
    
    await interaction.response.send_message(embed=embed)


@bot.tree.command(name="status", description="Check current game status")
async def game_status(interaction: discord.Interaction):
    """Check the status of the current game"""
    if interaction.guild_id not in active_games:
        await interaction.response.send_message(
            "❌ No active game. Use `/create` to start!"
        )
        return
    
    game = active_games[interaction.guild_id]
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{GAME_API_URL}/api/rooms/{game['code']}") as resp:
                if resp.status != 200:
                    await interaction.response.send_message("❌ Could not fetch game status")
                    return
                
                room_data = await resp.json()
                players = room_data.get("players", [])
                
                embed = discord.Embed(
                    title="📊 GAME STATUS",
                    color=discord.Color.blue()
                )
                embed.add_field(name="Room Code", value=f"```{game['code']}```", inline=False)
                embed.add_field(name="Players", value=f"{len(players)}/8", inline=True)
                embed.add_field(name="Created by", value=f"<@{game['creator']}>", inline=True)
                
                if players:
                    player_list = ", ".join([p.get("username", "Unknown") for p in players])
                    embed.add_field(name="Joined Players", value=player_list, inline=False)
                
                await interaction.response.send_message(embed=embed)
                
    except Exception as e:
        print(f"Error fetching status: {e}")
        await interaction.response.send_message(f"❌ Error: {str(e)}")


@bot.tree.command(name="help", description="Show WTF Land bot help")
async def help_command(interaction: discord.Interaction):
    """Show help information"""
    embed = discord.Embed(
        title="❓ WTF LAND HELP",
        description="Territory-claiming multiplayer game for Discord",
        color=discord.Color.purple()
    )
    
    embed.add_field(
        name="🎮 Getting Started",
        value="`/create` - Start a new game room\n"
              "`/join [code]` - Join a friend's room\n"
              "`/invite` - Share current room link",
        inline=False
    )
    
    embed.add_field(
        name="🕹️ Gameplay",
        value="**PC**: WASD or Arrow Keys + Space to finalize\n"
              "**Mobile**: Drag to move, tap to finalize\n"
              "**Goal**: Claim most territory in 5 minutes",
        inline=False
    )
    
    embed.add_field(
        name="📋 Useful Commands",
        value="`/status` - Check current game\n"
              "`/info` - Game information\n"
              "`/help` - This message",
        inline=False
    )
    
    embed.add_field(
        name="💡 Tips",
        value="• 2-8 players per room\n"
              "• Close loops to claim territory\n"
              "• Avoid own and opponent trails\n"
              "• Play on Discord voice channels",
        inline=False
    )
    
    await interaction.response.send_message(embed=embed)


# Error handler
@bot.tree.error
async def on_app_command_error(interaction: discord.Interaction, error: discord.app_commands.AppCommandError):
    """Handle command errors"""
    print(f"Command error: {error}")
    try:
        await interaction.response.send_message(f"❌ An error occurred: {str(error)}")
    except:
        pass


# Run the bot
if __name__ == "__main__":
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        print("❌ DISCORD_BOT_TOKEN not set in environment")
        exit(1)
    
    bot.run(token)
