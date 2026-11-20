export type GameScreenState = 'title' | 'playing' | 'paused' | 'gameover';

export type Direction = 'down' | 'up' | 'left' | 'right';

export type StageId = 'stage-1' | 'stage-2' | 'stage-3' | 'stage-4';

export type QuestPhase =
  | 'intro_1995_street'
  | 'intro_arrival'
  | 'intro_interior_pan'
  | 'explore_find_laura'
  | 'ariel_approaching'
  | 'ready_to_dance_ariel'
  | 'slow_dance'
  | 'kiss_cutscene'
  | 'post_dance_confession'
  | 'stage_complete'
  // Stage 2: Entre Encontros e Desencontros
  | 's2_intro_memories'
  | 's2_explore_reunion'
  | 's2_cutscene_eloisa'
  | 's2_explore_jealousy'
  | 's2_cutscene_jealousy'
  | 's2_cutscene_retry'
  | 's2_explore_avoidance'
  | 's2_farewell_dialogue'
  | 's2_cutscene_forehead_kiss'
  | 's2_ending_transition'
  // Stage 3: Dessa Vez, Pra Ficar (5-environment RPG journey)
  | 's3_intro_time'
  | 's3_explore_reunion'
  | 's3_cutscene_together'
  | 's3_explore_walk'
  | 's3_travel_hotdog'
  | 's3_explore_hotdog'
  | 's3_cutscene_hotdog'
  | 's3_travel_videostore'
  | 's3_explore_videostore'
  | 's3_cutscene_videostore'
  | 's3_travel_livingroom'
  | 's3_explore_livingroom'
  | 's3_cutscene_movienight'
  | 's3_travel_moving'
  | 's3_moving_day'
  | 's3_cutscene_moving_celebration'
  | 's3_cutscene_proposal'
  | 's3_ending_together'
  // Stage 4: Nossa Pequena Grande Aventura (Pregnancy to Cristian ~7 years old)
  | 's4_intro_pregnancy'
  | 's4_explore_moms_house'
  | 's4_ride_bicycle'
  | 's4_cutscene_bicycle'
  | 's4_explore_labor_walk'
  | 's4_cutscene_labor_walk'
  | 's4_cutscene_maternity_trip'
  | 's4_cutscene_birth'
  | 's4_cutscene_crib'
  | 's4_build_meia_agua'
  | 's4_explore_toddler_home'
  | 's4_cutscene_cristian_dance'
  | 's4_videogame_interactive'
  | 's4_ending_family_7y';

export type ArielActivity =
  | 'breakdance_cap'
  | 'walking_to_grazi'
  | 'waiting_invite'
  | 'slow_dancing'
  | 'kissing'
  | 'standing'
  | 'jealous_watching'
  | 'avoiding_grazi';

export type SpeakerId =
  | 'grazi'
  | 'grazi_thought'
  | 'grazi_adult'
  | 'laura'
  | 'ariel'
  | 'ariel_adult'
  | 'cristian'
  | 'nani'
  | 'bar_man'
  | 'leo'
  | 'junior'
  | 'dj'
  | 'bartender'
  | 'vendor'
  | 'clerk'
  | 'bboy'
  | 'teen_group'
  | 'friend'
  | 'narrator';

export type CharacterEmotion =
  | 'neutral'
  | 'happy'
  | 'curious'
  | 'surprised'
  | 'blush'
  | 'uneasy'
  | 'sad'
  | 'determined'
  | 'amused'
  | 'romantic'
  | 'thoughtful';

export interface DialogueLine {
  id: string;
  speaker: SpeakerId;
  speakerName: string;
  text: string;
  emotion?: CharacterEmotion;
}

export interface DialogueSequence {
  id: string;
  lines: DialogueLine[];
  onCompleteAction?:
    | 'start_ariel_approach'
    | 'start_slow_dance'
    | 'complete_stage'
    | 's2_trigger_eloisa'
    | 's2_trigger_jealousy'
    | 's2_start_forehead_kiss'
    | 's2_complete_stage'
    | 's3_start_together_cutscene'
    | 's3_start_travel_to_moving'
    | 's3_start_proposal_cutscene'
    | 's3_unlock_hotdog_exit'
    | 's3_start_hotdog_cutscene'
    | 's3_trigger_wrong_hand'
    | 's3_start_videostore_cutscene'
    | 's3_start_movienight_cutscene'
    | 's3_start_moving_celebration'
    | 's3_start_ending_cutscene'
    | 's3_complete_stage'
    | 's4_start_bicycle_cutscene'
    | 's4_start_labor_walk'
    | 's4_start_maternity_trip'
    | 's4_start_birth_cutscene'
    | 's4_start_crib_scene'
    | 's4_start_build_meia_agua'
    | 's4_start_toddler_home'
    | 's4_start_cristian_dance'
    | 's4_start_videogame_scene'
    | 's4_start_ending_7y';
}

export type TileKind =
  | 'wall'
  | 'floor_club'
  | 'floor_dance'
  | 'floor_entrance'
  | 'counter'
  | 'dj_booth'
  | 'sofa'
  | 'rope'
  | 'speaker'
  | 'fridge'
  | 'plant'
  | 'table'
  | 'concrete_chair'
  | 'door';

export interface Vec2 {
  x: number;
  y: number;
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  dir: Direction;
  walkDistance: number;
  isMoving: boolean;
  isDancing: boolean;
  reactionEmotion:
    | 'none'
    | 'happy'
    | 'curious'
    | 'surprised'
    | 'amused'
    | 'blush'
    | 'uneasy'
    | 'sad'
    | 'determined'
    | 'thoughtful'
    | 'romantic';
}

export type NpcRole =
  | 'laura'
  | 'ariel'
  | 'leo'
  | 'junior'
  | 'dj'
  | 'bartender'
  | 'vendor'
  | 'clerk'
  | 'dancer'
  | 'bboy'
  | 'teen_chat'
  | 'eloisa'
  | 'friend'
  | 'cristian'
  | 'nani'
  | 'bar_man';

export interface NpcEntity {
  id: string;
  name: string;
  role: NpcRole;
  x: number;
  y: number;
  dir: Direction;
  visible: boolean;
  interactable: boolean;
  variant: number;
  dancePhaseOffset: number;
}

export interface PropInteractable {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  dialogueId: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stageNumber: number;
  x: number;
  y: number;
  radius: number;
  dialogueId: string;
}

export interface ExteriorTeen {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  variant: number;
  enterDelay: number;
  chatMode: boolean;
}

export interface IntroCutsceneState {
  active: boolean;
  scene: 'scene1_1995_street' | 'scene2_arrival' | 'scene3_interior_pan';
  elapsed: number;
  doorOpenAmount: number;
  cameraFocusX: number;
  cameraFocusY: number;
}

export interface SlowDanceState {
  active: boolean;
  elapsed: number;
  duration: number;
  swayPhase: number;
  syncHits: number;
  beatCursor: number;
  hitFeedback: '' | 'NO COMPASSO' | 'ABRAÇADINHOS';
  feedbackTimer: number;
}

export type KissCutscenePhase = 'zoom_in' | 'gaze' | 'lean' | 'kiss_silhouette' | 'zoom_out';

export interface KissCutsceneState {
  active: boolean;
  phase: KissCutscenePhase;
  elapsed: number;
  totalDuration: number;
  cameraZoom: number;
}

export type Stage2CutsceneKind =
  | 'none'
  | 'intro_memories'
  | 'eloisa_reunion'
  | 'jealousy_slow_dance'
  | 'retry_montage'
  | 'forehead_kiss_farewell'
  | 'ending_transition'
  | 'breakdance_circle';

export interface Stage2State {
  cutscene: Stage2CutsceneKind;
  cutsceneElapsed: number;
  returnPhase: QuestPhase | null;
  returnPlayerX: number | null;
  returnPlayerY: number | null;
  avoidCount: number;
  arielFleeing: boolean;
  arielTargetX: number;
  arielTargetY: number;
  cameraFocusX: number;
  cameraFocusY: number;
  cameraZoom: number;
  unlockedMemories: string[];
  recentMemoryTitle: string | null;
  recentMemoryTimer: number;
  seenAvoidThought: boolean;
  endingReadyToFinish: boolean;
}

export type Stage3CutsceneKind =
  | 'none'
  | 'time_passage'
  | 'together_montage'
  | 'travel_to_hotdog'
  | 'hotdog_eating'
  | 'travel_to_videostore'
  | 'videostore_wrong_hand_setup'
  | 'videostore_wrong_hand_wait'
  | 'videostore_wrong_hand_tell'
  | 'videostore_picking'
  | 'travel_to_livingroom'
  | 'movie_night_sofa'
  | 'travel_to_moving'
  | 'moving_celebration'
  | 'moving_proposal'
  | 'ending_together';

export type Stage3MapId =
  | 'neighborhood_street'
  | 'hotdog_stand'
  | 'video_store'
  | 'living_room'
  | 'moving_house';

export interface MovingItem {
  id: string;
  label: string;
  kind: 'box_books' | 'box_tapes' | 'fan' | 'box_kitchen';
  pickupX: number;
  pickupY: number;
  delivered: boolean;
}

export interface Stage3State {
  mapId: Stage3MapId;
  locationLabel: string;
  cutscene: Stage3CutsceneKind;
  cutsceneElapsed: number;
  cameraFocusX: number;
  cameraFocusY: number;
  cameraZoom: number;
  arielFollowsPlayer: boolean;
  friendsFollowPlayer: boolean;
  metFriendsOnStreet: boolean;
  orderedHotdog: boolean;
  browsedVhsShelves: string[];
  wrongHandTriggered: boolean;
  wrongHandResolved: boolean;
  wrongHandChoice: 'wait' | 'tell' | null;
  wrongHandChoicePending: boolean;
  pickedMovieTape: boolean;
  watchedMovieNight: boolean;
  movingItems: MovingItem[];
  carryingItemId: string | null;
  movingDeliveredCount: number;
  helperTimer: number;
  unlockedMemories: string[];
  recentMemoryTitle: string | null;
  recentMemoryTimer: number;
  endingReadyToFinish: boolean;
}

export type Stage4MapId =
  | 'moms_house_yard'
  | 'neighborhood_bike_road'
  | 'maternidade_carmela_dutra'
  | 'cristian_crib_room'
  | 'backyard_construction'
  | 'meia_agua_interior';

export type Stage4CutsceneKind =
  | 'none'
  | 'pregnancy_news'
  | 'bicycle_ride'
  | 'labor_walk_bar'
  | 'maternity_trip'
  | 'birth_blessing'
  | 'cristian_crib'
  | 'cristian_dance'
  | 'videogame_session'
  | 'family_ending_7y';

export type CristianAgeStage = 'unborn' | 'baby' | 'toddler' | 'child_5y' | 'child_7y';

export interface Stage4BuildTask {
  id: string;
  label: string;
  materialX: number;
  materialY: number;
  completed: boolean;
}

export interface Stage4BikeRideState {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'right' | 'left';
  wheelAngle: number;
  pedalPhase: number;
  graziSway: number;
  routeLength: number;
  destinationX: number;
  arrived: boolean;
  farewellDialogueTriggered: boolean;
}

export interface Stage4State {
  mapId: Stage4MapId;
  locationLabel: string;
  eraLabel: string;
  cutscene: Stage4CutsceneKind;
  cutsceneElapsed: number;
  cameraFocusX: number;
  cameraFocusY: number;
  cameraZoom: number;
  graziPregnant: boolean;
  cristianAge: CristianAgeStage;
  bikeRide: Stage4BikeRideState | null;
  buildStage: number; // 0 empty lot -> 1 foundation/walls -> 2 roof/frame -> 3 finished meia-agua
  carryingMaterialId: string | null;
  buildTasks: Stage4BuildTask[];
  metBarMan: boolean;
  watchedCristianDance: boolean;
  gamePuzzleStep: number; // 0..2 interactive Tomb Raider-inspired enigmas
  gamePuzzlePending: boolean;
  gamePuzzleFeedback: string | null;
  gamePuzzleSolvedCount: number;
  unlockedMemories: string[];
  recentMemoryTitle: string | null;
  recentMemoryTimer: number;
  endingReadyToFinish: boolean;
}

export interface StageDefinition {
  id: StageId;
  number: number;
  year: string;
  title: string;
  location: string;
  unlocked: boolean;
}

export interface SavedProgress {
  stage1Completed: boolean;
  stage2Completed: boolean;
  stage3Completed: boolean;
  stage4Completed: boolean;
  bestDanceSync: number;
  totalPlays: number;
  discoveredProps: string[];
  unlockedMemories: string[];
  lastCompletedAt: string | null;
}

export interface SimulationState {
  stageId: StageId;
  questPhase: QuestPhase;
  intro: IntroCutsceneState;
  arielActivity: ArielActivity;
  player: PlayerState;
  npcs: NpcEntity[];
  activeDialogue: DialogueSequence | null;
  dialogueLineIndex: number;
  slowDance: SlowDanceState;
  kissCutscene: KissCutsceneState;
  stage2: Stage2State | null;
  stage3: Stage3State | null;
  stage4: Stage4State | null;
  elapsedSeconds: number;
  beatTimer: number;
  discoveredProps: string[];
  heartsSpawned: number;
}
