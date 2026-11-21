import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceDialogue,
  canStandAt,
  createInitialSimulation,
  createStage2Simulation,
  exitStage2BreakdanceCircle,
  findNearestInteractable,
  finishStage2Ending,
  getKissPhaseForElapsed,
  getStage2CutsceneCaption,
  movePlayer,
  skipIntroCutscene,
  stepKissCutscene,
  stepSimulationTimers,
  stepSlowDance,
  triggerInteraction,
  triggerSlowDanceBeatInput,
} from './rules';
import { MAP_GRID, TILE_SIZE } from './mapData';
import { ARIEL_AVOID_SPOTS, STAGE_2_CLOSING_QUOTE, STAGE_2_MEMORIES } from './stage2Data';
import {
  STAGE3_HOTDOG_GRID,
  STAGE3_PORCH_DROP_POS,
  STAGE_3_CLOSING_QUOTE,
  STAGE_3_DIALOGUES,
  STAGE_3_MEMORIES,
} from './stage3Data';
import {
  advanceStage3WrongHandWaitBeat,
  chooseStage3WrongHandOption,
  createStage3Simulation,
  finishStage3Ending,
  getStage3CutsceneCaption,
} from './stage3Rules';
import {
  STAGE4_BAR_MAN_POS,
  STAGE4_BICYCLE_POS,
  STAGE4_BUILD_SITE_POS,
  STAGE4_CONSOLE_POS,
  STAGE4_RADIO_POS,
  STAGE4_SCHOOL_BIKE_START_X,
  STAGE4_SCHOOL_BIKE_STOP_X,
  STAGE4_STREET_CONTINUE_POS,
  STAGE_4_CLOSING_QUOTE,
  STAGE_4_DIALOGUES,
  STAGE_4_MEMORIES,
} from './stage4Data';
import {
  chooseStage4VideogameOption,
  createStage4Simulation,
  finishStage4Ending,
  getStage4CutsceneCaption,
} from './stage4Rules';

test('initial simulation spawns Grazi in an open walkway with Laura and Ariel already visible dancing on the pista', () => {
  const sim = createInitialSimulation(true);
  assert.equal(sim.questPhase, 'explore_find_laura');
  assert.equal(sim.arielActivity, 'breakdance_cap');
  assert.equal(
    canStandAt(sim.player.x, sim.player.y, sim.player.width, sim.player.height, sim.npcs),
    true,
  );

  const laura = sim.npcs.find((n) => n.role === 'laura');
  const ariel = sim.npcs.find((n) => n.role === 'ariel');
  const teenChat = sim.npcs.find((n) => n.role === 'teen_chat');
  assert.ok(laura && laura.visible);
  assert.ok(ariel && ariel.visible);
  assert.ok(teenChat && teenChat.visible);
});

test('3-scene opening progresses from 1995 street -> arrival -> interior pan -> explore_find_laura, and can be skipped', () => {
  let sim = createInitialSimulation(false);
  assert.equal(sim.questPhase, 'intro_1995_street');
  assert.equal(sim.intro.active, true);

  // Advance past scene 1 (4.0s)
  sim = stepSimulationTimers(sim, 4.1);
  assert.equal(sim.questPhase, 'intro_arrival');
  assert.equal(sim.intro.scene, 'scene2_arrival');

  // Advance past scene 2 (5.2s)
  sim = stepSimulationTimers(sim, 5.3);
  assert.equal(sim.questPhase, 'intro_interior_pan');
  assert.equal(sim.intro.scene, 'scene3_interior_pan');

  // Advance past scene 3 (4.4s)
  sim = stepSimulationTimers(sim, 4.5);
  assert.equal(sim.questPhase, 'explore_find_laura');
  assert.equal(sim.intro.active, false);

  // Skip intro shortcut from scene 1
  const skipped = skipIntroCutscene(createInitialSimulation(false));
  assert.equal(skipped.questPhase, 'explore_find_laura');
  assert.equal(skipped.intro.active, false);
});

test('player movement slides along walls and stops at solid tiles', () => {
  let sim = createInitialSimulation(true);
  const startY = sim.player.y;
  sim = movePlayer(sim, 0, -1, 0.25);
  assert.ok(sim.player.y < startY);
  assert.equal(sim.player.dir, 'up');

  for (let i = 0; i < 60; i++) {
    sim = movePlayer(sim, 0, -1, 0.1);
  }
  assert.ok(sim.player.y >= TILE_SIZE);
});

test('player movement accelerates smoothly and decelerates after releasing movement keys', () => {
  let sim = createInitialSimulation(true);
  const startX = sim.player.x;

  sim = movePlayer(sim, 1, 0, 0.016);
  const firstMove = sim.player.x - startX;
  assert.ok(firstMove >= 0);
  assert.ok((sim.player.vx ?? 0) > 0);
  assert.ok((sim.player.vx ?? 0) < 118);

  sim = movePlayer(sim, 1, 0, 0.1);
  sim = movePlayer(sim, 1, 0, 0.1);
  assert.ok((sim.player.vx ?? 0) > 50);

  const releasedVx = sim.player.vx ?? 0;
  const releasedStartX = sim.player.x;
  sim = movePlayer(sim, 0, 0, 0.016);
  assert.ok((sim.player.vx ?? 0) < releasedVx);
  assert.ok(sim.player.vx === 0 ? sim.player.x === releasedStartX : sim.player.x > releasedStartX);
});

test('talking to Laura uses mana, reveals Grazi thought, and makes Ariel walk toward Grazi', () => {
  let sim = createInitialSimulation(true);
  const laura = sim.npcs.find((n) => n.role === 'laura')!;
  sim = {
    ...sim,
    player: { ...sim.player, x: laura.x, y: laura.y + 30 },
  };

  const target = findNearestInteractable(sim);
  assert.ok(target);
  assert.equal(target.id, 'laura');

  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 'laura_talk');

  const usesMana = sim.activeDialogue!.lines.some(
    (line) => line.speaker === 'laura' && line.text.includes('Mana'),
  );
  const mentionsJunior = sim.activeDialogue!.lines.some(
    (line) => line.speaker === 'laura' && line.text.includes('Junior'),
  );
  const hasThought = sim.activeDialogue!.lines.some((line) =>
    line.text.includes('O próximo menino que me chamar pra dançar, eu vou ficar!'),
  );
  assert.equal(usesMana, true);
  assert.equal(mentionsJunior, true);
  assert.equal(hasThought, true);

  // Advance to Grazi's curious response, "Não, mana. Tudo bem." (uneasy) and her thought (determined)
  sim = advanceDialogue(sim); // l2 (curious)
  assert.equal(sim.player.reactionEmotion, 'curious');
  sim = advanceDialogue(sim); // l3 (laura blush)
  sim = advanceDialogue(sim); // l4 (uneasy)
  assert.equal(sim.player.reactionEmotion, 'uneasy');
  sim = advanceDialogue(sim); // l5 (determined)
  assert.equal(sim.player.reactionEmotion, 'determined');

  while (sim.activeDialogue) {
    sim = advanceDialogue(sim);
  }

  assert.equal(sim.questPhase, 'ariel_approaching');
  assert.equal(sim.arielActivity, 'walking_to_grazi');

  // Step timers so Ariel walks across the floor and opens his slow dance invitation
  for (let i = 0; i < 60; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 'ready_to_dance_ariel') break;
  }

  assert.equal(sim.questPhase, 'ready_to_dance_ariel');
  assert.equal(sim.activeDialogue?.id, 'ariel_encounter');
});

test('accepting Ariel invitation triggers slow romantic dance, 5-phase kiss cutscene, Eu te amo and amused reaction', () => {
  let sim = createInitialSimulation(true);
  const laura = sim.npcs.find((n) => n.role === 'laura')!;
  sim = {
    ...sim,
    player: { ...sim.player, x: laura.x, y: laura.y + 30 },
  };
  sim = triggerInteraction(sim).next;
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  for (let i = 0; i < 60; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 'ready_to_dance_ariel') break;
  }
  assert.equal(sim.activeDialogue?.id, 'ariel_encounter');

  while (sim.activeDialogue) {
    sim = advanceDialogue(sim);
  }

  assert.equal(sim.questPhase, 'slow_dance');
  assert.equal(sim.arielActivity, 'slow_dancing');
  assert.equal(sim.slowDance.active, true);

  sim = triggerSlowDanceBeatInput(sim).next;
  assert.equal(sim.slowDance.syncHits, 1);

  for (let i = 0; i < 60; i++) {
    sim = stepSlowDance(sim, 0.2);
    if (!sim.slowDance.active) break;
  }

  assert.equal(sim.slowDance.active, false);
  assert.equal(sim.questPhase, 'kiss_cutscene');
  assert.equal(sim.arielActivity, 'kissing');
  assert.equal(sim.kissCutscene.active, true);

  assert.equal(getKissPhaseForElapsed(0.5).phase, 'zoom_in');
  assert.equal(getKissPhaseForElapsed(2.0).phase, 'gaze');
  assert.equal(getKissPhaseForElapsed(3.0).phase, 'lean');
  assert.equal(getKissPhaseForElapsed(4.5).phase, 'kiss_silhouette');
  assert.equal(getKissPhaseForElapsed(6.2).phase, 'zoom_out');

  for (let i = 0; i < 60; i++) {
    sim = stepKissCutscene(sim, 0.2);
    if (!sim.kissCutscene.active) break;
  }

  assert.equal(sim.kissCutscene.active, false);
  assert.equal(sim.questPhase, 'post_dance_confession');
  assert.equal(sim.activeDialogue?.id, 'post_dance');

  const hasEuTeAmo = sim.activeDialogue!.lines.some(
    (l) => l.speaker === 'ariel' && l.text.includes('Eu te amo'),
  );
  assert.equal(hasEuTeAmo, true);

  sim = advanceDialogue(sim);
  assert.equal(sim.player.reactionEmotion, 'amused');

  while (sim.activeDialogue) {
    sim = advanceDialogue(sim);
  }

  assert.equal(sim.questPhase, 'stage_complete');
});

// ============================================================================
// STAGE 2: ENTRE ENCONTROS E DESENCONTROS UNIT TESTS
// ============================================================================
test('Stage 2 starts with early-dating memories cutscene, supports skipping, and unlocks collectible memories', () => {
  let sim = createStage2Simulation(false, []);
  assert.equal(sim.stageId, 'stage-2');
  assert.equal(sim.questPhase, 's2_intro_memories');
  assert.equal(sim.stage2?.cutscene, 'intro_memories');
  assert.ok(getStage2CutsceneCaption(sim)?.canSkipIntro);

  // Skip intro lands directly in Exploration 1
  sim = skipIntroCutscene(sim);
  assert.equal(sim.questPhase, 's2_explore_reunion');
  assert.equal(sim.stage2?.cutscene, 'none');

  // Collect first memory near Entrance
  const ticketMem = STAGE_2_MEMORIES.find((m) => m.id === 'mem_ticket')!;
  sim = { ...sim, player: { ...sim.player, x: ticketMem.x, y: ticketMem.y - 10 } };
  const target = findNearestInteractable(sim);
  assert.ok(target);
  assert.equal(target.type, 'memory');
  assert.equal(target.id, 'mem_ticket');

  sim = triggerInteraction(sim).next;
  assert.ok(sim.stage2?.unlockedMemories.includes('mem_ticket'));
  assert.equal(sim.stage2?.recentMemoryTitle, ticketMem.title);
});

test('Stage 2 full story arc: Eloisa reunion -> jealousy slow dance -> retry -> avoidance chase -> exact verbatim farewell quotes -> ending', () => {
  let sim = createStage2Simulation(true, []);

  // 1. Talk to Laura -> triggers Eloisa reunion cutscene
  const laura = sim.npcs.find((n) => n.role === 'laura')!;
  sim = { ...sim, player: { ...sim.player, x: laura.x, y: laura.y + 30 } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's2_laura_reunion');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  assert.equal(sim.questPhase, 's2_cutscene_eloisa');
  assert.equal(sim.stage2?.cutscene, 'eloisa_reunion');

  const arielBeforeEntry = sim.npcs.find((npc) => npc.role === 'ariel')!;
  const eloisaBeforeEntry = sim.npcs.find((npc) => npc.role === 'eloisa')!;
  assert.ok(Math.abs(eloisaBeforeEntry.x - arielBeforeEntry.x - 26) < 1e-9);
  sim = stepSimulationTimers(sim, 0.8);
  const arielDuringEntry = sim.npcs.find((npc) => npc.role === 'ariel')!;
  const eloisaDuringEntry = sim.npcs.find((npc) => npc.role === 'eloisa')!;
  assert.ok(arielDuringEntry.x < arielBeforeEntry.x);
  assert.ok(Math.abs(eloisaDuringEntry.x - arielDuringEntry.x - 26) < 1e-9);

  // Step through Eloisa reunion cutscene -> Exploration 2 (jealousy) + automatic Grazi & Laura dialogue
  for (let i = 0; i < 90; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's2_explore_jealousy') break;
  }
  assert.equal(sim.questPhase, 's2_explore_jealousy');
  assert.equal(sim.activeDialogue?.id, 's2_after_eloisa_chat');
  assert.ok(
    sim.activeDialogue!.lines.some((line) => line.text.toLowerCase().includes('trocou pela eloisa')),
  );
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Verify both Ariel and Eloisa are present on the right side of the pista
  const arielInJealousy = sim.npcs.find((n) => n.role === 'ariel');
  const eloisaInJealousy = sim.npcs.find((n) => n.role === 'eloisa');
  assert.ok(arielInJealousy?.visible && eloisaInJealousy?.visible);

  // 2. Talk to Ariel's friend -> triggers visual slow-dance jealousy cutscene
  const friend = sim.npcs.find((n) => n.role === 'friend')!;
  assert.ok(friend && friend.visible);
  sim = { ...sim, player: { ...sim.player, x: friend.x - 24, y: friend.y } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's2_friend_invite');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  assert.equal(sim.questPhase, 's2_cutscene_jealousy');
  assert.equal(sim.stage2?.cutscene, 'jealousy_slow_dance');

  // Verify camera cuts from Grazi+friend (left) to Ariel+Eloisa (right) with accurate jealousy caption
  sim = stepSimulationTimers(sim, 3.6);
  const leftFocusX = sim.stage2!.cameraFocusX;
  sim = stepSimulationTimers(sim, 3.0);
  const rightFocusX = sim.stage2!.cameraFocusX;
  assert.ok(rightFocusX > leftFocusX + 80);
  assert.ok(getStage2CutsceneCaption(sim)?.text.includes('Ariel dança com Eloisa'));

  // Step through jealousy -> retry montage -> avoidance exploration
  for (let i = 0; i < 160; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's2_cutscene_retry') break;
  }
  assert.equal(sim.questPhase, 's2_cutscene_retry');

  for (let i = 0; i < 120; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's2_explore_avoidance') break;
  }
  assert.equal(sim.questPhase, 's2_explore_avoidance');
  assert.equal(sim.stage2?.avoidCount, 0);

  // 3. Approach Ariel 1st time -> Ariel flees to spot 1 and triggers Grazi's internal thought
  sim = { ...sim, player: { ...sim.player, x: ARIEL_AVOID_SPOTS[0].x - 25, y: ARIEL_AVOID_SPOTS[0].y } };
  sim = stepSimulationTimers(sim, 0.05);
  assert.equal(sim.stage2?.avoidCount, 1);
  assert.equal(sim.stage2?.arielFleeing, true);

  for (let i = 0; i < 60; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (!sim.stage2?.arielFleeing) break;
  }
  assert.equal(sim.activeDialogue?.id, 's2_avoid_thought');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Approach Ariel 2nd time -> Ariel flees to spot 2
  sim = { ...sim, player: { ...sim.player, x: ARIEL_AVOID_SPOTS[1].x - 25, y: ARIEL_AVOID_SPOTS[1].y } };
  sim = stepSimulationTimers(sim, 0.05);
  assert.equal(sim.stage2?.avoidCount, 2);
  assert.equal(sim.stage2?.arielFleeing, true);

  for (let i = 0; i < 80; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (!sim.stage2?.arielFleeing) break;
  }
  assert.equal(sim.stage2?.arielFleeing, false);

  // 4. Catch up at spot 2 -> interact -> exact verbatim Grazi quote
  sim = { ...sim, player: { ...sim.player, x: ARIEL_AVOID_SPOTS[2].x - 32, y: ARIEL_AVOID_SPOTS[2].y } };
  const arielTarget = findNearestInteractable(sim);
  assert.ok(arielTarget);
  assert.equal(arielTarget.id, 'ariel');
  sim = triggerInteraction(sim).next;

  assert.equal(sim.questPhase, 's2_farewell_dialogue');
  assert.equal(
    sim.activeDialogue?.lines[0].text,
    'Você quer continuar me namorando ou não?',
  );
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // 5. Forehead kiss farewell cutscene -> exact verbatim Ariel quote "Não dá mais, tá?"
  assert.equal(sim.questPhase, 's2_cutscene_forehead_kiss');
  assert.equal(sim.stage2?.cutscene, 'forehead_kiss_farewell');

  sim = stepSimulationTimers(sim, 6.2);
  const farewellCaption = getStage2CutsceneCaption(sim);
  assert.equal(farewellCaption?.speaker, 'Ariel');
  assert.equal(farewellCaption?.text, 'Não dá mais, tá?');

  // 6. Step to ending transition -> exact closing reflection -> finish Stage 2
  for (let i = 0; i < 80; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's2_ending_transition') break;
  }
  assert.equal(sim.questPhase, 's2_ending_transition');
  assert.equal(getStage2CutsceneCaption(sim)?.text, STAGE_2_CLOSING_QUOTE);

  sim = stepSimulationTimers(sim, 2.2);
  assert.equal(sim.stage2?.endingReadyToFinish, true);

  sim = finishStage2Ending(sim);
  assert.equal(sim.questPhase, 'stage_complete');
});

test('Discoteca Cruzeiro has concrete tables & chairs (zero sofas), DJ behind the booth, and non-blocking Roda de Breakdance showcase', () => {
  const flatTiles = MAP_GRID.flat();
  assert.equal(flatTiles.includes('sofa'), false);
  assert.ok(flatTiles.includes('table'));
  assert.ok(flatTiles.includes('concrete_chair'));

  const s1 = createInitialSimulation(true);
  const s1Dj = s1.npcs.find((n) => n.role === 'dj')!;
  assert.ok(s1Dj.y > 2.0 * TILE_SIZE && s1Dj.y < 2.5 * TILE_SIZE);

  let s2 = createStage2Simulation(true, []);
  const s2Dj = s2.npcs.find((n) => n.role === 'dj')!;
  assert.ok(s2Dj.y > 2.0 * TILE_SIZE && s2Dj.y < 2.5 * TILE_SIZE);

  // Walk near Roda de Breakdance and interact -> launches showcase & unlocks mem_breakdance
  const bboy = s2.npcs.find((n) => n.role === 'bboy')!;
  assert.ok(bboy && bboy.visible);
  s2 = { ...s2, player: { ...s2.player, x: bboy.x, y: bboy.y + 34 } };
  const target = findNearestInteractable(s2);
  assert.ok(target);
  assert.equal(target.id, 'bboy-circle');

  s2 = triggerInteraction(s2).next;
  assert.equal(s2.stage2?.cutscene, 'breakdance_circle');
  assert.ok(s2.stage2?.unlockedMemories.includes('mem_breakdance'));
  assert.ok(getStage2CutsceneCaption(s2)?.text.toLowerCase().includes('funk'));

  // Exiting restores exact exploration phase & position cleanly
  s2 = exitStage2BreakdanceCircle(s2);
  assert.equal(s2.stage2?.cutscene, 'none');
  assert.equal(s2.questPhase, 's2_explore_reunion');
});

// ============================================================================
// STAGE 3: DESSA VEZ, PRA FICAR — CHRONOLOGY & COUPLE PROXIMITY UNIT TESTS
// ============================================================================
test('Stage 3 true chronology: Laura & Léo dating first -> Moving Day & Reconnection -> Proposal Cutscene -> Outings of the 4 -> Sunset Ending', () => {
  const visitedMaps: string[] = [];
  const visitedTravels: string[] = [];

  let sim = createStage3Simulation(false, []);
  assert.equal(sim.stageId, 'stage-3');
  assert.equal(sim.questPhase, 's3_intro_time');
  assert.equal(sim.stage3?.cutscene, 'time_passage');
  assert.ok(getStage3CutsceneCaption(sim)?.canSkipIntro);

  // Skip intro -> FIRST: Laura & Léo already dating while Grazi & Ariel are still apart
  sim = skipIntroCutscene(sim);
  assert.equal(sim.questPhase, 's3_explore_reunion');
  assert.equal(sim.stage3?.mapId, 'neighborhood_street');
  visitedMaps.push(sim.stage3!.mapId);

  // Verify NO Ariel NPC yet, and Laura & Léo are standing side-by-side as a couple
  assert.equal(sim.npcs.find((n) => n.role === 'ariel'), undefined);
  const lauraReunion = sim.npcs.find((n) => n.role === 'laura')!;
  const leoReunion = sim.npcs.find((n) => n.role === 'leo')!;
  assert.ok(lauraReunion && leoReunion);
  assert.ok(Math.hypot(lauraReunion.x - leoReunion.x, lauraReunion.y - leoReunion.y) <= 24);

  // 1. Talk to Laura & Léo -> mentions their 4-year relationship & invites Léo + Ariel to help Grazi move
  sim = { ...sim, player: { ...sim.player, x: lauraReunion.x - 24, y: lauraReunion.y } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's3_laura_leo_dating');
  assert.ok(
    sim.activeDialogue!.lines.some((line) => line.text.toLowerCase().includes('não se desgruda')),
  );
  assert.ok(
    sim.activeDialogue!.lines.some((line) => line.text.toLowerCase().includes('mudança')),
  );
  assert.ok(
    STAGE_3_MEMORIES.some((m) => m.description.toLowerCase().includes('quatro anos')),
  );
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Travel directly to Moving Day BEFORE any outings of the four!
  assert.equal(sim.questPhase, 's3_travel_moving');
  assert.equal(sim.stage3?.cutscene, 'travel_to_moving');
  visitedTravels.push(sim.stage3!.cutscene);

  for (let i = 0; i < 55; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's3_moving_day') break;
  }

  // 2. SECOND: Moving Day (moving_house) happens BEFORE proposal and BEFORE all group outings
  assert.equal(sim.questPhase, 's3_moving_day');
  assert.equal(sim.stage3?.mapId, 'moving_house');
  visitedMaps.push(sim.stage3!.mapId);
  assert.equal(sim.activeDialogue?.id, 's3_moving_intro');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Verify Ariel & Léo actively carry boxes back and forth during Moving Day
  const arielStartY = sim.npcs.find((n) => n.role === 'ariel')!.y;
  const leoStartY = sim.npcs.find((n) => n.role === 'leo')!.y;
  sim = stepSimulationTimers(sim, 1.2);
  assert.notEqual(sim.npcs.find((n) => n.role === 'ariel')!.y, arielStartY);
  assert.notEqual(sim.npcs.find((n) => n.role === 'leo')!.y, leoStartY);

  // Grazi picks up and delivers all 4 moving items to the new house veranda
  for (let idx = 0; idx < 4; idx++) {
    const nextItem = sim.stage3!.movingItems.find((item) => !item.delivered)!;
    sim = { ...sim, player: { ...sim.player, x: nextItem.pickupX, y: nextItem.pickupY - 12 } };
    sim = triggerInteraction(sim).next;
    assert.equal(sim.stage3?.carryingItemId, nextItem.id);

    sim = {
      ...sim,
      player: { ...sim.player, x: STAGE3_PORCH_DROP_POS.x, y: STAGE3_PORCH_DROP_POS.y },
    };
    sim = triggerInteraction(sim).next;
    assert.equal(sim.stage3?.carryingItemId, null);
    assert.equal(sim.stage3?.movingDeliveredCount, idx + 1);
    while (sim.activeDialogue) sim = advanceDialogue(sim);
  }

  assert.ok(sim.stage3?.unlockedMemories.includes('mem_s3_mudanca'));
  assert.equal(sim.questPhase, 's3_cutscene_moving_celebration');

  // Step through moving celebration -> Special Reconnection & Dating Proposal Cutscene!
  for (let i = 0; i < 60; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's3_cutscene_proposal') break;
  }
  assert.equal(sim.questPhase, 's3_cutscene_proposal');
  assert.equal(sim.stage3?.cutscene, 'moving_proposal');

  // Step to Ariel's proposal beat and verify caption + speaker portrait metadata
  sim = stepSimulationTimers(sim, 3.0);
  const proposalCap = getStage3CutsceneCaption(sim);
  assert.equal(proposalCap?.speakerId, 'ariel');
  assert.ok(proposalCap?.text.toLowerCase().includes('namorar comigo de novo'));

  // Step through proposal -> together montage -> playable walk with Ariel following
  for (let i = 0; i < 100; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's3_cutscene_together') break;
  }
  assert.equal(sim.questPhase, 's3_cutscene_together');

  for (let i = 0; i < 100; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's3_explore_walk') break;
  }

  // 3. THIRD: Only AFTER Moving Day + Proposal do the four go out together as two couples!
  assert.equal(sim.questPhase, 's3_explore_walk');
  assert.equal(sim.stage3?.mapId, 'neighborhood_street');
  assert.equal(sim.stage3?.arielFollowsPlayer, true);

  // Verify Laura & Léo stand close side-by-side waiting for Grazi & Ariel
  const lauraWalk = sim.npcs.find((n) => n.role === 'laura')!;
  const leoWalk = sim.npcs.find((n) => n.role === 'leo')!;
  assert.ok(Math.hypot(lauraWalk.x - leoWalk.x, lauraWalk.y - leoWalk.y) <= 24);

  // Meet Laura & Léo on the neighborhood street -> unlocks exit to Hot Dog Stand!
  sim = { ...sim, player: { ...sim.player, x: lauraWalk.x - 26, y: lauraWalk.y } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's3_walk_meet_couple');
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.stage3?.metFriendsOnStreet, true);
  assert.equal(sim.stage3?.friendsFollowPlayer, true);

  // Verify Laura & Léo stay close side-by-side while walking horizontally AND vertically!
  for (let i = 0; i < 12; i++) {
    sim = movePlayer(sim, 1, 0, 0.08);
  }
  const lauraWalkRight = sim.npcs.find((n) => n.role === 'laura')!;
  const leoWalkRight = sim.npcs.find((n) => n.role === 'leo')!;
  assert.ok(Math.hypot(lauraWalkRight.x - leoWalkRight.x, lauraWalkRight.y - leoWalkRight.y) <= 26);

  for (let i = 0; i < 10; i++) {
    sim = movePlayer(sim, 0, 1, 0.08);
  }
  const lauraWalkDown = sim.npcs.find((n) => n.role === 'laura')!;
  const leoWalkDown = sim.npcs.find((n) => n.role === 'leo')!;
  assert.ok(Math.hypot(lauraWalkDown.x - leoWalkDown.x, lauraWalkDown.y - leoWalkDown.y) <= 26);

  // Walk to right street exit -> triggers animated travel cutscene to Hot Dog Stand!
  sim = { ...sim, player: { ...sim.player, x: 21.8 * TILE_SIZE, y: 8.0 * TILE_SIZE } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.questPhase, 's3_travel_hotdog');
  assert.equal(sim.stage3?.cutscene, 'travel_to_hotdog');
  visitedTravels.push(sim.stage3!.cutscene);

  for (let i = 0; i < 55; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's3_explore_hotdog') break;
  }

  // Open-air Street Hot Dog Cart (hotdog_stand) — NO brick diner wall, NO picnic tables!
  assert.equal(sim.questPhase, 's3_explore_hotdog');
  assert.equal(sim.stage3?.mapId, 'hotdog_stand');
  assert.equal(sim.stage3?.friendsFollowPlayer, true);
  visitedMaps.push(sim.stage3!.mapId);
  const hotdogTiles = STAGE3_HOTDOG_GRID.flat();
  assert.equal(hotdogTiles.includes('brick_wall'), false);
  assert.equal(hotdogTiles.includes('picnic_table'), false);
  assert.equal(hotdogTiles.includes('doorway'), true);

  // Verify Laura & Léo spawn close side-by-side at the hot dog cart
  const lauraHotdog = sim.npcs.find((n) => n.role === 'laura')!;
  const leoHotdog = sim.npcs.find((n) => n.role === 'leo')!;
  assert.ok(Math.hypot(lauraHotdog.x - leoHotdog.x, lauraHotdog.y - leoHotdog.y) <= 24);

  // Order hot dogs standing outside the open-air street cart -> hotdog_eating cutscene + memory unlocked
  sim = { ...sim, player: { ...sim.player, x: 7.0 * TILE_SIZE, y: 6.4 * TILE_SIZE } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's3_hotdog_order');
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.questPhase, 's3_cutscene_hotdog');
  assert.equal(sim.stage3?.cutscene, 'hotdog_eating');
  assert.ok(sim.stage3?.unlockedMemories.includes('mem_s3_cachorro_quente'));

  for (let i = 0; i < 80; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.stage3?.cutscene === 'none') break;
  }
  assert.equal(sim.activeDialogue?.id, 's3_hotdog_after');
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.stage3?.orderedHotdog, true);

  // Physically walk up into the illuminated Locadora storefront glass doorway!
  sim = { ...sim, player: { ...sim.player, x: 17.0 * TILE_SIZE, y: 4.8 * TILE_SIZE, dir: 'up' } };
  for (let i = 0; i < 20; i++) {
    sim = movePlayer(sim, 0, -1, 0.08);
    if (sim.stage3?.mapId === 'video_store') break;
  }

  // Explorable Interior of 1990s Video Store (video_store)
  assert.equal(sim.questPhase, 's3_explore_videostore');
  assert.equal(sim.stage3?.mapId, 'video_store');
  visitedMaps.push(sim.stage3!.mapId);
  assert.equal(sim.activeDialogue?.id, 's3_videostore_welcome');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Verify Laura & Léo stay close side-by-side inside the video store (no isolated Léo!)
  const lauraVideo = sim.npcs.find((n) => n.role === 'laura')!;
  const leoVideo = sim.npcs.find((n) => n.role === 'leo')!;
  assert.ok(Math.hypot(lauraVideo.x - leoVideo.x, lauraVideo.y - leoVideo.y) <= 24);

  // Browse a VHS shelf (Comédia) -> triggers funny interactive "Ariel pega a mão errada" scene!
  sim = { ...sim, player: { ...sim.player, x: 6.5 * TILE_SIZE, y: 7.5 * TILE_SIZE } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's3_vhs_comedy');
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.ok(sim.stage3!.browsedVhsShelves.length >= 1);
  assert.equal(sim.stage3?.cutscene, 'videostore_wrong_hand_setup');

  // Step setup until interactive choice prompt appears
  sim = stepSimulationTimers(sim, 2.4);
  assert.equal(sim.stage3?.wrongHandChoicePending, true);

  // Test Branch A ('tell' — playful immediate warning) on a cloned snapshot
  let tellBranch = chooseStage3WrongHandOption(sim, 'tell');
  assert.equal(tellBranch.stage3?.cutscene, 'videostore_wrong_hand_tell');
  for (let i = 0; i < 45; i++) {
    tellBranch = stepSimulationTimers(tellBranch, 0.1);
    if (tellBranch.stage3?.cutscene === 'none') break;
  }
  assert.equal(tellBranch.stage3?.wrongHandResolved, true);
  assert.equal(tellBranch.activeDialogue?.id, 's3_wrong_hand_after_tell');

  // Test Branch B ('wait' — wait silently + interactive hold-laugh beat until Ariel notices!)
  sim = chooseStage3WrongHandOption(sim, 'wait');
  assert.equal(sim.stage3?.cutscene, 'videostore_wrong_hand_wait');
  assert.equal(getStage3CutsceneCaption(sim)?.canHoldLaugh, true);
  sim = advanceStage3WrongHandWaitBeat(sim);
  assert.ok((sim.stage3?.cutsceneElapsed ?? 0) >= 1.7);
  for (let i = 0; i < 65; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.stage3?.cutscene === 'none') break;
  }
  assert.equal(sim.stage3?.wrongHandResolved, true);
  assert.equal(sim.activeDialogue?.id, 's3_wrong_hand_after_wait');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Checkout chosen VHS tape at the counter -> videostore_picking cutscene + memory
  sim = { ...sim, player: { ...sim.player, x: 6.2 * TILE_SIZE, y: 5.5 * TILE_SIZE } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's3_videostore_checkout');
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.questPhase, 's3_cutscene_videostore');
  assert.equal(sim.stage3?.cutscene, 'videostore_picking');
  assert.ok(sim.stage3?.unlockedMemories.includes('mem_s3_locadora'));

  for (let i = 0; i < 80; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.stage3?.cutscene === 'none') break;
  }
  assert.equal(sim.activeDialogue?.id, 's3_videostore_after_pick');
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.stage3?.pickedMovieTape, true);

  // Exit through Video Store glass doors -> travel cutscene to Home Living Room!
  sim = { ...sim, player: { ...sim.player, x: 12.0 * TILE_SIZE, y: 13.7 * TILE_SIZE } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.questPhase, 's3_travel_livingroom');
  assert.equal(sim.stage3?.cutscene, 'travel_to_livingroom');
  visitedTravels.push(sim.stage3!.cutscene);

  for (let i = 0; i < 55; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's3_explore_livingroom') break;
  }

  // Sala de Estar — Noite de Filme em Casa (living_room)
  assert.equal(sim.questPhase, 's3_explore_livingroom');
  assert.equal(sim.stage3?.mapId, 'living_room');
  visitedMaps.push(sim.stage3!.mapId);
  assert.equal(sim.activeDialogue?.id, 's3_livingroom_arrive');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Verify Laura & Léo stay close side-by-side in the living room
  const lauraRoom = sim.npcs.find((n) => n.role === 'laura')!;
  const leoRoom = sim.npcs.find((n) => n.role === 'leo')!;
  assert.ok(Math.hypot(lauraRoom.x - leoRoom.x, lauraRoom.y - leoRoom.y) <= 24);

  // Sit on sofa with shared popcorn bowl -> movie_night_sofa cutscene + mem_s3_quatro
  sim = { ...sim, player: { ...sim.player, x: 12.0 * TILE_SIZE, y: 10.4 * TILE_SIZE } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's3_movienight_start');
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.questPhase, 's3_cutscene_movienight');
  assert.equal(sim.stage3?.cutscene, 'movie_night_sofa');
  assert.ok(sim.stage3?.unlockedMemories.includes('mem_s3_quatro'));

  for (let i = 0; i < 100; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.stage3?.cutscene === 'none') break;
  }
  assert.equal(sim.activeDialogue?.id, 's3_movienight_end');
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.stage3?.watchedMovieNight, true);

  // Verify ALL 5 distinct environments were visited in EXACT chronological order!
  assert.deepEqual(visitedMaps, [
    'neighborhood_street',
    'moving_house',
    'hotdog_stand',
    'video_store',
    'living_room',
  ]);
  assert.deepEqual(visitedTravels, [
    'travel_to_moving',
    'travel_to_hotdog',
    'travel_to_livingroom',
  ]);

  // Walk to front door -> Golden Sunset Ending with exact verbatim quote
  sim = { ...sim, player: { ...sim.player, x: 12.0 * TILE_SIZE, y: 13.7 * TILE_SIZE } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.questPhase, 's3_ending_together');
  assert.equal(sim.stage3?.cutscene, 'ending_together');
  assert.equal(sim.stage3?.mapId, 'neighborhood_street');
  assert.equal(getStage3CutsceneCaption(sim)?.text, STAGE_3_CLOSING_QUOTE);

  sim = stepSimulationTimers(sim, 2.0);
  assert.equal(sim.stage3?.endingReadyToFinish, true);

  sim = finishStage3Ending(sim);
  assert.equal(sim.questPhase, 'stage_complete');
});

test('Stage 3 narrative respects constraints: zero ice cream, exact closing quote, no Cristian/pregnancy preview, and no invented years', () => {
  assert.equal(
    STAGE_3_CLOSING_QUOTE,
    'Algumas histórias precisam de tempo para encontrar o caminho. E, dessa vez, a gente escolheu continuar juntos.',
  );

  const allDialogueText = Object.values(STAGE_3_DIALOGUES)
    .flatMap((d) => d.lines.map((l) => l.text))
    .join(' ')
    .toLowerCase();
  const allMemoryText = STAGE_3_MEMORIES.map((m) => `${m.title} ${m.description}`)
    .join(' ')
    .toLowerCase();
  const combined = `${allDialogueText} ${allMemoryText} ${String(STAGE_3_CLOSING_QUOTE).toLowerCase()}`;

  // Ice cream stand must be completely replaced by Hot Dog stand!
  assert.equal(combined.includes('sorvete'), false);
  assert.equal(combined.includes('cachorro-quente'), true);
  assert.equal(combined.includes('locadora'), true);
  assert.equal(combined.includes('pipoca'), true);

  // Story guardrails
  assert.equal(combined.includes('cristian'), false);
  assert.equal(combined.includes('grávida'), false);
  assert.equal(combined.includes('gravidez'), false);
  assert.equal(/\b(199[6-9]|200\d)\b/.test(combined), false);
});

// ============================================================================
// STAGE 4: NOSSA PEQUENA GRANDE AVENTURA — FULL 8-BEAT & GROWTH UNIT TESTS
// ============================================================================
test('Stage 4 begins with the school bicycle pickup and pregnancy reveal before the existing story continues', () => {
  const seenCristianAges: string[] = [];

  let sim = createStage4Simulation(false, []);
  assert.equal(sim.stageId, 'stage-4');
  assert.equal(sim.questPhase, 's4_cutscene_bicycle');
  assert.equal(sim.stage4?.cutscene, 'bicycle_ride');
  assert.equal(sim.stage4?.mapId, 'neighborhood_bike_road');
  assert.equal(sim.stage4?.graziPregnant, false);
  assert.equal(sim.stage4?.cristianAge, 'unborn');
  assert.equal(sim.stage4?.bikeRide?.x, STAGE4_SCHOOL_BIKE_START_X);
  seenCristianAges.push(sim.stage4!.cristianAge);

  assert.ok(getStage4CutsceneCaption(sim)?.text.includes('buscar Grazi'));
  const schoolArrivalX = sim.stage4!.bikeRide!.x;
  sim = stepSimulationTimers(sim, 0.6);
  assert.ok(sim.stage4!.bikeRide!.x < schoolArrivalX);
  assert.ok(sim.stage4!.bikeRide!.wheelAngle < 0);
  assert.ok(sim.stage4!.bikeRide!.pedalPhase > 0);

  sim = stepSimulationTimers(sim, 0.9);
  assert.equal(sim.stage4?.bikeRide?.x, STAGE4_SCHOOL_BIKE_STOP_X);
  assert.ok(getStage4CutsceneCaption(sim)?.text.includes('sobe na garupa'));
  sim = stepSimulationTimers(sim, 1.3);
  assert.equal(sim.stage4?.bikeRide?.x, STAGE4_SCHOOL_BIKE_STOP_X);

  sim = stepSimulationTimers(sim, 0.3);
  assert.ok(sim.stage4!.bikeRide!.x < STAGE4_SCHOOL_BIKE_STOP_X);
  assert.equal(sim.stage4?.bikeRide?.facing, 'left');
  assert.ok(sim.stage4!.bikeRide!.wheelAngle < 0);

  for (let i = 0; i < 120 && !sim.activeDialogue; i++) {
    sim = stepSimulationTimers(sim, 0.1);
  }
  assert.equal(sim.stage4?.mapId, 'moms_house_yard');
  assert.equal(sim.stage4?.cutscene, 'none');
  assert.equal(sim.stage4?.graziPregnant, false);
  assert.equal(sim.activeDialogue?.id, 's4_pregnancy_reveal');
  assert.ok(sim.stage4?.unlockedMemories.includes('mem_s4_bicicleta'));
  assert.ok(
    STAGE_4_DIALOGUES.s4_pregnancy_reveal.lines.some((line) =>
      line.text.includes('grávida'),
    ),
  );
  assert.equal(
    STAGE_4_DIALOGUES.s4_pregnancy_reveal.onCompleteAction,
    's4_start_labor_walk',
  );

  // Finishing the home dialogue announces the pregnancy and continues into the existing 9-month scene.
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.questPhase, 's4_cutscene_labor_walk');
  assert.equal(sim.stage4?.cutscene, 'labor_walk_bar');
  assert.equal(sim.stage4?.graziPregnant, true);
  assert.equal(sim.stage4?.cristianAge, 'unborn');
  assert.equal(sim.stage4?.buildStage, 0);
  assert.ok(sim.stage4?.unlockedMemories.includes('mem_s4_gravidez'));
  assert.ok(sim.stage4?.unlockedMemories.includes('mem_s4_menino_lindo'));

  // Verify the bar man's exact line and the couple's reaction both appear.
  sim = stepSimulationTimers(sim, 5.2);
  const barCaption = getStage4CutsceneCaption(sim);
  assert.ok(barCaption?.text.includes('Vai ser um meninão!'));
  sim = stepSimulationTimers(sim, 3.3);
  const reactionCaption = getStage4CutsceneCaption(sim);
  assert.ok(reactionCaption?.text.includes('Grazi sorri'));
  assert.ok(reactionCaption?.text.includes('Ariel fica sem graça'));

  // Step through remainder of labor walk -> Nani maternity trip to Maternidade Carmela Dutra!
  for (let i = 0; i < 120; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's4_cutscene_maternity_trip') break;
  }
  assert.equal(sim.questPhase, 's4_cutscene_maternity_trip');
  assert.equal(sim.stage4?.cutscene, 'maternity_trip');
  assert.ok(sim.stage4?.unlockedMemories.includes('mem_s4_maternidade'));
  assert.ok(getStage4CutsceneCaption(sim)?.text.includes('sogra do Ariel'));

  // Step through maternity road trip -> arrives at Maternidade Carmela Dutra map before birth
  sim = stepSimulationTimers(sim, 10.0);
  assert.equal(sim.stage4?.mapId, 'maternidade_carmela_dutra');

  // Step through arrival -> Calm, happy birth of blond newborn Cristian!
  for (let i = 0; i < 80; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's4_cutscene_birth') break;
  }
  assert.equal(sim.questPhase, 's4_cutscene_birth');
  assert.equal(sim.stage4?.cutscene, 'birth_blessing');
  assert.equal(sim.stage4?.mapId, 'maternidade_carmela_dutra');
  assert.equal(sim.stage4?.graziPregnant, false);
  assert.equal(sim.stage4?.cristianAge, 'baby');
  seenCristianAges.push(sim.stage4!.cristianAge);

  // 4. Step through tender birth -> Cristian's yellow baby crib scene (with Tio Léo's miniature toys)!
  for (let i = 0; i < 120; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's4_cutscene_crib') break;
  }
  assert.equal(sim.questPhase, 's4_cutscene_crib');
  assert.equal(sim.stage4?.cutscene, 'cristian_crib');
  assert.equal(sim.stage4?.mapId, 'cristian_crib_room');
  assert.equal(sim.stage4?.cristianAge, 'baby');
  assert.equal(sim.stage4?.buildStage, 0);
  assert.ok(sim.stage4?.unlockedMemories.includes('mem_s4_bercinho'));

  // Step through crib scene -> opens affectionate crib reflection dialogue
  for (let i = 0; i < 130; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.activeDialogue?.id === 's4_crib_reflection') break;
  }
  assert.equal(sim.activeDialogue?.id, 's4_crib_reflection');
  assert.ok(
    STAGE_4_DIALOGUES.s4_crib_reflection.lines.every((line) => line.text.length < 75),
  );

  // 5. ONLY AFTER Cristian is born & crib scene completes -> Build the backyard meia-água!
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.questPhase, 's4_build_meia_agua');
  assert.equal(sim.stage4?.graziPregnant, false);
  assert.equal(sim.stage4?.cristianAge, 'baby');
  assert.equal(sim.stage4?.buildStage, 0);
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  for (let stepIdx = 0; stepIdx < 3; stepIdx++) {
    const task = sim.stage4!.buildTasks.find((t) => !t.completed)!;
    sim = { ...sim, player: { ...sim.player, x: task.materialX, y: task.materialY } };
    sim = triggerInteraction(sim).next;
    assert.equal(sim.stage4?.carryingMaterialId, task.id);

    sim = { ...sim, player: { ...sim.player, x: STAGE4_BUILD_SITE_POS.x, y: STAGE4_BUILD_SITE_POS.y } };
    sim = triggerInteraction(sim).next;
    assert.equal(sim.stage4?.carryingMaterialId, null);
    assert.equal(sim.stage4?.buildStage, stepIdx + 1);
    while (sim.activeDialogue) sim = advanceDialogue(sim);
  }
  assert.ok(sim.stage4?.unlockedMemories.includes('mem_s4_meia_agua'));

  // 6. After finishing meia-água -> Move in & Toddler Cristian (~2-3y) home & dance!
  assert.equal(sim.questPhase, 's4_explore_toddler_home');
  assert.equal(sim.stage4?.cristianAge, 'toddler');
  seenCristianAges.push(sim.stage4!.cristianAge);
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  sim = { ...sim, player: { ...sim.player, x: STAGE4_RADIO_POS.x, y: STAGE4_RADIO_POS.y } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's4_start_dance_prompt');
  while (sim.activeDialogue) sim = advanceDialogue(sim);
  assert.equal(sim.questPhase, 's4_cutscene_cristian_dance');
  assert.equal(sim.stage4?.cutscene, 'cristian_dance');

  // 7. Step through toddler dance -> prompt -> interactive Tomb-Raider-inspired videogame (5y)
  for (let i = 0; i < 110; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.stage4?.cutscene === 'none') break;
  }
  assert.equal(sim.activeDialogue?.id, 's4_after_dance_videogame_prompt');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  assert.equal(sim.questPhase, 's4_videogame_interactive');
  assert.equal(sim.stage4?.cutscene, 'videogame_session');
  assert.equal(sim.stage4?.cristianAge, 'child_5y');
  seenCristianAges.push(sim.stage4!.cristianAge);
  assert.ok(sim.stage4?.unlockedMemories.includes('mem_s4_videogame'));

  // Test wrong option B keeps pending & gives encouraging hint, then solve all 3 with A
  sim = chooseStage4VideogameOption(sim, 'B');
  assert.equal(sim.stage4?.gamePuzzleSolvedCount, 0);
  assert.equal(sim.stage4?.gamePuzzlePending, true);
  assert.ok(sim.stage4?.gamePuzzleFeedback);

  for (let p = 0; p < 3; p++) {
    sim = chooseStage4VideogameOption(sim, 'A');
    assert.equal(sim.stage4?.gamePuzzleSolvedCount, p + 1);
  }
  assert.equal(sim.stage4?.gamePuzzlePending, false);

  // 8. Hold victory beat -> Family Ending at ~7 years old in front of finished meia-água!
  for (let i = 0; i < 40; i++) {
    sim = stepSimulationTimers(sim, 0.1);
    if (sim.questPhase === 's4_ending_family_7y') break;
  }
  assert.equal(sim.questPhase, 's4_ending_family_7y');
  assert.equal(sim.stage4?.cutscene, 'family_ending_7y');
  assert.equal(sim.stage4?.cristianAge, 'child_7y');
  assert.equal(sim.stage4?.buildStage, 3);
  seenCristianAges.push(sim.stage4!.cristianAge);
  assert.equal(getStage4CutsceneCaption(sim)?.text, STAGE_4_CLOSING_QUOTE);

  // Verify Cristian grows through all 5 distinct age stages!
  assert.deepEqual(seenCristianAges, ['unborn', 'baby', 'toddler', 'child_5y', 'child_7y']);

  sim = stepSimulationTimers(sim, 2.4);
  assert.equal(sim.stage4?.endingReadyToFinish, true);

  sim = finishStage4Ending(sim);
  assert.equal(sim.questPhase, 'stage_complete');
});

test('Stage 4 narrative preserves blond Cristian, Nani maternity trip, yellow crib & Tio Léo toys, calm birth, zero copyrighted logos, and stops around age 7', () => {
  const allText = [
    ...Object.values(STAGE_4_DIALOGUES).flatMap((d) => d.lines.map((l) => l.text)),
    ...STAGE_4_MEMORIES.map((m) => `${m.title} ${m.description}`),
    STAGE_4_CLOSING_QUOTE,
  ]
    .join(' ')
    .toLowerCase();

  assert.ok(allText.includes('loirinho'));
  assert.ok(allText.includes('vai ser um meninão!'));
  assert.ok(allText.includes('nani'));
  assert.ok(allText.includes('carmela dutra'));
  assert.ok(allText.includes('bercinho') || allText.includes('berço'));
  assert.ok(allText.includes('tio léo'));
  assert.ok(allText.includes('meia-água'));
  assert.ok(allText.includes('bicicleta'));
  assert.ok(allText.includes('videogame'));
  // Chronology check: bicycle arrival must lead to labor walk, never directly to building the meia-água
  assert.equal(STAGE_4_DIALOGUES.s4_bicycle_arrival.onCompleteAction, 's4_start_labor_walk');
  assert.equal(STAGE_4_DIALOGUES.s4_crib_reflection.onCompleteAction, 's4_start_build_meia_agua');
  assert.equal(STAGE_4_DIALOGUES.s4_construction_done.onCompleteAction, 's4_start_toddler_home');
  // Ensure birth is calm and non-traumatic, and no copyrighted Tomb Raider trademark text is copied
  assert.equal(allText.includes('emergência'), false);
  assert.equal(allText.includes('tomb raider'), false);
});





