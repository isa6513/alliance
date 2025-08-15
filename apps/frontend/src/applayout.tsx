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
  actionsMyActivity,
  forumFindAllPosts,
  PostDto,
  UserActionRelation,
  userMyProfile,
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
  relations: Map<number, UserActionRelation> | undefined;
  posts: PostDto[];
  authRefreshNeeded: boolean;
  revalidate: () => void;
}

export async function clientLoader() {
  localStorage.setItem("revalidate", "false");

  const [actions, activities, posts, profile] = await Promise.all([
    actionsFindAll(),
    actionsMyActivity(),
    forumFindAllPosts(),
    userMyProfile(),
  ]);
  console.log(activities);

  let authRefreshNeeded = false;
  if (
    activities.error &&
    (activities.error as { statusCode: number }).statusCode === 401
  ) {
    authRefreshNeeded = true;
  }

  const activityList = activities.data ?? [];
  const actionToRelationMap = new Map<number, UserActionRelation>();
  activityList.forEach((activity) => {
    actionToRelationMap.set(
      activity.actionId,
      activity.type === "user_joined" ? "joined" : "completed"
    );
  });

  const revalidateCallback = () => {
    localStorage.setItem("revalidate", "true");
  };

  return {
    actions: actions.data ?? [],
    relations: actionToRelationMap,
    posts: posts.data ?? [],
    revalidate: revalidateCallback,
    authRefreshNeeded,
    profile: profile.data ?? null,
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
