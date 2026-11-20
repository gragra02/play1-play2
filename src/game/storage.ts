import type { SavedProgress, StageDefinition } from './types';

const STORAGE_KEY = 'p1p2_desde_1995_progress_v1';

export const DEFAULT_PROGRESS: SavedProgress = {
  stage1Completed: false,
  stage2Completed: false,
  stage3Completed: false,
  stage4Completed: false,
  bestDanceSync: 0,
  totalPlays: 0,
  discoveredProps: [],
  unlockedMemories: [],
  lastCompletedAt: null,
};

export const STAGES: StageDefinition[] = [
  {
    id: 'stage-1',
    number: 1,
    year: '1995',
    title: 'A dança que mudou tudo',
    location: 'Discoteca Cruzeiro · Ponte do Imaruim, Palhoça - SC',
    unlocked: true,
  },
  {
    id: 'stage-2',
    number: 2,
    year: 'Anos 90',
    title: 'Entre Encontros e Desencontros',
    location: 'Discoteca Cruzeiro · Ponte do Imaruim, Palhoça - SC',
    unlocked: true,
  },
  {
    id: 'stage-3',
    number: 3,
    year: 'Anos 90',
    title: 'Dessa Vez, Pra Ficar',
    location: 'Ponte do Imaruim · Reencontro, Amizade e Mudança',
    unlocked: true,
  },
  {
    id: 'stage-4',
    number: 4,
    year: 'Nova Fase',
    title: 'Nossa Pequena Grande Aventura',
    location: 'A Casa da Mãe, a Meia-Água e a Infância do Cristian',
    unlocked: true,
  },
];

export function loadProgress(): SavedProgress {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_PROGRESS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    return {
      stage1Completed: Boolean(parsed.stage1Completed),
      stage2Completed: Boolean(parsed.stage2Completed),
      stage3Completed: Boolean(parsed.stage3Completed),
      stage4Completed: Boolean(parsed.stage4Completed),
      bestDanceSync: typeof parsed.bestDanceSync === 'number' ? parsed.bestDanceSync : 0,
      totalPlays: typeof parsed.totalPlays === 'number' ? parsed.totalPlays : 0,
      discoveredProps: Array.isArray(parsed.discoveredProps)
        ? parsed.discoveredProps.filter((p): p is string => typeof p === 'string')
        : [],
      unlockedMemories: Array.isArray(parsed.unlockedMemories)
        ? parsed.unlockedMemories.filter((m): m is string => typeof m === 'string')
        : [],
      lastCompletedAt: typeof parsed.lastCompletedAt === 'string' ? parsed.lastCompletedAt : null,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: SavedProgress): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function resetProgress(): SavedProgress {
  const fresh = { ...DEFAULT_PROGRESS };
  saveProgress(fresh);
  return fresh;
}
