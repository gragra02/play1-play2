import { access, unlink, writeFile } from 'node:fs/promises';
import { dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

type Component = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  area: number;
  sumX: number;
  sumY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  pixels: Set<number>;
};

const DIRECTIONS = ['down', 'left', 'up'] as const;
const FRAME_NAMES = ['idle', 'stepA', 'stepB'] as const;
const DEFAULT_OUTPUT_BASENAME = 'grazi_walk_sheet_from_reference';

function isMagentaBg(r: number, g: number, b: number): boolean {
  return (
    (r > 175 && b > 165 && g < 125 && r - g > 70 && b - g > 60) ||
    (r > 130 && b > 120 && g < 85 && r - g > 60 && b - g > 50)
  );
}

function isMagentaFringe(r: number, g: number, b: number): boolean {
  return r > 110 && b > 105 && g < 110 && r - g > 38 && b - g > 34;
}

function removeMagentaBackground(data: Buffer, width: number, height: number): void {
  const total = width * height;
  const visited = new Uint8Array(total);
  const isBackground = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const trySeed = (x: number, y: number) => {
    const index = y * width + x;
    if (visited[index]) return;

    const pixel = index * 4;
    if (isMagentaBg(data[pixel], data[pixel + 1], data[pixel + 2])) {
      visited[index] = 1;
      isBackground[index] = 1;
      queue[tail++] = index;
    }
  };

  for (let x = 0; x < width; x++) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = (index - x) / width;
    const neighbors = [
      x > 0 ? index - 1 : -1,
      x < width - 1 ? index + 1 : -1,
      y > 0 ? index - width : -1,
      y < height - 1 ? index + width : -1,
    ];

    for (const neighbor of neighbors) {
      if (neighbor < 0 || visited[neighbor]) continue;
      const pixel = neighbor * 4;
      if (isMagentaBg(data[pixel], data[pixel + 1], data[pixel + 2])) {
        visited[neighbor] = 1;
        isBackground[neighbor] = 1;
        queue[tail++] = neighbor;
      }
    }
  }

  for (let index = 0; index < total; index++) {
    if (isBackground[index]) continue;
    const pixel = index * 4;
    const r = data[pixel];
    const g = data[pixel + 1];
    const b = data[pixel + 2];
    if (r > 175 && b > 168 && g < 118 && r - g > 72 && b - g > 65) {
      isBackground[index] = 1;
    }
  }

  const dropFringe = new Uint8Array(total);
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (isBackground[index] || dropFringe[index]) continue;

        const touchesBackground =
          (x > 0 && (isBackground[index - 1] || dropFringe[index - 1])) ||
          (x < width - 1 && (isBackground[index + 1] || dropFringe[index + 1])) ||
          (y > 0 && (isBackground[index - width] || dropFringe[index - width])) ||
          (y < height - 1 && (isBackground[index + width] || dropFringe[index + width]));
        if (!touchesBackground) continue;

        const pixel = index * 4;
        const r = data[pixel];
        const g = data[pixel + 1];
        const b = data[pixel + 2];
        if (
          isMagentaBg(r, g, b) ||
          (r > 145 && b > 140 && g < 105 && r - g > 55 && b - g > 50)
        ) {
          dropFringe[index] = 1;
        } else if (isMagentaFringe(r, g, b)) {
          data[pixel] = Math.min(r, 56);
          data[pixel + 1] = Math.min(g, 34);
          data[pixel + 2] = Math.min(b, 26);
        }
      }
    }
  }

  for (let index = 0; index < total; index++) {
    if (isBackground[index] || dropFringe[index]) {
      data[index * 4 + 3] = 0;
    }
  }
}

function findComponents(data: Buffer, width: number, height: number): Component[] {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  const components: Component[] = [];

  for (let start = 0; start < total; start++) {
    if (visited[start] || data[start * 4 + 3] === 0) continue;

    let head = 0;
    let tail = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let sumX = 0;
    let sumY = 0;
    visited[start] = 1;
    queue[tail++] = start;

    while (head < tail) {
      const index = queue[head++];
      const x = index % width;
      const y = (index - x) / width;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      sumX += x;
      sumY += y;

      for (let dy = -1; dy <= 1; dy++) {
        const nextY = y + dy;
        if (nextY < 0 || nextY >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nextX = x + dx;
          if (nextX < 0 || nextX >= width) continue;
          const neighbor = nextY * width + nextX;
          if (visited[neighbor] || data[neighbor * 4 + 3] === 0) continue;
          visited[neighbor] = 1;
          queue[tail++] = neighbor;
        }
      }
    }

    const pixels = new Set<number>();
    for (let p = 0; p < tail; p++) {
      pixels.add(queue[p]);
    }

    components.push({
      minX,
      minY,
      maxX,
      maxY,
      area: tail,
      sumX,
      sumY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      centerX: sumX / tail,
      centerY: sumY / tail,
      pixels,
    });
  }

  return components;
}

function detectFigures(
  components: Component[],
  imageHeight: number,
  requireNine: boolean,
): Component[] {
  const minArea = 200;
  const minHeight = Math.max(100, Math.round(imageHeight * 0.04));
  const rowThreshold = Math.max(40, imageHeight * 0.15);
  const figures = components
    .filter((component) => component.area >= minArea && component.height >= minHeight)
    .sort((a, b) =>
      Math.abs(a.centerY - b.centerY) > rowThreshold
        ? a.centerY - b.centerY
        : a.centerX - b.centerX,
    );

  if (figures.length === 0 || (requireNine && figures.length !== 9)) {
    const detected = figures.map(({ area, width, height, centerX, centerY }, index) => ({
      index,
      area,
      width,
      height,
      centerX: Math.round(centerX),
      centerY: Math.round(centerY),
    }));
    throw new Error(
      `${requireNine ? 'Expected 9' : 'Expected at least 1'} connected figures, ` +
        `found ${figures.length} after filtering. Detected components: ${JSON.stringify(detected)}`,
    );
  }

  return figures;
}

async function assertDoesNotExist(path: string): Promise<void> {
  try {
    await access(path);
    throw new Error(`Refusing to overwrite existing file: ${path}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Refusing to overwrite')) {
      throw error;
    }
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

async function writeNewFiles(
  pngPath: string,
  png: Buffer,
  jsonPath: string,
  json: string,
): Promise<void> {
  await assertDoesNotExist(pngPath);
  await assertDoesNotExist(jsonPath);
  const created: string[] = [];

  try {
    await writeFile(pngPath, png, { flag: 'wx' });
    created.push(pngPath);
    await writeFile(jsonPath, json, { flag: 'wx' });
    created.push(jsonPath);
  } catch (error) {
    await Promise.all(created.map((path) => unlink(path)));
    throw error;
  }
}

function parseArguments(args: string[]): {
  inputPath: string;
  outputBasename: string;
  frameMap?: Array<number | null>;
  flipCells: Set<number>;
} {
  let inputPath: string | undefined;
  let outputBasename = DEFAULT_OUTPUT_BASENAME;
  let frameMap: Array<number | null> | undefined;
  const flipCells = new Set<number>();

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input') {
      inputPath = args[++i];
    } else if (args[i] === '--output-basename') {
      outputBasename = args[++i];
    } else if (args[i] === '--frame-map') {
      const value = args[++i];
      if (!value) throw new Error('--frame-map requires 9 component indices or "-" for an empty cell.');
      frameMap = value.split(',').map((entry) => {
        if (entry === '-') return null;
        const index = Number(entry);
        if (!Number.isInteger(index) || index < 0) {
          throw new Error(`Invalid --frame-map component index: ${entry}`);
        }
        return index;
      });
      if (frameMap.length !== 9) throw new Error('--frame-map must contain exactly 9 entries.');
    } else if (args[i] === '--flip-cells') {
      const value = args[++i];
      if (!value) throw new Error('--flip-cells requires a comma-separated list of cell indices.');
      for (const entry of value.split(',')) {
        const index = Number(entry);
        if (!Number.isInteger(index) || index < 0 || index > 8) {
          throw new Error(`Invalid --flip-cells index: ${entry}`);
        }
        flipCells.add(index);
      }
    } else {
      throw new Error(
        'Usage: npx tsx scripts/sliceWalkSheet.ts --input <image-path> ' +
          '[--output-basename <name>] [--frame-map <9 indices or ->] [--flip-cells <indices>]',
      );
    }
  }

  if (!inputPath || !outputBasename || basename(outputBasename) !== outputBasename) {
    throw new Error(
      'Provide --input <image-path> and a simple --output-basename without directory segments.',
    );
  }

  return { inputPath: resolve(inputPath), outputBasename, frameMap, flipCells };
}

async function main(): Promise<void> {
  const { inputPath, outputBasename, frameMap, flipCells } = parseArguments(process.argv.slice(2));
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const imagesDirectory = resolve(projectRoot, 'src', 'assets', 'images');
  const pngPath = resolve(imagesDirectory, `${outputBasename}.png`);
  const jsonPath = resolve(imagesDirectory, `${outputBasename}.json`);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) {
    throw new Error(`Expected four RGBA channels after decoding, got ${info.channels}.`);
  }

  removeMagentaBackground(data, info.width, info.height);
  const components = findComponents(data, info.width, info.height);
  const figures = detectFigures(components, info.height, frameMap === undefined);
  const cellFigures = frameMap
    ? frameMap.map((index) => {
        if (index === null) return null;
        const figure = figures[index];
        if (!figure) throw new Error(`--frame-map refers to missing component ${index}.`);
        return figure;
      })
    : figures.map((figure) => figure);
  const selectedFigures = cellFigures.filter((figure): figure is Component => figure !== null);
  if (selectedFigures.length === 0) throw new Error('The frame map does not select any figures.');

  const maxFigureWidth = Math.max(...selectedFigures.map((figure) => figure.width));
  const maxFigureHeight = Math.max(...selectedFigures.map((figure) => figure.height));
  const padding = 4;
  const cellWidth = maxFigureWidth + padding * 2;
  const cellHeight = maxFigureHeight + padding * 2;
  const sheetWidth = cellWidth * 3;
  const sheetHeight = cellHeight * 3;
  const output = Buffer.alloc(sheetWidth * sheetHeight * 4);

  for (let i = 0; i < cellFigures.length; i++) {
    const figure = cellFigures[i];
    if (!figure) continue;
    const row = Math.floor(i / 3);
    const column = i % 3;
    const offsetX = column * cellWidth + padding + Math.floor((maxFigureWidth - figure.width) / 2);
    const offsetY = row * cellHeight + cellHeight - padding - figure.height;
    const flipX = flipCells.has(i);

    for (let y = figure.minY; y <= figure.maxY; y++) {
      for (let x = figure.minX; x <= figure.maxX; x++) {
        const pixelIndex = y * info.width + x;
        if (!figure.pixels.has(pixelIndex)) continue;
        const source = pixelIndex * 4;
        if (data[source + 3] === 0) continue;
        const localX = x - figure.minX;
        const targetX = flipX ? figure.width - 1 - localX : localX;
        const target =
          ((offsetY + y - figure.minY) * sheetWidth + offsetX + targetX) * 4;
        output[target] = data[source];
        output[target + 1] = data[source + 1];
        output[target + 2] = data[source + 2];
        output[target + 3] = data[source + 3];
      }
    }
  }

  const png = await sharp(output, {
    raw: { width: sheetWidth, height: sheetHeight, channels: 4 },
  })
    .png()
    .toBuffer();
  const metadata = {
    image: `${outputBasename}.png`,
    columns: 3,
    rows: DIRECTIONS.map((direction, row) => ({
      direction,
      frames: FRAME_NAMES,
      available: cellFigures.slice(row * 3, row * 3 + 3).map((figure) => figure !== null),
    })),
    cell: { width: cellWidth, height: cellHeight },
    frameMap: cellFigures.map((figure, index) => ({
      cell: index,
      sourceComponent: frameMap ? frameMap[index] : index,
      mirrored: flipCells.has(index),
      available: figure !== null,
    })),
  };

  await writeNewFiles(pngPath, png, jsonPath, `${JSON.stringify(metadata, null, 2)}\n`);
  console.log(
    `Created ${pngPath} (${sheetWidth}x${sheetHeight}) and ${jsonPath}; ` +
      `mapped ${selectedFigures.length} frames from ${figures.length} detected figures.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
