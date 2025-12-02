import { href, Navigate } from "react-router";
import { Route } from "../../../.react-router/types/src/pages/app/+types/UserRedirect";

const UserRedirect = ({ params }: Route.ComponentProps) => {
  return <Navigate to={href("/member/:id", { id: params.id })} />;
};

export default UserRedirect;
