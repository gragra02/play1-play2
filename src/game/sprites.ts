import {
  getDiscotecaExteriorBackdrop,
  getDiscotecaInteriorBackdrop,
} from './environmentArt';
import {
  DISCO_BALL_POS,
  EXTERIOR_TEENS,
  MAP_COLS,
  MAP_GRID,
  MAP_ROWS,
  TILE_SIZE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './mapData';
import {
  OUTLINE,
  drawArielBreakdanceCap,
  drawArielEloisaSlowDance,
  drawArielForeheadKiss,
  drawArielSprite,
  drawBreakdanceShowcaseSprite,
  drawCruzeiroFacade,
  drawEloisaSprite,
  drawFirstKissScene,
  drawGraziFriendSlowDance,
  drawGraziSprite,
  drawLauraSprite,
  drawMemorySparkle,
  drawPatronSprite,
  drawSlowDanceCouple,
  drawStardewBush,
  drawStardewTree,
  drawStreetLamp,
  px,
} from './pixelArt';
import { STAGE_2_MEMORIES } from './stage2Data';
import type { SimulationState, TileKind } from './types';

export interface Particle {
  active: boolean;
  kind: 'sparkle' | 'heart' | 'note';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export class ParticlePool {
  private pool: Particle[];

  constructor(size = 80) {
    this.pool = Array.from({ length: size }, () => ({
      active: false,
      kind: 'sparkle',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      color: '#ffffff',
    }));
  }

  public reset(): void {
    for (const p of this.pool) {
      p.active = false;
    }
  }

  public spawn(
    kind: Particle['kind'],
    x: number,
    y: number,
    vx: number,
    vy: number,
    maxLife: number,
    color: string,
  ): void {
    const slot = this.pool.find((p) => !p.active);
    if (!slot) return;
    slot.active = true;
    slot.kind = kind;
    slot.x = x;
    slot.y = y;
    slot.vx = vx;
    slot.vy = vy;
    slot.life = maxLife;
    slot.maxLife = maxLife;
    slot.color = color;
  }

  public update(dt: number): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.pool) {
      if (!p.active) continue;
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.globalAlpha = alpha;
      const x = px(p.x);
      const y = px(p.y);

      if (p.kind === 'heart') {
        ctx.fillStyle = p.color;
        ctx.fillRect(x - 3, y - 2, 2, 2);
        ctx.fillRect(x + 1, y - 2, 2, 2);
        ctx.fillRect(x - 4, y, 8, 2);
        ctx.fillRect(x - 2, y + 2, 4, 2);
        ctx.fillRect(x - 1, y + 4, 2, 1);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(x - 1, y - 1, 3, 3);
      }
    }
    ctx.globalAlpha = 1;
  }
}

let cachedExteriorCanvas: HTMLCanvasElement | null = null;

function getCachedExteriorCanvas(worldW: number, worldH: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (cachedExteriorCanvas) return cachedExteriorCanvas;

  const offscreen = document.createElement('canvas');
  offscreen.width = worldW;
  offscreen.height = worldH;
  const octx = offscreen.getContext('2d');
  if (!octx) return null;

  // Crisp 16-bit stepped twilight evening sky bands
  octx.fillStyle = '#151932';
  octx.fillRect(0, 0, worldW, 95);
  octx.fillStyle = '#202447';
  octx.fillRect(0, 95, worldW, 75);
  octx.fillStyle = '#32325a';
  octx.fillRect(0, 170, worldW, 65);
  octx.fillStyle = '#4e3b56';
  octx.fillRect(0, 235, worldW, 95);

  // Crescent moon
  octx.beginPath();
  octx.arc(680, 70, 16, 0, Math.PI * 2);
  octx.fillStyle = '#fde69a';
  octx.fill();
  octx.beginPath();
  octx.arc(687, 66, 14, 0, Math.PI * 2);
  octx.fillStyle = '#1b203b';
  octx.fill();

  // Distant Palhoça neighborhood silhouette & grass bank
  octx.fillStyle = '#25263d';
  octx.fillRect(0, 260, worldW, 75);
  octx.fillStyle = '#2c5128';
  octx.fillRect(0, 326, worldW, 44);

  // Packed-earth / cobblestone sidewalk & Ponte do Imaruim street
  octx.fillStyle = '#b4946c';
  octx.fillRect(0, 368, worldW, 44);
  octx.fillStyle = '#9b7b56';
  for (let sx = 0; sx < worldW; sx += 28) {
    octx.fillRect(sx, 368, 26, 2);
    octx.fillRect(sx + 12, 388, 12, 2);
  }
  octx.fillStyle = '#735b43';
  octx.fillRect(0, 410, worldW, 4);
  octx.fillStyle = '#383846';
  octx.fillRect(0, 414, worldW, worldH - 414);
  octx.fillStyle = '#c4a85a';
  for (let dx = 20; dx < worldW; dx += 52) {
    octx.fillRect(dx, 446, 24, 3);
  }

  // Background Stardew trees & bushes flanking the club
  drawStardewTree(octx, 64, 368);
  drawStardewTree(octx, 745, 368);
  drawStardewBush(octx, 114, 368, true);
  drawStardewBush(octx, 705, 368, true);

  // Faithful Danceteria Cruzeiro F.C. Facade
  drawCruzeiroFacade(octx, 145, 370, 0);

  // Warm streetlamps along Ponte do Imaruim sidewalk
  drawStreetLamp(octx, 118, 388);
  drawStreetLamp(octx, 388, 388);
  drawStreetLamp(octx, 640, 388);

  cachedExteriorCanvas = offscreen;
  return cachedExteriorCanvas;
}

// ============================================================================
// EXTERIOR SCENE: PONTE DO IMARUIM STREET + DANCETERIA CRUZEIRO F.C. (CENAS 1 & 2)
// ============================================================================
function renderExteriorWorld(
  ctx: CanvasRenderingContext2D,
  sim: SimulationState,
  viewW: number,
  viewH: number,
): void {
  const worldW = 840;
  const worldH = 480;

  ctx.fillStyle = '#14192b';
  ctx.fillRect(0, 0, viewW, viewH);

  const extArt = getDiscotecaExteriorBackdrop();
  const coverScale = Math.max(viewW / worldW, viewH / worldH);
  const scale = extArt
    ? coverScale
    : Math.max(1.2, Math.min(viewW / 440, viewH / 270));
  const focusX = sim.intro.cameraFocusX;
  const focusY = sim.intro.cameraFocusY;

  let camX = px(viewW / 2 - focusX * scale);
  let camY = px(viewH / 2 - focusY * scale);
  const minCamX = viewW - worldW * scale;
  const minCamY = viewH - worldH * scale;
  camX = minCamX < 0 ? Math.max(minCamX, Math.min(0, camX)) : px((viewW - worldW * scale) / 2);
  camY = minCamY < 0 ? Math.max(minCamY, Math.min(0, camY)) : px((viewH - worldH * scale) / 2);

  ctx.save();
  ctx.translate(camX, camY);
  ctx.scale(scale, scale);

  if (extArt) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(extArt, 0, 0, worldW, worldH);
  } else {
    const extBg = getCachedExteriorCanvas(worldW, worldH);
    if (extBg) {
      ctx.drawImage(extBg, 0, 0);
    } else {
      drawCruzeiroFacade(ctx, 145, 370, 0);
    }
  }

  // Dynamic twinkling night stars
  ctx.fillStyle = '#fff5cc';
  const stars = [
    [60, 42], [130, 74], [210, 32], [310, 56], [420, 28],
    [515, 68], [620, 38], [710, 62], [780, 44],
  ];
  for (let i = 0; i < stars.length; i++) {
    const twinkle = Math.sin(sim.elapsedSeconds * 2.5 + i * 1.4) > 0.2 ? 2 : 1;
    ctx.fillRect(stars[i][0], stars[i][1], twinkle, twinkle);
  }

  // Dynamic warm club entrance light spill when Grazi & Laura arrive
  const doorOpen = sim.intro.scene === 'scene2_arrival' ? sim.intro.doorOpenAmount : 0.12;
  if (doorOpen > 0.05) {
    if (extArt) {
      // Soft warm doorway glow spilling onto the sidewalk from the open dark-brown portaria gate
      const spillX = 228;
      const spillY = 398;
      const grad = ctx.createRadialGradient(spillX, spillY, 6, spillX, spillY, 54);
      grad.addColorStop(0, `rgba(255, 212, 128, ${(0.24 + doorOpen * 0.22).toFixed(2)})`);
      grad.addColorStop(1, 'rgba(255, 180, 90, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(spillX, spillY, 54, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const gateX = 145 + 68;
      const gateY = 370 - 44;
      const openW = Math.round(doorOpen * 22);
      ctx.fillStyle = `rgba(255, 200, 110, ${(0.45 + doorOpen * 0.45).toFixed(2)})`;
      ctx.fillRect(gateX + 10, gateY + 10, 24, 34);
      ctx.fillStyle = `rgba(255, 195, 105, ${(0.24 * doorOpen).toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(gateX + 10, 370);
      ctx.lineTo(gateX + 34, 370);
      ctx.lineTo(gateX + 46, 370 + 26);
      ctx.lineTo(gateX - 2, 370 + 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8b4d29';
      ctx.fillRect(gateX + 10, gateY + 10, Math.max(4, 24 - openW), 34);
    }
  }

  // Teen groups & Grazi + Laura walking in Cena 2
  const renderQueue: Array<{ y: number; draw: () => void }> = [];
  const sidewalkOffsetY = extArt ? 34 : 0;

  if (sim.intro.scene === 'scene1_1995_street') {
    // A couple of teens already outside chatting on the sidewalk
    const teenY = 392 + sidewalkOffsetY;
    renderQueue.push({
      y: teenY,
      draw: () => drawPatronSprite(ctx, 412, teenY, 2, 'right', sim.elapsedSeconds * 3, false),
    });
    renderQueue.push({
      y: teenY,
      draw: () => drawPatronSprite(ctx, 434, teenY, 3, 'left', sim.elapsedSeconds * 3, false),
    });
  } else {
    const t = sim.intro.elapsed;
    // Teen groups arriving, chatting, and entering
    for (const teen of EXTERIOR_TEENS) {
      if (teen.chatMode) {
        const cy = teen.targetY + sidewalkOffsetY;
        renderQueue.push({
          y: cy,
          draw: () =>
            drawPatronSprite(ctx, teen.targetX, cy, teen.variant, teen.variant === 2 ? 'right' : 'left', t * 4, false),
        });
      } else {
        const moveT = Math.max(0, Math.min(1, (t - teen.enterDelay) / 3.2));
        if (moveT < 0.98) {
          const tx = teen.startX + (teen.targetX - teen.startX) * moveT;
          const ty = teen.startY + (teen.targetY - teen.startY) * moveT + sidewalkOffsetY;
          const dir = teen.targetX > teen.startX ? 'right' : 'left';
          renderQueue.push({
            y: ty,
            draw: () => drawPatronSprite(ctx, tx, ty, teen.variant, dir, t * 8, true),
          });
        }
      }
    }

    // Grazi & Laura walking together to the entrance vestibule (x: 228, y: 412)
    const walkT = Math.min(1, t / 3.9);
    const gx = 72 + (228 - 72) * walkT;
    const gy = (extArt ? 434 : 398) + ((extArt ? 412 : 378) - (extArt ? 434 : 398)) * walkT;
    const lx = gx - 28;
    const ly = gy + 2;
    const enteringFade = t > 4.0 ? Math.max(0, 1 - (t - 4.0) / 0.8) : 1;

    if (enteringFade > 0.05) {
      const dir = walkT > 0.85 ? 'up' : 'right';
      const moving = walkT < 0.96;
      renderQueue.push({
        y: gy,
        draw: () => {
          ctx.save();
          ctx.globalAlpha = enteringFade;
          drawGraziSprite(ctx, gx, gy, {
            dir,
            isMoving: moving,
            walkPhase: t * 9,
          });
          ctx.restore();
        },
      });
      renderQueue.push({
        y: ly,
        draw: () => {
          ctx.save();
          ctx.globalAlpha = enteringFade;
          drawLauraSprite(ctx, lx, ly, {
            dir,
            isMoving: moving,
            walkPhase: t * 9 + 1.2,
          });
          ctx.restore();
        },
      });
    }
  }

  renderQueue.sort((a, b) => a.y - b.y);
  for (const item of renderQueue) {
    item.draw();
  }

  ctx.restore();

  // Cena 1 initial dark "1995" fade-in overlay (0..1.35s)
  if (sim.intro.scene === 'scene1_1995_street' && sim.intro.elapsed < 1.55) {
    const fade = sim.intro.elapsed < 1.0 ? 1 : Math.max(0, 1 - (sim.intro.elapsed - 1.0) / 0.55);
    ctx.fillStyle = `rgba(14, 9, 6, ${fade.toFixed(2)})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }
}

// ============================================================================
// INTERIOR TILE & FURNITURE RENDERING (STARDEW VALLEY QUALITY)
// ============================================================================
function drawInteriorTile(
  ctx: CanvasRenderingContext2D,
  kind: TileKind,
  col: number,
  row: number,
  beatPhase: number,
  isSlowMode: boolean,
): void {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  // Base warm oak wooden planks for interior club floor
  ctx.fillStyle = '#6f4225';
  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.fillStyle = '#804d2c';
  ctx.fillRect(x, y + 1, TILE_SIZE, 14);
  ctx.fillRect(x, y + 17, TILE_SIZE, 14);
  ctx.fillStyle = '#57321b';
  ctx.fillRect(x, y + 15, TILE_SIZE, 2);
  ctx.fillRect(x, y + 31, TILE_SIZE, 1);
  // Alternating vertical plank seams
  const seamX = (col + row) % 2 === 0 ? x + 10 : x + 22;
  ctx.fillRect(seamX, y, 1, 15);
  ctx.fillRect(x + ((seamX + 14) % 30), y + 16, 1, 15);

  if (kind === 'floor_dance') {
    const checker = (col + row) % 2 === 0;
    const pulse = Math.floor((beatPhase * 4 + col + row) % 4);
    const tilePalette = isSlowMode
      ? ['#663c3e', '#59333a', '#734443', '#61383c']
      : ['#543a68', '#38586e', '#754155', '#6e5834'];
    ctx.fillStyle = checker ? '#4c2c22' : tilePalette[pulse];
    ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.fillStyle = 'rgba(255, 224, 178, 0.08)';
    ctx.fillRect(x + 3, y + 3, TILE_SIZE - 6, 3);
    return;
  }

  if (kind === 'floor_entrance') {
    ctx.fillStyle = '#8a343b';
    ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.fillStyle = '#b34b53';
    ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    return;
  }

  if (kind === 'wall') {
    // Stardew-style warm plaster + wood wainscot lower wall
    ctx.fillStyle = '#381e12';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#5c331d';
    ctx.fillRect(x + 1, y + 14, TILE_SIZE - 2, TILE_SIZE - 15);
    ctx.fillStyle = '#734227';
    ctx.fillRect(x + 2, y + 16, TILE_SIZE - 4, 12);
    ctx.fillStyle = '#8e5735';
    ctx.fillRect(x, y + 12, TILE_SIZE, 3);
    // Warm wall lantern sconces every 4 columns along back wall
    if (row === 0 && col % 5 === 2) {
      ctx.fillStyle = '#f5b700';
      ctx.fillRect(x + 12, y + 6, 8, 8);
      ctx.fillStyle = '#fff3b0';
      ctx.fillRect(x + 14, y + 8, 4, 4);
    }
    return;
  }

  if (kind === 'door') {
    ctx.fillStyle = '#472514';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#8f4f28';
    ctx.fillRect(x + 3, y + 2, TILE_SIZE - 6, TILE_SIZE - 4);
    ctx.fillStyle = '#f0b849';
    ctx.fillRect(x + 6, y + 14, 3, 4);
    return;
  }

  if (kind === 'counter') {
    // Rich mahogany bar counter with brass rail & soda cups
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 2, y, TILE_SIZE - 4, TILE_SIZE);
    ctx.fillStyle = '#5c2d17';
    ctx.fillRect(x + 4, y, TILE_SIZE - 8, TILE_SIZE);
    ctx.fillStyle = '#a35d34';
    ctx.fillRect(x + 5, y + 2, TILE_SIZE - 10, TILE_SIZE - 4);
    ctx.fillStyle = '#d49a45'; // brass edge
    ctx.fillRect(x + 2, y, 2, TILE_SIZE);
    if (row % 2 === 0) {
      ctx.fillStyle = '#5bd1c5';
      ctx.fillRect(x + 12, y + 10, 5, 6);
      ctx.fillStyle = '#ff6b8b';
      ctx.fillRect(x + 19, y + 18, 5, 6);
    }
    // Bar stool to the left
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x - 15, y + 10, 11, 11);
    ctx.fillStyle = '#c43e4d';
    ctx.fillRect(x - 14, y + 11, 9, 9);
    return;
  }

  if (kind === 'dj_booth') {
    // Desk & turntables are drawn in the Y-sorted queue in front of the DJ so he naturally stands behind them
    return;
  }

  if (kind === 'concrete_chair' || kind === 'sofa') {
    // Simple 1990s poured-concrete chair / bench stool with distinct backrest & concrete legs
    ctx.fillStyle = 'rgba(20, 10, 6, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 25, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Sturdy concrete side legs
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 9, y + 18, 4, 8);
    ctx.fillRect(x + 19, y + 18, 4, 8);
    ctx.fillStyle = '#7e828a';
    ctx.fillRect(x + 10, y + 19, 2, 6);
    ctx.fillRect(x + 20, y + 19, 2, 6);
    // Molded concrete backrest slab
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 8, y + 5, 16, 7);
    ctx.fillStyle = '#9ea2aa';
    ctx.fillRect(x + 9, y + 6, 14, 5);
    ctx.fillStyle = '#c4c7ce';
    ctx.fillRect(x + 9, y + 6, 14, 2);
    // Concrete seat slab
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 7, y + 12, 18, 8);
    ctx.fillStyle = '#b6bac1';
    ctx.fillRect(x + 8, y + 13, 16, 6);
    ctx.fillStyle = '#d3d6dc';
    ctx.fillRect(x + 9, y + 13, 14, 2);
    // Subtle concrete texture speckles
    ctx.fillStyle = '#8b9099';
    ctx.fillRect(x + 11, y + 16, 2, 1);
    ctx.fillRect(x + 18, y + 17, 2, 1);
    return;
  }

  if (kind === 'plant') {
    // Terracotta pot + Stardew leafy tropical indoor plant
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 9, y + 16, 14, 12);
    ctx.fillStyle = '#b55635';
    ctx.fillRect(x + 10, y + 17, 12, 10);
    ctx.fillStyle = '#d17149';
    ctx.fillRect(x + 9, y + 16, 14, 3);
    // Lush leaves
    ctx.fillStyle = '#2b5e24';
    ctx.beginPath();
    ctx.arc(x + 16, y + 12, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4e913a';
    ctx.beginPath();
    ctx.arc(x + 12, y + 10, 5, 0, Math.PI * 2);
    ctx.arc(x + 20, y + 10, 5, 0, Math.PI * 2);
    ctx.arc(x + 16, y + 6, 5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (kind === 'table') {
    // Simple 1990s poured-concrete club table with pedestal base & soft beveled edge
    ctx.fillStyle = 'rgba(20, 10, 6, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 24, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Concrete pedestal column
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 11, y + 17, 10, 9);
    ctx.fillStyle = '#7e828a';
    ctx.fillRect(x + 12, y + 18, 8, 7);
    ctx.fillStyle = '#9aa0a8';
    ctx.fillRect(x + 13, y + 18, 3, 7);
    // Round/beveled concrete tabletop
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 14, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#979ba3';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 15, 11.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c4c7ce';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 13, 11, 7.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d6d9df';
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 11.5, 7.5, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Subtle concrete speckles & 90s soda cups
    ctx.fillStyle = '#8b9099';
    ctx.fillRect(x + 10, y + 14, 2, 1);
    ctx.fillRect(x + 21, y + 13, 2, 1);
    ctx.fillStyle = '#f5f0e1';
    ctx.fillRect(x + 12, y + 10, 3, 4);
    ctx.fillStyle = '#5bd1c5';
    ctx.fillRect(x + 18, y + 11, 3, 4);
    return;
  }

  if (kind === 'speaker') {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 4);
    ctx.fillStyle = '#2a242c';
    ctx.fillRect(x + 6, y + 4, TILE_SIZE - 12, TILE_SIZE - 8);
    ctx.fillStyle = '#4b404e';
    ctx.beginPath();
    ctx.arc(x + 16, y + 12, 5, 0, Math.PI * 2);
    ctx.arc(x + 16, y + 23, 6, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (kind === 'fridge') {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 4);
    ctx.fillStyle = '#dce6ec';
    ctx.fillRect(x + 6, y + 4, TILE_SIZE - 12, TILE_SIZE - 8);
    ctx.fillStyle = '#80b5cc';
    ctx.fillRect(x + 8, y + 7, TILE_SIZE - 16, 12);
    return;
  }

  if (kind === 'rope') {
    ctx.fillStyle = '#d49a45';
    ctx.fillRect(x + 13, y + 6, 6, 20);
    ctx.fillStyle = '#993346';
    ctx.fillRect(x, y + 12, TILE_SIZE, 4);
  }
}

// Framed mural painting of Danceteria Cruzeiro F.C. on the back wall (cruzeiro2_d85b1bb5.PNG)
function drawCruzeiroMural(ctx: CanvasRenderingContext2D): void {
  const mx = 10 * TILE_SIZE - 8;
  const my = 4;
  const mw = 4 * TILE_SIZE + 16;
  const mh = 26;

  ctx.fillStyle = '#c28d40';
  ctx.fillRect(mx - 2, my - 2, mw + 4, mh + 4);
  ctx.fillStyle = '#536c94';
  ctx.fillRect(mx, my, mw, mh);
  ctx.fillStyle = '#eee8dc';
  ctx.fillRect(mx + 22, my + 9, 96, 14);
  ctx.fillStyle = '#9e2e24';
  ctx.fillRect(mx + 20, my + 5, 100, 5);
  ctx.fillStyle = '#381e12';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(mx + 42 + i * 18, my + 12, 12, 10);
  }
}

function drawMirrorBallAndLights(
  ctx: CanvasRenderingContext2D,
  sim: SimulationState,
): void {
  const cx = DISCO_BALL_POS.x;
  const cy = DISCO_BALL_POS.y;
  const isRomantic =
    sim.slowDance.active ||
    sim.kissCutscene.active ||
    sim.questPhase === 'post_dance_confession';
  const t = sim.elapsedSeconds;

  const colors = isRomantic
    ? ['rgba(255, 175, 195, 0.14)', 'rgba(245, 195, 110, 0.12)', 'rgba(255, 130, 165, 0.1)']
    : ['rgba(245, 183, 50, 0.17)', 'rgba(58, 212, 200, 0.15)', 'rgba(245, 92, 138, 0.15)'];

  for (let i = 0; i < 3; i++) {
    const angle = t * (isRomantic ? 0.35 : 0.85) + i * 2.1;
    const lx = cx + Math.cos(angle) * 112;
    const ly = cy + Math.sin(angle * 0.8) * 64;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.ellipse(lx, ly, isRomantic ? 68 : 54, isRomantic ? 44 : 34, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mirror ball hanging cleanly above the DJ booth & mural (zero overlap with DJ's head!)
  const ballY = 26;
  ctx.fillStyle = '#5c4b42';
  ctx.fillRect(cx - 1, 0, 2, 18);
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.arc(cx, ballY, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d8e2f0';
  ctx.beginPath();
  ctx.arc(cx, ballY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 4, ballY - 4, 3, 3);
  ctx.fillRect(cx + 2, ballY + 1, 3, 3);
}

// Y-sorted foreground DJ booth desk (cols 9..14 on row 2) so DJ Cruzeiro stands naturally behind the sound equipment!
function drawDjBoothForeground(
  ctx: CanvasRenderingContext2D,
  time: number,
  isFunk: boolean,
): void {
  const bx = 9 * TILE_SIZE;
  const by = 2 * TILE_SIZE + 5;
  const bw = 6 * TILE_SIZE; // 192px wide
  const bh = 27;

  // Ground shadow
  ctx.fillStyle = 'rgba(16, 8, 5, 0.36)';
  ctx.fillRect(bx + 2, by + bh - 2, bw - 4, 5);

  // Outer pixel frame
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bx, by, bw, bh);

  // Dark slate tabletop surface (upper portion)
  ctx.fillStyle = '#333446';
  ctx.fillRect(bx + 2, by + 2, bw - 4, 11);
  ctx.fillStyle = '#474961';
  ctx.fillRect(bx + 3, by + 2, bw - 6, 2);

  // Mahogany front panel + brass trim (occludes DJ waist & legs cleanly)
  ctx.fillStyle = '#5c311a';
  ctx.fillRect(bx + 2, by + 13, bw - 4, 12);
  ctx.fillStyle = '#7d4627';
  ctx.fillRect(bx + 4, by + 15, bw - 8, 8);
  ctx.fillStyle = '#d49a45';
  ctx.fillRect(bx + 2, by + 12, bw - 4, 2);

  // Animated 90s LED equalizer bars across the front panel
  const eqSpeed = isFunk ? 11.5 : 6.2;
  for (let i = 0; i < 16; i++) {
    const level = 0.25 + 0.75 * Math.abs(Math.sin(time * eqSpeed + i * 0.72));
    const barH = Math.max(2, Math.round(level * 6));
    const ex = bx + 16 + i * 10;
    ctx.fillStyle = '#24140d';
    ctx.fillRect(ex, by + 16, 6, 6);
    ctx.fillStyle = i % 3 === 0 ? '#ffd166' : i % 3 === 1 ? '#3edbd0' : '#ff6b8b';
    ctx.fillRect(ex + 1, by + 22 - barH, 4, barH);
  }

  // Left & Right Vinyl Turntables right in front of the DJ (centered around col 11.5 -> x = 368)
  const deckCenters = [bx + 60, bx + 100];
  for (let d = 0; d < deckCenters.length; d++) {
    const dx = deckCenters[d];
    const dy = by + 7;
    ctx.fillStyle = '#1b1c26';
    ctx.fillRect(dx - 13, dy - 5, 26, 10);
    // Spinning vinyl platter
    ctx.fillStyle = '#101118';
    ctx.beginPath();
    ctx.ellipse(dx - 2, dy, 8.5, 4.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = d === 0 ? '#e0576d' : '#3edbd0';
    ctx.beginPath();
    ctx.ellipse(dx - 2, dy, 2.8, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Spinning highlight dot on record
    const spin = time * (isFunk ? 9 : 5.5) + d * 2.4;
    ctx.fillStyle = '#e5ebf5';
    ctx.fillRect(px(dx - 2 + Math.cos(spin) * 5.2), px(dy + Math.sin(spin) * 2.2), 2, 1);
    // Tonearm
    ctx.fillStyle = '#c4cbd6';
    ctx.fillRect(dx + 8, dy - 3, 2, 6);
  }

  // Central Mixer Console between the two turntables
  const mx = bx + 74;
  ctx.fillStyle = '#232533';
  ctx.fillRect(mx, by + 2, 12, 10);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(mx + 2, by + 4, 2, 2);
  ctx.fillStyle = '#3edbd0';
  ctx.fillRect(mx + 8, by + 4, 2, 2);
  ctx.fillStyle = '#f5f0e1';
  const faderShift = Math.round(Math.sin(time * 5.0) * 2);
  ctx.fillRect(mx + 5 + faderShift, by + 8, 2, 2);

  // Subtle animated DJ hands operating the turntables / mixer
  const handBounceL = Math.round(Math.sin(time * (isFunk ? 10 : 6)) * 1.2);
  const handBounceR = Math.round(Math.cos(time * (isFunk ? 10 : 6)) * 1.2);
  ctx.fillStyle = '#d99b72';
  ctx.fillRect(bx + 59, by + 4 + handBounceL, 4, 3);
  ctx.fillRect(bx + 94, by + 4 + handBounceR, 4, 3);

  // Stacked K7 cassette crate on the far-left & far-right corners of the booth
  ctx.fillStyle = '#c84a68';
  ctx.fillRect(bx + 14, by + 4, 14, 7);
  ctx.fillStyle = '#f5f0e1';
  ctx.fillRect(bx + 16, by + 5, 10, 2);
  ctx.fillStyle = '#3d7ac4';
  ctx.fillRect(bx + bw - 32, by + 4, 16, 7);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(bx + bw - 30, by + 5, 12, 2);
}

let cachedInteriorCanvas: HTMLCanvasElement | null = null;

function getCachedInteriorCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  if (cachedInteriorCanvas) return cachedInteriorCanvas;

  const offscreen = document.createElement('canvas');
  offscreen.width = WORLD_WIDTH;
  offscreen.height = WORLD_HEIGHT;
  const octx = offscreen.getContext('2d');
  if (!octx) return null;

  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      const kind = MAP_GRID[r][c];
      if (kind !== 'floor_dance') {
        drawInteriorTile(octx, kind, c, r, 0, false);
      }
    }
  }
  drawCruzeiroMural(octx);
  cachedInteriorCanvas = offscreen;
  return cachedInteriorCanvas;
}

// ============================================================================
// MAIN RENDER ENTRY POINT
// ============================================================================
export function renderDiscotecaWorld(
  ctx: CanvasRenderingContext2D,
  sim: SimulationState,
  particles: ParticlePool,
  viewW: number,
  viewH: number,
  titlePreview = false,
): void {
  // Cenas 1 & 2 take place outside on Ponte do Imaruim street in front of Cruzeiro F.C.
  if (
    !titlePreview &&
    sim.intro.active &&
    (sim.intro.scene === 'scene1_1995_street' || sim.intro.scene === 'scene2_arrival')
  ) {
    renderExteriorWorld(ctx, sim, viewW, viewH);
    return;
  }

  // Interior Discoteca Cruzeiro
  ctx.fillStyle = '#1b100b';
  ctx.fillRect(0, 0, viewW, viewH);

  const s2 = sim.stageId === 'stage-2' ? sim.stage2 : null;
  const s2Cutscene = s2 && s2.cutscene !== 'none' ? s2.cutscene : null;

  const interiorArt = getDiscotecaInteriorBackdrop();
  const coverFloor = Math.max(viewW / WORLD_WIDTH, viewH / WORLD_HEIGHT);
  const baseScale = interiorArt
    ? titlePreview
      ? coverFloor
      : coverFloor * 1.14
    : Math.max(1.25, Math.min(viewW / 460, viewH / 280));
  const zoom = sim.kissCutscene.active
    ? baseScale * sim.kissCutscene.cameraZoom
    : s2Cutscene && s2
      ? baseScale * s2.cameraZoom
      : baseScale;

  let focusX = sim.player.x;
  let focusY = sim.player.y;

  if (titlePreview) {
    focusX = 11.2 * TILE_SIZE;
    focusY = 7.2 * TILE_SIZE;
  } else if (sim.intro.active && sim.intro.scene === 'scene3_interior_pan') {
    focusX = sim.intro.cameraFocusX;
    focusY = sim.intro.cameraFocusY;
  } else if (sim.kissCutscene.active) {
    focusX = DISCO_BALL_POS.x;
    focusY = DISCO_BALL_POS.y - 10;
  } else if (sim.slowDance.active) {
    focusX = DISCO_BALL_POS.x;
    focusY = DISCO_BALL_POS.y - 4;
  } else if (s2Cutscene && s2) {
    focusX = s2.cameraFocusX;
    focusY = s2.cameraFocusY;
  }

  let camX = px(viewW / 2 - focusX * zoom);
  let camY = px(viewH / 2 - focusY * zoom);

  // Clamp camera inside world bounds except during tight romantic/emotional close-ups
  const allowFreeZoom =
    sim.kissCutscene.active ||
    s2Cutscene === 'jealousy_slow_dance' ||
    s2Cutscene === 'forehead_kiss_farewell';
  if (!allowFreeZoom) {
    const minCamX = viewW - WORLD_WIDTH * zoom;
    const minCamY = viewH - WORLD_HEIGHT * zoom;
    camX = minCamX < 0 ? Math.max(minCamX, Math.min(0, camX)) : px((viewW - WORLD_WIDTH * zoom) / 2);
    camY = minCamY < 0 ? Math.max(minCamY, Math.min(0, camY)) : px((viewH - WORLD_HEIGHT * zoom) / 2);
  }

  ctx.save();
  ctx.translate(camX, camY);
  ctx.scale(zoom, zoom);

  const isRomantic =
    sim.slowDance.active ||
    sim.kissCutscene.active ||
    sim.questPhase === 'post_dance_confession' ||
    s2Cutscene === 'intro_memories' ||
    s2Cutscene === 'jealousy_slow_dance' ||
    s2Cutscene === 'retry_montage' ||
    s2Cutscene === 'forehead_kiss_farewell' ||
    s2Cutscene === 'ending_transition';

  if (interiorArt) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(interiorArt, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Subtle translucent beat-reactive disco shimmer over the central dance floor
    const beatPulse = Math.floor(sim.beatTimer * (isRomantic ? 1.0 : 2.1));
    const dancePalette = isRomantic
      ? ['rgba(255, 185, 198, 0.16)', 'rgba(255, 212, 138, 0.14)', 'rgba(232, 150, 178, 0.14)']
      : ['rgba(255, 206, 92, 0.18)', 'rgba(84, 224, 216, 0.16)', 'rgba(255, 112, 152, 0.16)'];
    for (let r = 5; r <= 11; r++) {
      for (let c = 7; c <= 16; c++) {
        if (MAP_GRID[r][c] === 'floor_dance' && (c + r + beatPulse) % 3 === 0) {
          ctx.fillStyle = dancePalette[(c * 3 + r + beatPulse) % dancePalette.length];
          ctx.fillRect(c * TILE_SIZE + 2, r * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }
      }
    }
  } else {
    const bgCanvas = getCachedInteriorCanvas();
    if (bgCanvas) {
      ctx.drawImage(bgCanvas, 0, 0);
      for (let r = 5; r <= 11; r++) {
        for (let c = 7; c <= 16; c++) {
          if (MAP_GRID[r][c] === 'floor_dance') {
            drawInteriorTile(ctx, 'floor_dance', c, r, sim.beatTimer, isRomantic);
          }
        }
      }
    } else {
      for (let r = 0; r < MAP_ROWS; r++) {
        for (let c = 0; c < MAP_COLS; c++) {
          drawInteriorTile(ctx, MAP_GRID[r][c], c, r, sim.beatTimer, isRomantic);
        }
      }
      drawCruzeiroMural(ctx);
    }
  }

  drawMirrorBallAndLights(ctx, sim);

  // Mood lighting overlays for Stage 1 romance & Stage 2 nostalgia/bittersweet shifts
  if (s2Cutscene === 'intro_memories' && s2) {
    if (s2.cutsceneElapsed < 7.4) {
      ctx.fillStyle = 'rgba(255, 190, 115, 0.14)';
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    } else {
      ctx.fillStyle = 'rgba(24, 30, 56, 0.34)';
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    }
  } else if (s2Cutscene === 'forehead_kiss_farewell' || s2Cutscene === 'ending_transition') {
    ctx.fillStyle = 'rgba(24, 16, 30, 0.36)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  } else if (isRomantic) {
    ctx.fillStyle = 'rgba(28, 12, 22, 0.24)';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  }

  // Draw collectible 90s memory sparkles during Stage 2 exploration
  if (sim.stageId === 'stage-2' && s2 && !s2Cutscene) {
    const unlockedSet = new Set(s2.unlockedMemories);
    for (const mem of STAGE_2_MEMORIES) {
      drawMemorySparkle(ctx, mem.x, mem.y - 6, sim.elapsedSeconds, unlockedSet.has(mem.id));
    }
  }

  // Resolve live dynamic expressions for in-world sprites during dialogue & cutscenes
  const activeLine = sim.activeDialogue
    ? sim.activeDialogue.lines[sim.dialogueLineIndex] ?? null
    : null;
  const arielEmotion =
    activeLine?.speaker === 'ariel'
      ? activeLine.emotion ?? 'happy'
      : sim.questPhase === 'post_dance_confession'
        ? 'romantic'
        : sim.stageId === 'stage-2'
          ? 'thoughtful'
          : 'happy';
  const lauraEmotion =
    activeLine?.speaker === 'laura' ? activeLine.emotion ?? 'happy' : 'happy';
  const graziEmotion =
    activeLine && (activeLine.speaker === 'grazi' || activeLine.speaker === 'grazi_thought')
      ? activeLine.emotion ?? 'neutral'
      : sim.player.reactionEmotion;

  // Helper to draw subtle pixel ellipsis bubble ("...") for silent visual beats
  const drawQuietEllipsis = (bx: number, by: number, tint = '#faeccd') => {
    const x = px(bx);
    const y = px(by);
    ctx.fillStyle = '#3b2011';
    ctx.fillRect(x - 10, y - 8, 20, 10);
    ctx.fillStyle = tint;
    ctx.fillRect(x - 9, y - 7, 18, 8);
    ctx.fillStyle = '#5c331d';
    ctx.fillRect(x - 6, y - 4, 2, 2);
    ctx.fillRect(x - 1, y - 4, 2, 2);
    ctx.fillRect(x + 4, y - 4, 2, 2);
  };

  // Helper to draw upbeat pixel funk reaction popups ("!", "♪") over cheering spectators
  const drawCheerPopup = (bx: number, by: number, kind: 'note' | 'bang', color: string) => {
    const x = px(bx);
    const y = px(by);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(x - 5, y - 6, 10, 10);
    ctx.fillStyle = '#fff6dc';
    ctx.fillRect(x - 4, y - 5, 8, 8);
    ctx.fillStyle = color;
    if (kind === 'bang') {
      ctx.fillRect(x - 1, y - 4, 2, 4);
      ctx.fillRect(x - 1, y + 1, 2, 2);
    } else {
      ctx.fillRect(x, y - 4, 2, 6);
      ctx.fillRect(x + 1, y - 4, 2, 2);
      ctx.fillRect(x - 2, y, 3, 2);
    }
  };

  // Y-sorted character & foreground furniture draw list
  const queue: Array<{ y: number; draw: () => void }> = [];

  // Push foreground DJ booth desk at row 2 bottom so DJ stands naturally behind it!
  // When the high-res Stardew Discoteca backdrop is loaded, draw only live equalizer pulse bars
  // so we preserve the rich pixel-art wooden DJ booth while keeping beat-reactive life.
  const isFunkScene = s2Cutscene === 'breakdance_circle';
  queue.push({
    y: 2.88 * TILE_SIZE,
    draw: () => {
      if (!interiorArt) {
        drawDjBoothForeground(ctx, sim.elapsedSeconds, isFunkScene);
      } else {
        const bx = 9.5 * TILE_SIZE;
        const by = 2.68 * TILE_SIZE;
        for (let i = 0; i < 12; i++) {
          const ex = bx + 18 + i * 11;
          const barH =
            2 +
            Math.floor(
              Math.abs(Math.sin(sim.elapsedSeconds * (isFunkScene ? 12 : 6.5) + i * 0.9)) * 6,
            );
          ctx.fillStyle = i % 3 === 0 ? '#ffd166' : i % 3 === 1 ? '#3edbd0' : '#ff6b8b';
          ctx.fillRect(ex, by + 6 - barH, 4, barH);
        }
      }
    },
  });

  // Stage 2 dedicated animated cutscenes replace principal actors cleanly on the dance floor
  const s2ReplacesPrincipals =
    s2Cutscene === 'intro_memories' ||
    s2Cutscene === 'jealousy_slow_dance' ||
    s2Cutscene === 'retry_montage' ||
    s2Cutscene === 'forehead_kiss_farewell' ||
    s2Cutscene === 'ending_transition' ||
    s2Cutscene === 'breakdance_circle';

  for (const npc of sim.npcs) {
    if (!npc.visible) continue;

    if (
      s2ReplacesPrincipals &&
      (npc.role === 'ariel' || npc.role === 'eloisa' || npc.role === 'friend' || npc.role === 'bboy')
    ) {
      continue;
    }

    if (
      s2Cutscene === 'breakdance_circle' &&
      (npc.role === 'dancer' || npc.role === 'bboy' || npc.role === 'laura')
    ) {
      continue;
    }

    if (npc.role === 'ariel') {
      if (sim.arielActivity === 'slow_dancing' || sim.arielActivity === 'kissing') {
        continue; // Rendered together in dedicated embrace / kiss couple draw!
      }
      queue.push({
        y: npc.y,
        draw: () => {
          if (sim.arielActivity === 'breakdance_cap') {
            drawArielBreakdanceCap(ctx, npc.x, npc.y, sim.elapsedSeconds);
          } else {
            const isWalking =
              sim.arielActivity === 'walking_to_grazi' ||
              Boolean(s2?.arielFleeing) ||
              (s2Cutscene === 'eloisa_reunion' && (s2?.cutsceneElapsed ?? 99) < 2.2);
            drawArielSprite(ctx, npc.x, npc.y, {
              dir: npc.dir,
              isMoving: isWalking,
              walkPhase: isWalking ? sim.elapsedSeconds * 8.5 : npc.dancePhaseOffset * 2.5,
              emotion: arielEmotion,
            });
            if (s2?.arielFleeing) {
              drawQuietEllipsis(npc.x, npc.y - 54);
            }
          }
        },
      });
      continue;
    }

    if (npc.role === 'eloisa') {
      queue.push({
        y: npc.y,
        draw: () => {
          const isWalking = s2Cutscene === 'eloisa_reunion' && (s2?.cutsceneElapsed ?? 99) < 2.2;
          drawEloisaSprite(ctx, npc.x, npc.y, {
            dir: npc.dir,
            isMoving: isWalking,
            walkPhase: sim.elapsedSeconds * 8.2 + 0.8,
          });
        },
      });
      continue;
    }

    if (npc.role === 'laura') {
      queue.push({
        y: npc.y,
        draw: () =>
          drawLauraSprite(ctx, npc.x, npc.y, {
            dir: npc.dir,
            emotion: lauraEmotion,
          }),
      });
      continue;
    }

    // Stage 2 live ambient Roda de Breakdance on the lower dance floor during exploration
    if (sim.stageId === 'stage-2' && npc.role === 'bboy' && !s2Cutscene) {
      queue.push({
        y: npc.y,
        draw: () => {
          drawBreakdanceShowcaseSprite(ctx, npc.x, npc.y, sim.elapsedSeconds, true);
        },
      });
      // Small cheering ring of spectators gathered around the ambient breakdancer
      const ambientRing = [
        { dx: -48, dy: -10, v: 0, dir: 'right' as const },
        { dx: 48, dy: -10, v: 2, dir: 'left' as const },
        { dx: -36, dy: 18, v: 1, dir: 'right' as const },
        { dx: 36, dy: 18, v: 0, dir: 'left' as const },
      ];
      for (let i = 0; i < ambientRing.length; i++) {
        const sp = ambientRing[i];
        const sy = npc.y + sp.dy;
        queue.push({
          y: sy,
          draw: () => {
            drawPatronSprite(
              ctx,
              npc.x + sp.dx,
              sy,
              sp.v,
              sp.dir,
              sim.elapsedSeconds * 8.4 + i * 1.4,
              true,
            );
          },
        });
      }
      continue;
    }

    const drawY = npc.role === 'dj' && interiorArt ? 104 : npc.y;
    queue.push({
      y: drawY,
      draw: () => {
        const isDancer = npc.role === 'dancer' || npc.role === 'bboy' || npc.role === 'dj';
        const dPhase =
          npc.role === 'dj'
            ? sim.elapsedSeconds * (isFunkScene ? 8.5 : 4.2)
            : sim.elapsedSeconds * (isRomantic ? 2.1 : 5.2) + npc.dancePhaseOffset * 6;
        if (npc.role === 'dj' && interiorArt) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(npc.x - 40, 20, 80, 74);
          ctx.clip();
          drawPatronSprite(ctx, npc.x, drawY, npc.variant, npc.dir, dPhase, isDancer, 'dj');
          ctx.restore();
          return;
        }
        drawPatronSprite(
          ctx,
          npc.x,
          drawY,
          npc.variant,
          npc.dir,
          dPhase,
          isDancer,
          npc.role === 'friend' ? 'bboy' : npc.role,
        );
      },
    });
  }

  // Stage 1 Cutscenes
  if (sim.kissCutscene.active) {
    queue.push({
      y: DISCO_BALL_POS.y + 4,
      draw: () =>
        drawFirstKissScene(
          ctx,
          DISCO_BALL_POS.x,
          DISCO_BALL_POS.y + 4,
          sim.kissCutscene.phase,
          sim.kissCutscene.elapsed,
        ),
    });
  } else if (sim.slowDance.active) {
    queue.push({
      y: DISCO_BALL_POS.y + 4,
      draw: () =>
        drawSlowDanceCouple(
          ctx,
          DISCO_BALL_POS.x,
          DISCO_BALL_POS.y + 4,
          sim.slowDance.swayPhase,
          0,
          sim.slowDance.elapsed,
        ),
    });
  } else if (s2Cutscene === 'intro_memories' && s2) {
    // Stage 2 Intro: Happy early dating memories -> 90s togetherness -> time passes & Ariel stops coming
    const t = s2.cutsceneElapsed;
    if (t < 3.8) {
      queue.push({
        y: DISCO_BALL_POS.y + 4,
        draw: () =>
          drawSlowDanceCouple(ctx, DISCO_BALL_POS.x, DISCO_BALL_POS.y + 4, t * 2.0, 0, 2.5),
      });
    } else if (t < 7.4) {
      const sway = Math.sin(t * 2.4) * 1.4;
      queue.push({
        y: DISCO_BALL_POS.y + 4,
        draw: () => {
          drawGraziSprite(ctx, DISCO_BALL_POS.x - 20 + sway, DISCO_BALL_POS.y + 4, {
            dir: 'right',
            emotion: 'happy',
          });
          drawArielSprite(ctx, DISCO_BALL_POS.x + 20 + sway, DISCO_BALL_POS.y + 3, {
            dir: 'left',
            emotion: 'happy',
          });
        },
      });
    } else {
      // Passage of time: dance floor center empty; Grazi stands quietly looking over the pista
      queue.push({
        y: 8.4 * TILE_SIZE,
        draw: () => {
          drawGraziSprite(ctx, 8.6 * TILE_SIZE, 8.4 * TILE_SIZE, {
            dir: 'right',
            emotion: 'thoughtful',
          });
          drawQuietEllipsis(8.6 * TILE_SIZE, 8.4 * TILE_SIZE - 54);
        },
      });
    }
  } else if (s2Cutscene === 'jealousy_slow_dance' && s2) {
    // Stage 2 Visual Storytelling: Left side Grazi + Ariel's friend dancing, Right side Ariel dancing with Eloisa while glancing jealously left!
    const t = s2.cutsceneElapsed;
    queue.push({
      y: 8.0 * TILE_SIZE,
      draw: () => drawGraziFriendSlowDance(ctx, 9.4 * TILE_SIZE, 8.0 * TILE_SIZE, t * 2.0),
    });
    queue.push({
      y: 7.9 * TILE_SIZE,
      draw: () => {
        drawArielEloisaSlowDance(ctx, 14.4 * TILE_SIZE, 7.9 * TILE_SIZE, t * 2.0);
        if (t >= 5.3 && t <= 8.6) {
          drawQuietEllipsis(14.1 * TILE_SIZE, 7.9 * TILE_SIZE - 56, '#f4d5b2');
        }
      },
    });
  } else if (s2Cutscene === 'breakdance_circle' && s2) {
    // Special 90s Memory Showcase: Center B-boy doing footwork/windmill/freeze surrounded by a cheering funk circle!
    const t = s2.cutsceneElapsed;
    const cx = DISCO_BALL_POS.x;
    const cy = DISCO_BALL_POS.y + 8;

    queue.push({
      y: cy,
      draw: () => {
        const { phase } = drawBreakdanceShowcaseSprite(ctx, cx, cy, t, false);
        if (phase === 'windmill' || phase === 'freeze') {
          drawCheerPopup(cx, cy - 58, phase === 'freeze' ? 'bang' : 'note', '#d94862');
        }
      },
    });

    // Cheering crowd ring of 8 patrons + Grazi & Laura reacting to every spin and freeze!
    const ringCount = 8;
    const rx = 86;
    const ry = 52;
    const bigMove = (t % 6.8) >= 3.0;
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2 + 0.25;
      const sx = cx + Math.cos(angle) * rx;
      const sy = cy + Math.sin(angle) * ry;
      const faceDir = sx < cx ? 'right' : 'left';
      const hypeJump = bigMove ? Math.abs(Math.sin(t * 11 + i * 1.3)) * -3.5 : 0;

      queue.push({
        y: sy,
        draw: () => {
          if (i === 2) {
            drawGraziSprite(ctx, sx, sy + hypeJump, {
              dir: faceDir,
              isDancing: true,
              dancePhase: t * 9.5 + i,
              emotion: 'happy',
            });
          } else if (i === 3) {
            drawLauraSprite(ctx, sx, sy + hypeJump, {
              dir: faceDir,
              isMoving: false,
              emotion: 'happy',
            });
          } else {
            drawPatronSprite(ctx, sx, sy + hypeJump, i % 4, faceDir, t * 10 + i * 1.2, true);
          }

          // Cheer & rhythm popups pulsing around the ring during big moves
          const showPop = bigMove
            ? Math.sin(t * 5.2 + i * 1.9) > 0.35
            : Math.sin(t * 3.5 + i * 2.1) > 0.72;
          if (showPop) {
            drawCheerPopup(
              sx,
              sy - 55 + hypeJump,
              i % 2 === 0 ? 'bang' : 'note',
              i % 2 === 0 ? '#e04f5f' : '#2e9e94',
            );
          }
        },
      });
    }
  } else if (s2Cutscene === 'retry_montage' && s2) {
    // Stage 2 Retry Montage: Talking gently -> warm slow dance together again -> quiet distance returning
    const t = s2.cutsceneElapsed;
    if (t < 3.2) {
      queue.push({
        y: DISCO_BALL_POS.y + 4,
        draw: () => {
          drawGraziSprite(ctx, DISCO_BALL_POS.x - 22, DISCO_BALL_POS.y + 4, {
            dir: 'right',
            emotion: 'happy',
          });
          drawArielSprite(ctx, DISCO_BALL_POS.x + 22, DISCO_BALL_POS.y + 3, {
            dir: 'left',
            emotion: 'happy',
          });
        },
      });
    } else if (t < 6.2) {
      queue.push({
        y: DISCO_BALL_POS.y + 4,
        draw: () =>
          drawSlowDanceCouple(ctx, DISCO_BALL_POS.x, DISCO_BALL_POS.y + 4, t * 2.0, 0, 2.5),
      });
    } else {
      const drift = Math.min(1, (t - 6.2) / 2.2);
      queue.push({
        y: DISCO_BALL_POS.y + 4,
        draw: () => {
          drawGraziSprite(ctx, DISCO_BALL_POS.x - 24, DISCO_BALL_POS.y + 4, {
            dir: 'right',
            emotion: 'thoughtful',
          });
          drawArielSprite(ctx, DISCO_BALL_POS.x + 22 + drift * 58, DISCO_BALL_POS.y + 3, {
            dir: 'right',
            isMoving: true,
            walkPhase: t * 7.5,
            emotion: 'thoughtful',
          });
        },
      });
    }
  } else if (s2Cutscene === 'forehead_kiss_farewell' && s2) {
    // Stage 2 Farewell: Approach -> Tender Forehead Kiss -> "Não dá mais, tá?" -> Ariel walks quietly away
    const t = s2.cutsceneElapsed;
    const cx = 12.2 * TILE_SIZE;
    const cy = 8.2 * TILE_SIZE;

    if (t < 2.0) {
      const p = Math.min(1, t / 1.8);
      const e = p * p * (3 - 2 * p);
      const arielX = cx + 34 - e * 20;
      queue.push({
        y: cy,
        draw: () => {
          drawGraziSprite(ctx, cx - 15, cy, {
            dir: 'right',
            emotion: 'sad',
          });
          drawArielSprite(ctx, arielX, cy - 0.5, {
            dir: 'left',
            isMoving: p < 0.92,
            walkPhase: t * 6.5,
            emotion: 'thoughtful',
          });
        },
      });
    } else if (t < 5.2) {
      queue.push({
        y: cy,
        draw: () => drawArielForeheadKiss(ctx, cx, cy, t - 2.0),
      });
    } else if (t < 8.2) {
      const back = Math.min(1, (t - 5.2) / 0.8);
      queue.push({
        y: cy,
        draw: () => {
          drawGraziSprite(ctx, cx - 17, cy, {
            dir: 'right',
            emotion: 'sad',
          });
          drawArielSprite(ctx, cx + 15 + back * 10, cy - 0.5, {
            dir: 'left',
            emotion: 'thoughtful',
          });
        },
      });
    } else {
      const walkAway = Math.min(1, (t - 8.2) / 2.6);
      queue.push({
        y: cy,
        draw: () => {
          drawGraziSprite(ctx, cx - 17, cy, {
            dir: 'right',
            emotion: 'sad',
          });
          drawArielSprite(ctx, cx + 25 + walkAway * 96, cy + walkAway * 34, {
            dir: walkAway < 0.7 ? 'right' : 'down',
            isMoving: true,
            walkPhase: t * 6.8,
            emotion: 'thoughtful',
          });
        },
      });
    }
  } else if (s2Cutscene === 'ending_transition') {
    // Quiet reflective scene framing the closing quote
    queue.push({
      y: 8.6 * TILE_SIZE,
      draw: () =>
        drawGraziSprite(ctx, 11.4 * TILE_SIZE, 8.6 * TILE_SIZE, {
          dir: 'down',
          emotion: 'thoughtful',
        }),
    });
  } else {
    queue.push({
      y: sim.player.y,
      draw: () => {
        drawGraziSprite(ctx, sim.player.x, sim.player.y, {
          dir: sim.player.dir,
          isMoving: sim.player.isMoving,
          walkPhase: sim.player.walkDistance * 0.25,
          emotion: graziEmotion,
        });
        if (s2Cutscene === 'eloisa_reunion' && s2 && s2.cutsceneElapsed >= 5.2) {
          drawQuietEllipsis(sim.player.x, sim.player.y - 54);
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
}
