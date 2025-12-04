export type Ty<T> = T;

type Level1<T> = keyof T & string;

type Level2<T> = {
  [K in keyof T & string]: T[K] extends (infer U)[]
    ? `${K}.${Extract<keyof U, string>}`
    : T[K] extends object
      ? `${K}.${Extract<keyof T[K], string>}`
      : never;
}[keyof T & string];

export type RelationString<T> = Level1<T> | Level2<T>;
