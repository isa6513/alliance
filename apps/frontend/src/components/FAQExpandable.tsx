import { PropsWithChildren } from "react";
import Expandable from "./Expandable";

interface FAQExpandableProps extends PropsWithChildren {
  title: string;
}

const FAQExpandable: React.FC<FAQExpandableProps> = ({
  title,
  children,
}: FAQExpandableProps) => {
  return (
    <Expandable title={title}>
      <div className="flex flex-col gap-y-4">{children}</div>
    </Expandable>
  );
};

export default FAQExpandable;
