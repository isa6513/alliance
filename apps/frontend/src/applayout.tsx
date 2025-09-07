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
import { Features } from "@alliance/shared/lib/features";
import { useEffect } from "react";
import {
  Outlet,
  ShouldRevalidateFunctionArgs,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "react-router";
import BugReportButton from "./components/BugReportButton";
import NavbarHorizontal from "./components/NavbarHorizontal";
import { useAuth } from "./lib/AuthContext";
import { isFeatureEnabled } from "./lib/config";
import { canCompleteAction } from "./pages/app/HomePage";

export interface RouteMatch {
  data: unknown;
  id: string;
}

export interface RouteMatches {
  matches: RouteMatch[];
}

export type ActionWithRelation = ActionDto & {
  relation: UserActionRelation | undefined;
};

export interface LoaderData {
  actions: ActionWithRelation[];
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
  if (activities.data) {
    for (const action of actions.data ?? []) {
      actionToRelationMap.set(action.id, "none");
    }
  }
  const completionActivities = activityList.filter(
    (activity) => activity.type === "user_completed"
  );
  const joinActivities = activityList.filter(
    (activity) => activity.type === "user_joined"
  );

  joinActivities.forEach((activity) => {
    actionToRelationMap.set(activity.actionId, "joined");
  });

  completionActivities.forEach((activity) => {
    actionToRelationMap.set(activity.actionId, "completed");
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

  const actionsWithRelation = actions.data?.map((action) => ({
    ...action,
    relation: actionToRelationMap.get(action.id),
  }));

  // Sort so that actions with the earliest last event come first
  const actionsSortedByDate = actionsWithRelation?.sort((a, b) => {
    const aEvent = a.events[a.events.length - 1];
    const bEvent = b.events[b.events.length - 1];

    const aDate = aEvent ? new Date(aEvent.date) : new Date(0);
    const bDate = bEvent ? new Date(bEvent.date) : new Date(0);

    return aDate.getTime() - bDate.getTime();
  });

  return {
    actions: actionsSortedByDate ?? [],
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
      <p>Loading data...</p>
    </div>
  );
}

const authOnlyRoutes = ["/home", "/settings", "/profile", "/onboarding"];

export default function AppLayout() {
  const { isAuthenticated, loading, logout } = useAuth();

  const { actions } = useLoaderData<typeof clientLoader>();

  const todoActions = actions.filter((action) =>
    canCompleteAction(action, action.relation)
  );
  const newActions = actions.filter(
    (action) =>
      action.relation === "none" && action.status === "gathering_commitments"
  );

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
      {isAuthenticated && (
        <NavbarHorizontal
          todoActions={todoActions.length + newActions.length}
        />
      )}
      <Outlet />
      {isFeatureEnabled(Features.BugReporting) && <BugReportButton />}
    </>
  );
}

export function setRevalidate() {
  localStorage.setItem(revalidateKey, "true");
}

export function shouldRevalidate({}: ShouldRevalidateFunctionArgs) {
  return localStorage.getItem(revalidateKey) === "true";
}
