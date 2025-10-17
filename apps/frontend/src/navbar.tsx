import { Outlet, useNavigation, useOutletContext } from "react-router";
import NavbarHorizontal from "./components/NavbarHorizontal";
import { AppLayoutOutletContext } from "./applayout";
import { canJoinAction, shouldCompleteAction } from "./pages/app/HomePage";
import { useMemo } from "react";
import Spinner from "./components/Spinner";

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

  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <>
      <NavbarHorizontal todoActions={nTasks} />
      <Outlet context={context} />
      {isNavigating && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <Spinner size="large" />
        </div>
      )}
    </>
  );
}

export default Navbar;
