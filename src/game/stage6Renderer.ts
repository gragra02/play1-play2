import {
  SKIN_URLS,
  getCharacterWalkSheetImage,
  getSkinSprite,
} from './characterSkins';
import {
  getStage6BirthdayCakeSprite,
  getStage6BirthdayCandlesFxSprite,
  getStage6CoupleBedTvSprite,
  getStage6FamilyHugSprite,
  getStage6MapBackdrop,
  getStage6SinkWaterFxSprite,
} from './environmentArt';
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './mapData';
import {
  GLOBAL_CHAR_SCALE,
  drawShadow,
  getWalkSheetFrameBounds,
} from './pixelArt';
import type { ProcessedSprite } from './spriteSheet';
import type { ParticlePool } from './sprites';
import {
  S6_COZINHA_CHAR_SCALE,
  S6_PISCINA_CHAR_SCALE,
  S6_SALA_FAMILIA_CHAR_SCALE,
  S6_VIDEOGAME_CHAR_SCALE,
  STAGE6_COZINHA_BLOCKED_ZONES,
  STAGE6_COZINHA_HOTSPOTS,
  STAGE6_COZINHA_WALK_ZONES,
  STAGE6_PISCINA_BLOCKED_ZONES,
  STAGE6_PISCINA_HOTSPOTS,
  STAGE6_PISCINA_WALK_ZONES,
  STAGE6_PISCINA_WATER_ZONES,
  STAGE6_SALA_FAMILIA_BLOCKED_ZONES,
  STAGE6_SALA_FAMILIA_HOTSPOTS,
  STAGE6_SALA_FAMILIA_WALK_ZONES,
  STAGE6_FINAL_LAYOUT,
  STAGE6_SCENE1_LAYOUT,
  STAGE6_SCENE3_VIDEOGAME_LAYOUT,
  STAGE6_SCENE6_BIRTHDAY_LAYOUT,
  findStage6FaceOverlaps,
  getStage6BirthdayFaceBoxes,
  getStage6CharacterFaceBounds,
  getStage6FinalFaceBoxes,
  getStage6VideogameFaceBoxes,
  isPointInStage6PoolWater,
  type Stage6FaceBounds,
  type Stage6Zone,
} from './stage6Data';
import {
  S6_SCENE1_APPROACH_SECONDS,
  S6_TRANSITION_DURATION_SECONDS,
  S6_WALK_FRAME_STEP_PX,
} from './stage6Timing';
import type { Direction, SimulationState } from './types';

// ============================================================================
// STAGE 6 — NOSSA HISTÓRIA CONTINUA (100% Image-Based Pixel-Art Renderer)
// - imageSmoothingEnabled = false
// - Zero code-drawn furniture, props, or objects
// - Foot-anchored at cy + 8.5, Y-sorted by feet, zero rotation/stretching
// ============================================================================

const S6_ADULT_WALK_FRAMES = {
  right: [0, 1, 2, 6],
  left: [3, 4, 5, 7],
} as const;

let stage6DebugOverlay = false;

export function toggleStage6DebugOverlay(): boolean {
  stage6DebugOverlay = !stage6DebugOverlay;
  return stage6DebugOverlay;
}

function drawCrispSprite(
  ctx: CanvasRenderingContext2D,
  sprite: ProcessedSprite,
  cx: number,
  cy: number,
  targetH: number,
  flipX = false,
): void {
  const aspect = sprite.width / Math.max(1, sprite.height);
  const drawH = Math.round(targetH * GLOBAL_CHAR_SCALE);
  const drawW = Math.round(drawH * aspect);
  const footY = Math.round(cy + 8.5);
  const drawX = Math.round(cx);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(drawX, footY);
  if (flipX) ctx.scale(-1, 1);
  ctx.drawImage(sprite.canvas, Math.round(-drawW / 2), -drawH, drawW, drawH);
  ctx.restore();
}

function draw4x3WalkFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  dir: Direction,
  walkDistance: number,
  isMoving: boolean,
  cx: number,
  cy: number,
  targetH: number,
): boolean {
  if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) return false;
  const row = dir === 'down' ? 0 : dir === 'left' ? 1 : dir === 'right' ? 2 : 3;
  const stepCycle = [0, 1, 0, 2] as const;
  const col = isMoving
    ? stepCycle[Math.floor(Math.max(0, walkDistance) / S6_WALK_FRAME_STEP_PX) % stepCycle.length]
    : 0;
  const cellW = image.naturalWidth / 3;
  const cellH = image.naturalHeight / 4;
  const drawH = Math.round(targetH * GLOBAL_CHAR_SCALE);
  const drawW = Math.round(drawH * (cellW / Math.max(1, cellH)));
  const footY = Math.round(cy + 8.5);
  const drawX = Math.round(cx);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    image,
    Math.round(col * cellW),
    Math.round(row * cellH),
    Math.round(cellW),
    Math.round(cellH),
    Math.round(drawX - drawW / 2),
    footY - drawH,
    drawW,
    drawH,
  );
  ctx.restore();
  return true;
}

function drawAdultSheetCharacter(
  ctx: CanvasRenderingContext2D,
  who: 'grazi' | 'ariel',
  cx: number,
  cy: number,
  dir: Direction,
  walkDistance: number,
  isMoving: boolean,
  scaleBoost = S6_SALA_FAMILIA_CHAR_SCALE,
): void {
  const targetH = (who === 'ariel' ? 49 : 48) * scaleBoost;
  drawShadow(ctx, cx, cy + 6, 10 * scaleBoost, 4 * scaleBoost);

  if (isMoving) {
    const sheet = getCharacterWalkSheetImage(
      who === 'ariel' ? 's4ArielAdultWalk' : 's4GraziAdultWalk',
    );
    if (sheet) {
      const facing = dir === 'left' ? 'left' : 'right';
      const frames = S6_ADULT_WALK_FRAMES[facing];
      const frameIdx =
        Math.floor(Math.max(0, walkDistance) / S6_WALK_FRAME_STEP_PX) % frames.length;
      const bounds = getWalkSheetFrameBounds(sheet)?.[frames[frameIdx]];
      if (bounds) {
        const drawH = Math.round(targetH * GLOBAL_CHAR_SCALE);
        const drawW = Math.round(drawH * (bounds.width / Math.max(1, bounds.height)));
        const footY = Math.round(cy + 8.5);
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          sheet,
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
          Math.round(cx - drawW / 2),
          footY - drawH,
          drawW,
          drawH,
        );
        ctx.restore();
        return;
      }
    }
  }

  const sprite = getSkinSprite(who === 'ariel' ? SKIN_URLS.s4ArielAdult : SKIN_URLS.s4GraziAdult);
  if (sprite) {
    drawCrispSprite(ctx, sprite, cx, cy, targetH, dir === 'left');
  }
}

function drawCris12yo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dir: Direction,
  walkDistance: number,
  isMoving: boolean,
  scaleBoost = S6_SALA_FAMILIA_CHAR_SCALE,
): void {
  drawShadow(ctx, cx, cy + 6, 9 * scaleBoost, 3.6 * scaleBoost);
  const sheet = getCharacterWalkSheetImage('s6Cris12yoWalk');
  if (sheet) {
    draw4x3WalkFrame(ctx, sheet, dir, walkDistance, isMoving, cx, cy, 43 * scaleBoost);
  }
}

function drawLara5yo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dir: Direction,
  walkDistance: number,
  isMoving: boolean,
  scaleBoost = S6_SALA_FAMILIA_CHAR_SCALE,
): void {
  drawShadow(ctx, cx, cy + 6, 7.5 * scaleBoost, 3.0 * scaleBoost);
  const sheet = getCharacterWalkSheetImage('s6Lara5yoWalk');
  if (sheet) {
    draw4x3WalkFrame(ctx, sheet, dir, walkDistance, isMoving, cx, cy, 34 * scaleBoost);
  }
}

function drawStage6PoolCharacter(
  ctx: CanvasRenderingContext2D,
  sheetKey: 's6ArielPool' | 's6GraziPool' | 's6Cris12yoPool' | 's6Lara5yoPool',
  cx: number,
  cy: number,
  dir: Direction,
  walkDistance: number,
  isMoving: boolean,
  inWater: boolean,
  baseTargetH: number,
  t: number,
): void {
  const sheet = getCharacterWalkSheetImage(sheetKey);
  if (!sheet || !sheet.complete || sheet.naturalWidth <= 0) return;

  const cellW = sheet.naturalWidth / 3;
  const cellH = sheet.naturalHeight;
  let frameIdx = 0;
  if (inWater) {
    frameIdx = 2;
  } else if (isMoving) {
    const step = Math.floor(Math.max(0, walkDistance) / S6_WALK_FRAME_STEP_PX) % 2;
    frameIdx = step === 0 ? 1 : 0;
  }

  const scale = S6_PISCINA_CHAR_SCALE;
  const drawH = Math.round(baseTargetH * GLOBAL_CHAR_SCALE * scale);
  const drawW = Math.round(drawH * (cellW / Math.max(1, cellH)));
  const bob = inWater ? Math.sin(t * 3.4 + cx * 0.03) * 2.4 : 0;
  const footY = Math.round(cy + bob + (inWater ? 4 : 8.5));
  const flipX = !inWater && frameIdx === 1 && dir === 'left';

  if (!inWater) {
    drawShadow(ctx, cx, cy + 6, 9 * scale, 3.4 * scale);
  }

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(cx), footY);
  if (flipX) ctx.scale(-1, 1);
  ctx.drawImage(
    sheet,
    Math.round(frameIdx * cellW),
    0,
    Math.round(cellW),
    cellH,
    Math.round(-drawW / 2),
    -drawH,
    drawW,
    drawH,
  );
  ctx.restore();
}

export function renderStage6World(
  ctx: CanvasRenderingContext2D,
  sim: SimulationState,
  particles: ParticlePool,
  viewW: number,
  viewH: number,
): void {
  const s6 = sim.stage6;
  if (!s6) return;

  const worldW = MAP_COLS * TILE_SIZE;
  const worldH = MAP_ROWS * TILE_SIZE;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#140e0b';
  ctx.fillRect(0, 0, viewW, viewH);

  const baseScale = Math.min(viewW / worldW, viewH / worldH);
  const zoom = s6.cameraZoom || 1.0;
  const totalScale = baseScale * zoom;

  const camX = s6.cameraFocusX || worldW / 2;
  const camY = s6.cameraFocusY || worldH / 2;

  const halfVisW = viewW / (2 * totalScale);
  const halfVisH = viewH / (2 * totalScale);
  const clampedCamX =
    worldW <= halfVisW * 2
      ? worldW / 2
      : Math.max(halfVisW, Math.min(worldW - halfVisW, camX));
  const clampedCamY =
    worldH <= halfVisH * 2
      ? worldH / 2
      : Math.max(halfVisH, Math.min(worldH - halfVisH, camY));

  ctx.translate(viewW / 2, viewH / 2);
  ctx.scale(totalScale, totalScale);
  ctx.translate(-clampedCamX, -clampedCamY);

  const backdrop = getStage6MapBackdrop(s6.mapId);
  if (backdrop && backdrop.complete && backdrop.naturalWidth > 0) {
    ctx.drawImage(backdrop, 0, 0, worldW, worldH);
  }

  // ==========================================================================
  // CENA 1 · O ABRAÇO DA NOSSA FAMÍLIA
  // ==========================================================================
  if (s6.cutscene === 's6_family_hug') {
    const L = STAGE6_SCENE1_LAYOUT;
    const approachT = Math.min(1, Math.max(0, s6.cutsceneElapsed / S6_SCENE1_APPROACH_SECONDS));

    if (approachT < 1) {
      const eased = 1 - Math.pow(1 - approachT, 2);
      const arielX = L.arielStart.x + (L.arielMeet.x - L.arielStart.x) * eased;
      const arielY = L.arielStart.y + (L.arielMeet.y - L.arielStart.y) * eased;
      const graziX = L.graziStart.x + (L.graziMeet.x - L.graziStart.x) * eased;
      const graziY = L.graziStart.y + (L.graziMeet.y - L.graziStart.y) * eased;
      const crisX = L.crisStart.x + (L.crisMeet.x - L.crisStart.x) * eased;
      const crisY = L.crisStart.y + (L.crisMeet.y - L.crisStart.y) * eased;
      const laraX = L.laraStart.x + (L.laraMeet.x - L.laraStart.x) * eased;
      const laraY = L.laraStart.y + (L.laraMeet.y - L.laraStart.y) * eased;

      const distA = Math.hypot(arielX - L.arielStart.x, arielY - L.arielStart.y);
      const distG = Math.hypot(graziX - L.graziStart.x, graziY - L.graziStart.y);
      const distC = Math.hypot(crisX - L.crisStart.x, crisY - L.crisStart.y);
      const distL = Math.hypot(laraX - L.laraStart.x, laraY - L.laraStart.y);

      const drawables: Array<{ y: number; draw: () => void }> = [
        {
          y: arielY,
          draw: () => drawAdultSheetCharacter(ctx, 'ariel', arielX, arielY, 'right', distA, true),
        },
        {
          y: graziY,
          draw: () => drawAdultSheetCharacter(ctx, 'grazi', graziX, graziY, 'left', distG, true),
        },
        {
          y: crisY,
          draw: () => drawCris12yo(ctx, crisX, crisY, 'right', distC, true),
        },
        {
          y: laraY,
          draw: () => drawLara5yo(ctx, laraX, laraY, 'left', distL, true),
        },
      ];
      drawables.sort((a, b) => a.y - b.y);
      for (const item of drawables) item.draw();
    } else {
      const hugImg = getStage6FamilyHugSprite();
      const footY = Math.round(L.hugCenter.y + 8.5);
      drawShadow(ctx, L.hugCenter.x, L.hugCenter.y + 6, 44, 10);
      if (hugImg && hugImg.complete && hugImg.naturalWidth > 0) {
        const drawH = Math.round(56 * GLOBAL_CHAR_SCALE * S6_SALA_FAMILIA_CHAR_SCALE);
        const drawW = Math.round(drawH * (hugImg.naturalWidth / Math.max(1, hugImg.naturalHeight)));
        ctx.drawImage(
          hugImg,
          Math.round(L.hugCenter.x - drawW / 2),
          footY - drawH,
          drawW,
          drawH,
        );
      }
    }

    // Gentle fade-in at scene start (screen effect only)
    if (s6.cutsceneElapsed < 0.8) {
      const alpha = Math.max(0, 1 - s6.cutsceneElapsed / 0.8);
      ctx.fillStyle = `rgba(12, 8, 6, ${alpha.toFixed(3)})`;
      ctx.fillRect(0, 0, worldW, worldH);
    }
  } else if (s6.cutscene === 's6_transition_to_pool') {
    // Transição contextual (4,8 s) com cartela suave para a piscina (Regra 11)
    const p = Math.min(1, s6.cutsceneElapsed / S6_TRANSITION_DURATION_SECONDS);
    const poolImg = getStage6MapBackdrop('s6_piscina_condominio');
    if (p > 0.5 && poolImg && poolImg.complete && poolImg.naturalWidth > 0) {
      ctx.drawImage(poolImg, 0, 0, worldW, worldH);
    }
    const cardAlpha = p < 0.25 ? p / 0.25 : p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
    ctx.save();
    ctx.fillStyle = `rgba(14, 18, 28, ${(0.92 * cardAlpha).toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);
    if (cardAlpha > 0.25) {
      ctx.fillStyle = `rgba(255, 224, 130, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Um dia ensolarado em família...', worldW / 2, worldH / 2 - 8);
      ctx.fillStyle = `rgba(232, 244, 255, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Cena 2 · Piscina do Condomínio', worldW / 2, worldH / 2 + 16);
    }
    ctx.restore();
  } else if (s6.cutscene === 's6_transition_to_videogame') {
    // Transição contextual (4,8 s) mostrando a passagem do tempo até a adolescência
    const p = Math.min(1, s6.cutsceneElapsed / S6_TRANSITION_DURATION_SECONDS);
    const vgImg = getStage6MapBackdrop('s6_sala_videogame_teens');
    if (p > 0.5 && vgImg && vgImg.complete && vgImg.naturalWidth > 0) {
      ctx.drawImage(vgImg, 0, 0, worldW, worldH);
    }
    const cardAlpha = p < 0.25 ? p / 0.25 : p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
    ctx.save();
    ctx.fillStyle = `rgba(14, 12, 22, ${(0.92 * cardAlpha).toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);
    if (cardAlpha > 0.25) {
      ctx.fillStyle = `rgba(255, 214, 120, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Os anos passam...', worldW / 2, worldH / 2 - 10);
      ctx.fillStyle = `rgba(240, 232, 255, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Cris (19 anos) e Lara (15 anos) · Noite de Videogame em Família', worldW / 2, worldH / 2 + 16);
    }
    ctx.restore();
  } else if (s6.cutscene === 's6_videogame_family') {
    // CENA 3: Os 4 sentados jogando videogame com controles nas mãos (Y-sorted, zero sobreposição)
    const L = STAGE6_SCENE3_VIDEOGAME_LAYOUT;
    const tNow = sim.elapsedSeconds;
    const round = s6.videogameRound;
    const drawSeatedGamer = (
      sheetKey: 's6GraziVideogame' | 's6ArielVideogame' | 's6Cris19yoVideogame' | 's6Lara15yoVideogame',
      cx: number,
      cy: number,
      baseH: number,
      frameIdx: number,
    ) => {
      const sheet = getCharacterWalkSheetImage(sheetKey);
      if (!sheet || !sheet.complete || sheet.naturalWidth <= 0) return;
      const cellW = sheet.naturalWidth / 3;
      const cellH = sheet.naturalHeight;
      const drawH = Math.round(baseH * GLOBAL_CHAR_SCALE * S6_VIDEOGAME_CHAR_SCALE);
      const drawW = Math.round(drawH * (cellW / Math.max(1, cellH)));
      const bob = round >= 1 ? Math.abs(Math.sin(tNow * (round >= 3 ? 6.5 : 4.2) + cx * 0.02)) * -2.2 : 0;
      const footY = Math.round(cy + bob + 8.5);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        sheet,
        Math.round(Math.max(0, Math.min(2, frameIdx)) * cellW),
        0,
        Math.round(cellW),
        cellH,
        Math.round(cx - drawW / 2),
        footY - drawH,
        drawW,
        drawH,
      );
      ctx.restore();
    };

    const gFrame = round === 0 ? 0 : round < 3 ? 1 : 2;
    const aFrame = round === 0 ? 0 : round < 3 ? 1 : 2;
    const cFrame = round === 0 ? 0 : round === 1 ? 1 : 2;
    const lFrame = round === 0 ? 0 : round === 1 ? 1 : 2;

    const gamers: Array<{ y: number; draw: () => void }> = [
      { y: L.cris.y, draw: () => drawSeatedGamer('s6Cris19yoVideogame', L.cris.x, L.cris.y, 45, cFrame) },
      { y: L.lara.y, draw: () => drawSeatedGamer('s6Lara15yoVideogame', L.lara.x, L.lara.y, 43, lFrame) },
      { y: L.ariel.y, draw: () => drawSeatedGamer('s6ArielVideogame', L.ariel.x, L.ariel.y, 45, aFrame) },
      { y: L.grazi.y, draw: () => drawSeatedGamer('s6GraziVideogame', L.grazi.x, L.grazi.y, 45, gFrame) },
    ];
    gamers.sort((a, b) => a.y - b.y);
    for (const g of gamers) g.draw();

    // Soft ambient TV glow screen effect (pure screen tint, zero shapes)
    const glowPulse = 0.05 + 0.03 * Math.sin(tNow * 3.8);
    ctx.fillStyle = `rgba(140, 195, 255, ${glowPulse.toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);
  } else if (s6.cutscene === 's6_transition_to_bedroom') {
    // Transição contextual (4,8 s) suave para um momento mais delicado
    const p = Math.min(1, s6.cutsceneElapsed / S6_TRANSITION_DURATION_SECONDS);
    const bedRoomImg = getStage6MapBackdrop('s6_quarto_casal_noite');
    if (p > 0.5 && bedRoomImg && bedRoomImg.complete && bedRoomImg.naturalWidth > 0) {
      ctx.drawImage(bedRoomImg, 0, 0, worldW, worldH);
    }
    const cardAlpha = p < 0.25 ? p / 0.25 : p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
    ctx.save();
    ctx.fillStyle = `rgba(10, 12, 22, ${(0.94 * cardAlpha).toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);
    if (cardAlpha > 0.25) {
      ctx.fillStyle = `rgba(216, 226, 250, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Nem todos os dias foram fáceis...', worldW / 2, worldH / 2 - 10);
      ctx.fillStyle = `rgba(180, 196, 232, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Cena 4 · Um período difícil', worldW / 2, worldH / 2 + 16);
    }
    ctx.restore();
  } else if (s6.cutscene === 's6_bedroom_comfort') {
    // Cena 4A: Ariel sentado na beirada esquerda da cama; Grazi caminha SOMENTE no chão/tapete à esquerda (nunca sobre a cama)
    const tNow = sim.elapsedSeconds;
    const arielSheet = getCharacterWalkSheetImage('s6ArielDesanimo');
    const frameIdx = s6.cutsceneElapsed >= 1.5 ? 1 : 0;
    if (arielSheet && arielSheet.complete && arielSheet.naturalWidth > 0) {
      const cellW = arielSheet.naturalWidth / 2;
      const cellH = arielSheet.naturalHeight;
      const drawH = 112;
      const drawW = Math.round(drawH * (cellW / Math.max(1, cellH)));
      ctx.drawImage(
        arielSheet,
        Math.round(frameIdx * cellW),
        0,
        Math.round(cellW),
        cellH,
        Math.round(284 - drawW / 2),
        Math.round(452 - drawH),
        drawW,
        drawH,
      );
    }
    const walkP = Math.min(1, s6.cutsceneElapsed / 1.8);
    const easedWalk = 1 - Math.pow(1 - walkP, 2);
    const graziX = 88 + easedWalk * 114; // 88 -> 202 (somente no chão/tapete ao lado esquerdo da cama)
    const graziY = 482 - easedWalk * 14; // 482 -> 468
    const walkedDist = easedWalk * 115;
    const graziAtualSheet = getCharacterWalkSheetImage('s6GraziAtualWalk');
    if (graziAtualSheet) {
      drawShadow(ctx, graziX, graziY + 6, 15, 6);
      draw4x3WalkFrame(ctx, graziAtualSheet, 'right', walkedDist, walkP < 1, graziX, graziY, 48 * 1.65);
    } else {
      drawAdultSheetCharacter(ctx, 'grazi', graziX, graziY, 'right', walkedDist, walkP < 1, 1.65);
    }

    // Soft night TV tint & gentle vignette (screen effect only)
    const tvPulse = 0.08 + 0.03 * Math.sin(tNow * 2.2);
    ctx.fillStyle = `rgba(95, 145, 220, ${tvPulse.toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);
  } else if (s6.cutscene === 's6_bedroom_bed_tv') {
    // Cena 4B: Enquadramento próximo na cabeceira branca — casal deitado encaixado proporcionalmente dentro da largura da cama
    const tNow = sim.elapsedSeconds;
    const coupleBedImg = getStage6CoupleBedTvSprite();
    if (coupleBedImg && coupleBedImg.complete && coupleBedImg.naturalWidth > 0) {
      const drawW = 276;
      const drawH = Math.round(drawW * (coupleBedImg.naturalHeight / Math.max(1, coupleBedImg.naturalWidth)));
      const breathe = Math.sin(tNow * 1.6) * 0.9;
      ctx.drawImage(
        coupleBedImg,
        Math.round(372 - drawW / 2),
        Math.round(264 + breathe),
        drawW,
        drawH,
      );
    }
    // Gentle pulsing blue-warm TV glow (screen effect only)
    const tvPulse = 0.06 + 0.035 * Math.sin(tNow * 2.6);
    ctx.fillStyle = `rgba(115, 168, 240, ${tvPulse.toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);

    // Gentle fade-in from 4A to 4B
    if (s6.cutsceneElapsed < 0.7) {
      const a = Math.max(0, 1 - s6.cutsceneElapsed / 0.7);
      ctx.fillStyle = `rgba(10, 12, 22, ${a.toFixed(3)})`;
      ctx.fillRect(0, 0, worldW, worldH);
    }
  } else if (s6.cutscene === 's6_transition_to_kitchen') {
    // Transição contextual (4,8 s) para a Cena 5 — Cozinha / A pia entupida
    const p = Math.min(1, s6.cutsceneElapsed / S6_TRANSITION_DURATION_SECONDS);
    const kitchenImg = getStage6MapBackdrop('s6_cozinha_pia');
    if (p > 0.5 && kitchenImg && kitchenImg.complete && kitchenImg.naturalWidth > 0) {
      ctx.drawImage(kitchenImg, 0, 0, worldW, worldH);
    }
    const cardAlpha = p < 0.25 ? p / 0.25 : p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
    ctx.save();
    ctx.fillStyle = `rgba(18, 14, 12, ${(0.92 * cardAlpha).toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);
    if (cardAlpha > 0.25) {
      ctx.fillStyle = `rgba(255, 224, 130, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('E entre um desafio e outro, sempre há espaço para rir...', worldW / 2, worldH / 2 - 10);
      ctx.fillStyle = `rgba(242, 236, 226, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 10px monospace';
      ctx.fillText('Cena 5 · Ariel "Marido de Aluguel" — A Pia Entupida', worldW / 2, worldH / 2 + 16);
    }
    ctx.restore();
  } else if (s6.cutscene === 's6_kitchen_sink_finale') {
    // Cena 5 Finale: Grazi sai andando pela esquerda após "Ih... não estou mais aqui!", água gira e escoa, Ariel comemora!
    const t = s6.cutsceneElapsed;
    const tNow = sim.elapsedSeconds;
    const waterFrame = t < 2.6 ? 1 : 2;
    drawStage6SinkWaterOverlay(ctx, waterFrame);

    const arielFrame = t < 2.5 ? 1 : 2;
    drawStage6ArielPia(ctx, 512, 458, arielFrame, t < 2.5, tNow);

    // Grazi caminha para fora de cena pela esquerda
    const exitP = Math.min(1, t / 2.4);
    const graziX = s6.sinkGraziExitStartX + (-90 - s6.sinkGraziExitStartX) * exitP;
    const graziY = s6.sinkGraziExitStartY;
    if (graziX > -72) {
      const walkedDist = Math.abs(graziX - s6.sinkGraziExitStartX);
      const graziAtualSheet = getCharacterWalkSheetImage('s6GraziAtualWalk');
      const targetH = 185; // draw4x3WalkFrame já aplica GLOBAL_CHAR_SCALE (185 * 1.6 = 296px célula -> ~266px Grazi real)
      drawShadow(ctx, graziX, graziY + 6, 22, 8);
      if (graziAtualSheet) {
        draw4x3WalkFrame(ctx, graziAtualSheet, 'left', walkedDist, exitP < 1, graziX, graziY, targetH);
      } else {
        drawAdultSheetCharacter(ctx, 'grazi', graziX, graziY, 'left', walkedDist, exitP < 1, 3.6);
      }
    }
  } else if (s6.cutscene === 's6_transition_to_birthday') {
    // Transição contextual (4,8 s) para Cena 6 — Aniversário do Ariel (23/11/2026)
    const p = Math.min(1, s6.cutsceneElapsed / S6_TRANSITION_DURATION_SECONDS);
    const bdayImg = getStage6MapBackdrop('s6_sala_aniversario');
    if (p > 0.5 && bdayImg && bdayImg.complete && bdayImg.naturalWidth > 0) {
      ctx.drawImage(bdayImg, 0, 0, worldW, worldH);
    }
    const cardAlpha = p < 0.25 ? p / 0.25 : p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
    ctx.save();
    ctx.fillStyle = `rgba(18, 12, 22, ${(0.92 * cardAlpha).toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);
    if (cardAlpha > 0.25) {
      ctx.fillStyle = `rgba(255, 224, 130, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('23 de Novembro de 2026', worldW / 2, worldH / 2 - 12);
      ctx.fillStyle = `rgba(255, 240, 220, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Cena 6 · Feliz Aniversário, Ariel!', worldW / 2, worldH / 2 + 14);
    }
    ctx.restore();
  } else if (s6.cutscene === 's6_birthday_party') {
    // CENA 6: Aniversário do Ariel (23/11/2026) — Ariel atrás/ao lado do bolo assoprando direto nas velas,
    // bolo + velas à frente dele sobre a mesa, e Grazi (skin aniversário), Cris, Lara, Manu e Marquinho batendo palmas!
    const L = STAGE6_SCENE6_BIRTHDAY_LAYOUT;
    const tNow = sim.elapsedSeconds;
    const clapFrame = Math.floor(tNow * (s6.birthdayPhase === 'celebrating' ? 5.2 : 3.4)) % 2;
    const drawBirthday2Frame = (
      sheetKey:
        | 's6ArielBirthday'
        | 's6GraziBirthday'
        | 's6CrisAdultoBirthday'
        | 's6LaraAdultaBirthday'
        | 's6ManuBirthday'
        | 's6MarquinhoBirthday',
      cx: number,
      cy: number,
      drawH: number,
      frameIdx: number,
    ) => {
      const sheet = getCharacterWalkSheetImage(sheetKey);
      if (!sheet || !sheet.complete || sheet.naturalWidth <= 0) return;
      const cellW = sheet.naturalWidth / 2;
      const cellH = sheet.naturalHeight;
      const drawW = Math.round(drawH * (cellW / Math.max(1, cellH)));
      const bob = s6.birthdayPhase === 'celebrating' ? Math.abs(Math.sin(tNow * 5.2 + cx * 0.02)) * -2.2 : 0;
      const footY = Math.round(cy + 8.5 + drawH * (4 / 128) + bob);
      drawShadow(ctx, cx, cy + 6, 16, 6);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        sheet,
        Math.round(Math.max(0, Math.min(1, frameIdx)) * cellW),
        0,
        Math.round(cellW),
        cellH,
        Math.round(cx - drawW / 2),
        footY - drawH,
        drawW,
        drawH,
      );
      ctx.restore();
    };

    // 1. Ariel aniversariante posicionado ao lado esquerdo/atrás do bolo, assoprando para a direita direto nas velinhas
    const arielFrame = s6.birthdayPhase === 'blowing' ? 1 : 0;
    drawBirthday2Frame('s6ArielBirthday', L.ariel.x, L.ariel.y, L.ariel.drawH, arielFrame);

    // 2. Bolo de chocolate com cobertura branca sobre a mesa de mármore (à frente do Ariel!)
    const cakeImg = getStage6BirthdayCakeSprite();
    if (cakeImg && cakeImg.complete && cakeImg.naturalWidth > 0) {
      const drawW = L.cake.drawW;
      const drawH = Math.round(drawW * (cakeImg.naturalHeight / Math.max(1, cakeImg.naturalWidth)));
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        cakeImg,
        Math.round(L.cake.x - drawW / 2),
        Math.round(L.cake.y - drawH / 2),
        drawW,
        drawH,
      );
      ctx.restore();
    }

    // 3. Velinhas animadas (frames 0..2 acesas tremulando -> frame 3 fumaça após assoprar!)
    const candlesImg = getStage6BirthdayCandlesFxSprite();
    if (candlesImg && candlesImg.complete && candlesImg.naturalWidth > 0) {
      const cellW = candlesImg.naturalWidth / 4;
      const cellH = candlesImg.naturalHeight;
      const candleFrame = s6.birthdayCandlesLit ? Math.floor(tNow * 6.5) % 3 : 3;
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        candlesImg,
        Math.round(candleFrame * cellW),
        0,
        Math.round(cellW),
        cellH,
        Math.round(L.candles.x - L.candles.drawW / 2),
        Math.round(L.candles.y - L.candles.drawH / 2),
        L.candles.drawW,
        L.candles.drawH,
      );
      ctx.restore();
    }

    // 4. Grazi (skin aniversário batendo palmas), Cris, Lara, Manu e Marquinho em volta da mesa (Y-sorted, zero sobreposição)
    const partyPeople: Array<{ y: number; draw: () => void }> = [
      { y: L.cris.y, draw: () => drawBirthday2Frame('s6CrisAdultoBirthday', L.cris.x, L.cris.y, L.cris.drawH, clapFrame) },
      { y: L.grazi.y, draw: () => drawBirthday2Frame('s6GraziBirthday', L.grazi.x, L.grazi.y, L.grazi.drawH, (clapFrame + 1) % 2) },
      { y: L.lara.y, draw: () => drawBirthday2Frame('s6LaraAdultaBirthday', L.lara.x, L.lara.y, L.lara.drawH, (clapFrame + 1) % 2) },
      { y: L.manu.y, draw: () => drawBirthday2Frame('s6ManuBirthday', L.manu.x, L.manu.y, L.manu.drawH, clapFrame) },
      { y: L.marquinho.y, draw: () => drawBirthday2Frame('s6MarquinhoBirthday', L.marquinho.x, L.marquinho.y, L.marquinho.drawH, (clapFrame + 1) % 2) },
    ];
    partyPeople.sort((a, b) => a.y - b.y);
    for (const p of partyPeople) p.draw();

    // Brilho dourado suave de velinhas acesas (puro screen effect, zero formas)
    if (s6.birthdayCandlesLit) {
      const warmPulse = 0.05 + 0.025 * Math.sin(tNow * 5.5);
      ctx.fillStyle = `rgba(255, 200, 110, ${warmPulse.toFixed(3)})`;
      ctx.fillRect(0, 0, worldW, worldH);
    }
  } else if (s6.cutscene === 's6_transition_to_final') {
    // Transição contextual (4,8 s) para a Cena Final — O convite para o Volume 2
    const p = Math.min(1, s6.cutsceneElapsed / S6_TRANSITION_DURATION_SECONDS);
    const finImg = getStage6MapBackdrop('s6_tela_final_volume1');
    if (p > 0.5 && finImg && finImg.complete && finImg.naturalWidth > 0) {
      ctx.drawImage(finImg, 0, 0, worldW, worldH);
    }
    const cardAlpha = p < 0.25 ? p / 0.25 : p > 0.78 ? Math.max(0, (1 - p) / 0.22) : 1;
    ctx.save();
    ctx.fillStyle = `rgba(14, 10, 22, ${(0.92 * cardAlpha).toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);
    if (cardAlpha > 0.25) {
      ctx.fillStyle = `rgba(255, 220, 140, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('E assim chegamos ao hoje...', worldW / 2, worldH / 2 - 12);
      ctx.fillStyle = `rgba(245, 232, 255, ${cardAlpha.toFixed(3)})`;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('Cena Final · Nossa História Continua', worldW / 2, worldH / 2 + 14);
    }
    ctx.restore();
  } else if (s6.cutscene === 's6_final_volume2' || s6.cutscene === 's6_volume1_endcard') {
    // CENA FINAL: Pôr do sol estrelado com a família reunida + Cartela Final do Volume 1
    const L = STAGE6_FINAL_LAYOUT;
    const tNow = sim.elapsedSeconds;

    const drawFinalMember = (
      sheetKey:
        | 's6ArielBirthday'
        | 's6GraziBirthday'
        | 's6CrisAdultoBirthday'
        | 's6LaraAdultaBirthday'
        | 's6ManuBirthday'
        | 's6MarquinhoBirthday',
      cx: number,
      cy: number,
      drawH: number,
    ) => {
      const sheet = getCharacterWalkSheetImage(sheetKey);
      if (!sheet || !sheet.complete || sheet.naturalWidth <= 0) return;
      const cellW = sheet.naturalWidth / 2;
      const cellH = sheet.naturalHeight;
      const drawW = Math.round(drawH * (cellW / Math.max(1, cellH)));
      const footY = Math.round(cy + 8.5 + drawH * (4 / 128));
      drawShadow(ctx, cx, cy + 6, 15, 5);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        sheet,
        0,
        0,
        Math.round(cellW),
        cellH,
        Math.round(cx - drawW / 2),
        footY - drawH,
        drawW,
        drawH,
      );
      ctx.restore();
    };

    const finalPeople: Array<{ y: number; draw: () => void }> = [
      { y: L.cris.y, draw: () => drawFinalMember('s6CrisAdultoBirthday', L.cris.x, L.cris.y, L.cris.drawH) },
      { y: L.lara.y, draw: () => drawFinalMember('s6LaraAdultaBirthday', L.lara.x, L.lara.y, L.lara.drawH) },
      { y: L.grazi.y, draw: () => drawFinalMember('s6GraziBirthday', L.grazi.x, L.grazi.y, L.grazi.drawH) },
      { y: L.ariel.y, draw: () => drawFinalMember('s6ArielBirthday', L.ariel.x, L.ariel.y, L.ariel.drawH) },
      { y: L.manu.y, draw: () => drawFinalMember('s6ManuBirthday', L.manu.x, L.manu.y, L.manu.drawH) },
      { y: L.marquinho.y, draw: () => drawFinalMember('s6MarquinhoBirthday', L.marquinho.x, L.marquinho.y, L.marquinho.drawH) },
    ];
    finalPeople.sort((a, b) => a.y - b.y);
    for (const p of finalPeople) p.draw();

    // Brilho suave de pôr do sol (puro screen effect)
    const duskPulse = 0.04 + 0.02 * Math.sin(tNow * 1.8);
    ctx.fillStyle = `rgba(255, 190, 140, ${duskPulse.toFixed(3)})`;
    ctx.fillRect(0, 0, worldW, worldH);

    // Cartela Final do Volume 1 (texto limpo sobre o céu estrelado do pôr do sol)
    if (s6.cutscene === 's6_volume1_endcard') {
      const fade = Math.min(1, s6.cutsceneElapsed / 1.4);
      ctx.save();
      ctx.fillStyle = `rgba(12, 8, 22, ${(0.56 * fade).toFixed(3)})`;
      ctx.fillRect(0, 0, worldW, worldH);

      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(255, 226, 138, ${fade.toFixed(3)})`;
      ctx.font = 'bold 26px monospace';
      ctx.fillText('PLAYER 1 + PLAYER 2', worldW / 2, 118);

      ctx.fillStyle = `rgba(255, 246, 232, ${fade.toFixed(3)})`;
      ctx.font = 'bold 16px monospace';
      ctx.fillText('VOLUME 1 — FIM', worldW / 2, 154);

      ctx.fillStyle = `rgba(255, 206, 224, ${fade.toFixed(3)})`;
      ctx.font = 'bold 13px monospace';
      ctx.fillText('CONTINUA NO VOLUME 2...', worldW / 2, 186);

      if (fade > 0.75) {
        const blink = 0.65 + 0.35 * Math.sin(tNow * 3.2);
        ctx.fillStyle = `rgba(235, 240, 255, ${(blink * fade).toFixed(3)})`;
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Aperte Espaço ou Enter para concluir a Fase 6', worldW / 2, 224);
      }
      ctx.restore();
    }
  } else {
    // Exploration mode (Y-sorted by feet)
    const drawables: Array<{ y: number; draw: () => void }> = [];
    const isPoolMap = s6.mapId === 's6_piscina_condominio';
    const isKitchenMap = s6.mapId === 's6_cozinha_pia';
    const tNow = sim.elapsedSeconds;

    if (isKitchenMap) {
      drawStage6SinkWaterOverlay(ctx, s6.sinkCompleted ? 2 : 0);
    }

    for (const npc of sim.npcs) {
      if (!npc.visible) continue;
      drawables.push({
        y: npc.y,
        draw: () => {
          if (isKitchenMap && npc.role === 'ariel') {
            const frameIdx = s6.sinkCompleted ? 2 : s6.sinkStep === 0 ? 0 : 1;
            const pumping = !s6.sinkCompleted && s6.sinkStep > 0;
            drawStage6ArielPia(ctx, npc.x, npc.y, frameIdx, pumping, tNow);
          } else if (isPoolMap) {
            const inWater = isPointInStage6PoolWater(npc.x, npc.y);
            if (npc.role === 'ariel') {
              drawStage6PoolCharacter(ctx, 's6ArielPool', npc.x, npc.y, npc.dir, 0, false, inWater, 49, tNow);
            } else if (npc.role === 'cristian') {
              drawStage6PoolCharacter(ctx, 's6Cris12yoPool', npc.x, npc.y, npc.dir, 0, false, inWater, 43, tNow);
            } else if (npc.role === 'lara') {
              drawStage6PoolCharacter(ctx, 's6Lara5yoPool', npc.x, npc.y, npc.dir, 0, false, inWater, 34, tNow);
            }
          } else if (npc.role === 'ariel') {
            drawAdultSheetCharacter(ctx, 'ariel', npc.x, npc.y, npc.dir, 0, false);
          } else if (npc.role === 'cristian') {
            drawCris12yo(ctx, npc.x, npc.y, npc.dir, 0, false);
          } else if (npc.role === 'lara') {
            drawLara5yo(ctx, npc.x, npc.y, npc.dir, 0, false);
          }
        },
      });
    }

    drawables.push({
      y: sim.player.y,
      draw: () => {
        if (isKitchenMap) {
          const graziAtualSheet = getCharacterWalkSheetImage('s6GraziAtualWalk');
          const targetH = 185; // draw4x3WalkFrame já aplica GLOBAL_CHAR_SCALE (185 * 1.6 = 296px célula -> ~266px Grazi real)
          drawShadow(ctx, sim.player.x, sim.player.y + 6, 22, 8);
          if (graziAtualSheet) {
            draw4x3WalkFrame(
              ctx,
              graziAtualSheet,
              sim.player.dir,
              sim.player.walkDistance,
              sim.player.isMoving,
              sim.player.x,
              sim.player.y,
              targetH,
            );
          } else {
            drawAdultSheetCharacter(
              ctx,
              'grazi',
              sim.player.x,
              sim.player.y,
              sim.player.dir,
              sim.player.walkDistance,
              sim.player.isMoving,
              3.6,
            );
          }
        } else if (isPoolMap) {
          const inWater = isPointInStage6PoolWater(sim.player.x, sim.player.y);
          drawStage6PoolCharacter(
            ctx,
            's6GraziPool',
            sim.player.x,
            sim.player.y,
            sim.player.dir,
            sim.player.walkDistance,
            sim.player.isMoving,
            inWater,
            48,
            tNow,
          );
        } else {
          drawAdultSheetCharacter(
            ctx,
            'grazi',
            sim.player.x,
            sim.player.y,
            sim.player.dir,
            sim.player.walkDistance,
            sim.player.isMoving,
          );
        }
      },
    });

    drawables.sort((a, b) => a.y - b.y);
    for (const item of drawables) item.draw();
  }

  if (stage6DebugOverlay) {
    drawStage6DebugOverlay(ctx, sim);
  }

  particles.draw(ctx);
  ctx.restore();
}

function drawStage6SinkWaterOverlay(ctx: CanvasRenderingContext2D, frameIdx: number): void {
  const fx = getStage6SinkWaterFxSprite();
  if (!fx || !fx.complete || fx.naturalWidth <= 0) return;
  const cellW = fx.naturalWidth / 3;
  const cellH = fx.naturalHeight;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  // Encaixa exatamente dentro da cuba de inox da pia em s6_cozinha_pia.jpg (768x512)
  ctx.drawImage(
    fx,
    Math.round(Math.max(0, Math.min(2, frameIdx)) * cellW),
    0,
    Math.round(cellW),
    cellH,
    491,
    237,
    96,
    21,
  );
  ctx.restore();
}

function drawStage6ArielPia(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frameIdx: number,
  pumping: boolean,
  tNow: number,
): void {
  const sheet = getCharacterWalkSheetImage('s6ArielPia');
  if (!sheet || !sheet.complete || sheet.naturalWidth <= 0) return;
  const clamped = Math.max(0, Math.min(2, frameIdx));
  const cellW = sheet.naturalWidth / 3;
  const cellH = sheet.naturalHeight;
  // Proporção real à bancada da cozinha (pia em y=237, piso em y=458):
  // Ariel fica ~286px (acima da bancada/pia e levemente mais alto que a Grazi ~266px)
  const frameHeights = [324, 330, 334];
  const drawH = frameHeights[clamped];
  const drawW = Math.round(drawH * (cellW / Math.max(1, cellH)));
  const pumpOffset = pumping ? Math.sin(tNow * 9.5) * 3.8 : 0;
  const footY = Math.round(y + 8.5 + drawH * (4 / 128) + pumpOffset);
  drawShadow(ctx, x, y + 6, 24, 8);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet,
    Math.round(clamped * cellW),
    0,
    Math.round(cellW),
    cellH,
    Math.round(x - drawW / 2),
    footY - drawH,
    drawW,
    drawH,
  );
  ctx.restore();
}

function drawStage6DebugOverlay(ctx: CanvasRenderingContext2D, sim: SimulationState): void {
  const s6 = sim.stage6;
  if (!s6) return;

  ctx.save();
  ctx.lineWidth = 1;
  ctx.font = '6px monospace';
  ctx.textAlign = 'left';

  if (s6.mapId === 's6_sala_familia') {
    const drawZone = (z: Stage6Zone, fill: string, stroke: string) => {
      ctx.fillStyle = fill;
      ctx.fillRect(z.x1, z.y1, z.x2 - z.x1, z.y2 - z.y1);
      ctx.strokeStyle = stroke;
      ctx.strokeRect(z.x1 + 0.5, z.y1 + 0.5, z.x2 - z.x1 - 1, z.y2 - z.y1 - 1);
    };
    for (const z of STAGE6_SALA_FAMILIA_WALK_ZONES) {
      drawZone(z, 'rgba(60, 220, 90, 0.22)', 'rgba(60, 220, 90, 0.9)');
    }
    for (const z of STAGE6_SALA_FAMILIA_BLOCKED_ZONES) {
      drawZone(z, 'rgba(235, 50, 50, 0.28)', 'rgba(255, 80, 80, 0.95)');
      ctx.fillStyle = '#ffffff';
      ctx.fillText(z.id, z.x1 + 2, z.y1 + 7);
    }
    for (const h of STAGE6_SALA_FAMILIA_HOTSPOTS) {
      ctx.setLineDash([3, 2]);
      ctx.strokeStyle = '#ffe14d';
      ctx.strokeRect(h.x1 + 0.5, h.y1 + 0.5, h.x2 - h.x1 - 1, h.y2 - h.y1 - 1);
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffe14d';
      ctx.fillRect(h.standX - 2, h.standY - 2, 4, 4);
      ctx.fillText(h.label, h.standX + 4, h.standY + 10);
    }
  } else if (s6.mapId === 's6_piscina_condominio') {
    const drawZone = (z: Stage6Zone, fill: string, stroke: string) => {
      ctx.fillStyle = fill;
      ctx.fillRect(z.x1, z.y1, z.x2 - z.x1, z.y2 - z.y1);
      ctx.strokeStyle = stroke;
      ctx.strokeRect(z.x1 + 0.5, z.y1 + 0.5, z.x2 - z.x1 - 1, z.y2 - z.y1 - 1);
    };
    for (const z of STAGE6_PISCINA_WALK_ZONES) {
      drawZone(z, 'rgba(60, 220, 90, 0.20)', 'rgba(60, 220, 90, 0.9)');
    }
    for (const z of STAGE6_PISCINA_WATER_ZONES) {
      drawZone(z, 'rgba(70, 190, 255, 0.22)', 'rgba(110, 220, 255, 0.95)');
    }
    for (const z of STAGE6_PISCINA_BLOCKED_ZONES) {
      drawZone(z, 'rgba(235, 50, 50, 0.28)', 'rgba(255, 80, 80, 0.95)');
      ctx.fillStyle = '#ffffff';
      ctx.fillText(z.id, z.x1 + 2, z.y1 + 7);
    }
    for (const h of STAGE6_PISCINA_HOTSPOTS) {
      ctx.setLineDash([3, 2]);
      ctx.strokeStyle = '#ffe14d';
      ctx.strokeRect(h.x1 + 0.5, h.y1 + 0.5, h.x2 - h.x1 - 1, h.y2 - h.y1 - 1);
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffe14d';
      ctx.fillRect(h.standX - 2, h.standY - 2, 4, 4);
      ctx.fillText(h.label, h.standX + 4, h.standY + 10);
    }
  } else if (s6.mapId === 's6_cozinha_pia') {
    const drawZone = (z: Stage6Zone, fill: string, stroke: string) => {
      ctx.fillStyle = fill;
      ctx.fillRect(z.x1, z.y1, z.x2 - z.x1, z.y2 - z.y1);
      ctx.strokeStyle = stroke;
      ctx.strokeRect(z.x1 + 0.5, z.y1 + 0.5, z.x2 - z.x1 - 1, z.y2 - z.y1 - 1);
    };
    for (const z of STAGE6_COZINHA_WALK_ZONES) {
      drawZone(z, 'rgba(60, 220, 90, 0.22)', 'rgba(60, 220, 90, 0.9)');
    }
    for (const z of STAGE6_COZINHA_BLOCKED_ZONES) {
      drawZone(z, 'rgba(235, 50, 50, 0.28)', 'rgba(255, 80, 80, 0.95)');
      ctx.fillStyle = '#ffffff';
      ctx.fillText(z.id, z.x1 + 2, z.y1 + 7);
    }
    for (const h of STAGE6_COZINHA_HOTSPOTS) {
      ctx.setLineDash([3, 2]);
      ctx.strokeStyle = '#ffe14d';
      ctx.strokeRect(h.x1 + 0.5, h.y1 + 0.5, h.x2 - h.x1 - 1, h.y2 - h.y1 - 1);
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffe14d';
      ctx.fillRect(h.standX - 2, h.standY - 2, 4, 4);
      ctx.fillText(h.label, h.standX + 4, h.standY + 10);
    }
  }

  const faceBoxes: Stage6FaceBounds[] = [];
  if (s6.cutscene === 's6_videogame_family') {
    faceBoxes.push(...getStage6VideogameFaceBoxes());
  } else if (s6.cutscene === 's6_birthday_party') {
    faceBoxes.push(...getStage6BirthdayFaceBoxes());
  } else if (s6.cutscene === 's6_final_volume2' || s6.cutscene === 's6_volume1_endcard') {
    faceBoxes.push(...getStage6FinalFaceBoxes());
  } else if (s6.cutscene === 'none') {
    const s =
      s6.mapId === 's6_piscina_condominio'
        ? S6_PISCINA_CHAR_SCALE
        : s6.mapId === 's6_cozinha_pia'
          ? S6_COZINHA_CHAR_SCALE
          : S6_SALA_FAMILIA_CHAR_SCALE;
    faceBoxes.push(
      getStage6CharacterFaceBounds(
        'grazi',
        'Grazi',
        sim.player.x,
        sim.player.y,
        Math.round(48 * GLOBAL_CHAR_SCALE * s),
      ),
    );
    for (const npc of sim.npcs) {
      if (!npc.visible) continue;
      const h = npc.role === 'ariel' ? 49 : npc.role === 'cristian' ? 43 : 34;
      faceBoxes.push(
        getStage6CharacterFaceBounds(
          npc.id,
          npc.name,
          npc.x,
          npc.y,
          Math.round(h * GLOBAL_CHAR_SCALE * s),
        ),
      );
    }
  }

  const overlaps = findStage6FaceOverlaps(faceBoxes);
  const hitIds = new Set<string>();
  for (const ov of overlaps) {
    hitIds.add(ov.a.id);
    hitIds.add(ov.b.id);
  }
  for (const b of faceBoxes) {
    const hit = hitIds.has(b.id);
    ctx.strokeStyle = hit ? '#ff4d4f' : '#52e37d';
    ctx.strokeRect(b.x1 + 0.5, b.y1 + 0.5, b.x2 - b.x1 - 1, b.y2 - b.y1 - 1);
  }

  const msg =
    overlaps.length === 0
      ? `F3 Fase 6 · Sobreposição de rostos: OK (0)`
      : `F3 Fase 6 · ALERTA: ${overlaps[0].a.label} cobre rosto de ${overlaps[0].b.label}!`;
  ctx.fillStyle = overlaps.length === 0 ? 'rgba(18, 60, 32, 0.85)' : 'rgba(140, 20, 20, 0.92)';
  ctx.fillRect(4, 4, Math.max(185, msg.length * 4 + 12), 11);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(msg, 8, 12);
  ctx.restore();
}
