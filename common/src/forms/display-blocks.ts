import z from "zod";
import type { VisibleIfFormula } from "./visible-if-formula";

export type DisplayKind =
  | "header" // H1–H6
  | "text" // plain or markdown text
  | "label" // small label/caption
  | "divider" // horizontal rule
  | "spacer" // vertical space
  | "html" // controlled/allowlisted HTML snippet
  | "image" // decorative image
  | "video" // video player (HLS)
  | "quote" // quote block
  | "biglink" // prominent link card
  | "copytext" // copiable text snippet (email, URL, etc.)
  | "previousAnswer"; // show a user's answer from another form

interface BaseBlock {
  kind: DisplayKind;
  id?: string;
  visibleIfFormula?: VisibleIfFormula;
  width?: "full" | "1/2" | "1/3";
  manualPerUser?: boolean;
  manualUserContent?: Record<string, ManualDisplayBlockContent>;
}

export type HeaderBlock = BaseBlock & {
  kind: "header";
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6; // default 2
};

export type TextBlock = BaseBlock & {
  kind: "text";
  text: string;
};

export type QuoteBlock = BaseBlock & {
  kind: "quote";
  text: string;
};

export type LabelBlock = BaseBlock & {
  kind: "label";
  text: string;
};

export type DividerBlock = BaseBlock & {
  kind: "divider";
  thickness?: "hairline" | "thin" | "medium" | "thick";
};

export type SpacerBlock = BaseBlock & {
  kind: "spacer";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
};

export type HtmlBlock = BaseBlock & {
  kind: "html";
  /** store a sanitized/whitelisted HTML snippet on the server */
  html: string;
};

export type ImageBlock = BaseBlock & {
  kind: "image";
  alt: string;
  src: string; // or { key: string } if you want S3 keys
  aspectRatio?: number; // e.g. 16/9
  caption?: string;
};

export type VideoBlock = BaseBlock & {
  kind: "video";
  src: string; // S3 key prefix, e.g. "videos/1707564123456"
  videoId?: number; // DB id for status polling during processing
  caption?: string;
};

export type BigLinkIcon =
  | "messages-square"
  | "file"
  | "file-text"
  | "file-check"
  | "signature";

export type BigLinkBlock = BaseBlock & {
  kind: "biglink";
  text: string;
  url: string;
  icon?: BigLinkIcon;
};

export type CopyTextBlock = BaseBlock & {
  kind: "copytext";
  text: string;
  title?: string;
};

export type PreviousAnswerBlock = BaseBlock & {
  kind: "previousAnswer";
  sourceFormId: number;
  sourceFieldId: string;
  title?: string;
  /** Sub-field IDs to SHOW (whitelist). Empty = show all. */
  visibleSubFieldIds?: string[];
  /** Custom placeholder text when no previous answer exists. */
  emptyText?: string;
};

export type DisplayBlock =
  | HeaderBlock
  | TextBlock
  | QuoteBlock
  | LabelBlock
  | DividerBlock
  | SpacerBlock
  | HtmlBlock
  | ImageBlock
  | VideoBlock
  | BigLinkBlock
  | CopyTextBlock
  | PreviousAnswerBlock;

export type ManualDisplayBlockContent = Omit<
  DisplayBlock,
  "manualPerUser" | "manualUserContent"
>;

export type ManualImportField = "text" | "html";

/**
 * For each display-block kind, the single string field that
 * "Import from clipboard" should write per-user content into.
 * `null` means the kind doesn't support clipboard import.
 */
export const MANUAL_IMPORT_FIELD_BY_KIND: Record<
  DisplayKind,
  ManualImportField | null
> = {
  header: "text",
  text: "text",
  label: "text",
  quote: "text",
  copytext: "text",
  html: "html",
  divider: null,
  spacer: null,
  image: null,
  video: null,
  biglink: null,
  previousAnswer: null,
};

export const manualImportClipboardSchema = z
  .record(z.string(), z.string())
  .refine((v) => !Array.isArray(v), "Expected a JSON object, not an array.");
export type ManualImportClipboardPayload = z.infer<
  typeof manualImportClipboardSchema
>;
