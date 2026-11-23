import { WORLD_HEIGHT, WORLD_WIDTH } from './mapData';
import {
  S6_SINK_TOTAL_STEPS,
  S6_VIDEOGAME_TOTAL_ROUNDS,
  STAGE6_COZINHA_HOTSPOTS,
  STAGE6_SALA_FAMILIA_HOTSPOTS,
  STAGE6_SCENE1_LAYOUT,
  STAGE_6_DIALOGUES,
  STAGE_6_MEMORIES,
  createStage6Npcs,
  isStage6CozinhaBoxWalkable,
  isStage6PiscinaBoxWalkable,
  isStage6SalaFamiliaBoxWalkable,
} from './stage6Data';
import {
  S6_SCENE1_APPROACH_SECONDS,
  S6_SCENE1_HUG_ZOOM_SECONDS,
  S6_SCENE4_BED_TV_SECONDS,
  S6_SCENE4_COMFORT_SECONDS,
  S6_TRANSITION_DURATION_SECONDS,
} from './stage6Timing';
import type {
  CharacterEmotion,
  Direction,
  NpcEntity,
  SimulationState,
  SpeakerId,
  Stage6MapId,
  Stage6State,
} from './types';

// ============================================================================
// STAGE 6 — NOSSA HISTÓRIA CONTINUA (Pure Simulation & State Machine)
// Strictly pure & unit-testable under Node (zero DOM / image imports).
// ============================================================================

export const S6_PLAYER_SPEED = 112;
export const S6_INTERACT_RADIUS = 64;

export interface Stage6CutsceneCaption {
  badge: string;
  speaker?: string;
  speakerId?: SpeakerId;
  emotion?: CharacterEmotion;
  text: string;
  canSkipIntro?: boolean;
  canFinishEnding?: boolean;
}

export interface Stage6InteractableTarget {
  type: 'npc' | 'prop' | 'memory';
  id: string;
  label: string;
  dialogueId: string;
  distance: number;
  priority: number;
}

function createIdleSlowDance() {
  return {
    active: false,
    elapsed: 0,
    duration: 8.4,
    swayPhase: 0,
    syncHits: 0,
    beatCursor: 0.5,
    hitFeedback: '' as const,
    feedbackTimer: 0,
  };
}

function createIdleKiss() {
  return {
    active: false,
    phase: 'zoom_in' as const,
    elapsed: 0,
    totalDuration: 7.0,
    cameraZoom: 1.0,
  };
}

function createDoneIntro() {
  return {
    active: false,
    scene: 'scene3_interior_pan' as const,
    elapsed: 0,
    doorOpenAmount: 1,
    cameraFocusX: 384,
    cameraFocusY: 256,
  };
}

export function unlockStage6Memory(s6: Stage6State, memoryId: string): Stage6State {
  if (s6.unlockedMemories.includes(memoryId)) return s6;
  const mem = STAGE_6_MEMORIES.find((m) => m.id === memoryId);
  return {
    ...s6,
    unlockedMemories: [...s6.unlockedMemories, memoryId],
    recentMemoryTitle: mem ? mem.title : s6.recentMemoryTitle,
    recentMemoryTimer: mem ? 3.8 : s6.recentMemoryTimer,
  };
}

export function createStage6Simulation(
  skipIntro = false,
  unlockedMemories: string[] = [],
): SimulationState {
  const s6: Stage6State = {
    mapId: 's6_sala_familia',
    locationLabel: 'Nosso Apartamento · Sala da Família',
    eraLabel: 'Cena 1 · O Abraço da Nossa Família (Cris 12 · Lara 5)',
    cutscene: skipIntro ? 'none' : 's6_family_hug',
    cutsceneElapsed: 0,
    cameraFocusX: STAGE6_SCENE1_LAYOUT.hugCenter.x,
    cameraFocusY: STAGE6_SCENE1_LAYOUT.hugCenter.y - 36,
    cameraZoom: skipIntro ? 1.0 : 1.06,
    hugCompleted: skipIntro,
    poolPlayedWith: [],
    videogameRound: 0,
    videogameCompleted: false,
    sinkStep: 0,
    sinkCompleted: false,
    sinkGraziExitStartX: 392,
    sinkGraziExitStartY: 468,
    birthdayPhase: 'gathering',
    birthdayCandlesLit: true,
    unlockedMemories: [...unlockedMemories],
    recentMemoryTitle: null,
    recentMemoryTimer: 0,
    endingReadyToFinish: false,
  };

  return {
    stageId: 'stage-6',
    questPhase: skipIntro ? 's6_explore_sala_familia' : 's6_scene1_family_hug',
    intro: createDoneIntro(),
    arielActivity: 'standing',
    player: {
      x: 186,
      y: 444,
      width: 18,
      height: 14,
      dir: 'right',
      walkDistance: 0,
      isMoving: false,
      isDancing: false,
      reactionEmotion: 'happy',
    },
    npcs: skipIntro ? createStage6Npcs('s6_sala_familia') : [],
    activeDialogue: null,
    dialogueLineIndex: 0,
    slowDance: createIdleSlowDance(),
    kissCutscene: createIdleKiss(),
    stage2: null,
    stage3: null,
    stage4: null,
    stage5: null,
    stage6: s6,
    elapsedSeconds: 0,
    beatTimer: 0,
    discoveredProps: [],
    heartsSpawned: 0,
  };
}

export function isStage6CutsceneActive(state: SimulationState): boolean {
  return (
    state.stageId === 'stage-6' &&
    Boolean(state.stage6 && state.stage6.cutscene !== 'none')
  );
}

export function isStage6ExplorationPhase(phase: SimulationState['questPhase']): boolean {
  return phase === 's6_explore_sala_familia' || phase === 's6_explore_piscina';
}

export function startStage6PoolTransition(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_transition_pool',
    stage6: {
      ...state.stage6,
      cutscene: 's6_transition_to_pool',
      cutsceneElapsed: 0,
      locationLabel: 'Um Dia Ensolarado em Família',
      eraLabel: 'Cena 2 · Um Dia Feliz na Piscina',
      cameraFocusX: 384,
      cameraFocusY: 256,
      cameraZoom: 1.0,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6PoolExplore(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_explore_piscina',
    stage6: {
      ...state.stage6,
      mapId: 's6_piscina_condominio',
      locationLabel: 'Área de Lazer · Piscina em Família',
      eraLabel: 'Cena 2 · Um Dia Feliz na Piscina (Cris 12 · Lara 5)',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 384,
      cameraFocusY: 360,
      cameraZoom: 1.0,
      poolPlayedWith: [],
    },
    npcs: createStage6Npcs('s6_piscina_condominio'),
    player: {
      ...state.player,
      x: 590,
      y: 446,
      dir: 'up',
      isMoving: false,
      vx: 0,
      vy: 0,
    },
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6VideogameTransition(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_transition_videogame',
    stage6: {
      ...state.stage6,
      cutscene: 's6_transition_to_videogame',
      cutsceneElapsed: 0,
      locationLabel: 'O Tempo Passa...',
      eraLabel: 'Cena 3 · Cris (19 anos) e Lara (15 anos)',
      cameraFocusX: 384,
      cameraFocusY: 256,
      cameraZoom: 1.0,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6VideogameScene(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_scene3_videogame',
    stage6: {
      ...state.stage6,
      mapId: 's6_sala_videogame_teens',
      locationLabel: 'Sala de Casa · Noite de Videogame em Família',
      eraLabel: 'Cena 3 · Cris (19) e Lara (15) Jogando com Grazi e Ariel',
      cutscene: 's6_videogame_family',
      cutsceneElapsed: 0,
      cameraFocusX: 384,
      cameraFocusY: 256,
      cameraZoom: 1.0,
      videogameRound: 0,
      videogameCompleted: false,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function advanceStage6VideogameRound(state: SimulationState): SimulationState {
  if (
    state.stageId !== 'stage-6' ||
    !state.stage6 ||
    state.stage6.cutscene !== 's6_videogame_family' ||
    state.activeDialogue
  ) {
    return state;
  }
  const nextRound = Math.min(S6_VIDEOGAME_TOTAL_ROUNDS, state.stage6.videogameRound + 1);
  const completed = nextRound >= S6_VIDEOGAME_TOTAL_ROUNDS;
  let nextS6 = {
    ...state.stage6,
    videogameRound: nextRound,
    videogameCompleted: completed,
  };
  if (completed) {
    nextS6 = unlockStage6Memory(nextS6, 'mem_s6_videogame_familia');
  }
  return {
    ...state,
    stage6: nextS6,
    activeDialogue: completed ? STAGE_6_DIALOGUES.s6_scene3_videogame : null,
    dialogueLineIndex: 0,
  };
}

export function startStage6BedroomTransition(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_transition_bedroom',
    stage6: {
      ...state.stage6,
      cutscene: 's6_transition_to_bedroom',
      cutsceneElapsed: 0,
      locationLabel: 'Um Período Difícil',
      eraLabel: 'Cena 4 · Presença e Acolhimento',
      cameraFocusX: 384,
      cameraFocusY: 256,
      cameraZoom: 1.0,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6BedroomComfort(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_scene4_bedroom',
    stage6: {
      ...state.stage6,
      mapId: 's6_quarto_casal_noite',
      locationLabel: 'Quarto do Casal · Noite Serena',
      eraLabel: 'Cena 4 · Um Período Difícil',
      cutscene: 's6_bedroom_comfort',
      cutsceneElapsed: 0,
      cameraFocusX: 384,
      cameraFocusY: 296,
      cameraZoom: 1.04,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6BedroomBedTv(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  const s6 = unlockStage6Memory(
    {
      ...state.stage6,
      mapId: 's6_quarto_casal_noite',
      locationLabel: 'Quarto do Casal · Assistindo TV Juntos',
      eraLabel: 'Cena 4 · Dentro do Abraço do Ariel',
      cutscene: 's6_bedroom_bed_tv',
      cutsceneElapsed: 0,
      cameraFocusX: 372,
      cameraFocusY: 344,
      cameraZoom: 1.32,
    },
    'mem_s6_abraco_quarto',
  );
  return {
    ...state,
    questPhase: 's6_scene4_bedroom',
    stage6: s6,
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6KitchenTransition(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_transition_kitchen',
    stage6: {
      ...state.stage6,
      cutscene: 's6_transition_to_kitchen',
      cutsceneElapsed: 0,
      locationLabel: 'Cozinha de Casa · Dia de Rir Juntos',
      eraLabel: 'Cena 5 · Ariel "Marido de Aluguel" — A Pia Entupida',
      cameraFocusX: 384,
      cameraFocusY: 256,
      cameraZoom: 1.0,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6KitchenExplore(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_explore_cozinha',
    stage6: {
      ...state.stage6,
      mapId: 's6_cozinha_pia',
      locationLabel: 'Cozinha de Casa · A Pia Entupida',
      eraLabel: 'Cena 5 · Ariel "Marido de Aluguel"',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 384,
      cameraFocusY: 256,
      cameraZoom: 1.0,
      sinkStep: 0,
      sinkCompleted: false,
    },
    player: {
      ...state.player,
      x: 180,
      y: 472,
      dir: 'right',
      isMoving: false,
      vx: 0,
      vy: 0,
    },
    npcs: createStage6Npcs('s6_cozinha_pia'),
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6KitchenSinkFinale(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  const s6 = unlockStage6Memory(
    {
      ...state.stage6,
      mapId: 's6_cozinha_pia',
      cutscene: 's6_kitchen_sink_finale',
      cutsceneElapsed: 0,
      sinkStep: S6_SINK_TOTAL_STEPS,
      sinkGraziExitStartX: state.player.x,
      sinkGraziExitStartY: state.player.y,
    },
    'mem_s6_pia_entupida',
  );
  return {
    ...state,
    questPhase: 's6_explore_cozinha',
    stage6: s6,
    player: { ...state.player, dir: 'left', isMoving: false, vx: 0, vy: 0 },
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6BirthdayTransition(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_transition_birthday',
    stage6: {
      ...state.stage6,
      cutscene: 's6_transition_to_birthday',
      cutsceneElapsed: 0,
      locationLabel: '23/11/2026 · Um Dia Muito Especial',
      eraLabel: 'Cena 6 · Aniversário do Ariel',
      cameraFocusX: 384,
      cameraFocusY: 256,
      cameraZoom: 1.0,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6BirthdayScene(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_scene6_birthday',
    stage6: {
      ...state.stage6,
      mapId: 's6_sala_aniversario',
      locationLabel: 'Sala de Jantar · 23/11/2026 — Aniversário do Ariel',
      eraLabel: 'Cena 6 · Com Grazi, Cris, Lara, Manu e Marquinho',
      cutscene: 's6_birthday_party',
      cutsceneElapsed: 0,
      cameraFocusX: 418,
      cameraFocusY: 288,
      cameraZoom: 1.0,
      birthdayPhase: 'gathering',
      birthdayCandlesLit: true,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function blowStage6BirthdayCandles(state: SimulationState): SimulationState {
  if (
    state.stageId !== 'stage-6' ||
    !state.stage6 ||
    state.stage6.cutscene !== 's6_birthday_party' ||
    state.activeDialogue ||
    state.stage6.birthdayPhase !== 'ready_to_blow'
  ) {
    return state;
  }
  const nextS6 = unlockStage6Memory(
    {
      ...state.stage6,
      birthdayPhase: 'blowing',
      birthdayCandlesLit: false,
      cutsceneElapsed: 0,
      locationLabel: 'Feliz Aniversário, Ariel! · 23/11/2026',
    },
    'mem_s6_aniversario_ariel',
  );
  return {
    ...state,
    stage6: nextS6,
  };
}

export function startStage6FinalTransition(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_transition_final',
    stage6: {
      ...state.stage6,
      cutscene: 's6_transition_to_final',
      cutsceneElapsed: 0,
      locationLabel: 'E Assim Chegamos ao Hoje...',
      eraLabel: 'Cena Final · Nossa História Continua',
      cameraFocusX: 384,
      cameraFocusY: 256,
      cameraZoom: 1.0,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage6FinalScene(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 's6_final_volume2',
    stage6: {
      ...state.stage6,
      mapId: 's6_tela_final_volume1',
      locationLabel: 'Pôr do Sol · Nossa História Continua',
      eraLabel: 'Cena Final · O Convite para o Volume 2',
      cutscene: 's6_final_volume2',
      cutsceneElapsed: 0,
      cameraFocusX: 384,
      cameraFocusY: 256,
      cameraZoom: 1.0,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function showStage6Volume1EndCard(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  const s6 = unlockStage6Memory(
    {
      ...state.stage6,
      mapId: 's6_tela_final_volume1',
      cutscene: 's6_volume1_endcard',
      cutsceneElapsed: 0,
      locationLabel: 'PLAYER 1 + PLAYER 2 · Volume 1 — Fim',
      eraLabel: 'Continua no Volume 2...',
      endingReadyToFinish: true,
    },
    'mem_s6_convite_vol2',
  );
  return {
    ...state,
    questPhase: 's6_final_volume2',
    stage6: s6,
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function completeStage6Volume1(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  return {
    ...state,
    questPhase: 'stage_complete',
    stage6: {
      ...state.stage6,
      endingReadyToFinish: true,
    },
  };
}

export function skipStage6Intro(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;
  if (state.stage6.cutscene !== 's6_family_hug') return state;
  const s6 = unlockStage6Memory(
    {
      ...state.stage6,
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 384,
      cameraFocusY: 360,
      cameraZoom: 1.0,
      hugCompleted: true,
    },
    'mem_s6_abraco_familia',
  );
  return {
    ...state,
    questPhase: 's6_explore_sala_familia',
    stage6: s6,
    npcs: createStage6Npcs('s6_sala_familia'),
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

function canStandAtStage6(
  mapId: Stage6MapId,
  x: number,
  y: number,
  width: number,
  height: number,
  npcs: NpcEntity[],
): boolean {
  const halfW = width / 2;
  const halfH = height / 2;
  const left = x - halfW;
  const right = x + halfW;
  const top = y - halfH;
  const bottom = y + halfH;

  if (left < 0 || top < 0 || right > WORLD_WIDTH || bottom > WORLD_HEIGHT) {
    return false;
  }

  if (mapId === 's6_sala_familia') {
    if (!isStage6SalaFamiliaBoxWalkable(left, top, right, bottom)) return false;
  } else if (mapId === 's6_piscina_condominio') {
    if (!isStage6PiscinaBoxWalkable(left, top, right, bottom)) return false;
  } else if (mapId === 's6_cozinha_pia') {
    if (!isStage6CozinhaBoxWalkable(left, top, right, bottom)) return false;
  }

  for (const npc of npcs) {
    if (!npc.visible) continue;
    if (Math.abs(x - npc.x) < 16 && Math.abs(y - npc.y) < 12) return false;
  }

  return true;
}

function directionFromVec(dx: number, dy: number, fallback: Direction): Direction {
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export function moveStage6Player(
  state: SimulationState,
  inputX: number,
  inputY: number,
  dt: number,
): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;

  if (
    state.activeDialogue ||
    isStage6CutsceneActive(state) ||
    state.questPhase === 'stage_complete'
  ) {
    if (!state.player.isMoving) return state;
    return {
      ...state,
      player: { ...state.player, isMoving: false, vx: 0, vy: 0 },
    };
  }

  const len = Math.hypot(inputX, inputY);
  const nx = len > 0.01 ? inputX / len : 0;
  const ny = len > 0.01 ? inputY / len : 0;
  const targetVx = nx * S6_PLAYER_SPEED;
  const targetVy = ny * S6_PLAYER_SPEED;
  const currentVx = state.player.vx ?? 0;
  const currentVy = state.player.vy ?? 0;
  const responsiveness = len > 0.01 ? 10.5 : 14.5;
  const blend = 1 - Math.exp(-responsiveness * dt);
  let nextVx = currentVx + (targetVx - currentVx) * blend;
  let nextVy = currentVy + (targetVy - currentVy) * blend;
  if (len < 0.01 && Math.hypot(nextVx, nextVy) < 2) {
    nextVx = 0;
    nextVy = 0;
  }

  let nextX = state.player.x;
  let nextY = state.player.y;
  const mapId = state.stage6.mapId;

  const tryX = nextX + nextVx * dt;
  if (canStandAtStage6(mapId, tryX, nextY, state.player.width, state.player.height, state.npcs)) {
    nextX = tryX;
  }
  const tryY = nextY + nextVy * dt;
  if (canStandAtStage6(mapId, nextX, tryY, state.player.width, state.player.height, state.npcs)) {
    nextY = tryY;
  }

  const movedDist = Math.hypot(nextX - state.player.x, nextY - state.player.y);
  const nextDir = directionFromVec(nextVx, nextVy, state.player.dir);

  return {
    ...state,
    stage6: {
      ...state.stage6,
      cameraFocusX: nextX,
      cameraFocusY: nextY - 12,
    },
    player: {
      ...state.player,
      x: nextX,
      y: nextY,
      dir: nextDir,
      vx: nextVx,
      vy: nextVy,
      isMoving: movedDist > 0.01,
      walkDistance: state.player.walkDistance + movedDist,
    },
  };
}

export function findNearestStage6Interactable(
  state: SimulationState,
): Stage6InteractableTarget | null {
  if (
    state.stageId !== 'stage-6' ||
    !state.stage6 ||
    state.activeDialogue ||
    isStage6CutsceneActive(state)
  ) {
    return null;
  }

  const px = state.player.x;
  const py = state.player.y;
  const s6 = state.stage6;
  const candidates: Stage6InteractableTarget[] = [];

  if (s6.mapId === 's6_sala_familia') {
    const doorHs = STAGE6_SALA_FAMILIA_HOTSPOTS.find((h) => h.id === 'hs_porta_sala');
    if (doorHs) {
      const distDoor = Math.hypot(px - doorHs.standX, py - doorHs.standY);
      if (distDoor <= S6_INTERACT_RADIUS + 20) {
        candidates.push({
          type: 'prop',
          id: 's6_go_to_pool',
          label: 'Ir com a família para a piscina (Cena 2)',
          dialogueId: '',
          distance: distDoor,
          priority: 16,
        });
      }
    }
    const distHug = Math.hypot(
      px - STAGE6_SCENE1_LAYOUT.hugCenter.x,
      py - STAGE6_SCENE1_LAYOUT.hugCenter.y,
    );
    if (distHug <= S6_INTERACT_RADIUS + 18) {
      candidates.push({
        type: 'prop',
        id: 's6_replay_family_hug',
        label: 'Reunir a família para o abraço',
        dialogueId: 's6_scene1_hug_quote',
        distance: distHug,
        priority: 12,
      });
    }
  } else if (s6.mapId === 's6_piscina_condominio') {
    const played = new Set(s6.poolPlayedWith);
    for (const npc of state.npcs) {
      if (!npc.visible || !npc.interactable) continue;
      const dist = Math.hypot(px - npc.x, py - npc.y);
      if (dist > S6_INTERACT_RADIUS + 16) continue;
      if (npc.role === 'ariel' || npc.role === 'cristian' || npc.role === 'lara') {
        const done = played.has(npc.role);
        candidates.push({
          type: 'npc',
          id: `s6_pool_play_${npc.role}`,
          label: done
            ? `Brincar mais com ${npc.name} na piscina`
            : `Brincar com ${npc.name} na piscina`,
          dialogueId: 's6_scene2_pool',
          distance: dist,
          priority: done ? 6 : 16,
        });
      }
    }
  } else if (s6.mapId === 's6_cozinha_pia') {
    const sinkHs = STAGE6_COZINHA_HOTSPOTS.find((h) => h.id === 'hs_pia_entupida');
    const arielNpc = state.npcs.find((n) => n.role === 'ariel' && n.visible);
    const refX = arielNpc ? arielNpc.x : (sinkHs?.standX ?? 512);
    const refY = arielNpc ? arielNpc.y : (sinkHs?.standY ?? 458);
    const dist = Math.hypot(px - refX, py - refY);
    if (dist <= S6_INTERACT_RADIUS + 76 && !s6.sinkCompleted) {
      const stepLabel =
        s6.sinkStep === 0
          ? 'Incentivar o Ariel a desentupir a pia (1/3)'
          : s6.sinkStep === 1
            ? 'Dar mais força pro Ariel na pia (2/3)'
            : 'Empurrar mais um pouquinho (3/3)';
      candidates.push({
        type: 'npc',
        id: 's6_kitchen_plunge',
        label: stepLabel,
        dialogueId:
          s6.sinkStep === 0
            ? 's6_scene5_sink_step1'
            : s6.sinkStep === 1
              ? 's6_scene5_sink_step2'
              : 's6_scene5_sink_step3',
        distance: dist,
        priority: 18,
      });
    } else if (dist <= S6_INTERACT_RADIUS + 90 && s6.sinkCompleted) {
      candidates.push({
        type: 'npc',
        id: 's6_go_to_birthday',
        label: 'Ir para o Aniversário do Ariel · 23/11/2026 (Cena 6)',
        dialogueId: '',
        distance: dist,
        priority: 18,
      });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (b.priority !== a.priority ? b.priority - a.priority : a.distance - b.distance));
  return candidates[0];
}

export function triggerStage6Interaction(state: SimulationState): {
  next: SimulationState;
  target: Stage6InteractableTarget | null;
} {
  if (state.stageId !== 'stage-6' || !state.stage6) {
    return { next: state, target: null };
  }
  const target = findNearestStage6Interactable(state);
  if (!target) return { next: state, target: null };

  if (target.id === 's6_go_to_pool') {
    return { target, next: startStage6PoolTransition(state) };
  }

  if (target.id === 's6_go_to_birthday') {
    return { target, next: startStage6BirthdayTransition(state) };
  }

  if (target.id === 's6_kitchen_plunge') {
    const nextStep = Math.min(S6_SINK_TOTAL_STEPS, state.stage6.sinkStep + 1);
    const dialogue = STAGE_6_DIALOGUES[target.dialogueId] ?? null;
    return {
      target,
      next: {
        ...state,
        stage6: {
          ...state.stage6,
          sinkStep: nextStep,
        },
        activeDialogue: dialogue,
        dialogueLineIndex: 0,
        player: { ...state.player, dir: 'right', isMoving: false, vx: 0, vy: 0 },
      },
    };
  }

  if (target.id.startsWith('s6_pool_play_')) {
    const role = target.id.replace('s6_pool_play_', '') as 'ariel' | 'cristian' | 'lara';
    const nextPlayed = Array.from(new Set([...state.stage6.poolPlayedWith, role]));
    let nextS6 = { ...state.stage6, poolPlayedWith: nextPlayed };
    const allPlayed = nextPlayed.length >= 3;
    if (allPlayed) {
      nextS6 = unlockStage6Memory(nextS6, 'mem_s6_dia_piscina');
    }
    return {
      target,
      next: {
        ...state,
        stage6: nextS6,
        activeDialogue: allPlayed ? STAGE_6_DIALOGUES.s6_scene2_pool : null,
        dialogueLineIndex: 0,
        player: { ...state.player, isMoving: false },
      },
    };
  }

  if (target.id === 's6_replay_family_hug') {
    return {
      target,
      next: {
        ...state,
        questPhase: 's6_scene1_family_hug',
        stage6: {
          ...state.stage6,
          cutscene: 's6_family_hug',
          cutsceneElapsed: 0,
          cameraFocusX: STAGE6_SCENE1_LAYOUT.hugCenter.x,
          cameraFocusY: STAGE6_SCENE1_LAYOUT.hugCenter.y - 36,
          cameraZoom: 1.06,
        },
        npcs: [],
        activeDialogue: null,
        dialogueLineIndex: 0,
      },
    };
  }

  const dialogue = STAGE_6_DIALOGUES[target.dialogueId] ?? null;
  return {
    target,
    next: {
      ...state,
      activeDialogue: dialogue,
      dialogueLineIndex: 0,
      player: { ...state.player, isMoving: false },
    },
  };
}

export function handleStage6DialogueComplete(
  state: SimulationState,
  _completedDialogueId: string,
  action?: string,
): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;

  if (action === 's6_scene1_finish_hug') {
    const s6 = unlockStage6Memory(
      {
        ...state.stage6,
        cutscene: 'none',
        cutsceneElapsed: 0,
        cameraFocusX: 384,
        cameraFocusY: 360,
        cameraZoom: 1.0,
        hugCompleted: true,
      },
      'mem_s6_abraco_familia',
    );
    return {
      ...state,
      questPhase: 's6_explore_sala_familia',
      stage6: s6,
      npcs: createStage6Npcs('s6_sala_familia'),
    };
  }

  if (action === 's6_start_videogame_transition') {
    return startStage6VideogameTransition(state);
  }
  if (action === 's6_start_bedroom_transition') {
    return startStage6BedroomTransition(state);
  }
  if (action === 's6_start_bedroom_bed_tv') {
    return startStage6BedroomBedTv(state);
  }
  if (action === 's6_start_kitchen_transition') {
    return startStage6KitchenTransition(state);
  }
  if (action === 's6_start_kitchen_finale') {
    return startStage6KitchenSinkFinale(state);
  }
  if (action === 's6_start_birthday_transition') {
    return startStage6BirthdayTransition(state);
  }
  if (action === 's6_birthday_ready_to_blow') {
    return {
      ...state,
      stage6: {
        ...state.stage6,
        birthdayPhase: 'ready_to_blow',
      },
    };
  }
  if (action === 's6_start_final_transition') {
    return startStage6FinalTransition(state);
  }
  if (action === 's6_show_volume1_endcard') {
    return showStage6Volume1EndCard(state);
  }

  return state;
}

export function stepStage6Simulation(state: SimulationState, dt: number): SimulationState {
  if (state.stageId !== 'stage-6' || !state.stage6) return state;

  let s6 = state.stage6;

  if (s6.recentMemoryTimer > 0) {
    const rem = Math.max(0, s6.recentMemoryTimer - dt);
    s6 = {
      ...s6,
      recentMemoryTimer: rem,
      recentMemoryTitle: rem > 0 ? s6.recentMemoryTitle : null,
    };
  }

  // Regra 10: nenhum texto avança sozinho enquanto houver diálogo ativo!
  if (state.activeDialogue) {
    return { ...state, stage6: s6 };
  }

  if (s6.cutscene === 'none') {
    // Cena 2: nado suave e espontâneo dos 3 integrantes dentro da piscina
    if (s6.mapId === 's6_piscina_condominio' && state.questPhase === 's6_explore_piscina') {
      const tPool = state.elapsedSeconds;
      const animatedNpcs = state.npcs.map((npc) => {
        if (npc.role === 'lara') {
          return {
            ...npc,
            x: 232 + Math.sin(tPool * 1.1) * 18,
            y: 332 + Math.cos(tPool * 0.9) * 8,
            dir: (Math.cos(tPool * 1.1) >= 0 ? 'right' : 'left') as Direction,
          };
        }
        if (npc.role === 'cristian') {
          return {
            ...npc,
            x: 374 + Math.sin(tPool * 1.35 + 1.2) * 24,
            y: 354 + Math.cos(tPool * 1.0 + 0.5) * 10,
            dir: (Math.cos(tPool * 1.35 + 1.2) >= 0 ? 'right' : 'left') as Direction,
          };
        }
        if (npc.role === 'ariel') {
          return {
            ...npc,
            x: 536 + Math.sin(tPool * 0.95 + 2.4) * 22,
            y: 342 + Math.cos(tPool * 0.85 + 1.4) * 10,
            dir: (Math.cos(tPool * 0.95 + 2.4) >= 0 ? 'right' : 'left') as Direction,
          };
        }
        return npc;
      });
      return { ...state, stage6: s6, npcs: animatedNpcs };
    }
    return { ...state, stage6: s6 };
  }

  const t = s6.cutsceneElapsed + dt;

  // Transição contextual (4,8 s) entre Cena 1 e Cena 2 (Regra 11)
  if (s6.cutscene === 's6_transition_to_pool') {
    if (t >= S6_TRANSITION_DURATION_SECONDS) {
      return startStage6PoolExplore({ ...state, stage6: s6 });
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Transição contextual (4,8 s) entre Cena 2 e Cena 3 — Passagem de Tempo (Regra 11)
  if (s6.cutscene === 's6_transition_to_videogame') {
    if (t >= S6_TRANSITION_DURATION_SECONDS) {
      return startStage6VideogameScene({ ...state, stage6: s6 });
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Cena 3: Videogame interativo — avança somente com ação do jogador (sem avanço automático)
  if (s6.cutscene === 's6_videogame_family') {
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Transição contextual (4,8 s) para Cena 4 — Um período difícil
  if (s6.cutscene === 's6_transition_to_bedroom') {
    if (t >= S6_TRANSITION_DURATION_SECONDS) {
      return startStage6BedroomComfort({ ...state, stage6: s6 });
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Cena 4A: Ariel recolhido sentado na cama + Grazi se aproxima -> abre fala manual "Não precisa falar nada. Eu estou aqui."
  if (s6.cutscene === 's6_bedroom_comfort') {
    if (t >= S6_SCENE4_COMFORT_SECONDS && s6.cutsceneElapsed < S6_SCENE4_COMFORT_SECONDS) {
      return {
        ...state,
        stage6: {
          ...s6,
          cutsceneElapsed: S6_SCENE4_COMFORT_SECONDS,
        },
        activeDialogue: STAGE_6_DIALOGUES.s6_scene4_comfort,
        dialogueLineIndex: 0,
      };
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Cena 4B: Close-up carinhoso dos dois deitados vendo TV -> abre fala manual "Dentro do abraço do Ariel."
  if (s6.cutscene === 's6_bedroom_bed_tv') {
    if (t >= S6_SCENE4_BED_TV_SECONDS && s6.cutsceneElapsed < S6_SCENE4_BED_TV_SECONDS) {
      return {
        ...state,
        stage6: {
          ...s6,
          cutsceneElapsed: S6_SCENE4_BED_TV_SECONDS,
        },
        activeDialogue: STAGE_6_DIALOGUES.s6_scene4_bed_quote,
        dialogueLineIndex: 0,
      };
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Transição contextual (4,8 s) para Cena 5 — Cozinha / A pia entupida
  if (s6.cutscene === 's6_transition_to_kitchen') {
    if (t >= S6_TRANSITION_DURATION_SECONDS) {
      return startStage6KitchenExplore({ ...state, stage6: s6 });
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Cena 5 Finale: Grazi sai andando pela esquerda após "Ih... não estou mais aqui!", Ariel dá o último empurrão, água escoa e ele comemora!
  if (s6.cutscene === 's6_kitchen_sink_finale') {
    if (t >= 4.8) {
      return {
        ...state,
        stage6: {
          ...s6,
          cutscene: 'none',
          cutsceneElapsed: 0,
          sinkStep: 4,
          sinkCompleted: true,
          locationLabel: 'Cozinha de Casa · Pia Desentupida!',
        },
        player: {
          ...state.player,
          x: 168,
          y: 472,
          dir: 'right',
          isMoving: false,
          vx: 0,
          vy: 0,
        },
      };
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Transição contextual (4,8 s) para Cena 6 — Aniversário do Ariel (23/11/2026)
  if (s6.cutscene === 's6_transition_to_birthday') {
    if (t >= S6_TRANSITION_DURATION_SECONDS) {
      return startStage6BirthdayScene({ ...state, stage6: s6 });
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Cena 6: Aniversário do Ariel (23/11/2026) — abre falas manuais -> jogador sopra as velinhas!
  if (s6.cutscene === 's6_birthday_party') {
    if (s6.birthdayPhase === 'gathering' && t >= 1.4 && s6.cutsceneElapsed < 1.4) {
      return {
        ...state,
        stage6: {
          ...s6,
          cutsceneElapsed: 1.4,
        },
        activeDialogue: STAGE_6_DIALOGUES.s6_scene6_birthday,
        dialogueLineIndex: 0,
      };
    }
    if (s6.birthdayPhase === 'blowing' && t >= 1.8) {
      return {
        ...state,
        stage6: {
          ...s6,
          cutsceneElapsed: t,
          birthdayPhase: 'celebrating',
        },
      };
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Transição contextual (4,8 s) para Cena Final — O convite para o Volume 2
  if (s6.cutscene === 's6_transition_to_final') {
    if (t >= S6_TRANSITION_DURATION_SECONDS) {
      return startStage6FinalScene({ ...state, stage6: s6 });
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Cena Final: Pôr do sol com toda a família -> abre mensagem final e convite para o Volume 2 (avanço manual)
  if (s6.cutscene === 's6_final_volume2') {
    if (t >= 1.4 && s6.cutsceneElapsed < 1.4) {
      return {
        ...state,
        stage6: {
          ...s6,
          cutsceneElapsed: 1.4,
        },
        activeDialogue: STAGE_6_DIALOGUES.s6_final_volume2,
        dialogueLineIndex: 0,
      };
    }
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // Cartela Final do Volume 1 — espera o jogador confirmar com Espaço/Enter
  if (s6.cutscene === 's6_volume1_endcard') {
    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
      },
    };
  }

  // CENA 1: Os 4 caminham até o centro da sala -> abraço coletivo -> abre fala manual "Seremos muito felizes!"
  if (s6.cutscene === 's6_family_hug') {
    const totalAnim = S6_SCENE1_APPROACH_SECONDS + S6_SCENE1_HUG_ZOOM_SECONDS;
    const zoomPhase = Math.max(
      0,
      Math.min(1, (t - S6_SCENE1_APPROACH_SECONDS) / Math.max(0.1, S6_SCENE1_HUG_ZOOM_SECONDS)),
    );
    const easedZoom = 1 - Math.pow(1 - zoomPhase, 3);
    const cameraZoom = 1.06 + 0.32 * easedZoom;

    if (t >= totalAnim) {
      return {
        ...state,
        stage6: {
          ...s6,
          cutsceneElapsed: totalAnim,
          cameraFocusX: STAGE6_SCENE1_LAYOUT.hugCenter.x,
          cameraFocusY: STAGE6_SCENE1_LAYOUT.hugCenter.y - 44,
          cameraZoom: 1.38,
        },
        activeDialogue: STAGE_6_DIALOGUES.s6_scene1_hug_quote,
        dialogueLineIndex: 0,
      };
    }

    return {
      ...state,
      stage6: {
        ...s6,
        cutsceneElapsed: t,
        cameraFocusX: STAGE6_SCENE1_LAYOUT.hugCenter.x,
        cameraFocusY: STAGE6_SCENE1_LAYOUT.hugCenter.y - 36 - 8 * easedZoom,
        cameraZoom,
      },
    };
  }

  return { ...state, stage6: { ...s6, cutsceneElapsed: t } };
}

export function getStage6ObjectiveText(state: SimulationState): string {
  if (state.stageId !== 'stage-6' || !state.stage6) return '';
  if (state.questPhase === 's6_scene1_family_hug') {
    return 'Cena 1 · O abraço da nossa família';
  }
  if (state.questPhase === 's6_explore_sala_familia') {
    return 'Sala da Família · Vá até a porta esquerda para aproveitar o dia na piscina (Cena 2)';
  }
  if (state.questPhase === 's6_transition_pool') {
    return 'Um dia ensolarado na piscina em família...';
  }
  if (state.questPhase === 's6_explore_piscina') {
    return `Cena 2 · Entre na piscina e brinque com Ariel, Cris e Lara (${state.stage6.poolPlayedWith.length}/3)`;
  }
  if (state.questPhase === 's6_transition_videogame') {
    return 'Os anos passam... Cris (19) e Lara (15) agora adolescentes';
  }
  if (state.questPhase === 's6_scene3_videogame') {
    return state.stage6.videogameCompleted
      ? 'Cena 3 · Noite de videogame em família concluída!'
      : `Cena 3 · Aperte Espaço / Enter para jogar a rodada em família (${state.stage6.videogameRound}/${S6_VIDEOGAME_TOTAL_ROUNDS})`;
  }
  if (state.questPhase === 's6_transition_bedroom' || state.questPhase === 's6_scene4_bedroom') {
    return 'Cena 4 · Presença, acolhimento e o abraço do Ariel';
  }
  if (state.questPhase === 's6_transition_kitchen') {
    return 'Cena 5 · Ariel "marido de aluguel" na cozinha...';
  }
  if (state.questPhase === 's6_explore_cozinha') {
    if (state.stage6.sinkCompleted) {
      return 'Cena 5 · Pia desentupida! Fale com o Ariel para ir ao Aniversário (Cena 6)';
    }
    if (state.stage6.cutscene === 's6_kitchen_sink_finale') {
      return 'Cena 5 · Grazi sai de cena rindo enquanto Ariel termina de desentupir a pia!';
    }
    return `Cena 5 · Ande até a pia e aperte Espaço/E para incentivar o Ariel (${state.stage6.sinkStep}/${S6_SINK_TOTAL_STEPS})`;
  }
  if (state.questPhase === 's6_transition_birthday') {
    return '23/11/2026 · Preparando o bolo de aniversário do Ariel...';
  }
  if (state.questPhase === 's6_scene6_birthday') {
    if (state.stage6.birthdayPhase === 'ready_to_blow') {
      return 'Cena 6 · Aperte Espaço / Enter para o Ariel fazer um pedido e assoprar as velinhas!';
    }
    if (state.stage6.birthdayPhase === 'celebrating') {
      return 'Cena 6 · Parabéns, Ariel! Aperte Espaço / Enter para o encerramento do Volume 1';
    }
    if (state.stage6.birthdayPhase === 'blowing') {
      return 'Cena 6 · Fazendo um pedido e assoprando as velinhas...';
    }
    return 'Cena 6 · Aniversário do Ariel — 23/11/2026';
  }
  if (state.questPhase === 's6_transition_final') {
    return 'E assim chegamos ao hoje... Nossa história continua';
  }
  if (state.questPhase === 's6_final_volume2') {
    if (state.stage6.cutscene === 's6_volume1_endcard') {
      return 'PLAYER 1 + PLAYER 2 · VOLUME 1 — FIM · Aperte Espaço / Enter para concluir';
    }
    return 'Cena Final · O convite para o Volume 2';
  }
  return 'Fase 6 · Nossa História Continua';
}

export function getStage6CutsceneCaption(state: SimulationState): Stage6CutsceneCaption | null {
  if (state.stageId !== 'stage-6' || !state.stage6 || state.stage6.cutscene === 'none') {
    return null;
  }
  if (state.stage6.cutscene === 's6_family_hug') {
    return {
      badge: 'FASE 6 · CENA 1 · O ABRAÇO DA NOSSA FAMÍLIA',
      text: 'Na sala de casa, Grazi, Ariel, Cris e Lara se aproximam para um abraço coletivo...',
      canSkipIntro: true,
    };
  }
  if (state.stage6.cutscene === 's6_transition_to_pool') {
    return {
      badge: 'FASE 6 · CENA 2 · UM DIA FELIZ NA PISCINA',
      text: 'Um dia lindo de sol para nadar, rir e aproveitar em família...',
    };
  }
  return null;
}
