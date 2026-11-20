import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './mapData';
import type {
  DialogueSequence,
  MemoryItem,
  NpcEntity,
  Stage4BuildTask,
  Stage4MapId,
} from './types';

// ============================================================================
// STAGE 4 — NOSSA PEQUENA GRANDE AVENTURA
// From Grazi's pregnancy at 19 years old through Cristian reaching ~7 years old.
// Respectful narrator storytelling without inventing fake real-life dialogues.
// ============================================================================

export const STAGE_4_CLOSING_QUOTE =
  'Entre a bicicleta no fim da tarde, os tijolos da meia-água, as danças do Cristian loirinho e os enigmas no videogame, descobrimos que família é a nossa maior aventura.';

export interface Stage4MemoryItem extends MemoryItem {
  mapId: Stage4MapId;
}

export const STAGE_4_MEMORIES: Stage4MemoryItem[] = [
  {
    id: 'mem_s4_gravidez',
    title: 'Aos 19 anos, um novo começo',
    subtitle: 'A casa da mãe de Grazi',
    description:
      'Aos 19 anos, Grazi descobriu que Cristian estava a caminho. Ariel recebeu a notícia com alegria no peito e o peso bom de uma nova responsabilidade.',
    stageNumber: 4,
    mapId: 'moms_house_yard',
    x: 15.2 * TILE_SIZE,
    y: 9.8 * TILE_SIZE,
    radius: 52,
    dialogueId: 's4_mem_gravidez',
  },
  {
    id: 'mem_s4_bicicleta',
    title: 'Na garupa até a aula da noite',
    subtitle: 'Rotina pelo bairro',
    description:
      'Enquanto moravam na casa da mãe de Grazi, Ariel trabalhava durante o dia e levava Grazi de bicicleta à noite até a escola ou o ponto de ônibus.',
    stageNumber: 4,
    mapId: 'moms_house_yard',
    x: 7.4 * TILE_SIZE,
    y: 8.6 * TILE_SIZE,
    radius: 52,
    dialogueId: 's4_mem_bicicleta',
  },
  {
    id: 'mem_s4_meia_agua',
    title: 'Nossa primeira casinha',
    subtitle: 'A meia-água nos fundos do terreno',
    description:
      'Tijolo por tijolo, o terreno vazio nos fundos se transformou na pequena meia-água — simples, aconchegante e construída com muito esforço dos dois.',
    stageNumber: 4,
    mapId: 'backyard_construction',
    x: 7.4 * TILE_SIZE,
    y: 12.2 * TILE_SIZE,
    radius: 54,
    dialogueId: 's4_mem_meia_agua',
  },
  {
    id: 'mem_s4_menino_lindo',
    title: '“Vai um menino lindo!”',
    subtitle: 'O palpite certeiro na rua do bairro',
    description:
      'Aos nove meses de gestação, Grazi e Ariel caminhavam de mãos dadas pela rua quando um senhor saindo do bar olhou com simpatia e disse espontaneamente: “Vai um menino lindo!” — sem nem saber o sexo do bebê.',
    stageNumber: 4,
    mapId: 'neighborhood_bike_road',
    x: 4.5 * TILE_SIZE,
    y: 9.8 * TILE_SIZE,
    radius: 56,
    dialogueId: 's4_mem_menino_lindo',
  },
  {
    id: 'mem_s4_maternidade',
    title: 'A caminho da Maternidade Carmela Dutra',
    subtitle: 'Com a madrinha Nani ao volante',
    description:
      'Na hora de ir para a Maternidade Carmela Dutra, a madrinha Nani levou Grazi e Ariel com todo carinho, dividindo a expectativa e a emoção da chegada do Cristian.',
    stageNumber: 4,
    mapId: 'maternidade_carmela_dutra',
    x: 12.0 * TILE_SIZE,
    y: 10.5 * TILE_SIZE,
    radius: 56,
    dialogueId: 's4_mem_maternidade',
  },
  {
    id: 'mem_s4_bercinho',
    title: 'O bercinho amarelo e os brinquedos do tio Léo',
    subtitle: 'O primeiro cantinho do Cristian',
    description:
      'Na casa da mãe de Grazi, o bercinho do Cristian tinha enxoval todo amarelinho e os brinquedos em miniatura que o tio Léo deu de presente para ele.',
    stageNumber: 4,
    mapId: 'cristian_crib_room',
    x: 12.0 * TILE_SIZE,
    y: 10.5 * TILE_SIZE,
    radius: 56,
    dialogueId: 's4_mem_bercinho',
  },
  {
    id: 'mem_s4_videogame',
    title: 'Enigmas no videogame',
    subtitle: 'Dupla imbatível na sala da meia-água',
    description:
      'Entre fases e enigmas de aventuras em ruínas antigas, Grazi ajudava Ariel a decifrar cada desafio — e logo o pequeno Cristian loirinho também passou a acompanhar de perto.',
    stageNumber: 4,
    mapId: 'meia_agua_interior',
    x: 8.2 * TILE_SIZE,
    y: 11.4 * TILE_SIZE,
    radius: 52,
    dialogueId: 's4_mem_videogame',
  },
];

export interface Stage4PuzzleChallenge {
  id: string;
  stageTitle: string;
  sceneHint: string;
  prompt: string;
  optionA: { label: string; correct: boolean; feedback: string };
  optionB: { label: string; correct: boolean; feedback: string };
}

export const STAGE_4_VIDEOGAME_PUZZLES: Stage4PuzzleChallenge[] = [
  {
    id: 'puzzle_ruin_gate',
    stageTitle: 'TEMPLO ANTIGO · FASE 1',
    sceneHint: 'A exploradora encontrou dois símbolos gravados ao lado do portão de pedra.',
    prompt: 'Como Grazi orienta Ariel para abrir o portão das ruínas?',
    optionA: {
      label: 'Puxar a alavanca perto da estátua do sol na parede alta',
      correct: true,
      feedback:
        'Acertou em cheio! O portão de pedra deslizou — Grazi sempre enxergava o detalhe escondido primeiro.',
    },
    optionB: {
      label: 'Tentar empurrar o portão fechado de frente',
      correct: false,
      feedback:
        'O portão nem se mexeu... Grazi aponta para a parede iluminada lá em cima e eles tentam de novo!',
    },
  },
  {
    id: 'puzzle_chasm_jump',
    stageTitle: 'CÂMARA SUBTERRÂNEA · FASE 2',
    sceneHint: 'Cristian (5 anos, loirinho) se aproxima animado com os olhos brilhando na TV.',
    prompt: 'Há um fosso antigo no meio da sala. Qual é a melhor jogada?',
    optionA: {
      label: 'Dar um passo atrás, correr e saltar agarrando a borda de pedra',
      correct: true,
      feedback:
        'Salto perfeito! Cristian comemora vibrando enquanto Ariel e Grazi sorriem juntos.',
    },
    optionB: {
      label: 'Descer direto pelo buraco sem olhar a saliência lateral',
      correct: false,
      feedback:
        'Quase! Grazi lembra o macete clássico de recuar um passo antes do salto.',
    },
  },
  {
    id: 'puzzle_relic_chamber',
    stageTitle: 'SALÃO DA RELÍQUIA · FASE FINAL',
    sceneHint: 'Três pedestais brilham no fundo da caverna. Cristian torce segurando o segundo controle.',
    prompt: 'Qual pista libera o artefato dourado no altar?',
    optionA: {
      label: 'Alinhar o espelho de luz com o cristal central da sala',
      correct: true,
      feedback:
        'Fase vencida em família! O raio dourado abre o altar e os três celebram na sala da meia-água.',
    },
    optionB: {
      label: 'Pular em círculos longe dos pedestais',
      correct: false,
      feedback:
        'Ainda não! Grazi observa o reflexo da tocha no cristal e indica o ângulo certinho.',
    },
  },
];

export const STAGE4_BICYCLE_POS = { x: 7.2 * TILE_SIZE, y: 8.9 * TILE_SIZE };
export const STAGE4_BUILD_SITE_POS = { x: 12.6 * TILE_SIZE, y: 8.9 * TILE_SIZE };
export const STAGE4_BAR_MAN_POS = { x: 4.3 * TILE_SIZE, y: 8.6 * TILE_SIZE };
export const STAGE4_STREET_CONTINUE_POS = { x: 19.6 * TILE_SIZE, y: 9.8 * TILE_SIZE };
export const STAGE4_RADIO_POS = { x: 7.4 * TILE_SIZE, y: 9.8 * TILE_SIZE };
export const STAGE4_CONSOLE_POS = { x: 12.0 * TILE_SIZE, y: 10.1 * TILE_SIZE };

export function createInitialBuildTasks(): Stage4BuildTask[] {
  return [
    {
      id: 'build_bricks',
      label: 'Tijolos e cimento para as paredes',
      materialX: 6.2 * TILE_SIZE,
      materialY: 12.1 * TILE_SIZE,
      completed: false,
    },
    {
      id: 'build_roof',
      label: 'Madeiras e telhas para o telhado meia-água',
      materialX: 18.6 * TILE_SIZE,
      materialY: 11.4 * TILE_SIZE,
      completed: false,
    },
    {
      id: 'build_finish',
      label: 'Tinta, porta e janela para finalizar a casinha',
      materialX: 10.6 * TILE_SIZE,
      materialY: 12.4 * TILE_SIZE,
      completed: false,
    },
  ];
}

// ============================================================================
// COLLISION GRIDS (24x16) MATCHED TO THE 4 BESPOKE HIGH-RES STAGE 4 BACKDROPS
// ============================================================================
export function isStage4TileSolid(mapId: Stage4MapId, col: number, row: number): boolean {
  if (col < 1 || col >= MAP_COLS - 1 || row < 1 || row >= MAP_ROWS - 1) return true;

  if (mapId === 'moms_house_yard') {
    // Upper half is the house + veranda; bottom border is the stone wall & garden
    if (row < 7 || row > 12) return true;
    if (col < 3 || col > 20) return true;
    return false;
  }

  if (mapId === 'neighborhood_bike_road' || mapId === 'maternidade_carmela_dutra') {
    // Open walkable sidewalk & cobblestone/asphalt street across rows 8..13
    if (row < 8 || row > 13) return true;
    return false;
  }

  if (mapId === 'cristian_crib_room') {
    if (row < 8 || row > 13) return true;
    if (col < 4 || col > 19) return true;
    return false;
  }

  if (mapId === 'backyard_construction') {
    // Backyard fenced lot: open lower yard around the central construction site
    if (row < 8 || row > 13) return true;
    if (col < 3 || col > 20) return true;
    return false;
  }

  // meia_agua_interior: cozy terracotta tile floor inside the isometric room
  if (row < 9 || row > 13) return true;
  if (col < 6 || col > 17) return true;
  return false;
}

export function createStage4Npcs(
  mapId: Stage4MapId,
  phase: 'moms_house' | 'construction' | 'labor_walk' | 'toddler_home',
): NpcEntity[] {
  if (mapId === 'moms_house_yard' || phase === 'moms_house') {
    return [
      {
        id: 's4_ariel',
        name: 'Ariel',
        role: 'ariel',
        x: 9.2 * TILE_SIZE,
        y: 8.9 * TILE_SIZE,
        dir: 'down',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ];
  }

  if (mapId === 'backyard_construction' || phase === 'construction') {
    return [
      {
        id: 's4_ariel',
        name: 'Ariel',
        role: 'ariel',
        x: 13.8 * TILE_SIZE,
        y: 9.4 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ];
  }

  if (mapId === 'neighborhood_bike_road' || phase === 'labor_walk') {
    return [
      {
        id: 's4_bar_man',
        name: 'Senhor da Esquina',
        role: 'bar_man',
        x: STAGE4_BAR_MAN_POS.x,
        y: STAGE4_BAR_MAN_POS.y,
        dir: 'down',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
      {
        id: 's4_ariel',
        name: 'Ariel',
        role: 'ariel',
        x: 19.2 * TILE_SIZE,
        y: 9.6 * TILE_SIZE,
        dir: 'left',
        visible: true,
        interactable: true,
        variant: 0,
        dancePhaseOffset: 0,
      },
    ];
  }

  // meia_agua_interior — toddler Cristian (~2-3y) + adult Ariel inside their finished home!
  return [
    {
      id: 's4_cristian',
      name: 'Cristian',
      role: 'cristian',
      x: 9.7 * TILE_SIZE,
      y: 10.9 * TILE_SIZE,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
    {
      id: 's4_ariel',
      name: 'Ariel',
      role: 'ariel',
      x: 11.7 * TILE_SIZE,
      y: 9.5 * TILE_SIZE,
      dir: 'left',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
  ];
}

// ============================================================================
// RESPECTFUL NARRATOR & MEMORY SEQUENCES (Zero Invented Real-Life Dialogues!)
// ============================================================================
export const STAGE_4_DIALOGUES: Record<string, DialogueSequence> = {
  s4_moms_house_intro: {
    id: 's4_moms_house_intro',
    lines: [
      {
        id: 's4_mh_1',
        speaker: 'narrator',
        speakerName: 'Nova Fase · Casa da Mãe de Grazi',
        text: 'Grazi e Ariel passaram a morar na casa da mãe de Grazi. A rotina mudou depressa: Ariel trabalhava durante o dia e Grazi continuava estudando à noite.',
      },
      {
        id: 's4_mh_2',
        speaker: 'grazi_adult',
        speakerName: 'Lembrança de Grazi',
        text: 'A bicicleta azul encostada na varanda guarda uma das memórias mais queridas dessa época. Aproxime-se de Ariel e da bicicleta para seguir para a aula da noite.',
        emotion: 'happy',
      },
    ],
  },

  s4_bicycle_prompt: {
    id: 's4_bicycle_prompt',
    lines: [
      {
        id: 's4_bike_1',
        speaker: 'narrator',
        speakerName: 'Fim de Tarde no Bairro',
        text: 'Mais uma noite de aula começava. Ariel ajeitou a bicicleta para levar Grazi na garupa pelas ruas do bairro até o ponto de ônibus e a escola.',
      },
    ],
    onCompleteAction: 's4_start_bicycle_cutscene',
  },

  s4_bicycle_arrival: {
    id: 's4_bicycle_arrival',
    lines: [
      {
        id: 's4_ba_1',
        speaker: 'ariel_adult',
        speakerName: 'Chegada ao Ponto e à Escola',
        text: 'Ariel encosta a bicicleta com calma junto à calçada iluminada. Depois do dia de trabalho, garantir que Grazi chegasse bem à aula era o cuidado mais natural para ele.',
        emotion: 'romantic',
      },
      {
        id: 's4_ba_2',
        speaker: 'grazi_adult',
        speakerName: 'Carinho Antes da Aula',
        text: 'Grazi desce da garupa, ajeita o caderno e troca um sorriso tranquilo e um aceno carinhoso com Ariel antes de seguir para a escola à noite.',
        emotion: 'happy',
      },
      {
        id: 's4_ba_3',
        speaker: 'narrator',
        speakerName: 'Os Meses Passaram na Casa da Mãe de Grazi',
        text: 'A barriga cresceu mês a mês ainda na casa da mãe de Grazi — até chegar os nove meses e o dia mais esperado: a chegada do Cristian.',
      },
    ],
    onCompleteAction: 's4_start_labor_walk',
  },

  s4_crib_reflection: {
    id: 's4_crib_reflection',
    lines: [
      {
        id: 's4_cr_1',
        speaker: 'grazi_adult',
        speakerName: 'O Cantinho Amarelinho do Cristian',
        text: 'Com o enxoval todo amarelo e os brinquedinhos em miniatura que o tio Léo deu de presente, o bercinho virou o lugar mais calmo e iluminado da casa da mãe de Grazi.',
        emotion: 'happy',
      },
      {
        id: 's4_cr_2',
        speaker: 'ariel_adult',
        speakerName: 'Um Novo Passo para a Família',
        text: 'Olhando o pequeno Cristian loirinho dormir tranquilo, Grazi e Ariel decidiram dar o próximo passo: construir a casinha meia-água nos fundos do terreno da mãe dela.',
        emotion: 'determined',
      },
    ],
    onCompleteAction: 's4_start_build_meia_agua',
  },

  s4_construction_intro: {
    id: 's4_construction_intro',
    lines: [
      {
        id: 's4_const_1',
        speaker: 'narrator',
        speakerName: 'Depois do Nascimento · Nos Fundos do Terreno',
        text: 'Com Cristian já nascido, chegou a hora de construir a pequena casinha meia-água nos fundos do terreno da mãe de Grazi — o primeiro cantinho só da nova família.',
      },
      {
        id: 's4_const_2',
        speaker: 'ariel_adult',
        speakerName: 'Construindo Nossa Casinha',
        text: 'Leve os materiais do quintal até o espaço da obra para acompanhar cada etapa da construção — do terreno vazio até a mudança para a casinha pronta.',
        emotion: 'determined',
      },
    ],
  },

  s4_construction_step_1: {
    id: 's4_construction_step_1',
    lines: [
      {
        id: 's4_cs1_1',
        speaker: 'narrator',
        speakerName: 'Etapa 1 · Alicerce e Paredes',
        text: 'Os primeiros tijolos subiram firmes nos fundos do terreno. Pouco a pouco, o desenho da pequena meia-água começava a ganhar forma para receber Grazi, Ariel e o bebê Cristian.',
      },
    ],
  },

  s4_construction_step_2: {
    id: 's4_construction_step_2',
    lines: [
      {
        id: 's4_cs2_1',
        speaker: 'narrator',
        speakerName: 'Etapa 2 · O Telhado Meia-Água',
        text: 'Com as vigas no lugar e as telhas encaixadas, a casinha já tinha cobertura firme para abrigar os três nos dias de sol e de chuva.',
      },
    ],
  },

  s4_construction_done: {
    id: 's4_construction_done',
    lines: [
      {
        id: 's4_cs3_1',
        speaker: 'narrator',
        speakerName: 'Nossa Primeira Casinha Pronta!',
        text: 'Paredes pintadas, porta firme e janela aberta para o quintal. Simples, acolhedora e construída com muito esforço depois da chegada de Cristian.',
      },
      {
        id: 's4_cs3_2',
        speaker: 'grazi_adult',
        speakerName: 'Hora da Mudança para a Meia-Água',
        text: 'Com a casinha pronta nos fundos do terreno, Grazi, Ariel e Cristian se mudaram para o primeiro lar só deles — começando uma nova etapa cheia de vida.',
        emotion: 'happy',
      },
    ],
    onCompleteAction: 's4_start_toddler_home',
  },

  s4_labor_walk_intro: {
    id: 's4_labor_walk_intro',
    lines: [
      {
        id: 's4_lw_1',
        speaker: 'narrator',
        speakerName: 'O Dia do Nascimento',
        text: 'Aos nove meses de gestação, Grazi e Ariel caminhavam juntos e de mãos dadas pela rua do bairro.',
      },
    ],
  },

  s4_bar_man_blessing: {
    id: 's4_bar_man_blessing',
    lines: [
      {
        id: 's4_bm_1',
        speaker: 'bar_man',
        speakerName: 'Senhor Saindo do Bar',
        text: '“Vai um menino lindo!”',
      },
      {
        id: 's4_bm_2',
        speaker: 'narrator',
        speakerName: 'Um Palpite Inesquecível',
        text: 'Ele não tinha como saber o sexo do bebê — mas acertou em cheio, arrancando um sorriso surpreso e bem-humorado de Grazi e Ariel.',
      },
    ],
  },

  s4_go_to_birth: {
    id: 's4_go_to_birth',
    lines: [
      {
        id: 's4_gb_1',
        speaker: 'nani',
        speakerName: 'Madrinha Nani',
        text: 'A madrinha Nani chegou pronta para levar Grazi e Ariel até a Maternidade Carmela Dutra.',
        emotion: 'happy',
      },
    ],
    onCompleteAction: 's4_start_maternity_trip',
  },

  s4_toddler_home_intro: {
    id: 's4_toddler_home_intro',
    lines: [
      {
        id: 's4_th_1',
        speaker: 'narrator',
        speakerName: 'Alguns Anos Depois · Na Meia-Água',
        text: 'O tempo passou depressa. Aquele bebê loirinho cresceu, deu os primeiros passos e encheu a pequena meia-água de alegria e música.',
      },
      {
        id: 's4_th_2',
        speaker: 'cristian',
        speakerName: 'Cristian (Pequeno · Loirinho)',
        text: 'Sempre que o rádio tocava na sala, Cristian começava a dançar — e todo mundo elogiava o jeitinho animado dele! Aproxime-se do rádio ou de Cristian.',
        emotion: 'happy',
      },
    ],
  },

  s4_start_dance_prompt: {
    id: 's4_start_dance_prompt',
    lines: [
      {
        id: 's4_dp_1',
        speaker: 'narrator',
        speakerName: 'Hora da Dança',
        text: 'A música começou a tocar no rádio da sala e o pequeno Cristian loirinho não pensou duas vezes antes de ir para o meio do tapete.',
      },
    ],
    onCompleteAction: 's4_start_cristian_dance',
  },

  s4_after_dance_videogame_prompt: {
    id: 's4_after_dance_videogame_prompt',
    lines: [
      {
        id: 's4_vg_1',
        speaker: 'narrator',
        speakerName: 'Outro Passado que Virou Rotina Boa',
        text: 'Quando sobrava um tempinho livre na sala, outro ritual favorito da família entrava em cena: ligar o videogame na TV.',
      },
      {
        id: 's4_vg_2',
        speaker: 'grazi_adult',
        speakerName: 'Dupla nos Enigmas',
        text: 'Ariel adorava jogos de aventura e exploração em ruínas antigas, e Grazi sempre ficava ao lado ajudando a desvendar os enigmas. Vamos jogar juntos!',
        emotion: 'happy',
      },
    ],
    onCompleteAction: 's4_start_videogame_scene',
  },

  s4_mem_gravidez: {
    id: 's4_mem_gravidez',
    lines: [
      {
        id: 's4_m1_1',
        speaker: 'narrator',
        speakerName: '★ Lembrança · Aos 19 Anos',
        text: 'Aos 19 anos, a notícia da gravidez trouxe um misto sincero de alegria, frio na barriga e vontade de fazer dar certo juntos.',
      },
    ],
  },
  s4_mem_bicicleta: {
    id: 's4_mem_bicicleta',
    lines: [
      {
        id: 's4_m2_1',
        speaker: 'narrator',
        speakerName: '★ Lembrança · Trajeto de Bicicleta',
        text: 'Mesmo depois de um dia inteiro de trabalho, Ariel pedalava levando Grazi à noite até a escola ou o ponto de ônibus.',
      },
    ],
  },
  s4_mem_meia_agua: {
    id: 's4_mem_meia_agua',
    lines: [
      {
        id: 's4_m3_1',
        speaker: 'narrator',
        speakerName: '★ Lembrança · A Meia-Água',
        text: 'Pequena no tamanho, mas gigante no significado: a primeira casinha nos fundos do terreno foi o palco de tantos começos.',
      },
    ],
  },
  s4_mem_menino_lindo: {
    id: 's4_mem_menino_lindo',
    lines: [
      {
        id: 's4_m4_1',
        speaker: 'narrator',
        speakerName: '★ Lembrança · O Senhor do Bar',
        text: 'Sem saber se era menino ou menina, o senhor saindo do bar acertou com um sorriso simples: “Vai um menino lindo!”',
      },
    ],
  },
  s4_mem_maternidade: {
    id: 's4_mem_maternidade',
    lines: [
      {
        id: 's4_m6_1',
        speaker: 'narrator',
        speakerName: '★ Lembrança · Maternidade Carmela Dutra',
        text: 'A madrinha Nani levou Grazi e Ariel de carro até a Maternidade Carmela Dutra, acompanhando o casal com cuidado e alegria.',
      },
    ],
  },
  s4_mem_bercinho: {
    id: 's4_mem_bercinho',
    lines: [
      {
        id: 's4_m7_1',
        speaker: 'narrator',
        speakerName: '★ Lembrança · O Bercinho Amarelo',
        text: 'Na casa da mãe de Grazi, o bercinho amarelo de Cristian e os brinquedinhos em miniatura do tio Léo marcaram os primeiros dias do bebê em casa.',
      },
    ],
  },
  s4_mem_videogame: {
    id: 's4_mem_videogame',
    lines: [
      {
        id: 's4_m5_1',
        speaker: 'narrator',
        speakerName: '★ Lembrança · Enigmas em Família',
        text: 'Entre aventuras de exploração em ruínas antigas, Grazi decifrava os enigmas ao lado de Ariel enquanto o loirinho Cristian aprendia a amar os videogames também.',
      },
    ],
  },
};
