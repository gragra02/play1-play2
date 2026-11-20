import type { ExteriorTeen, NpcEntity, PropInteractable, TileKind } from './types';

export const TILE_SIZE = 32;
export const MAP_COLS = 24;
export const MAP_ROWS = 16;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE; // 768
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE; // 512

// Interior Discoteca Cruzeiro tilemap:
// '#' = wall, '.' = warm oak wood floor, 'D' = dance floor, 'E' = entrance mat,
// 'C' = wooden bar counter, 'J' = DJ booth, 'R' = velvet rope,
// 'P' = speaker cabinet, 'F' = vintage soda fridge, 'T' = potted indoor plant,
// 'B' = simple concrete table, 'K' = simple concrete chair/stool, 'O' = double wooden entrance door
const RAW_MAP: string[] = [
  '########################',
  '#P..T...P......P..T...F#',
  '#..KBK...JJJJJJ..KBK...#',
  '#......................#',
  '#...................C..#',
  '#.KB...DDDDDDDDDD...C..#',
  '#......DDDDDDDDDD...C..#',
  '#......DDDDDDDDDD...C..#',
  '#.KB...DDDDDDDDDD...C..#',
  '#......DDDDDDDDDD...C..#',
  '#......DDDDDDDDDD...C..#',
  '#.T....DDDDDDDDDD......#',
  '#...................BK.#',
  '#..EE.R.............T..#',
  '#..EE..................#',
  '###OO###################',
];

const CHAR_TO_TILE: Record<string, TileKind> = {
  '#': 'wall',
  '.': 'floor_club',
  'D': 'floor_dance',
  'E': 'floor_entrance',
  'C': 'counter',
  'J': 'dj_booth',
  'R': 'rope',
  'P': 'speaker',
  'F': 'fridge',
  'T': 'plant',
  'B': 'table',
  'K': 'concrete_chair',
  'O': 'door',
};

export const SOLID_TILES = new Set<TileKind>([
  'wall',
  'counter',
  'dj_booth',
  'sofa',
  'rope',
  'speaker',
  'fridge',
  'plant',
  'table',
  'concrete_chair',
  'door',
]);

export const MAP_GRID: TileKind[][] = RAW_MAP.map((row) =>
  row.split('').map((ch) => CHAR_TO_TILE[ch] ?? 'floor_club'),
);

export function getTileAt(col: number, row: number): TileKind {
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) {
    return 'wall';
  }
  return MAP_GRID[row][col];
}

export function isTileSolid(col: number, row: number): boolean {
  return SOLID_TILES.has(getTileAt(col, row));
}

export const GRAZI_SPAWN = {
  x: 3.8 * TILE_SIZE,
  y: 12.55 * TILE_SIZE,
};

export const DISCO_BALL_POS = {
  x: 11.5 * TILE_SIZE,
  y: 7.7 * TILE_SIZE,
};

export const ARIEL_PISTA_SPOT = {
  x: 11.5 * TILE_SIZE,
  y: 7.5 * TILE_SIZE,
};

export function createInitialNpcs(): NpcEntity[] {
  return [
    {
      id: 'laura',
      name: 'Laura',
      role: 'laura',
      x: 5.3 * TILE_SIZE,
      y: 7.5 * TILE_SIZE,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
    {
      id: 'junior',
      name: 'Junior',
      role: 'junior',
      x: 4.4 * TILE_SIZE,
      y: 4.3 * TILE_SIZE,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0.4,
    },
    {
      id: 'ariel',
      name: 'Ariel',
      role: 'ariel',
      x: ARIEL_PISTA_SPOT.x,
      y: ARIEL_PISTA_SPOT.y,
      dir: 'down',
      visible: true, // Already present on the dance floor from Cena 3 onward
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
    {
      id: 'dj',
      name: 'DJ Cruzeiro',
      role: 'dj',
      x: 11.5 * TILE_SIZE,
      y: 2.38 * TILE_SIZE,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0.2,
    },
    {
      id: 'bartender',
      name: 'Atendente',
      role: 'bartender',
      x: 21.8 * TILE_SIZE,
      y: 7.0 * TILE_SIZE,
      dir: 'left',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0.7,
    },
    {
      id: 'bboy-circle',
      name: 'Galera da Pista',
      role: 'bboy',
      x: 17.5 * TILE_SIZE,
      y: 4.2 * TILE_SIZE,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0.15,
    },
    // Chatting teen groups inside the club
    {
      id: 'teen-chat-1',
      name: 'Turma da Cruzeiro',
      role: 'teen_chat',
      x: 17.6 * TILE_SIZE,
      y: 11.5 * TILE_SIZE,
      dir: 'right',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0.25,
    },
    {
      id: 'teen-chat-2',
      name: 'Turma da Cruzeiro',
      role: 'teen_chat',
      x: 18.4 * TILE_SIZE,
      y: 11.5 * TILE_SIZE,
      dir: 'left',
      visible: true,
      interactable: false,
      variant: 1,
      dancePhaseOffset: 0.55,
    },
    // Dancing couples & patrons around the dance floor
    {
      id: 'dancer-1',
      name: 'Casal na Pista',
      role: 'dancer',
      x: 7.9 * TILE_SIZE,
      y: 5.9 * TILE_SIZE,
      dir: 'right',
      visible: true,
      interactable: false,
      variant: 0,
      dancePhaseOffset: 0.1,
    },
    {
      id: 'dancer-1b',
      name: 'Casal na Pista',
      role: 'dancer',
      x: 8.5 * TILE_SIZE,
      y: 5.9 * TILE_SIZE,
      dir: 'left',
      visible: true,
      interactable: false,
      variant: 1,
      dancePhaseOffset: 0.1,
    },
    {
      id: 'dancer-2',
      name: 'Casal na Pista',
      role: 'dancer',
      x: 14.8 * TILE_SIZE,
      y: 6.1 * TILE_SIZE,
      dir: 'right',
      visible: true,
      interactable: false,
      variant: 2,
      dancePhaseOffset: 0.5,
    },
    {
      id: 'dancer-2b',
      name: 'Casal na Pista',
      role: 'dancer',
      x: 15.4 * TILE_SIZE,
      y: 6.1 * TILE_SIZE,
      dir: 'left',
      visible: true,
      interactable: false,
      variant: 3,
      dancePhaseOffset: 0.5,
    },
    {
      id: 'dancer-3',
      name: 'Frequentador',
      role: 'dancer',
      x: 8.2 * TILE_SIZE,
      y: 10.6 * TILE_SIZE,
      dir: 'right',
      visible: true,
      interactable: false,
      variant: 2,
      dancePhaseOffset: 0.85,
    },
    {
      id: 'dancer-4',
      name: 'Frequentadora',
      role: 'dancer',
      x: 15.2 * TILE_SIZE,
      y: 10.2 * TILE_SIZE,
      dir: 'up',
      visible: true,
      interactable: false,
      variant: 3,
      dancePhaseOffset: 0.33,
    },
  ];
}

export const PROP_INTERACTABLES: PropInteractable[] = [
  {
    id: 'prop-entrance',
    label: 'Entrada da Cruzeiro',
    x: 4.0 * TILE_SIZE,
    y: 14.3 * TILE_SIZE,
    radius: 44,
    dialogueId: 'prop_entrance',
  },
  {
    id: 'prop-counter',
    label: 'Balcão',
    x: 21.0 * TILE_SIZE,
    y: 7.0 * TILE_SIZE,
    radius: 56,
    dialogueId: 'prop_counter',
  },
  {
    id: 'prop-dj',
    label: 'Cabine e Quadro da Cruzeiro',
    x: 11.5 * TILE_SIZE,
    y: 2.9 * TILE_SIZE,
    radius: 56,
    dialogueId: 'prop_dj',
  },
  {
    id: 'prop-sofa',
    label: 'Mesas de Concreto',
    x: 4.0 * TILE_SIZE,
    y: 3.1 * TILE_SIZE,
    radius: 46,
    dialogueId: 'prop_sofa',
  },
];

// Exterior teen groups arriving & chatting on Ponte do Imaruim sidewalk in Cena 2
export const EXTERIOR_TEENS: ExteriorTeen[] = [
  { id: 'ext-1', startX: 110, startY: 422, targetX: 256, targetY: 382, variant: 0, enterDelay: 0.2, chatMode: false },
  { id: 'ext-2', startX: 132, startY: 428, targetX: 256, targetY: 382, variant: 1, enterDelay: 0.4, chatMode: false },
  { id: 'ext-3', startX: 430, startY: 422, targetX: 410, targetY: 416, variant: 2, enterDelay: 0, chatMode: true },
  { id: 'ext-4', startX: 454, startY: 422, targetX: 436, targetY: 416, variant: 3, enterDelay: 0, chatMode: true },
  { id: 'ext-5', startX: 640, startY: 426, targetX: 256, targetY: 384, variant: 2, enterDelay: 1.0, chatMode: false },
];
