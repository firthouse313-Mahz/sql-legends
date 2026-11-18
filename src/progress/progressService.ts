// Save/resume for a student's progress through SQL Legends — same pattern
// as Python Legends' progressService.ts, with its own storage key so the
// two games' local saves never collide.

import { WORLDS, getWorld, type LevelDef, type WorldDef, type PathwayChoice } from '../curriculum/worlds';

export type LevelStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'coming_soon';

export interface ProgressState {
  pathway: PathwayChoice;
  startedLevelIds: string[];
  completedLevelIds: string[];
  bossesCleared: string[];
  totalXp: number;
  totalCoins: number;
}

const STORAGE_KEY = 'sql-legends:progress:v1';

function defaultState(): ProgressState {
  return { pathway: 'cs', startedLevelIds: [], completedLevelIds: [], bossesCleared: [], totalXp: 0, totalCoins: 0 };
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function saveState(state: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort only; progress just won't persist this session.
  }
}

let state = loadState();
type Listener = () => void;
const listeners = new Set<Listener>();
function notify() {
  listeners.forEach((l) => l());
}

export const progressService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): ProgressState {
    return { ...state };
  },

  hydrate(saved: ProgressState | null) {
    if (!saved) return;
    state = { ...defaultState(), ...saved };
    saveState(state);
    notify();
  },

  getPathway(): PathwayChoice {
    return state.pathway;
  },

  setPathway(pathway: PathwayChoice) {
    state = { ...state, pathway };
    saveState(state);
    notify();
  },

  getTotalXp(): number {
    return state.totalXp;
  },

  getTotalCoins(): number {
    return state.totalCoins;
  },

  markStarted(levelId: string) {
    if (state.startedLevelIds.includes(levelId)) return;
    state = { ...state, startedLevelIds: [...state.startedLevelIds, levelId] };
    saveState(state);
    notify();
  },

  isCompleted(levelId: string): boolean {
    return state.completedLevelIds.includes(levelId);
  },

  completeLevel(levelId: string, rewardXp: number, rewardCoins: number) {
    if (state.completedLevelIds.includes(levelId)) return;
    state = {
      ...state,
      completedLevelIds: [...state.completedLevelIds, levelId],
      totalXp: state.totalXp + rewardXp,
      totalCoins: state.totalCoins + rewardCoins,
    };
    saveState(state);
    notify();
  },

  isBossCleared(worldId: string): boolean {
    return state.bossesCleared.includes(worldId);
  },

  clearBoss(worldId: string, rewardXp: number, rewardCoins: number) {
    if (state.bossesCleared.includes(worldId)) return;
    state = {
      ...state,
      bossesCleared: [...state.bossesCleared, worldId],
      totalXp: state.totalXp + rewardXp,
      totalCoins: state.totalCoins + rewardCoins,
    };
    saveState(state);
    notify();
  },

  getLevelStatus(level: LevelDef): LevelStatus {
    const world = getWorld(level.worldId);
    if (!world?.implemented || !level.implemented) return 'coming_soon';
    if (state.completedLevelIds.includes(level.id)) return 'completed';
    const playable = world.levels.filter((l) => l.pathway === 'common' || l.pathway === state.pathway);
    const idx = playable.findIndex((l) => l.id === level.id);
    if (idx === 0) return state.startedLevelIds.includes(level.id) ? 'in_progress' : 'unlocked';
    const previous = playable[idx - 1];
    const previousDone = previous ? state.completedLevelIds.includes(previous.id) : true;
    if (!previousDone) return 'locked';
    return state.startedLevelIds.includes(level.id) ? 'in_progress' : 'unlocked';
  },

  /** Whether every implemented level in a world is done, so its boss
   *  gate is unlocked. */
  isBossUnlocked(world: WorldDef): boolean {
    if (!world.implemented) return false;
    const playable = world.levels.filter((l) => l.implemented && (l.pathway === 'common' || l.pathway === state.pathway));
    return playable.length > 0 && playable.every((l) => state.completedLevelIds.includes(l.id));
  },

  isWorldPlayable(world: WorldDef): boolean {
    return world.implemented;
  },

  getWorldProgress(world: WorldDef): { completed: number; total: number } {
    const playable = world.levels.filter((l) => l.pathway === 'common' || l.pathway === state.pathway);
    const total = playable.length;
    const completed = playable.filter((l) => state.completedLevelIds.includes(l.id)).length;
    return { completed, total };
  },

  getOverallProgress(): { completed: number; total: number } {
    const playable = WORLDS.flatMap((w) => w.levels).filter((l) => l.pathway === 'common' || l.pathway === state.pathway);
    const total = playable.length;
    const completed = state.completedLevelIds.length;
    return { completed, total };
  },

  getResumeLevel(): LevelDef | null {
    for (const world of WORLDS) {
      if (!world.implemented) continue;
      const playable = world.levels.filter((l) => l.pathway === 'common' || l.pathway === state.pathway);
      for (const level of playable) {
        const status = progressService.getLevelStatus(level);
        if (status === 'unlocked' || status === 'in_progress') return level;
      }
    }
    return null;
  },
};
