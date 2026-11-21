import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHUD, type HudSnapshot } from './components/GameHUD';
import { MemoryAlbumModal, PauseModal, VictoryModal } from './components/Modals';
import { TitleScreen } from './components/TitleScreen';
import { retroAudio, type MusicMode } from './game/audio';
import { preloadAllCharacterSkins } from './game/characterSkins';
import { preloadEnvironmentArt } from './game/environmentArt';
import { DISCO_BALL_POS, TILE_SIZE } from './game/mapData';
import {
  advanceDialogue,
  createInitialSimulation,
  createStage2Simulation,
  exitStage2BreakdanceCircle,
  findNearestInteractable,
  finishStage2Ending,
  getStage2CutsceneCaption,
  isStage2CutsceneActive,
  movePlayer,
  skipIntroCutscene,
  startStage2BreakdanceCircle,
  startStage2EloisaCutscene,
  startStage2ForeheadKissCutscene,
  startStage2JealousyCutscene,
  startStage2RetryMontage,
  stepSimulationTimers,
  triggerInteraction,
  triggerSlowDanceBeatInput,
} from './game/rules';
import { renderStage3World } from './game/stage3Renderer';
import {
  advanceStage3WrongHandWaitBeat,
  chooseStage3WrongHandOption,
  createStage3Simulation,
  finishStage3Ending,
  getStage3CutsceneCaption,
  getStage3ObjectiveText,
  isStage3CutsceneActive,
  startStage3EndingCutscene,
  startStage3HotdogCutscene,
  startStage3HotdogExplore,
  startStage3LivingRoomExplore,
  startStage3MovieNightCutscene,
  startStage3MovingCelebration,
  startStage3MovingDay,
  startStage3ProposalCutscene,
  startStage3TogetherCutscene,
  startStage3TravelToHotdog,
  startStage3TravelToLivingRoom,
  startStage3TravelToMoving,
  startStage3TravelToVideoStore,
  startStage3VideoStoreCutscene,
  startStage3VideoStoreExplore,
  startStage3WalkExplore,
  startStage3WrongHandSetup,
} from './game/stage3Rules';
import { renderStage4World } from './game/stage4Renderer';
import {
  S4_BIKE_START_X,
  advanceStage4PregnancyRevealCutscene,
  chooseStage4VideogameOption,
  createStage4Simulation,
  finishStage4Ending,
  getStage4CutsceneCaption,
  getStage4ObjectiveText,
  getStage4PregnancyRevealSnapshot,
  isStage4CutsceneActive,
  startStage4BicycleRide,
  startStage4BirthCutscene,
  startStage4BuildMeiaAgua,
  startStage4CribScene,
  startStage4CristianDanceCutscene,
  startStage4Ending7y,
  startStage4LaborWalk,
  startStage4MaternityTrip,
  startStage4PregnancyReveal,
  startStage4ToddlerHome,
  startStage4VideogameScene,
} from './game/stage4Rules';
import { ParticlePool, renderDiscotecaWorld } from './game/sprites';
import { STAGES, loadProgress, resetProgress, saveProgress } from './game/storage';
import type {
  Direction,
  GameScreenState,
  SavedProgress,
  SimulationState,
  StageId,
} from './game/types';

function getDesiredMusicMode(sim: SimulationState): MusicMode {
  if (sim.slowDance.active || sim.kissCutscene.active || sim.questPhase === 'post_dance_confession') {
    return 'slow_romantic';
  }
  if (sim.stageId === 'stage-2' && sim.stage2) {
    if (sim.stage2.cutscene === 'breakdance_circle') {
      return 'funk';
    }
    if (
      sim.stage2.cutscene === 'intro_memories' ||
      sim.stage2.cutscene === 'jealousy_slow_dance' ||
      sim.stage2.cutscene === 'retry_montage' ||
      sim.stage2.cutscene === 'forehead_kiss_farewell' ||
      sim.stage2.cutscene === 'ending_transition' ||
      sim.questPhase === 's2_farewell_dialogue'
    ) {
      return 'slow_romantic';
    }
    // Play ambient 90s funk when Grazi walks near the Roda de Breakdance on the pista
    const bboy = sim.npcs.find((n) => n.role === 'bboy' && n.visible);
    if (bboy && Math.hypot(sim.player.x - bboy.x, sim.player.y - bboy.y) <= 95) {
      return 'funk';
    }
  }
  if (sim.stageId === 'stage-3' && sim.stage3) {
    if (
      sim.stage3.cutscene === 'moving_proposal' ||
      sim.stage3.cutscene === 'together_montage' ||
      sim.stage3.cutscene === 'movie_night_sofa' ||
      sim.stage3.cutscene === 'ending_together'
    ) {
      return 'slow_romantic';
    }
    return 'afternoon_warm';
  }
  if (sim.stageId === 'stage-4' && sim.stage4) {
    if (
      sim.stage4.cutscene === 'home_routine' ||
      sim.stage4.cutscene === 'pregnancy_reveal' ||
      sim.stage4.cutscene === 'birth_blessing' ||
      sim.stage4.cutscene === 'family_ending_7y'
    ) {
      return 'slow_romantic';
    }
    if (sim.stage4.cutscene === 'cristian_dance') {
      return 'club';
    }
    return 'afternoon_warm';
  }
  return 'club';
}

function buildHudSnapshot(sim: SimulationState): HudSnapshot {
  const nearest = findNearestInteractable(sim);
  return {
    stageId: sim.stageId,
    questPhase: sim.questPhase,
    stage3Objective: sim.stageId === 'stage-3' ? getStage3ObjectiveText(sim) : null,
    stage3LocationLabel: sim.stageId === 'stage-3' ? sim.stage3?.locationLabel ?? null : null,
    intro: sim.intro,
    activeLine: sim.activeDialogue ? sim.activeDialogue.lines[sim.dialogueLineIndex] ?? null : null,
    lineIndex: sim.dialogueLineIndex,
    totalLines: sim.activeDialogue ? sim.activeDialogue.lines.length : 0,
    nearestLabel: nearest ? nearest.label : null,
    slowDance: sim.slowDance,
    kissCutscene: sim.kissCutscene,
    stage2Cutscene: sim.stage2?.cutscene ?? 'none',
    stage2Caption: getStage2CutsceneCaption(sim),
    stage3Cutscene: sim.stage3?.cutscene ?? 'none',
    stage3Caption: getStage3CutsceneCaption(sim),
    stage3WrongHandChoicePending: Boolean(sim.stage3?.wrongHandChoicePending),
    stage3MovingDelivered: sim.stage3?.movingDeliveredCount ?? 0,
    stage3CarryingLabel:
      sim.stage3?.carryingItemId
        ? sim.stage3.movingItems.find((i) => i.id === sim.stage3?.carryingItemId)?.label ?? null
        : null,
    stage4Objective: sim.stageId === 'stage-4' ? getStage4ObjectiveText(sim) : null,
    stage4LocationLabel: sim.stageId === 'stage-4' ? sim.stage4?.locationLabel ?? null : null,
    stage4EraLabel: sim.stageId === 'stage-4' ? sim.stage4?.eraLabel ?? null : null,
    stage4Cutscene: sim.stage4?.cutscene ?? 'none',
    stage4Caption: getStage4CutsceneCaption(sim),
    stage4PregnancyReveal: getStage4PregnancyRevealSnapshot(sim),
    stage4BuildStage: sim.stage4?.buildStage ?? 0,
    stage4CarryingLabel:
      sim.stage4?.carryingMaterialId
        ? sim.stage4.buildTasks.find((t) => t.id === sim.stage4?.carryingMaterialId)?.label ?? null
        : null,
    stage4BikeActive: Boolean(sim.stage4?.bikeRide?.active),
    stage4BikeProgress: sim.stage4?.bikeRide
      ? Math.max(
          0,
          Math.min(
            1,
            (sim.stage4.bikeRide.x - S4_BIKE_START_X) /
              Math.max(1, sim.stage4.bikeRide.destinationX - S4_BIKE_START_X),
          ),
        )
      : 0,
    stage4BikeArrived: Boolean(sim.stage4?.bikeRide?.arrived),
    stage4PuzzleStep: sim.stage4?.gamePuzzleStep ?? 0,
    stage4PuzzlePending: Boolean(sim.stage4?.gamePuzzlePending),
    stage4PuzzleFeedback: sim.stage4?.gamePuzzleFeedback ?? null,
    stage4PuzzlesSolved: sim.stage4?.gamePuzzleSolvedCount ?? 0,
    unlockedMemoriesCount:
      sim.stageId === 'stage-4'
        ? sim.stage4?.unlockedMemories.length ?? 0
        : sim.stageId === 'stage-3'
          ? sim.stage3?.unlockedMemories.length ?? 0
          : sim.stage2?.unlockedMemories.length ?? 0,
    recentMemoryTitle:
      sim.stage4?.recentMemoryTitle ??
      sim.stage3?.recentMemoryTitle ??
      sim.stage2?.recentMemoryTitle ??
      null,
    discoveredCount: sim.discoveredProps.length,
    elapsedSeconds: sim.elapsedSeconds,
  };
}

function createSimulationFromQuery(
  initialStage: StageId,
  unlockedMemories: string[],
  s2SceneParam: string | null,
  s3SceneParam: string | null,
  s4SceneParam: string | null,
): SimulationState {
  if (initialStage === 'stage-4') {
    let sim = createStage4Simulation(
      s4SceneParam !== null && s4SceneParam !== 'pregnancy',
      unlockedMemories,
    );
    if (!s4SceneParam || s4SceneParam === 'pregnancy') return sim;
    if (s4SceneParam === 'moms_house') {
      return { ...sim, activeDialogue: null };
    }
    if (s4SceneParam === 'pregnancy_reveal' || s4SceneParam === 'reveal') {
      return startStage4PregnancyReveal(sim);
    }
    if (s4SceneParam === 'bicycle') {
      return startStage4BicycleRide(sim);
    }
    if (s4SceneParam === 'construction') {
      sim = startStage4BuildMeiaAgua(sim, false);
      if (sim.stage4) {
        sim = { ...sim, stage4: { ...sim.stage4, buildStage: 1 } };
      }
      return sim;
    }
    if (s4SceneParam === 'construction_done') {
      sim = startStage4BuildMeiaAgua(sim, false);
      if (sim.stage4) {
        sim = { ...sim, stage4: { ...sim.stage4, buildStage: 3 } };
      }
      return sim;
    }
    if (s4SceneParam === 'labor') {
      sim = startStage4LaborWalk(sim, false);
      return stepSimulationTimers(sim, 5.2);
    }
    if (s4SceneParam === 'maternity') {
      sim = startStage4MaternityTrip(sim);
      return stepSimulationTimers(sim, 1.8);
    }
    if (s4SceneParam === 'maternity_road') {
      sim = startStage4MaternityTrip(sim);
      return stepSimulationTimers(sim, 6.2);
    }
    if (s4SceneParam === 'maternity_arrival') {
      sim = startStage4MaternityTrip(sim);
      return stepSimulationTimers(sim, 11.4);
    }
    if (s4SceneParam === 'birth') {
      sim = startStage4BirthCutscene(sim);
      return stepSimulationTimers(sim, 3.8);
    }
    if (s4SceneParam === 'crib') {
      sim = startStage4CribScene(sim);
      return stepSimulationTimers(sim, 4.2);
    }
    if (s4SceneParam === 'toddler') {
      return startStage4ToddlerHome(sim, false);
    }
    if (s4SceneParam === 'dance') {
      sim = startStage4CristianDanceCutscene(sim);
      return stepSimulationTimers(sim, 2.2);
    }
    if (s4SceneParam === 'videogame') {
      sim = startStage4VideogameScene(sim);
      return stepSimulationTimers(sim, 0.4);
    }
    if (s4SceneParam === 'ending') {
      sim = startStage4Ending7y(sim);
      return stepSimulationTimers(sim, 2.6);
    }
    return sim;
  }

  if (initialStage === 'stage-3') {
    let sim = createStage3Simulation(s3SceneParam !== null && s3SceneParam !== 'intro', unlockedMemories);
    if (!s3SceneParam || s3SceneParam === 'intro') return sim;
    if (s3SceneParam === 'reunion') return sim;
    if (s3SceneParam === 'together') {
      sim = startStage3TogetherCutscene(sim);
      return stepSimulationTimers(sim, 4.4);
    }
    if (s3SceneParam === 'walk') {
      return startStage3WalkExplore(sim);
    }
    if (s3SceneParam === 'travel_hotdog') {
      sim = startStage3TravelToHotdog(sim);
      return stepSimulationTimers(sim, 1.5);
    }
    if (s3SceneParam === 'hotdog') {
      return startStage3HotdogExplore(sim);
    }
    if (s3SceneParam === 'hotdog_eat') {
      sim = startStage3HotdogExplore(sim);
      sim = startStage3HotdogCutscene(sim);
      return stepSimulationTimers(sim, 1.5);
    }
    if (s3SceneParam === 'hotdog_door') {
      sim = startStage3HotdogExplore(sim);
      if (sim.stage3) {
        sim = {
          ...sim,
          player: { ...sim.player, x: 17.0 * TILE_SIZE, y: 5.4 * TILE_SIZE, dir: 'up' },
          stage3: {
            ...sim.stage3,
            orderedHotdog: true,
            friendsFollowPlayer: true,
            arielFollowsPlayer: true,
            cameraFocusX: 13.5 * TILE_SIZE,
            cameraFocusY: 5.8 * TILE_SIZE,
          },
        };
      }
      return sim;
    }
    if (s3SceneParam === 'travel_videostore') {
      sim = startStage3TravelToVideoStore(sim);
      return stepSimulationTimers(sim, 0.1);
    }
    if (s3SceneParam === 'videostore') {
      return startStage3VideoStoreExplore(sim, false);
    }
    if (s3SceneParam === 'wrong_hand_choice') {
      sim = startStage3VideoStoreExplore(sim, false);
      sim = startStage3WrongHandSetup(sim);
      return stepSimulationTimers(sim, 2.4);
    }
    if (s3SceneParam === 'wrong_hand_wait_reveal') {
      sim = startStage3VideoStoreExplore(sim, false);
      sim = startStage3WrongHandSetup(sim);
      sim = stepSimulationTimers(sim, 2.4);
      sim = chooseStage3WrongHandOption(sim, 'wait');
      return stepSimulationTimers(sim, 3.6);
    }
    if (s3SceneParam === 'videostore_pick') {
      sim = startStage3VideoStoreCutscene(sim);
      return stepSimulationTimers(sim, 1.8);
    }
    if (s3SceneParam === 'travel_livingroom') {
      sim = startStage3TravelToLivingRoom(sim);
      return stepSimulationTimers(sim, 1.5);
    }
    if (s3SceneParam === 'livingroom') {
      return startStage3LivingRoomExplore(sim, false);
    }
    if (s3SceneParam === 'movienight') {
      sim = startStage3MovieNightCutscene(sim);
      return stepSimulationTimers(sim, 2.4);
    }
    if (s3SceneParam === 'travel_moving') {
      sim = startStage3TravelToMoving(sim);
      return stepSimulationTimers(sim, 1.5);
    }
    if (s3SceneParam === 'moving') {
      sim = startStage3MovingDay(sim, false);
      sim = stepSimulationTimers(sim, 1.4);
      if (sim.stage3) {
        sim = {
          ...sim,
          player: { ...sim.player, x: 11.4 * TILE_SIZE, y: 9.6 * TILE_SIZE, dir: 'up' },
          stage3: {
            ...sim.stage3,
            carryingItemId: 'move_books',
            movingDeliveredCount: 1,
            movingItems: sim.stage3.movingItems.map((it) =>
              it.id === 'move_kitchen' ? { ...it, delivered: true } : it,
            ),
          },
        };
      }
      return sim;
    }
    if (s3SceneParam === 'moving_celebration') {
      sim = startStage3MovingCelebration(sim);
      return stepSimulationTimers(sim, 1.5);
    }
    if (s3SceneParam === 'proposal') {
      sim = startStage3ProposalCutscene(sim);
      return stepSimulationTimers(sim, 0.2);
    }
    if (s3SceneParam === 'proposal_hug') {
      sim = startStage3ProposalCutscene(sim);
      return stepSimulationTimers(sim, 3.2);
    }
    if (s3SceneParam === 'ending') {
      sim = startStage3EndingCutscene(sim);
      return stepSimulationTimers(sim, 2.4);
    }
    return sim;
  }

  if (initialStage !== 'stage-2') {
    return createInitialSimulation(true);
  }

  let sim = createStage2Simulation(s2SceneParam !== null && s2SceneParam !== 'intro', unlockedMemories);
  if (!s2SceneParam || s2SceneParam === 'intro') {
    return sim;
  }
  if (s2SceneParam === 'eloisa') {
    sim = startStage2EloisaCutscene(sim);
    return stepSimulationTimers(sim, 3.0);
  }
  if (s2SceneParam === 'after_eloisa') {
    sim = startStage2EloisaCutscene(sim);
    return stepSimulationTimers(sim, 8.2);
  }
  if (s2SceneParam === 'jealousy') {
    sim = startStage2JealousyCutscene(sim);
    return stepSimulationTimers(sim, 6.4);
  }
  if (s2SceneParam === 'jealousy_wide') {
    sim = startStage2JealousyCutscene(sim);
    return stepSimulationTimers(sim, 1.4);
  }
  if (s2SceneParam === 'breakdance') {
    sim = startStage2BreakdanceCircle(sim);
    return stepSimulationTimers(sim, 4.1);
  }
  if (s2SceneParam === 'breakdance_freeze') {
    sim = startStage2BreakdanceCircle(sim);
    return stepSimulationTimers(sim, 5.5);
  }
  if (s2SceneParam === 'retry') {
    sim = startStage2RetryMontage(sim);
    return stepSimulationTimers(sim, 4.2);
  }
  if (s2SceneParam === 'avoidance') {
    sim = startStage2RetryMontage(sim);
    return stepSimulationTimers(sim, 9.0);
  }
  if (s2SceneParam === 'forehead') {
    sim = startStage2ForeheadKissCutscene(sim);
    return stepSimulationTimers(sim, 3.2);
  }
  if (s2SceneParam === 'farewell_line') {
    sim = startStage2ForeheadKissCutscene(sim);
    return stepSimulationTimers(sim, 6.2);
  }
  if (s2SceneParam === 'ending') {
    sim = startStage2ForeheadKissCutscene(sim);
    sim = stepSimulationTimers(sim, 11.4);
    return stepSimulationTimers(sim, 2.2);
  }
  if (s2SceneParam === 'explore') {
    return {
      ...sim,
      player: { ...sim.player, x: 5.5 * TILE_SIZE, y: 11.4 * TILE_SIZE, dir: 'up' },
    };
  }
  if (s2SceneParam === 'dj_concrete') {
    return {
      ...sim,
      player: { ...sim.player, x: 9.8 * TILE_SIZE, y: 4.5 * TILE_SIZE, dir: 'up' },
    };
  }
  return sim;
}

export default function App() {
  const params =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const autostart = params?.get('autostart') === '1';
  const stageParam = params?.get('stage');
  const queryStage: StageId =
    stageParam === '4'
      ? 'stage-4'
      : stageParam === '3'
        ? 'stage-3'
        : stageParam === '2'
          ? 'stage-2'
          : 'stage-1';
  const s2SceneParam = params?.get('s2scene') ?? null;
  const s3SceneParam = params?.get('s3scene') ?? null;
  const s4SceneParam = params?.get('s4scene') ?? null;

  const initialProgress = loadProgress();
  const [screenState, setScreenState] = useState<GameScreenState>(autostart ? 'playing' : 'title');
  const [activeStageId, setActiveStageId] = useState<StageId>(queryStage);
  const [progress, setProgress] = useState<SavedProgress>(initialProgress);
  const [muted, setMuted] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(false);
  const [showMemoryAlbum, setShowMemoryAlbum] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const beatCursorRef = useRef<HTMLDivElement | null>(null);

  const screenRef = useRef<GameScreenState>(screenState);
  const activeStageRef = useRef<StageId>(activeStageId);
  const progressRef = useRef<SavedProgress>(progress);
  const simRef = useRef<SimulationState>(
    autostart
      ? createSimulationFromQuery(
          queryStage,
          initialProgress.unlockedMemories,
          s2SceneParam,
          s3SceneParam,
          s4SceneParam,
        )
      : createInitialSimulation(true),
  );
  const particlesRef = useRef<ParticlePool>(new ParticlePool());
  const keysHeldRef = useRef<Set<string>>(new Set());
  const touchDirRef = useRef<Direction | null>(null);
  const lastHudSigRef = useRef<string>('');
  const completionSavedRef = useRef(false);

  const [hud, setHud] = useState<HudSnapshot>(() => buildHudSnapshot(simRef.current));

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const persistUnlockedMemories = useCallback((memories: string[]) => {
    setProgress((prev) => {
      const merged = Array.from(new Set([...prev.unlockedMemories, ...memories]));
      if (merged.length === prev.unlockedMemories.length) return prev;
      const updated: SavedProgress = { ...prev, unlockedMemories: merged };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const completeActiveStage = useCallback((completedSim: SimulationState) => {
    retroAudio.setMusicMode('off');
    retroAudio.playStageClear();

    if (!completionSavedRef.current) {
      completionSavedRef.current = true;
      setProgress((prev) => {
        const isStage1 = completedSim.stageId === 'stage-1';
        const isStage2 = completedSim.stageId === 'stage-2';
        const isStage3 = completedSim.stageId === 'stage-3';
        const isStage4 = completedSim.stageId === 'stage-4';
        const updated: SavedProgress = {
          stage1Completed: prev.stage1Completed || isStage1,
          stage2Completed: prev.stage2Completed || isStage2,
          stage3Completed: prev.stage3Completed || isStage3,
          stage4Completed: prev.stage4Completed || isStage4,
          bestDanceSync: isStage1
            ? Math.max(prev.bestDanceSync, completedSim.slowDance.syncHits)
            : prev.bestDanceSync,
          totalPlays: prev.totalPlays + 1,
          discoveredProps: Array.from(
            new Set([...prev.discoveredProps, ...completedSim.discoveredProps]),
          ),
          unlockedMemories: Array.from(
            new Set([
              ...prev.unlockedMemories,
              ...(completedSim.stage2?.unlockedMemories ?? []),
              ...(completedSim.stage3?.unlockedMemories ?? []),
              ...(completedSim.stage4?.unlockedMemories ?? []),
            ]),
          ),
          lastCompletedAt: new Date().toISOString(),
        };
        saveProgress(updated);
        return updated;
      });
    }

    screenRef.current = 'gameover';
    document.body.dataset.state = 'gameover';
    setScreenState('gameover');
  }, []);

  const syncHudIfChanged = useCallback((force = false) => {
    const nextHud = buildHudSnapshot(simRef.current);
    const show1995 =
      nextHud.intro.active &&
      nextHud.intro.scene === 'scene1_1995_street' &&
      nextHud.intro.elapsed < 1.35
        ? 1
        : 0;

    const sig = [
      nextHud.stageId,
      nextHud.questPhase,
      nextHud.intro.active ? 1 : 0,
      nextHud.intro.scene,
      show1995,
      nextHud.activeLine?.id ?? '',
      nextHud.lineIndex,
      nextHud.nearestLabel ?? '',
      nextHud.slowDance.active ? 1 : 0,
      nextHud.slowDance.syncHits,
      nextHud.slowDance.hitFeedback,
      nextHud.kissCutscene.active ? 1 : 0,
      nextHud.kissCutscene.phase,
      nextHud.stage2Cutscene,
      nextHud.stage2Caption?.text ?? '',
      nextHud.stage2Caption?.canFinishEnding ? 1 : 0,
      nextHud.stage3Cutscene,
      nextHud.stage3Caption?.text ?? '',
      nextHud.stage3Caption?.canFinishEnding ? 1 : 0,
      nextHud.stage3WrongHandChoicePending ? 1 : 0,
      nextHud.stage3MovingDelivered,
      nextHud.stage3CarryingLabel ?? '',
      nextHud.stage3Objective ?? '',
      nextHud.stage3LocationLabel ?? '',
      nextHud.stage4Cutscene,
      nextHud.stage4Caption?.text ?? '',
      nextHud.stage4Caption?.canFinishEnding ? 1 : 0,
      nextHud.stage4PregnancyReveal?.stepIndex ?? -1,
      nextHud.stage4PregnancyReveal?.visibleText.length ?? 0,
      nextHud.stage4PregnancyReveal?.activePortraitKey ?? '',
      nextHud.stage4PregnancyReveal?.canAdvanceNow ? 1 : 0,
      nextHud.stage4BuildStage,
      nextHud.stage4CarryingLabel ?? '',
      nextHud.stage4BikeActive ? 1 : 0,
      Math.round(nextHud.stage4BikeProgress * 50),
      nextHud.stage4BikeArrived ? 1 : 0,
      nextHud.stage4PuzzleStep,
      nextHud.stage4PuzzlePending ? 1 : 0,
      nextHud.stage4PuzzleFeedback ?? '',
      nextHud.stage4PuzzlesSolved,
      nextHud.stage4Objective ?? '',
      nextHud.stage4LocationLabel ?? '',
      nextHud.stage4EraLabel ?? '',
      nextHud.unlockedMemoriesCount,
      nextHud.recentMemoryTitle ?? '',
      nextHud.discoveredCount,
    ].join('|');

    if (force || sig !== lastHudSigRef.current) {
      lastHudSigRef.current = sig;
      setHud(nextHud);
    }
  }, []);

  useEffect(() => {
    preloadAllCharacterSkins();
  }, []);

  useEffect(() => {
    screenRef.current = screenState;
    document.body.dataset.state = screenState;

    if (screenState === 'playing') {
      retroAudio.setMusicMode(getDesiredMusicMode(simRef.current));
    } else {
      retroAudio.setMusicMode('off');
    }
  }, [screenState]);

  const startOrRestartStage = useCallback(
    (stageId: StageId, skipIntro = false) => {
      retroAudio.unlock();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      keysHeldRef.current.clear();
      touchDirRef.current = null;
      completionSavedRef.current = false;
      setShowMemoryAlbum(false);
      particlesRef.current.reset();

      activeStageRef.current = stageId;
      setActiveStageId(stageId);

      simRef.current =
        stageId === 'stage-4'
          ? createStage4Simulation(skipIntro, progressRef.current.unlockedMemories)
          : stageId === 'stage-3'
            ? createStage3Simulation(skipIntro, progressRef.current.unlockedMemories)
            : stageId === 'stage-2'
              ? createStage2Simulation(skipIntro, progressRef.current.unlockedMemories)
              : createInitialSimulation(skipIntro);

      screenRef.current = 'playing';
      document.body.dataset.state = 'playing';
      setScreenState('playing');
      syncHudIfChanged(true);
      if (!skipIntro) {
        retroAudio.playBootChime();
      }
      retroAudio.setMusicMode(getDesiredMusicMode(simRef.current));
    },
    [syncHudIfChanged],
  );

  const handleSkipIntro = useCallback(() => {
    if (simRef.current.stage2?.cutscene === 'breakdance_circle') {
      simRef.current = exitStage2BreakdanceCircle(simRef.current);
    } else {
      simRef.current = skipIntroCutscene(simRef.current);
    }
    retroAudio.playInteract();
    retroAudio.setMusicMode(getDesiredMusicMode(simRef.current));
    syncHudIfChanged(true);
  }, [syncHudIfChanged]);

  const handleChooseWrongHand = useCallback(
    (choice: 'wait' | 'tell') => {
      retroAudio.unlock();
      simRef.current = chooseStage3WrongHandOption(simRef.current, choice);
      retroAudio.playInteract();
      syncHudIfChanged(true);
    },
    [syncHudIfChanged],
  );

  const handleChooseStage4Puzzle = useCallback(
    (option: 'A' | 'B') => {
      retroAudio.unlock();
      const prevSolved = simRef.current.stage4?.gamePuzzleSolvedCount ?? 0;
      const nextSim = chooseStage4VideogameOption(simRef.current, option);
      simRef.current = nextSim;
      if ((nextSim.stage4?.gamePuzzleSolvedCount ?? 0) > prevSolved) {
        retroAudio.playSlowDanceChime();
      } else {
        retroAudio.playInteract();
      }
      if (nextSim.stage4) {
        persistUnlockedMemories(nextSim.stage4.unlockedMemories);
      }
      syncHudIfChanged(true);
    },
    [persistUnlockedMemories, syncHudIfChanged],
  );

  const handleExitToTitle = useCallback(() => {
    keysHeldRef.current.clear();
    touchDirRef.current = null;
    setShowMemoryAlbum(false);
    simRef.current = createInitialSimulation(true);
    screenRef.current = 'title';
    document.body.dataset.state = 'title';
    setScreenState('title');
    retroAudio.setMusicMode('off');
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = retroAudio.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      retroAudio.unlock();
      if (screenRef.current === 'playing') {
        retroAudio.setMusicMode(getDesiredMusicMode(simRef.current));
      }
    }
  }, []);

  const handleInteractOrAdvance = useCallback(() => {
    retroAudio.unlock();
    const sim = simRef.current;

    if (showMemoryAlbum) {
      setShowMemoryAlbum(false);
      return;
    }

    if (screenRef.current === 'title') {
      startOrRestartStage('stage-1', false);
      return;
    }
    if (screenRef.current !== 'playing') return;

    if (
      sim.intro.active ||
      sim.stage2?.cutscene === 'intro_memories' ||
      sim.stage2?.cutscene === 'breakdance_circle' ||
      sim.stage3?.cutscene === 'time_passage' ||
      sim.stage4?.cutscene === 'home_routine'
    ) {
      handleSkipIntro();
      return;
    }

    if (sim.stage2?.cutscene === 'ending_transition') {
      if (sim.stage2.endingReadyToFinish) {
        const finished = finishStage2Ending(sim);
        simRef.current = finished;
        completeActiveStage(finished);
        syncHudIfChanged(true);
      }
      return;
    }

    if (sim.stage3?.cutscene === 'ending_together') {
      if (sim.stage3.endingReadyToFinish) {
        const finished = finishStage3Ending(sim);
        simRef.current = finished;
        completeActiveStage(finished);
        syncHudIfChanged(true);
      }
      return;
    }

    if (sim.stage4?.cutscene === 'family_ending_7y') {
      if (sim.stage4.endingReadyToFinish) {
        const finished = finishStage4Ending(sim);
        simRef.current = finished;
        completeActiveStage(finished);
        syncHudIfChanged(true);
      }
      return;
    }

    if (
      sim.stage3?.cutscene === 'videostore_wrong_hand_wait' &&
      sim.stage3.cutsceneElapsed < 3.0
    ) {
      simRef.current = advanceStage3WrongHandWaitBeat(sim);
      retroAudio.playInteract();
      syncHudIfChanged(true);
      return;
    }

    if (sim.stage4?.cutscene === 'pregnancy_reveal') {
      const nextSim = advanceStage4PregnancyRevealCutscene(sim);
      if (nextSim !== sim) {
        simRef.current = nextSim;
        retroAudio.playInteract();
        if (nextSim.stage4) {
          persistUnlockedMemories(nextSim.stage4.unlockedMemories);
        }
        retroAudio.setMusicMode(getDesiredMusicMode(nextSim));
        syncHudIfChanged(true);
      }
      return;
    }

    if (sim.activeDialogue) {
      const nextSim = advanceDialogue(sim);
      simRef.current = nextSim;
      retroAudio.playInteract();

      if (nextSim.stage3) {
        persistUnlockedMemories(nextSim.stage3.unlockedMemories);
      }
      if (nextSim.stage4) {
        persistUnlockedMemories(nextSim.stage4.unlockedMemories);
      }

      if (nextSim.questPhase === 'stage_complete') {
        completeActiveStage(nextSim);
      } else {
        retroAudio.setMusicMode(getDesiredMusicMode(nextSim));
      }
      syncHudIfChanged(true);
      return;
    }

    if (
      sim.questPhase === 'ariel_approaching' ||
      sim.kissCutscene.active ||
      isStage2CutsceneActive(sim) ||
      isStage3CutsceneActive(sim) ||
      isStage4CutsceneActive(sim)
    ) {
      return;
    }

    if (sim.slowDance.active) {
      const { next } = triggerSlowDanceBeatInput(sim);
      simRef.current = next;
      retroAudio.playSlowDanceChime();
      for (let i = 0; i < 4; i++) {
        particlesRef.current.spawn(
          'heart',
          DISCO_BALL_POS.x + (Math.random() - 0.5) * 36,
          DISCO_BALL_POS.y - 26,
          (Math.random() - 0.5) * 16,
          -22 - Math.random() * 16,
          1.25,
          '#ff7597',
        );
      }
      syncHudIfChanged(true);
      return;
    }

    const { next, target } = triggerInteraction(sim);
    if (target) {
      simRef.current = next;
      retroAudio.playInteract();
      if (next.stage2 && (target.type === 'memory' || next.stage2.cutscene === 'breakdance_circle')) {
        retroAudio.playSlowDanceChime();
        persistUnlockedMemories(next.stage2.unlockedMemories);
      }
      if (next.stage3) {
        if (target.type === 'memory' || target.id === 's3_drop_porch') {
          retroAudio.playSlowDanceChime();
        }
        persistUnlockedMemories(next.stage3.unlockedMemories);
      }
      if (next.stage4) {
        if (target.type === 'memory' || target.id === 's4_build_deliver') {
          retroAudio.playSlowDanceChime();
        }
        persistUnlockedMemories(next.stage4.unlockedMemories);
      }
      retroAudio.setMusicMode(getDesiredMusicMode(next));
      syncHudIfChanged(true);
    }
  }, [
    completeActiveStage,
    handleSkipIntro,
    persistUnlockedMemories,
    showMemoryAlbum,
    startOrRestartStage,
    syncHudIfChanged,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'spacebar'].includes(key)) {
        e.preventDefault();
      }

      if (e.repeat) {
        keysHeldRef.current.add(key);
        return;
      }

      if (key === 'm') {
        handleToggleMute();
        return;
      }

      if (key === 'r' && screenRef.current === 'playing' && !showMemoryAlbum) {
        startOrRestartStage(activeStageRef.current, true);
        return;
      }

      if (key === 'p' || key === 'escape') {
        if (showMemoryAlbum) {
          setShowMemoryAlbum(false);
          return;
        }
        if (screenRef.current === 'playing') {
          keysHeldRef.current.clear();
          screenRef.current = 'paused';
          document.body.dataset.state = 'paused';
          setScreenState('paused');
        } else if (screenRef.current === 'paused') {
          screenRef.current = 'playing';
          document.body.dataset.state = 'playing';
          setScreenState('playing');
        }
        return;
      }

      if (simRef.current.stage3?.wrongHandChoicePending && screenRef.current === 'playing') {
        if (key === '1') {
          handleChooseWrongHand('wait');
          return;
        }
        if (key === '2') {
          handleChooseWrongHand('tell');
          return;
        }
      }

      if (simRef.current.stage4?.gamePuzzlePending && screenRef.current === 'playing') {
        if (key === '1') {
          handleChooseStage4Puzzle('A');
          return;
        }
        if (key === '2') {
          handleChooseStage4Puzzle('B');
          return;
        }
      }

      if (key === ' ' || key === 'enter' || key === 'e') {
        handleInteractOrAdvance();
        return;
      }

      keysHeldRef.current.add(key);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.key.toLowerCase());
    };

    const clearHeldInputs = () => {
      keysHeldRef.current.clear();
      touchDirRef.current = null;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeldInputs);
    document.addEventListener('visibilitychange', clearHeldInputs);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeldInputs);
      document.removeEventListener('visibilitychange', clearHeldInputs);
    };
  }, [
    handleChooseStage4Puzzle,
    handleChooseWrongHand,
    handleInteractOrAdvance,
    handleToggleMute,
    showMemoryAlbum,
    startOrRestartStage,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let viewW = container.clientWidth || 1280;
    let viewH = container.clientHeight || 720;

    preloadEnvironmentArt();

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const rawW = Math.max(320, Math.round(rect.width));
      const rawH = Math.max(240, Math.round(rect.height));
      const downscale = rawW > 1280 ? 1280 / rawW : 1;
      viewW = Math.round(rawW * downscale);
      viewH = Math.round(rawH * downscale);
      canvas.width = viewW;
      canvas.height = viewH;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);

    let rafId = 0;
    let lastTime = performance.now();
    let sparkleAcc = 0;
    let heartAcc = 0;

    const frame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0), 0.08);

      const currentScreen = screenRef.current;

      if (currentScreen === 'title') {
        simRef.current = {
          ...simRef.current,
          elapsedSeconds: simRef.current.elapsedSeconds + dt,
          beatTimer: (simRef.current.beatTimer + dt * 1.4) % 1,
        };
      } else if (currentScreen === 'playing') {
        const prevPhase = simRef.current.questPhase;
        const prevKissPhase = simRef.current.kissCutscene.phase;
        const prevIntroScene = simRef.current.intro.scene;
        const prevS2Cutscene = simRef.current.stage2?.cutscene ?? 'none';
        const prevS3Cutscene = simRef.current.stage3?.cutscene ?? 'none';
        const prevS4Cutscene = simRef.current.stage4?.cutscene ?? 'none';
        const prevMusicMode = getDesiredMusicMode(simRef.current);
        const prevRevealSnap = getStage4PregnancyRevealSnapshot(simRef.current);

        const keys = keysHeldRef.current;
        let ix = 0;
        let iy = 0;
        if (keys.has('arrowleft') || keys.has('a') || touchDirRef.current === 'left') ix -= 1;
        if (keys.has('arrowright') || keys.has('d') || touchDirRef.current === 'right') ix += 1;
        if (keys.has('arrowup') || keys.has('w') || touchDirRef.current === 'up') iy -= 1;
        if (keys.has('arrowdown') || keys.has('s') || touchDirRef.current === 'down') iy += 1;

        let nextSim = movePlayer(simRef.current, ix, iy, dt);
        nextSim = stepSimulationTimers(nextSim, dt);
        simRef.current = nextSim;

        const nextMusicMode = getDesiredMusicMode(nextSim);
        if (prevMusicMode !== nextMusicMode) {
          retroAudio.setMusicMode(nextMusicMode);
        }

        if (nextSim.stageId === 'stage-4' && nextSim.stage4?.cutscene === 'pregnancy_reveal') {
          const nextSnap = getStage4PregnancyRevealSnapshot(nextSim);
          if (nextSnap) {
            const dyn = nextSnap.step.effects.musicDynamic;
            if (dyn === 'swell') {
              retroAudio.setMusicVolumeScale(1.22);
            } else if (dyn === 'fade_out') {
              retroAudio.setMusicVolumeScale(Math.max(0.08, 1.0 - nextSnap.stepProgress * 0.92));
            } else {
              retroAudio.setMusicVolumeScale(0.75);
            }
            if (
              nextSnap.activeSpeaker &&
              nextSnap.visibleText.length > (prevRevealSnap?.visibleText.length ?? 0) &&
              nextSnap.visibleText.length % 2 === 1
            ) {
              retroAudio.playSpeechBlip(nextSnap.activeSpeaker);
            }
            if (nextSnap.step.effects.fireflies && Math.random() < dt * 8) {
              particlesRef.current.spawn(
                'sparkle',
                nextSim.stage4.cameraFocusX + (Math.random() - 0.5) * 140,
                nextSim.stage4.cameraFocusY + 28 + (Math.random() - 0.5) * 24,
                (Math.random() - 0.5) * 8,
                -16 - Math.random() * 10,
                1.6,
                '#ffe28a',
              );
            }
          }
        } else {
          retroAudio.setMusicVolumeScale(1.0);
        }

        if (
          prevPhase !== nextSim.questPhase ||
          prevKissPhase !== nextSim.kissCutscene.phase ||
          prevIntroScene !== nextSim.intro.scene ||
          prevS2Cutscene !== (nextSim.stage2?.cutscene ?? 'none') ||
          prevS3Cutscene !== (nextSim.stage3?.cutscene ?? 'none') ||
          prevS4Cutscene !== (nextSim.stage4?.cutscene ?? 'none')
        ) {
          syncHudIfChanged(true);
        } else {
          syncHudIfChanged(false);
        }

        if (nextSim.slowDance.active && beatCursorRef.current) {
          beatCursorRef.current.style.left = `${(nextSim.slowDance.beatCursor * 100).toFixed(1)}%`;
        }

        const spawnWarmHearts =
          nextSim.slowDance.active ||
          nextSim.kissCutscene.active ||
          (nextSim.stage2?.cutscene === 'intro_memories' && nextSim.stage2.cutsceneElapsed < 7.0) ||
          (nextSim.stage2?.cutscene === 'retry_montage' &&
            nextSim.stage2.cutsceneElapsed >= 3.2 &&
            nextSim.stage2.cutsceneElapsed < 6.2) ||
          nextSim.stage3?.cutscene === 'moving_proposal' ||
          nextSim.stage3?.cutscene === 'together_montage' ||
          nextSim.stage3?.cutscene === 'ending_together' ||
          nextSim.stage4?.cutscene === 'home_routine' ||
          nextSim.stage4?.cutscene === 'birth_blessing' ||
          nextSim.stage4?.cutscene === 'cristian_dance' ||
          nextSim.stage4?.cutscene === 'family_ending_7y';

        if (spawnWarmHearts) {
          heartAcc += dt;
          if (heartAcc >= 0.55) {
            heartAcc = 0;
            const heartX =
              nextSim.stageId === 'stage-4' && nextSim.stage4
                ? nextSim.stage4.cameraFocusX
                : nextSim.stageId === 'stage-3' && nextSim.stage3
                  ? nextSim.stage3.cameraFocusX
                  : DISCO_BALL_POS.x;
            const heartY =
              nextSim.stageId === 'stage-4' && nextSim.stage4
                ? nextSim.stage4.cameraFocusY - 26
                : nextSim.stageId === 'stage-3' && nextSim.stage3
                  ? nextSim.stage3.cameraFocusY - 26
                  : DISCO_BALL_POS.y - 28;
            particlesRef.current.spawn(
              'heart',
              heartX + (Math.random() - 0.5) * 28,
              heartY,
              (Math.random() - 0.5) * 12,
              -18,
              1.4,
              '#ff8fab',
            );
          }
        }
      }

      sparkleAcc += dt;
      if (sparkleAcc >= 0.16) {
        sparkleAcc = 0;
        const colors = ['#ffd166', '#5bd1c5', '#ff7597', '#fff6dc'];
        const spX =
          simRef.current.stageId === 'stage-3' || simRef.current.stageId === 'stage-4'
            ? simRef.current.player.x
            : DISCO_BALL_POS.x;
        const spY =
          simRef.current.stageId === 'stage-3' || simRef.current.stageId === 'stage-4'
            ? simRef.current.player.y
            : DISCO_BALL_POS.y;
        particlesRef.current.spawn(
          'sparkle',
          spX + (Math.random() - 0.5) * 190,
          spY + (Math.random() - 0.5) * 120,
          (Math.random() - 0.5) * 10,
          -6,
          0.9,
          colors[Math.floor(Math.random() * colors.length)],
        );
      }

      if (currentScreen !== 'paused') {
        particlesRef.current.update(dt);
        if (simRef.current.stageId === 'stage-4' && currentScreen !== 'title') {
          renderStage4World(ctx, simRef.current, particlesRef.current, viewW, viewH);
        } else if (simRef.current.stageId === 'stage-3' && currentScreen !== 'title') {
          renderStage3World(ctx, simRef.current, particlesRef.current, viewW, viewH);
        } else {
          renderDiscotecaWorld(
            ctx,
            simRef.current,
            particlesRef.current,
            viewW,
            viewH,
            currentScreen === 'title',
          );
        }
      }

      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [syncHudIfChanged]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#1c120d] select-none">
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        aria-label="Discoteca Cruzeiro — Cenário do jogo"
        className="block w-full h-full pixelated"
      />

      {screenState === 'title' && (
        <TitleScreen
          progress={progress}
          stages={STAGES}
          onStartStage={(stageId) => startOrRestartStage(stageId, false)}
          onOpenMemories={() => setShowMemoryAlbum(true)}
          onResetProgress={() => setProgress(resetProgress())}
        />
      )}

      {screenState === 'playing' && (
        <GameHUD
          hud={hud}
          muted={muted}
          showTouchControls={showTouchControls}
          beatCursorRef={beatCursorRef}
          onToggleMute={handleToggleMute}
          onToggleTouchControls={() => setShowTouchControls((v) => !v)}
          onOpenMemories={() => setShowMemoryAlbum(true)}
          onPause={() => {
            keysHeldRef.current.clear();
            setScreenState('paused');
          }}
          onRestart={() => startOrRestartStage(activeStageId, true)}
          onSkipIntro={handleSkipIntro}
          onInteractOrAdvance={handleInteractOrAdvance}
          onChooseWrongHand={handleChooseWrongHand}
          onChooseStage4Puzzle={handleChooseStage4Puzzle}
          onDirectionChange={(dir) => {
            touchDirRef.current = dir;
          }}
        />
      )}

      {screenState === 'paused' && (
        <PauseModal
          stageId={activeStageId}
          onResume={() => setScreenState('playing')}
          onRestart={() => startOrRestartStage(activeStageId, true)}
          onOpenMemories={() => setShowMemoryAlbum(true)}
          onExitToTitle={handleExitToTitle}
        />
      )}

      {screenState === 'gameover' && (
        <VictoryModal
          stageId={activeStageId}
          syncHits={hud.slowDance.syncHits}
          discoveredCount={hud.discoveredCount}
          unlockedMemoriesCount={progress.unlockedMemories.length}
          movingDeliveredCount={hud.stage3MovingDelivered}
          stage4PuzzlesSolved={hud.stage4PuzzlesSolved}
          elapsedSeconds={hud.elapsedSeconds}
          progress={progress}
          onPlayAgain={() => startOrRestartStage(activeStageId, false)}
          onContinueToStage2={() => startOrRestartStage('stage-2', false)}
          onContinueToStage3={() => startOrRestartStage('stage-3', false)}
          onContinueToStage4={() => startOrRestartStage('stage-4', false)}
          onOpenMemories={() => setShowMemoryAlbum(true)}
          onExitToTitle={handleExitToTitle}
        />
      )}

      {showMemoryAlbum && (
        <MemoryAlbumModal
          unlockedMemories={progress.unlockedMemories}
          onClose={() => setShowMemoryAlbum(false)}
        />
      )}
    </div>
  );
}
