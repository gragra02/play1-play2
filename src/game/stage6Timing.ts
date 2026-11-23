// ============================================================================
// STAGE 6 — NOSSA HISTÓRIA CONTINUA (TIMING CONSTANTS)
// All pacing, typewriter, minimum reading time, and transition durations
// centralized in one file (Regra 10 & Regra 11).
// ============================================================================

/** Digitação lenta: ~35 ms por caractere (~28,5 caracteres/segundo). */
export const S6_TYPEWRITER_MS_PER_CHAR = 35;

/** Tempo mínimo de leitura antes de permitir avançar: ~60 ms por caractere. */
export const S6_MIN_READ_MS_PER_CHAR = 60;

/** Tempo mínimo absoluto de permanência por balão de texto (em segundos). */
export const S6_MIN_BALLOON_SECONDS = 2.5;

/** Duração padrão de transições com contexto (cartela / mudança de luz): 4 a 6 s. */
export const S6_TRANSITION_DURATION_SECONDS = 4.8;

/** Cena 1 (Abraço da família): tempo de caminhada até se reunirem no centro da sala. */
export const S6_SCENE1_APPROACH_SECONDS = 2.8;

/** Cena 1: zoom suave sobre o abraço antes de abrir a fala manual. */
export const S6_SCENE1_HUG_ZOOM_SECONDS = 1.6;

/** Cena 4A: pausa silenciosa de acolhimento antes da fala "Não precisa falar nada. Eu estou aqui." */
export const S6_SCENE4_COMFORT_SECONDS = 2.8;

/** Cena 4B: pausa carinhosa no close-up da cama antes de abrir o diálogo do abraço. */
export const S6_SCENE4_BED_TV_SECONDS = 2.6;

/** Distância caminhada (em pixels do mundo) para trocar cada quadro da folha de caminhada. */
export const S6_WALK_FRAME_STEP_PX = 14;

/** Calcula o tempo mínimo de leitura (em segundos) para um texto da Fase 6. */
export function getStage6MinReadingSeconds(text: string): number {
  const byChars = (text.length * S6_MIN_READ_MS_PER_CHAR) / 1000;
  return Math.max(S6_MIN_BALLOON_SECONDS, byChars);
}

/** Calcula quantos caracteres já devem estar visíveis na digitação lenta (~35 ms/caractere). */
export function getStage6VisibleText(text: string, elapsedSeconds: number): {
  visibleText: string;
  isTypingComplete: boolean;
  canContinue: boolean;
} {
  const ms = Math.max(0, elapsedSeconds * 1000);
  const chars = Math.min(text.length, Math.max(1, Math.floor(ms / S6_TYPEWRITER_MS_PER_CHAR)));
  const isTypingComplete = chars >= text.length;
  const canContinue = isTypingComplete && elapsedSeconds >= getStage6MinReadingSeconds(text);
  return {
    visibleText: text.slice(0, chars),
    isTypingComplete,
    canContinue,
  };
}
