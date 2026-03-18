import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigation } from "react-router";
import { cn } from "@alliance/shared/styles/util";
import { NAV_BAR_TOP_BAR_HEIGHT } from "@alliance/shared/lib/constants";
import NavbarTopBar from "./components/NavbarTopBar";
import NavbarVertical from "./components/NavbarVertical";
import Spinner from "@alliance/sharedweb/ui/Spinner";
import { NotificationsProvider } from "@alliance/shared/lib/useNotifications";
import { showActionInSidebarList } from "@alliance/shared/lib/actionUtils";
import { IncomingCommunityInvitesProvider } from "@alliance/shared/lib/useIncomingCommunityInvites";
import { useTaskActionsData } from "./lib/useTaskActionsData";

function Navbar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { actions } = useTaskActionsData();
  const { pathname } = useLocation();
  const whiteBars =
    pathname.startsWith("/actions/") || pathname.startsWith("/messages");

  const nTasks = useMemo(
    () => (actions ? actions.filter(showActionInSidebarList).length : 0),
    [actions],
  );

  useEffect(() => {
    const href = nTasks > 0 ? "/planet-earth-notif.png" : "/planet-earth.png";
    const existingFavicon =
      document.querySelector<HTMLLinkElement>("link[rel~='icon']");

    if (existingFavicon) {
      const hrefUrl = new URL(href, window.location.href).href;
      if (existingFavicon.href !== hrefUrl) {
        existingFavicon.href = href;
      }
      return;
    }

    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = href;
    document.head.appendChild(favicon);
  }, [nTasks]);

  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <NotificationsProvider>
      <IncomingCommunityInvitesProvider>
        <NavbarVertical
          todoActions={nTasks}
          mobileNavOpen={mobileNavOpen}
          onMobileNavOpenChange={setMobileNavOpen}
          whiteBackground={whiteBars}
        />
        <NavbarTopBar
          onMenuClick={() => setMobileNavOpen((o) => !o)}
          whiteBackground={whiteBars}
          showNavbarBorder={pathname.startsWith("/messages")}
        />

        <main
          className={cn(
            "md:ml-[var(--nav-width)] min-h-[calc(100dvh-var(--navbar-top-bar-height))] mt-[var(--navbar-top-bar-height)] relative flex flex-col",
            whiteBars ? "bg-white" : "bg-page",
          )}
        >
          <div className="flex-1 relative">
            <Outlet />
            {isNavigating && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <Spinner size="large" />
              </div>
            )}
          </div>
          {isNavigating && (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <Spinner size="large" />
            </div>
          )}
        </main>
      </IncomingCommunityInvitesProvider>
    </NotificationsProvider>
  );
}

export default Navbar;
