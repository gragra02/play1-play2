import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './mapData';
import type {
  DialogueSequence,
  MemoryItem,
  NpcEntity,
  Stage5KarateStep,
  Stage5MapId,
  Stage5PhoneCallStep,
} from './types';

// ============================================================================
// STAGE 5 — BELA VISTA
// Etapa 1: Mudança para o Bela Vista (Mercado azul "Guesser" com apartamento em cima,
//          exploração livre da rua e do apartamento com 3 memórias colecionáveis).
// Etapa 2: Campeonato de Karatê (minigame rítmico com 8 movimentos em 3 rodadas de
//          dificuldade crescente, círculo que encolhe, Perfeito/Bom/Erro, Ariel gritando
//          "ISSO!" com leve tremor ou "Calma, respira!", Grazi chorando de emoção na
//          3ª rodada, notas dos juízes, pódio e medalha aceitando até 2 erros + tentar novamente).
// Etapa 3: A Ligação (cena cinematográfica em tela dividida: Grazi no apartamento e Ariel
//          no serviço, retratos adultos atuais, letterbox, música suave e digitação lenta).
// Etapas 4 a 8: Passagem de tempo grávida, chegada da Lara bebê, Lara aos 2 anos cantando
//          "Pepelequinha", encontro no parque com pista de skate em frente à igreja do
//          Bela Vista com Laura e Lucas (5 anos) e retorno à Ponte do Imaruim.
// ============================================================================

export const STAGE_5_CLOSING_QUOTE =
  'Do apartamento em cima do Mercado Guesser aos gritos de “ISSO!” no campeonato de karatê, da ligação emocionante e da chegada da nossa Lara com cabelinho de pica-pau cantando “Pepelequinha” às tardes no parque do Bela Vista com a Laura e o Lucas, voltamos para a Ponte do Imaruim com o sonho do nosso apartamento próprio realizado.';

export interface Stage5MemoryItem extends MemoryItem {
  mapId: Stage5MapId;
}

// 3 Collectible Memories in Etapa 1 (Street + Upstairs Apartment) + Stage 5 Story Memories
export const STAGE_5_MEMORIES: Stage5MemoryItem[] = [
  {
    id: 'mem_s5_primeira_noite',
    title: 'Primeira noite no apartamento',
    subtitle: 'Em cima do Mercado Guesser',
    description:
      'Na primeira noite no apartamento em cima do Mercado Guesser, Grazi, Ariel e o Cris de 7 anos comemoraram o novo lar no Bela Vista entre caixas abertas e muitas risadas.',
    stageNumber: 5,
    mapId: 'bela_vista_apartment',
    x: 9.2 * TILE_SIZE,
    y: 10.6 * TILE_SIZE,
    radius: 56,
    dialogueId: 's5_mem_primeira_noite',
  },
  {
    id: 'mem_s5_lanche_mercado',
    title: 'Lanche no Mercado Guesser',
    subtitle: 'A praticidade de morar em cima do mercado',
    description:
      'Bastava descer a escada para buscar pão quentinho e um lanche gostoso no Mercado Guesser — uma das lembranças mais doces da rotina no Bela Vista.',
    stageNumber: 5,
    mapId: 'bela_vista_guesser',
    x: 6.4 * TILE_SIZE,
    y: 10.2 * TILE_SIZE,
    radius: 56,
    dialogueId: 's5_mem_lanche_mercado',
  },
  {
    id: 'mem_s5_bicicleta_calcada',
    title: 'A bicicleta na calçada do Bela Vista',
    subtitle: 'Passeios na rua nova',
    description:
      'Na calçada em frente ao Mercado Guesser, a bicicleta continuava sendo companheira fiel da família nas tardes ensolaradas do Bela Vista.',
    stageNumber: 5,
    mapId: 'bela_vista_guesser',
    x: 18.2 * TILE_SIZE,
    y: 10.2 * TILE_SIZE,
    radius: 56,
    dialogueId: 's5_mem_bicicleta_calcada',
  },
  {
    id: 'mem_s5_karate',
    title: '“ISSO!” no campeonato de karatê',
    subtitle: 'O kata do Cris aos 7 anos e a medalha no pódio',
    description:
      'De kimono branco no tatame, o Cris executou os 8 movimentos do kata enquanto o Ariel gritava “ISSO!” na arquibancada e a Grazi se emocionava na rodada final.',
    stageNumber: 5,
    mapId: 'karate_tournament_gym',
    x: 12.0 * TILE_SIZE,
    y: 10.2 * TILE_SIZE,
    radius: 56,
    dialogueId: 's5_mem_karate',
  },
  {
    id: 'mem_s5_ligacao_lara',
    title: 'A ligação: “Espero que seja menina!”',
    subtitle: 'Grazi em casa e Ariel no serviço',
    description:
      'De casa, Grazi ligou para o Ariel no trabalho para contar que estava grávida de novo. Após um segundo de silêncio emocionado, ele sorriu e disse que esperava que fosse menina.',
    stageNumber: 5,
    mapId: 'bela_vista_apartment',
    x: 14.5 * TILE_SIZE,
    y: 9.8 * TILE_SIZE,
    radius: 56,
    dialogueId: 's5_mem_ligacao_lara',
  },
  {
    id: 'mem_s5_chegada_lara',
    title: 'O abraço do Cris na irmãzinha Lara',
    subtitle: 'Cabelinho de pica-pau e roupinha rosa',
    description:
      'Quando a pequena Lara chegou em casa, de roupinha rosa e cabelinho preto arrepiado para cima como um pica-pau, o Cris abriu o maior sorriso e abraçou a irmãzinha.',
    stageNumber: 5,
    mapId: 'bela_vista_apartment',
    x: 8.4 * TILE_SIZE,
    y: 11.4 * TILE_SIZE,
    radius: 56,
    dialogueId: 's5_mem_chegada_lara',
  },
  {
    id: 'mem_s5_pepelequinha',
    title: '“Pepelequinha, pepelequinha!”',
    subtitle: 'A dança da Lara aos 2 anos',
    description:
      'Aos 2 anos, de vestidinho rosa e maria-chiquinha, a Lara dançava e cantava “Pepelequinha, pepelequinha!” no meio da sala, arrancando gargalhadas do Cris.',
    stageNumber: 5,
    mapId: 'bela_vista_apartment',
    x: 11.8 * TILE_SIZE,
    y: 11.2 * TILE_SIZE,
    radius: 56,
    dialogueId: 's5_mem_pepelequinha',
  },
  {
    id: 'mem_s5_parque_primos',
    title: 'Tarde no parque do Bela Vista',
    subtitle: 'Grazi, Cris, Lara, Laura e Lucas',
    description:
      'No parque com pista de skate e parquinho colorido em frente à igreja do Bela Vista, Grazi e Laura reuniram o Cris, a pequena Lara e o primo Lucas, de 5 anos, loirinho de cabelo cacheado.',
    stageNumber: 5,
    mapId: 'parquinho_igreja',
    x: 396,
    y: 339,
    radius: 56,
    dialogueId: 's5_mem_parque_primos',
  },
  {
    id: 'mem_s5_apartamento_proprio',
    title: 'De volta à Ponte do Imaruim',
    subtitle: 'O sonho do apartamento próprio',
    description:
      'Grazi, Ariel, Cris e Lara voltaram para a Ponte do Imaruim porque compraram o apartamento próprio deles no Parque da Ponte.',
    stageNumber: 5,
    mapId: 'ponte_imaruim_condo',
    x: 12.0 * TILE_SIZE,
    y: 10.5 * TILE_SIZE,
    radius: 56,
    dialogueId: 's5_mem_apartamento_proprio',
  },
];

export const STAGE_5_ETAPA1_MEMORY_IDS = [
  'mem_s5_primeira_noite',
  'mem_s5_lanche_mercado',
  'mem_s5_bicicleta_calcada',
] as const;

// ============================================================================
// ETAPA 2 — KARATE KATA RHYTHM MINIGAME (8 MOVEMENTS ACROSS 3 ROUNDS)
// Round 1 (Moves 1..3): gentle rhythm (2.2s shrink cycle)
// Round 2 (Moves 4..6): medium rhythm (1.75s shrink cycle)
// Round 3 (Moves 7..8): finale rhythm (1.45s shrink cycle, Grazi cries tears of emotion!)
// ============================================================================
export const STAGE_5_KATA_MOVES: Stage5KarateStep[] = [
  // Rodada 1 (3 movimentos)
  {
    dir: 'up',
    move: 'bow',
    round: 1,
    shrinkDuration: 2.2,
    label: 'Saudação Rei (↑ / W)',
  },
  {
    dir: 'right',
    move: 'punch',
    round: 1,
    shrinkDuration: 2.2,
    label: 'Soco Oi-Zuki (→ / D)',
  },
  {
    dir: 'left',
    move: 'block',
    round: 1,
    shrinkDuration: 2.1,
    label: 'Defesa Age-Uke (← / A)',
  },
  // Rodada 2 (3 movimentos — mais rápida)
  {
    dir: 'right',
    move: 'punch',
    round: 2,
    shrinkDuration: 1.75,
    label: 'Soco Gyaku-Zuki (→ / D)',
  },
  {
    dir: 'up',
    move: 'kick',
    round: 2,
    shrinkDuration: 1.75,
    label: 'Chute Mae-Geri (↑ / W)',
  },
  {
    dir: 'left',
    move: 'block',
    round: 2,
    shrinkDuration: 1.7,
    label: 'Defesa Gedan-Barai (← / A)',
  },
  // Rodada 3 (2 movimentos finais — clímax emocionante!)
  {
    dir: 'right',
    move: 'kick',
    round: 3,
    shrinkDuration: 1.45,
    label: 'Chute Frontal Kiai! (→ / D)',
  },
  {
    dir: 'down',
    move: 'bow',
    round: 3,
    shrinkDuration: 1.45,
    label: 'Saudação Final Rei (↓ / S)',
  },
];

// Keep grouped view for HUD compatibility
export const STAGE_5_KARATE_SEQUENCES: Stage5KarateStep[][] = [
  STAGE_5_KATA_MOVES.filter((m) => m.round === 1),
  STAGE_5_KATA_MOVES.filter((m) => m.round === 2),
  STAGE_5_KATA_MOVES.filter((m) => m.round === 3),
];

// ============================================================================
// ETAPA 3 — SPLIT-SCREEN PREGNANCY PHONE CALL TIMELINE
// ============================================================================
export const STAGE_5_PHONE_CALL_STEPS: Stage5PhoneCallStep[] = [
  {
    id: 's5_call_1_dial',
    index: 1,
    duration: 7.5,
    speaker: 'grazi_adult',
    speakerName: 'Grazi',
    emotion: 'blush',
    text: 'Alô, Ariel? Pode falar um minutinho aí no serviço? Tô ligando aqui do nosso apartamento...',
    stageDirection: 'No apartamento em cima do Mercado Guesser, Grazi segura o telefone com as mãos tremendo de emoção.',
    typingCharsPerSecond: 15,
  },
  {
    id: 's5_call_2_reveal',
    index: 2,
    duration: 5.5,
    speaker: 'grazi_adult',
    speakerName: 'Grazi',
    emotion: 'romantic',
    text: 'Amor... eu fiz o teste hoje. Eu estou grávida de novo!',
    stageDirection: 'A voz da Grazi sai doce e embargada de alegria pelo telefone.',
    typingCharsPerSecond: 14,
  },
  {
    id: 's5_call_3_silence',
    index: 3,
    duration: 2.8,
    speaker: 'ariel_adult',
    speakerName: 'Ariel',
    emotion: 'surprised',
    text: '...',
    stageDirection: 'Do outro lado da linha, no serviço, Ariel fica em silêncio por um instante, com os olhos brilhando.',
    typingCharsPerSecond: 8,
    silentBeat: true,
  },
  {
    id: 's5_call_4_hope_girl',
    index: 4,
    duration: 7.5,
    speaker: 'ariel_adult',
    speakerName: 'Ariel',
    emotion: 'romantic',
    text: 'Sério, meu amor?! Mais um filho nosso! Que felicidade... eu espero muito que seja menina!',
    stageDirection: 'Ariel abre o maior sorriso no trabalho, imaginando a chegada da filha.',
    typingCharsPerSecond: 15,
    arielSmiling: true,
  },
  {
    id: 's5_call_5_closing',
    index: 5,
    duration: 7.5,
    speaker: 'grazi_adult',
    speakerName: 'Grazi',
    emotion: 'happy',
    text: 'Eu também sinto no coração que vem a nossa menininha aí. Te amo demais, te espero em casa!',
    stageDirection: 'Os dois desligam sorrindo, com o coração aquecido pela nova vida a caminho.',
    typingCharsPerSecond: 15,
    arielSmiling: true,
  },
];

export const STAGE5_GUESSER_DOOR_POS = { x: 12.2 * TILE_SIZE, y: 8.6 * TILE_SIZE };
export const STAGE5_APARTMENT_EXIT_POS = { x: 11.8 * TILE_SIZE, y: 12.7 * TILE_SIZE };
export const STAGE5_APARTMENT_BEDROOM_DOOR_POS = { x: 6.4 * TILE_SIZE, y: 6.4 * TILE_SIZE };
export const STAGE5_APARTMENT_SOFA_POS = { x: 5.8 * TILE_SIZE, y: 10.2 * TILE_SIZE };
export const STAGE5_APARTMENT_ESTANTE_POS = { x: 17.8 * TILE_SIZE, y: 10.4 * TILE_SIZE };
export const STAGE5_APARTMENT_WINDOW_POS = { x: 11.8 * TILE_SIZE, y: 6.2 * TILE_SIZE };
export const STAGE5_APARTMENT_TV_POS = { x: 17.6 * TILE_SIZE, y: 8.2 * TILE_SIZE };
export const STAGE5_APARTMENT_MESA_POS = { x: 5.4 * TILE_SIZE, y: 6.8 * TILE_SIZE };
export const STAGE5_APARTMENT_PHONE_POS = { x: 18.2 * TILE_SIZE, y: 10.6 * TILE_SIZE };
export const STAGE5_NURSERY_BUILD_POS = { x: 11.8 * TILE_SIZE, y: 9.6 * TILE_SIZE };
export const STAGE5_NURSERY_EXIT_POS = { x: 11.8 * TILE_SIZE, y: 12.7 * TILE_SIZE };
// ============================================================================
// ETAPA 7 · PARQUINHO EM FRENTE À IGREJA (mapa 'parquinho_igreja')
// O cenário é SOMENTE o fundo pronto s5_parquinho_igreja.jpg (1264x848), esticado
// sobre o mundo de 768x512 (24x16 tiles de 32px). 1 unidade do mundo = 1264/768
// ≈ 1,646 px da imagem. Todas as coordenadas abaixo estão em unidades do mundo e
// foram medidas sobre a imagem aprovada com uma grade de 16 em 16 unidades.
// Cada zona é um retângulo { x1, y1, x2, y2 } (canto superior esquerdo → inferior direito).
// ============================================================================
export interface Stage5Zone {
  id: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Stage5Hotspot extends Stage5Zone {
  /** Personagem ligado a este brinquedo (ou null para hotspots de cenário). */
  role: 'lara' | 'lucas' | 'cristian' | 'laura' | 'grazi' | null;
  /** Posição dos pés do personagem, ao lado do brinquedo (sem sobrepor a estrutura). */
  standX: number;
  standY: number;
}

/** Zonas caminháveis: a caixa de colisão do jogador precisa estar inteira dentro delas. */
export const STAGE5_PARQUINHO_WALK_ZONES: Stage5Zone[] = [
  { id: 'calcada', label: 'Calçada abaixo da igreja', x1: 52, y1: 200, x2: 704, y2: 237 },
  { id: 'parque', label: 'Gramado, parquinho e pista', x1: 60, y1: 236, x2: 704, y2: 462 },
  { id: 'praca_inferior', label: 'Piso da praça (centro-inferior)', x1: 316, y1: 460, x2: 480, y2: 508 },
];

/** Zonas bloqueadas: a caixa de colisão do jogador não pode encostar nelas. */
export const STAGE5_PARQUINHO_BLOCKED_ZONES: Stage5Zone[] = [
  // Fundo: igreja, gradil/muro, torre e árvores atrás dela (tudo acima da calçada)
  { id: 'igreja', label: 'Igreja, escadaria e gradil', x1: 60, y1: 20, x2: 456, y2: 200 },
  { id: 'torre', label: 'Torre dos sinos', x1: 458, y1: 8, x2: 536, y2: 198 },
  { id: 'fundo_direita', label: 'Casas e palmeiras atrás', x1: 536, y1: 20, x2: 768, y2: 200 },
  // Árvores e arbustos (somente bordas)
  { id: 'arvores_esquerda', label: 'Árvores da borda esquerda', x1: 0, y1: 40, x2: 60, y2: 512 },
  { id: 'arvores_direita', label: 'Árvores da borda direita', x1: 705, y1: 60, x2: 768, y2: 512 },
  { id: 'arbusto_inf_esq', label: 'Arbusto inferior esquerdo', x1: 60, y1: 476, x2: 130, y2: 512 },
  { id: 'arbusto_inf_centro', label: 'Arbusto inferior central', x1: 150, y1: 452, x2: 232, y2: 512 },
  { id: 'arbusto_inf_dir', label: 'Arbusto inferior direito', x1: 543, y1: 430, x2: 672, y2: 512 },
  // Postes, bancos, lixeiras e bebedouro (bordas)
  { id: 'poste_esq', label: 'Poste esquerdo', x1: 56, y1: 200, x2: 80, y2: 258 },
  { id: 'poste_dir', label: 'Poste direito', x1: 692, y1: 200, x2: 716, y2: 258 },
  { id: 'banco_1', label: 'Banco 1 (calçada)', x1: 116, y1: 222, x2: 168, y2: 250 },
  { id: 'banco_2', label: 'Banco 2 (calçada)', x1: 217, y1: 222, x2: 270, y2: 250 },
  { id: 'banco_3', label: 'Banco 3 (calçada)', x1: 540, y1: 222, x2: 592, y2: 250 },
  { id: 'banco_dir', label: 'Banco lateral direito', x1: 688, y1: 350, x2: 744, y2: 408 },
  { id: 'lixeira_sup', label: 'Lixeira (calçada)', x1: 607, y1: 222, x2: 630, y2: 250 },
  { id: 'lixeira_inf', label: 'Lixeira inferior', x1: 73, y1: 432, x2: 96, y2: 466 },
  { id: 'bebedouro', label: 'Bebedouro', x1: 669, y1: 418, x2: 706, y2: 468 },
  // Mureta do parquinho (abertura à direita y 328–356 e embaixo x 158–218)
  { id: 'mureta_topo', label: 'Mureta (topo)', x1: 42, y1: 252, x2: 340, y2: 267 },
  { id: 'mureta_esq', label: 'Mureta (esquerda)', x1: 40, y1: 252, x2: 74, y2: 440 },
  { id: 'mureta_dir_sup', label: 'Mureta (direita, cima)', x1: 324, y1: 252, x2: 340, y2: 328 },
  { id: 'mureta_dir_inf', label: 'Mureta (direita, baixo)', x1: 318, y1: 356, x2: 334, y2: 440 },
  { id: 'mureta_inf_esq', label: 'Mureta (baixo, esquerda)', x1: 40, y1: 416, x2: 158, y2: 440 },
  { id: 'mureta_inf_dir', label: 'Mureta (baixo, direita)', x1: 218, y1: 416, x2: 334, y2: 440 },
  // Brinquedos (bloqueados até a mureta de trás: ninguém fica atrás da estrutura alta)
  { id: 'balanco', label: 'Estrutura do balanço', x1: 88, y1: 262, x2: 193, y2: 348 },
  { id: 'escorregador', label: 'Escorregador', x1: 206, y1: 262, x2: 300, y2: 348 },
  { id: 'gangorra', label: 'Gangorra', x1: 214, y1: 358, x2: 302, y2: 402 },
  // Pista de skate
  { id: 'rampa_esq', label: 'Rampa esquerda', x1: 478, y1: 232, x2: 552, y2: 328 },
  { id: 'rampa_dir', label: 'Rampa direita', x1: 619, y1: 240, x2: 698, y2: 328 },
  { id: 'bowl', label: 'Bacia (bowl)', x1: 527, y1: 352, x2: 679, y2: 420 },
];

/** Pontos de interação invisíveis sobre cada brinquedo. */
export const STAGE5_PARQUINHO_HOTSPOTS: Stage5Hotspot[] = [
  { id: 'hs_balanco', label: 'Balanço · Lara', role: 'lara', x1: 88, y1: 262, x2: 193, y2: 348, standX: 150, standY: 366 },
  { id: 'hs_escorregador', label: 'Escorregador · Lucas', role: 'lucas', x1: 206, y1: 262, x2: 300, y2: 348, standX: 200, standY: 362 },
  { id: 'hs_pista', label: 'Pista de skate · Cris', role: 'cristian', x1: 473, y1: 270, x2: 727, y2: 436, standX: 586, standY: 338 },
  { id: 'hs_banco_laura', label: 'Banco · Laura', role: 'laura', x1: 217, y1: 222, x2: 270, y2: 250, standX: 284, standY: 240 },
  { id: 'hs_banco_grazi', label: 'Banco · Grazi (início)', role: 'grazi', x1: 217, y1: 222, x2: 270, y2: 250, standX: 312, standY: 240 },
];

/** Marca da foto em família: corredor livre entre o parquinho e a pista. */
export const STAGE5_PARQUINHO_PHOTO_MARK = { x: 396, y: 339 };

export function getStage5ParquinhoHotspot(id: string): Stage5Hotspot {
  const hs = STAGE5_PARQUINHO_HOTSPOTS.find((h) => h.id === id);
  if (!hs) throw new Error(`Hotspot do parquinho não encontrado: ${id}`);
  return hs;
}

function pointInZone(z: Stage5Zone, x: number, y: number): boolean {
  return x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2;
}

/** A caixa (left, top, right, bottom) está inteira na área caminhável e fora das zonas bloqueadas? */
export function isStage5ParquinhoBoxWalkable(
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
    if (!STAGE5_PARQUINHO_WALK_ZONES.some((z) => pointInZone(z, cx, cy))) return false;
  }
  for (const z of STAGE5_PARQUINHO_BLOCKED_ZONES) {
    if (left < z.x2 && right > z.x1 && top < z.y2 && bottom > z.y1) return false;
  }
  return true;
}

const STAGE5_SKATE_HOTSPOT = getStage5ParquinhoHotspot('hs_pista');
export const STAGE5_PARK_SKATE_POS = { x: STAGE5_SKATE_HOTSPOT.standX, y: STAGE5_SKATE_HOTSPOT.standY };

export function isStage5TileSolid(mapId: Stage5MapId, col: number, row: number): boolean {
  if (mapId === 'parquinho_igreja') {
    const cx = col * TILE_SIZE + TILE_SIZE / 2;
    const cy = row * TILE_SIZE + TILE_SIZE / 2;
    return !isStage5ParquinhoBoxWalkable(cx - 1, cy - 1, cx + 1, cy + 1);
  }
  if (col < 1 || col >= MAP_COLS - 1 || row < 1 || row >= MAP_ROWS - 1) return true;

  if (mapId === 'bela_vista_guesser') {
    if (row < 8 || row > 13) return true;
    if (col < 2 || col > 21) return true;
    return false;
  }

  if (mapId === 'bela_vista_apartment') {
    // Open ceramic tile floor between the left sofa (cols 1..5) and right estante (cols 19..23)
    if (row < 6 || row > 13) return true;
    if (col < 5 || col > 18) return true;
    return false;
  }

  if (mapId === 'bela_vista_lara_room') {
    // Simple pink-and-white baby room floor
    if (row < 7 || row > 13) return true;
    if (col < 6 || col > 17) return true;
    return false;
  }

  if (mapId === 'karate_tournament_gym') {
    if (row < 7 || row > 13) return true;
    if (col < 5 || col > 18) return true;
    return false;
  }

  if (mapId === 'bela_vista_park_church') {
    if (row < 8 || row > 13) return true;
    if (col < 2 || col > 21) return true;
    return false;
  }

  if (row < 8 || row > 13) return true;
  if (col < 2 || col > 21) return true;
  return false;
}

export function createStage5Npcs(
  phase: 'guesser_street' | 'guesser_apartment_etapa1' | 'apartment_lara_2yo' | 'park_reunion',
): NpcEntity[] {
  if (phase === 'guesser_street') {
    return [
      {
        id: 's5_cristian_guesser',
        name: 'Cris (7 anos)',
        role: 'cristian',
        x: 9.8 * TILE_SIZE,
        y: 9.4 * TILE_SIZE,
        dir: 'down',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 's5_ariel_guesser',
        name: 'Ariel',
        role: 'ariel',
        x: 14.6 * TILE_SIZE,
        y: 9.4 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ];
  }

  if (phase === 'guesser_apartment_etapa1') {
    return [
      {
        id: 's5_cristian_apt1',
        name: 'Cris (7 anos)',
        role: 'cristian',
        x: 11.4 * TILE_SIZE,
        y: 10.4 * TILE_SIZE,
        dir: 'right',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 's5_ariel_apt1',
        name: 'Ariel',
        role: 'ariel',
        x: 14.0 * TILE_SIZE,
        y: 10.4 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ];
  }

  if (phase === 'apartment_lara_2yo') {
    return [
      {
        id: 's5_lara_2yo',
        name: 'Lara (2 anos)',
        role: 'lara',
        x: 11.8 * TILE_SIZE,
        y: 10.8 * TILE_SIZE,
        dir: 'down',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 's5_cristian_apt',
        name: 'Cris',
        role: 'cristian',
        x: 9.6 * TILE_SIZE,
        y: 10.6 * TILE_SIZE,
        dir: 'right',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 's5_ariel_apt',
        name: 'Ariel',
        role: 'ariel',
        x: 14.2 * TILE_SIZE,
        y: 10.6 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ];
  }

  // park_reunion: Grazi explores Bela Vista park with Laura, Lucas (5yo), Cris and Lara (2yo)
  // NOTE: Ariel does NOT appear in Etapa 7. Each one stands beside their hotspot (STAGE5_PARQUINHO_HOTSPOTS).
  const laura = getStage5ParquinhoHotspot('hs_banco_laura');
  const cris = getStage5ParquinhoHotspot('hs_pista');
  const lucas = getStage5ParquinhoHotspot('hs_escorregador');
  const lara = getStage5ParquinhoHotspot('hs_balanco');
  return [
    {
      id: 's5_laura_park',
      name: 'Laura',
      role: 'laura',
      x: laura.standX,
      y: laura.standY,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
    {
      id: 's5_cristian_park',
      name: 'Cris (no skate)',
      role: 'cristian',
      x: cris.standX,
      y: cris.standY,
      dir: 'right',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
    {
      id: 's5_lucas_park',
      name: 'Lucas (5 anos)',
      role: 'lucas',
      x: lucas.standX,
      y: lucas.standY,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
    {
      id: 's5_lara_park',
      name: 'Lara (2 anos)',
      role: 'lara',
      x: lara.standX,
      y: lara.standY,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
  ];
}

export const STAGE_5_DIALOGUES: Record<string, DialogueSequence> = {
  s5_guesser_intro: {
    id: 's5_guesser_intro',
    lines: [
      {
        id: 's5_gi_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Chegamos ao nosso novo cantinho no Bela Vista! Olha só o nosso apartamento azul ali em cima do Mercado Guesser.',
        emotion: 'happy',
      },
      {
        id: 's5_gi_2',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Vida nova no Bela Vista, amor! Vamos explorar a calçada, subir pra conhecer o apartamento e depois levar o nosso campeão pro campeonato de karatê.',
        emotion: 'happy',
      },
      {
        id: 's5_gi_3',
        speaker: 'cristian',
        speakerName: 'Cris (7 anos)',
        text: 'Mãe, pai! Eu gostei demais de morar em cima do mercado! E já decorei os 8 movimentos do meu kata!',
        emotion: 'happy',
      },
    ],
  },

  s5_cristian_guesser_talk: {
    id: 's5_cristian_guesser_talk',
    lines: [
      {
        id: 's5_cg_1',
        speaker: 'cristian',
        speakerName: 'Cris (7 anos)',
        text: 'Mãe! Pai! Eu treinei os 8 passos do kata! Vocês vão ficar torcendo por mim lá da arquibancada do ginásio, né?',
        emotion: 'happy',
      },
      {
        id: 's5_cg_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Com certeza, meu filho! Na primeira fila vibrando a cada movimento seu.',
        emotion: 'happy',
      },
    ],
  },

  s5_ariel_start_karate: {
    id: 's5_ariel_start_karate',
    onCompleteAction: 's5_start_karate_minigame',
    lines: [
      {
        id: 's5_ask_1',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'O kimono branquinho do Cris já está pronto. Vamos pro ginásio que o campeonato de karatê já vai começar!',
        emotion: 'happy',
      },
      {
        id: 's5_ask_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Vamos! Hoje a arquibancada inteira vai ouvir você torcendo pelo Cris!',
        emotion: 'amused',
      },
    ],
  },

  s5_karate_podium_celebration: {
    id: 's5_karate_podium_celebration',
    onCompleteAction: 's5_start_pregnancy_call',
    lines: [
      {
        id: 's5_kpc_1',
        speaker: 'narrator',
        speakerName: 'Ginásio do Campeonato · Pódio e Medalha',
        text: 'Com as notas altas dos juízes, o grito de “ISSO!” do Ariel na arquibancada e as lágrimas de orgulho da Grazi, o Cris sorri no pódio com sua medalha!',
        emotion: 'happy',
      },
      {
        id: 's5_kpc_2',
        speaker: 'cristian',
        speakerName: 'Cris (7 anos)',
        text: 'Eu ouvi você gritando “ISSO!” lá do tatame, pai! E vi a mãe emocionada na última rodada! Essa medalha é nossa!',
        emotion: 'happy',
      },
      {
        id: 's5_kpc_3',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Que orgulho de ti, meu campeão! Executou o kata com o coração!',
        emotion: 'happy',
      },
    ],
  },

  s5_lara_arrival_dialogue: {
    id: 's5_lara_arrival_dialogue',
    onCompleteAction: 's5_start_lara_2yo_intro',
    lines: [
      {
        id: 's5_lad_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Vem cá devagarzinho, Cris... olha quem chegou pra nossa família: a tua irmãzinha Lara, toda de rosa no colo da mãe!',
        emotion: 'romantic',
      },
      {
        id: 's5_lad_2',
        speaker: 'cristian',
        speakerName: 'Cris (7 anos)',
        text: 'Mãe, pai, ela é tão linda! E olha o cabelinho preto dela todo arrepiado pra cima! Posso dar um abraço bem devagarzinho nela?',
        emotion: 'happy',
      },
      {
        id: 's5_lad_3',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Pode sim, meu filho. Olha como ela fica calminha sentindo o teu abraço... Bem-vinda pra casa, nossa pequena Lara!',
        emotion: 'romantic',
      },
    ],
  },

  s5_lara_2yo_intro: {
    id: 's5_lara_2yo_intro',
    lines: [
      {
        id: 's5_l2i_1',
        speaker: 'narrator',
        speakerName: 'Apartamento no Bela Vista · Lara aos 2 Anos',
        text: 'O tempo voou no apartamento em cima do Mercado Guesser. A pequena Lara cresceu, completou 2 aninhos e encheu a sala de música e alegria.',
        emotion: 'happy',
      },
      {
        id: 's5_l2i_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Olha a Lara de maria-chiquinha e vestidinho rosa no meio do tapete... ela já vai começar o showzinho favorito dela!',
        emotion: 'amused',
      },
    ],
  },

  s5_cristian_before_lara_dance: {
    id: 's5_cristian_before_lara_dance',
    lines: [
      {
        id: 's5_cbld_1',
        speaker: 'cristian',
        speakerName: 'Cris',
        text: 'Mãe, olha pra Lara! Toda vez que ela começa a cantar essa musiquinha eu não aguento de tanto rir!',
        emotion: 'amused',
      },
    ],
  },

  s5_trigger_lara_dance: {
    id: 's5_trigger_lara_dance',
    onCompleteAction: 's5_start_lara_dance',
    lines: [
      {
        id: 's5_tld_1',
        speaker: 'lara',
        speakerName: 'Lara (2 anos)',
        text: 'Pepelequinha, pepelequinha! ♪',
        emotion: 'happy',
      },
      {
        id: 's5_tld_2',
        speaker: 'cristian',
        speakerName: 'Cris',
        text: 'Hahaha! Olha os passinhos dela, mãe!',
        emotion: 'amused',
      },
    ],
  },

  s5_park_intro: {
    id: 's5_park_intro',
    lines: [
      {
        id: 's5_pi_1',
        speaker: 'narrator',
        speakerName: 'Parquinho do Bela Vista · Em Frente à Igreja',
        text: 'Mais um tempo depois, no fim de tarde em frente à igreja do Bela Vista, Grazi e sua irmã Laura conversam perto do banco enquanto vigiam as crianças no parquinho e na pista de skate.',
        emotion: 'happy',
      },
      {
        id: 's5_pi_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Olha que fim de tarde gostoso! O Cris tá na pista de skate, o Lucas no escorregador e a Lara no balanço. Vou dar uma volta pelo parquinho e conversar com cada um!',
        emotion: 'happy',
      },
    ],
  },

  s5_park_talk_laura: {
    id: 's5_park_talk_laura',
    onCompleteAction: 's5_check_park_all_talked',
    lines: [
      {
        id: 's5_ptl_1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Mana, que paz ficar aqui nesse banco em frente à igreja vendo os nossos filhos brincarem juntos na luz do fim de tarde!',
        emotion: 'happy',
      },
      {
        id: 's5_ptl_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Demais, mana! O Lucas com 5 anos tá a coisa mais linda com esses cachinhos loiros, e o Cris e a Lara adoram brincar com ele.',
        emotion: 'romantic',
      },
    ],
  },

  s5_park_talk_cristian: {
    id: 's5_park_talk_cristian',
    onCompleteAction: 's5_check_park_all_talked',
    lines: [
      {
        id: 's5_ptc_1',
        speaker: 'cristian',
        speakerName: 'Cris (na pista de skate)',
        text: 'Mãe, olha essa manobra aqui na pista de skate em frente à igreja! Tô cuidando do Lucas e da Lara também!',
        emotion: 'happy',
      },
      {
        id: 's5_ptc_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Tô vendo tudo daqui, meu filho! Vai com cuidado na rampa e aproveita bastante a tarde com a irmã e o primo!',
        emotion: 'happy',
      },
    ],
  },

  s5_park_talk_lucas: {
    id: 's5_park_talk_lucas',
    onCompleteAction: 's5_check_park_all_talked',
    lines: [
      {
        id: 's5_ptlu_1',
        speaker: 'lucas',
        speakerName: 'Lucas (5 anos, no escorregador)',
        text: 'Tia Grazi! Eu já desci no escorregador um montão de vezes e brinquei no balanço e na gangorra com o Cris e a Lara!',
        emotion: 'happy',
      },
      {
        id: 's5_ptlu_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Que alegria te ver se divertindo tanto, meu amor! Daqui a pouquinho vamos juntar todo mundo pra tirar uma foto bem bonita!',
        emotion: 'happy',
      },
    ],
  },

  s5_park_talk_lara: {
    id: 's5_park_talk_lara',
    onCompleteAction: 's5_check_park_all_talked',
    lines: [
      {
        id: 's5_ptla_1',
        speaker: 'lara',
        speakerName: 'Lara (2 anos)',
        text: 'Mamãe! Olha eu aqui no balanço do parquinho!',
        emotion: 'happy',
      },
      {
        id: 's5_ptla_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Minha bonequinha de vestidinho rosa! Você não larga o teu irmão e o teu primo nem um segundo, né?',
        emotion: 'amused',
      },
    ],
  },

  s5_park_kids_talk: {
    id: 's5_park_kids_talk',
    lines: [
      {
        id: 's5_pkt_1',
        speaker: 'lucas',
        speakerName: 'Lucas (5 anos)',
        text: 'Tia Grazi! O Cris tá me mostrando a pista de skate ali do lado e a gente subiu nos troncos coloridos com a Lara!',
        emotion: 'happy',
      },
      {
        id: 's5_pkt_2',
        speaker: 'cristian',
        speakerName: 'Cris',
        text: 'A gente tá cuidando da Lara aqui no brinquedo, mãe! Ela quer subir em tudo com a gente!',
        emotion: 'happy',
      },
      {
        id: 's5_pkt_3',
        speaker: 'lara',
        speakerName: 'Lara',
        text: 'Tô brincando com o Cris e com o Lucas, mamãe!',
        emotion: 'happy',
      },
    ],
  },

  s5_laura_park_talk: {
    id: 's5_laura_park_talk',
    onCompleteAction: 's5_start_park_reunion_cutscene',
    lines: [
      {
        id: 's5_lpt_1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Mana, olha só pra nós duas aqui no parque do Bela Vista... Quem diria, lá em 1995 na Discoteca Cruzeiro, que estaríamos vendo o Cris, a Lara e o meu Lucas brincando juntos assim?',
        emotion: 'happy',
      },
      {
        id: 's5_lpt_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Passa um filme na cabeça, mana! Ver o Lucas loirinho de cachinhos rindo com o Cris e a Lara aquece demais o coração.',
        emotion: 'romantic',
      },
      {
        id: 's5_lpt_3',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'E agora vocês estão prestes a dar mais um passo lindo: voltar pra nossa Ponte do Imaruim, pro apartamento próprio de vocês!',
        emotion: 'happy',
      },
    ],
  },

  s5_ponte_imaruim_arrival: {
    id: 's5_ponte_imaruim_arrival',
    onCompleteAction: 's5_start_ending_ponte_imaruim',
    lines: [
      {
        id: 's5_pia_1',
        speaker: 'narrator',
        speakerName: 'Ponte do Imaruim · Parque da Ponte Condomínio Clube',
        text: 'Depois de tantos momentos felizes no Bela Vista, Grazi, Ariel, Cris e Lara voltam para a Ponte do Imaruim — agora para o apartamento que compraram juntos.',
        emotion: 'happy',
      },
      {
        id: 's5_pia_2',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Voltamos pra Ponte do Imaruim, meu amor... onde tudo começou em 1995. Mas agora entrando pela portaria do nosso próprio apartamento, com nossos dois filhos.',
        emotion: 'romantic',
      },
      {
        id: 's5_pia_3',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Nosso lar, conquistado passo a passo por nós dois. Obrigada por construir essa família tão linda comigo, Ariel.',
        emotion: 'romantic',
      },
    ],
  },

  // Etapa 1 collectible memories dialogues
  s5_mem_primeira_noite: {
    id: 's5_mem_primeira_noite',
    lines: [
      {
        id: 's5_mpn_1',
        speaker: 'narrator',
        speakerName: 'Lembrança Guardada · Primeira Noite no Apartamento',
        text: 'A primeira noite na sala do apartamento em cima do Mercado Guesser: o aconchego de arrumar cada cantinho novo com o Cris e o Ariel no Bela Vista.',
        emotion: 'happy',
      },
    ],
  },

  s5_mem_lanche_mercado: {
    id: 's5_mem_lanche_mercado',
    lines: [
      {
        id: 's5_mlm_1',
        speaker: 'narrator',
        speakerName: 'Lembrança Guardada · Lanche no Mercado Guesser',
        text: 'A alegria das tardes no Bela Vista descendo até o Mercado Guesser para buscar um lanche gostoso em família.',
        emotion: 'happy',
      },
    ],
  },

  s5_mem_bicicleta_calcada: {
    id: 's5_mem_bicicleta_calcada',
    lines: [
      {
        id: 's5_mbc_1',
        speaker: 'narrator',
        speakerName: 'Lembrança Guardada · A Bicicleta na Calçada',
        text: 'A bicicleta encostada na calçada em frente ao Mercado Guesser, pronta para mais uma volta tranquila pelas ruas do Bela Vista.',
        emotion: 'happy',
      },
    ],
  },

  s5_mem_karate: {
    id: 's5_mem_karate',
    lines: [
      {
        id: 's5_mk_1',
        speaker: 'narrator',
        speakerName: 'Lembrança Guardada · Campeonato de Karatê',
        text: 'Os 8 movimentos do kata do Cris aos 7 anos, o eco do “ISSO!” do Ariel na arquibancada e a emoção da Grazi na conquista da medalha.',
        emotion: 'happy',
      },
    ],
  },

  s5_mem_ligacao_lara: {
    id: 's5_mem_ligacao_lara',
    lines: [
      {
        id: 's5_mll_1',
        speaker: 'narrator',
        speakerName: 'Lembrança Guardada · A Ligação da 2ª Gravidez',
        text: 'Grazi ligando do apartamento para o Ariel no serviço com a notícia da gravidez, e ele sorrindo após um instante de silêncio: “Espero que seja menina!”.',
        emotion: 'romantic',
      },
    ],
  },

  s5_mem_chegada_lara: {
    id: 's5_mem_chegada_lara',
    lines: [
      {
        id: 's5_mcl_1',
        speaker: 'narrator',
        speakerName: 'Lembrança Guardada · Bem-vinda, Lara!',
        text: 'A chegada da Lara bebê em casa, de roupinha rosa e cabelinho preto arrepiado como um pica-pau, recebendo o abraço carinhoso do irmão Cris.',
        emotion: 'happy',
      },
    ],
  },

  s5_mem_pepelequinha: {
    id: 's5_mem_pepelequinha',
    lines: [
      {
        id: 's5_mp_1',
        speaker: 'narrator',
        speakerName: 'Lembrança Guardada · “Pepelequinha!”',
        text: 'Lara aos 2 anos dançando e cantando “Pepelequinha, pepelequinha!” vestida na sala enquanto o Cris dava risada.',
        emotion: 'amused',
      },
    ],
  },

  s5_mem_parque_primos: {
    id: 's5_mem_parque_primos',
    lines: [
      {
        id: 's5_mpp_1',
        speaker: 'narrator',
        speakerName: 'Lembrança Guardada · Parque do Bela Vista',
        text: 'O encontro de família no parque com pista de skate em frente à igreja do Bela Vista, com Grazi, Laura, Cris, Lara e o pequeno Lucas de 5 anos.',
        emotion: 'happy',
      },
    ],
  },

  s5_mem_apartamento_proprio: {
    id: 's5_mem_apartamento_proprio',
    lines: [
      {
        id: 's5_map_1',
        speaker: 'narrator',
        speakerName: 'Lembrança Guardada · Nosso Apartamento na Ponte do Imaruim',
        text: 'A volta para a Ponte do Imaruim com o apartamento próprio comprado no Parque da Ponte — uma conquista de toda a família.',
        emotion: 'happy',
      },
    ],
  },

  s5_prop_skate_park: {
    id: 's5_prop_skate_park',
    lines: [
      {
        id: 's5_psp_1',
        speaker: 'narrator',
        speakerName: 'Pista de Skate · Praça da Igreja do Bela Vista',
        text: 'A pista de skate de concreto bem em frente à igreja modernista do Bela Vista, onde a garotada do bairro se reunia nas tardes de sol.',
        emotion: 'happy',
      },
    ],
  },

  // Living Room (Sala do Apartamento no Bela Vista) Interactive Props
  s5_prop_sofa: {
    id: 's5_prop_sofa',
    lines: [
      {
        id: 's5_ps_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Nosso sofá grande e macio com detalhes de madeira no braço! O melhor lugar pra descansar juntos no fim do dia.',
        emotion: 'happy',
      },
    ],
  },

  s5_prop_estante: {
    id: 's5_prop_estante',
    lines: [
      {
        id: 's5_pe_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'A estante de madeira mogno brilhante, com a caixa de som, o telefone fixo e nossas lembranças bem guardadas.',
        emotion: 'happy',
      },
    ],
  },

  s5_prop_janela_guesser: {
    id: 's5_prop_janela_guesser',
    lines: [
      {
        id: 's5_pjg_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Da porta-balcão da nossa sacada entra esse sol lindo que reflete no piso da sala, com vista direto pra rua do Mercado Guesser lá embaixo!',
        emotion: 'happy',
      },
    ],
  },

  s5_prop_tv: {
    id: 's5_prop_tv',
    lines: [
      {
        id: 's5_ptv_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'A TV na estante onde o Cris adora assistir desenho depois da escola e do treino de karatê.',
        emotion: 'happy',
      },
    ],
  },

  s5_prop_mesa: {
    id: 's5_prop_mesa',
    lines: [
      {
        id: 's5_pm_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'A mesinha do canto com o vasinho de flores ao lado da porta do quarto, deixando a nossa sala ainda mais acolhedora.',
        emotion: 'happy',
      },
    ],
  },

  // Nursery Preparation Dialogues (Quarto da Lara — only after lara_announced === true)
  s5_nursery_intro: {
    id: 's5_nursery_intro',
    lines: [
      {
        id: 's5_ni_1',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Amor, agora que sabemos que a nossa Lara vem aí, pintamos o quartinho em tons de rosa e branco! Vamos montar o berço, o móbile e o enxoval juntos?',
        emotion: 'happy',
      },
      {
        id: 's5_ni_2',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Vamos! Quero preparar cada detalhe desse quartinho com todo o nosso amor antes da chegada dela.',
        emotion: 'romantic',
      },
    ],
  },

  s5_nursery_step1_crib: {
    id: 's5_nursery_step1_crib',
    lines: [
      {
        id: 's5_ns1_1',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Prontinho! O bercinho branco com detalhes cor-de-rosa já está firme e montado no lugar!',
        emotion: 'happy',
      },
    ],
  },

  s5_nursery_step2_mobile: {
    id: 's5_nursery_step2_mobile',
    lines: [
      {
        id: 's5_ns2_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'Coloquei o móbile de estrelinhas e corações em cima do berço! Olha como gira suave...',
        emotion: 'romantic',
      },
    ],
  },

  s5_nursery_step3_layette: {
    id: 's5_nursery_step3_layette',
    onCompleteAction: 's5_start_lara_arrival',
    lines: [
      {
        id: 's5_ns3_1',
        speaker: 'grazi_adult',
        speakerName: 'Grazi',
        text: 'E agora o enxoval rosa e branco todo arrumadinho no berço! O quarto da nossa Lara está 100% pronto!',
        emotion: 'romantic',
      },
      {
        id: 's5_ns3_2',
        speaker: 'ariel_adult',
        speakerName: 'Ariel',
        text: 'Ficou um sonho, meu amor! Tudo pronto pra chegada da nossa princesa!',
        emotion: 'romantic',
      },
    ],
  },
};
