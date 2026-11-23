import {
  SKIN_URLS,
  getCharacterWalkSheetImage,
  getS4GraziPregnantWalkSheetImage,
  getSkinSprite,
} from './characterSkins';
import {
  getStage5ArielWorkBackdrop,
  getStage5LaraCribBody,
  getStage5LaraCribFrontRail,
  getStage5LaraLayette,
  getStage5LaraMobile,
  getStage5MapBackdrop,
  getStage5ParkPolaroidPhoto,
} from './environmentArt';
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
  S5_APARTMENT_CHAR_SCALE,
  S5_LARA_ROOM_CHAR_SCALE,
  STAGE5_APARTMENT_EXIT_POS,
  STAGE5_GUESSER_DOOR_POS,
  STAGE5_LARA_ARRIVAL_LAYOUT,
  STAGE5_PARQUINHO_BLOCKED_ZONES,
  STAGE5_PARQUINHO_HOTSPOTS,
  STAGE5_PARQUINHO_PHOTO_MARK,
  STAGE5_PARQUINHO_WALK_ZONES,
  STAGE5_PEPELEQUINHA_DANCE_LAYOUT,
  STAGE5_QUARTO_LARA_BLOCKED_ZONES,
  STAGE5_QUARTO_LARA_HOTSPOTS,
  STAGE5_QUARTO_LARA_WALK_ZONES,
  STAGE_5_KATA_MOVES,
  STAGE_5_MEMORIES,
  findStage5FaceOverlaps,
  getStage5CharacterFaceBounds,
  getStage5LaraArrivalFaceBoxes,
  getStage5PepelequinhaDanceFaceBoxes,
} from './stage5Data';
import type { Stage5FaceBounds, Stage5Zone } from './stage5Data';
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
    profileSprite?: boolean;
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

  if (!drawn && !opts.karateGi && !opts.profileSprite) {
    const casualWalkSheet = getCharacterWalkSheetImage('s5Cristian7yoWalk');
    if (casualWalkSheet && casualWalkSheet.complete && casualWalkSheet.naturalWidth > 0) {
      const row = dir === 'down' ? 0 : dir === 'left' ? 1 : dir === 'right' ? 2 : 3;
      const col = opts.isMoving ? (step > 0.3 ? 1 : step < -0.3 ? 2 : 0) : 0;
      const cellW = casualWalkSheet.naturalWidth / 3;
      const cellH = casualWalkSheet.naturalHeight / 4;
      const drawH = Math.round(44 * GLOBAL_CHAR_SCALE * boost);
      const drawW = Math.round(drawH * (cellW / Math.max(1, cellH)));
      const footY = Math.round(y + bob + 8.5 + drawH * (4 / 128));
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        casualWalkSheet,
        Math.round(col * cellW),
        Math.round(row * cellH),
        Math.round(cellW),
        Math.round(cellH),
        Math.round(x - drawW / 2),
        footY - drawH,
        drawW,
        drawH,
      );
      ctx.restore();
      drawn = true;
    }
  }

  if (!drawn && opts.profileSprite) {
    const profile = getSkinSprite(SKIN_URLS.s5Cristian7yoPerfil);
    if (profile) {
      drawCrispSprite(ctx, profile, x, y + bob, 40 * boost, dir === 'right');
      drawn = true;
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

function drawHorizontalStripFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frameIndex: number,
  totalFrames: number,
  cx: number,
  cy: number,
  targetH: number,
  bobY = 0,
): boolean {
  if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) return false;
  const cellW = image.naturalWidth / Math.max(1, totalFrames);
  const cellH = image.naturalHeight;
  const clampedIdx = Math.max(0, Math.min(totalFrames - 1, frameIndex));
  const drawH = Math.round(targetH * GLOBAL_CHAR_SCALE);
  const drawW = Math.round(drawH * (cellW / Math.max(1, cellH)));
  const footY = Math.round(cy + bobY + 8.5);
  const drawX = Math.round(cx);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    image,
    Math.round(clampedIdx * cellW),
    0,
    Math.round(cellW),
    cellH,
    Math.round(drawX - drawW / 2),
    footY - drawH,
    drawW,
    drawH,
  );
  ctx.restore();
  return true;
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
  const stepIndex = snap?.step.index ?? 1;
  const arielSmiling = Boolean(snap?.step.arielSmiling);

  // Choose pose frame (0..2) for Grazi and Ariel from their dedicated 3-frame phone sheets
  const graziFrame = stepIndex <= 1 ? 0 : stepIndex <= 3 ? 1 : 2;
  const arielFrame = stepIndex <= 2 ? 0 : stepIndex === 3 ? 1 : 2;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // LEFT HALF: Grazi at Home in the approved Bela Vista living room backdrop
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, halfW, H);
  ctx.clip();

  const aptBackdrop = getStage5MapBackdrop('bela_vista_apartment');
  if (aptBackdrop && aptBackdrop.complete && aptBackdrop.naturalWidth > 0) {
    ctx.drawImage(aptBackdrop, -60, 0, W, H);
  } else {
    ctx.fillStyle = '#241812';
    ctx.fillRect(0, 0, halfW, H);
  }

  // Subtle warm afternoon light screen effect
  ctx.fillStyle = 'rgba(255, 224, 178, 0.10)';
  ctx.fillRect(0, 0, halfW, H);

  const graziX = halfW * 0.54;
  const graziY = 12.6 * TILE_SIZE;
  const graziPhoneSheet = getCharacterWalkSheetImage('s5GraziPhone');
  if (
    !graziPhoneSheet ||
    !drawHorizontalStripFrame(
      ctx,
      graziPhoneSheet,
      graziFrame,
      3,
      graziX,
      graziY,
      106,
      Math.sin(t * 2.2) * 0.6,
    )
  ) {
    drawAdultGrazi(ctx, graziX, graziY, {
      dir: 'right',
      pregnant: false,
      bobY: Math.sin(t * 2.2) * 0.6,
      scaleBoost: 1.3,
    });
  }
  ctx.restore();

  // RIGHT HALF: Ariel at Work (Koerich delivery truck backdrop + red uniform phone sheet)
  ctx.save();
  ctx.beginPath();
  ctx.rect(halfW, 0, halfW, H);
  ctx.clip();

  const workBackdrop = getStage5ArielWorkBackdrop();
  if (workBackdrop && workBackdrop.complete && workBackdrop.naturalWidth > 0) {
    // Frame the Koerich truck & courtyard cleanly inside the right half
    const scale = Math.max(halfW / workBackdrop.naturalWidth, H / workBackdrop.naturalHeight);
    const drawW = Math.round(workBackdrop.naturalWidth * scale);
    const drawH = Math.round(workBackdrop.naturalHeight * scale);
    const offsetX = Math.round(halfW + (halfW - drawW) / 2);
    const offsetY = Math.round((H - drawH) / 2);
    ctx.drawImage(workBackdrop, offsetX, offsetY, drawW, drawH);
  } else {
    ctx.fillStyle = '#1f2b3a';
    ctx.fillRect(halfW, 0, halfW, H);
  }

  const arielX = halfW + halfW * 0.48;
  const arielY = 12.6 * TILE_SIZE;
  const arielPhoneSheet = getCharacterWalkSheetImage('s5ArielPhone');
  if (
    !arielPhoneSheet ||
    !drawHorizontalStripFrame(
      ctx,
      arielPhoneSheet,
      arielFrame,
      3,
      arielX,
      arielY,
      108,
      arielSmiling ? Math.sin(t * 3.0) * 0.8 : 0,
    )
  ) {
    drawAdultAriel(ctx, arielX, arielY, {
      dir: 'left',
      bobY: arielSmiling ? Math.sin(t * 3.0) * 0.8 : 0,
      scaleBoost: 1.3,
    });
  }
  ctx.restore();

  // Clean split-screen divider line (screen effect only)
  ctx.fillStyle = '#140c08';
  ctx.fillRect(halfW - 2, 0, 4, H);

  // Subtle vignette & letterbox bars (screen effects only)
  const barH = 36;
  ctx.fillStyle = 'rgba(10, 6, 4, 0.94)';
  ctx.fillRect(0, 0, W, barH);
  ctx.fillRect(0, H - barH, W, barH);

  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('APARTAMENTO NO BELA VISTA · GRAZI', 20, 22);
  ctx.textAlign = 'right';
  ctx.fillText('ENTREGAS KOERICH · ARIEL', W - 20, 22);

  // Gentle fade-in at the start of the phone call
  if (t < 0.7) {
    const fadeAlpha = Math.max(0, 1 - t / 0.7);
    ctx.fillStyle = `rgba(10, 6, 4, ${fadeAlpha.toFixed(3)})`;
    ctx.fillRect(0, 0, W, H);
  }

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
    const L = STAGE5_LARA_ARRIVAL_LAYOUT;
    const walkProgress = Math.min(1, Math.max(0, s5.cutsceneElapsed / 2.0));
    const easedWalk = 1 - Math.pow(1 - walkProgress, 2);
    const crisX = L.crisStartX + (L.cris.x - L.crisStartX) * easedWalk;
    const crisIsWalking = walkProgress < 1;

    const cribBody = getStage5LaraCribBody();
    const cribFrontRail = getStage5LaraCribFrontRail();
    const cribFootY = Math.round(L.crib.y + 8.5);
    const cribLeft = Math.round(L.crib.x - L.crib.width / 2);
    const cribTop = cribFootY - L.crib.height;

    type ArrivalDrawable = { y: number; draw: () => void };
    const drawables: ArrivalDrawable[] = [
      {
        y: L.ariel.y,
        draw: () => {
          drawAdultAriel(ctx, L.ariel.x, L.ariel.y, {
            dir: 'right',
            scaleBoost: S5_LARA_ROOM_CHAR_SCALE,
          });
        },
      },
      {
        y: L.grazi.y,
        draw: () => {
          drawAdultGrazi(ctx, L.grazi.x, L.grazi.y, {
            dir: 'right',
            pregnant: false,
            scaleBoost: S5_LARA_ROOM_CHAR_SCALE,
          });
        },
      },
      {
        y: L.cris.y,
        draw: () => {
          drawCristian7yo(ctx, crisX, L.cris.y, {
            dir: 'left',
            isMoving: crisIsWalking,
            walkPhase: s5.cutsceneElapsed * 7,
            profileSprite: !crisIsWalking,
            scaleBoost: S5_LARA_ROOM_CHAR_SCALE,
          });
        },
      },
      {
        y: L.crib.y,
        draw: () => {
          if (cribBody && cribBody.complete && cribBody.naturalWidth > 0) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(cribBody, cribLeft, cribTop, L.crib.width, L.crib.height);
            ctx.restore();
          }
        },
      },
      {
        y: L.crib.y + 0.1,
        draw: () => {
          drawLaraBaby(ctx, L.lara.x, L.lara.y, t, {
            poseIndex: 1,
            targetHeight: 26,
          });
        },
      },
      {
        y: L.crib.y + 0.2,
        draw: () => {
          if (cribFrontRail && cribFrontRail.complete && cribFrontRail.naturalWidth > 0) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(cribFrontRail, cribLeft, cribTop, L.crib.width, L.crib.height);
            ctx.restore();
          }
        },
      },
    ];

    drawables.sort((a, b) => a.y - b.y);
    for (const item of drawables) {
      item.draw();
    }

    if (walkProgress >= 0.9) {
      drawMoodIcon(ctx, L.crib.x + 2, L.crib.y - 72, 'heart');
      drawMoodIcon(ctx, crisX, L.cris.y - 62, 'smile');
    }
  } else if (s5.cutscene === 'lara_pepelequinha_dance') {
    const L = STAGE5_PEPELEQUINHA_DANCE_LAYOUT;
    const crisLaughBob = Math.abs(Math.sin(t * 11)) * -2.8;
    const swayX = Math.sin(s5.cutsceneElapsed * 4.2) * 8;
    const laraX = L.lara.x + swayX;

    // Sort all 4 characters by feet Y: Grazi, Cris & Ariel stay behind/beside while Lara dances unobstructed in front
    const danceDrawables: Array<{ y: number; draw: () => void }> = [
      {
        y: L.grazi.y,
        draw: () => {
          drawAdultGrazi(ctx, L.grazi.x, L.grazi.y, {
            dir: 'right',
            bobY: Math.sin(t * 5 + 1) * 1.0,
            scaleBoost: S5_APARTMENT_CHAR_SCALE,
          });
        },
      },
      {
        y: L.ariel.y,
        draw: () => {
          drawAdultAriel(ctx, L.ariel.x, L.ariel.y, {
            dir: 'left',
            bobY: Math.sin(t * 5) * 1.0,
            scaleBoost: S5_APARTMENT_CHAR_SCALE,
          });
        },
      },
      {
        y: L.cris.y,
        draw: () => {
          drawCristian7yo(ctx, L.cris.x, L.cris.y, {
            dir: 'right',
            bobY: crisLaughBob,
            scaleBoost: S5_APARTMENT_CHAR_SCALE,
          });
        },
      },
      {
        y: L.lara.y,
        draw: () => {
          drawLara2yo(ctx, laraX, L.lara.y, {
            isDancing: true,
            danceElapsed: s5.cutsceneElapsed,
            scaleBoost: S5_APARTMENT_CHAR_SCALE,
          });
        },
      },
    ];
    danceDrawables.sort((a, b) => a.y - b.y);
    for (const item of danceDrawables) {
      item.draw();
    }

    drawMoodIcon(ctx, L.cris.x, L.cris.y - 60, 'smile');

    // Animated speech bubble for Cris laughing
    const crisBx = px(L.cris.x - 6);
    const crisBy = px(L.cris.y - 72 + Math.sin(t * 9) * 1.5);
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

    // Animated singing speech bubble above Lara ("Pepelequinha, pepelequinha!")
    const bx = px(laraX);
    const by = px(L.lara.y - 58 + Math.sin(t * 7) * 2.5);
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
    // Etapa 7 Conclusion: Family Photo Pose on the free corridor of the parquinho_igreja backdrop (NO Ariel) + Soft Camera Flash.
    // The scenery is ONLY the approved backdrop image — nothing is drawn by code here.
    const centerX = STAGE5_PARQUINHO_PHOTO_MARK.x;
    const baseY = STAGE5_PARQUINHO_PHOTO_MARK.y;

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
    // Etapa 7 (parquinho_igreja): the scenery is ONLY the backdrop image. Characters are
    // drawn on top, sorted by feet Y. No equipment/trees/skate track is drawn by code.

    type Drawable = { y: number; draw: () => void };
    const drawables: Drawable[] = [];

    // Ajuste 2: montagem passo a passo do quarto da Lara usando somente imagens PNG transparentes
    if (s5.mapId === 'bela_vista_lara_room' && s5.nurseryStage >= 1) {
      const crib = STAGE5_LARA_ARRIVAL_LAYOUT.crib;
      const cribFootY = Math.round(crib.y + 8.5);
      const cribLeft = Math.round(crib.x - crib.width / 2);
      const cribTop = cribFootY - crib.height;
      const cribBody = getStage5LaraCribBody();
      const cribFrontRail = getStage5LaraCribFrontRail();
      const mobileImg = getStage5LaraMobile();
      const layetteImg = getStage5LaraLayette();

      drawables.push({
        y: crib.y,
        draw: () => {
          if (cribBody && cribBody.complete && cribBody.naturalWidth > 0) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(cribBody, cribLeft, cribTop, crib.width, crib.height);
            ctx.restore();
          }
        },
      });

      if (s5.nurseryStage >= 3) {
        drawables.push({
          y: crib.y + 0.1,
          draw: () => {
            if (layetteImg && layetteImg.complete && layetteImg.naturalWidth > 0) {
              const layW = 58;
              const layH = Math.round((layW * layetteImg.naturalHeight) / Math.max(1, layetteImg.naturalWidth));
              ctx.save();
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(
                layetteImg,
                Math.round(crib.x - layW / 2 + 4),
                Math.round(cribTop + 14),
                layW,
                layH,
              );
              ctx.restore();
            }
          },
        });
        drawables.push({
          y: crib.y + 0.2,
          draw: () => {
            if (cribFrontRail && cribFrontRail.complete && cribFrontRail.naturalWidth > 0) {
              ctx.save();
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(cribFrontRail, cribLeft, cribTop, crib.width, crib.height);
              ctx.restore();
            }
          },
        });
      }

      if (s5.nurseryStage >= 2) {
        drawables.push({
          y: crib.y + 0.25,
          draw: () => {
            if (mobileImg && mobileImg.complete && mobileImg.naturalWidth > 0) {
              const mobW = 46;
              const mobH = Math.round((mobW * mobileImg.naturalHeight) / Math.max(1, mobileImg.naturalWidth));
              const sway = Math.sin(t * 2.2) * 1.5;
              ctx.save();
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(
                mobileImg,
                Math.round(cribLeft + 10 + sway),
                Math.round(cribTop - mobH + 22),
                mobW,
                mobH,
              );
              ctx.restore();
            }
          },
        });
      }
    }

    const exploreScaleBoost =
      s5.mapId === 'bela_vista_apartment'
        ? S5_APARTMENT_CHAR_SCALE
        : s5.mapId === 'bela_vista_lara_room'
          ? S5_LARA_ROOM_CHAR_SCALE
          : 1.0;

    for (const npc of sim.npcs) {
      if (!npc.visible) continue;
      drawables.push({
        y: npc.y,
        draw: () => {
          const isParkLive =
            s5.mapId === 'parquinho_igreja' &&
            sim.questPhase === 's5_explore_park_reunion';
          if (npc.role === 'ariel') {
            drawAdultAriel(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: false,
              scaleBoost: exploreScaleBoost,
            });
          } else if (npc.role === 'cristian') {
            if (isParkLive) {
              drawSkateboardUnderFeet(ctx, npc.x, npc.y);
            }
            drawCristian7yo(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: isParkLive,
              walkPhase: npc.dancePhaseOffset,
              scaleBoost: exploreScaleBoost,
            });
          } else if (npc.role === 'lara') {
            drawLara2yo(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: isParkLive,
              walkPhase: npc.dancePhaseOffset,
              scaleBoost: exploreScaleBoost,
            });
          } else if (npc.role === 'lucas') {
            drawLucas5yo(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: isParkLive,
              walkPhase: npc.dancePhaseOffset,
              scaleBoost: exploreScaleBoost,
            });
          } else if (npc.role === 'laura') {
            drawLauraSprite(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: false,
              scaleBoost: exploreScaleBoost,
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
          scaleBoost: exploreScaleBoost,
        });
      },
    });

    drawables.sort((a, b) => a.y - b.y);
    for (const item of drawables) {
      item.draw();
    }
  }

  if (stage5DebugOverlay) {
    if (s5.mapId === 'parquinho_igreja') {
      drawParquinhoDebugOverlay(ctx, sim);
    } else if (s5.mapId === 'bela_vista_lara_room') {
      drawQuartoLaraDebugOverlay(ctx, sim);
    }
    const faceBoxes = collectStage5VisibleFaceBoxes(sim);
    if (faceBoxes.length > 0) {
      drawStage5FaceOverlapDebugOverlay(ctx, faceBoxes);
    }
  }

  particles.draw(ctx);
  ctx.restore();

  if (s5.cutscene === 'park_family_reunion') {
    drawParkFamilyPolaroidOverlay(ctx, s5.cutsceneElapsed, viewW, viewH);
  }
}

// ============================================================================
// DEBUG (F3): zonas caminháveis (verde), bloqueadas (vermelho) e hotspots (amarelo)
// desenhadas por cima do fundo do parquinho, para conferir o alinhamento com a imagem.
// ============================================================================
let stage5DebugOverlay = false;

export function toggleStage5DebugOverlay(): boolean {
  stage5DebugOverlay = !stage5DebugOverlay;
  return stage5DebugOverlay;
}

function collectStage5VisibleFaceBoxes(sim: SimulationState): Stage5FaceBounds[] {
  const s5 = sim.stage5;
  if (!s5) return [];

  if (s5.cutscene === 'lara_baby_arrival') {
    const L = STAGE5_LARA_ARRIVAL_LAYOUT;
    const walkProgress = Math.min(1, Math.max(0, s5.cutsceneElapsed / 2.0));
    const easedWalk = 1 - Math.pow(1 - walkProgress, 2);
    const crisX = L.crisStartX + (L.cris.x - L.crisStartX) * easedWalk;
    return getStage5LaraArrivalFaceBoxes(crisX);
  }

  if (s5.cutscene === 'lara_pepelequinha_dance') {
    const swayX = Math.sin(s5.cutsceneElapsed * 4.2) * 8;
    return getStage5PepelequinhaDanceFaceBoxes(swayX);
  }

  if (s5.cutscene === 'none') {
    const boxes: Stage5FaceBounds[] = [
      getStage5CharacterFaceBounds(
        'player_grazi',
        'Grazi',
        sim.player.x,
        sim.player.y,
        Math.round(48 * GLOBAL_CHAR_SCALE),
      ),
    ];
    for (const npc of sim.npcs) {
      if (!npc.visible) continue;
      const targetH =
        npc.role === 'ariel'
          ? 49
          : npc.role === 'laura'
            ? 48
            : npc.role === 'cristian'
              ? 40
              : npc.role === 'lucas'
                ? 36
                : 30;
      boxes.push(
        getStage5CharacterFaceBounds(
          npc.id,
          npc.name,
          npc.x,
          npc.y,
          Math.round(targetH * GLOBAL_CHAR_SCALE),
        ),
      );
    }
    return boxes;
  }

  return [];
}

function drawStage5FaceOverlapDebugOverlay(
  ctx: CanvasRenderingContext2D,
  faceBoxes: Stage5FaceBounds[],
): void {
  const overlaps = findStage5FaceOverlaps(faceBoxes);
  const collidingIds = new Set<string>();
  for (const ov of overlaps) {
    collidingIds.add(ov.a.id);
    collidingIds.add(ov.b.id);
  }

  ctx.save();
  ctx.lineWidth = 1;
  ctx.font = '6px monospace';
  ctx.textAlign = 'left';

  for (const box of faceBoxes) {
    const hit = collidingIds.has(box.id);
    ctx.strokeStyle = hit ? '#ff4d4f' : '#52e37d';
    ctx.fillStyle = hit ? 'rgba(255, 77, 79, 0.25)' : 'rgba(82, 227, 125, 0.14)';
    ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
    ctx.strokeRect(box.x1 + 0.5, box.y1 + 0.5, box.x2 - box.x1 - 1, box.y2 - box.y1 - 1);
    ctx.fillStyle = hit ? '#ffb3b3' : '#d8ffdf';
    ctx.fillText(box.label, box.x1, box.y1 - 2);
  }

  const bannerY = 18;
  const msg =
    overlaps.length === 0
      ? 'F3 · Sobreposição de rostos: OK (0)'
      : `F3 · ALERTA: ${overlaps[0].a.label} cobre rosto de ${overlaps[0].b.label}!`;
  const bannerW = Math.max(170, msg.length * 4 + 12);
  ctx.fillStyle = overlaps.length === 0 ? 'rgba(18, 60, 32, 0.85)' : 'rgba(140, 20, 20, 0.92)';
  ctx.fillRect(4, bannerY, bannerW, 11);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(msg, 8, bannerY + 8);
  ctx.restore();
}

function drawParquinhoDebugOverlay(ctx: CanvasRenderingContext2D, sim: SimulationState): void {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.font = '6px monospace';
  ctx.textAlign = 'left';
  const drawZone = (z: Stage5Zone, fill: string, stroke: string) => {
    ctx.fillStyle = fill;
    ctx.fillRect(z.x1, z.y1, z.x2 - z.x1, z.y2 - z.y1);
    ctx.strokeStyle = stroke;
    ctx.strokeRect(z.x1 + 0.5, z.y1 + 0.5, z.x2 - z.x1 - 1, z.y2 - z.y1 - 1);
  };
  for (const z of STAGE5_PARQUINHO_WALK_ZONES) {
    drawZone(z, 'rgba(60, 220, 90, 0.22)', 'rgba(60, 220, 90, 0.9)');
  }
  for (const z of STAGE5_PARQUINHO_BLOCKED_ZONES) {
    drawZone(z, 'rgba(235, 50, 50, 0.30)', 'rgba(255, 80, 80, 0.95)');
    ctx.fillStyle = '#ffffff';
    ctx.fillText(z.id, z.x1 + 2, z.y1 + 7);
  }
  for (const h of STAGE5_PARQUINHO_HOTSPOTS) {
    ctx.setLineDash([3, 2]);
    ctx.strokeStyle = '#ffe14d';
    ctx.strokeRect(h.x1 + 0.5, h.y1 + 0.5, h.x2 - h.x1 - 1, h.y2 - h.y1 - 1);
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffe14d';
    ctx.fillRect(h.standX - 2, h.standY - 2, 4, 4);
    ctx.fillText(h.label, h.standX + 4, h.standY + 10);
  }
  const mark = STAGE5_PARQUINHO_PHOTO_MARK;
  ctx.strokeStyle = '#66d9ff';
  ctx.strokeRect(mark.x - 50, mark.y - 4, 100, 8);
  ctx.fillStyle = '#66d9ff';
  ctx.fillText('marca da foto', mark.x - 48, mark.y - 6);
  // Player collision box (18x14 centered on the feet)
  const p = sim.player;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(4, 4, 150, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`F3 debug · Grazi (${Math.round(p.x)}, ${Math.round(p.y)})`, 7, 11);
  ctx.restore();
}

function drawQuartoLaraDebugOverlay(ctx: CanvasRenderingContext2D, sim: SimulationState): void {
  ctx.save();
  ctx.lineWidth = 1;
  ctx.font = '6px monospace';
  ctx.textAlign = 'left';
  const drawZone = (z: Stage5Zone, fill: string, stroke: string) => {
    ctx.fillStyle = fill;
    ctx.fillRect(z.x1, z.y1, z.x2 - z.x1, z.y2 - z.y1);
    ctx.strokeStyle = stroke;
    ctx.strokeRect(z.x1 + 0.5, z.y1 + 0.5, z.x2 - z.x1 - 1, z.y2 - z.y1 - 1);
  };
  for (const z of STAGE5_QUARTO_LARA_WALK_ZONES) {
    drawZone(z, 'rgba(60, 220, 90, 0.22)', 'rgba(60, 220, 90, 0.9)');
  }
  for (const z of STAGE5_QUARTO_LARA_BLOCKED_ZONES) {
    drawZone(z, 'rgba(235, 50, 50, 0.28)', 'rgba(255, 80, 80, 0.95)');
    ctx.fillStyle = '#ffffff';
    ctx.fillText(z.id, z.x1 + 2, z.y1 + 7);
  }
  for (const h of STAGE5_QUARTO_LARA_HOTSPOTS) {
    ctx.setLineDash([3, 2]);
    ctx.strokeStyle = '#ffe14d';
    ctx.strokeRect(h.x1 + 0.5, h.y1 + 0.5, h.x2 - h.x1 - 1, h.y2 - h.y1 - 1);
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffe14d';
    ctx.fillRect(h.standX - 2, h.standY - 2, 4, 4);
    ctx.fillText(h.label, h.standX + 4, h.standY + 10);
  }
  const p = sim.player;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(p.x - p.width / 2, p.y - p.height / 2, p.width, p.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  ctx.fillRect(4, 4, 178, 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`F3 Quarto da Lara · Grazi (${Math.round(p.x)}, ${Math.round(p.y)})`, 7, 11);
  ctx.restore();
}

function drawParkFamilyPolaroidOverlay(
  ctx: CanvasRenderingContext2D,
  cutsceneElapsed: number,
  viewW: number,
  viewH: number,
): void {
  if (cutsceneElapsed < 1.4) return;

  const flashPeakT = 1.85;
  ctx.save();

  if (cutsceneElapsed < flashPeakT) {
    const rise = Math.max(0, Math.min(1, (cutsceneElapsed - 1.4) / (flashPeakT - 1.4)));
    ctx.fillStyle = `rgba(255, 252, 244, ${(0.88 * rise).toFixed(3)})`;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.restore();
    return;
  }

  const sincePeak = cutsceneElapsed - flashPeakT;
  const dimAlpha = 0.56 * Math.min(1, sincePeak / 0.45);
  ctx.fillStyle = `rgba(20, 12, 8, ${dimAlpha.toFixed(3)})`;
  ctx.fillRect(0, 0, viewW, viewH);

  // Polaroid entrance: fade in from white + zoom 90% -> 100% over ~1s
  const polaroidAlpha = Math.min(1, sincePeak / 0.55);
  const zoomP = Math.min(1, sincePeak / 1.0);
  const zoomEased = 1 - Math.pow(1 - zoomP, 3);
  const scale = 0.9 + 0.1 * zoomEased;

  const availableH = Math.max(150, viewH - 220);
  const maxPhotoH = availableH * 0.72;
  const maxPhotoW = viewW * 0.58;
  const photoW = Math.max(160, Math.min(maxPhotoW, (maxPhotoH * 4) / 3, 440));
  const photoH = photoW * 0.75; // 4:3
  const borderSide = Math.max(10, Math.round(photoW * 0.055));
  const borderTop = borderSide;
  const borderBottom = Math.max(38, Math.round(photoW * 0.19));
  const cardW = photoW + borderSide * 2;
  const cardH = photoH + borderTop + borderBottom;

  const cx = viewW / 2;
  const cy = Math.max(66 + cardH / 2 + 6, (viewH - 138) / 2);
  const tiltRad = (-1.6 * Math.PI) / 180;

  ctx.save();
  ctx.globalAlpha = polaroidAlpha;
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);
  ctx.scale(scale, scale);

  // Soft drop shadow + Polaroid white card with larger bottom margin
  ctx.shadowColor = 'rgba(14, 8, 4, 0.48)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#fcfaf2';
  ctx.beginPath();
  ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 4);
  ctx.fill();

  // Clear shadow for crisp card outline, photo, and caption
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = '#dfd8c7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const photoX = -photoW / 2;
  const photoY = -cardH / 2 + borderTop;
  const photoImg = getStage5ParkPolaroidPhoto();
  if (photoImg && photoImg.complete && photoImg.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
  } else {
    ctx.fillStyle = '#dce8f5';
    ctx.fillRect(photoX, photoY, photoW, photoH);
  }

  ctx.strokeStyle = 'rgba(58, 36, 20, 0.22)';
  ctx.lineWidth = 1;
  ctx.strokeRect(photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);

  const fontSize = Math.max(13, Math.round(photoW * 0.056));
  ctx.fillStyle = '#3b2316';
  ctx.font = `700 italic ${fontSize}px "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'Família mais linda',
    0,
    photoY + photoH + borderBottom * 0.52,
  );
  ctx.restore();

  // Fade suave do branco do flash para a Polaroid
  if (sincePeak < 0.9) {
    const whiteAlpha = 0.88 * (1 - Math.min(1, sincePeak / 0.85));
    if (whiteAlpha > 0.005) {
      ctx.fillStyle = `rgba(255, 252, 244, ${whiteAlpha.toFixed(3)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }

  ctx.restore();
}

