// display-blocks.ts
import { Condition } from './schema';

export type DisplayKind =
  | 'header' // H1–H6
  | 'text' // plain or markdown text
  | 'label' // small label/caption
  | 'divider' // horizontal rule
  | 'spacer' // vertical space
  | 'html' // controlled/allowlisted HTML snippet
  | 'image'; // decorative image

interface BaseBlock<TFieldIds extends string> {
  kind: DisplayKind;
  /** Optional: display blocks usually don’t need IDs, but you can keep one for analytics/testing */
  id?: string;
  visibleIf?: Condition<TFieldIds>;
  width?: 'full' | '1/2' | '1/3';
}

// Specific blocks

export type HeaderBlock<TFieldIds extends string> = BaseBlock<TFieldIds> & {
  kind: 'header';
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6; // default 2
};

export type TextBlock<TFieldIds extends string> = BaseBlock<TFieldIds> & {
  kind: 'text';
  text: string;
  markdown?: boolean; // default false
};

export type LabelBlock<TFieldIds extends string> = BaseBlock<TFieldIds> & {
  kind: 'label';
  text: string;
};

export type DividerBlock<TFieldIds extends string> = BaseBlock<TFieldIds> & {
  kind: 'divider';
  thickness?: 'hairline' | 'thin' | 'medium' | 'thick';
};

export type SpacerBlock<TFieldIds extends string> = BaseBlock<TFieldIds> & {
  kind: 'spacer';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
};

export type HtmlBlock<TFieldIds extends string> = BaseBlock<TFieldIds> & {
  kind: 'html';
  /** store a sanitized/whitelisted HTML snippet on the server */
  html: string;
};

export type ImageBlock<TFieldIds extends string> = BaseBlock<TFieldIds> & {
  kind: 'image';
  alt: string;
  src: string; // or { key: string } if you want S3 keys
  aspectRatio?: number; // e.g., 16/9
};

export type DisplayBlock<TFieldIds extends string = string> =
  | HeaderBlock<TFieldIds>
  | TextBlock<TFieldIds>
  | LabelBlock<TFieldIds>
  | DividerBlock<TFieldIds>
  | SpacerBlock<TFieldIds>
  | HtmlBlock<TFieldIds>
  | ImageBlock<TFieldIds>;
