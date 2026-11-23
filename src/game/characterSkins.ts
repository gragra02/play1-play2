// ============================================================================
// HIGH-RESOLUTION CHARACTER SKIN REGISTRY (Client-Only Asset Loader)
// All 14 approved Stardew-grade full-body skins (Grazi, Ariel, Laura, Junior & NPCs)
// Kept strictly out of Node-tested pure simulation files (rules.ts / rules.test.ts).
// ============================================================================

import arielCapDanceUrl from '../assets/images/ariel_skin_cap_dance_match_1795049904289.jpg';
import arielCarryBoxUrl from '../assets/images/ariel_carry_box_1795096353786.jpg';
import arielEloisaDanceLeftUrl from '../assets/images/ariel_eloisa_dance_left_v2_1795056002771.jpg';
import arielEloisaDanceRightUrl from '../assets/images/ariel_eloisa_dance_right_1795055980314.jpg';
import arielFrontUrl from '../assets/images/ariel_skin_preview_1795047932881.jpg';
import arielJealousUrl from '../assets/images/ariel_skin_jealous_1795054141339.jpg';
import arielSideUrl from '../assets/images/ariel_skin_side_jacket_1795049925322.jpg';
import arielWalkSheetUrl from '../assets/images/ariel_walk_sheet_new_reference.png';
import arielEloisaWalkSheetUrl from '../assets/images/ariel_eloisa_handhold_walk_sheet.png';
import arielLauraWalkSheetUrl from '../assets/images/ariel_laura_handhold_walk_sheet.png';
import bboyFootworkUrl from '../assets/images/bboy_breakdance_footwork_1795055979911.jpg';
import bboyFreezeUrl from '../assets/images/bboy_breakdance_freeze_1795055979093.jpg';
import bboyWindmillUrl from '../assets/images/bboy_breakdance_windmill_1795055978352.jpg';
import coupleDanceCenterUrl from '../assets/images/couple_dance_center_1795050181840.jpg';
import coupleDanceLeftUrl from '../assets/images/couple_dance_sway_left_1795050181461.jpg';
import coupleDanceRightUrl from '../assets/images/couple_dance_sway_right_1795050182474.jpg';
import coupleForeheadKissUrl from '../assets/images/couple_forehead_kiss_1795054059376.jpg';
import coupleKissContactUrl from '../assets/images/couple_kiss_contact_1795050214095.jpg';
import coupleKissGazeUrl from '../assets/images/couple_kiss_gaze_1795050213935.jpg';
import coupleKissLeanUrl from '../assets/images/couple_kiss_lean_1795050213609.jpg';
import eloisaFrontUrl from '../assets/images/eloisa_skin_front_1795054055505.jpg';
import eloisaWalkSheetUrl from '../assets/images/eloisa_walk_sheet_new_reference.png';
import graziAmusedUrl from '../assets/images/grazi_skin_amused_1795049133576.jpg';
import graziArielWalkTogetherUrl from '../assets/images/grazi_ariel_walk_together_1795096386979.jpg';
import graziArielWalkSheetUrl from '../assets/images/grazi_ariel_handhold_walk_sheet.png';
import graziBackUrl from '../assets/images/grazi_skin_back_1795049134164.jpg';
import graziFriendDanceLeftUrl from '../assets/images/grazi_friend_dance_left_1795054141368.jpg';
import graziFriendDanceRightUrl from '../assets/images/grazi_friend_dance_right_1795054053136.jpg';
import graziFrontUrl from '../assets/images/grazi_skin_preview_1795047906397.jpg';
import graziShyUrl from '../assets/images/grazi_skin_shy_1795049132882.jpg';
import graziWalkSheetUrl from '../assets/images/grazi_walk_sheet_from_reference.png';
import juniorFrontUrl from '../assets/images/junior_skin_front_1795049138153.jpg';
import lauraFrontUrl from '../assets/images/laura_skin_preview_1795047930932.jpg';
import lauraSideUrl from '../assets/images/laura_skin_side_1795049134824.jpg';
import lauraBackWalkSheetUrl from '../assets/images/laura_back_walk_sheet.png';
import lauraWalkSheetUrl from '../assets/images/laura_walk_sheet_from_reference.png';
import lauraLeoWalkTogetherUrl from '../assets/images/leo_laura_handhold_walk_sheet.png';
import leoCarryBoxUrl from '../assets/images/leo_carry_box_v2_preview_1795097117193.jpg';
import leoFrontUrl from '../assets/images/leo_skin_v2_preview_1795097247259.jpg';
import leoWalkSheetUrl from '../assets/images/leo_walk_sheet_from_reference.png';
import npcBboyUrl from '../assets/images/npc_bboy_skin_1795049183085.jpg';
import npcClerkUrl from '../assets/images/npc_clerk_sprite_1795121201318.jpg';
import npcDjUrl from '../assets/images/npc_dj_skin_1795049132367.jpg';
import npcGirlUrl from '../assets/images/npc_girl_skin_1795049131974.jpg';
import npcVendorUrl from '../assets/images/npc_vendor_sprite_1795121208248.jpg';
import s4ArielAdultUrl from '../assets/images/s4_ariel_adult_sprite_1795202479243.jpg';
import s4ArielAdultWalkSheetUrl from '../assets/images/s4_ariel_adult_walk_sheet.png';
import s4BarManDrunkWalkSheetUrl from '../assets/images/s4_bar_man_drunk_walk_sheet.png';
import s4Cristian5yoUrl from '../assets/images/s4_cristian_5yo_sprite_1795202486514.jpg';
import s4Cristian7yoUrl from '../assets/images/s4_cristian_7yo_sprite_1795202453105.jpg';
import s4CristianBabyWalkSheetUrl from '../assets/images/s4_cristian_baby_sleeping_walk_sheet.png';
import s4CristianToddlerUrl from '../assets/images/s4_cristian_toddler_sprite_1795202457641.jpg';
import s4BicycleCoupleWalkSheetUrl from '../assets/images/s4_bicycle_couple_walk_sheet.png';
import s4GraziAdultUrl from '../assets/images/s4_grazi_adult_sprite_1795202450326.jpg';
import s4GraziAdultWalkSheetUrl from '../assets/images/s4_grazi_adult_walk_sheet.png';
import s4GraziArielPregnantHandholdWalkSheetUrl from '../assets/images/s4_grazi_ariel_pregnant_handhold_walk_sheet.png';
import s4GraziPregnantWalkSheetUrl from '../assets/images/s4_grazi_pregnant_walk_sheet_from_reference.png';
import s4MotherInLawUrl from '../assets/images/s4_mother_in_law_sprite.png';
import s4NaniUrl from '../assets/images/s4_nani_sprite_1795209660137.jpg';
import s4PregnancyEmbraceUrl from '../assets/images/s4_pregnancy_reveal_embrace.jpg';
import arielLigacaoSheetUrl from '../assets/images/ariel_ligacao_sheet.png';
import graziLigacaoSheetUrl from '../assets/images/grazi_ligacao_sheet.png';
import s5Cristian7yoPerfilUrl from '../assets/images/s5_cristian_7yo_perfil_1795404680160.jpg';
import s5Cristian7yoWalkSheetUrl from '../assets/images/s5_cristian_7yo_walk_sheet.png';
import s5CristianKarateWalkSheetUrl from '../assets/images/s5_cristian_karate_walk_sheet.png';
import s5CristianKarateKataSheetUrl from '../assets/images/s5_cristian_karate_kata_sheet.png';
import s5LaraBabySheetUrl from '../assets/images/s5_lara_baby_sheet.png';
import s5Lara2yoWalkSheetUrl from '../assets/images/s5_lara_2yo_walk_sheet.png';
import s5Lara2yoDanceSheetUrl from '../assets/images/s5_lara_2yo_dance_sheet.png';
import s5Lucas5yoWalkSheetUrl from '../assets/images/s5_lucas_5yo_walk_sheet.png';
import s6ArielAniversarioSheetUrl from '../assets/images/s6_ariel_aniversario_sheet.png';
import s6ArielAtualWalkSheetUrl from '../assets/images/s6_ariel_atual_walk_sheet.png';
import s6ArielDesanimoSheetUrl from '../assets/images/s6_ariel_desanimo_sheet.png';
import s6ArielPiaSheetUrl from '../assets/images/s6_ariel_pia_sheet.png';
import s6ArielPoolSheetUrl from '../assets/images/s6_ariel_piscina_sheet.png';
import s6ArielVideogameSheetUrl from '../assets/images/s6_ariel_videogame_sheet.png';
import s6Cris12yoPoolSheetUrl from '../assets/images/s6_cris_12yo_piscina_sheet.png';
import s6Cris12yoWalkSheetUrl from '../assets/images/s6_cris_12yo_walk_sheet.png';
import s6Cris19yoVideogameSheetUrl from '../assets/images/s6_cris_19yo_videogame_sheet.png';
import s6CrisAdultoAniversarioSheetUrl from '../assets/images/s6_cris_adulto_aniversario_sheet.png';
import s6GraziAniversarioSheetUrl from '../assets/images/s6_grazi_aniversario_sheet.png';
import s6GraziAtualWalkSheetUrl from '../assets/images/s6_grazi_46_walk_sheet.png';
import s6GraziPoolSheetUrl from '../assets/images/s6_grazi_piscina_sheet.png';
import s6GraziVideogameSheetUrl from '../assets/images/s6_grazi_videogame_sheet.png';
import s6Lara15yoVideogameSheetUrl from '../assets/images/s6_lara_15yo_videogame_sheet.png';
import s6Lara5yoPoolSheetUrl from '../assets/images/s6_lara_5yo_piscina_sheet.png';
import s6Lara5yoWalkSheetUrl from '../assets/images/s6_lara_5yo_walk_sheet.png';
import s6LaraAdultaAniversarioSheetUrl from '../assets/images/s6_lara_adulta_aniversario_sheet.png';
import s6ManuAniversarioSheetUrl from '../assets/images/s6_manu_aniversario_sheet.png';
import s6MarquinhoAniversarioSheetUrl from '../assets/images/s6_marquinho_aniversario_sheet.png';
import {
  type ProcessedSprite,
  getCachedTransparentSprite,
  loadTransparentSprite,
} from './spriteSheet';

export const STAGE4_MOTHER_IN_LAW_SKIN_URL: string = s4MotherInLawUrl;

export const SKIN_URLS = {
  graziFront: graziFrontUrl,
  graziBack: graziBackUrl,
  graziSide: graziShyUrl,
  graziAmused: graziAmusedUrl,
  graziShy: graziShyUrl,

  arielFront: arielFrontUrl,
  arielCapDance: arielCapDanceUrl,
  arielSide: arielSideUrl,
  arielJealous: arielJealousUrl,

  lauraFront: lauraFrontUrl,
  lauraSide: lauraSideUrl,
  eloisaFront: eloisaFrontUrl,

  juniorFront: juniorFrontUrl,
  npcGirl: npcGirlUrl,
  npcDj: npcDjUrl,
  npcBboy: npcBboyUrl,

  coupleDanceCenter: coupleDanceCenterUrl,
  coupleDanceLeft: coupleDanceLeftUrl,
  coupleDanceRight: coupleDanceRightUrl,
  coupleKissGaze: coupleKissGazeUrl,
  coupleKissLean: coupleKissLeanUrl,
  coupleKissContact: coupleKissContactUrl,

  // Stage 2 bespoke animated cutscene & breakdance sprites
  graziFriendDanceLeft: graziFriendDanceLeftUrl,
  graziFriendDanceRight: graziFriendDanceRightUrl,
  arielEloisaDanceLeft: arielEloisaDanceLeftUrl,
  arielEloisaDanceRight: arielEloisaDanceRightUrl,
  coupleForeheadKiss: coupleForeheadKissUrl,
  bboyFootwork: bboyFootworkUrl,
  bboyWindmill: bboyWindmillUrl,
  bboyFreeze: bboyFreezeUrl,

  // Stage 3: Dessa Vez, Pra Ficar (Léo, moving day, couple walk & neighborhood NPCs)
  leoFront: leoFrontUrl,
  arielCarryBox: arielCarryBoxUrl,
  leoCarryBox: leoCarryBoxUrl,
  graziArielWalkTogether: graziArielWalkTogetherUrl,
  npcVendor: npcVendorUrl,
  npcClerk: npcClerkUrl,

  // Stage 4: Nossa Pequena Grande Aventura (young-adult Ariel/Grazi, madrinha Nani + Cristian's growth stages)
  s4ArielAdult: s4ArielAdultUrl,
  s4GraziAdult: s4GraziAdultUrl,
  s4PregnancyEmbrace: s4PregnancyEmbraceUrl,
  s4Nani: s4NaniUrl,
  s4CristianToddler: s4CristianToddlerUrl,
  s4Cristian5yo: s4Cristian5yoUrl,
  s4Cristian7yo: s4Cristian7yoUrl,
  s5Cristian7yoPerfil: s5Cristian7yoPerfilUrl,
} as const;

const ALL_SKIN_URLS: string[] = Object.values(SKIN_URLS);
const initiatedLoads = new Set<string>();
const WALK_SHEET_URLS = {
  grazi: graziWalkSheetUrl,
  laura: lauraWalkSheetUrl,
  lauraBack: lauraBackWalkSheetUrl,
  ariel: arielWalkSheetUrl,
  eloisa: eloisaWalkSheetUrl,
  arielEloisa: arielEloisaWalkSheetUrl,
  arielLauraCouple: arielLauraWalkSheetUrl,
  graziAriel: graziArielWalkSheetUrl,
  barMan: s4BarManDrunkWalkSheetUrl,
  s4PregnantCouple: s4GraziArielPregnantHandholdWalkSheetUrl,
  s4ArielAdultWalk: s4ArielAdultWalkSheetUrl,
  s4GraziAdultWalk: s4GraziAdultWalkSheetUrl,
  s4CristianBaby: s4CristianBabyWalkSheetUrl,
  s4BicycleCouple: s4BicycleCoupleWalkSheetUrl,
  lauraLeoCouple: lauraLeoWalkTogetherUrl,
  leo: leoWalkSheetUrl,
  s5Cristian7yoWalk: s5Cristian7yoWalkSheetUrl,
  s5CristianKarateWalk: s5CristianKarateWalkSheetUrl,
  s5CristianKarateKata: s5CristianKarateKataSheetUrl,
  s5LaraBaby: s5LaraBabySheetUrl,
  s5Lara2yoWalk: s5Lara2yoWalkSheetUrl,
  s5Lara2yoDance: s5Lara2yoDanceSheetUrl,
  s5Lucas5yoWalk: s5Lucas5yoWalkSheetUrl,
  s5GraziPhone: graziLigacaoSheetUrl,
  s5ArielPhone: arielLigacaoSheetUrl,
  s6Cris12yoWalk: s6Cris12yoWalkSheetUrl,
  s6Lara5yoWalk: s6Lara5yoWalkSheetUrl,
  s6ArielPool: s6ArielPoolSheetUrl,
  s6GraziPool: s6GraziPoolSheetUrl,
  s6Cris12yoPool: s6Cris12yoPoolSheetUrl,
  s6Lara5yoPool: s6Lara5yoPoolSheetUrl,
  s6GraziVideogame: s6GraziVideogameSheetUrl,
  s6ArielVideogame: s6ArielVideogameSheetUrl,
  s6Cris19yoVideogame: s6Cris19yoVideogameSheetUrl,
  s6Lara15yoVideogame: s6Lara15yoVideogameSheetUrl,
  s6ArielDesanimo: s6ArielDesanimoSheetUrl,
  s6ArielPia: s6ArielPiaSheetUrl,
  s6GraziAtualWalk: s6GraziAtualWalkSheetUrl,
  s6ArielAtualWalk: s6ArielAtualWalkSheetUrl,
  s6ArielBirthday: s6ArielAniversarioSheetUrl,
  s6GraziBirthday: s6GraziAniversarioSheetUrl,
  s6CrisAdultoBirthday: s6CrisAdultoAniversarioSheetUrl,
  s6LaraAdultaBirthday: s6LaraAdultaAniversarioSheetUrl,
  s6ManuBirthday: s6ManuAniversarioSheetUrl,
  s6MarquinhoBirthday: s6MarquinhoAniversarioSheetUrl,
} as const;
type WalkSheetCharacter = keyof typeof WALK_SHEET_URLS;
const walkSheetImages = new Map<WalkSheetCharacter, HTMLImageElement>();
let s4GraziPregnantWalkSheetImage: HTMLImageElement | null = null;

export function getCharacterWalkSheetImage(
  character: WalkSheetCharacter,
): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  const src = WALK_SHEET_URLS[character];
  if (!src) return null;
  let image = walkSheetImages.get(character);
  if (!image) {
    image = new Image();
    image.src = src;
    walkSheetImages.set(character, image);
  }
  return image.complete && image.naturalWidth > 0 ? image : null;
}

export function getGraziWalkSheetImage(): HTMLImageElement | null {
  return getCharacterWalkSheetImage('grazi');
}

export function getS4GraziPregnantWalkSheetImage(): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  if (!s4GraziPregnantWalkSheetImage) {
    s4GraziPregnantWalkSheetImage = new Image();
    s4GraziPregnantWalkSheetImage.src = s4GraziPregnantWalkSheetUrl;
  }
  return s4GraziPregnantWalkSheetImage.complete &&
    s4GraziPregnantWalkSheetImage.naturalWidth > 0
    ? s4GraziPregnantWalkSheetImage
    : null;
}

export function getSkinSprite(url: string): ProcessedSprite | null {
  if (typeof window === 'undefined') return null;
  const cached = getCachedTransparentSprite(url);
  if (cached) return cached;

  if (!initiatedLoads.has(url)) {
    initiatedLoads.add(url);
    void loadTransparentSprite(url).catch(() => {
      initiatedLoads.delete(url);
    });
  }
  return null;
}

export function preloadAllCharacterSkins(): void {
  if (typeof window === 'undefined') return;
  getCharacterWalkSheetImage('grazi');
  getCharacterWalkSheetImage('laura');
  getCharacterWalkSheetImage('lauraBack');
  getCharacterWalkSheetImage('ariel');
  getCharacterWalkSheetImage('eloisa');
  getCharacterWalkSheetImage('arielEloisa');
  getCharacterWalkSheetImage('arielLauraCouple');
  getCharacterWalkSheetImage('graziAriel');
  getCharacterWalkSheetImage('barMan');
  getCharacterWalkSheetImage('s4PregnantCouple');
  getCharacterWalkSheetImage('s4ArielAdultWalk');
  getCharacterWalkSheetImage('s4GraziAdultWalk');
  getCharacterWalkSheetImage('s4CristianBaby');
  getCharacterWalkSheetImage('s4BicycleCouple');
  getCharacterWalkSheetImage('lauraLeoCouple');
  getCharacterWalkSheetImage('leo');
  getCharacterWalkSheetImage('s5Cristian7yoWalk');
  getCharacterWalkSheetImage('s5CristianKarateWalk');
  getCharacterWalkSheetImage('s5CristianKarateKata');
  getCharacterWalkSheetImage('s5LaraBaby');
  getCharacterWalkSheetImage('s5Lara2yoWalk');
  getCharacterWalkSheetImage('s5Lara2yoDance');
  getCharacterWalkSheetImage('s5Lucas5yoWalk');
  getCharacterWalkSheetImage('s5GraziPhone');
  getCharacterWalkSheetImage('s5ArielPhone');
  getCharacterWalkSheetImage('s6Cris12yoWalk');
  getCharacterWalkSheetImage('s6Lara5yoWalk');
  getCharacterWalkSheetImage('s6ArielPool');
  getCharacterWalkSheetImage('s6GraziPool');
  getCharacterWalkSheetImage('s6Cris12yoPool');
  getCharacterWalkSheetImage('s6Lara5yoPool');
  getCharacterWalkSheetImage('s6GraziVideogame');
  getCharacterWalkSheetImage('s6ArielVideogame');
  getCharacterWalkSheetImage('s6Cris19yoVideogame');
  getCharacterWalkSheetImage('s6Lara15yoVideogame');
  getCharacterWalkSheetImage('s6ArielDesanimo');
  getCharacterWalkSheetImage('s6ArielPia');
  getCharacterWalkSheetImage('s6GraziAtualWalk');
  getCharacterWalkSheetImage('s6ArielAtualWalk');
  getCharacterWalkSheetImage('s6ArielBirthday');
  getCharacterWalkSheetImage('s6GraziBirthday');
  getCharacterWalkSheetImage('s6CrisAdultoBirthday');
  getCharacterWalkSheetImage('s6LaraAdultaBirthday');
  getCharacterWalkSheetImage('s6ManuBirthday');
  getCharacterWalkSheetImage('s6MarquinhoBirthday');
  getS4GraziPregnantWalkSheetImage();
  // Prioritize active-stage skins lazily via getSkinSprite() on first render;
  // gently trickle-preload remaining skins in background without blocking the main thread.
  let idx = 0;
  const step = () => {
    if (idx >= ALL_SKIN_URLS.length) return;
    const url = ALL_SKIN_URLS[idx++];
    if (!initiatedLoads.has(url)) {
      initiatedLoads.add(url);
      void loadTransparentSprite(url).catch(() => {
        initiatedLoads.delete(url);
      });
    }
    window.setTimeout(step, 120);
  };
  window.setTimeout(step, 800);
}
