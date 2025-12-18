import {
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository as TypeOrmRepository,
  FindManyOptions,
  ObjectId,
  FindOneOptions,
  RemoveOptions,
} from 'typeorm';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyObject = {};

/**
 * `Object` refers to a `Record`.
 *
 * @param T - The type that is potentially an `Object`
 * @returns `T` if `T` is an `Object`. Otherwise `never`.
 */
type PlainObject<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [T] extends [Array<any>]
    ? never
    : // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      [T] extends [Function]
      ? never
      : [T] extends [Buffer]
        ? never
        : [T] extends [Date]
          ? never
          : [T] extends [ObjectId]
            ? never
            : [T] extends [object]
              ? T
              : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _typecheck_PlainObject =
  | Assert<Equal<PlainObject<number[]>, never>>
  | Assert<Equal<PlainObject<{ param: string }[]>, never>>
  | Assert<Equal<PlainObject<() => void>, never>>
  | Assert<Equal<PlainObject<Buffer>, never>>
  | Assert<Equal<PlainObject<Date>, never>>
  | Assert<Equal<PlainObject<ObjectId>, never>>
  | Assert<Equal<PlainObject<{ param: string }>, { param: string }>>
  | Assert<Equal<PlainObject<string>, never>>
  | Assert<Equal<PlainObject<number>, never>>;

/**
 * A type is "relationable" if it is an `Object`, a `Promise<Object>` or an
 * `Array<Object>` (or some combination of `Promise` and `Array`).
 *
 * @param T - The type to check for relationability.
 * @returns The innermost `Object` type or `never` if `T` is not relationable.
 */
type Relationable<T> = [T] extends [Promise<infer I>]
  ? Relationable<NonNullable<I>>
  : [T] extends [Array<infer I>]
    ? Relationable<NonNullable<I>>
    : PlainObject<T>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _typecheck_Relationable =
  | Assert<Equal<Relationable<string>, never>>
  | Assert<Equal<Relationable<number | undefined>, never>>
  | Assert<Equal<Relationable<{ param: string } | undefined>, never>>
  | Assert<Equal<Relationable<{ param: string }>, { param: string }>>
  | Assert<Equal<Relationable<string[]>, never>>
  | Assert<Equal<Relationable<{ param: string }[]>, { param: string }>>
  | Assert<Equal<Relationable<Promise<{ param: string }>>, { param: string }>>;

type StripItems<T> = {
  [K in keyof T as [T[K]] extends [never]
    ? never
    : [T[K]] extends [undefined]
      ? never
      : K]: T[K];
} & {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _typecheck_StripItems =
  | Assert<Equal<StripItems<{ param: string }>, { param: string }>>
  | Assert<
      Equal<
        StripItems<{ param?: { subparam: string } }>,
        { param?: { subparam: string } }
      >
    >
  | Assert<Equal<StripItems<{ param: never }>, EmptyObject>>
  | Assert<Equal<StripItems<{ param: undefined }>, EmptyObject>>
  | Assert<Equal<StripItems<{ param?: never }>, EmptyObject>>
  | Assert<Equal<StripItems<{ param?: undefined }>, EmptyObject>>
  | Assert<Equal<StripItems<{ param?: null }>, { param?: null }>>
  | Assert<
      Equal<
        StripItems<{ param1?: string; param2: number; param3: never }>,
        { param1?: string; param2: number }
      >
    >
  | never;

/**
 * @param T - The type to check for emptiness
 * @param Default - The default value to return if `T` is empty
 *
 * @returns `Default` if, `T` is `{}`. Otherwise `T`.
 */
type NonEmpty<T, Default = never> = [keyof T] extends [never] ? Default : T;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _typecheck_NonEmpty =
  | Assert<Equal<NonEmpty<EmptyObject, { test: 123 }>, { test: 123 }>>
  | Assert<Equal<NonEmpty<EmptyObject>, never>>
  | Assert<Equal<NonEmpty<{ param: string }>, { param: string }>>;

type Prev = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * The value of the {@link Relations} record.
 *
 * @param T - The type to convert to the `RelationsProperty`
 * @param Seen - The type to check for recursion
 * @returns `never` if `T` is not {@link Relationable}. Otherwise `true` (or a
 * recursive `Relations` type).
 */
type RelationsProperty<T, D extends number = 9> = D extends 0
  ? never
  : [T] extends [never]
    ? never
    : [T] extends [Promise<infer I>]
      ? RelationsProperty<NonNullable<I>, D> | true
      : [T] extends [Array<infer I>]
        ? RelationsProperty<NonNullable<I>, D> | true
        : [T] extends [PlainObject<T>]
          ? Relations<T, Prev[D]> | true
          : never;

/**
 * The `Relations` record.
 *
 * @param Entity - The type to convert to the `Relations` record
 */
export type Relations<Entity, D extends number = 9> = NonEmpty<
  StripItems<{
    [K in keyof Entity]?: RelationsProperty<
      Relationable<NonNullable<Entity[K]>>,
      D
    >;
  }>,
  true | undefined
>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _typecheck_Relations =
  | Assert<Equal<Relations<{ param: string }>, true | undefined>>
  | Assert<Equal<Relations<{ param: number[] }>, true | undefined>>
  | Assert<Equal<Relations<{ param: Date }>, true | undefined>>
  | Assert<
      Equal<
        Relations<{ param: { subparam: string } }>,
        { param?: true | undefined }
      >
    >
  | Assert<
      Equal<
        Relations<{ param: { subparam: string }[] }>,
        { param?: true | undefined }
      >
    >
  | Assert<
      Equal<
        Relations<{ param: Promise<{ subparam: string }> }>,
        { param?: true | undefined }
      >
    >
  | Assert<
      Equal<
        Relations<{ param: { subparam: { subsubparam: string } } }>,
        { param?: true | undefined | { subparam?: true | undefined } }
      >
    >
  | Assert<
      Equal<
        Relations<{
          param1: string;
          param2: { subparam: string };
          param3: { subparam: { subsubparam: string } };
        }>,
        {
          param2?: true | undefined;
          param3?: true | undefined | { subparam?: true | undefined };
        }
      >
    >;

type StripRelationFields<T> = StripItems<{
  [K in keyof T]: [Relationable<NonNullable<T[K]>>] extends [never]
    ? NoRelations<T[K]>
    : never;
}>;
export type NoRelations<T> = [T] extends [Promise<infer I>]
  ? Promise<StripRelationFields<I>>
  : [T] extends [Array<infer I>]
    ? StripRelationFields<I>[]
    : // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      [T] extends [Function]
      ? T
      : [T] extends [Buffer]
        ? T
        : [T] extends [Date]
          ? T
          : [T] extends [ObjectId]
            ? T
            : [T] extends [object]
              ? StripRelationFields<T>
              : T;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _typecheck_NoRelations =
  | Assert<Equal<NoRelations<{ param: string }>, { param: string }>>
  | Assert<Equal<NoRelations<{ param?: number }>, { param?: number }>>
  | Assert<Equal<NoRelations<{ param: null }>, EmptyObject>>
  | Assert<Equal<NoRelations<{ param: { subparam: string } }>, EmptyObject>>
  | Assert<Equal<NoRelations<{ param?: { subparam: string } }>, EmptyObject>>
  | Assert<Equal<NoRelations<{ param: { subparam: string }[] }>, EmptyObject>>
  | Assert<
      Equal<NoRelations<{ param: { subparam: string }[] | null }>, EmptyObject>
    >
  | Assert<
      Equal<
        NoRelations<{ param: ({ subparam: string } | null)[] }>,
        EmptyObject
      >
    >
  | Assert<
      Equal<NoRelations<{ param: Promise<{ subparam: string }> }>, EmptyObject>
    >
  | Assert<
      Equal<
        NoRelations<{ param: Promise<{ subparam: string } | null> }>,
        EmptyObject
      >
    >
  | Assert<
      Equal<
        NoRelations<{ param: Promise<{ subparam: string }> | null }>,
        EmptyObject
      >
    >;

export type WithRelations<Entity, R extends Relations<Entity>> = StripItems<
  NoRelations<Entity> & {
    [K in keyof Entity as K extends keyof R ? K : never]: K extends keyof R
      ? [R[K]] extends [undefined]
        ? never
        : [K] extends [keyof Entity]
          ? [R[K]] extends [true]
            ?
                | NoRelations<NonNullable<Entity[K]>>
                | (Entity[K] & null)
                | (Entity[K] & undefined)
            : NonNullable<Entity[K]> extends Array<infer I>
              ? R[K] extends Relations<I>
                ?
                    | WithRelations<I, R[K]>[]
                    | (Entity[K] & null)
                    | (Entity[K] & undefined)
                : never
              : NonNullable<Entity[K]> extends Promise<infer I>
                ? R[K] extends Relations<I>
                  ?
                      | Promise<WithRelations<I, R[K]>>
                      | (Entity[K] & null)
                      | (Entity[K] & undefined)
                      | 1234
                  : never
                : R[K] extends Relations<NonNullable<Entity[K]>>
                  ?
                      | WithRelations<NonNullable<Entity[K]>, R[K]>
                      | (Entity[K] & null)
                      | (Entity[K] & undefined)
                  : never
          : never
      : never;
  }
>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _typecheck_WithRelations =
  | Assert<
      Equal<
        WithRelations<
          {
            param: string;
          },
          undefined
        >,
        { param: string }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param?: number;
          },
          undefined
        >,
        { param?: number }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param: { subparam: string };
          },
          EmptyObject
        >,
        EmptyObject
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param: { subparam: string };
          },
          { param: undefined }
        >,
        EmptyObject
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param: { subparam: string };
          },
          { param: true }
        >,
        { param: { subparam: string } }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param?: { subparam: string };
          },
          { param: true }
        >,
        { param?: { subparam: string } }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param: { subparam: string }[];
          },
          { param: true }
        >,
        { param: { subparam: string }[] }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param?: { subparam: string }[];
          },
          { param: true }
        >,
        { param?: { subparam: string }[] }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param?: ({ subparam: string } | null)[];
          },
          { param: true }
        >,
        { param?: ({ subparam: string } | null)[] }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param: Promise<{ subparam: string }>;
          },
          { param: true }
        >,
        { param: Promise<{ subparam: string }> }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param?: Promise<{ subparam: string }>;
          },
          { param: true }
        >,
        { param?: Promise<{ subparam: string }> }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param?: Promise<{ subparam: string } | null>;
          },
          { param: true }
        >,
        { param?: Promise<{ subparam: string } | null> }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param: { subparam: string; subparam2: { subsubparam: string } };
          },
          { param: true }
        >,
        { param: { subparam: string } }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param: { subparam: string; subparam2: { subsubparam: string } };
          },
          { param: { subparam2: undefined } }
        >,
        { param: { subparam: string } }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          {
            param: { subparam: string; subparam2: { subsubparam: string } };
          },
          { param: { subparam2: true } }
        >,
        { param: { subparam: string; subparam2: { subsubparam: string } } }
      >
    >
  | Assert<
      Equal<
        WithRelations<
          { param?: { subparam1: string; subparam2: { subsubparam: string } } },
          { param: true }
        >,
        { param?: { subparam1: string } }
      >
    >;

export class Repository<
  Entity extends ObjectLiteral,
> extends TypeOrmRepository<Entity> {
  constructor(
    target: EntityTarget<Entity>,
    manager: EntityManager,
    queryRunner?: QueryRunner,
  ) {
    super(target, manager, queryRunner);
  }

  /** @deprecated use {@link findTyped} instead */
  find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    return super.find(options);
  }
  findTyped<R extends Relations<Entity>>(
    options: FindManyOptions<Entity> & { relations?: R },
  ): Promise<WithRelations<Entity, R>[]> {
    return super.find(options) as unknown as Promise<
      WithRelations<Entity, R>[]
    >;
  }

  /** @deprecated use {@link findOneTyped} instead */
  findOne(options: FindOneOptions<Entity>): Promise<Entity | null> {
    return super.findOne(options);
  }
  findOneTyped<R extends Relations<Entity>>(
    options: FindOneOptions<Entity> & { relations?: R },
  ): Promise<WithRelations<Entity, R> | null> {
    return super.findOne(options) as unknown as Promise<WithRelations<
      Entity,
      R
    > | null>;
  }

  /** @deprecated use {@link findOneOrFailTyped} instead */
  findOneOrFail(options: FindOneOptions<Entity>): Promise<Entity> {
    return super.findOneOrFail(options);
  }
  findOneOrFailTyped<R extends Relations<Entity>>(
    options: FindOneOptions<Entity> & { relations?: R },
  ): Promise<WithRelations<Entity, R>> {
    return super.findOneOrFail(options) as unknown as Promise<
      WithRelations<Entity, R>
    >;
  }

  removeTyped(
    entities: NoRelations<Entity>[],
    options?: RemoveOptions,
  ): Promise<Entity[]>;
  removeTyped(
    entities: NoRelations<Entity>,
    options?: RemoveOptions,
  ): Promise<Entity>;

  removeTyped(
    entities: NoRelations<Entity>[] | NoRelations<Entity>,
    options?: RemoveOptions,
  ): Promise<Entity[]> | Promise<Entity> {
    if (Array.isArray(entities)) {
      return super.remove(entities as Entity[], options);
    }
    return super.remove(entities as Entity, options);
  }
}
