export type Ty<T> = T;

type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Date;
type Elem<T> = T extends (infer U)[] ? U : T;

type Dec<N extends number> = N extends 5
  ? 4
  : N extends 4
    ? 3
    : N extends 3
      ? 2
      : N extends 2
        ? 1
        : N extends 1
          ? 0
          : 0;

type Paths<T, Depth extends number = 4> = Depth extends 0
  ? never
  : T extends Primitive
    ? never
    : {
        [K in Extract<keyof T, string>]:
          | K
          | (Paths<Elem<T[K]>, Dec<Depth>> extends infer P
              ? P extends string
                ? `${K}.${P}`
                : never
              : never);
      }[Extract<keyof T, string>];

export type RelationString<T> = Paths<T>;
