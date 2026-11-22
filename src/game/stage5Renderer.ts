import {
  SKIN_URLS,
  getCharacterWalkSheetImage,
  getS4GraziPregnantWalkSheetImage,
  getSkinSprite,
} from './characterSkins';
import { getStage5MapBackdrop } from './environmentArt';
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './mapData';
import {
  GLOBAL_CHAR_SCALE,
  OUTLINE,
  drawShadow,
  getWalkSheetFrameBounds,
  px,
} from './pixelArt';
import type { ProcessedSprite } from './spriteSheet';
import type { ParticlePool } from './sprites';
import { drawMoodIcon } from './stage3Environments';
import {
  STAGE5_APARTMENT_EXIT_POS,
  STAGE5_GUESSER_DOOR_POS,
  STAGE5_PARK_SKATE_POS,
  STAGE_5_KATA_MOVES,
  STAGE_5_MEMORIES,
} from './stage5Data';
import { getStage5PhoneCallSnapshot } from './stage5Rules';
import type { Direction, KarateKataMove, SimulationState } from './types';

// ============================================================================
// STAGE 5 — BELA VISTA (World, Karate Kata Minigame, Split-Screen Call & Family Renderer)
// STRICT PIXEL-ART RULES:
// - imageSmoothingEnabled = false
// - Zero rotation and zero non-uniform stretching on sprites
// - Foot-anchored at cy + 8.5
// ============================================================================

const S5_ADULT_WALK_FRAMES = {
  right: [0, 1, 2, 6],
  left: [3, 4, 5, 7],
} as const;

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
  if (flipX) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(sprite.canvas, Math.round(-drawW / 2), -drawH, drawW, drawH);
  ctx.restore();
}

function drawCrispWalkFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frameIndex: number,
  cx: number,
  cy: number,
  targetH: number,
  opts: { bobY?: number; flipX?: boolean } = {},
): boolean {
  const frame = getWalkSheetFrameBounds(image)?.[frameIndex];
  if (!frame) return false;

  const drawH = Math.round(targetH * GLOBAL_CHAR_SCALE);
  const drawW = Math.round(drawH * (frame.width / Math.max(1, frame.height)));
  const footY = Math.round(cy + (opts.bobY ?? 0) + 8.5);
  const drawX = Math.round(cx);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(drawX, footY);
  if (opts.flipX) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(
    image,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    Math.round(-drawW / 2),
    -drawH,
    drawW,
    drawH,
  );
  ctx.restore();
  return true;
}

function drawAdultAriel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: {
    dir?: Direction;
    walkPhase?: number;
    isMoving?: boolean;
    bobY?: number;
    scaleBoost?: number;
  } = {},
): void {
  const boost = opts.scaleBoost ?? 1;
  const step = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob = (opts.bobY ?? 0) + (opts.isMoving ? Math.abs(step) * -1.6 * boost : 0);
  const flipX = opts.dir === 'left';
  drawShadow(ctx, x, y + 6, 10 * boost, 4 * boost);

  if (opts.isMoving) {
    const adultWalkSheet = getCharacterWalkSheetImage('s4ArielAdultWalk');
    if (adultWalkSheet) {
      const facing = opts.dir === 'left' ? 'left' : 'right';
      const frames = S5_ADULT_WALK_FRAMES[facing];
      const frameIdx =
        ((Math.floor((opts.walkPhase ?? 0) / (Math.PI / 2)) % frames.length) +
          frames.length) %
        frames.length;
      if (
        drawCrispWalkFrame(ctx, adultWalkSheet, frames[frameIdx], x, y, 49 * boost, {
          bobY: bob,
        })
      ) {
        return;
      }
    }
  }

  const sprite = getSkinSprite(SKIN_URLS.s4ArielAdult);
  if (sprite) {
    drawCrispSprite(ctx, sprite, x, y + bob, 49 * boost, flipX);
    return;
  }

  const cx = px(x);
  const cy = px(y + bob);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 10, cy - 42, 20, 46);
  ctx.fillStyle = '#2a4b7c';
  ctx.fillRect(cx - 9, cy - 21, 18, 15);
}

function drawAdultGrazi(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: {
    dir?: Direction;
    walkPhase?: number;
    isMoving?: boolean;
    pregnant?: boolean;
    emotionalTears?: boolean;
    bobY?: number;
    scaleBoost?: number;
  } = {},
): void {
  const boost = opts.scaleBoost ?? 1;
  const step = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob = (opts.bobY ?? 0) + (opts.isMoving ? Math.abs(step) * -1.6 * boost : 0);
  const flipX = opts.dir === 'left';
  drawShadow(ctx, x, y + 6, (opts.pregnant ? 11 : 10) * boost, 4 * boost);

  let drawn = false;
  if (!opts.pregnant && opts.isMoving) {
    const adultWalkSheet = getCharacterWalkSheetImage('s4GraziAdultWalk');
    if (adultWalkSheet) {
      const facing = opts.dir === 'left' ? 'left' : 'right';
      const frames = S5_ADULT_WALK_FRAMES[facing];
      const frameIdx =
        ((Math.floor((opts.walkPhase ?? 0) / (Math.PI / 2)) % frames.length) +
          frames.length) %
        frames.length;
      drawn = drawCrispWalkFrame(ctx, adultWalkSheet, frames[frameIdx], x, y, 48 * boost, {
        bobY: bob,
      });
    }
  }

  if (!drawn && opts.pregnant) {
    const pregnantWalkSheet = getS4GraziPregnantWalkSheetImage();
    if (pregnantWalkSheet) {
      const direction = opts.dir ?? 'down';
      const row = direction === 'up' ? 2 : direction === 'down' ? 0 : 1;
      const column = opts.isMoving ? (step > 0.35 ? 1 : step < -0.35 ? 2 : 0) : 0;
      const sourceFacesRight = row === 1 && column > 0;
      const sheetFlipX =
        row === 1 &&
        ((direction === 'left' && sourceFacesRight) ||
          (direction === 'right' && !sourceFacesRight));
      drawn = drawCrispWalkFrame(
        ctx,
        pregnantWalkSheet,
        row * 3 + column,
        x,
        y,
        48 * boost,
        {
          bobY: bob,
          flipX: sheetFlipX,
        },
      );
    }
  }

  if (!drawn) {
    const sprite = getSkinSprite(SKIN_URLS.s4GraziAdult);
    if (sprite) {
      drawCrispSprite(ctx, sprite, x, y + bob, 48 * boost, flipX);
      drawn = true;
    }
  }

  if (!drawn) {
    const cx = px(x);
    const cy = px(y + bob);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(cx - 10, cy - 41, 20, 45);
  }

  // Shimmering tears of emotion when watching Cris in Round 3 of the karate championship
  if (opts.emotionalTears) {
    const cx = px(x);
    const cy = px(y + bob);
    ctx.fillStyle = '#9be4ff';
    ctx.fillRect(cx - 5, cy - Math.round(52 * boost), 2, 4);
    ctx.fillRect(cx + 3, cy - Math.round(52 * boost), 2, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 5, cy - Math.round(53 * boost), 2, 2);
    ctx.fillRect(cx + 3, cy - Math.round(53 * boost), 2, 2);
  }
}

function drawLauraSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: {
    dir?: Direction;
    walkPhase?: number;
    isMoving?: boolean;
    bobY?: number;
    scaleBoost?: number;
  } = {},
): void {
  const boost = opts.scaleBoost ?? 1;
  const step = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob = (opts.bobY ?? 0) + (opts.isMoving ? Math.abs(step) * -1.5 * boost : 0);
  const dir = opts.dir ?? 'down';
  drawShadow(ctx, x, y + 6, 9.5 * boost, 3.8 * boost);

  const lauraSheet = getCharacterWalkSheetImage('laura');
  if (lauraSheet) {
    const row = dir === 'up' ? 2 : dir === 'down' ? 0 : 1;
    const col = opts.isMoving ? (step > 0.35 ? 1 : step < -0.35 ? 2 : 0) : 0;
    const flipX = row === 1 && dir === 'right';
    if (
      drawCrispWalkFrame(ctx, lauraSheet, row * 3 + col, x, y, 48 * boost, {
        bobY: bob,
        flipX,
      })
    ) {
      return;
    }
  }

  const sprite = getSkinSprite(SKIN_URLS.lauraFront);
  if (sprite) {
    drawCrispSprite(ctx, sprite, x, y + bob, 48 * boost, dir === 'left');
  }
}

function drawCristian7yo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: {
    dir?: Direction;
    walkPhase?: number;
    isMoving?: boolean;
    karateGi?: boolean;
    kataMove?: KarateKataMove | null;
    wearingMedal?: boolean;
    bobY?: number;
    scaleBoost?: number;
  } = {},
): void {
  const boost = opts.scaleBoost ?? 1;
  const step = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob = (opts.bobY ?? 0) + (opts.isMoving ? Math.abs(step) * -1.4 * boost : 0);
  const dir = opts.dir ?? 'down';
  drawShadow(ctx, x, y + 6, 9 * boost, 3.4 * boost);

  let drawn = false;
  if (opts.kataMove) {
    const kataSheet = getCharacterWalkSheetImage('s5CristianKarateKata');
    if (kataSheet) {
      const frameMap: Record<KarateKataMove, number> = {
        bow: 0,
        punch: 1,
        block: 2,
        kick: 3,
      };
      const frameIdx = frameMap[opts.kataMove] ?? 0;
      drawn = drawCrispWalkFrame(ctx, kataSheet, frameIdx, x, y, 42 * boost, {
        bobY: bob,
      });
    }
  }

  if (!drawn && opts.karateGi) {
    const karateWalkSheet = getCharacterWalkSheetImage('s5CristianKarateWalk');
    if (karateWalkSheet) {
      const row = dir === 'up' ? 2 : dir === 'down' ? 0 : 1;
      const col = opts.isMoving ? (step > 0.35 ? 1 : step < -0.35 ? 2 : 0) : 0;
      const flipX = row === 1 && dir === 'right';
      drawn = drawCrispWalkFrame(
        ctx,
        karateWalkSheet,
        row * 3 + col,
        x,
        y,
        41 * boost,
        {
          bobY: bob,
          flipX,
        },
      );
    }
  }

  if (!drawn) {
    const sprite = getSkinSprite(SKIN_URLS.s4Cristian7yo);
    if (sprite) {
      drawCrispSprite(ctx, sprite, x, y + bob, 40 * boost, dir === 'left');
      drawn = true;
    }
  }

  if (!drawn) {
    const cx = px(x);
    const cy = px(y + bob);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(cx - 8, cy - 38, 16, 42);
  }

  // Gold ribbon & medal on Cris's chest when standing on the podium
  if (opts.wearingMedal) {
    const cx = px(x);
    const cy = px(y + bob - 28 * boost);
    ctx.fillStyle = '#c83e37';
    ctx.fillRect(cx - 4, cy - 8, 2, 7);
    ctx.fillRect(cx + 2, cy - 8, 2, 7);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(cx - 4, cy - 2, 8, 8);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(cx - 3, cy - 1, 6, 6);
    ctx.fillStyle = '#fff9d6';
    ctx.fillRect(cx - 2, cy, 2, 2);
  }
}

function drawLucas5yo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: {
    dir?: Direction;
    walkPhase?: number;
    isMoving?: boolean;
    bobY?: number;
    scaleBoost?: number;
  } = {},
): void {
  const boost = opts.scaleBoost ?? 1;
  const step = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob = (opts.bobY ?? 0) + (opts.isMoving ? Math.abs(step) * -1.4 * boost : 0);
  const dir = opts.dir ?? 'down';
  drawShadow(ctx, x, y + 6, 8.2 * boost, 3.2 * boost);

  const lucasSheet = getCharacterWalkSheetImage('s5Lucas5yoWalk');
  if (lucasSheet) {
    const row = dir === 'up' ? 2 : dir === 'down' ? 0 : 1;
    const col = opts.isMoving ? (step > 0.35 ? 1 : step < -0.35 ? 2 : 0) : 0;
    const flipX = row === 1 && dir === 'right';
    if (
      drawCrispWalkFrame(ctx, lucasSheet, row * 3 + col, x, y, 36 * boost, {
        bobY: bob,
        flipX,
      })
    ) {
      return;
    }
  }

  const cx = px(x);
  const cy = px(y + bob);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 7, cy - 34, 14, 38);
  ctx.fillStyle = '#e8c455';
  ctx.fillRect(cx - 6, cy - 22, 12, 12);
}

function drawLara2yo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: {
    dir?: Direction;
    walkPhase?: number;
    isMoving?: boolean;
    isDancing?: boolean;
    danceElapsed?: number;
    bobY?: number;
    scaleBoost?: number;
  } = {},
): void {
  const boost = opts.scaleBoost ?? 1;
  const step = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob =
    (opts.bobY ?? 0) +
    (opts.isDancing
      ? Math.abs(Math.sin((opts.danceElapsed ?? 0) * 6.5)) * -3.0 * boost
      : opts.isMoving
        ? Math.abs(step) * -1.3 * boost
        : 0);
  const dir = opts.dir ?? 'down';
  drawShadow(ctx, x, y + 6, 7.2 * boost, 3.0 * boost);

  if (opts.isDancing) {
    const danceSheet = getCharacterWalkSheetImage('s5Lara2yoDance');
    if (danceSheet) {
      const frameIdx = Math.floor(Math.max(0, opts.danceElapsed ?? 0) * 3.2) % 4;
      if (
        drawCrispWalkFrame(ctx, danceSheet, frameIdx, x, y, 30 * boost, {
          bobY: bob,
        })
      ) {
        return;
      }
    }
  }

  const walkSheet = getCharacterWalkSheetImage('s5Lara2yoWalk');
  if (walkSheet) {
    const row = dir === 'up' ? 2 : dir === 'down' ? 0 : 1;
    const col = opts.isMoving ? (step > 0.35 ? 1 : step < -0.35 ? 2 : 0) : 0;
    const flipX = row === 1 && dir === 'right';
    if (
      drawCrispWalkFrame(ctx, walkSheet, row * 3 + col, x, y, 30 * boost, {
        bobY: bob,
        flipX,
      })
    ) {
      return;
    }
  }

  const cx = px(x);
  const cy = px(y + bob);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 6, cy - 28, 12, 32);
  ctx.fillStyle = '#f49cbb';
  ctx.fillRect(cx - 5, cy - 18, 10, 12);
}

function drawLaraBaby(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  opts: {
    poseIndex?: 0 | 1 | 2 | 3;
    targetHeight?: number;
    bobY?: number;
  } = {},
): void {
  const poseIdx = opts.poseIndex ?? 0;
  const targetH = opts.targetHeight ?? 21;
  const rock = Math.sin(t * 2.4) * 1.0 + (opts.bobY ?? 0);
  const image = getCharacterWalkSheetImage('s5LaraBaby');

  if (
    image &&
    drawCrispWalkFrame(ctx, image, poseIdx, x, y, targetH, {
      bobY: rock,
    })
  ) {
    return;
  }

  // Fallback pixel-art baby Lara with pink swaddle and upward "pica-pau" black hair tuft
  ctx.save();
  ctx.translate(px(x), px(y + rock));
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(-9, -18, 18, 18);
  ctx.fillStyle = '#f6a6c1';
  ctx.fillRect(-8, -17, 16, 16);
  ctx.fillStyle = '#1f1716';
  ctx.fillRect(-3, -22, 5, 5);
  ctx.restore();
}

function drawMemoryMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  unlocked: boolean,
  t: number,
): void {
  const pulse = Math.sin(t * 4.2) * 2.0;
  ctx.save();
  ctx.fillStyle = unlocked ? 'rgba(255, 209, 102, 0.24)' : 'rgba(255, 209, 102, 0.44)';
  ctx.beginPath();
  ctx.ellipse(px(x), px(y + 4), 13 + pulse * 0.4, 6 + pulse * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(px(x - 5), px(y - 8 + pulse * 0.5), 10, 10);
  ctx.fillStyle = unlocked ? '#d4a359' : '#ffd166';
  ctx.fillRect(px(x - 4), px(y - 7 + pulse * 0.5), 8, 8);
  ctx.fillStyle = '#fff9e6';
  ctx.fillRect(px(x - 2), px(y - 5 + pulse * 0.5), 3, 3);
  ctx.restore();
}

function drawBelaVistaPlaygroundEquipment(
  ctx: CanvasRenderingContext2D,
  t: number,
): void {
  ctx.save();

  // 1. Balanço (Swing set) on the lawn near the playground fort
  const swingX = px(15.2 * TILE_SIZE);
  const swingY = px(9.5 * TILE_SIZE);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(swingX - 18, swingY - 26, 36, 4);
  ctx.fillRect(swingX - 17, swingY - 26, 3, 28);
  ctx.fillRect(swingX + 14, swingY - 26, 3, 28);
  ctx.fillStyle = '#3b78b8';
  ctx.fillRect(swingX - 16, swingY - 25, 32, 2);
  ctx.fillRect(swingX - 16, swingY - 25, 2, 26);
  ctx.fillRect(swingX + 14, swingY - 25, 2, 26);

  // Two hanging swings gently swaying in the afternoon breeze
  const sway = Math.round(Math.sin(t * 2.2) * 2);
  ctx.fillStyle = '#d8dee9';
  ctx.fillRect(swingX - 10 + sway, swingY - 23, 1, 15);
  ctx.fillRect(swingX - 4 + sway, swingY - 23, 1, 15);
  ctx.fillRect(swingX + 4 - sway, swingY - 23, 1, 15);
  ctx.fillRect(swingX + 10 - sway, swingY - 23, 1, 15);
  ctx.fillStyle = '#d64e6c';
  ctx.fillRect(swingX - 11 + sway, swingY - 8, 8, 3);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(swingX + 3 - sway, swingY - 8, 8, 3);

  // 2. Escorregador (Slide) next to the wooden playground fort
  const slideX = px(17.1 * TILE_SIZE);
  const slideY = px(10.3 * TILE_SIZE);
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.moveTo(slideX - 14, slideY - 18);
  ctx.lineTo(slideX - 6, slideY - 18);
  ctx.lineTo(slideX + 10, slideY + 2);
  ctx.lineTo(slideX + 2, slideY + 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e04f44';
  ctx.beginPath();
  ctx.moveTo(slideX - 13, slideY - 17);
  ctx.lineTo(slideX - 7, slideY - 17);
  ctx.lineTo(slideX + 9, slideY + 1);
  ctx.lineTo(slideX + 3, slideY + 1);
  ctx.closePath();
  ctx.fill();

  // 3. Gangorra (Seesaw) on the grass
  const seesawX = px(12.6 * TILE_SIZE);
  const seesawY = px(11.6 * TILE_SIZE);
  const tiltY = Math.round(Math.sin(t * 2.5) * 2);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(seesawX - 3, seesawY - 5, 6, 7);
  ctx.fillStyle = '#4a8f58';
  ctx.fillRect(seesawX - 2, seesawY - 4, 4, 5);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(seesawX - 16, seesawY - 4 - tiltY);
  ctx.lineTo(seesawX + 16, seesawY - 4 + tiltY);
  ctx.stroke();
  ctx.strokeStyle = '#f0b23a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(seesawX - 15, seesawY - 4 - tiltY);
  ctx.lineTo(seesawX + 15, seesawY - 4 + tiltY);
  ctx.stroke();

  ctx.restore();
}

function drawSkateboardUnderFeet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const cx = px(x);
  const cy = px(y + 7);
  ctx.save();
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 12, cy - 2, 24, 5);
  ctx.fillStyle = '#d64e6c';
  ctx.fillRect(cx - 10, cy - 1, 20, 3);
  // Wheels
  ctx.fillStyle = '#1f1716';
  ctx.fillRect(cx - 8, cy + 3, 3, 2);
  ctx.fillRect(cx + 5, cy + 3, 3, 2);
  ctx.restore();
}

function drawParkedSidewalkBicycle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void {
  const cx = px(x);
  const cy = px(y);
  ctx.save();
  drawShadow(ctx, cx, cy + 4, 15, 4);
  // Wheels
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx - 12, cy - 5, 7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 12, cy - 5, 7, 0, Math.PI * 2);
  ctx.stroke();
  // Blue frame
  ctx.strokeStyle = '#3b78b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy - 5);
  ctx.lineTo(cx - 2, cy - 14);
  ctx.lineTo(cx + 10, cy - 14);
  ctx.lineTo(cx + 12, cy - 5);
  ctx.moveTo(cx - 2, cy - 14);
  ctx.lineTo(cx + 2, cy - 5);
  ctx.stroke();
  // Seat & rear rack
  ctx.fillStyle = '#3d2111';
  ctx.fillRect(cx - 5, cy - 17, 6, 3);
  ctx.fillRect(cx - 15, cy - 14, 8, 2);
  ctx.restore();
}

function drawArielBleacherBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: 'ISSO!' | 'Calma, respira!',
  t: number,
): void {
  const isIsso = text === 'ISSO!';
  const bounce = Math.abs(Math.sin(t * (isIsso ? 12 : 5))) * (isIsso ? -4.5 : -1.5);
  const bx = px(x);
  const by = px(y - 72 + bounce);
  const w = isIsso ? 86 : 118;
  const h = isIsso ? 26 : 22;

  ctx.save();
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bx - w / 2, by - h, w, h);
  ctx.fillStyle = isIsso ? '#ffd166' : '#fff5e1';
  ctx.fillRect(bx - w / 2 + 2, by - h + 2, w - 4, h - 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(bx - w / 2 + 4, by - h + 4, w - 8, 4);

  // Pointer triangle
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bx - 4, by, 8, 5);
  ctx.fillStyle = isIsso ? '#ffd166' : '#fff5e1';
  ctx.fillRect(bx - 2, by - 1, 4, 4);

  ctx.fillStyle = isIsso ? '#8c1d14' : '#3d2111';
  ctx.font = isIsso ? 'bold 13px monospace' : 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(isIsso ? '“ISSO!”' : '“Calma, respira!”', bx, by - (isIsso ? 7 : 6));
  ctx.restore();
}

function drawKarateRhythmRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  dir: Direction,
  ringProgress: number,
  lastRating: string,
): void {
  const targetR = 17;
  // Ring shrinks from 2.35 * targetR down to 0.85 * targetR as ringProgress goes 0 -> 1
  const clamped = Math.max(0, Math.min(1.2, ringProgress));
  const outerR = targetR * (2.35 - clamped * 1.35);
  const inSweetSpot = ringProgress >= 0.55 && ringProgress <= 0.94;

  ctx.save();
  // Target circle backdrop
  ctx.fillStyle = 'rgba(28, 16, 10, 0.82)';
  ctx.beginPath();
  ctx.arc(px(cx), px(cy), targetR + 3, 0, Math.PI * 2);
  ctx.fill();

  // Target hit ring
  ctx.strokeStyle = inSweetSpot ? '#52e37d' : '#ffd166';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(px(cx), px(cy), targetR, 0, Math.PI * 2);
  ctx.stroke();

  // Shrinking rhythm circle
  ctx.strokeStyle = inSweetSpot ? '#ffffff' : '#ff9f43';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(px(cx), px(cy), Math.max(6, outerR), 0, Math.PI * 2);
  ctx.stroke();

  // Direction arrow in center
  const arrow =
    dir === 'up' ? '↑' : dir === 'right' ? '→' : dir === 'left' ? '←' : '↓';
  ctx.fillStyle = inSweetSpot ? '#52e37d' : '#fff8dc';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(arrow, px(cx), px(cy + 6));

  if (lastRating) {
    ctx.fillStyle =
      lastRating === 'PERFEITO!'
        ? '#52e37d'
        : lastRating === 'BOM!'
          ? '#ffd166'
          : '#ff6b6b';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(lastRating, px(cx), px(cy - targetR - 10));
  }
  ctx.restore();
}

function drawJudgeScoresBoard(
  ctx: CanvasRenderingContext2D,
  scores: [number, number, number],
  totalScore: number,
  t: number,
): void {
  const cx = 12.0 * TILE_SIZE;
  const cy = 4.6 * TILE_SIZE;
  ctx.save();
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(px(cx - 94), px(cy - 20), 188, 40);
  ctx.fillStyle = '#2b1810';
  ctx.fillRect(px(cx - 92), px(cy - 18), 184, 36);

  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`NOTAS DOS JUÍZES · ${totalScore} PTS`, px(cx), px(cy - 7));

  scores.forEach((score, idx) => {
    const sx = cx - 56 + idx * 56;
    const pulse = Math.sin(t * 5 + idx) * 1.0;
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(px(sx - 21), px(cy - 1 + pulse * 0.3), 42, 15);
    ctx.fillStyle = '#1b0f0a';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(score.toFixed(1), px(sx), px(cy + 10 + pulse * 0.3));
  });
  ctx.restore();
}

function renderSplitScreenPregnancyCall(
  ctx: CanvasRenderingContext2D,
  sim: SimulationState,
  t: number,
): void {
  const W = MAP_COLS * TILE_SIZE;
  const H = MAP_ROWS * TILE_SIZE;
  const halfW = W / 2;
  const snap = getStage5PhoneCallSnapshot(sim);
  const arielSmiling = Boolean(snap?.step.arielSmiling);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // LEFT HALF: Grazi at Home in the Bela Vista Apartment above Mercado Guesser
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, halfW, H);
  ctx.clip();

  const aptBackdrop = getStage5MapBackdrop('bela_vista_apartment');
  if (aptBackdrop) {
    ctx.drawImage(aptBackdrop, -60, 0, W, H);
  } else {
    ctx.fillStyle = '#e8d5b5';
    ctx.fillRect(0, 0, halfW, H);
  }

  // Warm afternoon apartment glow
  ctx.fillStyle = 'rgba(255, 224, 178, 0.14)';
  ctx.fillRect(0, 0, halfW, H);

  // Grazi standing by the apartment telephone holding the receiver
  const graziX = halfW * 0.56;
  const graziY = 10.4 * TILE_SIZE;
  drawAdultGrazi(ctx, graziX, graziY, {
    dir: 'right',
    pregnant: false,
    bobY: Math.sin(t * 2.6) * 0.8,
    scaleBoost: 1.2,
  });

  // Telephone receiver in Grazi's hand
  ctx.fillStyle = '#3a2d28';
  ctx.fillRect(px(graziX + 8), px(graziY - 52), 7, 11);
  if ((snap?.step.index ?? 1) >= 2) {
    drawMoodIcon(ctx, graziX, graziY - 82, 'heart');
  }
  ctx.restore();

  // RIGHT HALF: Ariel at Work receiving the call
  ctx.save();
  ctx.beginPath();
  ctx.rect(halfW, 0, halfW, H);
  ctx.clip();

  const grad = ctx.createLinearGradient(halfW, 0, halfW, H);
  grad.addColorStop(0, '#2c3e54');
  grad.addColorStop(0.55, '#3b526e');
  grad.addColorStop(0.56, '#7a6855');
  grad.addColorStop(1, '#5e4e3e');
  ctx.fillStyle = grad;
  ctx.fillRect(halfW, 0, halfW, H);

  // Office window showing Bela Vista sky
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(halfW + 110, 62, 164, 96);
  ctx.fillStyle = '#89c4f4';
  ctx.fillRect(halfW + 116, 68, 152, 84);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(halfW + 138, 86, 42, 14);
  ctx.fillRect(halfW + 204, 102, 36, 12);
  ctx.fillStyle = '#2c3e54';
  ctx.fillRect(halfW + 190, 68, 4, 84);
  ctx.fillRect(halfW + 116, 108, 152, 4);

  // Workplace desk & telephone base
  const deskX = halfW + 124;
  const deskY = 10.1 * TILE_SIZE;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(deskX, deskY - 26, 148, 44);
  ctx.fillStyle = '#8c5834';
  ctx.fillRect(deskX + 3, deskY - 23, 142, 38);
  ctx.fillStyle = '#a97148';
  ctx.fillRect(deskX + 3, deskY - 23, 142, 10);

  ctx.fillStyle = '#23272e';
  ctx.fillRect(deskX + 22, deskY - 34, 22, 14);
  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(deskX + 66, deskY - 28, 32, 16);

  // Ariel standing by the work desk holding the phone receiver
  const arielX = halfW + halfW * 0.46;
  const arielY = 10.4 * TILE_SIZE;
  drawAdultAriel(ctx, arielX, arielY, {
    dir: 'left',
    bobY: arielSmiling ? Math.abs(Math.sin(t * 5.0)) * -2.2 : 0,
    scaleBoost: 1.2,
  });
  ctx.fillStyle = '#23272e';
  ctx.fillRect(px(arielX - 15), px(arielY - 54), 7, 11);

  if (arielSmiling) {
    drawMoodIcon(ctx, arielX, arielY - 84, 'heart');
    const bx = px(arielX + 10);
    const by = px(arielY - 104);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(bx - 76, by - 16, 152, 22);
    ctx.fillStyle = '#fff5f8';
    ctx.fillRect(bx - 74, by - 14, 148, 18);
    ctx.fillStyle = '#c93b6b';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('♥ “ESPERO QUE SEJA MENINA!”', bx, by - 2);
  }
  ctx.restore();

  // Center golden split-screen divider bar + pulsing phone icon
  ctx.fillStyle = '#24130c';
  ctx.fillRect(halfW - 5, 0, 10, H);
  ctx.fillStyle = '#d49b56';
  ctx.fillRect(halfW - 2, 0, 4, H);

  const pulseR = 19 + Math.sin(t * 4.5) * 2.0;
  ctx.fillStyle = '#24130c';
  ctx.beginPath();
  ctx.arc(halfW, H * 0.46, pulseR + 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(halfW, H * 0.46, pulseR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8c1d14';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('☎', halfW, H * 0.46 + 5);

  // Cinematic Letterbox bars (top and bottom) + labels
  const barH = 36;
  ctx.fillStyle = 'rgba(10, 6, 4, 0.94)';
  ctx.fillRect(0, 0, W, barH);
  ctx.fillRect(0, H - barH, W, barH);

  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('APARTAMENTO NO BELA VISTA · GRAZI', 20, 22);
  ctx.textAlign = 'right';
  ctx.fillText('NO SERVIÇO · ARIEL', W - 20, 22);

  ctx.restore();
}

export function renderStage5World(
  ctx: CanvasRenderingContext2D,
  sim: SimulationState,
  particles: ParticlePool,
  viewW: number,
  viewH: number,
): void {
  const s5 = sim.stage5;
  if (!s5) return;

  const t = sim.elapsedSeconds;
  const worldW = MAP_COLS * TILE_SIZE;
  const worldH = MAP_ROWS * TILE_SIZE;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#18100c';
  ctx.fillRect(0, 0, viewW, viewH);

  const baseScale = Math.min(viewW / worldW, viewH / worldH);
  const zoom = s5.cameraZoom || 1.0;
  const totalScale = baseScale * zoom;

  const camX = s5.cameraFocusX || worldW / 2;
  const camY = s5.cameraFocusY || worldH / 2;

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

  // Mild screen shake when Ariel shouts "ISSO!" in the karate championship
  const shakeOffset =
    s5.karate.screenShakeTimer > 0
      ? Math.round(Math.sin(t * 48) * 3.0 * Math.min(1, s5.karate.screenShakeTimer * 2))
      : 0;

  ctx.translate(viewW / 2 + shakeOffset, viewH / 2);
  ctx.scale(totalScale, totalScale);
  ctx.translate(-clampedCamX, -clampedCamY);

  // Special Split-Screen Cinematic Cutscene for Etapa 3 (Pregnancy Phone Call)
  if (s5.cutscene === 'pregnancy_phone_call') {
    renderSplitScreenPregnancyCall(ctx, sim, s5.cutsceneElapsed);
    particles.draw(ctx);
    ctx.restore();
    return;
  }

  // Draw the current Stage 5 map backdrop
  const backdrop = getStage5MapBackdrop(s5.mapId);
  if (backdrop) {
    ctx.drawImage(backdrop, 0, 0, worldW, worldH);
  } else {
    ctx.fillStyle = '#3b2d24';
    ctx.fillRect(0, 0, worldW, worldH);
  }

  // Etapa 1 visual props on Bela Vista Guesser street (bicycle on sidewalk + door marker)
  if (s5.mapId === 'bela_vista_guesser') {
    drawParkedSidewalkBicycle(ctx, 18.2 * TILE_SIZE, 9.7 * TILE_SIZE);
    if (s5.cutscene === 'none') {
      const doorPulse = 0.25 + 0.12 * Math.sin(t * 4);
      ctx.fillStyle = `rgba(255, 209, 102, ${doorPulse.toFixed(2)})`;
      ctx.fillRect(
        px(STAGE5_GUESSER_DOOR_POS.x - 14),
        px(STAGE5_GUESSER_DOOR_POS.y - 6),
        28,
        10,
      );
    }
  } else if (
    s5.mapId === 'bela_vista_apartment' &&
    s5.cutscene === 'none' &&
    sim.questPhase === 's5_explore_guesser_street'
  ) {
    const exitPulse = 0.25 + 0.12 * Math.sin(t * 4);
    ctx.fillStyle = `rgba(255, 209, 102, ${exitPulse.toFixed(2)})`;
    ctx.fillRect(
      px(STAGE5_APARTMENT_EXIT_POS.x - 16),
      px(STAGE5_APARTMENT_EXIT_POS.y - 5),
      32,
      10,
    );
  }

  // Collectible golden memory markers on current map during exploration
  if (s5.cutscene === 'none') {
    const unlockedSet = new Set(s5.unlockedMemories);
    for (const mem of STAGE_5_MEMORIES) {
      if (mem.mapId !== s5.mapId) continue;
      drawMemoryMarker(ctx, mem.x, mem.y, unlockedSet.has(mem.id), t);
    }
  }

  // ==========================================================================
  // SCENE-SPECIFIC CHARACTERS & ANIMATIONS
  // ==========================================================================
  if (s5.cutscene === 'bela_vista_arrival') {
    const walkProgress = Math.min(1, s5.cutsceneElapsed / 3.4);
    const baseX = (7.5 + walkProgress * 3.8) * TILE_SIZE;
    const baseY = 10.2 * TILE_SIZE;
    const isMoving = walkProgress < 1;

    ctx.fillStyle = OUTLINE;
    ctx.fillRect(px(15.6 * TILE_SIZE), px(8.9 * TILE_SIZE), 20, 16);
    ctx.fillStyle = '#c68b59';
    ctx.fillRect(px(15.6 * TILE_SIZE + 2), px(8.9 * TILE_SIZE + 2), 16, 12);

    drawAdultAriel(ctx, baseX - 28, baseY, {
      dir: 'right',
      isMoving,
      walkPhase: s5.cutsceneElapsed * 7,
    });
    drawAdultGrazi(ctx, baseX, baseY + 2, {
      dir: 'right',
      isMoving,
      walkPhase: s5.cutsceneElapsed * 7 + 0.8,
      pregnant: false,
    });
    drawCristian7yo(ctx, baseX + 26, baseY + 4, {
      dir: 'right',
      isMoving,
      walkPhase: s5.cutsceneElapsed * 8,
    });
  } else if (s5.cutscene === 'karate_kata_minigame') {
    // Etapa 2A: Karate Championship Kata Minigame
    const k = s5.karate;
    const arielShoutingIsso = k.arielBubbleTimer > 0 && k.arielBubbleText === 'ISSO!';
    const arielX = 9.2 * TILE_SIZE;
    const arielY = 5.2 * TILE_SIZE;
    const graziX = 10.6 * TILE_SIZE;
    const graziY = 5.2 * TILE_SIZE;

    drawAdultAriel(ctx, arielX, arielY, {
      dir: 'down',
      bobY: arielShoutingIsso ? Math.abs(Math.sin(t * 14)) * -5.5 : 0,
      scaleBoost: 0.94,
    });
    drawAdultGrazi(ctx, graziX, graziY, {
      dir: 'down',
      emotionalTears: k.graziEmotionalTears || k.round === 3,
      bobY: arielShoutingIsso ? Math.abs(Math.sin(t * 10)) * -2.0 : 0,
      scaleBoost: 0.94,
    });
    if (k.graziEmotionalTears || k.round === 3) {
      drawMoodIcon(ctx, graziX, graziY - 62, 'heart');
    }

    if (k.arielBubbleTimer > 0 && k.arielBubbleText) {
      drawArielBleacherBubble(ctx, arielX, arielY, k.arielBubbleText, t);
    }

    // Cris (7yo) in white karate gi performing the kata in the center of the blue/red tatami
    const crisX = 12.0 * TILE_SIZE;
    const crisY = 10.2 * TILE_SIZE;
    drawCristian7yo(ctx, crisX, crisY, {
      karateGi: true,
      kataMove: k.currentPose,
      bobY: k.poseHoldTimer > 0 ? -2.0 : 0,
      scaleBoost: 1.22,
    });

    // Shrinking rhythm circle indicator above/beside Cris on the tatami
    const currentStep = STAGE_5_KATA_MOVES[k.moveIndex];
    if (k.active && !k.awaitingRetry && currentStep) {
      drawKarateRhythmRing(
        ctx,
        crisX + 54,
        crisY - 36,
        currentStep.dir,
        k.ringProgress,
        k.lastRating,
      );
    }
  } else if (s5.cutscene === 'karate_podium') {
    // Etapa 2B: Judges' Scores, Podium & Medal with Cris smiling!
    drawJudgeScoresBoard(ctx, s5.karate.judgeScores, s5.karate.score, t);

    const arielX = 11.4 * TILE_SIZE;
    const arielY = 10.4 * TILE_SIZE;
    const graziX = 12.8 * TILE_SIZE;
    const graziY = 10.5 * TILE_SIZE;

    drawAdultAriel(ctx, arielX, arielY, {
      dir: 'right',
      bobY: Math.abs(Math.sin(t * 9)) * -3.0,
    });
    drawAdultGrazi(ctx, graziX, graziY, {
      dir: 'right',
      emotionalTears: true,
      bobY: Math.abs(Math.sin(t * 7)) * -2.0,
    });
    drawArielBleacherBubble(ctx, arielX, arielY, 'ISSO!', t);

    // Cris standing proudly on top of the 1st place podium wearing his medal and smiling
    const podium1stX = 20.8 * TILE_SIZE;
    const podium1stY = 7.45 * TILE_SIZE;
    drawCristian7yo(ctx, podium1stX, podium1stY, {
      karateGi: true,
      kataMove: 'bow',
      wearingMedal: true,
      bobY: Math.abs(Math.sin(t * 5)) * -1.8,
      scaleBoost: 1.12,
    });
    drawMoodIcon(ctx, podium1stX, podium1stY - 64, 'smile');
  } else if (s5.cutscene === 'pregnancy_time_passage') {
    // Etapa 4: Fade "Alguns meses depois" -> Grazi grávida walking in apartment -> walking on street
    const inApartment = s5.cutsceneElapsed < 5.4;
    if (inApartment) {
      const walkT = Math.max(0, Math.min(1, (s5.cutsceneElapsed - 1.6) / 3.6));
      const graziX = (9.6 + walkT * 4.4) * TILE_SIZE;
      const graziY = 10.7 * TILE_SIZE;
      const phase = s5.cutsceneElapsed * 6.0;

      drawAdultAriel(ctx, 14.8 * TILE_SIZE, 10.5 * TILE_SIZE, {
        dir: 'left',
      });
      drawCristian7yo(ctx, 8.6 * TILE_SIZE, 10.6 * TILE_SIZE, {
        dir: 'right',
      });
      drawAdultGrazi(ctx, graziX, graziY, {
        dir: 'right',
        isMoving: s5.cutsceneElapsed >= 1.5,
        walkPhase: phase,
        pregnant: true,
      });
      drawMoodIcon(ctx, graziX, graziY - 68, 'heart');
    } else {
      const walkT = Math.max(0, Math.min(1, (s5.cutsceneElapsed - 5.4) / 4.0));
      const centerX = (8.8 + walkT * 5.6) * TILE_SIZE;
      const walkY = 10.2 * TILE_SIZE;
      const phase = s5.cutsceneElapsed * 6.5;

      drawAdultAriel(ctx, centerX - 24, walkY, {
        dir: 'right',
        isMoving: true,
        walkPhase: phase,
      });
      drawAdultGrazi(ctx, centerX + 2, walkY + 2, {
        dir: 'right',
        isMoving: true,
        walkPhase: phase + 0.6,
        pregnant: true,
      });
      drawCristian7yo(ctx, centerX + 30, walkY + 4, {
        dir: 'right',
        isMoving: true,
        walkPhase: phase + 1.2,
      });
      drawMoodIcon(ctx, centerX + 2, walkY - 68, 'heart');
    }

    // Fade to black card with "Alguns meses depois" at the start of Etapa 4
    if (s5.cutsceneElapsed < 2.2) {
      const fadeAlpha =
        s5.cutsceneElapsed < 1.3
          ? 0.92
          : Math.max(0, 0.92 * (1 - (s5.cutsceneElapsed - 1.3) / 0.9));
      ctx.save();
      ctx.fillStyle = `rgba(10, 6, 4, ${fadeAlpha.toFixed(2)})`;
      ctx.fillRect(0, 0, worldW, worldH);
      if (fadeAlpha > 0.25) {
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Alguns meses depois...', worldW / 2, worldH / 2 - 6);
        ctx.fillStyle = '#faeccd';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('Bela Vista · A doce espera da Lara', worldW / 2, worldH / 2 + 16);
      }
      ctx.restore();
    }
  } else if (s5.cutscene === 'lara_baby_arrival') {
    const centerX = 11.8 * TILE_SIZE;
    const centerY = 10.6 * TILE_SIZE;
    const hugPhase = Math.min(1, Math.max(0, (s5.cutsceneElapsed - 1.8) / 1.8));
    const crisOffsetX = 42 - hugPhase * 27;

    drawAdultAriel(ctx, centerX - 28, centerY - 2, {
      dir: 'right',
      scaleBoost: 1.08,
    });
    drawAdultGrazi(ctx, centerX, centerY, {
      dir: 'right',
      pregnant: false,
      scaleBoost: 1.08,
    });
    // Baby Lara in Grazi's arms
    drawLaraBaby(ctx, centerX + 8, centerY - 18, t, {
      poseIndex: 0,
      targetHeight: 22,
    });
    // Cris runs happily and hugs baby Lara carefully
    drawCristian7yo(ctx, centerX + crisOffsetX, centerY + 3, {
      dir: 'left',
      isMoving: hugPhase > 0 && hugPhase < 1,
      walkPhase: s5.cutsceneElapsed * 8,
      scaleBoost: 1.08,
    });

    if (hugPhase >= 0.85) {
      drawMoodIcon(ctx, centerX + 10, centerY - 68, 'heart');
      drawMoodIcon(ctx, centerX + crisOffsetX, centerY - 60, 'smile');
    }
  } else if (s5.cutscene === 'lara_pepelequinha_dance') {
    const rugCenterX = 11.8 * TILE_SIZE;
    const rugCenterY = 10.8 * TILE_SIZE;

    drawAdultAriel(ctx, rugCenterX + 46, rugCenterY - 4, {
      dir: 'left',
      bobY: Math.sin(t * 5) * 1.0,
    });
    drawAdultGrazi(ctx, rugCenterX - 46, rugCenterY - 4, {
      dir: 'right',
      bobY: Math.sin(t * 5 + 1) * 1.0,
    });

    const crisLaughBob = Math.abs(Math.sin(t * 11)) * -2.8;
    drawCristian7yo(ctx, rugCenterX - 22, rugCenterY + 2, {
      dir: 'right',
      bobY: crisLaughBob,
    });
    drawMoodIcon(ctx, rugCenterX - 22, rugCenterY - 58, 'smile');

    // Animated speech bubble for Cris laughing
    const crisBx = px(rugCenterX - 32);
    const crisBy = px(rugCenterY - 68 + Math.sin(t * 9) * 1.5);
    ctx.save();
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(crisBx - 32, crisBy - 12, 64, 15);
    ctx.fillStyle = '#fff9e6';
    ctx.fillRect(crisBx - 30, crisBy - 10, 60, 11);
    ctx.fillStyle = '#7c4726';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('“Hahaha!”', crisBx, crisBy - 2);
    ctx.restore();

    const swayX = Math.sin(s5.cutsceneElapsed * 4.2) * 8;
    drawLara2yo(ctx, rugCenterX + 6 + swayX, rugCenterY + 6, {
      isDancing: true,
      danceElapsed: s5.cutsceneElapsed,
      scaleBoost: 1.14,
    });

    // Animated singing speech bubble above Lara ("Pepelequinha, pepelequinha!")
    const bx = px(rugCenterX + 10 + swayX);
    const by = px(rugCenterY - 48 + Math.sin(t * 7) * 2.5);
    const lyricText =
      Math.floor(s5.cutsceneElapsed * 1.6) % 2 === 0
        ? '♪ “Pepelequinha,” ♪'
        : '♪ “pepelequinha!” ♪';
    ctx.save();
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(bx - 68, by - 15, 136, 19);
    ctx.fillStyle = '#ffe5ef';
    ctx.fillRect(bx - 66, by - 13, 132, 15);
    ctx.fillStyle = '#b8255f';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(lyricText, bx, by - 3);
    ctx.restore();
  } else if (s5.cutscene === 'park_family_reunion') {
    // Etapa 7 Conclusion: Wide shot Family Photo Pose in front of the church & park (NO Ariel) + Soft Camera Flash
    drawBelaVistaPlaygroundEquipment(ctx, t);

    // Late-afternoon golden hour warm glaze
    ctx.fillStyle = 'rgba(255, 198, 112, 0.16)';
    ctx.fillRect(0, 0, worldW, worldH);

    const centerX = 12.2 * TILE_SIZE;
    const baseY = 10.6 * TILE_SIZE;

    // Still family photo pose: Grazi, Laura, Cris, Lara (2yo dressed), Lucas (5yo blond curly hair)
    drawAdultGrazi(ctx, centerX - 44, baseY, {
      dir: 'down',
    });
    drawLauraSprite(ctx, centerX - 20, baseY, {
      dir: 'down',
    });
    drawLara2yo(ctx, centerX + 4, baseY + 4, {
      dir: 'down',
    });
    drawLucas5yo(ctx, centerX + 26, baseY + 2, {
      dir: 'down',
    });
    drawCristian7yo(ctx, centerX + 50, baseY, {
      dir: 'down',
    });
    drawMoodIcon(ctx, centerX - 32, baseY - 68, 'heart');
    drawMoodIcon(ctx, centerX + 26, baseY - 58, 'smile');

    // Soft camera flash effect around t = 1.6..2.8s
    if (s5.cutsceneElapsed >= 1.4 && s5.cutsceneElapsed <= 2.9) {
      const flashDist = Math.abs(s5.cutsceneElapsed - 1.85);
      const flashAlpha = Math.max(0, Math.min(0.78, 0.78 * (1 - flashDist / 0.85)));
      if (flashAlpha > 0.01) {
        ctx.fillStyle = `rgba(255, 252, 240, ${flashAlpha.toFixed(2)})`;
        ctx.fillRect(0, 0, worldW, worldH);
      }
    }
  } else if (s5.cutscene === 'ponte_imaruim_ending') {
    // Etapa 8 Final:
    // Part A (0..3.2s): Slow camera farewell of Bela Vista (Mercado Guesser)
    // Part B (3.2s+): Grazi, Ariel, Cris and Lara walk together at Ponte do Imaruim and enter their new purchased apartment!
    if (s5.cutsceneElapsed < 3.2) {
      const walkX = (9.5 + (s5.cutsceneElapsed / 3.2) * 4.5) * TILE_SIZE;
      const walkY = 10.2 * TILE_SIZE;
      const phase = s5.cutsceneElapsed * 5.5;

      drawAdultAriel(ctx, walkX - 34, walkY, {
        dir: 'right',
        isMoving: true,
        walkPhase: phase,
      });
      drawAdultGrazi(ctx, walkX - 10, walkY + 1, {
        dir: 'right',
        isMoving: true,
        walkPhase: phase + 0.6,
      });
      drawLara2yo(ctx, walkX + 14, walkY + 4, {
        dir: 'right',
        isMoving: true,
        walkPhase: phase + 1.2,
      });
      drawCristian7yo(ctx, walkX + 38, walkY + 2, {
        dir: 'right',
        isMoving: true,
        walkPhase: phase + 1.8,
      });
    } else {
      const localT = s5.cutsceneElapsed - 3.2;
      const enterProgress = Math.min(1, localT / 3.2);
      const centerX = 11.8 * TILE_SIZE;
      // Walk together from the sidewalk up the paver driveway toward the apartment complex entrance
      const baseY = (11.3 - enterProgress * 1.45) * TILE_SIZE;
      const isWalkingIn = enterProgress < 1;
      const phase = localT * 6.0;

      drawAdultAriel(ctx, centerX - 32, baseY, {
        dir: isWalkingIn ? 'up' : 'down',
        isMoving: isWalkingIn,
        walkPhase: phase,
        scaleBoost: 1.04,
      });
      drawAdultGrazi(ctx, centerX - 10, baseY + 1, {
        dir: isWalkingIn ? 'up' : 'down',
        isMoving: isWalkingIn,
        walkPhase: phase + 0.5,
        scaleBoost: 1.04,
      });
      drawLara2yo(ctx, centerX + 12, baseY + 4, {
        dir: isWalkingIn ? 'up' : 'down',
        isMoving: isWalkingIn,
        isDancing: !isWalkingIn,
        walkPhase: phase + 1.0,
        danceElapsed: t * 0.6,
        scaleBoost: 1.04,
      });
      drawCristian7yo(ctx, centerX + 34, baseY + 2, {
        dir: isWalkingIn ? 'up' : 'down',
        isMoving: isWalkingIn,
        walkPhase: phase + 1.5,
        scaleBoost: 1.04,
      });
      if (!isWalkingIn) {
        drawMoodIcon(ctx, centerX - 21, baseY - 70, 'heart');
        drawMoodIcon(ctx, centerX + 23, baseY - 60, 'smile');
      }
    }
  } else {
    if (s5.mapId === 'bela_vista_park_church') {
      drawBelaVistaPlaygroundEquipment(ctx, t);
      // Warm late-afternoon golden sunlight glaze over the Bela Vista church & park
      ctx.fillStyle = 'rgba(255, 200, 118, 0.14)';
      ctx.fillRect(0, 0, worldW, worldH);

      const pulse = 0.22 + 0.1 * Math.sin(t * 3.5);
      ctx.fillStyle = `rgba(255, 224, 130, ${pulse.toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(
        px(STAGE5_PARK_SKATE_POS.x),
        px(STAGE5_PARK_SKATE_POS.y),
        14,
        6,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    type Drawable = { y: number; draw: () => void };
    const drawables: Drawable[] = [];

    for (const npc of sim.npcs) {
      if (!npc.visible) continue;
      drawables.push({
        y: npc.y,
        draw: () => {
          const isParkLive =
            s5.mapId === 'bela_vista_park_church' &&
            sim.questPhase === 's5_explore_park_reunion';
          if (npc.role === 'ariel') {
            drawAdultAriel(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: false,
            });
          } else if (npc.role === 'cristian') {
            if (isParkLive) {
              drawSkateboardUnderFeet(ctx, npc.x, npc.y);
            }
            drawCristian7yo(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: isParkLive,
              walkPhase: npc.dancePhaseOffset,
            });
          } else if (npc.role === 'lara') {
            drawLara2yo(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: isParkLive,
              walkPhase: npc.dancePhaseOffset,
            });
          } else if (npc.role === 'lucas') {
            drawLucas5yo(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: isParkLive,
              walkPhase: npc.dancePhaseOffset,
            });
          } else if (npc.role === 'laura') {
            drawLauraSprite(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: false,
            });
          }
        },
      });
    }

    drawables.push({
      y: sim.player.y,
      draw: () => {
        drawAdultGrazi(ctx, sim.player.x, sim.player.y, {
          dir: sim.player.dir,
          isMoving: sim.player.isMoving,
          walkPhase: sim.player.walkDistance * 0.16,
          pregnant: s5.graziPregnant,
        });
      },
    });

    drawables.sort((a, b) => a.y - b.y);
    for (const item of drawables) {
      item.draw();
    }
  }

  particles.draw(ctx);
  ctx.restore();
}
