export const GROUP_MAX_CAPACITY_DEFAULT = 10;

export const NAV_BAR_ICON_HEIGHT = 22;
export const NAV_BAR_CONTAINER_HEIGHT = 12;

export type NullReactNode = boolean | null | undefined;
export function isNullReactNode(node: unknown): node is NullReactNode {
  return node === true || node === false || node === null || node === undefined;
}

export function noop() {}
