import { Outlet, useOutletContext, useRouteLoaderData } from "react-router";
import { TaskPanelContext } from "./ActionTaskPanel";
import { Features } from "@alliance/shared/lib/features";
import ActionForumPosts from "./ActionForumPosts";
import { getImageSource, isFeatureEnabled } from "../lib/config";
import ReactMarkdown from "react-markdown";
import { loader as actionLoader } from "../pages/app/ActionPage";

const ActionContents = () => {
  const context = useOutletContext<TaskPanelContext>();
  const action = useRouteLoaderData<typeof actionLoader>(
    "pages/app/ActionPage"
  );
  if (!action) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-3 flex-2 px-5 pl-10">
      {action?.image && (
        <img
          src={getImageSource(action.image)}
          className="w-full h-auto rounded-md border border-gray-300 max-h-[200px] object-cover"
        />
      )}
      <div className="flex flex-row justify-between items-start mt-5 mb-2">
        <div className="flex flex-col gap-y-3">
          {action !== undefined && (
            <div>
              <h1 className="font-adobe">{action.name}</h1>
              {/* <p className="text-zinc-700 mt-3">{action.shortDescription}</p> */}
            </div>
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
