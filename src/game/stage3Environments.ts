import {
  SKIN_URLS,
  getCharacterWalkSheetImage,
  getSkinSprite,
} from './characterSkins';
import { getCaminhoNovoTravelBackdrop } from './environmentArt';
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './mapData';
import {
  drawArielSprite,
  drawCoupleJoinedHands,
  drawGraziArielWalkTogether,
  drawGraziSpriteAtCoupleScale,
  drawGraziSprite,
  drawLauraSprite,
  drawLeoSprite,
  drawShadow,
  drawSkinImage,
  drawSlowDanceCouple,
  getWalkSheetFrameBounds,
  drawWalkSheetFrame,
} from './pixelArt';
import type { Stage3TileKind } from './stage3Data';
import type { Direction, Stage3CutsceneKind } from './types';

// ============================================================================
// STAGE 3 — BESPOKE ENVIRONMENT & CUTSCENE RENDERERS
// Dedicated pixel-art architectures, furniture, lighting & animations for:
//   - Map 2: Barraca de Cachorro-Quente (Twilight Corner)
//   - Map 3: Locadora de Vídeos Anos 90 (Indoor VHS Store)
//   - Map 4: Sala de Estar (Noite de Filme & Pipoca no Sofá)
//   - Animated RPG Travel Cutscenes between all 5 environments
// Preserves 100% of approved character sprites (including Léo!).
// ============================================================================

const OUTLINE = '#2b1a12';

export function drawMoodIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: 'heart' | 'note' | 'smile' | 'vhs' | 'hotdog' | 'popcorn',
): void {
  const bx = Math.round(x);
  const by = Math.round(y);
  ctx.fillStyle = '#3d2111';
  ctx.fillRect(bx - 8, by - 8, 16, 14);
  ctx.fillStyle = '#fff5dc';
  ctx.fillRect(bx - 7, by - 7, 14, 12);

  if (kind === 'heart') {
    ctx.fillStyle = '#d64e6c';
    ctx.fillRect(bx - 4, by - 4, 3, 3);
    ctx.fillRect(bx + 1, by - 4, 3, 3);
    ctx.fillRect(bx - 4, by - 2, 8, 3);
    ctx.fillRect(bx - 2, by + 1, 4, 2);
  } else if (kind === 'note') {
    ctx.fillStyle = '#2d8a8a';
    ctx.fillRect(bx - 1, by - 5, 2, 7);
    ctx.fillRect(bx - 1, by - 5, 5, 2);
    ctx.fillRect(bx - 4, by, 4, 3);
  } else if (kind === 'vhs') {
    ctx.fillStyle = '#272936';
    ctx.fillRect(bx - 5, by - 4, 10, 7);
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(bx - 3, by - 2, 6, 3);
  } else if (kind === 'hotdog') {
    ctx.fillStyle = '#d99b52';
    ctx.fillRect(bx - 5, by - 3, 10, 5);
    ctx.fillStyle = '#c94335';
    ctx.fillRect(bx - 4, by - 2, 8, 2);
    ctx.fillStyle = '#f2cc4b';
    ctx.fillRect(bx - 3, by - 2, 6, 1);
  } else if (kind === 'popcorn') {
    ctx.fillStyle = '#d64e4e';
    ctx.fillRect(bx - 4, by - 1, 8, 5);
    ctx.fillStyle = '#fff3b8';
    ctx.fillRect(bx - 4, by - 4, 3, 3);
    ctx.fillRect(bx - 1, by - 5, 3, 4);
    ctx.fillRect(bx + 2, by - 4, 3, 3);
  } else {
    ctx.fillStyle = '#c46a1b';
    ctx.fillRect(bx - 4, by - 4, 2, 2);
    ctx.fillRect(bx + 2, by - 4, 2, 2);
    ctx.fillRect(bx - 3, by, 6, 2);
  }
}

export function drawPortalMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: 'right' | 'down' | 'up',
  label: string,
  elapsed: number,
): void {
  const pulse = 0.55 + 0.45 * Math.sin(elapsed * 5.2);
  const bob = Math.sin(elapsed * 5.2) * 2.5;
  const cx = Math.round(x);
  const cy = Math.round(y);

  // Soft glowing pad on ground
  ctx.fillStyle = `rgba(255, 214, 102, ${(0.24 + pulse * 0.2).toFixed(2)})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 4, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Animated directional arrow chevron
  const ax = dir === 'right' ? cx + bob : cx;
  const ay = dir === 'down' ? cy - 6 + bob : dir === 'up' ? cy - 6 - bob : cy - 6;
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  if (dir === 'right') {
    ctx.moveTo(ax - 7, ay - 7);
    ctx.lineTo(ax + 7, ay);
    ctx.lineTo(ax - 7, ay + 7);
  } else if (dir === 'up') {
    ctx.moveTo(ax - 7, ay + 6);
    ctx.lineTo(ax + 7, ay + 6);
    ctx.lineTo(ax, ay - 7);
  } else {
    ctx.moveTo(ax - 7, ay - 6);
    ctx.lineTo(ax + 7, ay - 6);
    ctx.lineTo(ax, ay + 7);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffe58f';
  ctx.beginPath();
  if (dir === 'right') {
    ctx.moveTo(ax - 5, ay - 5);
    ctx.lineTo(ax + 4, ay);
    ctx.lineTo(ax - 5, ay + 5);
  } else if (dir === 'up') {
    ctx.moveTo(ax - 5, ay + 4);
    ctx.lineTo(ax + 5, ay + 4);
    ctx.lineTo(ax, ay - 4);
  } else {
    ctx.moveTo(ax - 5, ay - 4);
    ctx.lineTo(ax + 5, ay - 4);
    ctx.lineTo(ax, ay + 4);
  }
  ctx.closePath();
  ctx.fill();

  // Compact crisp sign plate above marker
  ctx.font = 'bold 7px monospace';
  const tw = Math.ceil(ctx.measureText(label).width) + 10;
  const lx = Math.round(cx - tw / 2);
  const ly = Math.round(cy - 27 + (dir === 'down' ? -2 : 0));
  ctx.fillStyle = '#361b0e';
  ctx.fillRect(lx - 1, ly - 1, tw + 2, 13);
  ctx.fillStyle = '#5c2f18';
  ctx.fillRect(lx, ly, tw, 11);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 1;
  ctx.strokeRect(lx + 0.5, ly + 0.5, tw - 1, 10);
  ctx.fillStyle = '#fff5d6';
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, ly + 8);
  ctx.textAlign = 'left';
}

export function drawVendorNpc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  kind: 'vendor' | 'clerk',
  time: number,
  fullBody = false,
): void {
  const bob = Math.sin(time * 3) * 0.6;
  const sprite = getSkinSprite(kind === 'vendor' ? SKIN_URLS.npcVendor : SKIN_URLS.npcClerk);
  if (sprite) {
    if (fullBody) {
      drawShadow(ctx, cx, cy + 8, 8.5, 3.2);
      drawSkinImage(ctx, sprite, cx, cy + bob, 37);
    } else {
      // Standing behind counter/cart — show upper body naturally above the countertop at 1.6x scale
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - 38, cy - 58, 76, 60);
      ctx.clip();
      drawSkinImage(ctx, sprite, cx, cy + 22 + bob, 37);
      ctx.restore();
    }
    return;
  }

  const bx = Math.round(cx);
  const by = Math.round(cy + bob);

  // Fallback while skin loads
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bx - 7, by - 14, 14, 22);

  ctx.fillStyle = kind === 'vendor' ? '#f8f2e4' : '#2d689c';
  ctx.fillRect(bx - 6, by - 4, 12, 11);
  if (kind === 'vendor') {
    ctx.fillStyle = '#c83e37';
    ctx.fillRect(bx - 5, by - 2, 10, 8);
    ctx.fillStyle = '#fff3d6';
    ctx.fillRect(bx - 3, by - 1, 6, 4);
  } else {
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(bx + 1, by - 2, 3, 2);
  }

  ctx.fillStyle = '#e2a77d';
  ctx.fillRect(bx - 5, by - 12, 10, 8);
  ctx.fillStyle = '#24140d';
  ctx.fillRect(bx - 3, by - 9, 2, 2);
  ctx.fillRect(bx + 1, by - 9, 2, 2);
  ctx.fillStyle = '#8b4634';
  ctx.fillRect(bx - 2, by - 6, 4, 1);

  if (kind === 'vendor') {
    ctx.fillStyle = '#c83e37';
    ctx.fillRect(bx - 6, by - 16, 12, 5);
    ctx.fillStyle = '#fff3d6';
    ctx.fillRect(bx - 5, by - 14, 10, 2);
  } else {
    ctx.fillStyle = '#3b2416';
    ctx.fillRect(bx - 6, by - 15, 12, 4);
    ctx.fillRect(bx - 6, by - 12, 2, 4);
    ctx.fillRect(bx + 4, by - 12, 2, 4);
  }
}

export function drawHotdogCartLiveEffects(
  ctx: CanvasRenderingContext2D,
  time: number,
): void {
  // Friendly street vendor standing beside the high-res Stardew hot-dog cart + live rising steam + warm bulb halo
  const cartCenterX = 6.9 * TILE_SIZE;
  const cartTopY = 4.35 * TILE_SIZE;

  drawVendorNpc(ctx, 3.55 * TILE_SIZE, 5.8 * TILE_SIZE, 'vendor', time, true);

  // Warm hanging bulb halo under the striped street-cart awning
  const bulbGlow = 0.2 + 0.06 * Math.sin(time * 4.2);
  const grad = ctx.createRadialGradient(cartCenterX, cartTopY - 8, 4, cartCenterX, cartTopY - 8, 42);
  grad.addColorStop(0, `rgba(255, 224, 136, ${(bulbGlow * 1.4).toFixed(3)})`);
  grad.addColorStop(1, 'rgba(255, 190, 90, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cartCenterX, cartTopY - 8, 42, 0, Math.PI * 2);
  ctx.fill();

  // Animated rising steam wisps above the sausage & tomato sauce pot
  for (let i = 0; i < 3; i++) {
    const sy = 4.9 * TILE_SIZE - ((time * 15 + i * 7) % 18);
    const sx = 5.45 * TILE_SIZE + i * 6 + Math.sin(time * 4 + i) * 1.8;
    ctx.fillStyle = 'rgba(255, 250, 236, 0.72)';
    ctx.fillRect(Math.round(sx), Math.round(sy), 3, 4);
  }
}

export function drawVideoStoreLiveEffects(
  ctx: CanvasRenderingContext2D,
  time: number,
): void {
  // Friendly clerk standing flush behind the open wooden checkout desk beside the monitor
  drawVendorNpc(ctx, 4.25 * TILE_SIZE, 5.15 * TILE_SIZE, 'clerk', time, false);

  // Subtle animated CRT TV glow at top-right of the store
  const pulse = 0.14 + 0.06 * Math.sin(time * 5.2);
  const tvX = 19.2 * TILE_SIZE;
  const tvY = 1.65 * TILE_SIZE;
  const grad = ctx.createRadialGradient(tvX, tvY, 6, tvX, tvY, 44);
  grad.addColorStop(0, `rgba(128, 224, 255, ${(pulse * 1.5).toFixed(3)})`);
  grad.addColorStop(1, 'rgba(94, 200, 255, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(tvX, tvY, 44, 0, Math.PI * 2);
  ctx.fill();
}

export function drawLivingRoomLiveEffects(
  ctx: CanvasRenderingContext2D,
  time: number,
): void {
  // Soft flickering animated movie light cone cast from the CRT television across the rug!
  const tvCenterX = 12.0 * TILE_SIZE;
  const tvScreenY = 2.4 * TILE_SIZE;
  const flicker = 0.12 + 0.045 * Math.sin(time * 9.5);
  const coneGrad = ctx.createLinearGradient(tvCenterX, tvScreenY, tvCenterX, tvScreenY + 185);
  coneGrad.addColorStop(0, `rgba(148, 212, 255, ${(flicker + 0.1).toFixed(3)})`);
  coneGrad.addColorStop(1, 'rgba(148, 212, 255, 0)');
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(tvCenterX - 38, tvScreenY);
  ctx.lineTo(tvCenterX + 38, tvScreenY);
  ctx.lineTo(tvCenterX + 115, tvScreenY + 185);
  ctx.lineTo(tvCenterX - 115, tvScreenY + 185);
  ctx.closePath();
  ctx.fill();

  // Warm ambient glow halos on both living room floor lamps
  const lampGlow = 0.16 + 0.04 * Math.sin(time * 2.6);
  for (const lx of [5.5 * TILE_SIZE, 18.5 * TILE_SIZE]) {
    const ly = 7.4 * TILE_SIZE;
    const grad = ctx.createRadialGradient(lx, ly, 4, lx, ly, 46);
    grad.addColorStop(0, `rgba(255, 216, 134, ${(lampGlow * 1.45).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(255, 190, 96, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(lx, ly, 46, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================================
// MAP 2: BARRACA / CARRINHO DE CACHORRO-QUENTE NA RUA (Open-Air Sidewalk!)
// ============================================================================
export function drawHotdogFloorTile(
  ctx: CanvasRenderingContext2D,
  kind: Stage3TileKind,
  col: number,
  row: number,
): void {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;
  const hash = (col * 17 + row * 31) % 7;

  if (kind === 'doorway') {
    // Glowing Locadora glass entrance threshold & welcome mat on sidewalk!
    ctx.fillStyle = '#c4a17a';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#2d4670';
    ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 8);
    ctx.fillStyle = '#7bd3ee';
    ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 14);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x + 5, y + TILE_SIZE - 7, TILE_SIZE - 10, 4);
    return;
  }

  if (kind === 'plaza' || kind === 'hotdog_booth' || kind === 'hotdog_tile' || kind === 'exit_path') {
    // Open-air neighborhood brick sidewalk / praça
    ctx.fillStyle = '#cca67d';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#b99065';
    ctx.fillRect(x, y + 15, TILE_SIZE, 1);
    ctx.fillRect(x, y + 31, TILE_SIZE, 1);
    ctx.fillRect(x + 15, y, 1, 16);
    ctx.fillRect(x + 7, y + 16, 1, 16);
    ctx.fillRect(x + 23, y + 16, 1, 16);
    ctx.fillStyle = '#dcba92';
    ctx.fillRect(x + 2, y + 2, 11, 2);
    ctx.fillRect(x + 10, y + 18, 11, 2);
    return;
  }

  if (kind === 'road') {
    ctx.fillStyle = '#3d404c';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    if (row === 12) {
      ctx.fillStyle = '#b4ab9d';
      ctx.fillRect(x, y, TILE_SIZE, 4);
    }
    if (row === 13 && col % 2 === 0) {
      ctx.fillStyle = '#e2b857';
      ctx.fillRect(x + 5, y + 13, 18, 3);
    }
    return;
  }

  // Open-air twilight neighborhood square grass
  ctx.fillStyle = (col + row) % 2 === 0 ? '#588a48' : '#518142';
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  if (hash === 1 || hash === 4) {
    ctx.fillStyle = '#6da156';
    ctx.fillRect(x + 6, y + 10, 2, 3);
    ctx.fillRect(x + 8, y + 11, 2, 2);
  }
  if (hash === 2) {
    ctx.fillStyle = '#ffe999';
    ctx.fillRect(x + 20, y + 16, 2, 2);
  }
}

export function drawHotdogStandStructure(
  ctx: CanvasRenderingContext2D,
  time: number,
): void {
  // Compact, open-air Brazilian street hot-dog cart / barraca de rua!
  // Stands directly on the open sidewalk (cols 5..8, rows 4..5) with wheels,
  // steaming pots, visible ingredients, vendor in open air, and small striped canopy.
  // NO enclosed room, NO brick wall, NO indoor dining hall!
  const x = 5 * TILE_SIZE + 2;
  const y = 4 * TILE_SIZE;
  const w = 4 * TILE_SIZE - 4; // 124px compact street cart!
  const h = 2 * TILE_SIZE - 4;

  // Soft sidewalk shadow underneath cart & wheels
  ctx.fillStyle = 'rgba(20, 12, 8, 0.30)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, w * 0.54, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Slim vertical support poles holding the light open-air canopy (open air behind vendor!)
  ctx.fillStyle = '#768390';
  ctx.fillRect(x + 4, y - 16, 3, 44);
  ctx.fillRect(x + w - 7, y - 16, 3, 44);
  ctx.fillStyle = '#b4c0cc';
  ctx.fillRect(x + 5, y - 16, 1, 44);
  ctx.fillRect(x + w - 6, y - 16, 1, 44);

  // Friendly street vendor standing in open air behind the cart preparing hot dogs!
  drawVendorNpc(ctx, x + w * 0.5, y + 16, 'vendor', time);

  // Metal push-handle on the left side of the street cart
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 12, y + 25, 13, 4);
  ctx.fillRect(x - 13, y + 21, 4, 10);
  ctx.fillStyle = '#aeb9c4';
  ctx.fillRect(x - 11, y + 26, 11, 2);

  // Two classic street-cart rubber wheels + front support leg underneath!
  for (const wx of [x + 22, x + w - 22]) {
    ctx.fillStyle = '#1d1b1e';
    ctx.beginPath();
    ctx.arc(wx, y + h - 3, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#aeb9c4';
    ctx.beginPath();
    ctx.arc(wx, y + h - 3, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3b424c';
    ctx.fillRect(wx - 1, y + h - 4, 2, 2);
  }
  ctx.fillStyle = '#5c6670';
  ctx.fillRect(x + w / 2 - 2, y + h - 10, 4, 11);

  // Compact stainless-steel & red street cart body
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 1, y + 20, w + 2, 34);
  ctx.fillStyle = '#c83e37';
  ctx.fillRect(x + 1, y + 30, w - 2, 22);
  // Cream stripe & crisp street lettering on cart front
  ctx.fillStyle = '#fff3d6';
  ctx.fillRect(x + 6, y + 35, w - 12, 13);
  ctx.strokeStyle = '#8b241d';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 6.5, y + 35.5, w - 13, 12);
  ctx.fillStyle = '#9e241d';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CACHORRO-QUENTE', x + w / 2, y + 44);
  ctx.textAlign = 'left';

  // Gleaming open stainless-steel countertop with pots & ingredients!
  ctx.fillStyle = '#d4dde4';
  ctx.fillRect(x - 3, y + 19, w + 6, 12);
  ctx.fillStyle = '#f2f7fa';
  ctx.fillRect(x - 1, y + 20, w + 2, 3);

  // 1. Open steaming sausage & tomato sauce pot (panela fumegante)
  ctx.fillStyle = '#5c6670';
  ctx.fillRect(x + 5, y + 20, 26, 9);
  ctx.fillStyle = '#c63b2b';
  ctx.fillRect(x + 7, y + 21, 22, 7);
  ctx.fillStyle = '#e66e4e';
  ctx.fillRect(x + 9, y + 22, 8, 2);
  ctx.fillRect(x + 18, y + 24, 9, 2);
  // Animated rising steam wisps!
  for (let i = 0; i < 3; i++) {
    const sy = y + 16 - ((time * 15 + i * 7) % 16);
    const sx = x + 10 + i * 7 + Math.sin(time * 4 + i) * 1.8;
    ctx.fillStyle = 'rgba(255, 250, 236, 0.72)';
    ctx.fillRect(Math.round(sx), Math.round(sy), 3, 4);
  }

  // 2. Visible open ingredient bowls: Milho, Ervilha, Batata Palha, Vinagrete
  const bowls = [
    { ox: 35, col: '#f2c94c' },
    { ox: 48, col: '#5ca953' },
    { ox: 61, col: '#e8a84a' },
    { ox: 74, col: '#e85d52' },
  ];
  for (const b of bowls) {
    ctx.fillStyle = '#5c6670';
    ctx.fillRect(x + b.ox, y + 21, 11, 8);
    ctx.fillStyle = b.col;
    ctx.fillRect(x + b.ox + 1, y + 22, 9, 6);
  }

  // 3. Hot-dog bun being assembled + Ketchup, Mostarda & Maionese squeeze bottles
  ctx.fillStyle = '#e5a95c';
  ctx.fillRect(x + 88, y + 22, 11, 6);
  ctx.fillStyle = '#c83e37';
  ctx.fillRect(x + 89, y + 24, 9, 2);

  const bottles = [
    { ox: 102, col: '#d9382e' },
    { ox: 109, col: '#f2c138' },
    { ox: 116, col: '#f8f2df' },
  ];
  for (const b of bottles) {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + b.ox - 1, y + 14, 6, 12);
    ctx.fillStyle = b.col;
    ctx.fillRect(x + b.ox, y + 17, 4, 8);
    ctx.fillRect(x + b.ox + 1, y + 15, 2, 2);
  }

  // Small light red & cream striped open-air street canopy (toldinho de barraca)
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 6, y - 22, w + 12, 16);
  const stripeW = 14;
  const stripeCount = Math.ceil((w + 8) / stripeW);
  for (let i = 0; i < stripeCount; i++) {
    const sw = Math.min(stripeW, w + 8 - i * stripeW);
    ctx.fillStyle = i % 2 === 0 ? '#c83e37' : '#fff3db';
    ctx.fillRect(x - 4 + i * stripeW, y - 20, sw, 11);
    ctx.fillStyle = i % 2 === 0 ? '#a12d27' : '#e6d6b5';
    ctx.fillRect(x - 4 + i * stripeW, y - 9, sw, 3);
  }

  // Single warm hanging bare bulb under the little cart canopy (classic street-cart vibe!)
  const bulbGlow = 0.25 + 0.08 * Math.sin(time * 4.5);
  ctx.fillStyle = `rgba(255, 218, 120, ${bulbGlow.toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(x + w / 2, y - 1, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff5c4';
  ctx.fillRect(Math.round(x + w / 2) - 2, y - 4, 4, 4);

  // Cute small wooden sidewalk A-frame chalkboard beside the cart ("DOG NA HORA")
  const bx = x + w + 8;
  const by = y + 32;
  ctx.fillStyle = 'rgba(20, 12, 8, 0.22)';
  ctx.fillRect(bx + 1, by + 23, 22, 4);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bx, by, 22, 24);
  ctx.fillStyle = '#8b532c';
  ctx.fillRect(bx + 1, by + 1, 20, 22);
  ctx.fillStyle = '#24302a';
  ctx.fillRect(bx + 3, by + 3, 16, 15);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(bx + 5, by + 6, 12, 2);
  ctx.fillStyle = '#fff5dc';
  ctx.fillRect(bx + 6, by + 10, 10, 2);
  ctx.fillRect(bx + 5, by + 14, 11, 2);
}

export function drawPicnicTableProp(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // 2-tile wide outdoor wooden snack table with ketchup & mustard bottles
  ctx.fillStyle = 'rgba(24, 14, 8, 0.28)';
  ctx.fillRect(x + 4, y + 48, 56, 8);

  // Wooden benches
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x + 4, y + 6, 56, 10);
  ctx.fillRect(x + 4, y + 44, 56, 10);
  ctx.fillStyle = '#995c30';
  ctx.fillRect(x + 6, y + 8, 52, 6);
  ctx.fillRect(x + 6, y + 46, 52, 6);

  // Tabletop with red-checkered runner
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x + 2, y + 17, 60, 26);
  ctx.fillStyle = '#b9753f';
  ctx.fillRect(x + 4, y + 19, 56, 22);
  ctx.fillStyle = '#d94d43';
  ctx.fillRect(x + 22, y + 19, 20, 22);
  ctx.fillStyle = '#fff2db';
  for (let gy = 0; gy < 3; gy++) {
    ctx.fillRect(x + 24 + (gy % 2) * 8, y + 21 + gy * 7, 6, 5);
  }

  // Mini ketchup & mustard bottles on table
  ctx.fillStyle = '#d9382e';
  ctx.fillRect(x + 27, y + 23, 4, 8);
  ctx.fillStyle = '#f2c138';
  ctx.fillRect(x + 34, y + 23, 4, 8);
}

// ============================================================================
// MAP 3: LOCADORA DE VÍDEOS — ANOS 1990 (Indoor VHS Rental Store)
// ============================================================================
export function drawVideoStoreFloorTile(
  ctx: CanvasRenderingContext2D,
  kind: Stage3TileKind,
  col: number,
  row: number,
): void {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  if (kind === 'store_wall' || kind === 'store_tv') {
    // 1990s indoor video-store wall: cool cream-blue upper + royal teal lower wainscot
    ctx.fillStyle = row < 2 ? '#233052' : '#2f4570';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    if (row === 1) {
      // Classic 90s retro neon accent stripe along wall
      ctx.fillStyle = '#f2c14e';
      ctx.fillRect(x, y + 24, TILE_SIZE, 3);
      ctx.fillStyle = '#e25478';
      ctx.fillRect(x, y + 27, TILE_SIZE, 3);
    }
    return;
  }

  if (kind === 'glass_door') {
    // Entrance mat + glass double door threshold
    ctx.fillStyle = '#2d4063';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#5eb3d6';
    ctx.fillRect(x + 3, y + 4, TILE_SIZE - 6, TILE_SIZE - 8);
    ctx.fillStyle = '#c4eefc';
    ctx.fillRect(x + 6, y + 6, 6, TILE_SIZE - 12);
    return;
  }

  if (kind === 'store_carpet') {
    // Retro teal-blue carpeted aisle runner in front of VHS shelves
    ctx.fillStyle = '#2a5a75';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#336c8c';
    if ((col + row) % 2 === 0) {
      ctx.fillRect(x + 4, y + 4, 4, 4);
      ctx.fillRect(x + 20, y + 18, 4, 4);
    }
    return;
  }

  // Classic 1990s checkered rental-store floor tiles
  ctx.fillStyle = (col + row) % 2 === 0 ? '#dce4ee' : '#b7c7dc';
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = '#9db1cc';
  ctx.fillRect(x, y + TILE_SIZE - 1, TILE_SIZE, 1);
  ctx.fillRect(x + TILE_SIZE - 1, y, 1, TILE_SIZE);
}

export function drawVideoStoreInteriorHeader(
  ctx: CanvasRenderingContext2D,
  time: number,
): void {
  // Back wall colorful 1990s movie posters (no invented real titles!)
  const posters = [
    { col: 3, bg: '#d94b4b', accent: '#ffd166' },
    { col: 5, bg: '#3e84c4', accent: '#8ee3f5' },
    { col: 7, bg: '#68449c', accent: '#f78fb3' },
    { col: 15, bg: '#3b8c66', accent: '#ffe599' },
  ];
  for (const p of posters) {
    const px = p.col * TILE_SIZE + 4;
    const py = 12;
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(px - 2, py - 2, 28, 38);
    ctx.fillStyle = p.bg;
    ctx.fillRect(px, py, 24, 34);
    ctx.fillStyle = p.accent;
    ctx.fillRect(px + 3, py + 4, 18, 15);
    ctx.fillStyle = '#fff5dc';
    ctx.fillRect(px + 4, py + 23, 16, 3);
    ctx.fillRect(px + 6, py + 28, 12, 2);
  }

  // Center glowing 1990s Neon Sign: "VÍDEO LOCADORA · VHS"
  const sx = 9 * TILE_SIZE + 8;
  const sy = 14;
  const sw = 176;
  const flicker = 0.85 + 0.15 * Math.sin(time * 6);
  ctx.fillStyle = `rgba(94, 215, 255, ${(0.22 * flicker).toFixed(2)})`;
  ctx.fillRect(sx - 8, sy - 6, sw + 16, 46);

  ctx.fillStyle = '#151d38';
  ctx.fillRect(sx, sy, sw, 34);
  ctx.strokeStyle = '#5ee2ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(sx + 1, sy + 1, sw - 2, 32);

  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('★ VÍDEO LOCADORA ★', sx + sw / 2, sy + 14);
  ctx.fillStyle = '#7ceeff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('FITAS VHS · LANÇAMENTOS', sx + sw / 2, sy + 27);
  ctx.textAlign = 'left';

  // Mounted Store CRT Television & VCR unit (cols 18..20, row 1..2)
  const tvX = 18 * TILE_SIZE + 4;
  const tvY = 20;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(tvX - 2, tvY - 2, 74, 62);
  // Shelf cabinet
  ctx.fillStyle = '#3c4356';
  ctx.fillRect(tvX, tvY, 70, 58);
  // CRT Screen displaying animated colorful VHS preview scenes!
  const sceneIdx = Math.floor(time * 1.4) % 3;
  ctx.fillStyle = sceneIdx === 0 ? '#3a7bd5' : sceneIdx === 1 ? '#b84b6e' : '#3a8c6e';
  ctx.fillRect(tvX + 6, tvY + 5, 58, 32);
  // Animated moving figure/shapes inside TV preview
  const animX = tvX + 12 + Math.round(((time * 28) % 38));
  ctx.fillStyle = '#ffe599';
  ctx.fillRect(animX, tvY + 14, 12, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillRect(tvX + 6, tvY + 5 + Math.round((time * 24) % 28), 58, 2);
  // VCR Player directly beneath TV
  ctx.fillStyle = '#1d202b';
  ctx.fillRect(tvX + 8, tvY + 41, 54, 13);
  ctx.fillStyle = '#3f4759';
  ctx.fillRect(tvX + 12, tvY + 44, 24, 5); // VHS tape slot
  ctx.fillStyle = '#4ef29c'; // Green play LED
  ctx.fillRect(tvX + 42, tvY + 45, 4, 3);
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(tvX + 50, tvY + 45, 4, 3);
}

export function drawVideoStoreCounter(
  ctx: CanvasRenderingContext2D,
  time: number,
): void {
  // Service counter at cols 2..7, rows 3..4
  const x = 2 * TILE_SIZE;
  const y = 3 * TILE_SIZE;
  const w = 6 * TILE_SIZE;
  const h = 2 * TILE_SIZE;

  // Clerk behind counter
  drawVendorNpc(ctx, x + w * 0.52, y + 20, 'clerk', time);

  // Main counter desk
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x, y + 22, w, h - 22);
  ctx.fillStyle = '#2c5b8c';
  ctx.fillRect(x + 2, y + 32, w - 4, h - 34);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x + 2, y + 40, w - 4, 4);
  // Countertop
  ctx.fillStyle = '#e5cfa8';
  ctx.fillRect(x - 2, y + 22, w + 4, 11);
  ctx.fillStyle = '#f8ecd4';
  ctx.fillRect(x, y + 23, w, 3);

  // Retro CRT Checkout Computer on left of counter
  ctx.fillStyle = '#d4cbb8';
  ctx.fillRect(x + 14, y + 8, 26, 20);
  ctx.fillStyle = '#1c3b32';
  ctx.fillRect(x + 17, y + 11, 20, 12);
  ctx.fillStyle = '#5ee8a2';
  ctx.fillRect(x + 19, y + 13, 12, 2);
  ctx.fillRect(x + 19, y + 17, 15, 2);

  // VHS Rewinder + Stack of rented tapes
  ctx.fillStyle = '#242733';
  ctx.fillRect(x + 124, y + 18, 22, 10);
  ctx.fillStyle = '#e25478';
  ctx.fillRect(x + 150, y + 17, 16, 11);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x + 152, y + 20, 12, 4);

  // Classic 90s sign: "REBOBINE ANTES DE DEVOLVER"
  ctx.fillStyle = '#fff5dc';
  ctx.fillRect(x + 36, y + 47, 120, 12);
  ctx.fillStyle = '#1c2b4a';
  ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('REBOBINE A FITA VHS', x + 96, y + 55);
  ctx.textAlign = 'left';
}

export function drawVhsShelfUnit(
  ctx: CanvasRenderingContext2D,
  startCol: number,
  colSpan: number,
  row: number,
  genreLabel: string,
  palette: string[],
): void {
  const x = startCol * TILE_SIZE;
  const y = row * TILE_SIZE - 14;
  const w = colSpan * TILE_SIZE;
  const h = TILE_SIZE + 14;

  // Ground shadow
  ctx.fillStyle = 'rgba(18, 26, 46, 0.32)';
  ctx.fillRect(x + 3, y + h, w - 2, 6);

  // Tall wooden/blue VHS display rack
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 1, y, w + 2, h);
  ctx.fillStyle = '#25395c';
  ctx.fillRect(x + 1, y + 2, w - 2, h - 4);

  // Top genre header plaque
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x + 10, y - 9, w - 20, 11);
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 10, y - 9, w - 20, 11);
  ctx.fillStyle = '#24140d';
  ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(genreLabel, x + w / 2, y - 1);
  ctx.textAlign = 'left';

  // Two rich rows of colorful VHS movie covers!
  for (let shelfRow = 0; shelfRow < 2; shelfRow++) {
    const sy = y + 5 + shelfRow * 19;
    // Shelf lip
    ctx.fillStyle = '#18253d';
    ctx.fillRect(x + 3, sy + 14, w - 6, 3);

    const coverW = 11;
    const count = Math.floor((w - 10) / (coverW + 2));
    for (let i = 0; i < count; i++) {
      const cx = x + 6 + i * (coverW + 2);
      const col = palette[(i + shelfRow * 3) % palette.length];
      ctx.fillStyle = col;
      ctx.fillRect(cx, sy, coverW, 14);
      // Cover art mini-band & white title line
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(cx + 2, sy + 2, coverW - 4, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(cx + 1, sy + 6, coverW - 2, 5);
    }
  }
}

// ============================================================================
// MAP 4: SALA DE ESTAR — NOITE DE FILME EM CASA (Cozy Night Living Room)
// ============================================================================
export function drawLivingRoomFloorTile(
  ctx: CanvasRenderingContext2D,
  kind: Stage3TileKind,
  col: number,
  row: number,
): void {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  if (kind === 'home_wall' || kind === 'home_tv' || kind === 'bookshelf') {
    // Cozy warm cream/peach living room wall at night
    ctx.fillStyle = row < 2 ? '#6e5245' : '#866654';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    if (row === 2) {
      // Wooden baseboard
      ctx.fillStyle = '#4f3222';
      ctx.fillRect(x, y + TILE_SIZE - 5, TILE_SIZE, 5);
    }
    return;
  }

  if (kind === 'home_door') {
    // Warm wooden house entrance mat & door threshold
    ctx.fillStyle = '#6b4126';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#b97c47';
    ctx.fillRect(x + 4, y + 6, TILE_SIZE - 8, TILE_SIZE - 12);
    return;
  }

  if (kind === 'home_rug' || kind === 'coffee_table' || kind === 'home_sofa') {
    // Cozy continuous woven burgundy living-room carpet with stitched golden outer trim
    ctx.fillStyle = '#8b3e3d';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    // Soft woven horizontal fiber bands
    ctx.fillStyle = '#994643';
    for (let wy = 4; wy < TILE_SIZE; wy += 8) {
      ctx.fillRect(x, y + wy, TILE_SIZE, 3);
    }
    // Stitched golden trim along outer rug perimeter (cols 6..17, rows 5..10)
    ctx.fillStyle = '#d49a6a';
    if (row === 5) ctx.fillRect(x, y + 3, TILE_SIZE, 3);
    if (row === 10) ctx.fillRect(x, y + TILE_SIZE - 6, TILE_SIZE, 3);
    if (col === 6) ctx.fillRect(x + 3, y, 3, TILE_SIZE);
    if (col === 17) ctx.fillRect(x + TILE_SIZE - 6, y, 3, TILE_SIZE);
    return;
  }

  // Warm honey-wood living room plank flooring
  ctx.fillStyle = (col + row) % 2 === 0 ? '#9c683d' : '#946137';
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = '#7e502c';
  ctx.fillRect(x, y + 15, TILE_SIZE, 1);
  ctx.fillRect(x, y + 31, TILE_SIZE, 1);
  ctx.fillRect(x + ((row % 2) * 16), y, 1, 16);
}

export function drawLivingRoomWallAndTv(
  ctx: CanvasRenderingContext2D,
  time: number,
): void {
  // Two curtained night windows showing starry sky & crescent moon!
  for (const wCol of [4, 17]) {
    const wx = wCol * TILE_SIZE;
    const wy = 14;
    const ww = 3 * TILE_SIZE;
    const wh = 48;

    ctx.fillStyle = OUTLINE;
    ctx.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);
    // Deep starry night sky
    ctx.fillStyle = '#182442';
    ctx.fillRect(wx, wy, ww, wh);
    // Stars
    ctx.fillStyle = '#fff5cc';
    ctx.fillRect(wx + 18, wy + 12, 2, 2);
    ctx.fillRect(wx + 44, wy + 20, 2, 2);
    ctx.fillRect(wx + 66, wy + 10, 2, 2);
    if (wCol === 17) {
      // Crescent moon in right window
      ctx.fillStyle = '#ffe599';
      ctx.beginPath();
      ctx.arc(wx + 60, wy + 18, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#182442';
      ctx.beginPath();
      ctx.arc(wx + 63, wy + 16, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    // Window crossbars
    ctx.fillStyle = '#5c3722';
    ctx.fillRect(wx + ww / 2 - 1, wy, 3, wh);
    ctx.fillRect(wx, wy + wh / 2 - 1, ww, 3);
    // Warm cream curtains on both sides
    ctx.fillStyle = '#e8cfa6';
    ctx.fillRect(wx, wy, 14, wh);
    ctx.fillRect(wx + ww - 14, wy, 14, wh);
    ctx.fillStyle = '#c8aa7e';
    ctx.fillRect(wx + 5, wy, 3, wh);
    ctx.fillRect(wx + ww - 8, wy, 3, wh);
  }

  // Bookshelves (cols 2..3 and cols 20..21)
  for (const bCol of [2, 20]) {
    const bx = bCol * TILE_SIZE;
    const by = 40;
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(bx, by, 2 * TILE_SIZE, 56);
    ctx.fillStyle = '#6c3e22';
    ctx.fillRect(bx + 2, by + 2, 2 * TILE_SIZE - 4, 52);
    // Colorful books & VHS cases
    const cols = ['#d94b4b', '#4d88c4', '#f0b23a', '#4d9c6c', '#9c56a8'];
    for (let r = 0; r < 3; r++) {
      const sy = by + 6 + r * 16;
      ctx.fillStyle = '#4b2816';
      ctx.fillRect(bx + 4, sy + 11, 2 * TILE_SIZE - 8, 3);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = cols[(i + r * 2) % cols.length];
        ctx.fillRect(bx + 6 + i * 8, sy, 6, 11);
      }
    }
  }

  // CENTERPIECE: Wooden Entertainment Rack + 1990s CRT TV Playing Movie + VCR! (cols 10..13)
  const tx = 10 * TILE_SIZE;
  const ty = 26;
  const tw = 4 * TILE_SIZE;

  // Soft flickering light cone cast by the TV across the rug toward the sofa!
  const flicker = 0.14 + 0.05 * Math.sin(time * 9.5);
  const coneGrad = ctx.createLinearGradient(tx + tw / 2, ty + 48, tx + tw / 2, ty + 230);
  coneGrad.addColorStop(0, `rgba(148, 206, 255, ${(flicker + 0.12).toFixed(2)})`);
  coneGrad.addColorStop(1, 'rgba(148, 206, 255, 0)');
  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(tx + 18, ty + 44);
  ctx.lineTo(tx + tw - 18, ty + 44);
  ctx.lineTo(tx + tw + 68, ty + 230);
  ctx.lineTo(tx - 68, ty + 230);
  ctx.closePath();
  ctx.fill();

  // Wooden TV cabinet
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(tx + 4, ty + 36, tw - 8, 36);
  ctx.fillStyle = '#6b3e22';
  ctx.fillRect(tx + 6, ty + 38, tw - 12, 32);
  // VCR player inside cabinet shelf (playing rented VHS!)
  ctx.fillStyle = '#1b1d26';
  ctx.fillRect(tx + 24, ty + 46, tw - 48, 14);
  ctx.fillStyle = '#3a4152';
  ctx.fillRect(tx + 30, ty + 50, 34, 5);
  ctx.fillStyle = '#4ef29c'; // Green PLAY indicator!
  ctx.fillRect(tx + 72, ty + 51, 5, 3);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(tx + 82, ty + 51, 10, 3);

  // Retro 1990s CRT TV set on top of cabinet
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(tx + 16, ty - 8, tw - 32, 48);
  ctx.fillStyle = '#2d313d';
  ctx.fillRect(tx + 18, ty - 6, tw - 36, 44);

  // Glowing animated Movie Screen!
  const movieScene = Math.floor(time * 0.9) % 3;
  ctx.fillStyle = movieScene === 0 ? '#2b5f8f' : movieScene === 1 ? '#5e3c78' : '#2d705c';
  ctx.fillRect(tx + 24, ty, tw - 48, 32);
  // Moving movie action silhouettes & horizon inside screen
  ctx.fillStyle = movieScene === 0 ? '#ffd166' : movieScene === 1 ? '#ff9eb5' : '#a8f0c6';
  const actorX = tx + 32 + Math.round(Math.sin(time * 2.2) * 18 + 18);
  ctx.fillRect(actorX, ty + 11, 12, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(tx + 26, ty + 3, 24, 3);
  // Scanline shimmer
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(tx + 24, ty + Math.round((time * 22) % 30), tw - 48, 2);
}

export function drawLivingRoomCoffeeTableAndPopcorn(
  ctx: CanvasRenderingContext2D,
  time: number,
  popcornBounce = false,
): void {
  // Coffee table at cols 10..13, row 5 (x=320..448, y=160..192)
  const x = 10 * TILE_SIZE + 4;
  const y = 5 * TILE_SIZE + 4;
  const w = 4 * TILE_SIZE - 8;
  const h = TILE_SIZE - 6;

  ctx.fillStyle = 'rgba(20, 12, 8, 0.34)';
  ctx.fillRect(x + 4, y + h, w - 4, 6);

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = '#8b532c';
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = '#b47440';
  ctx.fillRect(x + 3, y + 3, w - 6, h - 8);

  // Soda cups & VHS case on table
  ctx.fillStyle = '#3c84c4';
  ctx.fillRect(x + 14, y + 7, 8, 11);
  ctx.fillStyle = '#fff5dc';
  ctx.fillRect(x + 15, y + 5, 6, 3);
  ctx.fillStyle = '#d94d4d';
  ctx.fillRect(x + w - 24, y + 7, 8, 11);
  ctx.fillStyle = '#fff5dc';
  ctx.fillRect(x + w - 23, y + 5, 6, 3);
  // Rented VHS case resting beside popcorn
  ctx.fillStyle = '#242938';
  ctx.fillRect(x + 28, y + 10, 16, 10);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x + 30, y + 12, 12, 5);

  // BIG SHARED BOWL OF BUTTERED POPCORN right in the center!
  const bx = Math.round(x + w / 2);
  const by = Math.round(y + 12);
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.ellipse(bx, by + 3, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e05347';
  ctx.beginPath();
  ctx.ellipse(bx, by + 3, 14, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff6d6';
  ctx.fillRect(bx - 12, by + 2, 24, 3);

  // Fluffy golden-white popcorn mound!
  const kernels = [
    [-8, -2], [-3, -5], [3, -5], [8, -2],
    [-6, 1], [0, -2], [6, 1], [0, 2],
  ];
  for (let i = 0; i < kernels.length; i++) {
    const [kx, ky] = kernels[i];
    const lift = popcornBounce && i === Math.floor(time * 4) % kernels.length ? -3 : 0;
    ctx.fillStyle = i % 2 === 0 ? '#fff5c4' : '#f7d872';
    ctx.beginPath();
    ctx.arc(bx + kx, by + ky + lift, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawLivingRoomSofa(ctx: CanvasRenderingContext2D): void {
  // Wide comfy 4-seater sofa at cols 9..14, rows 8..9
  const x = 9 * TILE_SIZE;
  const y = 8 * TILE_SIZE + 2;
  const w = 6 * TILE_SIZE;
  const h = 2 * TILE_SIZE - 8;

  ctx.fillStyle = 'rgba(20, 12, 8, 0.36)';
  ctx.fillRect(x + 4, y + h, w - 4, 8);

  // Sofa frame & cushioned seat (facing UP toward the TV!)
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 2, y, w + 4, h);

  // Seat cushions (upper/front half facing TV)
  ctx.fillStyle = '#9e433c';
  ctx.fillRect(x + 12, y + 4, w - 24, 24);
  ctx.fillStyle = '#b8534a';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 15 + i * 41, y + 6, 37, 20);
  }

  // Tall plush backrest (lower half so characters sit cozily inside!)
  ctx.fillStyle = '#7e2f2b';
  ctx.fillRect(x + 2, y + 26, w - 4, h - 28);
  ctx.fillStyle = '#993e38';
  ctx.fillRect(x + 10, y + 29, w - 20, h - 35);

  // Armrests on left & right
  ctx.fillStyle = '#8b3630';
  ctx.fillRect(x, y + 2, 13, h - 4);
  ctx.fillRect(x + w - 13, y + 2, 13, h - 4);
  ctx.fillStyle = '#ad4a42';
  ctx.fillRect(x + 2, y + 4, 9, h - 10);
  ctx.fillRect(x + w - 11, y + 4, 9, h - 10);

  // Cozy yellow/teal throw pillows at corners
  ctx.fillStyle = '#f2c14e';
  ctx.fillRect(x + 15, y + 16, 12, 10);
  ctx.fillStyle = '#5ca9a6';
  ctx.fillRect(x + w - 27, y + 16, 12, 10);
}

export function drawLivingRoomFloorLamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
): void {
  const glow = 0.24 + 0.05 * Math.sin(time * 2.5);
  ctx.fillStyle = `rgba(255, 206, 120, ${glow.toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(cx, cy - 12, 34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 2, cy - 12, 4, 22);
  ctx.fillRect(cx - 6, cy + 8, 12, 4);
  // Warm fabric lampshade
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 9, cy - 26, 18, 14);
  ctx.fillStyle = '#f7d88b';
  ctx.fillRect(cx - 7, cy - 24, 14, 10);
  ctx.fillStyle = '#fff5d4';
  ctx.fillRect(cx - 4, cy - 22, 8, 6);
}

export function drawLivingRoomPlant(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 7, cy - 2, 14, 12);
  ctx.fillStyle = '#b45c3c';
  ctx.fillRect(cx - 6, cy - 1, 12, 10);
  ctx.fillStyle = '#488844';
  ctx.beginPath();
  ctx.arc(cx, cy - 10, 9, 0, Math.PI * 2);
  ctx.arc(cx - 6, cy - 6, 6, 0, Math.PI * 2);
  ctx.arc(cx + 6, cy - 6, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6db35d';
  ctx.beginPath();
  ctx.arc(cx - 2, cy - 12, 5, 0, Math.PI * 2);
  ctx.fill();
}

// ============================================================================
// COUPLE PROXIMITY & HAND-HOLDING HELPERS (Laura & Léo, Grazi & Ariel)
// Preserves 100% of approved character sprites untouched!
// ============================================================================
export function drawLauraLeoWalkTogether(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  walkPhase: number,
  isWalking = true,
  dir: Direction = 'right',
  showHeart = false,
): void {
  const step = isWalking ? Math.sin(walkPhase) : 0;
  const bob = isWalking ? -Math.abs(step) * 1.1 : 0;
  const row = !isWalking ? 0 : dir === 'down' ? 0 : dir === 'up' ? 2 : 1;
  const column = isWalking ? (step > 0 ? 1 : 2) : 0;
  const walkSheet = getCharacterWalkSheetImage('lauraLeoCouple');

  if (walkSheet) {
    drawShadow(ctx, cx, cy + 9, 16.5, 4.4);
    const widthScale = row === 1 ? 1 : 0.72;
    if (
      drawWalkSheetFrame(ctx, walkSheet, row * 3 + column, cx, cy, 37.5, {
        bobY: bob,
        scaleX: widthScale,
      })
    ) {
      if (showHeart && Math.sin(walkPhase * 0.35) > 0.15) {
        drawMoodIcon(ctx, cx, cy - 56 + bob, 'heart');
      }
      return;
    }
  }

  const lauraX = cx - 14;
  const leoX = cx + 14;

  drawLauraSprite(ctx, lauraX, cy + bob, {
    dir: isWalking ? dir : 'right',
    isMoving: isWalking,
    walkPhase,
    dancePhase: walkPhase * 0.6,
  });
  drawLeoSprite(ctx, leoX, cy + bob * 0.85, {
    dir: isWalking ? dir : 'left',
    walkDist: isWalking ? walkPhase * 5.2 : 0,
    isMoving: isWalking,
    bobPhase: walkPhase * 0.5,
  });
  drawCoupleJoinedHands(ctx, lauraX, cy + bob, leoX, cy + bob * 0.85, false);

  if (showHeart && Math.sin(walkPhase * 0.35) > 0.15) {
    drawMoodIcon(ctx, cx, cy - 56 + bob, 'heart');
  }
}

export function drawMovingProposalCutsceneActors(
  ctx: CanvasRenderingContext2D,
  t: number,
): void {
  // Special golden-hour cutscene at the new house right after Moving Day:
  // Beat 1 (0..2.8s): Grazi & Ariel face each other on the veranda/walkway, stepping closer.
  // Beat 2 (2.8..5.8s): Ariel gently holds Grazi's hands and asks her to date again!
  // Beat 3 (5.8..8.8s): Grazi says yes & they share a warm embrace with floating hearts!
  const cx = 12.0 * TILE_SIZE;
  const cy = 5.45 * TILE_SIZE;

  // Soft golden-rose romantic light aura around the couple
  const auraR = t < 2.8 ? 42 : t < 5.8 ? 50 : 58;
  ctx.fillStyle = 'rgba(255, 198, 138, 0.20)';
  ctx.beginPath();
  ctx.arc(cx, cy - 20, auraR, 0, Math.PI * 2);
  ctx.fill();

  if (t < 2.8) {
    const p = Math.min(1, t / 2.2);
    const gap = 30 - p * 15;
      drawGraziSpriteAtCoupleScale(ctx, cx - gap, cy, {
      dir: 'right',
      isMoving: p < 0.95,
      walkPhase: t * 5.5,
      emotion: 'blush',
    });
    drawArielSprite(ctx, cx + gap, cy, {
      dir: 'left',
      isMoving: p < 0.95,
      walkPhase: t * 5.5 + 1.1,
      emotion: 'romantic',
    });
    if (t > 1.3) {
      drawMoodIcon(ctx, cx, cy - 58, 'smile');
    }
    return;
  }

  if (t < 5.8) {
    // Ariel takes Grazi's hands gently as he asks her to be his girlfriend again
    const breath = Math.sin((t - 2.8) * 3.0) * 0.5;
    const graziX = cx - 12.5;
    const arielX = cx + 12.5;
    drawGraziSpriteAtCoupleScale(ctx, graziX, cy + breath * 0.4, {
      dir: 'right',
      emotion: 'blush',
    });
    drawArielSprite(ctx, arielX, cy - breath * 0.3, {
      dir: 'left',
      emotion: 'romantic',
    });
    drawCoupleJoinedHands(ctx, graziX, cy, arielX, cy, true);

    const floatY = Math.sin(t * 4.5) * 2.2;
    drawMoodIcon(ctx, cx, cy - 58 + floatY, 'heart');
    return;
  }

  // Beat 3: "Sim, dessa vez pra ficar!" — warm loving embrace!
  const hugT = t - 5.8;
  drawSlowDanceCouple(ctx, cx, cy, hugT * 1.5, 0.25, hugT + 1.2);
  const floatY = Math.sin(t * 4.8) * 2.5;
  drawMoodIcon(ctx, cx, cy - 60 + floatY, 'heart');
}

// ============================================================================
// ANIMATED CUTSCENE ACTORS (Hot Dog Eating, Video Store Browsing, Sofa Movie Night)
// ============================================================================
export function drawHotdogEatingCutsceneActors(
  ctx: CanvasRenderingContext2D,
  t: number,
): void {
  // Both couples standing close outside on the sidewalk right in front of the street cart!
  // Couple 1: Ariel & Grazi | Couple 2: Laura & Léo side-by-side exchanging affectionate glances
  const baseY = 6.85 * TILE_SIZE;
  const chew1 = Math.abs(Math.sin(t * 7)) * -1.8;
  const chew2 = Math.abs(Math.sin(t * 7 + 1.5)) * -1.8;

  const positions = [
    { role: 'ariel', x: 4.85 * TILE_SIZE, y: baseY + chew1 },
    { role: 'grazi', x: 5.95 * TILE_SIZE, y: baseY + chew2 },
    { role: 'laura', x: 7.75 * TILE_SIZE, y: baseY + chew1 },
    { role: 'leo', x: 8.85 * TILE_SIZE, y: baseY + chew2 },
  ] as const;

  for (const p of positions) {
    if (p.role === 'ariel') {
      drawArielSprite(ctx, p.x, p.y, { dir: 'right', isMoving: false });
    } else if (p.role === 'grazi') {
      drawGraziSpriteAtCoupleScale(ctx, p.x, p.y, { dir: 'down', emotion: 'amused' });
    } else if (p.role === 'laura') {
      drawLauraSprite(ctx, p.x, p.y, { dir: 'right', dancePhase: t * 3 });
    } else {
      drawLeoSprite(ctx, p.x, p.y, { dir: 'left', bobPhase: t * 4 });
    }

    // Pixel hot dog held in hand moving gently up as they take a bite!
    const biteLift = Math.max(0, Math.sin(t * 4.5 + p.x * 0.05)) * 5;
    const hx = Math.round(p.x + (p.role === 'ariel' || p.role === 'laura' ? 10 : -10));
    const hy = Math.round(p.y - 17 - biteLift);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(hx - 7, hy - 4, 14, 7);
    ctx.fillStyle = '#e5a95c';
    ctx.fillRect(hx - 6, hy - 3, 12, 5);
    ctx.fillStyle = '#c83e37';
    ctx.fillRect(hx - 5, hy - 1, 10, 2);
    ctx.fillStyle = '#f5d047';
    ctx.fillRect(hx - 4, hy - 1, 8, 1);
  }

  // Cheerful floating icons (hotdog + warm couple heart between Laura & Léo!)
  if (Math.sin(t * 3) > -0.2) {
    drawMoodIcon(ctx, 5.4 * TILE_SIZE, baseY - 58, 'hotdog');
    drawMoodIcon(ctx, 8.3 * TILE_SIZE, baseY - 58, Math.sin(t * 1.8) > 0 ? 'heart' : 'smile');
  }
}

export function drawWrongHandCutsceneActors(
  ctx: CanvasRenderingContext2D,
  mode: 'videostore_wrong_hand_setup' | 'videostore_wrong_hand_wait' | 'videostore_wrong_hand_tell',
  t: number,
): void {
  // Positioned right in front of the colorful COMÉDIA VHS shelf (y = 7.75 * TILE_SIZE)
  // All four browsing close together! Ariel accidentally grabs Laura's hand while Grazi watches amused
  // and Léo stands right beside them (close group, no isolated character!).
  const baseY = 7.75 * TILE_SIZE;
  const lauraX = 7.95 * TILE_SIZE;
  const graziX = 9.25 * TILE_SIZE;
  const leoX = 10.45 * TILE_SIZE;

  const isRevealed =
    (mode === 'videostore_wrong_hand_wait' && t >= 3.0) ||
    (mode === 'videostore_wrong_hand_tell' && t >= 1.35);

  const handsJoined =
    (mode === 'videostore_wrong_hand_setup' && t >= 0.9) ||
    (mode === 'videostore_wrong_hand_wait' && t < 3.0) ||
    (mode === 'videostore_wrong_hand_tell' && t < 1.35);

  // Ariel approaches slightly during setup, then jumps backward startled when he realizes!
  let arielX = 6.65 * TILE_SIZE;
  let arielY = baseY;
  let arielDir: 'up' | 'right' = 'up';
  let arielMoving = false;

  if (mode === 'videostore_wrong_hand_setup' && t < 0.9) {
    const p = Math.min(1, t / 0.9);
    arielX = (5.8 + p * 0.85) * TILE_SIZE;
    arielDir = 'right';
    arielMoving = true;
  } else if (isRevealed) {
    const revealT = mode === 'videostore_wrong_hand_wait' ? t - 3.0 : t - 1.35;
    const recoil = Math.min(1, revealT / 0.35);
    const jump = revealT < 0.45 ? Math.sin((revealT / 0.45) * Math.PI) * -10 : 0;
    arielX = (6.65 - recoil * 0.65) * TILE_SIZE;
    arielY = baseY + jump;
    arielDir = 'right';
  }

  // Subtle amused giggle bounce for Laura & Grazi!
  const giggle = isRevealed
    ? Math.abs(Math.sin(t * 10)) * -2.8
    : handsJoined
      ? Math.abs(Math.sin(t * 5)) * -1.0
      : 0;

  const pairWalkSheet = handsJoined
    ? getCharacterWalkSheetImage('arielLauraCouple')
    : null;
  let pairSheetDrawn = false;
  if (pairWalkSheet) {
    const step = Math.sin(t * 7);
    const column = step > 0.35 ? 1 : step < -0.35 ? 2 : 0;
    const row = arielX <= lauraX ? 0 : 1;
    const pairX = (arielX + lauraX) / 2;
    const bob = -Math.abs(step) * 1.1 + giggle;
    drawShadow(ctx, pairX, baseY + 9.5, 18, 4.4);
    pairSheetDrawn = drawWalkSheetFrame(
      ctx,
      pairWalkSheet,
      row * 3 + column,
      pairX,
      baseY,
      36.5,
      { bobY: bob, scaleX: 1.15 },
    );
  }

  // Draw the composed pair while their hands are joined; otherwise use their individual sprites.
  if (!pairSheetDrawn) {
    drawArielSprite(ctx, arielX, arielY, {
      dir: arielDir,
      walkPhase: arielMoving ? t * 7 : 0,
      isMoving: arielMoving,
    });
  }

  // Embarrassed bright-pink blush cheeks on Ariel once he realizes!
  if (isRevealed) {
    ctx.fillStyle = 'rgba(255, 108, 136, 0.75)';
    ctx.fillRect(Math.round(arielX - 7), Math.round(arielY - 35), 4, 3);
    ctx.fillRect(Math.round(arielX + 3), Math.round(arielY - 35), 4, 3);
  }

  if (!pairSheetDrawn) {
    drawLauraSprite(ctx, lauraX, baseY + giggle, {
      dir: handsJoined || isRevealed ? 'right' : 'up',
      dancePhase: isRevealed ? t * 6.5 : handsJoined ? t * 1.5 : 0,
    });
  }

  drawGraziSpriteAtCoupleScale(ctx, graziX, baseY + (isRevealed ? giggle * 0.9 : 0), {
    dir: handsJoined || isRevealed ? 'left' : 'up',
    emotion: isRevealed ? 'amused' : handsJoined ? 'amused' : 'happy',
  });

  drawLeoSprite(ctx, leoX, baseY + 4 + (isRevealed ? giggle * 0.8 : 0), {
    dir: isRevealed ? 'left' : 'up',
    bobPhase: isRevealed ? t * 6 : t * 2,
  });

  // 2. Clear pixel-art CLASPED HANDS detail between Ariel & Laura while Ariel is oblivious!
  if (handsJoined && !pairSheetDrawn) {
    const hx = Math.round((arielX + lauraX) / 2);
    const hy = Math.round(baseY - 17);
    const pulse = 0.35 + 0.2 * Math.sin(t * 6);

    // Soft glowing comic focus halo around the accidentally joined hands!
    ctx.fillStyle = `rgba(255, 214, 102, ${pulse.toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(hx, hy, 12, 0, Math.PI * 2);
    ctx.fill();

    // Extended arms + clasped hands pixel detail
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(hx - 13, hy - 3, 26, 7);
    ctx.fillStyle = '#2d5ea8'; // Ariel sleeve edge
    ctx.fillRect(hx - 12, hy - 2, 7, 5);
    ctx.fillStyle = '#d98899'; // Laura vest/sleeve edge
    ctx.fillRect(hx + 5, hy - 2, 7, 5);
    ctx.fillStyle = '#e5aa80'; // Interlocked hands!
    ctx.fillRect(hx - 5, hy - 2, 10, 5);
    ctx.fillStyle = '#fff2d6';
    ctx.fillRect(hx - 1, hy - 1, 2, 2);
  }

  // 3. Expressive Comic Reaction Bubbles above heads!
  const drawComicTag = (cx: number, cy: number, text: string, bg: string, fg: string) => {
    ctx.font = 'bold 8px monospace';
    const tw = Math.max(18, Math.ceil(ctx.measureText(text).width) + 10);
    const bx = Math.round(cx - tw / 2);
    const by = Math.round(cy);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(bx - 1, by - 1, tw + 2, 15);
    ctx.fillStyle = bg;
    ctx.fillRect(bx, by, tw, 13);
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.fillText(text, Math.round(cx), by + 10);
    ctx.textAlign = 'left';
  };

  if (isRevealed) {
    // HUGE startled exclamation above Ariel + bursting laughter above Grazi, Laura & Léo!
    drawComicTag(arielX, arielY - 66, '!!', '#e03e3e', '#fff6d6');
    drawComicTag(lauraX, baseY - 64 + giggle, 'HAHA!', '#fff5dc', '#9e2e24');
    drawComicTag(graziX, baseY - 64 + giggle * 0.9, 'HAHA!', '#fff5dc', '#9e2e24');
    drawMoodIcon(ctx, leoX, baseY - 56, 'smile');
  } else if (handsJoined) {
    // Ariel cluelessly admiring VHS covers while Laura & Grazi exchange a hilarious secret look!
    drawMoodIcon(ctx, arielX, arielY - 58, 'vhs');
    if (mode === 'videostore_wrong_hand_tell') {
      drawComicTag(graziX, baseY - 64, 'EI, ARIEL...', '#fff5dc', '#8c281d');
      drawComicTag(lauraX, baseY - 64, '?!', '#fff5dc', '#8c281d');
    } else if (mode === 'videostore_wrong_hand_wait') {
      const dots = '.'.repeat(1 + (Math.floor(t * 2.5) % 3));
      drawComicTag(lauraX, baseY - 64, `HIHI${dots}`, '#fff5dc', '#9e2e24');
      drawComicTag(graziX, baseY - 64, `SHHH${dots}`, '#fff5dc', '#9e2e24');
    } else {
      drawComicTag(lauraX, baseY - 64, '?!', '#fff5dc', '#9e2e24');
      drawComicTag(graziX, baseY - 64, 'HIHI', '#fff5dc', '#9e2e24');
    }
  }
}

export function drawVideoStorePickingCutsceneActors(
  ctx: CanvasRenderingContext2D,
  t: number,
): void {
  // Phase 1 (0..3.6s): Both couples strolling side-by-side holding hands along the VHS shelves!
  // Phase 2 (3.6..6.8s): Bringing the chosen VHS tape to the service counter as two close couples!
  if (t < 3.6) {
    const p = t / 3.6;
    const walkX = (7.6 + p * 4.8) * TILE_SIZE;
    const walkY = 8.1 * TILE_SIZE;

    drawGraziArielWalkTogether(ctx, walkX - 15, walkY, t * 7, true, 'up');

    drawLauraSprite(ctx, walkX + 42, walkY, { dir: 'up', isMoving: true, walkPhase: t * 7, dancePhase: t * 4 });
    drawLeoSprite(ctx, walkX + 72, walkY + 1, { dir: 'up', walkDist: t * 28, isMoving: true });
    drawCoupleJoinedHands(ctx, walkX + 42, walkY, walkX + 72, walkY + 1);

    // Hold up a colorful VHS case they're checking out!
    const vhsX = Math.round(walkX + 6);
    const vhsY = Math.round(walkY - 22 - Math.abs(Math.sin(t * 5)) * 3);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(vhsX - 6, vhsY - 8, 12, 16);
    ctx.fillStyle = '#e85d52';
    ctx.fillRect(vhsX - 5, vhsY - 7, 10, 14);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(vhsX - 3, vhsY - 5, 6, 4);

    drawMoodIcon(ctx, walkX + 18, walkY - 58, 'vhs');
  } else {
    // At the checkout counter with the rented VHS tape (both couples close together!)
    const cy = 5.7 * TILE_SIZE;
    const hop = Math.abs(Math.sin(t * 6)) * -1.6;
    drawGraziArielWalkTogether(
      ctx,
      4.95 * TILE_SIZE,
      cy + hop * 0.85,
      t * 2,
      false,
      'up',
    );

    drawLauraSprite(ctx, 7.05 * TILE_SIZE, cy + hop, { dir: 'up', dancePhase: t * 4 });
    drawLeoSprite(ctx, 8.05 * TILE_SIZE, cy + hop * 0.8, { dir: 'up', bobPhase: t * 4 });
    drawCoupleJoinedHands(ctx, 7.05 * TILE_SIZE, cy + hop, 8.05 * TILE_SIZE, cy + hop * 0.8);
    drawMoodIcon(ctx, 6.25 * TILE_SIZE, cy - 58, 'smile');
  }
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(v: number): number {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
}

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function solveTwoBoneIK(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  l1: number,
  l2: number,
  bendSign: 1 | -1,
): { ex: number; ey: number; hx: number; hy: number } {
  const dx = tx - sx;
  const dy = ty - sy;
  const rawDist = Math.hypot(dx, dy);
  const maxReach = (l1 + l2) * 0.985;
  const minReach = Math.max(4, Math.abs(l1 - l2) + 2);
  const dist = Math.max(minReach, Math.min(maxReach, rawDist));

  const ux = rawDist > 0.001 ? dx / rawDist : 0;
  const uy = rawDist > 0.001 ? dy / rawDist : 1;
  const hx = sx + ux * dist;
  const hy = sy + uy * dist;

  const cosAngle = Math.max(-1, Math.min(1, (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist)));
  const angle = Math.acos(cosAngle);
  const baseAngle = Math.atan2(hy - sy, hx - sx);
  const elbowAngle = baseAngle + bendSign * angle;

  return {
    ex: sx + Math.cos(elbowAngle) * l1,
    ey: sy + Math.sin(elbowAngle) * l1,
    hx,
    hy,
  };
}

interface SofaSeatSpec {
  role: 'ariel' | 'grazi' | 'laura' | 'leo';
  seatX: number;
  fullH: number;
  upperFrac: number;
  reachSide: 1 | -1; // +1 reaches right toward center bowl, -1 reaches left
  cycleOffset: number;
  cyclePeriod: number;
  maxLeanX: number;
  maxLeanY: number;
  sleeveColor: string;
  sleeveHighlight: string;
  hasJacketStripe?: boolean;
  skinColor: string;
  skinShade: string;
  hasGoldWatch?: boolean;
  pantsBase: string;
  pantsHighlight: string;
  pantsShade: string;
  isCamoSkirt?: boolean;
  coupleLeanDir: 1 | -1;
}

interface PopcornAnimState {
  phase: 'idle' | 'reach' | 'scoop' | 'lift' | 'eat' | 'return';
  armActive: number; // 0 = resting naturally, 1 = actively reaching/eating
  leanX: number;
  leanY: number;
  handX: number;
  handY: number;
  fingersCupped: boolean;
  holdingPopcorn: boolean;
  popcornScale: number;
  scoopingInBowl: boolean;
  chewBeat: number; // 0..1 chewing intensity
  laughBounce: number;
  glanceDir: number; // -1 left, 0 TV, +1 right
  mouthOpen: number;
}

function evaluatePopcornState(
  spec: SofaSeatSpec,
  t: number,
  restX: number,
  restY: number,
  bowlTargetX: number,
  bowlTargetY: number,
  mouthX: number,
  mouthY: number,
): PopcornAnimState {
  // Clean non-overlapping staggered timeline per character (only 1 reaches at a time!)
  const localT = (t + spec.cyclePeriod - (spec.cycleOffset % spec.cyclePeriod)) % spec.cyclePeriod;

  // 6 fluid keyframed phases over 2.95s, followed by relaxed TV watching / laughing / couple glances
  const T_REACH = 0.56;
  const T_SCOOP = 0.96;
  const T_LIFT = 1.56;
  const T_POP = 1.82;
  const T_CHEW = 2.52;
  const T_RETURN = 2.98;

  const isOuterSeat = spec.role === 'ariel' || spec.role === 'leo';

  // Gentle organic TV watching, laughing, and couple-glancing variations when not eating
  const idleLaughWave = Math.sin(t * 2.0 + spec.cycleOffset * 1.7);
  const isLaughing = localT >= T_RETURN && idleLaughWave > 0.64;
  const laughBounce = isLaughing ? Math.abs(Math.sin(t * 9.0 + spec.cycleOffset)) * -1.8 : 0;

  const glanceWave = Math.sin(t * 0.9 + spec.cycleOffset * 2.1);
  const glanceDir = localT >= T_RETURN && glanceWave > 0.56 ? spec.coupleLeanDir : 0;

  if (localT < T_REACH) {
    // Phase 1: Lean gently forward & extend arm smoothly over the tabletop toward the popcorn bowl
    const p = smoothstep(localT / T_REACH);
    // Outer seats arc slightly higher so the reaching hand glides cleanly above neighbors' crowns
    const arcLift = Math.sin(p * Math.PI) * (isOuterSeat ? -16 : -8);
    return {
      phase: 'reach',
      armActive: smoothstep(localT / 0.18),
      leanX: spec.maxLeanX * p,
      leanY: spec.maxLeanY * p,
      handX: lerpNum(restX, bowlTargetX, p),
      handY: lerpNum(restY, bowlTargetY - 4, p) + arcLift,
      fingersCupped: p > 0.72,
      holdingPopcorn: false,
      popcornScale: 0,
      scoopingInBowl: false,
      chewBeat: 0,
      laughBounce: 0,
      glanceDir: 0,
      mouthOpen: 0,
    };
  }

  if (localT < T_SCOOP) {
    // Phase 2: Dip hand gently into the heaped popcorn & scoop a portion cleanly
    const p = (localT - T_REACH) / (T_SCOOP - T_REACH);
    const dip = Math.sin(p * Math.PI) * 5;
    const wiggle = Math.sin(p * Math.PI * 2) * 1.8;
    return {
      phase: 'scoop',
      armActive: 1,
      leanX: spec.maxLeanX,
      leanY: spec.maxLeanY,
      handX: bowlTargetX + wiggle,
      handY: bowlTargetY - 2 + dip,
      fingersCupped: true,
      holdingPopcorn: p >= 0.4,
      popcornScale: p >= 0.4 ? smoothstep((p - 0.4) / 0.35) : 0,
      scoopingInBowl: true,
      chewBeat: 0,
      laughBounce: 0,
      glanceDir: 0,
      mouthOpen: 0,
    };
  }

  if (localT < T_LIFT) {
    // Phase 3: Sit back upright while smoothly bringing the held popcorn directly to the mouth
    const p = smoothstep((localT - T_SCOOP) / (T_LIFT - T_SCOOP));
    const leanBack = 1 - p;
    const arcLift = Math.sin(p * Math.PI) * (isOuterSeat ? -14 : -7);
    return {
      phase: 'lift',
      armActive: 1,
      leanX: spec.maxLeanX * leanBack,
      leanY: spec.maxLeanY * leanBack,
      handX: lerpNum(bowlTargetX, mouthX, p),
      handY: lerpNum(bowlTargetY - 2, mouthY + 2, p) + arcLift,
      fingersCupped: true,
      holdingPopcorn: true,
      popcornScale: 1,
      scoopingInBowl: false,
      chewBeat: 0,
      laughBounce: 0,
      glanceDir: 0,
      mouthOpen: p > 0.7 ? smoothstep((p - 0.7) / 0.3) : 0,
    };
  }

  if (localT < T_POP) {
    // Phase 4a: Pop popcorn into the mouth
    const p = smoothstep((localT - T_LIFT) / (T_POP - T_LIFT));
    return {
      phase: 'eat',
      armActive: 1,
      leanX: 0,
      leanY: -p * 1.0,
      handX: mouthX + spec.reachSide * (1 - p) * 2.0,
      handY: mouthY + 1.5 - p * 2.0,
      fingersCupped: p < 0.6,
      holdingPopcorn: p < 0.55,
      popcornScale: Math.max(0, 1 - p * 1.85),
      scoopingInBowl: false,
      chewBeat: p > 0.55 ? 0.35 : 0,
      laughBounce: 0,
      glanceDir: 0,
      mouthOpen: 1 - p * 0.75,
    };
  }

  if (localT < T_CHEW) {
    // Phase 4b: Smoothly lower hand toward lap while chewing naturally in 3 crisp beats
    const p = (localT - T_POP) / (T_CHEW - T_POP);
    const armLower = smoothstep(Math.min(1, p * 1.35));
    const chewOsc = 0.5 + 0.5 * Math.sin(p * Math.PI * 6);
    const midRestX = lerpNum(mouthX + spec.reachSide * 4, restX, armLower * 0.78);
    const midRestY = lerpNum(mouthY + 6, restY, armLower * 0.78);
    return {
      phase: 'eat',
      armActive: 1,
      leanX: 0,
      leanY: 0,
      handX: midRestX,
      handY: midRestY,
      fingersCupped: false,
      holdingPopcorn: false,
      popcornScale: 0,
      scoopingInBowl: false,
      chewBeat: chewOsc,
      laughBounce: 0,
      glanceDir: 0,
      mouthOpen: 0,
    };
  }

  if (localT < T_RETURN) {
    // Phase 5: Ease hand gently back into natural resting pose
    const p = smoothstep((localT - T_CHEW) / (T_RETURN - T_CHEW));
    const startX = lerpNum(mouthX + spec.reachSide * 4, restX, 0.78);
    const startY = lerpNum(mouthY + 6, restY, 0.78);
    return {
      phase: 'return',
      armActive: 1 - smoothstep(Math.max(0, (p - 0.45) / 0.55)),
      leanX: 0,
      leanY: 0,
      handX: lerpNum(startX, restX, p),
      handY: lerpNum(startY, restY, p),
      fingersCupped: false,
      holdingPopcorn: false,
      popcornScale: 0,
      scoopingInBowl: false,
      chewBeat: 0,
      laughBounce: 0,
      glanceDir: 0,
      mouthOpen: 0,
    };
  }

  // Phase 6: Relaxed watching TV / laughing / exchanging couple glances
  return {
    phase: 'idle',
    armActive: 0,
    leanX: glanceDir * 2.0,
    leanY: 0,
    handX: restX,
    handY: restY,
    fingersCupped: false,
    holdingPopcorn: false,
    popcornScale: 0,
    scoopingInBowl: false,
    chewBeat: 0,
    laughBounce,
    glanceDir,
    mouthOpen: 0,
  };
}

function drawPopcornCluster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
): void {
  if (scale <= 0.08) return;
  const px = Math.round(x);
  const py = Math.round(y);
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(scale, scale);

  // Crisp pixel-art 3-kernel buttered popcorn cluster
  ctx.fillStyle = '#2b160d';
  ctx.fillRect(-5, -2, 10, 6);
  ctx.fillRect(-3, -5, 6, 9);

  ctx.fillStyle = '#e8b647';
  ctx.fillRect(-4, -1, 8, 4);
  ctx.fillRect(-2, -4, 4, 7);

  ctx.fillStyle = '#fff6cc';
  ctx.fillRect(-4, -2, 3, 3);
  ctx.fillRect(1, -2, 3, 2);
  ctx.fillRect(-1, -4, 3, 3);

  ctx.restore();
}

function drawSharedPopcornBowl(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rustle: number,
  time: number,
  mapBackdrop: HTMLImageElement | null,
): void {
  if (mapBackdrop && mapBackdrop.naturalWidth > 0 && mapBackdrop.naturalHeight > 0) {
    // Seamlessly clone actual high-res rug + tabletop border + wooden planks directly from
    // the clean right side of the room artwork to erase the legacy left-shifted static bowl
    // with ZERO visible patch seams!
    const imgW = mapBackdrop.naturalWidth;
    const imgH = mapBackdrop.naturalHeight;
    const sxScale = imgW / (MAP_COLS * TILE_SIZE);
    const syScale = imgH / (MAP_ROWS * TILE_SIZE);

    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    // 1. Clean rug strip + top coffee table border (y: 204..228, x: 334..382) cloned from clean center-right (x: 378..426)
    ctx.drawImage(
      mapBackdrop,
      380 * sxScale,
      204 * syScale,
      46 * sxScale,
      25 * syScale,
      334,
      204,
      46,
      25,
    );
    // 2. Clean wooden coffee-table surface (y: 229..254, x: 334..380) cloned from the clean front tabletop strip (y: 254..274)
    ctx.drawImage(
      mapBackdrop,
      338 * sxScale,
      255 * syScale,
      44 * sxScale,
      18 * syScale,
      334,
      228,
      46,
      15,
    );
    ctx.drawImage(
      mapBackdrop,
      338 * sxScale,
      255 * syScale,
      44 * sxScale,
      16 * syScale,
      334,
      241,
      46,
      14,
    );

    ctx.imageSmoothingEnabled = prevSmooth;
  }

  const bx = Math.round(cx);
  const by = Math.round(cy);
  const jiggleX = rustle > 0 ? Math.round(Math.sin(time * 28) * rustle * 1.4) : 0;

  // Soft contact shadow on the wooden coffee table
  ctx.fillStyle = 'rgba(34, 16, 8, 0.34)';
  ctx.beginPath();
  ctx.ellipse(bx, by + 13, 21, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back rim interior
  ctx.fillStyle = '#2b160d';
  ctx.beginPath();
  ctx.ellipse(bx + jiggleX, by - 5, 20, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Heaped golden-buttered popcorn mound (kernels visibly jiggle when scooped!)
  const kernels = [
    { ox: -12, oy: -8, r: 4.3 },
    { ox: -6, oy: -12, r: 4.7 },
    { ox: 0, oy: -14, r: 4.9 },
    { ox: 7, oy: -12, r: 4.6 },
    { ox: 12, oy: -8, r: 4.2 },
    { ox: -9, oy: -5, r: 4.1 },
    { ox: -2, oy: -7, r: 4.5 },
    { ox: 5, oy: -6, r: 4.4 },
    { ox: 10, oy: -4, r: 3.9 },
  ];

  ctx.fillStyle = '#2b160d';
  for (let i = 0; i < kernels.length; i++) {
    const k = kernels[i];
    const dy = rustle > 0 ? Math.sin(time * 26 + i * 1.7) * rustle * 1.7 : 0;
    ctx.beginPath();
    ctx.arc(bx + k.ox + jiggleX, by + k.oy + dy, k.r + 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#e8b647';
  for (let i = 0; i < kernels.length; i++) {
    const k = kernels[i];
    const dy = rustle > 0 ? Math.sin(time * 26 + i * 1.7) * rustle * 1.7 : 0;
    ctx.beginPath();
    ctx.arc(bx + k.ox + jiggleX, by + k.oy + dy + 0.6, k.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff5c8';
  for (let i = 0; i < kernels.length; i++) {
    const k = kernels[i];
    const dy = rustle > 0 ? Math.sin(time * 26 + i * 1.7) * rustle * 1.7 : 0;
    ctx.beginPath();
    ctx.arc(bx + k.ox + jiggleX - 0.8, by + k.oy + dy - 0.8, k.r * 0.66, 0, Math.PI * 2);
    ctx.fill();
  }

  // Striped red-and-white popcorn bowl matching the room's Stardew pixel palette
  ctx.fillStyle = '#2b160d';
  ctx.beginPath();
  ctx.moveTo(bx - 19 + jiggleX, by - 4);
  ctx.lineTo(bx + 19 + jiggleX, by - 4);
  ctx.lineTo(bx + 14 + jiggleX, by + 13);
  ctx.lineTo(bx - 14 + jiggleX, by + 13);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(bx - 17 + jiggleX, by - 2.5);
  ctx.lineTo(bx + 17 + jiggleX, by - 2.5);
  ctx.lineTo(bx + 12.5 + jiggleX, by + 11.5);
  ctx.lineTo(bx - 12.5 + jiggleX, by + 11.5);
  ctx.closePath();
  ctx.clip();

  ctx.fillStyle = '#fff5e4';
  ctx.fillRect(bx - 19 + jiggleX, by - 4, 38, 17);
  ctx.fillStyle = '#d13b36';
  for (const sx of [-15, -6, 3, 12]) {
    ctx.fillRect(bx + sx + jiggleX, by - 4, 4.5, 17);
  }
  ctx.fillStyle = 'rgba(43, 22, 13, 0.22)';
  ctx.fillRect(bx - 19 + jiggleX, by + 7.5, 38, 5);
  ctx.restore();

  ctx.fillStyle = '#fff8ea';
  ctx.fillRect(bx - 17 + jiggleX, by - 3.5, 34, 2);
}

function drawSeatedLowerBody(
  ctx: CanvasRenderingContext2D,
  spec: SofaSeatSpec,
  cx: number,
  hipY: number,
  leanX: number,
): void {
  // Hips track subtly with torso lean so the seated body stays 100% connected (never detached!)
  const bx = Math.round(cx + leanX * 0.45);
  const by = Math.round(hipY);

  // Warm burgundy cushion indentation shadow directly beneath seated hips
  ctx.fillStyle = 'rgba(42, 14, 14, 0.40)';
  ctx.beginPath();
  ctx.ellipse(bx, by + 8, 22, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (spec.isCamoSkirt) {
    // Grazi seated: connected olive camo skirt draped across her lap + natural seated knees
    ctx.fillStyle = '#24130c';
    ctx.fillRect(bx - 16, by - 5, 32, 13);
    ctx.fillRect(bx - 14, by - 6, 28, 15);

    ctx.fillStyle = spec.pantsBase;
    ctx.fillRect(bx - 14, by - 4, 28, 11);

    ctx.fillStyle = spec.pantsShade;
    ctx.fillRect(bx - 12, by - 2, 6, 4);
    ctx.fillRect(bx + 3, by + 1, 7, 4);
    ctx.fillStyle = spec.pantsHighlight;
    ctx.fillRect(bx - 3, by - 3, 6, 3);
    ctx.fillRect(bx - 9, by + 2, 5, 3);

    // Connected knees resting softly on the sofa cushion
    for (const kx of [-7, 7]) {
      ctx.fillStyle = '#24130c';
      ctx.fillRect(bx + kx - 5, by + 5, 10, 6);
      ctx.fillStyle = spec.skinColor;
      ctx.fillRect(bx + kx - 4, by + 6, 8, 4);
      ctx.fillStyle = spec.skinShade;
      ctx.fillRect(bx + kx - 4, by + 9, 8, 1);
    }
    return;
  }

  // Ariel, Laura & Léo seated: connected waist-to-knee seated lap (single cohesive pixel silhouette!)
  ctx.fillStyle = '#24130c';
  ctx.fillRect(bx - 17, by - 5, 34, 15);
  ctx.fillRect(bx - 15, by - 6, 30, 17);

  ctx.fillStyle = spec.pantsBase;
  ctx.fillRect(bx - 15, by - 4, 30, 13);
  ctx.fillRect(bx - 14, by + 8, 12, 2);
  ctx.fillRect(bx + 2, by + 8, 12, 2);

  // Center thigh seam line
  ctx.fillStyle = spec.pantsShade;
  ctx.fillRect(bx - 1, by - 2, 2, 12);
  ctx.fillRect(bx - 15, by + 6, 30, 3);

  // Soft top-thigh knee highlights catching the TV light
  ctx.fillStyle = spec.pantsHighlight;
  ctx.fillRect(bx - 12, by - 2, 8, 4);
  ctx.fillRect(bx + 4, by - 2, 8, 4);
}

function drawPixelLimbSegment(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  innerRadius: number,
  fill: string,
  highlight?: string,
): void {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(2, Math.ceil(dist / 1.5));
  const outHalf = Math.round(innerRadius + 1.3);
  const inHalf = Math.max(1.5, innerRadius);

  // Pass 1: Crisp 1px-snapped dark Stardew outline
  ctx.fillStyle = '#24130c';
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const rx = Math.round(lerpNum(x1, x2, p));
    const ry = Math.round(lerpNum(y1, y2, p));
    ctx.fillRect(rx - outHalf, ry - outHalf, outHalf * 2, outHalf * 2);
  }

  // Pass 2: Base sleeve / skin tone fill
  ctx.fillStyle = fill;
  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    const rx = Math.round(lerpNum(x1, x2, p));
    const ry = Math.round(lerpNum(y1, y2, p));
    ctx.fillRect(rx - Math.round(inHalf), ry - Math.round(inHalf), Math.round(inHalf * 2), Math.round(inHalf * 2));
  }

  // Pass 3: Subtle pixel highlight ridge (or Ariel's jacket white stripe!)
  if (highlight) {
    ctx.fillStyle = highlight;
    for (let i = 0; i <= steps; i++) {
      const p = i / steps;
      const rx = Math.round(lerpNum(x1, x2, p));
      const ry = Math.round(lerpNum(y1, y2, p)) - 1;
      ctx.fillRect(rx - 1, ry - 1, 2, 2);
    }
  }
}

function drawArticulatedSeatedArm(
  ctx: CanvasRenderingContext2D,
  spec: SofaSeatSpec,
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  hx: number,
  hy: number,
  fingersCupped: boolean,
  holdingPopcorn: boolean,
  popcornScale: number,
): void {
  const isLongSleeve = spec.role === 'ariel';

  if (isLongSleeve) {
    // Ariel's crisp pixel-art blue-and-white striped jacket sleeve (proportional width!)
    drawPixelLimbSegment(ctx, sx, sy, ex, ey, 3.0, spec.sleeveColor, spec.sleeveHighlight);
    drawPixelLimbSegment(ctx, ex, ey, hx, hy, 2.5, spec.sleeveColor, spec.sleeveHighlight);
    // Crisp dark cuff right before the wrist
    const wx = Math.round(lerpNum(ex, hx, 0.85));
    const wy = Math.round(lerpNum(ey, hy, 0.85));
    ctx.fillStyle = '#24130c';
    ctx.fillRect(wx - 3, wy - 3, 6, 6);
    ctx.fillStyle = '#1b4a9c';
    ctx.fillRect(wx - 2, wy - 2, 4, 4);
  } else {
    // Short sleeve on upper arm + anatomically slender pixel-art skin forearm!
    const sleeveEndX = lerpNum(sx, ex, 0.56);
    const sleeveEndY = lerpNum(sy, ey, 0.56);
    drawPixelLimbSegment(ctx, sleeveEndX, sleeveEndY, ex, ey, 2.1, spec.skinColor);
    drawPixelLimbSegment(ctx, ex, ey, hx, hy, 1.9, spec.skinColor);
    drawPixelLimbSegment(ctx, sx, sy, sleeveEndX, sleeveEndY, 2.9, spec.sleeveColor, spec.sleeveHighlight);

    // Grazi's signature gold wristwatch on her reaching wrist!
    if (spec.hasGoldWatch) {
      const wx = Math.round(lerpNum(ex, hx, 0.8));
      const wy = Math.round(lerpNum(ey, hy, 0.8));
      ctx.fillStyle = '#24130c';
      ctx.fillRect(wx - 3, wy - 3, 6, 6);
      ctx.fillStyle = '#e5b243';
      ctx.fillRect(wx - 2, wy - 2, 4, 4);
      ctx.fillStyle = '#fff5cc';
      ctx.fillRect(wx - 1, wy - 1, 2, 2);
    }
  }

  // Crisp pixel-art hand (open fingers when reaching; cupped when scooping/holding popcorn!)
  const rx = Math.round(hx);
  const ry = Math.round(hy);
  ctx.fillStyle = '#24130c';
  ctx.fillRect(rx - 3, ry - 3, 6, 6);
  ctx.fillStyle = spec.skinColor;
  ctx.fillRect(rx - 2, ry - 2, 4, 4);
  if (!fingersCupped) {
    const angle = Math.atan2(hy - ey, hx - ex);
    const fx = Math.round(Math.cos(angle) * 2.5);
    const fy = Math.round(Math.sin(angle) * 2.5);
    ctx.fillStyle = '#24130c';
    ctx.fillRect(rx + fx - 2, ry + fy - 2, 4, 4);
    ctx.fillStyle = spec.skinColor;
    ctx.fillRect(rx + fx - 1, ry + fy - 1, 2, 2);
  }

  // Popcorn cluster held directly inside the fingers — moves 1:1 with hand!
  if (holdingPopcorn && popcornScale > 0.05) {
    drawPopcornCluster(ctx, rx, ry - 3, popcornScale);
  }
}

function drawSeatedApprovedUpperBody(
  ctx: CanvasRenderingContext2D,
  spec: SofaSeatSpec,
  cx: number,
  hipY: number,
  anim: PopcornAnimState,
  t: number,
): void {
  const backSheet = getCharacterWalkSheetImage(
    spec.role === 'laura' ? 'lauraBack' : spec.role,
  );
  const backFrame = backSheet ? getWalkSheetFrameBounds(backSheet)?.[6] : null;

  const torsoX = cx + anim.leanX;
  const breath = Math.sin(t * 2.4 + spec.cycleOffset * 1.4) * 0.65;
  const chewNod = anim.chewBeat * 1.2;
  const torsoY = hipY + anim.leanY + anim.laughBounce + breath + chewNod;
  const tiltRad =
    anim.leanX * 0.008 + (anim.glanceDir !== 0 ? anim.glanceDir * 0.04 : 0);

  if (backSheet && backFrame) {
    const fullH = spec.fullH;
    const upperDrawH = fullH * spec.upperFrac;
    const upperSrcH =
      spec.role === 'laura'
        ? backFrame.height
        : Math.round(backFrame.height * spec.upperFrac);
    const fullW = (upperDrawH * backFrame.width) / Math.max(1, upperSrcH);

    const prevSmooth = ctx.imageSmoothingEnabled;
    const prevQuality = ctx.imageSmoothingQuality;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(torsoX, torsoY);
    if (Math.abs(tiltRad) > 0.002) {
      ctx.rotate(tiltRad);
    }

    const chewScaleY = 1 - anim.chewBeat * 0.022;
    const chewScaleX = 1 + anim.chewBeat * 0.015;
    ctx.scale(chewScaleX, chewScaleY);

    if (anim.armActive > 0.06) {
      // Surgical clip: keep 100% of head, hair, face, and opposite arm intact, while cleanly
      // hiding ONLY the lower hanging arm on the active reaching side so ZERO double-arm appears!
      const hairClearY = -upperDrawH + fullH * 0.37;
      const cutInnerX = spec.reachSide > 0 ? fullW * 0.20 : -fullW * 0.20;
      ctx.beginPath();
      ctx.rect(-fullW * 0.56, -upperDrawH - 4, fullW * 1.12, hairClearY - (-upperDrawH - 4));
      if (spec.reachSide > 0) {
        ctx.rect(-fullW * 0.56, hairClearY, cutInnerX - -fullW * 0.56, upperDrawH + 8);
      } else {
        ctx.rect(cutInnerX, hairClearY, fullW * 0.56 - cutInnerX, upperDrawH + 8);
      }
      ctx.clip();
    }

    ctx.drawImage(
      backSheet,
      backFrame.x,
      backFrame.y,
      backFrame.width,
      upperSrcH,
      -fullW / 2,
      -upperDrawH + 3,
      fullW,
      upperDrawH,
    );

    ctx.restore();
    ctx.imageSmoothingEnabled = prevSmooth;
    ctx.imageSmoothingQuality = prevQuality;
    return;
  }

  // Fallback while skins are loading
  if (spec.role === 'ariel') {
    drawArielSprite(ctx, torsoX, torsoY + 18, { dir: 'up', isMoving: false });
  } else if (spec.role === 'grazi') {
    drawGraziSprite(ctx, torsoX, torsoY + 18, { dir: 'up', emotion: 'amused' });
  } else if (spec.role === 'laura') {
    drawLauraSprite(ctx, torsoX, torsoY + 18, { dir: 'up', dancePhase: t * 2 });
  } else {
    drawLeoSprite(ctx, torsoX, torsoY + 18, { dir: 'up', bobPhase: t * 2 });
  }
}

export function drawMovieNightSofaActors(
  ctx: CanvasRenderingContext2D,
  t: number,
  mapBackdrop: HTMLImageElement | null = null,
): void {
  const hasHighResBackdrop = Boolean(mapBackdrop);
  // True Stardew-Valley-proportion 4-person sofa seating:
  // Characters sit solidly IN the burgundy sofa cushions (hipY = 10.95 tiles), occupying ~92% of
  // the sofa width naturally as two couples (Ariel + Grazi left, Laura + Léo right), taking clean
  // non-overlapping turns reaching into the centered popcorn bowl, eating, chewing & laughing!
  const hipY = hasHighResBackdrop ? 10.92 * TILE_SIZE : 8.55 * TILE_SIZE;
  const bowlX = 12.0 * TILE_SIZE;
  const bowlY = hasHighResBackdrop ? 8.05 * TILE_SIZE : 5.75 * TILE_SIZE;
  const scaleFactor = hasHighResBackdrop ? 1.0 : 0.74;

  const specs: SofaSeatSpec[] = [
    {
      role: 'ariel',
      seatX: hasHighResBackdrop ? 9.42 * TILE_SIZE : 9.85 * TILE_SIZE,
      fullH: 126 * scaleFactor,
      upperFrac: 0.59,
      reachSide: 1,
      cycleOffset: 0.2,
      cyclePeriod: 9.0,
      maxLeanX: 11 * scaleFactor,
      maxLeanY: -7 * scaleFactor,
      sleeveColor: '#1f5ec9',
      sleeveHighlight: '#eaf3ff',
      hasJacketStripe: true,
      skinColor: '#b87442',
      skinShade: '#8d522a',
      pantsBase: '#23252e',
      pantsHighlight: '#363a47',
      pantsShade: '#15161c',
      coupleLeanDir: 1,
    },
    {
      role: 'grazi',
      seatX: hasHighResBackdrop ? 10.98 * TILE_SIZE : 11.15 * TILE_SIZE,
      fullH: 120 * scaleFactor,
      upperFrac: 0.52,
      reachSide: 1,
      cycleOffset: 2.45,
      cyclePeriod: 9.0,
      maxLeanX: 5 * scaleFactor,
      maxLeanY: -4 * scaleFactor,
      sleeveColor: '#1f1e28',
      sleeveHighlight: '#3c3b4d',
      skinColor: '#f7d5bc',
      skinShade: '#dfb094',
      hasGoldWatch: true,
      pantsBase: '#5e6b43',
      pantsHighlight: '#8d9268',
      pantsShade: '#3c4529',
      isCamoSkirt: true,
      coupleLeanDir: -1,
    },
    {
      role: 'laura',
      seatX: hasHighResBackdrop ? 13.02 * TILE_SIZE : 12.85 * TILE_SIZE,
      fullH: 120 * scaleFactor,
      upperFrac: 0.56,
      reachSide: -1,
      cycleOffset: 4.7,
      cyclePeriod: 9.0,
      maxLeanX: -5 * scaleFactor,
      maxLeanY: -4 * scaleFactor,
      sleeveColor: '#ede4c2',
      sleeveHighlight: '#fff9e6',
      skinColor: '#f7d5bc',
      skinShade: '#dfb094',
      pantsBase: '#4e73a3',
      pantsHighlight: '#6b90bf',
      pantsShade: '#355075',
      coupleLeanDir: 1,
    },
    {
      role: 'leo',
      seatX: hasHighResBackdrop ? 14.58 * TILE_SIZE : 14.15 * TILE_SIZE,
      fullH: 126 * scaleFactor,
      upperFrac: 0.59,
      reachSide: -1,
      cycleOffset: 6.95,
      cyclePeriod: 9.0,
      maxLeanX: -11 * scaleFactor,
      maxLeanY: -7 * scaleFactor,
      sleeveColor: '#667844',
      sleeveHighlight: '#83985b',
      skinColor: '#c7834e',
      skinShade: '#9a5f34',
      pantsBase: '#3e6392',
      pantsHighlight: '#5a81b2',
      pantsShade: '#294469',
      coupleLeanDir: -1,
    },
  ];

  // Evaluate each character's independent animation state
  const states = specs.map((spec) => {
    const upperH = spec.fullH * spec.upperFrac;
    const shoulderOffsetX = spec.reachSide * (spec.fullH * 0.14);
    const shoulderBaseY = hipY - upperH + spec.fullH * 0.355;
    const restX = spec.seatX + spec.reachSide * (spec.fullH * 0.11);
    const restY = hipY + 1;
    const targetOffsetX = spec.reachSide > 0 ? -8 * scaleFactor : 8 * scaleFactor;
    const mouthX = spec.seatX + spec.reachSide * 1.5;
    const mouthY = hipY - upperH + spec.fullH * 0.235;

    const anim = evaluatePopcornState(
      spec,
      t,
      restX,
      restY,
      bowlX + targetOffsetX,
      bowlY - 7 * scaleFactor,
      mouthX,
      mouthY,
    );

    const shoulderX = spec.seatX + anim.leanX + shoulderOffsetX;
    const shoulderY = shoulderBaseY + anim.leanY + anim.laughBounce;
    return { spec, anim, shoulderX, shoulderY };
  });

  const bowlRustle = states.some((s) => s.anim.scoopingInBowl) ? 1 : 0;

  // 1. Centered, accessible shared popcorn bowl on the coffee table (seamless backdrop cleanup!)
  drawSharedPopcornBowl(ctx, bowlX, bowlY, bowlRustle, t, mapBackdrop);

  // 2. Seated lower bodies (connected hips & bent thighs anchored to each character's lean)
  for (const { spec, anim } of states) {
    drawSeatedLowerBody(ctx, spec, spec.seatX, hipY, anim.leanX);
  }

  // 3. Back-facing upper bodies watch the TV while retaining the seated movement.
  for (const { spec, anim } of states) {
    drawSeatedApprovedUpperBody(ctx, spec, spec.seatX, hipY, anim, t);
  }

  // 4. Cozy sofa cushion foreground depth & draped throw blanket tuck so all 4 sit IN the sofa!
  if (mapBackdrop && mapBackdrop.naturalWidth > 0 && mapBackdrop.naturalHeight > 0) {
    const sxScale = mapBackdrop.naturalWidth / (MAP_COLS * TILE_SIZE);
    const syScale = mapBackdrop.naturalHeight / (MAP_ROWS * TILE_SIZE);
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    // Gently layer the sofa's lower cushion front rim & Léo's cozy throw blanket right over the bottom lap hem
    ctx.drawImage(
      mapBackdrop,
      258 * sxScale,
      358 * syScale,
      254 * sxScale,
      14 * syScale,
      258,
      358,
      254,
      14,
    );
    ctx.imageSmoothingEnabled = prevSmooth;
  } else {
    const sx = 9 * TILE_SIZE;
    const sofaTopY = 8 * TILE_SIZE + 2;
    ctx.fillStyle = '#7e2f2b';
    ctx.fillRect(sx + 12, sofaTopY + 28, 6 * TILE_SIZE - 24, 20);
    ctx.fillStyle = '#993e38';
    ctx.fillRect(sx + 16, sofaTopY + 31, 6 * TILE_SIZE - 32, 13);
    ctx.fillStyle = '#e8cfa0';
    ctx.fillRect(sx + 44, sofaTopY + 27, 98, 7);
  }

  // 5. Crisp pixel-art 2-bone IK arms + hands + gripped popcorn clusters (ZERO face crossing!)
  for (const { spec, anim, shoulderX, shoulderY } of states) {
    if (anim.armActive <= 0.04) continue;
    const isOuter = spec.role === 'ariel' || spec.role === 'leo';
    const upperLen = (isOuter ? 33 : 26) * scaleFactor;
    const foreLen = (isOuter ? 33 : 26) * scaleFactor;
    // Outer seats arch elbow UP-OUTWARD during reach/scoop so the arm glides cleanly ABOVE neighbors' heads;
    // inner seats & lifting/eating phases bend naturally outward-downward!
    const archAboveNeighbor = isOuter && (anim.phase === 'reach' || anim.phase === 'scoop');
    const bendSign: 1 | -1 = archAboveNeighbor
      ? spec.reachSide > 0
        ? -1
        : 1
      : spec.reachSide > 0
        ? 1
        : -1;
    const ik = solveTwoBoneIK(
      shoulderX,
      shoulderY,
      anim.handX,
      anim.handY,
      upperLen,
      foreLen,
      bendSign,
    );
    drawArticulatedSeatedArm(
      ctx,
      spec,
      shoulderX,
      shoulderY,
      ik.ex,
      ik.ey,
      ik.hx,
      ik.hy,
      anim.fingersCupped,
      anim.holdingPopcorn,
      anim.popcornScale,
    );
  }

  // 6. Subtle flickering CRT TV reflection cast gently onto the seated friends' hair & shoulders
  const tvPulse = 0.055 + 0.025 * Math.sin(t * 8.5);
  const tvWash = ctx.createRadialGradient(bowlX, bowlY - 24, 18, bowlX, hipY - 16, 155);
  tvWash.addColorStop(0, `rgba(168, 224, 255, ${(tvPulse * 1.4).toFixed(3)})`);
  tvWash.addColorStop(1, 'rgba(168, 224, 255, 0)');
  ctx.fillStyle = tvWash;
  ctx.beginPath();
  ctx.ellipse(bowlX, hipY - 26, 150, 58, 0, 0, Math.PI * 2);
  ctx.fill();

  // 7. Contextual expressive movie-night reactions synced to real laughs & couple glances
  const couple1Laugh = states[0].anim.laughBounce < -0.5 || states[1].anim.laughBounce < -0.5;
  const couple2Laugh = states[2].anim.laughBounce < -0.5 || states[3].anim.laughBounce < -0.5;
  const couple1Glance = states[0].anim.glanceDir !== 0 || states[1].anim.glanceDir !== 0;
  const couple2Glance = states[2].anim.glanceDir !== 0 || states[3].anim.glanceDir !== 0;

  if (couple1Laugh || couple1Glance) {
    drawMoodIcon(
      ctx,
      (specs[0].seatX + specs[1].seatX) * 0.5,
      hipY - 86 * scaleFactor,
      couple1Laugh ? 'smile' : 'heart',
    );
  }
  if (couple2Laugh || couple2Glance) {
    drawMoodIcon(
      ctx,
      (specs[2].seatX + specs[3].seatX) * 0.5,
      hipY - 86 * scaleFactor,
      couple2Laugh ? 'smile' : 'heart',
    );
  }
}

// ============================================================================
// ANIMATED RPG TRAVEL CUTSCENES BETWEEN THE 5 ENVIRONMENTS
// Shows the characters actually walking along the neighborhood street/sidewalk
// into each destination — never a jarring static background swap!
// ============================================================================
export function drawTravelTransitionCutscene(
  ctx: CanvasRenderingContext2D,
  cutscene: Stage3CutsceneKind,
  viewW: number,
  viewH: number,
  elapsed: number,
): void {
  const duration = 4.2;
  const p = Math.min(1, elapsed / duration);

  const isEvening = cutscene === 'travel_to_videostore' || cutscene === 'travel_to_livingroom';
  const isTwilight = cutscene === 'travel_to_hotdog';
  const isMorning = cutscene === 'travel_to_moving';

  const travelArt = getCaminhoNovoTravelBackdrop();
  let walkY = Math.round(viewH * 0.72);

  if (travelArt) {
    // Full-bleed high-resolution Stardew Caminho Novo neighborhood panorama with gentle parallax drift!
    const imgW = travelArt.naturalWidth || 1280;
    const imgH = travelArt.naturalHeight || 720;
    const coverScale = Math.max(viewW / imgW, viewH / imgH) * 1.08;
    const drawW = imgW * coverScale;
    const drawH = imgH * coverScale;
    const maxPanX = Math.max(0, drawW - viewW);
    const drawX = -Math.round(p * maxPanX);
    const drawY = Math.round((viewH - drawH) * 0.5);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(travelArt, drawX, drawY, drawW, drawH);

    // Subtle time-of-day atmospheric color glaze matching each travel leg
    const tint = ctx.createLinearGradient(0, 0, 0, viewH);
    if (isEvening) {
      tint.addColorStop(0, 'rgba(18, 28, 62, 0.56)');
      tint.addColorStop(0.55, 'rgba(34, 42, 78, 0.44)');
      tint.addColorStop(1, 'rgba(22, 18, 40, 0.52)');
    } else if (isTwilight) {
      tint.addColorStop(0, 'rgba(72, 48, 92, 0.24)');
      tint.addColorStop(0.55, 'rgba(232, 140, 86, 0.22)');
      tint.addColorStop(1, 'rgba(58, 30, 22, 0.28)');
    } else {
      tint.addColorStop(0, 'rgba(255, 226, 160, 0.12)');
      tint.addColorStop(0.6, 'rgba(255, 214, 140, 0.05)');
      tint.addColorStop(1, 'rgba(42, 26, 16, 0.14)');
    }
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, viewW, viewH);

    walkY = Math.round(viewH * 0.80);
  } else {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, viewH);
    if (isEvening) {
      skyGrad.addColorStop(0, '#182342');
      skyGrad.addColorStop(0.55, '#2b3d66');
      skyGrad.addColorStop(1, '#4c5278');
    } else if (isTwilight) {
      skyGrad.addColorStop(0, '#4d5d8c');
      skyGrad.addColorStop(0.55, '#b87266');
      skyGrad.addColorStop(1, '#ebb07a');
    } else {
      skyGrad.addColorStop(0, '#5a8ec2');
      skyGrad.addColorStop(0.55, '#9ec4d8');
      skyGrad.addColorStop(1, '#f5d99b');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, viewW, viewH);

    if (isEvening) {
      ctx.fillStyle = '#fff5cc';
      for (let i = 0; i < 18; i++) {
        ctx.fillRect((i * 53 + 17) % viewW, (i * 29 + 14) % Math.round(viewH * 0.4), 2, 2);
      }
    } else if (isMorning || isTwilight) {
      const sunX = viewW * (isMorning ? 0.72 : 0.28);
      const sunY = viewH * (isMorning ? 0.25 : 0.34);
      ctx.fillStyle = 'rgba(255, 224, 145, 0.26)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 54, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe59c';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    const horizonY = Math.round(viewH * 0.56);
    ctx.fillStyle = isEvening ? '#2e4a34' : '#588c46';
    ctx.fillRect(0, horizonY, viewW, viewH - horizonY);
    ctx.fillStyle = isEvening ? '#8b7a69' : '#cca578';
    ctx.fillRect(0, walkY - 18, viewW, 44);
    ctx.fillStyle = isEvening ? '#2e313c' : '#4c4f59';
    ctx.fillRect(0, walkY + 26, viewW, viewH - (walkY + 26));
  }

  // Animated walking group marching along the sidewalk toward the destination!
  ctx.save();
  const groupScale = Math.max(1.05, Math.min(1.55, viewW / 640));
  ctx.scale(groupScale, groupScale);
  const scaledW = viewW / groupScale;
  const scaledWalkY = (walkY + 4) / groupScale;
  const leadX = scaledW * (0.18 + p * 0.6);

  if (cutscene === 'travel_to_moving') {
    drawGraziArielWalkTogether(ctx, leadX + 10, scaledWalkY, elapsed * 8, true, 'right');
    drawLeoSprite(ctx, leadX - 42, scaledWalkY + 1, {
      dir: 'right',
      walkDist: elapsed * 42,
      isMoving: true,
    });
  } else {
    drawGraziArielWalkTogether(ctx, leadX, scaledWalkY, elapsed * 8, true, 'right');
    drawLauraLeoWalkTogether(ctx, leadX - 74, scaledWalkY + 1, elapsed * 8, true, 'right', true);
  }
  ctx.restore();

  // Smooth fade-in & fade-out curtain at edges of transition
  const fadeAlpha = p < 0.16 ? 1 - p / 0.16 : p > 0.84 ? (p - 0.84) / 0.16 : 0;
  if (fadeAlpha > 0.01) {
    ctx.fillStyle = `rgba(20, 12, 8, ${Math.min(1, fadeAlpha).toFixed(2)})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }
}

export function drawNeighborhoodVideoStoreFacade(
  ctx: CanvasRenderingContext2D,
  startCol: number,
  endCol: number,
  tallEntrance = false,
): void {
  // Visible exterior storefront of the Video Store on the neighborhood street / open sidewalk!
  const x = startCol * TILE_SIZE;
  const w = (endCol - startCol + 1) * TILE_SIZE;
  const h = (tallEntrance ? 4 : 3) * TILE_SIZE;

  ctx.fillStyle = 'rgba(30, 18, 10, 0.25)';
  ctx.fillRect(x + 4, h, w - 4, 6);

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 1, 14, w + 2, h - 13);
  ctx.fillStyle = '#2d4670';
  ctx.fillRect(x + 1, 16, w - 2, h - 17);

  // Subtle retro vertical paneling on storefront facade
  ctx.fillStyle = '#243a5e';
  for (let px = x + 8; px < x + w - 8; px += 16) {
    ctx.fillRect(px, 44, 2, h - 46);
  }

  // Retro awning & neon marquee sign
  ctx.fillStyle = '#151d38';
  ctx.fillRect(x + 10, 20, w - 20, 22);
  ctx.strokeStyle = '#5ee2ff';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 11, 21, w - 22, 20);
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LOCADORA VHS', x + w / 2, 34);
  ctx.textAlign = 'left';

  // Display windows showing colorful VHS covers inside!
  const winH = tallEntrance ? 44 : 34;
  ctx.fillStyle = '#1d3659';
  ctx.fillRect(x + 10, 48, 58, winH + 4);
  ctx.fillRect(x + w - 68, 48, 58, winH + 4);
  ctx.fillStyle = '#7bd3ee';
  ctx.fillRect(x + 12, 50, 54, winH);
  ctx.fillRect(x + w - 66, 50, 54, winH);
  const colors = ['#e85d52', '#ffd166', '#4ecdc4', '#a66dd4'];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(x + 16 + i * 12, 58, 9, 16);
    ctx.fillRect(x + w - 62 + i * 12, 58, 9, 16);
    if (tallEntrance) {
      ctx.fillStyle = colors[(i + 2) % 4];
      ctx.fillRect(x + 16 + i * 12, 76, 9, 14);
      ctx.fillRect(x + w - 62 + i * 12, 76, 9, 14);
    }
  }

  // Center glass double doors (walkable illuminated entrance when tallEntrance is true!)
  const doorW = tallEntrance ? 62 : 36;
  const doorH = tallEntrance ? 76 : 48;
  const dx = Math.round(x + w / 2 - doorW / 2);
  const dy = h - doorH;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(dx - 2, dy - 2, doorW + 4, doorH + 2);

  if (tallEntrance) {
    // Open welcoming glass doorway with warm lit interior floor & VHS rack glimpse inside!
    ctx.fillStyle = '#243c63';
    ctx.fillRect(dx, dy, doorW, doorH);
    // Warm interior tile peek
    ctx.fillStyle = '#334d7a';
    ctx.fillRect(dx + 6, dy + 32, doorW - 12, doorH - 32);
    // Mini lit VHS shelf silhouette visible through open glass doors
    ctx.fillStyle = '#5c3b22';
    ctx.fillRect(dx + 12, dy + 14, doorW - 24, 18);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(dx + 15 + i * 7, dy + 17, 5, 11);
    }
    // Open glass door leaves pushed to the sides with specular shine
    ctx.fillStyle = 'rgba(130, 224, 255, 0.45)';
    ctx.fillRect(dx + 2, dy + 2, 12, doorH - 4);
    ctx.fillRect(dx + doorW - 14, dy + 2, 12, doorH - 4);
    ctx.fillStyle = '#d9f7ff';
    ctx.fillRect(dx + 4, dy + 6, 3, doorH - 12);
    ctx.fillRect(dx + doorW - 10, dy + 6, 3, doorH - 12);
    // Small neon "ABERTO" sign above doorway
    ctx.fillStyle = '#151d38';
    ctx.fillRect(dx + 12, dy + 3, doorW - 24, 10);
    ctx.fillStyle = '#5ef2a8';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ABERTO', dx + doorW / 2, dy + 10);
    ctx.textAlign = 'left';
    // Red welcome mat on the sidewalk threshold
    ctx.fillStyle = '#a83632';
    ctx.fillRect(dx + 10, h - 6, doorW - 20, 7);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(dx + 14, h - 4, doorW - 28, 3);
  } else {
    ctx.fillStyle = '#52a7cc';
    ctx.fillRect(dx, dy, doorW, doorH);
    ctx.fillStyle = '#c8f2ff';
    ctx.fillRect(dx + 4, dy + 4, 12, 38);
    ctx.fillRect(dx + 20, dy + 4, 12, 38);
  }
}

// Unused helper export guard so MAP_COLS/MAP_ROWS stay available if needed
export const STAGE3_WORLD_DIMS = { cols: MAP_COLS, rows: MAP_ROWS };
