import React from "react";
import { href } from "react-router";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import InfoResourceCard from "../../components/InfoResourceCard";
import { isFeatureEnabled } from "../../lib/config";
import { Features } from "@alliance/shared/lib/features";

const InformationPage: React.FC = () => {
  useWhiteBackground();

  const contacts = [
    {
      title: "Email",
      description: "Email the office with questions, feedback, or ideas.",
      href: "mailto:contact@worldalliance.org",
    },
    {
      title: "Schedule a visit",
      description:
        "Schedule a visit to the Alliance's physical office in San Francisco, CA, USA.",
      href: "mailto:contact@worldalliance.org?subject=Request to visit the office&body=I would like to schedule a visit to the Alliance's physical office on [DATE] at [TIME].",
    },
  ];

  const resources = [
    {
      title: "What is the Alliance?",
      description:
        "The Alliance is a global group of individuals cooperating to improve the world.",
      href: href("/guide"),
    },
    {
      title: "Member directory",
      description: "A list of all members of the Alliance.",
      href: href("/members"),
    },
    {
      title: "Roadmap",
      description:
        "The Alliance is in an experimental phase and building up to a public launch.",
      href: href("/roadmap"),
    },
    {
      title: "How groups work",
      description:
        "The Alliance is organized into groups that help members hold each other accountable.",
      href: href("/groups-guide"),
    },
    {
      title: "How to design actions",
      description: "A basic guide that the office uses to design actions.",
      href: href("/action-design"),
    },
    {
      title: "Action updates",
      description: "Progress updates on our actions.",
      href: href("/action-updates"),
    },
    ...(isFeatureEnabled(Features.GeneralUpdatesLink)
      ? [
          {
            title: "General updates",
            description:
              "Updates about the Alliance's progress as an organization.",
            href: href("/general-updates"),
          },
        ]
      : []),
    {
      title: "Priorities",
      description: "An overview of our current priorities.",
      href: href("/priorities"),
    },
    {
      title: "Governance",
      description:
        "The office plans actions, and members participate in a simple oversight process.",
      href: href("/internal-governance"),
    },
    {
      title: "Terminology",
      description: "Some terms used in the Alliance.",
      href: href("/terminology"),
    },
  ];

  return (
    <CenterLayout>
      <div className="gap-y-12 flex flex-col text-base md:text-lg">
        <p className="font-serif text-3xl md:text-4xl font-semibold">
          Information
        </p>

        <div className="flex flex-col gap-y-6">
          <h2 className="text-2xl font-semibold">Contact the office</h2>

          <div className="grid grid-cols-1 gap-6 grid-flow-row">
            {contacts.map((contact) => (
              <InfoResourceCard key={contact.href} {...contact} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-6">
          <h2 className="text-2xl font-semibold">Resources</h2>

          <div className="grid grid-cols-1 gap-6 grid-flow-row">
            {resources.map((resource) => (
              <InfoResourceCard key={resource.href} {...resource} />
            ))}
          </div>
        </div>
      </div>
    </CenterLayout>
  );
};

export default InformationPage;
