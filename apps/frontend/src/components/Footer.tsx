import { cn } from "@alliance/shared/styles/util";
import React from "react";
import { Link, href } from "react-router";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer
      className={cn("w-full text-zinc-900  py-5 md:py-12 px-5", className)}
    >
      <div className="container mx-auto flex flex-col">
        <div className="flex flex-col items-center justify-center">
          <div className="flex w-full flex-row flex-wrap justify-center gap-4 md:gap-6 text-sm sm:text-base">
            <Link to={href("/people")} className="hover:underline">
              People
            </Link>
            <Link to={href("/guide")} className="hover:underline">
              Guide
            </Link>
            <Link to={href("/progress")} className="hover:underline">
              Progress
            </Link>
            <Link to={href("/faq")} className="hover:underline">
              FAQ
            </Link>
            <Link to={href("/privacypolicy")} className="hover:underline">
              Privacy
            </Link>
            <Link to={href("/terms")} className="hover:underline">
              Terms
            </Link>
            <a href="mailto:contact@worldalliance.org" className="">
              Contact
            </a>
          </div>
          <p className="text-sm md:text-base mt-4 text-zinc-500">
            &copy; {new Date().getFullYear()} Alliance Foundation
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
