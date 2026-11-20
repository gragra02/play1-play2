import { STAGE_2_MEMORIES } from '../game/stage2Data';
import { STAGE_3_MEMORIES } from '../game/stage3Data';
import { STAGE_4_MEMORIES } from '../game/stage4Data';
import type { SavedProgress, StageDefinition, StageId } from '../game/types';
import { TITLE_PORTRAITS } from './portraits';

const TOTAL_MEMORIES_COUNT =
  STAGE_2_MEMORIES.length + STAGE_3_MEMORIES.length + STAGE_4_MEMORIES.length;

interface TitleScreenProps {
  progress: SavedProgress;
  stages: StageDefinition[];
  onStartStage: (stageId: StageId) => void;
  onOpenMemories: () => void;
  onResetProgress: () => void;
}

export function TitleScreen({
  progress,
  stages,
  onStartStage,
  onOpenMemories,
  onResetProgress,
}: TitleScreenProps) {
  const hasAnyProgress =
    progress.stage1Completed ||
    progress.stage2Completed ||
    progress.stage3Completed ||
    progress.stage4Completed ||
    progress.unlockedMemories.length > 0;

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-between px-4 py-3 sm:py-5 pointer-events-none overflow-y-auto">
      {/* Top Wooden Year & Location Header */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm tracking-wide rpg-mahogany-panel px-4 py-1.5">
        <span className="font-mono-tabular text-[#faeccd]">
          1995 · PONTE DO IMARUIM, PALHOÇA - SC
        </span>
        {(progress.stage1Completed ||
          progress.stage2Completed ||
          progress.stage3Completed ||
          progress.stage4Completed) && (
          <span className="font-mono-tabular text-[#ffd166]">
            {progress.stage4Completed
              ? `FASE 4 CONCLUÍDA · LEMBRANÇAS: ${progress.unlockedMemories.length}/${TOTAL_MEMORIES_COUNT}`
              : progress.stage3Completed
                ? `FASE 3 CONCLUÍDA · LEMBRANÇAS: ${progress.unlockedMemories.length}/${TOTAL_MEMORIES_COUNT}`
                : progress.stage2Completed
                  ? `FASE 2 CONCLUÍDA · LEMBRANÇAS: ${progress.unlockedMemories.length}/${TOTAL_MEMORIES_COUNT}`
                  : `FASE 1 CONCLUÍDA · RITMO: ${progress.bestDanceSync}/4`}
          </span>
        )}
      </div>

      {/* Main Stardew-Style Carved Wood & Parchment Title Signboard */}
      <main className="pointer-events-auto w-full max-w-4xl rpg-wood-panel px-5 py-5 sm:px-8 sm:py-6 text-center flex flex-col items-center gap-3.5 my-2">
        <div className="w-full flex flex-col items-center gap-2">
          {/* Stardew-Style Portrait Medallions: P1 Grazi + Pixel Heart + P2 Ariel */}
          <div
            className="w-full max-w-[330px] flex items-center justify-between gap-3"
            aria-label="PLAYER 1 mais PLAYER 2"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 sm:w-[70px] sm:h-[70px] bg-[#5c351e] border-3 border-[#6b3b1e] shadow-[0_2px_0_#3d2111] overflow-hidden">
                <img
                  src={TITLE_PORTRAITS.grazi}
                  alt="Grazi adolescente"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover pixelated block"
                />
              </div>
              <span className="font-mono-tabular text-[11px] font-bold text-[#6b3b1e]">
                P1 · GRAZI
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <svg
                viewBox="0 0 36 30"
                shapeRendering="crispEdges"
                className="w-9 h-8"
                aria-hidden="true"
              >
                <rect x="6" y="2" width="8" height="8" fill="#d64e6c" />
                <rect x="22" y="2" width="8" height="8" fill="#d64e6c" />
                <rect x="2" y="8" width="32" height="10" fill="#d64e6c" />
                <rect x="6" y="18" width="24" height="6" fill="#d64e6c" />
                <rect x="12" y="24" width="12" height="5" fill="#d64e6c" />
                <rect x="8" y="6" width="4" height="4" fill="#ff9eb5" />
              </svg>
              <span className="font-mono-tabular text-[11px] font-bold text-[#8c281d]">
                DESDE 1995
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 sm:w-[70px] sm:h-[70px] bg-[#5c351e] border-3 border-[#6b3b1e] shadow-[0_2px_0_#3d2111] overflow-hidden">
                <img
                  src={TITLE_PORTRAITS.ariel}
                  alt="Ariel adolescente"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover pixelated block"
                />
              </div>
              <span className="font-mono-tabular text-[11px] font-bold text-[#6b3b1e]">
                P2 · ARIEL
              </span>
            </div>
          </div>

          <h1 className="font-pixel text-base sm:text-xl leading-relaxed text-[#3d2111] tracking-wide">
            <span className="block">PLAYER 1 + PLAYER 2</span>
            <span className="block mt-1 text-[#9e2e24]">Desde 1995</span>
          </h1>

          <p className="text-sm sm:text-base text-[#5c361e] max-w-lg leading-relaxed font-medium">
            Uma história de amor, aventuras, recomeços e muitos continues.
          </p>
        </div>

        {/* Stage Cards (Fase 1, Fase 2, Fase 3 & Fase 4) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-left">
          {stages.map((stage) => {
            const isUnlocked = stage.unlocked;
            const isCompleted =
              stage.id === 'stage-1'
                ? progress.stage1Completed
                : stage.id === 'stage-2'
                  ? progress.stage2Completed
                  : stage.id === 'stage-3'
                    ? progress.stage3Completed
                    : progress.stage4Completed;
            return (
              <button
                key={stage.id}
                type="button"
                data-stage-card={stage.id}
                disabled={!isUnlocked}
                onClick={isUnlocked ? () => onStartStage(stage.id) : undefined}
                className={`p-3 border-3 transition-transform text-left flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-[#fff6df] border-[#8c4e27] hover:-translate-y-0.5 cursor-pointer shadow-[0_3px_0_#6b3b1e]'
                    : 'bg-[#e5cfa3] border-[#a88257] opacity-65 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono-tabular font-bold text-[#9e2e24] whitespace-nowrap">
                    <span>
                      FASE {stage.number} · {stage.year}
                    </span>
                    <span>
                      {isUnlocked ? (isCompleted ? 'CONCLUÍDA' : 'DISPONÍVEL') : 'EM BREVE'}
                    </span>
                  </div>
                  <div className="mt-1 font-sans font-bold text-sm leading-snug text-[#3d2111]">
                    {stage.title}
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-[#6b4328] leading-snug">{stage.location}</div>
              </button>
            );
          })}
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            data-start="true"
            onClick={() => onStartStage('stage-1')}
            className="rpg-btn-gold px-4 py-2.5 font-pixel text-[11px] cursor-pointer transition-colors whitespace-nowrap"
          >
            {progress.stage1Completed ? 'FASE 1' : 'INICIAR FASE 1'}
          </button>

          <button
            type="button"
            data-start-stage2="true"
            onClick={() => onStartStage('stage-2')}
            className="rpg-btn-wood px-4 py-2.5 font-pixel text-[11px] cursor-pointer transition-colors whitespace-nowrap"
          >
            FASE 2
          </button>

          <button
            type="button"
            data-start-stage3="true"
            onClick={() => onStartStage('stage-3')}
            className="rpg-btn-wood px-4 py-2.5 font-pixel text-[11px] cursor-pointer transition-colors whitespace-nowrap"
          >
            FASE 3
          </button>

          <button
            type="button"
            data-start-stage4="true"
            onClick={() => onStartStage('stage-4')}
            className="rpg-btn-rose px-4 py-2.5 font-pixel text-[11px] cursor-pointer transition-colors whitespace-nowrap"
          >
            {progress.stage4Completed ? 'FASE 4' : 'INICIAR FASE 4'}
          </button>

          <button
            type="button"
            data-open-memories="true"
            onClick={onOpenMemories}
            className="rpg-btn-wood px-3.5 py-2.5 text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            ★ Lembranças ({progress.unlockedMemories.length}/{TOTAL_MEMORIES_COUNT})
          </button>

          {hasAnyProgress && (
            <button
              type="button"
              onClick={onResetProgress}
              className="w-auto px-3 py-2.5 bg-[#e5cfa3] hover:bg-[#edd9b1] text-[#4b2816] text-xs font-semibold border-3 border-[#8c522b] cursor-pointer whitespace-nowrap"
            >
              Limpar
            </button>
          )}
        </div>
      </main>

      {/* Bottom Control Hint */}
      <div className="w-full max-w-4xl text-center text-xs sm:text-sm text-[#faeccd] bg-[#3b2011]/85 px-3 py-1 border border-[#7c4726] tracking-wide">
        Setas ou WASD: Mover · Espaço ou E: Interagir · P: Pausar · M: Som
      </div>
    </div>
  );
}
