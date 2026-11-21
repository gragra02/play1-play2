import type { CharacterEmotion, SpeakerId } from './types';

// ============================================================================
// REUSABLE CINEMATIC CUTSCENE TIMELINE ENGINE
// Pure TypeScript (zero DOM/image imports) so it is 100% unit-testable in Node.
// ============================================================================

export type CutscenePortraitKey =
  | 'none'
  | 's4_grazi_adult'
  | 's4_ariel_adult'
  | 'alternating_grazi_ariel';

export type ResolvedCutscenePortraitKey = Exclude<
  CutscenePortraitKey,
  'alternating_grazi_ariel'
>;

export type CutsceneCouplePoseKey =
  | 'standing_apart'
  | 'hesitation_hands'
  | 'nod_and_smile'
  | 'embrace_gaze_to_forehead';

export interface CutsceneStepCamera {
  focusX: number;
  focusY: number;
  zoomStart: number;
  zoomEnd: number;
  panYDelta?: number;
}

export interface CutsceneStepEffects {
  fadeInDuration?: number;
  fadeOutDuration?: number;
  crossfadeDuration?: number;
  letterbox?: boolean;
  vignetteIntensity?: number;
  musicDynamic?: 'soft' | 'swell' | 'fade_out';
  fireflies?: boolean;
  eyeSparkle?: boolean;
  windHair?: boolean;
  tearyEyes?: boolean;
  screenShake?: number;
  pauseAfterTypingSeconds?: number;
}

export interface CutsceneTimelineStep {
  id: string;
  index: number;
  duration: number;
  canAdvance: boolean;
  speaker?: SpeakerId;
  speakerName?: string;
  emotion?: CharacterEmotion;
  portraitKey: CutscenePortraitKey;
  couplePose: CutsceneCouplePoseKey;
  text: string;
  stageDirection?: string;
  typingCharsPerSecond?: number;
  camera: CutsceneStepCamera;
  effects: CutsceneStepEffects;
}

export interface CutsceneTimelineSnapshot {
  step: CutsceneTimelineStep;
  stepIndex: number;
  totalSteps: number;
  stepStartTime: number;
  stepElapsed: number;
  stepProgress: number;
  cameraZoom: number;
  cameraFocusX: number;
  cameraFocusY: number;
  visibleText: string;
  isTypingComplete: boolean;
  canAdvanceNow: boolean;
  fadeBlackAlpha: number;
  stepTransitionAlpha: number;
  activePortraitKey: ResolvedCutscenePortraitKey;
  activeSpeaker?: SpeakerId;
  activeEmotion?: CharacterEmotion;
}

// ============================================================================
// STAGE 4 · CENA 2 — A REVELAÇÃO DA GRAVIDEZ (8-Step Cinematic Timeline = 32s)
// ============================================================================
const PORCH_CENTER_X = 10.3 * 32;
const PORCH_CENTER_Y = 9.5 * 32;

export const STAGE4_PREGNANCY_REVEAL_TIMELINE: CutsceneTimelineStep[] = [
  {
    // 1. Entrada (2 s): fade vindo do preto, plano aberto na varanda, zoom 1.0 -> 1.15
    id: 's4_c2_step1_entry',
    index: 1,
    duration: 2.0,
    canAdvance: true,
    portraitKey: 'none',
    couplePose: 'standing_apart',
    text: '',
    stageDirection: 'Fim de noite na varanda da casa da mãe de Grazi...',
    camera: {
      focusX: PORCH_CENTER_X,
      focusY: PORCH_CENTER_Y,
      zoomStart: 1.0,
      zoomEnd: 1.15,
    },
    effects: {
      fadeInDuration: 1.35,
      crossfadeDuration: 0.35,
      letterbox: true,
      vignetteIntensity: 0.46,
      musicDynamic: 'soft',
    },
  },
  {
    // 2. A hesitação (4 s): letterbox, retrato atual da Grazi (s4_grazi_adult) olhando para baixo / mexendo nas mãos
    id: 's4_c2_step2_hesitation',
    index: 2,
    duration: 4.0,
    canAdvance: true,
    speaker: 'grazi_adult',
    speakerName: 'Grazi',
    emotion: 'blush',
    portraitKey: 's4_grazi_adult',
    couplePose: 'hesitation_hands',
    text: 'Ariel... preciso te contar uma coisa.',
    stageDirection: 'Olhando para baixo, mexendo devagar nas mãos...',
    typingCharsPerSecond: 14,
    camera: {
      focusX: PORCH_CENTER_X,
      focusY: PORCH_CENTER_Y,
      zoomStart: 1.15,
      zoomEnd: 1.18,
    },
    effects: {
      crossfadeDuration: 0.45,
      letterbox: true,
      vignetteIntensity: 0.5,
      musicDynamic: 'soft',
    },
  },
  {
    // 3. A expectativa (3 s): corte para retrato do Ariel, olhar atento e preocupado, silêncio
    id: 's4_c2_step3_expectation',
    index: 3,
    duration: 3.0,
    canAdvance: true,
    speaker: 'ariel_adult',
    speakerName: 'Ariel',
    emotion: 'thoughtful',
    portraitKey: 's4_ariel_adult',
    couplePose: 'standing_apart',
    text: '',
    stageDirection: 'Olhar atento e preocupado. Silêncio, só o ruído leve da noite...',
    camera: {
      focusX: PORCH_CENTER_X,
      focusY: PORCH_CENTER_Y,
      zoomStart: 1.18,
      zoomEnd: 1.21,
    },
    effects: {
      crossfadeDuration: 0.45,
      letterbox: true,
      vignetteIntensity: 0.52,
      musicDynamic: 'soft',
    },
  },
  {
    // 4. Os olhares (5 s): alterna entre os dois retratos (1,2 s cada), plano fechado, sem fala, inskippable
    id: 's4_c2_step4_gazes',
    index: 4,
    duration: 5.0,
    canAdvance: false,
    portraitKey: 'alternating_grazi_ariel',
    couplePose: 'standing_apart',
    text: '',
    stageDirection: 'O vento leve da noite move os cabelos; os olhares se encontram em silêncio...',
    camera: {
      focusX: PORCH_CENTER_X,
      focusY: PORCH_CENTER_Y - 4,
      zoomStart: 1.21,
      zoomEnd: 1.28,
    },
    effects: {
      crossfadeDuration: 0.45,
      letterbox: true,
      vignetteIntensity: 0.56,
      musicDynamic: 'swell',
      windHair: true,
      eyeSparkle: true,
    },
  },
  {
    // 5. A revelação (4 s): retrato da Grazi sorrindo com olhos marejados + pausa de 1 s após a frase
    id: 's4_c2_step5_revelation',
    index: 5,
    duration: 4.0,
    canAdvance: true,
    speaker: 'grazi_adult',
    speakerName: 'Grazi',
    emotion: 'romantic',
    portraitKey: 's4_grazi_adult',
    couplePose: 'standing_apart',
    text: 'Nós vamos ser pai e mãe.',
    stageDirection: 'Sorrindo com os olhos marejados...',
    typingCharsPerSecond: 13,
    camera: {
      focusX: PORCH_CENTER_X,
      focusY: PORCH_CENTER_Y - 4,
      zoomStart: 1.25,
      zoomEnd: 1.27,
    },
    effects: {
      crossfadeDuration: 0.45,
      letterbox: true,
      vignetteIntensity: 0.54,
      musicDynamic: 'swell',
      tearyEyes: true,
      eyeSparkle: true,
      screenShake: 0.9,
      pauseAfterTypingSeconds: 1.0,
    },
  },
  {
    // 6. A reação (5 s): retrato atual do Ariel (s4_ariel_adult, surpresa -> emoção, olhos brilhando, leve tremor) + aceno e sorriso da Grazi
    id: 's4_c2_step6_reaction',
    index: 6,
    duration: 5.0,
    canAdvance: true,
    speaker: 'ariel_adult',
    speakerName: 'Ariel',
    emotion: 'romantic',
    portraitKey: 's4_ariel_adult',
    couplePose: 'nod_and_smile',
    text: 'Sério...? Grazi... eu vou ser pai?',
    stageDirection: 'Ela responde com um aceno de cabeça e um sorriso emocionado.',
    typingCharsPerSecond: 14,
    camera: {
      focusX: PORCH_CENTER_X,
      focusY: PORCH_CENTER_Y - 4,
      zoomStart: 1.24,
      zoomEnd: 1.28,
    },
    effects: {
      crossfadeDuration: 0.45,
      letterbox: true,
      vignetteIntensity: 0.52,
      musicDynamic: 'swell',
      eyeSparkle: true,
      screenShake: 1.2,
    },
  },
  {
    // 7. O abraço (6 s): plano aberto, couple_kiss_gaze -> couple_forehead_kiss, câmera subindo, vaga-lumes, inskippable
    id: 's4_c2_step7_embrace',
    index: 7,
    duration: 6.0,
    canAdvance: false,
    portraitKey: 'none',
    couplePose: 'embrace_gaze_to_forehead',
    text: '',
    stageDirection: '',
    camera: {
      focusX: PORCH_CENTER_X,
      focusY: PORCH_CENTER_Y,
      zoomStart: 1.2,
      zoomEnd: 1.14,
      panYDelta: -24,
    },
    effects: {
      crossfadeDuration: 0.55,
      letterbox: true,
      vignetteIntensity: 0.48,
      musicDynamic: 'swell',
      fireflies: true,
    },
  },
  {
    // 8. Fechamento (3 s): fala final do Ariel (s4_ariel_adult) + fade para o preto com música diminuindo
    id: 's4_c2_step8_closing',
    index: 8,
    duration: 3.0,
    canAdvance: true,
    speaker: 'ariel_adult',
    speakerName: 'Ariel',
    emotion: 'romantic',
    portraitKey: 's4_ariel_adult',
    couplePose: 'embrace_gaze_to_forehead',
    text: 'Eu te amo. Vocês dois vão ter tudo de mim.',
    typingCharsPerSecond: 18,
    camera: {
      focusX: PORCH_CENTER_X,
      focusY: PORCH_CENTER_Y - 24,
      zoomStart: 1.14,
      zoomEnd: 1.12,
    },
    effects: {
      fadeOutDuration: 1.25,
      crossfadeDuration: 0.4,
      letterbox: true,
      vignetteIntensity: 0.55,
      musicDynamic: 'fade_out',
      fireflies: true,
    },
  },
];

export function getTotalTimelineDuration(timeline: CutsceneTimelineStep[]): number {
  return timeline.reduce((acc, step) => acc + step.duration, 0);
}

export const S4_PREGNANCY_REVEAL_TOTAL_DURATION = getTotalTimelineDuration(
  STAGE4_PREGNANCY_REVEAL_TIMELINE,
);

export function getCutsceneTimelineSnapshot(
  timeline: CutsceneTimelineStep[],
  elapsedSeconds: number,
): CutsceneTimelineSnapshot {
  const clampedElapsed = Math.max(0, elapsedSeconds);
  let cursor = 0;
  let activeIdx = timeline.length - 1;
  let stepStartTime = 0;

  for (let i = 0; i < timeline.length; i++) {
    const step = timeline[i];
    if (clampedElapsed < cursor + step.duration || i === timeline.length - 1) {
      activeIdx = i;
      stepStartTime = cursor;
      break;
    }
    cursor += step.duration;
  }

  const step = timeline[activeIdx];
  const stepElapsed = Math.max(0, Math.min(step.duration, clampedElapsed - stepStartTime));
  const stepProgress = step.duration > 0 ? Math.min(1, stepElapsed / step.duration) : 1;

  // Smooth ease-in-out interpolation for camera zoom and vertical pan
  const smoothT = stepProgress * stepProgress * (3 - 2 * stepProgress);
  const cameraZoom =
    step.camera.zoomStart + (step.camera.zoomEnd - step.camera.zoomStart) * smoothT;
  const cameraFocusX = step.camera.focusX;
  const cameraFocusY = step.camera.focusY + (step.camera.panYDelta ?? 0) * smoothT;

  // Slow letter-by-letter typing calculation
  const fullText = step.text;
  let visibleText = '';
  let isTypingComplete = true;
  let typingDuration = 0;

  if (fullText.length > 0) {
    const cps = step.typingCharsPerSecond ?? 15;
    typingDuration = fullText.length / cps;
    const charsToShow = Math.floor(stepElapsed * cps);
    if (charsToShow < fullText.length) {
      visibleText = fullText.slice(0, Math.max(1, charsToShow));
      isTypingComplete = false;
    } else {
      visibleText = fullText;
      isTypingComplete = true;
    }
  }

  const pauseAfter = step.effects.pauseAfterTypingSeconds ?? 0;
  const canAdvanceNow =
    step.canAdvance &&
    (fullText.length === 0 || stepElapsed >= typingDuration + pauseAfter * 0.5);

  // Fade from/to black at scene boundaries
  let fadeBlackAlpha = 0;
  if (step.effects.fadeInDuration && stepElapsed < step.effects.fadeInDuration) {
    fadeBlackAlpha = Math.max(0, 1 - stepElapsed / step.effects.fadeInDuration);
  }
  if (
    step.effects.fadeOutDuration &&
    stepElapsed > step.duration - step.effects.fadeOutDuration
  ) {
    const outElapsed = stepElapsed - (step.duration - step.effects.fadeOutDuration);
    fadeBlackAlpha = Math.max(
      fadeBlackAlpha,
      Math.min(1, outElapsed / step.effects.fadeOutDuration),
    );
  }

  // Soft fade between consecutive steps
  let stepTransitionAlpha = 0;
  const crossfade = step.effects.crossfadeDuration ?? 0.35;
  if (activeIdx > 0 && stepElapsed < crossfade) {
    stepTransitionAlpha = (1 - stepElapsed / crossfade) * 0.38;
  } else if (activeIdx < timeline.length - 1 && stepElapsed > step.duration - crossfade * 0.7) {
    const rem = step.duration - stepElapsed;
    stepTransitionAlpha = (1 - rem / (crossfade * 0.7)) * 0.28;
  }

  // Resolve alternating portraits in Step 4 (1.2s each)
  let activePortraitKey: ResolvedCutscenePortraitKey = 'none';
  let activeSpeaker = step.speaker;
  let activeEmotion = step.emotion;

  if (step.portraitKey === 'alternating_grazi_ariel') {
    const slot = Math.floor(stepElapsed / 1.2) % 2;
    if (slot === 0) {
      activePortraitKey = 's4_grazi_adult';
      activeSpeaker = 'grazi_adult';
      activeEmotion = 'blush';
    } else {
      activePortraitKey = 's4_ariel_adult';
      activeSpeaker = 'ariel_adult';
      activeEmotion = 'romantic';
    }
  } else {
    activePortraitKey = step.portraitKey;
    if (step.id === 's4_c2_step6_reaction') {
      activeEmotion = stepElapsed < 1.6 ? 'surprised' : 'romantic';
    }
  }

  return {
    step,
    stepIndex: activeIdx,
    totalSteps: timeline.length,
    stepStartTime,
    stepElapsed,
    stepProgress,
    cameraZoom,
    cameraFocusX,
    cameraFocusY,
    visibleText,
    isTypingComplete,
    canAdvanceNow,
    fadeBlackAlpha,
    stepTransitionAlpha,
    activePortraitKey,
    activeSpeaker,
    activeEmotion,
  };
}

export function advanceTimelineElapsed(
  timeline: CutsceneTimelineStep[],
  elapsedSeconds: number,
): { nextElapsed: number; completed: boolean; didAdvance: boolean } {
  const snap = getCutsceneTimelineSnapshot(timeline, elapsedSeconds);
  const { step, stepIndex, stepStartTime, stepElapsed, isTypingComplete } = snap;

  // Steps 4 (gazes) and 7 (embrace) are strictly non-skippable!
  if (!step.canAdvance) {
    return { nextElapsed: elapsedSeconds, completed: false, didAdvance: false };
  }

  // If text is currently typing, first press completes the text typing
  if (step.text.length > 0 && !isTypingComplete) {
    const cps = step.typingCharsPerSecond ?? 15;
    const typingDoneTime = stepStartTime + step.text.length / cps + 0.02;
    if (typingDoneTime < stepStartTime + step.duration - 0.15) {
      return {
        nextElapsed: typingDoneTime,
        completed: false,
        didAdvance: true,
      };
    }
  }

  // Advance to the start of the next step (or complete if on final step)
  const nextStepStart = stepStartTime + step.duration;
  if (stepIndex >= timeline.length - 1) {
    return {
      nextElapsed: getTotalTimelineDuration(timeline),
      completed: true,
      didAdvance: true,
    };
  }

  return {
    nextElapsed: nextStepStart + 0.01,
    completed: false,
    didAdvance: true,
  };
}
