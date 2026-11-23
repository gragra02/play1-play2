import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './mapData';
import type { DialogueSequence, MemoryItem, NpcEntity, Stage6MapId } from './types';

// ============================================================================
// STAGE 6 — NOSSA HISTÓRIA CONTINUA (Última fase do Volume 1)
// Dados de cenários, zonas caminháveis/bloqueadas, hotspots, checagem F3
// e SOMENTE as falas exatas do roteiro (Regra 8).
// ============================================================================

export interface Stage6Zone {
  id: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Stage6Hotspot extends Stage6Zone {
  standX: number;
  standY: number;
}

export interface Stage6FaceBounds {
  id: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Stage6FaceOverlap {
  a: Stage6FaceBounds;
  b: Stage6FaceBounds;
}

export interface Stage6MemoryItem extends MemoryItem {
  mapId: Stage6MapId;
}

export const STAGE_6_MEMORIES: Stage6MemoryItem[] = [
  {
    id: 'mem_s6_abraco_familia',
    title: 'O abraço da nossa família',
    subtitle: 'Grazi, Ariel, Cris (12) e Lara (5)',
    description: '“Seremos muito felizes!” — O abraço coletivo e carinhoso da família na sala de casa.',
    stageNumber: 6,
    mapId: 's6_sala_familia',
    x: 12.2 * TILE_SIZE,
    y: 12.4 * TILE_SIZE,
    radius: 56,
    dialogueId: 's6_scene1_hug_quote',
  },
  {
    id: 'mem_s6_dia_piscina',
    title: 'Um dia feliz na piscina',
    subtitle: 'Sol, risadas e mergulhos em família',
    description: 'Grazi, Ariel, Cris (12) e Lara (5) aproveitando um dia ensolarado e leve na piscina.',
    stageNumber: 6,
    mapId: 's6_piscina_condominio',
    x: 420,
    y: 350,
    radius: 56,
    dialogueId: 's6_scene2_pool',
  },
  {
    id: 'mem_s6_videogame_familia',
    title: 'Noite de videogame em família',
    subtitle: 'Cris (19) e Lara (15) jogando com Grazi e Ariel',
    description: 'Os anos passaram, os filhos cresceram, mas jogar videogame juntos continua unindo a família.',
    stageNumber: 6,
    mapId: 's6_sala_videogame_teens',
    x: 420,
    y: 440,
    radius: 56,
    dialogueId: 's6_scene3_videogame',
  },
  {
    id: 'mem_s6_abraco_quarto',
    title: 'Dentro do abraço do Ariel',
    subtitle: 'Presença, carinho e acolhimento nos dias difíceis',
    description: '“O melhor lugar do mundo é dentro do abraço do Ariel.”',
    stageNumber: 6,
    mapId: 's6_quarto_casal_noite',
    x: 384,
    y: 356,
    radius: 56,
    dialogueId: 's6_scene4_bed_quote',
  },
];

// ============================================================================
// CENA 1 · SALA DA FAMÍLIA (s6_sala_familia.jpg — 1264x848 mapeado para 768x512)
// ============================================================================
export const STAGE6_SALA_FAMILIA_WALK_ZONES: Stage6Zone[] = [
  { id: 'piso_sala', label: 'Piso central da sala', x1: 118, y1: 318, x2: 530, y2: 492 },
  { id: 'corredor_porta', label: 'Entrada pela porta esquerda', x1: 24, y1: 416, x2: 140, y2: 492 },
];

export const STAGE6_SALA_FAMILIA_BLOCKED_ZONES: Stage6Zone[] = [
  { id: 'parede_fundo', label: 'Parede do fundo e janela', x1: 0, y1: 0, x2: 768, y2: 316 },
  { id: 'rack_tv', label: 'Painel da TV e PS5', x1: 126, y1: 185, x2: 360, y2: 362 },
  { id: 'sofa_cinza', label: 'Sofá cinza com almofada', x1: 500, y1: 280, x2: 768, y2: 512 },
];

export const STAGE6_SALA_FAMILIA_HOTSPOTS: Stage6Hotspot[] = [
  { id: 'hs_abraco_centro', label: 'Centro da Sala · Abraço em Família', x1: 340, y1: 365, x2: 470, y2: 445, standX: 405, standY: 415 },
  { id: 'hs_porta_sala', label: 'Porta da Sala', x1: 8, y1: 72, x2: 96, y2: 440, standX: 72, standY: 442 },
  { id: 'hs_tv_ps5', label: 'Painel da TV e Videogame', x1: 140, y1: 150, x2: 356, y2: 350, standX: 280, standY: 382 },
  { id: 'hs_sofa_sala', label: 'Sofá da Família', x1: 506, y1: 290, x2: 750, y2: 495, standX: 482, standY: 412 },
];

export const S6_SALA_FAMILIA_CHAR_SCALE = 2.05;

export const STAGE6_SCENE1_LAYOUT = {
  hugCenter: { x: 384, y: 454 },
  arielStart: { x: 180, y: 430 },
  graziStart: { x: 486, y: 432 },
  crisStart: { x: 266, y: 462 },
  laraStart: { x: 456, y: 468 },
  // Posições finais logo antes do abraço (sem sobreposição de rostos na escala proporcional)
  arielMeet: { x: 292, y: 436 },
  graziMeet: { x: 472, y: 436 },
  crisMeet: { x: 356, y: 450 },
  laraMeet: { x: 416, y: 458 },
} as const;

export function isStage6SalaFamiliaBoxWalkable(
  left: number,
  top: number,
  right: number,
  bottom: number,
): boolean {
  const corners: Array<[number, number]> = [
    [left, top],
    [right, top],
    [left, bottom],
    [right, bottom],
  ];
  for (const [cx, cy] of corners) {
    if (
      !STAGE6_SALA_FAMILIA_WALK_ZONES.some(
        (z) => cx >= z.x1 && cx <= z.x2 && cy >= z.y1 && cy <= z.y2,
      )
    ) {
      return false;
    }
  }
  for (const z of STAGE6_SALA_FAMILIA_BLOCKED_ZONES) {
    if (left < z.x2 && right > z.x1 && top < z.y2 && bottom > z.y1) return false;
  }
  return true;
}

export function isStage6TileSolid(mapId: Stage6MapId, col: number, row: number): boolean {
  if (mapId === 's6_sala_familia') {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    return !isStage6SalaFamiliaBoxWalkable(cx - 1, cy - 1, cx + 1, cy + 1);
  }
  if (mapId === 's6_piscina_condominio') {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    return !isStage6PiscinaBoxWalkable(cx - 1, cy - 1, cx + 1, cy + 1);
  }
  if (mapId === 's6_cozinha_pia') {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    return !isStage6CozinhaBoxWalkable(cx - 1, cy - 1, cx + 1, cy + 1);
  }
  return col < 1 || col >= MAP_COLS - 1 || row < 1 || row >= MAP_ROWS - 1;
}

// ============================================================================
// CENA 2 · PISCINA DO CONDOMÍNIO (s6_piscina_condominio.jpg — 1264x848 → 768x512)
// ============================================================================
export const S6_PISCINA_CHAR_SCALE = 1.22;

export const STAGE6_PISCINA_WATER_ZONES: Stage6Zone[] = [
  { id: 'agua_prainha', label: 'Prainha rasa da piscina', x1: 112, y1: 274, x2: 368, y2: 374 },
  { id: 'agua_canal_esq', label: 'Piscina (lado esquerdo)', x1: 112, y1: 370, x2: 356, y2: 440 },
  { id: 'agua_curva_dir', label: 'Piscina principal (curva direita)', x1: 354, y1: 288, x2: 676, y2: 388 },
];

export const STAGE6_PISCINA_WALK_ZONES: Stage6Zone[] = [
  { id: 'deck_inferior', label: 'Deck de madeira e pedra inferior', x1: 24, y1: 422, x2: 744, y2: 498 },
  { id: 'deck_direito', label: 'Deck lateral direito e escadinha', x1: 540, y1: 368, x2: 744, y2: 498 },
  { id: 'deck_esquerdo', label: 'Borda esquerda da piscina', x1: 72, y1: 344, x2: 145, y2: 440 },
  ...STAGE6_PISCINA_WATER_ZONES,
];

export const STAGE6_PISCINA_BLOCKED_ZONES: Stage6Zone[] = [
  { id: 'fundo_predio_quadra', label: 'Prédio, grade e quadra ao fundo', x1: 0, y1: 0, x2: 768, y2: 266 },
  { id: 'espreguicadeiras_esq', label: 'Espreguiçadeiras esquerda', x1: 0, y1: 266, x2: 96, y2: 346 },
  { id: 'espreguicadeiras_dir', label: 'Espreguiçadeiras direita', x1: 696, y1: 266, x2: 768, y2: 405 },
];

export const STAGE6_PISCINA_HOTSPOTS: Stage6Hotspot[] = [
  { id: 'hs_piscina_escada', label: 'Escadinha da Piscina', x1: 548, y1: 356, x2: 616, y2: 412, standX: 582, standY: 424 },
  { id: 'hs_piscina_lara', label: 'Prainha · Lara (5 anos)', x1: 180, y1: 292, x2: 300, y2: 360, standX: 232, standY: 332 },
  { id: 'hs_piscina_cris', label: 'Centro · Cris (12 anos)', x1: 310, y1: 310, x2: 440, y2: 382, standX: 374, standY: 354 },
  { id: 'hs_piscina_ariel', label: 'Lado Direito · Ariel', x1: 470, y1: 298, x2: 610, y2: 380, standX: 536, standY: 342 },
];

export function isPointInStage6PoolWater(x: number, y: number): boolean {
  return STAGE6_PISCINA_WATER_ZONES.some(
    (z) => x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2,
  );
}

export const S6_VIDEOGAME_CHAR_SCALE = 1.72;
export const S6_VIDEOGAME_TOTAL_ROUNDS = 3;

// Contra-plano olhando de frente para o sofá:
// Cris (19) e Lara (15) sentados no sofá; Ariel e Grazi sentados de pernas cruzadas no chão à frente!
export const STAGE6_SCENE3_VIDEOGAME_LAYOUT = {
  cris: { x: 266, y: 416 },
  lara: { x: 498, y: 416 },
  ariel: { x: 334, y: 486 },
  grazi: { x: 436, y: 486 },
} as const;

export function getStage6VideogameFaceBoxes(): Stage6FaceBounds[] {
  const L = STAGE6_SCENE3_VIDEOGAME_LAYOUT;
  const s = S6_VIDEOGAME_CHAR_SCALE;
  return [
    getStage6CharacterFaceBounds('cris', 'Cris (19 anos)', L.cris.x, L.cris.y, Math.round(45 * 1.6 * s)),
    getStage6CharacterFaceBounds('lara', 'Lara (15 anos)', L.lara.x, L.lara.y, Math.round(43 * 1.6 * s)),
    getStage6CharacterFaceBounds('ariel', 'Ariel', L.ariel.x, L.ariel.y, Math.round(45 * 1.6 * s)),
    getStage6CharacterFaceBounds('grazi', 'Grazi', L.grazi.x, L.grazi.y, Math.round(45 * 1.6 * s)),
  ];
}

export function isStage6PiscinaBoxWalkable(
  left: number,
  top: number,
  right: number,
  bottom: number,
): boolean {
  const corners: Array<[number, number]> = [
    [left, top],
    [right, top],
    [left, bottom],
    [right, bottom],
  ];
  for (const [cx, cy] of corners) {
    if (
      !STAGE6_PISCINA_WALK_ZONES.some(
        (z) => cx >= z.x1 && cx <= z.x2 && cy >= z.y1 && cy <= z.y2,
      )
    ) {
      return false;
    }
  }
  for (const z of STAGE6_PISCINA_BLOCKED_ZONES) {
    if (left < z.x2 && right > z.x1 && top < z.y2 && bottom > z.y1) return false;
  }
  return true;
}

// ============================================================================
// CENA 5 · COZINHA — ARIEL "MARIDO DE ALUGUEL" / PIA ENTUPIDA (s6_cozinha_pia.jpg)
// ============================================================================
export const S6_COZINHA_CHAR_SCALE = 2.45;
export const S6_SINK_TOTAL_STEPS = 3;

export const STAGE6_COZINHA_WALK_ZONES: Stage6Zone[] = [
  { id: 'piso_cozinha', label: 'Piso livre da cozinha', x1: 36, y1: 438, x2: 732, y2: 504 },
];

export const STAGE6_COZINHA_BLOCKED_ZONES: Stage6Zone[] = [
  { id: 'bancada_armarios', label: 'Bancada, pia, fogão, lavadora e geladeira', x1: 0, y1: 0, x2: 768, y2: 432 },
];

export const STAGE6_COZINHA_HOTSPOTS: Stage6Hotspot[] = [
  { id: 'hs_pia_entupida', label: 'Pia da Cozinha · Ajudar o Ariel', x1: 454, y1: 230, x2: 600, y2: 468, standX: 408, standY: 468 },
];

export function isStage6CozinhaBoxWalkable(
  left: number,
  top: number,
  right: number,
  bottom: number,
): boolean {
  const corners: Array<[number, number]> = [
    [left, top],
    [right, top],
    [left, bottom],
    [right, bottom],
  ];
  for (const [cx, cy] of corners) {
    if (
      !STAGE6_COZINHA_WALK_ZONES.some(
        (z) => cx >= z.x1 && cx <= z.x2 && cy >= z.y1 && cy <= z.y2,
      )
    ) {
      return false;
    }
  }
  for (const z of STAGE6_COZINHA_BLOCKED_ZONES) {
    if (left < z.x2 && right > z.x1 && top < z.y2 && bottom > z.y1) return false;
  }
  return true;
}

// ============================================================================
// CENA 6 · ANIVERSÁRIO DO ARIEL — 23/11/2026 (s6_sala_aniversario.jpg)
// Ariel fica atrás/ao lado esquerdo do bolo virado para a direita, assoprando direto nas velas!
// ============================================================================
export const STAGE6_SCENE6_BIRTHDAY_LAYOUT = {
  cake: { x: 436, y: 292, drawW: 72 },
  candles: { x: 436, y: 264, drawW: 28, drawH: 35 },
  ariel: { x: 346, y: 374, drawH: 162 },
  grazi: { x: 258, y: 398, drawH: 166 },
  cris: { x: 224, y: 468, drawH: 172 },
  lara: { x: 534, y: 398, drawH: 166 },
  manu: { x: 610, y: 432, drawH: 170 },
  marquinho: { x: 690, y: 456, drawH: 176 },
} as const;

export function getStage6BirthdayFaceBoxes(): Stage6FaceBounds[] {
  const L = STAGE6_SCENE6_BIRTHDAY_LAYOUT;
  return [
    getStage6CharacterFaceBounds('cris_bday', 'Cris', L.cris.x, L.cris.y, L.cris.drawH),
    getStage6CharacterFaceBounds('grazi_bday', 'Grazi', L.grazi.x, L.grazi.y, L.grazi.drawH),
    getStage6CharacterFaceBounds('ariel_bday', 'Ariel', L.ariel.x, L.ariel.y, L.ariel.drawH),
    getStage6CharacterFaceBounds('lara_bday', 'Lara', L.lara.x, L.lara.y, L.lara.drawH),
    getStage6CharacterFaceBounds('manu_bday', 'Manu', L.manu.x, L.manu.y, L.manu.drawH),
    getStage6CharacterFaceBounds('marquinho_bday', 'Marquinho', L.marquinho.x, L.marquinho.y, L.marquinho.drawH),
  ];
}

// ============================================================================
// CENA FINAL · O CONVITE PARA O VOLUME 2 (s6_tela_final_volume1.jpg)
// ============================================================================
export const STAGE6_FINAL_LAYOUT = {
  cris: { x: 186, y: 444, drawH: 158 },
  lara: { x: 266, y: 440, drawH: 152 },
  grazi: { x: 344, y: 434, drawH: 152 },
  ariel: { x: 424, y: 434, drawH: 160 },
  manu: { x: 504, y: 440, drawH: 152 },
  marquinho: { x: 584, y: 444, drawH: 158 },
} as const;

export function getStage6FinalFaceBoxes(): Stage6FaceBounds[] {
  const L = STAGE6_FINAL_LAYOUT;
  return [
    getStage6CharacterFaceBounds('cris_fin', 'Cris', L.cris.x, L.cris.y, L.cris.drawH),
    getStage6CharacterFaceBounds('lara_fin', 'Lara', L.lara.x, L.lara.y, L.lara.drawH),
    getStage6CharacterFaceBounds('grazi_fin', 'Grazi', L.grazi.x, L.grazi.y, L.grazi.drawH),
    getStage6CharacterFaceBounds('ariel_fin', 'Ariel', L.ariel.x, L.ariel.y, L.ariel.drawH),
    getStage6CharacterFaceBounds('manu_fin', 'Manu', L.manu.x, L.manu.y, L.manu.drawH),
    getStage6CharacterFaceBounds('marquinho_fin', 'Marquinho', L.marquinho.x, L.marquinho.y, L.marquinho.drawH),
  ];
}

export function createStage6Npcs(mapId: Stage6MapId): NpcEntity[] {
  if (mapId === 's6_sala_familia') {
    return [
      {
        id: 's6_ariel_sala',
        name: 'Ariel',
        role: 'ariel',
        x: 278,
        y: 416,
        dir: 'right',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 's6_cris_12yo_sala',
        name: 'Cris (12 anos)',
        role: 'cristian',
        x: 368,
        y: 434,
        dir: 'down',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 's6_lara_5yo_sala',
        name: 'Lara (5 anos)',
        role: 'lara',
        x: 454,
        y: 446,
        dir: 'down',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ];
  }
  if (mapId === 's6_piscina_condominio') {
    return [
      {
        id: 's6_lara_pool',
        name: 'Lara (5 anos)',
        role: 'lara',
        x: 232,
        y: 332,
        dir: 'right',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 's6_cris_pool',
        name: 'Cris (12 anos)',
        role: 'cristian',
        x: 374,
        y: 354,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 's6_ariel_pool',
        name: 'Ariel',
        role: 'ariel',
        x: 536,
        y: 342,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ];
  }
  if (mapId === 's6_cozinha_pia') {
    return [
      {
        id: 's6_ariel_pia',
        name: 'Ariel',
        role: 'ariel',
        x: 512,
        y: 458,
        dir: 'up',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ];
  }
  return [];
}

export function getStage6CharacterFaceBounds(
  id: string,
  label: string,
  footX: number,
  footY: number,
  drawH: number,
): Stage6FaceBounds {
  const headW = Math.max(14, Math.round(drawH * 0.28));
  const headH = Math.max(12, Math.round(drawH * 0.24));
  const topY = Math.round(footY + 8.5 - drawH + drawH * 0.06);
  return {
    id,
    label,
    x1: Math.round(footX - headW / 2),
    y1: topY,
    x2: Math.round(footX + headW / 2),
    y2: topY + headH,
  };
}

export function findStage6FaceOverlaps(boxes: Stage6FaceBounds[]): Stage6FaceOverlap[] {
  const overlaps: Stage6FaceOverlap[] = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1) {
        overlaps.push({ a, b });
      }
    }
  }
  return overlaps;
}

// ============================================================================
// DIÁLOGOS DA FASE 6 — SOMENTE AS FALAS EXATAS DO ROTEIRO (Regra 8)
// ============================================================================
export const STAGE_6_DIALOGUES: Record<string, DialogueSequence> = {
  // CENA 1 — O abraço da família
  s6_scene1_hug_quote: {
    id: 's6_scene1_hug_quote',
    onCompleteAction: 's6_scene1_finish_hug',
    lines: [
      {
        id: 's6_s1_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Olha só a família que a gente construiu...',
        emotion: 'romantic',
      },
      {
        id: 's6_s1_2',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'E pensar em tudo que a gente já viveu até chegar aqui.',
        emotion: 'romantic',
      },
      {
        id: 's6_s1_3',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Ainda temos muita coisa bonita pela frente.',
        emotion: 'happy',
      },
      {
        id: 's6_s1_4',
        speaker: 'grazi_adult',
        speakerName: 'Todos',
        text: 'Seremos muito felizes!',
        emotion: 'happy',
      },
    ],
  },

  // CENA 2 — Um dia na piscina
  s6_scene2_pool: {
    id: 's6_scene2_pool',
    onCompleteAction: 's6_start_videogame_transition',
    lines: [
      {
        id: 's6_s2_1',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Hoje é dia de esquecer os problemas e aproveitar!',
        emotion: 'happy',
      },
      {
        id: 's6_s2_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Quero ver quem vai ser o primeiro a sair da piscina!',
        emotion: 'amused',
      },
      {
        id: 's6_s2_3',
        speaker: 'cristian',
        speakerName: 'Cristian / Lara',
        text: 'Ninguém! Hoje a gente vai ficar aqui!',
        emotion: 'happy',
      },
    ],
  },

  // CENA 3 — Os quatro jogando videogame
  s6_scene3_videogame: {
    id: 's6_scene3_videogame',
    onCompleteAction: 's6_start_bedroom_transition',
    lines: [
      {
        id: 's6_s3_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Pode admitir, Ariel, você não ganha de mim!',
        emotion: 'amused',
      },
      {
        id: 's6_s3_2',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Ah, é? Quero ver agora!',
        emotion: 'amused',
      },
      {
        id: 's6_s3_3',
        speaker: 'cristian',
        speakerName: 'Cristian',
        text: 'Vocês dois ainda discutem por causa de videogame!',
        emotion: 'amused',
      },
      {
        id: 's6_s3_4',
        speaker: 'lara',
        speakerName: 'Lara',
        text: 'Acho que isso nunca vai mudar!',
        emotion: 'happy',
      },
    ],
  },

  // CENA 4 — Um período difícil (acolhimento + na cama vendo TV)
  s6_scene4_comfort: {
    id: 's6_scene4_comfort',
    onCompleteAction: 's6_start_bedroom_bed_tv',
    lines: [
      {
        id: 's6_s4_c1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Não precisa falar nada. Eu estou aqui.',
        emotion: 'romantic',
      },
    ],
  },
  s6_scene4_bed_quote: {
    id: 's6_scene4_bed_quote',
    onCompleteAction: 's6_start_kitchen_transition',
    lines: [
      {
        id: 's6_s4_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Sabe qual é o melhor lugar do mundo?',
        emotion: 'romantic',
      },
      {
        id: 's6_s4_2',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Onde?',
        emotion: 'thoughtful',
      },
      {
        id: 's6_s4_3',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Dentro do abraço do Ariel.',
        emotion: 'romantic',
      },
    ],
  },

  // CENA 5 — A pia entupida (etapas jogáveis + Grazi sai de cena ao final da 4ª fala enquanto Ariel ri e continua)
  s6_scene5_sink_step1: {
    id: 's6_scene5_sink_step1',
    lines: [
      {
        id: 's6_s5_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Empurra mais, marido! Você consegue!',
        emotion: 'amused',
      },
    ],
  },
  s6_scene5_sink_step2: {
    id: 's6_scene5_sink_step2',
    lines: [
      {
        id: 's6_s5_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Isso! Mais um pouquinho!',
        emotion: 'happy',
      },
    ],
  },
  s6_scene5_sink_step3: {
    id: 's6_scene5_sink_step3',
    onCompleteAction: 's6_start_kitchen_finale',
    lines: [
      {
        id: 's6_s5_3',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Hahaha! Tô ficando irritado!',
        emotion: 'amused',
      },
      {
        id: 's6_s5_4',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Ih... não estou mais aqui!',
        emotion: 'amused',
      },
    ],
  },
  s6_scene5_sink: {
    id: 's6_scene5_sink',
    lines: [
      {
        id: 's6_s5_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Empurra mais, marido! Você consegue!',
        emotion: 'amused',
      },
      {
        id: 's6_s5_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Isso! Mais um pouquinho!',
        emotion: 'happy',
      },
      {
        id: 's6_s5_3',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Hahaha! Tô ficando irritado!',
        emotion: 'amused',
      },
      {
        id: 's6_s5_4',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Ih... não estou mais aqui!',
        emotion: 'amused',
      },
    ],
  },

  // CENA 6 — Aniversário do Ariel (23/11/2026)
  s6_scene6_birthday: {
    id: 's6_scene6_birthday',
    onCompleteAction: 's6_birthday_ready_to_blow',
    lines: [
      {
        id: 's6_s6_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Hoje o dia é todinho seu!',
        emotion: 'romantic',
      },
      {
        id: 's6_s6_2',
        speaker: 'cristian',
        speakerName: 'Cristian',
        text: 'Vamos, pai! Sopra as velinhas!',
        emotion: 'happy',
      },
      {
        id: 's6_s6_3',
        speaker: 'lara',
        speakerName: 'Lara',
        text: 'Mas primeiro tem que fazer um pedido!',
        emotion: 'happy',
      },
    ],
  },

  // CENA FINAL — O convite para o Volume 2
  s6_final_volume2: {
    id: 's6_final_volume2',
    onCompleteAction: 's6_show_volume1_endcard',
    lines: [
      {
        id: 's6_fin_1',
        speaker: 'narrator',
        speakerName: 'Nossa História Continua',
        text: 'Nossa história já passou por tantas fases: encontros, desencontros, sonhos, desafios, conquistas e recomeços. Construímos uma família, compartilhamos alegrias e enfrentamos dias difíceis. Mas ainda existem muitas histórias para contar.',
        emotion: 'romantic',
      },
      {
        id: 's6_fin_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Ariel, essa foi apenas a primeira parte da nossa aventura. Que tal construirmos juntos o Volume 2?',
        emotion: 'romantic',
      },
    ],
  },
};
