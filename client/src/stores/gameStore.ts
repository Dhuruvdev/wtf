import { create } from 'zustand';
import { Room, Player } from '@shared/schema';

export type MicrogameType = 'voice-act' | 'canvas-draw' | 'emoji-relay' | 'bluff-vote';

export interface GameState {
  room: Room | null;
  currentPlayer: Player | null;
  isHost: boolean;
  activeMicrogame: MicrogameType | null;
  microgamePhase: 'playing' | 'voting' | 'results' | null;
  timeRemaining: number;
  votes: Record<number, number>;
  responses: Record<number, any>;
  scores: Record<number, number>;
  
  // Actions
  setRoom: (room: Room | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setActiveMicrogame: (game: MicrogameType | null) => void;
  setMicrogamePhase: (phase: 'playing' | 'voting' | 'results' | null) => void;
  setTimeRemaining: (time: number) => void;
  addVote: (voterId: number, targetId: number) => void;
  addResponse: (playerId: number, response: any) => void;
  resetVotes: () => void;
  resetResponses: () => void;
  updateScore: (playerId: number, points: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  room: null,
  currentPlayer: null,
  isHost: false,
  activeMicrogame: null,
  microgamePhase: null,
  timeRemaining: 0,
  votes: {},
  responses: {},
  scores: {},

  setRoom: (room) => set({ room }),
  setCurrentPlayer: (currentPlayer) => set({ currentPlayer }),
  setActiveMicrogame: (game) => set({ activeMicrogame: game }),
  setMicrogamePhase: (phase) => set({ microgamePhase: phase }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  
  addVote: (voterId, targetId) =>
    set((state) => ({
      votes: { ...state.votes, [voterId]: targetId },
    })),

  addResponse: (playerId, response) =>
    set((state) => ({
      responses: { ...state.responses, [playerId]: response },
    })),

  resetVotes: () => set({ votes: {} }),
  resetResponses: () => set({ responses: {} }),

  updateScore: (playerId, points) =>
    set((state) => ({
      scores: {
        ...state.scores,
        [playerId]: (state.scores[playerId] || 0) + points,
      },
    })),

  resetGame: () =>
    set({
      activeMicrogame: null,
      microgamePhase: null,
      timeRemaining: 0,
      votes: {},
      responses: {},
      scores: {},
    }),
}));
