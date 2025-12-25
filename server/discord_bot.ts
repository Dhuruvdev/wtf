import { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  SlashCommandBuilder, 
  ChatInputCommandInteraction 
} from 'discord.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const GAME_API_URL = process.env.GAME_API_URL || 'http://localhost:5000';
const GAME_WEB_URL = process.env.GAME_WEB_URL || `https://${process.env.REPLIT_SLUG}.${process.env.REPLIT_DEV_DOMAIN}`;

const activeGames = new Map<string, any>();

client.once('clientReady', async () => {
  console.log(`✅ Discord Bot logged in as ${client.user?.tag}`);
  
  const commands = [
    new SlashCommandBuilder()
      .setName('create')
      .setDescription('Create a new WTF Land room')
      .addIntegerOption(opt => opt.setName('max_players').setDescription('Max players (2-8)').setMinValue(2).setMaxValue(8))
      .addStringOption(opt => opt.setName('mode').setDescription('Game mode').addChoices(
        { name: 'Roast Battle', value: 'roast' },
        { name: 'Land.io', value: 'land' }
      )),
    new SlashCommandBuilder()
      .setName('join')
      .setDescription('Join a WTF Land room')
      .addStringOption(opt => opt.setName('code').setDescription('Room code').setRequired(true)),
    new SlashCommandBuilder()
      .setName('info')
      .setDescription('Get game information'),
    new SlashCommandBuilder()
      .setName('status')
      .setDescription('Check current game status'),
  ];

  try {
    await client.application?.commands.set(commands);
    console.log('📋 Slash commands registered');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'create') {
    await handleCreate(interaction);
  } else if (commandName === 'join') {
    await handleJoin(interaction);
  } else if (commandName === 'info') {
    await handleInfo(interaction);
  } else if (commandName === 'status') {
    await handleStatus(interaction);
  }
});

async function handleCreate(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const maxPlayers = interaction.options.getInteger('max_players') || 4;
  const mode = interaction.options.getString('mode') || 'roast';

  try {
    const response = await axios.post(`${GAME_API_URL}/api/rooms/create`, {
      username: interaction.user.username,
      avatarUrl: interaction.user.displayAvatarURL(),
      maxPlayers,
      gameMode: mode
    });

    const { code, roomId } = response.data;
    activeGames.set(interaction.guildId!, { code, roomId, mode });

    const embed = new EmbedBuilder()
      .setTitle(`${mode === 'roast' ? '🔥' : '🌍'} WTF LAND ROOM CREATED`)
      .setDescription(`A new ${mode} battle game is ready!`)
      .setColor(mode === 'roast' ? 0xFF0000 : 0x00FFFF)
      .addFields(
        { name: 'Room Code', value: `\`\`\`${code}\`\`\`` },
        { name: 'Join Game', value: `[Click here to join](${GAME_WEB_URL}/room/${code})` }
      );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    await interaction.editReply('❌ Failed to create room');
  }
}

async function handleJoin(interaction: ChatInputCommandInteraction) {
  const code = interaction.options.getString('code', true).toUpperCase();
  await interaction.reply({
    content: `✅ Join the game here: ${GAME_WEB_URL}/room/${code}`,
    ephemeral: true
  });
}

async function handleInfo(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle('🎮 WTF LAND')
    .setDescription('Multiplayer Battle Games')
    .addFields(
      { name: '🔥 ROAST BATTLE', value: 'Eliminate opponents with brutal roasts!' },
      { name: '🌍 LAND.IO', value: 'Claim territory and dominate the map!' }
    )
    .setColor(0x800080);
  await interaction.reply({ embeds: [embed] });
}

async function handleStatus(interaction: ChatInputCommandInteraction) {
  const game = activeGames.get(interaction.guildId!);
  if (!game) {
    return interaction.reply('❌ No active game in this server.');
  }
  await interaction.reply(`📊 Current Room: **${game.code}** (${game.mode})`);
}

const token = process.env.DISCORD_BOT_TOKEN;
if (token) {
  client.login(token);
} else {
  console.error('❌ DISCORD_BOT_TOKEN is not set');
}
