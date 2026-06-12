import { cn } from "@alliance/shared/styles/util";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";

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
      "font-serif font-semibold text-3xl md:text-4xl first:mt-0 mt-4 md:mt-8",
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
      "font-serif font-semibold text-xl md:text-2xl first:mt-0 mt-4 md:mt-8",
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
    className={cn(
      "text-zinc-800 text-base md:text-lg first:mt-0 mt-3 md:mt-5",
      className,
    )}
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
      "text-base md:text-lg text-zinc-800 list-decimal list-inside first:mt-0 mt-3 md:mt-5 pl-4",
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
      "text-base md:text-lg text-zinc-800 list-disc list-inside first:mt-0 mt-3 md:mt-5 pl-4",
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

type FootnoteEntry = { id: string; content: ReactNode };

type GuideFootnotesContextValue = {
  register: (id: string, content: ReactNode) => number;
  entries: FootnoteEntry[];
};

const GuideFootnotesContext = createContext<GuideFootnotesContextValue | null>(
  null,
);

const useGuideFootnotesContext = () => {
  const ctx = useContext(GuideFootnotesContext);
  if (ctx == null) {
    throw new Error(
      "Guide footnote components must be used within GuideFootnotesScope",
    );
  }
  return ctx;
};

/** Wrap a doc section (or page) that uses {@link GuideFootnote} / {@link GuideFootnotes}. */
export const GuideFootnotesScope = ({ children }: { children: ReactNode }) => {
  const entriesRef = useRef<FootnoteEntry[]>([]);
  const [entries, setEntries] = useState<FootnoteEntry[]>([]);

  const register = useCallback((id: string, content: ReactNode) => {
    const list = entriesRef.current;
    const index = list.findIndex((e) => e.id === id);
    if (index === -1) {
      list.push({ id, content });
      setEntries([...list]);
      return list.length;
    }
    list[index] = { id, content };
    setEntries([...list]);
    return index + 1;
  }, []);

  return (
    <GuideFootnotesContext.Provider value={{ register, entries }}>
      {children}
    </GuideFootnotesContext.Provider>
  );
};

/** Inline footnote marker; `children` are shown in {@link GuideFootnotes}. */
export const GuideFootnote = ({ children }: { children: ReactNode }) => {
  const { register, entries } = useGuideFootnotesContext();
  const reactId = useId();
  const footnoteId = `guide-fn-${reactId.replace(/:/g, "")}`;
  const refId = `${footnoteId}-ref`;

  useLayoutEffect(() => {
    register(footnoteId, children);
  }, [children, footnoteId, register]);

  const n = entries.findIndex((e) => e.id === footnoteId) + 1;
  if (n === 0) {
    return null;
  }

  return (
    <sup className="ml-0.5 text-sm font-normal align-super">
      <a
        href={`#${footnoteId}`}
        id={refId}
        className="text-link no-underline hover:underline"
      >
        [{n}]
      </a>
    </sup>
  );
};

/** Footnote definitions; place once at the bottom of the page (or scope). */
export const GuideFootnotes = ({ className }: { className?: string }) => {
  const { entries } = useGuideFootnotesContext();
  if (entries.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        "first:mt-0 mt-8 md:mt-10 pt-6 border-t border-zinc-200",
        className,
      )}
      aria-label="Footnotes"
    >
      <ol className="flex flex-col gap-y-3 list-none p-0 m-0">
        {entries.map((entry, index) => {
          const n = index + 1;
          const refId = `${entry.id}-ref`;
          return (
            <li
              key={entry.id}
              id={entry.id}
              className="flex gap-x-2 text-base text-zinc-600 leading-relaxed"
            >
              <span className="shrink-0 tabular-nums text-zinc-500">
                <a
                  href={`#${refId}`}
                  className="text-link no-underline hover:underline"
                  aria-label={`Back to reference ${n}`}
                >
                  {n}.
                </a>
              </span>
              <span className="min-w-0">{entry.content}</span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
};
