import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../lib/AuthContext";

const ProfileRedirectInner = () => {
  const { isAuthenticated, user } = useAuth();
  const { state } = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/user/${user.id}`, { replace: true, state });
    }
  }, [isAuthenticated, user, navigate, state]);

  return <></>;
};

const ProfileRedirect = () => {
  return <ProfileRedirectInner />;
};

export default ProfileRedirect;
