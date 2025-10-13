import { Outlet, useOutletContext } from "react-router";
import NavbarHorizontal from "./components/NavbarHorizontal";
import { AppLayoutOutletContext } from "./applayout";
import { canJoinAction, shouldCompleteAction } from "./pages/app/HomePage";
import { useMemo } from "react";

function Navbar() {
  const context = useOutletContext<AppLayoutOutletContext>();

  const nTasks = useMemo(
    () =>
      context.actions
        ? context.actions.filter((action) => shouldCompleteAction(action))
            .length +
          context.actions.filter((action) => canJoinAction(action)).length
        : 0,
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
