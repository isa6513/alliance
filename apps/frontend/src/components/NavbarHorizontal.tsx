import { Features } from "@alliance/shared/lib/features";
import { Link } from "react-router";
import logo from "../assets/planet-earth.png";
import { useAuth } from "../lib/AuthContext";
import { isFeatureEnabled } from "../lib/config";
import DropdownLink from "./DropdownLink";
import { destinations, links, NavbarPage, platformSublinks } from "./Navbar";
import NotificationsIcon from "./NotificationsIcon";
import ProfileDropdown from "./ProfileDropdown";
import SearchBar from "./SearchBar";

const NavbarHorizontal: React.FC = () => {
  const activeLinks = isFeatureEnabled(Features.Forum)
    ? links
    : links.filter((link) => link !== NavbarPage.Forum);

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const currentLocation: NavbarPage | null =
    activeLinks.find(
      (link) => destinations[link] === window.location.pathname
    ) || null;

  return (
    <>
      <div
        className="
      flex flex-col md:flex-row border-zinc-300 border-b bg-white
    w-screen text-left items-center fixed px-7 z-10 justify-between gap-x-5"
      >
        <div className="flex flex-row lg:gap-x-0 items-center">
          <Link
            to={destinations[NavbarPage.Dashboard]}
            className="shrink-0 hidden sm:block"
          >
            <img
              src={logo}
              alt="logo"
              className={`w-7 h-7 mr-8 ${
                import.meta.env.MODE === "development" ? "grayscale invert" : ""
              }`}
            />
          </Link>
          {activeLinks.map((link) =>
            link === NavbarPage.Platform ? (
              <DropdownLink
                key={link}
                text={link}
                to={destinations[link]}
                sublinks={platformSublinks}
                inverted={false}
              />
            ) : (
              <Link
                to={destinations[link]}
                key={link}
                className={`py-2 md:py-4 px-6 border-b-2 border-x-zinc-200 ${
                  currentLocation === link
                    ? " border-green text-green bg-zinc-50"
                    : "border-transparent hover:bg-zinc-50"
                }`}
              >
                <p
                  className={`whitespace-nowrap ${
                    currentLocation === link ? "" : ""
                  }`}
                >
                  {link}
                </p>
              </Link>
            )
          )}
        </div>
        <div className="flex flex-row gap-x-4 py-2 md:py-0 items-center flex-1 justify-end">
          <SearchBar />
          <NotificationsIcon />
          <ProfileDropdown />
        </div>
      </div>
      <div className="h-[95px] md:h-[55px]"></div>
    </>
  );
};

export default NavbarHorizontal;
