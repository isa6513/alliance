import { Outlet, useOutletContext } from "react-router";
import { TaskPanelContext } from "./ActionTaskPanel";
import { Features } from "@alliance/shared/lib/features";
import ActionForumPosts from "./ActionForumPosts";
import { getImageSource, isFeatureEnabled } from "../lib/config";
import ReactMarkdown from "react-markdown";
import { useActionLoaderData } from "../pages/app/ActionPage";

const ActionContents = () => {
  const context = useOutletContext<TaskPanelContext>();
  const action = useActionLoaderData();
  if (!action) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-3 flex-2 px-5 pl-10 pt-5">
      {action?.image && (
        <img
          src={getImageSource(action.image)}
          className="w-full h-auto rounded-md border border-gray-300 max-h-[200px] object-cover mb-5"
        />
      )}
      <div className="flex flex-row justify-between items-start">
        <div className="flex flex-col gap-y-3">
          {action !== undefined && (
            <h1 className="font-adobe">{action.name}</h1>
          )}
        </div>
      </div>
      <Outlet context={context} />
      <div className="my-2">
        <ReactMarkdown>{action?.body}</ReactMarkdown>
      </div>

      <hr className="border-zinc-200" />

      {isFeatureEnabled(Features.Forum) && (
        <ActionForumPosts actionId={action.id} />
      )}
    </div>
  );
};

export default ActionContents;
