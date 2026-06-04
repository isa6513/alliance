/** Shared width + horizontal padding for prelaunch-style landing content. */
export const LANDING_MAIN_COL =
  "mx-auto w-full max-w-5xl px-4 sm:px-10 lg:px-16";
/** Wider column for hero + quote cards so they use more of the viewport. */
export const LANDING_QUOTES_COL =
  "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:max-w-[90rem] lg:px-10";

export const LANDING_SECTION_GAP = "flex flex-col gap-y-6 lg:gap-y-8";
/** Same max-width + inner stack gap; vertical rhythm between blocks uses `space-y` on the parent. */
export const LANDING_SECTION = `${LANDING_MAIN_COL} ${LANDING_SECTION_GAP}`;
/** Wider section column for grids and directory-style content. */
export const LANDING_WIDE_SECTION = `${LANDING_QUOTES_COL} ${LANDING_SECTION_GAP}`;
export const LANDING_PAGE_STACK = "flex flex-col";

export const LANDING_SECTION_PY = "py-12 md:py-16 lg:py-24";

export const SECTION_TITLE_CLASS = "text-title-large w-full text-black";
export const SUBTITLE_CLASS = "text-lg text-zinc-900 lg:text-xl";
