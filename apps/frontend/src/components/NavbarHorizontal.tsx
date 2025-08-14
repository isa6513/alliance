import { Link } from "react-router";
import { destinations, links, NavbarPage, platformSublinks } from "./Navbar";
import DropdownLink from "./DropdownLink";
import { Features } from "@alliance/shared/lib/features";
import { isFeatureEnabled } from "../lib/config";
import NotificationsIcon from "./NotificationsIcon";
import { useAuth } from "../lib/AuthContext";
import SearchBar from "./SearchBar";
import logo from "../assets/planet-earth.png";

const NavbarHorizontal: React.FC = () => {
  const activeLinks = isFeatureEnabled(Features.Forum)
    ? links
    : links.filter((link) => link !== NavbarPage.Forum);

  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  let profileUrl = "/profile";
  if (user?.id) {
    profileUrl = `/user/${user.id}`;
  }

  const currentLocation: NavbarPage | null =
    activeLinks.find(
      (link) => destinations[link] === window.location.pathname
    ) || (window.location.pathname === profileUrl ? NavbarPage.Profile : null);

  return (
    <>
      <div
        className="
      flex flex-row border-stone-300 border-b bg-white
    w-screen text-left items-center fixed px-7 z-10 justify-between gap-x-5"
      >
        <div className="flex flex-row gap-x-1 sm:gap-x-4 lg:gap-x-8 items-center">
          <Link to="/" className="shrink-0 hidden sm:block">
            <img src={logo} alt="logo" className="w-7 h-7" />
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
                to={
                  link === NavbarPage.Profile ? profileUrl : destinations[link]
                }
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
        <div className="flex flex-row gap-x-5 items-center flex-1 justify-end">
          <SearchBar />
          <NotificationsIcon />
        </div>
      </div>
      <div className="h-[45px]"></div>
    </>
  );
};

export default NavbarHorizontal;
