/* eslint-disable @typescript-eslint/no-empty-object-type */
import {
  ObjectLiteral,
  type Repository as TypeOrmRepository,
  FindManyOptions,
  FindOneOptions,
} from 'typeorm';
import type { Assert, Equal, Extends } from '@alliance/common/types';

declare const relationBrand: unique symbol;
export type Relation<T> = T & { [relationBrand]?: undefined };

type NonNullableIsRelation<T> = [T] extends [never]
  ? false
  : [T] extends [Promise<infer I>]
    ? IsRelation<I>
    : [T] extends [Array<infer I>]
      ? IsRelation<I>
      : typeof relationBrand extends keyof T
        ? true
        : false;
export type IsRelation<T> = NonNullableIsRelation<NonNullable<T>>;
type _typecheck_IsRelation =
  | Assert<Equal<IsRelation<null>, false>>
  | Assert<Equal<IsRelation<string>, false>>
  | Assert<Equal<IsRelation<number>, false>>
  | Assert<Equal<IsRelation<boolean>, false>>
  | Assert<Equal<IsRelation<Date>, false>>
  | Assert<Equal<IsRelation<number | null>, false>>
  | Assert<Equal<IsRelation<number | undefined>, false>>
  | Assert<Equal<IsRelation<number | null | undefined>, false>>
  | Assert<Equal<IsRelation<{ param: string }>, false>>
  | Assert<Equal<IsRelation<{ param: string } | null>, false>>
  | Assert<Equal<IsRelation<{ param: string }[]>, false>>
  | Assert<Equal<IsRelation<{ theme: string; notifications: boolean }>, false>>
  | Assert<Equal<IsRelation<{ nested: { deep: number } }>, false>>
  | Assert<Equal<IsRelation<{ items: { id: string }[] }>, false>>
  | Assert<Equal<IsRelation<{ kind: 'a' } | { kind: 'b' }>, false>>
  | Assert<Equal<IsRelation<Record<string, number>>, false>>
  | Assert<Equal<IsRelation<Relation<{ param: string }>>, true>>
  | Assert<Equal<IsRelation<Relation<{ param: number }> | null>, true>>
  | Assert<Equal<IsRelation<Relation<{ param: number }>[] | null>, true>>
  | Assert<Equal<IsRelation<(Relation<{ param: number }> | null)[]>, true>>
  | Assert<
      Equal<IsRelation<(Relation<{ param: number }> | null)[] | null>, true>
    >;

type $EagerEvaluation<T> =
  T extends Array<infer I>
    ? $EagerEvaluation<I>[]
    : T extends Promise<infer I>
      ? Promise<$EagerEvaluation<I>>
      : T extends object
        ? {
            [K in keyof T as K extends typeof relationBrand
              ? never
              : [T[K]] extends [never]
                ? never
                : K]: $EagerEvaluation<T[K]>;
          }
        : T;
type _typecheck_StripItems =
  | Assert<Equal<$EagerEvaluation<{ param: string }>, { param: string }>>
  | Assert<
      Equal<
        $EagerEvaluation<{ param?: { subparam: string } }>,
        { param?: { subparam: string } }
      >
    >
  | Assert<Equal<$EagerEvaluation<{ param: never }>, {}>>
  | Assert<Equal<$EagerEvaluation<{ param: undefined }>, { param: undefined }>>
  | Assert<Equal<$EagerEvaluation<{ param?: never }>, { param?: never }>>
  | Assert<
      Equal<$EagerEvaluation<{ param?: undefined }>, { param?: undefined }>
    >
  | Assert<Equal<$EagerEvaluation<{ param?: null }>, { param?: null }>>
  | Assert<
      Equal<
        $EagerEvaluation<{ param1?: string; param2: number; param3: never }>,
        { param1?: string; param2: number }
      >
    >
  | Assert<
      Equal<$EagerEvaluation<Relation<{ param: string }>>, { param: string }>
    >
  | never;

/**
 * @param T - The type to check for emptiness
 * @param Default - The default value to return if `T` is empty
 *
 * @returns `Default` if, `T` is `{}`. Otherwise `T`.
 */
type NonEmpty<T, Default = never> = [keyof T] extends [never] ? Default : T;
type _typecheck_NonEmpty =
  | Assert<Equal<NonEmpty<{}, { test: 123 }>, { test: 123 }>>
  | Assert<Equal<NonEmpty<{}>, never>>
  | Assert<Equal<NonEmpty<{ param: string }>, { param: string }>>;

type RelationsProperty<Property> =
  Property extends Promise<infer I>
    ? RelationsProperty<NonNullable<I>>
    : Property extends Array<infer I>
      ? RelationsProperty<NonNullable<I>>
      : IsRelation<Property> extends false
        ? never
        : true | NonEmpty<Relations<Property>>;
export type Relations<Entity> = {
  [P in keyof Entity as IsRelation<Entity[P]> extends true
    ? P
    : never]?: RelationsProperty<NonNullable<Entity[P]>>;
};
type _typecheck_Relations =
  | Assert<Equal<Relations<{ param: string }>, {}>>
  | Assert<Equal<Relations<{ param: number[] }>, {}>>
  | Assert<Equal<Relations<{ param: Date }>, {}>>
  | Assert<Equal<Relations<{ param: { subparam: string } }>, {}>>
  | Assert<
      Equal<
        Relations<{ param: Relation<{ subparam: string }> }>,
        { param?: true | undefined }
      >
    >
  | Assert<
      Equal<
        Relations<{ param: Relation<{ subparam: string }>[] }>,
        { param?: true | undefined }
      >
    >
  | Assert<
      Equal<
        Relations<{ param: Promise<Relation<{ subparam: string }>> }>,
        { param?: true | undefined }
      >
    >
  | Assert<
      Equal<
        Relations<{
          param: Relation<{ subparam: Relation<{ subsubparam: string }> }>;
        }>,
        { param?: true | undefined | { subparam?: true | undefined } }
      >
    >
  | Assert<
      Equal<
        Relations<{
          param1: string;
          param2: Relation<{ subparam: string }>;
          param3: Relation<{ subparam: Relation<{ subsubparam: string }> }>;
        }>,
        {
          param2?: true | undefined;
          param3?: true | undefined | { subparam?: true | undefined };
        }
      >
    >
  | Assert<
      Equal<
        Relations<{
          settings: { theme: string; notifications: boolean };
          posts: Relation<{ id: number }>[];
        }>,
        { posts?: true | undefined }
      >
    >
  | Assert<
      Equal<
        Relations<{
          jsonbA: { a: string };
          jsonbB: { b: number }[];
          jsonbC: { c: { nested: boolean } } | null;
        }>,
        {}
      >
    >;

export type NoRelations<Entity> = {
  [K in keyof Entity as IsRelation<Entity[K]> extends false
    ? K
    : never]: IsRelation<Entity[K]> extends false ? Entity[K] : never;
};
type _typecheck_NoRelations =
  | Assert<Equal<NoRelations<{ param: string }>, { param: string }>>
  | Assert<Equal<NoRelations<{ param?: number }>, { param?: number }>>
  | Assert<Equal<NoRelations<{ param: null }>, { param: null }>>
  | Assert<Equal<NoRelations<{ param: string[] }>, { param: string[] }>>
  | Assert<
      Equal<
        NoRelations<{ param: (string | null)[] }>,
        { param: (string | null)[] }
      >
    >
  | Assert<
      Equal<
        NoRelations<{ param: { subparam: string } }>,
        { param: { subparam: string } }
      >
    >
  | Assert<Equal<NoRelations<{ param: Relation<{ subparam: string }> }>, {}>>
  | Assert<Equal<NoRelations<{ param?: Relation<{ subparam: string }> }>, {}>>
  | Assert<Equal<NoRelations<{ param: Relation<{ subparam: string }>[] }>, {}>>
  | Assert<
      Equal<NoRelations<{ param: Relation<{ subparam: string }>[] | null }>, {}>
    >
  | Assert<
      Equal<
        NoRelations<{
          param: (Relation<{ subparam: string }> | null)[];
        }>,
        {}
      >
    >
  | Assert<
      Equal<NoRelations<{ param: Promise<Relation<{ subparam: string }>> }>, {}>
    >
  | Assert<
      Equal<
        NoRelations<{
          param: Promise<Relation<{ subparam: string }> | null>;
        }>,
        {}
      >
    >
  | Assert<
      Equal<
        NoRelations<{
          param: Promise<Relation<{ subparam: string }>> | null;
        }>,
        {}
      >
    >
  | Assert<
      Equal<
        NoRelations<{ settings: { theme: string; notifications: boolean } }>,
        { settings: { theme: string; notifications: boolean } }
      >
    >
  | Assert<
      Equal<
        NoRelations<{
          settings: { theme: string };
          posts: Relation<{ id: number }>[];
        }>,
        { settings: { theme: string } }
      >
    >
  | Assert<
      Equal<
        NoRelations<{ items: { id: string; label: string }[] | null }>,
        { items: { id: string; label: string }[] | null }
      >
    >;

type ResolveRelationPropExact<Prop, R> =
  Prop extends Promise<infer I>
    ? Promise<
        ResolveRelationPropExact<NonNullable<I>, R> | (I & (null | undefined))
      >
    : Prop extends Array<infer I>
      ? Array<
          ResolveRelationPropExact<NonNullable<I>, R> | (I & (null | undefined))
        >
      : IsRelation<Prop> extends true
        ? R extends true
          ? WithRelationsExact<Prop, {}>
          : R extends Relations<Prop>
            ? WithRelationsExact<Prop, R>
            : never
        : never;
/**
 * The entity with the specified relations loaded and all other relations
 * forced to `undefined`. Use this as the return type of a method that loads
 * exactly the relations the caller asked for.
 *
 * Contrast with {@link WithRelations}, which leaves the unspecified relations optional.
 */
export type WithRelationsExact<
  Entity,
  R extends Relations<Entity>,
> = NoRelations<Entity> & {
  [K in keyof Entity as K extends keyof Relations<Entity>
    ? K extends keyof R
      ? R[K] extends undefined
        ? never
        : K
      : never
    : never]-?: K extends keyof R
    ?
        | ResolveRelationPropExact<NonNullable<Entity[K]>, R[K]>
        | (Entity[K] & null)
    : never;
} & {
  [K in keyof Entity as K extends keyof Relations<Entity>
    ? K extends keyof R
      ? R[K] extends undefined
        ? K
        : never
      : K
    : never]: undefined;
};
type _typecheck_WithRelationsExact =
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param: string;
            },
            {}
          >
        >,
        { param: string }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param?: number;
            },
            {}
          >
        >,
        { param?: number }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param: Relation<{ subparam: string }>;
            },
            {}
          >
        >,
        {
          param: undefined;
        }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param: Relation<{ subparam: string }>;
            },
            { param: undefined }
          >
        >,
        {
          param: undefined;
        }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param: Relation<{ subparam: string }>;
            },
            { param: true }
          >
        >,
        { param: { subparam: string } }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param?: Relation<{ subparam: string }>;
            },
            { param: true }
          >
        >,
        { param: { subparam: string } }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param: Relation<{ subparam: string }>[];
            },
            { param: true }
          >
        >,
        { param: { subparam: string }[] }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param?: Relation<{ subparam: string }>[];
            },
            { param: true }
          >
        >,
        { param: { subparam: string }[] }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param?: (Relation<{ subparam: string }> | null)[];
            },
            { param: true }
          >
        >,
        { param: ({ subparam: string } | null)[] }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param: Promise<Relation<{ subparam: string }>>;
            },
            { param: true }
          >
        >,
        { param: Promise<{ subparam: string }> }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param?: Promise<Relation<{ subparam: string }>>;
            },
            { param: true }
          >
        >,
        { param: Promise<{ subparam: string }> }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param?: Promise<Relation<{ subparam: string }> | null>;
            },
            { param: true }
          >
        >,
        { param: Promise<{ subparam: string } | null> }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param: Relation<{
                subparam: string;
                subparam2: Relation<{ subsubparam: string }>;
              }>;
            },
            { param: true }
          >
        >,
        { param: { subparam: string; subparam2: undefined } }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param: Relation<{
                subparam: string;
                subparam2: Relation<{ subsubparam: string }>;
              }>;
            },
            { param: { subparam2: undefined } }
          >
        >,
        { param: { subparam: string; subparam2: undefined } }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param: Relation<{
                subparam: string;
                subparam2: Relation<{ subsubparam: string }>;
              }>;
            },
            { param: { subparam2: true } }
          >
        >,
        { param: { subparam: string; subparam2: { subsubparam: string } } }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              param?: Relation<{
                subparam1: string;
                subparam2: Relation<{ subsubparam: string }>;
              }>;
            },
            { param: true }
          >
        >,
        { param: { subparam1: string; subparam2: undefined } }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              settings: { theme: string; notifications: boolean };
              posts: Relation<{ id: number; title: string }>[];
            },
            { posts: true }
          >
        >,
        {
          settings: { theme: string; notifications: boolean };
          posts: { id: number; title: string }[];
        }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelationsExact<
            {
              settings: { theme: string };
              posts: Relation<{ id: number }>[];
            },
            {}
          >
        >,
        { settings: { theme: string }; posts: undefined }
      >
    >;

type ResolveRelationProp<Prop, R> =
  Prop extends Promise<infer I>
    ? Promise<ResolveRelationProp<NonNullable<I>, R> | (I & (null | undefined))>
    : Prop extends Array<infer I>
      ? Array<ResolveRelationProp<NonNullable<I>, R> | (I & (null | undefined))>
      : IsRelation<Prop> extends true
        ? R extends true
          ? WithRelations<Prop, {}>
          : R extends Relations<Prop>
            ? WithRelations<Prop, R>
            : never
        : never;

/**
 * The entity with the specified relations required to be loaded, and all other
 * relations optionally loaded. Use this to type inputs of functions that
 * require certain relations but don't care whether additional ones are present.
 *
 * Contrast with {@link WithRelationsExact}, which requires all unspecified relations to be absent.
 */
export type WithRelations<
  Entity,
  R extends Relations<Entity>,
> = NoRelations<Entity> & {
  [K in keyof Entity as K extends keyof Relations<Entity>
    ? K extends keyof R
      ? R[K] extends undefined
        ? never
        : K
      : never
    : never]-?: K extends keyof R
    ? ResolveRelationProp<NonNullable<Entity[K]>, R[K]> | (Entity[K] & null)
    : never;
} & {
  [K in keyof Entity as K extends keyof Relations<Entity>
    ? K extends keyof R
      ? R[K] extends undefined
        ? K
        : never
      : K
    : never]?: Entity[K];
};
type _typecheck_WithRelations =
  | Assert<
      Equal<
        $EagerEvaluation<WithRelations<{ param: string }, {}>>,
        { param: string }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelations<{ param: Relation<{ subparam: string }> }, {}>
        >,
        { param?: { subparam: string } }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelations<
            { param: Relation<{ subparam: string }> },
            { param: true }
          >
        >,
        { param: { subparam: string } }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelations<
            {
              requiredRel: Relation<{ a: string }>;
              otherRel: Relation<{ b: number }>;
            },
            { requiredRel: true }
          >
        >,
        { requiredRel: { a: string }; otherRel?: { b: number } }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelations<
            {
              settings: { theme: string };
              posts: Relation<{ id: number }>[];
              tags: Relation<{ name: string }>[];
            },
            { posts: true }
          >
        >,
        {
          settings: { theme: string };
          posts: { id: number }[];
          tags?: { name: string }[];
        }
      >
    >
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelations<
            {
              param: Relation<{
                subparam: string;
                subRel: Relation<{ deep: number }>;
                subOther: Relation<{ extra: boolean }>;
              }>;
            },
            { param: { subRel: true } }
          >
        >,
        {
          param: {
            subparam: string;
            subRel: { deep: number };
            subOther?: { extra: boolean };
          };
        }
      >
    >
  // nullable relation: optional still preserves null
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelations<{ parent: Relation<{ id: number }> | null }, {}>
        >,
        { parent?: { id: number } | null }
      >
    >
  // WithRelationsExact<E, R> is assignable to WithRelations<E, R>:
  // the strict return type satisfies the loose input type
  | Assert<
      Extends<
        WithRelationsExact<
          {
            settings: { theme: string };
            posts: Relation<{ id: number }>[];
            tags: Relation<{ name: string }>[];
          },
          { posts: true }
        >,
        WithRelations<
          {
            settings: { theme: string };
            posts: Relation<{ id: number }>[];
            tags: Relation<{ name: string }>[];
          },
          { posts: true }
        >
      >
    >
  // and loading more than required still satisfies the loose input type
  | Assert<
      Extends<
        WithRelationsExact<
          {
            posts: Relation<{ id: number }>[];
            tags: Relation<{ name: string }>[];
          },
          { posts: true; tags: true }
        >,
        WithRelations<
          {
            posts: Relation<{ id: number }>[];
            tags: Relation<{ name: string }>[];
          },
          { posts: true }
        >
      >
    >;

export type Repository<Entity extends ObjectLiteral> = Omit<
  TypeOrmRepository<Entity>,
  'find' | 'findOne' | 'findOneOrFail'
> & {
  find<R extends Relations<Entity>>(
    options: FindManyOptions<Entity> & { relations?: R },
  ): Promise<WithRelationsExact<Entity, R>[]>;

  findOne<R extends Relations<Entity>>(
    options: FindOneOptions<Entity> & { relations?: R },
  ): Promise<WithRelationsExact<Entity, R> | null>;

  findOneOrFail<R extends Relations<Entity>>(
    options: FindOneOptions<Entity> & { relations?: R },
  ): Promise<WithRelationsExact<Entity, R>>;
};
