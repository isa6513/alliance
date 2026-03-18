import DropdownIcon from "@alliance/sharedweb/ui/icons/DropdownIcon";
import { AvatarProfile } from "@alliance/sharedweb/ui/Avatar";
import { useOutsideClick } from "@alliance/sharedweb/lib/useOutsideClick";
import { useCallback, useState } from "react";
import { Link, href, useNavigate } from "react-router";
import { useAuth } from "../lib/AuthContext";
import { NAV_BAR_CONTAINER_HEIGHT } from "@alliance/shared/lib/constants";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useOutsideClick(() => setIsOpen(false));

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const profilePicture = user?.profilePicture || null;
  const userId = user?.id || null;
  const profileUrl = userId
    ? href("/member/:id", { id: userId.toString() })
    : href("/profile");

  const handleLogout = useCallback(async () => {
    await logout();
    navigate(href("/tasks"));
  }, [logout, navigate]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div
      ref={ref}
      onMouseOver={() => setIsOpen(true)}
      onMouseOut={() => setIsOpen(false)}
      className="relative"
    >
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-x-1.5 rounded-md hover:bg-zinc-100 focus:outline-none"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <AvatarProfile
          pfp={profilePicture}
          size="override"
          className={`h-${NAV_BAR_CONTAINER_HEIGHT} w-${NAV_BAR_CONTAINER_HEIGHT}`}
        />
        <DropdownIcon size="small" fill="black" />
      </button>
      {isOpen && (
        <div className="absolute top-full shadow-lg/5 right-0 bg-white rounded min-w-[175px] max-h-[500px] overflow-y-auto cursor-default flex flex-col *:hover:bg-zinc-100 *:px-4 *:py-2 text-base z-50">
          <Link to={profileUrl} onClick={() => setIsOpen(false)}>
            Profile
          </Link>
          <Link to={href("/contract")} onClick={() => setIsOpen(false)}>
            Contract
          </Link>
          <Link to={href("/settings")} onClick={() => setIsOpen(false)}>
            Settings
          </Link>
          <p
            className="cursor-pointer border-t border-zinc-300"
            onClick={handleLogout}
          >
            Log out
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
