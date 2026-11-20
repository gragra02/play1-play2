import { ARIEL_PISTA_SPOT, TILE_SIZE } from './mapData';
import type { DialogueSequence, MemoryItem, NpcEntity } from './types';

// ============================================================================
// FASE 2 — ENTRE ENCONTROS E DESENCONTROS
// Pure data module (no image imports -> 100% Node unit-test safe).
// Preserves real adolescent events faithfully without inventing dates or drama.
// ============================================================================

export const STAGE_2_CLOSING_QUOTE =
  'Nem toda história começa sabendo onde vai chegar. Algumas precisam de tempo, caminhos diferentes e novos recomeços.';

export const STAGE_2_MEMORIES: MemoryItem[] = [
  {
    id: 'mem_cassette',
    title: 'Fita K7 de Músicas Lentas',
    subtitle: 'Cabine do DJ · Anos 90',
    description:
      'As fitas K7 com músicas lentas que faziam as luzes da Discoteca Cruzeiro diminuírem e a pista ficar mais silenciosa.',
    stageNumber: 2,
    x: 11.5 * TILE_SIZE,
    y: 3.1 * TILE_SIZE,
    radius: 52,
    dialogueId: 's2_mem_cassette',
  },
  {
    id: 'mem_ticket',
    title: 'Entrada da Cruzeiro',
    subtitle: 'Ponte do Imaruim · Anos 90',
    description:
      'As noites de adolescência na Danceteria Cruzeiro, quando cada reencontro na pista fazia o coração acelerar.',
    stageNumber: 2,
    x: 4.0 * TILE_SIZE,
    y: 13.7 * TILE_SIZE,
    radius: 48,
    dialogueId: 's2_mem_ticket',
  },
  {
    id: 'mem_sofa',
    title: 'Mesas de Concreto',
    subtitle: 'Salão da Discoteca · Anos 90',
    description:
      'As mesas e cadeiras de concreto simples espalhadas pela Cruzeiro, onde a turma sentava e conversava entre uma música e outra.',
    stageNumber: 2,
    x: 4.0 * TILE_SIZE,
    y: 3.3 * TILE_SIZE,
    radius: 48,
    dialogueId: 's2_mem_sofa',
  },
  {
    id: 'mem_soda',
    title: 'Pausa no Balcão',
    subtitle: 'Balcão de Madeira · Anos 90',
    description:
      'Um refrigerante gelado com a turma para respirar fundo e observar o movimento da pista de longe.',
    stageNumber: 2,
    x: 19.3 * TILE_SIZE,
    y: 7.0 * TILE_SIZE,
    radius: 52,
    dialogueId: 's2_mem_soda',
  },
  {
    id: 'mem_breakdance',
    title: 'A Roda de Breakdance',
    subtitle: 'Centro da Pista · Funk Anos 90',
    description:
      'Quando o funk começava na Cruzeiro, a pista abria roda para o rapaz mandar giros no chão, passos rápidos e freezes sob os aplausos da galera.',
    stageNumber: 2,
    x: 12.2 * TILE_SIZE,
    y: 11.45 * TILE_SIZE,
    radius: 54,
    dialogueId: 's2_mem_breakdance',
  },
];

// Ariel's avoidance waypoints inside the discoteca during Act 4 (Exploration 3)
export const ARIEL_AVOID_SPOTS = [
  { x: 11.4 * TILE_SIZE, y: 7.4 * TILE_SIZE },
  { x: 15.6 * TILE_SIZE, y: 5.0 * TILE_SIZE },
  { x: 16.5 * TILE_SIZE, y: 10.6 * TILE_SIZE },
] as const;

export const STAGE_2_DIALOGUES: Record<string, DialogueSequence> = {
  s2_laura_reunion: {
    id: 's2_laura_reunion',
    onCompleteAction: 's2_trigger_eloisa',
    lines: [
      {
        id: 's2lr1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Mana, faz tempo que a pista não ficava tão cheia assim... Olha ali perto da pista quem voltou a aparecer.',
        emotion: 'curious',
      },
      {
        id: 's2lr2',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Espera... é o Ariel?',
        emotion: 'surprised',
      },
    ],
  },

  s2_after_eloisa_chat: {
    id: 's2_after_eloisa_chat',
    lines: [
      {
        id: 's2aec1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Viu só, mana? Sumiu da Cruzeiro um tempão e reapareceu acompanhado... te trocou pela Eloisa assim mesmo.',
        emotion: 'curious',
      },
      {
        id: 's2aec2',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Pois é, né? E ainda volta pra mesma pista como se nada tivesse acontecido...',
        emotion: 'amused',
      },
      {
        id: 's2aec3',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Deixa ele pra lá, mana! Vamos curtir a noite com a turma — olha ali, aquele amigo do Ariel tá vindo perto da pista.',
        emotion: 'happy',
      },
    ],
  },

  s2_laura_after_eloisa: {
    id: 's2_laura_after_eloisa',
    lines: [
      {
        id: 's2lae1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Te trocou pela Eloisa e ainda veio pra mesma pista, acredita? Mas nem liga, mana — vai lá dançar e curtir a noite!',
        emotion: 'happy',
      },
    ],
  },

  s2_laura_avoidance: {
    id: 's2_laura_avoidance',
    lines: [
      {
        id: 's2lav1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Se tu tá sentindo que ele tá fugindo de conversar, vai lá falar direto com ele, mana.',
        emotion: 'thoughtful',
      },
    ],
  },

  s2_friend_invite: {
    id: 's2_friend_invite',
    onCompleteAction: 's2_trigger_jealousy',
    lines: [
      {
        id: 's2fi1',
        speaker: 'friend',
        speakerName: 'Amigo de Ariel',
        text: 'Começou uma música lenta agora... vamos dançar na pista?',
        emotion: 'happy',
      },
      {
        id: 's2fi2',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Vamos sim.',
        emotion: 'neutral',
      },
    ],
  },

  s2_avoid_thought: {
    id: 's2_avoid_thought',
    lines: [
      {
        id: 's2at1',
        speaker: 'grazi_thought',
        speakerName: 'Pensamento de Grazi',
        text: 'Toda vez que chego perto, ele vai para outro canto da discoteca... Preciso falar com ele de uma vez.',
        emotion: 'thoughtful',
      },
    ],
  },

  s2_farewell_confront: {
    id: 's2_farewell_confront',
    onCompleteAction: 's2_start_forehead_kiss',
    lines: [
      {
        id: 's2fc1',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Você quer continuar me namorando ou não?',
        emotion: 'thoughtful',
      },
      {
        id: 's2fc2',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Me desculpa, Grazi...',
        emotion: 'sad',
      },
    ],
  },

  s2_junior_chat: {
    id: 's2_junior_chat',
    lines: [
      {
        id: 's2jc1',
        speaker: 'junior',
        speakerName: 'Junior',
        text: 'E aí, Grazi! A discoteca tá bem animada hoje. A Laura tava te procurando ali perto das mesas de concreto.',
        emotion: 'happy',
      },
    ],
  },

  s2_dj_chat: {
    id: 's2_dj_chat',
    lines: [
      {
        id: 's2djc1',
        speaker: 'dj',
        speakerName: 'DJ Cruzeiro',
        text: 'Hoje a seleção tá cheia de clássicos dos anos 90 — daqui a pouco rola mais uma sequência de músicas lentas na pista.',
        emotion: 'happy',
      },
    ],
  },

  s2_bartender_chat: {
    id: 's2_bartender_chat',
    lines: [
      {
        id: 's2btc1',
        speaker: 'bartender',
        speakerName: 'Balcão da Cruzeiro',
        text: 'Refrigerante gelado saindo! O pessoal sempre dá uma parada por aqui entre uma música e outra.',
        emotion: 'happy',
      },
    ],
  },

  s2_turma_chat: {
    id: 's2_turma_chat',
    lines: [
      {
        id: 's2tc1',
        speaker: 'teen_group',
        speakerName: 'Turma da Discoteca',
        text: 'Na adolescência cada noite na Cruzeiro parece uma história diferente... tem risada, música lenta e muito frio na barriga.',
        emotion: 'happy',
      },
    ],
  },

  // Unlockable memory dialogues
  s2_mem_cassette: {
    id: 's2_mem_cassette',
    lines: [
      {
        id: 's2mc1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Fita K7',
        text: 'As fitas K7 com músicas lentas dos anos 90 que faziam as luzes da Discoteca Cruzeiro diminuírem e o tempo parecer mais devagar.',
        emotion: 'thoughtful',
      },
    ],
  },

  s2_mem_ticket: {
    id: 's2_mem_ticket',
    lines: [
      {
        id: 's2mt1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Entrada da Cruzeiro',
        text: 'A entrada da Danceteria Cruzeiro guarda o início de tudo — e cada noite de encontros e desencontros na adolescência.',
        emotion: 'thoughtful',
      },
    ],
  },

  s2_mem_sofa: {
    id: 's2_mem_sofa',
    lines: [
      {
        id: 's2ms1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Mesas de Concreto',
        text: 'Entre uma música e outra, as mesas e cadeiras de concreto ao redor do salão eram o ponto certo para descansar e conversar.',
        emotion: 'thoughtful',
      },
    ],
  },

  s2_mem_soda: {
    id: 's2_mem_soda',
    lines: [
      {
        id: 's2mb1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Pausa no Balcão',
        text: 'Do balcão de madeira dava para enxergar toda a pista — os passos, os olhares de longe e as mudanças de ritmo.',
        emotion: 'thoughtful',
      },
    ],
  },

  s2_mem_breakdance: {
    id: 's2_mem_breakdance',
    lines: [
      {
        id: 's2mbr1',
        speaker: 'narrator',
        speakerName: 'Lembrança Desbloqueada · Roda de Breakdance',
        text: 'No meio do funk dos anos 90, a roda se abria na pista da Cruzeiro e todo mundo vibrava com cada giro no chão e cada freeze.',
        emotion: 'happy',
      },
    ],
  },
};

export function createStage2Npcs(mode: 'reunion' | 'jealousy' | 'avoidance'): NpcEntity[] {
  const showFriend = mode === 'jealousy';
  const showAriel = mode === 'avoidance' || mode === 'jealousy';
  const showEloisaStanding = mode === 'jealousy';

  return [
    {
      id: 'laura',
      name: 'Laura',
      role: 'laura',
      x: 5.2 * TILE_SIZE,
      y: 7.4 * TILE_SIZE,
      dir: 'right',
      visible: true,
      interactable: true,
      variant: 0,
      dancePhaseOffset: 0,
    },
    {
      id: 'junior',
      name: 'Junior',
      role: 'junior',
      x: 4.5 * TILE_SIZE,
      y: 4.6 * TILE_SIZE,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 2,
      dancePhaseOffset: 0.4,
    },
    {
      id: 'ariel',
      name: 'Ariel',
      role: 'ariel',
      x: mode === 'avoidance' ? ARIEL_AVOID_SPOTS[0].x : 14.8 * TILE_SIZE,
      y: mode === 'avoidance' ? ARIEL_AVOID_SPOTS[0].y : 7.2 * TILE_SIZE,
      dir: mode === 'avoidance' ? 'down' : 'left',
      visible: showAriel,
      interactable: mode === 'avoidance',
      variant: 0,
      dancePhaseOffset: 0,
    },
    {
      id: 'eloisa',
      name: 'Eloisa',
      role: 'eloisa',
      x: 15.7 * TILE_SIZE,
      y: 7.25 * TILE_SIZE,
      dir: 'left',
      visible: showEloisaStanding,
      interactable: false,
      variant: 0,
      dancePhaseOffset: 0.3,
    },
    {
      id: 'ariel-friend',
      name: 'Amigo de Ariel',
      role: 'friend',
      x: 8.6 * TILE_SIZE,
      y: 7.8 * TILE_SIZE,
      dir: 'left',
      visible: showFriend,
      interactable: showFriend,
      variant: 3,
      dancePhaseOffset: 0.2,
    },
    {
      id: 'bboy-circle',
      name: 'Roda de Breakdance',
      role: 'bboy',
      x: 12.2 * TILE_SIZE,
      y: 10.95 * TILE_SIZE,
      dir: 'down',
      visible: true,
      interactable: true,
      variant: 3,
      dancePhaseOffset: 0.15,
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
      variant: 1,
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
      id: 'teen-chat-1',
      name: 'Turma da Discoteca',
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
      name: 'Turma da Discoteca',
      role: 'teen_chat',
      x: 18.4 * TILE_SIZE,
      y: 11.5 * TILE_SIZE,
      dir: 'left',
      visible: true,
      interactable: false,
      variant: 1,
      dancePhaseOffset: 0.55,
    },
    // Background club dancers keeping the 90s discoteca alive
    {
      id: 'dancer-1',
      name: 'Casal na Pista',
      role: 'dancer',
      x: 7.9 * TILE_SIZE,
      y: 5.7 * TILE_SIZE,
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
      y: 5.7 * TILE_SIZE,
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
      y: 6.0 * TILE_SIZE,
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
      y: 6.0 * TILE_SIZE,
      dir: 'left',
      visible: true,
      interactable: false,
      variant: 3,
      dancePhaseOffset: 0.5,
    },
  ];
}
