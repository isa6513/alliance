import DropdownIcon from "@alliance/shared/ui/icons/DropdownIcon";
import ProfileImage from "@alliance/shared/ui/ProfileImage";
import { useCallback, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { useAuth } from "../lib/AuthContext";
import { AppLayoutOutletContext } from "../applayout";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const { profile } = useOutletContext<AppLayoutOutletContext>();

  const profilePicture = profile?.profilePicture || null;
  const userId = profile?.id || null;
  const profileUrl = userId ? `/user/${userId}` : "/profile";

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/tasks");
  }, [logout, navigate]);

  return (
    <div
      onMouseOver={() => setIsOpen(true)}
      onMouseOut={() => setIsOpen(false)}
      className=""
    >
      <Link
        to={profileUrl}
        onClick={() => setIsOpen(false)}
        className="hidden md:flex items-center gap-x-1.5"
      >
        <ProfileImage pfp={profilePicture} size="large" />
        <DropdownIcon size="mini" fill="black" />
      </Link>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="md:hidden flex items-center gap-x-1.5"
      >
        <ProfileImage pfp={profilePicture} size="large" />
        <DropdownIcon size="mini" fill="black" />
      </button>
      {isOpen && (
        <div className="absolute top-[calc(100%-10px)] shadow-lg/5 right-5 bg-white rounded border border-zinc-200 min-w-[175px] max-h-[500px] overflow-y-auto cursor-default flex flex-col *:hover:bg-zinc-100 *:px-4 *:py-2 text-base">
          <Link to={profileUrl} onClick={() => setIsOpen(false)}>
            Profile
          </Link>
          <Link to="/contract" onClick={() => setIsOpen(false)}>
            Contract
          </Link>
          <Link to="/settings" onClick={() => setIsOpen(false)}>
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
