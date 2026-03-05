import React, { useCallback } from "react";
import godImage from "../assets/planet-earth.png";
import { useNavigate } from "react-router";
import { cn } from "@alliance/shared/styles/util";

interface LogoProps {
  href?: string;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ href, className }) => {
  const navigate = useNavigate();

  const clickHandler = useCallback(() => {
    if (href) {
      navigate(href);
    }
  }, [href, navigate]);

  return (
    <img
      src={godImage}
      onClick={clickHandler}
      alt="logo"
      className={cn(
        "aspect-square w-[30px]",
        href && "cursor-pointer",
        className
      )}
    />
  );
};

export default Logo;
