import React from "react";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import { Link, href } from "react-router";
import groupPillsExample from "../../assets/group-pills-example.png";

const GroupsGuidePage: React.FC = () => {
  useWhiteBackground();

  return (
    <CenterLayout>
      <div className="gap-y-4 flex flex-col text-base md:text-lg text-zinc-900">
        <Link to={href("/groups")} className="text-link hover:underline mb-2">
          ← Back to Groups
        </Link>
        <p className="font-serif text-3xl md:text-4xl font-semibold mb-4 text-black">
          About groups
        </p>
        <p>
          The Alliance is organized into{" "}
          <span className="font-semibold">accountability groups</span>.
        </p>
        <p>
          <span className="font-semibold">Group leads</span> are responsible for
          ensuring <span className="font-semibold">group members</span> complete
          their tasks on time. Group members are accountable to their lead.
        </p>
        <p>
          Accountability groups are intended to help the Alliance build a
          culture of trust and reliability, as well as to provide support to
          members.
        </p>
        <div className="flex flex-col items-center justify-center gap-y-2">
          <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-zinc-50 rounded">
            <img
              src={groupPillsExample}
              alt="Group pills example"
              className="w-full h-auto border border-zinc-200 rounded"
            />
          </div>
          <p className="text-zinc-500 text-sm text-center">
            Group leads can easily view the progress of their group members.
          </p>
        </div>

        <h2 className="mt-2 text-2xl font-semibold text-black">
          Leading a group
        </h2>
        <h3 className="text-xl font-semibold text-black mt-2">
          Responsibilities
        </h3>
        <p>
          The main responsibility of a group lead is to ensure the members of
          their group complete their tasks on time.
        </p>
        <p>
          Group leads also serve as informal guides to the Alliance for their
          group members. For example, they sometimes clarify tasks or tell
          members about features on the platform.
        </p>
        <p>
          Any member of the Alliance can create and lead an accountability
          group. Group leads can, but are not expected to, be members of another
          accountability group.
        </p>
        <h3 className="text-xl font-semibold mt-2 text-black">
          Should I lead a group?
        </h3>

        <p>There are two main reasons to lead a group:</p>
        <ol className="list-decimal list-inside pl-4 space-y-1">
          <li>
            <span className="font-semibold">
              You want to invite new members.
            </span>{" "}
            In this case, your group can be temporary: once your members become
            familiar with the Alliance, they can transfer to other groups or
            start their own.
          </li>
          <li>
            <span className="font-semibold">
              You want to help the Alliance.
            </span>{" "}
            In this case, you can start a long-term group that anyone can join.
          </li>
        </ol>
        <p>
          Running a small, temporary group is a good way to learn whether you
          are interested in running a larger, long-term group.
        </p>
        <p>
          Current group leads report spending{" "}
          <span className="font-semibold">5–30 minutes</span> running their
          groups per week.
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-black">
          Being a member of a group
        </h2>

        <p>
          You can only be a member of one accountability group. Being a member
          of an accountability group is strongly encouraged, but not required.
        </p>
        <h3 className="text-xl font-semibold mt-2 text-black">
          Joining and leaving groups
        </h3>

        <p>
          When a new member joins the Alliance, they are placed in an
          accountability group. The inviting member may either add them to their
          own group or request that they be assigned to another group.
        </p>

        <p>
          At any time (
          <Link to={href("/groups")} className="text-link hover:underline">
            Groups
          </Link>{" "}
          &gt; My groups &gt; Manage groups ), you can:
        </p>
        <ol className="list-decimal list-inside pl-4 space-y-1">
          <li>Leave your current group.</li>
          <li>Join a public group.</li>
          <li>Request to be assigned to different group.</li>
        </ol>

        <h3 className="text-xl font-semibold mt-2 text-black">
          Group assignment
        </h3>
        <p>
          A semi-automatic assignment process runs when a group member asks to
          be reassigned, or a new member joins the Alliance and the inviting
          member does not lead a group.
        </p>
        <p>
          In most cases, a staff member will manually assign the member to a
          group with available space. This may take 3-5 days. If there are no
          groups with available space, then the member will not be assigned to a
          group until space becomes available.
        </p>
        <p>
          If a new member joins the Alliance and the inviting member does not
          lead a group, we will first check whether there is space in the
          inviting member’s lead’s group.
        </p>
      </div>
    </CenterLayout>
  );
};

export default GroupsGuidePage;
