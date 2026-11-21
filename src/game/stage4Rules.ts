import { TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from './mapData';
import {
  STAGE4_BAR_MAN_POS,
  STAGE4_BICYCLE_POS,
  STAGE4_BUILD_SITE_POS,
  STAGE4_CONSOLE_POS,
  STAGE4_RADIO_POS,
  STAGE4_BIKE_BOARD_DURATION,
  STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION,
  STAGE4_HOME_BIKE_DEST_X,
  STAGE4_SCHOOL_BIKE_START_X,
  STAGE4_SCHOOL_BIKE_STOP_X,
  STAGE4_STREET_CONTINUE_POS,
  STAGE_4_CLOSING_QUOTE,
  STAGE_4_DIALOGUES,
  STAGE_4_MEMORIES,
  STAGE_4_VIDEOGAME_PUZZLES,
  createInitialBuildTasks,
  createStage4Npcs,
  isStage4TileSolid,
} from './stage4Data';
import type {
  CharacterEmotion,
  Direction,
  SimulationState,
  SpeakerId,
  Stage4BikeRideState,
  Stage4State,
} from './types';

// ============================================================================
// STAGE 4 — NOSSA PEQUENA GRANDE AVENTURA (Pure Simulation & State Machine)
// Strictly pure & unit-testable under Node (zero DOM / image imports).
// ============================================================================

export const S4_PLAYER_SPEED = 114;
export const S4_INTERACT_RADIUS = 64;

export const S4_BIKE_ROUTE_WIDTH = 1166; // Seamless 2-block evening neighborhood avenue (398 + 768)
export const S4_BIKE_START_X = 96;
export const S4_BIKE_START_Y = 10.5 * TILE_SIZE;
export const S4_BIKE_MIN_Y = 9.56 * TILE_SIZE;
export const S4_BIKE_MAX_Y = 11.5 * TILE_SIZE;
export const S4_BIKE_DEST_X = 978; // Right between covered Bus Stop & Escola Estadual gate
export const S4_BIKE_MAX_SPEED_X = 136;
export const S4_BIKE_MAX_SPEED_Y = 76;

export const S4_PREGNANCY_DURATION = 9.0;
export const S4_BICYCLE_DURATION = 9.5;
export const S4_LABOR_WALK_DURATION = 13.2;
export const S4_MATERNITY_TRIP_DURATION = 14.4;
export const S4_BIRTH_DURATION = 9.5;
export const S4_CRIB_DURATION = 11.4;
export const S4_DANCE_DURATION = 9.5;
export const S4_ENDING_READY_DELAY = 2.0;

export interface Stage4CutsceneCaption {
  badge: string;
  speaker?: string;
  speakerId?: SpeakerId;
  emotion?: CharacterEmotion;
  text: string;
  canSkipIntro?: boolean;
  canFinishEnding?: boolean;
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
    cameraFocusX: 12 * TILE_SIZE,
    cameraFocusY: 9 * TILE_SIZE,
  };
}

export function createStage4Simulation(
  skipIntro = false,
  unlockedMemories: string[] = [],
): SimulationState {
  const s4: Stage4State = {
    mapId: 'moms_house_yard',
    locationLabel: 'Casa da Mãe de Grazi · Quintal e Varanda',
    eraLabel: 'Grazi aos 19 anos · Começo da Família',
    cutscene: 'none',
    cutsceneElapsed: 0,
    cameraFocusX: 11.4 * TILE_SIZE,
    cameraFocusY: 9.0 * TILE_SIZE,
    cameraZoom: 1.0,
    graziPregnant: skipIntro,
    cristianAge: 'unborn',
    bikeRide: null,
    buildStage: 0,
    carryingMaterialId: null,
    buildTasks: createInitialBuildTasks(),
    metBarMan: false,
    watchedCristianDance: false,
    gamePuzzleStep: 0,
    gamePuzzlePending: false,
    gamePuzzleFeedback: null,
    gamePuzzleSolvedCount: 0,
    unlockedMemories: [...unlockedMemories],
    recentMemoryTitle: null,
    recentMemoryTimer: 0,
    endingReadyToFinish: false,
  };

  const state: SimulationState = {
    stageId: 'stage-4',
    questPhase: skipIntro ? 's4_explore_moms_house' : 's4_cutscene_bicycle',
    intro: createDoneIntro(),
    arielActivity: 'standing',
    player: {
      x: 11.4 * TILE_SIZE,
      y: 10.2 * TILE_SIZE,
      width: 18,
      height: 14,
      dir: 'up',
      walkDistance: 0,
      isMoving: false,
      isDancing: false,
      reactionEmotion: 'happy',
    },
    npcs: skipIntro ? createStage4Npcs('moms_house_yard', 'moms_house') : [],
    activeDialogue: skipIntro ? STAGE_4_DIALOGUES.s4_moms_house_intro : null,
    dialogueLineIndex: 0,
    slowDance: createIdleSlowDance(),
    kissCutscene: createIdleKiss(),
    stage2: null,
    stage3: null,
    stage4: s4,
    elapsedSeconds: 0,
    beatTimer: 0,
    discoveredProps: [],
    heartsSpawned: 0,
  };
  return skipIntro ? state : startStage4SchoolPickupCutscene(state);
}

export function startStage4SchoolPickupCutscene(state: SimulationState): SimulationState {
  if (!state.stage4) return state;
  return {
    ...state,
    questPhase: 's4_cutscene_bicycle',
    stage4: {
      ...state.stage4,
      mapId: 'neighborhood_bike_road',
      locationLabel: 'Escola · Saída para casa',
      eraLabel: 'A volta da escola de bicicleta',
      cutscene: 'bicycle_ride',
      cutsceneElapsed: 0,
      cameraFocusX: STAGE4_SCHOOL_BIKE_START_X,
      cameraFocusY: 8.9 * TILE_SIZE,
      cameraZoom: 1.0,
      graziPregnant: false,
      cristianAge: 'unborn',
      bikeRide: {
        active: false,
        x: STAGE4_SCHOOL_BIKE_START_X,
        y: S4_BIKE_START_Y,
        vx: 0,
        vy: 0,
        facing: 'left',
        wheelAngle: 0,
        pedalPhase: 0,
        graziSway: 0,
        routeLength: WORLD_WIDTH,
        destinationX: STAGE4_HOME_BIKE_DEST_X,
        arrived: false,
        farewellDialogueTriggered: false,
      },
    },
    player: {
      ...state.player,
      x: STAGE4_SCHOOL_BIKE_START_X,
      y: S4_BIKE_START_Y,
      dir: 'left',
      isMoving: false,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage4PregnancyReveal(state: SimulationState): SimulationState {
  if (!state.stage4) return state;
  const s4 = unlockStage4Memory(
    {
      ...state.stage4,
      mapId: 'moms_house_yard',
      locationLabel: 'Casa da Mãe de Grazi · A notícia',
      eraLabel: 'A descoberta da gravidez',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 11.4 * TILE_SIZE,
      cameraFocusY: 9.0 * TILE_SIZE,
      cameraZoom: 1.0,
      graziPregnant: false,
      bikeRide: null,
    },
    'mem_s4_bicicleta',
  );
  return {
    ...state,
    questPhase: 's4_explore_moms_house',
    stage4: s4,
    player: {
      ...state.player,
      x: 11.4 * TILE_SIZE,
      y: 10.2 * TILE_SIZE,
      dir: 'left',
      isMoving: false,
    },
    npcs: createStage4Npcs('moms_house_yard', 'moms_house'),
    activeDialogue: STAGE_4_DIALOGUES.s4_pregnancy_reveal,
    dialogueLineIndex: 0,
  };
}

export function isStage4CutsceneActive(state: SimulationState): boolean {
  return state.stageId === 'stage-4' && Boolean(state.stage4 && state.stage4.cutscene !== 'none');
}

export function isStage4ExplorationPhase(phase: SimulationState['questPhase']): boolean {
  return (
    phase === 's4_explore_moms_house' ||
    phase === 's4_ride_bicycle' ||
    phase === 's4_build_meia_agua' ||
    phase === 's4_explore_labor_walk' ||
    phase === 's4_explore_toddler_home'
  );
}

function unlockStage4Memory(s4: Stage4State, memoryId: string): Stage4State {
  if (s4.unlockedMemories.includes(memoryId)) return s4;
  const mem = STAGE_4_MEMORIES.find((m) => m.id === memoryId);
  if (!mem) return s4;
  return {
    ...s4,
    unlockedMemories: [...s4.unlockedMemories, memoryId],
    recentMemoryTitle: mem.title,
    recentMemoryTimer: 3.8,
  };
}

export function skipStage4Intro(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-4' || !state.stage4) return state;
  if (state.stage4.cutscene !== 'pregnancy_news') return state;

  const s4 = unlockStage4Memory(
    {
      ...state.stage4,
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 11.4 * TILE_SIZE,
      cameraFocusY: 10.2 * TILE_SIZE,
      cameraZoom: 1.0,
    },
    'mem_s4_gravidez',
  );

  return {
    ...state,
    questPhase: 's4_explore_moms_house',
    stage4: s4,
    activeDialogue: STAGE_4_DIALOGUES.s4_moms_house_intro,
    dialogueLineIndex: 0,
  };
}

export function startStage4BicycleRide(state: SimulationState): SimulationState {
  if (!state.stage4) return state;
  const s4 = unlockStage4Memory(
    {
      ...state.stage4,
      mapId: 'neighborhood_bike_road',
      locationLabel: 'Bairro ao Anoitecer · Caminho da Escola',
      eraLabel: 'De Bicicleta até a Aula',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: S4_BIKE_START_X + 110,
      cameraFocusY: 8.9 * TILE_SIZE,
      cameraZoom: 1.0,
      graziPregnant: true,
      cristianAge: 'unborn',
      bikeRide: {
        active: true,
        x: S4_BIKE_START_X,
        y: S4_BIKE_START_Y,
        vx: 0,
        vy: 0,
        facing: 'right',
        wheelAngle: 0,
        pedalPhase: 0,
        graziSway: 0,
        routeLength: S4_BIKE_ROUTE_WIDTH,
        destinationX: S4_BIKE_DEST_X,
        arrived: false,
        farewellDialogueTriggered: false,
      },
    },
    'mem_s4_bicicleta',
  );

  return {
    ...state,
    questPhase: 's4_ride_bicycle',
    stage4: s4,
    player: {
      ...state.player,
      x: S4_BIKE_START_X,
      y: S4_BIKE_START_Y,
      dir: 'right',
      isMoving: false,
    },
    activeDialogue: null,
    dialogueLineIndex: 0,
    npcs: [],
  };
}

// Keep export alias so existing callers and deep-links route seamlessly to the playable ride
export const startStage4BicycleCutscene = startStage4BicycleRide;

export function startStage4BuildMeiaAgua(
  state: SimulationState,
  showIntroDialogue = true,
): SimulationState {
  if (!state.stage4) return state;
  return {
    ...state,
    questPhase: 's4_build_meia_agua',
    stage4: {
      ...state.stage4,
      mapId: 'backyard_construction',
      locationLabel: 'Fundos da Casa da Mãe · Meia-Água',
      eraLabel: 'Construindo Nossa Primeira Casinha',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 10.2 * TILE_SIZE,
      cameraZoom: 1.0,
      graziPregnant: false,
      cristianAge: 'baby',
      bikeRide: null,
      buildStage: 0,
      carryingMaterialId: null,
      buildTasks: createInitialBuildTasks(),
    },
    player: {
      ...state.player,
      x: 11.4 * TILE_SIZE,
      y: 11.2 * TILE_SIZE,
      dir: 'up',
      isMoving: false,
    },
    npcs: createStage4Npcs('backyard_construction', 'construction'),
    activeDialogue: showIntroDialogue ? STAGE_4_DIALOGUES.s4_construction_intro : null,
    dialogueLineIndex: 0,
  };
}

export function startStage4LaborWalk(
  state: SimulationState,
  _showIntroDialogue = true,
): SimulationState {
  if (!state.stage4) return state;
  const s4 = unlockStage4Memory(
    {
      ...state.stage4,
      mapId: 'neighborhood_bike_road',
      locationLabel: 'Rua do Bairro · 9 Meses de Gestação',
      eraLabel: 'O Dia do Nascimento do Cristian',
      cutscene: 'labor_walk_bar',
      cutsceneElapsed: 0,
      cameraFocusX: 6.4 * TILE_SIZE,
      cameraFocusY: 8.8 * TILE_SIZE,
      cameraZoom: 1.06,
      graziPregnant: true,
      cristianAge: 'unborn',
      bikeRide: null,
      metBarMan: true,
    },
    'mem_s4_menino_lindo',
  );
  return {
    ...state,
    questPhase: 's4_cutscene_labor_walk',
    stage4: s4,
    player: {
      ...state.player,
      x: 4.5 * TILE_SIZE,
      y: 9.2 * TILE_SIZE,
      dir: 'right',
      isMoving: false,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage4MaternityTrip(state: SimulationState): SimulationState {
  if (!state.stage4) return state;
  const s4 = unlockStage4Memory(
    {
      ...state.stage4,
      mapId: 'neighborhood_bike_road',
      locationLabel: 'A Caminho da Maternidade Carmela Dutra',
      eraLabel: 'Com Nani e a sogra do Ariel',
      cutscene: 'maternity_trip',
      cutsceneElapsed: 0,
      cameraFocusX: 11.2 * TILE_SIZE,
      cameraFocusY: 9.2 * TILE_SIZE,
      cameraZoom: 1.02,
      graziPregnant: true,
      cristianAge: 'unborn',
      bikeRide: null,
    },
    'mem_s4_maternidade',
  );
  return {
    ...state,
    questPhase: 's4_cutscene_maternity_trip',
    stage4: s4,
    activeDialogue: null,
    dialogueLineIndex: 0,
    npcs: [],
  };
}

export function startStage4BirthCutscene(state: SimulationState): SimulationState {
  if (!state.stage4) return state;
  return {
    ...state,
    questPhase: 's4_cutscene_birth',
    stage4: {
      ...state.stage4,
      mapId: 'maternidade_carmela_dutra',
      locationLabel: 'Maternidade Carmela Dutra · Bem-vindo, Cristian!',
      eraLabel: 'Cristian Recém-Nascido (Loirinho)',
      cutscene: 'birth_blessing',
      cutsceneElapsed: 0,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 8.6 * TILE_SIZE,
      cameraZoom: 1.06,
      graziPregnant: false,
      cristianAge: 'baby',
      bikeRide: null,
    },
    activeDialogue: null,
    dialogueLineIndex: 0,
    npcs: [],
  };
}

export function startStage4CribScene(state: SimulationState): SimulationState {
  if (!state.stage4) return state;
  const s4 = unlockStage4Memory(
    {
      ...state.stage4,
      mapId: 'cristian_crib_room',
      locationLabel: 'Casa da Mãe de Grazi · O Bercinho do Cristian',
      eraLabel: 'Enxoval Amarelo & Brinquedos do Tio Léo',
      cutscene: 'cristian_crib',
      cutsceneElapsed: 0,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 8.4 * TILE_SIZE,
      cameraZoom: 1.02,
      graziPregnant: false,
      cristianAge: 'baby',
      bikeRide: null,
    },
    'mem_s4_bercinho',
  );
  return {
    ...state,
    questPhase: 's4_cutscene_crib',
    stage4: s4,
    activeDialogue: null,
    dialogueLineIndex: 0,
    npcs: [],
  };
}

export function startStage4ToddlerHome(
  state: SimulationState,
  showIntroDialogue = true,
): SimulationState {
  if (!state.stage4) return state;
  return {
    ...state,
    questPhase: 's4_explore_toddler_home',
    stage4: {
      ...state.stage4,
      mapId: 'meia_agua_interior',
      locationLabel: 'Nossa Casinha Meia-Água · Sala de Estar',
      eraLabel: 'Cristian Pequeno (~2-3 anos · Loirinho)',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 11.2 * TILE_SIZE,
      cameraFocusY: 10.0 * TILE_SIZE,
      cameraZoom: 1.0,
      graziPregnant: false,
      cristianAge: 'toddler',
      watchedCristianDance: false,
    },
    player: {
      ...state.player,
      x: 7.5 * TILE_SIZE,
      y: 11.0 * TILE_SIZE,
      dir: 'right',
      isMoving: false,
    },
    npcs: createStage4Npcs('meia_agua_interior', 'toddler_home'),
    activeDialogue: showIntroDialogue ? STAGE_4_DIALOGUES.s4_toddler_home_intro : null,
    dialogueLineIndex: 0,
  };
}

export function startStage4CristianDanceCutscene(state: SimulationState): SimulationState {
  if (!state.stage4) return state;
  return {
    ...state,
    questPhase: 's4_cutscene_cristian_dance',
    stage4: {
      ...state.stage4,
      mapId: 'meia_agua_interior',
      locationLabel: 'Nossa Casinha · Cristian Adora Dançar!',
      eraLabel: 'Cristian (~2-3 anos · Loirinho)',
      cutscene: 'cristian_dance',
      cutsceneElapsed: 0,
      cameraFocusX: 10.8 * TILE_SIZE,
      cameraFocusY: 9.4 * TILE_SIZE,
      cameraZoom: 1.04,
      graziPregnant: false,
      cristianAge: 'toddler',
      watchedCristianDance: true,
    },
    activeDialogue: null,
    dialogueLineIndex: 0,
    npcs: [],
  };
}

export function startStage4VideogameScene(state: SimulationState): SimulationState {
  if (!state.stage4) return state;
  const s4 = unlockStage4Memory(
    {
      ...state.stage4,
      mapId: 'meia_agua_interior',
      locationLabel: 'Sala da Meia-Água · Enigmas no Videogame',
      eraLabel: 'Aventuras em Ruínas · Cristian (~5 anos · Loirinho)',
      cutscene: 'videogame_session',
      cutsceneElapsed: 0,
      cameraFocusX: 11.4 * TILE_SIZE,
      cameraFocusY: 7.5 * TILE_SIZE,
      cameraZoom: 1.0,
      graziPregnant: false,
      cristianAge: 'child_5y',
      gamePuzzleStep: 0,
      gamePuzzlePending: true,
      gamePuzzleFeedback: null,
      gamePuzzleSolvedCount: 0,
    },
    'mem_s4_videogame',
  );

  return {
    ...state,
    questPhase: 's4_videogame_interactive',
    stage4: s4,
    activeDialogue: null,
    dialogueLineIndex: 0,
    npcs: [],
  };
}

export function chooseStage4VideogameOption(
  state: SimulationState,
  option: 'A' | 'B',
): SimulationState {
  if (state.stageId !== 'stage-4' || !state.stage4) return state;
  const s4 = state.stage4;
  if (s4.cutscene !== 'videogame_session' || !s4.gamePuzzlePending) return state;

  const challenge = STAGE_4_VIDEOGAME_PUZZLES[s4.gamePuzzleStep];
  if (!challenge) return state;

  const picked = option === 'A' ? challenge.optionA : challenge.optionB;
  if (!picked.correct) {
    return {
      ...state,
      stage4: {
        ...s4,
        gamePuzzleFeedback: picked.feedback,
      },
    };
  }

  const nextSolved = s4.gamePuzzleSolvedCount + 1;
  const nextStep = s4.gamePuzzleStep + 1;
  const finishedAll = nextStep >= STAGE_4_VIDEOGAME_PUZZLES.length;

  return {
    ...state,
    heartsSpawned: state.heartsSpawned + 2,
    stage4: {
      ...s4,
      gamePuzzleStep: finishedAll ? STAGE_4_VIDEOGAME_PUZZLES.length : nextStep,
      gamePuzzleSolvedCount: nextSolved,
      gamePuzzlePending: !finishedAll,
      gamePuzzleFeedback: picked.feedback,
      cutsceneElapsed: finishedAll ? 0 : s4.cutsceneElapsed,
    },
  };
}

export function startStage4Ending7y(state: SimulationState): SimulationState {
  if (!state.stage4) return state;
  return {
    ...state,
    questPhase: 's4_ending_family_7y',
    stage4: {
      ...state.stage4,
      mapId: 'backyard_construction',
      locationLabel: 'Nossa Pequena Grande Aventura · Família Reunida',
      eraLabel: 'Cristian aos ~7 anos (Loirinho)',
      cutscene: 'family_ending_7y',
      cutsceneElapsed: 0,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 9.2 * TILE_SIZE,
      cameraZoom: 1.08,
      graziPregnant: false,
      cristianAge: 'child_7y',
      buildStage: 3,
      endingReadyToFinish: false,
    },
    activeDialogue: null,
    dialogueLineIndex: 0,
    npcs: [],
  };
}

export function finishStage4Ending(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-4' || !state.stage4) return state;
  return {
    ...state,
    questPhase: 'stage_complete',
    stage4: {
      ...state.stage4,
      cutscene: 'none',
      endingReadyToFinish: false,
    },
  };
}

function canStandStage4(state: SimulationState, x: number, y: number): boolean {
  const s4 = state.stage4;
  if (!s4) return false;
  const hw = state.player.width / 2;
  const hh = state.player.height / 2;
  const left = x - hw;
  const right = x + hw;
  const top = y - hh;
  const bottom = y + hh;

  if (left < TILE_SIZE || right > WORLD_WIDTH - TILE_SIZE || top < TILE_SIZE || bottom > WORLD_HEIGHT - TILE_SIZE) {
    return false;
  }

  const minCol = Math.floor(left / TILE_SIZE);
  const maxCol = Math.floor((right - 0.01) / TILE_SIZE);
  const minRow = Math.floor(top / TILE_SIZE);
  const maxRow = Math.floor((bottom - 0.01) / TILE_SIZE);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (isStage4TileSolid(s4.mapId, c, r)) return false;
    }
  }

  for (const npc of state.npcs) {
    if (!npc.visible) continue;
    if (Math.abs(x - npc.x) < 18 && Math.abs(y - npc.y) < 14) {
      return false;
    }
  }

  return true;
}

function dirFromVec(dx: number, dy: number, fallback: Direction): Direction {
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(target, current + maxDelta);
  if (current > target) return Math.max(target, current - maxDelta);
  return target;
}

function advanceBicycleMotion(
  bike: Stage4BikeRideState,
  inputX: number,
  inputY: number,
  dt: number,
  forwardDirection: 'left' | 'right' = 'right',
): Stage4BikeRideState {
  const len = Math.hypot(inputX, inputY);
  const nx = len > 0.01 ? inputX / len : 0;
  const ny = len > 0.01 ? inputY / len : 0;
  const isForward =
    (nx > 0 && forwardDirection === 'right') ||
    (nx < 0 && forwardDirection === 'left');
  const targetVx =
    nx * (nx === 0 || isForward ? S4_BIKE_MAX_SPEED_X : S4_BIKE_MAX_SPEED_X * 0.68);
  const targetVy = ny * S4_BIKE_MAX_SPEED_Y;
  const accelX = Math.abs(targetVx) > 0.1 ? 300 : 210;
  const accelY = Math.abs(targetVy) > 0.1 ? 260 : 240;
  const nextVx = approach(bike.vx, targetVx, accelX * dt);
  const nextVy = approach(bike.vy, targetVy, accelY * dt);
  const nextX = Math.max(64, Math.min(bike.routeLength - 68, bike.x + nextVx * dt));
  const nextY = Math.max(
    S4_BIKE_MIN_Y,
    Math.min(S4_BIKE_MAX_Y, bike.y + nextVy * dt),
  );
  const dx = nextX - bike.x;
  const dy = nextY - bike.y;
  const distMoved = Math.hypot(dx, dy);
  const speed = Math.hypot(nextVx, nextVy);
  const isMoving = speed > 6;
  const facing: 'right' | 'left' =
    nx > 0.12 ? 'right' : nx < -0.12 ? 'left' : bike.facing;
  const wheelDir = dx >= 0 ? 1 : -1;
  const wheelAngle = bike.wheelAngle + wheelDir * (distMoved / 13);
  const pedalPhase =
    bike.pedalPhase + (len > 0.01 ? distMoved * 0.095 : distMoved * 0.025);
  const targetSway =
    (nextVy / S4_BIKE_MAX_SPEED_Y) * 0.075 +
    (isMoving ? Math.sin(pedalPhase) * 0.032 : 0);
  const graziSway =
    bike.graziSway + (targetSway - bike.graziSway) * Math.min(1, dt * 8);

  return {
    ...bike,
    x: nextX,
    y: nextY,
    vx: Math.abs(nextVx) < 0.5 && len < 0.01 ? 0 : nextVx,
    vy: Math.abs(nextVy) < 0.5 && len < 0.01 ? 0 : nextVy,
    facing,
    wheelAngle,
    pedalPhase,
    graziSway,
  };
}

function arriveAtBicycleDestination(state: SimulationState): SimulationState {
  const s4 = state.stage4;
  if (!s4?.bikeRide) return state;
  const bike = s4.bikeRide;
  return {
    ...state,
    heartsSpawned: state.heartsSpawned + 2,
    player: {
      ...state.player,
      x: bike.x,
      y: bike.y,
      dir: 'right',
      isMoving: false,
    },
    stage4: {
      ...s4,
      bikeRide: {
        ...bike,
        vx: 0,
        vy: 0,
        facing: 'right',
        arrived: true,
        farewellDialogueTriggered: true,
      },
    },
    activeDialogue: STAGE_4_DIALOGUES.s4_bicycle_arrival,
    dialogueLineIndex: 0,
  };
}

export function moveStage4Player(
  state: SimulationState,
  inputX: number,
  inputY: number,
  dt: number,
): SimulationState {
  if (state.stageId !== 'stage-4' || !state.stage4) return state;
  if (state.activeDialogue || state.stage4.cutscene !== 'none' || state.questPhase === 'stage_complete') {
    if (!state.player.isMoving) return state;
    return { ...state, player: { ...state.player, isMoving: false } };
  }

  // Playable Bicycle Ride physics: smooth momentum, real wheel rotation, pedaling & Grazi sway!
  if (state.questPhase === 's4_ride_bicycle' && state.stage4.bikeRide?.active) {
    const bike = state.stage4.bikeRide;
    if (bike.arrived) {
      return state;
    }

    const nextBike = advanceBicycleMotion(bike, inputX, inputY, dt);
    const dx = nextBike.x - bike.x;
    const dy = nextBike.y - bike.y;
    const distMoved = Math.hypot(dx, dy);
    const speed = Math.hypot(nextBike.vx, nextBike.vy);
    const isMoving = speed > 6;

    const nextState: SimulationState = {
      ...state,
      player: {
        ...state.player,
        x: nextBike.x,
        y: nextBike.y,
        dir: nextBike.facing,
        isMoving,
        walkDistance: state.player.walkDistance + distMoved,
      },
      stage4: {
        ...state.stage4,
        cameraFocusX: nextBike.x + (nextBike.facing === 'right' ? 96 : -36),
        cameraFocusY: 8.9 * TILE_SIZE,
        bikeRide: nextBike,
      },
    };

    // Smoothly arrive and play the tender interaction upon reaching the Bus Stop / Escola Estadual!
    if (nextBike.x >= bike.destinationX) {
      return arriveAtBicycleDestination(nextState);
    }
    return nextState;
  }

  const len = Math.hypot(inputX, inputY);
  const nx = len > 0.01 ? inputX / len : 0;
  const ny = len > 0.01 ? inputY / len : 0;
  const targetVx = nx * S4_PLAYER_SPEED;
  const targetVy = ny * S4_PLAYER_SPEED;
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
  if (canStandStage4(state, tryX, nextY)) nextX = tryX;

  const tryY = nextY + nextVy * dt;
  if (canStandStage4(state, nextX, tryY)) nextY = tryY;

  const moved = Math.hypot(nextX - state.player.x, nextY - state.player.y);
  return {
    ...state,
    player: {
      ...state.player,
      x: nextX,
      y: nextY,
      dir: dirFromVec(nextVx, nextVy, state.player.dir),
      vx: nextVx,
      vy: nextVy,
      isMoving: moved > 0.01,
      walkDistance: state.player.walkDistance + moved,
    },
  };
}

export interface Stage4Interactable {
  type: 'npc' | 'prop' | 'memory';
  id: string;
  label: string;
  dialogueId: string;
  distance: number;
  priority: number;
}

export function findNearestStage4Interactable(state: SimulationState): Stage4Interactable | null {
  if (state.stageId !== 'stage-4' || !state.stage4) return null;
  const s4 = state.stage4;
  if (state.activeDialogue || s4.cutscene !== 'none' || state.questPhase === 'stage_complete') {
    return null;
  }

  const px = state.player.x;
  const py = state.player.y;
  const candidates: Stage4Interactable[] = [];

  if (state.questPhase === 's4_ride_bicycle' && s4.bikeRide?.active && !s4.bikeRide.arrived) {
    const distToDest = Math.max(0, s4.bikeRide.destinationX - s4.bikeRide.x);
    if (distToDest <= 92) {
      candidates.push({
        type: 'prop',
        id: 's4_bike_stop_destination',
        label: 'Parar no ponto de ônibus e na escola',
        dialogueId: 's4_bicycle_arrival',
        distance: distToDest,
        priority: 15,
      });
    }
    return candidates[0] ?? null;
  }

  if (state.questPhase === 's4_explore_moms_house') {
    const bikeDist = Math.hypot(px - STAGE4_BICYCLE_POS.x, py - STAGE4_BICYCLE_POS.y);
    if (bikeDist <= 78) {
      candidates.push({
        type: 'prop',
        id: 's4_bike',
        label: 'Ir de bicicleta com Ariel para a aula da noite',
        dialogueId: 's4_bicycle_prompt',
        distance: bikeDist,
        priority: 12,
      });
    }
    const ariel = state.npcs.find((n) => n.role === 'ariel');
    if (ariel) {
      const d = Math.hypot(px - ariel.x, py - ariel.y);
      if (d <= S4_INTERACT_RADIUS) {
        candidates.push({
          type: 'npc',
          id: 's4_ariel_bike',
          label: 'Sair de bicicleta com Ariel',
          dialogueId: 's4_bicycle_prompt',
          distance: d,
          priority: 11,
        });
      }
    }
  } else if (state.questPhase === 's4_build_meia_agua') {
    if (s4.carryingMaterialId) {
      const siteDist = Math.hypot(px - STAGE4_BUILD_SITE_POS.x, py - STAGE4_BUILD_SITE_POS.y);
      if (siteDist <= 90) {
        candidates.push({
          type: 'prop',
          id: 's4_build_deliver',
          label: `Construir etapa ${s4.buildStage + 1}/3 da meia-água`,
          dialogueId: 's4_build_deliver',
          distance: siteDist,
          priority: 15,
        });
      }
    } else {
      for (const task of s4.buildTasks) {
        if (task.completed) continue;
        const d = Math.hypot(px - task.materialX, py - task.materialY);
        if (d <= 72) {
          candidates.push({
            type: 'prop',
            id: `s4_pick_${task.id}`,
            label: `Pegar: ${task.label}`,
            dialogueId: task.id,
            distance: d,
            priority: 14,
          });
        }
      }
    }
  } else if (state.questPhase === 's4_explore_labor_walk') {
    if (!s4.metBarMan) {
      const d = Math.hypot(px - STAGE4_BAR_MAN_POS.x, py - STAGE4_BAR_MAN_POS.y);
      if (d <= 82) {
        candidates.push({
          type: 'npc',
          id: 's4_bar_man',
          label: 'Passar pelo senhor que sai do bar',
          dialogueId: 's4_bar_man_blessing',
          distance: d,
          priority: 14,
        });
      }
    }
    const endDist = Math.hypot(px - STAGE4_STREET_CONTINUE_POS.x, py - STAGE4_STREET_CONTINUE_POS.y);
    if (endDist <= 88) {
      candidates.push({
        type: 'npc',
        id: 's4_go_birth',
        label: s4.metBarMan
          ? 'Seguir tranquilo com Ariel para o nascimento de Cristian'
          : 'Encontrar Ariel no fim da calçada',
        dialogueId: 's4_go_to_birth',
        distance: endDist,
        priority: s4.metBarMan ? 15 : 9,
      });
    }
  } else if (state.questPhase === 's4_explore_toddler_home') {
    const radioDist = Math.hypot(px - STAGE4_RADIO_POS.x, py - STAGE4_RADIO_POS.y);
    const cristian = state.npcs.find((n) => n.role === 'cristian');
    const crisDist = cristian ? Math.hypot(px - cristian.x, py - cristian.y) : 999;

    if (!s4.watchedCristianDance) {
      if (crisDist <= 74) {
        candidates.push({
          type: 'npc',
          id: 's4_cristian_dance',
          label: 'Colocar música para Cristian dançar',
          dialogueId: 's4_start_dance_prompt',
          distance: crisDist,
          priority: 14,
        });
      }
      if (radioDist <= 74) {
        candidates.push({
          type: 'prop',
          id: 's4_radio',
          label: 'Ligar o rádio para Cristian dançar',
          dialogueId: 's4_start_dance_prompt',
          distance: radioDist,
          priority: 13,
        });
      }
    } else {
      const tvDist = Math.hypot(px - STAGE4_CONSOLE_POS.x, py - STAGE4_CONSOLE_POS.y);
      if (tvDist <= 82) {
        candidates.push({
          type: 'prop',
          id: 's4_console',
          label: 'Jogar videogame com Ariel',
          dialogueId: 's4_after_dance_videogame_prompt',
          distance: tvDist,
          priority: 15,
        });
      }
    }
  }

  // Collectible Stage 4 memories on the current map
  const unlockedSet = new Set(s4.unlockedMemories);
  for (const mem of STAGE_4_MEMORIES) {
    if (mem.mapId !== s4.mapId) continue;
    const dist = Math.hypot(px - mem.x, py - mem.y);
    if (dist <= mem.radius) {
      const already = unlockedSet.has(mem.id);
      candidates.push({
        type: 'memory',
        id: mem.id,
        label: already ? `Relembrar: ${mem.title}` : `Lembrança: ${mem.title}`,
        dialogueId: mem.dialogueId,
        distance: dist,
        priority: already ? 1 : 8,
      });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => (b.priority !== a.priority ? b.priority - a.priority : a.distance - b.distance));
  return candidates[0];
}

export function triggerStage4Interaction(state: SimulationState): {
  next: SimulationState;
  target: Stage4Interactable | null;
} {
  if (state.stageId !== 'stage-4' || !state.stage4) {
    return { next: state, target: null };
  }
  const s4 = state.stage4;
  const target = findNearestStage4Interactable(state);
  if (!target) return { next: state, target: null };

  // Handle arriving & stopping at the Bus Stop / Escola Estadual on the bicycle!
  if (target.id === 's4_bike_stop_destination') {
    return {
      target,
      next: arriveAtBicycleDestination(state),
    };
  }

  // Handle construction material pickup & delivery directly!
  if (target.id.startsWith('s4_pick_')) {
    const taskId = target.dialogueId;
    return {
      target,
      next: {
        ...state,
        stage4: {
          ...s4,
          carryingMaterialId: taskId,
        },
        player: { ...state.player, isMoving: false },
      },
    };
  }

  if (target.id === 's4_build_deliver' && s4.carryingMaterialId) {
    const completedId = s4.carryingMaterialId;
    const updatedTasks = s4.buildTasks.map((t) =>
      t.id === completedId ? { ...t, completed: true } : t,
    );
    const nextStage = Math.min(3, s4.buildStage + 1);
    let nextS4: Stage4State = {
      ...s4,
      buildStage: nextStage,
      carryingMaterialId: null,
      buildTasks: updatedTasks,
    };
    if (nextStage === 3) {
      nextS4 = unlockStage4Memory(nextS4, 'mem_s4_meia_agua');
    }
    const dlg =
      nextStage === 1
        ? STAGE_4_DIALOGUES.s4_construction_step_1
        : nextStage === 2
          ? STAGE_4_DIALOGUES.s4_construction_step_2
          : STAGE_4_DIALOGUES.s4_construction_done;

    return {
      target,
      next: {
        ...state,
        stage4: nextS4,
        activeDialogue: dlg,
        dialogueLineIndex: 0,
        player: { ...state.player, isMoving: false },
      },
    };
  }

  let nextS4 = s4;
  if (target.id === 's4_bar_man') {
    nextS4 = unlockStage4Memory({ ...s4, metBarMan: true }, 'mem_s4_menino_lindo');
  } else if (target.type === 'memory') {
    nextS4 = unlockStage4Memory(s4, target.id);
  }

  const dialogue = STAGE_4_DIALOGUES[target.dialogueId];
  if (!dialogue) return { next: state, target: null };

  return {
    target,
    next: {
      ...state,
      stage4: nextS4,
      activeDialogue: dialogue,
      dialogueLineIndex: 0,
      player: { ...state.player, isMoving: false },
    },
  };
}

export function handleStage4DialogueComplete(
  baseCleared: SimulationState,
  _completedDialogueId: string,
  action: NonNullable<SimulationState['activeDialogue']>['onCompleteAction'] | undefined,
): SimulationState {
  if (action === 's4_start_bicycle_cutscene') {
    return startStage4BicycleRide(baseCleared);
  }
  if (action === 's4_start_labor_walk') {
    if (!baseCleared.stage4) return baseCleared;
    const pregnancyState = {
      ...baseCleared,
      stage4: unlockStage4Memory(
        { ...baseCleared.stage4, graziPregnant: true },
        'mem_s4_gravidez',
      ),
    };
    return startStage4LaborWalk(pregnancyState, true);
  }
  if (action === 's4_start_maternity_trip') {
    return startStage4MaternityTrip(baseCleared);
  }
  if (action === 's4_start_birth_cutscene') {
    return startStage4BirthCutscene(baseCleared);
  }
  if (action === 's4_start_crib_scene') {
    return startStage4CribScene(baseCleared);
  }
  if (action === 's4_start_build_meia_agua') {
    return startStage4BuildMeiaAgua(baseCleared, true);
  }
  if (action === 's4_start_toddler_home') {
    return startStage4ToddlerHome(baseCleared, true);
  }
  if (action === 's4_start_cristian_dance') {
    return startStage4CristianDanceCutscene(baseCleared);
  }
  if (action === 's4_start_videogame_scene') {
    return startStage4VideogameScene(baseCleared);
  }
  if (action === 's4_start_ending_7y') {
    return startStage4Ending7y(baseCleared);
  }
  return baseCleared;
}

export function stepStage4Simulation(state: SimulationState, dt: number): SimulationState {
  if (state.stageId !== 'stage-4' || !state.stage4) return state;
  let s4 = state.stage4;

  if (s4.recentMemoryTimer > 0) {
    const nextTimer = Math.max(0, s4.recentMemoryTimer - dt);
    s4 = {
      ...s4,
      recentMemoryTimer: nextTimer,
      recentMemoryTitle: nextTimer > 0 ? s4.recentMemoryTitle : null,
    };
  }

  if (s4.cutscene === 'none') {
    return s4 === state.stage4 ? state : { ...state, stage4: s4 };
  }

  const nextElapsed = s4.cutsceneElapsed + dt;

  if (s4.cutscene === 'pregnancy_news') {
    if (nextElapsed >= S4_PREGNANCY_DURATION) {
      return skipStage4Intro({ ...state, stage4: s4 });
    }
    return {
      ...state,
      stage4: {
        ...s4,
        cutsceneElapsed: nextElapsed,
        cameraZoom: 1.12 + Math.min(0.1, nextElapsed * 0.015),
      },
    };
  }

  if (s4.cutscene === 'bicycle_ride') {
    if (!s4.bikeRide) {
      throw new Error('Bicycle cutscene requires bicycle state.');
    }

    const bike = s4.bikeRide;
    const boardAt =
      STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION + STAGE4_BIKE_BOARD_DURATION;
    let nextBike: Stage4BikeRideState;
    if (nextElapsed < STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION) {
      nextBike = advanceBicycleMotion(bike, -1, 0, dt, 'left');
      if (nextBike.x <= STAGE4_SCHOOL_BIKE_STOP_X) {
        nextBike = {
          ...nextBike,
          x: STAGE4_SCHOOL_BIKE_STOP_X,
          vx: 0,
          vy: 0,
        };
      }
    } else if (nextElapsed < boardAt) {
      nextBike = {
        ...bike,
        x: STAGE4_SCHOOL_BIKE_STOP_X,
        vx: 0,
        vy: 0,
        facing: 'left',
      };
    } else {
      nextBike = advanceBicycleMotion(bike, -1, 0, dt, 'left');
    }

    const reachedHome =
      nextElapsed >= boardAt && nextBike.x <= STAGE4_HOME_BIKE_DEST_X;
    if (reachedHome || nextElapsed >= S4_BICYCLE_DURATION) {
      return startStage4PregnancyReveal({
        ...state,
        stage4: {
          ...s4,
          cutsceneElapsed: nextElapsed,
          bikeRide: {
            ...nextBike,
            x: STAGE4_HOME_BIKE_DEST_X,
            vx: 0,
            vy: 0,
            arrived: true,
          },
        },
      });
    }

    return {
      ...state,
      stage4: {
        ...s4,
        cutsceneElapsed: nextElapsed,
        cameraFocusX: nextBike.x - 36,
        cameraFocusY: 8.6 * TILE_SIZE,
        bikeRide: nextBike,
      },
    };
  }

  if (s4.cutscene === 'labor_walk_bar') {
    if (nextElapsed >= S4_LABOR_WALK_DURATION) {
      return startStage4MaternityTrip({ ...state, stage4: s4 });
    }
    const walkT = Math.min(1, nextElapsed / S4_LABOR_WALK_DURATION);
    return {
      ...state,
      stage4: {
        ...s4,
        cutsceneElapsed: nextElapsed,
        cameraFocusX: (6.2 + walkT * 5.2) * TILE_SIZE,
        cameraFocusY: 8.7 * TILE_SIZE,
        cameraZoom: 1.06,
      },
    };
  }

  if (s4.cutscene === 'maternity_trip') {
    if (nextElapsed >= S4_MATERNITY_TRIP_DURATION) {
      return startStage4BirthCutscene({ ...state, stage4: s4 });
    }
    const arrivedAtHospital = nextElapsed >= 9.2;
    return {
      ...state,
      stage4: {
        ...s4,
        mapId: arrivedAtHospital ? 'maternidade_carmela_dutra' : 'neighborhood_bike_road',
        locationLabel: arrivedAtHospital
          ? 'Chegada · Maternidade Carmela Dutra'
          : nextElapsed < 4.4
            ? 'Saída de Casa · Madrinha Nani ao Volante'
            : 'Trajeto de Carro · A Caminho da Maternidade',
        cutsceneElapsed: nextElapsed,
        cameraFocusX: 12.0 * TILE_SIZE,
        cameraFocusY: arrivedAtHospital ? 8.6 * TILE_SIZE : 9.1 * TILE_SIZE,
        cameraZoom: arrivedAtHospital ? 1.04 : 1.02,
      },
    };
  }

  if (s4.cutscene === 'birth_blessing') {
    if (nextElapsed >= S4_BIRTH_DURATION) {
      return startStage4CribScene({ ...state, stage4: s4 });
    }
    return {
      ...state,
      stage4: {
        ...s4,
        cutsceneElapsed: nextElapsed,
      },
    };
  }

  if (s4.cutscene === 'cristian_crib') {
    if (nextElapsed >= S4_CRIB_DURATION && !state.activeDialogue) {
      return {
        ...state,
        stage4: {
          ...s4,
          cutsceneElapsed: nextElapsed,
        },
        activeDialogue: STAGE_4_DIALOGUES.s4_crib_reflection,
        dialogueLineIndex: 0,
      };
    }
    return {
      ...state,
      stage4: {
        ...s4,
        cutsceneElapsed: nextElapsed,
      },
    };
  }

  if (s4.cutscene === 'cristian_dance') {
    if (nextElapsed >= S4_DANCE_DURATION) {
      return {
        ...state,
        questPhase: 's4_explore_toddler_home',
        stage4: {
          ...s4,
          cutscene: 'none',
          cutsceneElapsed: 0,
          cameraZoom: 1.0,
          watchedCristianDance: true,
        },
        npcs: createStage4Npcs('meia_agua_interior', 'toddler_home'),
        activeDialogue: STAGE_4_DIALOGUES.s4_after_dance_videogame_prompt,
        dialogueLineIndex: 0,
      };
    }
    return {
      ...state,
      stage4: {
        ...s4,
        cutsceneElapsed: nextElapsed,
      },
    };
  }

  if (s4.cutscene === 'videogame_session') {
    // Once all 3 interactive puzzles are solved, hold celebratory beat for 2.6s -> Finale at ~7y!
    if (!s4.gamePuzzlePending && nextElapsed >= 2.6) {
      return startStage4Ending7y({ ...state, stage4: s4 });
    }
    return {
      ...state,
      stage4: {
        ...s4,
        cutsceneElapsed: nextElapsed,
      },
    };
  }

  if (s4.cutscene === 'family_ending_7y') {
    return {
      ...state,
      stage4: {
        ...s4,
        cutsceneElapsed: nextElapsed,
        endingReadyToFinish: nextElapsed >= S4_ENDING_READY_DELAY,
      },
    };
  }

  return { ...state, stage4: s4 };
}

export function getStage4ObjectiveText(state: SimulationState): string | null {
  if (state.stageId !== 'stage-4' || !state.stage4) return null;
  const s4 = state.stage4;
  switch (state.questPhase) {
    case 's4_intro_pregnancy':
      return 'Aos 19 anos · A descoberta da gravidez de Cristian';
    case 's4_explore_moms_house':
      return 'Explore o quintal da casa da mãe de Grazi e vá até a bicicleta com Ariel';
    case 's4_ride_bicycle':
      return s4.bikeRide?.arrived
        ? 'Chegaram ao ponto de ônibus e à escola à noite!'
        : 'Pedale com Ariel levando Grazi na garupa até o ponto de ônibus e a escola (→)';
    case 's4_cutscene_bicycle':
      if (s4.cutsceneElapsed < STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION) {
        return 'Ariel chega de bicicleta para buscar Grazi na escola';
      }
      if (
        s4.cutsceneElapsed <
        STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION + STAGE4_BIKE_BOARD_DURATION
      ) {
        return 'Grazi sobe na garupa para voltar para casa com Ariel';
      }
      return 'Ariel e Grazi estão voltando para casa de bicicleta';
    case 's4_explore_labor_walk':
    case 's4_cutscene_labor_walk':
      return '9 meses de gestação · Caminhando de mãos dadas pela rua do bairro';
    case 's4_cutscene_maternity_trip':
      return 'Com a madrinha Nani a caminho da Maternidade Carmela Dutra';
    case 's4_cutscene_birth':
      return 'O nascimento tranquilo e feliz de Cristian na Maternidade Carmela Dutra';
    case 's4_cutscene_crib':
      return 'O bercinho amarelo do Cristian e os brinquedinhos do tio Léo';
    case 's4_build_meia_agua':
      return s4.carryingMaterialId
        ? `Leve o material até o terreno nos fundos para construir a meia-água (${s4.buildStage}/3)`
        : `Com Cristian nascido, construa a meia-água nos fundos do terreno (${s4.buildStage}/3)`;
    case 's4_explore_toddler_home':
      return s4.watchedCristianDance
        ? 'Aproxime-se da TV e do console para jogar videogame com Ariel'
        : 'Ligue o rádio ou fale com o pequeno Cristian loirinho para vê-lo dançar';
    case 's4_cutscene_cristian_dance':
      return 'Cristian dançando alegre na sala enquanto Grazi e Ariel sorriem';
    case 's4_videogame_interactive':
      return `Ajude Ariel a desvendar os enigmas das ruínas no videogame (${s4.gamePuzzleSolvedCount}/3)`;
    case 's4_ending_family_7y':
      return 'Cristian aos ~7 anos · Nossa Pequena Grande Aventura';
    default:
      return 'Fase 4 concluída!';
  }
}

export function getStage4CutsceneCaption(state: SimulationState): Stage4CutsceneCaption | null {
  if (state.stageId !== 'stage-4' || !state.stage4 || state.stage4.cutscene === 'none') {
    return null;
  }
  const s4 = state.stage4;
  const t = s4.cutsceneElapsed;

  if (s4.cutscene === 'pregnancy_news') {
    if (t < 3.0) {
      return {
        badge: 'FASE 4 · NOSSA PEQUENA GRANDE AVENTURA',
        speaker: 'Um Novo Capítulo',
        speakerId: 'grazi_adult',
        emotion: 'happy',
        text: 'Aos 19 anos, Grazi descobriu que estava grávida de Cristian. Uma fase inteiramente nova começava para os dois.',
        canSkipIntro: true,
      };
    }
    if (t < 6.0) {
      return {
        badge: 'FASE 4 · A NOTÍCIA',
        speaker: 'Ariel',
        speakerId: 'ariel_adult',
        emotion: 'thoughtful',
        text: 'Ariel recebeu a notícia com alegria genuína no coração — e também com a preocupação responsável de cuidar bem da família que estava nascendo.',
        canSkipIntro: true,
      };
    }
    return {
      badge: 'FASE 4 · JUNTOS NESSA AVENTURA',
      speaker: 'Grazi & Ariel',
      speakerId: 'grazi_adult',
      emotion: 'romantic',
      text: 'De mãos dadas no quintal da casa da mãe de Grazi, eles deram o primeiro passo dessa pequena grande aventura.',
      canSkipIntro: true,
    };
  }

  if (s4.cutscene === 'bicycle_ride') {
    if (t < STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION) {
      return {
        badge: 'SAÍDA DA ESCOLA',
        speaker: 'Ariel chega de bicicleta',
        speakerId: 'ariel_adult',
        text: 'Ariel chega de bicicleta à escola para buscar Grazi.',
      };
    }
    if (t < STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION + STAGE4_BIKE_BOARD_DURATION) {
      return {
        badge: 'NA GARUPA',
        speaker: 'Grazi sobe na bicicleta',
        speakerId: 'grazi_adult',
        text: 'Depois de cumprimentar Ariel, Grazi sobe na garupa para irem juntos para casa.',
      };
    }
    return {
      badge: 'CAMINHO DE CASA',
      speaker: 'A volta juntos',
      speakerId: 'ariel_adult',
      text: 'Ariel pedala com cuidado, e os dois seguem juntos para casa.',
    };
  }

  if (s4.cutscene === 'labor_walk_bar') {
    if (t < 4.2) {
      return {
        badge: '9 MESES DE GESTAÇÃO · RUA DO BAIRRO',
        speaker: 'Grazi & Ariel',
        speakerId: 'grazi_adult',
        emotion: 'happy',
        text: 'Aos nove meses de gravidez, Grazi e Ariel caminham juntos e de mãos dadas pela calçada do bairro com calma e carinho.',
      };
    }
    if (t < 8.4) {
      return {
        badge: 'UM ENCONTRO ESPONTÂNEO NA ESQUINA',
        speaker: 'Senhor saindo do bar',
        speakerId: 'bar_man',
        emotion: 'happy',
        text: '“Vai ser um meninão!”',
      };
    }
    return {
      badge: 'GRAZI SORRI, ARIEL FICA SEM GRAÇA',
      speaker: 'Grazi & Ariel',
      speakerId: 'ariel_adult',
      emotion: 'amused',
      text: 'Grazi sorri, enquanto Ariel fica sem graça com o comentário inesperado do senhor.',
    };
  }

  if (s4.cutscene === 'maternity_trip') {
    if (t < 4.4) {
      return {
        badge: 'A CAMINHO DA MATERNIDADE · COM NANI E A SOGRA',
        speaker: 'Nani e a sogra do Ariel',
        speakerId: 'nani',
        emotion: 'happy',
        text: 'Nani e a sogra do Ariel acompanham Grazi e Ariel com carinho até a maternidade.',
      };
    }
    if (t < 9.2) {
      return {
        badge: 'TRAJETO ATÉ A MATERNIDADE CARMELA DUTRA',
        speaker: 'Grazi & Ariel',
        speakerId: 'grazi_adult',
        emotion: 'romantic',
        text: 'No caminho, Nani e a sogra dividem com o casal a emoção de conhecer o bebê.',
      };
    }
    return {
      badge: 'CHEGADA · MATERNIDADE CARMELA DUTRA',
      speaker: 'Nani, Grazi & Ariel',
      speakerId: 'nani',
      emotion: 'happy',
      text: 'Nani e a sogra acompanham Grazi e Ariel até a entrada. Está quase na hora de conhecer Cris.',
    };
  }

  if (s4.cutscene === 'birth_blessing') {
    if (t < 3.4) {
      return {
        badge: 'MATERNIDADE CARMELA DUTRA · O NASCIMENTO',
        speaker: 'Um Dia de Paz e Alegria',
        speakerId: 'grazi_adult',
        emotion: 'happy',
        text: 'Como o senhor da esquina havia previsto com um sorriso, chegou o meninão — em um parto tranquilo, leve e cheio de felicidade.',
      };
    }
    if (t < 6.8) {
      return {
        badge: 'BEM-VINDO, CRISTIAN!',
        speaker: 'Família de Três',
        speakerId: 'ariel_adult',
        emotion: 'romantic',
        text: 'Nos braços de Grazi, Cris recebe o carinho de Ariel, Nani e da sogra do Ariel.',
      };
    }
    return {
      badge: 'DE VOLTA PARA CASA DA MÃE DE GRAZI',
      speaker: 'Cristian (Recém-Nascido · Loirinho)',
      speakerId: 'cristian',
      emotion: 'happy',
      text: 'Agora era hora de levar o bebê para o seu primeiro cantinho especial, já todo preparado em amarelo...',
    };
  }

  if (s4.cutscene === 'cristian_crib') {
    if (state.activeDialogue) return null;
    if (t < 3.8) {
      return {
        badge: 'O BERCINHO DO CRISTIAN · CASA DA MÃE DE GRAZI',
        speaker: 'Enxoval Todo Amarelinho',
        speakerId: 'grazi_adult',
        emotion: 'romantic',
        text: 'No quartinho preparado com tanto carinho, o bercinho todo decorado de amarelo embala o sono tranquilo do pequeno Cristian loirinho.',
      };
    }
    if (t < 7.6) {
      return {
        badge: 'DETALHES DE CARINHO · PRESENTES DO TIO LÉO',
        speaker: 'Brinquedos em Miniatura',
        speakerId: 'ariel_adult',
        emotion: 'happy',
        text: 'Na cômoda e ao lado do berço, os brinquedos em miniatura que o tio Léo deu de presente enfeitam o cantinho do bebê com afeto.',
      };
    }
    return {
      badge: 'OBSERVANDO CRISTIAN DORMIR',
      speaker: 'Grazi & Ariel',
      speakerId: 'grazi_adult',
      emotion: 'romantic',
      text: 'Pertinho do berço, Grazi e Ariel observam cada respiração serena do filho — sonhando agora com a casinha meia-água que vão construir nos fundos.',
    };
  }

  if (s4.cutscene === 'cristian_dance') {
    if (t < 4.6) {
      return {
        badge: 'CRISTIAN CRESCENDO · ~2-3 ANOS',
        speaker: 'Cristian (Loirinho)',
        speakerId: 'cristian',
        emotion: 'happy',
        text: 'O pequeno loirinho descobriu cedo a alegria de dançar! Bastava a música tocar na sala para ele dar voltinhas e balançar no ritmo.',
      };
    }
    return {
      badge: 'ORGULHO DE GRAZI E ARIEL',
      speaker: 'Grazi & Ariel',
      speakerId: 'grazi_adult',
      emotion: 'happy',
      text: 'Grazi e Ariel observavam encantados, sorrindo e aplaudindo enquanto todos elogiavam a animação de Cristian.',
    };
  }

  if (s4.cutscene === 'videogame_session') {
    if (!s4.gamePuzzlePending) {
      return {
        badge: 'ENIGMAS VENCIDOS EM FAMÍLIA!',
        speaker: 'Grazi, Ariel & Cristian (5 anos)',
        speakerId: 'cristian',
        emotion: 'happy',
        text: s4.gamePuzzleFeedback ?? 'Todos os enigmas das ruínas foram superados juntos na sala da meia-água!',
      };
    }
    const ch = STAGE_4_VIDEOGAME_PUZZLES[s4.gamePuzzleStep];
    return {
      badge: `VIDEOGAME EM FAMÍLIA · ${ch?.stageTitle ?? 'RUÍNAS ANTIGAS'}`,
      speaker: 'Grazi ajudando Ariel nos enigmas',
      speakerId: 'grazi_adult',
      text: s4.gamePuzzleFeedback ?? ch?.sceneHint ?? 'Ajudando Ariel a resolver o enigma das ruínas.',
    };
  }

  if (s4.cutscene === 'family_ending_7y') {
    return {
      badge: 'CRISTIAN AOS ~7 ANOS · NOSSA PEQUENA GRANDE AVENTURA',
      text: STAGE_4_CLOSING_QUOTE,
      canFinishEnding: s4.endingReadyToFinish,
    };
  }

  return null;
}
