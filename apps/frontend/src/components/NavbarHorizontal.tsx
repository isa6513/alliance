import { Features } from "@alliance/shared/lib/features";
import { useEffect, useRef } from "react";
import { Link, href, useLocation } from "react-router";
import logo from "../assets/planet-earth.png";
import { useAuth } from "../lib/AuthContext";
import { isFeatureEnabled } from "../lib/config";
import DropdownLink from "./DropdownLink";
import NotificationsIcon from "./NotificationsIcon";
import ProfileDropdown from "./ProfileDropdown";
import SearchBar from "./SearchBar";

export enum NavbarPage {
  Dashboard = "Tasks",
  CurrentActions = "Actions",
  Activity = "Activity",
  Announcements = "Announcements",
  Forum = "Forum",
  Priorities = "Priorities",
  Platform = "Platform",
}

export const links: NavbarPage[] = [
  NavbarPage.Dashboard,
  NavbarPage.Activity,
  NavbarPage.CurrentActions,
  NavbarPage.Forum,
  NavbarPage.Priorities,
];

export const destinations: Record<NavbarPage, string> = {
  [NavbarPage.Dashboard]: href("/tasks"),
  [NavbarPage.CurrentActions]: href("/actions"),
  [NavbarPage.Activity]: href("/feed"),
  [NavbarPage.Announcements]: "/announcements",
  [NavbarPage.Forum]: href("/forum"),
  [NavbarPage.Priorities]: href("/priorities"),
  [NavbarPage.Platform]: "/platform",
};

export const platformSublinks = [
  { text: "About", to: "/about" },
  { text: "Resources", to: "/resources" },
  { text: "Governance", to: "/platform/governance" },
];

const NavbarHorizontal: React.FC<{ todoActions: number }> = ({
  todoActions,
}: {
  todoActions: number;
}) => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement | null>(null);
  const activeLinks = isFeatureEnabled(Features.Forum)
    ? links
    : links.filter((link) => link !== NavbarPage.Forum);

  const { isAuthenticated, loading } = useAuth();

  if (!isAuthenticated && !loading) {
    return null;
  }

  const currentLocation: NavbarPage | null =
    activeLinks.find((link) => destinations[link] === location.pathname) ||
    null;

  useEffect(() => {
    if (typeof document === "undefined" || !navRef.current) return;
    document.documentElement.style.setProperty(
      "--nav-height",
      `${navRef.current.offsetHeight}px`
    );
  }, [currentLocation]);

  return (
    <>
      <div
        className="
      flex flex-col md:flex-row border-zinc-300 border-b bg-white
    w-screen text-left items-center fixed px-3 sm:px-7 z-20 justify-between gap-x-5 md:pt-0"
        id="main-nav"
        ref={navRef}
      >
        <div className="flex flex-row lg:gap-x-0 items-center w-full md:w-auto justify-around">
          <Link
            to={destinations[NavbarPage.Dashboard]}
            className="hidden sm:block shrink-0"
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
                prefetch="render"
                key={link}
                className={`py-2 md:py-4 px-2 md:px-4 lg:px-6 border-b-2 border-x-zinc-200 space-x-1 flex flex-row items-center ${
                  currentLocation === link
                    ? " border-green text-green "
                    : "border-transparent hover:bg-zinc-50"
                }`}
              >
                <span
                  className={`whitespace-nowrap ${
                    currentLocation === link ? "" : ""
                  }`}
                >
                  {link}
                </span>
                {todoActions > 0 && link === NavbarPage.Dashboard && (
                  <div className="text-xs text-white bg-green rounded-full w-4.5 h-4.5 flex items-center justify-center mt-px">
                    <span className="text-xs">{todoActions}</span>
                  </div>
                )}
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
