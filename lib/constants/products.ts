/**
 * Domestic listings store packaging as free text (no backend master — the
 * Import packaging master is feature-gated and Import-only), so this is a UI
 * option list, not Grade Master data.
 */
export const PACKAGING_TYPES = [
  "25 kg bags",
  "Jumbo bags",
  "Palletized bags",
] as const;

export const DEFAULT_PACKAGING_TYPE: string = PACKAGING_TYPES[0];

/** Keeps a legacy saved value selectable when it is not one of the presets. */
export const packagingOptions = (current?: string | null): string[] =>
  current && !(PACKAGING_TYPES as readonly string[]).includes(current)
    ? [...PACKAGING_TYPES, current]
    : [...PACKAGING_TYPES];
