import { Outlet, useOutletContext } from "react-router";
import NavbarHorizontal from "./components/NavbarHorizontal";
import { AppLayoutOutletContext } from "./applayout";
import { canCompleteAction, canJoinAction } from "./pages/app/HomePage";
import { useMemo } from "react";

function Navbar() {
  const context = useOutletContext<AppLayoutOutletContext>();

  const nTasks = useMemo(
    () =>
      context.actions.filter((action) => canCompleteAction(action)).length +
      context.actions.filter((action) => canJoinAction(action)).length,
    [context.actions]
  );

  return (
    <>
      <NavbarHorizontal todoActions={nTasks} />
      <Outlet context={context} />
    </>
  );
}

export default Navbar;
