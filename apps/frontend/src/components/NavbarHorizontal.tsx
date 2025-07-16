import { Link } from "react-router";
import { destinations, links, NavbarPage, platformSublinks } from "./Navbar";
import DropdownLink from "./DropdownLink";
import { Features } from "@alliance/shared/lib/features";
import { isFeatureEnabled } from "../lib/config";
import NotificationsIcon from "./NotificationsIcon";
import { useAuth } from "../lib/AuthContext";

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
    w-screen text-left space-x-10 items-center pl-10 fixed justify-center z-10"
      >
        {/* <Link to="/">
        <h1 className="font-bold font-berlingske !text-[16pt] cursor-pointer">
          alliance
        </h1>
      </Link> */}
        <div className="flex flex-row gap-x-5 px-10 sm:gap-x-10">
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
                className="py-3"
              >
                <p
                  className={`whitespace-nowrap ${
                    currentLocation === link ? "underline" : ""
                  }`}
                >
                  {link}
                </p>
              </Link>
            )
          )}
        </div>
        <div className="absolute right-10">
          <NotificationsIcon />
        </div>
      </div>
      <div className="h-[45px]"></div>
    </>
  );
};

export default NavbarHorizontal;
