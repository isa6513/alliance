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
type StripItems<T> = {
  [K in keyof T as [T[K]] extends [never]
    ? never
    : [T[K]] extends [undefined]
      ? never
      : K]: T[K];
} & {};

/**
 * @param T - The type to check for emptiness
 * @param Default - The default value to return if `T` is empty
 *
 * @returns `Default` if, `T` is `{}`. Otherwise `T`.
 */
type NonEmpty<T, Default = never> = [keyof T] extends [never] ? Default : T;

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
export type WithRelations<Entity, R extends Relations<Entity>> = NonEmpty<
  StripItems<
    NoRelations<Entity> & {
      [K in keyof R as [R[K]] extends [undefined] ? never : K]: [R[K]] extends [
        undefined,
      ]
        ? never
        : [K] extends [keyof Entity]
          ? [R[K]] extends [true]
            ? NoRelations<Entity[K]>
            : Entity[K] extends Array<infer I>
              ? R[K] extends Relations<I>
                ? WithRelations<I, R[K]>[]
                : never
              : Entity[K] extends Promise<infer I>
                ? R[K] extends Relations<I>
                  ? Promise<WithRelations<I, R[K]>>
                  : never
                : R[K] extends Relations<Entity[K]>
                  ? WithRelations<Entity[K], R[K]>
                  : never
          : never;
    }
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
