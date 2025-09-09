import { PropsWithChildren } from "react";
import Card, { CardProps } from "./Card";

export interface DropdownProps extends Pick<CardProps, "ref" | "className"> {
  isOpen: boolean;
}

const Dropdown = ({
  isOpen,
  children,
  className,
  ref,
}: PropsWithChildren<DropdownProps>) => {
  return isOpen ? (
    <Card className={`z-10 shadow-lg ${className}`} ref={ref}>
      {children}
    </Card>
  ) : null;
};

export default Dropdown;
