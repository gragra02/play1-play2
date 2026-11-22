import assert from 'node:assert/strict';
import test from 'node:test';
import {
  advanceDialogue,
  findNearestInteractable,
  skipIntroCutscene,
  stepSimulationTimers,
  triggerInteraction,
} from './rules';
import {
  STAGE5_APARTMENT_EXIT_POS,
  STAGE5_GUESSER_DOOR_POS,
  STAGE_5_DIALOGUES,
  STAGE_5_ETAPA1_MEMORY_IDS,
  STAGE_5_KATA_MOVES,
  STAGE_5_MEMORIES,
  STAGE_5_PHONE_CALL_STEPS,
} from './stage5Data';
import {
  advanceStage5PregnancyCallCutscene,
  createStage5Simulation,
  finishStage5Ending,
  getStage5CutsceneCaption,
  getStage5PhoneCallSnapshot,
  restartStage5KarateMinigame,
  startStage5KarateMinigame,
  startStage5PregnancyTimePassage,
  triggerStage5KarateInput,
} from './stage5Rules';

// ============================================================================
// STAGE 5 — BELA VISTA (ETAPAS 1 A 3) DEDICATED UNIT TESTS
// ============================================================================

test('Stage 5 Etapa 1: arrival at Mercado Guesser, intro dialogue with Grazi/Ariel/Cris, free exploration of street & upstairs apartment, and 3 collectible memories', () => {
  let sim = createStage5Simulation(false, []);
  assert.equal(sim.stageId, 'stage-5');
  assert.equal(sim.questPhase, 's5_intro_bela_vista');
  assert.equal(sim.stage5?.cutscene, 'bela_vista_arrival');
  assert.equal(sim.stage5?.mapId, 'bela_vista_guesser');
  assert.equal(sim.stage5?.graziPregnant, false);

  // Skip or finish arrival cutscene -> opens short intro dialogue between Grazi, Ariel, and Cris
  sim = skipIntroCutscene(sim);
  assert.equal(sim.questPhase, 's5_explore_guesser_street');
  assert.equal(sim.stage5?.cutscene, 'none');
  assert.equal(sim.activeDialogue?.id, 's5_guesser_intro');

  // Verify Grazi, Ariel, and Cris all speak in the arrival dialogue using adult speaker IDs
  const speakers = sim.activeDialogue!.lines.map((l) => l.speaker);
  assert.ok(speakers.includes('grazi_adult'));
  assert.ok(speakers.includes('ariel_adult'));
  assert.ok(speakers.includes('cristian'));

  while (sim.activeDialogue) {
    sim = advanceDialogue(sim);
  }

  // Collect street memory 1: Lanche no Mercado Guesser
  const memLanche = STAGE_5_MEMORIES.find((m) => m.id === 'mem_s5_lanche_mercado')!;
  sim = { ...sim, player: { ...sim.player, x: memLanche.x, y: memLanche.y } };
  let target = findNearestInteractable(sim);
  assert.equal(target?.id, 'mem_s5_lanche_mercado');
  sim = triggerInteraction(sim).next;
  assert.ok(sim.stage5?.unlockedMemories.includes('mem_s5_lanche_mercado'));
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Collect street memory 2: A bicicleta na calçada
  const memBike = STAGE_5_MEMORIES.find((m) => m.id === 'mem_s5_bicicleta_calcada')!;
  sim = { ...sim, player: { ...sim.player, x: memBike.x, y: memBike.y } };
  target = findNearestInteractable(sim);
  assert.equal(target?.id, 'mem_s5_bicicleta_calcada');
  sim = triggerInteraction(sim).next;
  assert.ok(sim.stage5?.unlockedMemories.includes('mem_s5_bicicleta_calcada'));
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Enter the upstairs apartment above Mercado Guesser
  sim = {
    ...sim,
    player: {
      ...sim.player,
      x: STAGE5_GUESSER_DOOR_POS.x,
      y: STAGE5_GUESSER_DOOR_POS.y,
    },
  };
  target = findNearestInteractable(sim);
  assert.equal(target?.id, 's5_door_enter_apartment');
  sim = triggerInteraction(sim).next;
  assert.equal(sim.stage5?.mapId, 'bela_vista_apartment');

  // Collect apartment memory 3: Primeira noite no apartamento
  const memPrimeiraNoite = STAGE_5_MEMORIES.find((m) => m.id === 'mem_s5_primeira_noite')!;
  sim = { ...sim, player: { ...sim.player, x: memPrimeiraNoite.x, y: memPrimeiraNoite.y } };
  target = findNearestInteractable(sim);
  assert.equal(target?.id, 'mem_s5_primeira_noite');
  sim = triggerInteraction(sim).next;
  assert.ok(sim.stage5?.unlockedMemories.includes('mem_s5_primeira_noite'));
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Verify all 3 Etapa 1 memories are unlocked
  for (const memId of STAGE_5_ETAPA1_MEMORY_IDS) {
    assert.ok(sim.stage5?.unlockedMemories.includes(memId), `Missing Etapa 1 memory ${memId}`);
  }

  // Exit back down to the street in front of Mercado Guesser
  sim = {
    ...sim,
    player: {
      ...sim.player,
      x: STAGE5_APARTMENT_EXIT_POS.x,
      y: STAGE5_APARTMENT_EXIT_POS.y,
    },
  };
  target = findNearestInteractable(sim);
  assert.equal(target?.id, 's5_door_exit_apartment');
  sim = triggerInteraction(sim).next;
  assert.equal(sim.stage5?.mapId, 'bela_vista_guesser');
});

test('Stage 5 Etapa 2: Karate Championship Kata Minigame (8 movements, 3 rounds of increasing difficulty, shrinking circle, Ariel "ISSO!" & "Calma, respira!", Grazi emotional tears in Round 3, medal with up to 2 errors, and retry)', () => {
  let sim = createStage5Simulation(true, []);
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Verify 8 kata movements across 3 rounds with increasing difficulty (shrinking duration decreases)
  assert.equal(STAGE_5_KATA_MOVES.length, 8);
  const r1Dur = STAGE_5_KATA_MOVES.find((m) => m.round === 1)!.shrinkDuration;
  const r2Dur = STAGE_5_KATA_MOVES.find((m) => m.round === 2)!.shrinkDuration;
  const r3Dur = STAGE_5_KATA_MOVES.find((m) => m.round === 3)!.shrinkDuration;
  assert.ok(r1Dur > r2Dur && r2Dur > r3Dur);

  // Start the karate minigame
  sim = startStage5KarateMinigame(sim);
  assert.equal(sim.questPhase, 's5_karate_minigame');
  assert.equal(sim.stage5?.cutscene, 'karate_kata_minigame');
  assert.equal(sim.stage5?.karate.round, 1);
  assert.equal(sim.stage5?.karate.totalMoves, 8);

  // Move 1 (Perfect hit in the sweet spot): Cris executes bow
  let res = triggerStage5KarateInput(sim, STAGE_5_KATA_MOVES[0].dir);
  sim = res.next;
  assert.equal(res.hit, true);
  assert.equal(res.rating, 'PERFEITO!');
  assert.equal(sim.stage5?.karate.currentPose, STAGE_5_KATA_MOVES[0].move);
  assert.ok((sim.stage5?.karate.score ?? 0) >= 150);

  // Move 2 (Good hit outside sweet spot): step timer so ringProgress is early (0.2), then hit
  sim = {
    ...sim,
    stage5: {
      ...sim.stage5!,
      karate: { ...sim.stage5!.karate, ringProgress: 0.25 },
    },
  };
  res = triggerStage5KarateInput(sim, STAGE_5_KATA_MOVES[1].dir);
  sim = res.next;
  assert.equal(res.hit, true);
  assert.equal(res.rating, 'BOM!');
  // 2 consecutive hits -> Ariel shouts "ISSO!" with screen shake!
  assert.equal(sim.stage5?.karate.arielBubbleText, 'ISSO!');
  assert.ok((sim.stage5?.karate.screenShakeTimer ?? 0) > 0);

  // Move 3 (Intentional wrong key -> Error 1): Ariel says "Calma, respira!"
  const wrongDir = STAGE_5_KATA_MOVES[2].dir === 'up' ? 'down' : 'up';
  res = triggerStage5KarateInput(sim, wrongDir);
  sim = res.next;
  assert.equal(res.hit, false);
  assert.equal(res.rating, 'ERRO!');
  assert.equal(sim.stage5?.karate.missCount, 1);
  assert.equal(sim.stage5?.karate.arielBubbleText, 'Calma, respira!');

  // Moves 4, 5, 6 (Round 2): hit all 3 -> advances to Round 3 where Grazi cries tears of emotion
  assert.equal(sim.stage5?.karate.round, 2);
  for (let idx = 3; idx <= 5; idx++) {
    res = triggerStage5KarateInput(sim, STAGE_5_KATA_MOVES[idx].dir);
    sim = res.next;
    assert.equal(res.hit, true);
  }
  assert.equal(sim.stage5?.karate.round, 3);
  assert.equal(sim.stage5?.karate.graziEmotionalTears, true);

  // Move 7 (Intentional 2nd error): still allowed for medal (up to 2 errors!)
  const wrongDir7 = STAGE_5_KATA_MOVES[6].dir === 'up' ? 'down' : 'up';
  res = triggerStage5KarateInput(sim, wrongDir7);
  sim = res.next;
  assert.equal(sim.stage5?.karate.missCount, 2);

  // Move 8 (Correct final move): with 2 errors (<= 2 maxErrorsForMedal), Cris wins the medal & reaches podium!
  res = triggerStage5KarateInput(sim, STAGE_5_KATA_MOVES[7].dir);
  sim = res.next;
  assert.equal(res.kataCompleted, true);
  assert.equal(sim.stage5?.karate.passedMedal, true);
  assert.equal(sim.stage5?.cutscene, 'karate_podium');
  assert.ok(sim.stage5?.unlockedMemories.includes('mem_s5_karate'));

  // Also verify retry requirement when player makes > 2 errors (e.g. 3 errors)
  let retrySim = startStage5KarateMinigame(sim);
  for (let idx = 0; idx < 8; idx++) {
    const dir =
      idx < 3
        ? STAGE_5_KATA_MOVES[idx].dir === 'up'
          ? 'down'
          : 'up'
        : STAGE_5_KATA_MOVES[idx].dir;
    retrySim = triggerStage5KarateInput(retrySim, dir).next;
  }
  assert.equal(retrySim.stage5?.karate.missCount, 3);
  assert.equal(retrySim.stage5?.karate.passedMedal, false);
  assert.equal(retrySim.stage5?.karate.awaitingRetry, true);

  // Clicking "Tentar Novamente" resets the kata cleanly
  retrySim = restartStage5KarateMinigame(retrySim);
  assert.equal(retrySim.stage5?.karate.active, true);
  assert.equal(retrySim.stage5?.karate.moveIndex, 0);
  assert.equal(retrySim.stage5?.karate.missCount, 0);
});

test('Stage 5 Etapa 3: Split-screen pregnancy phone call uses only adult portraits, slow typewriter text, Ariel silent beat then hopes for a baby girl', () => {
  let sim = createStage5Simulation(true, []);
  sim = startStage5KarateMinigame(sim);
  for (const step of STAGE_5_KATA_MOVES) {
    sim = triggerStage5KarateInput(sim, step.dir).next;
  }
  assert.equal(sim.stage5?.cutscene, 'karate_podium');

  // Step through podium cutscene -> celebration dialogue -> launches Etapa 3 phone call
  sim = stepSimulationTimers(sim, 10.0);
  assert.equal(sim.activeDialogue?.id, 's5_karate_podium_celebration');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  assert.equal(sim.questPhase, 's5_cutscene_pregnancy_call');
  assert.equal(sim.stage5?.cutscene, 'pregnancy_phone_call');

  // Verify every phone call step uses adult speaker IDs ('grazi_adult' / 'ariel_adult')
  for (const step of STAGE_5_PHONE_CALL_STEPS) {
    assert.ok(
      step.speaker === 'grazi_adult' || step.speaker === 'ariel_adult',
      `Unexpected speaker ${step.speaker} in phone call`,
    );
  }
  for (const dlg of Object.values(STAGE_5_DIALOGUES)) {
    for (const line of dlg.lines) {
      assert.notEqual(line.speaker, 'grazi');
      assert.notEqual(line.speaker, 'ariel');
    }
  }

  // Verify slow typewriter effect at start of step 1
  const snap0 = getStage5PhoneCallSnapshot(sim)!;
  assert.equal(snap0.stepIndex, 0);
  assert.ok(snap0.visibleText.length < snap0.step.text.length);
  assert.equal(snap0.isTypingComplete, false);

  // Advance through all 5 steps of the phone call:
  // Step 1 (Grazi calls) -> complete typing -> advance to Step 2 (Grazi reveals pregnancy)
  sim = advanceStage5PregnancyCallCutscene(sim);
  assert.equal(getStage5PhoneCallSnapshot(sim)?.isTypingComplete, true);
  sim = advanceStage5PregnancyCallCutscene(sim);
  assert.equal(getStage5PhoneCallSnapshot(sim)?.stepIndex, 1);

  // Step 2 -> complete typing -> advance to Step 3 (Ariel silent beat)
  sim = advanceStage5PregnancyCallCutscene(sim);
  sim = advanceStage5PregnancyCallCutscene(sim);
  const snap3 = getStage5PhoneCallSnapshot(sim)!;
  assert.equal(snap3.stepIndex, 2);
  assert.equal(snap3.step.silentBeat, true);

  // Step 3 -> complete typing -> advance to Step 4 (Ariel smiles and hopes it's a girl)
  sim = advanceStage5PregnancyCallCutscene(sim);
  sim = advanceStage5PregnancyCallCutscene(sim);
  const snap4 = getStage5PhoneCallSnapshot(sim)!;
  assert.equal(snap4.stepIndex, 3);
  assert.equal(snap4.step.arielSmiling, true);
  assert.ok(snap4.step.text.toLowerCase().includes('menina'));
  assert.ok(getStage5CutsceneCaption(sim)?.badge.includes('TELA DIVIDIDA'));
});

test('Stage 5 Etapas 4 a 8: pregnancy time passage ("Alguns meses depois" in apartment & street), baby Lara arrival & Cris hug, Lara 2yo singing "Pepelequinha", playable park reunion with 4 characters (no Ariel) -> family photo, and return to Ponte do Imaruim', () => {
  let sim = createStage5Simulation(true, []);

  // ETAPA 4: Pregnancy time passage ("Alguns meses depois", apartment -> street, graziPregnant = true)
  sim = startStage5PregnancyTimePassage(sim);
  assert.equal(sim.questPhase, 's5_cutscene_pregnancy_time');
  assert.equal(sim.stage5?.cutscene, 'pregnancy_time_passage');
  assert.equal(sim.stage5?.graziPregnant, true);
  assert.equal(sim.stage5?.mapId, 'bela_vista_apartment');
  assert.ok(
    getStage5CutsceneCaption(sim)?.text.toLowerCase().includes('alguns meses depois'),
  );

  // Step into the street half of Etapa 4
  sim = stepSimulationTimers(sim, 6.0);
  assert.equal(sim.stage5?.mapId, 'bela_vista_guesser');
  assert.equal(sim.stage5?.graziPregnant, true);

  // Finish Etapa 4 -> transitions to s5_prepare_lara_room (assembling crib, mobile, and layette after lara_announced = true)
  sim = stepSimulationTimers(sim, 4.0);
  assert.equal(sim.questPhase, 's5_prepare_lara_room');
  assert.equal(sim.stage5?.lara_announced, true);
  assert.equal(sim.stage5?.mapId, 'bela_vista_lara_room');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Assemble the 3 nursery steps (1: Berço, 2: Móbile, 3: Enxoval) -> launches Etapa 5 (lara_baby_arrival)
  for (let step = 0; step < 3; step++) {
    sim = {
      ...sim,
      player: { ...sim.player, x: 11.8 * 32, y: 9.6 * 32 },
    };
    const nurseryTarget = findNearestInteractable(sim);
    assert.equal(nurseryTarget?.id, 's5_nursery_assemble');
    sim = triggerInteraction(sim).next;
    while (sim.activeDialogue) sim = advanceDialogue(sim);
  }

  assert.equal(sim.questPhase, 's5_cutscene_lara_arrival');
  assert.equal(sim.stage5?.cutscene, 'lara_baby_arrival');
  assert.equal(sim.stage5?.nurseryStage, 3);
  assert.equal(sim.stage5?.graziPregnant, false);
  assert.equal(sim.stage5?.laraAge, 'baby');
  assert.ok(sim.stage5?.unlockedMemories.includes('mem_s5_chegada_lara'));

  // Finish baby Lara arrival animation -> triggers short emotional dialogue with baby in Grazi's arms
  sim = stepSimulationTimers(sim, 9.0);
  assert.equal(sim.activeDialogue?.id, 's5_lara_arrival_dialogue');
  while (sim.activeDialogue?.id === 's5_lara_arrival_dialogue') {
    sim = advanceDialogue(sim);
  }

  // ETAPA 6: Lara growing up (2 years old in the living room, dressed in pink dress)
  assert.equal(sim.questPhase, 's5_explore_apartment_lara');
  assert.equal(sim.stage5?.laraAge, 'toddler_2y');
  assert.equal(sim.activeDialogue?.id, 's5_lara_2yo_intro');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Interact with 2yo Lara in the living room -> triggers "Pepelequinha, pepelequinha!" dance cutscene
  const laraApt = sim.npcs.find((n) => n.role === 'lara')!;
  assert.ok(laraApt);
  sim = { ...sim, player: { ...sim.player, x: laraApt.x, y: laraApt.y + 12 } };
  sim = triggerInteraction(sim).next;
  assert.equal(sim.activeDialogue?.id, 's5_trigger_lara_dance');
  assert.ok(
    sim.activeDialogue!.lines.some((l) =>
      l.text.toLowerCase().includes('pepelequinha, pepelequinha'),
    ),
  );
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  assert.equal(sim.questPhase, 's5_cutscene_lara_dance');
  assert.equal(sim.stage5?.cutscene, 'lara_pepelequinha_dance');
  assert.ok(sim.stage5?.unlockedMemories.includes('mem_s5_pepelequinha'));

  // Finish Lara dance cutscene -> transitions to ETAPA 7: Bela Vista Park with skate park in front of church
  sim = stepSimulationTimers(sim, 10.5);
  assert.equal(sim.questPhase, 's5_explore_park_reunion');
  assert.equal(sim.stage5?.mapId, 'bela_vista_park_church');
  assert.equal(sim.activeDialogue?.id, 's5_park_intro');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  // Verify Ariel does NOT appear in Etapa 7, while Laura, Cris, Lucas (5yo) and Lara (2yo) are all present
  assert.equal(sim.npcs.some((n) => n.role === 'ariel'), false);
  assert.equal(sim.npcs.some((n) => n.role === 'laura'), true);
  assert.equal(sim.npcs.some((n) => n.role === 'cristian'), true);
  assert.equal(sim.npcs.some((n) => n.role === 'lucas'), true);
  assert.equal(sim.npcs.some((n) => n.role === 'lara'), true);

  // Step timers to verify Cris, Lucas, and Lara move around the park
  const crisBeforeX = sim.npcs.find((n) => n.role === 'cristian')!.x;
  sim = stepSimulationTimers(sim, 0.5);
  const crisAfterX = sim.npcs.find((n) => n.role === 'cristian')!.x;
  assert.notEqual(crisBeforeX, crisAfterX);

  // Talk to all 4 characters in the park (Laura, Cris, Lucas, Lara) -> triggers Family Photo & unlocks memory
  for (const role of ['laura', 'cristian', 'lucas', 'lara'] as const) {
    const npc = sim.npcs.find((n) => n.role === role)!;
    sim = { ...sim, player: { ...sim.player, x: npc.x, y: npc.y + 10 } };
    const target = findNearestInteractable(sim);
    assert.ok(target, `Expected interactable for ${role}`);
    sim = triggerInteraction(sim).next;
    assert.ok(sim.activeDialogue, `Expected dialogue for ${role}`);
    while (sim.activeDialogue) {
      sim = advanceDialogue(sim);
    }
  }

  // Talking to all 4 automatically launches the Family Photo cutscene & unlocks mem_s5_parque_primos
  assert.equal(sim.questPhase, 's5_cutscene_park_reunion');
  assert.equal(sim.stage5?.cutscene, 'park_family_reunion');
  assert.ok(sim.stage5?.unlockedMemories.includes('mem_s5_parque_primos'));

  // Finish Family Photo cutscene -> transitions to ETAPA 8: Return to Ponte do Imaruim (purchased apartment)
  sim = stepSimulationTimers(sim, 9.5);
  assert.equal(sim.activeDialogue?.id, 's5_ponte_imaruim_arrival');
  while (sim.activeDialogue) sim = advanceDialogue(sim);

  assert.equal(sim.questPhase, 's5_ending_ponte_imaruim');
  assert.equal(sim.stage5?.cutscene, 'ponte_imaruim_ending');
  assert.ok(sim.stage5?.unlockedMemories.includes('mem_s5_apartamento_proprio'));

  // Starts with slow farewell of Bela Vista, then arrives at Ponte do Imaruim condo and becomes ready to finish
  assert.equal(sim.stage5?.mapId, 'bela_vista_guesser');
  sim = stepSimulationTimers(sim, 4.2);
  assert.equal(sim.stage5?.mapId, 'ponte_imaruim_condo');
  assert.equal(sim.stage5?.endingReadyToFinish, true);

  sim = finishStage5Ending(sim);
  assert.equal(sim.questPhase, 'stage_complete');
});

