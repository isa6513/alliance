import {
  getFallbackVisiblePageIndex,
  getNextVisiblePageIndex,
  getPreviousVisiblePageIndex,
} from "./formrenderer";

describe("getNextVisiblePageIndex", () => {
  it("returns the first visible index after the current one", () => {
    expect(getNextVisiblePageIndex([0, 2, 5], 0)).toBe(2);
    expect(getNextVisiblePageIndex([0, 2, 5], 3)).toBe(5);
  });

  it("returns null when nothing is visible after the current index", () => {
    expect(getNextVisiblePageIndex([0, 2, 5], 5)).toBeNull();
    expect(getNextVisiblePageIndex([], 0)).toBeNull();
  });
});

describe("getPreviousVisiblePageIndex", () => {
  it("returns the last visible index before the current one", () => {
    expect(getPreviousVisiblePageIndex([0, 2, 5], 5)).toBe(2);
    expect(getPreviousVisiblePageIndex([0, 2, 5], 3)).toBe(2);
  });

  it("returns null when nothing is visible before the current index", () => {
    expect(getPreviousVisiblePageIndex([0, 2, 5], 0)).toBeNull();
    expect(getPreviousVisiblePageIndex([], 0)).toBeNull();
  });
});

describe("getFallbackVisiblePageIndex", () => {
  it("returns null when the current page is still visible", () => {
    expect(getFallbackVisiblePageIndex([0, 2, 5], 2)).toBeNull();
  });

  it("returns null when no page is visible", () => {
    expect(getFallbackVisiblePageIndex([], 3)).toBeNull();
  });

  it("prefers the nearest visible page forward", () => {
    expect(getFallbackVisiblePageIndex([0, 2, 5], 1)).toBe(2);
  });

  it("falls back to the closest visible page before when nothing is forward", () => {
    expect(getFallbackVisiblePageIndex([0, 2, 5], 6)).toBe(5);
  });
});
