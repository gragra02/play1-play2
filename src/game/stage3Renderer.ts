import {
  getCaminhoNovoTravelBackdrop,
  getStage3MapBackdrop,
} from './environmentArt';
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './mapData';
import {
  drawArielCarryBoxSprite,
  drawArielSprite,
  drawCoupleJoinedHands,
  drawGraziArielWalkTogether,
  drawGraziSpriteAtCoupleScale,
  drawGraziSprite,
  drawHeldMovingBox,
  drawLauraSprite,
  drawLeoCarryBoxSprite,
  drawLeoSprite,
  drawSlowDanceCouple,
} from './pixelArt';
import type { ParticlePool } from './sprites';
import {
  STAGE3_HOTDOG_COUNTER_POS,
  STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE,
  STAGE3_LIVINGROOM_EXIT_TO_MOVING,
  STAGE3_LIVINGROOM_SOFA_POS,
  STAGE3_PORCH_DROP_POS,
  STAGE3_STREET_EXIT_TO_HOTDOG,
  STAGE3_VIDEOSTORE_COUNTER_POS,
  STAGE3_VIDEOSTORE_EXIT_TO_HOME,
  STAGE_3_MEMORIES,
  getStage3Grid,
  type Stage3TileKind,
} from './stage3Data';
import {
  drawHotdogCartLiveEffects,
  drawHotdogEatingCutsceneActors,
  drawHotdogFloorTile,
  drawHotdogStandStructure,
  drawLauraLeoWalkTogether,
  drawLivingRoomCoffeeTableAndPopcorn,
  drawLivingRoomFloorTile,
  drawLivingRoomFloorLamp,
  drawLivingRoomLiveEffects,
  drawLivingRoomPlant,
  drawLivingRoomSofa,
  drawLivingRoomWallAndTv,
  drawMoodIcon,
  drawMovieNightSofaActors,
  drawMovingProposalCutsceneActors,
  drawNeighborhoodVideoStoreFacade,
  drawPortalMarker,
  drawTravelTransitionCutscene,
  drawVhsShelfUnit,
  drawVideoStoreCounter,
  drawVideoStoreFloorTile,
  drawVideoStoreInteriorHeader,
  drawVideoStoreLiveEffects,
  drawVideoStorePickingCutsceneActors,
  drawWrongHandCutsceneActors,
} from './stage3Environments';
import type { SimulationState, Stage3MapId } from './types';

// ============================================================================
// STAGE 3 — DESSA VEZ, PRA FICAR (5-Environment RPG World Renderer)
// Distinct architecture, floor/wall art, props & lighting for every location:
//   1. neighborhood_street  2. hotdog_stand  3. video_store
//   4. living_room          5. moving_house
// ============================================================================

const OUTLINE = '#2b1a12';

function drawNeighborhoodFloorTile(
  ctx: CanvasRenderingContext2D,
  kind: Stage3TileKind,
  col: number,
  row: number,
): void {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const hash = (col * 17 + row * 31) % 7;

  if (kind === 'road' || kind === 'truck') {
    ctx.fillStyle = '#4e5059';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#5a5c66';
    if (hash === 0 || hash === 3) {
      ctx.fillRect(x + 6, y + 8, 4, 2);
      ctx.fillRect(x + 20, y + 22, 3, 2);
    }
    if (row === 12) {
      ctx.fillStyle = '#c8beae';
      ctx.fillRect(x, y, TILE_SIZE, 4);
      ctx.fillStyle = '#998f80';
      ctx.fillRect(x, y + 3, TILE_SIZE, 1);
    }
    if (row === 13 && col % 2 === 0) {
      ctx.fillStyle = '#e5bd5a';
      ctx.fillRect(x + 5, y + 13, 18, 3);
    }
    return;
  }

  if (kind === 'plaza' || kind === 'exit_path') {
    ctx.fillStyle = kind === 'exit_path' ? '#dfc092' : '#cfa97e';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#be9366';
    ctx.fillRect(x, y + 15, TILE_SIZE, 1);
    ctx.fillRect(x, y + 31, TILE_SIZE, 1);
    ctx.fillRect(x + 15, y, 1, 16);
    ctx.fillRect(x + 7, y + 16, 1, 16);
    ctx.fillRect(x + 23, y + 16, 1, 16);
    ctx.fillStyle = '#dfbe95';
    ctx.fillRect(x + 2, y + 2, 11, 2);
    ctx.fillRect(x + 10, y + 18, 11, 2);
    return;
  }

  if (kind === 'porch' || kind === 'doorway') {
    ctx.fillStyle = '#a4683b';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#8b532c';
    for (let py = 0; py < TILE_SIZE; py += 8) {
      ctx.fillRect(x, y + py, TILE_SIZE, 1);
    }
    ctx.fillStyle = '#bd7f4d';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, 2);
    if (kind === 'doorway') {
      ctx.fillStyle = '#734124';
      ctx.fillRect(x + 4, y + 7, TILE_SIZE - 8, 16);
      ctx.fillStyle = '#d49d56';
      ctx.fillRect(x + 6, y + 9, TILE_SIZE - 12, 12);
    }
    return;
  }

  ctx.fillStyle = (col + row) % 2 === 0 ? '#6ca252' : '#659a4c';
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = '#7eb660';
  if (hash === 1 || hash === 4) {
    ctx.fillRect(x + 5, y + 9, 2, 3);
    ctx.fillRect(x + 7, y + 10, 2, 2);
  }
  if (hash === 2) {
    ctx.fillStyle = '#fff2a6';
    ctx.fillRect(x + 20, y + 14, 3, 3);
    ctx.fillStyle = '#f28ca0';
    ctx.fillRect(x + 11, y + 22, 2, 2);
  }
  if (hash === 5) {
    ctx.fillStyle = '#53823d';
    ctx.fillRect(x + 14, y + 6, 3, 2);
    ctx.fillRect(x + 23, y + 24, 3, 2);
  }
}

function drawHouseBlock(
  ctx: CanvasRenderingContext2D,
  startCol: number,
  endCol: number,
  wallColor: string,
  trimColor: string,
  hasOpenDoor: boolean,
): void {
  const x = startCol * TILE_SIZE;
  const w = (endCol - startCol + 1) * TILE_SIZE;
  const topY = 0;
  const h = 3 * TILE_SIZE;

  ctx.fillStyle = 'rgba(30, 18, 10, 0.25)';
  ctx.fillRect(x + 4, topY + h, w - 4, 6);

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 1, topY + 26, w + 2, h - 25);
  ctx.fillStyle = wallColor;
  ctx.fillRect(x + 1, topY + 28, w - 2, h - 29);

  ctx.fillStyle = trimColor;
  ctx.fillRect(x + 1, topY + h - 10, w - 2, 9);

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 4, topY + 2, w + 8, 36);
  ctx.fillStyle = '#b44c33';
  ctx.fillRect(x - 2, topY + 4, w + 4, 32);
  for (let ry = topY + 8; ry < topY + 34; ry += 6) {
    ctx.fillStyle = '#923925';
    ctx.fillRect(x - 2, ry, w + 4, 2);
    ctx.fillStyle = '#cd6346';
    for (let rx = x; rx < x + w - 4; rx += 10) {
      ctx.fillRect(rx, ry - 3, 6, 2);
    }
  }
  ctx.fillStyle = '#d97656';
  ctx.fillRect(x, topY + 4, w, 3);

  const winCount = Math.max(2, Math.floor((endCol - startCol) / 3));
  for (let i = 0; i < winCount; i++) {
    const wx = Math.round(x + 24 + (i * (w - 68)) / Math.max(1, winCount - 1));
    if (hasOpenDoor && Math.abs(wx - (x + w / 2 - 12)) < 36) continue;
    const wy = topY + 48;
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(wx - 4, wy - 2, 32, 26);
    ctx.fillStyle = '#5c7f52';
    ctx.fillRect(wx - 3, wy, 5, 22);
    ctx.fillRect(wx + 22, wy, 5, 22);
    ctx.fillStyle = '#f8df9c';
    ctx.fillRect(wx + 3, wy, 18, 22);
    ctx.fillStyle = '#fff5d1';
    ctx.fillRect(wx + 5, wy + 2, 6, 8);
    ctx.fillStyle = '#6b3e22';
    ctx.fillRect(wx + 11, wy, 2, 22);
    ctx.fillRect(wx + 3, wy + 10, 18, 2);
    ctx.fillStyle = '#7c4726';
    ctx.fillRect(wx + 1, wy + 22, 22, 5);
    ctx.fillStyle = '#4e8a3f';
    ctx.fillRect(wx + 3, wy + 20, 18, 3);
    ctx.fillStyle = '#e86a82';
    ctx.fillRect(wx + 6, wy + 19, 3, 2);
    ctx.fillRect(wx + 15, wy + 19, 3, 2);
  }

  const doorX = Math.round(x + w / 2 - 18);
  const doorY = topY + 46;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(doorX - 2, doorY - 2, 40, 50);
  if (hasOpenDoor) {
    ctx.fillStyle = '#4b2d1b';
    ctx.fillRect(doorX, doorY, 36, 48);
    ctx.fillStyle = '#f6d899';
    ctx.fillRect(doorX + 3, doorY + 3, 30, 44);
    ctx.fillStyle = '#8b4e27';
    ctx.fillRect(doorX, doorY, 10, 48);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(doorX + 7, doorY + 24, 2, 3);
  } else {
    ctx.fillStyle = '#7c4523';
    ctx.fillRect(doorX, doorY, 36, 48);
    ctx.fillStyle = '#9a5b32';
    ctx.fillRect(doorX + 4, doorY + 4, 28, 18);
    ctx.fillRect(doorX + 4, doorY + 26, 28, 18);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(doorX + 28, doorY + 24, 3, 3);
  }
}

function drawTreeProp(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = 'rgba(26, 44, 18, 0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 5, cy - 8, 10, 19);
  ctx.fillStyle = '#7c4b2b';
  ctx.fillRect(cx - 4, cy - 7, 8, 17);
  ctx.fillStyle = '#9b643d';
  ctx.fillRect(cx - 3, cy - 7, 3, 16);

  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.arc(cx, cy - 19, 16, 0, Math.PI * 2);
  ctx.arc(cx - 9, cy - 13, 10, 0, Math.PI * 2);
  ctx.arc(cx + 9, cy - 13, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3d7432';
  ctx.beginPath();
  ctx.arc(cx, cy - 19, 14.5, 0, Math.PI * 2);
  ctx.arc(cx - 9, cy - 13, 8.5, 0, Math.PI * 2);
  ctx.arc(cx + 9, cy - 13, 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#609e44';
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 23, 10, 0, Math.PI * 2);
  ctx.arc(cx + 6, cy - 18, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#89bf5b';
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 26, 5.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawParkBench(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = 'rgba(28, 18, 10, 0.25)';
  ctx.fillRect(x + 2, y + 25, 28, 4);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x + 1, y + 6, 30, 20);
  ctx.fillStyle = '#363b45';
  ctx.fillRect(x + 3, y + 8, 3, 17);
  ctx.fillRect(x + 26, y + 8, 3, 17);
  ctx.fillStyle = '#a86432';
  ctx.fillRect(x + 2, y + 7, 28, 5);
  ctx.fillStyle = '#c47b43';
  ctx.fillRect(x + 2, y + 8, 28, 2);
  ctx.fillStyle = '#955326';
  ctx.fillRect(x + 2, y + 14, 28, 6);
  ctx.fillStyle = '#b9703a';
  ctx.fillRect(x + 2, y + 15, 28, 2);
}

function drawStreetLamp(ctx: CanvasRenderingContext2D, cx: number, cy: number, warmGlow: number): void {
  ctx.fillStyle = `rgba(255, 214, 120, ${(0.2 + warmGlow * 0.08).toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(cx, cy - 22, 26, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 3, cy - 22, 6, 30);
  ctx.fillStyle = '#3a414c';
  ctx.fillRect(cx - 2, cy - 21, 4, 28);
  ctx.fillRect(cx - 5, cy + 5, 10, 4);

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 6, cy - 30, 12, 10);
  ctx.fillStyle = '#ffe599';
  ctx.fillRect(cx - 4, cy - 28, 8, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 2, cy - 27, 4, 3);
}

function drawHedgeTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x + 1, y + 4, TILE_SIZE - 2, TILE_SIZE - 6);
  ctx.fillStyle = '#3d7033';
  ctx.fillRect(x + 2, y + 5, TILE_SIZE - 4, TILE_SIZE - 8);
  ctx.fillStyle = '#5a9443';
  ctx.fillRect(x + 4, y + 7, TILE_SIZE - 8, 9);
  ctx.fillStyle = '#f7d66b';
  ctx.fillRect(x + 8, y + 11, 3, 3);
  ctx.fillStyle = '#f0869a';
  ctx.fillRect(x + 20, y + 16, 3, 3);
}

function drawMovingTruck(ctx: CanvasRenderingContext2D, deliveredCount: number): void {
  const x = 5 * TILE_SIZE;
  const y = 12 * TILE_SIZE - 8;
  const w = 6 * TILE_SIZE;
  const h = 58;

  ctx.fillStyle = 'rgba(20, 14, 10, 0.35)';
  ctx.fillRect(x + 4, y + h - 4, w - 6, 10);

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x, y + 4, 118, 44);
  ctx.fillStyle = '#8b572c';
  ctx.fillRect(x + 2, y + 6, 114, 40);
  ctx.fillStyle = '#a86d3b';
  for (let sy = y + 9; sy < y + 42; sy += 9) {
    ctx.fillRect(x + 3, sy, 112, 5);
  }

  const remaining = Math.max(0, 4 - deliveredCount);
  if (remaining >= 1) {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 10, y - 6, 26, 22);
    ctx.fillStyle = '#cfa06b';
    ctx.fillRect(x + 12, y - 4, 22, 18);
    ctx.fillStyle = '#efe0c0';
    ctx.fillRect(x + 20, y - 4, 5, 18);
  }
  if (remaining >= 2) {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 42, y - 10, 30, 26);
    ctx.fillStyle = '#b97b45';
    ctx.fillRect(x + 44, y - 8, 26, 22);
    ctx.fillStyle = '#8b532c';
    ctx.fillRect(x + 46, y - 2, 22, 3);
  }
  if (remaining >= 3) {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 78, y - 5, 24, 20);
    ctx.fillStyle = '#d9a66c';
    ctx.fillRect(x + 80, y - 3, 20, 16);
  }

  const cabX = x + 118;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cabX, y - 2, 68, 50);
  ctx.fillStyle = '#4c7ca8';
  ctx.fillRect(cabX + 2, y, 64, 46);
  ctx.fillStyle = '#73a4cf';
  ctx.fillRect(cabX + 4, y + 2, 54, 7);
  ctx.fillStyle = '#cde6f5';
  ctx.fillRect(cabX + 10, y + 10, 24, 16);
  ctx.fillRect(cabX + 38, y + 10, 22, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cabX + 12, y + 12, 8, 4);
  ctx.fillStyle = '#d4dce6';
  ctx.fillRect(cabX + 64, y + 34, 6, 10);
  ctx.fillStyle = '#ffe599';
  ctx.fillRect(cabX + 62, y + 26, 5, 7);

  for (const wx of [x + 26, x + 94, cabX + 40]) {
    ctx.fillStyle = '#1d1b1e';
    ctx.beginPath();
    ctx.arc(wx, y + 48, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9aa6b5';
    ctx.beginPath();
    ctx.arc(wx, y + 48, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMovingGroundItem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: 'box_books' | 'box_tapes' | 'fan' | 'box_kitchen',
  highlight: boolean,
  time: number,
): void {
  const bx = Math.round(x);
  const by = Math.round(y);

  if (highlight) {
    const pulse = 0.25 + 0.16 * Math.sin(time * 5.2);
    ctx.fillStyle = `rgba(255, 214, 102, ${pulse.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(bx, by - 2, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(28, 18, 10, 0.26)';
  ctx.beginPath();
  ctx.ellipse(bx, by + 6, 10, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  drawHeldMovingBox(ctx, bx, by - 1, kind);

  if (highlight) {
    const bob = Math.sin(time * 6) * 2;
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(bx - 2, by - 17 + bob, 4, 4);
    ctx.fillStyle = OUTLINE;
    ctx.strokeRect(bx - 2.5, by - 17.5 + bob, 5, 5);
  }
}

function drawPorchDeliveredFurniture(
  ctx: CanvasRenderingContext2D,
  deliveredCount: number,
  hasBackdrop = false,
): void {
  if (!hasBackdrop) {
    const chairX = 7.4 * TILE_SIZE;
    const chairY = 3.8 * TILE_SIZE;
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(chairX - 7, chairY - 12, 14, 20);
    ctx.fillStyle = '#8b532c';
    ctx.fillRect(chairX - 6, chairY - 11, 12, 9);
    ctx.fillStyle = '#b47440';
    ctx.fillRect(chairX - 6, chairY - 1, 12, 5);
    ctx.fillStyle = '#6b3b1e';
    ctx.fillRect(chairX - 5, chairY + 4, 3, 4);
    ctx.fillRect(chairX + 2, chairY + 4, 3, 4);

    const tableX = 16.4 * TILE_SIZE;
    const tableY = 3.9 * TILE_SIZE;
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(tableX - 13, tableY - 8, 26, 16);
    ctx.fillStyle = '#b87640';
    ctx.fillRect(tableX - 12, tableY - 7, 24, 9);
    ctx.fillStyle = '#7c4726';
    ctx.fillRect(tableX - 10, tableY + 2, 4, 6);
    ctx.fillRect(tableX + 6, tableY + 2, 4, 6);
  }

  const spots: Array<{ x: number; y: number; kind: 'box_books' | 'box_tapes' | 'fan' | 'box_kitchen' }> =
    hasBackdrop
      ? [
          { x: 10.65 * TILE_SIZE, y: 4.55 * TILE_SIZE, kind: 'box_books' },
          { x: 11.25 * TILE_SIZE, y: 4.65 * TILE_SIZE, kind: 'box_tapes' },
          { x: 13.35 * TILE_SIZE, y: 4.55 * TILE_SIZE, kind: 'fan' },
          { x: 14.05 * TILE_SIZE, y: 4.65 * TILE_SIZE, kind: 'box_kitchen' },
        ]
      : [
          { x: 8.8 * TILE_SIZE, y: 4.1 * TILE_SIZE, kind: 'box_books' },
          { x: 9.8 * TILE_SIZE, y: 4.1 * TILE_SIZE, kind: 'box_tapes' },
          { x: 14.4 * TILE_SIZE, y: 4.1 * TILE_SIZE, kind: 'fan' },
          { x: 15.3 * TILE_SIZE, y: 4.1 * TILE_SIZE, kind: 'box_kitchen' },
        ];

  for (let i = 0; i < Math.min(deliveredCount, spots.length); i++) {
    const s = spots[i];
    drawHeldMovingBox(ctx, s.x, s.y, s.kind);
  }
}

function drawTimePassageCutscene(
  ctx: CanvasRenderingContext2D,
  viewW: number,
  viewH: number,
  elapsed: number,
): void {
  const progress = Math.min(1, elapsed / 5.8);
  const travelArt = getCaminhoNovoTravelBackdrop();

  if (travelArt) {
    const imgW = travelArt.naturalWidth || 1280;
    const imgH = travelArt.naturalHeight || 720;
    const coverScale = Math.max(viewW / imgW, viewH / imgH) * 1.08;
    const drawW = imgW * coverScale;
    const drawH = imgH * coverScale;
    const maxPanX = Math.max(0, drawW - viewW);
    const drawX = -Math.round(progress * maxPanX);
    const drawY = Math.round((viewH - drawH) * 0.5);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(travelArt, drawX, drawY, drawW, drawH);

    // Atmospheric time-passage glaze shifting from dusk nostalgia to bright golden afternoon
    const glaze = ctx.createLinearGradient(0, 0, 0, viewH);
    if (progress < 0.45) {
      const dawnAlpha = 0.34 * (1 - progress / 0.45);
      glaze.addColorStop(0, `rgba(48, 36, 82, ${(dawnAlpha + 0.16).toFixed(3)})`);
      glaze.addColorStop(0.55, `rgba(176, 98, 96, ${(dawnAlpha * 0.8 + 0.1).toFixed(3)})`);
      glaze.addColorStop(1, 'rgba(56, 28, 18, 0.24)');
    } else {
      glaze.addColorStop(0, 'rgba(255, 224, 150, 0.14)');
      glaze.addColorStop(0.6, 'rgba(255, 206, 130, 0.06)');
      glaze.addColorStop(1, 'rgba(48, 28, 16, 0.16)');
    }
    ctx.fillStyle = glaze;
    ctx.fillRect(0, 0, viewW, viewH);

    // Beat 2 of Intro: show Laura & Léo already walking side-by-side holding hands along Caminho Novo!
    if (elapsed >= 2.4) {
      const walkP = Math.min(1, (elapsed - 2.4) / 3.4);
      ctx.save();
      const s = Math.max(1.05, Math.min(1.55, viewW / 640));
      ctx.scale(s, s);
      const lx = (viewW * (0.28 + walkP * 0.44)) / s;
      const ly = (viewH * 0.82) / s;
      drawLauraLeoWalkTogether(ctx, lx, ly, elapsed * 7.5, true, 'right', true);
      ctx.restore();
    }
    return;
  }

  const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
  if (progress < 0.45) {
    skyGrad.addColorStop(0, '#362d54');
    skyGrad.addColorStop(0.55, '#8f5563');
    skyGrad.addColorStop(1, '#e09a6c');
  } else {
    skyGrad.addColorStop(0, '#5a82b0');
    skyGrad.addColorStop(0.5, '#d99a6a');
    skyGrad.addColorStop(1, '#f4cf8e');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, viewW, viewH);

  const groundY = Math.round(viewH * 0.74);
  ctx.fillStyle = '#5e8f48';
  ctx.fillRect(0, groundY, viewW, viewH - groundY);
  ctx.fillStyle = '#cca578';
  ctx.fillRect(0, groundY + 26, viewW, 34);

  if (elapsed >= 2.4) {
    const walkP = Math.min(1, (elapsed - 2.4) / 3.4);
    ctx.save();
    const s = Math.max(1.0, Math.min(1.45, viewW / 640));
    ctx.scale(s, s);
    const lx = (viewW * (0.28 + walkP * 0.44)) / s;
    const ly = (groundY + 36) / s;
    drawLauraLeoWalkTogether(ctx, lx, ly, elapsed * 7.5, true, 'right', true);
    ctx.restore();
  }
}

export function renderStage3World(
  ctx: CanvasRenderingContext2D,
  sim: SimulationState,
  particles: ParticlePool,
  viewW: number,
  viewH: number,
): void {
  const s3 = sim.stage3;
  if (!s3) return;

  // Full-screen atmospheric intro & animated travel-between-places cutscenes!
  if (s3.cutscene === 'time_passage') {
    drawTimePassageCutscene(ctx, viewW, viewH, s3.cutsceneElapsed);
    return;
  }

  if (
    s3.cutscene === 'travel_to_hotdog' ||
    s3.cutscene === 'travel_to_videostore' ||
    s3.cutscene === 'travel_to_livingroom' ||
    s3.cutscene === 'travel_to_moving'
  ) {
    drawTravelTransitionCutscene(ctx, s3.cutscene, viewW, viewH, s3.cutsceneElapsed);
    return;
  }

  const mapId: Stage3MapId = s3.mapId;
  const grid = getStage3Grid(mapId);
  const worldW = MAP_COLS * TILE_SIZE;
  const worldH = MAP_ROWS * TILE_SIZE;

  const focusX = s3.cutscene !== 'none' ? s3.cameraFocusX : sim.player.x;
  const focusY = s3.cutscene !== 'none' ? s3.cameraFocusY : sim.player.y;
  const zoom = s3.cutscene !== 'none' ? s3.cameraZoom : 1.0;

  const mapBackdrop = getStage3MapBackdrop(mapId);
  const coverScale = Math.max(viewW / worldW, viewH / worldH);

  const baseScale = mapBackdrop
    ? s3.cutscene === 'none'
      ? coverScale * 1.14
      : coverScale * 1.06
    : mapId === 'video_store'
      ? Math.max(1.0, Math.min(viewW / 700, viewH / 490))
      : mapId === 'hotdog_stand'
        ? Math.max(1.05, Math.min(viewW / 660, viewH / 440))
        : Math.max(1.15, Math.min(viewW / 590, viewH / 390));
  const scale = baseScale * zoom;

  let camX = focusX - viewW / (2 * scale);
  let camY = focusY - viewH / (2 * scale);
  camX = Math.max(0, Math.min(Math.max(0, worldW - viewW / scale), camX));
  camY = Math.max(0, Math.min(Math.max(0, worldH - viewH / scale), camY));

  ctx.fillStyle =
    mapId === 'video_store'
      ? '#1a243e'
      : mapId === 'living_room'
        ? '#3b2820'
        : mapId === 'hotdog_stand'
          ? '#344d30'
          : '#3e5e32';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.scale(scale, scale);
  ctx.translate(-Math.round(camX), -Math.round(camY));

  // 1. High-Resolution Stardew Environment Backdrops across ALL 5 Stage 3 locations!
  if (mapBackdrop) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(mapBackdrop, 0, 0, worldW, worldH);

    if (mapId === 'neighborhood_street') {
      // Subtle animated warm lantern glow halos synced to the two streetlamps in the Caminho Novo artwork
      const lampPulse = 0.16 + 0.045 * Math.sin(sim.elapsedSeconds * 2.4);
      const lamps = [
        { x: worldW * 0.214, y: worldH * 0.525 },
        { x: worldW * 0.78, y: worldH * 0.525 },
      ];
      for (const lamp of lamps) {
        const grad = ctx.createRadialGradient(lamp.x, lamp.y, 4, lamp.x, lamp.y, 44);
        grad.addColorStop(0, `rgba(255, 224, 138, ${(lampPulse * 1.45).toFixed(3)})`);
        grad.addColorStop(0.5, `rgba(255, 196, 102, ${(lampPulse * 0.65).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(255, 180, 80, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(lamp.x, lamp.y, 44, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tile = grid[row][col];
        if (mapId === 'hotdog_stand') {
          drawHotdogFloorTile(ctx, tile, col, row);
        } else if (mapId === 'video_store') {
          drawVideoStoreFloorTile(ctx, tile, col, row);
        } else if (mapId === 'living_room') {
          drawLivingRoomFloorTile(ctx, tile, col, row);
        } else {
          drawNeighborhoodFloorTile(ctx, tile, col, row);
        }
      }
    }
  }

  // 2. Environment-Specific Static Architecture & Interactive Halos
  if (mapId === 'neighborhood_street') {
    if (!mapBackdrop) {
      drawHouseBlock(ctx, 2, 9, '#f3dfc1', '#cca983', false);
      drawHouseBlock(ctx, 12, 19, '#e7d2b5', '#b9936d', false);
    }
  } else if (mapId === 'hotdog_stand') {
    if (!mapBackdrop) {
      drawNeighborhoodVideoStoreFacade(ctx, 13, 20, true);
    }
    if (s3.cutscene === 'none' && !s3.orderedHotdog) {
      const pulse = 0.25 + 0.15 * Math.sin(sim.elapsedSeconds * 5.2);
      ctx.fillStyle = `rgba(255, 214, 102, ${pulse.toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(STAGE3_HOTDOG_COUNTER_POS.x, STAGE3_HOTDOG_COUNTER_POS.y, 26, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapId === 'video_store') {
    if (!mapBackdrop) {
      drawVideoStoreInteriorHeader(ctx, sim.elapsedSeconds);
      drawVideoStoreCounter(ctx, sim.elapsedSeconds);
    } else {
      drawVideoStoreLiveEffects(ctx, sim.elapsedSeconds);
    }
    if (s3.cutscene === 'none' && !s3.pickedMovieTape) {
      const pulse = 0.24 + 0.14 * Math.sin(sim.elapsedSeconds * 5);
      ctx.fillStyle = `rgba(94, 226, 255, ${pulse.toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(
        STAGE3_VIDEOSTORE_COUNTER_POS.x,
        STAGE3_VIDEOSTORE_COUNTER_POS.y,
        24,
        10,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  } else if (mapId === 'living_room') {
    if (!mapBackdrop) {
      drawLivingRoomWallAndTv(ctx, sim.elapsedSeconds);
    } else {
      drawLivingRoomLiveEffects(ctx, sim.elapsedSeconds);
    }
    if (s3.cutscene === 'none' && !s3.watchedMovieNight) {
      const pulse = 0.24 + 0.14 * Math.sin(sim.elapsedSeconds * 5);
      ctx.fillStyle = `rgba(255, 214, 102, ${pulse.toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(STAGE3_LIVINGROOM_SOFA_POS.x, STAGE3_LIVINGROOM_SOFA_POS.y, 28, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapId === 'moving_house') {
    if (!mapBackdrop) {
      drawHouseBlock(ctx, 5, 18, '#f6e4c8', '#c79f77', true);
    }
    drawPorchDeliveredFurniture(ctx, s3.movingDeliveredCount, Boolean(mapBackdrop));

    if (s3.cutscene === 'none' && s3.carryingItemId) {
      const pulse = 0.28 + 0.16 * Math.sin(sim.elapsedSeconds * 6);
      ctx.fillStyle = `rgba(255, 214, 102, ${pulse.toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(STAGE3_PORCH_DROP_POS.x, STAGE3_PORCH_DROP_POS.y, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // 3. Glowing Unlocked Doorway / Street Exit Markers
  if (s3.cutscene === 'none') {
    if (mapId === 'neighborhood_street' && s3.metFriendsOnStreet) {
      drawPortalMarker(
        ctx,
        STAGE3_STREET_EXIT_TO_HOTDOG.x,
        STAGE3_STREET_EXIT_TO_HOTDOG.y,
        'right',
        'CACHORRO-QUENTE →',
        sim.elapsedSeconds,
      );
    } else if (mapId === 'hotdog_stand' && s3.orderedHotdog) {
      drawPortalMarker(
        ctx,
        STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE.x,
        STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE.y,
        'up',
        'ENTRAR NA LOCADORA ↑',
        sim.elapsedSeconds,
      );
    } else if (mapId === 'video_store' && s3.pickedMovieTape) {
      drawPortalMarker(
        ctx,
        STAGE3_VIDEOSTORE_EXIT_TO_HOME.x,
        STAGE3_VIDEOSTORE_EXIT_TO_HOME.y,
        'down',
        'IR PARA CASA ↓',
        sim.elapsedSeconds,
      );
    } else if (mapId === 'living_room' && s3.watchedMovieNight) {
      drawPortalMarker(
        ctx,
        STAGE3_LIVINGROOM_EXIT_TO_MOVING.x,
        STAGE3_LIVINGROOM_EXIT_TO_MOVING.y,
        'down',
        'FIM DE TARDE ↓',
        sim.elapsedSeconds,
      );
    }
  }

  // 4. Unlockable Memory Shimmer Points (matched by current environment!)
  if (s3.cutscene === 'none') {
    const unlockedSet = new Set(s3.unlockedMemories);
    for (const mem of STAGE_3_MEMORIES) {
      if (mem.mapId !== mapId || unlockedSet.has(mem.id)) continue;

      const pulse = 0.55 + 0.45 * Math.sin(sim.elapsedSeconds * 4.5 + mem.x * 0.05);
      ctx.fillStyle = `rgba(255, 218, 102, ${(0.24 * pulse).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(mem.x, mem.y, 11 + pulse * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(Math.round(mem.x) - 1, Math.round(mem.y) - 5, 2, 10);
      ctx.fillRect(Math.round(mem.x) - 5, Math.round(mem.y) - 1, 10, 2);
      ctx.fillStyle = '#fff9e6';
      ctx.fillRect(Math.round(mem.x) - 1, Math.round(mem.y) - 1, 2, 2);
    }
  }

  // 5. Y-sorted Render Queue (Props, Furniture, Shelves, Sofa, Characters)
  interface Renderable {
    y: number;
    draw: () => void;
  }
  const queue: Renderable[] = [];

  if (!mapBackdrop) {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tile = grid[row][col];
        const px = col * TILE_SIZE;
        const py = row * TILE_SIZE;
        if (tile === 'tree') {
          queue.push({ y: py + 24, draw: () => drawTreeProp(ctx, px + 16, py + 16) });
        } else if (tile === 'bench') {
          queue.push({ y: py + 24, draw: () => drawParkBench(ctx, px, py) });
        } else if (tile === 'lamp') {
          queue.push({
            y: py + 24,
            draw: () => drawStreetLamp(ctx, px + 16, py + 18, Math.sin(sim.elapsedSeconds * 2 + col)),
          });
        } else if (tile === 'fence') {
          queue.push({ y: py + 22, draw: () => drawHedgeTile(ctx, px, py) });
        } else if (tile === 'floor_lamp') {
          queue.push({
            y: py + 24,
            draw: () => drawLivingRoomFloorLamp(ctx, px + 16, py + 16, sim.elapsedSeconds),
          });
        } else if (tile === 'home_plant') {
          queue.push({ y: py + 22, draw: () => drawLivingRoomPlant(ctx, px + 16, py + 18) });
        }
      }
    }
  }

  // Multi-tile bespoke props & live NPC/effect layers per environment (Y-sorted cleanly!)
  if (mapId === 'hotdog_stand') {
    if (!mapBackdrop) {
      queue.push({
        y: 5.95 * TILE_SIZE,
        draw: () => drawHotdogStandStructure(ctx, sim.elapsedSeconds),
      });
    } else {
      queue.push({
        y: 4.55 * TILE_SIZE,
        draw: () => drawHotdogCartLiveEffects(ctx, sim.elapsedSeconds),
      });
    }
  } else if (mapId === 'video_store' && !mapBackdrop) {
    queue.push({
      y: 6.9 * TILE_SIZE,
      draw: () =>
        drawVhsShelfUnit(ctx, 4, 5, 6, 'COMÉDIA', ['#ffd166', '#f28c38', '#4ecdc4', '#e85d52', '#7ac74f']),
    });
    queue.push({
      y: 5.9 * TILE_SIZE,
      draw: () =>
        drawVhsShelfUnit(ctx, 14, 6, 5, 'AÇÃO', ['#d94b4b', '#3a7bd5', '#2a9d8f', '#f4a261', '#8d5fd3']),
    });
    queue.push({
      y: 9.9 * TILE_SIZE,
      draw: () =>
        drawVhsShelfUnit(ctx, 4, 5, 9, 'ROMANCE', ['#f28482', '#f7b267', '#a66dd4', '#ff9eb5', '#5eb3d6']),
    });
    queue.push({
      y: 9.9 * TILE_SIZE,
      draw: () =>
        drawVhsShelfUnit(ctx, 14, 6, 9, 'LANÇAMENTOS', ['#5ee2ff', '#ffd166', '#e85d75', '#68d391', '#9f7aea']),
    });
  } else if (mapId === 'living_room' && !mapBackdrop) {
    queue.push({
      y: 6.0 * TILE_SIZE,
      draw: () =>
        drawLivingRoomCoffeeTableAndPopcorn(
          ctx,
          sim.elapsedSeconds,
          s3.cutscene === 'movie_night_sofa',
        ),
    });
    queue.push({
      y: 8.1 * TILE_SIZE,
      draw: () => drawLivingRoomSofa(ctx),
    });
  } else if (mapId === 'moving_house') {
    if (!mapBackdrop) {
      queue.push({
        y: 13.5 * TILE_SIZE,
        draw: () => drawMovingTruck(ctx, s3.movingDeliveredCount),
      });
    }

    if (s3.cutscene === 'none') {
      for (const item of s3.movingItems) {
        if (item.delivered || s3.carryingItemId === item.id) continue;
        queue.push({
          y: item.pickupY,
          draw: () =>
            drawMovingGroundItem(
              ctx,
              item.pickupX,
              item.pickupY,
              item.kind,
              !s3.carryingItemId,
              sim.elapsedSeconds,
            ),
        });
      }
    }
  }

  // 6. Cutscene Actors vs Live Gameplay Actors
  if (s3.cutscene === 'together_montage') {
    const t = s3.cutsceneElapsed;
    if (t < 2.6) {
      queue.push({
        y: 7.0 * TILE_SIZE,
        draw: () => {
          const graziX = 7.0 * TILE_SIZE;
          const arielX = 7.78 * TILE_SIZE;
          drawGraziSpriteAtCoupleScale(ctx, graziX, 7.0 * TILE_SIZE, {
            dir: 'right',
            emotion: 'happy',
          });
          drawArielSprite(ctx, arielX, 7.0 * TILE_SIZE, { dir: 'left' });
          drawCoupleJoinedHands(ctx, graziX, 7.0 * TILE_SIZE, arielX, 7.0 * TILE_SIZE, true);
          if (t > 0.6) {
            drawMoodIcon(ctx, 7.62 * TILE_SIZE, 7.0 * TILE_SIZE - 56, 'heart');
          }
        },
      });
    } else if (t < 5.0) {
      const p = (t - 2.6) / 2.4;
      const wx = (7.8 + p * 6.4) * TILE_SIZE;
      const wy = 8.2 * TILE_SIZE;
      queue.push({
        y: wy,
        draw: () => drawGraziArielWalkTogether(ctx, wx, wy, t * 7.5, true, 'right'),
      });
    } else {
      const ex = 11.1 * TILE_SIZE;
      const ey = 7.9 * TILE_SIZE;
      queue.push({
        y: ey,
        draw: () => {
          drawSlowDanceCouple(ctx, ex, ey, t * 1.9);
          drawMoodIcon(ctx, ex, ey - 58, 'heart');
          drawLauraLeoWalkTogether(ctx, 13.8 * TILE_SIZE, ey + 2, t * 3.2, false, 'right', true);
        },
      });
    }
  } else if (s3.cutscene === 'hotdog_eating') {
    queue.push({
      y: 6.9 * TILE_SIZE,
      draw: () => drawHotdogEatingCutsceneActors(ctx, s3.cutsceneElapsed),
    });
  } else if (
    s3.cutscene === 'videostore_wrong_hand_setup' ||
    s3.cutscene === 'videostore_wrong_hand_wait' ||
    s3.cutscene === 'videostore_wrong_hand_tell'
  ) {
    const mode = s3.cutscene;
    queue.push({
      y: 7.8 * TILE_SIZE,
      draw: () => drawWrongHandCutsceneActors(ctx, mode, s3.cutsceneElapsed),
    });
  } else if (s3.cutscene === 'videostore_picking') {
    queue.push({
      y: 8.2 * TILE_SIZE,
      draw: () => drawVideoStorePickingCutsceneActors(ctx, s3.cutsceneElapsed),
    });
  } else if (s3.cutscene === 'movie_night_sofa') {
    queue.push({
      y: 9.1 * TILE_SIZE,
      draw: () => drawMovieNightSofaActors(ctx, s3.cutsceneElapsed, mapBackdrop),
    });
  } else if (s3.cutscene === 'moving_celebration') {
    const t = s3.cutsceneElapsed;
    const py = 4.9 * TILE_SIZE;
    const hop = Math.abs(Math.sin(t * 6.5)) * -2.2;
    queue.push({
      y: py,
      draw: () => {
        drawGraziArielWalkTogether(ctx, 11.5 * TILE_SIZE, py + hop, t * 4, false, 'down');
        drawLeoSprite(ctx, 13.6 * TILE_SIZE, py + hop * 0.8, { dir: 'down', bobPhase: t * 4 });
        drawMoodIcon(ctx, 11.5 * TILE_SIZE, py - 58, 'smile');
      },
    });
  } else if (s3.cutscene === 'moving_proposal') {
    queue.push({
      y: 5.5 * TILE_SIZE,
      draw: () => drawMovingProposalCutsceneActors(ctx, s3.cutsceneElapsed),
    });
  } else if (s3.cutscene === 'ending_together') {
    const t = s3.cutsceneElapsed;
    const cx = 12.0 * TILE_SIZE;
    const cy = 6.6 * TILE_SIZE;
    queue.push({
      y: cy,
      draw: () => {
        if (t < 2.2) {
          drawGraziArielWalkTogether(ctx, cx, cy, t * 3.5, false);
        } else {
          drawSlowDanceCouple(ctx, cx, cy, t * 1.6);
        }
        drawMoodIcon(ctx, cx, cy - 58, 'heart');
      },
    });
  } else {
    // Live Playable Exploration!
    const arielNpc = sim.npcs.find((n) => n.role === 'ariel' && n.visible);
    const arielTogether = Boolean(
      arielNpc &&
        (s3.arielFollowsPlayer || s3.friendsFollowPlayer) &&
        !s3.carryingItemId &&
        mapId !== 'moving_house' &&
        Math.hypot(sim.player.x - arielNpc.x, sim.player.y - arielNpc.y) <= 40,
    );
    const lauraNpc = sim.npcs.find((n) => n.role === 'laura' && n.visible);
    const leoNpc = sim.npcs.find((n) => n.role === 'leo' && n.visible);
    const lauraLeoTogether =
      lauraNpc &&
      leoNpc &&
      Math.hypot(lauraNpc.x - leoNpc.x, lauraNpc.y - leoNpc.y) <= 44;

    if (lauraLeoTogether && lauraNpc && leoNpc) {
      const coupleX = (lauraNpc.x + leoNpc.x) / 2;
      const coupleY = (lauraNpc.y + leoNpc.y) / 2;
      const isFollowing = sim.player.isMoving && s3.friendsFollowPlayer;
      queue.push({
        y: Math.max(lauraNpc.y, leoNpc.y) + 1,
        draw: () =>
          drawLauraLeoWalkTogether(
            ctx,
            coupleX,
            coupleY,
            isFollowing ? sim.player.walkDistance * 0.11 : sim.elapsedSeconds * 1.8,
            isFollowing,
            isFollowing ? sim.player.dir : 'down',
            Math.sin(sim.elapsedSeconds * 2.1) > 0.35,
          ),
      });
    }

    for (const npc of sim.npcs) {
      if (!npc.visible || npc.role === 'vendor' || npc.role === 'clerk') continue;
      if (arielTogether && npc.role === 'ariel') continue;
      if (
        lauraLeoTogether &&
        (npc.role === 'laura' || npc.role === 'leo')
      ) {
        continue;
      }

      if (mapId === 'moving_house' && (npc.role === 'ariel' || npc.role === 'leo')) {
        const cycle = (s3.helperTimer + (npc.role === 'leo' ? 3.2 : 0)) % 6.4;
        const carryingToHouse = cycle < 3.4;
        queue.push({
          y: npc.y,
          draw: () => {
            if (carryingToHouse) {
              if (npc.role === 'ariel') {
                drawArielCarryBoxSprite(ctx, npc.x, npc.y, {
                  facingLeft: npc.dir === 'left',
                  walkPhase: sim.elapsedSeconds * 5.2,
                });
              } else {
                drawLeoCarryBoxSprite(ctx, npc.x, npc.y, {
                  facingLeft: npc.dir === 'left',
                  walkPhase: sim.elapsedSeconds * 8.5,
                });
              }
            } else if (npc.role === 'ariel') {
              drawArielSprite(ctx, npc.x, npc.y, {
                dir: npc.dir,
                walkPhase: sim.elapsedSeconds * 8.5,
                isMoving: true,
              });
            } else {
              drawLeoSprite(ctx, npc.x, npc.y, {
                dir: npc.dir,
                walkDist: sim.elapsedSeconds * 36,
                isMoving: true,
              });
            }
          },
        });
        continue;
      }

      const isFollowing =
        sim.player.isMoving &&
        ((npc.role === 'ariel' && (s3.arielFollowsPlayer || s3.friendsFollowPlayer)) ||
          ((npc.role === 'laura' || npc.role === 'leo') && s3.friendsFollowPlayer));

      queue.push({
        y: npc.y,
        draw: () => {
          if (npc.role === 'ariel') {
            drawArielSprite(ctx, npc.x, npc.y, {
              dir: npc.dir,
              walkPhase: isFollowing ? sim.player.walkDistance * 0.11 : 0,
              isMoving: isFollowing,
              useWalkSheetForIdle: true,
            });
          } else if (npc.role === 'laura') {
            drawLauraSprite(ctx, npc.x, npc.y, {
              dir: npc.dir,
              dancePhase: isFollowing ? sim.player.walkDistance * 0.22 : sim.elapsedSeconds * 2.5,
              useWalkSheetForIdle: true,
            });
          } else if (npc.role === 'leo') {
            drawLeoSprite(ctx, npc.x, npc.y, {
              dir: npc.dir,
              walkDist: isFollowing ? sim.player.walkDistance : 0,
              isMoving: isFollowing,
              useWalkSheetForIdle: true,
              bobPhase: sim.elapsedSeconds * 2.4,
            });
          }
        },
      });
    }

    // Player (Grazi) + carried moving box when on Moving Day
    queue.push({
      y: arielTogether && arielNpc
        ? (sim.player.y + arielNpc.y) / 2
        : sim.player.y,
      draw: () => {
        const carried = s3.carryingItemId
          ? s3.movingItems.find((i) => i.id === s3.carryingItemId) ?? null
          : null;
        if (arielTogether && arielNpc) {
          drawGraziArielWalkTogether(
            ctx,
            (sim.player.x + arielNpc.x) / 2,
            (sim.player.y + arielNpc.y) / 2,
            sim.player.walkDistance * 0.11,
            sim.player.isMoving,
            sim.player.dir,
          );
          return;
        }
        if (carried && sim.player.dir === 'up') {
          drawHeldMovingBox(ctx, sim.player.x, sim.player.y - 22, carried.kind);
        }
        drawGraziSprite(ctx, sim.player.x, sim.player.y, {
          dir: sim.player.dir,
          walkPhase: sim.player.walkDistance * 0.11,
          isMoving: sim.player.isMoving,
          useWalkSheetForIdle: true,
          emotion: sim.player.reactionEmotion === 'none' ? 'happy' : sim.player.reactionEmotion,
        });
        if (carried && sim.player.dir !== 'up') {
          const offsetX = sim.player.dir === 'left' ? -10 : sim.player.dir === 'right' ? 10 : 0;
          drawHeldMovingBox(ctx, sim.player.x + offsetX, sim.player.y - 14, carried.kind);
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

  // 7. Distinct Atmospheric Lighting Glaze per Environment!
  const glaze = ctx.createLinearGradient(0, 0, 0, viewH);
  if (s3.cutscene === 'ending_together' || s3.cutscene === 'moving_proposal') {
    glaze.addColorStop(0, 'rgba(255, 160, 88, 0.24)');
    glaze.addColorStop(0.55, 'rgba(255, 198, 120, 0.10)');
    glaze.addColorStop(1, 'rgba(72, 34, 24, 0.26)');
  } else if (mapId === 'hotdog_stand') {
    // Cozy warm twilight street-food corner
    glaze.addColorStop(0, 'rgba(76, 56, 110, 0.16)');
    glaze.addColorStop(0.5, 'rgba(255, 192, 108, 0.10)');
    glaze.addColorStop(1, 'rgba(42, 22, 16, 0.22)');
  } else if (mapId === 'video_store') {
    // Crisp 1990s fluorescent & cool neon indoor video rental vibe
    glaze.addColorStop(0, 'rgba(72, 178, 255, 0.10)');
    glaze.addColorStop(0.55, 'rgba(255, 255, 255, 0.03)');
    glaze.addColorStop(1, 'rgba(24, 34, 68, 0.16)');
  } else if (mapId === 'living_room') {
    // Intimate cozy night-time living room movie ambiance
    glaze.addColorStop(0, 'rgba(24, 32, 66, 0.24)');
    glaze.addColorStop(0.5, 'rgba(255, 200, 130, 0.06)');
    glaze.addColorStop(1, 'rgba(18, 14, 28, 0.30)');
  } else {
    // Bright sunny golden-hour neighborhood / moving day
    glaze.addColorStop(0, 'rgba(255, 206, 130, 0.14)');
    glaze.addColorStop(0.6, 'rgba(255, 224, 168, 0.04)');
    glaze.addColorStop(1, 'rgba(56, 30, 18, 0.12)');
  }
  ctx.fillStyle = glaze;
  ctx.fillRect(0, 0, viewW, viewH);
}
