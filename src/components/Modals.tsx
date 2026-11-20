import { STAGE_2_CLOSING_QUOTE, STAGE_2_MEMORIES } from '../game/stage2Data';
import { STAGE_3_CLOSING_QUOTE, STAGE_3_MEMORIES } from '../game/stage3Data';
import { STAGE_4_CLOSING_QUOTE, STAGE_4_MEMORIES } from '../game/stage4Data';
import type { SavedProgress, StageId } from '../game/types';

const ALL_MEMORIES = [...STAGE_2_MEMORIES, ...STAGE_3_MEMORIES, ...STAGE_4_MEMORIES];

interface PauseModalProps {
  stageId: StageId;
  onResume: () => void;
  onRestart: () => void;
  onOpenMemories?: () => void;
  onExitToTitle: () => void;
}

export function PauseModal({
  stageId,
  onResume,
  onRestart,
  onOpenMemories,
  onExitToTitle,
}: PauseModalProps) {
  const isStage2 = stageId === 'stage-2';
  const isStage3 = stageId === 'stage-3';
  const isStage4 = stageId === 'stage-4';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4"
    >
      <div className="w-full max-w-md rpg-wood-panel p-6 text-center flex flex-col gap-5">
        <div>
          <p className="text-xs font-mono-tabular font-bold text-[#9e2e24]">
            {isStage4
              ? 'NOVA FASE · FASE 4: NOSSA PEQUENA GRANDE AVENTURA'
              : isStage3
                ? 'ANOS 90 · FASE 3: DESSA VEZ, PRA FICAR'
                : isStage2
                  ? 'ANOS 90 · FASE 2: ENTRE ENCONTROS E DESENCONTROS'
                  : '1995 · FASE 1: DISCOTECA CRUZEIRO'}
          </p>
          <h2 id="pause-title" className="mt-1 font-pixel text-lg text-[#3d2111]">
            JOGO PAUSADO
          </h2>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="rpg-btn-gold w-full py-3 px-4 font-pixel text-xs cursor-pointer"
          >
            CONTINUAR
          </button>
          {(isStage2 || isStage3 || isStage4) && onOpenMemories && (
            <button
              type="button"
              onClick={onOpenMemories}
              className="rpg-btn-wood w-full py-3 px-4 font-display-pixel text-sm cursor-pointer"
            >
              Álbum de Lembranças
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className="rpg-btn-wood w-full py-3 px-4 font-display-pixel text-sm cursor-pointer"
          >
            {isStage4
              ? 'Reiniciar Fase 4'
              : isStage3
                ? 'Reiniciar Fase 3'
                : isStage2
                  ? 'Reiniciar Fase 2'
                  : 'Reiniciar Fase 1'}
          </button>
          <button
            type="button"
            onClick={onExitToTitle}
            className="w-full py-3 px-4 bg-[#e5cfa3] hover:bg-[#edd9b1] text-[#4b2816] text-sm font-semibold border-3 border-[#8c522b] cursor-pointer"
          >
            Voltar à Tela Inicial
          </button>
        </div>
      </div>
    </div>
  );
}

interface MemoryAlbumModalProps {
  unlockedMemories: string[];
  onClose: () => void;
}

export function MemoryAlbumModal({ unlockedMemories, onClose }: MemoryAlbumModalProps) {
  const unlockedSet = new Set(unlockedMemories);
  const count = ALL_MEMORIES.filter((m) => unlockedSet.has(m.id)).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="memory-album-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-2xl rpg-wood-panel p-5 sm:p-6 flex flex-col gap-4 max-h-[88vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-mono-tabular font-bold text-[#9e2e24]">
              COLEÇÃO · ANOS 90 ({count}/{ALL_MEMORIES.length})
            </p>
            <h2 id="memory-album-title" className="mt-1 font-pixel text-sm sm:text-base text-[#3d2111]">
              ÁLBUM DE LEMBRANÇAS
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rpg-btn-wood px-3 py-1.5 text-xs font-bold cursor-pointer"
          >
            Fechar
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#5c361e] font-medium">
          Explore os pontos dourados nas Fases 2, 3 e 4 para guardar cada lembrança especial da história.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_MEMORIES.map((mem) => {
            const unlocked = unlockedSet.has(mem.id);
            return (
              <div
                key={mem.id}
                className={`p-3.5 border-2 flex flex-col gap-1.5 ${
                  unlocked
                    ? 'bg-[#fff7e2] border-[#a86a3a]'
                    : 'bg-[#e6d1a7] border-[#a88257] opacity-80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-tabular text-[11px] font-bold text-[#9e2e24]">
                    {unlocked ? '★ DESBLOQUEADA' : '☆ NÃO DESCOBERTA'}
                  </span>
                  <span className="font-mono-tabular text-[10px] font-bold text-[#7c4726]">
                    FASE {mem.stageNumber}
                  </span>
                </div>
                <div className="font-sans font-bold text-sm text-[#3d2111]">
                  {unlocked ? mem.title : `Lembrança da Fase ${mem.stageNumber}`}
                </div>
                <div className="text-[11px] font-mono-tabular text-[#7c4726]">
                  {mem.subtitle}
                </div>
                <p className="text-xs text-[#4b2816] leading-relaxed">
                  {unlocked
                    ? mem.description
                    : `Procure o brilho dourado durante a Fase ${mem.stageNumber} para desbloquear.`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface VictoryModalProps {
  stageId: StageId;
  syncHits: number;
  discoveredCount: number;
  unlockedMemoriesCount: number;
  movingDeliveredCount: number;
  stage4PuzzlesSolved?: number;
  elapsedSeconds: number;
  progress: SavedProgress;
  onPlayAgain: () => void;
  onContinueToStage2: () => void;
  onContinueToStage3: () => void;
  onContinueToStage4: () => void;
  onOpenMemories: () => void;
  onExitToTitle: () => void;
}

export function VictoryModal({
  stageId,
  syncHits,
  discoveredCount,
  unlockedMemoriesCount,
  movingDeliveredCount,
  stage4PuzzlesSolved = 3,
  elapsedSeconds,
  progress,
  onPlayAgain,
  onContinueToStage2,
  onContinueToStage3,
  onContinueToStage4,
  onOpenMemories,
  onExitToTitle,
}: VictoryModalProps) {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = Math.floor(elapsedSeconds % 60);
  const timeFormatted = `${mins}:${secs.toString().padStart(2, '0')}`;
  const isStage2 = stageId === 'stage-2';
  const isStage3 = stageId === 'stage-3';
  const isStage4 = stageId === 'stage-4';

  if (isStage4) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      >
        <div className="w-full max-w-lg rpg-wood-panel p-6 sm:p-7 text-center flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 32 28" className="w-10 h-9" aria-hidden="true">
              <rect x="4" y="2" width="8" height="8" fill="#d64e6c" />
              <rect x="20" y="2" width="8" height="8" fill="#d64e6c" />
              <rect x="0" y="6" width="32" height="8" fill="#d64e6c" />
              <rect x="4" y="14" width="24" height="6" fill="#d64e6c" />
              <rect x="10" y="20" width="12" height="4" fill="#d64e6c" />
              <rect x="14" y="24" width="4" height="2" fill="#d64e6c" />
            </svg>
            <p className="text-xs font-mono-tabular font-bold text-[#9e2e24]">
              FASE 4 CONCLUÍDA · PROGRESSO SALVO
            </p>
            <h2
              id="victory-title"
              className="font-pixel text-sm sm:text-base leading-relaxed text-[#3d2111]"
            >
              NOSSA PEQUENA GRANDE AVENTURA
            </h2>
            <p className="text-sm text-[#5c361e] leading-relaxed max-w-md font-medium">
              &ldquo;{STAGE_4_CLOSING_QUOTE}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
              <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">ENIGMAS</div>
              <div className="mt-1 font-mono-tabular text-lg font-bold text-[#9e2e24]">
                {Math.min(3, stage4PuzzlesSolved)}/3
              </div>
            </div>
            <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
              <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">LEMBRANÇAS</div>
              <div className="mt-1 font-mono-tabular text-lg font-bold text-[#b87114]">
                {unlockedMemoriesCount}/{ALL_MEMORIES.length}
              </div>
            </div>
            <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
              <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">TEMPO</div>
              <div className="mt-1 font-mono-tabular text-lg font-bold text-[#3d2111]">
                {timeFormatted}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onOpenMemories}
              className="rpg-btn-wood w-full py-2.5 px-4 font-display-pixel text-sm cursor-pointer"
            >
              Abrir Álbum de Lembranças ({unlockedMemoriesCount}/{ALL_MEMORIES.length})
            </button>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                data-start="true"
                onClick={onPlayAgain}
                className="rpg-btn-gold flex-1 py-3 px-4 font-pixel text-xs cursor-pointer whitespace-nowrap"
              >
                JOGAR FASE 4 NOVAMENTE
              </button>
              <button
                type="button"
                onClick={onExitToTitle}
                className="rpg-btn-wood flex-1 py-3 px-4 font-display-pixel text-sm cursor-pointer whitespace-nowrap"
              >
                Tela Inicial
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isStage3) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      >
        <div className="w-full max-w-lg rpg-wood-panel p-6 sm:p-7 text-center flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <svg viewBox="0 0 32 28" className="w-10 h-9" aria-hidden="true">
              <rect x="4" y="2" width="8" height="8" fill="#d64e6c" />
              <rect x="20" y="2" width="8" height="8" fill="#d64e6c" />
              <rect x="0" y="6" width="32" height="8" fill="#d64e6c" />
              <rect x="4" y="14" width="24" height="6" fill="#d64e6c" />
              <rect x="10" y="20" width="12" height="4" fill="#d64e6c" />
              <rect x="14" y="24" width="4" height="2" fill="#d64e6c" />
            </svg>
            <p className="text-xs font-mono-tabular font-bold text-[#9e2e24]">
              FASE 3 CONCLUÍDA · PROGRESSO SALVO
            </p>
            <h2
              id="victory-title"
              className="font-pixel text-sm sm:text-base leading-relaxed text-[#3d2111]"
            >
              DESSA VEZ, PRA FICAR
            </h2>
            <p className="text-sm text-[#5c361e] leading-relaxed max-w-md font-medium">
              &ldquo;{STAGE_3_CLOSING_QUOTE}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
              <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">MUDANÇA</div>
              <div className="mt-1 font-mono-tabular text-lg font-bold text-[#9e2e24]">
                {Math.min(4, movingDeliveredCount)}/4
              </div>
            </div>
            <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
              <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">LEMBRANÇAS</div>
              <div className="mt-1 font-mono-tabular text-lg font-bold text-[#b87114]">
                {unlockedMemoriesCount}/{ALL_MEMORIES.length}
              </div>
            </div>
            <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
              <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">TEMPO</div>
              <div className="mt-1 font-mono-tabular text-lg font-bold text-[#3d2111]">
                {timeFormatted}
              </div>
            </div>
          </div>

          <div className="bg-[#edd8ad] border-2 border-[#a86a3a] px-4 py-2 text-xs text-[#4b2816] font-medium">
            Próximo capítulo liberado:{' '}
            <span className="text-[#9e2e24] font-bold">Fase 4 — Nossa Pequena Grande Aventura</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              data-continue-stage4="true"
              onClick={onContinueToStage4}
              className="rpg-btn-gold w-full py-3.5 px-4 font-pixel text-xs cursor-pointer whitespace-nowrap"
            >
              CONTINUAR PARA FASE 4
            </button>
            <button
              type="button"
              onClick={onOpenMemories}
              className="rpg-btn-wood w-full py-2.5 px-4 font-display-pixel text-sm cursor-pointer"
            >
              Abrir Álbum de Lembranças ({unlockedMemoriesCount}/{ALL_MEMORIES.length})
            </button>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                data-start="true"
                onClick={onPlayAgain}
                className="rpg-btn-wood flex-1 py-2.5 px-4 font-display-pixel text-sm cursor-pointer whitespace-nowrap"
              >
                Jogar Fase 3 Novamente
              </button>
              <button
                type="button"
                onClick={onExitToTitle}
                className="rpg-btn-wood flex-1 py-2.5 px-4 font-display-pixel text-sm cursor-pointer whitespace-nowrap"
              >
                Tela Inicial
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isStage2) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
      >
        <div className="w-full max-w-lg rpg-wood-panel p-6 sm:p-7 text-center flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            {/* Pixel Heart Emblem */}
            <svg viewBox="0 0 32 28" className="w-10 h-9" aria-hidden="true">
              <rect x="4" y="2" width="8" height="8" fill="#d64e6c" />
              <rect x="20" y="2" width="8" height="8" fill="#d64e6c" />
              <rect x="0" y="6" width="32" height="8" fill="#d64e6c" />
              <rect x="4" y="14" width="24" height="6" fill="#d64e6c" />
              <rect x="10" y="20" width="12" height="4" fill="#d64e6c" />
              <rect x="14" y="24" width="4" height="2" fill="#d64e6c" />
            </svg>
            <p className="text-xs font-mono-tabular font-bold text-[#9e2e24]">
              FASE 2 CONCLUÍDA · PROGRESSO SALVO
            </p>
            <h2
              id="victory-title"
              className="font-pixel text-sm sm:text-base leading-relaxed text-[#3d2111]"
            >
              ENTRE ENCONTROS E DESENCONTROS
            </h2>
            <p className="text-sm text-[#5c361e] leading-relaxed max-w-md font-medium">
              &ldquo;{STAGE_2_CLOSING_QUOTE}&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-center">
            <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
              <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">LEMBRANÇAS</div>
              <div className="mt-1 font-mono-tabular text-lg font-bold text-[#b87114]">
                {unlockedMemoriesCount}/{ALL_MEMORIES.length}
              </div>
            </div>
            <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
              <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">TEMPO</div>
              <div className="mt-1 font-mono-tabular text-lg font-bold text-[#3d2111]">
                {timeFormatted}
              </div>
            </div>
          </div>

          <div className="bg-[#edd8ad] border-2 border-[#a86a3a] px-4 py-2 text-xs text-[#4b2816] font-medium">
            Próximo capítulo liberado:{' '}
            <span className="text-[#9e2e24] font-bold">Fase 3 — Dessa Vez, Pra Ficar</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              data-continue-stage3="true"
              onClick={onContinueToStage3}
              className="rpg-btn-gold w-full py-3.5 px-4 font-pixel text-xs cursor-pointer whitespace-nowrap"
            >
              CONTINUAR PARA FASE 3
            </button>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                data-start="true"
                onClick={onPlayAgain}
                className="rpg-btn-wood flex-1 py-2.5 px-4 font-display-pixel text-sm cursor-pointer whitespace-nowrap"
              >
                Jogar Fase 2 Novamente
              </button>
              <button
                type="button"
                onClick={onExitToTitle}
                className="rpg-btn-wood flex-1 py-2.5 px-4 font-display-pixel text-sm cursor-pointer whitespace-nowrap"
              >
                Tela Inicial
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-lg rpg-wood-panel p-6 sm:p-7 text-center flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2">
          {/* Pixel Heart Trophy */}
          <svg viewBox="0 0 32 28" className="w-10 h-9" aria-hidden="true">
            <rect x="4" y="2" width="8" height="8" fill="#d64e6c" />
            <rect x="20" y="2" width="8" height="8" fill="#d64e6c" />
            <rect x="0" y="6" width="32" height="8" fill="#d64e6c" />
            <rect x="4" y="14" width="24" height="6" fill="#d64e6c" />
            <rect x="10" y="20" width="12" height="4" fill="#d64e6c" />
            <rect x="14" y="24" width="4" height="2" fill="#d64e6c" />
          </svg>
          <p className="text-xs font-mono-tabular font-bold text-[#9e2e24]">
            FASE 1 CONCLUÍDA · PROGRESSO SALVO
          </p>
          <h2 id="victory-title" className="font-pixel text-base sm:text-lg leading-relaxed text-[#3d2111]">
            A DANÇA QUE MUDOU TUDO
          </h2>
          <p className="text-sm text-[#5c361e] leading-relaxed max-w-md font-medium">
            1995, Danceteria Cruzeiro, Ponte do Imaruim. Uma música lenta, a dança agarradinha, o primeiro beijo e um &ldquo;eu te amo&rdquo; que fez Grazi rir logo no primeiro encontro.
          </p>
        </div>

        {/* 3 Tabular Mastery Metrics */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
            <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">RITMO</div>
            <div className="mt-1 font-mono-tabular text-lg font-bold text-[#9e2e24]">
              {Math.round(syncHits)}/4
            </div>
          </div>
          <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
            <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">DETALHES</div>
            <div className="mt-1 font-mono-tabular text-lg font-bold text-[#b87114]">
              {Math.round(discoveredCount)}/4
            </div>
          </div>
          <div className="bg-[#fff7e2] border-2 border-[#a86a3a] p-3">
            <div className="text-[11px] font-mono-tabular font-bold text-[#7c4726]">TEMPO</div>
            <div className="mt-1 font-mono-tabular text-lg font-bold text-[#3d2111]">
              {timeFormatted}
            </div>
          </div>
        </div>

        <div className="bg-[#edd8ad] border-2 border-[#a86a3a] px-4 py-2.5 text-xs text-[#4b2816] font-medium">
          Próximo capítulo liberado: <span className="text-[#9e2e24] font-bold">Fase 2 — Entre Encontros e Desencontros</span> · Recorde: {progress.bestDanceSync}/4
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            data-continue-stage2="true"
            onClick={onContinueToStage2}
            className="rpg-btn-gold w-full py-3.5 px-4 font-pixel text-xs cursor-pointer whitespace-nowrap"
          >
            CONTINUAR PARA FASE 2
          </button>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              data-start="true"
              onClick={onPlayAgain}
              className="rpg-btn-wood flex-1 py-2.5 px-4 font-display-pixel text-sm cursor-pointer whitespace-nowrap"
            >
              Jogar Fase 1 Novamente
            </button>
            <button
              type="button"
              onClick={onExitToTitle}
              className="rpg-btn-wood flex-1 py-2.5 px-4 font-display-pixel text-sm cursor-pointer whitespace-nowrap"
            >
              Tela Inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
