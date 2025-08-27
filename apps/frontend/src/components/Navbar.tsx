import React from "react";
import NavbarHorizontal from "./NavbarHorizontal";
import NavbarVertical from "./NavbarVertical";

export enum NavbarPage {
  Dashboard = "Home",
  CurrentActions = "Actions",
  Friends = "Friends",
  Announcements = "Announcements",
  Forum = "Forum",
  Priorities = "Priorities",
  Profile = "Profile",
  Platform = "Platform",
}

export const links: NavbarPage[] = [
  NavbarPage.Dashboard,
  NavbarPage.Friends,
  NavbarPage.CurrentActions,
  NavbarPage.Forum,
  NavbarPage.Priorities,
  NavbarPage.Profile,
];

export const destinations: Record<NavbarPage, string> = {
  [NavbarPage.Dashboard]: "/home",
  [NavbarPage.CurrentActions]: "/actions",
  [NavbarPage.Friends]: "/feed",
  [NavbarPage.Announcements]: "/announcements",
  [NavbarPage.Forum]: "/forum",
  [NavbarPage.Priorities]: "/priorities",
  [NavbarPage.Profile]: "/profile",
  [NavbarPage.Platform]: "/platform",
};

export const platformSublinks = [
  { text: "About", to: "/about" },
  { text: "Resources", to: "/resources" },
  { text: "Governance", to: "/platform/governance" },
];

export interface NavbarProps {
  currentPage: NavbarPage;
  format?: "horizontal" | "vertical";
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, format }) => {
  return (
    <div className=" text-[11pt] bg-white sticky top-0 z-10">
      {format === "vertical" ? (
        <NavbarVertical currentPage={currentPage} />
      ) : (
        <NavbarHorizontal />
      )}
    </div>
  );
};

export default Navbar;
