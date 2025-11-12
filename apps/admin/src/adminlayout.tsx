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
import { Outlet, useRouteLoaderData } from "react-router";
import { useAuth } from "./lib/AuthContext";
import { isStaging } from "@alliance/shared/lib/config";

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

  return {
    actions: actionsWithRelation ?? [],
    relations: actionToRelationMap,
    activities: activitiesForAction,
    posts: posts.data ?? [],
    profile: profile.data ?? null,
  } satisfies LoaderData;
}

export function useAppLoaderData(): LoaderData {
  const data = useRouteLoaderData<typeof clientLoader>("adminlayout");
  if (!data) {
    throw new Error("No data - applayout loader not found");
  }
  return data;
}

export default function AdminLayout() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  if (
    (isAuthenticated && user && !user.admin) ||
    (!isAuthenticated && !loading)
  ) {
    logout();
  }

  return (
    <>
      <Outlet />
      {isStaging() && (
        <div className="fixed top-0 left-0 right-0 h-6 bg-green z-50 flex flex-row gap-1">
          {[...Array(100)].map((_, index) => (
            <span key={index} className="text-white text-sm !font-mono">
              staging
            </span>
          ))}
        </div>
      )}
    </>
  );
}
