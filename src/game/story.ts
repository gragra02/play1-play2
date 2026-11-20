import type { DialogueSequence } from './types';

export const STAGE_1_DIALOGUES: Record<string, DialogueSequence> = {
  laura_talk: {
    id: 'laura_talk',
    onCompleteAction: 'start_ariel_approach',
    lines: [
      {
        id: 'l1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Mana, posso te perguntar uma coisa?',
        emotion: 'curious',
      },
      {
        id: 'l2',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Pode. O que foi?',
        emotion: 'curious',
      },
      {
        id: 'l3',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Tu ficaria chateada se eu ficasse com o Junior?',
        emotion: 'blush',
      },
      {
        id: 'l4',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Não, mana. Tudo bem.',
        emotion: 'uneasy',
      },
      {
        id: 'l5',
        speaker: 'grazi_thought',
        speakerName: 'Pensamento de Grazi',
        text: 'Ah, quer saber? O próximo menino que me chamar pra dançar, eu vou ficar!',
        emotion: 'determined',
      },
    ],
  },

  laura_after: {
    id: 'laura_after',
    lines: [
      {
        id: 'la1',
        speaker: 'laura',
        speakerName: 'Laura',
        text: 'Obrigada por entender, mana... Olha lá, aquele garoto de boné pra trás tá vindo falar contigo!',
        emotion: 'happy',
      },
    ],
  },

  ariel_encounter: {
    id: 'ariel_encounter',
    onCompleteAction: 'start_slow_dance',
    lines: [
      {
        id: 'a1',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Oi... Tá começando uma música lenta agora. Quer dançar comigo?',
        emotion: 'romantic',
      },
      {
        id: 'a2',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Quero sim! Vamos dançar.',
        emotion: 'blush',
      },
      {
        id: 'a3',
        speaker: 'narrator',
        speakerName: 'Pista da Cruzeiro · 1995',
        text: 'As luzes da discoteca ficam mais suaves enquanto os dois se aproximam e dançam abraçados no meio da pista...',
        emotion: 'romantic',
      },
    ],
  },

  post_dance: {
    id: 'post_dance',
    onCompleteAction: 'complete_stage',
    lines: [
      {
        id: 'pd1',
        speaker: 'ariel',
        speakerName: 'Ariel',
        text: 'Eu te amo.',
        emotion: 'romantic',
      },
      {
        id: 'pd2',
        speaker: 'grazi',
        speakerName: 'Grazi',
        text: 'Haha! O quê?! A gente acabou de se conhecer agora pouco!',
        emotion: 'amused',
      },
      {
        id: 'pd3',
        speaker: 'grazi_thought',
        speakerName: 'Pensamento de Grazi',
        text: 'Que figura... Vim pra cá gostando do Junior, e esse menino já mandou um "eu te amo" na primeira dança! Impossível não rir.',
        emotion: 'amused',
      },
      {
        id: 'pd4',
        speaker: 'narrator',
        speakerName: '1995 · Ponte do Imaruim',
        text: 'E foi assim, numa música lenta da Danceteria Cruzeiro, que Grazi encontrou o amor da sua vida — e começou a história do "Player 1 + Player 2".',
        emotion: 'happy',
      },
    ],
  },

  junior_talk: {
    id: 'junior_talk',
    lines: [
      {
        id: 'j1',
        speaker: 'junior',
        speakerName: 'Junior',
        text: 'E aí, Grazi! Tudo certo? Tu viu pra onde a Laura foi?',
        emotion: 'happy',
      },
      {
        id: 'j2',
        speaker: 'grazi_thought',
        speakerName: 'Pensamento de Grazi',
        text: 'A gente já se conhece da turma e eu gostava tanto dele... Mas ele só quer saber da Laura mesmo.',
        emotion: 'sad',
      },
    ],
  },

  bboy_talk: {
    id: 'bboy_talk',
    lines: [
      {
        id: 'bb1',
        speaker: 'bboy',
        speakerName: 'Galera da Pista',
        text: 'Tá vendo o Ariel ali no centro da pista? Toda noite na Cruzeiro ele segura a aba do boné pra trás no ritmo e manda até o passo do "cavalo"!',
        emotion: 'happy',
      },
    ],
  },

  teen_group_talk: {
    id: 'teen_group_talk',
    lines: [
      {
        id: 'tg1',
        speaker: 'teen_group',
        speakerName: 'Turma da Ponte do Imaruim',
        text: 'Hoje a Danceteria Cruzeiro tá lotada! Todo mundo veio curtir o som de sábado à noite em Palhoça.',
        emotion: 'happy',
      },
    ],
  },

  dj_talk: {
    id: 'dj_talk',
    lines: [
      {
        id: 'dj1',
        speaker: 'dj',
        speakerName: 'DJ Cruzeiro',
        text: 'O som tá fervendo na pista! Daqui a pouquinho vou baixar as luzes e soltar uma sequência romântica lenta pra galera dançar agarradinha!',
        emotion: 'happy',
      },
    ],
  },

  bartender_talk: {
    id: 'bartender_talk',
    lines: [
      {
        id: 'bt1',
        speaker: 'bartender',
        speakerName: 'Balcão da Cruzeiro',
        text: 'Refrigerante trincando pra turma descansar entre uma música agitada e a hora da música lenta!',
        emotion: 'happy',
      },
    ],
  },

  prop_entrance: {
    id: 'prop_entrance',
    lines: [
      {
        id: 'pe1',
        speaker: 'narrator',
        speakerName: 'Entrada da Danceteria Cruzeiro',
        text: 'Ponte do Imaruim, Palhoça, 1995. Lá fora, a fachada branca com arcos vermelhos da Cruzeiro F.C. brilha sob os postes da rua.',
        emotion: 'neutral',
      },
    ],
  },

  prop_counter: {
    id: 'prop_counter',
    lines: [
      {
        id: 'pc1',
        speaker: 'narrator',
        speakerName: 'Balcão de Madeira',
        text: 'Copos coloridos, fitas K7 perto do som e grupos de jovens conversando entre uma música e outra.',
        emotion: 'neutral',
      },
    ],
  },

  prop_dj: {
    id: 'prop_dj',
    lines: [
      {
        id: 'pdj1',
        speaker: 'narrator',
        speakerName: 'Cabine e Quadro da Cruzeiro',
        text: 'Na parede acima da pista está o famoso quadro pintado com a fachada da própria Danceteria Cruzeiro F.C.!',
        emotion: 'neutral',
      },
    ],
  },

  prop_sofa: {
    id: 'prop_sofa',
    lines: [
      {
        id: 'ps1',
        speaker: 'narrator',
        speakerName: 'Mesas e Cadeiras de Concreto',
        text: 'As mesas e cadeiras de concreto simples espalhadas pelo salão da Cruzeiro, onde a turma sentava e conversava entre uma música e outra.',
        emotion: 'neutral',
      },
    ],
  },
};
