import { cn } from "@alliance/shared/styles/util";

export const Style = {
  PageTitle: "font-serif font-semibold text-3xl md:text-4xl",
};

export const PageTitle: React.FC<React.ComponentPropsWithoutRef<"h1">> = ({
  className,
  ...rest
}) => {
  return <h1 className={cn(Style.PageTitle, className)} {...rest} />;
};
