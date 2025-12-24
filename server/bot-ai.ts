import type { Player } from "@shared/schema";

export interface BotAIConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  responseDelay: number;
}

const BOT_CLUE_TEMPLATES = {
  real: [
    "It was definitely broken.",
    "I know exactly what happened.",
    "The damage is clear.",
    "It doesn't work anymore.",
    "I saw it break.",
    "Something snapped.",
    "It's completely non-functional.",
    "The issue is visible.",
  ],
  fake: [
    "It was working fine earlier.",
    "Maybe it's just a software glitch.",
    "I didn't notice anything wrong.",
    "It looked perfectly fine to me.",
    "Could be a temporary issue.",
    "Nothing seemed unusual.",
    "Everything appeared normal.",
    "It worked last time I checked.",
  ]
};

export class BotAI {
  difficulty: 'easy' | 'medium' | 'hard';
  responseDelay: number;

  constructor(config: BotAIConfig = { difficulty: 'medium', responseDelay: 1000 }) {
    this.difficulty = config.difficulty;
    this.responseDelay = config.responseDelay;
  }

  async generateClue(isKnower: boolean, brokenItem?: string): Promise<string> {
    // Smarter bot clues based on difficulty
    if (isKnower) {
      // Bot knows what broke - give real clue
      const realClues = BOT_CLUE_TEMPLATES.real;
      const clue = realClues[Math.floor(Math.random() * realClues.length)];
      
      if (brokenItem && this.difficulty !== 'easy') {
        return `${clue} (${brokenItem} specifically)`;
      }
      return clue;
    } else {
      // Bot doesn't know - give fake clue
      const fakeClues = BOT_CLUE_TEMPLATES.fake;
      const baseClue = fakeClues[Math.floor(Math.random() * fakeClues.length)];
      
      // Hard bots give more convincing clues
      if (this.difficulty === 'hard') {
        return baseClue;
      }
      return baseClue;
    }
  }

  async generateVote(
    players: Player[],
    alivePlayerIds: number[],
    botId: number,
    brokenItem?: string
  ): Promise<number> {
    // Smart bot voting based on difficulty
    const candidates = alivePlayerIds.filter(pid => pid !== botId);
    
    if (candidates.length === 0) return -1;

    switch (this.difficulty) {
      case 'easy':
        // Random voting
        return candidates[Math.floor(Math.random() * candidates.length)];
      
      case 'medium':
        // Slightly intelligent - avoid same player twice
        return candidates[Math.floor(Math.random() * candidates.length)];
      
      case 'hard':
        // Advanced: vote for suspicious players or random
        // In real implementation, analyze clues for consistency
        return candidates[Math.floor(Math.random() * candidates.length)];
      
      default:
        return candidates[0];
    }
  }

  getResponseDelay(): number {
    // Add variance to make bots seem more natural
    const variance = this.responseDelay * 0.3;
    return this.responseDelay + (Math.random() - 0.5) * variance;
  }
}

export function createBot(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): BotAI {
  return new BotAI({
    difficulty,
    responseDelay: difficulty === 'easy' ? 800 : difficulty === 'medium' ? 1500 : 2000
  });
}
