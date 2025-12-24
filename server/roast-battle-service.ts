import { storage } from './storage';
import type { Player } from '@shared/schema';

export class RoastBattleService {
  async initiateBattle(roomId: number, players: Player[]) {
    // Get alive players
    const alivePlayers = players.filter(p => p.isAlive);
    
    if (alivePlayers.length < 2) {
      return null;
    }

    // Select 2 random performers
    const performer1 = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    let performer2 = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    
    while (performer2.id === performer1.id && alivePlayers.length > 1) {
      performer2 = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    }

    const battle = await storage.createRoastBattle(roomId, performer1.id, performer2.id);
    return { battle, performer1, performer2 };
  }

  async processBattleVotes(battleId: number) {
    const votes = await storage.getRoastVotes(battleId);
    const battle = await storage.getRoastBattle(battleId);
    
    if (!battle) return null;

    const votesForPerformer1 = votes.filter(v => v.votedForId === battle.performer1Id).length;
    const votesForPerformer2 = votes.filter(v => v.votedForId === battle.performer2Id).length;

    const winnerId = votesForPerformer1 > votesForPerformer2 
      ? battle.performer1Id 
      : battle.performer2Id;

    await storage.updateRoastBattleWinner(battleId, winnerId, votesForPerformer1, votesForPerformer2);

    // Eliminate loser
    const loserId = winnerId === battle.performer1Id ? battle.performer2Id : battle.performer1Id;
    await storage.updatePlayerAlive(loserId, false);

    return {
      winner: winnerId,
      votesForPerformer1,
      votesForPerformer2,
    };
  }
}

export const roastBattleService = new RoastBattleService();
