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
      flex flex-row border-zinc-300 border-b bg-page
    w-screen text-left items-center fixed px-7 z-10 justify-between gap-x-5"
      >
        <div className="flex flex-row gap-x-1 sm:gap-x-4 lg:gap-x-8 items-center">
          <Link
            to={destinations[NavbarPage.Dashboard]}
            className="shrink-0 hidden sm:block"
          >
            <img
              src={logo}
              alt="logo"
              className={`w-7 h-7 ${
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
                className={`py-4 px-2 border-b-2 ${
                  currentLocation === link
                    ? " border-green-3"
                    : "border-transparent"
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
        <div className="flex flex-row gap-x-3 items-center flex-1 justify-end">
          <SearchBar />
          <NotificationsIcon />
          <ProfileDropdown />
        </div>
      </div>
      <div className="h-[45px]"></div>
    </>
  );
};

export default NavbarHorizontal;
