/*
 * Only the *relative order* of these tiers matters — the concrete `z-*` values
 * are arbitrary. Feel free to renumber them (or insert a new tier between two
 * existing ones) as long as the ordering invariants above are preserved; every
 * consumer references the named tiers, not the raw numbers.
 */

/**
 * Web z-index scale — the single source of truth for stacking order across
 * `sharedweb`, `apps/frontend`, and `apps/admin`.
 *
 * Popovers/tooltips/dropdowns are routinely opened from inside a modal and
 * portal to `<body>`; at the modal's tier or below they'd render behind it (or
 * get clipped by its `overflow`). `toast` sits above everything.
 */
export const zIndex = {
  /** Normal in-flow content. */
  base: "z-0",
  /** Overlapping siblings, raised/sticky-in-flow cards. */
  raised: "z-10",
  /** Sticky headers, top nav, fixed app chrome. */
  nav: "z-20",
  /** Side drawers / slide-overs. */
  drawer: "z-30",
  /** Dialogs, modals, lightboxes, and their backdrops. */
  modal: "z-40",
  /** Below popovers. */
  popoverBackdrop: "z-50",
  /** Dropdowns, selects, hover cards, tooltips, context menus. */
  popover: "z-60",
  /** Toasts / notifications — always on top. */
  toast: "z-70",
} as const;

export type ZIndexTier = keyof typeof zIndex;
