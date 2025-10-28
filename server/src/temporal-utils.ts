import { Temporal } from '@js-temporal/polyfill';
import { ValueTransformer } from 'typeorm';

export const PlainTimeTransformer: ValueTransformer = {
  to(value?: Temporal.PlainTime | null): string | null {
    if (!value) return null;
    return value.toString(); // 19:00:00
  },
  from(value?: string | null): Temporal.PlainTime | null {
    if (!value) return null;
    return Temporal.PlainTime.from(value);
  },
};

export const temporalPlainDateTransformer: ValueTransformer = {
  to(value?: Temporal.PlainDate): string | null {
    return value ? value.toString() : null;
  },
  from(value?: string): Temporal.PlainDate | null {
    return value ? Temporal.PlainDate.from(value) : null;
  },
};
