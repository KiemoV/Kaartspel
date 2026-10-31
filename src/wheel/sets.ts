import type { WheelSetId } from '../types/game'

/** Default wheel sets keyed by language. Custom sets are left as typed. */
export const WHEEL_SETS: Record<
  Exclude<WheelSetId, 'custom'>,
  { nl: string[]; en: string[] }
> = {
  challenges: {
    nl: [
      'Doe een dansje',
      'Vertel een geheim',
      'Imiteer iemand',
      'Zing een lied',
      'Push-ups ×10',
      'Gratis ronde',
    ],
    en: [
      'Do a dance',
      'Tell a secret',
      'Imitate someone',
      'Sing a song',
      '10 push-ups',
      'Free round',
    ],
  },
  drinks: {
    nl: [
      'Slok nemen',
      'Dubbele slok',
      'Uitdelen: 2 slokken',
      'Proost met buur',
      'Watertje (pauze)',
      'Jij kiest wie drinkt',
    ],
    en: [
      'Take a sip',
      'Double sip',
      'Give out 2 sips',
      'Cheers with neighbor',
      'Water break',
      'You pick who drinks',
    ],
  },
  nonalcoholic: {
    nl: [
      'Slok limonade',
      'Compliment geven',
      'High five rondje',
      'Raad een kaart',
      'Mini-pauze',
      'Kies de volgende muziek',
    ],
    en: [
      'Sip of lemonade',
      'Give a compliment',
      'High-five round',
      'Guess a card',
      'Mini break',
      'Pick the next song',
    ],
  },
}

export function resolveSegments(
  setId: WheelSetId,
  customSegments: string[],
  lang: 'nl' | 'en',
): string[] {
  if (setId === 'custom') {
    return customSegments.filter((s) => s.trim().length > 0)
  }
  return WHEEL_SETS[setId][lang]
}
