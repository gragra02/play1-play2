import { useEffect, useState, type RefObject } from 'react';
import { retroAudio } from '../game/audio';
import {
  getObjectiveText,
  isStage2ExplorationPhase,
  type Stage2CutsceneCaption,
} from '../game/rules';
import { STAGE_2_MEMORIES } from '../game/stage2Data';
import { STAGE_3_MEMORIES } from '../game/stage3Data';
import { isStage3ExplorationPhase } from '../game/stage3Rules';
import { STAGE_4_MEMORIES, STAGE_4_VIDEOGAME_PUZZLES } from '../game/stage4Data';
import {
  isStage4ExplorationPhase,
  type Stage4CutsceneCaption,
} from '../game/stage4Rules';
import type { CutsceneTimelineSnapshot } from '../game/cutscene';
import type {
  DialogueLine,
  Direction,
  IntroCutsceneState,
  KissCutsceneState,
  QuestPhase,
  SlowDanceState,
  SpeakerId,
  Stage2CutsceneKind,
  Stage3CutsceneKind,
  Stage4CutsceneKind,
  StageId,
} from '../game/types';
import { getCharacterPortraitSrc, getCutscenePortraitSrc } from './portraits';

const TOTAL_MEMORIES_COUNT =
  STAGE_2_MEMORIES.length + STAGE_3_MEMORIES.length + STAGE_4_MEMORIES.length;

function normalizeStage4SpeakerId(speaker: SpeakerId | null, stageId: StageId): SpeakerId | null {
  if (!speaker) return null;
  if (stageId === 'stage-4') {
    if (speaker === 'grazi' || speaker === 'grazi_thought') return 'grazi_adult';
    if (speaker === 'ariel') return 'ariel_adult';
  }
  return speaker;
}

function inferSpeakerIdFromLabel(label?: string, stageId?: StageId): SpeakerId | null {
  if (!label) return null;
  const n = label.toLowerCase();
  if (n.includes('cristian')) return 'cristian';
  if (n.includes('nani') || n.includes('madrinha')) return 'nani';
  if (n.includes('senhor') && n.includes('bar')) return 'bar_man';
  if (n.includes('grazi')) return stageId === 'stage-4' ? 'grazi_adult' : 'grazi';
  if (n.includes('ariel')) return stageId === 'stage-4' ? 'ariel_adult' : 'ariel';
  if (n.includes('laura')) return 'laura';
  if (n.includes('léo') || n.includes('leo')) return 'leo';
  if (n.includes('júnior') || n.includes('junior')) return 'junior';
  if (n.includes('dj')) return 'dj';
  if (n.includes('atendente') || n.includes('locadora')) return 'clerk';
  if (n.includes('vendedor') || n.includes('barraca')) return 'vendor';
  if (n.includes('barman') || n.includes('balcão')) return 'bartender';
  if (n.includes('amigo')) return 'friend';
  if (n.includes('b-boy') || n.includes('galera')) return 'bboy';
  return null;
}

export interface HudSnapshot {
  stageId: StageId;
  questPhase: QuestPhase;
  stage3Objective: string | null;
  stage3LocationLabel: string | null;
  intro: IntroCutsceneState;
  activeLine: DialogueLine | null;
  lineIndex: number;
  totalLines: number;
  nearestLabel: string | null;
  slowDance: SlowDanceState;
  kissCutscene: KissCutsceneState;
  stage2Cutscene: Stage2CutsceneKind;
  stage2Caption: Stage2CutsceneCaption | null;
  stage3Cutscene: Stage3CutsceneKind;
  stage3Caption: Stage2CutsceneCaption | null;
  stage3WrongHandChoicePending: boolean;
  stage3MovingDelivered: number;
  stage3CarryingLabel: string | null;
  stage4Objective: string | null;
  stage4LocationLabel: string | null;
  stage4EraLabel: string | null;
  stage4Cutscene: Stage4CutsceneKind;
  stage4Caption: Stage4CutsceneCaption | null;
  stage4PregnancyReveal: CutsceneTimelineSnapshot | null;
  stage4BuildStage: number;
  stage4CarryingLabel: string | null;
  stage4BikeActive: boolean;
  stage4BikeProgress: number;
  stage4BikeArrived: boolean;
  stage4PuzzleStep: number;
  stage4PuzzlePending: boolean;
  stage4PuzzleFeedback: string | null;
  stage4PuzzlesSolved: number;
  unlockedMemoriesCount: number;
  recentMemoryTitle: string | null;
  discoveredCount: number;
  elapsedSeconds: number;
}

interface GameHUDProps {
  hud: HudSnapshot;
  muted: boolean;
  showTouchControls: boolean;
  beatCursorRef: RefObject<HTMLDivElement | null>;
  onToggleMute: () => void;
  onToggleTouchControls: () => void;
  onOpenMemories: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSkipIntro: () => void;
  onInteractOrAdvance: () => void;
  onChooseWrongHand: (choice: 'wait' | 'tell') => void;
  onChooseStage4Puzzle: (option: 'A' | 'B') => void;
  onDirectionChange: (dir: Direction | null) => void;
}

function AmbientNpcFaceOverlay({
  browColor,
  irisColor,
  pupilColor,
  blushColor,
  mouthColor,
}: {
  browColor: string;
  irisColor: string;
  pupilColor: string;
  blushColor: string;
  mouthColor: string;
}) {
  return (
    <>
      <path d="M10 12h3v1h-3zM19 12h3v1h-3z" fill={browColor} />
      <rect x="10" y="14" width="3" height="3" fill="#ffffff" />
      <rect x="19" y="14" width="3" height="3" fill="#ffffff" />
      <rect x="10" y="15" width="2" height="2" fill={irisColor} />
      <rect x="19" y="15" width="2" height="2" fill={irisColor} />
      <rect x="11" y="15" width="1" height="2" fill={pupilColor} />
      <rect x="20" y="15" width="1" height="2" fill={pupilColor} />
      <rect x="10" y="14" width="3" height="1" fill={pupilColor} />
      <rect x="19" y="14" width="3" height="1" fill={pupilColor} />
      <rect x="10" y="15" width="1" height="1" fill="#ffffff" />
      <rect x="19" y="15" width="1" height="1" fill="#ffffff" />
      <rect x="9" y="18" width="2" height="1" fill={blushColor} opacity="0.65" />
      <rect x="21" y="18" width="2" height="1" fill={blushColor} opacity="0.65" />
      <rect x="13" y="20" width="1" height="1" fill={mouthColor} />
      <rect x="18" y="20" width="1" height="1" fill={mouthColor} />
      <rect x="14" y="21" width="4" height="1" fill={mouthColor} />
    </>
  );
}

function SpeakerPortrait({
  speaker,
  emotion,
}: {
  speaker: SpeakerId;
  emotion?: DialogueLine['emotion'];
}) {
  const portraitSrc = getCharacterPortraitSrc(speaker, emotion);
  if (portraitSrc) {
    const isThought = speaker === 'grazi_thought';
    const isAriel = speaker === 'ariel' || speaker === 'ariel_adult';
    const animated = emotion === 'amused' || emotion === 'happy' || isThought;
    return (
      <div
        className={`relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#5c351e] border-3 overflow-hidden shadow-[inset_0_0_0_2px_#3d2111] ${
          isAriel ? 'border-[#d49b56]' : 'border-[#8c522b]'
        } ${animated ? 'animate-float-gentle' : ''}`}
      >
        <img
          src={portraitSrc}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover pixelated block"
        />
        {isThought && (
          <svg
            viewBox="0 0 12 12"
            shapeRendering="crispEdges"
            className="absolute top-1 right-1 w-4 h-4 drop-shadow-[0_1px_0_#3d2111]"
            aria-hidden="true"
          >
            <rect x="3" y="2" width="6" height="4" fill="#fff7e2" />
            <rect x="4" y="1" width="4" height="1" fill="#fff7e2" />
            <rect x="2" y="3" width="8" height="2" fill="#fff7e2" />
            <rect x="2" y="7" width="2" height="2" fill="#fff7e2" />
            <rect x="0" y="9" width="2" height="2" fill="#fff7e2" />
          </svg>
        )}
      </div>
    );
  }

  if (
    speaker === 'bboy' ||
    speaker === 'teen_group' ||
    speaker === 'dj' ||
    speaker === 'bartender' ||
    speaker === 'vendor' ||
    speaker === 'clerk' ||
    speaker === 'friend'
  ) {
    const shirt =
      speaker === 'dj'
        ? '#3d7ac4'
        : speaker === 'bartender'
          ? '#c84a68'
          : speaker === 'vendor'
            ? '#c83e37'
            : speaker === 'clerk'
              ? '#2d689c'
              : speaker === 'friend'
                ? '#3e7c59'
                : '#d9912e';
    const hair =
      speaker === 'dj'
        ? '#1d1522'
        : speaker === 'bartender'
          ? '#593727'
          : speaker === 'vendor'
            ? '#c83e37'
            : speaker === 'clerk'
              ? '#3b2416'
              : speaker === 'friend'
                ? '#3b2416'
                : '#2c3d59';
    return (
      <svg
        viewBox="0 0 32 32"
        shapeRendering="crispEdges"
        className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#5c351e] border-3 border-[#8c522b]"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="28" height="28" fill="#633a22" />
        <path d="M8 4h16v6H8z" fill={hair} />
        <path d="M9 9h14v10h-1v3h-2v1h-2v1h-4v-1h-2v-1h-2v-3H9V9z" fill="#dea37c" />
        <path d="M12 22h8v1h-2v1h-4v-1h-2v-1z" fill="#bf825c" />

        <AmbientNpcFaceOverlay
          browColor="#4a2e1d"
          irisColor="#573522"
          pupilColor="#21120b"
          blushColor="#e68d80"
          mouthColor="#8c4e3d"
        />

        <path d="M14 24h4v2h-4z" fill="#bf825c" />
        <path d="M7 26h18v6H7z" fill={shirt} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#5c351e] border-3 border-[#d49b56]"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="28" height="28" fill="#633a22" />
      <circle cx="16" cy="16" r="9" fill="#d8e2f0" />
      <rect x="15" y="2" width="2" height="5" fill="#8c522b" />
      <rect x="11" y="11" width="4" height="4" fill="#ffffff" />
      <rect x="17" y="16" width="4" height="4" fill="#f0b23a" />
      <rect x="11" y="19" width="3" height="3" fill="#d64e6c" />
    </svg>
  );
}

export function GameHUD({
  hud,
  muted,
  showTouchControls,
  beatCursorRef,
  onToggleMute,
  onToggleTouchControls,
  onOpenMemories,
  onPause,
  onRestart,
  onSkipIntro,
  onInteractOrAdvance,
  onChooseWrongHand,
  onChooseStage4Puzzle,
  onDirectionChange,
}: GameHUDProps) {
  const fullText = hud.activeLine?.text ?? '';
  const [isTypingDone, setIsTypingDone] = useState(true);
  const textNodeRef = useState<{ el: HTMLParagraphElement | null }>({ el: null })[0];

  useEffect(() => {
    if (!hud.activeLine) {
      setIsTypingDone(true);
      return;
    }
    setIsTypingDone(false);
    const speaker = hud.activeLine.speaker;
    let count = 0;
    if (textNodeRef.el) {
      textNodeRef.el.textContent = '';
    }
    const interval = window.setInterval(() => {
      count += 3;
      if (count >= fullText.length) {
        if (textNodeRef.el) textNodeRef.el.textContent = fullText;
        setIsTypingDone(true);
        window.clearInterval(interval);
      } else {
        if (textNodeRef.el) textNodeRef.el.textContent = fullText.slice(0, count);
        if (count % 6 === 3) {
          retroAudio.playSpeechBlip(speaker);
        }
      }
    }, 34);

    return () => window.clearInterval(interval);
  }, [hud.activeLine, fullText, textNodeRef]);

  const handleDialogueClick = () => {
    if (hud.activeLine && !isTypingDone) {
      if (textNodeRef.el) textNodeRef.el.textContent = fullText;
      setIsTypingDone(true);
    } else {
      onInteractOrAdvance();
    }
  };

  // Dedicated Stage 4 Animated Cutscene, Interactive Videogame Enigma & Ending Overlays
  if (hud.stageId === 'stage-4' && hud.stage4Cutscene !== 'none' && hud.stage4Caption && !hud.activeLine) {
    const cap = hud.stage4Caption;
    const isEnding = hud.stage4Cutscene === 'family_ending_7y';

    // Cinematic 8-Step Pregnancy Reveal (CENA 2)
    if (hud.stage4Cutscene === 'pregnancy_reveal' && hud.stage4PregnancyReveal) {
      const rev = hud.stage4PregnancyReveal;
      const portraitSrc =
        rev.activePortraitKey !== 'none'
          ? getCutscenePortraitSrc(rev.activePortraitKey, rev.activeSpeaker, rev.activeEmotion)
          : null;
      const isStep4Gazes = rev.step.id === 's4_c2_step4_gazes';
      const isStep7Embrace = rev.step.id === 's4_c2_step7_embrace';
      const isStep1Entry = rev.step.id === 's4_c2_step1_entry';

      return (
        <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="rpg-mahogany-panel px-3.5 py-1.5">
              <div className="font-mono-tabular text-[11px] sm:text-xs font-bold text-[#ffd166] tracking-wide">
                {cap.badge}
              </div>
              {hud.stage4EraLabel && (
                <div className="text-[11px] text-[#faeccd]/90">{hud.stage4EraLabel}</div>
              )}
            </div>
          </div>

          {isStep4Gazes && portraitSrc ? (
            <div className="w-full flex flex-col items-center gap-2.5 pb-3">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-[#3d2111] border-3 border-[#d49b56] overflow-hidden shadow-[0_0_24px_rgba(255,209,102,0.22)]">
                <img
                  src={portraitSrc}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover pixelated block"
                />
                {rev.step.effects.eyeSparkle && (
                  <svg
                    viewBox="0 0 32 32"
                    shapeRendering="crispEdges"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    aria-hidden="true"
                  >
                    <rect x="11" y="13" width="2" height="2" fill="#fff9d6" opacity="0.85" />
                    <rect x="19" y="13" width="2" height="2" fill="#fff9d6" opacity="0.85" />
                  </svg>
                )}
              </div>
              {rev.step.stageDirection && (
                <div className="rpg-wood-panel px-4 py-2 max-w-lg text-center">
                  <p className="text-xs sm:text-sm italic font-medium text-[#5c351e]">
                    {rev.step.stageDirection}
                  </p>
                </div>
              )}
            </div>
          ) : isStep1Entry || isStep7Embrace ? (
            <div className="w-full flex justify-center pb-2">
              {rev.step.stageDirection && (
                <div className="rpg-wood-panel px-4 py-2 max-w-lg text-center">
                  <p className="text-xs sm:text-sm italic font-medium text-[#5c351e]">
                    {rev.step.stageDirection}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full flex justify-center pointer-events-auto pb-2">
              <button
                type="button"
                onClick={() => {
                  if (rev.step.canAdvance) {
                    onInteractOrAdvance();
                  }
                }}
                className="w-full max-w-2xl rpg-wood-panel px-4 py-3.5 sm:px-5 sm:py-4 flex items-center gap-3.5 text-left cursor-pointer"
              >
                {portraitSrc && (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#5c351e] border-3 border-[#d49b56] overflow-hidden shadow-[inset_0_0_0_2px_#3d2111]">
                    <img
                      src={portraitSrc}
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover pixelated block"
                    />
                    {(rev.step.effects.tearyEyes || rev.step.effects.eyeSparkle) && (
                      <svg
                        viewBox="0 0 32 32"
                        shapeRendering="crispEdges"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        aria-hidden="true"
                      >
                        <rect x="11" y="13" width="2" height="2" fill="#fff9d6" opacity="0.9" />
                        <rect x="19" y="13" width="2" height="2" fill="#fff9d6" opacity="0.9" />
                        {rev.step.effects.tearyEyes && (
                          <>
                            <rect x="11" y="16" width="2" height="2" fill="#bfe3ff" opacity="0.9" />
                            <rect x="19" y="16" width="2" height="2" fill="#bfe3ff" opacity="0.9" />
                          </>
                        )}
                      </svg>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    {rev.step.speakerName && (
                      <span className="font-display-pixel text-xs sm:text-sm font-bold text-[#9e2e24]">
                        {rev.step.speakerName}
                      </span>
                    )}
                    <span className="font-mono-tabular text-[11px] font-bold text-[#7c4726]">
                      {rev.step.index}/{rev.totalSteps}
                    </span>
                  </div>
                  {rev.step.stageDirection && (
                    <p className="mt-0.5 text-xs italic font-medium text-[#6b3b1e]">
                      {rev.step.stageDirection}
                    </p>
                  )}
                  {rev.step.text && (
                    <p className="mt-1 text-sm sm:text-base font-semibold text-[#3d2111] leading-snug min-h-[1.75em]">
                      &ldquo;{rev.visibleText}&rdquo;
                    </p>
                  )}
                  {rev.step.canAdvance && (
                    <div className="mt-1.5 text-right font-mono-tabular text-[11px] font-bold text-[#8c4e27]">
                      {!rev.isTypingComplete
                        ? 'Espaço / Toque para completar'
                        : 'Espaço / Enter / Toque ▼'}
                    </div>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
      );
    }

    if (isEnding) {
      return (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-between p-4 sm:p-6 pointer-events-none">
          <div className="w-full max-w-2xl flex justify-center">
            <div className="rpg-mahogany-panel px-4 py-2 text-center">
              <div className="font-mono-tabular text-xs font-bold text-[#ffd166]">
                FASE 4 · {cap.badge}
              </div>
            </div>
          </div>

          <div className="pointer-events-auto w-full max-w-xl rpg-wood-panel px-6 py-4 sm:px-8 sm:py-5 text-center flex flex-col items-center gap-4 mb-1">
            <p className="text-base sm:text-lg font-semibold text-[#3d2111] leading-relaxed">
              &ldquo;{cap.text}&rdquo;
            </p>
            {cap.canFinishEnding && (
              <button
                type="button"
                data-finish-stage4="true"
                onClick={onInteractOrAdvance}
                className="rpg-btn-gold px-6 py-2.5 font-pixel text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              >
                CONCLUIR FASE 4 [ESPAÇO]
              </button>
            )}
          </div>
        </div>
      );
    }

    const activePuzzle =
      hud.stage4Cutscene === 'videogame_session' && hud.stage4PuzzlePending
        ? STAGE_4_VIDEOGAME_PUZZLES[hud.stage4PuzzleStep] ?? null
        : null;
    const resolvedSpeakerId = normalizeStage4SpeakerId(
      cap.speakerId ?? inferSpeakerIdFromLabel(cap.speaker, hud.stageId),
      hud.stageId,
    );

    return (
      <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="rpg-mahogany-panel px-3.5 py-2 pointer-events-auto">
            <div className="font-mono-tabular text-[11px] sm:text-xs font-bold text-[#ffd166] tracking-wide">
              {cap.badge}
            </div>
            {hud.stage4EraLabel && (
              <div className="text-[11px] text-[#faeccd]/90">{hud.stage4EraLabel}</div>
            )}
          </div>
          {cap.canSkipIntro && (
            <button
              type="button"
              data-skip-intro="true"
              onClick={onSkipIntro}
              className="rpg-btn-gold px-3.5 py-2 font-display-pixel text-xs cursor-pointer pointer-events-auto whitespace-nowrap"
            >
              Pular Abertura [Espaço]
            </button>
          )}
        </div>

        {activePuzzle ? (
          <div className="w-full px-2 sm:px-6 pb-2 sm:pb-4 flex justify-center pointer-events-auto">
            <div className="w-full max-w-2xl rpg-wood-panel px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-tabular text-xs font-bold text-[#9e2e24]">
                  {activePuzzle.stageTitle} · ENIGMA {hud.stage4PuzzlesSolved + 1}/3
                </span>
                <span className="font-mono-tabular text-[11px] font-bold text-[#6b3b1e]">
                  GRAZI + ARIEL + CRISTIAN (5 ANOS)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <SpeakerPortrait speaker="grazi_adult" emotion="happy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display-pixel text-xs sm:text-sm font-bold text-[#3d2111]">
                    {activePuzzle.prompt}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-[#5c361e]">
                    {hud.stage4PuzzleFeedback ?? activePuzzle.sceneHint}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  data-s4-puzzle="A"
                  onClick={() => onChooseStage4Puzzle('A')}
                  className="rpg-btn-gold px-4 py-2.5 text-left cursor-pointer flex items-center gap-2.5"
                >
                  <span className="font-mono-tabular text-xs font-bold px-1.5 py-0.5 bg-[#3d2111] text-[#ffd166] shrink-0">
                    1
                  </span>
                  <span className="font-display-pixel text-xs sm:text-sm leading-snug">
                    {activePuzzle.optionA.label}
                  </span>
                </button>
                <button
                  type="button"
                  data-s4-puzzle="B"
                  onClick={() => onChooseStage4Puzzle('B')}
                  className="rpg-btn-rose px-4 py-2.5 text-left cursor-pointer flex items-center gap-2.5"
                >
                  <span className="font-mono-tabular text-xs font-bold px-1.5 py-0.5 bg-[#3d2111] text-[#ffe3eb] shrink-0">
                    2
                  </span>
                  <span className="font-display-pixel text-xs sm:text-sm leading-snug">
                    {activePuzzle.optionB.label}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : resolvedSpeakerId ? (
          <div className="w-full flex justify-center pointer-events-auto">
            <div className="w-full max-w-2xl rpg-wood-panel px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3.5">
              <SpeakerPortrait speaker={resolvedSpeakerId} emotion={cap.emotion} />
              <div className="flex-1 min-w-0">
                {cap.speaker && (
                  <div className="font-display-pixel text-xs sm:text-sm font-bold text-[#9e2e24]">
                    {cap.speaker}
                  </div>
                )}
                <p className="mt-1 text-sm sm:text-base font-semibold text-[#3d2111] leading-snug">
                  {cap.text}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-2xl rpg-wood-panel px-5 py-3 text-center flex flex-col items-center gap-1">
              {cap.speaker && (
                <span className="font-display-pixel text-xs font-bold text-[#9e2e24] tracking-wide">
                  {cap.speaker}
                </span>
              )}
              <p className="text-sm sm:text-base font-semibold text-[#3d2111] leading-snug">
                {cap.text}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dedicated Stage 3 Animated Cutscene & Ending Overlays
  if (hud.stageId === 'stage-3' && hud.stage3Cutscene !== 'none' && hud.stage3Caption) {
    const cap = hud.stage3Caption;
    const isEnding = hud.stage3Cutscene === 'ending_together';

    if (isEnding) {
      return (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-between p-4 sm:p-6 pointer-events-none">
          <div className="w-full max-w-2xl flex justify-center">
            <div className="rpg-mahogany-panel px-4 py-2 text-center">
              <div className="font-mono-tabular text-xs font-bold text-[#ffd166]">
                FASE 3 · {cap.badge}
              </div>
            </div>
          </div>

          <div className="pointer-events-auto w-full max-w-xl rpg-wood-panel px-6 py-4 sm:px-8 sm:py-5 text-center flex flex-col items-center gap-4 mb-1">
            <p className="text-base sm:text-lg font-semibold text-[#3d2111] leading-relaxed">
              &ldquo;{cap.text}&rdquo;
            </p>
            {cap.canFinishEnding && (
              <button
                type="button"
                data-finish-stage3="true"
                onClick={onInteractOrAdvance}
                className="rpg-btn-gold px-6 py-2.5 font-pixel text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              >
                CONCLUIR FASE 3 [ESPAÇO]
              </button>
            )}
          </div>
        </div>
      );
    }

    const resolvedSpeakerId = cap.speakerId ?? inferSpeakerIdFromLabel(cap.speaker);

    return (
      <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="rpg-mahogany-panel px-3.5 py-2 pointer-events-auto">
            <div className="font-mono-tabular text-[11px] sm:text-xs font-bold text-[#ffd166] tracking-wide">
              {cap.badge}
            </div>
          </div>
          {cap.canSkipIntro && (
            <button
              type="button"
              data-skip-intro="true"
              onClick={onSkipIntro}
              className="rpg-btn-gold px-3.5 py-2 font-display-pixel text-xs cursor-pointer pointer-events-auto whitespace-nowrap"
            >
              Pular Abertura [Espaço]
            </button>
          )}
        </div>

        {hud.stage3WrongHandChoicePending ? (
          <div className="w-full px-3 sm:px-6 pb-4 sm:pb-6 flex justify-center pointer-events-auto">
            <div className="w-full max-w-2xl rpg-wood-panel px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <div className="flex flex-col items-center gap-1">
                  <div className="scale-75 sm:scale-90 origin-bottom -mt-3">
                    <SpeakerPortrait speaker="ariel" emotion="happy" />
                  </div>
                  <span className="font-mono-tabular text-[10px] font-bold text-[#5c351e]">
                    Ariel (distraído)
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="scale-75 sm:scale-90 origin-bottom -mt-3">
                    <SpeakerPortrait speaker="laura" emotion="surprised" />
                  </div>
                  <span className="font-mono-tabular text-[10px] font-bold text-[#9e2e24]">
                    Laura (?!)
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="scale-75 sm:scale-90 origin-bottom -mt-3">
                    <SpeakerPortrait speaker="grazi" emotion="amused" />
                  </div>
                  <span className="font-mono-tabular text-[10px] font-bold text-[#9e2e24]">
                    Grazi (rindo)
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="font-display-pixel text-xs sm:text-sm font-bold text-[#9e2e24]">
                  Ariel pegou a mão da Laura sem perceber! O que você faz?
                </div>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-[#5c351e]">
                  Você e Laura trocam um olhar segurando o riso...
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  data-wrong-hand-choice="wait"
                  onClick={() => onChooseWrongHand('wait')}
                  className="rpg-btn-gold px-4 py-2.5 text-left cursor-pointer flex items-center gap-2.5"
                >
                  <span className="font-mono-tabular text-xs font-bold px-1.5 py-0.5 bg-[#3d2111] text-[#ffd166] shrink-0">
                    1
                  </span>
                  <span className="font-display-pixel text-xs sm:text-sm leading-snug">
                    Esperar em silêncio para ver quando ele percebe
                  </span>
                </button>
                <button
                  type="button"
                  data-wrong-hand-choice="tell"
                  onClick={() => onChooseWrongHand('tell')}
                  className="rpg-btn-rose px-4 py-2.5 text-left cursor-pointer flex items-center gap-2.5"
                >
                  <span className="font-mono-tabular text-xs font-bold px-1.5 py-0.5 bg-[#3d2111] text-[#ffe3eb] shrink-0">
                    2
                  </span>
                  <span className="font-display-pixel text-xs sm:text-sm leading-snug">
                    Avisar logo o Ariel que ele pegou a mão errada
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : resolvedSpeakerId ? (
          <div className="w-full flex justify-center pointer-events-auto">
            <div className="w-full max-w-2xl rpg-wood-panel px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3.5">
              <SpeakerPortrait speaker={resolvedSpeakerId} emotion={cap.emotion} />
              <div className="flex-1 min-w-0">
                {cap.speaker && (
                  <div className="font-display-pixel text-xs sm:text-sm font-bold text-[#9e2e24]">
                    {cap.speaker}
                  </div>
                )}
                <p className="mt-1 text-sm sm:text-base font-semibold text-[#3d2111] leading-snug">
                  {cap.speaker && cap.speaker !== 'Grazi & Laura' ? `“${cap.text}”` : cap.text}
                </p>
              </div>
              {cap.canHoldLaugh && (
                <button
                  type="button"
                  data-hold-laugh="true"
                  onClick={onInteractOrAdvance}
                  className="rpg-btn-gold px-3.5 py-2 font-display-pixel text-xs cursor-pointer shrink-0 whitespace-nowrap"
                >
                  Segurar o riso! [Espaço]
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-2xl rpg-wood-panel px-5 py-3 text-center flex flex-col items-center gap-1">
              {cap.speaker && (
                <span className="font-display-pixel text-xs font-bold text-[#9e2e24] tracking-wide">
                  {cap.speaker}
                </span>
              )}
              <p className="text-sm sm:text-base font-semibold text-[#3d2111] leading-snug">
                {cap.speaker ? `“${cap.text}”` : cap.text}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dedicated Stage 2 Animated Cutscene & Ending Overlays
  if (hud.stageId === 'stage-2' && hud.stage2Cutscene !== 'none' && hud.stage2Caption) {
    const cap = hud.stage2Caption;
    const isEnding = hud.stage2Cutscene === 'ending_transition';

    if (isEnding) {
      return (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-between p-4 sm:p-8 pointer-events-none">
          <div className="w-full max-w-2xl flex justify-center">
            <div className="rpg-mahogany-panel px-4 py-2 text-center">
              <div className="font-mono-tabular text-xs font-bold text-[#ffd166]">
                FASE 2 · {cap.badge}
              </div>
            </div>
          </div>

          <div className="pointer-events-auto w-full max-w-xl rpg-wood-panel px-6 py-6 sm:px-8 sm:py-7 text-center flex flex-col items-center gap-5">
            <p className="text-base sm:text-lg font-semibold text-[#3d2111] leading-relaxed">
              &ldquo;{cap.text}&rdquo;
            </p>
            {cap.canFinishEnding && (
              <button
                type="button"
                data-finish-stage2="true"
                onClick={onInteractOrAdvance}
                className="rpg-btn-gold px-6 py-3 font-pixel text-xs sm:text-sm cursor-pointer whitespace-nowrap"
              >
                CONCLUIR FASE 2 [ESPAÇO]
              </button>
            )}
          </div>

          <div className="h-4" />
        </div>
      );
    }

    const s2SpeakerId = cap.speakerId ?? inferSpeakerIdFromLabel(cap.speaker);

    return (
      <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
        {/* Top Carved-Mahogany Cutscene Plaque */}
        <div className="flex items-start justify-between gap-3">
          <div className="rpg-mahogany-panel px-3.5 py-2 pointer-events-auto">
            <div className="font-mono-tabular text-[11px] sm:text-xs font-bold text-[#ffd166] tracking-wide">
              {cap.badge}
            </div>
          </div>
          {cap.canSkipIntro && (
            <button
              type="button"
              data-skip-intro="true"
              onClick={onSkipIntro}
              className="rpg-btn-gold px-3.5 py-2 font-display-pixel text-xs cursor-pointer pointer-events-auto whitespace-nowrap"
            >
              {hud.stage2Cutscene === 'breakdance_circle'
                ? 'Voltar à Pista [Espaço]'
                : 'Pular Abertura [Espaço]'}
            </button>
          )}
        </div>

        {/* Bottom Carved-Wood & Parchment Cutscene Dialogue Box */}
        <div className="w-full flex justify-center">
          {s2SpeakerId ? (
            <div className="w-full max-w-2xl rpg-wood-panel px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-3.5">
              <SpeakerPortrait speaker={s2SpeakerId} emotion={cap.emotion} />
              <div className="flex-1 min-w-0">
                {cap.speaker && (
                  <div className="font-display-pixel text-xs sm:text-sm font-bold text-[#9e2e24]">
                    {cap.speaker}
                  </div>
                )}
                <p className="mt-1 text-sm sm:text-base font-semibold text-[#3d2111] leading-snug">
                  {cap.speaker ? `“${cap.text}”` : cap.text}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl rpg-wood-panel px-5 py-3 text-center flex flex-col items-center gap-1">
              {cap.speaker && (
                <span className="font-display-pixel text-xs font-bold text-[#9e2e24] tracking-wide">
                  {cap.speaker}
                </span>
              )}
              <p className="text-sm sm:text-base font-semibold text-[#3d2111] leading-snug">
                {cap.speaker ? `“${cap.text}”` : cap.text}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dedicated First Kiss Cutscene — Unified Stardew Carved-Wood Overlay
  if (hud.kissCutscene.active) {
    const caption =
      hud.kissCutscene.phase === 'gaze'
        ? 'Eles se olham em silêncio...'
        : hud.kissCutscene.phase === 'lean'
          ? 'Um instante só dos dois...'
          : hud.kissCutscene.phase === 'kiss_silhouette'
            ? '1995 · O Primeiro Beijo'
            : '';

    return (
      <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
        <div className="flex justify-center">
          <div className="rpg-mahogany-panel px-4 py-1.5">
            <span className="font-mono-tabular text-xs font-bold text-[#ffd166] tracking-wide">
              1995 · DISCOTECA CRUZEIRO
            </span>
          </div>
        </div>
        <div className="flex justify-center">
          {caption && (
            <div className="rpg-wood-panel px-5 py-3 max-w-xl text-center">
              <p className="font-display-pixel text-xs sm:text-sm font-bold text-[#9e2e24] tracking-wide">
                {caption}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3-Scene Cinematic Opening Overlays
  if (hud.intro.active) {
    const show1995Splash =
      hud.intro.scene === 'scene1_1995_street' && hud.intro.elapsed < 1.35;

    const sceneCaption =
      hud.intro.scene === 'scene1_1995_street'
        ? 'Ponte do Imaruim, Palhoça · Danceteria Cruzeiro F.C.'
        : hud.intro.scene === 'scene2_arrival'
          ? 'Grazi e sua irmã Laura chegam juntas para a noite de sábado...'
          : 'Lá dentro, a pista já está animada — e um garoto de boné pra trás dança no centro...';

    return (
      <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="rpg-mahogany-panel px-3.5 py-2 pointer-events-auto">
            <div className="font-mono-tabular text-xs font-bold text-[#ffd166]">
              1995 · FASE 1 — ABERTURA
            </div>
            <div className="text-xs sm:text-sm text-[#faeccd]">
              A Dança Que Mudou Tudo
            </div>
          </div>

          <button
            type="button"
            data-skip-intro="true"
            onClick={onSkipIntro}
            className="rpg-btn-gold px-4 py-2 font-display-pixel text-xs cursor-pointer pointer-events-auto whitespace-nowrap"
          >
            Pular Abertura [Espaço]
          </button>
        </div>

        {show1995Splash && (
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="font-pixel text-4xl sm:text-5xl text-[#ffd166] drop-shadow-[0_4px_0_#3b1c0c]">
              1995
            </div>
            <p className="font-display-pixel text-xs sm:text-sm text-[#faeccd] tracking-wider">
              Ponte do Imaruim · Palhoça - SC
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <div className="rpg-wood-panel px-5 py-3 max-w-2xl text-center">
            <p className="text-sm sm:text-base font-semibold text-[#3d2111]">
              {sceneCaption}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
      {/* Top Wooden Objective Plaque + Utility Buttons */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex flex-col gap-2 min-w-0 flex-1 max-w-[56vw] sm:max-w-lg pointer-events-auto">
          <div className="rpg-mahogany-panel px-2.5 py-1.5 sm:px-3.5 sm:py-2">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono-tabular text-[#ffd166] truncate">
              <span>
                {hud.stageId === 'stage-4'
                  ? hud.stage4EraLabel ?? 'FAMÍLIA'
                  : hud.stageId === 'stage-1'
                    ? '1995'
                    : 'ANOS 90'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="sm:hidden">
                {hud.stageId === 'stage-4'
                  ? 'FASE 4'
                  : hud.stageId === 'stage-3'
                    ? 'FASE 3'
                    : hud.stageId === 'stage-2'
                      ? 'FASE 2'
                      : 'FASE 1'}
              </span>
              <span className="hidden sm:inline">
                {hud.stageId === 'stage-4'
                  ? hud.stage4LocationLabel ?? 'FASE 4: NOSSA PEQUENA GRANDE AVENTURA'
                  : hud.stageId === 'stage-3'
                    ? hud.stage3LocationLabel ?? 'FASE 3: DESSA VEZ, PRA FICAR'
                    : hud.stageId === 'stage-2'
                      ? 'FASE 2: ENTRE ENCONTROS E DESENCONTROS'
                      : 'FASE 1: A DANÇA QUE MUDOU TUDO'}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] sm:text-sm font-semibold text-[#faeccd] leading-snug">
              {hud.stage4Objective ?? hud.stage3Objective ?? getObjectiveText(hud.questPhase, hud.stageId)}
            </div>
          </div>

          {hud.stageId === 'stage-4' && hud.stage4BikeActive && (
            <div className="rpg-wood-panel px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs font-semibold text-[#3d2111] flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono-tabular font-bold text-[#9e2e24]">
                  {hud.stage4BikeArrived ? 'CHEGAMOS AO DESTINO ★' : 'TRAJETO DE BICICLETA'}
                </span>
                <span className="font-mono-tabular text-[10px] sm:text-[11px] font-bold text-[#6b3b1e]">
                  {Math.round(hud.stage4BikeProgress * 100)}% · ESCOLA / PONTO
                </span>
              </div>
              <div className="h-2.5 bg-[#4b2816] border border-[#6b3b1e] overflow-hidden">
                <div
                  className="h-full bg-[#ffd166] transition-[width] duration-75"
                  style={{ width: `${Math.max(4, Math.round(hud.stage4BikeProgress * 100))}%` }}
                />
              </div>
              {!hud.stage4BikeArrived && (
                <div className="text-[10px] text-[#5c361e]">
                  Use WASD / Setas para pedalar e guiar pela rua até o ponto de ônibus e a escola
                </div>
              )}
            </div>
          )}

          {hud.stageId === 'stage-4' && hud.questPhase === 's4_build_meia_agua' && (
            <div className="rpg-wood-panel px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[#3d2111] flex items-center justify-between gap-2">
              <span className="font-mono-tabular font-bold text-[#9e2e24]">
                MEIA-ÁGUA: {hud.stage4BuildStage}/3 ETAPAS
              </span>
              {hud.stage4CarryingLabel && (
                <span className="truncate text-[#5c361e]">
                  Levando: {hud.stage4CarryingLabel}
                </span>
              )}
            </div>
          )}

          {hud.stageId === 'stage-3' && hud.questPhase === 's3_moving_day' && (
            <div className="rpg-wood-panel px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[#3d2111] flex items-center justify-between gap-2">
              <span className="font-mono-tabular font-bold text-[#9e2e24]">
                MUDANÇA: {hud.stage3MovingDelivered}/4 NA VARANDA
              </span>
              {hud.stage3CarryingLabel && (
                <span className="truncate text-[#5c361e]">
                  Levando: {hud.stage3CarryingLabel}
                </span>
              )}
            </div>
          )}

          {(hud.stageId === 'stage-2' || hud.stageId === 'stage-3' || hud.stageId === 'stage-4') &&
            hud.recentMemoryTitle && (
              <div className="rpg-wood-panel px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[#3d2111] flex items-center gap-1.5">
                <span className="font-mono-tabular font-bold text-[#9e2e24]">★ LEMBRANÇA:</span>
                <span className="truncate">{hud.recentMemoryTitle}</span>
              </div>
            )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto shrink-0">
          {(hud.stageId === 'stage-2' || hud.stageId === 'stage-3' || hud.stageId === 'stage-4') && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Abrir Álbum de Lembranças"
              title="Álbum de Lembranças"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenMemories();
              }}
              className="h-8 sm:h-10 px-2 sm:px-3 bg-[#4b2816] hover:bg-[#61351e] border-2 sm:border-3 border-[#d49b56] flex items-center gap-1 cursor-pointer text-[#ffd166] font-mono-tabular text-[11px] sm:text-xs font-bold whitespace-nowrap"
            >
              <span aria-hidden="true">★</span>
              <span>
                {hud.unlockedMemoriesCount}/{TOTAL_MEMORIES_COUNT}
              </span>
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            aria-label={muted ? 'Ativar som [M]' : 'Silenciar som [M]'}
            title={muted ? 'Som desligado (M)' : 'Som ligado (M)'}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4b2816] hover:bg-[#61351e] border-2 sm:border-3 border-[#d49b56] flex items-center justify-center cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke={muted ? '#a68b6c' : '#ffd166'} strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill={muted ? 'none' : '#ffd166'} />
              {muted ? (
                <path d="M22 9l-6 6M16 9l6 6" />
              ) : (
                <path d="M15.5 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" />
              )}
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Alternar controles na tela"
            title="Controles na tela"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleTouchControls();
            }}
            className={`w-8 h-8 sm:w-10 sm:h-10 border-2 sm:border-3 flex items-center justify-center cursor-pointer ${
              showTouchControls
                ? 'bg-[#7a4526] border-[#ffd166]'
                : 'bg-[#4b2816] hover:bg-[#61351e] border-[#d49b56]'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke={showTouchControls ? '#ffd166' : '#faeccd'} strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="3" />
              <path d="M6 12h4M8 10v4" />
              <circle cx="16" cy="11" r="1" fill="currentColor" />
              <circle cx="18" cy="13" r="1" fill="currentColor" />
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Reiniciar Fase [R]"
            title="Reiniciar Fase (R)"
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4b2816] hover:bg-[#61351e] border-2 sm:border-3 border-[#d49b56] flex items-center justify-center cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="#faeccd" strokeWidth="2">
              <path d="M3 12a9 9 0 103-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Pausar jogo [P]"
            title="Pausar (P)"
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4b2816] hover:bg-[#61351e] border-2 sm:border-3 border-[#d49b56] flex items-center justify-center cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="#faeccd">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Interactive Region */}
      <div className="flex flex-col gap-3 items-center w-full">
        {/* Slow Romantic Dance HUD */}
        {hud.slowDance.active && (
          <div className="pointer-events-auto w-full max-w-xl rpg-wood-panel px-4 py-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display-pixel text-sm sm:text-base text-[#8c281d]">
                Música Lenta · Abraçadinhos na Pista
              </span>
              <span className="font-mono-tabular text-xs font-bold text-[#6b3b1e]">
                COMPASSO {hud.slowDance.syncHits}/4
              </span>
            </div>

            <div className="relative h-5 bg-[#4b2816] border-2 border-[#6b3b1e] overflow-hidden">
              <div className="absolute inset-y-0 left-[35%] w-[30%] bg-[#d64e6c]/45 border-x border-[#ff8fab]" />
              <div
                ref={beatCursorRef}
                className="absolute inset-y-0 w-2.5 -ml-1 bg-[#ffd166] border border-[#3d2111]"
                style={{ left: `${hud.slowDance.beatCursor * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="font-pixel text-[10px] sm:text-[11px] text-[#9e2e24] min-h-[16px]">
                {hud.slowDance.hitFeedback || 'BALANÇANDO DEVAGAR...'}
              </div>
              <button
                type="button"
                onClick={onInteractOrAdvance}
                className="rpg-btn-rose px-4 py-2 font-pixel text-[10px] sm:text-[11px] cursor-pointer whitespace-nowrap"
              >
                NO COMPASSO [ESPAÇO / A]
              </button>
            </div>
          </div>
        )}

        {/* Stardew-Inspired Wooden & Parchment RPG Dialogue / Thought Window */}
        {hud.activeLine && (
          <button
            type="button"
            onClick={handleDialogueClick}
            className={`pointer-events-auto w-full max-w-2xl text-left p-4 sm:p-5 flex items-start gap-3.5 cursor-pointer ${
              hud.activeLine.speaker === 'grazi_thought' ? 'rpg-thought-panel' : 'rpg-wood-panel'
            }`}
          >
            <SpeakerPortrait
              speaker={normalizeStage4SpeakerId(hud.activeLine.speaker, hud.stageId) ?? hud.activeLine.speaker}
              emotion={hud.activeLine.emotion}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display-pixel text-xs sm:text-sm font-bold text-[#9e2e24]">
                  {hud.activeLine.speakerName}
                </span>
                <span className="font-mono-tabular text-[11px] font-bold text-[#7c4726]">
                  {hud.lineIndex + 1}/{hud.totalLines}
                </span>
              </div>
              <p
                ref={(el) => {
                  textNodeRef.el = el;
                  if (el && isTypingDone) {
                    el.textContent = fullText;
                  }
                }}
                className="mt-1.5 text-sm sm:text-base font-medium text-[#3d2111] leading-relaxed min-h-[3em]"
              />
              <div className="mt-2 text-right font-mono-tabular text-[11px] font-bold text-[#8c4e27]">
                {!isTypingDone ? 'Toque para acelerar' : 'Espaço / Enter / Toque ▼'}
              </div>
            </div>
          </button>
        )}

        {/* Contextual Proximity Prompt */}
        {!hud.activeLine && !hud.slowDance.active && hud.nearestLabel && (
          <button
            type="button"
            onClick={onInteractOrAdvance}
            className="pointer-events-auto rpg-btn-gold px-5 py-2.5 font-display-pixel text-sm cursor-pointer animate-float-gentle"
          >
            [Espaço / A] {hud.nearestLabel}
          </button>
        )}

        {/* Responsive Touch D-Pad & Action Button */}
        {(showTouchControls ||
          hud.questPhase === 'explore_find_laura' ||
          isStage2ExplorationPhase(hud.questPhase) ||
          isStage3ExplorationPhase(hud.questPhase) ||
          isStage4ExplorationPhase(hud.questPhase)) && (
          <div
            className={`w-full flex items-end justify-between gap-4 pt-1 ${
              showTouchControls ? 'flex' : 'flex md:hidden'
            }`}
          >
            <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-[144px] h-[144px]">
              <div />
              <button
                type="button"
                aria-label="Mover para cima"
                onPointerDown={() => onDirectionChange('up')}
                onPointerUp={() => onDirectionChange(null)}
                onPointerLeave={() => onDirectionChange(null)}
                onPointerCancel={() => onDirectionChange(null)}
                className="w-11 h-11 bg-[#4b2816]/90 active:bg-[#f0b23a] text-[#faeccd] active:text-[#321909] border-2 border-[#d49b56] flex items-center justify-center font-bold text-lg select-none"
              >
                ▲
              </button>
              <div />

              <button
                type="button"
                aria-label="Mover para esquerda"
                onPointerDown={() => onDirectionChange('left')}
                onPointerUp={() => onDirectionChange(null)}
                onPointerLeave={() => onDirectionChange(null)}
                onPointerCancel={() => onDirectionChange(null)}
                className="w-11 h-11 bg-[#4b2816]/90 active:bg-[#f0b23a] text-[#faeccd] active:text-[#321909] border-2 border-[#d49b56] flex items-center justify-center font-bold text-lg select-none"
              >
                ◀
              </button>
              <div className="w-11 h-11 bg-[#2c160b]/80 border border-[#7c4726]" />
              <button
                type="button"
                aria-label="Mover para direita"
                onPointerDown={() => onDirectionChange('right')}
                onPointerUp={() => onDirectionChange(null)}
                onPointerLeave={() => onDirectionChange(null)}
                onPointerCancel={() => onDirectionChange(null)}
                className="w-11 h-11 bg-[#4b2816]/90 active:bg-[#f0b23a] text-[#faeccd] active:text-[#321909] border-2 border-[#d49b56] flex items-center justify-center font-bold text-lg select-none"
              >
                ▶
              </button>

              <div />
              <button
                type="button"
                aria-label="Mover para baixo"
                onPointerDown={() => onDirectionChange('down')}
                onPointerUp={() => onDirectionChange(null)}
                onPointerLeave={() => onDirectionChange(null)}
                onPointerCancel={() => onDirectionChange(null)}
                className="w-11 h-11 bg-[#4b2816]/90 active:bg-[#f0b23a] text-[#faeccd] active:text-[#321909] border-2 border-[#d49b56] flex items-center justify-center font-bold text-lg select-none"
              >
                ▼
              </button>
              <div />
            </div>

            <button
              type="button"
              aria-label="Botão de ação e interação"
              onClick={onInteractOrAdvance}
              className="pointer-events-auto rpg-btn-rose w-16 h-16 rounded-full font-pixel text-base flex items-center justify-center select-none"
            >
              A
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
