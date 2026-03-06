import { cn } from "@alliance/shared/styles/util";
import { cva, type VariantProps } from "class-variance-authority";

const TEXT_SIZE_CLASS = {
  0: "text-xs",
  1: "text-sm",
  2: "text-base",
  3: "text-lg",
  4: "text-xl",
  5: "text-2xl md:text-3xl",
  6: "text-3xl md:text-4xl",
  7: "text-4xl md:text-5xl",
  8: "text-5xl md:text-6xl",
  9: "text-6xl md:text-7xl",
  10: "text-7xl md:text-8xl",
  11: "text-8xl md:text-9xl",
} as const;

const TEXT_FONT_CLASS = {
  title: "font-serif font-semibold",
  body: "font-sans",
};

const TEXT_COLOR_CLASS = {
  primary: "text-zinc-900",
  muted: "text-zinc-500",
  success: "text-green",
  warning: "text-amber-500",
  error: "text-orange-600",
} as const;

const typography = cva("", {
  variants: {
    font: TEXT_FONT_CLASS,
    size: {
      small: "",
      normal: "",
      large: "",
    },
    color: TEXT_COLOR_CLASS,
  },

  defaultVariants: {
    font: "body",
    size: "normal",
    color: "primary",
  },

  compoundVariants: [
    { font: "title", size: "small", class: TEXT_SIZE_CLASS[0] },
    { font: "title", size: "normal", class: "text-3xl md:text-4xl" },
    { font: "title", size: "large", class: "text-4xl md:text-5xl" },

    { font: "body", size: "small", class: "text-sm" },
    { font: "body", size: "normal", class: "text-base" },
    { font: "body", size: "large", class: "text-lg" },
  ],
});
export const textClass: typeof typography = (input) => cn(typography(input));

export type TypographyProps = VariantProps<typeof typography> & {
  className?: string;
};
