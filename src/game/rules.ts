import {
  ARIEL_PISTA_SPOT,
  GRAZI_SPAWN,
  PROP_INTERACTABLES,
  TILE_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  createInitialNpcs,
  isTileSolid,
} from './mapData';
import {
  ARIEL_AVOID_SPOTS,
  STAGE_2_CLOSING_QUOTE,
  STAGE_2_DIALOGUES,
  STAGE_2_MEMORIES,
  createStage2Npcs,
} from './stage2Data';
import {
  findNearestStage3Interactable,
  handleStage3DialogueComplete,
  isStage3CutsceneActive,
  moveStage3Player,
  skipStage3Intro,
  stepStage3Simulation,
  triggerStage3Interaction,
} from './stage3Rules';
import {
  findNearestStage4Interactable,
  handleStage4DialogueComplete,
  isStage4CutsceneActive,
  moveStage4Player,
  skipStage4Intro,
  stepStage4Simulation,
  triggerStage4Interaction,
} from './stage4Rules';
import {
  findNearestStage5Interactable,
  getStage5ObjectiveText,
  handleStage5DialogueComplete,
  isStage5CutsceneActive,
  moveStage5Player,
  skipStage5Intro,
  stepStage5Simulation,
  triggerStage5Interaction,
} from './stage5Rules';
import {
  findNearestStage6Interactable,
  getStage6ObjectiveText,
  handleStage6DialogueComplete,
  moveStage6Player,
  skipStage6Intro,
  stepStage6Simulation,
  triggerStage6Interaction,
} from './stage6Rules';
import { STAGE_1_DIALOGUES } from './story';
import type {
  DialogueLine,
  Direction,
  IntroCutsceneState,
  KissCutscenePhase,
  KissCutsceneState,
  NpcEntity,
  SimulationState,
  SlowDanceState,
  SpeakerId,
  Stage2CutsceneKind,
  Stage2State,
} from './types';

export const PLAYER_SPEED = 118;
export const ARIEL_APPROACH_SPEED = 86;
export const ARIEL_FLEE_SPEED = 128;
export const INTERACT_RADIUS = 60;
export const SCENE_1_DURATION = 4.0;
export const SCENE_2_DURATION = 5.2;
export const SCENE_3_DURATION = 4.4;
export const SLOW_DANCE_DURATION = 8.4;
export const KISS_CUTSCENE_DURATION = 7.0;

// Stage 2 cutscene durations (seconds)
export const S2_INTRO_DURATION = 11.2;
export const S2_ELOISA_DURATION = 7.8;
export const S2_JEALOUSY_DURATION = 10.8;
export const S2_RETRY_DURATION = 8.4;
export const S2_FOREHEAD_KISS_DURATION = 11.0;
export const S2_BREAKDANCE_DURATION = 9.0;
export const S2_ENDING_READY_DELAY = 1.8;

export function createIdleSlowDanceState(): SlowDanceState {
  return {
    active: false,
    elapsed: 0,
    duration: SLOW_DANCE_DURATION,
    swayPhase: 0,
    syncHits: 0,
    beatCursor: 0.5,
    hitFeedback: '',
    feedbackTimer: 0,
  };
}

export function createIdleKissCutsceneState(): KissCutsceneState {
  return {
    active: false,
    phase: 'zoom_in',
    elapsed: 0,
    totalDuration: KISS_CUTSCENE_DURATION,
    cameraZoom: 1.0,
  };
}

export function createInitialIntroState(skipIntro: boolean): IntroCutsceneState {
  if (skipIntro) {
    return {
      active: false,
      scene: 'scene3_interior_pan',
      elapsed: 0,
      doorOpenAmount: 1,
      cameraFocusX: GRAZI_SPAWN.x,
      cameraFocusY: GRAZI_SPAWN.y,
    };
  }
  return {
    active: true,
    scene: 'scene1_1995_street',
    elapsed: 0,
    doorOpenAmount: 0,
    cameraFocusX: 160,
    cameraFocusY: 250,
  };
}

export function createInitialSimulation(skipIntro = false): SimulationState {
  return {
    stageId: 'stage-1',
    questPhase: skipIntro ? 'explore_find_laura' : 'intro_1995_street',
    intro: createInitialIntroState(skipIntro),
    arielActivity: 'breakdance_cap',
    player: {
      x: GRAZI_SPAWN.x,
      y: GRAZI_SPAWN.y,
      width: 18,
      height: 14,
      dir: 'up',
      walkDistance: 0,
      isMoving: false,
      isDancing: false,
      reactionEmotion: 'none',
    },
    npcs: createInitialNpcs(),
    activeDialogue: null,
    dialogueLineIndex: 0,
    slowDance: createIdleSlowDanceState(),
    kissCutscene: createIdleKissCutsceneState(),
    stage2: null,
    stage3: null,
    stage4: null,
    elapsedSeconds: 0,
    beatTimer: 0,
    discoveredProps: [],
    heartsSpawned: 0,
  };
}

export function createStage2Simulation(
  skipIntro = false,
  unlockedMemories: string[] = [],
): SimulationState {
  const stage2State: Stage2State = {
    cutscene: skipIntro ? 'none' : 'intro_memories',
    cutsceneElapsed: 0,
    returnPhase: null,
    returnPlayerX: null,
    returnPlayerY: null,
    avoidCount: 0,
    arielFleeing: false,
    arielTargetX: ARIEL_AVOID_SPOTS[0].x,
    arielTargetY: ARIEL_AVOID_SPOTS[0].y,
    cameraFocusX: ARIEL_PISTA_SPOT.x,
    cameraFocusY: 7.9 * TILE_SIZE,
    cameraZoom: skipIntro ? 1.0 : 1.32,
    unlockedMemories: [...unlockedMemories],
    recentMemoryTitle: null,
    recentMemoryTimer: 0,
    seenAvoidThought: false,
    endingReadyToFinish: false,
  };

  return {
    stageId: 'stage-2',
    questPhase: skipIntro ? 's2_explore_reunion' : 's2_intro_memories',
    intro: createInitialIntroState(true),
    arielActivity: 'standing',
    player: {
      x: 5.5 * TILE_SIZE,
      y: 11.4 * TILE_SIZE,
      width: 18,
      height: 14,
      dir: 'up',
      walkDistance: 0,
      isMoving: false,
      isDancing: false,
      reactionEmotion: 'none',
    },
    npcs: createStage2Npcs('reunion'),
    activeDialogue: null,
    dialogueLineIndex: 0,
    slowDance: createIdleSlowDanceState(),
    kissCutscene: createIdleKissCutsceneState(),
    stage2: stage2State,
    stage3: null,
    stage4: null,
    elapsedSeconds: 0,
    beatTimer: 0,
    discoveredProps: [],
    heartsSpawned: 0,
  };
}

export function isStage2CutsceneActive(state: SimulationState): boolean {
  return state.stageId === 'stage-2' && Boolean(state.stage2 && state.stage2.cutscene !== 'none');
}

export function isStage2ExplorationPhase(phase: SimulationState['questPhase']): boolean {
  return (
    phase === 's2_explore_reunion' ||
    phase === 's2_explore_jealousy' ||
    phase === 's2_explore_avoidance'
  );
}

export function skipIntroCutscene(state: SimulationState): SimulationState {
  if (state.stageId === 'stage-5') {
    return skipStage5Intro(state);
  }
  if (state.stageId === 'stage-6') {
    return skipStage6Intro(state);
  }
  if (state.stageId === 'stage-4') {
    return skipStage4Intro(state);
  }
  if (state.stageId === 'stage-3') {
    return skipStage3Intro(state);
  }
  if (state.stageId === 'stage-2' && state.stage2?.cutscene === 'intro_memories') {
    return {
      ...state,
      questPhase: 's2_explore_reunion',
      player: {
        ...state.player,
        x: 5.5 * TILE_SIZE,
        y: 11.4 * TILE_SIZE,
        dir: 'up',
        isMoving: false,
        reactionEmotion: 'none',
      },
      stage2: {
        ...state.stage2,
        cutscene: 'none',
        cutsceneElapsed: 0,
        cameraFocusX: 5.5 * TILE_SIZE,
        cameraFocusY: 11.4 * TILE_SIZE,
        cameraZoom: 1.0,
      },
    };
  }

  if (!state.intro.active) return state;
  return {
    ...state,
    questPhase: 'explore_find_laura',
    arielActivity: 'breakdance_cap',
    intro: {
      active: false,
      scene: 'scene3_interior_pan',
      elapsed: 0,
      doorOpenAmount: 1,
      cameraFocusX: state.player.x,
      cameraFocusY: state.player.y,
    },
  };
}

export function canStandAt(
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

  const minCol = Math.floor(left / TILE_SIZE);
  const maxCol = Math.floor((right - 0.01) / TILE_SIZE);
  const minRow = Math.floor(top / TILE_SIZE);
  const maxRow = Math.floor((bottom - 0.01) / TILE_SIZE);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (isTileSolid(c, r)) {
        return false;
      }
    }
  }

  for (const npc of npcs) {
    if (!npc.visible) continue;
    const dx = Math.abs(x - npc.x);
    const dy = Math.abs(y - npc.y);
    if (dx < 18 && dy < 14) {
      return false;
    }
  }

  return true;
}

export function directionFromVector(dx: number, dy: number, fallback: Direction): Direction {
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

export function movePlayer(
  state: SimulationState,
  inputX: number,
  inputY: number,
  dt: number,
): SimulationState {
  if (state.stageId === 'stage-5') {
    return moveStage5Player(state, inputX, inputY, dt);
  }
  if (state.stageId === 'stage-6') {
    return moveStage6Player(state, inputX, inputY, dt);
  }
  if (state.stageId === 'stage-4') {
    return moveStage4Player(state, inputX, inputY, dt);
  }
  if (state.stageId === 'stage-3') {
    return moveStage3Player(state, inputX, inputY, dt);
  }

  if (
    state.intro.active ||
    state.activeDialogue ||
    state.slowDance.active ||
    state.kissCutscene.active ||
    isStage2CutsceneActive(state) ||
    isStage3CutsceneActive(state) ||
    isStage4CutsceneActive(state) ||
    state.questPhase === 'ariel_approaching' ||
    state.questPhase === 'stage_complete'
  ) {
    if (!state.player.isMoving) return state;
    return {
      ...state,
      player: { ...state.player, isMoving: false },
    };
  }

  const len = Math.hypot(inputX, inputY);
  const nx = len > 0.01 ? inputX / len : 0;
  const ny = len > 0.01 ? inputY / len : 0;
  const targetVx = nx * PLAYER_SPEED;
  const targetVy = ny * PLAYER_SPEED;
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

  const tryX = nextX + nextVx * dt;
  if (canStandAt(tryX, nextY, state.player.width, state.player.height, state.npcs)) {
    nextX = tryX;
  }

  const tryY = nextY + nextVy * dt;
  if (canStandAt(nextX, tryY, state.player.width, state.player.height, state.npcs)) {
    nextY = tryY;
  }

  const movedDist = Math.hypot(nextX - state.player.x, nextY - state.player.y);
  const nextDir = directionFromVector(nextVx, nextVy, state.player.dir);

  return {
    ...state,
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

export interface InteractableTarget {
  type: 'npc' | 'prop' | 'memory';
  id: string;
  label: string;
  dialogueId: string;
  distance: number;
  priority: number;
}

export function findNearestInteractable(state: SimulationState): InteractableTarget | null {
  if (state.stageId === 'stage-5') {
    return findNearestStage5Interactable(state);
  }
  if (state.stageId === 'stage-6') {
    return findNearestStage6Interactable(state);
  }
  if (state.stageId === 'stage-4') {
    return findNearestStage4Interactable(state);
  }
  if (state.stageId === 'stage-3') {
    return findNearestStage3Interactable(state);
  }

  if (
    state.intro.active ||
    state.activeDialogue ||
    state.slowDance.active ||
    state.kissCutscene.active ||
    isStage2CutsceneActive(state) ||
    state.questPhase === 'ariel_approaching' ||
    state.questPhase === 'stage_complete'
  ) {
    return null;
  }

  const px = state.player.x;
  const py = state.player.y;
  const candidates: InteractableTarget[] = [];

  if (state.stageId === 'stage-2') {
    for (const npc of state.npcs) {
      if (!npc.visible || !npc.interactable) continue;
      // During avoidance, Ariel is only interactable once he has settled at his final spot
      if (
        npc.role === 'ariel' &&
        state.questPhase === 's2_explore_avoidance' &&
        state.stage2 &&
        (state.stage2.avoidCount < 2 || state.stage2.arielFleeing)
      ) {
        continue;
      }

      const dist = Math.hypot(px - npc.x, py - npc.y);
      if (dist <= INTERACT_RADIUS) {
        let dialogueId = '';
        let label = `Falar com ${npc.name}`;
        let priority = 1;

        if (npc.role === 'laura') {
          if (state.questPhase === 's2_explore_reunion') {
            dialogueId = 's2_laura_reunion';
            priority = 10;
          } else if (state.questPhase === 's2_explore_jealousy') {
            dialogueId = 's2_laura_after_eloisa';
            priority = 3;
          } else {
            dialogueId = 's2_laura_avoidance';
            priority = 3;
          }
        } else if (npc.role === 'friend' && state.questPhase === 's2_explore_jealousy') {
          dialogueId = 's2_friend_invite';
          label = 'Dançar com Amigo de Ariel';
          priority = 12;
        } else if (npc.role === 'ariel' && state.questPhase === 's2_explore_avoidance') {
          dialogueId = 's2_farewell_confront';
          label = 'Conversar com Ariel';
          priority = 14;
        } else if (npc.role === 'junior') {
          dialogueId = 's2_junior_chat';
          priority = 2;
        } else if (npc.role === 'dj') {
          dialogueId = 's2_dj_chat';
          priority = 2;
        } else if (npc.role === 'bartender') {
          dialogueId = 's2_bartender_chat';
          label = 'Falar no Balcão';
          priority = 2;
        } else if (npc.role === 'bboy') {
          dialogueId = 's2_mem_breakdance';
          label = 'Assistir à Roda de Breakdance';
          priority = 7;
        } else if (npc.role === 'teen_chat') {
          dialogueId = 's2_turma_chat';
          label = 'Conversar com a Turma';
          priority = 2;
        }

        if (dialogueId) {
          candidates.push({ type: 'npc', id: npc.id, label, dialogueId, distance: dist, priority });
        }
      }
    }

    const unlockedSet = new Set(state.stage2?.unlockedMemories ?? []);
    for (const mem of STAGE_2_MEMORIES) {
      const dist = Math.hypot(px - mem.x, py - mem.y);
      if (dist <= mem.radius) {
        const already = unlockedSet.has(mem.id);
        candidates.push({
          type: 'memory',
          id: mem.id,
          label: already ? `Relembrar: ${mem.title}` : `Lembrança: ${mem.title}`,
          dialogueId: mem.dialogueId,
          distance: dist,
          priority: already ? 1 : 6,
        });
      }
    }

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.distance - b.distance;
    });
    return candidates[0];
  }

  for (const npc of state.npcs) {
    if (!npc.visible || !npc.interactable) continue;
    const dist = Math.hypot(px - npc.x, py - npc.y);
    if (dist <= INTERACT_RADIUS) {
      let dialogueId = '';
      let label = `Falar com ${npc.name}`;
      let priority = 1;

      if (npc.role === 'laura') {
        dialogueId = state.questPhase === 'explore_find_laura' ? 'laura_talk' : 'laura_after';
        priority = state.questPhase === 'explore_find_laura' ? 10 : 3;
      } else if (npc.role === 'ariel') {
        if (state.questPhase === 'ready_to_dance_ariel') {
          dialogueId = 'ariel_encounter';
          label = 'Responder ao convite de Ariel';
          priority = 12;
        } else {
          dialogueId = 'bboy_talk';
          label = 'Observar Ariel dançando';
          priority = 2;
        }
      } else if (npc.role === 'junior') {
        dialogueId = 'junior_talk';
        priority = 2;
      } else if (npc.role === 'bboy') {
        dialogueId = 'bboy_talk';
        label = 'Conversar com Galera da Pista';
        priority = 3;
      } else if (npc.role === 'teen_chat') {
        dialogueId = 'teen_group_talk';
        label = 'Conversar com a Turma';
        priority = 2;
      } else if (npc.role === 'dj') {
        dialogueId = 'dj_talk';
        priority = 2;
      } else if (npc.role === 'bartender') {
        dialogueId = 'bartender_talk';
        label = 'Falar no Balcão';
        priority = 2;
      }

      if (dialogueId) {
        candidates.push({ type: 'npc', id: npc.id, label, dialogueId, distance: dist, priority });
      }
    }
  }

  for (const prop of PROP_INTERACTABLES) {
    const dist = Math.hypot(px - prop.x, py - prop.y);
    if (dist <= prop.radius) {
      candidates.push({
        type: 'prop',
        id: prop.id,
        label: `Olhar ${prop.label}`,
        dialogueId: prop.dialogueId,
        distance: dist,
        priority: 0,
      });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.distance - b.distance;
  });

  return candidates[0];
}

export function triggerInteraction(state: SimulationState): {
  next: SimulationState;
  target: InteractableTarget | null;
} {
  if (state.stageId === 'stage-5') {
    return triggerStage5Interaction(state);
  }
  if (state.stageId === 'stage-6') {
    return triggerStage6Interaction(state);
  }
  if (state.stageId === 'stage-4') {
    return triggerStage4Interaction(state);
  }
  if (state.stageId === 'stage-3') {
    return triggerStage3Interaction(state);
  }

  const target = findNearestInteractable(state);
  if (!target) {
    return { next: state, target: null };
  }

  // Interacting with the Roda de Breakdance launches the dedicated funk showcase without interrupting the main story
  if (
    state.stageId === 'stage-2' &&
    state.stage2 &&
    (target.id === 'bboy-circle' || target.id === 'mem_breakdance')
  ) {
    return {
      target,
      next: startStage2BreakdanceCircle(state),
    };
  }

  const dialogue =
    state.stageId === 'stage-2'
      ? STAGE_2_DIALOGUES[target.dialogueId] ?? STAGE_1_DIALOGUES[target.dialogueId]
      : STAGE_1_DIALOGUES[target.dialogueId];

  if (!dialogue) {
    return { next: state, target: null };
  }

  const nextDiscovered =
    target.type === 'prop' && !state.discoveredProps.includes(target.id)
      ? [...state.discoveredProps, target.id]
      : state.discoveredProps;

  let nextStage2 = state.stage2;
  if (target.type === 'memory' && state.stage2) {
    const mem = STAGE_2_MEMORIES.find((m) => m.id === target.id);
    if (mem && !state.stage2.unlockedMemories.includes(mem.id)) {
      nextStage2 = {
        ...state.stage2,
        unlockedMemories: [...state.stage2.unlockedMemories, mem.id],
        recentMemoryTitle: mem.title,
        recentMemoryTimer: 3.4,
      };
    }
  }

  const updatedNpcs = state.npcs.map((npc) => {
    if (target.type === 'npc' && npc.id === target.id) {
      const dx = state.player.x - npc.x;
      const dy = state.player.y - npc.y;
      return { ...npc, dir: directionFromVector(dx, dy, npc.dir) };
    }
    return npc;
  });

  const nextPhase =
    target.dialogueId === 's2_farewell_confront' ? 's2_farewell_dialogue' : state.questPhase;

  return {
    target,
    next: {
      ...state,
      questPhase: nextPhase,
      npcs: updatedNpcs,
      activeDialogue: dialogue,
      dialogueLineIndex: 0,
      discoveredProps: nextDiscovered,
      stage2: nextStage2,
      player: { ...state.player, isMoving: false },
    },
  };
}

export function startSlowDance(state: SimulationState): SimulationState {
  const centerX = ARIEL_PISTA_SPOT.x;
  const centerY = 7.9 * TILE_SIZE;

  const updatedNpcs = state.npcs.map((npc) => {
    if (npc.role === 'ariel') {
      return { ...npc, x: centerX + 5, y: centerY, dir: 'left' as Direction, visible: true };
    }
    return npc;
  });

  return {
    ...state,
    questPhase: 'slow_dance',
    arielActivity: 'slow_dancing',
    activeDialogue: null,
    dialogueLineIndex: 0,
    npcs: updatedNpcs,
    player: {
      ...state.player,
      x: centerX - 5,
      y: centerY + 1,
      dir: 'right',
      isMoving: false,
      isDancing: true,
      reactionEmotion: 'blush',
    },
    slowDance: {
      active: true,
      elapsed: 0,
      duration: SLOW_DANCE_DURATION,
      swayPhase: 0,
      syncHits: 0,
      beatCursor: 0.5,
      hitFeedback: '',
      feedbackTimer: 0,
    },
  };
}

export function startKissCutscene(state: SimulationState): SimulationState {
  return {
    ...state,
    questPhase: 'kiss_cutscene',
    arielActivity: 'kissing',
    slowDance: {
      ...state.slowDance,
      active: false,
      hitFeedback: '',
      feedbackTimer: 0,
    },
    kissCutscene: {
      active: true,
      phase: 'zoom_in',
      elapsed: 0,
      totalDuration: KISS_CUTSCENE_DURATION,
      cameraZoom: 1.32,
    },
    player: {
      ...state.player,
      isDancing: false,
      reactionEmotion: 'blush',
    },
  };
}

export function getKissPhaseForElapsed(elapsed: number): {
  phase: KissCutscenePhase;
  cameraZoom: number;
} {
  if (elapsed < 1.4) {
    const t = elapsed / 1.4;
    return { phase: 'zoom_in', cameraZoom: 1.32 + t * 0.56 };
  }
  if (elapsed < 2.6) {
    return { phase: 'gaze', cameraZoom: 1.88 };
  }
  if (elapsed < 3.7) {
    const t = (elapsed - 2.6) / 1.1;
    return { phase: 'lean', cameraZoom: 1.88 + t * 0.14 };
  }
  if (elapsed < 5.8) {
    return { phase: 'kiss_silhouette', cameraZoom: 2.02 };
  }
  const t = Math.min(1, (elapsed - 5.8) / 1.2);
  return { phase: 'zoom_out', cameraZoom: 2.02 - t * 0.68 };
}

export function advanceDialogue(state: SimulationState): SimulationState {
  if (!state.activeDialogue) return state;

  const nextIdx = state.dialogueLineIndex + 1;
  if (nextIdx < state.activeDialogue.lines.length) {
    const nextLine = state.activeDialogue.lines[nextIdx];
    const nextReaction =
      nextLine.speaker === 'grazi' || nextLine.speaker === 'grazi_thought'
        ? nextLine.emotion && nextLine.emotion !== 'neutral'
          ? nextLine.emotion
          : 'none'
        : state.player.reactionEmotion;

    return {
      ...state,
      dialogueLineIndex: nextIdx,
      player: { ...state.player, reactionEmotion: nextReaction },
    };
  }

  const completedDialogueId = state.activeDialogue.id;
  const action = state.activeDialogue.onCompleteAction;
  const baseCleared: SimulationState = {
    ...state,
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: { ...state.player, reactionEmotion: 'none' },
  };

  if (state.stageId === 'stage-5') {
    return handleStage5DialogueComplete(baseCleared, completedDialogueId, action);
  }
  if (state.stageId === 'stage-6') {
    return handleStage6DialogueComplete(baseCleared, completedDialogueId, action);
  }
  if (state.stageId === 'stage-4') {
    return handleStage4DialogueComplete(baseCleared, completedDialogueId, action);
  }
  if (state.stageId === 'stage-3') {
    return handleStage3DialogueComplete(baseCleared, completedDialogueId, action);
  }

  if (action === 'start_ariel_approach') {
    return {
      ...baseCleared,
      questPhase: 'ariel_approaching',
      arielActivity: 'walking_to_grazi',
    };
  }

  if (action === 'start_slow_dance') {
    return startSlowDance(baseCleared);
  }

  if (action === 'complete_stage' || action === 's2_complete_stage') {
    return {
      ...baseCleared,
      questPhase: 'stage_complete',
      arielActivity: 'standing',
      player: { ...baseCleared.player, isDancing: false, reactionEmotion: 'none' },
    };
  }

  if (action === 's2_trigger_eloisa') {
    return startStage2EloisaCutscene(baseCleared);
  }

  if (action === 's2_trigger_jealousy') {
    return startStage2JealousyCutscene(baseCleared);
  }

  if (action === 's2_start_forehead_kiss') {
    return startStage2ForeheadKissCutscene(baseCleared);
  }

  return baseCleared;
}

export function triggerSlowDanceBeatInput(state: SimulationState): {
  next: SimulationState;
  hitQuality: 'NO COMPASSO' | 'ABRAÇADINHOS';
} {
  if (!state.slowDance.active) {
    return { next: state, hitQuality: 'NO COMPASSO' };
  }

  const distFromCenter = Math.abs(state.slowDance.beatCursor - 0.5);
  const hitQuality: 'NO COMPASSO' | 'ABRAÇADINHOS' =
    distFromCenter <= 0.25 ? 'ABRAÇADINHOS' : 'NO COMPASSO';

  const nextSync = Math.min(4, state.slowDance.syncHits + 1);

  return {
    hitQuality,
    next: {
      ...state,
      heartsSpawned: state.heartsSpawned + 2,
      slowDance: {
        ...state.slowDance,
        syncHits: nextSync,
        hitFeedback: hitQuality,
        feedbackTimer: 0.9,
      },
    },
  };
}

export function stepIntroCutscene(state: SimulationState, dt: number): SimulationState {
  if (!state.intro.active) return state;

  const nextElapsed = state.intro.elapsed + dt;

  if (state.intro.scene === 'scene1_1995_street') {
    if (nextElapsed >= SCENE_1_DURATION) {
      return {
        ...state,
        questPhase: 'intro_arrival',
        intro: {
          active: true,
          scene: 'scene2_arrival',
          elapsed: 0,
          doorOpenAmount: 0,
          cameraFocusX: 160,
          cameraFocusY: 360,
        },
      };
    }
    const panProgress = Math.max(0, Math.min(1, (nextElapsed - 1.1) / (SCENE_1_DURATION - 1.1)));
    return {
      ...state,
      questPhase: 'intro_1995_street',
      intro: {
        ...state.intro,
        elapsed: nextElapsed,
        cameraFocusX: 190 + panProgress * 310,
        cameraFocusY: 250,
      },
    };
  }

  if (state.intro.scene === 'scene2_arrival') {
    if (nextElapsed >= SCENE_2_DURATION) {
      return {
        ...state,
        questPhase: 'intro_interior_pan',
        intro: {
          active: true,
          scene: 'scene3_interior_pan',
          elapsed: 0,
          doorOpenAmount: 1,
          cameraFocusX: GRAZI_SPAWN.x,
          cameraFocusY: GRAZI_SPAWN.y,
        },
      };
    }
    const walkT = Math.min(1, nextElapsed / 3.8);
    const doorT = nextElapsed > 3.2 ? Math.min(1, (nextElapsed - 3.2) / 0.9) : 0;
    return {
      ...state,
      questPhase: 'intro_arrival',
      intro: {
        ...state.intro,
        elapsed: nextElapsed,
        doorOpenAmount: doorT,
        cameraFocusX: 90 + walkT * 170,
        cameraFocusY: 370 - walkT * 20,
      },
    };
  }

  // scene3_interior_pan
  if (nextElapsed >= SCENE_3_DURATION) {
    return skipIntroCutscene(state);
  }

  const p = nextElapsed / SCENE_3_DURATION;
  // Smooth camera glide from entrance -> over dance floor & Ariel -> settle back onto Grazi
  let fx: number;
  let fy: number;
  if (p < 0.58) {
    const t = p / 0.58;
    const ease = t * t * (3 - 2 * t);
    fx = GRAZI_SPAWN.x + (ARIEL_PISTA_SPOT.x - GRAZI_SPAWN.x) * ease;
    fy = GRAZI_SPAWN.y + (ARIEL_PISTA_SPOT.y - 24 - GRAZI_SPAWN.y) * ease;
  } else {
    const t = (p - 0.58) / 0.42;
    const ease = t * t * (3 - 2 * t);
    fx = ARIEL_PISTA_SPOT.x + (GRAZI_SPAWN.x - ARIEL_PISTA_SPOT.x) * ease;
    fy = ARIEL_PISTA_SPOT.y - 24 + (GRAZI_SPAWN.y - (ARIEL_PISTA_SPOT.y - 24)) * ease;
  }

  return {
    ...state,
    questPhase: 'intro_interior_pan',
    intro: {
      ...state.intro,
      elapsed: nextElapsed,
      cameraFocusX: fx,
      cameraFocusY: fy,
    },
  };
}

export function stepArielApproach(state: SimulationState, dt: number): SimulationState {
  if (state.questPhase !== 'ariel_approaching') return state;

  const ariel = state.npcs.find((n) => n.role === 'ariel');
  if (!ariel) return state;

  const dx = state.player.x - ariel.x;
  const dy = state.player.y - ariel.y;
  const dist = Math.hypot(dx, dy);

  // Stop face-to-face right next to Grazi and trigger his invitation naturally
  if (dist <= 32) {
    const arielDir = directionFromVector(dx, dy, 'left');
    const graziDir = directionFromVector(-dx, -dy, 'right');

    return {
      ...state,
      questPhase: 'ready_to_dance_ariel',
      arielActivity: 'waiting_invite',
      npcs: state.npcs.map((n) => (n.role === 'ariel' ? { ...n, dir: arielDir } : n)),
      player: { ...state.player, dir: graziDir, isMoving: false },
      activeDialogue: STAGE_1_DIALOGUES.ariel_encounter,
      dialogueLineIndex: 0,
    };
  }

  const step = Math.min(dist - 30, ARIEL_APPROACH_SPEED * dt);
  const nx = ariel.x + (dx / dist) * step;
  const ny = ariel.y + (dy / dist) * step;
  const nextDir = directionFromVector(dx, dy, ariel.dir);

  return {
    ...state,
    npcs: state.npcs.map((n) =>
      n.role === 'ariel'
        ? { ...n, x: nx, y: ny, dir: nextDir, dancePhaseOffset: n.dancePhaseOffset + dt * 4 }
        : n,
    ),
  };
}

export function stepSlowDance(state: SimulationState, dt: number): SimulationState {
  if (!state.slowDance.active) return state;

  const nextElapsed = state.slowDance.elapsed + dt;
  const nextCursor = 0.5 + 0.42 * Math.sin((state.elapsedSeconds + dt) * 2.3);
  const nextFeedbackTimer = Math.max(0, state.slowDance.feedbackTimer - dt);

  if (nextElapsed >= state.slowDance.duration) {
    return startKissCutscene(state);
  }

  return {
    ...state,
    slowDance: {
      ...state.slowDance,
      elapsed: nextElapsed,
      swayPhase: nextElapsed * 2.1,
      beatCursor: nextCursor,
      feedbackTimer: nextFeedbackTimer,
      hitFeedback: nextFeedbackTimer > 0 ? state.slowDance.hitFeedback : '',
    },
  };
}

export function stepKissCutscene(state: SimulationState, dt: number): SimulationState {
  if (!state.kissCutscene.active) return state;

  const nextElapsed = state.kissCutscene.elapsed + dt;
  if (nextElapsed >= state.kissCutscene.totalDuration) {
    const centerX = ARIEL_PISTA_SPOT.x;
    const centerY = 7.9 * TILE_SIZE;
    return {
      ...state,
      questPhase: 'post_dance_confession',
      arielActivity: 'standing',
      heartsSpawned: state.heartsSpawned + 8,
      kissCutscene: {
        ...state.kissCutscene,
        active: false,
        cameraZoom: 1.0,
      },
      npcs: state.npcs.map((npc) =>
        npc.role === 'ariel' ? { ...npc, x: centerX + 14, y: centerY, dir: 'left' } : npc,
      ),
      player: {
        ...state.player,
        x: centerX - 14,
        y: centerY + 1,
        dir: 'right',
        reactionEmotion: 'blush',
      },
      activeDialogue: STAGE_1_DIALOGUES.post_dance,
      dialogueLineIndex: 0,
    };
  }

  const { phase, cameraZoom } = getKissPhaseForElapsed(nextElapsed);
  return {
    ...state,
    kissCutscene: {
      ...state.kissCutscene,
      elapsed: nextElapsed,
      phase,
      cameraZoom,
    },
  };
}

// ============================================================================
// STAGE 2 CUTSCENE STARTERS, TIMERS, AVOIDANCE MECHANIC & CAPTIONS
// ============================================================================
export function startStage2EloisaCutscene(state: SimulationState): SimulationState {
  if (!state.stage2) return state;
  return {
    ...state,
    questPhase: 's2_cutscene_eloisa',
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: 9.1 * TILE_SIZE,
      y: 8.2 * TILE_SIZE,
      dir: 'right',
      isMoving: false,
      reactionEmotion: 'surprised',
    },
    npcs: state.npcs.map((n) => {
      if (n.role === 'ariel') {
        return { ...n, x: 16.5 * TILE_SIZE, y: 7.4 * TILE_SIZE, dir: 'left', visible: true, interactable: false };
      }
      if (n.role === 'eloisa') {
        return {
          ...n,
          x: 16.5 * TILE_SIZE + 26,
          y: 7.5 * TILE_SIZE,
          dir: 'left',
          visible: true,
          interactable: false,
        };
      }
      return n;
    }),
    stage2: {
      ...state.stage2,
      cutscene: 'eloisa_reunion',
      cutsceneElapsed: 0,
      cameraFocusX: 11.4 * TILE_SIZE,
      cameraFocusY: 7.9 * TILE_SIZE,
      cameraZoom: 1.12,
    },
  };
}

export function startStage2JealousyCutscene(state: SimulationState): SimulationState {
  if (!state.stage2) return state;
  return {
    ...state,
    questPhase: 's2_cutscene_jealousy',
    arielActivity: 'jealous_watching',
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: 9.4 * TILE_SIZE,
      y: 8.0 * TILE_SIZE,
      dir: 'right',
      isMoving: false,
      isDancing: true,
      reactionEmotion: 'none',
    },
    npcs: state.npcs.map((n) => {
      if (n.role === 'ariel') {
        return { ...n, x: 14.4 * TILE_SIZE, y: 7.9 * TILE_SIZE, dir: 'left', visible: true, interactable: false };
      }
      if (n.role === 'friend' || n.role === 'eloisa') {
        return { ...n, visible: false, interactable: false };
      }
      return n;
    }),
    stage2: {
      ...state.stage2,
      cutscene: 'jealousy_slow_dance',
      cutsceneElapsed: 0,
      cameraFocusX: 11.9 * TILE_SIZE,
      cameraFocusY: 8.0 * TILE_SIZE,
      cameraZoom: 1.05,
    },
  };
}

export function startStage2RetryMontage(state: SimulationState): SimulationState {
  if (!state.stage2) return state;
  return {
    ...state,
    questPhase: 's2_cutscene_retry',
    arielActivity: 'standing',
    player: {
      ...state.player,
      x: ARIEL_PISTA_SPOT.x - 14,
      y: 7.9 * TILE_SIZE,
      dir: 'right',
      isMoving: false,
      isDancing: false,
      reactionEmotion: 'happy',
    },
    stage2: {
      ...state.stage2,
      cutscene: 'retry_montage',
      cutsceneElapsed: 0,
      cameraFocusX: ARIEL_PISTA_SPOT.x,
      cameraFocusY: 7.9 * TILE_SIZE,
      cameraZoom: 1.24,
    },
  };
}

export function startStage2ForeheadKissCutscene(state: SimulationState): SimulationState {
  if (!state.stage2) return state;
  const centerX = 12.2 * TILE_SIZE;
  const centerY = 8.2 * TILE_SIZE;
  return {
    ...state,
    questPhase: 's2_cutscene_forehead_kiss',
    arielActivity: 'standing',
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: centerX - 16,
      y: centerY,
      dir: 'right',
      isMoving: false,
      isDancing: false,
      reactionEmotion: 'sad',
    },
    npcs: state.npcs.map((n) => {
      if (n.role === 'ariel') {
        return { ...n, x: centerX + 18, y: centerY, dir: 'left', visible: true, interactable: false };
      }
      return n;
    }),
    stage2: {
      ...state.stage2,
      cutscene: 'forehead_kiss_farewell',
      cutsceneElapsed: 0,
      cameraFocusX: centerX,
      cameraFocusY: centerY - 6,
      cameraZoom: 1.22,
    },
  };
}

export function startStage2BreakdanceCircle(state: SimulationState): SimulationState {
  if (!state.stage2) return state;
  const mem = STAGE_2_MEMORIES.find((m) => m.id === 'mem_breakdance');
  const alreadyUnlocked = state.stage2.unlockedMemories.includes('mem_breakdance');
  return {
    ...state,
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      isMoving: false,
      reactionEmotion: 'happy',
    },
    stage2: {
      ...state.stage2,
      cutscene: 'breakdance_circle',
      cutsceneElapsed: 0,
      returnPhase: state.questPhase,
      returnPlayerX: state.player.x,
      returnPlayerY: state.player.y,
      cameraFocusX: ARIEL_PISTA_SPOT.x,
      cameraFocusY: 8.1 * TILE_SIZE,
      cameraZoom: 1.24,
      unlockedMemories: alreadyUnlocked
        ? state.stage2.unlockedMemories
        : [...state.stage2.unlockedMemories, 'mem_breakdance'],
      recentMemoryTitle: !alreadyUnlocked && mem ? mem.title : state.stage2.recentMemoryTitle,
      recentMemoryTimer: !alreadyUnlocked && mem ? 4.0 : state.stage2.recentMemoryTimer,
    },
  };
}

export function exitStage2BreakdanceCircle(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-2' || !state.stage2 || state.stage2.cutscene !== 'breakdance_circle') {
    return state;
  }
  const restoreX = state.stage2.returnPlayerX ?? state.player.x;
  const restoreY = state.stage2.returnPlayerY ?? state.player.y;
  const restorePhase = state.stage2.returnPhase ?? state.questPhase;
  return {
    ...state,
    questPhase: restorePhase,
    player: {
      ...state.player,
      x: restoreX,
      y: restoreY,
      reactionEmotion: 'none',
    },
    stage2: {
      ...state.stage2,
      cutscene: 'none',
      cutsceneElapsed: 0,
      returnPhase: null,
      returnPlayerX: null,
      returnPlayerY: null,
      cameraFocusX: restoreX,
      cameraFocusY: restoreY,
      cameraZoom: 1.0,
    },
  };
}

export function finishStage2Ending(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-2' || !state.stage2) return state;
  if (state.stage2.cutscene !== 'ending_transition' || !state.stage2.endingReadyToFinish) {
    return state;
  }
  return {
    ...state,
    questPhase: 'stage_complete',
    stage2: {
      ...state.stage2,
      cutscene: 'none',
      cameraZoom: 1.0,
    },
  };
}

export interface Stage2CutsceneCaption {
  badge?: string;
  speaker?: string;
  speakerId?: SpeakerId;
  emotion?: DialogueLine['emotion'];
  text: string;
  canFinishEnding?: boolean;
  canSkipIntro?: boolean;
  canHoldLaugh?: boolean;
}

export function getStage2CutsceneCaption(state: SimulationState): Stage2CutsceneCaption | null {
  if (state.stageId !== 'stage-2' || !state.stage2 || state.stage2.cutscene === 'none') {
    return null;
  }

  const { cutscene, cutsceneElapsed, endingReadyToFinish } = state.stage2;

  if (cutscene === 'intro_memories') {
    if (cutsceneElapsed < 3.8) {
      return {
        badge: 'FASE 2 · ENTRE ENCONTROS E DESENCONTROS',
        text: 'Depois daquele primeiro beijo na Discoteca Cruzeiro, Grazi e Ariel começaram a namorar.',
        canSkipIntro: true,
      };
    }
    if (cutsceneElapsed < 7.4) {
      return {
        badge: 'ANOS 90 · COMEÇO DE NAMORO',
        text: 'Entre risadas, músicas dos anos 90 e o frio na barriga da adolescência, uma história estava começando...',
        canSkipIntro: true,
      };
    }
    return {
      badge: 'ALGUM TEMPO DEPOIS...',
      text: 'O tempo passou... e aos poucos Ariel deixou de frequentar a discoteca.',
      canSkipIntro: true,
    };
  }

  if (cutscene === 'eloisa_reunion') {
    if (cutsceneElapsed < 2.4) {
      return {
        badge: 'O REENCONTRO NA DISCOTECA',
        text: 'Algum tempo depois, Ariel volta a frequentar a Discoteca Cruzeiro...',
      };
    }
    if (cutsceneElapsed < 5.0) {
      return {
        badge: 'O REENCONTRO NA DISCOTECA',
        text: '...agora acompanhado de outra namorada, Eloisa.',
      };
    }
    return {
      badge: 'O REENCONTRO NA DISCOTECA',
      text: 'Grazi percebe os dois na pista e fica quieta, surpresa com o reencontro.',
    };
  }

  if (cutscene === 'jealousy_slow_dance') {
    if (cutsceneElapsed < 2.5) {
      return {
        badge: 'A MÚSICA LENTA E O CIÚME',
        text: 'Em outro momento, as luzes diminuem e começa uma música lenta na pista...',
      };
    }
    if (cutsceneElapsed < 5.3) {
      return {
        badge: 'A MÚSICA LENTA E O CIÚME',
        text: 'Grazi dança a música lenta com um amigo de Ariel em um lado da pista.',
      };
    }
    if (cutsceneElapsed < 8.2) {
      return {
        badge: 'A MÚSICA LENTA E O CIÚME',
        text: 'Do outro lado, Ariel dança com Eloisa — mas percebe Grazi com o amigo e demonstra ciúmes.',
      };
    }
    return {
      badge: 'A MÚSICA LENTA E O CIÚME',
      text: 'Cada um dançando com outro par, trocando olhares pelo salão da Cruzeiro.',
    };
  }

  if (cutscene === 'breakdance_circle') {
    if (cutsceneElapsed < 2.6) {
      return {
        badge: 'LEMBRANÇA ESPECIAL · RODA DE BREAKDANCE',
        text: 'O funk dos anos 90 toma conta da Cruzeiro e a turma abre uma roda no meio da pista!',
        canSkipIntro: true,
      };
    }
    if (cutsceneElapsed < 5.2) {
      return {
        badge: 'LEMBRANÇA ESPECIAL · RODA DE BREAKDANCE',
        text: 'No centro, o rapaz manda passos rápidos e giros no chão enquanto a galera vibra no ritmo!',
        canSkipIntro: true,
      };
    }
    return {
      badge: 'LEMBRANÇA ESPECIAL · RODA DE BREAKDANCE',
      text: 'Ele crava o freeze no meio da pista e todo mundo aplaude!',
      canSkipIntro: true,
    };
  }

  if (cutscene === 'retry_montage') {
    if (cutsceneElapsed < 3.2) {
      return {
        badge: 'UMA NOVA TENTATIVA',
        text: 'Depois, Grazi e Ariel conversam e decidem voltar a namorar.',
      };
    }
    if (cutsceneElapsed < 6.2) {
      return {
        badge: 'UMA NOVA TENTATIVA',
        text: 'Por algumas semanas, os dois tentam novamente juntos na discoteca.',
      };
    }
    return {
      badge: 'COM O PASSAR DO TEMPO...',
      text: 'Mas, com o passar dos dias, Ariel começa a se afastar na discoteca.',
    };
  }

  if (cutscene === 'forehead_kiss_farewell') {
    if (cutsceneElapsed < 2.0) {
      return {
        badge: 'A DESPEDIDA NA DISCOTECA',
        text: 'Ariel se aproxima devagar de Grazi...',
      };
    }
    if (cutsceneElapsed < 5.2) {
      return {
        badge: 'A DESPEDIDA NA DISCOTECA',
        text: 'Com carinho, Ariel dá um beijo suave na testa de Grazi.',
      };
    }
    if (cutsceneElapsed < 8.2) {
      return {
        badge: 'A DESPEDIDA NA DISCOTECA',
        speaker: 'Ariel',
        text: 'Não dá mais, tá?',
      };
    }
    return {
      badge: 'A DESPEDIDA NA DISCOTECA',
      text: 'Sem brigas. Apenas um adeus tranquilo no meio da pista.',
    };
  }

  if (cutscene === 'ending_transition') {
    return {
      badge: 'ENTRE ENCONTROS E DESENCONTROS',
      text: STAGE_2_CLOSING_QUOTE,
      canFinishEnding: endingReadyToFinish,
    };
  }

  return null;
}

function stepStage2Cutscene(state: SimulationState, dt: number): SimulationState {
  if (!state.stage2 || state.stage2.cutscene === 'none') return state;

  const t = state.stage2.cutsceneElapsed + dt;
  const kind: Stage2CutsceneKind = state.stage2.cutscene;

  if (kind === 'intro_memories') {
    if (t >= S2_INTRO_DURATION) {
      return skipIntroCutscene(state);
    }
    const camX = t < 7.4 ? ARIEL_PISTA_SPOT.x : ARIEL_PISTA_SPOT.x - (t - 7.4) * 14;
    const camZoom = t < 3.8 ? 1.38 : t < 7.4 ? 1.24 : 1.15;
    return {
      ...state,
      stage2: {
        ...state.stage2,
        cutsceneElapsed: t,
        cameraFocusX: camX,
        cameraFocusY: 7.9 * TILE_SIZE,
        cameraZoom: camZoom,
      },
    };
  }

  if (kind === 'eloisa_reunion') {
    if (t >= S2_ELOISA_DURATION) {
      return {
        ...state,
        questPhase: 's2_explore_jealousy',
        npcs: createStage2Npcs('jealousy'),
        activeDialogue: STAGE_2_DIALOGUES.s2_after_eloisa_chat,
        dialogueLineIndex: 0,
        player: {
          ...state.player,
          x: 6.4 * TILE_SIZE,
          y: 8.6 * TILE_SIZE,
          dir: 'left',
          reactionEmotion: 'none',
        },
        stage2: {
          ...state.stage2,
          cutscene: 'none',
          cutsceneElapsed: 0,
          cameraFocusX: 6.4 * TILE_SIZE,
          cameraFocusY: 8.6 * TILE_SIZE,
          cameraZoom: 1.0,
        },
      };
    }

    const walkT = Math.min(1, t / 2.2);
    const easeWalk = walkT * walkT * (3 - 2 * walkT);
    const arielX = 16.5 * TILE_SIZE - easeWalk * (2.9 * TILE_SIZE);
    const eloisaX = arielX + 26;

    let camX = 12.6 * TILE_SIZE;
    let camY = 7.7 * TILE_SIZE;
    let camZoom = 1.25;
    let graziX = 9.1 * TILE_SIZE;
    let graziEmo: SimulationState['player']['reactionEmotion'] = 'surprised';

    if (t < 2.4) {
      camX = 11.4 * TILE_SIZE + easeWalk * (2.5 * TILE_SIZE);
      camZoom = 1.15 + easeWalk * 0.25;
    } else if (t < 5.0) {
      camX = 14.0 * TILE_SIZE;
      camY = 7.5 * TILE_SIZE;
      camZoom = 1.42;
    } else {
      const panBack = Math.min(1, (t - 5.0) / 1.1);
      const easeBack = panBack * panBack * (3 - 2 * panBack);
      camX = 14.0 * TILE_SIZE - easeBack * (2.6 * TILE_SIZE);
      camY = 7.5 * TILE_SIZE + easeBack * (0.5 * TILE_SIZE);
      camZoom = 1.42 - easeBack * 0.2;
      graziX = 9.1 * TILE_SIZE - easeBack * 10;
      graziEmo = t > 5.7 ? 'uneasy' : 'surprised';
    }

    return {
      ...state,
      player: {
        ...state.player,
        x: graziX,
        y: 8.2 * TILE_SIZE,
        dir: 'right',
        reactionEmotion: graziEmo,
      },
      npcs: state.npcs.map((n) => {
        if (n.role === 'ariel') {
          return { ...n, x: arielX, y: 7.5 * TILE_SIZE, dir: 'left', visible: true };
        }
        if (n.role === 'eloisa') {
          return { ...n, x: eloisaX, y: 7.55 * TILE_SIZE, dir: 'left', visible: true };
        }
        return n;
      }),
      stage2: {
        ...state.stage2,
        cutsceneElapsed: t,
        cameraFocusX: camX,
        cameraFocusY: camY,
        cameraZoom: camZoom,
      },
    };
  }

  if (kind === 'jealousy_slow_dance') {
    if (t >= S2_JEALOUSY_DURATION) {
      return startStage2RetryMontage(state);
    }

    let camX = 11.9 * TILE_SIZE;
    let camY = 7.95 * TILE_SIZE;
    let camZoom = 1.06;

    if (t < 2.5) {
      camX = 11.9 * TILE_SIZE;
      camZoom = 1.06;
    } else if (t < 5.3) {
      const p = Math.min(1, (t - 2.5) / 0.7);
      const e = p * p * (3 - 2 * p);
      camX = 11.9 * TILE_SIZE + (9.4 * TILE_SIZE - 11.9 * TILE_SIZE) * e;
      camZoom = 1.06 + 0.48 * e;
    } else if (t < 8.2) {
      const p = Math.min(1, (t - 5.3) / 0.75);
      const e = p * p * (3 - 2 * p);
      camX = 9.4 * TILE_SIZE + (14.4 * TILE_SIZE - 9.4 * TILE_SIZE) * e;
      camZoom = 1.54 + 0.14 * e;
    } else {
      const p = Math.min(1, (t - 8.2) / 0.85);
      const e = p * p * (3 - 2 * p);
      camX = 14.4 * TILE_SIZE + (11.9 * TILE_SIZE - 14.4 * TILE_SIZE) * e;
      camZoom = 1.68 - 0.56 * e;
    }

    return {
      ...state,
      stage2: {
        ...state.stage2,
        cutsceneElapsed: t,
        cameraFocusX: camX,
        cameraFocusY: camY,
        cameraZoom: camZoom,
      },
    };
  }

  if (kind === 'retry_montage') {
    if (t >= S2_RETRY_DURATION) {
      return {
        ...state,
        questPhase: 's2_explore_avoidance',
        arielActivity: 'avoiding_grazi',
        npcs: createStage2Npcs('avoidance'),
        player: {
          ...state.player,
          x: 6.2 * TILE_SIZE,
          y: 9.2 * TILE_SIZE,
          dir: 'right',
          isMoving: false,
          isDancing: false,
          reactionEmotion: 'thoughtful',
        },
        stage2: {
          ...state.stage2,
          cutscene: 'none',
          cutsceneElapsed: 0,
          avoidCount: 0,
          arielFleeing: false,
          arielTargetX: ARIEL_AVOID_SPOTS[0].x,
          arielTargetY: ARIEL_AVOID_SPOTS[0].y,
          cameraFocusX: 6.2 * TILE_SIZE,
          cameraFocusY: 9.2 * TILE_SIZE,
          cameraZoom: 1.0,
        },
      };
    }

    const camZoom = t < 3.2 ? 1.32 : t < 6.2 ? 1.44 : 1.2;
    return {
      ...state,
      stage2: {
        ...state.stage2,
        cutsceneElapsed: t,
        cameraFocusX: ARIEL_PISTA_SPOT.x,
        cameraFocusY: 7.9 * TILE_SIZE,
        cameraZoom: camZoom,
      },
    };
  }

  if (kind === 'forehead_kiss_farewell') {
    if (t >= S2_FOREHEAD_KISS_DURATION) {
      return {
        ...state,
        questPhase: 's2_ending_transition',
        player: {
          ...state.player,
          reactionEmotion: 'thoughtful',
        },
        stage2: {
          ...state.stage2,
          cutscene: 'ending_transition',
          cutsceneElapsed: 0,
          cameraFocusX: ARIEL_PISTA_SPOT.x,
          cameraFocusY: 7.8 * TILE_SIZE,
          cameraZoom: 1.04,
          endingReadyToFinish: false,
        },
      };
    }

    const centerX = 12.2 * TILE_SIZE;
    const centerY = 8.2 * TILE_SIZE;
    let camX = centerX;
    let camY = centerY - 8;
    let camZoom = 1.25;

    if (t < 2.0) {
      const p = t / 2.0;
      const e = p * p * (3 - 2 * p);
      camZoom = 1.25 + e * 0.52;
    } else if (t < 5.2) {
      camZoom = 1.92;
      camY = centerY - 12;
    } else if (t < 8.2) {
      camZoom = 1.72;
      camY = centerY - 9;
    } else {
      const p = Math.min(1, (t - 8.2) / 2.4);
      const e = p * p * (3 - 2 * p);
      camX = centerX - 10 * e;
      camZoom = 1.72 - e * 0.54;
    }

    return {
      ...state,
      stage2: {
        ...state.stage2,
        cutsceneElapsed: t,
        cameraFocusX: camX,
        cameraFocusY: camY,
        cameraZoom: camZoom,
      },
    };
  }

  if (kind === 'breakdance_circle') {
    if (t >= S2_BREAKDANCE_DURATION) {
      return exitStage2BreakdanceCircle(state);
    }
    const pulseZoom = 1.24 + Math.sin(t * 2.2) * 0.04;
    return {
      ...state,
      stage2: {
        ...state.stage2,
        cutsceneElapsed: t,
        cameraFocusX: ARIEL_PISTA_SPOT.x,
        cameraFocusY: 8.1 * TILE_SIZE,
        cameraZoom: pulseZoom,
      },
    };
  }

  // ending_transition
  const ready = t >= S2_ENDING_READY_DELAY;
  const driftX = ARIEL_PISTA_SPOT.x + Math.sin(t * 0.28) * 28;
  return {
    ...state,
    stage2: {
      ...state.stage2,
      cutsceneElapsed: t,
      cameraFocusX: driftX,
      cameraFocusY: 7.7 * TILE_SIZE,
      cameraZoom: 1.04,
      endingReadyToFinish: ready,
    },
  };
}

function stepStage2Exploration(state: SimulationState, dt: number): SimulationState {
  if (state.stageId !== 'stage-2' || !state.stage2 || state.activeDialogue) {
    return state;
  }

  let next = state;

  // Decay memory unlocked toast timer
  if (next.stage2 && next.stage2.recentMemoryTimer > 0) {
    const rem = Math.max(0, next.stage2.recentMemoryTimer - dt);
    next = {
      ...next,
      stage2: {
        ...next.stage2,
        recentMemoryTimer: rem,
        recentMemoryTitle: rem > 0 ? next.stage2.recentMemoryTitle : null,
      },
    };
  }

  // In Exploration 1 (s2_explore_reunion), stepping onto the main dance floor naturally triggers the Eloisa reunion scene
  if (
    next.questPhase === 's2_explore_reunion' &&
    next.player.x >= 9.0 * TILE_SIZE &&
    next.player.y >= 5.2 * TILE_SIZE &&
    next.player.y <= 10.6 * TILE_SIZE
  ) {
    return startStage2EloisaCutscene(next);
  }

  // In Exploration 3 (s2_explore_avoidance), Ariel avoids Grazi twice before letting her catch up
  if (next.questPhase === 's2_explore_avoidance' && next.stage2) {
    const ariel = next.npcs.find((n) => n.role === 'ariel');
    if (!ariel) return next;

    if (next.stage2.arielFleeing) {
      const dx = next.stage2.arielTargetX - ariel.x;
      const dy = next.stage2.arielTargetY - ariel.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= 6) {
        const settledDir = directionFromVector(
          next.player.x - next.stage2.arielTargetX,
          next.player.y - next.stage2.arielTargetY,
          'down',
        );
        const triggerThought = next.stage2.avoidCount === 1 && !next.stage2.seenAvoidThought;
        return {
          ...next,
          npcs: next.npcs.map((n) =>
            n.role === 'ariel'
              ? {
                  ...n,
                  x: next.stage2!.arielTargetX,
                  y: next.stage2!.arielTargetY,
                  dir: settledDir,
                  interactable: next.stage2!.avoidCount >= 2,
                }
              : n,
          ),
          activeDialogue: triggerThought ? STAGE_2_DIALOGUES.s2_avoid_thought : next.activeDialogue,
          dialogueLineIndex: triggerThought ? 0 : next.dialogueLineIndex,
          stage2: {
            ...next.stage2,
            arielFleeing: false,
            seenAvoidThought: next.stage2.seenAvoidThought || triggerThought,
          },
        };
      }

      const step = Math.min(dist, ARIEL_FLEE_SPEED * dt);
      const nx = ariel.x + (dx / dist) * step;
      const ny = ariel.y + (dy / dist) * step;
      const fleeDir = directionFromVector(dx, dy, ariel.dir);

      return {
        ...next,
        npcs: next.npcs.map((n) =>
          n.role === 'ariel'
            ? { ...n, x: nx, y: ny, dir: fleeDir, dancePhaseOffset: n.dancePhaseOffset + dt * 5 }
            : n,
        ),
      };
    }

    const distToPlayer = Math.hypot(next.player.x - ariel.x, next.player.y - ariel.y);
    if (next.stage2.avoidCount < 2 && distToPlayer <= 74) {
      const nextCount = next.stage2.avoidCount + 1;
      const nextSpot = ARIEL_AVOID_SPOTS[Math.min(nextCount, ARIEL_AVOID_SPOTS.length - 1)];
      return {
        ...next,
        npcs: next.npcs.map((n) => (n.role === 'ariel' ? { ...n, interactable: false } : n)),
        stage2: {
          ...next.stage2,
          avoidCount: nextCount,
          arielFleeing: true,
          arielTargetX: nextSpot.x,
          arielTargetY: nextSpot.y,
        },
      };
    }
  }

  return next;
}

export function stepSimulationTimers(state: SimulationState, dt: number): SimulationState {
  let next: SimulationState = {
    ...state,
    elapsedSeconds: state.elapsedSeconds + dt,
    beatTimer: (state.beatTimer + dt * 1.4) % 1,
  };

  if (next.intro.active) {
    next = stepIntroCutscene(next, dt);
  }

  if (next.questPhase === 'ariel_approaching') {
    next = stepArielApproach(next, dt);
  }

  if (next.slowDance.active) {
    next = stepSlowDance(next, dt);
  }

  if (next.kissCutscene.active) {
    next = stepKissCutscene(next, dt);
  }

  if (next.stageId === 'stage-2' && next.stage2) {
    if (next.stage2.cutscene !== 'none') {
      next = stepStage2Cutscene(next, dt);
    } else {
      next = stepStage2Exploration(next, dt);
    }
  }

  if (next.stageId === 'stage-3' && next.stage3) {
    next = stepStage3Simulation(next, dt);
  }

  if (next.stageId === 'stage-4' && next.stage4) {
    next = stepStage4Simulation(next, dt);
  }

  if (next.stageId === 'stage-5' && next.stage5) {
    next = stepStage5Simulation(next, dt);
  }

  if (next.stageId === 'stage-6' && next.stage6) {
    next = stepStage6Simulation(next, dt);
  }

  return next;
}

export function getObjectiveText(
  questPhase: SimulationState['questPhase'],
  stageId: SimulationState['stageId'] = 'stage-1',
): string {
  if (stageId === 'stage-5' && questPhase !== 'stage_complete') {
    return 'Explore o Bela Vista e viva os momentos em família';
  }
  if (stageId === 'stage-6' && questPhase !== 'stage_complete') {
    return getStage6ObjectiveText({ stageId, questPhase, stage6: null } as SimulationState) || 'Fase 6 · Nossa História Continua';
  }
  switch (questPhase) {
    case 'intro_1995_street':
      return '1995 · Ponte do Imaruim · Danceteria Cruzeiro';
    case 'intro_arrival':
      return 'Grazi e Laura chegam à Danceteria Cruzeiro';
    case 'intro_interior_pan':
      return 'Explorando a pista da Discoteca Cruzeiro...';
    case 'explore_find_laura':
      return 'Explore o salão e converse com sua irmã Laura';
    case 'ariel_approaching':
      return 'Ariel está vindo falar com você...';
    case 'ready_to_dance_ariel':
      return 'Ariel te tirou para dançar uma música lenta';
    case 'slow_dance':
      return 'Música lenta · Dançando abraçadinhos na pista';
    case 'kiss_cutscene':
      return 'O primeiro beijo...';
    case 'post_dance_confession':
      return 'Depois do beijo';
    case 's2_intro_memories':
      return 'Lembranças do começo do namoro...';
    case 's2_explore_reunion':
      return 'Explore a discoteca, converse com Laura ou aproxime-se da pista';
    case 's2_cutscene_eloisa':
      return 'O reencontro na Discoteca Cruzeiro';
    case 's2_explore_jealousy':
      return 'Aproxime-se da pista e converse com o amigo de Ariel';
    case 's2_cutscene_jealousy':
      return 'Música lenta na pista...';
    case 's2_cutscene_retry':
      return 'Uma nova tentativa juntos';
    case 's2_explore_avoidance':
      return 'Aproxime-se de Ariel na discoteca para conversar com ele';
    case 's2_farewell_dialogue':
      return 'Conversa sincera com Ariel';
    case 's2_cutscene_forehead_kiss':
      return 'A despedida na discoteca...';
    case 's2_ending_transition':
      return 'Novos caminhos...';
    case 's3_intro_time':
      return 'Algum tempo depois...';
    case 's3_explore_reunion':
      return 'Aproxime-se de Laura e Léo na rua do bairro para conversar';
    case 's3_cutscene_together':
      return 'Dessa vez, juntos...';
    case 's3_explore_walk':
      return 'Passeie com Ariel pela rua até encontrar Laura e Léo';
    case 's3_travel_hotdog':
      return 'Indo até a Barraca de Cachorro-Quente...';
    case 's3_explore_hotdog':
      return 'Peça cachorro-quente na barraca com a turma';
    case 's3_cutscene_hotdog':
      return 'Saboreando cachorro-quente com a turma!';
    case 's3_travel_videostore':
      return 'Indo para a Locadora de Vídeos...';
    case 's3_explore_videostore':
      return 'Explore as fitas VHS e escolha um filme no balcão';
    case 's3_cutscene_videostore':
      return 'Escolhendo a fita VHS da noite...';
    case 's3_travel_livingroom':
      return 'Voltando para casa com o filme...';
    case 's3_explore_livingroom':
      return 'Sente-se no sofá com a pipoca para assistir ao filme';
    case 's3_cutscene_movienight':
      return 'Noite de filme e pipoca no sofá!';
    case 's3_travel_moving':
      return 'Chegando na Casa Nova para a mudança...';
    case 's3_moving_day':
      return 'Ajude Ariel e Léo na mudança de casa';
    case 's3_cutscene_moving_celebration':
      return 'Mudança concluída com muita parceria!';
    case 's3_cutscene_proposal':
      return 'Um momento especial depois da mudança...';
    case 's3_ending_together':
      return 'Dessa vez, pra ficar...';
    case 's4_intro_home_routine':
      return 'A rotina do casal na casa da mãe de Grazi';
    case 's4_explore_moms_house':
      return 'Explore o quintal e vá até a bicicleta com Ariel';
    case 's4_ride_bicycle':
      return 'Pedale de bicicleta com Grazi na garupa até o Ponto de Ônibus / Escola';
    case 's4_cutscene_bicycle':
      return 'Ariel levando Grazi de bicicleta até a aula da noite';
    case 's4_cutscene_pregnancy_reveal':
      return 'Em frente à casa da mãe de Grazi · Uma revelação emocionante';
    case 's4_explore_labor_walk':
    case 's4_cutscene_labor_walk':
      return 'Caminhando de mãos dadas pela rua do bairro aos 9 meses de gestação';
    case 's4_cutscene_maternity_trip':
      return 'Com a madrinha Nani a caminho da Maternidade Carmela Dutra';
    case 's4_cutscene_birth':
      return 'O nascimento tranquilo e feliz de Cristian';
    case 's4_cutscene_crib':
      return 'O bercinho amarelo do Cristian e os brinquedos do tio Léo';
    case 's4_build_meia_agua':
      return 'Construa nossa pequena casinha meia-água nos fundos do terreno';
    case 's4_explore_toddler_home':
      return 'Curta a casa com o pequeno Cristian loirinho e Ariel';
    case 's4_cutscene_cristian_dance':
      return 'Cristian dançando alegre na sala';
    case 's4_videogame_interactive':
      return 'Ajude Ariel com os enigmas no videogame em família';
    case 's4_ending_family_7y':
      return 'Cristian aos ~7 anos · Nossa Pequena Grande Aventura';
    case 'stage_complete':
      return stageId === 'stage-5'
        ? 'Fase 5 concluída!'
        : stageId === 'stage-4'
          ? 'Fase 4 concluída!'
          : stageId === 'stage-3'
            ? 'Fase 3 concluída!'
            : stageId === 'stage-2'
              ? 'Fase 2 concluída!'
              : 'Fase 1 concluída!';
    default:
      return getStage5ObjectiveText({ stageId, questPhase } as SimulationState) || 'Fase 5 · Bela Vista';
  }
}
