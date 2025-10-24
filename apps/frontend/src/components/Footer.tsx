import React from "react";
import { Link } from "react-router";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer
      className={`w-full bg-white text-black border-t border-zinc-200 py-5 md:py-12 px-5 ${className}`}
    >
      <div className="container mx-auto flex flex-col">
        <div className="flex flex-row items-start justify-between">
          <div className="mb-4 md:mb-0 h-full flex-1 flex flex-col items-between">
            <p className="text-lg sm:text-2xl font-berlingske uppercase">
              The Alliance
            </p>
            <p className="text-sm md:text-base text-zinc-500 mt-4 sm:mt-7">
              &copy; {new Date().getFullYear()} Alliance Foundation
            </p>
          </div>
          <div className="flex flex-row gap-4 md:gap-10 text-sm sm:text-base">
            <div className="flex flex-col gap-y-2 *:hover:underline">
              <Link to="/people" className="">
                People
              </Link>
              <Link to="/guide" className="">
                Guide
              </Link>
              <Link to="/progress" className="">
                Progress
              </Link>
            </div>
            <div className="flex flex-col gap-y-2 *:hover:underline">
              <Link to="/privacypolicy" className="">
                Privacy
              </Link>
              <Link to="/terms" className="">
                Terms
              </Link>
              <a href="mailto:contact@worldalliance.org" className="">
                Contact
              </a>
            </div>

            {/* <div className="flex flex-col gap-2">
              <p className="font-bold text-gray-800">Platform</p>
              <Link to="/issues" className="text-gray-600 hover:text-black">
                Issues
              </Link>
              <Link to="/forum" className="text-gray-600 hover:text-black">
                Forum
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-bold text-gray-800">About</p>
              <Link to="/" className="text-gray-600 hover:text-black">
                Mission
              </Link>
              <Link to="/" className="text-gray-600 hover:text-black">
                Team
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
