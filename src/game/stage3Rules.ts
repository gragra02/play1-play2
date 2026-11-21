import { TILE_SIZE } from './mapData';
import type { InteractableTarget, Stage2CutsceneCaption } from './rules';
import {
  STAGE3_HOTDOG_COUNTER_POS,
  STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE,
  STAGE3_LIVINGROOM_EXIT_TO_MOVING,
  STAGE3_LIVINGROOM_SOFA_POS,
  STAGE3_LIVINGROOM_TV_POS,
  STAGE3_LOCATION_LABELS,
  STAGE3_PORCH_DROP_POS,
  STAGE3_STREET_EXIT_TO_HOTDOG,
  STAGE3_VIDEOSTORE_COUNTER_POS,
  STAGE3_VIDEOSTORE_EXIT_TO_HOME,
  STAGE3_VIDEOSTORE_SHELVES,
  STAGE_3_CLOSING_QUOTE,
  STAGE_3_DIALOGUES,
  STAGE_3_MEMORIES,
  createInitialMovingItems,
  createStage3Npcs,
  isStage3RectWalkable,
} from './stage3Data';
import type {
  Direction,
  NpcEntity,
  SimulationState,
  Stage3MapId,
  Stage3State,
} from './types';

// ============================================================================
// FASE 3 — DESSA VEZ, PRA FICAR (5-Environment RPG State Machine)
// 100% pure TypeScript — zero DOM/image imports, fully Node unit-testable.
// ============================================================================

const S3_TIME_PASSAGE_DURATION = 5.8;
const S3_TOGETHER_MONTAGE_DURATION = 7.2;
const S3_TRAVEL_DURATION = 4.2;
const S3_HOTDOG_EATING_DURATION = 6.8;
const S3_WRONG_HAND_SETUP_PROMPT_TIME = 2.2;
const S3_WRONG_HAND_WAIT_DURATION = 5.4;
const S3_WRONG_HAND_TELL_DURATION = 3.4;
const S3_VIDEOSTORE_PICKING_DURATION = 6.8;
const S3_MOVIENIGHT_DURATION = 9.4;
const S3_MOVING_CELEBRATION_DURATION = 3.6;
const S3_PROPOSAL_DURATION = 8.8;
const S3_ENDING_READY_DELAY = 1.6;
const S3_PLAYER_SPEED = 118;

export function isStage3CutsceneActive(state: SimulationState): boolean {
  return state.stageId === 'stage-3' && Boolean(state.stage3 && state.stage3.cutscene !== 'none');
}

export function isStage3ExplorationPhase(phase: SimulationState['questPhase']): boolean {
  return (
    phase === 's3_explore_reunion' ||
    phase === 's3_explore_walk' ||
    phase === 's3_explore_hotdog' ||
    phase === 's3_explore_videostore' ||
    phase === 's3_explore_livingroom' ||
    phase === 's3_moving_day'
  );
}

function setMap(s3: Stage3State, mapId: Stage3MapId): Stage3State {
  return {
    ...s3,
    mapId,
    locationLabel: STAGE3_LOCATION_LABELS[mapId],
  };
}

export function createStage3Simulation(
  skipIntro = false,
  unlockedMemories: string[] = [],
): SimulationState {
  const stage3State: Stage3State = {
    mapId: 'neighborhood_street',
    locationLabel: STAGE3_LOCATION_LABELS.neighborhood_street,
    cutscene: skipIntro ? 'none' : 'time_passage',
    cutsceneElapsed: 0,
    cameraFocusX: 10.2 * TILE_SIZE,
    cameraFocusY: 8.0 * TILE_SIZE,
    cameraZoom: 1.0,
    arielFollowsPlayer: false,
    friendsFollowPlayer: false,
    metFriendsOnStreet: false,
    orderedHotdog: false,
    browsedVhsShelves: [],
    wrongHandTriggered: false,
    wrongHandResolved: false,
    wrongHandChoice: null,
    wrongHandChoicePending: false,
    pickedMovieTape: false,
    watchedMovieNight: false,
    movingItems: createInitialMovingItems(),
    carryingItemId: null,
    movingDeliveredCount: 0,
    helperTimer: 0,
    unlockedMemories: [...unlockedMemories],
    recentMemoryTitle: null,
    recentMemoryTimer: 0,
    endingReadyToFinish: false,
  };

  return {
    stageId: 'stage-3',
    questPhase: skipIntro ? 's3_explore_reunion' : 's3_intro_time',
    intro: {
      active: false,
      scene: 'scene3_interior_pan',
      elapsed: 0,
      doorOpenAmount: 1,
      cameraFocusX: 10.2 * TILE_SIZE,
      cameraFocusY: 8.0 * TILE_SIZE,
    },
    arielActivity: 'standing',
    player: {
      x: 6.4 * TILE_SIZE,
      y: 7.9 * TILE_SIZE,
      width: 18,
      height: 14,
      dir: 'right',
      walkDistance: 0,
      isMoving: false,
      isDancing: false,
      reactionEmotion: 'none',
    },
    npcs: createStage3Npcs('reunion'),
    activeDialogue: null,
    dialogueLineIndex: 0,
    slowDance: {
      active: false,
      elapsed: 0,
      duration: 14,
      swayPhase: 0,
      syncHits: 0,
      beatCursor: 0,
      hitFeedback: '',
      feedbackTimer: 0,
    },
    kissCutscene: {
      active: false,
      phase: 'zoom_in',
      elapsed: 0,
      totalDuration: 6.4,
      cameraZoom: 1,
    },
    stage2: null,
    stage3: stage3State,
    stage4: null,
    elapsedSeconds: 0,
    beatTimer: 0,
    discoveredProps: [],
    heartsSpawned: 0,
  };
}

export function skipStage3Intro(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-3' || !state.stage3 || state.stage3.cutscene !== 'time_passage') {
    return state;
  }
  return {
    ...state,
    questPhase: 's3_explore_reunion',
    stage3: {
      ...state.stage3,
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: state.player.x,
      cameraFocusY: state.player.y,
      cameraZoom: 1.0,
    },
  };
}

// ----------------------------------------------------------------------------
// SCENE TRANSITION HELPERS (Each environment + animated travel cutscene)
// ----------------------------------------------------------------------------
export function startStage3TogetherCutscene(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_cutscene_together',
    activeDialogue: null,
    dialogueLineIndex: 0,
    stage3: {
      ...setMap(state.stage3, 'neighborhood_street'),
      cutscene: 'together_montage',
      cutsceneElapsed: 0,
      cameraFocusX: 7.8 * TILE_SIZE,
      cameraFocusY: 7.3 * TILE_SIZE,
      cameraZoom: 1.35,
    },
  };
}

export function startStage3WalkExplore(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_explore_walk',
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: 6.8 * TILE_SIZE,
      y: 8.1 * TILE_SIZE,
      dir: 'right',
      isMoving: false,
      reactionEmotion: 'happy',
    },
    npcs: createStage3Npcs('walk'),
    stage3: {
      ...setMap(state.stage3, 'neighborhood_street'),
      cutscene: 'none',
      cutsceneElapsed: 0,
      arielFollowsPlayer: true,
      friendsFollowPlayer: false,
      metFriendsOnStreet: false,
      cameraFocusX: 6.8 * TILE_SIZE,
      cameraFocusY: 8.1 * TILE_SIZE,
      cameraZoom: 1.0,
    },
  };
}

export function startStage3TravelToHotdog(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_travel_hotdog',
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: { ...state.player, isMoving: false },
    stage3: {
      ...setMap(state.stage3, 'neighborhood_street'),
      cutscene: 'travel_to_hotdog',
      cutsceneElapsed: 0,
      cameraZoom: 1.0,
    },
  };
}

export function startStage3HotdogExplore(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_explore_hotdog',
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: 3.6 * TILE_SIZE,
      y: 7.5 * TILE_SIZE,
      dir: 'right',
      isMoving: false,
      reactionEmotion: 'happy',
    },
    npcs: createStage3Npcs('hotdog'),
    stage3: {
      ...setMap(state.stage3, 'hotdog_stand'),
      cutscene: 'none',
      cutsceneElapsed: 0,
      arielFollowsPlayer: true,
      friendsFollowPlayer: true,
      orderedHotdog: false,
      cameraFocusX: 8.6 * TILE_SIZE,
      cameraFocusY: 6.4 * TILE_SIZE,
      cameraZoom: 1.0,
    },
  };
}

export function startStage3HotdogCutscene(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  const nextMemories = state.stage3.unlockedMemories.includes('mem_s3_cachorro_quente')
    ? state.stage3.unlockedMemories
    : [...state.stage3.unlockedMemories, 'mem_s3_cachorro_quente'];
  return {
    ...state,
    questPhase: 's3_cutscene_hotdog',
    activeDialogue: null,
    dialogueLineIndex: 0,
    stage3: {
      ...setMap(state.stage3, 'hotdog_stand'),
      cutscene: 'hotdog_eating',
      cutsceneElapsed: 0,
      orderedHotdog: true,
      unlockedMemories: nextMemories,
      recentMemoryTitle: 'Barraca de Cachorro-Quente',
      recentMemoryTimer: 4.0,
      cameraFocusX: 7.4 * TILE_SIZE,
      cameraFocusY: 5.5 * TILE_SIZE,
      cameraZoom: 1.08,
    },
  };
}

export function startStage3TravelToVideoStore(state: SimulationState): SimulationState {
  // Stepping into the illuminated Locadora entrance on the sidewalk enters directly!
  return startStage3VideoStoreExplore(state, true);
}

export function startStage3WrongHandSetup(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_explore_videostore',
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: 9.2 * TILE_SIZE,
      y: 7.7 * TILE_SIZE,
      dir: 'up',
      isMoving: false,
      reactionEmotion: 'amused',
    },
    stage3: {
      ...setMap(state.stage3, 'video_store'),
      cutscene: 'videostore_wrong_hand_setup',
      cutsceneElapsed: 0,
      wrongHandTriggered: true,
      wrongHandResolved: false,
      wrongHandChoice: null,
      wrongHandChoicePending: false,
      cameraFocusX: 8.6 * TILE_SIZE,
      cameraFocusY: 6.6 * TILE_SIZE,
      cameraZoom: 1.15,
    },
  };
}

export function chooseStage3WrongHandOption(
  state: SimulationState,
  choice: 'wait' | 'tell',
): SimulationState {
  if (
    state.stageId !== 'stage-3' ||
    !state.stage3 ||
    state.stage3.cutscene !== 'videostore_wrong_hand_setup'
  ) {
    return state;
  }
  return {
    ...state,
    activeDialogue: null,
    dialogueLineIndex: 0,
    stage3: {
      ...state.stage3,
      cutscene: choice === 'wait' ? 'videostore_wrong_hand_wait' : 'videostore_wrong_hand_tell',
      cutsceneElapsed: 0,
      wrongHandChoice: choice,
      wrongHandChoicePending: false,
      cameraFocusX: 8.6 * TILE_SIZE,
      cameraFocusY: 6.6 * TILE_SIZE,
      cameraZoom: 1.18,
    },
  };
}

export function advanceStage3WrongHandWaitBeat(state: SimulationState): SimulationState {
  const s3 = state.stage3;
  if (
    state.stageId !== 'stage-3' ||
    !s3 ||
    s3.cutscene !== 'videostore_wrong_hand_wait' ||
    s3.cutsceneElapsed >= 3.0
  ) {
    return state;
  }
  // Interactive "Segurar o riso!" tap jumps smoothly to the next comedic beat until Ariel notices!
  const nextElapsed = s3.cutsceneElapsed < 1.7 ? 1.75 : 3.05;
  return {
    ...state,
    stage3: {
      ...s3,
      cutsceneElapsed: nextElapsed,
    },
  };
}

export function startStage3VideoStoreExplore(
  state: SimulationState,
  withWelcomeDialogue = true,
): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_explore_videostore',
    activeDialogue: withWelcomeDialogue ? STAGE_3_DIALOGUES.s3_videostore_welcome : null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: 11.8 * TILE_SIZE,
      y: 12.6 * TILE_SIZE,
      dir: 'up',
      isMoving: false,
      reactionEmotion: 'happy',
    },
    npcs: createStage3Npcs('videostore'),
    stage3: {
      ...setMap(state.stage3, 'video_store'),
      cutscene: 'none',
      cutsceneElapsed: 0,
      arielFollowsPlayer: true,
      friendsFollowPlayer: false,
      browsedVhsShelves: [],
      wrongHandTriggered: false,
      wrongHandResolved: false,
      wrongHandChoice: null,
      wrongHandChoicePending: false,
      pickedMovieTape: false,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 9.0 * TILE_SIZE,
      cameraZoom: 1.0,
    },
  };
}

export function startStage3VideoStoreCutscene(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  const nextMemories = state.stage3.unlockedMemories.includes('mem_s3_locadora')
    ? state.stage3.unlockedMemories
    : [...state.stage3.unlockedMemories, 'mem_s3_locadora'];
  return {
    ...state,
    questPhase: 's3_cutscene_videostore',
    activeDialogue: null,
    dialogueLineIndex: 0,
    stage3: {
      ...setMap(state.stage3, 'video_store'),
      cutscene: 'videostore_picking',
      cutsceneElapsed: 0,
      pickedMovieTape: true,
      unlockedMemories: nextMemories,
      recentMemoryTitle: 'Noite na Locadora de Vídeos',
      recentMemoryTimer: 4.0,
      cameraFocusX: 11.2 * TILE_SIZE,
      cameraFocusY: 5.8 * TILE_SIZE,
      cameraZoom: 1.04,
    },
  };
}

export function startStage3TravelToLivingRoom(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_travel_livingroom',
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: { ...state.player, isMoving: false },
    stage3: {
      ...setMap(state.stage3, 'video_store'),
      cutscene: 'travel_to_livingroom',
      cutsceneElapsed: 0,
      cameraZoom: 1.0,
    },
  };
}

export function startStage3LivingRoomExplore(
  state: SimulationState,
  withArriveDialogue = true,
): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_explore_livingroom',
    activeDialogue: withArriveDialogue ? STAGE_3_DIALOGUES.s3_livingroom_arrive : null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: 9.2 * TILE_SIZE,
      y: 13.3 * TILE_SIZE,
      dir: 'up',
      isMoving: false,
      reactionEmotion: 'happy',
    },
    npcs: createStage3Npcs('livingroom'),
    stage3: {
      ...setMap(state.stage3, 'living_room'),
      cutscene: 'none',
      cutsceneElapsed: 0,
      arielFollowsPlayer: false,
      friendsFollowPlayer: false,
      watchedMovieNight: false,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 8.5 * TILE_SIZE,
      cameraZoom: 1.0,
    },
  };
}

export function startStage3MovieNightCutscene(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  const nextMemories = state.stage3.unlockedMemories.includes('mem_s3_quatro')
    ? state.stage3.unlockedMemories
    : [...state.stage3.unlockedMemories, 'mem_s3_quatro'];
  return {
    ...state,
    questPhase: 's3_cutscene_movienight',
    activeDialogue: null,
    dialogueLineIndex: 0,
    npcs: createStage3Npcs('livingroom'),
    stage3: {
      ...setMap(state.stage3, 'living_room'),
      cutscene: 'movie_night_sofa',
      cutsceneElapsed: 0,
      watchedMovieNight: true,
      unlockedMemories: nextMemories,
      recentMemoryTitle: 'Filme, Pipoca e a Amizade dos Quatro',
      recentMemoryTimer: 4.0,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 8.65 * TILE_SIZE,
      cameraZoom: 1.18,
    },
  };
}

export function startStage3TravelToMoving(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_travel_moving',
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: { ...state.player, isMoving: false },
    stage3: {
      ...setMap(state.stage3, 'neighborhood_street'),
      cutscene: 'travel_to_moving',
      cutsceneElapsed: 0,
      cameraZoom: 1.0,
    },
  };
}

export function startStage3MovingDay(state: SimulationState, withIntroDialogue = true): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_moving_day',
    activeDialogue: withIntroDialogue ? STAGE_3_DIALOGUES.s3_moving_intro : null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: 12.0 * TILE_SIZE,
      y: 8.4 * TILE_SIZE,
      dir: 'down',
      isMoving: false,
      reactionEmotion: 'happy',
    },
    npcs: createStage3Npcs('moving'),
    stage3: {
      ...setMap(state.stage3, 'moving_house'),
      cutscene: 'none',
      cutsceneElapsed: 0,
      arielFollowsPlayer: false,
      friendsFollowPlayer: false,
      movingItems: createInitialMovingItems(),
      carryingItemId: null,
      movingDeliveredCount: 0,
      helperTimer: 0,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 8.4 * TILE_SIZE,
      cameraZoom: 1.0,
    },
  };
}

export function startStage3MovingCelebration(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_cutscene_moving_celebration',
    activeDialogue: null,
    dialogueLineIndex: 0,
    stage3: {
      ...setMap(state.stage3, 'moving_house'),
      cutscene: 'moving_celebration',
      cutsceneElapsed: 0,
      carryingItemId: null,
      cameraFocusX: 12.2 * TILE_SIZE,
      cameraFocusY: 4.9 * TILE_SIZE,
      cameraZoom: 1.45,
    },
  };
}

export function startStage3ProposalCutscene(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_cutscene_proposal',
    activeDialogue: null,
    dialogueLineIndex: 0,
    stage3: {
      ...setMap(state.stage3, 'moving_house'),
      cutscene: 'moving_proposal',
      cutsceneElapsed: 0,
      carryingItemId: null,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 5.45 * TILE_SIZE,
      cameraZoom: 1.5,
    },
  };
}

export function startStage3EndingCutscene(state: SimulationState): SimulationState {
  if (!state.stage3) return state;
  return {
    ...state,
    questPhase: 's3_ending_together',
    activeDialogue: null,
    dialogueLineIndex: 0,
    stage3: {
      ...setMap(state.stage3, 'neighborhood_street'),
      cutscene: 'ending_together',
      cutsceneElapsed: 0,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 6.9 * TILE_SIZE,
      cameraZoom: 1.32,
      endingReadyToFinish: false,
    },
  };
}

export function finishStage3Ending(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-3' || !state.stage3) return state;
  return {
    ...state,
    questPhase: 'stage_complete',
    activeDialogue: null,
    dialogueLineIndex: 0,
    stage3: {
      ...state.stage3,
      cutscene: 'none',
      endingReadyToFinish: true,
    },
  };
}

// ----------------------------------------------------------------------------
// MOVEMENT, COLLISION & PARTY FOLLOWERS + WALK-THROUGH PORTALS
// ----------------------------------------------------------------------------
function canStandStage3(
  mapId: Stage3MapId,
  x: number,
  y: number,
  width: number,
  height: number,
  npcs: NpcEntity[],
  arielFollows: boolean,
  friendsFollow: boolean,
): boolean {
  const halfW = width / 2;
  const halfH = height / 2;
  if (!isStage3RectWalkable(mapId, x, y, halfW, halfH)) {
    return false;
  }
  for (const npc of npcs) {
    if (!npc.visible) continue;
    if (arielFollows && npc.role === 'ariel') continue;
    if (friendsFollow && (npc.role === 'ariel' || npc.role === 'laura' || npc.role === 'leo')) continue;
    if (mapId === 'moving_house' && (npc.role === 'ariel' || npc.role === 'leo')) continue;
    const dist = Math.hypot(x - npc.x, y - npc.y);
    if (dist < 17) return false;
  }
  return true;
}

function directionFromVec(dx: number, dy: number, fallback: Direction): Direction {
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx < 0 ? 'left' : 'right';
  }
  return dy < 0 ? 'up' : 'down';
}

export function moveStage3Player(
  state: SimulationState,
  inputX: number,
  inputY: number,
  dt: number,
): SimulationState {
  const s3 = state.stage3;
  if (!s3 || s3.cutscene !== 'none' || state.activeDialogue || state.questPhase === 'stage_complete') {
    if (!state.player.isMoving) return state;
    return { ...state, player: { ...state.player, isMoving: false } };
  }

  const len = Math.hypot(inputX, inputY);
  const nx = len > 0.01 ? inputX / len : 0;
  const ny = len > 0.01 ? inputY / len : 0;
  const speed = s3.carryingItemId ? S3_PLAYER_SPEED * 0.9 : S3_PLAYER_SPEED;
  const targetVx = nx * speed;
  const targetVy = ny * speed;
  const currentVx = state.player.vx ?? 0;
  const currentVy = state.player.vy ?? 0;
  const blend = 1 - Math.exp(-(len > 0.01 ? 10.5 : 14.5) * dt);
  let nextVx = currentVx + (targetVx - currentVx) * blend;
  let nextVy = currentVy + (targetVy - currentVy) * blend;
  if (len < 0.01 && Math.hypot(nextVx, nextVy) < 2) {
    nextVx = 0;
    nextVy = 0;
  }

  let nextX = state.player.x;
  let nextY = state.player.y;

  const tryX = nextX + nextVx * dt;
  if (
    canStandStage3(
      s3.mapId,
      tryX,
      nextY,
      state.player.width,
      state.player.height,
      state.npcs,
      s3.arielFollowsPlayer,
      s3.friendsFollowPlayer,
    )
  ) {
    nextX = tryX;
  }

  const tryY = nextY + nextVy * dt;
  if (
    canStandStage3(
      s3.mapId,
      nextX,
      tryY,
      state.player.width,
      state.player.height,
      state.npcs,
      s3.arielFollowsPlayer,
      s3.friendsFollowPlayer,
    )
  ) {
    nextY = tryY;
  }

  const movedDist = Math.hypot(nextX - state.player.x, nextY - state.player.y);
  const nextDir = directionFromVec(nextVx, nextVy, state.player.dir);

  // Follow behavior: Two close couples! Ariel right beside Grazi, and Laura & Léo ALWAYS side-by-side holding hands!
  let nextNpcs = state.npcs;
  if (s3.arielFollowsPlayer || s3.friendsFollowPlayer) {
    const isVertical = nextDir === 'up' || nextDir === 'down';
    const signX = nextDir === 'left' ? 1 : -1;
    const signY = nextDir === 'up' ? 1 : -1;
    nextNpcs = state.npcs.map((npc) => {
      let offsetX = 0;
      let offsetY = 0;
      let shouldFollow = false;

      if (npc.role === 'ariel' && (s3.arielFollowsPlayer || s3.friendsFollowPlayer)) {
        shouldFollow = true;
        offsetX = isVertical ? -19 : signX * 19;
        offsetY = isVertical ? signY * 4 : -1;
      } else if (npc.role === 'laura' && s3.friendsFollowPlayer) {
        shouldFollow = true;
        offsetX = isVertical ? -10 : signX * 44;
        offsetY = isVertical ? signY * 32 : -2;
      } else if (npc.role === 'leo' && s3.friendsFollowPlayer) {
        shouldFollow = true;
        // Always right beside Laura (~18px apart) so they walk side-by-side holding hands!
        offsetX = isVertical ? 9 : signX * 62;
        offsetY = isVertical ? signY * 32 : -1;
      }

      if (!shouldFollow) return npc;
      const targetX = nextX + offsetX;
      const targetY = nextY + offsetY;
      const dx = targetX - npc.x;
      const dy = targetY - npc.y;
      const d = Math.hypot(dx, dy);
      if (d <= 2.5) return { ...npc, dir: nextDir };
      const step = Math.min(d, S3_PLAYER_SPEED * 1.12 * dt);
      return {
        ...npc,
        x: npc.x + (dx / d) * step,
        y: npc.y + (dy / d) * step,
        dir: directionFromVec(dx, dy, nextDir),
      };
    });
  }

  const movedState: SimulationState = {
    ...state,
    npcs: nextNpcs,
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

  // Seamless Walk-Through Door / Path Portals (when unlocked!)
  if (
    state.questPhase === 's3_explore_walk' &&
    s3.metFriendsOnStreet &&
    nextX >= 22.1 * TILE_SIZE &&
    nextY >= 6.8 * TILE_SIZE &&
    nextY <= 9.2 * TILE_SIZE
  ) {
    return startStage3TravelToHotdog(movedState);
  }

  // Walk right through the illuminated Locadora glass doorway on the sidewalk!
  if (
    state.questPhase === 's3_explore_hotdog' &&
    s3.orderedHotdog &&
    nextX >= 15.6 * TILE_SIZE &&
    nextX <= 18.4 * TILE_SIZE &&
    nextY <= 4.45 * TILE_SIZE
  ) {
    return startStage3VideoStoreExplore(movedState, true);
  }

  if (
    state.questPhase === 's3_explore_videostore' &&
    s3.pickedMovieTape &&
    nextY >= 14.0 * TILE_SIZE &&
    nextX >= 10.8 * TILE_SIZE &&
    nextX <= 13.2 * TILE_SIZE
  ) {
    return startStage3TravelToLivingRoom(movedState);
  }

  if (
    state.questPhase === 's3_explore_livingroom' &&
    s3.watchedMovieNight &&
    nextY >= 14.0 * TILE_SIZE &&
    nextX >= 10.8 * TILE_SIZE &&
    nextX <= 13.2 * TILE_SIZE
  ) {
    return startStage3EndingCutscene(movedState);
  }

  return movedState;
}

// ----------------------------------------------------------------------------
// INTERACTABLES ACROSS ALL 5 ENVIRONMENTS
// ----------------------------------------------------------------------------
export function findNearestStage3Interactable(state: SimulationState): InteractableTarget | null {
  const s3 = state.stage3;
  if (!s3 || s3.cutscene !== 'none' || state.activeDialogue || state.questPhase === 'stage_complete') {
    return null;
  }

  const px = state.player.x;
  const py = state.player.y;
  const candidates: InteractableTarget[] = [];

  // 1. Unlocked Doorways / Street Exits (can press Space/E OR walk right through!)
  if (state.questPhase === 's3_explore_walk' && s3.metFriendsOnStreet) {
    const d = Math.hypot(px - STAGE3_STREET_EXIT_TO_HOTDOG.x, py - STAGE3_STREET_EXIT_TO_HOTDOG.y);
    if (d <= STAGE3_STREET_EXIT_TO_HOTDOG.radius) {
      candidates.push({
        type: 'prop',
        id: 'portal_to_hotdog',
        label: 'Ir para a Barraca de Cachorro-Quente',
        dialogueId: 'portal_to_hotdog',
        distance: d,
        priority: 120,
      });
    }
  }

  if (state.questPhase === 's3_explore_hotdog') {
    if (!s3.orderedHotdog) {
      const d = Math.hypot(px - STAGE3_HOTDOG_COUNTER_POS.x, py - STAGE3_HOTDOG_COUNTER_POS.y);
      if (d <= STAGE3_HOTDOG_COUNTER_POS.radius) {
        candidates.push({
          type: 'prop',
          id: 'hotdog_counter',
          label: 'Pedir cachorro-quente com o vendedor',
          dialogueId: 's3_hotdog_order',
          distance: d,
          priority: 120,
        });
      }
      const dDoor = Math.hypot(
        px - STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE.x,
        py - STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE.y,
      );
      if (dDoor <= STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE.radius) {
        candidates.push({
          type: 'prop',
          id: 'locadora_door_preview',
          label: 'Ver entrada da Locadora de Vídeos',
          dialogueId: 's3_hotdog_eat_first',
          distance: dDoor,
          priority: 95,
        });
      }
    } else {
      const d = Math.hypot(
        px - STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE.x,
        py - STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE.y,
      );
      if (d <= STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE.radius) {
        candidates.push({
          type: 'prop',
          id: 'portal_to_videostore',
          label: 'Entrar na Locadora de Vídeos',
          dialogueId: 'portal_to_videostore',
          distance: d,
          priority: 120,
        });
      }
    }
  }

  if (state.questPhase === 's3_explore_videostore') {
    // VHS Shelves (can inspect any aisle!)
    for (const shelf of STAGE3_VIDEOSTORE_SHELVES) {
      const d = Math.hypot(px - shelf.x, py - shelf.y);
      if (d <= shelf.radius) {
        const already = s3.browsedVhsShelves.includes(shelf.id);
        candidates.push({
          type: 'prop',
          id: shelf.id,
          label: shelf.label,
          dialogueId: shelf.dialogueId,
          distance: d,
          priority: already ? 60 : 98,
        });
      }
    }

    // Video Store Checkout Counter -> Choose movie & rent VHS (after browsing shelves!)
    if (!s3.pickedMovieTape) {
      const d = Math.hypot(
        px - STAGE3_VIDEOSTORE_COUNTER_POS.x,
        py - STAGE3_VIDEOSTORE_COUNTER_POS.y,
      );
      if (d <= STAGE3_VIDEOSTORE_COUNTER_POS.radius) {
        candidates.push({
          type: 'prop',
          id: 'videostore_checkout',
          label: s3.wrongHandResolved
            ? 'Alugar o filme escolhido no balcão'
            : 'Falar com o atendente do balcão',
          dialogueId: s3.wrongHandResolved
            ? 's3_videostore_checkout'
            : 's3_videostore_browse_first',
          distance: d,
          priority: s3.wrongHandResolved ? 118 : 88,
        });
      }
    } else {
      const d = Math.hypot(
        px - STAGE3_VIDEOSTORE_EXIT_TO_HOME.x,
        py - STAGE3_VIDEOSTORE_EXIT_TO_HOME.y,
      );
      if (d <= STAGE3_VIDEOSTORE_EXIT_TO_HOME.radius) {
        candidates.push({
          type: 'prop',
          id: 'portal_to_livingroom',
          label: 'Sair da Locadora e ir para Casa',
          dialogueId: 'portal_to_livingroom',
          distance: d,
          priority: 120,
        });
      }
    }
  }

  if (state.questPhase === 's3_explore_livingroom') {
    if (!s3.watchedMovieNight) {
      const dSofa = Math.hypot(px - STAGE3_LIVINGROOM_SOFA_POS.x, py - STAGE3_LIVINGROOM_SOFA_POS.y);
      if (dSofa <= STAGE3_LIVINGROOM_SOFA_POS.radius) {
        candidates.push({
          type: 'prop',
          id: 'livingroom_sofa',
          label: 'Sentar no sofá com a pipoca e assistir ao filme',
          dialogueId: 's3_movienight_start',
          distance: dSofa,
          priority: 118,
        });
      }
      const dTv = Math.hypot(px - STAGE3_LIVINGROOM_TV_POS.x, py - STAGE3_LIVINGROOM_TV_POS.y);
      if (dTv <= STAGE3_LIVINGROOM_TV_POS.radius) {
        candidates.push({
          type: 'prop',
          id: 'livingroom_tv',
          label: 'Ver TV e Videocassete',
          dialogueId: 's3_livingroom_tv_check',
          distance: dTv,
          priority: 82,
        });
      }
    } else {
      const dDoor = Math.hypot(
        px - STAGE3_LIVINGROOM_EXIT_TO_MOVING.x,
        py - STAGE3_LIVINGROOM_EXIT_TO_MOVING.y,
      );
      if (dDoor <= STAGE3_LIVINGROOM_EXIT_TO_MOVING.radius) {
        candidates.push({
          type: 'prop',
          id: 'portal_to_ending',
          label: 'Sair para o fim de tarde juntos',
          dialogueId: 'portal_to_ending',
          distance: dDoor,
          priority: 120,
        });
      }
    }
  }

  // Moving Day: porch drop-off & sidewalk boxes
  if (state.questPhase === 's3_moving_day') {
    if (s3.carryingItemId) {
      const carried = s3.movingItems.find((i) => i.id === s3.carryingItemId);
      const dropDist = Math.hypot(px - STAGE3_PORCH_DROP_POS.x, py - STAGE3_PORCH_DROP_POS.y);
      if (carried && dropDist <= STAGE3_PORCH_DROP_POS.radius) {
        candidates.push({
          type: 'prop',
          id: 's3_drop_porch',
          label: `Colocar ${carried.label} na Casa Nova`,
          dialogueId: 's3_drop_porch',
          distance: dropDist,
          priority: 120,
        });
      }
    } else {
      for (const item of s3.movingItems) {
        if (item.delivered) continue;
        const d = Math.hypot(px - item.pickupX, py - item.pickupY);
        if (d <= 44) {
          candidates.push({
            type: 'prop',
            id: item.id,
            label: `Pegar ${item.label}`,
            dialogueId: item.id,
            distance: d,
            priority: 110,
          });
        }
      }
    }
  }

  // 2. NPCs
  for (const npc of state.npcs) {
    if (!npc.visible || !npc.interactable) continue;
    const d = Math.hypot(px - npc.x, py - npc.y);
    if (d > 54) continue;

    if (state.questPhase === 's3_explore_reunion' && (npc.role === 'laura' || npc.role === 'leo')) {
      candidates.push({
        type: 'npc',
        id: npc.id,
        label: 'Conversar com Laura e Léo',
        dialogueId: 's3_laura_leo_dating',
        distance: d,
        priority: 100,
      });
    } else if (
      state.questPhase === 's3_explore_walk' &&
      !s3.metFriendsOnStreet &&
      (npc.role === 'laura' || npc.role === 'leo')
    ) {
      candidates.push({
        type: 'npc',
        id: npc.id,
        label: 'Encontrar Laura e Léo',
        dialogueId: 's3_walk_meet_couple',
        distance: d,
        priority: 100,
      });
    } else if (state.questPhase === 's3_explore_hotdog' && !s3.orderedHotdog) {
      if (npc.role === 'laura') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Falar com Laura',
          dialogueId: 's3_hotdog_chat_laura',
          distance: d,
          priority: 70,
        });
      } else if (npc.role === 'leo') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Falar com Léo',
          dialogueId: 's3_hotdog_chat_leo',
          distance: d,
          priority: 70,
        });
      }
    } else if (state.questPhase === 's3_explore_videostore') {
      if (npc.role === 'laura') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Ver filmes de Comédia com Laura',
          dialogueId: 's3_vhs_comedy',
          distance: d,
          priority: 75,
        });
      } else if (npc.role === 'leo') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Ver filmes de Ação com Léo',
          dialogueId: 's3_vhs_action',
          distance: d,
          priority: 75,
        });
      }
    } else if (state.questPhase === 's3_explore_livingroom' && !s3.watchedMovieNight) {
      if (npc.role === 'ariel' || npc.role === 'laura' || npc.role === 'leo') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Sentar no sofá com a turma para ver o filme',
          dialogueId: 's3_movienight_start',
          distance: d,
          priority: 112,
        });
      }
    } else if (state.questPhase === 's3_moving_day' && !s3.carryingItemId) {
      if (npc.role === 'ariel') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Falar com Ariel',
          dialogueId: 's3_moving_ariel_chat',
          distance: d,
          priority: 55,
        });
      } else if (npc.role === 'leo') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Falar com Léo',
          dialogueId: 's3_moving_leo_chat',
          distance: d,
          priority: 55,
        });
      }
    }
  }

  // 3. Unlockable Stage 3 Memories (matched by current mapId!)
  const unlockedSet = new Set(s3.unlockedMemories);
  for (const mem of STAGE_3_MEMORIES) {
    if (mem.mapId !== s3.mapId || unlockedSet.has(mem.id)) continue;
    const d = Math.hypot(px - mem.x, py - mem.y);
    if (d <= mem.radius) {
      candidates.push({
        type: 'memory',
        id: mem.id,
        label: `Lembrança: ${mem.title}`,
        dialogueId: mem.dialogueId,
        distance: d,
        priority: 74,
      });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.priority - a.priority || a.distance - b.distance);
  return candidates[0];
}

export function triggerStage3Interaction(state: SimulationState): {
  next: SimulationState;
  target: InteractableTarget | null;
} {
  const s3 = state.stage3;
  const target = findNearestStage3Interactable(state);
  if (!s3 || !target) return { next: state, target: null };

  // Portal interactions -> launch smooth animated travel cutscene!
  if (target.id === 'portal_to_hotdog') {
    return { target, next: startStage3TravelToHotdog(state) };
  }
  if (target.id === 'portal_to_videostore') {
    return { target, next: startStage3TravelToVideoStore(state) };
  }
  if (target.id === 'portal_to_livingroom') {
    return { target, next: startStage3TravelToLivingRoom(state) };
  }
  if (target.id === 'portal_to_moving') {
    return { target, next: startStage3TravelToMoving(state) };
  }
  if (target.id === 'portal_to_ending') {
    return { target, next: startStage3EndingCutscene(state) };
  }

  // Moving Day: Pick up box from sidewalk
  if (state.questPhase === 's3_moving_day' && target.type === 'prop' && target.id !== 's3_drop_porch') {
    const item = s3.movingItems.find((i) => i.id === target.id && !i.delivered);
    if (item) {
      return {
        target,
        next: {
          ...state,
          stage3: {
            ...s3,
            carryingItemId: item.id,
          },
        },
      };
    }
  }

  // Moving Day: Drop box onto house veranda!
  if (state.questPhase === 's3_moving_day' && target.id === 's3_drop_porch' && s3.carryingItemId) {
    const nextItems = s3.movingItems.map((item) =>
      item.id === s3.carryingItemId ? { ...item, delivered: true } : item,
    );
    const nextCount = nextItems.filter((i) => i.delivered).length;
    const banterKey =
      nextCount === 1
        ? 's3_moving_deliver_1'
        : nextCount === 2
          ? 's3_moving_deliver_2'
          : nextCount === 3
            ? 's3_moving_deliver_3'
            : 's3_moving_deliver_final';

    const nextMemories =
      nextCount >= 4 && !s3.unlockedMemories.includes('mem_s3_mudanca')
        ? [...s3.unlockedMemories, 'mem_s3_mudanca']
        : s3.unlockedMemories;

    return {
      target,
      next: {
        ...state,
        activeDialogue: STAGE_3_DIALOGUES[banterKey],
        dialogueLineIndex: 0,
        player: { ...state.player, isMoving: false, reactionEmotion: 'happy' },
        stage3: {
          ...s3,
          movingItems: nextItems,
          carryingItemId: null,
          movingDeliveredCount: nextCount,
          unlockedMemories: nextMemories,
          recentMemoryTitle: nextCount >= 4 ? 'Dia da Mudança' : s3.recentMemoryTitle,
          recentMemoryTimer: nextCount >= 4 ? 4.0 : s3.recentMemoryTimer,
        },
      },
    };
  }

  const dialogue = STAGE_3_DIALOGUES[target.dialogueId];
  if (!dialogue) return { next: state, target: null };

  let nextStage3 = s3;
  if (target.type === 'memory' && !s3.unlockedMemories.includes(target.id)) {
    const mem = STAGE_3_MEMORIES.find((m) => m.id === target.id);
    nextStage3 = {
      ...s3,
      unlockedMemories: [...s3.unlockedMemories, target.id],
      recentMemoryTitle: mem ? mem.title : 'Lembrança',
      recentMemoryTimer: 4.0,
    };
  }

  // Track browsed VHS shelves in video store
  if (
    state.questPhase === 's3_explore_videostore' &&
    (target.id.startsWith('vhs_') || target.dialogueId === 's3_vhs_comedy' || target.dialogueId === 's3_vhs_action')
  ) {
    const shelfKey = target.dialogueId;
    if (!nextStage3.browsedVhsShelves.includes(shelfKey)) {
      nextStage3 = {
        ...nextStage3,
        browsedVhsShelves: [...nextStage3.browsedVhsShelves, shelfKey],
      };
    }
  }

  return {
    target,
    next: {
      ...state,
      activeDialogue: dialogue,
      dialogueLineIndex: 0,
      player: { ...state.player, isMoving: false },
      stage3: nextStage3,
    },
  };
}

export function handleStage3DialogueComplete(
  state: SimulationState,
  completedDialogueId: string,
  action: string | undefined,
): SimulationState {
  if (action === 's3_start_together_cutscene') {
    return startStage3TogetherCutscene(state);
  }
  if (action === 's3_start_travel_to_moving') {
    return startStage3TravelToMoving(state);
  }
  if (action === 's3_start_proposal_cutscene') {
    return startStage3ProposalCutscene(state);
  }
  if (action === 's3_unlock_hotdog_exit' && state.stage3) {
    return {
      ...state,
      stage3: {
        ...state.stage3,
        metFriendsOnStreet: true,
        friendsFollowPlayer: true,
        arielFollowsPlayer: true,
      },
    };
  }
  if (action === 's3_start_hotdog_cutscene') {
    return startStage3HotdogCutscene(state);
  }
  if (action === 's3_trigger_wrong_hand') {
    return startStage3WrongHandSetup(state);
  }
  if (action === 's3_start_videostore_cutscene') {
    return startStage3VideoStoreCutscene(state);
  }
  if (action === 's3_start_movienight_cutscene') {
    return startStage3MovieNightCutscene(state);
  }
  if (action === 's3_start_moving_celebration') {
    return startStage3MovingCelebration(state);
  }
  if (action === 's3_start_ending_cutscene') {
    return startStage3EndingCutscene(state);
  }
  if (action === 's3_complete_stage') {
    return finishStage3Ending(state);
  }

  // Trigger the funny "Ariel pega a mão errada" scene right after browsing the first VHS shelf!
  if (
    state.questPhase === 's3_explore_videostore' &&
    state.stage3 &&
    !state.stage3.wrongHandTriggered &&
    (completedDialogueId === 's3_vhs_comedy' ||
      completedDialogueId === 's3_vhs_action' ||
      completedDialogueId === 's3_vhs_romance' ||
      completedDialogueId === 's3_vhs_releases')
  ) {
    return startStage3WrongHandSetup(state);
  }

  return state;
}

// ----------------------------------------------------------------------------
// TIMERS & CUTSCENE STEPPER
// ----------------------------------------------------------------------------
export function stepStage3Simulation(state: SimulationState, dt: number): SimulationState {
  const s3 = state.stage3;
  if (!s3) return state;

  let nextMemoryTitle = s3.recentMemoryTitle;
  let nextMemoryTimer = s3.recentMemoryTimer;
  if (nextMemoryTimer > 0) {
    nextMemoryTimer = Math.max(0, nextMemoryTimer - dt);
    if (nextMemoryTimer === 0) nextMemoryTitle = null;
  }

  // Cutscene state machine
  if (s3.cutscene !== 'none') {
    const t = s3.cutsceneElapsed + dt;

    if (s3.cutscene === 'time_passage') {
      if (t >= S3_TIME_PASSAGE_DURATION) {
        return skipStage3Intro(state);
      }
      return {
        ...state,
        stage3: { ...s3, cutsceneElapsed: t, recentMemoryTitle: nextMemoryTitle, recentMemoryTimer: nextMemoryTimer },
      };
    }

    if (s3.cutscene === 'together_montage') {
      if (t >= S3_TOGETHER_MONTAGE_DURATION) {
        return startStage3WalkExplore(state);
      }
      let camX = 7.7 * TILE_SIZE;
      let camY = 7.1 * TILE_SIZE;
      let camZoom = 1.42;
      if (t >= 2.6 && t < 5.0) {
        const p = (t - 2.6) / 2.4;
        camX = (7.8 + p * 6.4) * TILE_SIZE;
        camY = 8.2 * TILE_SIZE;
        camZoom = 1.38;
      } else if (t >= 5.0) {
        camX = 12.2 * TILE_SIZE;
        camY = 7.9 * TILE_SIZE;
        camZoom = 1.42;
      }
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          cameraFocusX: camX,
          cameraFocusY: camY,
          cameraZoom: camZoom,
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }

    // Animated Travel Cutscene 1: Street -> Hot Dog Stand
    if (s3.cutscene === 'travel_to_hotdog') {
      if (t >= S3_TRAVEL_DURATION) {
        return startStage3HotdogExplore(state);
      }
      return {
        ...state,
        stage3: { ...s3, cutsceneElapsed: t, recentMemoryTitle: nextMemoryTitle, recentMemoryTimer: nextMemoryTimer },
      };
    }

    // Hot Dog Eating Cutscene -> Return to open sidewalk with Locadora door unlocked!
    if (s3.cutscene === 'hotdog_eating') {
      if (t >= S3_HOTDOG_EATING_DURATION) {
        return {
          ...state,
          questPhase: 's3_explore_hotdog',
          activeDialogue: STAGE_3_DIALOGUES.s3_hotdog_after,
          dialogueLineIndex: 0,
          player: { ...state.player, x: 7.4 * TILE_SIZE, y: 7.2 * TILE_SIZE, dir: 'right', isMoving: false },
          stage3: {
            ...s3,
            cutscene: 'none',
            cutsceneElapsed: 0,
            orderedHotdog: true,
            friendsFollowPlayer: true,
            arielFollowsPlayer: true,
            cameraZoom: 1.0,
            recentMemoryTitle: nextMemoryTitle,
            recentMemoryTimer: nextMemoryTimer,
          },
        };
      }
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          cameraFocusX: 7.4 * TILE_SIZE,
          cameraFocusY: 5.5 * TILE_SIZE,
          cameraZoom: 1.08 + Math.min(0.05, t * 0.01),
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }

    // Animated Travel Cutscene 2 (legacy fallback -> enters Video Store directly)
    if (s3.cutscene === 'travel_to_videostore') {
      if (t >= S3_TRAVEL_DURATION) {
        return startStage3VideoStoreExplore(state, true);
      }
      return {
        ...state,
        stage3: { ...s3, cutsceneElapsed: t, recentMemoryTitle: nextMemoryTitle, recentMemoryTimer: nextMemoryTimer },
      };
    }

    // Funny Locadora Interactive Scene — Step 1: Ariel grabs Laura's hand by mistake -> Player Choice!
    if (s3.cutscene === 'videostore_wrong_hand_setup') {
      const readyForChoice = t >= S3_WRONG_HAND_SETUP_PROMPT_TIME;
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          wrongHandChoicePending: readyForChoice,
          cameraFocusX: 8.6 * TILE_SIZE,
          cameraFocusY: 6.6 * TILE_SIZE,
          cameraZoom: 1.15,
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }

    // Funny Locadora Scene — Branch A: Grazi & Laura wait silently until Ariel finally notices!
    if (s3.cutscene === 'videostore_wrong_hand_wait') {
      if (t >= S3_WRONG_HAND_WAIT_DURATION) {
        return {
          ...state,
          questPhase: 's3_explore_videostore',
          activeDialogue: STAGE_3_DIALOGUES.s3_wrong_hand_after_wait,
          dialogueLineIndex: 0,
          player: { ...state.player, x: 9.2 * TILE_SIZE, y: 7.7 * TILE_SIZE, dir: 'left', isMoving: false, reactionEmotion: 'amused' },
          stage3: {
            ...s3,
            cutscene: 'none',
            cutsceneElapsed: 0,
            wrongHandResolved: true,
            wrongHandChoicePending: false,
            cameraZoom: 1.0,
            recentMemoryTitle: nextMemoryTitle,
            recentMemoryTimer: nextMemoryTimer,
          },
        };
      }
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          cameraFocusX: 8.6 * TILE_SIZE,
          cameraFocusY: 6.6 * TILE_SIZE,
          cameraZoom: 1.18 + Math.min(0.06, t * 0.012),
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }

    // Funny Locadora Scene — Branch B: Grazi warns Ariel playfully right away!
    if (s3.cutscene === 'videostore_wrong_hand_tell') {
      if (t >= S3_WRONG_HAND_TELL_DURATION) {
        return {
          ...state,
          questPhase: 's3_explore_videostore',
          activeDialogue: STAGE_3_DIALOGUES.s3_wrong_hand_after_tell,
          dialogueLineIndex: 0,
          player: { ...state.player, x: 9.2 * TILE_SIZE, y: 7.7 * TILE_SIZE, dir: 'left', isMoving: false, reactionEmotion: 'amused' },
          stage3: {
            ...s3,
            cutscene: 'none',
            cutsceneElapsed: 0,
            wrongHandResolved: true,
            wrongHandChoicePending: false,
            cameraZoom: 1.0,
            recentMemoryTitle: nextMemoryTitle,
            recentMemoryTimer: nextMemoryTimer,
          },
        };
      }
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          cameraFocusX: 8.6 * TILE_SIZE,
          cameraFocusY: 6.6 * TILE_SIZE,
          cameraZoom: 1.18,
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }

    // Video Store Browsing & Choosing a Tape Cutscene -> Unlock glass exit doors!
    if (s3.cutscene === 'videostore_picking') {
      if (t >= S3_VIDEOSTORE_PICKING_DURATION) {
        return {
          ...state,
          questPhase: 's3_explore_videostore',
          activeDialogue: STAGE_3_DIALOGUES.s3_videostore_after_pick,
          dialogueLineIndex: 0,
          player: { ...state.player, x: 11.8 * TILE_SIZE, y: 10.6 * TILE_SIZE, dir: 'down', isMoving: false },
          stage3: {
            ...s3,
            cutscene: 'none',
            cutsceneElapsed: 0,
            pickedMovieTape: true,
            friendsFollowPlayer: true,
            arielFollowsPlayer: true,
            cameraZoom: 1.0,
            recentMemoryTitle: nextMemoryTitle,
            recentMemoryTimer: nextMemoryTimer,
          },
        };
      }
      const p = Math.min(1, t / S3_VIDEOSTORE_PICKING_DURATION);
      const camX = p < 0.55 ? (9.8 + p * 4.2) * TILE_SIZE : 10.6 * TILE_SIZE;
      const camY = p < 0.55 ? 6.0 * TILE_SIZE : 5.2 * TILE_SIZE;
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          cameraFocusX: camX,
          cameraFocusY: camY,
          cameraZoom: 1.04,
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }

    // Animated Travel Cutscene 3: Video Store -> Home Living Room
    if (s3.cutscene === 'travel_to_livingroom') {
      if (t >= S3_TRAVEL_DURATION) {
        return startStage3LivingRoomExplore(state, true);
      }
      return {
        ...state,
        stage3: { ...s3, cutsceneElapsed: t, recentMemoryTitle: nextMemoryTitle, recentMemoryTimer: nextMemoryTimer },
      };
    }

    // Movie Night Sofa & Popcorn Cutscene -> Unlock door to Moving Day!
    if (s3.cutscene === 'movie_night_sofa') {
      if (t >= S3_MOVIENIGHT_DURATION) {
        return {
          ...state,
          questPhase: 's3_explore_livingroom',
          activeDialogue: STAGE_3_DIALOGUES.s3_movienight_end,
          dialogueLineIndex: 0,
          player: { ...state.player, x: 8.8 * TILE_SIZE, y: 13.3 * TILE_SIZE, dir: 'up', isMoving: false },
          stage3: {
            ...s3,
            cutscene: 'none',
            cutsceneElapsed: 0,
            watchedMovieNight: true,
            cameraZoom: 1.0,
            recentMemoryTitle: nextMemoryTitle,
            recentMemoryTimer: nextMemoryTimer,
          },
        };
      }
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          cameraFocusX: 12.0 * TILE_SIZE,
          cameraFocusY: 8.65 * TILE_SIZE,
          cameraZoom: 1.18 + Math.min(0.05, t * 0.006),
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }

    // Animated Travel Cutscene 4: Living Room -> Moving Day House
    if (s3.cutscene === 'travel_to_moving') {
      if (t >= S3_TRAVEL_DURATION) {
        return startStage3MovingDay(state, true);
      }
      return {
        ...state,
        stage3: { ...s3, cutsceneElapsed: t, recentMemoryTitle: nextMemoryTitle, recentMemoryTimer: nextMemoryTimer },
      };
    }

    if (s3.cutscene === 'moving_celebration') {
      if (t >= S3_MOVING_CELEBRATION_DURATION) {
        return startStage3ProposalCutscene(state);
      }
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          cameraFocusX: 12.2 * TILE_SIZE,
          cameraFocusY: 4.9 * TILE_SIZE,
          cameraZoom: 1.46,
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }

    // Special Cutscene: Reaproximação e Pedido de Namoro logo após a mudança!
    if (s3.cutscene === 'moving_proposal') {
      if (t >= S3_PROPOSAL_DURATION) {
        return startStage3TogetherCutscene(state);
      }
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          cameraFocusX: 12.0 * TILE_SIZE,
          cameraFocusY: 5.45 * TILE_SIZE,
          cameraZoom: 1.48 + Math.min(0.14, t * 0.018),
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }

    if (s3.cutscene === 'ending_together') {
      return {
        ...state,
        stage3: {
          ...s3,
          cutsceneElapsed: t,
          cameraFocusX: 12.0 * TILE_SIZE,
          cameraFocusY: 6.9 * TILE_SIZE,
          cameraZoom: 1.32 + Math.min(0.08, t * 0.015),
          endingReadyToFinish: t >= S3_ENDING_READY_DELAY,
          recentMemoryTitle: nextMemoryTitle,
          recentMemoryTimer: nextMemoryTimer,
        },
      };
    }
  }

  // Live animated helper movement during Cena 6 — A Mudança!
  let nextNpcs = state.npcs;
  let nextHelperTimer = s3.helperTimer;
  if (state.questPhase === 's3_moving_day' && !state.activeDialogue) {
    nextHelperTimer = s3.helperTimer + dt;
    nextNpcs = state.npcs.map((npc) => {
      if (npc.role !== 'ariel' && npc.role !== 'leo') return npc;
      const offset = npc.role === 'leo' ? 3.2 : 0;
      const cycle = (nextHelperTimer + offset) % 6.4;
      const startX = (npc.role === 'ariel' ? 7.4 : 10.6) * TILE_SIZE;
      const startY = 10.7 * TILE_SIZE;
      const endX = (npc.role === 'ariel' ? 9.3 : 14.7) * TILE_SIZE;
      const endY = 5.1 * TILE_SIZE;

      let p: number;
      let dir: Direction;
      if (cycle < 3.4) {
        p = cycle / 3.4;
        dir = 'right';
      } else {
        p = 1 - (cycle - 3.4) / 3.0;
        dir = 'down';
      }
      return {
        ...npc,
        x: startX + (endX - startX) * p,
        y: startY + (endY - startY) * p,
        dir,
      };
    });
  }

  return {
    ...state,
    npcs: nextNpcs,
    stage3: {
      ...s3,
      helperTimer: nextHelperTimer,
      recentMemoryTitle: nextMemoryTitle,
      recentMemoryTimer: nextMemoryTimer,
    },
  };
}

// ----------------------------------------------------------------------------
// CUTSCENE CAPTIONS & DYNAMIC OBJECTIVE PLAQUE
// ----------------------------------------------------------------------------
export function getStage3CutsceneCaption(state: SimulationState): Stage2CutsceneCaption | null {
  if (state.stageId !== 'stage-3' || !state.stage3 || state.stage3.cutscene === 'none') {
    return null;
  }

  const { cutscene, cutsceneElapsed, endingReadyToFinish } = state.stage3;

  if (cutscene === 'time_passage') {
    if (cutsceneElapsed < 2.9) {
      return {
        badge: 'FASE 3 · DESSA VEZ, PRA FICAR',
        text: 'Algum tempo passou desde o término de Grazi e Ariel...',
        canSkipIntro: true,
      };
    }
    return {
      badge: 'PRIMEIRO · LAURA E LÉO',
      text: 'Enquanto os dois estavam separados, Laura e Léo começaram a namorar — um relacionamento que durou quatro anos.',
      canSkipIntro: true,
    };
  }

  if (cutscene === 'together_montage') {
    if (cutsceneElapsed < 2.6) {
      return {
        badge: 'DEPOIS DA MUDANÇA · JUNTOS DE NOVO',
        text: 'Com o pedido de namoro no dia da mudança, Grazi e Ariel voltaram a ficar juntos — agora de verdade.',
      };
    }
    if (cutsceneElapsed < 5.0) {
      return {
        badge: 'DEPOIS DA MUDANÇA · JUNTOS DE NOVO',
        text: 'Caminhadas de mãos dadas pelo bairro, carinho e sorrisos leves — dessa vez, pra ficar.',
      };
    }
    return {
      badge: 'OS QUATRO JUNTOS · DOIS CASAIS',
      text: 'Agora Laura e Léo e Grazi e Ariel formavam dois casais inseparáveis, prontos para viver muitas lembranças juntos.',
    };
  }

  if (cutscene === 'travel_to_hotdog') {
    return {
      badge: 'CAMINHANDO PELO BAIRRO',
      text: 'Os quatro seguem juntos pela calçada até a barraca de cachorro-quente da esquina...',
    };
  }

  if (cutscene === 'hotdog_eating') {
    if (cutsceneElapsed < 3.3) {
      return {
        badge: 'BARRACA DE CACHORRO-QUENTE',
        text: 'Molho quentinho, batata palha, ketchup e mostarda — cada um montando o seu cachorro-quente do jeito preferido.',
      };
    }
    return {
      badge: 'BARRACA DE CACHORRO-QUENTE',
      text: 'Entre mordidas e risadas, o passeio dos quatro transforma um lanche simples em uma lembrança inesquecível.',
    };
  }

  if (cutscene === 'travel_to_videostore') {
    return {
      badge: 'RUMO À LOCADORA DE VÍDEOS',
      text: 'Com a noite chegando, a turma segue pela rua iluminada até a locadora de filmes...',
    };
  }

  if (cutscene === 'videostore_wrong_hand_setup') {
    if (cutsceneElapsed < 1.1) {
      return {
        badge: 'LOCADORA DE VÍDEOS · MÃO TROCADA',
        speaker: 'Ariel',
        speakerId: 'ariel',
        emotion: 'happy',
        text: 'Distraído olhando as capas coloridas das fitas VHS, Ariel estende o braço para segurar a mão de Grazi...',
      };
    }
    return {
      badge: 'LOCADORA DE VÍDEOS · MÃO TROCADA',
      speaker: 'Laura',
      speakerId: 'laura',
      emotion: 'surprised',
      text: '...mas acaba segurando a mão de Laura! As duas percebem na hora e seguram o riso — e Ariel nem desconfiou!',
    };
  }

  if (cutscene === 'videostore_wrong_hand_wait') {
    if (cutsceneElapsed < 1.7) {
      return {
        badge: 'ESPERANDO ARIEL PERCEBER...',
        speaker: 'Ariel',
        speakerId: 'ariel',
        emotion: 'happy',
        text: 'Olha essa capa aqui, amor... acho que a turma toda vai curtir esse filme!',
        canHoldLaugh: true,
      };
    }
    if (cutsceneElapsed < 3.0) {
      return {
        badge: 'ESPERANDO ARIEL PERCEBER...',
        speaker: 'Grazi & Laura',
        speakerId: 'grazi',
        emotion: 'amused',
        text: 'Mais alguns segundos se passam... Laura e Grazi se olham segurando a gargalhada enquanto Ariel continua de mãos dadas sem notar!',
        canHoldLaugh: true,
      };
    }
    return {
      badge: 'OPA!! MÃO ERRADA!!',
      speaker: 'Ariel',
      speakerId: 'ariel',
      emotion: 'surprised',
      text: 'ESPERA AÍ... LAURA?! EU TAVA SEGURANDO A TUA MÃO?!',
    };
  }

  if (cutscene === 'videostore_wrong_hand_tell') {
    if (cutsceneElapsed < 1.35) {
      return {
        badge: 'AVISANDO O ARIEL',
        speaker: 'Grazi',
        speakerId: 'grazi',
        emotion: 'amused',
        text: 'Ei, Ariel... tem certeza de que essa mão aí que você tá segurando é a minha?',
      };
    }
    return {
      badge: 'OPA!! MÃO ERRADA!!',
      speaker: 'Ariel',
      speakerId: 'ariel',
      emotion: 'surprised',
      text: 'O QUÊ?! LAURA?! Nossa, eu jurei que tinha pegado na mão da Grazi!',
    };
  }

  if (cutscene === 'videostore_picking') {
    if (cutsceneElapsed < 3.5) {
      return {
        badge: 'LOCADORA DE VÍDEOS · ANOS 90',
        text: 'Passeando pelos corredores cheios de fitas VHS e capas coloridas, os quatro debatem qual filme levar.',
      };
    }
    return {
      badge: 'LOCADORA DE VÍDEOS · ANOS 90',
      text: 'Fita escolhida e registrada no balcão — agora é hora de ir pra casa assistir juntos!',
    };
  }

  if (cutscene === 'travel_to_livingroom') {
    return {
      badge: 'VOLTANDO PARA CASA',
      text: 'Fita VHS na mão e muita conversa boa no caminho de volta para a sala de casa...',
    };
  }

  if (cutscene === 'movie_night_sofa') {
    if (cutsceneElapsed < 4.2) {
      return {
        badge: 'NOITE DE FILME EM CASA',
        text: 'Os quatro juntos no sofá, filme passando na TV e uma tigela de pipoca disputada de mão em mão.',
      };
    }
    return {
      badge: 'A AMIZADE DOS QUATRO',
      text: 'Laura e Léo namoraram durante quatro anos — e noites simples assim, rindo juntos na sala, marcaram aquela época.',
    };
  }

  if (cutscene === 'travel_to_moving') {
    return {
      badge: 'SEGUNDO · O DIA DA MUDANÇA',
      text: 'Léo e Ariel acompanham Grazi até a casa nova para ajudar a carregar as caixas e os móveis...',
    };
  }

  if (cutscene === 'moving_celebration') {
    return {
      badge: 'A MUDANÇA · CASA NOVA',
      text: 'Tudo entregue na casa nova! Léo se despede para encontrar Laura e deixa Grazi e Ariel conversando a sós na varanda...',
    };
  }

  if (cutscene === 'moving_proposal') {
    if (cutsceneElapsed < 2.8) {
      return {
        badge: 'A MUDANÇA · A REAPROXIMAÇÃO',
        speaker: 'Ariel',
        speakerId: 'ariel',
        emotion: 'romantic',
        text: 'Passar esse dia contigo na mudança me fez lembrar o quanto eu sentia tua falta, Grazi...',
      };
    }
    if (cutsceneElapsed < 5.8) {
      return {
        badge: 'O PEDIDO DE NAMORO',
        speaker: 'Ariel',
        speakerId: 'ariel',
        emotion: 'romantic',
        text: 'Estar perto de você hoje me deu certeza: Grazi, você quer namorar comigo de novo?',
      };
    }
    return {
      badge: 'DESSA VEZ, PRA FICAR',
      speaker: 'Grazi',
      speakerId: 'grazi',
      emotion: 'blush',
      text: 'Quero, Ariel... dessa vez, pra ficar.',
    };
  }

  if (cutscene === 'ending_together') {
    return {
      badge: 'DESSA VEZ, PRA FICAR',
      text: STAGE_3_CLOSING_QUOTE,
      canFinishEnding: endingReadyToFinish,
    };
  }

  return null;
}

export function getStage3ObjectiveText(state: SimulationState): string {
  const s3 = state.stage3;
  switch (state.questPhase) {
    case 's3_intro_time':
      return 'Enquanto isso, Laura e Léo começaram a namorar...';
    case 's3_explore_reunion':
      return 'Aproxime-se de Laura e Léo na rua do bairro para conversar';
    case 's3_travel_moving':
      return 'Indo com Léo e Ariel para o Dia da Mudança...';
    case 's3_moving_day':
      if (s3?.carryingItemId) {
        return `Leve o item até a varanda da casa nova (${s3.movingDeliveredCount}/4)`;
      }
      return `Ajude na mudança com Ariel e Léo: pegue as caixas na calçada (${s3?.movingDeliveredCount ?? 0}/4)`;
    case 's3_cutscene_moving_celebration':
      return 'Mudança concluída! Hora de conversar com Ariel...';
    case 's3_cutscene_proposal':
      return 'Reaproximação e o pedido de namoro...';
    case 's3_cutscene_together':
      return 'Dessa vez, juntos de novo...';
    case 's3_explore_walk':
      if (s3?.metFriendsOnStreet) {
        return 'Caminhem os dois casais para a direita até a Barraca de Cachorro-Quente →';
      }
      return 'Passeie de mãos dadas com Ariel até encontrar Laura e Léo';
    case 's3_travel_hotdog':
      return 'Os quatro indo até a Barraca de Cachorro-Quente...';
    case 's3_explore_hotdog':
      if (s3?.orderedHotdog) {
        return 'Caminhe até a entrada da Locadora de Vídeos (direita) e entre pela porta';
      }
      return 'Aproxime-se da barraca de cachorro-quente na calçada para pedir com a turma';
    case 's3_cutscene_hotdog':
      return 'Comendo cachorro-quente na calçada com os dois casais!';
    case 's3_travel_videostore':
      return 'Entrando na Locadora de Vídeos...';
    case 's3_explore_videostore':
      if (s3?.pickedMovieTape) {
        return 'Saia pela porta da Locadora (abaixo) para ir ver o filme em casa ↓';
      }
      if (s3?.wrongHandResolved) {
        return 'Explore mais prateleiras ou vá ao balcão (esquerda) para alugar a fita';
      }
      return 'Caminhe entre as prateleiras de fitas VHS e olhe as capas com a turma';
    case 's3_cutscene_videostore':
      return 'Escolhendo a fita VHS da noite...';
    case 's3_travel_livingroom':
      return 'Voltando para casa com o filme...';
    case 's3_explore_livingroom':
      if (s3?.watchedMovieNight) {
        return 'Siga até a porta da sala (abaixo) para o fim de tarde da Fase 3 ↓';
      }
      return 'Aproxime-se do sofá com a tigela de pipoca para assistir ao filme';
    case 's3_cutscene_movienight':
      return 'Noite de filme e pipoca no sofá com os dois casais!';
    case 's3_ending_together':
      return 'Dessa vez, pra ficar...';
    default:
      return 'Fase 3 concluída!';
  }
}
