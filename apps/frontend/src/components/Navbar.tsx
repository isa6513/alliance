import React from "react";
import NavbarHorizontal from "./NavbarHorizontal";
import NavbarVertical from "./NavbarVertical";

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
  [NavbarPage.Dashboard]: "/tasks",
  [NavbarPage.CurrentActions]: "/actions",
  [NavbarPage.Activity]: "/feed",
  [NavbarPage.Announcements]: "/announcements",
  [NavbarPage.Forum]: "/forum",
  [NavbarPage.Priorities]: "/priorities",
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
