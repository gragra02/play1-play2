import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceDialogue, findNearestInteractable, stepSimulationTimers, triggerInteraction } from './rules';
import {
  STAGE6_SCENE1_LAYOUT,
  STAGE_6_DIALOGUES,
  findStage6FaceOverlaps,
  getStage6BirthdayFaceBoxes,
  getStage6CharacterFaceBounds,
  getStage6FinalFaceBoxes,
  getStage6VideogameFaceBoxes,
  isPointInStage6PoolWater,
  isStage6PiscinaBoxWalkable,
  isStage6SalaFamiliaBoxWalkable,
} from './stage6Data';
import {
  advanceStage6VideogameRound,
  blowStage6BirthdayCandles,
  completeStage6Volume1,
  createStage6Simulation,
  startStage6BedroomTransition,
  startStage6BirthdayTransition,
  startStage6FinalTransition,
  startStage6PoolTransition,
  startStage6VideogameTransition,
} from './stage6Rules';
import {
  S6_MIN_BALLOON_SECONDS,
  S6_SCENE1_APPROACH_SECONDS,
  S6_SCENE1_HUG_ZOOM_SECONDS,
  S6_SCENE4_BED_TV_SECONDS,
  S6_SCENE4_COMFORT_SECONDS,
  S6_TRANSITION_DURATION_SECONDS,
  getStage6MinReadingSeconds,
  getStage6VisibleText,
} from './stage6Timing';

test('Stage 6 Timing: typewriter ~35ms/char and minimum reading time >= 2.5s', () => {
  const shortText = 'Seremos muito felizes!';
  assert.equal(getStage6MinReadingSeconds(shortText), S6_MIN_BALLOON_SECONDS);

  const early = getStage6VisibleText(shortText, 0.2);
  assert.equal(early.isTypingComplete, false);
  assert.equal(early.canContinue, false);

  const mid = getStage6VisibleText(shortText, 1.2);
  assert.equal(mid.isTypingComplete, true);
  assert.equal(mid.canContinue, false);

  const ready = getStage6VisibleText(shortText, 2.6);
  assert.equal(ready.isTypingComplete, true);
  assert.equal(ready.canContinue, true);
});

test('Stage 6 Cena 1: family walks together, hugs, shows exact script quote without auto-advancing, and has zero face overlap', () => {
  let sim = createStage6Simulation(false, []);
  assert.equal(sim.stageId, 'stage-6');
  assert.equal(sim.stage6?.mapId, 's6_sala_familia');
  assert.equal(sim.stage6?.cutscene, 's6_family_hug');

  // Walkable floor & blocked sofa/TV panel
  assert.equal(isStage6SalaFamiliaBoxWalkable(380, 410, 398, 424), true);
  assert.equal(isStage6SalaFamiliaBoxWalkable(600, 380, 618, 394), false);

  // During approach animation, dialogue is not open yet
  sim = stepSimulationTimers(sim, S6_SCENE1_APPROACH_SECONDS * 0.5);
  assert.equal(sim.activeDialogue, null);

  // After approach + hug zoom completes, exact script dialogue opens
  sim = stepSimulationTimers(sim, S6_SCENE1_APPROACH_SECONDS + S6_SCENE1_HUG_ZOOM_SECONDS + 0.5);
  assert.equal(sim.activeDialogue?.id, 's6_scene1_hug_quote');
  assert.equal(sim.activeDialogue?.lines[0].text, 'Olha só a família que a gente construiu...');
  assert.equal(STAGE_6_DIALOGUES.s6_scene1_hug_quote.lines.length, 4);
  assert.equal(STAGE_6_DIALOGUES.s6_scene1_hug_quote.lines[3].text, 'Seremos muito felizes!');

  // Regra 10: dialogue NEVER auto-advances when timers keep ticking
  sim = stepSimulationTimers(sim, 12.0);
  assert.equal(sim.activeDialogue?.id, 's6_scene1_hug_quote');
  assert.equal(sim.dialogueLineIndex, 0);

  // Manual advance through all 4 lines completes hug and enters exploration with zero face overlap
  while (sim.activeDialogue) {
    sim = advanceDialogue(sim);
  }
  assert.equal(sim.activeDialogue, null);
  assert.equal(sim.questPhase, 's6_explore_sala_familia');
  assert.ok(sim.stage6?.unlockedMemories.includes('mem_s6_abraco_familia'));

  // Verify all 6 scene dialogue sequences are stored verbatim
  assert.equal(STAGE_6_DIALOGUES.s6_scene2_pool.lines.length, 3);
  assert.equal(STAGE_6_DIALOGUES.s6_scene3_videogame.lines.length, 4);
  assert.equal(STAGE_6_DIALOGUES.s6_scene4_comfort.lines[0].text, 'Não precisa falar nada. Eu estou aqui.');
  assert.equal(STAGE_6_DIALOGUES.s6_scene4_bed_quote.lines[2].text, 'Dentro do abraço do Ariel.');
  assert.equal(STAGE_6_DIALOGUES.s6_scene5_sink.lines[3].text, 'Ih... não estou mais aqui!');
  assert.equal(STAGE_6_DIALOGUES.s6_scene6_birthday.lines.length, 3);

  const s = 2.05;
  const boxes = [
    getStage6CharacterFaceBounds('grazi', 'Grazi', sim.player.x, sim.player.y, Math.round(48 * 1.6 * s)),
    ...sim.npcs.map((n) =>
      getStage6CharacterFaceBounds(
        n.id,
        n.name,
        n.x,
        n.y,
        Math.round((n.role === 'ariel' ? 49 : n.role === 'cristian' ? 43 : 34) * 1.6 * s),
      ),
    ),
  ];
  assert.equal(findStage6FaceOverlaps(boxes).length, 0);
  assert.ok(STAGE6_SCENE1_LAYOUT.hugCenter.x > 0);
});

test('Stage 6 Cena 2: contextual 4.8s transition to pool, walkable deck + water detection, and playing with Ariel, Cris, and Lara', () => {
  let sim = startStage6PoolTransition(createStage6Simulation(true, []));
  assert.equal(sim.stage6?.cutscene, 's6_transition_to_pool');

  // Contextual transition takes 4.8s before arriving at the pool
  sim = stepSimulationTimers(sim, 2.0);
  assert.equal(sim.stage6?.cutscene, 's6_transition_to_pool');
  sim = stepSimulationTimers(sim, S6_TRANSITION_DURATION_SECONDS);
  assert.equal(sim.stage6?.mapId, 's6_piscina_condominio');
  assert.equal(sim.questPhase, 's6_explore_piscina');

  // Deck and pool water are walkable; background building/fence is blocked
  assert.equal(isStage6PiscinaBoxWalkable(580, 440, 598, 454), true);
  assert.equal(isPointInStage6PoolWater(590, 446), false);
  assert.equal(isPointInStage6PoolWater(374, 354), true);
  assert.equal(isStage6PiscinaBoxWalkable(300, 120, 318, 134), false);

  // Interact with Ariel, Cris, and Lara in the pool -> opens verbatim s6_scene2_pool dialogue & unlocks memory
  for (const role of ['lara', 'cristian', 'ariel'] as const) {
    const npc = sim.npcs.find((n) => n.role === role)!;
    sim = { ...sim, player: { ...sim.player, x: npc.x, y: npc.y + 10 } };
    const target = findNearestInteractable(sim);
    assert.ok(target, `Expected pool interactable for ${role}`);
    sim = triggerInteraction(sim).next;
  }

  assert.equal(sim.stage6?.poolPlayedWith.length, 3);
  assert.ok(sim.stage6?.unlockedMemories.includes('mem_s6_dia_piscina'));
  assert.equal(sim.activeDialogue?.id, 's6_scene2_pool');
  assert.equal(sim.activeDialogue?.lines[0].text, 'Hoje é dia de esquecer os problemas e aproveitar!');
});

test('Stage 6 Cena 3: time-passage transition to videogame with Cris (19) & Lara (15), interactive rounds, zero face overlap, and verbatim dialogue', () => {
  let sim = startStage6VideogameTransition(createStage6Simulation(true, []));
  assert.equal(sim.stage6?.cutscene, 's6_transition_to_videogame');

  sim = stepSimulationTimers(sim, S6_TRANSITION_DURATION_SECONDS + 0.1);
  assert.equal(sim.stage6?.mapId, 's6_sala_videogame_teens');
  assert.equal(sim.stage6?.cutscene, 's6_videogame_family');

  // Zero face overlaps among all 4 seated gamers
  assert.equal(findStage6FaceOverlaps(getStage6VideogameFaceBoxes()).length, 0);

  // Interactive 3 rounds -> opens verbatim s6_scene3_videogame dialogue & unlocks memory
  sim = advanceStage6VideogameRound(sim);
  assert.equal(sim.stage6?.videogameRound, 1);
  assert.equal(sim.activeDialogue, null);
  sim = advanceStage6VideogameRound(sim);
  assert.equal(sim.stage6?.videogameRound, 2);
  sim = advanceStage6VideogameRound(sim);
  assert.equal(sim.stage6?.videogameCompleted, true);
  assert.ok(sim.stage6?.unlockedMemories.includes('mem_s6_videogame_familia'));
  assert.equal(sim.activeDialogue?.id, 's6_scene3_videogame');
  assert.equal(sim.activeDialogue?.lines[0].text, 'Pode admitir, Ariel, você não ganha de mim!');
});

test('Stage 6 Cena 4: soft transition to bedroom, quiet comfort dialogue, and close-up bed TV embrace with verbatim quote', () => {
  let sim = startStage6BedroomTransition(createStage6Simulation(true, []));
  assert.equal(sim.stage6?.cutscene, 's6_transition_to_bedroom');

  sim = stepSimulationTimers(sim, S6_TRANSITION_DURATION_SECONDS + 0.1);
  assert.equal(sim.stage6?.mapId, 's6_quarto_casal_noite');
  assert.equal(sim.stage6?.cutscene, 's6_bedroom_comfort');

  sim = stepSimulationTimers(sim, S6_SCENE4_COMFORT_SECONDS + 0.1);
  assert.equal(sim.activeDialogue?.id, 's6_scene4_comfort');
  assert.equal(sim.activeDialogue?.lines[0].text, 'Não precisa falar nada. Eu estou aqui.');

  // Manual advance transitions into the close-up couple-in-bed TV scene
  sim = advanceDialogue(sim);
  assert.equal(sim.stage6?.cutscene, 's6_bedroom_bed_tv');
  assert.ok(sim.stage6?.unlockedMemories.includes('mem_s6_abraco_quarto'));

  sim = stepSimulationTimers(sim, S6_SCENE4_BED_TV_SECONDS + 0.1);
  assert.equal(sim.activeDialogue?.id, 's6_scene4_bed_quote');
  assert.equal(sim.activeDialogue?.lines[2].text, 'Dentro do abraço do Ariel.');

  // Manual advance finishes Cena 4 and starts Cena 5 transition to kitchen
  sim = advanceDialogue(sim);
  sim = advanceDialogue(sim);
  sim = advanceDialogue(sim);
  assert.equal(sim.stage6?.cutscene, 's6_transition_to_kitchen');
});

test('Stage 6 Cena 5: playable kitchen sink unclogging with verbatim script, Grazi exit, and water draining', () => {
  let sim = createStage6Simulation(true, []);
  sim = startStage6BedroomTransition(sim);
  sim = stepSimulationTimers(sim, S6_TRANSITION_DURATION_SECONDS + 0.1);
  sim = stepSimulationTimers(sim, S6_SCENE4_COMFORT_SECONDS + 0.1);
  sim = advanceDialogue(sim);
  sim = stepSimulationTimers(sim, S6_SCENE4_BED_TV_SECONDS + 0.1);
  sim = advanceDialogue(sim);
  sim = advanceDialogue(sim);
  sim = advanceDialogue(sim);
  assert.equal(sim.stage6?.cutscene, 's6_transition_to_kitchen');

  // After 4.8s contextual transition, enters playable kitchen
  sim = stepSimulationTimers(sim, S6_TRANSITION_DURATION_SECONDS + 0.1);
  assert.equal(sim.stage6?.mapId, 's6_cozinha_pia');
  assert.equal(sim.questPhase, 's6_explore_cozinha');
  assert.equal(sim.stage6?.cutscene, 'none');

  // Player walks near Ariel/sink on the tiled floor
  sim = { ...sim, player: { ...sim.player, x: 408, y: 468 } };

  // Interactive Step 1
  sim = triggerInteraction(sim).next;
  assert.equal(sim.stage6?.sinkStep, 1);
  assert.equal(sim.activeDialogue?.lines[0].text, 'Empurra mais, marido! Você consegue!');
  sim = advanceDialogue(sim);

  // Interactive Step 2
  sim = triggerInteraction(sim).next;
  assert.equal(sim.stage6?.sinkStep, 2);
  assert.equal(sim.activeDialogue?.lines[0].text, 'Isso! Mais um pouquinho!');
  sim = advanceDialogue(sim);

  // Interactive Step 3 -> Ariel laughs + Grazi "Ih... não estou mais aqui!" -> finale
  sim = triggerInteraction(sim).next;
  assert.equal(sim.stage6?.sinkStep, 3);
  assert.equal(sim.activeDialogue?.lines[0].text, 'Hahaha! Tô ficando irritado!');
  assert.equal(sim.activeDialogue?.lines[1].text, 'Ih... não estou mais aqui!');
  sim = advanceDialogue(sim);
  sim = advanceDialogue(sim);
  assert.equal(sim.stage6?.cutscene, 's6_kitchen_sink_finale');
  assert.ok(sim.stage6?.unlockedMemories.includes('mem_s6_pia_entupida'));

  // Finale finishes: water drained, Ariel celebrating, sinkCompleted = true
  sim = stepSimulationTimers(sim, 5.0);
  assert.equal(sim.stage6?.cutscene, 'none');
  assert.equal(sim.stage6?.sinkCompleted, true);
});

test('Stage 6 Cena 6: birthday party (23/11/2026) with 6 non-overlapping characters, verbatim dialogue, and blowing candles', () => {
  let sim = startStage6BirthdayTransition(createStage6Simulation(true, []));
  assert.equal(sim.stage6?.cutscene, 's6_transition_to_birthday');

  // After 4.8s transition, enters dining room birthday party
  sim = stepSimulationTimers(sim, S6_TRANSITION_DURATION_SECONDS + 0.1);
  assert.equal(sim.stage6?.mapId, 's6_sala_aniversario');
  assert.equal(sim.stage6?.cutscene, 's6_birthday_party');
  assert.equal(sim.stage6?.birthdayCandlesLit, true);

  // Zero face overlaps among all 6 characters (Cris, Grazi, Ariel, Lara, Manu, Marquinho)
  assert.equal(findStage6FaceOverlaps(getStage6BirthdayFaceBoxes()).length, 0);

  // Opens verbatim birthday dialogue
  sim = stepSimulationTimers(sim, 1.5);
  assert.equal(sim.activeDialogue?.id, 's6_scene6_birthday');
  assert.equal(sim.activeDialogue?.lines[0].text, 'Hoje o dia é todinho seu!');
  assert.equal(sim.activeDialogue?.lines[1].text, 'Vamos, pai! Sopra as velinhas!');
  assert.equal(sim.activeDialogue?.lines[2].text, 'Mas primeiro tem que fazer um pedido!');

  // Manual advance unlocks candle blowing
  sim = advanceDialogue(sim);
  sim = advanceDialogue(sim);
  sim = advanceDialogue(sim);
  assert.equal(sim.stage6?.birthdayPhase, 'ready_to_blow');

  // Blowing out the candles extinguishes them, unlocks memory, and transitions to celebration
  sim = blowStage6BirthdayCandles(sim);
  assert.equal(sim.stage6?.birthdayCandlesLit, false);
  assert.equal(sim.stage6?.birthdayPhase, 'blowing');
  assert.ok(sim.stage6?.unlockedMemories.includes('mem_s6_aniversario_ariel'));

  sim = stepSimulationTimers(sim, 2.0);
  assert.equal(sim.stage6?.birthdayPhase, 'celebrating');
});

test('Stage 6 Cena Final: Volume 2 invitation with zero face overlap, verbatim closing quote, Volume 1 end card, and stage completion', () => {
  let sim = startStage6FinalTransition(createStage6Simulation(true, []));
  assert.equal(sim.stage6?.cutscene, 's6_transition_to_final');

  // After 4.8s contextual transition, enters sunset terrace finale
  sim = stepSimulationTimers(sim, S6_TRANSITION_DURATION_SECONDS + 0.1);
  assert.equal(sim.stage6?.mapId, 's6_tela_final_volume1');
  assert.equal(sim.stage6?.cutscene, 's6_final_volume2');

  // Zero face overlaps among all 6 characters standing on the terrace
  assert.equal(findStage6FaceOverlaps(getStage6FinalFaceBoxes()).length, 0);

  // Opens exact verbatim closing narration + Volume 2 invitation
  sim = stepSimulationTimers(sim, 1.5);
  assert.equal(sim.activeDialogue?.id, 's6_final_volume2');
  assert.equal(
    sim.activeDialogue?.lines[1].text,
    'Ariel, essa foi apenas a primeira parte da nossa aventura. Que tal construirmos juntos o Volume 2?',
  );

  // Manual advance shows the Volume 1 end card and unlocks final memory
  sim = advanceDialogue(sim);
  sim = advanceDialogue(sim);
  assert.equal(sim.stage6?.cutscene, 's6_volume1_endcard');
  assert.ok(sim.stage6?.unlockedMemories.includes('mem_s6_convite_vol2'));

  // Confirming end card completes Stage 6
  sim = completeStage6Volume1(sim);
  assert.equal(sim.questPhase, 'stage_complete');
  assert.equal(sim.stage6?.endingReadyToFinish, true);
});
