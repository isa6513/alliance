import {
  ActionActivityDto,
  ActionDto,
  actionsFindAll,
  actionsMyActivity,
  authMe,
  forumFindAllPosts,
  PostDto,
  ProfileDto,
  UserActionRelation,
  userMyProfile,
} from "@alliance/shared/client";
import { Features } from "@alliance/shared/lib/features";
import { useEffect, useState } from "react";
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "react-router";
import BugReportButton from "./components/BugReportButton";
import { useAuth } from "./lib/AuthContext";
import { isFeatureEnabled } from "./lib/config";

export interface RouteMatch {
  data: unknown;
  id: string;
}

export interface RouteMatches {
  matches: RouteMatch[];
}

export type ActionWithRelation = ActionDto & {
  relation?: UserActionRelation;
};

export interface LoaderData {
  actionData: Promise<ActionLoaderData | null>;
  posts: Promise<PostDto[]>;
  profile: Promise<ProfileDto | null>;
}

export interface ActionLoaderData {
  actions: ActionWithRelation[] | null;
  relations: Map<number, UserActionRelation> | null;
  activities: Map<number, ActivitiesForAction> | null;
  loading: boolean;
}

export interface ActivitiesForAction {
  join: ActionActivityDto | null;
  completion: ActionActivityDto | null;
}

export interface AppLayoutOutletContext {
  actions: ActionWithRelation[];
  relations: Map<number, UserActionRelation> | null;
  activities: Map<number, ActivitiesForAction> | null;
  posts: PostDto[];
  profile: ProfileDto | null;
}

const revalidateKey = "revalidate";

export function clientLoader() {
  localStorage.setItem(revalidateKey, "false");

  const result: Promise<ActionLoaderData | null> = Promise.all([
    actionsFindAll(),
    actionsMyActivity(),
  ]).then(([actions, activities]) => {
    if (!activities.data || !actions.data) {
      return {
        actions: actions.data ?? null,
        relations: null,
        activities: null,
        loading: false,
      };
    }

    const activityList = activities.data;
    const actionToRelationMap = new Map<number, UserActionRelation>();

    if (activities.data) {
      for (const action of actions.data) {
        actionToRelationMap.set(action.id, "none");
      }
    }
    const completionActivities = activityList.filter(
      (activity) => activity.type === "user_completed"
    );
    const joinActivities = activityList.filter(
      (activity) => activity.type === "user_joined"
    );
    const declineActivities = activityList.filter(
      (activity) =>
        activity.type === "user_declined" ||
        activity.type === "user_wont_complete"
    );

    joinActivities.forEach((activity) => {
      actionToRelationMap.set(activity.actionId, "joined");
    });

    declineActivities.forEach((activity) => {
      actionToRelationMap.set(activity.actionId, "declined");
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

    // for most users draft actions will be filtered out on server. extra filter just makes admin users not see extra actions
    const actionsWithRelation = actions.data
      ?.filter((action) => action.status !== "draft")
      .map((action) => ({
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
      actions: actionsSortedByDate,
      relations: actionToRelationMap,
      activities: activitiesForAction,
      loading: false,
    };
  });

  const posts = forumFindAllPosts().then((response) => response.data ?? []);

  const profile = userMyProfile().then((response) => response.data ?? null);

  return {
    actionData: result,
    posts,
    profile,
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
      <p className="text-zinc-500">Loading data...</p>
    </div>
  );
}

const authOnlyRoutes = [
  "tasks",
  "settings",
  "profile",
  "onboarding",
  "members",
];

export function isAuthOnly(path: string) {
  if (authOnlyRoutes.includes(path)) {
    return true;
  }
  if (path.includes("/forum")) {
    return true;
  }
}
export default function AppLayout() {
  const { isAuthenticated, loading, logout } = useAuth();

  const {
    actionData: actionDataLoader,
    posts: postsLoader,
    profile: profileLoader,
  } = useLoaderData<typeof clientLoader>();

  const [actions, setActions] = useState<ActionWithRelation[]>([]);
  const [relations, setRelations] = useState<Map<
    number,
    UserActionRelation
  > | null>(null);
  const [activities, setActivities] = useState<Map<
    number,
    ActivitiesForAction
  > | null>(null);
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [profile, setProfile] = useState<ProfileDto | null>(null);

  useEffect(() => {
    actionDataLoader.then((data) => {
      if (data?.actions) {
        setActions(data.actions);
      }
      if (data?.relations) {
        setRelations(data.relations);
      }
      if (data?.activities) {
        setActivities(data.activities);
      }
    });

    postsLoader.then((data) => {
      if (data) {
        setPosts(data);
      }
    });

    profileLoader.then((data) => {
      if (data) {
        setProfile(data);
      }
    });
  }, [actionDataLoader, postsLoader, profileLoader]);

  const navigate = useNavigate();
  const navigation = useNavigation();

  const isNavigating = Boolean(navigation.location);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("was-logged-in", "true");
    }

    const wasLoggedIn = localStorage.getItem("was-logged-in") === "true";

    const handleUnauthorized = () => {
      console.log("handleUnauthorized", window.location.pathname);
      console.log("isNavigating", isNavigating);
      console.log(
        "authOnlyRoutes.includes(window.location.pathname)",
        authOnlyRoutes.includes(window.location.pathname)
      );
      if (
        !window.location.pathname.includes("/login") &&
        !isNavigating &&
        (isAuthOnly(window.location.pathname) || wasLoggedIn)
      ) {
        console.log("unauthorized, logging out");
        logout();
        navigate("/login?redirect=" + window.location.pathname);
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    authMe();
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [isAuthenticated, loading, navigate, isNavigating, logout]);

  return (
    <>
      <Outlet
        context={
          {
            actions,
            relations,
            activities,
            posts,
            profile,
          } satisfies AppLayoutOutletContext
        }
      />
      {isFeatureEnabled(Features.BugReporting) && <BugReportButton />}
    </>
  );
}

export function setRevalidate() {
  localStorage.setItem(revalidateKey, "true");
}

// export function shouldRevalidate({}: ShouldRevalidateFunctionArgs) {
//   return localStorage.getItem(revalidateKey) === "true";
// }
