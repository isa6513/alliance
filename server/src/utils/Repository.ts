/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Temporal } from '@js-temporal/polyfill';
import {
  ObjectLiteral,
  Repository as TypeOrmRepository,
  FindManyOptions,
  FindOneOptions,
  ObjectId,
} from 'typeorm';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

type NonRelationType =
  | string
  | number
  | boolean
  | Function
  | Buffer
  | Date
  | ObjectId
  | Temporal.PlainTime
  | Temporal.TimeZoneLike
  | Set<unknown>;
type NonNullableIsRelation<T> = [T] extends [never]
  ? false
  : [T] extends [Promise<infer I>]
    ? IsRelation<I>
    : [T] extends [Array<infer I>]
      ? IsRelation<I>
      : [T] extends [NonRelationType]
        ? false
        : true;
type IsRelation<T> = NonNullableIsRelation<NonNullable<T>>;
type _typecheck_IsRelation =
  | Assert<Equal<IsRelation<null>, false>>
  | Assert<Equal<IsRelation<string>, false>>
  | Assert<Equal<IsRelation<number>, false>>
  | Assert<Equal<IsRelation<boolean>, false>>
  | Assert<Equal<IsRelation<Function>, false>>
  | Assert<Equal<IsRelation<Buffer>, false>>
  | Assert<Equal<IsRelation<Date>, false>>
  | Assert<Equal<IsRelation<Set<number>>, false>>
  | Assert<Equal<IsRelation<ObjectId>, false>>
  | Assert<Equal<IsRelation<number | null>, false>>
  | Assert<Equal<IsRelation<number | undefined>, false>>
  | Assert<Equal<IsRelation<number | null | undefined>, false>>
  | Assert<Equal<IsRelation<{ param: string }>, true>>
  | Assert<Equal<IsRelation<{ param: number } | null>, true>>
  | Assert<Equal<IsRelation<{ param: number }[] | null>, true>>
  | Assert<Equal<IsRelation<({ param: number } | null)[]>, true>>
  | Assert<Equal<IsRelation<({ param: number } | null)[] | null>, true>>;

type $EagerEvaluation<T> =
  T extends Array<infer I>
    ? $EagerEvaluation<I>[]
    : T extends Promise<infer I>
      ? Promise<$EagerEvaluation<I>>
      : IsRelation<T> extends true
        ? {
            [K in keyof T as [T[K]] extends [never]
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
  | Assert<Equal<NoRelations<{ param: { subparam: string } }>, {}>>
  | Assert<Equal<NoRelations<{ param?: { subparam: string } }>, {}>>
  | Assert<Equal<NoRelations<{ param: { subparam: string }[] }>, {}>>
  | Assert<Equal<NoRelations<{ param: { subparam: string }[] | null }>, {}>>
  | Assert<
      Equal<
        NoRelations<{
          param: ({ subparam: string } | null)[];
        }>,
        {}
      >
    >
  | Assert<Equal<NoRelations<{ param: Promise<{ subparam: string }> }>, {}>>
  | Assert<
      Equal<
        NoRelations<{
          param: Promise<{ subparam: string } | null>;
        }>,
        {}
      >
    >
  | Assert<
      Equal<
        NoRelations<{
          param: Promise<{ subparam: string }> | null;
        }>,
        {}
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
    : never]: undefined;
};
type _typecheck_WithRelations =
  | Assert<
      Equal<
        $EagerEvaluation<
          WithRelations<
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
          WithRelations<
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
          WithRelations<
            {
              param: { subparam: string };
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
          WithRelations<
            {
              param: { subparam: string };
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
          WithRelations<
            {
              param: { subparam: string };
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
          WithRelations<
            {
              param?: { subparam: string };
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
          WithRelations<
            {
              param: { subparam: string }[];
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
          WithRelations<
            {
              param?: { subparam: string }[];
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
          WithRelations<
            {
              param?: ({ subparam: string } | null)[];
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
          WithRelations<
            {
              param: Promise<{ subparam: string }>;
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
          WithRelations<
            {
              param?: Promise<{ subparam: string }>;
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
          WithRelations<
            {
              param?: Promise<{ subparam: string } | null>;
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
          WithRelations<
            {
              param: {
                subparam: string;
                subparam2: { subsubparam: string };
              };
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
          WithRelations<
            {
              param: {
                subparam: string;
                subparam2: { subsubparam: string };
              };
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
          WithRelations<
            {
              param: {
                subparam: string;
                subparam2: { subsubparam: string };
              };
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
          WithRelations<
            {
              param?: {
                subparam1: string;
                subparam2: { subsubparam: string };
              };
            },
            { param: true }
          >
        >,
        { param: { subparam1: string; subparam2: undefined } }
      >
    >;

export type Repository<Entity extends ObjectLiteral> = Omit<
  TypeOrmRepository<Entity>,
  'find' | 'findOne' | 'findOneOrFail' | 'remove'
> & {
  find<R extends Relations<Entity>>(
    options: FindManyOptions<Entity> & { relations?: R },
  ): Promise<WithRelations<Entity, R>[]>;

  findOne<R extends Relations<Entity>>(
    options: FindOneOptions<Entity> & { relations?: R },
  ): Promise<WithRelations<Entity, R> | null>;

  findOneOrFail<R extends Relations<Entity>>(
    options: FindOneOptions<Entity> & { relations?: R },
  ): Promise<WithRelations<Entity, R>>;
};
