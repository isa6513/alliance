import DropdownIcon from "@alliance/sharedweb/ui/icons/DropdownIcon";
import ProfileImage from "@alliance/sharedweb/ui/ProfileImage";
import { useCallback, useState } from "react";
import { Link, href, useNavigate } from "react-router";
import { useAuth } from "../lib/AuthContext";

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

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
