import {
  SKIN_URLS,
  getCharacterWalkSheetImage,
  getGraziWalkSheetImage,
  getSkinSprite,
} from './characterSkins';
import type { ProcessedSprite } from './spriteSheet';
import type { Direction } from './types';

export const OUTLINE = '#24130c';

export function px(v: number): number {
  return Math.round(v);
}

export const GLOBAL_CHAR_SCALE = 1.6;
const GRAZI_ARIEL_WALK_FRAME_SEQUENCES = {
  right: [0, 1, 2, 6],
  left: [3, 4, 5, 7],
} as const;

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx = 9,
  ry = 3.5,
): void {
  ctx.fillStyle = 'rgba(22, 10, 6, 0.34)';
  ctx.beginPath();
  ctx.ellipse(px(cx), px(cy), rx * 1.45, ry * 1.38, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCoupleJoinedHands(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  highlight = false,
): void {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  if (dist > 26 || dist < 6) return;

  const leftX = Math.min(x1, x2);
  const rightX = Math.max(x1, x2);
  const mx = Math.round((leftX + rightX) / 2);
  const my = Math.round((y1 + y2) / 2 - 20);

  if (highlight) {
    ctx.fillStyle = 'rgba(255, 210, 148, 0.34)';
    ctx.beginPath();
    ctx.arc(mx, my, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  const armSpan = Math.max(3, Math.min(8, Math.round((rightX - leftX - 14) / 2)));
  ctx.fillStyle = '#c88d67';
  ctx.fillRect(mx - armSpan - 1, my - 1, armSpan * 2 + 2, 3);
  ctx.fillStyle = '#efc09b';
  ctx.fillRect(mx - 3, my - 2, 6, 3);
  ctx.fillStyle = '#b47855';
  ctx.fillRect(mx - 3, my + 1, 6, 2);
  ctx.fillStyle = '#fff0d8';
  ctx.fillRect(mx - 1, my - 1, 2, 1);
}

// ============================================================================
// HIGH-RESOLUTION ROUNDED PIXEL MATRIX ENGINE (32x42 Stardew-Grade Sprites)
// Drawn at GLOBAL_CHAR_SCALE for cohesive Stardew-Valley character-to-world ratio
// ============================================================================
type PaletteMap = Record<string, string>;

const spriteCanvasCache = new Map<string, HTMLCanvasElement>();
const HI_RES_SPRITE_SCALE = 0.72;

// ============================================================================
// HIGH-RESOLUTION TRANSPARENT SKIN RENDERER (Approved 32-Bit Stardew Quality)
// Foot-anchored at cy + 8.5, crisp high-quality downsampling, smooth pivot sway
// ============================================================================
export interface SkinDrawOpts {
  flipX?: boolean;
  tiltRad?: number;
  scaleX?: number;
  scaleY?: number;
}

export function drawSkinImage(
  ctx: CanvasRenderingContext2D,
  sprite: ProcessedSprite,
  cx: number,
  cy: number,
  targetH: number,
  opts: SkinDrawOpts = {},
): void {
  const aspect = sprite.width / Math.max(1, sprite.height);
  const drawH = targetH * GLOBAL_CHAR_SCALE;
  const drawW = drawH * aspect;
  const footY = cy + 8.5;

  const prevSmooth = ctx.imageSmoothingEnabled;
  const prevQuality = ctx.imageSmoothingQuality;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(cx, footY);
  if (opts.tiltRad) {
    ctx.rotate(opts.tiltRad);
  }
  const sx = (opts.flipX ? -1 : 1) * (opts.scaleX ?? 1);
  const sy = opts.scaleY ?? 1;
  if (sx !== 1 || sy !== 1) {
    ctx.scale(sx, sy);
  }
  ctx.drawImage(sprite.canvas, -drawW / 2, -drawH, drawW, drawH);
  ctx.restore();

  ctx.imageSmoothingEnabled = prevSmooth;
  ctx.imageSmoothingQuality = prevQuality;
}

function drawMatrix(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rows: string[],
  palette: PaletteMap,
  cacheKey?: string,
  flipX = false,
  pixelScale = HI_RES_SPRITE_SCALE,
): void {
  const h = rows.length;
  const w = rows[0]?.length ?? 0;
  const scaledPixel = pixelScale * GLOBAL_CHAR_SCALE;
  const drawW = px(w * scaledPixel);
  const drawH = px(h * scaledPixel);
  const drawX = px(cx - drawW / 2);
  const drawY = px(cy - drawH + 9); // anchor feet near cy + 8

  if (cacheKey && typeof document !== 'undefined') {
    const fullKey = `${cacheKey}|${flipX ? '1' : '0'}`;
    let cached = spriteCanvasCache.get(fullKey);
    if (!cached) {
      cached = document.createElement('canvas');
      cached.width = w;
      cached.height = h;
      const octx = cached.getContext('2d');
      if (octx) {
        if (flipX) {
          octx.translate(w, 0);
          octx.scale(-1, 1);
        }
        renderMatrixDirect(octx, 0, 0, rows, palette);
      }
      spriteCanvasCache.set(fullKey, cached);
    }
    const prevSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cached, drawX, drawY, drawW, drawH);
    ctx.imageSmoothingEnabled = prevSmooth;
    return;
  }

  ctx.save();
  ctx.translate(drawX, drawY);
  ctx.scale(scaledPixel, scaledPixel);
  if (flipX) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  renderMatrixDirect(ctx, 0, 0, rows, palette);
  ctx.restore();
}

function renderMatrixDirect(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  rows: string[],
  palette: PaletteMap,
): void {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      if (ch === '.' || ch === ' ') {
        c++;
        continue;
      }
      let end = c + 1;
      while (end < row.length && row[end] === ch) {
        end++;
      }
      const color = palette[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(ox + c, oy + r, end - c, 1);
      }
      c = end;
    }
  }
}

// ============================================================================
// PALETTES (Smooth Multi-Tone Transitions — Dark-Blonde Sisters + Parda Ariel)
// ============================================================================
const SISTER_HAIR_PALETTE = {
  o: '#2b160d', // warm soft mahogany outline
  H: '#754b1c', // deep dark-blonde shadow
  h: '#9e6c2b', // dark-blonde base
  L: '#c48f45', // mid golden-blonde strand
  S: '#e2b66c', // sunlit hair highlight
  B: '#85582c', // soft thin natural brow
};

const GRAZI_PALETTE: PaletteMap = {
  ...SISTER_HAIR_PALETTE,
  f: '#fce0cb', // fair warm skin light
  n: '#f2c8ad', // soft nose/cheek midtone
  s: '#dfb094', // gentle chin/neck shade
  b: '#f499ae', // rosy cheek blush
  e: '#2c1911', // soft dark lash & pupil
  i: '#6c472d', // warm hazel-brown iris
  w: '#ffffff', // eye catchlight / sneakers
  m: '#c4636c', // delicate warm rose smile
  M: '#fff4ec', // bright laugh teeth highlight
  K: '#1f1e28', // black 90s top base
  k: '#38374a', // top soft highlight
  d: '#13121a', // top deep shade
  G: '#d8a63c', // gold wristwatch
  C: '#5e6b43', // camo skirt base
  c: '#3c4529', // camo dark patch
  l: '#8d9268', // camo light patch
  p: '#d6d0c4', // sneaker sole shade
};

const LAURA_PALETTE: PaletteMap = {
  ...SISTER_HAIR_PALETTE,
  f: '#fadac3', // fair warm skin
  n: '#efc3a7', // soft midtone
  s: '#dcab8f', // gentle shade
  b: '#f499ae', // rosy cheek blush
  e: '#2c1911', // soft dark lash & pupil
  i: '#6c472d', // warm hazel-brown iris
  w: '#ffffff',
  m: '#c4636c', // delicate warm rose smile
  M: '#fff4ec',
  r: '#e86688', // coral hair-clip base
  R: '#ffb3c7', // coral hair-clip shine
  T: '#c84b73', // rosy 90s vest base
  t: '#e87698', // vest highlight
  d: '#963253', // vest deep shade
  I: '#fbf0dc', // cream inner tee
  J: '#3a5f96', // 90s blue jeans base
  j: '#5d87c4', // denim highlight
  z: '#294570', // denim shadow
  p: '#d6d0c4',
};

const ARIEL_PALETTE: PaletteMap = {
  o: '#24120b', // warm soft outline
  K: '#16111b', // curly black hair deep
  k: '#282032', // curly black hair mid
  c: '#3e324c', // curl highlight
  B: '#161722', // black backwards cap
  b: '#2e2e40', // cap brim & highlight
  g: '#2ab586', // teal Ducks emblem
  G: '#7ef0c7', // Ducks emblem shine
  f: '#b8764d', // parda skin base
  n: '#cf8e65', // parda warm highlight
  s: '#925533', // parda gentle shade
  r: '#d6826e', // warm rosy cheek blush
  E: '#4a2b1c', // soft relaxed brow
  e: '#23130c', // soft dark pupil & lash
  i: '#573623', // warm friendly brown iris
  w: '#ffffff', // eye catchlight / white stripe / sneakers
  m: '#7d422c', // natural warm smile
  M: '#fff5ea', // bright friendly grin highlight
  W: '#1d1e2b', // windbreaker black
  U: '#2864cf', // windbreaker royal blue
  u: '#4d8af0', // windbreaker blue highlight
  P: '#252838', // baggy dark pants
  p: '#3b4059', // pants highlight
  v: '#d6d2c8', // sole shade
};

// ============================================================================
// GRAZI MATRICES (32x42 High-Res Rounded Face, Flowing Dark-Blonde Hair)
// ============================================================================
const GRAZI_FRONT_BASE: string[] = [
  '...........oooooooooo...........',
  '........oooLLLLSSLLLLooo........',
  '......ooHHhLLLSLLSSLLhHHoo......',
  '.....oHHhLLhLLhLLhLLhLLhHHo.....',
  '....oHhLLhLhhffffffhhLhLLhHo....',
  '...oHhLLhffffffffffffffhLLhHo...',
  '...oHhLhfffweffffffwefffhLhHo...',
  '...oHhLhfffieffffffiefffhLhHo...',
  '...oHhLhfffiiffffffiifffhLhHo...',
  '...oHhLhfbbffffnnffffbbfhLhHo...',
  '...oHhLhfbbfffmffmfffbbfhLhHo...',
  '...oHhLhffsnfffmmfffnsffhLhHo...',
  '...oHhLhhffsssffffsssffhhLhHo...',
  '...oHhLHHooffssssssffooHHLhHo...',
  '...oHhLHoKKoofssssfooKKoHLhHo...',
  '...oHhLoKKkkKooffooKkkKKoLhHo...',
  '...oHhLoKkkkKKKKKKKKkkkKoLhHo...',
  '...oHhLoKKkKKkKKKKkKKkKKoLhHo...',
  '...oHfoKkkKKkKKKKKKkKKkkKofHo...',
  '...oHfoKKdKKkKKKKKKkKKdKKofHo...',
  '...oHfoKKoKKkKKKKKKkKKoKKofHo...',
  '...oHfoKKoKKkKKKKKKkKKoKKofHo...',
  '...oHsfGoKKKKdKKKKdKKKKoGfsHo...',
  '...oHffGoKKKKKKKKKKKKKKoGffHo...',
  '....oGGooCCcCClCCClCCcCCooGo....',
  '....ooo.oCCccClCCClCccCCo.oo....',
  '.......oCCCcCCClClCCCcCCCo......',
  '.......oClCCCcCCCCCcCCClCo......',
  '......oCCcClCCCCCCCCClCcCCo.....',
  '......oCCCcCCCcCCcCCCcCCCCo.....',
  '.......oooCCCCCCCCCCCCooo.......',
  '.........ooofff..fffooo.........',
  '..........offff..ffffo..........',
  '..........offnf..fnffo..........',
  '..........offsf..fsffo..........',
  '..........osfff..fffso..........',
  '..........oowww..wwwoo..........',
  '.........owwwww..wwwwwo.........',
  '.........owwwwp..pwwwwo.........',
  '.........oppppp..pppppo.........',
  '..........ooooo..ooooo..........',
  '................................',
];

const GRAZI_BACK_BASE: string[] = [
  '...........oooooooooo...........',
  '........oooLLLLSSLLLLooo........',
  '......ooHHhLLLSLLSSLLhHHoo......',
  '.....oHHhLLhLLhLLhLLhLLhHHo.....',
  '....oHhLLhLLhLLLLLLhLLhLLhHo....',
  '...oHhLLhLLhLLLLLLLLhLLhLLhHo...',
  '...oHhLLhLLhLLLSSLLLhLLhLLhHo...',
  '...oHhLLhLLhLLLLLLLLhLLhLLhHo...',
  '...oHhLLhLLhLLhLLhLLhLLhLLhHo...',
  '...oHhLLhLLhLLhLLhLLhLLhLLhHo...',
  '...oHhLLhLLhLLhLLhLLhLLhLLhHo...',
  '...oHhLLhLLhLLhLLhLLhLLhLLhHo...',
  '...oHhLLhLLhLLhLLhLLhLLhLLhHo...',
  '...oHhLLhLLhLLhLLhLLhLLhLLhHo...',
  '...oHhLoKhhLLhLLLLhLLhhKoLhHo...',
  '...oHhLoKKhhLLhLLhLLhhKKoLhHo...',
  '...oHhLoKKkhhLLLLLLhhkKKoLhHo...',
  '...oHhLoKKkkhhLLLLhhkkKKoLhHo...',
  '...oHfoKKdKKhhhhhhhhKKdKKofHo...',
  '...oHfoKKoKKohhhhhhoKKoKKofHo...',
  '...oHfoKKoKKooooooooKKoKKofHo...',
  '...oHfoKKoKKKKKKKKKKKKoKKofHo...',
  '...oHsfGoKKKKdKKKKdKKKKoGfsHo...',
  '...oHffGoKKKKKKKKKKKKKKoGffHo...',
  '....oGGooCCcCClCCClCCcCCooGo....',
  '....ooo.oCCccClCCClCccCCo.oo....',
  '.......oCCCcCCClClCCCcCCCo......',
  '.......oClCCCcCCCCCcCCClCo......',
  '......oCCcClCCCCCCCCClCcCCo.....',
  '......oCCCcCCCcCCcCCCcCCCCo.....',
  '.......oooCCCCCCCCCCCCooo.......',
  '.........ooofff..fffooo.........',
  '..........offff..ffffo..........',
  '..........offnf..fnffo..........',
  '..........offsf..fsffo..........',
  '..........osfff..fffso..........',
  '..........oowww..wwwoo..........',
  '.........owwwww..wwwwwo.........',
  '.........owwwwp..pwwwwo.........',
  '.........oppppp..pppppo.........',
  '..........ooooo..ooooo..........',
  '................................',
];

const GRAZI_SIDE_BASE: string[] = [
  '..........oooooooooo............',
  '........ooLLLLSSLLLLoo..........',
  '......ooHHhLLLSLLSSLLho.........',
  '.....oHHhLLhLLhLLhLLhLho........',
  '....oHhLLhLLhLhhfffffhLho.......',
  '....oHhLLhLLhfffffffffhho.......',
  '....oHhLLhLhfffffffwefhho.......',
  '....oHhLLhLhfffffffiefhho.......',
  '....oHhLLhLhfffffffiifhho.......',
  '....oHhLLhLhfnnfbbfnffhho.......',
  '....oHhLLhLhfffbbffffmfho.......',
  '....oHhLLhLhhfsffffmmffo........',
  '....oHhLLhLhhffssssfffoo........',
  '....oHhLLhHooKKfsssffo..........',
  '....oHhLLHoKKkkKooffoo..........',
  '....oHhLLoKkkkkKKKKKKo..........',
  '....oHhLoKKkKKkKKKKKKKo.........',
  '....oHhLoKKkKKkKKKKKffo.........',
  '....oHhLoKKdKKkKKKKKffo.........',
  '....oHhLoKKkKKkKKKKKGfo.........',
  '....oHhLoKKkKKkKKKKGGfo.........',
  '....oHhLoKKdKKkKKKKffso.........',
  '....oHhLoKKKKKKKKKKffo..........',
  '....oHhLooKKKKKKKKKoo...........',
  '.....oHhooCCcCClCCCo............',
  '......ooo.oCCccClCCCo...........',
  '..........oCCCcCCClCCo..........',
  '..........oClCCCcCCCCo..........',
  '.........oCCcClCCCCCCCo.........',
  '.........oCCCcCCCcCCCCo.........',
  '..........oooCCCCCCCoo..........',
  '............oofffffoo...........',
  '............offfffffo...........',
  '............offnffffo...........',
  '............offfsfffo...........',
  '............osfffffso...........',
  '............oowwwwwwo...........',
  '...........owwwwwwwwwo..........',
  '...........owwwwwwwppo..........',
  '...........opppppppppo..........',
  '............ooooooooo...........',
  '................................',
];

// ============================================================================
// LAURA MATRICES (32x42 Same Dark-Blonde Sister Hair + Coral Clip + Rosy Vest)
// ============================================================================
const LAURA_FRONT_BASE: string[] = [
  '...........oooooooooo...........',
  '........oooLLLLSSLLLLooo........',
  '......ooHHhLLLSLLrRRrhHHoo......',
  '.....oHHhLLhLLhLLrrrrLLhHHo.....',
  '....oHhLLhLhhffffffhhLhLLhHo....',
  '...oHhLLhffffffffffffffhLLhHo...',
  '...oHhLhfffweffffffwefffhLhHo...',
  '...oHhLhfffieffffffiefffhLhHo...',
  '...oHhLhfffiiffffffiifffhLhHo...',
  '...oHhLhfbbffffnnffffbbfhLhHo...',
  '...oHhLhfbbfffmffmfffbbfhLhHo...',
  '...oHhLhffsnfffmmfffnsffhLhHo...',
  '...oHhLhhffsssffffsssffhhLhHo...',
  '...oHhLHHooffssssssffooHHLhHo...',
  '...oHhLHoTToofssssfooTToHLhHo...',
  '...oHhLoTTttIooffooIttTToLhHo...',
  '...oHhLoTtttTIIIIIITtttToLhHo...',
  '...oHhLoTTtTTtIIIItTTtTToLhHo...',
  '...oHfoTttTTtTIIIITtTTttTofHo...',
  '...oHfoTTdTTtTIIIITtTTdTTofHo...',
  '...oHfoTToTTtTTIITTtTToTTofHo...',
  '...oHfoTToTTtTTTTTTtTToTTofHo...',
  '...oHsff.oTTTTdTTdTTTTo.ffsHo...',
  '...oHfff.oTTTTTTTTTTTTo.fffHo...',
  '....oooo.oJJjJJjjJJjJJo.oooo....',
  '........oJJjjJJjjJJjjJJo........',
  '.......oJJjJJJJjjJJJJjJJo.......',
  '.......oJzJJJJJjjJJJJJzJo.......',
  '.......oJJjJJJJJJJJJJjJJo.......',
  '.......oJJJJJzJ..JzJJJJJo.......',
  '........ooJJJjJ..jJJJoo.........',
  '..........oJJjJ..jJJo...........',
  '..........oJzJJ..JJzJo..........',
  '..........oJJjJ..jJJo...........',
  '..........oJJJJ..JJJJo..........',
  '..........oJzjJ..JjzJo..........',
  '..........oowww..wwwoo..........',
  '.........owwwww..wwwwwo.........',
  '.........owwwwp..pwwwwo.........',
  '.........oppppp..pppppo.........',
  '..........ooooo..ooooo..........',
  '................................',
];

const LAURA_SIDE_BASE: string[] = [
  '..........oooooooooo............',
  '........ooLLLLSSLLLLoo..........',
  '......ooHHhLLrRRrSSLLho.........',
  '.....oHHhLLhLrrrrLLhLho.........',
  '....oHhLLhLLhLhhfffffhLho.......',
  '....oHhLLhLLhfffffffffhho.......',
  '....oHhLLhLhfffffffwefhho.......',
  '....oHhLLhLhfffffffiefhho.......',
  '....oHhLLhLhfffffffiifhho.......',
  '....oHhLLhLhfnnfbbfnffhho.......',
  '....oHhLLhLhfffbbffffmfho.......',
  '....oHhLLhLhhfsffffmmffo........',
  '....oHhLLhLhhffssssfffoo........',
  '....oHhLLhHooTTfsssffo..........',
  '....oHhLLHoTTttIooffoo..........',
  '....oHhLLoTtttTIIITTTTo.........',
  '....oHhLoTTtTTtIIITTTTo.........',
  '....oHhLoTTtTTtIIITTffo.........',
  '....oHhLoTTdTTtTTTTTffo.........',
  '....oHhLoTTtTTtTTTTTffo.........',
  '....oHhLoTTtTTtTTTTTffo.........',
  '....oHhLoTTdTTtTTTTffso.........',
  '....oHhLoTTTTTTTTTTffo..........',
  '....oHhLooTTTTTTTTToo...........',
  '.....oHhooJJjJJjjJJo............',
  '......ooo.oJJjjJJjjJo...........',
  '..........oJJjJJJJjjJo..........',
  '..........oJzJJJJJJJJo..........',
  '..........oJJjJJJJJJJo..........',
  '..........oJJJJzJJJJJo..........',
  '...........ooJJJJJJoo...........',
  '............oJJjJJJo............',
  '............oJzJJJJo............',
  '............oJJjJJJo............',
  '............oJJJJJJo............',
  '............oJzjJJJo............',
  '............oowwwwwwo...........',
  '...........owwwwwwwwwo..........',
  '...........owwwwwwwppo..........',
  '...........opppppppppo..........',
  '............ooooooooo...........',
  '................................',
];

// ============================================================================
// ARIEL MATRICES (32x42 Parda Skin, Curly Black Hair, Backwards Cap, Warm Smile)
// ============================================================================
const ARIEL_FRONT_BASE: string[] = [
  '..........oooooooooo............',
  '........ooBBBBBBBBBBoo..........',
  '......ooBBbbBBBBBBbbBBoo........',
  '.....oBBbgggGGGGGGgggbBBo.......',
  '...oobBBBBggggggggggBBBBbo......',
  '...obbBBBBBBBBBBBBBBBBBBbo......',
  '..oobboKKKKkKKKKKKkKKKKoo.......',
  '..oKkckKffnnnnnnnnnnffKckKo.....',
  '..oKkcKffffffffffffffffKckKo....',
  '.oKkcKffffweffffffweffffKckKo...',
  '.oKkcKffffieffffffieffffKckKo...',
  '.oKkckffffiiffffffiiffffkckKo...',
  '.oKkcKffrrffffnnffffrrffKckKo...',
  '.oKkckffrrfffmMMmfffrrffkckKo...',
  '..oKkcKffsfffmmmmfffsffKckKo....',
  '..oKKckKffssssffssssffKckKKo....',
  '..ooKKkKooffssssssffookKKoo.....',
  '...ooKKoWWWWooooooWWWWoKKoo.....',
  '...oWWWWWuuWWWWWWWWuuWWWWWo.....',
  '..oWWWwUUUUuuUUUUuuUUUUwWWWo....',
  '..oWWwUUUUUUuuUUuuUUUUUUwWWo....',
  '..oWWUUUUUUUUuuuuUUUUUUUUWWo....',
  '..oWWwwwwwwwwwwwwwwwwwwwwWWo....',
  '..oWWwWWWWWWWWWWWWWWWWWWwWWo....',
  '..oWfWWoPPPPPPPPPPPPPPoWWfWo....',
  '..oWnfWoPPpPPPppPPPpPPoWfnWo....',
  '..oWsfWoPPppPPppPPppPPoWfsWo....',
  '...oooo.oPPpPPPPPPpPPo.oooo.....',
  '........oPpPPPPPPPPpPo..........',
  '.......oPPPpPPPpPPpPPPo.........',
  '.......oPPpPPP..PPPpPPo.........',
  '.......oPPpPPP..PPPpPPo.........',
  '........oPPPPP..PPPPPo..........',
  '........oPpPPP..PPPpPo..........',
  '........oPPPPP..PPPPPo..........',
  '........oPPpPP..PPpPPo..........',
  '........ooowww..wwwooo..........',
  '........owwwww..wwwwwo..........',
  '........owwwwv..vwwwwo..........',
  '........ovvvvv..vvvvvo..........',
  '.........ooooo..ooooo...........',
  '................................',
];

// Ariel holding backwards cap brim during breakdance (relaxed charismatic grin!)
const ARIEL_HAND_ON_CAP: string[] = [
  '..........oooooooooo...oooo.....',
  '........ooBBBBBBBBBBooUUUUoo....',
  '......ooBBbbBBBBBBbbfnUUUUUuo...',
  '.....oBBbgggGGGGGGgfnUUuWWUUo...',
  '...oobBBBBggggggggsnfUUWWWWWoo..',
  '...obbBBBBBBBBBBBBooWWWWWWWWo...',
  '..oobboKKKKkKKKKKKooUUuWWWWWo...',
  '..oKkckKffnnnnnnnnffKUUuWWWo....',
  '..oKkcKffffffffffffffKUUuWWo....',
  '.oKkcKffffweffffffweffKUuWWo....',
  '.oKkcKffffieffffffieffKUUWWo....',
  '.oKkckffffiiffffffiiffkUWWo.....',
  '.oKkcKffrrffffnnffffrrfWWo......',
  '.oKkckffrrfffmMMmfffrrfkKo......',
  '..oKkcKffsffmMMMMmffsffKckKo....',
  '..oKKckKffssssffssssffKckKKo....',
  '..ooKKkKooffssssssffookKKoo.....',
  '...ooKKoWWWWooooooWWWWoKKoo.....',
  '...oWWWWWuuWWWWWWWWuuWWWWo......',
  '..oWWWwUUUUuuUUUUuuUUUUwWWo.....',
  '..oWWwUUUUUUuuUUuuUUUUUUWWo.....',
  '..oWWUUUUUUUUuuuuUUUUUUUWWo.....',
  '..oWWwwwwwwwwwwwwwwwwwwwWWo.....',
  '..oWWwWWWWWWWWWWWWWWWWWWo.......',
  '..oWfWWoPPPPPPPPPPPPPPo.........',
  '..oWnfWoPPpPPPppPPPpPPo.........',
  '..oWsfWoPPppPPppPPppPPo.........',
  '...oooo.oPPpPPPPPPpPPo..........',
  '........oPpPPPPPPPPpPo..........',
  '.......oPPPpPPPpPPpPPPo.........',
  '.......oPPpPPP..PPPpPPo.........',
  '.......oPPpPPP..PPPpPPo.........',
  '........oPPPPP..PPPPPo..........',
  '........oPpPPP..PPPpPo..........',
  '........oPPPPP..PPPPPo..........',
  '........oPPpPP..PPpPPo..........',
  '........ooowww..wwwooo..........',
  '........owwwww..wwwwwo..........',
  '........owwwwv..vwwwwo..........',
  '........ovvvvv..vvvvvo..........',
  '.........ooooo..ooooo...........',
  '................................',
];

const ARIEL_SIDE_BASE: string[] = [
  '..........oooooooooo............',
  '........ooBBBBBBBBBBoo..........',
  '......ooBBbbBBBBBBbbBBoo........',
  '.....oBBbgggGGGGGGgggbBBoo......',
  '.....obBBBBggggggggBBBBbbboo....',
  '.....obBBBBBBBBBBBBBBBBbbbbo....',
  '.....oKKKKkKKKKKKkKKKKKbbbo.....',
  '....oKkcKkkffffnnnnnfffKoo......',
  '....oKkcKkfffffffffffffKo.......',
  '....oKkcKkfffffffweffffKo.......',
  '....oKkcKkfffffffieffffKo.......',
  '....oKkcKkfffffffiiffffKo.......',
  '....oKkcKkffnnfrrffffffKo.......',
  '....oKkcKkffffrrffffmMfo........',
  '....oKkcKkkfsffffffmmffo........',
  '....oKKckKkffsssssfffoo.........',
  '....ooKKkKoWWfsssffo............',
  '.....ooKKoWWWWoooffo............',
  '......oWWWWuuWWWWWWo............',
  '.....oWWwUUUUuuUUUwWo...........',
  '.....oWWUUUUUuuUUUUWWo..........',
  '.....oWWwwwwwwwwwwwWWo..........',
  '.....oWWwWWWWWWWWWWffo..........',
  '.....oWWoPPPPPPPPPPffo..........',
  '.....oWfoPPpPPPppPPnfo..........',
  '.....oWsoPPppPPppPPffo..........',
  '......oo.oPPpPPPPPPoo...........',
  '.........oPpPPPPPPPo............',
  '.........oPPPpPPPpPo............',
  '.........oPPpPPPPPPo............',
  '.........oPPpPPPPPPo............',
  '..........oPPPPPPPo.............',
  '..........oPpPPPPPo.............',
  '..........oPPPPPPPo.............',
  '..........oPPpPPPPo.............',
  '..........ooowwwwwo.............',
  '..........owwwwwwwwo............',
  '..........owwwwwwvvo............',
  '..........ovvvvvvvvo............',
  '...........oooooooo.............',
  '................................',
  '................................',
];

export type SpriteEmotion =
  | 'none'
  | 'neutral'
  | 'happy'
  | 'curious'
  | 'surprised'
  | 'amused'
  | 'blush'
  | 'uneasy'
  | 'sad'
  | 'determined'
  | 'thoughtful'
  | 'romantic'
  | 'kiss_closed';

// Patch dynamic friendly Stardew expressions onto 32x42 Grazi & Laura sprites
function applySisterEmotion(
  rows: string[],
  emotion: SpriteEmotion | undefined,
  isSide: boolean,
): string[] {
  if (!emotion || emotion === 'none' || emotion === 'neutral') return rows;
  const copy = [...rows];
  if (isSide) {
    if (emotion === 'amused') {
      copy[6] = '....oHhLLhLhfffffffffhhho.......';
      copy[7] = '....oHhLLhLhfffffffiifhho.......';
      copy[8] = '....oHhLLhLhfffffffffhhho.......';
      copy[9] = '....oHhLLhLhfnfbbbfnffhho.......';
      copy[10] = '....oHhLLhLhffbbbfffMmfho.......';
      copy[11] = '....oHhLLhLhhfsfffmMmffo........';
    } else if (emotion === 'happy') {
      copy[9] = '....oHhLLhLhfnfbbbfnffhho.......';
      copy[10] = '....oHhLLhLhffbbbfffMmfho.......';
      copy[11] = '....oHhLLhLhhfsffffmmffo........';
    } else if (emotion === 'blush' || emotion === 'romantic') {
      copy[9] = '....oHhLLhLhfnfbbbfnffhho.......';
      copy[10] = '....oHhLLhLhffbbbffffmfho.......';
    } else if (emotion === 'kiss_closed') {
      copy[6] = '....oHhLLhLhfffffffffhhho.......';
      copy[7] = '....oHhLLhLhfffffffiifhho.......';
      copy[8] = '....oHhLLhLhfffffffffhhho.......';
      copy[9] = '....oHhLLhLhfnfbbbfnffhho.......';
      copy[10] = '....oHhLLhLhffbbbffffmfho.......';
    } else if (emotion === 'surprised') {
      copy[6] = '....oHhLLhLhfffffffwefhho.......';
      copy[7] = '....oHhLLhLhfffffffiefhho.......';
      copy[8] = '....oHhLLhLhfffffffiifhho.......';
      copy[10] = '....oHhLLhLhfffbbfffffhho.......';
      copy[11] = '....oHhLLhLhhfsffffmmffo........';
    } else if (emotion === 'uneasy' || emotion === 'sad') {
      copy[6] = '....oHhLLhLhfffffffffhhho.......';
      copy[7] = '....oHhLLhLhfffffffwefhho.......';
      copy[8] = '....oHhLLhLhfffffffiifhho.......';
      copy[10] = '....oHhLLhLhfffbbfffffhho.......';
      copy[11] = '....oHhLLhLhhfsffffmmffo........';
    } else if (emotion === 'determined' || emotion === 'thoughtful' || emotion === 'curious') {
      copy[6] = '....oHhLLhLhfffffffewfhho.......';
      copy[7] = '....oHhLLhLhfffffffiefhho.......';
      copy[8] = '....oHhLLhLhfffffffiifhho.......';
    }
    return copy;
  }

  if (emotion === 'amused') {
    // Joyful curved laughing eyes + rosy cheeks + bright open laugh
    copy[6] = '...oHhLhfffffffffffffffhLhHo....';
    copy[7] = '...oHhLhfffiiffffffiifffhLhHo...';
    copy[8] = '...oHhLhfffffffffffffffhLhHo....';
    copy[9] = '...oHhLhfbbbfffnnfffbbbfhLhHo...';
    copy[10] = '...oHhLhfbbfffmMMmfffbbfhLhHo...';
    copy[11] = '...oHhLhffsnffmMMmffnsffhLhHo...';
  } else if (emotion === 'happy') {
    copy[9] = '...oHhLhfbbbfffnnfffbbbfhLhHo...';
    copy[10] = '...oHhLhfbbfffmMMmfffbbfhLhHo...';
    copy[11] = '...oHhLhffsnfffmmfffnsffhLhHo...';
  } else if (emotion === 'blush' || emotion === 'romantic') {
    copy[9] = '...oHhLhfbbbfffnnfffbbbfhLhHo...';
    copy[10] = '...oHhLhfbbbfffmffmffbbbhLhHo...';
  } else if (emotion === 'kiss_closed') {
    copy[6] = '...oHhLhfffffffffffffffhLhHo....';
    copy[7] = '...oHhLhfffiiffffffiifffhLhHo...';
    copy[8] = '...oHhLhfffffffffffffffhLhHo....';
    copy[9] = '...oHhLhfbbbfffnnfffbbbfhLhHo...';
    copy[10] = '...oHhLhfbbfffmffmfffbbfhLhHo...';
  } else if (emotion === 'surprised') {
    copy[6] = '...oHhLhfffweffffffwefffhLhHo...';
    copy[7] = '...oHhLhfffeeffffffeefffhLhHo...';
    copy[8] = '...oHhLhfffiiffffffiifffhLhHo...';
    copy[10] = '...oHhLhfbbffffmmffffbbfhLhHo...';
    copy[11] = '...oHhLhffsnfffmmfffnsffhLhHo...';
  } else if (emotion === 'uneasy' || emotion === 'sad') {
    // Gentle wistful eyes & tiny tender mouth (NEVER angry!)
    copy[6] = '...oHhLhfffffffffffffffhLhHo....';
    copy[7] = '...oHhLhfffweffffffwefffhLhHo...';
    copy[8] = '...oHhLhfffiiffffffiifffhLhHo...';
    copy[10] = '...oHhLhfbbffffffffffbbfhLhHo...';
    copy[11] = '...oHhLhffsnfffmmfffnsffhLhHo...';
  } else if (emotion === 'determined' || emotion === 'thoughtful' || emotion === 'curious') {
    // Playful bright sidelong gaze + cute spirited half-smile
    copy[6] = '...oHhLhfffewffffffewfffhLhHo...';
    copy[7] = '...oHhLhfffieffffffiefffhLhHo...';
    copy[8] = '...oHhLhfffiiffffffiifffhLhHo...';
    copy[10] = '...oHhLhfbbffffffmmffbbfhLhHo...';
    copy[11] = '...oHhLhffsnffmmmfffnsffhLhHo...';
  }
  return copy;
}

// Patch dynamic friendly charismatic Stardew expressions onto 32x42 Ariel sprite
function applyArielEmotion(
  rows: string[],
  emotion: SpriteEmotion | undefined,
  isSide: boolean,
): string[] {
  if (!emotion || emotion === 'none' || emotion === 'neutral') return rows;
  const copy = [...rows];
  if (isSide) {
    if (emotion === 'happy' || emotion === 'amused') {
      copy[12] = '....oKkcKkffnnfrrrfffffKo.......';
      copy[13] = '....oKkcKkffffrrffffmMfo........';
      copy[14] = '....oKkcKkkfsffffffmMffo........';
    } else if (emotion === 'romantic' || emotion === 'blush') {
      copy[12] = '....oKkcKkffnfrrrffffffKo.......';
      copy[13] = '....oKkcKkfffrrrffffmMfo........';
    } else if (emotion === 'kiss_closed') {
      copy[9] = '....oKkcKkfffffffffffffKo.......';
      copy[10] = '....oKkcKkfffffffiiffffKo.......';
      copy[11] = '....oKkcKkfffffffffffffKo.......';
      copy[12] = '....oKkcKkffnfrrrffffffKo.......';
      copy[13] = '....oKkcKkfffrrrffffmMfo........';
    }
    return copy;
  }

  if (emotion === 'happy' || emotion === 'amused') {
    copy[12] = '.oKkcKffrrrfffnnfffrrrffKckKo...';
    copy[13] = '.oKkckffrrfffmMMmfffrrffkckKo...';
    copy[14] = '..oKkcKffsffmMMMMmffsffKckKo....';
  } else if (emotion === 'romantic' || emotion === 'blush') {
    copy[12] = '.oKkcKffrrrfffnnfffrrrffKckKo...';
    copy[13] = '.oKkckffrrrffmMMmffrrrffkckKo...';
  } else if (emotion === 'kiss_closed') {
    copy[9] = '.oKkcKffffffffffffffffffKckKo...';
    copy[10] = '.oKkcKffffiiffffffiiffffKckKo...';
    copy[11] = '.oKkckffffffffffffffffffkckKo...';
    copy[12] = '.oKkcKffrrrfffnnfffrrrffKckKo...';
    copy[13] = '.oKkckffrrfffmmmmfffrrffkckKo...';
  } else if (emotion === 'surprised') {
    copy[9] = '.oKkcKffffweffffffweffffKckKo...';
    copy[10] = '.oKkcKffffeeffffffeeffffKckKo...';
    copy[13] = '.oKkckffrrffffmmffffrrffkckKo...';
    copy[14] = '..oKkcKffsffffmmffffsffKckKo....';
  } else if (emotion === 'thoughtful' || emotion === 'curious') {
    copy[9] = '.oKkcKffffewffffffewffffKckKo...';
    copy[13] = '.oKkckffrrffffmMmfffrrffkckKo...';
  }
  return copy;
}

// Smooth 16-bit Stardew walk stride (lifts left or right sneaker cleanly by 2 pixels)
function applyWalkStride(rows: string[], stepPhase: number): string[] {
  if (Math.abs(stepPhase) < 0.35) return rows;
  const copy = [...rows];
  const shiftLeftUp = stepPhase > 0;
  const w = copy[0]?.length ?? 32;
  const mid = Math.floor(w / 2);

  for (let r = copy.length - 6; r < copy.length - 1; r++) {
    const srcRow = copy[r + 2] ?? '.'.repeat(w);
    const curRow = copy[r];
    if (shiftLeftUp) {
      copy[r] = srcRow.slice(0, mid) + curRow.slice(mid);
    } else {
      copy[r] = curRow.slice(0, mid) + srcRow.slice(mid);
    }
  }
  return copy;
}

export interface CharacterRenderOpts {
  dir: Direction;
  walkPhase?: number;
  isMoving?: boolean;
  useWalkSheetForIdle?: boolean;
  isDancing?: boolean;
  dancePhase?: number;
  emotion?: SpriteEmotion;
  backwardsCap?: boolean;
  handOnCap?: number;
  cavaloKick?: number;
  tiltRad?: number;
}

type WalkFrameBounds = { x: number; y: number; width: number; height: number };
type WalkFrameBoundsGrid = Array<WalkFrameBounds | null>;

const walkSheetFrameBoundsCache = new WeakMap<HTMLImageElement, WalkFrameBoundsGrid | null>();

export function getWalkSheetFrameBounds(image: HTMLImageElement): WalkFrameBoundsGrid | null {
  if (walkSheetFrameBoundsCache.has(image)) {
    return walkSheetFrameBoundsCache.get(image) ?? null;
  }
  if (
    typeof document === 'undefined' ||
    image.naturalWidth % 3 !== 0 ||
    image.naturalHeight % 3 !== 0
  ) {
    walkSheetFrameBoundsCache.set(image, null);
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    walkSheetFrameBoundsCache.set(image, null);
    return null;
  }

  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
  const frameWidth = image.naturalWidth / 3;
  const frameHeight = image.naturalHeight / 3;
  const bounds: WalkFrameBoundsGrid = [];
  let hasFrame = false;

  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      const startX = column * frameWidth;
      const startY = row * frameHeight;
      let minX = startX + frameWidth;
      let minY = startY + frameHeight;
      let maxX = startX - 1;
      let maxY = startY - 1;

      for (let y = startY; y < startY + frameHeight; y++) {
        for (let x = startX; x < startX + frameWidth; x++) {
          if (pixels[(y * image.naturalWidth + x) * 4 + 3] === 0) continue;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      if (maxX < minX || maxY < minY) {
        bounds.push(null);
        continue;
      }
      hasFrame = true;
      bounds.push({
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      });
    }
  }

  if (!hasFrame) {
    walkSheetFrameBoundsCache.set(image, null);
    return null;
  }
  walkSheetFrameBoundsCache.set(image, bounds);
  return bounds;
}

export function drawWalkSheetFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  frameIndex: number,
  cx: number,
  cy: number,
  targetHeight: number,
  opts: { bobY?: number; flipX?: boolean; scaleX?: number; tiltRad?: number } = {},
): boolean {
  const frame = getWalkSheetFrameBounds(image)?.[frameIndex];
  if (!frame) return false;

  const drawH = targetHeight * GLOBAL_CHAR_SCALE;
  const drawW = drawH * (frame.width / frame.height);
  const prevSmooth = ctx.imageSmoothingEnabled;
  const prevQuality = ctx.imageSmoothingQuality;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.translate(cx, cy + (opts.bobY ?? 0) + 8.5);
  if (opts.tiltRad) ctx.rotate(opts.tiltRad);
  const scaleX = (opts.flipX ? -1 : 1) * (opts.scaleX ?? 1);
  if (scaleX !== 1) ctx.scale(scaleX, 1);
  ctx.drawImage(
    image,
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
  return true;
}

export function drawGraziSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: CharacterRenderOpts,
): void {
  const swing = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob = opts.isMoving
    ? Math.abs(swing) * -1.2
    : opts.isDancing
      ? Math.sin(opts.dancePhase ?? 0) * -1.1
      : 0;

  drawShadow(ctx, cx, cy + 8, 9, 3.6);

  const emo = opts.emotion ?? 'none';

  if (opts.isMoving || opts.useWalkSheetForIdle) {
    const walkSheet = getGraziWalkSheetImage();
    if (walkSheet) {
      const row = opts.dir === 'up' ? 2 : opts.dir === 'down' ? 0 : 1;
      const column = opts.isMoving ? (swing > 0.35 ? 1 : swing < -0.35 ? 2 : 0) : 0;
      // The reference's side-row idle faces left, but both walking poses face right.
      const sourceFacesRight = row === 1 && column > 0;
      const flipX =
        row === 1 &&
        ((opts.dir === 'left' && sourceFacesRight) ||
          (opts.dir === 'right' && !sourceFacesRight));
      if (
        drawWalkSheetFrame(ctx, walkSheet, row * 3 + column, cx, cy, 35, {
          bobY: bob,
          flipX,
          tiltRad: opts.tiltRad,
        })
      ) return;
    }
  }

  // Select approved high-resolution transparent skin for direction & situational emotion
  let skinUrl: string = SKIN_URLS.graziFront;
  let flipX = false;
  if (opts.dir === 'up') {
    skinUrl = SKIN_URLS.graziBack;
  } else if (opts.dir === 'left' || opts.dir === 'right') {
    skinUrl = SKIN_URLS.graziShy;
    flipX = opts.dir === 'left';
  } else if (emo === 'amused' || emo === 'happy') {
    skinUrl = SKIN_URLS.graziAmused;
  } else if (
    emo === 'blush' ||
    emo === 'romantic' ||
    emo === 'sad' ||
    emo === 'uneasy' ||
    emo === 'thoughtful' ||
    emo === 'determined' ||
    emo === 'kiss_closed'
  ) {
    skinUrl = SKIN_URLS.graziShy;
  }

  const hiRes = getSkinSprite(skinUrl);
  if (hiRes) {
    const danceTilt = opts.isDancing ? Math.sin((opts.dancePhase ?? 0) * 0.5) * 0.04 : 0;
    drawSkinImage(ctx, hiRes, cx, cy + bob, 35, {
      flipX,
      tiltRad: (opts.tiltRad ?? 0) + danceTilt,
    });
    return;
  }

  // Instant matrix fallback during initial ~50ms image load
  const strideKey = !opts.isMoving ? 'idle' : swing > 0.35 ? 'L' : swing < -0.35 ? 'R' : 'idle';

  if (opts.dir === 'up') {
    const rows = opts.isMoving ? applyWalkStride(GRAZI_BACK_BASE, swing) : GRAZI_BACK_BASE;
    drawMatrix(ctx, cx, cy + bob, rows, GRAZI_PALETTE, `grazi32|up|${strideKey}`);
    return;
  }

  if (opts.dir === 'left' || opts.dir === 'right') {
    const base = applySisterEmotion(GRAZI_SIDE_BASE, emo, true);
    const rows = opts.isMoving ? applyWalkStride(base, swing) : base;
    drawMatrix(
      ctx,
      cx,
      cy + bob,
      rows,
      GRAZI_PALETTE,
      `grazi32|side|${emo}|${strideKey}`,
      opts.dir === 'left',
    );
    return;
  }

  const base = applySisterEmotion(GRAZI_FRONT_BASE, emo, false);
  const rows = opts.isMoving ? applyWalkStride(base, swing) : base;
  drawMatrix(ctx, cx, cy + bob, rows, GRAZI_PALETTE, `grazi32|down|${emo}|${strideKey}`);
}

export function drawGraziSpriteAtCoupleScale(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: CharacterRenderOpts,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 36.5 / 35);
  drawGraziSprite(ctx, 0, 0, opts);
  ctx.restore();
}

export function drawLauraSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: CharacterRenderOpts,
): void {
  const swing = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob = opts.isMoving ? Math.abs(swing) * -1.2 : 0;
  drawShadow(ctx, cx, cy + 8, 9, 3.6);

  const isSide = opts.dir === 'left' || opts.dir === 'right';
  if (opts.isMoving || opts.useWalkSheetForIdle) {
    const walkSheet = getCharacterWalkSheetImage('laura');
    if (walkSheet) {
      const row = opts.dir === 'up' ? 2 : opts.dir === 'down' ? 0 : 1;
      const column = opts.isMoving ? (swing > 0.35 ? 1 : swing < -0.35 ? 2 : 0) : 0;
      const sourceFacesRight = row === 1 && column === 0;
      const flipX =
        row === 1 &&
        ((opts.dir === 'left' && sourceFacesRight) ||
          (opts.dir === 'right' && !sourceFacesRight));
      if (
        drawWalkSheetFrame(ctx, walkSheet, row * 3 + column, cx, cy, 35, {
          bobY: bob,
          flipX,
          tiltRad: opts.tiltRad,
        })
      ) return;
    }
  }

  const skinUrl = isSide ? SKIN_URLS.lauraSide : SKIN_URLS.lauraFront;
  const hiRes = getSkinSprite(skinUrl);
  if (hiRes) {
    drawSkinImage(ctx, hiRes, cx, cy + bob, 35, {
      flipX: opts.dir === 'left',
      tiltRad: opts.tiltRad,
    });
    return;
  }

  const strideKey = !opts.isMoving ? 'idle' : swing > 0.35 ? 'L' : swing < -0.35 ? 'R' : 'idle';
  const emo = opts.emotion ?? 'happy';

  if (opts.dir === 'up') {
    const rows = opts.isMoving ? applyWalkStride(GRAZI_BACK_BASE, swing) : GRAZI_BACK_BASE;
    drawMatrix(ctx, cx, cy + bob, rows, LAURA_PALETTE, `laura32|up|${strideKey}`);
    return;
  }

  if (isSide) {
    const base = applySisterEmotion(LAURA_SIDE_BASE, emo, true);
    const rows = opts.isMoving ? applyWalkStride(base, swing) : base;
    drawMatrix(
      ctx,
      cx,
      cy + bob,
      rows,
      LAURA_PALETTE,
      `laura32|side|${emo}|${strideKey}`,
      opts.dir === 'left',
    );
    return;
  }

  const base = applySisterEmotion(LAURA_FRONT_BASE, emo, false);
  const rows = opts.isMoving ? applyWalkStride(base, swing) : base;
  drawMatrix(ctx, cx, cy + bob, rows, LAURA_PALETTE, `laura32|down|${emo}|${strideKey}`);
}

export function drawArielSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: CharacterRenderOpts,
): void {
  const swing = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const kick = opts.cavaloKick ?? 0;
  const bob = opts.isMoving
    ? Math.abs(swing) * -1.2
    : opts.isDancing
      ? Math.sin(opts.dancePhase ?? 0) * -1.7
      : 0;

  drawShadow(ctx, cx, cy + 8, 9.8, 3.8);

  const capHold = (opts.handOnCap ?? 0) > 0.35;
  const isSide = opts.dir === 'left' || opts.dir === 'right';
  const skinUrl = isSide
    ? SKIN_URLS.arielSide
    : capHold
      ? SKIN_URLS.arielCapDance
      : SKIN_URLS.arielFront;

  if (opts.isMoving || (opts.useWalkSheetForIdle && !opts.isDancing)) {
    const walkSheet = getCharacterWalkSheetImage('ariel');
    if (walkSheet) {
      const row = opts.dir === 'up' ? 2 : opts.dir === 'down' ? 0 : 1;
      const column = opts.isMoving ? (swing > 0.35 ? 1 : swing < -0.35 ? 2 : 0) : 0;
      if (
        drawWalkSheetFrame(ctx, walkSheet, row * 3 + column, cx + kick * 1.8, cy, 36.5, {
          bobY: bob,
          flipX: row === 1 && opts.dir === 'right',
          tiltRad: opts.tiltRad,
        })
      ) return;
    }
  }

  const hiRes = getSkinSprite(skinUrl);
  if (hiRes) {
    const danceTilt = opts.isDancing
      ? Math.sin((opts.dancePhase ?? 0) * 0.5) * 0.05 + kick * 0.055
      : 0;
    const scaleY = opts.isDancing ? 1 + Math.max(0, Math.sin(opts.dancePhase ?? 0)) * 0.03 : 1;
    drawSkinImage(ctx, hiRes, cx + kick * 1.8, cy + bob, 36.5, {
      flipX: opts.dir === 'left',
      tiltRad: (opts.tiltRad ?? 0) + danceTilt,
      scaleY,
    });
    return;
  }

  const emo = opts.emotion ?? 'happy';
  const strideKey = !opts.isMoving && Math.abs(kick) < 0.3
    ? 'idle'
    : swing > 0.35 || kick > 0.3
      ? 'L'
      : 'R';

  if (isSide) {
    const base = applyArielEmotion(ARIEL_SIDE_BASE, emo, true);
    const rows = opts.isMoving ? applyWalkStride(base, swing) : base;
    drawMatrix(
      ctx,
      cx,
      cy + bob,
      rows,
      ARIEL_PALETTE,
      `ariel32|side|${emo}|${strideKey}`,
      opts.dir === 'left',
    );
    return;
  }

  const rawBase = capHold ? ARIEL_HAND_ON_CAP : ARIEL_FRONT_BASE;
  const base = capHold ? rawBase : applyArielEmotion(rawBase, emo, false);
  const rows = opts.isMoving || Math.abs(kick) >= 0.35 ? applyWalkStride(base, swing || kick) : base;
  drawMatrix(
    ctx,
    cx + px(kick * 1.5),
    cy + bob,
    rows,
    ARIEL_PALETTE,
    `ariel32|down|${capHold ? 'cap' : emo}|${strideKey}`,
  );
}

// Ariel's Signature Breakdance Cycle: Groove + Hand on Backwards Cap + Cavalo Step
export function drawArielBreakdanceCap(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
): void {
  const cycle = (time % 2.8) / 2.8;
  let handOnCap = 0;
  let cavaloKick = 0;
  let headTilt = 0;

  if (cycle < 0.25) {
    handOnCap = cycle / 0.25;
  } else if (cycle < 0.68) {
    handOnCap = 1;
    headTilt = Math.sin(cycle * Math.PI * 12) * 1.2;
  } else if (cycle < 0.88) {
    handOnCap = Math.max(0, 1 - (cycle - 0.68) * 5);
    cavaloKick = Math.sin((cycle - 0.68) * Math.PI * 10);
  }

  drawArielSprite(ctx, cx, cy + headTilt, {
    dir: 'down',
    isDancing: true,
    dancePhase: time * 7.5,
    handOnCap,
    cavaloKick,
    emotion: 'happy',
  });
}

// ============================================================================
// JUNIOR & PATRONS (30x38 High-Res Rounded Friendly Pixel Matrices)
// ============================================================================
const PATRON_BASE: string[] = [
  '..........oooooooooo..........',
  '.......oooHHHHHHHHHHooo.......',
  '.....ooHHhhHHHHHHHHhhHHoo.....',
  '....oHHhHhhHHHHHHHHhhHhHHo....',
  '....oHhhffffffffffnfffhhHo....',
  '...oHfffffffffffffffffffHo....',
  '...oHffffweffffffwefffffHo....',
  '...oHffffieffffffiefffffHo....',
  '...oHffffiiffffffiifffffHo....',
  '...oHfbbfffffnnfffffbbfHoo....',
  '...oHfbbffffmffmffffbbfHo.....',
  '....oHffsffffmmffffssffHo.....',
  '....oHHffssssssssssffHHo......',
  '.....ooooffssssssffoooo.......',
  '.....ooTTTTTooooTTTTToo.......',
  '....oTTTttTTTTTTTTttTTTo......',
  '...oTTttTTTTTTTTTTTTttTTo.....',
  '...oTTtTTTTTTTTTTTTTTtTTo.....',
  '...oTfTTTTTTTTTTTTTTTTfTo.....',
  '...oTfTTtTTTTTTTTTTtTTfTo.....',
  '...oTsTToTTTTTTTTTToTTsTo.....',
  '....oooo.oTTTTTTTTTooooo......',
  '........oPPPPPPPPPPo..........',
  '.......oPPpPPppPPpPPo.........',
  '.......oPPppPppPppPPo.........',
  '.......oPpPPPPPPPPpPo.........',
  '.......oPPpPPP..PPpPPo........',
  '........oPPPPP..PPPPo.........',
  '........oPpPPP..PPpPo.........',
  '........oPPPPP..PPPPo.........',
  '........oPPpPP..PpPPo.........',
  '........oPPPPP..PPPPo.........',
  '........ooowww..wwwoo.........',
  '........owwwww..wwwwwo........',
  '........owwwwp..pwwwwo........',
  '........oppppp..pppppo........',
  '.........ooooo..ooooo.........',
  '..............................',
];

const PATRON_PALETTES: PaletteMap[] = [
  {
    o: '#24130b', H: '#3c2419', h: '#5c3a29', B: '#5c3a29', f: '#f8ccb2', n: '#ebb89b', s: '#d9a184', b: '#f29aa8',
    e: '#2c1810', i: '#63402b', w: '#ffffff', m: '#b86460', T: '#c84a68', t: '#e6728e', P: '#2c3d59', p: '#465f87',
  },
  {
    o: '#24130b', H: '#1d1522', h: '#362840', B: '#362840', f: '#c2835c', n: '#d69770', s: '#995f3c', b: '#d4846c',
    e: '#24140c', i: '#523220', w: '#ffffff', m: '#874832', T: '#3d7ac4', t: '#609ce6', P: '#232634', p: '#3a3f57',
  },
  {
    o: '#24130b', H: '#6e4524', h: '#966338', B: '#734b28', f: '#fad7c0', n: '#efc2a6', s: '#dca98d', b: '#f49aa8',
    e: '#2c1810', i: '#63402b', w: '#ffffff', m: '#bd6964', T: '#398a68', t: '#58b38c', P: '#33364b', p: '#4d5270',
  },
  {
    o: '#24130b', H: '#2b1d18', h: '#4a332b', B: '#4a332b', f: '#dea17a', n: '#edb38e', s: '#b57853', b: '#e38f7c',
    e: '#24140c', i: '#593724', w: '#ffffff', m: '#995442', T: '#d9912e', t: '#f2b552', P: '#2b283b', p: '#44405e',
  },
];

const PATRON_SKIN_URLS = [
  SKIN_URLS.npcGirl,
  SKIN_URLS.npcDj,
  SKIN_URLS.juniorFront,
  SKIN_URLS.npcBboy,
] as const;

export function drawPatronSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  variant: number,
  dir: Direction,
  dancePhase = 0,
  isDancing = false,
  role?: string,
): void {
  const bob = isDancing ? Math.sin(dancePhase) * -1.4 : 0;
  drawShadow(ctx, cx, cy + 8, 8.8, 3.5);
  const idx = Math.abs(variant) % PATRON_PALETTES.length;

  let skinUrl: string = PATRON_SKIN_URLS[idx];
  if (role === 'junior') {
    skinUrl = SKIN_URLS.juniorFront;
  } else if (role === 'dj') {
    skinUrl = SKIN_URLS.npcDj;
  } else if (role === 'bartender') {
    skinUrl = SKIN_URLS.npcGirl;
  } else if (role === 'bboy') {
    skinUrl = SKIN_URLS.npcBboy;
  }

  const hiRes = getSkinSprite(skinUrl);
  if (hiRes) {
    const danceTilt = isDancing ? Math.sin(dancePhase * 0.5) * 0.045 : 0;
    const scaleY = isDancing ? 1 + Math.max(0, Math.sin(dancePhase)) * 0.025 : 1;
    drawSkinImage(ctx, hiRes, cx, cy + bob, 34.5, {
      flipX: dir === 'left',
      tiltRad: danceTilt,
      scaleY,
    });
    return;
  }

  const pal = PATRON_PALETTES[idx];
  drawMatrix(
    ctx,
    cx,
    cy + 2 + bob,
    PATRON_BASE,
    pal,
    `patron30|${idx}`,
    dir === 'left',
  );
}

// ============================================================================
// SLOW ROMANTIC DANCE ("AGARRADINHOS / ABRAÇADINHOS") — UNIFIED EMBRACE FRAMES
// ============================================================================
export function drawSlowDanceCouple(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  swayPhase: number,
  leanFactor = 0,
  elapsed = 2,
): void {
  const coupleCenter = getSkinSprite(SKIN_URLS.coupleDanceCenter);
  const coupleLeft = getSkinSprite(SKIN_URLS.coupleDanceLeft);
  const coupleRight = getSkinSprite(SKIN_URLS.coupleDanceRight);

  const damp = 1 - leanFactor * 0.85;
  const sinVal = Math.sin(swayPhase);
  const swayX = sinVal * 3.6 * damp;
  const swayY = -Math.abs(sinVal) * 0.85 * damp;
  const bx = cx + swayX;
  const by = cy + swayY;

  // Soft romantic glow halo beneath the couple
  ctx.fillStyle = 'rgba(255, 165, 195, 0.16)';
  ctx.beginPath();
  ctx.arc(bx, by - 12, 28, 0, Math.PI * 2);
  ctx.fill();

  drawShadow(ctx, bx, cy + 9, 14.5, 4.4);

  // Smooth opening approach into the embrace (first 0.85s of the slow dance)
  if (elapsed < 0.85 && coupleCenter) {
    const stepT = Math.min(1, elapsed / 0.55);
    const ease = stepT * stepT * (3 - 2 * stepT);
    const approachGap = 13.5 - ease * 6.0;
    const walkBob = elapsed < 0.55 ? Math.abs(Math.sin(elapsed * 9)) * -1.0 : 0;

    if (elapsed < 0.55) {
      drawGraziSprite(ctx, cx - approachGap, cy + walkBob, {
        dir: 'right',
        isMoving: true,
        walkPhase: elapsed * 8,
        emotion: 'blush',
      });
      drawArielSprite(ctx, cx + approachGap, cy - 0.5 + walkBob, {
        dir: 'left',
        isMoving: true,
        walkPhase: elapsed * 8 + 1.2,
        emotion: 'romantic',
      });
      return;
    }

    // Gentle crossfade from approaching sprites into full physical embrace (0.55s..0.85s)
    const fade = Math.min(1, (elapsed - 0.55) / 0.3);
    ctx.save();
    ctx.globalAlpha = 1 - fade;
    drawGraziSprite(ctx, cx - approachGap, cy, {
      dir: 'right',
      emotion: 'blush',
      tiltRad: 0.03 * fade,
    });
    drawArielSprite(ctx, cx + approachGap, cy - 0.5, {
      dir: 'left',
      emotion: 'romantic',
      tiltRad: -0.03 * fade,
    });
    ctx.globalAlpha = fade;
    drawSkinImage(ctx, coupleCenter, cx, cy, 37.5);
    ctx.restore();
    return;
  }

  // Unified synchronized slow-dance embrace cycle (Left Step <-> Center Hug <-> Right Step)
  if (coupleCenter) {
    let activeFrame = coupleCenter;
    if (leanFactor < 0.65) {
      if (sinVal < -0.36 && coupleLeft) {
        activeFrame = coupleLeft;
      } else if (sinVal > 0.36 && coupleRight) {
        activeFrame = coupleRight;
      }
    }
    drawSkinImage(ctx, activeFrame, bx, by, 37.5, {
      tiltRad: sinVal * 0.024 * damp,
    });
    return;
  }

  // Fallback while images decode
  const gap = 8.4 - leanFactor * 2.4;
  const embraceTilt = 0.035 + leanFactor * 0.03;
  drawGraziSprite(ctx, bx - gap, by, {
    dir: 'right',
    isDancing: false,
    emotion: 'blush',
    tiltRad: embraceTilt,
  });
  drawArielSprite(ctx, bx + gap, by - 0.5, {
    dir: 'left',
    isDancing: false,
    emotion: 'romantic',
    tiltRad: -embraceTilt,
  });
}

// ============================================================================
// FIRST KISS CUTSCENE CLOSE-UP (Gaze -> Lean In -> Real Lip-to-Lip Kiss -> Pull Back)
// ============================================================================
export function drawFirstKissScene(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  phase: 'zoom_in' | 'gaze' | 'lean' | 'kiss_silhouette' | 'zoom_out',
  elapsed: number,
): void {
  const gazeFrame = getSkinSprite(SKIN_URLS.coupleKissGaze);
  const leanFrame = getSkinSprite(SKIN_URLS.coupleKissLean);
  const kissFrame = getSkinSprite(SKIN_URLS.coupleKissContact);
  const danceCenter = getSkinSprite(SKIN_URLS.coupleDanceCenter);

  const x = cx;
  const y = cy;

  // Soft romantic warm spotlight aura framing Grazi & Ariel
  const auraStrength = phase === 'kiss_silhouette' ? 1.2 : phase === 'lean' ? 1.05 : 0.85;
  ctx.fillStyle = `rgba(255, 160, 188, ${(0.15 * auraStrength).toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(x, y - 24, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 192, 212, ${(0.22 * auraStrength).toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(x, y - 24, 34, 0, Math.PI * 2);
  ctx.fill();

  if (phase === 'zoom_in') {
    // Slow down the warm embrace smoothly into stillness as camera glides in
    const t = Math.min(1, elapsed / 1.4);
    const gentleSway = Math.sin(elapsed * 2.0) * 1.4 * (1 - t);
    drawShadow(ctx, x + gentleSway, y + 9, 14.5, 4.4);
    const frame = t > 0.65 && gazeFrame ? gazeFrame : danceCenter ?? gazeFrame;
    if (frame) {
      drawSkinImage(ctx, frame, x + gentleSway, y, 37.5, {
        tiltRad: Math.sin(elapsed * 2.0) * 0.014 * (1 - t),
      });
      return;
    }
    drawSlowDanceCouple(ctx, cx, cy, elapsed * 1.4, 0.5, 2);
    return;
  }

  drawShadow(ctx, x, y + 9, 14.5, 4.4);

  if (phase === 'gaze' && gazeFrame) {
    // Deep, tender eye contact right before leaning in
    const breath = Math.sin(elapsed * 2.4) * 0.008;
    drawSkinImage(ctx, gazeFrame, x, y, 37.5, { scaleY: 1 + breath });
    return;
  }

  if (phase === 'lean' && leanFrame) {
    // Eyes gently closing, Ariel tilting delicately toward Grazi, lips a breath apart
    const leanProgress = Math.max(0, Math.min(1, (elapsed - 2.6) / 1.1));
    drawSkinImage(ctx, leanFrame, x, y, 37.5, {
      scaleX: 1 + leanProgress * 0.01,
      scaleY: 1 + leanProgress * 0.01,
    });
    return;
  }

  if (phase === 'kiss_silhouette' && kissFrame) {
    // Unmistakable sweet teenage first kiss with lips visibly touching, held tenderly!
    const breathe = Math.sin((elapsed - 3.7) * 2.2) * 0.008;
    drawSkinImage(ctx, kissFrame, x, y, 37.5, {
      scaleX: 1.01 + breathe * 0.4,
      scaleY: 1.01 + breathe,
    });

    const pulse = Math.sin(elapsed * 4.5) * 1.4;
    const hx = px(x);
    const hy = px(y - 60 + pulse);
    ctx.fillStyle = '#ff4f7d';
    ctx.fillRect(hx - 4, hy, 3, 3);
    ctx.fillRect(hx + 1, hy, 3, 3);
    ctx.fillRect(hx - 5, hy + 2, 10, 3);
    ctx.fillRect(hx - 3, hy + 5, 6, 2);
    ctx.fillRect(hx - 1, hy + 7, 2, 2);
    ctx.fillStyle = '#ffb3c7';
    ctx.fillRect(hx - 3, hy + 1, 2, 1);
    return;
  }

  if (phase === 'zoom_out' && (leanFrame || gazeFrame)) {
    // Gently part lips -> shy affectionate gaze still embracing before "Eu te amo"
    const pullFrame = elapsed < 6.28 && leanFrame ? leanFrame : gazeFrame ?? danceCenter;
    if (pullFrame) {
      drawSkinImage(ctx, pullFrame, x, y, 37.5);
      return;
    }
  }

  // Fallback while images decode
  const gap = phase === 'gaze' ? 7.4 : phase === 'lean' ? 6.1 : 5.3;
  const leanTilt = phase === 'gaze' ? 0.025 : phase === 'lean' ? 0.055 : 0.075;
  const eyesClosed = phase === 'lean' || phase === 'kiss_silhouette';
  drawGraziSprite(ctx, x - gap, y, {
    dir: 'right',
    emotion: eyesClosed ? 'kiss_closed' : 'blush',
    tiltRad: leanTilt,
  });
  drawArielSprite(ctx, x + gap, y - 0.5, {
    dir: 'left',
    emotion: eyesClosed ? 'kiss_closed' : 'romantic',
    tiltRad: -leanTilt,
  });
}

// ============================================================================
// STAGE 2 SPRITE RENDERERS (Eloisa, Jealous Ariel, Friend Slow Dance, Forehead Kiss)
// ============================================================================
export function drawEloisaSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  opts: {
    dir?: Direction;
    isMoving?: boolean;
    useWalkSheetForIdle?: boolean;
    walkPhase?: number;
  } = {},
): void {
  const swing = opts.isMoving ? Math.sin(opts.walkPhase ?? 0) : 0;
  const bob = opts.isMoving ? Math.abs(Math.cos(opts.walkPhase ?? 0)) * -1.5 : 0;
  drawShadow(ctx, cx, cy + 8, 8.8, 3.5);

  if (opts.isMoving || opts.useWalkSheetForIdle) {
    const walkSheet = getCharacterWalkSheetImage('eloisa');
    if (walkSheet) {
      const row = opts.dir === 'up' ? 2 : opts.dir === 'down' ? 0 : 1;
      const column = opts.isMoving ? (swing > 0.35 ? 1 : swing < -0.35 ? 2 : 0) : 0;
      if (
        drawWalkSheetFrame(ctx, walkSheet, row * 3 + column, cx, cy, 34.5, {
          bobY: bob,
          flipX: row === 1 && opts.dir === 'left',
        })
      ) return;
    }
  }

  const hiRes = getSkinSprite(SKIN_URLS.eloisaFront);
  if (hiRes) {
    drawSkinImage(ctx, hiRes, cx, cy + bob, 34.5, {
      flipX: opts.dir === 'left',
    });
    return;
  }

  drawPatronSprite(ctx, cx, cy + bob, 0, opts.dir ?? 'down', opts.walkPhase ?? 0, Boolean(opts.isMoving));
}

export function drawArielEloisaWalkTogether(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  walkPhase: number,
  isWalking: boolean,
  dir: Direction = 'left',
): void {
  const walkSheet = getCharacterWalkSheetImage('arielEloisa');
  if (walkSheet) {
    const row = dir === 'up' ? 2 : dir === 'down' ? 0 : 1;
    const swing = isWalking ? Math.sin(walkPhase) : 0;
    const column = isWalking ? (swing > 0.35 ? 1 : swing < -0.35 ? 2 : 0) : 0;
    const bobY = isWalking ? Math.abs(swing) * -1.2 : Math.sin(walkPhase * 0.5) * 0.35;

    drawShadow(ctx, cx, cy + 9, 17, 4.4);
    if (
      drawWalkSheetFrame(ctx, walkSheet, row * 3 + column, cx, cy, 36.5, {
        bobY,
        flipX: row === 1 && dir === 'left',
      })
    ) {
      return;
    }
  }

  const gap = 9;
  drawArielSprite(ctx, cx - gap, cy, {
    dir,
    isMoving: isWalking,
    useWalkSheetForIdle: true,
    walkPhase,
  });
  drawEloisaSprite(ctx, cx + gap, cy, {
    dir,
    isMoving: isWalking,
    useWalkSheetForIdle: true,
    walkPhase: walkPhase + 0.35,
  });
}

export function drawArielJealousSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  faceLeft = true,
): void {
  drawShadow(ctx, cx, cy + 8, 9.6, 3.8);
  const hiRes = getSkinSprite(SKIN_URLS.arielJealous);
  if (hiRes) {
    const breath = Math.sin(time * 2.1) * 0.01;
    drawSkinImage(ctx, hiRes, cx, cy, 36.5, {
      flipX: faceLeft,
      scaleY: 1 + breath,
    });
    return;
  }

  drawArielSprite(ctx, cx, cy, {
    dir: faceLeft ? 'left' : 'right',
    emotion: 'thoughtful',
  });
}

export function drawGraziFriendSlowDance(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  swayPhase: number,
): void {
  const frameLeft = getSkinSprite(SKIN_URLS.graziFriendDanceLeft);
  const frameRight = getSkinSprite(SKIN_URLS.graziFriendDanceRight);

  const sinVal = Math.sin(swayPhase);
  const swayX = sinVal * 3.2;
  const swayY = -Math.abs(sinVal) * 0.75;
  const bx = cx + swayX;
  const by = cy + swayY;

  ctx.fillStyle = 'rgba(255, 185, 200, 0.12)';
  ctx.beginPath();
  ctx.arc(bx, by - 12, 26, 0, Math.PI * 2);
  ctx.fill();

  drawShadow(ctx, bx, cy + 9, 14, 4.2);

  const active = sinVal < 0 ? frameLeft ?? frameRight : frameRight ?? frameLeft;
  if (active) {
    drawSkinImage(ctx, active, bx, by, 37.5, {
      tiltRad: sinVal * 0.022,
    });
    return;
  }

  drawGraziSprite(ctx, bx - 7, by, { dir: 'right', emotion: 'neutral' });
  drawPatronSprite(ctx, bx + 7, by, 3, 'left', swayPhase, true, 'bboy');
}

export function drawArielEloisaSlowDance(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  swayPhase: number,
): void {
  const frameLeft = getSkinSprite(SKIN_URLS.arielEloisaDanceLeft);
  const frameRight = getSkinSprite(SKIN_URLS.arielEloisaDanceRight);

  // Synchronized slow sway matching the music while Ariel glances jealously left toward Grazi
  const sinVal = Math.sin(swayPhase + 0.55);
  const swayX = sinVal * 3.0;
  const swayY = -Math.abs(sinVal) * 0.7;
  const bx = cx + swayX;
  const by = cy + swayY;

  ctx.fillStyle = 'rgba(206, 178, 255, 0.12)';
  ctx.beginPath();
  ctx.arc(bx, by - 12, 26, 0, Math.PI * 2);
  ctx.fill();

  drawShadow(ctx, bx, cy + 9, 14.5, 4.2);

  const active = sinVal < 0 ? frameLeft ?? frameRight : frameRight ?? frameLeft;
  if (active) {
    drawSkinImage(ctx, active, bx, by, 37.5, {
      tiltRad: sinVal * 0.02,
    });
    return;
  }

  drawArielJealousSprite(ctx, bx - 7, by, swayPhase, true);
  drawEloisaSprite(ctx, bx + 7, by, { dir: 'left' });
}

// Dynamic multi-phase 90s Breakdance performer: top-rock -> 6-step footwork -> 360° windmill floor spin -> one-hand baby-freeze!
export function drawBreakdanceShowcaseSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  compact = false,
): { phase: 'toprock' | 'footwork' | 'windmill' | 'freeze' } {
  const cycle = time % 7.2;
  const scale = compact ? 0.86 : 1.06;

  const standSprite = getSkinSprite(SKIN_URLS.npcBboy);
  const footworkSprite = getSkinSprite(SKIN_URLS.bboyFootwork);
  const windmillSprite = getSkinSprite(SKIN_URLS.bboyWindmill);
  const freezeSprite = getSkinSprite(SKIN_URLS.bboyFreeze);

  // Subtle floor spotlight ring under the b-boy
  ctx.save();
  ctx.fillStyle = compact ? 'rgba(255, 209, 102, 0.11)' : 'rgba(255, 209, 102, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 7, 24 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (cycle < 1.1) {
    // Phase 1: Energetic 90s funk top-rock & drop-in
    const hop = Math.abs(Math.sin(time * 10.5)) * -3.2;
    const shiftX = Math.sin(time * 5.25) * 4.5;
    drawShadow(ctx, cx + shiftX, cy + 8, 9.5 * scale, 3.6 * scale);
    if (standSprite) {
      drawSkinImage(ctx, standSprite, cx + shiftX, cy + hop, 35 * scale, {
        flipX: Math.sin(time * 2.6) < 0,
        tiltRad: Math.sin(time * 5.25) * 0.09,
        scaleY: 1 + Math.max(0, Math.sin(time * 10.5)) * 0.05,
      });
    } else {
      drawPatronSprite(ctx, cx + shiftX, cy + hop, 3, 'down', time * 10, true, 'bboy');
    }
    return { phase: 'toprock' };
  }

  if (cycle < 3.0) {
    // Phase 2: Low 6-step fast floor footwork sweeping left and right
    const ft = cycle - 1.1;
    const sweepX = Math.sin(ft * 6.4) * 8.5 * scale;
    const bounceY = Math.abs(Math.cos(ft * 6.4)) * -2.2;
    drawShadow(ctx, cx + sweepX, cy + 8.5, 13 * scale, 4.4 * scale);

    // Subtle floor motion dust dots
    ctx.fillStyle = 'rgba(255, 232, 180, 0.45)';
    ctx.fillRect(px(cx + sweepX - 11), px(cy + 7), 3, 2);
    ctx.fillRect(px(cx + sweepX + 9), px(cy + 8), 2, 2);

    if (footworkSprite) {
      drawSkinImage(ctx, footworkSprite, cx + sweepX, cy + 2 + bounceY, 31 * scale, {
        flipX: Math.cos(ft * 6.4) < 0,
        tiltRad: Math.sin(ft * 6.4) * 0.08,
      });
    } else {
      drawPatronSprite(ctx, cx + sweepX, cy + bounceY, 3, 'down', time * 12, true, 'bboy');
    }
    return { phase: 'footwork' };
  }

  if (cycle < 5.2) {
    // Phase 3: Genuine 360° Windmill / Back-Spin on the dance floor!
    const wt = cycle - 3.0;
    const spinAngle = wt * Math.PI * 3.8; // fast energetic floor rotation!
    const orbitX = Math.cos(wt * 5.5) * 3.2;
    const orbitY = Math.sin(wt * 5.5) * 1.6;
    drawShadow(ctx, cx + orbitX, cy + 8.5, 15 * scale, 5.2 * scale);

    // Dynamic floor spin swoosh arcs
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 218, 120, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx + orbitX, cy + 6, 17 * scale, 7 * scale, 0, spinAngle, spinAngle + 2.1);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(91, 209, 197, 0.48)';
    ctx.beginPath();
    ctx.ellipse(cx + orbitX, cy + 6, 20 * scale, 8.5 * scale, 0, spinAngle + Math.PI, spinAngle + Math.PI + 1.8);
    ctx.stroke();
    ctx.restore();

    if (windmillSprite) {
      const aspect = windmillSprite.width / Math.max(1, windmillSprite.height);
      const drawH = 33 * scale;
      const drawW = drawH * aspect;
      const prevSmooth = ctx.imageSmoothingEnabled;
      const prevQuality = ctx.imageSmoothingQuality;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.translate(cx + orbitX, cy - 3 + orbitY);
      ctx.rotate(spinAngle);
      ctx.drawImage(windmillSprite.canvas, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
      ctx.imageSmoothingEnabled = prevSmooth;
      ctx.imageSmoothingQuality = prevQuality;
    } else {
      drawPatronSprite(ctx, cx + orbitX, cy, 3, 'down', time * 16, true, 'bboy');
    }
    return { phase: 'windmill' };
  }

  // Phase 4: Iconic One-Hand Baby-Freeze held with flair & crowd reaction!
  const fz = cycle - 5.2;
  const pop = fz < 0.22 ? Math.sin((fz / 0.22) * Math.PI) * 0.12 : 0;
  drawShadow(ctx, cx, cy + 8.5, 11 * scale, 4 * scale);

  // Golden freeze impact ring
  if (fz < 0.65) {
    const ringAlpha = Math.max(0, 1 - fz / 0.65);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 214, 102, ${(ringAlpha * 0.75).toFixed(2)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 7, (12 + fz * 26) * scale, (5 + fz * 11) * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  if (freezeSprite) {
    drawSkinImage(ctx, freezeSprite, cx, cy + 1, 35 * scale, {
      scaleX: 1 + pop,
      scaleY: 1 + pop,
      tiltRad: Math.sin(fz * 2.5) * 0.025,
    });
  } else {
    drawPatronSprite(ctx, cx, cy, 3, 'down', 0, false, 'bboy');
  }
  return { phase: 'freeze' };
}

export function drawArielForeheadKiss(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  elapsed: number,
): void {
  const kissFrame = getSkinSprite(SKIN_URLS.coupleForeheadKiss);

  // Soft bittersweet amber-rose spotlight framing the goodbye forehead kiss
  ctx.fillStyle = 'rgba(255, 195, 160, 0.14)';
  ctx.beginPath();
  ctx.arc(cx, cy - 14, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 215, 190, 0.2)';
  ctx.beginPath();
  ctx.arc(cx, cy - 14, 24, 0, Math.PI * 2);
  ctx.fill();

  drawShadow(ctx, cx, cy + 9, 14.5, 4.4);

  if (kissFrame) {
    const breath = Math.sin(elapsed * 1.8) * 0.007;
    drawSkinImage(ctx, kissFrame, cx, cy, 37.5, {
      scaleY: 1 + breath,
    });
    return;
  }

  drawGraziSprite(ctx, cx - 6, cy, { dir: 'right', emotion: 'sad', tiltRad: 0.03 });
  drawArielSprite(ctx, cx + 6, cy - 0.5, { dir: 'left', emotion: 'thoughtful', tiltRad: -0.05 });
}

export function drawMemorySparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  collected: boolean,
): void {
  if (collected) return;
  const pulse = 0.55 + 0.45 * Math.sin(time * 4.2 + cx * 0.1);
  const floatY = Math.sin(time * 3.0 + cy * 0.1) * 2.2;
  const x = px(cx);
  const y = px(cy + floatY);

  ctx.save();
  ctx.fillStyle = `rgba(255, 214, 102, ${(0.22 * pulse).toFixed(2)})`;
  ctx.beginPath();
  ctx.arc(x, y, 11 + pulse * 3, 0, Math.PI * 2);
  ctx.fill();

  // Crisp pixel 4-point star emblem
  ctx.fillStyle = '#fff5cc';
  ctx.fillRect(x - 1, y - 5, 2, 10);
  ctx.fillRect(x - 5, y - 1, 10, 2);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x - 2, y - 2, 4, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 1, y - 1, 2, 2);
  ctx.restore();
}

// ============================================================================
// STARDEW-INSPIRED TREES, BUSHES, LAMPS & DANCETERIA CRUZEIRO F.C. FACADE
// ============================================================================
export function drawStardewTree(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x = px(cx);
  const y = px(cy);
  drawShadow(ctx, x, y + 4, 22, 7);

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 7, y - 24, 14, 28);
  ctx.fillStyle = '#6e3d21';
  ctx.fillRect(x - 6, y - 23, 12, 26);
  ctx.fillStyle = '#8b512e';
  ctx.fillRect(x - 4, y - 22, 4, 24);

  const puffs = [
    { dx: -14, dy: -32, r: 15, c: '#295424' },
    { dx: 14, dy: -32, r: 15, c: '#295424' },
    { dx: 0, dy: -46, r: 18, c: '#356c2c' },
    { dx: -10, dy: -36, r: 13, c: '#488836' },
    { dx: 10, dy: -36, r: 13, c: '#488836' },
    { dx: 0, dy: -44, r: 13, c: '#66a844' },
  ];
  for (const p of puffs) {
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.arc(x + p.dx, y + p.dy, p.r + 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const p of puffs) {
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(x + p.dx, y + p.dy, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#8cc758';
  ctx.fillRect(x - 6, y - 52, 5, 3);
  ctx.fillRect(x + 4, y - 47, 4, 2);
  ctx.fillRect(x - 13, y - 40, 4, 2);
}

export function drawStardewBush(ctx: CanvasRenderingContext2D, cx: number, cy: number, hasFlowers = true): void {
  const x = px(cx);
  const y = px(cy);
  drawShadow(ctx, x, y + 3, 12, 4);
  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.arc(x - 6, y - 5, 8, 0, Math.PI * 2);
  ctx.arc(x + 6, y - 5, 8, 0, Math.PI * 2);
  ctx.arc(x, y - 9, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#33682b';
  ctx.beginPath();
  ctx.arc(x - 6, y - 5, 6.5, 0, Math.PI * 2);
  ctx.arc(x + 6, y - 5, 6.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#53943c';
  ctx.beginPath();
  ctx.arc(x, y - 9, 7.5, 0, Math.PI * 2);
  ctx.fill();

  if (hasFlowers) {
    ctx.fillStyle = '#f6d458';
    ctx.fillRect(x - 4, y - 10, 2, 2);
    ctx.fillStyle = '#f2829a';
    ctx.fillRect(x + 3, y - 7, 2, 2);
  }
}

export function drawStreetLamp(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
  const x = px(cx);
  const y = px(cy);

  ctx.fillStyle = 'rgba(255, 224, 130, 0.12)';
  ctx.beginPath();
  ctx.arc(x, y - 46, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 224, 130, 0.22)';
  ctx.beginPath();
  ctx.arc(x, y - 46, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 3, y - 54, 6, 54);
  ctx.fillStyle = '#36414f';
  ctx.fillRect(x - 2, y - 53, 4, 52);
  ctx.fillStyle = '#5a687a';
  ctx.fillRect(x - 1, y - 53, 1, 52);

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(x - 7, y - 62, 14, 10);
  ctx.fillStyle = '#ffe588';
  ctx.fillRect(x - 5, y - 60, 10, 6);
  ctx.fillStyle = '#2d3642';
  ctx.fillRect(x - 8, y - 64, 16, 3);
}

export function drawCruzeiroFacade(
  ctx: CanvasRenderingContext2D,
  originX: number,
  groundY: number,
  doorOpenAmount: number,
): void {
  const bx = px(originX);
  const gy = px(groundY);
  const mw = 390;
  const mh = 182;
  const topY = gy - mh;
  const rw = 164;
  const rh = 96;
  const rx = bx + mw - 4;
  const ry = gy - rh;

  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.moveTo(rx - 4, ry + 6);
  ctx.lineTo(rx + 42, ry - 40);
  ctx.lineTo(rx + rw + 6, ry + 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#992d22';
  ctx.beginPath();
  ctx.moveTo(rx - 2, ry + 5);
  ctx.lineTo(rx + 42, ry - 38);
  ctx.lineTo(rx + rw + 4, ry + 5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b94432';
  for (let tx = rx + 12; tx < rx + rw - 8; tx += 14) {
    ctx.fillRect(tx, ry - 12, 2, 16);
  }

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(rx, ry + 5, rw, rh - 5);
  ctx.fillStyle = '#f2ede2';
  ctx.fillRect(rx + 2, ry + 7, rw - 4, rh - 9);
  ctx.fillStyle = '#dbd1c2';
  ctx.fillRect(rx + 2, ry + 7, rw - 4, 8);

  const wingWinX = [rx + 18, rx + 50, rx + 96, rx + 128];
  for (const wx of wingWinX) {
    ctx.fillStyle = '#331c15';
    ctx.fillRect(wx, ry + 36, 16, 30);
    ctx.beginPath();
    ctx.arc(wx + 8, ry + 36, 8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#6e4933';
    ctx.fillRect(wx + 2, ry + 38, 12, 26);
  }

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bx, topY + 26, mw, mh - 26);
  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(bx + 2, topY + 28, mw - 4, mh - 30);
  ctx.fillStyle = '#dfd5c6';
  ctx.fillRect(bx + 2, topY + 28, mw - 4, 9);
  ctx.fillRect(bx + 2, topY + 104, mw - 4, 6);

  ctx.fillStyle = OUTLINE;
  ctx.beginPath();
  ctx.moveTo(bx - 14, topY + 30);
  ctx.lineTo(bx + 54, topY + 4);
  ctx.lineTo(bx + 258, topY - 12);
  ctx.lineTo(bx + mw + 14, topY + 30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#8c281d';
  ctx.beginPath();
  ctx.moveTo(bx - 10, topY + 28);
  ctx.lineTo(bx + 54, topY + 6);
  ctx.lineTo(bx + 258, topY - 9);
  ctx.lineTo(bx + mw + 10, topY + 28);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#b13c2b';
  for (let tx = bx + 6; tx < bx + mw - 6; tx += 12) {
    ctx.fillRect(tx, topY + 11, 2, 16);
  }

  const archStartX = bx + 84;
  const archW = 66;
  const archGap = 10;

  for (let i = 0; i < 3; i++) {
    const ax = archStartX + i * (archW + archGap);
    ctx.fillStyle = '#47281a';
    ctx.fillRect(ax, topY + 56, archW, 48);
    ctx.beginPath();
    ctx.arc(ax + archW / 2, topY + 56, archW / 2, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = 'rgba(245, 183, 70, 0.25)';
    ctx.fillRect(ax + 8, topY + 62, archW - 16, 28);

    ctx.fillStyle = '#754223';
    ctx.fillRect(ax, topY + 86, archW, 3);
    ctx.fillRect(ax, topY + 101, archW, 3);
    ctx.fillStyle = '#9c5d33';
    for (let pxRail = ax + 4; pxRail < ax + archW - 2; pxRail += 6) {
      ctx.fillRect(pxRail, topY + 89, 2, 12);
    }

    ctx.fillStyle = '#331c15';
    ctx.fillRect(ax, topY + 132, archW, 48);
    ctx.beginPath();
    ctx.arc(ax + archW / 2, topY + 132, archW / 2, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(218, 92, 130, 0.16)';
    ctx.fillRect(ax + 6, topY + 138, archW - 12, 36);
  }

  const sideCols = [bx + 18, bx + 48, bx + mw - 62, bx + mw - 32];
  for (const wx of sideCols) {
    ctx.fillStyle = '#2d1812';
    ctx.fillRect(wx, topY + 48, 12, 24);
    ctx.beginPath();
    ctx.arc(wx + 6, topY + 48, 6, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#784f32';
    ctx.fillRect(wx + 2, topY + 50, 8, 20);

    ctx.fillStyle = '#2d1812';
    ctx.fillRect(wx, topY + 132, 12, 28);
    ctx.beginPath();
    ctx.arc(wx + 6, topY + 132, 6, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#c8833e';
    ctx.fillRect(wx + 2, topY + 134, 8, 24);
  }

  ctx.save();
  ctx.fillStyle = '#b82522';
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DANCETERIA', bx + 42, topY + 106);
  ctx.fillText('CRUZEIRO F.C.', bx + mw - 42, topY + 106);
  ctx.restore();

  const fenceY = gy - 26;
  ctx.fillStyle = '#eae3d6';
  ctx.fillRect(bx - 16, gy - 8, mw + rw + 28, 8);
  ctx.fillStyle = '#a2b2c4';
  ctx.fillRect(bx - 16, fenceY + 2, mw + rw + 28, 1);
  ctx.fillRect(bx - 16, fenceY + 10, mw + rw + 28, 1);

  for (let fx = bx - 10; fx <= bx + mw + rw; fx += 44) {
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(fx - 3, fenceY - 2, 6, 26);
    ctx.fillStyle = '#2669b8';
    ctx.fillRect(fx - 2, fenceY - 1, 4, 24);
    ctx.fillStyle = '#4c90e0';
    ctx.fillRect(fx - 2, fenceY - 1, 1, 24);
  }

  const gateX = bx + 68;
  const gateY = gy - 44;
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(gateX - 2, gateY - 4, 48, 48);
  ctx.fillStyle = '#73231b';
  ctx.fillRect(gateX, gateY, 44, 44);
  ctx.fillStyle = '#521712';
  ctx.fillRect(gateX - 3, gateY - 4, 50, 6);

  const openW = Math.round(doorOpenAmount * 22);
  ctx.fillStyle = '#26130e';
  ctx.fillRect(gateX + 10, gateY + 10, 24, 34);
  if (doorOpenAmount > 0.05) {
    ctx.fillStyle = `rgba(255, 200, 110, ${(0.45 + doorOpenAmount * 0.45).toFixed(2)})`;
    ctx.fillRect(gateX + 10, gateY + 10, 24, 34);
    ctx.fillStyle = `rgba(255, 195, 105, ${(0.22 * doorOpenAmount).toFixed(2)})`;
    ctx.beginPath();
    ctx.moveTo(gateX + 10, gy);
    ctx.lineTo(gateX + 34, gy);
    ctx.lineTo(gateX + 46, gy + 26);
    ctx.lineTo(gateX - 2, gy + 26);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#8b4d29';
  ctx.fillRect(gateX + 10, gateY + 10, Math.max(4, 24 - openW), 34);
}

// ============================================================================
// STAGE 3 — DESSA VEZ, PRA FICAR (Léo, Moving Day & Couple Walk Sprites)
// ============================================================================

export function drawLeoSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  options: {
    dir?: Direction;
    walkDist?: number;
    isMoving?: boolean;
    useWalkSheetForIdle?: boolean;
    bobPhase?: number;
  } = {},
): void {
  const {
    dir = 'down',
    walkDist = 0,
    isMoving = false,
    useWalkSheetForIdle = false,
    bobPhase = 0,
  } = options;
  const sprite = getSkinSprite(SKIN_URLS.leoFront);
  const walkSin = isMoving ? Math.sin(walkDist * 0.24) : 0;
  const bob = isMoving ? -Math.abs(walkSin) * 1.4 : Math.sin(bobPhase) * 0.5;

  drawShadow(ctx, cx, cy + 9, 8.2, 3.0);

  if (isMoving || useWalkSheetForIdle) {
    const walkSheet = getCharacterWalkSheetImage('leo');
    if (walkSheet) {
      const row = dir === 'up' ? 2 : dir === 'down' ? 0 : 1;
      const column = isMoving ? (walkSin > 0.35 ? 1 : walkSin < -0.35 ? 2 : 0) : 0;
      if (
        drawWalkSheetFrame(ctx, walkSheet, row * 3 + column, cx, cy, 33.5, {
          bobY: bob,
          flipX: row === 1 && dir === 'right',
        })
      ) return;
    }
  }

  if (sprite) {
    drawSkinImage(ctx, sprite, cx, cy + bob, 33.5, {
      flipX: dir === 'left',
    });
    return;
  }

  // Fallback pixel silhouette while asset decodes
  const bx = Math.round(cx);
  const by = Math.round(cy + bob);
  ctx.fillStyle = '#3b2416';
  ctx.fillRect(bx - 5, by - 22, 10, 5);
  ctx.fillStyle = '#c48358';
  ctx.fillRect(bx - 4, by - 17, 8, 7);
  ctx.fillStyle = '#627345';
  ctx.fillRect(bx - 6, by - 10, 12, 10);
  ctx.fillStyle = '#3c6394';
  ctx.fillRect(bx - 5, by, 10, 9);
}

export function drawArielCarryBoxSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  options: {
    facingLeft?: boolean;
    walkPhase?: number;
  } = {},
): void {
  const { facingLeft = false, walkPhase = 0 } = options;
  const sprite = getSkinSprite(SKIN_URLS.arielCarryBox);
  const step = Math.sin(walkPhase);
  const bob = -Math.abs(step) * 1.6;

  drawShadow(ctx, cx, cy + 9, 9.2, 3.2);

  if (sprite) {
    drawSkinImage(ctx, sprite, cx, cy + bob, 34.5, {
      flipX: facingLeft,
    });
    return;
  }

  drawArielSprite(ctx, cx, cy + bob, { dir: facingLeft ? 'left' : 'right', walkPhase, isMoving: true });
  drawHeldMovingBox(ctx, cx + (facingLeft ? -4 : 4), cy - 4 + bob, 'box_books');
}

export function drawLeoCarryBoxSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  options: {
    facingLeft?: boolean;
    walkPhase?: number;
  } = {},
): void {
  const { facingLeft = false, walkPhase = 0 } = options;
  const sprite = getSkinSprite(SKIN_URLS.leoCarryBox);
  const step = Math.sin(walkPhase);
  const bob = -Math.abs(step) * 1.6;

  drawShadow(ctx, cx, cy + 9, 9.2, 3.2);

  if (sprite) {
    drawSkinImage(ctx, sprite, cx, cy + bob, 34.5, {
      flipX: facingLeft,
    });
    return;
  }

  drawLeoSprite(ctx, cx, cy + bob, { dir: facingLeft ? 'left' : 'right', isMoving: true, walkDist: walkPhase * 4 });
  drawHeldMovingBox(ctx, cx + (facingLeft ? -4 : 4), cy - 4 + bob, 'box_kitchen');
}

export function drawGraziArielWalkTogether(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  walkPhase: number,
  isWalking = true,
  dir?: Direction,
): void {
  const step = isWalking ? Math.sin(walkPhase) : Math.sin(walkPhase * 0.5) * 0.35;
  const bob = isWalking ? -Math.abs(step) * 1.3 : Math.sin(walkPhase) * 0.4;
  const facing = dir ?? 'right';

  if (isWalking && (facing === 'left' || facing === 'right')) {
    const walkSheet = getCharacterWalkSheetImage('graziAriel');
    const framePosition = ((Math.floor(walkPhase / (Math.PI / 2)) % 4) + 4) % 4;
    const sequence =
      facing === 'left'
        ? GRAZI_ARIEL_WALK_FRAME_SEQUENCES.left
        : GRAZI_ARIEL_WALK_FRAME_SEQUENCES.right;
    const frameIndex = sequence[framePosition];

    if (walkSheet) {
      drawShadow(ctx, cx, cy + 9.5, 16.5, 4.4);
      if (drawWalkSheetFrame(ctx, walkSheet, frameIndex, cx, cy, 36.5, { bobY: bob })) {
        return;
      }
    }
  } else if (!isWalking && (facing === 'left' || facing === 'right')) {
    const walkSheet = getCharacterWalkSheetImage('graziAriel');
    const idleFrame =
      facing === 'left'
        ? GRAZI_ARIEL_WALK_FRAME_SEQUENCES.left[0]
        : GRAZI_ARIEL_WALK_FRAME_SEQUENCES.right[0];
    if (walkSheet) {
      drawShadow(ctx, cx, cy + 9.5, 16.5, 4.4);
      if (drawWalkSheetFrame(ctx, walkSheet, idleFrame, cx, cy, 36.5)) {
        return;
      }
    } else {
      const sprite = getSkinSprite(SKIN_URLS.graziArielWalkTogether);
      if (sprite) {
        drawShadow(ctx, cx, cy + 9.5, 16.5, 4.4);
        drawSkinImage(ctx, sprite, cx, cy + bob, 36.5);
        return;
      }
    }
  }

  const facesLeft = facing === 'left';
  const graziX = cx + (facesLeft ? -12.5 : 12.5);
  const arielX = cx + (facesLeft ? 12.5 : -12.5);
  drawGraziSpriteAtCoupleScale(ctx, graziX, cy + bob, {
    dir: facing,
    isMoving: isWalking,
    walkPhase,
    useWalkSheetForIdle: true,
    emotion: 'happy',
  });
  drawArielSprite(ctx, arielX, cy + bob, {
    dir: facing,
    isMoving: isWalking,
    walkPhase,
    useWalkSheetForIdle: true,
  });
  drawCoupleJoinedHands(ctx, graziX, cy + bob, arielX, cy + bob);
}

export function drawHeldMovingBox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  kind: 'box_books' | 'box_tapes' | 'fan' | 'box_kitchen',
): void {
  const x = Math.round(cx);
  const y = Math.round(cy);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.32, 1.32);

  if (kind === 'fan') {
    // Classic 1990s white/blue tabletop fan held carefully
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(-6, -9, 12, 12);
    ctx.fillStyle = '#dce6f2';
    ctx.fillRect(-5, -8, 10, 10);
    ctx.fillStyle = '#5f9ed6';
    ctx.fillRect(-3, -6, 6, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, -4, 2, 2);
    ctx.fillStyle = '#3c4d63';
    ctx.fillRect(-3, 3, 6, 2);
    ctx.restore();
    return;
  }

  const boxFill =
    kind === 'box_tapes' ? '#c98e53' : kind === 'box_kitchen' ? '#d49d64' : '#be8349';
  const boxTop =
    kind === 'box_tapes' ? '#dfa96f' : kind === 'box_kitchen' ? '#e6b67d' : '#d59c60';

  ctx.fillStyle = OUTLINE;
  ctx.fillRect(-7, -6, 14, 11);
  ctx.fillStyle = boxFill;
  ctx.fillRect(-6, -2, 12, 6);
  ctx.fillStyle = boxTop;
  ctx.fillRect(-6, -5, 12, 3);
  // Packing tape strip
  ctx.fillStyle = '#f2dcb3';
  ctx.fillRect(-2, -5, 4, 6);
  ctx.restore();
}

