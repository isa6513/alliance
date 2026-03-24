export function isPathActive(pathname: string, matchPaths: readonly string[]) {
  return matchPaths.some((path) => {
    if (path === "/" || path === "") {
      return pathname === "/" || pathname === "";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  });
}
