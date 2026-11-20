// ============================================================================
// HIGH-RESOLUTION PIXEL SPRITE LOADER (Chroma-Key Flood-Fill + Defringe + Trim)
// Converts solid #FF00FF chroma-keyed character skins into crisp transparent
// offscreen canvases with zero magenta halo and exact foot-aligned bounds.
// ============================================================================

export interface ProcessedSprite {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

const spritePromiseCache = new Map<string, Promise<ProcessedSprite>>();
const spriteReadyCache = new Map<string, ProcessedSprite>();

function isMagentaBg(r: number, g: number, b: number): boolean {
  // Strong neon magenta (#FF00FF) even with slight JPEG compression variance
  return r > 175 && b > 165 && g < 125 && r - g > 70 && b - g > 60;
}

function isMagentaFringe(r: number, g: number, b: number): boolean {
  // Subtle JPEG compression bleed along dark outlines next to #FF00FF
  return r > 110 && b > 105 && g < 110 && r - g > 38 && b - g > 34;
}

function extractTransparentSprite(img: HTMLImageElement): ProcessedSprite {
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;

  const raw = document.createElement('canvas');
  raw.width = srcW;
  raw.height = srcH;
  const rctx = raw.getContext('2d', { willReadFrequently: true });
  if (!rctx) {
    return { canvas: raw, width: srcW, height: srcH };
  }

  rctx.drawImage(img, 0, 0);
  const imageData = rctx.getImageData(0, 0, srcW, srcH);
  const data = imageData.data;
  const total = srcW * srcH;

  // Detect whether this sprite uses solid white (#FFFFFF) vs solid magenta (#FF00FF) backdrop
  const cornerCoords = [
    [0, 0],
    [srcW - 1, 0],
    [0, srcH - 1],
    [srcW - 1, srcH - 1],
  ];
  let whiteCornerHits = 0;
  let magentaCornerHits = 0;
  for (const [cx, cy] of cornerCoords) {
    const p = (cy * srcW + cx) * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    if (isMagentaBg(r, g, b)) magentaCornerHits++;
    else if (r > 235 && g > 235 && b > 235) whiteCornerHits++;
  }
  const useWhiteKey = magentaCornerHits === 0 && whiteCornerHits >= 3;

  const isWhiteBg = (r: number, g: number, b: number): boolean =>
    r > 224 && g > 224 && b > 224 && Math.max(r, g, b) - Math.min(r, g, b) < 24;

  const matchesBg = (r: number, g: number, b: number): boolean =>
    useWhiteKey ? isWhiteBg(r, g, b) : isMagentaBg(r, g, b);

  // Step 1: Flood-fill from all border pixels matching the detected backdrop color
  const visited = new Uint8Array(total);
  const isBg = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const trySeed = (x: number, y: number) => {
    const idx = y * srcW + x;
    if (visited[idx]) return;
    const p = idx * 4;
    if (matchesBg(data[p], data[p + 1], data[p + 2])) {
      visited[idx] = 1;
      isBg[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < srcW; x++) {
    trySeed(x, 0);
    trySeed(x, srcH - 1);
  }
  for (let y = 0; y < srcH; y++) {
    trySeed(0, y);
    trySeed(srcW - 1, y);
  }

  while (head < tail) {
    const idx = queue[head++];
    const x = idx % srcW;
    const y = (idx - x) / srcW;

    const neighbors = [
      x > 0 ? idx - 1 : -1,
      x < srcW - 1 ? idx + 1 : -1,
      y > 0 ? idx - srcW : -1,
      y < srcH - 1 ? idx + srcW : -1,
    ];

    for (const nIdx of neighbors) {
      if (nIdx < 0 || visited[nIdx]) continue;
      const p = nIdx * 4;
      if (matchesBg(data[p], data[p + 1], data[p + 2])) {
        visited[nIdx] = 1;
        isBg[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    }
  }

  // Step 2: For magenta-keyed sprites, also clear enclosed magenta pockets (between legs/arms)
  if (!useWhiteKey) {
    for (let idx = 0; idx < total; idx++) {
      if (isBg[idx]) continue;
      const p = idx * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      if (r > 175 && b > 168 && g < 118 && r - g > 72 && b - g > 65) {
        isBg[idx] = 1;
      }
    }
  }

  // Step 3: Border cleanup removing JPEG fringe next to transparent pixels
  const dropFringe = new Uint8Array(total);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        const idx = y * srcW + x;
        if (isBg[idx] || dropFringe[idx]) continue;
        const touchesBg =
          (x > 0 && (isBg[idx - 1] || dropFringe[idx - 1])) ||
          (x < srcW - 1 && (isBg[idx + 1] || dropFringe[idx + 1])) ||
          (y > 0 && (isBg[idx - srcW] || dropFringe[idx - srcW])) ||
          (y < srcH - 1 && (isBg[idx + srcW] || dropFringe[idx + srcW]));

        if (!touchesBg) continue;
        const p = idx * 4;
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        if (useWhiteKey) {
          if (r > 205 && g > 205 && b > 205 && Math.max(r, g, b) - Math.min(r, g, b) < 28) {
            dropFringe[idx] = 1;
          }
        } else if (
          isMagentaBg(r, g, b) ||
          (r > 145 && b > 140 && g < 105 && r - g > 55 && b - g > 50)
        ) {
          dropFringe[idx] = 1;
        } else if (isMagentaFringe(r, g, b)) {
          data[p] = Math.min(r, 56);
          data[p + 1] = Math.min(g, 34);
          data[p + 2] = Math.min(b, 26);
        }
      }
    }
  }

  // Step 4: Apply alpha & compute tight non-transparent bounding box
  let minX = srcW;
  let minY = srcH;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      const idx = y * srcW + x;
      const p = idx * 4;
      if (isBg[idx] || dropFringe[idx]) {
        data[p + 3] = 0;
      } else {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  rctx.putImageData(imageData, 0, 0);

  if (maxX <= minX || maxY <= minY) {
    return { canvas: raw, width: srcW, height: srcH };
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  let current = document.createElement('canvas');
  current.width = cropW;
  current.height = cropH;
  const cctx = current.getContext('2d');
  if (cctx) {
    cctx.imageSmoothingEnabled = false;
    cctx.drawImage(raw, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
  }

  // Crisp progressive mip-step downscale to max 180px tall once at load time
  // (~25x faster per-frame drawImage + razor-sharp close-up detail on kiss zoom)
  const MAX_SPRITE_H = 180;
  while (current.height > MAX_SPRITE_H * 1.6) {
    const nextW = Math.max(1, Math.round(current.width * 0.5));
    const nextH = Math.max(1, Math.round(current.height * 0.5));
    const step = document.createElement('canvas');
    step.width = nextW;
    step.height = nextH;
    const sctx = step.getContext('2d');
    if (sctx) {
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = 'high';
      sctx.drawImage(current, 0, 0, nextW, nextH);
    }
    current = step;
  }

  if (current.height > MAX_SPRITE_H) {
    const scale = MAX_SPRITE_H / current.height;
    const finalW = Math.max(1, Math.round(current.width * scale));
    const finalH = MAX_SPRITE_H;
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = finalW;
    finalCanvas.height = finalH;
    const fctx = finalCanvas.getContext('2d');
    if (fctx) {
      fctx.imageSmoothingEnabled = true;
      fctx.imageSmoothingQuality = 'high';
      fctx.drawImage(current, 0, 0, finalW, finalH);
    }
    current = finalCanvas;
  }

  return { canvas: current, width: current.width, height: current.height };
}

export function getCachedTransparentSprite(src: string): ProcessedSprite | null {
  return spriteReadyCache.get(src) ?? null;
}

export function loadTransparentSprite(src: string): Promise<ProcessedSprite> {
  const ready = spriteReadyCache.get(src);
  if (ready) return Promise.resolve(ready);

  const existing = spritePromiseCache.get(src);
  if (existing) return existing;

  const promise = new Promise<ProcessedSprite>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      const processed = extractTransparentSprite(img);
      spriteReadyCache.set(src, processed);
      resolve(processed);
    };
    img.onerror = (err) => reject(err);
    img.src = src;
  });

  spritePromiseCache.set(src, promise);
  return promise;
}
