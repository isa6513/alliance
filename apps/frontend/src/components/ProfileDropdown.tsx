import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAppLoaderData } from "../applayout";
import { useAuth } from "../lib/AuthContext";
import ProfileImage from "./ProfileImage";
import DropdownIcon from "./icons/DropdownIcon";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { profile } = useAppLoaderData();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const profilePicture = profile?.profilePicture || null;
  const userId = profile?.id || null;
  const profileUrl = userId ? `/user/${userId}` : "/profile";

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/home");
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
        className="flex items-center gap-x-1.5"
      >
        <ProfileImage pfp={profilePicture} size="large" />
        <DropdownIcon size="mini" fill="black" />
      </Link>
      {isOpen && (
        <div className="absolute top-[calc(100%-10px)] shadow-lg/5 right-5 bg-white rounded border border-zinc-200 min-w-[150px] max-h-[500px] overflow-y-auto cursor-default flex flex-col *:hover:bg-zinc-100 *:px-4 *:py-2 text-base">
          <Link to={profileUrl} onClick={() => setIsOpen(false)}>
            Profile
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
