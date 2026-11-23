import {
  SKIN_URLS,
  STAGE4_MOTHER_IN_LAW_SKIN_URL,
  getCharacterWalkSheetImage,
  getS4GraziPregnantWalkSheetImage,
  getSkinSprite,
} from './characterSkins';
import { getStage4MapBackdrop } from './environmentArt';
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './mapData';
import {
  GLOBAL_CHAR_SCALE,
  OUTLINE,
  drawShadow,
  drawSkinImage,
  drawWalkSheetFrame,
  getWalkSheetFrameBounds,
  px,
} from './pixelArt';
import type { ParticlePool } from './sprites';
import { drawMoodIcon } from './stage3Environments';
import {
  STAGE4_BICYCLE_POS,
  STAGE4_BIKE_BOARD_DURATION,
  STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION,
  STAGE4_BAR_MAN_POS,
  STAGE4_BUILD_SITE_POS,
  STAGE4_CONSOLE_POS,
  STAGE4_RADIO_POS,
  STAGE4_SCHOOL_PICKUP_FADE_DURATION,
  STAGE4_SCHOOL_BIKE_START_X,
  STAGE_4_MEMORIES,
} from './stage4Data';
import {
  STAGE4_PREGNANCY_REVEAL_TIMELINE,
  getCutsceneTimelineSnapshot,
} from './cutscene';
import type { CristianAgeStage, Direction, SimulationState } from './types';

// ============================================================================
// STAGE 4 — NOSSA PEQUENA GRANDE AVENTURA (World, Cutscenes & Growth Renderer)
// Young-adult Ariel and Grazi, with Cristian evolving from newborn to ~7 years.
// ============================================================================

const S4_ADULT_WALK_FRAMES = {
  right: [0, 1, 2, 6],
  left: [3, 4, 5, 7],
} as const;

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
    embarrassed?: boolean;
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
      const frames = S4_ADULT_WALK_FRAMES[facing];
      const frameIdx =
        ((Math.floor((opts.walkPhase ?? 0) / (Math.PI / 2)) % frames.length) +
          frames.length) %
        frames.length;
      if (
        drawWalkSheetFrame(ctx, adultWalkSheet, frames[frameIdx], x, y, 49 * boost, {
          bobY: bob,
        })
      ) {
        if (opts.embarrassed) {
          drawArielBlush(ctx, x, y + bob, boost);
        }
        return;
      }
    }
  }

  const sprite = getSkinSprite(SKIN_URLS.s4ArielAdult);
  if (sprite) {
    drawSkinImage(ctx, sprite, x, y + bob, 49 * boost, {
      flipX,
    });
    if (opts.embarrassed) {
      drawArielBlush(ctx, x, y + bob, boost);
    }
    return;
  }

  // Fallback pixel-art young-adult Ariel (short dark curly hair, navy polo, jeans)
  const cx = px(x);
  const cy = px(y + bob);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 10, cy - 42, 20, 46);
  ctx.fillStyle = '#2d1c14';
  ctx.fillRect(cx - 8, cy - 40, 16, 8);
  ctx.fillStyle = '#e8b992';
  ctx.fillRect(cx - 7, cy - 32, 14, 11);
  ctx.fillStyle = '#2a4b7c';
  ctx.fillRect(cx - 9, cy - 21, 18, 15);
  ctx.fillStyle = '#3c5d87';
  ctx.fillRect(cx - 8, cy - 6, 16, 10);
  if (opts.embarrassed) {
    drawArielBlush(ctx, x, y + bob, boost);
  }
}

function drawArielBlush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  ctx.fillStyle = '#e98e9b';
  ctx.fillRect(px(x - 5 * scale), px(y - 31 * scale), 3 * scale, 1.5 * scale);
  ctx.fillRect(px(x + 2 * scale), px(y - 31 * scale), 3 * scale, 1.5 * scale);
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
    pregnant9m?: boolean;
    usePregnantWalkSheet?: boolean;
    bobY?: number;
    scaleBoost?: number;
  } = {},
): void {
  const boost = opts.scaleBoost ?? 1;
  const step = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob = (opts.bobY ?? 0) + (opts.isMoving ? Math.abs(step) * -1.6 * boost : 0);
  const flipX = opts.dir === 'left';
  drawShadow(
    ctx,
    x,
    y + 6,
    (opts.pregnant9m ? 11.5 : opts.pregnant ? 11 : 10) * boost,
    4 * boost,
  );

  const isPregnant = Boolean(opts.pregnant || opts.pregnant9m);
  if (!isPregnant && opts.isMoving) {
    const adultWalkSheet = getCharacterWalkSheetImage('s4GraziAdultWalk');
    if (adultWalkSheet) {
      const facing = opts.dir === 'left' ? 'left' : 'right';
      const frames = S4_ADULT_WALK_FRAMES[facing];
      const frameIdx =
        ((Math.floor((opts.walkPhase ?? 0) / (Math.PI / 2)) % frames.length) +
          frames.length) %
        frames.length;
      if (
        drawWalkSheetFrame(ctx, adultWalkSheet, frames[frameIdx], x, y, 48 * boost, {
          bobY: bob,
        })
      ) {
        return;
      }
    }
  }

  const pregnantWalkSheet =
    isPregnant && opts.usePregnantWalkSheet
      ? getS4GraziPregnantWalkSheetImage()
      : null;
  if (pregnantWalkSheet) {
    const direction = opts.dir ?? 'down';
    const row = direction === 'up' ? 2 : direction === 'down' ? 0 : 1;
    const column = opts.isMoving ? (step > 0.35 ? 1 : step < -0.35 ? 2 : 0) : 0;
    const sourceFacesRight = row === 1 && column > 0;
    const sheetFlipX =
      row === 1 &&
      ((direction === 'left' && sourceFacesRight) ||
        (direction === 'right' && !sourceFacesRight));
    const frame = getWalkSheetFrameBounds(pregnantWalkSheet)?.[row * 3 + column];

    if (frame) {
      const drawH = 48 * GLOBAL_CHAR_SCALE * boost;
      const drawW = drawH * (frame.width / frame.height);
      const footY = y + bob + 8.5;
      const prevSmooth = ctx.imageSmoothingEnabled;
      const prevQuality = ctx.imageSmoothingQuality;

      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.translate(x, footY);
      if (sheetFlipX) ctx.scale(-1, 1);
      ctx.drawImage(
        pregnantWalkSheet,
        frame.x,
        frame.y,
        frame.width,
        frame.height,
        -drawW / 2,
        -drawH,
        drawW,
        drawH,
      );
      ctx.restore();

      ctx.imageSmoothingEnabled = prevSmooth;
      ctx.imageSmoothingQuality = prevQuality;
      return;
    }
  }

  const sprite = getSkinSprite(SKIN_URLS.s4GraziAdult);
  if (sprite) {
    drawSkinImage(ctx, sprite, x, y + bob, 48 * boost, {
      flipX,
    });

    // Clearly visible, natural, proportional 9-month pregnancy belly curve
    if (opts.pregnant9m) {
      const side = flipX ? -1 : 1;
      const bx = x + side * 6.8 * boost;
      const by = y + bob - 25.5 * boost;
      ctx.save();
      // Outer pixel-art outline
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.ellipse(bx, by, 9.2 * boost, 10.6 * boost, side * 0.14, 0, Math.PI * 2);
      ctx.fill();
      // Soft cream maternity blouse fabric matching Grazi's approved top
      ctx.fillStyle = '#f2e5c9';
      ctx.beginPath();
      ctx.ellipse(bx - side * 0.6 * boost, by, 7.6 * boost, 9.0 * boost, side * 0.14, 0, Math.PI * 2);
      ctx.fill();
      // Soft warm highlight & gentle lower belly curve shadow
      ctx.fillStyle = '#fff6df';
      ctx.beginPath();
      ctx.ellipse(bx + side * 1.4 * boost, by - 2.4 * boost, 4.2 * boost, 4.8 * boost, side * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(138, 106, 76, 0.28)';
      ctx.beginPath();
      ctx.ellipse(bx + side * 0.4 * boost, by + 5.2 * boost, 5.6 * boost, 2.8 * boost, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tiny floral motif dots matching her shirt
      ctx.fillStyle = '#739962';
      ctx.fillRect(px(bx + side * 1.5 * boost), px(by - 1 * boost), Math.max(1.5, 1.8 * boost), Math.max(1.5, 1.8 * boost));
      ctx.fillStyle = '#d98a7c';
      ctx.fillRect(px(bx + side * 3.8 * boost), px(by + 2.2 * boost), Math.max(1.5, 1.8 * boost), Math.max(1.5, 1.8 * boost));
      // Grazi's gentle supporting hand resting warmly on her 9-month belly
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.ellipse(bx + side * 1.5 * boost, by + 3.2 * boost, 3.6 * boost, 2.5 * boost, side * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f0c4a0';
      ctx.beginPath();
      ctx.ellipse(bx + side * 1.5 * boost, by + 3.2 * boost, 2.5 * boost, 1.6 * boost, side * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return;
  }

  // Fallback pixel-art young-adult Grazi
  const cx = px(x);
  const cy = px(y + bob);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 10, cy - 41, 20, 45);
  ctx.fillStyle = '#5c3622';
  ctx.fillRect(cx - 9, cy - 39, 18, 13);
  ctx.fillStyle = '#f0c4a0';
  ctx.fillRect(cx - 6, cy - 31, 12, 10);
  ctx.fillStyle = '#f3e5c7';
  ctx.fillRect(cx - 8, cy - 21, 16, 14);
  ctx.fillStyle = '#4c7199';
  ctx.fillRect(cx - 7, cy - 7, 14, 10);
}

function drawMadrinhaNani(
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

  const sprite = getSkinSprite(SKIN_URLS.s4Nani);
  if (sprite) {
    drawSkinImage(ctx, sprite, x, y + bob, 48 * boost, {
      flipX,
    });
    return;
  }

  const cx = px(x);
  const cy = px(y + bob);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 10, cy - 41, 20, 45);
  ctx.fillStyle = '#4f2f21';
  ctx.fillRect(cx - 9, cy - 39, 18, 13);
  ctx.fillStyle = '#e7b590';
  ctx.fillRect(cx - 6, cy - 31, 12, 10);
  ctx.fillStyle = '#cc6a4b';
  ctx.fillRect(cx - 8, cy - 21, 16, 14);
  ctx.fillStyle = '#3b5d86';
  ctx.fillRect(cx - 7, cy - 7, 14, 10);
}

function drawStage4MotherInLawMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: { scaleBoost?: number; bobY?: number; showPlaceholderLabel?: boolean } = {},
): void {
  const scale = opts.scaleBoost ?? 1;
  const bobY = opts.bobY ?? 0;
  const approvedSkinUrl = STAGE4_MOTHER_IN_LAW_SKIN_URL;
  if (approvedSkinUrl) {
    const sprite = getSkinSprite(approvedSkinUrl);
    if (sprite) {
      drawShadow(ctx, x, y + 6, 9.5 * scale, 3.8 * scale);
      drawSkinImage(ctx, sprite, x, y + bobY, 48 * scale);
      return;
    }
  }

  drawShadow(ctx, x, y + 6, 9.5 * scale, 3.8 * scale);
  ctx.save();
  ctx.translate(px(x), px(y + bobY));
  ctx.scale(scale, scale);
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.arc(0, -37, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#858b96';
  ctx.beginPath();
  ctx.arc(0, -37, 5.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.roundRect(-9, -29, 18, 27, 5);
  ctx.fill();
  ctx.fillStyle = '#a4a9b1';
  ctx.beginPath();
  ctx.roundRect(-7, -27, 14, 23, 4);
  ctx.fill();
  ctx.fillStyle = '#fff6df';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('?', 0, -12);
  ctx.restore();

  if (opts.showPlaceholderLabel && !approvedSkinUrl) {
    ctx.save();
    ctx.fillStyle = '#fff6df';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SOGRA · SKIN PROVISÓRIA', px(x), px(y + 17));
    ctx.restore();
  }
}

function drawJoinedHands(
  ctx: CanvasRenderingContext2D,
  leftX: number,
  rightX: number,
  y: number,
  sway: number,
): void {
  const midX = (leftX + rightX) / 2;
  const handY = y - 22 + sway;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.moveTo(leftX + 5, y - 30 + sway * 0.4);
  ctx.quadraticCurveTo(midX, handY + 2, rightX - 5, y - 30 + sway * 0.4);
  ctx.stroke();

  ctx.strokeStyle = '#ecc09b';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(leftX + 5, y - 30 + sway * 0.4);
  ctx.quadraticCurveTo(midX, handY + 2, rightX - 5, y - 30 + sway * 0.4);
  ctx.stroke();

  // Warm clasped hands highlight right at center
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.arc(midX, handY + 1, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2c8a2';
  ctx.beginPath();
  ctx.arc(midX, handY + 1, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawS4PregnantHandholdingCouple(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  y: number,
  opts: {
    facing: 'left' | 'right';
    isMoving: boolean;
    walkPhase: number;
    bobY?: number;
    scaleBoost?: number;
  },
): boolean {
  const image = getCharacterWalkSheetImage('s4PregnantCouple');
  if (!image) return false;

  const scaleBoost = opts.scaleBoost ?? 1;
  const rowOffset = opts.facing === 'left' ? 3 : 0;
  const frameColumn = opts.isMoving
    ? 1 + (Math.floor(opts.walkPhase / (Math.PI / 2)) % 2)
    : 0;
  const frameIndex = rowOffset + frameColumn;
  if (!getWalkSheetFrameBounds(image)?.[frameIndex]) return false;

  const bobY =
    (opts.bobY ?? 0) +
    (opts.isMoving ? Math.abs(Math.sin(opts.walkPhase)) * -1.6 * scaleBoost : 0);
  drawShadow(ctx, centerX - 14 * scaleBoost, y + 6, 8 * scaleBoost, 3.6 * scaleBoost);
  drawShadow(ctx, centerX + 14 * scaleBoost, y + 6, 8 * scaleBoost, 3.6 * scaleBoost);
  return drawWalkSheetFrame(ctx, image, frameIndex, centerX, y, 48 * scaleBoost, {
    bobY,
    scaleX: 1.3,
  });
}

function drawBlondCristian(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  age: Exclude<CristianAgeStage, 'unborn' | 'baby'>,
  opts: { flipX?: boolean; tiltRad?: number; bobY?: number; scaleBoost?: number } = {},
): void {
  const bob = opts.bobY ?? 0;
  const boost = opts.scaleBoost ?? 1;
  const shadowRx = age === 'toddler' ? 7 : age === 'child_5y' ? 8 : 9;
  drawShadow(ctx, x, y + 6, shadowRx, 3.2);

  const skinUrl =
    age === 'toddler'
      ? SKIN_URLS.s4CristianToddler
      : age === 'child_5y'
        ? SKIN_URLS.s4Cristian5yo
        : SKIN_URLS.s4Cristian7yo;

  const targetH = (age === 'toddler' ? 29 : age === 'child_5y' ? 35 : 40) * boost;
  const sprite = getSkinSprite(skinUrl);
  if (sprite) {
    drawSkinImage(ctx, sprite, x, y + bob, targetH, {
      flipX: opts.flipX,
      tiltRad: opts.tiltRad,
    });
    return;
  }

  // Fallback pixel-art ALWAYS-BLOND Cristian
  const h = Math.round(targetH * 1.2);
  const cx = px(x);
  const cy = px(y + bob);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 8, cy - h, 16, h + 4);
  // Natural golden-blond hair
  ctx.fillStyle = '#f2c96b';
  ctx.fillRect(cx - 7, cy - h + 2, 14, 9);
  ctx.fillStyle = '#ffe596';
  ctx.fillRect(cx - 5, cy - h + 3, 9, 4);
  // Face
  ctx.fillStyle = '#f5cfb0';
  ctx.fillRect(cx - 6, cy - h + 10, 12, 9);
  // Age-specific outfit
  ctx.fillStyle = age === 'toddler' ? '#62a4d6' : age === 'child_5y' ? '#d44c44' : '#4a8f58';
  ctx.fillRect(cx - 7, cy - h + 19, 14, h - 22);
}

function drawS4CristianBabySkin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  opts: {
    targetHeight: number;
    rotation?: number;
    scaleX?: number;
    bobY?: number;
  },
): boolean {
  const image = getCharacterWalkSheetImage('s4CristianBaby');
  if (!image) return false;

  const frameIndex = Math.floor(Math.max(0, t) * 2.4) % 4;
  if (!getWalkSheetFrameBounds(image)?.[frameIndex]) return false;

  const drawH = opts.targetHeight * GLOBAL_CHAR_SCALE;
  ctx.save();
  ctx.translate(px(x), px(y + (opts.bobY ?? 0)));
  if (opts.rotation) ctx.rotate(opts.rotation);
  const drawn = drawWalkSheetFrame(ctx, image, frameIndex, 0, drawH / 2 - 8.5, opts.targetHeight, {
    scaleX: opts.scaleX,
  });
  ctx.restore();
  return drawn;
}

function drawNewbornCristianBundle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
): void {
  const rock = Math.sin(t * 2.4) * 1.1;
  const rotation = -0.22 + Math.sin(t * 2.4) * 0.04;
  if (
    drawS4CristianBabySkin(ctx, x, y + rock, t, {
      targetHeight: 20,
      rotation,
      scaleX: 1.15,
    })
  ) {
    ctx.save();
    ctx.translate(px(x), px(y + rock));
    ctx.rotate(rotation);
    ctx.fillStyle = '#ecc09b';
    ctx.beginPath();
    ctx.ellipse(2.5, 4.8, 3.4, 2.0, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(px(x), px(y + rock));
  ctx.rotate(rotation);

  // Cozy sky-blue & cream swaddle cradled naturally across Grazi's arms
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.ellipse(0, 2, 10.5, 6.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#a8d5f2';
  ctx.beginPath();
  ctx.ellipse(0, 2, 9.2, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff5dc';
  ctx.beginPath();
  ctx.ellipse(1.5, 2, 6.8, 4.0, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sweet baby head nestled near Grazi's shoulder/chest
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.arc(-4.5, -1.5, 5.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7d2b5';
  ctx.beginPath();
  ctx.arc(-4.5, -1.5, 4.8, 0, Math.PI * 2);
  ctx.fill();

  // Blond hair while the approved baby sprite is loading.
  ctx.fillStyle = '#f2c96b';
  ctx.beginPath();
  ctx.ellipse(-5.2, -5.2, 4.4, 2.2, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe596';
  ctx.fillRect(-7, -6.5, 3.5, 1.8);

  // Peaceful closed smiling eyes & rosy cheeks
  ctx.fillStyle = '#4a2b1c';
  ctx.fillRect(-6.5, -1.5, 1.8, 1);
  ctx.fillRect(-3.2, -1.5, 1.8, 1);
  ctx.fillStyle = '#f298a4';
  ctx.fillRect(-7.2, 0.2, 1.6, 1);
  ctx.fillRect(-2.5, 0.2, 1.6, 1);

  // Grazi's gentle cradling hand over the swaddle
  ctx.fillStyle = '#ecc09b';
  ctx.beginPath();
  ctx.ellipse(2.5, 4.8, 3.4, 2.0, 0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBarManSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  met: boolean,
  opts: { direction?: Direction; isMoving?: boolean } = {},
): void {
  const direction = opts.direction ?? 'down';
  const row = direction === 'up' ? 2 : direction === 'down' ? 0 : 1;
  const frameColumn = opts.isMoving ? 1 + (Math.floor(t * 4) % 2) : row === 0 ? 1 : 0;
  const bob = opts.isMoving ? Math.abs(Math.sin(t * 7.5)) * -1.6 : Math.sin(t * 2.2) * 0.9;
  const walkSheet = getCharacterWalkSheetImage('barMan');
  const flipX = row === 1 && direction === 'left';
  drawShadow(ctx, x, y + 6, 10, 3.8);
  if (
    walkSheet &&
    drawWalkSheetFrame(ctx, walkSheet, row * 3 + frameColumn, x, y, 50, {
      bobY: bob,
      flipX,
    })
  ) {
    if (met) drawMoodIcon(ctx, x, y - 66, 'smile');
    return;
  }

  const cx = px(x);
  const cy = px(y + Math.sin(t * 2.2) * 0.9);

  // Shoes & trousers
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 11, cy - 58, 22, 64);
  ctx.fillStyle = '#3a3430';
  ctx.fillRect(cx - 9, cy - 2, 7, 6);
  ctx.fillRect(cx + 2, cy - 2, 7, 6);
  ctx.fillStyle = '#5a5248';
  ctx.fillRect(cx - 9, cy - 22, 18, 20);
  ctx.fillStyle = '#464038';
  ctx.fillRect(cx - 1, cy - 16, 2, 14);

  // Classic collared buttoned shirt (warm olive-tan)
  ctx.fillStyle = '#b9935a';
  ctx.fillRect(cx - 10, cy - 42, 20, 21);
  ctx.fillStyle = '#d4b279';
  ctx.fillRect(cx - 8, cy - 40, 16, 17);
  ctx.fillStyle = '#8b6839';
  ctx.fillRect(cx - 1, cy - 40, 2, 18);

  // Friendly waving arm
  const waveY = met ? Math.sin(t * 6) * 3 : 0;
  ctx.fillStyle = '#b9935a';
  ctx.fillRect(cx + 9, cy - 40 + px(waveY), 6, 12);
  ctx.fillStyle = '#e4b38c';
  ctx.fillRect(cx + 10, cy - 29 + px(waveY), 4, 5);

  // Head + friendly gray-brown hair + warm mustache
  ctx.fillStyle = '#e4b38c';
  ctx.fillRect(cx - 8, cy - 54, 16, 13);
  ctx.fillStyle = '#70635a';
  ctx.fillRect(cx - 9, cy - 58, 18, 7);
  ctx.fillStyle = '#998c82';
  ctx.fillRect(cx - 7, cy - 57, 12, 3);
  // Eyes & smile + mustache
  ctx.fillStyle = '#24130c';
  ctx.fillRect(cx - 5, cy - 49, 2, 2);
  ctx.fillRect(cx + 3, cy - 49, 2, 2);
  ctx.fillStyle = '#6c5c52';
  ctx.fillRect(cx - 5, cy - 45, 10, 2);
  ctx.fillStyle = '#fff5e4';
  ctx.fillRect(cx - 3, cy - 43, 6, 1);

  if (met) {
    // Cheerful little floating star above him after his warm remark
    drawMoodIcon(ctx, x, y - 66, 'smile');
  }
}

// ============================================================================
// EVOLVING 4-STAGE MEIA-ÁGUA HOUSE ON BACKYARD LOT
// 0 = empty staked plot -> 1 = concrete & brick walls -> 2 = sloped meia-água roof
// -> 3 = finished painted cozy starter cottage!
// ============================================================================
function drawMeiaAguaHouse(
  ctx: CanvasRenderingContext2D,
  buildStage: number,
  t: number,
): void {
  const cx = STAGE4_BUILD_SITE_POS.x;
  const baseY = 9.55 * TILE_SIZE;
  const houseW = 184;
  const left = px(cx - houseW / 2);

  // Grounded yard earth pad & foundation shadow (cleanly covers backdrop plot stakes once built)
  if (buildStage >= 1) {
    ctx.fillStyle = '#6f5137';
    ctx.fillRect(left - 12, baseY - 12, houseW + 24, 22);
    ctx.fillStyle = 'rgba(28, 18, 10, 0.28)';
    ctx.fillRect(left - 8, baseY - 1, houseW + 16, 11);
  } else {
    ctx.fillStyle = 'rgba(28, 18, 10, 0.22)';
    ctx.fillRect(left - 6, baseY - 2, houseW + 12, 10);
  }

  if (buildStage === 0) {
    // Stage 0: Cleared backyard plot with wooden stakes, string outline & blueprint shimmer
    const pulse = 0.22 + 0.12 * Math.sin(t * 4);
    ctx.fillStyle = `rgba(255, 220, 120, ${pulse.toFixed(2)})`;
    ctx.fillRect(left + 4, baseY - 58, houseW - 8, 56);

    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(left + 4, baseY - 58, houseW - 8, 56);
    ctx.setLineDash([]);

    // 4 corner wooden stakes
    const corners = [
      [left + 4, baseY - 58],
      [left + houseW - 8, baseY - 58],
      [left + 4, baseY - 6],
      [left + houseW - 8, baseY - 6],
    ];
    for (const [sx, sy] of corners) {
      ctx.fillStyle = OUTLINE;
      ctx.fillRect(sx - 2, sy - 10, 6, 14);
      ctx.fillStyle = '#a06a3b';
      ctx.fillRect(sx - 1, sy - 9, 4, 12);
    }

    // Center label plaque
    ctx.fillStyle = 'rgba(59, 32, 17, 0.85)';
    ctx.fillRect(cx - 56, baseY - 36, 112, 16);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TERRENO DA MEIA-ÁGUA', cx, baseY - 25);
    return;
  }

  // Concrete foundation slab (stages 1, 2, 3)
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(left - 4, baseY - 10, houseW + 8, 14);
  ctx.fillStyle = '#a8a298';
  ctx.fillRect(left - 2, baseY - 8, houseW + 4, 10);
  ctx.fillStyle = '#c4beb2';
  ctx.fillRect(left, baseY - 8, houseW, 3);

  const wallH = buildStage === 1 ? 58 : 78;
  const wallTop = baseY - 8 - wallH;

  if (buildStage === 1 || buildStage === 2) {
    // Rising / full terracotta brick walls with mortar courses
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(left - 2, wallTop - 2, houseW + 4, wallH + 4);
    ctx.fillStyle = '#b85a3a';
    ctx.fillRect(left, wallTop, houseW, wallH);

    // Brick course rows
    for (let rowY = wallTop + 6; rowY < baseY - 10; rowY += 8) {
      ctx.fillStyle = '#d4b89c';
      ctx.fillRect(left, rowY, houseW, 1.5);
      const offset = ((rowY - wallTop) / 8) % 2 === 0 ? 0 : 8;
      for (let bx = left + offset; bx < left + houseW - 4; bx += 16) {
        ctx.fillStyle = '#99442a';
        ctx.fillRect(bx, rowY - 6, 1, 6);
      }
    }

    // Door opening
    const doorX = left + 26;
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(doorX - 2, baseY - 56, 32, 48);
    ctx.fillStyle = '#3b2416';
    ctx.fillRect(doorX, baseY - 54, 28, 46);

    // Window opening
    const winX = left + 96;
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(winX - 2, wallTop + 20, 40, 30);
    ctx.fillStyle = '#3b2416';
    ctx.fillRect(winX, wallTop + 22, 36, 26);

    if (buildStage === 1) {
      // Wooden scaffolding beams & vertical rebar showing construction in progress
      ctx.fillStyle = '#784e2a';
      ctx.fillRect(left - 8, wallTop - 16, 4, wallH + 22);
      ctx.fillRect(left + houseW + 4, wallTop - 16, 4, wallH + 22);
      ctx.fillStyle = '#9e6b3d';
      ctx.fillRect(left - 10, wallTop + 8, houseW + 20, 5);
    }

    if (buildStage === 2) {
      // Wooden window & door frames installed
      ctx.strokeStyle = '#9e6537';
      ctx.lineWidth = 3;
      ctx.strokeRect(doorX, baseY - 54, 28, 46);
      ctx.strokeRect(winX, wallTop + 22, 36, 26);

      // Sloped Brazilian single-pitch terracotta MEIA-ÁGUA roof!
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.moveTo(left - 12, wallTop - 22);
      ctx.lineTo(left + houseW + 12, wallTop - 6);
      ctx.lineTo(left + houseW + 12, wallTop + 8);
      ctx.lineTo(left - 12, wallTop + 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#c45235';
      ctx.beginPath();
      ctx.moveTo(left - 9, wallTop - 19);
      ctx.lineTo(left + houseW + 9, wallTop - 4);
      ctx.lineTo(left + houseW + 9, wallTop + 5);
      ctx.lineTo(left - 9, wallTop);
      ctx.closePath();
      ctx.fill();

      // Tile ridges across sloped roof
      ctx.strokeStyle = '#8f331e';
      ctx.lineWidth = 2;
      for (let rx = left; rx < left + houseW + 6; rx += 12) {
        const ratio = (rx - left) / houseW;
        const topY = wallTop - 18 + ratio * 14;
        ctx.beginPath();
        ctx.moveTo(rx, topY);
        ctx.lineTo(rx - 2, topY + 17);
        ctx.stroke();
      }
    }
    return;
  }

  // Stage 3: Finished cozy plastered cream painted MEIA-ÁGUA cottage!
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(left - 2, wallTop - 2, houseW + 4, wallH + 4);
  ctx.fillStyle = '#f6e7c8';
  ctx.fillRect(left, wallTop, houseW, wallH);
  // Warm lower wainscot trim
  ctx.fillStyle = '#d7b78c';
  ctx.fillRect(left, baseY - 22, houseW, 14);
  ctx.fillStyle = '#fff5df';
  ctx.fillRect(left + 2, wallTop + 2, houseW - 4, 4);

  // Sloped single-pitch MEIA-ÁGUA terracotta roof with wooden eaves
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.moveTo(left - 14, wallTop - 26);
  ctx.lineTo(left + houseW + 14, wallTop - 7);
  ctx.lineTo(left + houseW + 14, wallTop + 8);
  ctx.lineTo(left - 14, wallTop + 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#c85334';
  ctx.beginPath();
  ctx.moveTo(left - 11, wallTop - 23);
  ctx.lineTo(left + houseW + 11, wallTop - 5);
  ctx.lineTo(left + houseW + 11, wallTop + 4);
  ctx.lineTo(left - 11, wallTop - 1);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#91331c';
  ctx.lineWidth = 2;
  for (let rx = left - 6; rx < left + houseW + 8; rx += 11) {
    const ratio = (rx - left) / houseW;
    const topY = wallTop - 22 + ratio * 17;
    ctx.beginPath();
    ctx.moveTo(rx, topY);
    ctx.lineTo(rx - 2, topY + 20);
    ctx.stroke();
  }

  // Finished wooden front door with brass knob & front step
  const doorX = left + 26;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(doorX - 2, baseY - 58, 34, 50);
  ctx.fillStyle = '#8b4e27';
  ctx.fillRect(doorX, baseY - 56, 30, 48);
  ctx.fillStyle = '#a86538';
  ctx.fillRect(doorX + 4, baseY - 51, 22, 16);
  ctx.fillRect(doorX + 4, baseY - 31, 22, 18);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(doorX + 24, baseY - 33, 3, 3);

  // Front concrete step
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(doorX - 4, baseY + 2, 38, 7);
  ctx.fillStyle = '#c6bfb2';
  ctx.fillRect(doorX - 2, baseY + 3, 34, 5);

  // Cozy lit window with wooden shutters, warm glow & flowerbox
  const winX = left + 92;
  const winY = wallTop + 18;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(winX - 7, winY - 2, 54, 34);
  // Shutters
  ctx.fillStyle = '#4e7a52';
  ctx.fillRect(winX - 5, winY, 7, 30);
  ctx.fillRect(winX + 38, winY, 7, 30);
  // Warm interior light
  const glow = 0.85 + 0.15 * Math.sin(t * 2.5);
  ctx.fillStyle = `rgba(255, 226, 138, ${glow.toFixed(2)})`;
  ctx.fillRect(winX + 2, winY, 36, 30);
  // Cross muntins
  ctx.fillStyle = '#6b3e22';
  ctx.fillRect(winX + 19, winY, 2, 30);
  ctx.fillRect(winX + 2, winY + 14, 36, 2);
  // Flowerbox
  ctx.fillStyle = '#7c4523';
  ctx.fillRect(winX, winY + 30, 40, 7);
  ctx.fillStyle = '#4f8f41';
  ctx.fillRect(winX + 3, winY + 27, 34, 4);
  ctx.fillStyle = '#ff7597';
  ctx.fillRect(winX + 8, winY + 25, 4, 3);
  ctx.fillRect(winX + 20, winY + 25, 4, 3);
  ctx.fillRect(winX + 30, winY + 25, 4, 3);
}

function drawMaterialPile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  taskId: string,
  t: number,
): void {
  const pulse = 0.28 + 0.16 * Math.sin(t * 5);
  ctx.fillStyle = `rgba(255, 214, 102, ${pulse.toFixed(2)})`;
  ctx.beginPath();
  ctx.ellipse(x, y + 3, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const cx = px(x);
  const cy = px(y);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 14, cy - 12, 28, 16);
  if (taskId === 'build_bricks') {
    ctx.fillStyle = '#c45839';
    ctx.fillRect(cx - 12, cy - 10, 24, 12);
    ctx.fillStyle = '#e07a56';
    ctx.fillRect(cx - 11, cy - 9, 10, 4);
    ctx.fillRect(cx + 1, cy - 9, 10, 4);
    ctx.fillRect(cx - 6, cy - 4, 12, 4);
  } else if (taskId === 'build_roof') {
    ctx.fillStyle = '#a86b3a';
    ctx.fillRect(cx - 12, cy - 10, 24, 12);
    ctx.fillStyle = '#c98852';
    ctx.fillRect(cx - 12, cy - 9, 24, 3);
    ctx.fillRect(cx - 12, cy - 3, 24, 3);
  } else {
    ctx.fillStyle = '#f2e8cf';
    ctx.fillRect(cx - 12, cy - 10, 24, 12);
    ctx.fillStyle = '#6096ba';
    ctx.fillRect(cx - 9, cy - 8, 8, 8);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(cx + 2, cy - 8, 7, 8);
  }

  // Floating arrow indicator
  const arrowBob = Math.sin(t * 6) * 3;
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18 + arrowBob);
  ctx.lineTo(cx - 6, cy - 26 + arrowBob);
  ctx.lineTo(cx + 6, cy - 26 + arrowBob);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// PLAYABLE TWILIGHT BICYCLE RIDE (Ariel pedaling Grazi on the rear garupa)
// Wheels, alternating pedals, headlight & Grazi sway driven by real motion!
// ============================================================================
function drawParkedBicycle(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  const cx = px(x);
  const cy = px(y);
  const wheelY = cy + 2;
  const rearX = cx - 22;
  const frontX = cx + 24;

  // Soft ground shadow
  ctx.fillStyle = 'rgba(18, 12, 22, 0.34)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 12, 38, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Kickstand
  ctx.strokeStyle = '#2c2420';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 2, wheelY + 1);
  ctx.lineTo(cx - 10, wheelY + 12);
  ctx.stroke();

  // Wheels
  for (const wx of [rearX, frontX]) {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(wx, wheelY, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#d4dbe4';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(wx, wheelY, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(220, 230, 240, 0.65)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(ang) * 9, wheelY - Math.sin(ang) * 9);
      ctx.lineTo(wx + Math.cos(ang) * 9, wheelY + Math.sin(ang) * 9);
      ctx.stroke();
    }
  }

  // Vintage blue frame, rear rack & saddle
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.moveTo(rearX, wheelY);
  ctx.lineTo(cx - 1, wheelY - 13);
  ctx.lineTo(cx + 16, wheelY - 21);
  ctx.lineTo(frontX, wheelY);
  ctx.moveTo(rearX - 9, wheelY - 13);
  ctx.lineTo(cx - 7, wheelY - 13);
  ctx.moveTo(cx + 14, wheelY - 26);
  ctx.lineTo(cx + 22, wheelY - 26);
  ctx.stroke();

  ctx.strokeStyle = '#3b82c4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(rearX, wheelY);
  ctx.lineTo(cx - 1, wheelY - 13);
  ctx.lineTo(cx + 16, wheelY - 21);
  ctx.lineTo(frontX, wheelY);
  ctx.moveTo(rearX - 9, wheelY - 13);
  ctx.lineTo(cx - 7, wheelY - 13);
  ctx.stroke();

  ctx.fillStyle = '#6b3e22';
  ctx.fillRect(cx - 5, wheelY - 16, 10, 3.5);
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.arc(cx + 22, wheelY - 22, 2.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawS4BicycleCoupleSkin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  physics?: {
    pedalPhase: number;
    facing: 'right' | 'left';
    speed: number;
  },
): boolean {
  const image = getCharacterWalkSheetImage('s4BicycleCouple');
  if (!image) return false;

  const facing = physics?.facing ?? 'left';
  const phase = ((physics?.pedalPhase ?? t * 9) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const moving = (physics?.speed ?? 0) > 6;
  const frameInCycle = moving ? Math.floor((phase / (Math.PI * 2)) * 3) : 0;
  const directionOffset = facing === 'left' ? 3 : 0;
  return drawWalkSheetFrame(ctx, image, directionOffset + frameInCycle, x, y + 7, 50);
}

function drawBicycleCouple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  physics?: {
    wheelAngle: number;
    pedalPhase: number;
    graziSway: number;
    facing: 'right' | 'left';
    speed: number;
  },
  passengerOnBike = true,
  graziPregnant = false,
): void {
  const wheelAngle = physics ? physics.wheelAngle : t * 10;
  const pedalPhase = physics ? physics.pedalPhase : t * 9;
  const graziSway = physics ? physics.graziSway : Math.sin(t * 5) * 0.025;
  const facing = physics ? physics.facing : 'right';
  const isMoving = physics ? physics.speed > 6 : true;

  const pedalBob = isMoving ? Math.sin(pedalPhase * 2) * 1.15 : Math.sin(t * 2.2) * 0.35;
  const graziBob = isMoving ? Math.sin(pedalPhase * 2 - 0.6) * 0.95 : Math.sin(t * 2.2 + 0.5) * 0.35;
  const cx = px(x);
  const cy = px(y);

  ctx.save();
  ctx.translate(cx, cy);
  if (facing === 'left') {
    ctx.scale(-1, 1);
  }

  const wheelY = 2;
  const rearX = -26;
  const frontX = 28;
  const crankCenterX = 1;
  const crankCenterY = wheelY + 1;

  // Warm headlight cone sweeping ahead along the evening neighborhood road
  const beam = ctx.createRadialGradient(32, -23, 4, 124, -6, 106);
  beam.addColorStop(0, 'rgba(255, 238, 166, 0.44)');
  beam.addColorStop(0.55, 'rgba(255, 224, 130, 0.14)');
  beam.addColorStop(1, 'rgba(255, 236, 158, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(29, -24);
  ctx.lineTo(148, -38);
  ctx.lineTo(148, 20);
  ctx.closePath();
  ctx.fill();

  // Road contact shadow directly beneath both tires
  ctx.fillStyle = 'rgba(18, 12, 22, 0.40)';
  ctx.beginPath();
  ctx.ellipse(0, wheelY + 13, 46, 7.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Far-side pedaling leg (hip -> pumping knee -> far pedal) behind the frame
  const farPhase = pedalPhase + Math.PI;
  const farFootX = crankCenterX + Math.cos(farPhase) * 6.5;
  const farFootY = crankCenterY + Math.sin(farPhase) * 5.2;
  const farKneeX = 7 + Math.cos(farPhase) * 3.5;
  const farKneeY = -7 + Math.sin(farPhase) * 3.8;
  if (isMoving) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 6.2;
    ctx.beginPath();
    ctx.moveTo(-4, -15 + pedalBob * 0.35);
    ctx.lineTo(px(farKneeX), px(farKneeY));
    ctx.lineTo(px(farFootX), px(farFootY));
    ctx.stroke();
    ctx.strokeStyle = '#294263';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(-4, -15 + pedalBob * 0.35);
    ctx.lineTo(px(farKneeX), px(farKneeY));
    ctx.lineTo(px(farFootX), px(farFootY));
    ctx.stroke();
  }

  // Far-side handlebar grip arm behind Ariel's torso
  ctx.lineCap = 'round';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.moveTo(4, -33 + pedalBob);
  ctx.lineTo(22, -28);
  ctx.stroke();
  ctx.strokeStyle = '#d4a37d';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(4, -33 + pedalBob);
  ctx.lineTo(22, -28);
  ctx.stroke();

  // Vintage blue bicycle wheels & spinning spokes driven strictly by wheelAngle
  for (const wx of [rearX, frontX]) {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.arc(wx, wheelY, 13.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#d4dbe4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(wx, wheelY, 11.2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(220, 230, 240, 0.78)';
    ctx.lineWidth = 1.25;
    for (let i = 0; i < 4; i++) {
      const ang = wheelAngle + (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(ang) * 10, wheelY - Math.sin(ang) * 10);
      ctx.lineTo(wx + Math.cos(ang) * 10, wheelY + Math.sin(ang) * 10);
      ctx.stroke();
    }
    ctx.fillStyle = '#3a3c46';
    ctx.beginPath();
    ctx.arc(wx, wheelY, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Classic blue steel frame + rear garupa rack + mudguards + handlebars + chainring
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 5.2;
  ctx.beginPath();
  // Rear triangle + seat tube + top tube + down tube + fork
  ctx.moveTo(rearX, wheelY);
  ctx.lineTo(crankCenterX, crankCenterY);
  ctx.lineTo(17, wheelY - 21);
  ctx.lineTo(-4, wheelY - 17);
  ctx.lineTo(crankCenterX, crankCenterY);
  ctx.moveTo(rearX, wheelY);
  ctx.lineTo(-4, wheelY - 17);
  ctx.moveTo(16, wheelY - 27);
  ctx.lineTo(frontX, wheelY);
  // Handlebar stem & curved grip
  ctx.moveTo(16, wheelY - 27);
  ctx.lineTo(24, wheelY - 28);
  // Rear garupa rack & vertical stays
  ctx.moveTo(rearX - 10, wheelY - 15);
  ctx.lineTo(-9, wheelY - 15);
  ctx.moveTo(rearX - 6, wheelY - 15);
  ctx.lineTo(rearX, wheelY);
  ctx.stroke();

  ctx.strokeStyle = '#3b82c4';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(rearX, wheelY);
  ctx.lineTo(crankCenterX, crankCenterY);
  ctx.lineTo(17, wheelY - 21);
  ctx.lineTo(-4, wheelY - 17);
  ctx.lineTo(crankCenterX, crankCenterY);
  ctx.moveTo(rearX, wheelY);
  ctx.lineTo(-4, wheelY - 17);
  ctx.moveTo(16, wheelY - 27);
  ctx.lineTo(frontX, wheelY);
  ctx.moveTo(rearX - 10, wheelY - 15);
  ctx.lineTo(-9, wheelY - 15);
  ctx.stroke();

  // Rear rack cushion bar & chainring gear
  ctx.fillStyle = '#5c4132';
  ctx.fillRect(rearX - 9, wheelY - 17, 23, 3.2);
  ctx.fillStyle = '#6b3e22';
  ctx.fillRect(-10, wheelY - 19, 12, 4.2);
  ctx.fillStyle = '#8d97a6';
  ctx.beginPath();
  ctx.arc(crankCenterX, crankCenterY, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.arc(25, wheelY - 24, 3.3, 0, Math.PI * 2);
  ctx.fill();

  // Seated upper-body characters clipped cleanly RIGHT AT SADDLE / GARUPA WAIST!
  // Zero standing legs bleed below the seat; seated hips sit firmly ON saddle & rack!
  ctx.save();
  ctx.beginPath();
  ctx.rect(-60, -96, 120, 82); // clips cleanly at y = -14 (exact seat height!)
  ctx.clip();

  if (passengerOnBike) {
    ctx.save();
    ctx.translate(-25, 11 + graziBob);
    ctx.rotate(graziSway + (isMoving ? 0.03 : 0));
    drawAdultGrazi(ctx, 0, 0, {
      dir: 'right',
      pregnant: graziPregnant,
      bobY: 0,
    });
    ctx.restore();
  }

  // Young-adult short-haired Ariel seated squarely on the saddle, leaning slightly forward
  ctx.save();
  ctx.translate(-3, 10 + pedalBob);
  ctx.rotate(isMoving ? 0.065 + Math.sin(pedalPhase) * 0.022 : 0.02);
  drawAdultAriel(ctx, 0, 0, {
    dir: 'right',
  });
  ctx.restore();
  ctx.restore();

  if (passengerOnBike) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.moveTo(-21, -29 + graziBob);
    ctx.lineTo(-10, -25 + pedalBob * 0.5);
    ctx.stroke();
    ctx.strokeStyle = '#f0c4a0';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-21, -29 + graziBob);
    ctx.lineTo(-10, -25 + pedalBob * 0.5);
    ctx.stroke();

    const graziLegSway = Math.sin(graziSway * 7) * 1.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 6.8;
    ctx.beginPath();
    ctx.moveTo(-25, -14 + graziBob * 0.4);
    ctx.lineTo(-16 + graziLegSway * 0.5, -7 + graziBob * 0.3);
    ctx.lineTo(-19 + graziLegSway, 5);
    ctx.stroke();
    ctx.strokeStyle = '#486c96';
    ctx.lineWidth = 4.4;
    ctx.beginPath();
    ctx.moveTo(-25, -14 + graziBob * 0.4);
    ctx.lineTo(-16 + graziLegSway * 0.5, -7 + graziBob * 0.3);
    ctx.lineTo(-19 + graziLegSway, 5);
    ctx.stroke();
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(-21 + px(graziLegSway), 4, 8, 4.5);
    ctx.fillStyle = '#f2f4f8';
    ctx.fillRect(-20 + px(graziLegSway), 5, 6.5, 2.8);
  }

  // Ariel's near-side arm gripping the handlebars (shoulder -> elbow -> grip)
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 5.2;
  ctx.beginPath();
  ctx.moveTo(0, -32 + pedalBob);
  ctx.lineTo(10, -28 + pedalBob * 0.4);
  ctx.lineTo(20, -26);
  ctx.stroke();
  ctx.strokeStyle = '#e5b68e';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(0, -32 + pedalBob);
  ctx.lineTo(10, -28 + pedalBob * 0.4);
  ctx.lineTo(20, -26);
  ctx.stroke();
  // Navy short sleeve cap over shoulder
  ctx.fillStyle = '#2a4b7c';
  ctx.beginPath();
  ctx.arc(0, -32 + pedalBob, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Ariel's near-side 2-segment leg: dynamically pumping the pedal or resting a foot on the road when stopped!
  const nearFootX = isMoving ? crankCenterX + Math.cos(pedalPhase) * 6.5 : 3;
  const nearFootY = isMoving ? crankCenterY + Math.sin(pedalPhase) * 5.2 : wheelY + 12;
  const nearKneeX = isMoving ? 8 + Math.cos(pedalPhase) * 3.8 : 6;
  const nearKneeY = isMoving ? -6 + Math.sin(pedalPhase) * 4.0 : -4;

  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 7.2;
  ctx.beginPath();
  ctx.moveTo(-4, -15 + pedalBob * 0.35);
  ctx.lineTo(px(nearKneeX), px(nearKneeY));
  ctx.lineTo(px(nearFootX), px(nearFootY));
  ctx.stroke();
  ctx.strokeStyle = '#3c5d87';
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.moveTo(-4, -15 + pedalBob * 0.35);
  ctx.lineTo(px(nearKneeX), px(nearKneeY));
  ctx.lineTo(px(nearFootX), px(nearFootY));
  ctx.stroke();

  // Pedal block & sneaker on pedal/road
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(px(nearFootX) - 3, px(nearFootY) - 1, 9, 4.5);
  ctx.fillStyle = '#f2f4f8';
  ctx.fillRect(px(nearFootX) - 2, px(nearFootY), 7, 2.8);

  ctx.restore();
}

function drawBikeStreetAtmosphere(
  ctx: CanvasRenderingContext2D,
  routeLength: number,
  destX: number,
  arrived: boolean,
  t: number,
): void {
  // Warm golden streetlamp pools aligned cleanly along the evening neighborhood lamps
  const lampXs = [130, 310, 485, 675, 845, 1005, 1105];
  for (const lx of lampXs) {
    const glow = ctx.createRadialGradient(lx, 8.6 * TILE_SIZE, 6, lx, 9.8 * TILE_SIZE, 82);
    glow.addColorStop(0, 'rgba(255, 214, 118, 0.24)');
    glow.addColorStop(1, 'rgba(255, 214, 118, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lx, 9.5 * TILE_SIZE, 82, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle guiding route chevrons along the cobblestone/asphalt road toward the Bus Stop & Escola
  if (!arrived) {
    const pulse = 0.24 + 0.16 * Math.sin(t * 4.5);
    ctx.strokeStyle = `rgba(255, 224, 130, ${pulse.toFixed(2)})`;
    ctx.lineWidth = 2.4;
    for (let rx = 210; rx < destX - 48; rx += 165) {
      const ry = 10.65 * TILE_SIZE;
      ctx.beginPath();
      ctx.moveTo(rx - 6, ry - 6);
      ctx.lineTo(rx + 2, ry);
      ctx.lineTo(rx - 6, ry + 6);
      ctx.moveTo(rx + 2, ry - 6);
      ctx.lineTo(rx + 10, ry);
      ctx.lineTo(rx + 2, ry + 6);
      ctx.stroke();
    }
  }

  // Warm glowing arrival zone on the street right beside the Bus Stop & Escola Estadual gate
  const destY = 10.35 * TILE_SIZE;
  const beaconPulse = 0.28 + 0.16 * Math.sin(t * 5);
  ctx.fillStyle = `rgba(255, 220, 116, ${beaconPulse.toFixed(2)})`;
  ctx.beginPath();
  ctx.ellipse(destX + 16, destY + 8, 48, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (!arrived) {
    const bob = Math.sin(t * 4.5) * 3;
    drawSpeechTag(ctx, destX + 16, destY - 46 + bob, 'Ponto de Ônibus / Escola ★');
  }

  // Soft golden twilight fireflies drifting across the neighborhood evening air
  for (let i = 0; i < 16; i++) {
    const fx = ((i * 89 + t * (10 + (i % 4) * 3)) % (routeLength - 40)) + 20;
    const fy = 6.2 * TILE_SIZE + Math.sin(t * 1.8 + i * 1.3) * 42 + (i % 3) * 24;
    const alpha = 0.35 + 0.45 * Math.sin(t * 3.5 + i);
    ctx.fillStyle = `rgba(255, 236, 150, ${alpha.toFixed(2)})`;
    ctx.fillRect(px(fx), px(fy), 2.5, 2.5);
  }
}

// ============================================================================
// MADRINHA NANI'S PROPORTIONAL CLASSIC BRAZILIAN SEDAN (184 x 70px vs 78px adults!)
// ============================================================================
function drawNaniCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opts: {
    wheelAngle: number;
    moving: boolean;
    passengersInside: boolean;
    doorOpen?: boolean;
    t: number;
  },
): void {
  const bounce = opts.moving ? Math.sin(opts.t * 18) * 1.25 : 0;
  const cx = px(x);
  const cy = px(y + bounce);

  ctx.save();
  ctx.translate(cx, cy);

  // Ground contact shadow beneath entire wheelbase
  ctx.fillStyle = 'rgba(20, 14, 18, 0.36)';
  ctx.beginPath();
  ctx.ellipse(0, 12 - bounce * 0.5, 92, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gentle warm exhaust puffs when engine running
  if (opts.moving) {
    for (let i = 0; i < 3; i++) {
      const p = (opts.t * 2.4 + i * 0.33) % 1;
      ctx.fillStyle = `rgba(245, 240, 232, ${(0.45 * (1 - p)).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(-96 - p * 26, 2 - p * 9, 4 + p * 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Main car silhouette outline (184px wide x 66px body + wheels = 70px total!)
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.roundRect(-92, -32, 184, 38, 10);
  ctx.fill();
  // Cabin roof
  ctx.beginPath();
  ctx.moveTo(-56, -30);
  ctx.lineTo(-34, -58);
  ctx.lineTo(36, -58);
  ctx.lineTo(58, -30);
  ctx.closePath();
  ctx.fill();

  // Vintage sky-teal metallic car body paint
  ctx.fillStyle = '#4e8ea3';
  ctx.beginPath();
  ctx.roundRect(-89, -29, 178, 32, 8);
  ctx.fill();
  // Upper highlight stripe & soft cream accent line
  ctx.fillStyle = '#73b3c7';
  ctx.fillRect(-85, -27, 170, 8);
  ctx.fillStyle = '#f2e8cf';
  ctx.fillRect(-88, -12, 176, 3.5);
  // Roof paint
  ctx.fillStyle = '#62a3b8';
  ctx.beginPath();
  ctx.moveTo(-52, -29);
  ctx.lineTo(-32, -55);
  ctx.lineTo(34, -55);
  ctx.lineTo(54, -29);
  ctx.closePath();
  ctx.fill();

  // Front & rear cabin windows
  ctx.fillStyle = '#cfe8f2';
  // Rear passenger window (Ariel, Grazi, and the temporary mother-in-law marker)
  ctx.beginPath();
  ctx.moveTo(-44, -31);
  ctx.lineTo(-28, -51);
  ctx.lineTo(-2, -51);
  ctx.lineTo(-2, -31);
  ctx.closePath();
  ctx.fill();
  // Front driver window (Madrinha Nani)
  ctx.beginPath();
  ctx.moveTo(4, -31);
  ctx.lineTo(4, -51);
  ctx.lineTo(30, -51);
  ctx.lineTo(46, -31);
  ctx.closePath();
  ctx.fill();

  // Visible warm passengers inside windows when boarded!
  if (opts.passengersInside) {
    // Madrinha Nani at the wheel (front window)
    ctx.fillStyle = '#4f2f21';
    ctx.beginPath();
    ctx.arc(21, -43, 6.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e7b590';
    ctx.beginPath();
    ctx.arc(22, -42, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cc6a4b';
    ctx.fillRect(15, -37, 13, 6);
    // Steering wheel
    ctx.strokeStyle = '#24130c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(31, -39);
    ctx.lineTo(35, -32);
    ctx.stroke();

    // Ariel & Grazi together in rear seat (back window)
    // Ariel (short dark hair, navy polo)
    ctx.fillStyle = '#2b1a12';
    ctx.beginPath();
    ctx.arc(-36, -43, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2b18c';
    ctx.beginPath();
    ctx.arc(-36, -42, 4.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a4b7c';
    ctx.fillRect(-42, -37, 12, 6);

    // Grazi (chestnut hair, cream top, excited smile)
    ctx.fillStyle = '#5c3622';
    ctx.beginPath();
    ctx.arc(-21, -43, 6.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f0c4a0';
    ctx.beginPath();
    ctx.arc(-21, -42, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3e5c7';
    ctx.fillRect(-27, -37, 12, 6);
    drawStage4MotherInLawMarker(ctx, -7, -40, { scaleBoost: 0.36 });
  }

  // Subtle window glass shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.beginPath();
  ctx.moveTo(9, -49);
  ctx.lineTo(18, -49);
  ctx.lineTo(12, -33);
  ctx.lineTo(6, -33);
  ctx.closePath();
  ctx.fill();

  // Door seam + chrome handles + optional boarding open-door indicator
  ctx.strokeStyle = '#2d5c6d';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(-42, -28, 42, 28);
  ctx.strokeRect(2, -28, 42, 28);
  ctx.fillStyle = '#e8edf2';
  ctx.fillRect(-12, -22, 6, 2);
  ctx.fillRect(10, -22, 6, 2);

  if (opts.doorOpen) {
    ctx.fillStyle = '#305766';
    ctx.fillRect(-38, -28, 12, 27);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(-38, -28, 12, 27);
  }

  // Chrome bumpers, warm headlight & ruby taillight
  ctx.fillStyle = '#dce3ea';
  ctx.fillRect(-93, -7, 9, 6);
  ctx.fillRect(84, -7, 9, 6);
  ctx.fillStyle = '#fff3b0';
  ctx.fillRect(85, -23, 6, 8);
  ctx.fillStyle = '#e04f4f';
  ctx.fillRect(-91, -23, 5, 8);

  // Wheel arches & spinning tires (15px radius, crisp pixel rims!)
  for (const wx of [-54, 54]) {
    ctx.fillStyle = '#1b1a1e';
    ctx.beginPath();
    ctx.arc(wx, 4, 16.5, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(wx, 4, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#33363f';
    ctx.beginPath();
    ctx.arc(wx, 4, 12.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d4dbe4';
    ctx.beginPath();
    ctx.arc(wx, 4, 7.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5f6775';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      const ang = opts.wheelAngle + (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(wx - Math.cos(ang) * 6, 4 - Math.sin(ang) * 6);
      ctx.lineTo(wx + Math.cos(ang) * 6, 4 + Math.sin(ang) * 6);
      ctx.stroke();
    }
    ctx.fillStyle = '#404652';
    ctx.beginPath();
    ctx.arc(wx, 4, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// CRISTIAN'S PROPORTIONAL WOODEN BABY CRIB WITH PREDOMINANTLY YELLOW ENXOVAL,
// GENTLY BREATHING SLEEPING BABY & TIO LÉO'S MINIATURE GIFT TOYS
// Crib rail height (~64px) matches ~96px adults standing affectionately beside it!
// ============================================================================
function drawCristianYellowCrib(
  ctx: CanvasRenderingContext2D,
  cx: number,
  floorY: number,
  t: number,
): void {
  const cribW = 138;
  const left = px(cx - cribW / 2);
  const right = left + cribW;
  const railTopY = floorY - 62;
  const mattressY = floorY - 34;

  // Soft floor contact shadow on the pastel yellow woven rug
  ctx.fillStyle = 'rgba(72, 46, 22, 0.24)';
  ctx.beginPath();
  ctx.ellipse(cx, floorY + 5, 76, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back wooden headboard & rear vertical slats
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(left - 2, railTopY - 12, cribW + 4, 66);
  ctx.fillStyle = '#b97b42';
  ctx.fillRect(left, railTopY - 10, cribW, 12);
  ctx.fillStyle = '#d6995a';
  ctx.fillRect(left + 2, railTopY - 8, cribW - 4, 5);

  // Rear slats visible behind yellow bumper
  for (let sx = left + 10; sx < right - 8; sx += 11) {
    ctx.fillStyle = '#996030';
    ctx.fillRect(sx, railTopY + 2, 4, 48);
  }

  // Predominantly YELLOW padded quilted crib bumper (enxoval amarelo!)
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(left + 3, railTopY + 2, cribW - 6, 30);
  ctx.fillStyle = '#fde068';
  ctx.fillRect(left + 5, railTopY + 4, cribW - 10, 26);
  // Soft butter-yellow upper ruffle & quilted stitching
  ctx.fillStyle = '#fef3a6';
  ctx.fillRect(left + 5, railTopY + 4, cribW - 10, 6);
  ctx.strokeStyle = '#e5b832';
  ctx.lineWidth = 1.2;
  for (let qx = left + 22; qx < right - 12; qx += 22) {
    ctx.beginPath();
    ctx.moveTo(qx, railTopY + 5);
    ctx.lineTo(qx, railTopY + 29);
    ctx.stroke();
    // Little stitched star accent on each yellow bumper panel
    ctx.fillStyle = '#fff9d6';
    ctx.fillRect(qx - 11, railTopY + 15, 3, 3);
  }

  // Soft pastel yellow fitted mattress sheet
  ctx.fillStyle = '#fef6c3';
  ctx.fillRect(left + 6, mattressY - 6, cribW - 12, 16);

  // Fluffy butter-yellow baby pillow on left side
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.ellipse(left + 32, mattressY - 3, 19, 10.5, -0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.ellipse(left + 32, mattressY - 3, 17, 8.8, -0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffad1';
  ctx.beginPath();
  ctx.ellipse(left + 30, mattressY - 5, 11, 4.5, -0.06, 0, Math.PI * 2);
  ctx.fill();

  // ---- SLEEPING NEWBORN CRISTIAN ----
  const breath = Math.sin(t * 1.65) * 1.6;
  const headNuzzle = Math.sin(t * 0.85) * 0.7;
  const handWiggle = Math.sin(t * 2.1) > 0.72 ? Math.sin(t * 8.4) * 1.1 : 0;
  const babySkinDrawn = drawS4CristianBabySkin(
    ctx,
    left + 78 + headNuzzle,
    mattressY - 20,
    t,
    {
      targetHeight: 28,
      rotation: -0.52,
      scaleX: 1.6,
      bobY: breath * 0.3,
    },
  );
  const headX = left + (babySkinDrawn ? 61 : 35) + headNuzzle;
  const headY = mattressY - (babySkinDrawn ? 26 : 8) + breath * 0.3;

  if (!babySkinDrawn) {
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(headX, headY, 11.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8d4b7';
    ctx.beginPath();
    ctx.arc(headX, headY, 9.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f2c96b';
    ctx.beginPath();
    ctx.ellipse(headX - 2.5, headY - 7.5, 8.2, 4.0, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe99e';
    ctx.beginPath();
    ctx.ellipse(headX - 4.0, headY - 8.5, 4.8, 2.2, -0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5a3520';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(headX - 2.6, headY - 0.5, 2.2, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(headX + 4.2, headY - 0.5, 2.2, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.fillStyle = 'rgba(244, 146, 160, 0.78)';
    ctx.beginPath();
    ctx.ellipse(headX - 4.4, headY + 2.4, 2.4, 1.4, 0, 0, Math.PI * 2);
    ctx.ellipse(headX + 5.6, headY + 2.4, 2.4, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a86452';
    ctx.fillRect(px(headX + 0.2), px(headY + 3.6), 2.5, 1.2);

    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.roundRect(left + 43, mattressY - 12 - breath, 72, 23 + breath, 10);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.roundRect(left + 45, mattressY - 10 - breath, 68, 19 + breath, 8);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.roundRect(left + 45, mattressY - 10 - breath, 14, 18 + breath, 6);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.ellipse(left + 78, mattressY - 5 - breath, 24, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const handX = left + 52 + handWiggle;
    const handY = mattressY - 8 - breath;
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(handX, handY, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8d4b7';
    ctx.beginPath();
    ctx.arc(handX, handY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- FRONT WOODEN CRIB RAIL & SLATS (baby clearly visible through & above slats!) ----
  // Lower wooden frame base & yellow crib skirt
  ctx.fillStyle = '#f5d451';
  ctx.fillRect(left + 5, floorY - 18, cribW - 10, 12);
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(left + 5, floorY - 18, cribW - 10, 4);

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(left - 2, floorY - 22, cribW + 4, 8);
  ctx.fillStyle = '#b97b42';
  ctx.fillRect(left, floorY - 20, cribW, 5);

  // Slender front vertical slats (spaced generously so sleeping Cristian & yellow blanket shine through!)
  for (let sx = left + 12; sx <= right - 14; sx += 14) {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(sx - 1, railTopY + 12, 5, 30);
    ctx.fillStyle = '#d6995a';
    ctx.fillRect(sx, railTopY + 12, 3, 30);
  }

  // Front top rail (slighly lower than headboard so parents clearly see in!)
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(left - 2, railTopY + 8, cribW + 4, 8);
  ctx.fillStyle = '#d6995a';
  ctx.fillRect(left, railTopY + 10, cribW, 4.5);
  ctx.fillStyle = '#ebb67a';
  ctx.fillRect(left + 2, railTopY + 10, cribW - 4, 2);

  // Four sturdy turned corner wooden posts & rounded finials
  for (const pxPost of [left - 2, right - 6]) {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(pxPost - 1, railTopY - 15, 10, 81);
    ctx.fillStyle = '#b97b42';
    ctx.fillRect(pxPost + 1, railTopY - 13, 6, 77);
    ctx.fillStyle = '#e2a666';
    ctx.fillRect(pxPost + 2, railTopY - 11, 2.5, 72);
    // Rounded finial knob
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(pxPost + 4, railTopY - 16, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d6995a';
    ctx.beginPath();
    ctx.arc(pxPost + 4, railTopY - 16, 4.0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- GENTLY ROTATING SUNNY YELLOW CRIB MOBILE (stars & crescent moon!) ----
  const mobBaseX = left + 14;
  const mobTopY = railTopY - 40;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.moveTo(mobBaseX, railTopY - 6);
  ctx.quadraticCurveTo(mobBaseX - 6, mobTopY - 2, mobBaseX + 34, mobTopY);
  ctx.stroke();
  ctx.strokeStyle = '#d6995a';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(mobBaseX, railTopY - 6);
  ctx.quadraticCurveTo(mobBaseX - 6, mobTopY - 2, mobBaseX + 34, mobTopY);
  ctx.stroke();

  const mobCenterX = mobBaseX + 36;
  const mobSway = Math.sin(t * 1.25) * 3.5;
  // Wooden mobile ring
  ctx.strokeStyle = '#c48345';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(mobCenterX, mobTopY + 3, 20, 4.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  const charms = [
    { off: -15, len: 16, color: '#fde047' },
    { off: 0, len: 21, color: '#facc15' },
    { off: 15, len: 15, color: '#fef08a' },
  ];
  for (let i = 0; i < charms.length; i++) {
    const ch = charms[i];
    const hangX = mobCenterX + ch.off + mobSway * (0.6 + i * 0.2);
    const hangY = mobTopY + 5 + ch.len + Math.sin(t * 1.5 + i) * 1.5;
    ctx.strokeStyle = 'rgba(255, 244, 196, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mobCenterX + ch.off, mobTopY + 5);
    ctx.lineTo(hangX, hangY);
    ctx.stroke();

    // Cute yellow star / crescent charm
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(hangX, hangY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = ch.color;
    ctx.beginPath();
    ctx.arc(hangX, hangY, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- SOFT FLOATING "zZz" SLEEP NOTES ABOVE CRISTIAN ----
  ctx.save();
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i < 2; i++) {
    const zp = (t * 0.36 + i * 0.5) % 1;
    const zx = headX + 12 + Math.sin(t * 1.6 + i * 2) * 5 + zp * 10;
    const zy = headY - 16 - zp * 28;
    const alpha = Math.sin(zp * Math.PI) * 0.88;
    ctx.fillStyle = `rgba(92, 62, 24, ${(alpha * 0.6).toFixed(2)})`;
    ctx.fillText(i === 0 ? 'z' : 'Z', zx + 1, zy + 1);
    ctx.fillStyle = `rgba(255, 242, 166, ${alpha.toFixed(2)})`;
    ctx.fillText(i === 0 ? 'z' : 'Z', zx, zy);
  }
  ctx.restore();

  // ---- FOREGROUND MINIATURE GIFT TOYS FROM TIO LÉO ON THE YELLOW RUG BESIDE CRIB ----
  // Tiny red painted miniature car (left-front of rug)
  const carX = left - 18;
  const carY = floorY + 13;
  ctx.fillStyle = 'rgba(72, 46, 22, 0.22)';
  ctx.beginPath();
  ctx.ellipse(carX, carY + 3, 12, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(carX - 10, carY - 6, 20, 8);
  ctx.fillRect(carX - 6, carY - 10, 11, 5);
  ctx.fillStyle = '#df4f44';
  ctx.fillRect(carX - 9, carY - 5, 18, 6);
  ctx.fillRect(carX - 5, carY - 9, 9, 4);
  ctx.fillStyle = '#b9e3f5';
  ctx.fillRect(carX - 3, carY - 8, 5, 3);
  ctx.fillStyle = '#2d2926';
  ctx.fillRect(carX - 7, carY + 1, 4, 3);
  ctx.fillRect(carX + 3, carY + 1, 4, 3);

  // Tiny wooden miniature airplane & ABC blocks (right-front of rug)
  const planeX = right + 20;
  const planeY = floorY + 12;
  ctx.fillStyle = 'rgba(72, 46, 22, 0.22)';
  ctx.beginPath();
  ctx.ellipse(planeX, planeY + 3, 13, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(planeX - 10, planeY - 5, 19, 6);
  ctx.fillRect(planeX - 4, planeY - 9, 7, 13);
  ctx.fillStyle = '#e09f4e';
  ctx.fillRect(planeX - 9, planeY - 4, 17, 4);
  ctx.fillStyle = '#5fa8d3';
  ctx.fillRect(planeX - 3, planeY - 8, 5, 11);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(planeX + 8, planeY - 5, 2, 6);

  // Tiny stacked wooden blocks beside the airplane
  const blkX = right + 38;
  const blkY = floorY + 10;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(blkX - 5, blkY - 4, 10, 9);
  ctx.fillRect(blkX + 5, blkY - 4, 10, 9);
  ctx.fillRect(blkX, blkY - 12, 10, 9);
  ctx.fillStyle = '#fde047';
  ctx.fillRect(blkX - 4, blkY - 3, 8, 7);
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(blkX + 6, blkY - 3, 8, 7);
  ctx.fillStyle = '#f87171';
  ctx.fillRect(blkX + 1, blkY - 11, 8, 7);
}

// ============================================================================
// ORIGINAL PIXEL-ART ANCIENT RUINS ADVENTURE GAME ON THE CRT TV
// (Tomb Raider-inspired puzzle ambiance — 100% original pixel art, zero logos!)
// ============================================================================
function drawAncientRuinsTvScreen(
  ctx: CanvasRenderingContext2D,
  puzzleStep: number,
  solvedCount: number,
  t: number,
): void {
  const screenW = 138;
  const screenH = 82;
  const sx = px(12.6 * TILE_SIZE - screenW / 2);
  const sy = px(2.45 * TILE_SIZE);

  // Retro CRT TV plastic bezel + shadow seated right over the living room TV monitor
  ctx.fillStyle = 'rgba(12, 8, 18, 0.45)';
  ctx.fillRect(sx - 8, sy - 6, screenW + 16, screenH + 18);
  ctx.fillStyle = '#484a54';
  ctx.fillRect(sx - 6, sy - 4, screenW + 12, screenH + 12);
  ctx.strokeStyle = '#181920';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx - 6, sy - 4, screenW + 12, screenH + 12);

  // Inner CRT screen
  ctx.save();
  ctx.beginPath();
  ctx.rect(sx, sy, screenW, screenH);
  ctx.clip();

  // Deep ancient stone temple cavern background
  const bg = ctx.createLinearGradient(sx, sy, sx, sy + screenH);
  bg.addColorStop(0, '#1e2c38');
  bg.addColorStop(0.55, '#2c3d46');
  bg.addColorStop(1, '#3d332a');
  ctx.fillStyle = bg;
  ctx.fillRect(sx, sy, screenW, screenH);

  // Ancient stone brick texture & pillars
  ctx.fillStyle = '#47433b';
  ctx.fillRect(sx, sy + screenH - 24, screenW, 24);
  ctx.fillStyle = '#5c554a';
  ctx.fillRect(sx + 10, sy + 14, 16, screenH - 36);
  ctx.fillRect(sx + screenW - 26, sy + 14, 16, screenH - 36);

  // Flickering wall torches
  const flame = Math.sin(t * 14) * 2;
  for (const tx of [sx + 34, sx + screenW - 34]) {
    ctx.fillStyle = '#5c3c24';
    ctx.fillRect(tx - 2, sy + 44, 4, 12);
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.arc(tx, sy + 41, 5 + flame * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(tx, sy + 41, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Puzzle-specific visual stage!
  if (solvedCount >= 3) {
    // Victory golden relic glow!
    const pulse = 0.6 + 0.4 * Math.sin(t * 6);
    ctx.fillStyle = `rgba(255, 224, 102, ${(0.35 * pulse).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(sx + screenW / 2, sy + 44, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(sx + screenW / 2 - 8, sy + 36, 16, 14);
    ctx.fillStyle = '#fff8d6';
    ctx.fillRect(sx + screenW / 2 - 4, sy + 38, 8, 7);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ RELÍQUIA CONQUISTADA! ★', sx + screenW / 2, sy + 20);
  } else if (puzzleStep === 0) {
    // Stage 1: Stone Ruin Gate + High Sun Statue Lever
    ctx.fillStyle = '#6c655a';
    ctx.fillRect(sx + 58, sy + 24, 40, 44);
    ctx.strokeStyle = '#241e19';
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + 58, sy + 24, 40, 44);
    // Sun symbol & glowing lever on upper right wall
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(sx + 114, sy + 26, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff7597';
    ctx.fillRect(sx + 112, sy + 35, 4, 10);
  } else if (puzzleStep === 1) {
    // Stage 2: Underground Chasm & stone ledge across
    ctx.fillStyle = '#121820';
    ctx.fillRect(sx + 54, sy + screenH - 24, 48, 24);
    ctx.fillStyle = '#736c60';
    ctx.fillRect(sx + 102, sy + screenH - 32, 44, 32);
    ctx.strokeStyle = 'rgba(255, 226, 120, 0.75)';
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(sx + 46, sy + screenH - 30);
    ctx.quadraticCurveTo(sx + 78, sy + 22, sx + 104, sy + screenH - 36);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // Stage 3: Relic Chamber with mirror crystal beam!
    ctx.fillStyle = '#6ec8e8';
    ctx.beginPath();
    ctx.moveTo(sx + screenW / 2, sy + 22);
    ctx.lineTo(sx + screenW / 2 + 10, sy + 42);
    ctx.lineTo(sx + screenW / 2, sy + 56);
    ctx.lineTo(sx + screenW / 2 - 10, sy + 42);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 232, 128, 0.78)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx + 34, sy + 36);
    ctx.lineTo(sx + screenW / 2, sy + 42);
    ctx.lineTo(sx + screenW - 34, sy + 36);
    ctx.stroke();
  }

  // Original pixel-art explorer character silhouette inside the TV game
  const ex = sx + 42 + Math.sin(t * 3) * 2.5;
  const ey = sy + screenH - 24;
  ctx.fillStyle = '#4a2b1c';
  ctx.fillRect(px(ex) - 4, ey - 22, 8, 5);
  ctx.fillStyle = '#e8b992';
  ctx.fillRect(px(ex) - 3, ey - 17, 6, 5);
  ctx.fillStyle = '#2d9387';
  ctx.fillRect(px(ex) - 4, ey - 12, 8, 7);
  ctx.fillStyle = '#5c4532';
  ctx.fillRect(px(ex) - 4, ey - 5, 8, 5);

  // Subtle CRT scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  for (let ly = sy; ly < sy + screenH; ly += 4) {
    ctx.fillRect(sx, ly, screenW, 1);
  }
  ctx.restore();

  // Little glowing green power LED on CRT bezel
  ctx.fillStyle = '#5be37d';
  ctx.fillRect(sx + screenW - 8, sy + screenH + 3, 5, 3);
}

function drawSpeechTag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
): void {
  ctx.save();
  ctx.font = 'bold 10px sans-serif';
  const w = Math.max(54, ctx.measureText(text).width + 14);
  const bx = px(x - w / 2);
  const by = px(y - 16);
  ctx.fillStyle = '#fff6df';
  ctx.fillRect(bx, by, w, 17);
  ctx.strokeStyle = '#6b3b1e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, by, w, 17);
  ctx.fillStyle = '#9e2e24';
  ctx.textAlign = 'center';
  ctx.fillText(text, px(x), by + 12);
  ctx.restore();
}

// ============================================================================
// MAIN STAGE 4 WORLD RENDERER
// ============================================================================
export function renderStage4World(
  ctx: CanvasRenderingContext2D,
  sim: SimulationState,
  particles: ParticlePool,
  viewW: number,
  viewH: number,
): void {
  const s4 = sim.stage4;
  if (!s4) return;

  const mapId = s4.mapId;
  const mapBackdrop = getStage4MapBackdrop(mapId);
  const baseWorldW = MAP_COLS * TILE_SIZE;
  const worldH = MAP_ROWS * TILE_SIZE;
  const isBikeRide = mapId === 'neighborhood_bike_road' && Boolean(s4.bikeRide?.active);
  const hasBikeRoute =
    mapId === 'neighborhood_bike_road' &&
    Boolean(s4.bikeRide && (s4.bikeRide.active || s4.cutscene === 'bicycle_ride'));
  const worldW = hasBikeRoute ? s4.bikeRide!.routeLength : baseWorldW;

  const isCutscene = s4.cutscene !== 'none';
  const focusX = isBikeRide ? s4.cameraFocusX : isCutscene ? s4.cameraFocusX : sim.player.x;
  const focusY = isBikeRide ? s4.cameraFocusY : isCutscene ? s4.cameraFocusY : sim.player.y;
  const zoom = isBikeRide ? 1.06 : isCutscene ? s4.cameraZoom : 1.0;

  const coverScale = Math.max(viewW / baseWorldW, viewH / worldH);
  const baseScale = isCutscene ? coverScale * 1.04 : coverScale * 1.1;
  const scale = baseScale * zoom;

  let camX = focusX - viewW / (2 * scale);
  let camY = focusY - viewH / (2 * scale);
  camX = Math.max(0, Math.min(Math.max(0, worldW - viewW / scale), camX));
  camY = Math.max(0, Math.min(Math.max(0, worldH - viewH / scale), camY));

  if (s4.cutscene === 'pregnancy_reveal') {
    const snap = getCutsceneTimelineSnapshot(STAGE4_PREGNANCY_REVEAL_TIMELINE, s4.cutsceneElapsed);
    const shake = snap.step.effects.screenShake ?? 0;
    if (shake > 0 && snap.stepElapsed < 1.1) {
      const decay = 1 - snap.stepElapsed / 1.1;
      camX += Math.sin(s4.cutsceneElapsed * 42) * shake * decay;
      camY += Math.cos(s4.cutsceneElapsed * 36) * shake * 0.7 * decay;
    }
  }

  ctx.fillStyle = mapId === 'meia_agua_interior' ? '#2c2420' : hasBikeRoute ? '#261e36' : '#3a5330';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-Math.round(camX), -Math.round(camY));

  // 1. High-resolution Stardew environment backdrop
  const isMaternityRoad = s4.cutscene === 'maternity_trip' && s4.cutsceneElapsed >= 4.4 && s4.cutsceneElapsed < 9.2;
  if (mapBackdrop) {
    ctx.imageSmoothingEnabled = false;
    if (hasBikeRoute) {
      // Seamless 2-block evening avenue: Block 1 mirrors srcX=0..0.518 at exact 1:1 scale
      // so srcX=0 meets srcX=0 pixel-for-pixel across sky, trees, intersection, curb & road!
      const seamX = 398;
      const srcW = Math.round(mapBackdrop.naturalWidth * 0.518);
      ctx.save();
      ctx.translate(seamX, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(mapBackdrop, 0, 0, srcW, mapBackdrop.naturalHeight, 0, 0, seamX, worldH);
      ctx.restore();
      ctx.drawImage(mapBackdrop, seamX, 0, baseWorldW, worldH);
    } else if (isMaternityRoad) {
      // Seamless scrolling neighborhood street during Nani's drive to Maternidade Carmela Dutra!
      const roadElapsed = s4.cutsceneElapsed - 4.4;
      const period = baseWorldW * 2;
      const scroll = (roadElapsed * 185) % period;
      for (let tileIdx = -1; tileIdx <= 2; tileIdx++) {
        const tileStart = tileIdx * baseWorldW - (scroll % period);
        const mirrored = ((tileIdx % 2) + 2) % 2 === 1;
        if (mirrored) {
          ctx.save();
          ctx.translate(tileStart + baseWorldW, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(mapBackdrop, 0, 0, baseWorldW, worldH);
          ctx.restore();
        } else {
          ctx.drawImage(mapBackdrop, tileStart, 0, baseWorldW, worldH);
        }
      }
    } else {
      ctx.drawImage(mapBackdrop, 0, 0, baseWorldW, worldH);
    }
  } else {
    ctx.fillStyle = '#5f8b49';
    ctx.fillRect(0, 0, worldW, worldH);
  }

  // 2. Environment-specific overlays (Meia-Água construction stages, twilight bike street, highlights)
  if (isBikeRide && s4.bikeRide) {
    drawBikeStreetAtmosphere(
      ctx,
      s4.bikeRide.routeLength,
      s4.bikeRide.destinationX,
      s4.bikeRide.arrived,
      sim.elapsedSeconds,
    );
  } else if (mapId === 'backyard_construction') {
    drawMeiaAguaHouse(ctx, s4.buildStage, sim.elapsedSeconds);

    if (s4.cutscene === 'none') {
      if (s4.carryingMaterialId) {
        // Highlight central construction drop zone
        const pulse = 0.28 + 0.16 * Math.sin(sim.elapsedSeconds * 5.5);
        ctx.fillStyle = `rgba(255, 214, 102, ${pulse.toFixed(2)})`;
        ctx.beginPath();
        ctx.ellipse(STAGE4_BUILD_SITE_POS.x, STAGE4_BUILD_SITE_POS.y + 4, 34, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else {
        for (const task of s4.buildTasks) {
          if (task.completed) continue;
          drawMaterialPile(ctx, task.materialX, task.materialY, task.id, sim.elapsedSeconds);
        }
      }
    }
  } else if (mapId === 'moms_house_yard' && s4.cutscene === 'none') {
    const pulse = 0.25 + 0.14 * Math.sin(sim.elapsedSeconds * 5);
    ctx.fillStyle = `rgba(255, 214, 102, ${pulse.toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(STAGE4_BICYCLE_POS.x, STAGE4_BICYCLE_POS.y + 4, 28, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (mapId === 'meia_agua_interior' && s4.cutscene === 'none') {
    const targetPos = s4.watchedCristianDance ? STAGE4_CONSOLE_POS : STAGE4_RADIO_POS;
    const pulse = 0.26 + 0.14 * Math.sin(sim.elapsedSeconds * 5);
    ctx.fillStyle = `rgba(255, 214, 102, ${pulse.toFixed(2)})`;
    ctx.beginPath();
    ctx.ellipse(targetPos.x, targetPos.y + 4, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Collectible Golden Memory Shimmer Points (hidden during playable evening bicycle ride)
  if (s4.cutscene === 'none' && !isBikeRide) {
    const unlockedSet = new Set(s4.unlockedMemories);
    for (const mem of STAGE_4_MEMORIES) {
      if (mem.mapId !== mapId || unlockedSet.has(mem.id)) continue;
      if (mem.id === 'mem_s4_gravidez' && !s4.graziPregnant) continue;
      const pulse = 0.55 + 0.45 * Math.sin(sim.elapsedSeconds * 4.5 + mem.x * 0.05);
      ctx.fillStyle = `rgba(255, 218, 102, ${(0.25 * pulse).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(mem.x, mem.y, 11 + pulse * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(px(mem.x) - 1, px(mem.y) - 5, 2, 10);
      ctx.fillRect(px(mem.x) - 5, px(mem.y) - 1, 10, 2);
      ctx.fillStyle = '#fff9e6';
      ctx.fillRect(px(mem.x) - 1, px(mem.y) - 1, 2, 2);
    }
  }

  // 4. Y-Sorted Characters & Cutscene Staging
  interface Renderable {
    y: number;
    draw: () => void;
  }
  const queue: Renderable[] = [];
  const t = s4.cutsceneElapsed;

  if (s4.cutscene === 'home_routine') {
    // Neutral routine at the house before the playable school ride.
    const approachP = Math.min(1, t / 2.2);
    const gx = 10.7 * TILE_SIZE;
    const ax = (13.3 - approachP * 1.45) * TILE_SIZE;
    const cy = 9.5 * TILE_SIZE;
    const arielWalking = t < 2.2;
    queue.push({
      y: cy,
      draw: () => {
        drawAdultGrazi(ctx, gx, cy, { dir: 'right', pregnant: false, bobY: Math.sin(t * 2) * 0.7 });
        drawAdultAriel(ctx, ax, cy, {
          dir: 'left',
          isMoving: arielWalking,
          walkPhase: t * 7.2,
          bobY: arielWalking ? 0 : Math.sin(t * 2 + 1) * 0.7,
        });
        if (!arielWalking) {
          drawJoinedHands(ctx, gx, ax, cy, Math.sin(t * 2.2) * 0.9);
        }
        if (t < 3.0) {
          drawMoodIcon(ctx, gx + 4, cy - 82, 'heart');
        } else if (t < 6.0) {
          drawSpeechTag(ctx, ax, cy - 84, 'Alegria e cuidado...');
          drawMoodIcon(ctx, (gx + ax) / 2, cy - 94, 'heart');
        } else {
          drawMoodIcon(ctx, (gx + ax) / 2, cy - 84, 'heart');
        }
      },
    });
  } else if (s4.cutscene === 'bicycle_ride') {
    const bike = s4.bikeRide;
    const bikeX = bike?.x ?? STAGE4_SCHOOL_BIKE_START_X;
    const bikeY = bike?.y ?? 10.45 * TILE_SIZE;
    const boardedAt =
      STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION + STAGE4_BIKE_BOARD_DURATION;
    const passengerOnBike = t >= boardedAt;
    const speed = bike ? Math.hypot(bike.vx, bike.vy) : 0;
    const bikePhysics = bike
      ? {
          wheelAngle: bike.wheelAngle,
          pedalPhase: bike.pedalPhase,
          graziSway: bike.graziSway,
          facing: bike.facing,
          speed,
        }
      : undefined;
    queue.push({
      y: bikeY,
      draw: () => {
        if (passengerOnBike) {
          drawS4BicycleCoupleSkin(ctx, bikeX, bikeY, t, bikePhysics);
        } else {
          // Ariel aguardando a Grazi na saída da escola (sem bicicleta desenhada por código)
          drawAdultAriel(ctx, bikeX - 8, bikeY, {
            dir: 'right',
            bobY: Math.sin(t * 2.4) * 0.5,
          });
        }

        if (
          t >= STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION &&
          t < boardedAt
        ) {
          const boardingProgress = Math.min(
            1,
            (t - STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION) /
              STAGE4_BIKE_BOARD_DURATION,
          );
          drawAdultGrazi(
            ctx,
            bikeX + 52 - boardingProgress * 36,
            bikeY,
            {
              dir: 'left',
              pregnant: false,
              isMoving: boardingProgress < 0.85,
              walkPhase: t * 7,
            },
          );
          drawSpeechTag(ctx, bikeX, bikeY - 76, 'Grazi sobe na garupa');
        } else if (t < STAGE4_BIKE_SCHOOL_ARRIVAL_DURATION) {
          drawSpeechTag(ctx, bikeX, bikeY - 76, 'Escola');
        } else if (passengerOnBike && Math.sin(t * 3) > 0.2) {
          drawMoodIcon(ctx, bikeX - 8, bikeY - 78, 'heart');
        }
      },
    });
  } else if (s4.cutscene === 'pregnancy_reveal') {
    // CENA 2: Cinematic 8-step late-night pregnancy reveal on the veranda of Grazi's mom's house
    // Strictly non-pregnant (graziPregnant: false), crisp pixel art, existing couple poses in Step 7/8.
    const snap = getCutsceneTimelineSnapshot(STAGE4_PREGNANCY_REVEAL_TIMELINE, t);
    const porchCenterX = 10.3 * TILE_SIZE;
    const porchY = 9.65 * TILE_SIZE;
    const arielX = porchCenterX - 20;
    const graziX = porchCenterX + 20;

    // Warm low-light late-night porch lamp glow
    queue.push({
      y: porchY - 40,
      draw: () => {
        const lampGlow = ctx.createRadialGradient(
          porchCenterX,
          porchY - 48,
          6,
          porchCenterX,
          porchY - 20,
          125,
        );
        lampGlow.addColorStop(0, 'rgba(255, 214, 132, 0.34)');
        lampGlow.addColorStop(0.55, 'rgba(255, 184, 102, 0.14)');
        lampGlow.addColorStop(1, 'rgba(255, 170, 90, 0)');
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(porchCenterX, porchY - 20, 125, 0, Math.PI * 2);
        ctx.fill();
      },
    });

    // Gentle rising golden fireflies in Steps 7 and 8
    if (snap.step.effects.fireflies) {
      queue.push({
        y: porchY + 12,
        draw: () => {
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          for (let i = 0; i < 14; i++) {
            const seed = i * 19.7;
            const cycle = (t * 0.42 + i * 0.17) % 1;
            const fx = px(porchCenterX - 78 + ((i * 23) % 156) + Math.sin(t * 1.8 + seed) * 7);
            const fy = px(porchY + 8 - cycle * 96);
            const alpha = Math.sin(cycle * Math.PI) * 0.85;
            ctx.fillStyle = `rgba(255, 232, 142, ${alpha.toFixed(2)})`;
            ctx.fillRect(fx, fy, 2, 2);
            ctx.fillStyle = `rgba(255, 248, 210, ${(alpha * 0.65).toFixed(2)})`;
            ctx.fillRect(fx - 1, fy, 4, 1);
          }
          ctx.restore();
        },
      });
    }

    queue.push({
      y: porchY,
      draw: () => {
        ctx.save();
        ctx.imageSmoothingEnabled = false;

        const embraceSprite = getSkinSprite(SKIN_URLS.s4PregnancyEmbrace);
        const isNodding =
          snap.step.couplePose === 'nod_and_smile' && snap.stepElapsed >= 1.8;
        const nodBob = isNodding ? Math.sin((snap.stepElapsed - 1.8) * 9) * 1.0 : 0;
        const breatheBob = Math.sin(t * 1.8) * 0.45;

        drawShadow(ctx, porchCenterX, porchY + 7, 15, 4.5);

        if (embraceSprite) {
          drawSkinImage(ctx, embraceSprite, porchCenterX, porchY + (nodBob || breatheBob), 50);
        } else {
          drawAdultAriel(ctx, arielX, porchY, {
            dir: 'right',
            bobY: breatheBob,
          });
          drawAdultGrazi(ctx, graziX, porchY, {
            dir: 'left',
            pregnant: false,
            pregnant9m: false,
            usePregnantWalkSheet: false,
            bobY: nodBob || -breatheBob * 0.7,
          });
        }

        // Step 4: Subtle eye sparkle catchlights during silent gaze exchange
        if (snap.step.effects.windHair || snap.step.effects.eyeSparkle) {
          ctx.fillStyle = '#fff9d6';
          ctx.fillRect(px(porchCenterX - 3), px(porchY - 56), 2, 1);
          ctx.fillRect(px(porchCenterX + 4), px(porchY - 53), 2, 1);
        }

        // Step 5: Subtle teary eye glint on Grazi
        if (snap.step.effects.tearyEyes) {
          ctx.fillStyle = '#cfe8ff';
          ctx.fillRect(px(porchCenterX + 4), px(porchY - 52), 2, 2);
        }

        // Step 6: Affectionate smile icon when Grazi nods
        if (isNodding) {
          drawMoodIcon(ctx, porchCenterX + 10, porchY - 84, 'smile');
        } else if (snap.step.couplePose === 'embrace_gaze_to_forehead') {
          drawMoodIcon(ctx, porchCenterX, porchY - 86, 'heart');
        }

        ctx.restore();
      },
    });
  } else if (s4.cutscene === 'labor_walk_bar') {
    // Beat 3: Grazi's approved pregnant walk sheet and Ariel hold hands past the bar.
    const sideY = 9.05 * TILE_SIZE;
    let coupleCenterX = 2.6 * TILE_SIZE;
    let coupleMoving = true;

    if (t < 4.5) {
      coupleCenterX = (2.2 + (t / 4.5) * 4.1) * TILE_SIZE;
      coupleMoving = true;
    } else if (t < 10.2) {
      // Gentle slow step & pause when the bar man passes and speaks, then reacting with humor
      const drift = t < 6.2 ? ((t - 4.5) / 1.7) * 0.65 : 0.65;
      coupleCenterX = (6.3 + drift) * TILE_SIZE;
      coupleMoving = t < 6.2;
    } else {
      coupleCenterX = (6.95 + ((t - 10.2) / 3.0) * 4.4) * TILE_SIZE;
      coupleMoving = true;
    }

    const walkPhase = t * 6.8;
    const coupleFacingReact = t >= 8.4 && t < 10.2;
    const arielX = coupleCenterX - 15;
    const graziX = coupleCenterX + 15;

    // Bar man physically exits through the corner bar doorway (x ≈ 4.15*32, y ≈ 7.2*32)
    // walks onto the sidewalk and strolls past the couple!
    const barDoorX = 4.15 * TILE_SIZE;
    const barDoorY = 7.35 * TILE_SIZE;
    let barManX = barDoorX;
    let barManY = barDoorY;
    let barManVisible = t >= 1.1;
    let barManWave = false;
    if (t >= 1.1 && t < 3.6) {
      const p = (t - 1.1) / 2.5;
      barManX = barDoorX + (STAGE4_BAR_MAN_POS.x - barDoorX) * p;
      barManY = barDoorY + (STAGE4_BAR_MAN_POS.y - barDoorY) * p;
    } else if (t >= 3.6 && t < 5.6) {
      const p = (t - 3.6) / 2.0;
      barManX = STAGE4_BAR_MAN_POS.x + p * (8.85 * TILE_SIZE - STAGE4_BAR_MAN_POS.x);
      barManY = STAGE4_BAR_MAN_POS.y + p * (8.8 * TILE_SIZE - STAGE4_BAR_MAN_POS.y);
    } else if (t >= 5.6 && t < 8.4) {
      // Stops warmly just past Grazi & Ariel and comments spontaneously!
      barManX = 8.85 * TILE_SIZE;
      barManY = 8.8 * TILE_SIZE;
      barManWave = true;
    } else if (t >= 8.4) {
      const p = (t - 8.4) / 4.8;
      barManX = (8.85 + p * 6.2) * TILE_SIZE;
      barManY = 8.8 * TILE_SIZE;
      barManWave = t < 9.5;
    }

    if (barManVisible) {
      const bmWalking = (t >= 1.1 && t < 5.6) || t >= 8.4;
      queue.push({
        y: barManY,
        draw: () => {
          const barManDirection: Direction =
            (t >= 3.6 && t < 5.6) || t >= 8.4 ? 'right' : 'down';
          drawBarManSprite(
            ctx,
            barManX,
            barManY + (bmWalking ? Math.abs(Math.sin(t * 7.5)) * -2 : 0),
            t,
            barManWave,
            { direction: barManDirection, isMoving: bmWalking },
          );
          if (t >= 4.2 && t < 8.4) {
            drawSpeechTag(ctx, barManX, barManY - 72, 'Vai ser um meninão!');
          }
        },
      });
    }

    queue.push({
      y: sideY,
      draw: () => {
        const shyBob = coupleFacingReact ? Math.sin(t * 3.2) * -0.8 : 0;
        const coupleSpriteDrawn = drawS4PregnantHandholdingCouple(
          ctx,
          coupleCenterX,
          sideY,
          {
            facing: coupleFacingReact ? 'left' : 'right',
            isMoving: coupleMoving,
            walkPhase,
            bobY: shyBob,
          },
        );
        if (!coupleSpriteDrawn) {
          drawAdultAriel(ctx, arielX, sideY, {
            dir: 'right',
            isMoving: coupleMoving,
            walkPhase,
            bobY: shyBob,
            embarrassed: coupleFacingReact,
          });
          drawAdultGrazi(ctx, graziX, sideY, {
            dir: coupleFacingReact ? 'left' : 'right',
            isMoving: coupleMoving,
            walkPhase: walkPhase + 0.35,
            pregnant: true,
            pregnant9m: true,
            usePregnantWalkSheet: true,
            bobY: shyBob,
          });
          drawJoinedHands(
            ctx,
            arielX,
            graziX,
            sideY + shyBob * 0.5,
            coupleMoving ? Math.sin(walkPhase) * 2.2 : 0,
          );
        }

        if (coupleFacingReact) {
          const reactionArielX = coupleSpriteDrawn ? coupleCenterX + 15 : arielX;
          const reactionGraziX = coupleSpriteDrawn ? coupleCenterX - 15 : graziX;
          drawSpeechTag(ctx, reactionArielX, sideY - 86, '...');
          drawMoodIcon(ctx, reactionGraziX + 6, sideY - 102, 'smile');
        } else if (t >= 10.2) {
          drawMoodIcon(ctx, coupleCenterX, sideY - 86, 'heart');
        }
      },
    });
  } else if (s4.cutscene === 'maternity_trip') {
    // Beat 4: 3-Phase Animated Cutscene — Madrinha Nani driving Grazi & Ariel to Maternidade Carmela Dutra!
    if (t < 4.4) {
      // Phase A: Boarding Nani's proportional sedan outside mom's house
      const carX = 13.6 * TILE_SIZE;
      const carY = 10.8 * TILE_SIZE;
      const boarded = t >= 3.0;
      const doorOpen = t >= 1.9 && t < 3.4;
      const driveOutP = t >= 3.5 ? (t - 3.5) / 0.9 : 0;
      const liveCarX = carX + driveOutP * 140;

      queue.push({
        y: carY,
        draw: () => {
          drawNaniCar(ctx, liveCarX, carY, {
            wheelAngle: driveOutP * 9.5,
            moving: driveOutP > 0,
            passengersInside: boarded,
            doorOpen,
            t,
          });
          if (boarded) {
            drawMoodIcon(ctx, liveCarX - 18, carY - 70, 'heart');
          }
        },
      });

      if (!boarded) {
        const walkP = Math.min(1, t / 2.4);
        const arielX = (6.4 + walkP * 4.3) * TILE_SIZE;
        const graziX = arielX + 30;
        const walkY = 9.4 * TILE_SIZE + walkP * 26;
        const naniX = 14.8 * TILE_SIZE - Math.max(0, t - 2.1) * 22;
        const naniY = 9.7 * TILE_SIZE + Math.max(0, t - 2.1) * 14;
        const motherInLawProgress = Math.min(1, Math.max(0, (t - 1.6) / 1.4));
        const motherInLawX = (16.5 - motherInLawProgress * 0.7) * TILE_SIZE;
        const motherInLawY = 9.7 * TILE_SIZE + motherInLawProgress * 14;

        queue.push({
          y: walkY,
          draw: () => {
            const coupleSpriteDrawn = drawS4PregnantHandholdingCouple(
              ctx,
              (arielX + graziX) / 2,
              walkY,
              { facing: 'right', isMoving: t < 2.5, walkPhase: t * 7 },
            );
            if (!coupleSpriteDrawn) {
              drawAdultAriel(ctx, arielX, walkY, {
                dir: 'right',
                isMoving: t < 2.5,
                walkPhase: t * 7,
              });
              drawAdultGrazi(ctx, graziX, walkY, {
                dir: 'right',
                isMoving: t < 2.5,
                walkPhase: t * 7 + 0.3,
                pregnant: true,
                pregnant9m: true,
              });
              drawJoinedHands(ctx, arielX, graziX, walkY, Math.sin(t * 7) * 2);
            }
            if (t < 2.2) {
              drawSpeechTag(ctx, graziX + 4, walkY - 84, 'Obrigada, Nani!');
            }
          },
        });

        queue.push({
          y: naniY,
          draw: () => {
            drawMadrinhaNani(ctx, naniX, naniY, {
              dir: 'left',
              isMoving: t >= 2.1,
              walkPhase: t * 7,
              bobY: t < 2.1 ? Math.sin(t * 5) * -1.2 : 0,
            });
            if (t < 1.6) {
              drawSpeechTag(ctx, naniX, naniY - 84, 'Vamos pra maternidade!');
            }
          },
        });

        queue.push({
          y: motherInLawY,
          draw: () => {
            drawStage4MotherInLawMarker(ctx, motherInLawX, motherInLawY, {
              scaleBoost: 0.96,
              bobY: motherInLawProgress > 0 ? Math.sin(t * 5) * -0.8 : 0,
              showPlaceholderLabel: true,
            });
            if (t >= 1.6 && t < 3.0) {
              drawSpeechTag(ctx, motherInLawX, motherInLawY - 84, 'Estamos com vocês!');
            }
          },
        });
      }
    } else if (t < 9.2) {
      // Phase B: Smooth animated road trip with Nani driving and the couple plus mother-in-law inside.
      const roadT = t - 4.4;
      const carX = 11.4 * TILE_SIZE + Math.sin(roadT * 1.4) * 14;
      const carY = 10.85 * TILE_SIZE;
      queue.push({
        y: carY,
        draw: () => {
          drawNaniCar(ctx, carX, carY, {
            wheelAngle: roadT * 13,
            moving: true,
            passengersInside: true,
            t,
          });
          drawMoodIcon(ctx, carX - 18, carY - 72, 'heart');
          if (roadT > 1.2 && roadT < 3.8) {
            drawSpeechTag(ctx, carX + 12, carY - 74, 'Falta pouquinho!');
          }
        },
      });
    } else {
      // Phase C: Arrival at Maternidade Carmela Dutra — car pulls up, Nani helps Grazi & Ariel walk toward doors!
      const arrT = t - 9.2;
      const pullInP = Math.min(1, arrT / 1.7);
      const easePull = 1 - (1 - pullInP) * (1 - pullInP);
      const carX = (-2.0 + easePull * 11.2) * TILE_SIZE;
      const carY = 12.15 * TILE_SIZE;
      const steppedOut = arrT >= 1.9;

      queue.push({
        y: carY,
        draw: () => {
          drawNaniCar(ctx, carX, carY, {
            wheelAngle: easePull * 15,
            moving: pullInP < 1,
            passengersInside: !steppedOut,
            doorOpen: arrT >= 1.75 && arrT < 2.6,
            t,
          });
        },
      });

      if (steppedOut) {
        const walkUpP = Math.min(1, (arrT - 1.9) / 2.9);
        const groupY = (10.7 - walkUpP * 1.65) * TILE_SIZE;
        // Exact doorway scale (~75px adults vs ~88px double glass doors of Maternidade Carmela Dutra!)
        const scaleBoost = 0.96;
        const arielX = (10.6 + walkUpP * 0.45) * TILE_SIZE;
        const graziX = arielX + 27;
        const naniX = graziX + 30;
        const motherInLawX = naniX + 34;
        const walking = walkUpP < 0.98;

        queue.push({
          y: groupY,
          draw: () => {
            const coupleSpriteDrawn = drawS4PregnantHandholdingCouple(
              ctx,
              (arielX + graziX) / 2,
              groupY,
              {
                facing: 'right',
                isMoving: walking,
                walkPhase: arrT * 6.5,
                scaleBoost,
              },
            );
            if (!coupleSpriteDrawn) {
              drawAdultAriel(ctx, arielX, groupY, {
                dir: 'right',
                isMoving: walking,
                walkPhase: arrT * 6.5,
                scaleBoost,
              });
              drawAdultGrazi(ctx, graziX, groupY, {
                dir: 'right',
                isMoving: walking,
                walkPhase: arrT * 6.5 + 0.3,
                pregnant: true,
                pregnant9m: true,
                scaleBoost,
              });
              drawJoinedHands(
                ctx,
                arielX,
                graziX,
                groupY,
                walking ? Math.sin(arrT * 6.5) * 1.8 : 0,
              );
            }
            drawMadrinhaNani(ctx, naniX, groupY + 2, {
              dir: 'left',
              isMoving: walking,
              walkPhase: arrT * 6.5 + 0.6,
              scaleBoost,
            });
            drawStage4MotherInLawMarker(ctx, motherInLawX, groupY + 2, {
              scaleBoost,
              bobY: walking ? Math.abs(Math.sin(arrT * 6.5 + 0.9)) * -1.2 : 0,
              showPlaceholderLabel: true,
            });
            drawMoodIcon(ctx, graziX, groupY - 82, 'heart');
            drawMoodIcon(ctx, motherInLawX, groupY - 82, 'smile');
            drawSpeechTag(ctx, naniX + 4, groupY - 82, 'Chegamos! Vai dar tudo certo!');
          },
        });
      }
    }
  } else if (s4.cutscene === 'birth_blessing') {
    // Beat 5: Tender, calm, joyful arrival of newborn Cristian at Maternidade Carmela Dutra
    // with Grazi holding baby Cristian, Ariel close beside, and Madrinha Nani celebrating warmly!
    const scaleBoost = 0.98;
    const gx = 10.6 * TILE_SIZE;
    const ax = 12.2 * TILE_SIZE;
    const nx = 14.0 * TILE_SIZE;
    const motherInLawX = 15.2 * TILE_SIZE;
    const cy = 9.7 * TILE_SIZE;
    queue.push({
      y: cy,
      draw: () => {
        const halo = ctx.createRadialGradient(
          (gx + ax) / 2,
          cy - 34,
          10,
          (gx + ax) / 2,
          cy - 34,
          104,
        );
        halo.addColorStop(0, 'rgba(255, 232, 166, 0.45)');
        halo.addColorStop(1, 'rgba(255, 232, 166, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc((gx + ax) / 2, cy - 34, 104, 0, Math.PI * 2);
        ctx.fill();

        drawAdultGrazi(ctx, gx, cy, { dir: 'right', pregnant: false, scaleBoost });
        drawAdultAriel(ctx, ax, cy, { dir: 'left', scaleBoost });
        drawMadrinhaNani(ctx, nx, cy + 2, {
          dir: 'left',
          scaleBoost,
          bobY: Math.abs(Math.sin(t * 4.2)) * -2.2,
        });
        drawStage4MotherInLawMarker(ctx, motherInLawX, cy + 2, {
          scaleBoost,
          showPlaceholderLabel: true,
        });
        // Newborn Cristian cradled snugly against Grazi's arms.
        drawNewbornCristianBundle(ctx, gx + 4.5, cy - 31, t);
        drawMoodIcon(ctx, (gx + ax) / 2, cy - 86, 'heart');
        drawMoodIcon(ctx, nx, cy - 82, 'smile');
        drawMoodIcon(ctx, motherInLawX, cy - 82, 'smile');
        drawSpeechTag(ctx, (gx + ax) / 2, cy - 102, 'Bem-vindo, Cristian!');
      },
    });
  } else if (s4.cutscene === 'cristian_crib') {
    // Beat 6: Special Nursery Scene — Cristian's predominantly YELLOW crib, sleeping
    // newborn, Tio Léo's miniature gift toys, and Grazi & Ariel lovingly watching at exact room scale!
    const roomScale = 1.24; // ~96px adults matching dresser top (~92px) & crib rail (~64px waist-height!)
    const cribCx = 11.2 * TILE_SIZE; // 358px centered squarely on the pastel yellow oval rug
    const cribFloorY = 12.25 * TILE_SIZE; // 392px

    const walkP = Math.min(1, t / 1.8);
    const gx = (6.3 + walkP * 1.55) * TILE_SIZE; // ends at 251px right beside crib left post
    const ax = (16.1 - walkP * 1.55) * TILE_SIZE; // ends at 465px right beside crib right post
    const parentY = 12.05 * TILE_SIZE;
    const walking = walkP < 1;

    // Subtle sunlit sparkles highlighting Tio Léo's miniature toys on the wooden dresser!
    queue.push({
      y: 6.0 * TILE_SIZE,
      draw: () => {
        const glint = 0.45 + 0.45 * Math.sin(t * 4.2);
        const toyPoints = [
          [556, 232],
          [608, 236],
          [648, 250],
          [608, 134],
        ];
        for (const [tx, ty] of toyPoints) {
          ctx.fillStyle = `rgba(255, 248, 196, ${glint.toFixed(2)})`;
          ctx.fillRect(tx - 1, ty - 4, 2, 8);
          ctx.fillRect(tx - 4, ty - 1, 8, 2);
        }
        if (t >= 3.6 && t < 7.8) {
          drawSpeechTag(ctx, 608, 206, 'Presentes do Tio Léo ★');
        }
      },
    });

    // Grazi & Ariel standing lovingly beside the crib, breathing & exchanging warm glances
    queue.push({
      y: parentY,
      draw: () => {
        const gentleSway = walking ? 0 : Math.sin(t * 1.8) * 1.1;
        drawAdultGrazi(ctx, gx, parentY, {
          dir: 'right',
          isMoving: walking,
          walkPhase: t * 6,
          bobY: gentleSway,
          scaleBoost: roomScale,
        });
        drawAdultAriel(ctx, ax, parentY, {
          dir: 'left',
          isMoving: walking,
          walkPhase: t * 6 + 0.4,
          bobY: -gentleSway * 0.7,
          scaleBoost: roomScale,
        });
        if (!walking) {
          drawMoodIcon(ctx, gx + 12, parentY - 104, 'heart');
          drawMoodIcon(ctx, ax - 12, parentY - 104, 'heart');
        }
      },
    });

    // Proportional wooden crib with yellow enxoval, sleeping blond Cristian & foreground miniature toys
    queue.push({
      y: cribFloorY,
      draw: () => {
        drawCristianYellowCrib(ctx, cribCx, cribFloorY, t);
      },
    });
  } else if (s4.cutscene === 'cristian_dance') {
    // Beat 5: Blond toddler Cristian (~2-3y) dancing joyfully on the rug while Grazi & Ariel watch & praise!
    const hop = Math.abs(Math.sin(t * 7.2)) * -7.5;
    const tilt = Math.sin(t * 7.2) * 0.14;
    const spinFlip = Math.floor(t * 2.2) % 2 === 1;
    const praiseWords = ['Arrasou, filho!', 'Que alegria!', 'Dança demais!'];
    const currentPraise = praiseWords[Math.floor(t / 3.1) % praiseWords.length];
    const clapBob = Math.abs(Math.sin(t * 5.2)) * -2;

    const gx = 7.4 * TILE_SIZE;
    const gy = 10.8 * TILE_SIZE;
    const cx = 9.7 * TILE_SIZE;
    const cy = 10.9 * TILE_SIZE;
    const ax = 11.7 * TILE_SIZE;
    const ay = 9.5 * TILE_SIZE;

    queue.push({
      y: ay,
      draw: () => {
        drawAdultAriel(ctx, ax, ay, { dir: 'left', bobY: clapBob });
        drawMoodIcon(ctx, ax, ay - 80, 'smile');
      },
    });

    queue.push({
      y: cy,
      draw: () => {
        // Animated musical notes floating from boombox radio
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 14px serif';
        const n1Y = STAGE4_RADIO_POS.y - 44 - ((t * 24) % 34);
        const n2Y = STAGE4_RADIO_POS.y - 36 - (((t + 0.6) * 24) % 34);
        ctx.fillText('♪', STAGE4_RADIO_POS.x - 16 + Math.sin(t * 4) * 5, n1Y);
        ctx.fillText('♫', STAGE4_RADIO_POS.x + 2 + Math.cos(t * 3.5) * 5, n2Y);

        // Grazi admiring & praising from the left
        drawAdultGrazi(ctx, gx, gy, { dir: 'right', bobY: clapBob });
        drawSpeechTag(ctx, gx, gy - 82, currentPraise);

        // Blond toddler Cristian dancing happily right in the center of the woven rug!
        drawBlondCristian(ctx, cx, cy, 'toddler', {
          flipX: spinFlip,
          tiltRad: tilt,
          bobY: hop,
          scaleBoost: 1.08,
        });
        drawMoodIcon(ctx, cx, cy - 60, 'heart');
      },
    });
  } else if (s4.cutscene === 'videogame_session') {
    // Beat 6: Interactive Tomb-Raider-inspired videogame session with Grazi, Ariel & 5yo BLOND Cristian!
    queue.push({
      y: 4.0 * TILE_SIZE,
      draw: () => {
        drawAncientRuinsTvScreen(ctx, s4.gamePuzzleStep, s4.gamePuzzleSolvedCount, t);
      },
    });

    const lean = Math.sin(t * 3.8) * 1.4;
    const cheerHop = !s4.gamePuzzlePending ? Math.abs(Math.sin(t * 8)) * -6 : Math.sin(t * 4) * -1.8;

    const gx = 7.4 * TILE_SIZE;
    const gy = 10.3 * TILE_SIZE;
    const ax = 9.4 * TILE_SIZE;
    const ay = 10.4 * TILE_SIZE;
    const cx = 11.4 * TILE_SIZE;
    const cy = 9.7 * TILE_SIZE;

    queue.push({
      y: cy,
      draw: () => {
        // 5-year-old BLOND Cristian cheering happily beside Ariel on the rug (well clear of sofa!)
        drawBlondCristian(ctx, cx, cy, 'child_5y', {
          flipX: true,
          bobY: cheerHop,
        });
        if (!s4.gamePuzzlePending) {
          drawMoodIcon(ctx, cx, cy - 66, 'heart');
        }
      },
    });

    queue.push({
      y: ay,
      draw: () => {
        // Young-adult Grazi pointing/helping Ariel solve the temple enigma
        drawAdultGrazi(ctx, gx, gy, { dir: 'right', bobY: lean * 0.5 });
        // Young-adult short-haired Ariel focused facing the TV & console on the rug
        drawAdultAriel(ctx, ax, ay, { dir: 'up', bobY: lean });

        // Subtle compact retro gamepad in Ariel's hands (backdrop already shows console & controllers!)
        ctx.fillStyle = '#2d3138';
        ctx.fillRect(px(ax) - 7, px(ay + lean) - 24, 14, 6);
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(px(ax) + 3, px(ay + lean) - 22, 2, 2);
        ctx.fillStyle = '#ff7597';
        ctx.fillRect(px(ax) + 5, px(ay + lean) - 21, 2, 2);

        if (!s4.gamePuzzlePending) {
          drawSpeechTag(ctx, ax, ay - 86, 'Vencemos juntos!');
        } else {
          drawSpeechTag(ctx, gx, gy - 84, 'Olha a pista ali!');
        }
      },
    });
  } else if (s4.cutscene === 'family_ending_7y') {
    // Beat 7: Finale — Family reunited in front of finished meia-água with 7yo BLOND Cristian!
    const fy = 11.15 * TILE_SIZE;
    queue.push({
      y: fy,
      draw: () => {
        drawAdultGrazi(ctx, 10.8 * TILE_SIZE, fy, {
          dir: 'down',
          pregnant: false,
          bobY: Math.sin(t * 1.8) * 0.8,
        });
        // 7-year-old BLOND Cristian smiling right between mom and dad!
        drawBlondCristian(ctx, 12.6 * TILE_SIZE, fy + 4, 'child_7y', {
          bobY: Math.abs(Math.sin(t * 3.2)) * -2.2,
        });
        drawAdultAriel(ctx, 14.3 * TILE_SIZE, fy, {
          dir: 'down',
          bobY: Math.sin(t * 1.8 + 0.8) * 0.8,
        });
        drawMoodIcon(ctx, 12.6 * TILE_SIZE, fy - 84, 'heart');
      },
    });
  } else if (isBikeRide && s4.bikeRide) {
    // Live Playable Bicycle Ride: Ariel pedaling with Grazi on the rear garupa!
    const bike = s4.bikeRide;
    const speed = Math.hypot(bike.vx, bike.vy);

    if (bike.arrived) {
      // Affectionate arrival interaction at the Bus Stop / Escola Estadual (zero code-drawn bicycle)
      const curbY = 9.05 * TILE_SIZE;
      queue.push({
        y: curbY,
        draw: () => {
          drawAdultAriel(ctx, bike.x + 18, curbY, {
            dir: 'right',
            bobY: Math.sin(sim.elapsedSeconds * 2.2) * 0.6,
          });
          drawAdultGrazi(ctx, bike.x + 48, curbY, {
            dir: 'left',
            pregnant: false,
            bobY: Math.sin(sim.elapsedSeconds * 2.2 + 0.9) * 0.6,
          });
          drawMoodIcon(ctx, bike.x + 33, curbY - 78, 'heart');
        },
      });
    } else {
      queue.push({
        y: bike.y,
        draw: () => {
          drawS4BicycleCoupleSkin(ctx, bike.x, bike.y, sim.elapsedSeconds, {
            pedalPhase: bike.pedalPhase,
            facing: bike.facing,
            speed,
          });
          if (speed > 20 && Math.sin(sim.elapsedSeconds * 2.8) > 0.35) {
            drawMoodIcon(ctx, bike.x - 8, bike.y - 78, 'heart');
          }
        },
      });
    }
  } else {
    // Live Playable Exploration!
    const isArielBuilder =
      sim.questPhase === 's4_build_meia_agua' || mapId === 'backyard_construction';
    for (const npc of sim.npcs) {
      if (!npc.visible) continue;
      queue.push({
        y: npc.y,
        draw: () => {
          if (isArielBuilder && (npc.role === 'grazi' || npc.role === 'ariel')) {
            drawAdultGrazi(ctx, npc.x, npc.y, {
              dir: npc.dir,
              pregnant: false,
              usePregnantWalkSheet: false,
            });
          } else if (npc.role === 'ariel') {
            drawAdultAriel(ctx, npc.x, npc.y, { dir: npc.dir });
          } else if (npc.role === 'grazi') {
            drawAdultGrazi(ctx, npc.x, npc.y, {
              dir: npc.dir,
              pregnant: false,
              usePregnantWalkSheet: false,
            });
          } else if (npc.role === 'bar_man') {
            drawBarManSprite(ctx, npc.x, npc.y, sim.elapsedSeconds, s4.metBarMan);
            if (!s4.metBarMan) {
              const bob = Math.sin(sim.elapsedSeconds * 5) * 2.5;
              drawSpeechTag(ctx, npc.x, npc.y - 68 + bob, 'Senhor do bar');
            }
          } else if (npc.role === 'cristian') {
            const age =
              s4.cristianAge === 'child_7y'
                ? 'child_7y'
                : s4.cristianAge === 'child_5y'
                  ? 'child_5y'
                  : 'toddler';
            drawBlondCristian(ctx, npc.x, npc.y, age, {
              bobY: Math.abs(Math.sin(sim.elapsedSeconds * 4.4)) * -2.4,
            });
          }
        },
      });
    }

    // Playable Character: Ariel during Meia-Água construction, Grazi in all other exploration phases
    queue.push({
      y: sim.player.y,
      draw: () => {
        if (isArielBuilder) {
          drawAdultAriel(ctx, sim.player.x, sim.player.y, {
            dir: sim.player.dir,
            walkPhase: sim.player.walkDistance * 0.11,
            isMoving: sim.player.isMoving,
          });
        } else {
          drawAdultGrazi(ctx, sim.player.x, sim.player.y, {
            dir: sim.player.dir,
            walkPhase: sim.player.walkDistance * 0.11,
            isMoving: sim.player.isMoving,
            pregnant: s4.graziPregnant,
            usePregnantWalkSheet: s4.graziPregnant,
          });
        }

        // Carried construction material badge above Ariel when building the meia-água
        if (s4.carryingMaterialId) {
          drawSpeechTag(ctx, sim.player.x, sim.player.y - 82, 'Ariel levando material → Obra');
        }
      },
    });
  }

  queue.sort((a, b) => a.y - b.y);
  for (const item of queue) {
    item.draw();
  }

  particles.draw(ctx);
  ctx.restore();

  // 5. Scene-Specific Atmospheric Glaze
  const glaze = ctx.createLinearGradient(0, 0, 0, viewH);
  if (s4.cutscene === 'bicycle_ride') {
    // End-of-day return ride: darker than the playable ride to school.
    glaze.addColorStop(0, 'rgba(20, 20, 48, 0.42)');
    glaze.addColorStop(0.55, 'rgba(48, 38, 60, 0.18)');
    glaze.addColorStop(1, 'rgba(10, 9, 28, 0.40)');
  } else if (s4.cutscene === 'pregnancy_reveal') {
    // Late-night warm low-light porch atmosphere
    glaze.addColorStop(0, 'rgba(14, 12, 28, 0.52)');
    glaze.addColorStop(0.5, 'rgba(54, 34, 24, 0.22)');
    glaze.addColorStop(1, 'rgba(12, 9, 20, 0.54)');
  } else if (isBikeRide) {
    // Keep the playable ride's existing warm twilight appearance.
    glaze.addColorStop(0, 'rgba(34, 30, 74, 0.28)');
    glaze.addColorStop(0.55, 'rgba(255, 168, 96, 0.12)');
    glaze.addColorStop(1, 'rgba(22, 16, 40, 0.30)');
  } else if (
    s4.cutscene === 'birth_blessing' ||
    s4.cutscene === 'cristian_crib' ||
    s4.cutscene === 'family_ending_7y'
  ) {
    // Golden hopeful warmth (soft sunlit glow for nursery crib & joyful birth!)
    glaze.addColorStop(0, 'rgba(255, 218, 128, 0.16)');
    glaze.addColorStop(0.55, 'rgba(255, 238, 178, 0.06)');
    glaze.addColorStop(1, 'rgba(62, 42, 20, 0.14)');
  } else if (
    sim.questPhase === 's4_explore_labor_walk' ||
    s4.cutscene === 'labor_walk_bar' ||
    s4.cutscene === 'maternity_trip'
  ) {
    // Bright calm peaceful daytime sunlight (distinct from twilight bike ride!)
    glaze.addColorStop(0, 'rgba(255, 226, 158, 0.22)');
    glaze.addColorStop(0.5, 'rgba(255, 242, 204, 0.10)');
    glaze.addColorStop(1, 'rgba(92, 62, 34, 0.06)');
  } else if (mapId === 'meia_agua_interior') {
    glaze.addColorStop(0, 'rgba(42, 28, 22, 0.14)');
    glaze.addColorStop(0.6, 'rgba(255, 208, 134, 0.06)');
    glaze.addColorStop(1, 'rgba(28, 18, 14, 0.22)');
  } else {
    glaze.addColorStop(0, 'rgba(255, 214, 146, 0.12)');
    glaze.addColorStop(0.6, 'rgba(255, 232, 182, 0.04)');
    glaze.addColorStop(1, 'rgba(48, 28, 16, 0.12)');
  }
  ctx.fillStyle = glaze;
  ctx.fillRect(0, 0, viewW, viewH);

  if (s4.cutscene === 'bicycle_ride' && t < STAGE4_SCHOOL_PICKUP_FADE_DURATION) {
    const fadeAlpha = 1 - t / STAGE4_SCHOOL_PICKUP_FADE_DURATION;
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha.toFixed(2)})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  if (s4.cutscene === 'labor_walk_bar' && t < 0.65) {
    const fadeAlpha = 1 - t / 0.65;
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha.toFixed(2)})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  if (s4.cutscene === 'pregnancy_reveal') {
    const snap = getCutsceneTimelineSnapshot(STAGE4_PREGNANCY_REVEAL_TIMELINE, t);
    const vigIntensity = snap.step.effects.vignetteIntensity ?? 0.48;
    const vignette = ctx.createRadialGradient(
      viewW / 2,
      viewH / 2,
      Math.min(viewW, viewH) * 0.28,
      viewW / 2,
      viewH / 2,
      Math.max(viewW, viewH) * 0.72,
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, `rgba(8, 5, 12, ${vigIntensity.toFixed(2)})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, viewW, viewH);

    // Step-to-step subtle fade & cinematic letterbox bars
    if (snap.stepTransitionAlpha > 0.01) {
      ctx.fillStyle = `rgba(8, 5, 10, ${snap.stepTransitionAlpha.toFixed(2)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    if (snap.step.effects.letterbox) {
      const barH = Math.max(28, Math.round(viewH * 0.085));
      ctx.fillStyle = 'rgba(6, 4, 8, 0.92)';
      ctx.fillRect(0, 0, viewW, barH);
      ctx.fillRect(0, viewH - barH, viewW, barH);
    }

    // Scene boundary fade from black (Step 1) and fade to black (Step 8)
    if (snap.fadeBlackAlpha > 0.01) {
      ctx.fillStyle = `rgba(0, 0, 0, ${snap.fadeBlackAlpha.toFixed(2)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  }
}
