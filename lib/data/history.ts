/**
 * When each signal first crossed its breakout threshold, in days before today.
 *
 * This is the one seeded number the history view needs. Everything else on the
 * History tab — the value then, the value now, the change since, the stage — is
 * computed from the signal's own interest curve, so replacing this map with
 * stored daily observations from the live pipeline is the whole migration.
 *
 * Values must stay under {@link HISTORY_DAYS} so a flagged date always falls
 * inside the reconstructed curve.
 */
export const FLAGGED_DAYS_AGO: Record<string, number> = {
  'sig-berlin-builder-nights': 4,
  'sig-x402': 5,
  'sig-padel-berlin': 6,
  'sig-anmeldung-termin': 7,
  'sig-voice-clone-podcast': 9,
  'sig-balatro-tracker': 11,
  'sig-mietspiegel-check': 12,
  'sig-mouth-taping': 13,
  'sig-cortisol-face': 16,
  'sig-wohnung-mappe': 18,
  'sig-ugc-script': 19,
  'sig-freelancer-steuer': 21,
  'sig-notion-voice': 23,
  'sig-interrail': 27,
  'sig-protein-ice-cream': 31,
  'sig-creatine-gummies': 34,
  'sig-faceless-youtube': 38,
  'sig-kita-gutschein': 41,
  'sig-silent-air-fryer': 43,
  'sig-sourdough-kit': 47,
  'sig-steam-deck-dock': 52,
  'sig-cold-plunge': 58,
  'sig-balkonkraftwerk': 63,
  'sig-berghain-guide': 66,
  'sig-dog-dna': 69,
  'sig-japan-nomad': 74,
  'sig-cat-fountain': 79,
  'sig-depot-alternative': 84,
};

/** Used when a signal has no recorded breakout date yet. */
export const DEFAULT_FLAGGED_DAYS_AGO = 14;
