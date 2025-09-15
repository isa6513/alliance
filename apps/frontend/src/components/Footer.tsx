import React from "react";
import { Link } from "react-router";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer
      className={`w-full bg-white text-black border-t border-zinc-200 py-8 md:py-12 px-8 ${className}`}
    >
      <div className="container mx-auto flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start">
          <div className="mb-4 hidden md:mb-0 md:block">
            <p className="text-2xl font-berlingske uppercase">The Alliance</p>
          </div>
          <div className="flex flex-row gap-6 md:gap-10 text-base">
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
              <a href="mailto:support@worldalliance.org" className="">
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
        <p className="text-base text-zinc-500 mt-6">
          &copy; {new Date().getFullYear()} The Alliance
        </p>
      </div>
    </footer>
  );
};

export default Footer;
