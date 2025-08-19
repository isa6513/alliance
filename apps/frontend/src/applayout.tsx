import {
  Outlet,
  ShouldRevalidateFunctionArgs,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "react-router";
import { useAuth } from "./lib/AuthContext";
import NavbarHorizontal from "./components/NavbarHorizontal";
import { useEffect } from "react";
import {
  ActionActivityDto,
  ActionDto,
  actionsFindAll,
  actionsMyActivity,
  forumFindAllPosts,
  PostDto,
  ProfileDto,
  UserActionRelation,
  userMyProfile,
} from "@alliance/shared/client";

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
}

export interface ActivitiesForAction {
  join: ActionActivityDto | null;
  completion: ActionActivityDto | null;
}

const revalidateKey = "revalidate";

export async function clientLoader() {
  localStorage.setItem(revalidateKey, "false");
  console.log("clientLoader");

  const [actions, activities, posts, profile] = await Promise.all([
    actionsFindAll(),
    actionsMyActivity(),
    forumFindAllPosts(),
    userMyProfile(),
  ]);

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

  return {
    actions: actions.data ?? [],
    relations: actionToRelationMap,
    activities: activitiesForAction,
    posts: posts.data ?? [],
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

export function HydrateFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p>Loading alliance data...</p>
    </div>
  );
}

const authOnlyRoutes = ["/home", "/settings", "/profile", "/onboarding"];

export default function AppLayout() {
  const { isAuthenticated, loading, logout } = useAuth();

  const navigate = useNavigate();
  const navigation = useNavigation();

  const isNavigating = Boolean(navigation.location);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("was-logged-in", "true");
    }
    // prevent user from going into "logged out mode" if their session expires
    // if (
    //   !isAuthenticated &&
    //   localStorage.getItem("was-logged-in") === "true" &&
    //   !loading
    // ) {
    //   navigate("/login?redirect=" + window.location.pathname);
    // }
    const wasLoggedIn = localStorage.getItem("was-logged-in") === "true";

    const handleUnauthorized = () => {
      if (
        !window.location.pathname.includes("/login") &&
        !isNavigating &&
        (authOnlyRoutes.includes(window.location.pathname) || wasLoggedIn)
      ) {
        console.log("unauthorized, logging out");
        logout();
        navigate("/login?redirect=" + window.location.pathname);
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [isAuthenticated, loading, navigate, isNavigating, logout]);

  return (
    <>
      {isAuthenticated && <NavbarHorizontal />}
      <Outlet />
    </>
  );
}

export function setRevalidate() {
  localStorage.setItem(revalidateKey, "true");
}

export function shouldRevalidate({}: ShouldRevalidateFunctionArgs) {
  return localStorage.getItem(revalidateKey) === "true";
}
