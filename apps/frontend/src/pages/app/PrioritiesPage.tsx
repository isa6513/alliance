import React from "react";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import InfoSubpage from "../../components/InfoSubpage";
import { alliancePriorities } from "../../lib/alliancePriorities";

const PrioritiesPage: React.FC = () => {
  useWhiteBackground();

  const tocSections = alliancePriorities.map((p) => ({
    id: p.id,
    label: p.title,
    level: 2 as const,
  }));

  return (
    <InfoSubpage tocSections={tocSections}>
      <section className="gap-y-4 flex flex-col">
        <h1 id="priorities" className="text-title">
          Priorities
        </h1>
        <p>
          The Alliance is founded on a moral principle shared by nearly all
          cultures: one should not treat others in ways that one does not want
          to be treated.
        </p>

        <p>
          Our modern, interconnected world is shaped by decisions made by
          billions of people. If we do not want others to disregard how their
          decisions impact us, we cannot disregard how our decisions impact
          them.
        </p>

        <p>
          We decided, with twenty-five founding members, to focus the Alliance’s
          efforts on four global crises:
        </p>

        <ul className="list-disc list-inside space-y-2 pl-4">
          {alliancePriorities.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>

        <p>
          To us, these crises represent the most egregious violations of our
          foundational moral principle. They cause, or have the potential to
          cause, enormous harm to billions of people. We believe that these
          crises persist because most people disregard how their decisions
          contribute to them, and some people sustain them intentionally.
        </p>

        {alliancePriorities.map((priority) => (
          <React.Fragment key={priority.id}>
            <h2
              id={priority.id}
              className="mt-2 text-2xl font-semibold text-black"
            >
              {priority.title}
            </h2>
            <p>{priority.description}</p>
          </React.Fragment>
        ))}
      </section>
    </InfoSubpage>
  );
};

export default PrioritiesPage;
