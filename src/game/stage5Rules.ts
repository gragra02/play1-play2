import { TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH } from './mapData';
import {
  STAGE5_APARTMENT_BEDROOM_DOOR_POS,
  STAGE5_APARTMENT_ESTANTE_POS,
  STAGE5_APARTMENT_EXIT_POS,
  STAGE5_APARTMENT_MESA_POS,
  STAGE5_APARTMENT_SOFA_POS,
  STAGE5_APARTMENT_TV_POS,
  STAGE5_APARTMENT_WINDOW_POS,
  STAGE5_GUESSER_DOOR_POS,
  STAGE5_NURSERY_BUILD_POS,
  STAGE5_NURSERY_EXIT_POS,
  STAGE5_PARK_SKATE_POS,
  STAGE_5_CLOSING_QUOTE,
  STAGE_5_DIALOGUES,
  STAGE_5_KATA_MOVES,
  STAGE_5_MEMORIES,
  STAGE_5_PHONE_CALL_STEPS,
  createStage5Npcs,
  getStage5ParquinhoHotspot,
  isStage5ParquinhoBoxWalkable,
  isStage5TileSolid,
} from './stage5Data';
import type {
  CharacterEmotion,
  Direction,
  KarateHitRating,
  KarateKataMove,
  NpcEntity,
  SimulationState,
  SpeakerId,
  Stage5KarateState,
  Stage5KarateStep,
  Stage5MapId,
  Stage5PhoneCallStep,
  Stage5State,
} from './types';

// ============================================================================
// STAGE 5 — BELA VISTA (Pure Simulation & State Machine)
// Strictly pure & unit-testable under Node (zero DOM / image imports).
// ============================================================================

export const S5_PLAYER_SPEED = 116;
export const S5_INTERACT_RADIUS = 64;

export const S5_ARRIVAL_DURATION = 7.6;
export const S5_KARATE_PODIUM_DURATION = 9.6;
export const S5_PREGNANCY_CALL_DURATION = STAGE_5_PHONE_CALL_STEPS.reduce(
  (acc, step) => acc + step.duration,
  0,
);
export const S5_PREGNANCY_TIME_DURATION = 9.6;
export const S5_LARA_ARRIVAL_DURATION = 8.4;
export const S5_LARA_DANCE_DURATION = 10.2;
export const S5_PARK_REUNION_DURATION = 9.2;
export const S5_ENDING_READY_DELAY = 3.8;

export interface Stage5CutsceneCaption {
  badge: string;
  speaker?: string;
  speakerId?: SpeakerId;
  emotion?: CharacterEmotion;
  text: string;
  fullText?: string;
  stageDirection?: string;
  isTypingComplete?: boolean;
  canSkipIntro?: boolean;
  canFinishEnding?: boolean;
}

export interface Stage5PhoneCallSnapshot {
  step: Stage5PhoneCallStep;
  stepIndex: number;
  totalSteps: number;
  stepElapsed: number;
  visibleText: string;
  isTypingComplete: boolean;
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

export function createInitialKarateState(): Stage5KarateState {
  return {
    active: false,
    round: 1,
    moveIndex: 0,
    totalMoves: STAGE_5_KATA_MOVES.length,
    score: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    maxErrorsForMedal: 2,
    streak: 0,
    ringProgress: 0,
    currentPose: 'bow',
    poseHoldTimer: 0,
    lastRating: '',
    feedbackTimer: 0,
    arielBubbleText: '',
    arielBubbleTimer: 0,
    arielShoutCount: 0,
    screenShakeTimer: 0,
    graziEmotionalTears: false,
    judgeScores: [9.9, 10.0, 9.8],
    passedMedal: false,
    awaitingRetry: false,
    completed: false,
  };
}

export function unlockStage5Memory(s5: Stage5State, memoryId: string): Stage5State {
  if (s5.unlockedMemories.includes(memoryId)) return s5;
  const mem = STAGE_5_MEMORIES.find((m) => m.id === memoryId);
  return {
    ...s5,
    unlockedMemories: [...s5.unlockedMemories, memoryId],
    recentMemoryTitle: mem ? mem.title : s5.recentMemoryTitle,
    recentMemoryTimer: mem ? 3.8 : s5.recentMemoryTimer,
  };
}

export function createStage5Simulation(
  skipIntro = false,
  unlockedMemories: string[] = [],
): SimulationState {
  const s5: Stage5State = {
    mapId: 'bela_vista_guesser',
    locationLabel: 'Bela Vista · Apartamento em Cima do Mercado Guesser',
    eraLabel: 'Cris aos 7 anos · Mudança para o Bela Vista',
    cutscene: skipIntro ? 'none' : 'bela_vista_arrival',
    cutsceneElapsed: 0,
    cameraFocusX: 12.0 * TILE_SIZE,
    cameraFocusY: 9.2 * TILE_SIZE,
    cameraZoom: skipIntro ? 1.0 : 1.08,
    graziPregnant: false,
    lara_announced: false,
    nurseryStage: 0,
    laraAge: 'unborn',
    talkedToCristianBelaVista: false,
    karate: createInitialKarateState(),
    watchedLaraDance: false,
    talkedToCristianAndLucasInPark: false,
    parkTalkedTo: [],
    unlockedMemories: [...unlockedMemories],
    recentMemoryTitle: null,
    recentMemoryTimer: 0,
    endingReadyToFinish: false,
  };

  return {
    stageId: 'stage-5',
    questPhase: skipIntro ? 's5_explore_guesser_street' : 's5_intro_bela_vista',
    intro: createDoneIntro(),
    arielActivity: 'standing',
    player: {
      x: 11.8 * TILE_SIZE,
      y: 10.2 * TILE_SIZE,
      width: 18,
      height: 14,
      dir: 'up',
      walkDistance: 0,
      isMoving: false,
      isDancing: false,
      reactionEmotion: 'happy',
    },
    npcs: createStage5Npcs('guesser_street'),
    activeDialogue: skipIntro ? STAGE_5_DIALOGUES.s5_guesser_intro : null,
    dialogueLineIndex: 0,
    slowDance: createIdleSlowDance(),
    kissCutscene: createIdleKiss(),
    stage2: null,
    stage3: null,
    stage4: null,
    stage5: s5,
    elapsedSeconds: 0,
    beatTimer: 0,
    discoveredProps: [],
    heartsSpawned: 0,
  };
}

export function isStage5CutsceneActive(state: SimulationState): boolean {
  return (
    state.stageId === 'stage-5' &&
    Boolean(state.stage5 && state.stage5.cutscene !== 'none')
  );
}

export function isStage5ExplorationPhase(phase: SimulationState['questPhase']): boolean {
  return (
    phase === 's5_explore_guesser_street' ||
    phase === 's5_prepare_lara_room' ||
    phase === 's5_explore_apartment_lara' ||
    phase === 's5_explore_park_reunion'
  );
}

export function skipStage5Intro(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-5' || !state.stage5) return state;
  if (state.stage5.cutscene !== 'bela_vista_arrival') return state;

  return {
    ...state,
    questPhase: 's5_explore_guesser_street',
    stage5: {
      ...state.stage5,
      mapId: 'bela_vista_guesser',
      locationLabel: 'Bela Vista · Em Frente ao Mercado Guesser',
      eraLabel: 'Cris aos 7 anos · Vida no Bela Vista',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 11.8 * TILE_SIZE,
      cameraFocusY: 9.8 * TILE_SIZE,
      cameraZoom: 1.0,
    },
    npcs: createStage5Npcs('guesser_street'),
    player: {
      ...state.player,
      x: 11.8 * TILE_SIZE,
      y: 10.2 * TILE_SIZE,
      dir: 'up',
      isMoving: false,
    },
    activeDialogue: STAGE_5_DIALOGUES.s5_guesser_intro,
    dialogueLineIndex: 0,
  };
}

export function enterStage5UpstairsApartment(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-5' || !state.stage5) return state;
  return {
    ...state,
    stage5: {
      ...state.stage5,
      mapId: 'bela_vista_apartment',
      locationLabel: 'Apartamento em Cima do Mercado Guesser · Bela Vista',
      cameraFocusX: 11.8 * TILE_SIZE,
      cameraFocusY: 11.2 * TILE_SIZE,
    },
    npcs: createStage5Npcs('guesser_apartment_etapa1'),
    player: {
      ...state.player,
      x: 11.8 * TILE_SIZE,
      y: 12.0 * TILE_SIZE,
      dir: 'up',
      isMoving: false,
    },
  };
}

export function exitStage5ApartmentToStreet(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-5' || !state.stage5) return state;
  return {
    ...state,
    stage5: {
      ...state.stage5,
      mapId: 'bela_vista_guesser',
      locationLabel: 'Bela Vista · Em Frente ao Mercado Guesser',
      cameraFocusX: 12.2 * TILE_SIZE,
      cameraFocusY: 9.8 * TILE_SIZE,
    },
    npcs: createStage5Npcs('guesser_street'),
    player: {
      ...state.player,
      x: 12.2 * TILE_SIZE,
      y: 9.6 * TILE_SIZE,
      dir: 'down',
      isMoving: false,
    },
  };
}

// ============================================================================
// ETAPA 2 — KARATE CHAMPIONSHIP KATA MINIGAME (8 MOVEMENTS, 3 ROUNDS, SHRINKING RING)
// ============================================================================
export function startStage5KarateMinigame(state: SimulationState): SimulationState {
  if (!state.stage5) return state;
  return {
    ...state,
    questPhase: 's5_karate_minigame',
    stage5: {
      ...state.stage5,
      mapId: 'karate_tournament_gym',
      locationLabel: 'Ginásio do Campeonato de Karatê · Tatame Central',
      eraLabel: 'Cris aos 7 anos · Competição de Kata (Rodada 1/3)',
      cutscene: 'karate_kata_minigame',
      cutsceneElapsed: 0,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 9.6 * TILE_SIZE,
      cameraZoom: 1.08,
      karate: {
        ...createInitialKarateState(),
        active: true,
        ringProgress: 0.72,
      },
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
    player: {
      ...state.player,
      x: 12.0 * TILE_SIZE,
      y: 10.2 * TILE_SIZE,
      dir: 'down',
      isMoving: false,
    },
  };
}

export function restartStage5KarateMinigame(state: SimulationState): SimulationState {
  return startStage5KarateMinigame(state);
}

export function getStage5ExpectedKarateStep(
  state: SimulationState,
): Stage5KarateStep | null {
  if (!state.stage5 || !state.stage5.karate.active) return null;
  return STAGE_5_KATA_MOVES[state.stage5.karate.moveIndex] ?? null;
}

function computeJudgeScores(
  perfectCount: number,
  goodCount: number,
  missCount: number,
): [number, number, number] {
  const penalty = missCount * 0.25 + Math.max(0, 8 - perfectCount - missCount) * 0.05;
  const s1 = Number(Math.max(8.5, Math.min(10.0, 9.9 - penalty)).toFixed(1));
  const s2 = Number(Math.max(8.6, Math.min(10.0, 10.0 - penalty * 0.8)).toFixed(1));
  const s3 = Number(Math.max(8.5, Math.min(10.0, 9.8 - penalty * 0.9)).toFixed(1));
  void goodCount;
  return [s1, s2, s3];
}

function advanceOrFinishKataMove(
  state: SimulationState,
  updatedKarate: Stage5KarateState,
): {
  next: SimulationState;
  roundCompleted: boolean;
  kataCompleted: boolean;
} {
  if (!state.stage5) {
    return { next: state, roundCompleted: false, kataCompleted: false };
  }

  const prevStep = STAGE_5_KATA_MOVES[updatedKarate.moveIndex];
  const nextMoveIndex = updatedKarate.moveIndex + 1;
  const nextStep = STAGE_5_KATA_MOVES[nextMoveIndex];

  if (nextStep) {
    const roundChanged = Boolean(prevStep && nextStep.round !== prevStep.round);
    const nextRound = nextStep.round;
    const graziTears = updatedKarate.graziEmotionalTears || nextRound === 3;
    const shoutOnRoundEnd = roundChanged && updatedKarate.lastRating !== 'ERRO!';

    return {
      roundCompleted: roundChanged,
      kataCompleted: false,
      next: {
        ...state,
        stage5: {
          ...state.stage5,
          eraLabel: `Cris aos 7 anos · Competição de Kata (Rodada ${nextRound}/3)`,
          karate: {
            ...updatedKarate,
            moveIndex: nextMoveIndex,
            round: nextRound,
            ringProgress: 0.72,
            graziEmotionalTears: graziTears,
            arielBubbleText: shoutOnRoundEnd ? 'ISSO!' : updatedKarate.arielBubbleText,
            arielBubbleTimer: shoutOnRoundEnd ? 2.2 : updatedKarate.arielBubbleTimer,
            arielShoutCount: shoutOnRoundEnd
              ? updatedKarate.arielShoutCount + 1
              : updatedKarate.arielShoutCount,
            screenShakeTimer: shoutOnRoundEnd ? 0.45 : updatedKarate.screenShakeTimer,
          },
        },
      },
    };
  }

  // All 8 movements finished! Check if player earned the medal (up to 2 errors allowed)
  const passedMedal = updatedKarate.missCount <= updatedKarate.maxErrorsForMedal;
  const judgeScores = computeJudgeScores(
    updatedKarate.perfectCount,
    updatedKarate.goodCount,
    updatedKarate.missCount,
  );

  if (!passedMedal) {
    // Allow immediate retry via button/space
    return {
      roundCompleted: true,
      kataCompleted: false,
      next: {
        ...state,
        stage5: {
          ...state.stage5,
          eraLabel: 'Campeonato de Karatê · Tente Novamente para a Medalha',
          karate: {
            ...updatedKarate,
            active: false,
            passedMedal: false,
            awaitingRetry: true,
            completed: false,
            judgeScores,
            arielBubbleText: 'Calma, respira!',
            arielBubbleTimer: 3.0,
          },
        },
      },
    };
  }

  const s5WithMemory = unlockStage5Memory(
    {
      ...state.stage5,
      locationLabel: 'Ginásio do Campeonato · Notas dos Juízes e Pódio',
      eraLabel: 'Cris no Pódio · Medalha de Karatê!',
      cutscene: 'karate_podium',
      cutsceneElapsed: 0,
      cameraFocusX: 14.8 * TILE_SIZE,
      cameraFocusY: 8.8 * TILE_SIZE,
      cameraZoom: 1.12,
      karate: {
        ...updatedKarate,
        active: false,
        currentPose: 'bow',
        poseHoldTimer: 1.5,
        arielBubbleText: 'ISSO!',
        arielBubbleTimer: 2.6,
        arielShoutCount: updatedKarate.arielShoutCount + 1,
        screenShakeTimer: 0.5,
        graziEmotionalTears: true,
        judgeScores,
        passedMedal: true,
        awaitingRetry: false,
        completed: true,
      },
    },
    'mem_s5_karate',
  );

  return {
    roundCompleted: true,
    kataCompleted: true,
    next: {
      ...state,
      questPhase: 's5_cutscene_karate_podium',
      stage5: s5WithMemory,
    },
  };
}

export function triggerStage5KarateInput(
  state: SimulationState,
  inputDir: Direction,
): {
  next: SimulationState;
  hit: boolean;
  rating: KarateHitRating;
  sequenceCompleted: boolean;
  kataCompleted: boolean;
} {
  if (
    state.stageId !== 'stage-5' ||
    !state.stage5 ||
    state.stage5.cutscene !== 'karate_kata_minigame'
  ) {
    return {
      next: state,
      hit: false,
      rating: '',
      sequenceCompleted: false,
      kataCompleted: false,
    };
  }

  const k = state.stage5.karate;
  if (k.awaitingRetry || !k.active) {
    return {
      next: state,
      hit: false,
      rating: '',
      sequenceCompleted: false,
      kataCompleted: false,
    };
  }

  const expectedStep = STAGE_5_KATA_MOVES[k.moveIndex];
  if (!expectedStep) {
    return {
      next: state,
      hit: false,
      rating: '',
      sequenceCompleted: false,
      kataCompleted: false,
    };
  }

  // Wrong direction pressed -> Error ("ERRO!") & Ariel says "Calma, respira!"
  // And advances to the next move so the player can still win with up to 2 errors!
  if (inputDir !== expectedStep.dir) {
    const missedKarate: Stage5KarateState = {
      ...k,
      missCount: k.missCount + 1,
      streak: 0,
      lastRating: 'ERRO!',
      feedbackTimer: 1.1,
      arielBubbleText: 'Calma, respira!',
      arielBubbleTimer: 1.9,
      screenShakeTimer: 0,
    };
    const res = advanceOrFinishKataMove(state, missedKarate);
    return {
      next: res.next,
      hit: false,
      rating: 'ERRO!',
      sequenceCompleted: res.roundCompleted,
      kataCompleted: res.kataCompleted,
    };
  }

  // Correct direction! Determine PERFEITO! vs BOM! based on the shrinking circle progress
  const isPerfectWindow = k.ringProgress >= 0.55 && k.ringProgress <= 0.94;
  const rating: KarateHitRating = isPerfectWindow ? 'PERFEITO!' : 'BOM!';
  const pointsAdded = isPerfectWindow ? 150 : 100;
  const nextStreak = k.streak + 1;
  const triggerArielShout = nextStreak >= 2;

  const hitKarate: Stage5KarateState = {
    ...k,
    score: k.score + pointsAdded,
    perfectCount: isPerfectWindow ? k.perfectCount + 1 : k.perfectCount,
    goodCount: isPerfectWindow ? k.goodCount : k.goodCount + 1,
    streak: nextStreak,
    currentPose: expectedStep.move,
    poseHoldTimer: 0.85,
    lastRating: rating,
    feedbackTimer: 1.0,
    arielBubbleText: triggerArielShout ? 'ISSO!' : k.arielBubbleText,
    arielBubbleTimer: triggerArielShout ? 2.0 : k.arielBubbleTimer,
    arielShoutCount: triggerArielShout ? k.arielShoutCount + 1 : k.arielShoutCount,
    screenShakeTimer: triggerArielShout ? 0.42 : k.screenShakeTimer,
    graziEmotionalTears: k.graziEmotionalTears || expectedStep.round === 3,
  };

  const res = advanceOrFinishKataMove(state, hitKarate);
  return {
    next: res.next,
    hit: true,
    rating,
    sequenceCompleted: res.roundCompleted || triggerArielShout,
    kataCompleted: res.kataCompleted,
  };
}

// ============================================================================
// ETAPA 3 — SPLIT-SCREEN PREGNANCY PHONE CALL (Grazi at Home | Ariel at Work)
// ============================================================================
export function startStage5PregnancyCall(state: SimulationState): SimulationState {
  if (!state.stage5) return state;
  return {
    ...state,
    questPhase: 's5_cutscene_pregnancy_call',
    stage5: {
      ...state.stage5,
      mapId: 'bela_vista_apartment',
      locationLabel: 'Apartamento no Bela Vista | Serviço do Ariel',
      eraLabel: 'A Ligação · Uma Nova Gravidez',
      cutscene: 'pregnancy_phone_call',
      cutsceneElapsed: 0,
      cameraFocusX: 12.0 * TILE_SIZE,
      cameraFocusY: 9.0 * TILE_SIZE,
      cameraZoom: 1.0,
      graziPregnant: false,
    },
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function getStage5PhoneCallSnapshot(
  state: SimulationState,
): Stage5PhoneCallSnapshot | null {
  if (
    state.stageId !== 'stage-5' ||
    !state.stage5 ||
    state.stage5.cutscene !== 'pregnancy_phone_call'
  ) {
    return null;
  }

  const elapsed = Math.max(0, state.stage5.cutsceneElapsed);
  let acc = 0;
  for (let i = 0; i < STAGE_5_PHONE_CALL_STEPS.length; i++) {
    const step = STAGE_5_PHONE_CALL_STEPS[i];
    if (elapsed < acc + step.duration || i === STAGE_5_PHONE_CALL_STEPS.length - 1) {
      const stepElapsed = Math.max(0, elapsed - acc);
      const chars = Math.floor(stepElapsed * step.typingCharsPerSecond);
      const visibleText = step.text.slice(0, Math.min(step.text.length, Math.max(1, chars)));
      const isTypingComplete = visibleText.length >= step.text.length;
      return {
        step,
        stepIndex: i,
        totalSteps: STAGE_5_PHONE_CALL_STEPS.length,
        stepElapsed,
        visibleText,
        isTypingComplete,
      };
    }
    acc += step.duration;
  }
  return null;
}

export function advanceStage5PregnancyCallCutscene(
  state: SimulationState,
): SimulationState {
  const snap = getStage5PhoneCallSnapshot(state);
  if (!snap || !state.stage5) return state;

  let stepStart = 0;
  for (let i = 0; i < snap.stepIndex; i++) {
    stepStart += STAGE_5_PHONE_CALL_STEPS[i].duration;
  }

  if (!snap.isTypingComplete) {
    // Complete typing of the current line first
    const fullTypingTime =
      snap.step.text.length / Math.max(1, snap.step.typingCharsPerSecond) + 0.05;
    return {
      ...state,
      stage5: {
        ...state.stage5,
        cutsceneElapsed: Math.min(
          stepStart + snap.step.duration - 0.05,
          stepStart + fullTypingTime,
        ),
      },
    };
  }

  // Advance to start of next step, or finish call if on last step
  const nextStepStart = stepStart + snap.step.duration + 0.01;
  if (nextStepStart >= S5_PREGNANCY_CALL_DURATION) {
    return startStage5PregnancyTimePassage(state);
  }
  return {
    ...state,
    stage5: {
      ...state.stage5,
      cutsceneElapsed: nextStepStart,
    },
  };
}

// ============================================================================
// ETAPAS 4 A 8 — PREGNANCY TIME PASSAGE, LARA BABY, LARA 2YO, PARK & PONTE DO IMARUIM
// ============================================================================
export function startStage5PregnancyTimePassage(state: SimulationState): SimulationState {
  if (!state.stage5) return state;
  const s5 = unlockStage5Memory(
    {
      ...state.stage5,
      mapId: 'bela_vista_apartment',
      locationLabel: 'Bela Vista · Apartamento e Rua do Mercado Guesser',
      eraLabel: 'Alguns meses depois · Grazi Grávida da Lara',
      cutscene: 'pregnancy_time_passage',
      cutsceneElapsed: 0,
      cameraFocusX: 11.8 * TILE_SIZE,
      cameraFocusY: 10.4 * TILE_SIZE,
      cameraZoom: 1.08,
      graziPregnant: true,
      lara_announced: true,
    },
    'mem_s5_ligacao_lara',
  );
  return {
    ...state,
    questPhase: 's5_cutscene_pregnancy_time',
    stage5: s5,
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage5PrepareLaraRoom(
  state: SimulationState,
  withIntroDialogue = true,
): SimulationState {
  if (!state.stage5) return state;
  return {
    ...state,
    questPhase: 's5_prepare_lara_room',
    stage5: {
      ...state.stage5,
      mapId: 'bela_vista_lara_room',
      locationLabel: 'Apartamento no Bela Vista · Preparando o Quarto da Lara',
      eraLabel: 'Esperando a Lara · Montando o Berço, Móbile e Enxoval',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 11.8 * TILE_SIZE,
      cameraFocusY: 10.2 * TILE_SIZE,
      cameraZoom: 1.0,
      graziPregnant: true,
      lara_announced: true,
      nurseryStage: 0,
    },
    npcs: [
      {
        id: 's5_ariel_nursery',
        name: 'Ariel',
        role: 'ariel',
        x: 13.8 * TILE_SIZE,
        y: 9.8 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ],
    player: {
      ...state.player,
      x: 10.4 * TILE_SIZE,
      y: 10.6 * TILE_SIZE,
      dir: 'up',
      isMoving: false,
    },
    activeDialogue: withIntroDialogue ? STAGE_5_DIALOGUES.s5_nursery_intro : null,
    dialogueLineIndex: 0,
  };
}

export function enterStage5LaraBedroom(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-5' || !state.stage5 || !state.stage5.lara_announced) {
    return state;
  }
  return {
    ...state,
    stage5: {
      ...state.stage5,
      mapId: 'bela_vista_lara_room',
      locationLabel: 'Apartamento no Bela Vista · Quarto da Lara',
      cameraFocusX: 11.8 * TILE_SIZE,
      cameraFocusY: 10.4 * TILE_SIZE,
    },
    player: {
      ...state.player,
      x: 11.8 * TILE_SIZE,
      y: 12.0 * TILE_SIZE,
      dir: 'up',
      isMoving: false,
    },
  };
}

export function exitStage5LaraBedroomToLivingRoom(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-5' || !state.stage5) return state;
  return {
    ...state,
    stage5: {
      ...state.stage5,
      mapId: 'bela_vista_apartment',
      locationLabel: 'Apartamento em Cima do Mercado Guesser · Sala',
      cameraFocusX: 8.4 * TILE_SIZE,
      cameraFocusY: 8.6 * TILE_SIZE,
    },
    player: {
      ...state.player,
      x: 7.4 * TILE_SIZE,
      y: 7.6 * TILE_SIZE,
      dir: 'down',
      isMoving: false,
    },
  };
}

export function startStage5LaraBabyArrival(state: SimulationState): SimulationState {
  if (!state.stage5) return state;
  const s5 = unlockStage5Memory(
    {
      ...state.stage5,
      mapId: 'bela_vista_apartment',
      locationLabel: 'Apartamento no Bela Vista · Chegada da Lara',
      eraLabel: 'Bem-vinda, Lara! · O Abraço do Irmão Cris',
      cutscene: 'lara_baby_arrival',
      cutsceneElapsed: 0,
      cameraFocusX: 11.8 * TILE_SIZE,
      cameraFocusY: 10.2 * TILE_SIZE,
      cameraZoom: 1.16,
      graziPregnant: false,
      lara_announced: true,
      nurseryStage: 3,
      laraAge: 'baby',
    },
    'mem_s5_chegada_lara',
  );
  return {
    ...state,
    questPhase: 's5_cutscene_lara_arrival',
    stage5: s5,
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage5ApartmentLara2yoExplore(
  state: SimulationState,
  withIntroDialogue = true,
): SimulationState {
  if (!state.stage5) return state;
  return {
    ...state,
    questPhase: 's5_explore_apartment_lara',
    stage5: {
      ...state.stage5,
      mapId: 'bela_vista_apartment',
      locationLabel: 'Apartamento em Cima do Mercado Guesser · Sala',
      eraLabel: 'Lara aos 2 Anos · Alegria da Casa',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 11.8 * TILE_SIZE,
      cameraFocusY: 10.6 * TILE_SIZE,
      cameraZoom: 1.0,
      graziPregnant: false,
      laraAge: 'toddler_2y',
    },
    npcs: createStage5Npcs('apartment_lara_2yo'),
    player: {
      ...state.player,
      x: 11.8 * TILE_SIZE,
      y: 12.1 * TILE_SIZE,
      dir: 'up',
      isMoving: false,
    },
    activeDialogue: withIntroDialogue ? STAGE_5_DIALOGUES.s5_lara_2yo_intro : null,
    dialogueLineIndex: 0,
  };
}

export function startStage5LaraPepelequinhaDance(state: SimulationState): SimulationState {
  if (!state.stage5) return state;
  const s5 = unlockStage5Memory(
    {
      ...state.stage5,
      mapId: 'bela_vista_apartment',
      locationLabel: 'Sala do Apartamento · O Showzinho da Lara',
      eraLabel: 'Lara aos 2 Anos · “Pepelequinha, pepelequinha!”',
      cutscene: 'lara_pepelequinha_dance',
      cutsceneElapsed: 0,
      cameraFocusX: 11.8 * TILE_SIZE,
      cameraFocusY: 10.6 * TILE_SIZE,
      cameraZoom: 1.2,
      laraAge: 'toddler_2y',
      watchedLaraDance: true,
    },
    'mem_s5_pepelequinha',
  );
  return {
    ...state,
    questPhase: 's5_cutscene_lara_dance',
    stage5: s5,
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage5ParkReunionExplore(
  state: SimulationState,
  withIntroDialogue = true,
): SimulationState {
  if (!state.stage5) return state;
  return {
    ...state,
    questPhase: 's5_explore_park_reunion',
    stage5: {
      ...state.stage5,
      mapId: 'parquinho_igreja',
      locationLabel: 'Parquinho do Bela Vista · Pista de Skate em Frente à Igreja',
      eraLabel: 'Encontro no Parquinho · Grazi, Laura, Cris, Lara e Lucas (5 anos)',
      cutscene: 'none',
      cutsceneElapsed: 0,
      cameraFocusX: 10.2 * TILE_SIZE,
      cameraFocusY: 9.8 * TILE_SIZE,
      cameraZoom: 1.0,
      laraAge: 'toddler_2y',
      parkTalkedTo: [],
    },
    npcs: createStage5Npcs('park_reunion'),
    player: {
      ...state.player,
      x: getStage5ParquinhoHotspot('hs_banco_grazi').standX,
      y: getStage5ParquinhoHotspot('hs_banco_grazi').standY,
      dir: 'left',
      isMoving: false,
    },
    activeDialogue: withIntroDialogue ? STAGE_5_DIALOGUES.s5_park_intro : null,
    dialogueLineIndex: 0,
  };
}

export function startStage5ParkReunionCutscene(state: SimulationState): SimulationState {
  if (!state.stage5) return state;
  const s5 = unlockStage5Memory(
    {
      ...state.stage5,
      mapId: 'parquinho_igreja',
      locationLabel: 'Parquinho do Bela Vista · Foto em Família em Frente à Igreja',
      eraLabel: 'Foto em Família · Grazi, Laura, Cris, Lara e Lucas',
      cutscene: 'park_family_reunion',
      cutsceneElapsed: 0,
      cameraFocusX: 12.2 * TILE_SIZE,
      cameraFocusY: 10.0 * TILE_SIZE,
      cameraZoom: 1.04,
      talkedToCristianAndLucasInPark: true,
    },
    'mem_s5_parque_primos',
  );
  return {
    ...state,
    questPhase: 's5_cutscene_park_reunion',
    stage5: s5,
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function startStage5PonteImaruimEnding(state: SimulationState): SimulationState {
  if (!state.stage5) return state;
  const s5 = unlockStage5Memory(
    {
      ...state.stage5,
      mapId: 'bela_vista_guesser',
      locationLabel: 'Despedida do Bela Vista · Rumo à Ponte do Imaruim',
      eraLabel: 'Nosso Apartamento Próprio · Família Completa',
      cutscene: 'ponte_imaruim_ending',
      cutsceneElapsed: 0,
      cameraFocusX: 10.0 * TILE_SIZE,
      cameraFocusY: 9.6 * TILE_SIZE,
      cameraZoom: 1.04,
      endingReadyToFinish: false,
    },
    'mem_s5_apartamento_proprio',
  );
  return {
    ...state,
    questPhase: 's5_ending_ponte_imaruim',
    stage5: s5,
    npcs: [],
    activeDialogue: null,
    dialogueLineIndex: 0,
  };
}

export function finishStage5Ending(state: SimulationState): SimulationState {
  if (state.stageId !== 'stage-5' || !state.stage5) return state;
  if (state.stage5.cutscene !== 'ponte_imaruim_ending' || !state.stage5.endingReadyToFinish) {
    return state;
  }
  return {
    ...state,
    questPhase: 'stage_complete',
    stage5: {
      ...state.stage5,
      cutscene: 'none',
      cameraZoom: 1.0,
    },
  };
}

// ============================================================================
// MOVEMENT & INTERACTION IN STAGE 5
// ============================================================================
function canStandAtStage5(
  mapId: Stage5MapId,
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

  // Etapa 7: área de andar definida por zonas retangulares medidas sobre o fundo pronto.
  if (mapId === 'parquinho_igreja') {
    if (!isStage5ParquinhoBoxWalkable(left, top, right, bottom)) return false;
    for (const npc of npcs) {
      if (!npc.visible) continue;
      if (Math.abs(x - npc.x) < 16 && Math.abs(y - npc.y) < 12) return false;
    }
    return true;
  }

  const minCol = Math.floor(left / TILE_SIZE);
  const maxCol = Math.floor((right - 0.01) / TILE_SIZE);
  const minRow = Math.floor(top / TILE_SIZE);
  const maxRow = Math.floor((bottom - 0.01) / TILE_SIZE);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (isStage5TileSolid(mapId, c, r)) {
        return false;
      }
    }
  }

  for (const npc of npcs) {
    if (!npc.visible) continue;
    if (Math.abs(x - npc.x) < 16 && Math.abs(y - npc.y) < 12) {
      return false;
    }
  }

  return true;
}

function directionFromVec(dx: number, dy: number, fallback: Direction): Direction {
  if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

export function moveStage5Player(
  state: SimulationState,
  inputX: number,
  inputY: number,
  dt: number,
): SimulationState {
  if (state.stageId !== 'stage-5' || !state.stage5) return state;

  if (
    state.activeDialogue ||
    isStage5CutsceneActive(state) ||
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
  const targetVx = nx * S5_PLAYER_SPEED;
  const targetVy = ny * S5_PLAYER_SPEED;
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
  const mapId = state.stage5.mapId;

  const tryX = nextX + nextVx * dt;
  if (canStandAtStage5(mapId, tryX, nextY, state.player.width, state.player.height, state.npcs)) {
    nextX = tryX;
  }
  const tryY = nextY + nextVy * dt;
  if (canStandAtStage5(mapId, nextX, tryY, state.player.width, state.player.height, state.npcs)) {
    nextY = tryY;
  }

  const movedDist = Math.hypot(nextX - state.player.x, nextY - state.player.y);
  const nextDir = directionFromVec(nextVx, nextVy, state.player.dir);

  return {
    ...state,
    stage5: {
      ...state.stage5,
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

export interface Stage5InteractableTarget {
  type: 'npc' | 'prop' | 'memory';
  id: string;
  label: string;
  dialogueId: string;
  distance: number;
  priority: number;
}

export function findNearestStage5Interactable(
  state: SimulationState,
): Stage5InteractableTarget | null {
  if (
    state.stageId !== 'stage-5' ||
    !state.stage5 ||
    state.activeDialogue ||
    isStage5CutsceneActive(state)
  ) {
    return null;
  }

  const px = state.player.x;
  const py = state.player.y;
  const s5 = state.stage5;
  const candidates: Stage5InteractableTarget[] = [];

  for (const npc of state.npcs) {
    if (!npc.visible || !npc.interactable) continue;
    const dist = Math.hypot(px - npc.x, py - npc.y);
    if (dist > S5_INTERACT_RADIUS) continue;

    if (state.questPhase === 's5_explore_guesser_street') {
      if (npc.role === 'cristian') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Conversar com o Cris (7 anos) sobre o Karatê',
          dialogueId: 's5_cristian_guesser_talk',
          distance: dist,
          priority: s5.talkedToCristianBelaVista ? 5 : 14,
        });
      } else if (npc.role === 'ariel') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Ir com Ariel e Cris ao Campeonato de Karatê',
          dialogueId: 's5_ariel_start_karate',
          distance: dist,
          priority: 12,
        });
      }
    } else if (state.questPhase === 's5_explore_apartment_lara') {
      if (npc.role === 'lara') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Ver a Lara (2 anos) cantar e dançar “Pepelequinha”',
          dialogueId: 's5_trigger_lara_dance',
          distance: dist,
          priority: 16,
        });
      } else if (npc.role === 'cristian') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Conversar com o Cris na sala',
          dialogueId: 's5_cristian_before_lara_dance',
          distance: dist,
          priority: 8,
        });
      } else if (npc.role === 'ariel') {
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: 'Assistir à dança da Lara com Ariel e Cris',
          dialogueId: 's5_trigger_lara_dance',
          distance: dist,
          priority: 10,
        });
      }
    } else if (state.questPhase === 's5_explore_park_reunion') {
      const talkedSet = new Set(s5.parkTalkedTo);
      if (npc.role === 'laura') {
        const done = talkedSet.has('laura');
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: done
            ? 'Conversar novamente com Laura no banco'
            : 'Conversar com Laura no banco do parquinho',
          dialogueId: 's5_park_talk_laura',
          distance: dist,
          priority: done ? 6 : 15,
        });
      } else if (npc.role === 'cristian') {
        const done = talkedSet.has('cristian');
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: done
            ? 'Falar com o Cris na pista de skate'
            : 'Ver o Cris andando de skate na pista',
          dialogueId: 's5_park_talk_cristian',
          distance: dist,
          priority: done ? 6 : 15,
        });
      } else if (npc.role === 'lucas') {
        const done = talkedSet.has('lucas');
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: done
            ? 'Falar com o Lucas (5 anos) no escorregador'
            : 'Conversar com o Lucas (5 anos) no escorregador',
          dialogueId: 's5_park_talk_lucas',
          distance: dist,
          priority: done ? 6 : 15,
        });
      } else if (npc.role === 'lara') {
        const done = talkedSet.has('lara');
        candidates.push({
          type: 'npc',
          id: npc.id,
          label: done
            ? 'Falar com a Lara (2 anos) no parquinho'
            : 'Conversar com a Lara (2 anos) andando atrás dos meninos',
          dialogueId: 's5_park_talk_lara',
          distance: dist,
          priority: done ? 6 : 15,
        });
      }
    }
  }

  // Interactive nursery assembly in s5_prepare_lara_room
  if (state.questPhase === 's5_prepare_lara_room' && s5.mapId === 'bela_vista_lara_room') {
    const distBuild = Math.hypot(
      px - STAGE5_NURSERY_BUILD_POS.x,
      py - STAGE5_NURSERY_BUILD_POS.y,
    );
    if (distBuild <= S5_INTERACT_RADIUS + 20 && s5.nurseryStage < 3) {
      const stepLabels = [
        'Montar o Berço Branco e Rosa da Lara (1/3)',
        'Colocar o Móbile de Estrelinhas e Corações (2/3)',
        'Arrumar o Enxoval Rosa e Branco da Lara (3/3)',
      ] as const;
      const stepDialogues = [
        's5_nursery_step1_crib',
        's5_nursery_step2_mobile',
        's5_nursery_step3_layette',
      ] as const;
      candidates.push({
        type: 'prop',
        id: 's5_nursery_assemble',
        label: stepLabels[s5.nurseryStage] ?? stepLabels[0],
        dialogueId: stepDialogues[s5.nurseryStage] ?? stepDialogues[0],
        distance: distBuild,
        priority: 20,
      });
    }
  }

  // Living room interactive furniture props (Sofá, Estante, Janela com vista pro Guesser, TV, Mesa)
  if (s5.mapId === 'bela_vista_apartment') {
    const livingProps = [
      {
        id: 's5_prop_sofa',
        pos: STAGE5_APARTMENT_SOFA_POS,
        label: 'Olhar Sofá da Sala',
        dialogueId: 's5_prop_sofa',
      },
      {
        id: 's5_prop_estante',
        pos: STAGE5_APARTMENT_ESTANTE_POS,
        label: 'Olhar Estante de Madeira',
        dialogueId: 's5_prop_estante',
      },
      {
        id: 's5_prop_janela_guesser',
        pos: STAGE5_APARTMENT_WINDOW_POS,
        label: 'Olhar Janela e Sacada com Vista para o Mercado Guesser',
        dialogueId: 's5_prop_janela_guesser',
      },
      {
        id: 's5_prop_tv',
        pos: STAGE5_APARTMENT_TV_POS,
        label: 'Olhar TV da Sala',
        dialogueId: 's5_prop_tv',
      },
      {
        id: 's5_prop_mesa',
        pos: STAGE5_APARTMENT_MESA_POS,
        label: 'Olhar Mesa com Vasinho de Flores',
        dialogueId: 's5_prop_mesa',
      },
    ];
    for (const p of livingProps) {
      const d = Math.hypot(px - p.pos.x, py - p.pos.y);
      if (d <= S5_INTERACT_RADIUS) {
        candidates.push({
          type: 'prop',
          id: p.id,
          label: p.label,
          dialogueId: p.dialogueId,
          distance: d,
          priority: 4,
        });
      }
    }

    // Bedroom door ONLY becomes interactable after lara_announced === true!
    if (s5.lara_announced) {
      const distBedroomDoor = Math.hypot(
        px - STAGE5_APARTMENT_BEDROOM_DOOR_POS.x,
        py - STAGE5_APARTMENT_BEDROOM_DOOR_POS.y,
      );
      if (distBedroomDoor <= S5_INTERACT_RADIUS) {
        candidates.push({
          type: 'prop',
          id: 's5_door_enter_nursery',
          label: 'Entrar no Quarto da Lara',
          dialogueId: '',
          distance: distBedroomDoor,
          priority: 8,
        });
      }
    }
  }

  if (
    s5.mapId === 'bela_vista_lara_room' &&
    state.questPhase !== 's5_prepare_lara_room'
  ) {
    const distExitNursery = Math.hypot(
      px - STAGE5_NURSERY_EXIT_POS.x,
      py - STAGE5_NURSERY_EXIT_POS.y,
    );
    if (distExitNursery <= S5_INTERACT_RADIUS) {
      candidates.push({
        type: 'prop',
        id: 's5_door_exit_nursery',
        label: 'Voltar para a Sala do Apartamento',
        dialogueId: '',
        distance: distExitNursery,
        priority: 11,
      });
    }
  }

  // Etapa 1 free exploration door transition between street and upstairs apartment
  if (state.questPhase === 's5_explore_guesser_street') {
    if (s5.mapId === 'bela_vista_guesser') {
      const distDoor = Math.hypot(px - STAGE5_GUESSER_DOOR_POS.x, py - STAGE5_GUESSER_DOOR_POS.y);
      if (distDoor <= S5_INTERACT_RADIUS) {
        candidates.push({
          type: 'prop',
          id: 's5_door_enter_apartment',
          label: 'Subir para o Apartamento em cima do Mercado Guesser',
          dialogueId: '',
          distance: distDoor,
          priority: 11,
        });
      }
    } else if (s5.mapId === 'bela_vista_apartment') {
      const distExit = Math.hypot(
        px - STAGE5_APARTMENT_EXIT_POS.x,
        py - STAGE5_APARTMENT_EXIT_POS.y,
      );
      if (distExit <= S5_INTERACT_RADIUS) {
        candidates.push({
          type: 'prop',
          id: 's5_door_exit_apartment',
          label: 'Descer para a Rua do Mercado Guesser',
          dialogueId: '',
          distance: distExit,
          priority: 11,
        });
      }
    }
  }

  if (state.questPhase === 's5_explore_park_reunion') {
    const distSkate = Math.hypot(px - STAGE5_PARK_SKATE_POS.x, py - STAGE5_PARK_SKATE_POS.y);
    if (distSkate <= S5_INTERACT_RADIUS) {
      candidates.push({
        type: 'prop',
        id: 's5_skate_park',
        label: 'Olhar Pista de Skate em frente à Igreja',
        dialogueId: 's5_prop_skate_park',
        distance: distSkate,
        priority: 4,
      });
    }
  }

  // Collectible memories on the current map
  const unlockedSet = new Set(s5.unlockedMemories);
  for (const mem of STAGE_5_MEMORIES) {
    if (mem.mapId !== s5.mapId) continue;
    const dist = Math.hypot(px - mem.x, py - mem.y);
    if (dist <= mem.radius) {
      const already = unlockedSet.has(mem.id);
      candidates.push({
        type: 'memory',
        id: mem.id,
        label: already ? `Relembrar: ${mem.title}` : `Guardar Lembrança: ${mem.title}`,
        dialogueId: mem.dialogueId,
        distance: dist,
        priority: already ? 2 : 10,
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

export function triggerStage5Interaction(state: SimulationState): {
  next: SimulationState;
  target: Stage5InteractableTarget | null;
} {
  if (state.stageId !== 'stage-5' || !state.stage5) {
    return { next: state, target: null };
  }

  const target = findNearestStage5Interactable(state);
  if (!target) return { next: state, target: null };

  if (target.id === 's5_door_enter_apartment') {
    return { target, next: enterStage5UpstairsApartment(state) };
  }
  if (target.id === 's5_door_exit_apartment') {
    return { target, next: exitStage5ApartmentToStreet(state) };
  }
  if (target.id === 's5_door_enter_nursery') {
    return { target, next: enterStage5LaraBedroom(state) };
  }
  if (target.id === 's5_door_exit_nursery') {
    return { target, next: exitStage5LaraBedroomToLivingRoom(state) };
  }

  let nextS5 = state.stage5;
  if (target.id === 's5_nursery_assemble') {
    nextS5 = {
      ...nextS5,
      nurseryStage: Math.min(3, nextS5.nurseryStage + 1),
    };
  }
  if (target.type === 'memory') {
    nextS5 = unlockStage5Memory(nextS5, target.id);
  }
  if (target.dialogueId === 's5_cristian_guesser_talk') {
    nextS5 = { ...nextS5, talkedToCristianBelaVista: true };
  }
  if (
    target.dialogueId === 's5_park_talk_laura' ||
    target.dialogueId === 's5_laura_park_talk'
  ) {
    const set = new Set(nextS5.parkTalkedTo);
    set.add('laura');
    nextS5 = { ...nextS5, parkTalkedTo: Array.from(set) };
  }
  if (target.dialogueId === 's5_park_talk_cristian') {
    const set = new Set(nextS5.parkTalkedTo);
    set.add('cristian');
    nextS5 = {
      ...nextS5,
      parkTalkedTo: Array.from(set),
      talkedToCristianAndLucasInPark: true,
    };
  }
  if (target.dialogueId === 's5_park_talk_lucas') {
    const set = new Set(nextS5.parkTalkedTo);
    set.add('lucas');
    nextS5 = {
      ...nextS5,
      parkTalkedTo: Array.from(set),
      talkedToCristianAndLucasInPark: true,
    };
  }
  if (target.dialogueId === 's5_park_talk_lara') {
    const set = new Set(nextS5.parkTalkedTo);
    set.add('lara');
    nextS5 = { ...nextS5, parkTalkedTo: Array.from(set) };
  }
  if (target.dialogueId === 's5_park_kids_talk') {
    const set = new Set(nextS5.parkTalkedTo);
    set.add('cristian');
    set.add('lucas');
    set.add('lara');
    nextS5 = {
      ...nextS5,
      parkTalkedTo: Array.from(set),
      talkedToCristianAndLucasInPark: true,
    };
  }

  const dialogue = STAGE_5_DIALOGUES[target.dialogueId] ?? null;
  return {
    target,
    next: {
      ...state,
      stage5: nextS5,
      activeDialogue: dialogue,
      dialogueLineIndex: 0,
      player: { ...state.player, isMoving: false },
    },
  };
}

export function handleStage5DialogueComplete(
  state: SimulationState,
  _completedDialogueId: string,
  action?: string,
): SimulationState {
  if (state.stageId !== 'stage-5' || !state.stage5) return state;

  if (action === 's5_start_karate_minigame') {
    return startStage5KarateMinigame(state);
  }
  if (action === 's5_start_pregnancy_call') {
    return startStage5PregnancyCall(state);
  }
  if (action === 's5_start_lara_arrival') {
    return startStage5LaraBabyArrival(state);
  }
  if (action === 's5_start_lara_2yo_intro') {
    return startStage5ApartmentLara2yoExplore(state, true);
  }
  if (action === 's5_start_lara_dance') {
    return startStage5LaraPepelequinhaDance(state);
  }
  if (action === 's5_start_park_reunion_explore') {
    return startStage5ParkReunionExplore(state, true);
  }
  if (action === 's5_check_park_all_talked') {
    if (state.stage5.parkTalkedTo.length >= 4) {
      return startStage5ParkReunionCutscene(state);
    }
    return state;
  }
  if (action === 's5_start_park_reunion_cutscene') {
    return startStage5ParkReunionCutscene(state);
  }
  if (action === 's5_start_ending_ponte_imaruim') {
    return startStage5PonteImaruimEnding(state);
  }
  return state;
}

// ============================================================================
// STEP TIMERS & CUTSCENES FOR STAGE 5
// ============================================================================
export function stepStage5Simulation(state: SimulationState, dt: number): SimulationState {
  if (state.stageId !== 'stage-5' || !state.stage5) return state;

  let s5 = state.stage5;

  if (s5.recentMemoryTimer > 0) {
    const rem = Math.max(0, s5.recentMemoryTimer - dt);
    s5 = {
      ...s5,
      recentMemoryTimer: rem,
      recentMemoryTitle: rem > 0 ? s5.recentMemoryTitle : null,
    };
  }

  if (state.activeDialogue) {
    return { ...state, stage5: s5 };
  }

  if (s5.cutscene === 'none') {
    // Etapa 7 live park movement: Cris skates on the skate track, Lucas plays on the slide, Lara walks behind them
    if (
      state.questPhase === 's5_explore_park_reunion' &&
      s5.mapId === 'parquinho_igreja'
    ) {
      const tPark = state.elapsedSeconds;
      // Each kid stays beside their own hotspot (never on top of the equipment in the backdrop)
      const crisHs = getStage5ParquinhoHotspot('hs_pista');
      const lucasHs = getStage5ParquinhoHotspot('hs_escorregador');
      const laraHs = getStage5ParquinhoHotspot('hs_balanco');
      const crisX = crisHs.standX + Math.sin(tPark * 1.35) * 22;
      const crisDir: Direction = Math.cos(tPark * 1.35) >= 0 ? 'right' : 'left';
      const lucasX = lucasHs.standX + Math.sin(tPark * 1.1) * 5;
      const lucasY = lucasHs.standY + Math.cos(tPark * 1.1) * 2;
      const lucasDir: Direction = Math.cos(tPark * 1.1) >= 0 ? 'right' : 'left';
      const laraX = laraHs.standX + Math.sin(tPark * 0.95 - 0.6) * 12;
      const laraDir: Direction = Math.cos(tPark * 0.95 - 0.6) >= 0 ? 'right' : 'left';

      const animatedNpcs = state.npcs.map((npc) => {
        if (npc.role === 'cristian') {
          return {
            ...npc,
            x: crisX,
            dir: crisDir,
            dancePhaseOffset: npc.dancePhaseOffset + dt * 6,
          };
        }
        if (npc.role === 'lucas') {
          return {
            ...npc,
            x: lucasX,
            y: lucasY,
            dir: lucasDir,
            dancePhaseOffset: npc.dancePhaseOffset + dt * 5,
          };
        }
        if (npc.role === 'lara') {
          return {
            ...npc,
            x: laraX,
            dir: laraDir,
            dancePhaseOffset: npc.dancePhaseOffset + dt * 4.5,
          };
        }
        return npc;
      });
      return { ...state, stage5: s5, npcs: animatedNpcs };
    }
    return { ...state, stage5: s5 };
  }

  const t = s5.cutsceneElapsed + dt;

  // 1. Arrival at Mercado Guesser apartment in Bela Vista
  if (s5.cutscene === 'bela_vista_arrival') {
    if (t >= S5_ARRIVAL_DURATION) {
      return skipStage5Intro({ ...state, stage5: s5 });
    }
    return {
      ...state,
      stage5: {
        ...s5,
        cutsceneElapsed: t,
        cameraFocusX: 12.0 * TILE_SIZE,
        cameraFocusY: 8.6 * TILE_SIZE,
        cameraZoom: 1.04 + Math.min(1, t / S5_ARRIVAL_DURATION) * 0.08,
      },
    };
  }

  // 2A. Interactive Karate Kata Minigame with Shrinking Rhythm Ring
  if (s5.cutscene === 'karate_kata_minigame') {
    const k = s5.karate;
    const nextFeedbackTimer = Math.max(0, k.feedbackTimer - dt);
    const nextPoseTimer = Math.max(0, k.poseHoldTimer - dt);
    const nextBubbleTimer = Math.max(0, k.arielBubbleTimer - dt);
    const nextShakeTimer = Math.max(0, k.screenShakeTimer - dt);
    const nextPose: KarateKataMove = nextPoseTimer > 0 ? k.currentPose : 'bow';

    if (!k.active || k.awaitingRetry) {
      return {
        ...state,
        stage5: {
          ...s5,
          cutsceneElapsed: t,
          karate: {
            ...k,
            feedbackTimer: nextFeedbackTimer,
            lastRating: nextFeedbackTimer > 0 ? k.lastRating : '',
            poseHoldTimer: nextPoseTimer,
            currentPose: nextPose,
            arielBubbleTimer: nextBubbleTimer,
            arielBubbleText: nextBubbleTimer > 0 ? k.arielBubbleText : '',
            screenShakeTimer: nextShakeTimer,
          },
        },
      };
    }

    const expectedStep = STAGE_5_KATA_MOVES[k.moveIndex];
    const shrinkDur = expectedStep ? expectedStep.shrinkDuration : 2.0;
    const nextRingProgress = k.ringProgress + dt / Math.max(0.5, shrinkDur);

    // If the shrinking circle expired completely without input -> count as ERRO!
    if (nextRingProgress >= 1.25) {
      const timedOutKarate: Stage5KarateState = {
        ...k,
        missCount: k.missCount + 1,
        streak: 0,
        ringProgress: 0,
        lastRating: 'ERRO!',
        feedbackTimer: 1.1,
        poseHoldTimer: nextPoseTimer,
        currentPose: nextPose,
        arielBubbleText: 'Calma, respira!',
        arielBubbleTimer: 1.9,
        screenShakeTimer: 0,
      };
      return advanceOrFinishKataMove(
        { ...state, stage5: { ...s5, cutsceneElapsed: t } },
        timedOutKarate,
      ).next;
    }

    return {
      ...state,
      stage5: {
        ...s5,
        cutsceneElapsed: t,
        karate: {
          ...k,
          ringProgress: nextRingProgress,
          feedbackTimer: nextFeedbackTimer,
          lastRating: nextFeedbackTimer > 0 ? k.lastRating : '',
          poseHoldTimer: nextPoseTimer,
          currentPose: nextPose,
          arielBubbleTimer: nextBubbleTimer,
          arielBubbleText: nextBubbleTimer > 0 ? k.arielBubbleText : '',
          screenShakeTimer: nextShakeTimer,
        },
      },
    };
  }

  // 2B. Judges' Scores & Karate Podium Cutscene
  if (s5.cutscene === 'karate_podium') {
    if (t >= S5_KARATE_PODIUM_DURATION) {
      return {
        ...state,
        stage5: {
          ...s5,
          cutsceneElapsed: t,
        },
        activeDialogue: STAGE_5_DIALOGUES.s5_karate_podium_celebration,
        dialogueLineIndex: 0,
      };
    }
    return {
      ...state,
      stage5: {
        ...s5,
        cutsceneElapsed: t,
        cameraFocusX: 14.8 * TILE_SIZE,
        cameraFocusY: 8.8 * TILE_SIZE,
        cameraZoom: 1.12,
        karate: {
          ...s5.karate,
          arielBubbleTimer: Math.max(0, s5.karate.arielBubbleTimer - dt),
          screenShakeTimer: Math.max(0, s5.karate.screenShakeTimer - dt),
        },
      },
    };
  }

  // 3. Split-Screen Pregnancy Phone Call (Grazi at Home | Ariel at Work)
  if (s5.cutscene === 'pregnancy_phone_call') {
    if (t >= S5_PREGNANCY_CALL_DURATION) {
      return startStage5PregnancyTimePassage({ ...state, stage5: s5 });
    }
    return {
      ...state,
      stage5: {
        ...s5,
        cutsceneElapsed: t,
      },
    };
  }

  // 4. Time Passage with Pregnant Grazi (Fade "Alguns meses depois" -> walking in apartment -> walking on street -> prepare Lara's room)
  if (s5.cutscene === 'pregnancy_time_passage') {
    if (t >= S5_PREGNANCY_TIME_DURATION) {
      return startStage5PrepareLaraRoom({ ...state, stage5: s5 }, true);
    }
    const inApartment = t < 5.4;
    const walkT = inApartment
      ? Math.max(0, Math.min(1, (t - 1.6) / 3.6))
      : Math.max(0, Math.min(1, (t - 5.4) / 4.0));
    return {
      ...state,
      stage5: {
        ...s5,
        mapId: inApartment ? 'bela_vista_apartment' : 'bela_vista_guesser',
        locationLabel: inApartment
          ? 'Alguns meses depois · Apartamento em Cima do Mercado Guesser'
          : 'Alguns meses depois · Rua do Bela Vista',
        cutsceneElapsed: t,
        graziPregnant: true,
        cameraFocusX: inApartment
          ? (10.2 + walkT * 3.2) * TILE_SIZE
          : (8.8 + walkT * 5.2) * TILE_SIZE,
        cameraFocusY: (inApartment ? 10.6 : 9.8) * TILE_SIZE,
        cameraZoom: 1.1,
      },
    };
  }

  // 5. Arrival Home with Baby Lara & Cris's Hug -> followed by short emotional dialogue
  if (s5.cutscene === 'lara_baby_arrival') {
    if (t >= S5_LARA_ARRIVAL_DURATION) {
      return {
        ...state,
        stage5: {
          ...s5,
          cutsceneElapsed: t,
        },
        activeDialogue: STAGE_5_DIALOGUES.s5_lara_arrival_dialogue,
        dialogueLineIndex: 0,
      };
    }
    return {
      ...state,
      stage5: {
        ...s5,
        cutsceneElapsed: t,
        cameraFocusX: 11.8 * TILE_SIZE,
        cameraFocusY: 10.2 * TILE_SIZE,
        cameraZoom: 1.16 + Math.min(1, t / S5_LARA_ARRIVAL_DURATION) * 0.08,
      },
    };
  }

  // 6. Lara at 2 Years Old Dancing & Singing "Pepelequinha, pepelequinha!"
  if (s5.cutscene === 'lara_pepelequinha_dance') {
    if (t >= S5_LARA_DANCE_DURATION) {
      return startStage5ParkReunionExplore({ ...state, stage5: s5 }, true);
    }
    return {
      ...state,
      stage5: {
        ...s5,
        cutsceneElapsed: t,
        cameraFocusX: 11.8 * TILE_SIZE,
        cameraFocusY: 10.6 * TILE_SIZE,
        cameraZoom: 1.2,
      },
    };
  }

  // 7. Family Reunion in Bela Vista Park (in front of the Church with Skate Park & Playground)
  if (s5.cutscene === 'park_family_reunion') {
    if (t >= S5_PARK_REUNION_DURATION) {
      const nextWithEndingScene = startStage5PonteImaruimEnding({ ...state, stage5: s5 });
      return {
        ...nextWithEndingScene,
        activeDialogue: STAGE_5_DIALOGUES.s5_ponte_imaruim_arrival,
        dialogueLineIndex: 0,
      };
    }
    return {
      ...state,
      stage5: {
        ...s5,
        cutsceneElapsed: t,
        cameraFocusX: 14.2 * TILE_SIZE,
        cameraFocusY: 10.2 * TILE_SIZE,
        cameraZoom: 1.14 + Math.min(1, t / S5_PARK_REUNION_DURATION) * 0.06,
      },
    };
  }

  // 8. Final Ending: Slow farewell pan of Bela Vista -> walking together into their own apartment in Ponte do Imaruim
  const inBelaVistaFarewell = t < 3.2;
  const ready = t >= S5_ENDING_READY_DELAY;
  return {
    ...state,
    stage5: {
      ...s5,
      mapId: inBelaVistaFarewell ? 'bela_vista_guesser' : 'ponte_imaruim_condo',
      locationLabel: inBelaVistaFarewell
        ? 'Despedida do Bela Vista · Mercado Guesser'
        : 'Ponte do Imaruim · Nosso Apartamento no Parque da Ponte',
      cutsceneElapsed: t,
      cameraFocusX: inBelaVistaFarewell
        ? (10.0 + (t / 3.2) * 3.5) * TILE_SIZE
        : 12.0 * TILE_SIZE,
      cameraFocusY: 9.6 * TILE_SIZE,
      cameraZoom: inBelaVistaFarewell ? 1.04 : 1.06,
      endingReadyToFinish: ready,
    },
  };
}

// ============================================================================
// OBJECTIVE TEXT & CUTSCENE CAPTIONS FOR HUD
// ============================================================================
export function getStage5ObjectiveText(state: SimulationState): string {
  if (state.stageId !== 'stage-5' || !state.stage5) return '';

  switch (state.questPhase) {
    case 's5_intro_bela_vista':
      return 'Mudança para o Bela Vista · Apartamento em cima do Mercado Guesser';
    case 's5_explore_guesser_street':
      return state.stage5.talkedToCristianBelaVista
        ? 'Explore a rua e o apartamento (3 lembranças) ou fale com Ariel para ir ao Campeonato de Karatê'
        : 'Explore a rua e o apartamento em cima do Mercado Guesser (3 lembranças) e fale com Cris e Ariel';
    case 's5_karate_minigame': {
      if (state.stage5.karate.awaitingRetry) {
        return 'Aperte Tentar Novamente para repetir o kata do Cris e conquistar a medalha!';
      }
      const step = getStage5ExpectedKarateStep(state);
      return step
        ? `Kata do Cris (Rodada ${state.stage5.karate.round}/3 · Mov. ${state.stage5.karate.moveIndex + 1}/8): ${step.label}`
        : 'Execute a sequência de passos do kata do Cris no tempo certo!';
    }
    case 's5_cutscene_karate_podium':
      return 'Notas dos juízes, pódio e medalha do Cris no Campeonato de Karatê!';
    case 's5_cutscene_pregnancy_call':
      return 'Grazi no apartamento liga para o Ariel no serviço para contar da nova gravidez';
    case 's5_cutscene_pregnancy_time':
      return 'Passagem de tempo no Bela Vista · Grazi grávida da Lara';
    case 's5_prepare_lara_room':
      return `Prepare o quarto da Lara em tons de rosa e branco (${state.stage5.nurseryStage}/3): berço, móbile e enxoval`;
    case 's5_cutscene_lara_arrival':
      return 'Chegada da Lara bebê em casa e o abraço carinhoso do irmão Cris';
    case 's5_explore_apartment_lara':
      return 'Na sala do apartamento, aproxime-se da Lara (2 anos) para ver a dancinha dela';
    case 's5_cutscene_lara_dance':
      return 'Lara aos 2 anos dançando e cantando “Pepelequinha, pepelequinha!”';
    case 's5_explore_park_reunion':
      return `Circule pelo parquinho e converse com Laura, Cris, Lucas e Lara (${state.stage5.parkTalkedTo.length}/4) para a foto em família`;
    case 's5_cutscene_park_reunion':
      return 'Foto em família no parquinho do Bela Vista · Memória guardada!';
    case 's5_ending_ponte_imaruim':
      return 'De volta à Ponte do Imaruim · Nosso apartamento próprio no Parque da Ponte';
    default:
      return 'Fase 5 · Bela Vista';
  }
}

export function getStage5CutsceneCaption(state: SimulationState): Stage5CutsceneCaption | null {
  if (state.stageId !== 'stage-5' || !state.stage5 || state.stage5.cutscene === 'none') {
    return null;
  }

  const { cutscene, cutsceneElapsed: t, endingReadyToFinish, karate } = state.stage5;

  if (cutscene === 'bela_vista_arrival') {
    if (t < 3.8) {
      return {
        badge: 'FASE 5 · BELA VISTA · MERCADO GUESSER',
        text: 'Grazi, Ariel e o Cris, já com 7 anos, vão morar no bairro Bela Vista, em um apartamento azul bem em cima do Mercado Guesser.',
        canSkipIntro: true,
      };
    }
    return {
      badge: 'NOVOS DIAS NO BELA VISTA',
      speaker: 'Grazi',
      speakerId: 'grazi_adult',
      emotion: 'happy',
      text: 'Aqui em cima do Mercado Guesser começou uma fase cheia de vida, alegrias e conquistas para a nossa família.',
      canSkipIntro: true,
    };
  }

  if (cutscene === 'karate_kata_minigame') {
    if (karate.awaitingRetry) {
      return {
        badge: 'CAMPEONATO DE KARATÊ · TENTE NOVAMENTE',
        speaker: 'Ariel (na arquibancada)',
        speakerId: 'ariel_adult',
        emotion: 'determined',
        text: 'Calma, respira! Você quase acertou tudo, filho! Vamos tentar o kata mais uma vez!',
      };
    }
    if (karate.arielBubbleTimer > 0 && karate.arielBubbleText === 'ISSO!') {
      return {
        badge: `CAMPEONATO DE KARATÊ · RODADA ${karate.round}/3`,
        speaker: 'Ariel (na arquibancada)',
        speakerId: 'ariel_adult',
        emotion: 'happy',
        text: 'ISSO! Boa, Cris! Que kata lindo, meu filho!',
      };
    }
    if (karate.arielBubbleTimer > 0 && karate.arielBubbleText === 'Calma, respira!') {
      return {
        badge: `CAMPEONATO DE KARATÊ · RODADA ${karate.round}/3`,
        speaker: 'Ariel (na arquibancada)',
        speakerId: 'ariel_adult',
        emotion: 'thoughtful',
        text: 'Calma, respira! Foca no próximo movimento do kata!',
      };
    }
    if (karate.round === 3) {
      return {
        badge: 'CAMPEONATO DE KARATÊ · RODADA FINAL (3/3)',
        speaker: 'Grazi (na arquibancada, emocionada)',
        speakerId: 'grazi_adult',
        emotion: 'romantic',
        text: 'Olha a concentração dele no tatame... meus olhos já estão cheios de lágrimas de orgulho!',
      };
    }
    const step = getStage5ExpectedKarateStep(state);
    return {
      badge: `CAMPEONATO DE KARATÊ · RODADA ${karate.round}/3 (MOVIMENTO ${karate.moveIndex + 1}/8)`,
      speaker: 'Cris (7 anos)',
      speakerId: 'cristian',
      emotion: 'determined',
      text: step
        ? `Próximo movimento: ${step.label} — aperte no tempo do círculo!`
        : 'Concentração total no tatame!',
    };
  }

  if (cutscene === 'karate_podium') {
    if (t < 3.4) {
      return {
        badge: 'CAMPEONATO DE KARATÊ · NOTAS DOS JUÍZES',
        speaker: 'Ariel',
        speakerId: 'ariel_adult',
        emotion: 'happy',
        text: `ISSO!! Olha as notas dos juízes: ${karate.judgeScores[0].toFixed(1)} · ${karate.judgeScores[1].toFixed(1)} · ${karate.judgeScores[2].toFixed(1)}! Pontuação: ${karate.score} pts!`,
      };
    }
    if (t < 6.6) {
      return {
        badge: 'CAMPEONATO DE KARATÊ · PÓDIO E MEDALHA',
        speaker: 'Grazi',
        speakerId: 'grazi_adult',
        emotion: 'romantic',
        text: 'Não consegui segurar o choro na última rodada... Olha o sorriso do Cris no pódio com a medalha no peito!',
      };
    }
    return {
      badge: 'CAMPEONATO DE KARATÊ · CAMPEÃO AOS 7 ANOS',
      speaker: 'Cris (7 anos)',
      speakerId: 'cristian',
      emotion: 'happy',
      text: 'Consegui, mãe! Consegui, pai! Essa medalha é nossa!',
    };
  }

  if (cutscene === 'pregnancy_phone_call') {
    const snap = getStage5PhoneCallSnapshot(state);
    if (snap) {
      return {
        badge: `A LIGAÇÃO · TELA DIVIDIDA (PASSO ${snap.step.index}/${snap.totalSteps})`,
        speaker: snap.step.speakerName,
        speakerId: snap.step.speaker,
        emotion: snap.step.emotion,
        text: snap.visibleText,
        fullText: snap.step.text,
        stageDirection: snap.step.stageDirection,
        isTypingComplete: snap.isTypingComplete,
      };
    }
  }

  if (cutscene === 'pregnancy_time_passage') {
    if (t < 2.2) {
      return {
        badge: 'PASSAGEM DE TEMPO · ALGUNS MESES DEPOIS',
        text: 'Alguns meses depois... A barriga da Grazi foi crescendo cercada de amor no apartamento em cima do Mercado Guesser.',
      };
    }
    if (t < 5.4) {
      return {
        badge: 'ALGUNS MESES DEPOIS · NO APARTAMENTO',
        speaker: 'Grazi',
        speakerId: 'grazi_adult',
        emotion: 'romantic',
        text: 'Cada cantinho do nosso apartamento no Bela Vista já está pronto esperando a chegada da nossa pequena.',
      };
    }
    return {
      badge: 'ALGUNS MESES DEPOIS · PELA RUA DO BELA VISTA',
      speaker: 'Cris (7 anos)',
      speakerId: 'cristian',
      emotion: 'happy',
      text: 'Vem logo, irmãzinha! Todo mundo aqui na rua do Mercado Guesser já tá ansioso pra te conhecer!',
    };
  }

  if (cutscene === 'lara_baby_arrival') {
    if (t < 3.8) {
      return {
        badge: 'CHEGADA EM CASA · BEM-VINDA, LARA!',
        speaker: 'Grazi',
        speakerId: 'grazi_adult',
        emotion: 'romantic',
        text: 'O desejo do Ariel se realizou: chegou a nossa Lara! De roupinha rosa e esse cabelinho preto todo arrepiado pra cima que nem um pica-pau!',
      };
    }
    if (t < 7.6) {
      return {
        badge: 'O ABRAÇO DO IRMÃO MAIS VELHO',
        speaker: 'Cris (7 anos)',
        speakerId: 'cristian',
        emotion: 'happy',
        text: 'Oi, Lara! Como ela é pequenininha e linda, mãe! Deixa eu dar um abraço bem gostoso nela!',
      };
    }
    return {
      badge: 'AMOR DE IRMÃOS NO BELA VISTA',
      speaker: 'Ariel',
      speakerId: 'ariel_adult',
      emotion: 'romantic',
      text: 'Olha o cuidado do Cris abraçando a irmãzinha... Nossa princesa de cabelinho de pica-pau completou a nossa casa.',
    };
  }

  if (cutscene === 'lara_pepelequinha_dance') {
    if (t < 3.4) {
      return {
        badge: 'LARA AOS 2 ANOS · O SHOW NA SALA',
        speaker: 'Lara (2 anos)',
        speakerId: 'lara',
        emotion: 'happy',
        text: 'Pepelequinha, pepelequinha! ♪',
      };
    }
    if (t < 6.8) {
      return {
        badge: 'RISADAS EM FAMÍLIA',
        speaker: 'Cris',
        speakerId: 'cristian',
        emotion: 'amused',
        text: 'Hahaha! Olha ela balançando os bracinhos e cantando “Pepelequinha, pepelequinha”, mãe! Ela é muito engraçada!',
      };
    }
    return {
      badge: 'LARA CRESCENDO CHEIA DE GRAÇA',
      speaker: 'Ariel',
      speakerId: 'ariel_adult',
      emotion: 'happy',
      text: 'Essa nossa guria de 2 anos tem uma alegria que contagia a casa inteira!',
    };
  }

  if (cutscene === 'park_family_reunion') {
    if (t < 3.2) {
      return {
        badge: '📸 FOTO EM FAMÍLIA · PARQUINHO DO BELA VISTA',
        speaker: 'Laura',
        speakerId: 'laura',
        emotion: 'happy',
        text: 'Todo mundo juntinho olhando pra frente! Grazi, Cris, Lara e o meu Lucas loirinho de cachinhos: Xiiis!',
      };
    }
    if (t < 6.2) {
      return {
        badge: '★ NOVA MEMÓRIA GUARDADA · TARDE NO PARQUINHO',
        speaker: 'Lucas (5 anos)',
        speakerId: 'lucas',
        emotion: 'happy',
        text: 'Ficou muito legal a nossa foto em frente à igreja com a pista de skate e o parquinho, tia Grazi!',
      };
    }
    return {
      badge: 'FAMÍLIA REUNIDA NO FIM DE TARDE',
      speaker: 'Grazi',
      speakerId: 'grazi_adult',
      emotion: 'romantic',
      text: 'Uma imagem que vou guardar pra sempre no coração: nós cinco reunidos nesse fim de tarde dourado do Bela Vista.',
    };
  }

  if (t < 3.2) {
    return {
      badge: 'DESPEDIDA DO BELA VISTA · RUMO À PONTE DO IMARUIM',
      text: 'Depois de tantos momentos felizes em cima do Mercado Guesser, chegou a hora de se despedir do Bela Vista para realizar um grande sonho...',
      canFinishEnding: false,
    };
  }

  return {
    badge: 'DE VOLTA À PONTE DO IMARUIM · NOSSO APARTAMENTO PRÓPRIO',
    text: STAGE_5_CLOSING_QUOTE,
    canFinishEnding: endingReadyToFinish,
  };
}
