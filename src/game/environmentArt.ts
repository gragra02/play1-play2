// ============================================================================
// HIGH-RESOLUTION ENVIRONMENT ART REGISTRY (Client-Only Asset Loader)
// Strictly decoupled from Node-tested simulation modules (rules.ts / rules.test.ts).
// Loads all 8 approved Stardew-Valley-grade pixel-art environment backdrops
// across Stage 1, Stage 2, Stage 3, and all travel/intro cutscenes.
// ============================================================================

import caminhoNovoHotdogUrl from '../assets/images/caminho_novo_hotdog_corner_1795121344413.jpg';
import caminhoNovoStreetUrl from '../assets/images/caminho_novo_street_preview_1795119722792.jpg';
import caminhoNovoTravelUrl from '../assets/images/caminho_novo_travel_scene_1795121343702.jpg';
import casaNovaMudancaUrl from '../assets/images/casa_nova_mudanca_1795121209086.jpg';
import discotecaExteriorUrl from '../assets/images/cruzeiro_fachada_fiel_1795173412317.jpg';
import discotecaInteriorUrl from '../assets/images/discoteca_interior_cruzeiro_1795121345840.jpg';
import locadoraVhsInteriorUrl from '../assets/images/locadora_vhs_interior_1795121202564.jpg';
import s4BackyardLotUrl from '../assets/images/s4_backyard_lot_1795202453407.jpg';
import s4CristianCribRoomUrl from '../assets/images/s4_cristian_crib_room_1795209665067.jpg';
import s4MaternidadeCarmelaDutraUrl from '../assets/images/s4_maternidade_carmela_dutra_1795209662165.jpg';
import s4MeiaAguaInteriorUrl from '../assets/images/s4_meia_agua_interior_1795202449437.jpg';
import s4MomsHouseYardUrl from '../assets/images/s4_moms_house_yard_1795202453174.jpg';
import s4NeighborhoodBikeRoadUrl from '../assets/images/s4_neighborhood_bike_road_1795202449685.jpg';
import s5ApartamentoSalaBelaVistaUrl from '../assets/images/apartamento_sala_bela_vista.png';
import s5BelaVistaGuesserUrl from '../assets/images/s5_bela_vista_guesser.jpg';
import s5BelaVistaParkChurchUrl from '../assets/images/s5_bela_vista_park_church.jpg';
import s5BercoLaraCorpoUrl from '../assets/images/s5_berco_lara_corpo.png';
import s5BercoLaraGradeFrontalUrl from '../assets/images/s5_berco_lara_grade_frontal.png';
import s5EnxovalLaraUrl from '../assets/images/s5_enxoval_lara.png';
import s5KarateChampionshipGymUrl from '../assets/images/s5_karate_championship_gym.jpg';
import s5MobileLaraUrl from '../assets/images/s5_mobile_lara.png';
const fotoParquinhoPixelUrl = '/assets/aistudio/lara_lucas_cris_b24c87e9.jfif';
import s5ParquinhoIgrejaUrl from '../assets/images/s5_parquinho_igreja.jpg';
import s5PonteImaruimCondoUrl from '../assets/images/s5_ponte_imaruim_condo.jpg';
import s5QuartoLaraUrl from '../assets/images/s5_quarto_lara.jpg';
import s5TrabalhoArielKoerichUrl from '../assets/images/s5_trabalho_ariel_koerich.jpg';
import s6AbracoFamiliaUrl from '../assets/images/s6_abraco_familia.png';
import s6BoloAniversarioUrl from '../assets/images/s6_bolo_aniversario.png';
import s6CasalCamaTvUrl from '../assets/images/s6_casal_cama_tv.png';
import s6CozinhaPiaUrl from '../assets/images/s6_cozinha_pia.jpg';
import s6FxPiaAguaUrl from '../assets/images/s6_fx_pia_agua_sheet.png';
import s6FxVelasBoloUrl from '../assets/images/s6_fx_velas_bolo_sheet.png';
import s6PiscinaCondominioUrl from '../assets/images/s6_piscina_condominio.jpg';
import s6QuartoCasalArrumadoUrl from '../assets/images/s6_quarto_casal_arrumado.jpg';
import s6SalaAniversarioUrl from '../assets/images/s6_sala_aniversario.jpg';
import s6SalaFamiliaUrl from '../assets/images/s6_sala_familia.jpg';
import s6SalaVideogameFrontalUrl from '../assets/images/s6_sala_videogame_frontal.jpg';
import s6SalaVideogameTeensUrl from '../assets/images/s6_sala_videogame_teens.jpg';
import s6TelaFinalVolume1Url from '../assets/images/s6_tela_final_volume1.jpg';
import salaEstarNoiteFilmeUrl from '../assets/images/sala_estar_noite_filme_1795121344494.jpg';
import type { Stage3MapId, Stage4MapId, Stage5MapId, Stage6MapId } from './types';

const STAGE3_BACKDROP_URLS: Record<Stage3MapId, string> = {
  neighborhood_street: caminhoNovoStreetUrl,
  hotdog_stand: caminhoNovoHotdogUrl,
  video_store: locadoraVhsInteriorUrl,
  living_room: salaEstarNoiteFilmeUrl,
  moving_house: casaNovaMudancaUrl,
};

const STAGE4_BACKDROP_URLS: Record<Stage4MapId, string> = {
  moms_house_yard: s4MomsHouseYardUrl,
  neighborhood_bike_road: s4NeighborhoodBikeRoadUrl,
  maternidade_carmela_dutra: s4MaternidadeCarmelaDutraUrl,
  cristian_crib_room: s4CristianCribRoomUrl,
  backyard_construction: s4BackyardLotUrl,
  meia_agua_interior: s4MeiaAguaInteriorUrl,
};

const STAGE5_BACKDROP_URLS: Record<Stage5MapId, string> = {
  bela_vista_guesser: s5BelaVistaGuesserUrl,
  bela_vista_apartment: s5ApartamentoSalaBelaVistaUrl,
  bela_vista_lara_room: s5QuartoLaraUrl,
  karate_tournament_gym: s5KarateChampionshipGymUrl,
  bela_vista_park_church: s5BelaVistaParkChurchUrl,
  // Etapa 7 (parquinho em frente à igreja): fundo pronto 1264x848, sem desenho por código.
  parquinho_igreja: s5ParquinhoIgrejaUrl,
  ponte_imaruim_condo: s5PonteImaruimCondoUrl,
};

const STAGE6_BACKDROP_URLS: Record<Stage6MapId, string> = {
  s6_sala_familia: s6SalaFamiliaUrl,
  s6_piscina_condominio: s6PiscinaCondominioUrl,
  s6_sala_videogame_teens: s6SalaVideogameFrontalUrl,
  s6_quarto_casal_noite: s6QuartoCasalArrumadoUrl,
  s6_cozinha_pia: s6CozinhaPiaUrl,
  s6_sala_aniversario: s6SalaAniversarioUrl,
  s6_tela_final_volume1: s6TelaFinalVolume1Url,
};

const ALL_ENVIRONMENT_URLS: string[] = [
  discotecaExteriorUrl,
  discotecaInteriorUrl,
  caminhoNovoStreetUrl,
  caminhoNovoHotdogUrl,
  locadoraVhsInteriorUrl,
  salaEstarNoiteFilmeUrl,
  casaNovaMudancaUrl,
  caminhoNovoTravelUrl,
  s4MomsHouseYardUrl,
  s4NeighborhoodBikeRoadUrl,
  s4MaternidadeCarmelaDutraUrl,
  s4CristianCribRoomUrl,
  s4BackyardLotUrl,
  s4MeiaAguaInteriorUrl,
  s5BelaVistaGuesserUrl,
  s5ApartamentoSalaBelaVistaUrl,
  s5QuartoLaraUrl,
  s5BercoLaraCorpoUrl,
  s5BercoLaraGradeFrontalUrl,
  s5MobileLaraUrl,
  s5EnxovalLaraUrl,
  s5KarateChampionshipGymUrl,
  s5BelaVistaParkChurchUrl,
  s5ParquinhoIgrejaUrl,
  fotoParquinhoPixelUrl,
  s5PonteImaruimCondoUrl,
  s5TrabalhoArielKoerichUrl,
  s6SalaFamiliaUrl,
  s6PiscinaCondominioUrl,
  s6SalaVideogameFrontalUrl,
  s6SalaVideogameTeensUrl,
  s6QuartoCasalArrumadoUrl,
  s6CasalCamaTvUrl,
  s6CozinhaPiaUrl,
  s6FxPiaAguaUrl,
  s6SalaAniversarioUrl,
  s6BoloAniversarioUrl,
  s6FxVelasBoloUrl,
  s6TelaFinalVolume1Url,
  s6AbracoFamiliaUrl,
];

const loadedImages = new Map<string, HTMLImageElement>();
const pendingLoads = new Set<string>();

function getOrLoadImage(url: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  const cached = loadedImages.get(url);
  if (cached) return cached;

  if (!pendingLoads.has(url)) {
    pendingLoads.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      loadedImages.set(url, img);
      pendingLoads.delete(url);
    };
    img.onerror = () => {
      pendingLoads.delete(url);
    };
    img.src = url;
  }
  return null;
}

export function getDiscotecaExteriorBackdrop(): HTMLImageElement | null {
  return getOrLoadImage(discotecaExteriorUrl);
}

export function getDiscotecaInteriorBackdrop(): HTMLImageElement | null {
  return getOrLoadImage(discotecaInteriorUrl);
}

export function getCaminhoNovoStreetBackdrop(): HTMLImageElement | null {
  return getOrLoadImage(caminhoNovoStreetUrl);
}

export function getStage3MapBackdrop(mapId: Stage3MapId): HTMLImageElement | null {
  return getOrLoadImage(STAGE3_BACKDROP_URLS[mapId]);
}

export function getStage4MapBackdrop(mapId: Stage4MapId): HTMLImageElement | null {
  return getOrLoadImage(STAGE4_BACKDROP_URLS[mapId]);
}

export function getStage5MapBackdrop(mapId: Stage5MapId): HTMLImageElement | null {
  return getOrLoadImage(STAGE5_BACKDROP_URLS[mapId]);
}

export function getStage5ParkPolaroidPhoto(): HTMLImageElement | null {
  return getOrLoadImage(fotoParquinhoPixelUrl);
}

export function getStage5LaraCribBody(): HTMLImageElement | null {
  return getOrLoadImage(s5BercoLaraCorpoUrl);
}

export function getStage5LaraCribFrontRail(): HTMLImageElement | null {
  return getOrLoadImage(s5BercoLaraGradeFrontalUrl);
}

export function getStage5LaraMobile(): HTMLImageElement | null {
  return getOrLoadImage(s5MobileLaraUrl);
}

export function getStage5LaraLayette(): HTMLImageElement | null {
  return getOrLoadImage(s5EnxovalLaraUrl);
}

export function getStage5ArielWorkBackdrop(): HTMLImageElement | null {
  return getOrLoadImage(s5TrabalhoArielKoerichUrl);
}

export function getStage6MapBackdrop(mapId: Stage6MapId): HTMLImageElement | null {
  return getOrLoadImage(STAGE6_BACKDROP_URLS[mapId]);
}

export function getStage6FamilyHugSprite(): HTMLImageElement | null {
  return getOrLoadImage(s6AbracoFamiliaUrl);
}

export function getStage6CoupleBedTvSprite(): HTMLImageElement | null {
  return getOrLoadImage(s6CasalCamaTvUrl);
}

export function getStage6SinkWaterFxSprite(): HTMLImageElement | null {
  return getOrLoadImage(s6FxPiaAguaUrl);
}

export function getStage6BirthdayCakeSprite(): HTMLImageElement | null {
  return getOrLoadImage(s6BoloAniversarioUrl);
}

export function getStage6BirthdayCandlesFxSprite(): HTMLImageElement | null {
  return getOrLoadImage(s6FxVelasBoloUrl);
}

export function getCaminhoNovoTravelBackdrop(): HTMLImageElement | null {
  return getOrLoadImage(caminhoNovoTravelUrl);
}

export function preloadEnvironmentArt(): void {
  if (typeof window === 'undefined') return;
  for (const url of ALL_ENVIRONMENT_URLS) {
    getOrLoadImage(url);
  }
}
