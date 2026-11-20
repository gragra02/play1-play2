import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './mapData';
import type { DialogueSequence, MemoryItem, MovingItem, NpcEntity, Stage3MapId } from './types';

// ============================================================================
// FASE 3 — DESSA VEZ, PRA FICAR (5-Environment RPG Adventure Data)
// Pure data & maps module (zero image imports -> 100% Node unit-test safe).
//
// 5 Distinct Environments:
//   1. neighborhood_street — Rua do Bairro (Ponte do Imaruim)
//   2. hotdog_stand        — Barraca de Cachorro-Quente (Esquina Iluminada)
//   3. video_store         — Locadora de Vídeos (Anos 1990, Fitas VHS)
//   4. living_room         — Sala de Estar (Noite de Filme e Pipoca no Sofá)
//   5. moving_house        — Casa Nova (Dia da Mudança com Caixas e Móveis)
// ============================================================================

export const STAGE_3_CLOSING_QUOTE =
  'Algumas histórias precisam de tempo para encontrar o caminho. E, dessa vez, a gente escolheu continuar juntos.';

export type Stage3TileKind =
  // Outdoor neighborhood & moving day
  | 'house'
  | 'doorway'
  | 'porch'
  | 'tree'
  | 'bench'
  | 'lamp'
  | 'fence'
  | 'truck'
  | 'grass'
  | 'plaza'
  | 'road'
  | 'exit_path'
  // Hot-dog stand corner
  | 'hotdog_booth'
  | 'hotdog_tile'
  | 'picnic_table'
  | 'brick_wall'
  // Video store (1990s VHS rental)
  | 'store_wall'
  | 'store_floor'
  | 'store_carpet'
  | 'vhs_shelf'
  | 'vhs_counter'
  | 'store_tv'
  | 'glass_door'
  // Living room (movie night at home)
  | 'home_wall'
  | 'wood_floor'
  | 'home_rug'
  | 'home_sofa'
  | 'coffee_table'
  | 'home_tv'
  | 'bookshelf'
  | 'floor_lamp'
  | 'home_plant'
  | 'home_door';

export const STAGE3_LOCATION_LABELS: Record<Stage3MapId, string> = {
  neighborhood_street: 'RUA DO BAIRRO · CAMINHO NOVO',
  hotdog_stand: 'CALÇADA · BARRACA DE CACHORRO-QUENTE',
  video_store: 'LOCADORA DE VÍDEOS · FITAS VHS',
  living_room: 'SALA DE ESTAR · NOITE DE FILME',
  moving_house: 'CASA NOVA · DIA DA MUDANÇA',
};

// ----------------------------------------------------------------------------
// MAP 1: RUA DO BAIRRO (24x16)
// Top band: Neighborhood house (left), Video Store facade (center), house (right)
// Middle: Wide sunny brick sidewalk, parklet benches, streetlamps, trees
// Far right (cols 22-23, rows 7-9): Open street corner path -> Barraca de Cachorro-Quente
// ----------------------------------------------------------------------------
const RAW_NEIGHBORHOOD_MAP: string[] = [
  'TTHHHHHHHHTTHHHHHHHHTTTT',
  'TTHHHHHHHHTTHHHHHHHHTTTT',
  'FFHHHHHHHHGGHHHHHHHHGGFF',
  'FGGPPPPPPPPPPPPPPPPPPGGF',
  'FGPPPLGGGGPPPPGGGGLPPPGF',
  'FGGPGGGBGGPPPPGGGBGGPGGF',
  'FGPPGGGGPPPPPPPPGGGGPPGF',
  'FGPPPPPPPPPPPPPPPPPPPPEE',
  'FGPPPPPPPPPPPPPPPPPPPPEE',
  'FGPPGGGPPPPPPPPPPGGGPPGF',
  'FGGPGGGGPPPPPPPPGGGGPGGF',
  'FGGPPPPPPPPPPPPPPPPPPGGF',
  'RRRRRRRRRRRRRRRRRRRRRRRR',
  'RRRRRRRRRRRRRRRRRRRRRRRR',
  'GPPPPPPPPPPPPPPPPPPPPPPG',
  'TTGGFFGGTTGGGGTTGGFFGGTT',
];

// ----------------------------------------------------------------------------
// MAP 2: BARRACA / CARRINHO DE CACHORRO-QUENTE NA RUA (24x16)
// Open-air neighborhood sidewalk & square (praça ao ar livre — NO closed diner!):
// Left-center sidewalk (cols 6..9, rows 4..5): compact outdoor street hot-dog cart (X)
// Right sidewalk (cols 15..22, rows 0..3): illuminated Locadora de Vídeos storefront
// with a walkable glass entrance doorway (D at cols 18..19, row 3) so players
// literally walk up to the Locadora entrance and step inside!
// ----------------------------------------------------------------------------
const RAW_HOTDOG_MAP: string[] = [
  'TTTTGGGGTTGGTHHHHHHHHTTT',
  'TTGGGGGGGGGGTHHHHHHHHTTT',
  'FFGGLGGGLGGGGHHHHHHHHGFF',
  'FGGGGGPPPPPPGHHHDDHHHGGF',
  'FGPPPXXXXPPPPPPPPPPPPPGF',
  'FGPPPXXXXPPPPPPPPPPPPPGF',
  'FGPPPPPPPPPPPPPPPPPPPPGF',
  'FGPPPPPPPPPPPPPPPPPPPPGF',
  'FGPPGGPPPPPPPPPPPPGGPPGF',
  'FGGPGBGGPPPPPPPPGGGBGGGF',
  'FGGPGGGLPPPPPPPPLGGGGGGF',
  'FGGPPPPPPPPPPPPPPPPPPGGF',
  'RRRRRRRRRRRRRRRRRRRRRRRR',
  'RRRRRRRRRRRRRRRRRRRRRRRR',
  'GPPPPPPPPPPPPPPPPPPPPPPG',
  'TTGGFFGGTTGGGGTTGGFFGGTT',
];

// ----------------------------------------------------------------------------
// MAP 3: LOCADORA DE VÍDEOS — ANOS 1990 (24x16)
// Completely indoor 1990s VHS video rental store!
// Top wall: neon VHS sign, colorful movie posters, mounted CRT TV + VCR (V)
// Left-top (cols 3..8, rows 3..4): Service counter (A) with attendant & return bin
// Aisles: 4 colorful VHS tape shelf blocks (S) with wide 3-tile walkable aisles
// Bottom center (cols 11..12, row 14..15): Glass entrance/exit double doors (O)
// ----------------------------------------------------------------------------
const RAW_VIDEO_STORE_MAP: string[] = [
  'WWWWWWWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWWWWWWWWWW',
  'WWMMMMMMWWWWWWWWWWVVVWWW',
  'WWAAAAAAmmmmmmmmmmmmmmWW',
  'WWAAAAAAmmmmmmmmmmmmmmWW',
  'WWmmmmmmmmmmmmSSSSSSmmWW',
  'WWmmSSSSSmmmmmccccccmmWW',
  'WWmmcccccmmmmmccccccmmWW',
  'WWmmmmmmmmmmmmmmmmmmmmWW',
  'WWmmSSSSSmmmmmSSSSSSmmWW',
  'WWmmcccccmmmmmccccccmmWW',
  'WWmmmmmmmmmmmmmmmmmmmmWW',
  'WWmmmmmmmmmmmmmmmmmmmmWW',
  'WWmmmmmmmmmmmmmmmmmmmmWW',
  'WWWWWWWWWWWOOWWWWWWWWWWW',
  'WWWWWWWWWWWOOWWWWWWWWWWW',
];

// ----------------------------------------------------------------------------
// MAP 4: SALA DE ESTAR — NOITE DE FILME EM CASA (24x16)
// Cozy 1990s Brazilian domestic living room at night!
// Top wall: curtained night windows, framed photos, bookshelf (U), CRT TV + VCR (Z)
// Center: warm woven rug (r), coffee table with shared popcorn bowl (J),
// wide 4-seater comfy sofa (Y), warm floor lamps (I), houseplants (Q)
// Bottom center (cols 11..12, row 14..15): Front entrance door (E_home -> h)
// ----------------------------------------------------------------------------
const RAW_LIVING_ROOM_MAP: string[] = [
  'wwwwwwwwwwwwwwwwwwwwwwww',
  'wwwwwwwwwwwwwwwwwwwwwwww',
  'wwUUwwwwwwZZZZwwwwwwUUww',
  'wwddddddddddddddddddddww',
  'wwdIddddddddddddddddIdww',
  'wwddddrrrrJJJJrrrrddddww',
  'wwddddrrrrrrrrrrrrddddww',
  'wwddddrrrrrrrrrrrrddddww',
  'wwddddrrrYYYYYYrrrddddww',
  'wwddddrrrYYYYYYrrrddddww',
  'wwddddrrrrrrrrrrrrddddww',
  'wwd^dddddddddddddddd^dww',
  'wwddddddddddddddddddddww',
  'wwddddddddddddddddddddww',
  'wwwwwwwwwwwhhwwwwwwwwwww',
  'wwwwwwwwwwwhhwwwwwwwwwww',
];

// ----------------------------------------------------------------------------
// MAP 5: CASA NOVA — DIA DA MUDANÇA (24x16)
// Preserved sunny daytime Moving Day house, wooden veranda, open doorway,
// front yard walkway, and parked 1990s blue moving truck!
// ----------------------------------------------------------------------------
const RAW_MOVING_MAP: string[] = [
  'TTTTTHHHHHHHHHHHHHHTTTTT',
  'TTTTTHHHHHHHHHHHHHHTTTTT',
  'TTTGGHHHHHHHHHHHHHHGGTTT',
  'FFGGGWWWWWWDDWWWWWWGGGFF',
  'FGGGGWWWWWWDDWWWWWWGGGGF',
  'FGGGPGGGGPPPPPPGGGGPGGGF',
  'FGGGPGGGGPPPPPPGGGGPGGGF',
  'FGPPPGGGGPPPPPPGGGGPPPGF',
  'FGPPPPPPPPPPPPPPPPPPPPGF',
  'FGGPPGGGGPPPPPPGGGGPPGGF',
  'FGGPPPPPPPPPPPPPPPPPPGGF',
  'PPPPPPPPPPPPPPPPPPPPPPPP',
  'RRRRRKKKKKKRRRRRRRRRRRRR',
  'RRRRRKKKKKKRRRRRRRRRRRRR',
  'RRRRRRRRRRRRRRRRRRRRRRRR',
  'TTGGFFGGTTGGGGTTGGFFGGTT',
];

function parseGrid(
  rows: string[],
  mapper: (ch: string) => Stage3TileKind,
): Stage3TileKind[][] {
  return rows.map((row) => row.split('').map(mapper));
}

export const STAGE3_NEIGHBORHOOD_GRID: Stage3TileKind[][] = parseGrid(
  RAW_NEIGHBORHOOD_MAP,
  (ch) => {
    switch (ch) {
      case 'H':
        return 'house';
      case 'T':
        return 'tree';
      case 'B':
        return 'bench';
      case 'L':
        return 'lamp';
      case 'F':
        return 'fence';
      case 'P':
        return 'plaza';
      case 'R':
        return 'road';
      case 'E':
        return 'exit_path';
      default:
        return 'grass';
    }
  },
);

export const STAGE3_HOTDOG_GRID: Stage3TileKind[][] = parseGrid(RAW_HOTDOG_MAP, (ch) => {
  switch (ch) {
    case 'H':
      return 'house';
    case 'D':
      return 'doorway';
    case 'B':
      return 'bench';
    case 'T':
      return 'tree';
    case 'L':
      return 'lamp';
    case 'F':
      return 'fence';
    case 'X':
      return 'hotdog_booth';
    case 'P':
      return 'plaza';
    case 'R':
      return 'road';
    default:
      return 'grass';
  }
});

export const STAGE3_VIDEO_STORE_GRID: Stage3TileKind[][] = parseGrid(
  RAW_VIDEO_STORE_MAP,
  (ch) => {
    switch (ch) {
      case 'W':
      case 'M':
        return 'store_wall';
      case 'V':
        return 'store_tv';
      case 'A':
        return 'vhs_counter';
      case 'S':
        return 'vhs_shelf';
      case 'c':
        return 'store_carpet';
      case 'O':
        return 'glass_door';
      default:
        return 'store_floor';
    }
  },
);

export const STAGE3_LIVING_ROOM_GRID: Stage3TileKind[][] = parseGrid(
  RAW_LIVING_ROOM_MAP,
  (ch) => {
    switch (ch) {
      case 'w':
        return 'home_wall';
      case 'U':
        return 'bookshelf';
      case 'Z':
        return 'home_tv';
      case 'I':
        return 'floor_lamp';
      case '^':
        return 'home_plant';
      case 'J':
        return 'coffee_table';
      case 'Y':
        return 'home_sofa';
      case 'r':
        return 'home_rug';
      case 'h':
        return 'home_door';
      default:
        return 'wood_floor';
    }
  },
);

export const STAGE3_MOVING_GRID: Stage3TileKind[][] = parseGrid(RAW_MOVING_MAP, (ch) => {
  switch (ch) {
    case 'H':
      return 'house';
    case 'D':
      return 'doorway';
    case 'W':
      return 'porch';
    case 'T':
      return 'tree';
    case 'F':
      return 'fence';
    case 'K':
      return 'truck';
    case 'P':
      return 'plaza';
    case 'R':
      return 'road';
    default:
      return 'grass';
  }
});

const SOLID_S3_TILES = new Set<Stage3TileKind>([
  'house',
  'tree',
  'bench',
  'lamp',
  'fence',
  'truck',
  'hotdog_booth',
  'picnic_table',
  'brick_wall',
  'store_wall',
  'vhs_shelf',
  'vhs_counter',
  'store_tv',
  'home_wall',
  'home_sofa',
  'coffee_table',
  'home_tv',
  'bookshelf',
  'floor_lamp',
  'home_plant',
]);

export function getStage3Grid(mapId: Stage3MapId): Stage3TileKind[][] {
  switch (mapId) {
    case 'neighborhood_street':
      return STAGE3_NEIGHBORHOOD_GRID;
    case 'hotdog_stand':
      return STAGE3_HOTDOG_GRID;
    case 'video_store':
      return STAGE3_VIDEO_STORE_GRID;
    case 'living_room':
      return STAGE3_LIVING_ROOM_GRID;
    case 'moving_house':
      return STAGE3_MOVING_GRID;
  }
}

export function getStage3TileAt(mapId: Stage3MapId, col: number, row: number): Stage3TileKind {
  if (col < 0 || row < 0 || col >= MAP_COLS || row >= MAP_ROWS) {
    return 'fence';
  }
  return getStage3Grid(mapId)[row][col];
}

export function isStage3TileSolid(mapId: Stage3MapId, col: number, row: number): boolean {
  return SOLID_S3_TILES.has(getStage3TileAt(mapId, col, row));
}

export function isStage3RectWalkable(
  mapId: Stage3MapId,
  x: number,
  y: number,
  halfW: number,
  halfH: number,
): boolean {
  const minCol = Math.floor((x - halfW) / TILE_SIZE);
  const maxCol = Math.floor((x + halfW) / TILE_SIZE);
  const minRow = Math.floor((y - halfH) / TILE_SIZE);
  const maxRow = Math.floor((y + halfH) / TILE_SIZE);

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      if (isStage3TileSolid(mapId, col, row)) {
        return false;
      }
    }
  }
  return true;
}

// ----------------------------------------------------------------------------
// INTERACTIVE LANDMARKS, DOORS & PORTALS ACROSS THE 5 ENVIRONMENTS
// ----------------------------------------------------------------------------
export const STAGE3_HOTDOG_COUNTER_POS = {
  x: 7.0 * TILE_SIZE,
  y: 6.4 * TILE_SIZE,
  radius: 68,
};

export const STAGE3_STREET_EXIT_TO_HOTDOG = {
  x: 21.8 * TILE_SIZE,
  y: 8.0 * TILE_SIZE,
  radius: 56,
};

export const STAGE3_HOTDOG_EXIT_TO_VIDEOSTORE = {
  x: 17.0 * TILE_SIZE,
  y: 4.35 * TILE_SIZE,
  radius: 66,
};

export const STAGE3_VIDEOSTORE_COUNTER_POS = {
  x: 6.2 * TILE_SIZE,
  y: 5.4 * TILE_SIZE,
  radius: 56,
};

export const STAGE3_VIDEOSTORE_SHELVES = [
  {
    id: 'vhs_comedy',
    label: 'Olhar fitas de Comédia',
    genre: 'COMÉDIA',
    x: 6.5 * TILE_SIZE,
    y: 7.4 * TILE_SIZE,
    radius: 54,
    dialogueId: 's3_vhs_comedy',
  },
  {
    id: 'vhs_action',
    label: 'Olhar fitas de Ação e Aventura',
    genre: 'AÇÃO',
    x: 16.5 * TILE_SIZE,
    y: 6.6 * TILE_SIZE,
    radius: 54,
    dialogueId: 's3_vhs_action',
  },
  {
    id: 'vhs_romance',
    label: 'Olhar fitas de Romance',
    genre: 'ROMANCE',
    x: 6.5 * TILE_SIZE,
    y: 10.6 * TILE_SIZE,
    radius: 54,
    dialogueId: 's3_vhs_romance',
  },
  {
    id: 'vhs_releases',
    label: 'Olhar prateleira de Lançamentos',
    genre: 'LANÇAMENTOS',
    x: 16.5 * TILE_SIZE,
    y: 10.6 * TILE_SIZE,
    radius: 54,
    dialogueId: 's3_vhs_releases',
  },
] as const;

export const STAGE3_VIDEOSTORE_EXIT_TO_HOME = {
  x: 12.0 * TILE_SIZE,
  y: 13.7 * TILE_SIZE,
  radius: 56,
};

export const STAGE3_LIVINGROOM_SOFA_POS = {
  x: 12.0 * TILE_SIZE,
  y: 10.4 * TILE_SIZE,
  radius: 64,
};

export const STAGE3_LIVINGROOM_TV_POS = {
  x: 12.0 * TILE_SIZE,
  y: 4.1 * TILE_SIZE,
  radius: 54,
};

export const STAGE3_LIVINGROOM_EXIT_TO_ENDING = {
  x: 12.0 * TILE_SIZE,
  y: 13.7 * TILE_SIZE,
  radius: 56,
};

// Backwards-compatible alias kept for any existing references
export const STAGE3_LIVINGROOM_EXIT_TO_MOVING = STAGE3_LIVINGROOM_EXIT_TO_ENDING;

export const STAGE3_PORCH_DROP_POS = {
  x: 12.0 * TILE_SIZE,
  y: 4.5 * TILE_SIZE,
  radius: 56,
};

export function createInitialMovingItems(): MovingItem[] {
  return [
    {
      id: 'move_books',
      label: 'Caixa de Livros',
      kind: 'box_books',
      pickupX: 11.4 * TILE_SIZE,
      pickupY: 11.1 * TILE_SIZE,
      delivered: false,
    },
    {
      id: 'move_tapes',
      label: 'Caixa de Fitas K7',
      kind: 'box_tapes',
      pickupX: 13.0 * TILE_SIZE,
      pickupY: 11.1 * TILE_SIZE,
      delivered: false,
    },
    {
      id: 'move_fan',
      label: 'Ventilador da Sala',
      kind: 'fan',
      pickupX: 14.6 * TILE_SIZE,
      pickupY: 11.1 * TILE_SIZE,
      delivered: false,
    },
    {
      id: 'move_kitchen',
      label: 'Caixa da Cozinha',
      kind: 'box_kitchen',
      pickupX: 9.8 * TILE_SIZE,
      pickupY: 11.1 * TILE_SIZE,
      delivered: false,
    },
  ];
}

// ----------------------------------------------------------------------------
// 5 STAGE 3 MEMORIES (1 per distinct environment — zero ice cream!)
// ----------------------------------------------------------------------------
export const STAGE_3_MEMORIES: (MemoryItem & { mapId: Stage3MapId })[] = [
  {
    id: 'mem_s3_banco',
    mapId: 'neighborhood_street',
    title: 'Namoro de Laura e Léo',
    subtitle: 'Fase 3 · Rua do Bairro',
    description:
      'Enquanto Grazi e Ariel estavam separados, Laura e Léo começaram a namorar — foram quatro anos juntos, sempre grudados e cheios de carinho.',
    stageNumber: 3,
    x: 7.5 * TILE_SIZE,
    y: 6.5 * TILE_SIZE,
    radius: 50,
    dialogueId: 's3_mem_banco',
  },
  {
    id: 'mem_s3_cachorro_quente',
    mapId: 'hotdog_stand',
    title: 'Barraca de Cachorro-Quente',
    subtitle: 'Fase 3 · Os Dois Casais na Calçada',
    description:
      'Já como dois casais juntos, chegar à barraca de rua, escolher os acompanhamentos em pé na calçada dando risada e comer aquele cachorro-quente caprichado.',
    stageNumber: 3,
    x: 5.5 * TILE_SIZE,
    y: 9.2 * TILE_SIZE,
    radius: 52,
    dialogueId: 's3_mem_cachorro_quente',
  },
  {
    id: 'mem_s3_locadora',
    mapId: 'video_store',
    title: 'Noite na Locadora de Vídeos',
    subtitle: 'Fase 3 · Prateleiras de Fitas VHS',
    description:
      'Passear entre corredores cheios de fitas VHS e capas coloridas, discutindo qual filme levar para assistir os quatro juntos.',
    stageNumber: 3,
    x: 19.6 * TILE_SIZE,
    y: 4.3 * TILE_SIZE,
    radius: 52,
    dialogueId: 's3_mem_locadora',
  },
  {
    id: 'mem_s3_quatro',
    mapId: 'living_room',
    title: 'Filme, Pipoca e a Amizade dos Quatro',
    subtitle: 'Fase 3 · Grazi, Ariel, Laura e Léo',
    description:
      'Os dois casais espremidos no sofá dividindo uma tigela de pipoca na frente da TV — Laura e Léo namoraram por quatro anos e cada noite juntos era cheia de risadas.',
    stageNumber: 3,
    x: 4.8 * TILE_SIZE,
    y: 6.2 * TILE_SIZE,
    radius: 52,
    dialogueId: 's3_mem_quatro',
  },
  {
    id: 'mem_s3_mudanca',
    mapId: 'moving_house',
    title: 'A Mudança e o Reencontro',
    subtitle: 'Fase 3 · Casa Nova',
    description:
      'Ariel e Léo ajudaram Grazi na mudança de casa — e foi entre caixas, conversas e risadas naquele dia que Grazi e Ariel se reaproximaram e voltaram a namorar.',
    stageNumber: 3,
    x: 5.5 * TILE_SIZE,
    y: 8.6 * TILE_SIZE,
    radius: 52,
    dialogueId: 's3_mem_mudanca',
  },
];

// ----------------------------------------------------------------------------
// DIALOGUES ACROSS ALL 5 ENVIRONMENTS
// ----------------------------------------------------------------------------
export const STAGE_3_DIALOGUES: Record<string, DialogueSequence> = {
  // PRIMEIRO — LAURA E LÉO JÁ NAMORAM (enquanto Grazi e Ariel ainda estão separados)
  s3_laura_leo_dating: {
    id: 's3_laura_leo_dating',
    onCompleteAction: 's3_start_travel_to_moving',
    lines: [
      {
        id: 's3lld1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Oi, mana! Eu e o Léo estávamos dando uma volta aqui pelo bairro — agora a gente não se desgruda mais!',
        emotion: 'happy',
      },
      {
        id: 's3lld2',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Fala, Grazi! Tudo certo? A Laura já tomou conta do meu coração — e olha que a gente ainda vai ter muita história juntos.',
        emotion: 'happy',
      },
      {
        id: 's3lld3',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Vocês dois combinam demais, fico muito feliz de ver vocês assim! Eu tô na correria por causa da minha mudança de casa.',
        emotion: 'amused',
      },
      {
        id: 's3lld4',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Mudança de casa? Pode deixar comigo, Grazi! Eu vou lá te ajudar a carregar as caixas e os móveis — e vou chamar o Ariel pra dar uma força também!',
        emotion: 'happy',
      },
      {
        id: 's3lld5',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'O Ariel também vai...? Faz tempo que a gente não se fala desde que terminamos... mas toda ajuda vai ser muito bem-vinda.',
        emotion: 'thoughtful',
      },
      {
        id: 's3lld6',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Vai ser ótimo, mana! Os dois são fortes e vão dar conta de tudo rapidinho. Bora organizar essa mudança!',
        emotion: 'happy',
      },
    ],
  },

  // TERCEIRO — ENCONTRO DOS DOIS CASAIS NA RUA (DEPOIS DA MUDANÇA E DO PEDIDO DE NAMORO!)
  s3_walk_meet_couple: {
    id: 's3_walk_meet_couple',
    onCompleteAction: 's3_unlock_hotdog_exit',
    lines: [
      {
        id: 's3wm1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Olha só quem tá passeando de mãos dadas depois da mudança! Agora sim, dois casais juntinhos, mana!',
        emotion: 'happy',
      },
      {
        id: 's3wm2',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Fala, Grazi! Fala, mano! A mudança rendeu muito mais do que carregar caixa, hein? Até que enfim vocês voltaram!',
        emotion: 'happy',
      },
      {
        id: 's3wm3',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Ô Léo, colabora aí! Dessa vez é pra ficar mesmo — e eu não largo mais a mão da Grazi.',
        emotion: 'romantic',
      },
      {
        id: 's3wm4',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'A gente precisa comemorar os quatro juntos! Bora caminhar ali pra esquina comer um cachorro-quente?',
        emotion: 'happy',
      },
      {
        id: 's3wm5',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Bora! Vamos os dois casais juntos — segue ali pela calçada da direita até a barraca!',
        emotion: 'amused',
      },
    ],
  },

  // CENA 3 — BARRACA DE CACHORRO-QUENTE
  s3_hotdog_order: {
    id: 's3_hotdog_order',
    onCompleteAction: 's3_start_hotdog_cutscene',
    lines: [
      {
        id: 's3hd1',
        speaker: 'vendor',
        speakerName: 'Dono da Barraca',
        text: 'Boa noite, turma! O molho acabou de sair quentinho — vão querer cachorro-quente completo com tudo dentro?',
        emotion: 'happy',
      },
      {
        id: 's3hd2',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Opa! Pode caprichar no meu com bastante batata palha, milho, ervilha, ketchup e mostarda!',
        emotion: 'happy',
      },
      {
        id: 's3hd3',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'O Léo sempre monta um cachorro-quente do tamanho de um prédio! Eu quero completo também, mas sem exagerar na mostarda.',
        emotion: 'happy',
      },
      {
        id: 's3hd4',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Faz dois caprichados pra mim e pra Grazi também! Que cheiro bom tá esse molho hoje.',
        emotion: 'romantic',
      },
      {
        id: 's3hd5',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Nossa, perfeito! Com bastante batata palha! Nada melhor do que comer cachorro-quente com vocês.',
        emotion: 'amused',
      },
    ],
  },

  s3_hotdog_after: {
    id: 's3_hotdog_after',
    lines: [
      {
        id: 's3hda1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Tava bom demais esse cachorro-quente! Ei, já que a noite tá só começando... bora passar na locadora pegar um filme?',
        emotion: 'happy',
      },
      {
        id: 's3hda2',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Fechou! A gente escolhe uma fita boa na locadora e depois faz pipoca lá em casa!',
        emotion: 'happy',
      },
      {
        id: 's3hda3',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Partiu locadora então! Ela tá logo ali na calçada da direita — vamos caminhar até a entrada e entrar!',
        emotion: 'happy',
      },
    ],
  },

  s3_hotdog_chat_laura: {
    id: 's3_hotdog_chat_laura',
    lines: [
      {
        id: 's3hcl1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Mana, esse cheirinho de cachorro-quente dá água na boca só de chegar perto da barraca!',
        emotion: 'happy',
      },
    ],
  },

  s3_hotdog_chat_leo: {
    id: 's3_hotdog_chat_leo',
    lines: [
      {
        id: 's3hcle1',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Bora pedir no balcão, Grazi! Hoje eu tô com fome de dois cachorros-quentes!',
        emotion: 'happy',
      },
    ],
  },

  s3_hotdog_eat_first: {
    id: 's3_hotdog_eat_first',
    lines: [
      {
        id: 's3hef1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'A locadora tá abertinha ali esperando a gente! Mas vamos comer nosso cachorro-quente na barraca primeiro, que esse cheirinho tá bom demais!',
        emotion: 'happy',
      },
    ],
  },

  // CENA 4 — LOCADORA DE VÍDEOS (ANOS 90)
  s3_videostore_welcome: {
    id: 's3_videostore_welcome',
    lines: [
      {
        id: 's3vw1',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Olha quantas fitas novas nas prateleiras! Vamos dar uma olhada nos corredores pra escolher o filme da noite.',
        emotion: 'happy',
      },
      {
        id: 's3vw2',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Só não vale passar meia hora discutindo qual fita levar e sair sem nada, hein, Léo!',
        emotion: 'amused',
      },
      {
        id: 's3vw3',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Haha, escolher a capa na prateleira faz parte da graça! Dá uma olhada nas estantes aí, Grazi, e depois vamos no balcão!',
        emotion: 'happy',
      },
    ],
  },

  s3_vhs_comedy: {
    id: 's3_vhs_comedy',
    lines: [
      {
        id: 's3vc1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Olha essa prateleira de comédia! Tem umas capas bem engraçadas — sempre rende boas risadas quando a gente assiste os quatro.',
        emotion: 'happy',
      },
      {
        id: 's3vc2',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Adoro! Comédia com pipoca não tem erro.',
        emotion: 'amused',
      },
    ],
  },

  s3_vhs_action: {
    id: 's3_vhs_action',
    lines: [
      {
        id: 's3va1',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Ó essa seção de ação e aventura! Eu e o Ariel sempre ficamos lendo a sinopse atrás da caixinha pra decidir.',
        emotion: 'happy',
      },
      {
        id: 's3va2',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Essa capa aqui parece bem legal — dá pra levar na lista de finalistas!',
        emotion: 'happy',
      },
    ],
  },

  s3_vhs_romance: {
    id: 's3_vhs_romance',
    lines: [
      {
        id: 's3vr1',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Um romance também cai bem, né, Grazi? Especialmente agora que a gente tá junto de verdade.',
        emotion: 'romantic',
      },
      {
        id: 's3vr2',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Fofo! Vamos ver o que a Laura e o Léo acham também pra todo mundo curtir.',
        emotion: 'blush',
      },
    ],
  },

  s3_vhs_releases: {
    id: 's3_vhs_releases',
    lines: [
      {
        id: 's3vl1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Eita, os lançamentos quase sempre ficam alugados no fim de semana — ainda bem que sobrou fita boa hoje!',
        emotion: 'happy',
      },
    ],
  },

  s3_videostore_checkout: {
    id: 's3_videostore_checkout',
    onCompleteAction: 's3_start_videostore_cutscene',
    lines: [
      {
        id: 's3vck1',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Decidido então! Todo mundo topou levar essa fita pra assistir hoje à noite!',
        emotion: 'happy',
      },
      {
        id: 's3vck2',
        speaker: 'clerk',
        speakerName: 'Atendente da Locadora',
        text: 'Ótima escolha! Já anotei na fichinha de vocês — só lembrar de rebobinar a fita antes de devolver, combinado?',
        emotion: 'happy',
      },
      {
        id: 's3vck3',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Pode deixar! Fita na mão, agora bora pra casa estourar a pipoca!',
        emotion: 'happy',
      },
    ],
  },

  s3_videostore_chat_ariel: {
    id: 's3_videostore_chat_ariel',
    lines: [
      {
        id: 's3vca1',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Olha quanta capa legal nessas prateleiras, Grazi! Vamos ver as seções de fitas VHS com a Laura e o Léo.',
        emotion: 'happy',
      },
    ],
  },

  s3_videostore_browse_first: {
    id: 's3_videostore_browse_first',
    lines: [
      {
        id: 's3vbf1',
        speaker: 'clerk',
        speakerName: 'Atendente da Locadora',
        text: 'Fiquem à vontade! Deem uma voltinha pelas prateleiras de fitas VHS com os amigos primeiro pra escolher o filme da noite.',
        emotion: 'happy',
      },
    ],
  },

  // CENA ENGRAÇADA NA LOCADORA — ARIEL PEGA A MÃO ERRADA!
  s3_wrong_hand_after_wait: {
    id: 's3_wrong_hand_after_wait',
    lines: [
      {
        id: 's3whw1',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'EITA!! Espera aí... Laura?! Eu tava segurando a TUA mão esse tempo todo?!',
        emotion: 'surprised',
      },
      {
        id: 's3whw2',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Hahaha! Faz um tempão, Ariel! Eu e a Grazi percebemos na hora e resolvemos esperar pra ver quanto tempo tu ia demorar pra notar!',
        emotion: 'happy',
      },
      {
        id: 's3whw3',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Hahaha, tu tava tão entretido olhando as capas das fitas que nem olhou pro lado! Quase não aguentei segurar o riso!',
        emotion: 'amused',
      },
      {
        id: 's3whw4',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Que vergonha!! Eu fui pegar na mão da Grazi sem olhar e vocês duas ficaram quietinhas só rindo da minha cara!',
        emotion: 'blush',
      },
      {
        id: 's3whw5',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Hahaha, calma aí, mano, que essa aí é minha namorada! Essa cena na locadora a gente não vai esquecer nunca mais!',
        emotion: 'happy',
      },
    ],
  },

  s3_wrong_hand_after_tell: {
    id: 's3_wrong_hand_after_tell',
    lines: [
      {
        id: 's3wht1',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'O quê?! Laura?! Caramba, eu jurava que tinha pegado na mão da Grazi!',
        emotion: 'surprised',
      },
      {
        id: 's3wht2',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Hahaha! Eu percebi na hora e já tava quase caindo na risada aqui do lado!',
        emotion: 'happy',
      },
      {
        id: 's3wht3',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Ainda bem que eu te avisei logo, né, Ariel? Se eu deixasse quieto, tu ia até o balcão de mãos dadas com a minha irmã!',
        emotion: 'amused',
      },
      {
        id: 's3wht4',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Nossa, que mico! Fiquei tão distraído olhando as capas das fitas que nem percebi!',
        emotion: 'blush',
      },
      {
        id: 's3wht5',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Hahaha, dessa vez eu deixo passar porque a cara de susto do meu irmão valeu a noite inteira!',
        emotion: 'happy',
      },
    ],
  },

  s3_videostore_after_pick: {
    id: 's3_videostore_after_pick',
    lines: [
      {
        id: 's3vap1',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Fita garantida — e agora segurando a mão certa! Vamos sair ali pela porta da locadora e ir direto pra sala de casa.',
        emotion: 'happy',
      },
    ],
  },

  // CENA 5 — SALA DE ESTAR (NOITE DE FILME E PIPOCA NO SOFÁ)
  s3_livingroom_arrive: {
    id: 's3_livingroom_arrive',
    lines: [
      {
        id: 's3lra1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Pronto, a pipoca já tá na tigela bem quentinha e a fita já tá no videocassete!',
        emotion: 'happy',
      },
      {
        id: 's3lra2',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Vem sentar aqui no sofá com a gente, Grazi — já vou dar play no filme!',
        emotion: 'romantic',
      },
    ],
  },

  s3_livingroom_tv_check: {
    id: 's3_livingroom_tv_check',
    lines: [
      {
        id: 's3ltv1',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'O videocassete já tá no jeito e a pipoca tá cheirosa — só falta você sentar no sofá pra começar a sessão!',
        emotion: 'happy',
      },
    ],
  },

  s3_movienight_start: {
    id: 's3_movienight_start',
    onCompleteAction: 's3_start_movienight_cutscene',
    lines: [
      {
        id: 's3mns1',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Aconchego total! Os quatro juntos no sofá, tigela de pipoca no meio e filme na TV.',
        emotion: 'happy',
      },
      {
        id: 's3mns2',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Ô, vai devagar nessa pipoca aí que eu ainda nem peguei a minha parte! Hahaha!',
        emotion: 'happy',
      },
      {
        id: 's3mns3',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Hahaha, não tem programa melhor que esses nossos encontros, mana. Parece que a gente podia ficar assim a noite toda!',
        emotion: 'happy',
      },
    ],
  },

  s3_movienight_end: {
    id: 's3_movienight_end',
    lines: [
      {
        id: 's3mne1',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Que noite gostosa, gente... cachorro-quente, risada na locadora e filme com pipoca no sofá!',
        emotion: 'amused',
      },
      {
        id: 's3mne2',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Não tem nada melhor do que estar os quatro juntos assim, mana. Eu, o Léo, você e o Ariel — a nossa turma completa!',
        emotion: 'happy',
      },
      {
        id: 's3mne3',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Cada momento assim faz valer tudo o que a gente viveu. Vamos lá fora ver o fim de tarde juntos? É só seguir até a porta da sala.',
        emotion: 'romantic',
      },
    ],
  },

  // SEGUNDO — A MUDANÇA E O REENCONTRO DE GRAZI E ARIEL (CASA NOVA)
  s3_moving_intro: {
    id: 's3_moving_intro',
    lines: [
      {
        id: 's3mi1',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Chegamos na casa nova, Grazi! Trouxe o reforço aqui — eu e o Ariel vamos ajudar a carregar as caixas e os móveis!',
        emotion: 'happy',
      },
      {
        id: 's3mi2',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Oi, Grazi... fazia tempo, né? Vim dar uma força na mudança. Se você quiser ir pegando as caixas na calçada, a gente leva tudo pra varanda juntos.',
        emotion: 'blush',
      },
      {
        id: 's3mi3',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Oi, Ariel... obrigada mesmo por terem vindo, meninos! Vamos começar levando as caixas pra dentro.',
        emotion: 'happy',
      },
    ],
  },

  s3_moving_ariel_chat: {
    id: 's3_moving_ariel_chat',
    lines: [
      {
        id: 's3mac1',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'É bom estar perto de você de novo, Grazi... mesmo carregando caixa pesada, o tempo passa rápido quando a gente tá junto.',
        emotion: 'romantic',
      },
    ],
  },

  s3_moving_leo_chat: {
    id: 's3_moving_leo_chat',
    lines: [
      {
        id: 's3mlc1',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Ô Ariel, presta atenção na caixa e não fica só olhando pra Grazi, não! Hahaha, brincadeira — vamos acabar essa mudança!',
        emotion: 'happy',
      },
    ],
  },

  s3_moving_deliver_1: {
    id: 's3_moving_deliver_1',
    lines: [
      {
        id: 's3md1',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Boa, Grazi! Primeira caixa garantida na varanda — olha como a gente ainda trabalha bem junto.',
        emotion: 'happy',
      },
    ],
  },

  s3_moving_deliver_2: {
    id: 's3_moving_deliver_2',
    lines: [
      {
        id: 's3md2',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Essa das fitas K7 tem que ter cuidado dobrado, hein! Se riscar a fita das músicas lentas o Ariel chora!',
        emotion: 'happy',
      },
      {
        id: 's3md2b',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Hahaha, pode deixar que eu cuido bem delas!',
        emotion: 'amused',
      },
    ],
  },

  s3_moving_deliver_3: {
    id: 's3_moving_deliver_3',
    lines: [
      {
        id: 's3md3',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Falta só mais uma, Grazi! Nem parece que fazia tempo que a gente não passava um dia assim, rindo juntos.',
        emotion: 'romantic',
      },
    ],
  },

  s3_moving_deliver_final: {
    id: 's3_moving_deliver_final',
    onCompleteAction: 's3_start_moving_celebration',
    lines: [
      {
        id: 's3mdf1',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Pronto, tudo na casa nova! Não sei o que eu faria sem a ajuda de vocês dois hoje.',
        emotion: 'happy',
      },
      {
        id: 's3mdf2',
        speaker: 'leo',
        speakerName: 'Léo',
        text: 'Missão cumprida! Agora eu vou lá encontrar a Laura pra dar um alô — vou deixar vocês dois conversarem com calma aqui na varanda, hein!',
        emotion: 'happy',
      },
      {
        id: 's3mdf3',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Espera um pouquinho aqui comigo, Grazi... eu queria muito conversar contigo antes de ir embora.',
        emotion: 'romantic',
      },
    ],
  },

  // MEMÓRIAS DESBLOQUEÁVEIS (1 por cenário)
  s3_mem_banco: {
    id: 's3_mem_banco',
    lines: [
      {
        id: 's3mb1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Namoro de Laura e Léo',
        text: 'Enquanto Grazi e Ariel estavam separados, Laura e Léo começaram a namorar — foram quatro anos juntos, sempre caminhando lado a lado.',
        emotion: 'happy',
      },
    ],
  },

  s3_mem_cachorro_quente: {
    id: 's3_mem_cachorro_quente',
    lines: [
      {
        id: 's3mhd1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Barraca de Cachorro-Quente',
        text: 'Os passeios de fim de tarde até a barraca da esquina, rindo enquanto cada um escolhia os acompanhamentos do seu cachorro-quente.',
        emotion: 'happy',
      },
    ],
  },

  s3_mem_locadora: {
    id: 's3_mem_locadora',
    lines: [
      {
        id: 's3mloc1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Noite na Locadora de Vídeos',
        text: 'Andar entre prateleiras cheias de fitas VHS e capas coloridas, tentando entrar em acordo sobre qual filme assistir juntos.',
        emotion: 'happy',
      },
    ],
  },

  s3_mem_quatro: {
    id: 's3_mem_quatro',
    lines: [
      {
        id: 's3mq1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Filme, Pipoca e a Amizade dos Quatro',
        text: 'Grazi, Ariel, Laura e Léo juntos no sofá dividindo a tigela de pipoca — quatro anos de namoro da Laura com o Léo e uma amizade inesquecível.',
        emotion: 'happy',
      },
    ],
  },

  s3_mem_mudanca: {
    id: 's3_mem_mudanca',
    lines: [
      {
        id: 's3mmu1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Dia da Mudança',
        text: 'Caixas, móveis, risadas e parceria: Ariel e Léo ao lado de Grazi na mudança de casa, mostrando quem realmente estava presente.',
        emotion: 'happy',
      },
    ],
  },
};

export function createStage3Npcs(
  mode: 'reunion' | 'walk' | 'hotdog' | 'videostore' | 'livingroom' | 'moving',
): NpcEntity[] {
  if (mode === 'reunion') {
    // PRIMEIRO: Laura e Léo já namoram e estão juntos de mãos dadas — Grazi e Ariel ainda NÃO reataram!
    return [
      {
        id: 'laura',
        name: 'Laura',
        role: 'laura',
        x: 13.0 * TILE_SIZE,
        y: 7.8 * TILE_SIZE,
        dir: 'right',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.2,
      },
      {
        id: 'leo',
        name: 'Léo',
        role: 'leo',
        x: 13.54 * TILE_SIZE,
        y: 7.8 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.4,
      },
    ];
  }

  if (mode === 'walk') {
    // TERCEIRO: Depois da mudança e do pedido de namoro, os dois casais se encontram na rua!
    return [
      {
        id: 'ariel',
        name: 'Ariel',
        role: 'ariel',
        x: 6.15 * TILE_SIZE,
        y: 8.1 * TILE_SIZE,
        dir: 'right',
        visible: true,
        interactable: false,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 'laura',
        name: 'Laura',
        role: 'laura',
        x: 15.65 * TILE_SIZE,
        y: 9.05 * TILE_SIZE,
        dir: 'right',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.2,
      },
      {
        id: 'leo',
        name: 'Léo',
        role: 'leo',
        x: 16.19 * TILE_SIZE,
        y: 9.05 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.4,
      },
    ];
  }

  if (mode === 'hotdog') {
    // Dois casais chegando lado a lado e de mãos dadas pela calçada até a barraca ao ar livre!
    return [
      {
        id: 'vendor',
        name: 'Vendedor',
        role: 'vendor',
        x: 7.0 * TILE_SIZE,
        y: 4.5 * TILE_SIZE,
        dir: 'down',
        visible: true,
        interactable: false,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 'ariel',
        name: 'Ariel',
        role: 'ariel',
        x: 3.0 * TILE_SIZE,
        y: 7.5 * TILE_SIZE,
        dir: 'right',
        visible: true,
        interactable: false,
        variant: 0,
        dancePhaseOffset: 0.1,
      },
      {
        id: 'laura',
        name: 'Laura',
        role: 'laura',
        x: 2.05 * TILE_SIZE,
        y: 7.5 * TILE_SIZE,
        dir: 'right',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.3,
      },
      {
        id: 'leo',
        name: 'Léo',
        role: 'leo',
        x: 1.52 * TILE_SIZE,
        y: 7.5 * TILE_SIZE,
        dir: 'right',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.5,
      },
    ];
  }

  if (mode === 'videostore') {
    // Dentro da locadora: Laura e Léo sempre próximos olhando as prateleiras juntos!
    return [
      {
        id: 'clerk',
        name: 'Atendente',
        role: 'clerk',
        x: 5.5 * TILE_SIZE,
        y: 3.6 * TILE_SIZE,
        dir: 'down',
        visible: true,
        interactable: false,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 'ariel',
        name: 'Ariel',
        role: 'ariel',
        x: 11.15 * TILE_SIZE,
        y: 12.5 * TILE_SIZE,
        dir: 'up',
        visible: true,
        interactable: false,
        variant: 0,
        dancePhaseOffset: 0.1,
      },
      {
        id: 'laura',
        name: 'Laura',
        role: 'laura',
        x: 7.35 * TILE_SIZE,
        y: 7.6 * TILE_SIZE,
        dir: 'up',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.3,
      },
      {
        id: 'leo',
        name: 'Léo',
        role: 'leo',
        x: 7.89 * TILE_SIZE,
        y: 7.6 * TILE_SIZE,
        dir: 'up',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.5,
      },
    ];
  }

  if (mode === 'livingroom') {
    // Na sala de casa: Ariel à esquerda do sofá e Laura & Léo juntinhos à direita, ambos no assoalho livre!
    return [
      {
        id: 'ariel',
        name: 'Ariel',
        role: 'ariel',
        x: 6.2 * TILE_SIZE,
        y: 11.4 * TILE_SIZE,
        dir: 'right',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.1,
      },
      {
        id: 'laura',
        name: 'Laura',
        role: 'laura',
        x: 17.65 * TILE_SIZE,
        y: 11.4 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.3,
      },
      {
        id: 'leo',
        name: 'Léo',
        role: 'leo',
        x: 18.3 * TILE_SIZE,
        y: 11.4 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0.5,
      },
    ];
  }

  // mode === 'moving'
  return [
    {
      id: 'ariel',
      name: 'Ariel',
      role: 'ariel',
      x: 9.2 * TILE_SIZE,
      y: 8.4 * TILE_SIZE,
      dir: 'up',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
    {
      id: 'leo',
      name: 'Léo',
      role: 'leo',
      x: 14.4 * TILE_SIZE,
      y: 7.4 * TILE_SIZE,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0.5,
    },
  ];
}
