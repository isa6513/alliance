import React from "react";
import { href, Link } from "react-router";
import { useActionUpdates } from "@alliance/shared/lib/informationPage";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import ActionUpdateCard from "@alliance/sharedweb/ui/ActionUpdateCard";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";

const InformationPage: React.FC = () => {
  useWhiteBackground();

  const { updates, error } = useActionUpdates();

  const publicResources = [
    {
      href: href("/guide"),
      title: "Guide to the Alliance",
    },
    {
      href: href("/foundation"),
      title: "Foundation",
    },
    {
      href: href("/governance"),
      title: "Governance",
    },
    {
      href: href("/faq"),
      title: "FAQ",
    },
  ];

  const memberResources = [
    {
      href: href("/members"),
      title: "Member directory",
    },
    {
      href: href("/groups-guide"),
      title: "About groups",
    },
    {
      title: "Email the office",
      href: "mailto:contact@worldalliance.org",
    },
  ];

  return (
    <CenterLayout>
      <div className="gap-y-4 flex flex-col text-base md:text-lg">
        <p className="font-serif text-3xl md:text-4xl font-semibold mb-4">
          Information
        </p>

        <h2 className="text-2xl font-semibold">Resources</h2>

        <div className="flex flex-col gap-y-2">
          <p className="text-zinc-500">Public resources</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 grid-flow-row">
            {publicResources.map((resource) => (
              <div key={resource.href}>
                <Link to={resource.href} className="text-link">
                  {resource.title}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <p className="text-zinc-500">Member resources</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 grid-flow-row">
            {memberResources.map((resource) => (
              <div key={resource.href}>
                <Link to={resource.href} className="text-link">
                  {resource.title}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col mt-4">
          <h2 className="text-2xl font-semibold">Roadmap</h2>
          <p className="text-zinc-500">Last updated 2/11/2026</p>
        </div>
        <div className="flex flex-col gap-y-2">
          <p>
            We are in an experimental, invite-only phase. We are working up to a
            public launch in which we will allow anyone to join the Alliance. In
            general, this preparation entails:
          </p>

          <ul className="list-disc list-inside">
            <li>
              <span className="font-semibold">
                Ensuring that our action production process is smooth and
                reliable.
              </span>{" "}
              This includes understanding what makes actions effective and,
              eventually, hiring experts in fields relevant to our priorities.
            </li>
            <li>
              <span className="font-semibold">
                Building organizational structures and processes that help
                members contribute reliably and straightforwardly.
              </span>{" "}
              This includes designing Alliance groups and determining our
              governance procedures.
            </li>
            <li>
              <span className="font-semibold">
                Developing a functional and accessible online platform.
              </span>{" "}
              This includes improving our platform based on early members&apos;
              feedback and testing it with a wider, more global audience.
            </li>
          </ul>
        </div>
        <div className="flex flex-col mt-4">
          <p>Right now, the office is:</p>
          <ul className="list-disc list-inside">
            <li>
              Developing processes so that group leads can help and communicate
              with other group leads.
            </li>
            <li>Developing a mobile app.</li>
            <li>Reorganizing our information and action pages.</li>
            <li>
              Planning videos and textual updates that help members better
              understand the Alliance.
            </li>
            <li>Hiring.</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mt-4">Action updates</h2>

        <div className="flex flex-col gap-y-4 text-base">
          {updates
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((update) => (
              <ActionUpdateCard
                key={update.id}
                update={update}
                onActionPageTimeline={false}
              />
            ))}
          {error && <p className="text-zinc-500">{error}</p>}
        </div>
      </div>
    </CenterLayout>
  );
};

export default InformationPage;
