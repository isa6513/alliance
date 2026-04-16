import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@alliance/shared/styles/util";

export const GuideSection = ({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn("w-full mx-auto", className)} id={id}>
    {children}
  </div>
);

export const GuideH1 = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn(
      "font-semibold text-2xl md:text-3xl first:mt-0 mt-4 md:mt-8",
      className,
    )}
    {...props}
  />
);

export const GuideH2 = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(
      "font-semibold text-xl md:text-2xl first:mt-0 mt-4 md:mt-8",
      className,
    )}
    {...props}
  />
);

export const GuideP = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-zinc-800 text-lg first:mt-0 mt-2 md:mt-5", className)}
    {...props}
  />
);

export const GuideStrong = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("font-semibold text-black", className)} {...props} />
);

export const GuideOl = ({
  className,
  ...props
}: HTMLAttributes<HTMLOListElement>) => (
  <ol
    className={cn(
      "text-lg text-zinc-800 list-decimal list-inside first:mt-0 mt-2 md:mt-5 pl-4",
      className,
    )}
    {...props}
  />
);

export const GuideUl = ({
  className,
  ...props
}: HTMLAttributes<HTMLUListElement>) => (
  <ul
    className={cn(
      "text-lg text-zinc-800 list-disc list-inside first:mt-0 mt-2 md:mt-5 pl-4",
      className,
    )}
    {...props}
  />
);

export const GuideLi = ({
  className,
  ...props
}: HTMLAttributes<HTMLLIElement>) => (
  <li className={cn("first:mt-0 mt-2", className)} {...props} />
);
