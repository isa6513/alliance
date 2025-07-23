import {
  Navigate,
  Outlet,
  ShouldRevalidateFunctionArgs,
  useRouteLoaderData,
} from "react-router";
import { useAuth } from "./lib/AuthContext";
import NavbarHorizontal from "./components/NavbarHorizontal";
import { useEffect, useState } from "react";
import {
  actionsFindAll,
  actionsMyActionRelations,
  forumFindAllPosts,
  PostDto,
  UserActionDto,
} from "@alliance/shared/client";
import { ActionDto } from "@alliance/shared/client";

export interface RouteMatch {
  data: unknown;
  id: string;
}

export interface RouteMatches {
  matches: RouteMatch[];
}

export interface LoaderData {
  actions: ActionDto[];
  relations: Map<number, UserActionDto["status"]> | undefined;
  posts: PostDto[];
  authRefreshNeeded: boolean;
  revalidate: () => void;
}

export async function clientLoader() {
  localStorage.setItem("revalidate", "false");

  const [actions, relations, posts] = await Promise.all([
    actionsFindAll(),
    actionsMyActionRelations(),
    forumFindAllPosts(),
  ]);

  let authRefreshNeeded = false;
  if (
    relations.error &&
    (relations.error as { statusCode: number }).statusCode === 401
  ) {
    authRefreshNeeded = true;
  }

  const relationList = relations.data ?? [];
  const actionToRelationMap = new Map<number, UserActionDto["status"]>();
  relationList.forEach((relation) => {
    actionToRelationMap.set(relation.actionId, relation.status);
  });

  const revalidateCallback = () => {
    localStorage.setItem("revalidate", "true");
  };

  return {
    actions: actions.data ?? [],
    relations: relations.data !== undefined ? actionToRelationMap : undefined,
    posts: posts.data ?? [],
    revalidate: revalidateCallback,
    authRefreshNeeded,
  };
}

export function useAppLoaderData(): Awaited<ReturnType<typeof clientLoader>> {
  const data = useRouteLoaderData<typeof clientLoader>("applayout");
  if (!data) {
    throw new Error("No data - applayout loader not found");
  }
  return data;
}

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();

  const [shouldGoToLogin, setShouldGoToLogin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("was-logged-in", "true");
    }
    // prevent user from going into "logged out mode" if their session expires
    if (
      !isAuthenticated &&
      localStorage.getItem("was-logged-in") === "true" &&
      !loading
    ) {
      setShouldGoToLogin(true);
    }
  }, [isAuthenticated, loading]);

  if (shouldGoToLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      {isAuthenticated && <NavbarHorizontal />}
      <Outlet />
    </>
  );
}

export function shouldRevalidate({}: ShouldRevalidateFunctionArgs) {
  return localStorage.getItem("revalidate") === "true";
}
