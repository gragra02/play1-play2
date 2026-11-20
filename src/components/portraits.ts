import arielNeutral from '../assets/images/ariel_portrait_preview_1795046475579.jpg';
import arielRomantic from '../assets/images/ariel_portrait_romantic_1795046775818.jpg';
import graziAmused from '../assets/images/grazi_portrait_amused_1795046770331.jpg';
import graziBlush from '../assets/images/grazi_portrait_blush_1795046769408.jpg';
import graziNeutral from '../assets/images/grazi_portrait_preview_1795046449545.jpg';
import graziSad from '../assets/images/grazi_portrait_sad_1795046769704.jpg';
import graziThought from '../assets/images/grazi_portrait_thought_1795046770467.jpg';
import juniorHappy from '../assets/images/junior_portrait_happy_1795046803274.jpg';
import lauraBlush from '../assets/images/laura_portrait_blush_1795046772758.jpg';
import lauraNeutral from '../assets/images/laura_portrait_preview_1795046468518.jpg';
import leoFriendly from '../assets/images/leo_portrait_v2_preview_1795097030570.jpg';
import bartenderPortrait from '../assets/images/portrait_bartender_cruzeiro_1795121206494.jpg';
import bboyTeenPortrait from '../assets/images/portrait_bboy_teen_1795121210579.jpg';
import clerkPortrait from '../assets/images/portrait_clerk_locadora_1795121205711.jpg';
import djPortrait from '../assets/images/portrait_dj_cruzeiro_1795121199715.jpg';
import friendPortrait from '../assets/images/portrait_friend_ariel_1795121288227.jpg';
import vendorPortrait from '../assets/images/portrait_vendor_hotdog_1795121345592.jpg';
import s4ArielAdultPortrait from '../assets/images/s4_ariel_adult_portrait_1795202451569.jpg';
import s4CristianPortrait from '../assets/images/s4_cristian_portrait_1795202451565.jpg';
import s4GraziAdultPortrait from '../assets/images/s4_grazi_adult_portrait_1795202462554.jpg';
import s4NaniPortrait from '../assets/images/s4_nani_sprite_1795209660137.jpg';
import type { CharacterEmotion, SpeakerId } from '../game/types';

export const TITLE_PORTRAITS = {
  grazi: graziNeutral,
  ariel: arielNeutral,
} as const;

export function getCharacterPortraitSrc(
  speaker: SpeakerId,
  emotion?: CharacterEmotion,
): string | null {
  if (speaker === 'grazi_adult') {
    return s4GraziAdultPortrait;
  }

  if (speaker === 'ariel_adult') {
    return s4ArielAdultPortrait;
  }

  if (speaker === 'cristian') {
    return s4CristianPortrait;
  }

  if (speaker === 'nani') {
    return s4NaniPortrait;
  }

  if (speaker === 'bar_man') {
    return vendorPortrait;
  }

  if (speaker === 'grazi' || speaker === 'grazi_thought') {
    const emo = emotion ?? (speaker === 'grazi_thought' ? 'thoughtful' : 'neutral');
    if (emo === 'blush' || emo === 'romantic') return graziBlush;
    if (emo === 'sad' || emo === 'uneasy') return graziSad;
    if (emo === 'thoughtful' || emo === 'determined') return graziThought;
    if (emo === 'amused' || emo === 'surprised') return graziAmused;
    return graziNeutral;
  }

  if (speaker === 'ariel') {
    if (emotion === 'romantic' || emotion === 'blush') return arielRomantic;
    return arielNeutral;
  }

  if (speaker === 'laura') {
    if (emotion === 'blush' || emotion === 'romantic') return lauraBlush;
    return lauraNeutral;
  }

  if (speaker === 'junior') {
    return juniorHappy;
  }

  if (speaker === 'leo') {
    return leoFriendly;
  }

  if (speaker === 'vendor') {
    return vendorPortrait;
  }

  if (speaker === 'clerk') {
    return clerkPortrait;
  }

  if (speaker === 'dj') {
    return djPortrait;
  }

  if (speaker === 'bartender') {
    return bartenderPortrait;
  }

  if (speaker === 'friend') {
    return friendPortrait;
  }

  if (speaker === 'bboy' || speaker === 'teen_group') {
    return bboyTeenPortrait;
  }

  return null;
}
