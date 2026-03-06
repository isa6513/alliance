import { cn } from "@alliance/shared/styles/util";
import { textClass } from "./typography";
export { textClass, type TypographyProps } from "./typography";

export const PageTitle: React.FC<React.ComponentProps<"h1">> = ({
  className,
  ...props
}) => <h1 className={cn(textClass({ font: "title" }), className)} {...props} />;
