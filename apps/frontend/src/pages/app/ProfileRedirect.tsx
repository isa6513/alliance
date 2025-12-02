import { useEffect } from "react";
import { href, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../lib/AuthContext";

const ProfileRedirectInner = () => {
  const { isAuthenticated, user } = useAuth();
  const { state } = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(href("/member/:id", { id: user.id.toString() }), {
        replace: true,
        state,
      });
    }
  }, [isAuthenticated, user, navigate, state]);

  return <></>;
};

const ProfileRedirect = () => {
  return <ProfileRedirectInner />;
};

export default ProfileRedirect;
