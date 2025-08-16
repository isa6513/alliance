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
  ActionActivityDto,
  actionsFindAll,
  actionsMyActivity,
  authRefreshTokens,
  forumFindAllPosts,
  PostDto,
  ProfileDto,
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
  relations?: Map<number, UserActionRelation>;
  activities?: Map<number, ActivitiesForAction>;
  posts: PostDto[];
  profile: ProfileDto | null;
  revalidate: () => void;
}

export interface ActivitiesForAction {
  join: ActionActivityDto | null;
  completion: ActionActivityDto | null;
}

export async function clientLoader() {
  localStorage.setItem("revalidate", "false");
  console.log("clientLoader");

  let [actions, activities, posts, profile] = await Promise.all([
    actionsFindAll(),
    actionsMyActivity(),
    forumFindAllPosts(),
    userMyProfile(),
  ]);

  if (
    profile.error &&
    (profile.error as { statusCode: number }).statusCode === 401
  ) {
    console.log("refreshing tokens");
    await authRefreshTokens();
    [actions, activities, posts, profile] = await Promise.all([
      actionsFindAll(),
      actionsMyActivity(),
      forumFindAllPosts(),
      userMyProfile(),
    ]);
  }

  const activityList = activities.data ?? [];
  const actionToRelationMap = new Map<number, UserActionRelation>();
  activityList.forEach((activity) => {
    actionToRelationMap.set(
      activity.actionId,
      activity.type === "user_joined" ? "joined" : "completed"
    );
  });

  const activitiesForAction = new Map<number, ActivitiesForAction>();
  activityList.forEach((activity) => {
    if (!activitiesForAction.has(activity.actionId)) {
      activitiesForAction.set(activity.actionId, {
        join: null,
        completion: null,
      });
    }
    if (activity.type === "user_joined") {
      activitiesForAction.get(activity.actionId)!.join = activity;
    } else if (activity.type === "user_completed") {
      activitiesForAction.get(activity.actionId)!.completion = activity;
    }
  });

  const revalidateCallback: () => void = () => {
    localStorage.setItem("revalidate", "true");
  };

  return {
    actions: actions.data ?? [],
    relations: actionToRelationMap,
    activities: activitiesForAction,
    posts: posts.data ?? [],
    revalidate: revalidateCallback,
    profile: profile.data ?? null,
  } satisfies LoaderData;
}

export function useAppLoaderData(): LoaderData {
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
