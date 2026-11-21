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
import graziSideUrl from '../assets/images/grazi_skin_side_1795049133077.jpg';
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
import s4Cristian5yoUrl from '../assets/images/s4_cristian_5yo_sprite_1795202486514.jpg';
import s4Cristian7yoUrl from '../assets/images/s4_cristian_7yo_sprite_1795202453105.jpg';
import s4CristianBabyWalkSheetUrl from '../assets/images/s4_cristian_baby_sleeping_walk_sheet.png';
import s4CristianToddlerUrl from '../assets/images/s4_cristian_toddler_sprite_1795202457641.jpg';
import s4BicycleCoupleWalkSheetUrl from '../assets/images/s4_bicycle_couple_walk_sheet.png';
import s4GraziAdultUrl from '../assets/images/s4_grazi_adult_sprite_1795202450326.jpg';
import s4BarManDrunkWalkSheetUrl from '../assets/images/s4_bar_man_drunk_walk_sheet.png';
import s4GraziArielPregnantHandholdWalkSheetUrl from '../assets/images/s4_grazi_ariel_pregnant_handhold_walk_sheet.png';
import s4GraziPregnantWalkSheetUrl from '../assets/images/s4_grazi_pregnant_walk_sheet_from_reference.png';
import s4MotherInLawUrl from '../assets/images/s4_mother_in_law_sprite.png';
import s4NaniUrl from '../assets/images/s4_nani_sprite_1795209660137.jpg';
import s4PregnancyEmbraceUrl from '../assets/images/s4_pregnancy_reveal_embrace.jpg';
import {
  type ProcessedSprite,
  getCachedTransparentSprite,
  loadTransparentSprite,
} from './spriteSheet';

export const STAGE4_MOTHER_IN_LAW_SKIN_URL: string = s4MotherInLawUrl;

export const SKIN_URLS = {
  graziFront: graziFrontUrl,
  graziBack: graziBackUrl,
  graziSide: graziSideUrl,
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
  s4MotherInLaw: s4MotherInLawUrl,
  s4CristianToddler: s4CristianToddlerUrl,
  s4Cristian5yo: s4Cristian5yoUrl,
  s4Cristian7yo: s4Cristian7yoUrl,
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
  s4CristianBaby: s4CristianBabyWalkSheetUrl,
  s4BicycleCouple: s4BicycleCoupleWalkSheetUrl,
  lauraLeoCouple: lauraLeoWalkTogetherUrl,
  leo: leoWalkSheetUrl,
} as const;
type WalkSheetCharacter = keyof typeof WALK_SHEET_URLS;
const walkSheetImages = new Map<WalkSheetCharacter, HTMLImageElement>();
let s4GraziPregnantWalkSheetImage: HTMLImageElement | null = null;

export function getCharacterWalkSheetImage(
  character: WalkSheetCharacter,
): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  let image = walkSheetImages.get(character);
  if (!image) {
    image = new Image();
    image.src = WALK_SHEET_URLS[character];
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
  getCharacterWalkSheetImage('s4CristianBaby');
  getCharacterWalkSheetImage('s4BicycleCouple');
  getCharacterWalkSheetImage('lauraLeoCouple');
  getCharacterWalkSheetImage('leo');
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
