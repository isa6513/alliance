import React from "react";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import InfoSubpage from "../../components/InfoSubpage";

const GovernancePage: React.FC = () => {
  useWhiteBackground();

  return (
    <InfoSubpage>
      <div className="min-w-0 flex-1 max-w-3xl flex flex-col">
        <div className="flex flex-col gap-y-12 text-base md:text-lg text-zinc-900">
          <section className="gap-y-4 flex flex-col">
            <h1 id="about" className="text-title">
              Alliance governance
            </h1>
            <p>
              Membership in the Alliance is voluntary. All power that the
              Alliance holds is continuously, explicitly entrusted to it by
              members. Members who substantially disapprove of the Alliance can
              easily leave.
            </p>
            <p>
              As a result, the basic structure of the Alliance holds the office
              accountable to members.
            </p>

            <p>
              We hope this basic accountability means the office will direct the
              Alliance in a manner that most members approve of. We also hope
              that this basic accountability will allow for simple governance
              that enables the office to advance our shared priorities in the
              ways that it deems effective.
            </p>

            <p>
              However, we also need a process that allows members to express
              disapproval of the Alliance, and expect changes, rather than leave
              immediately. If a large fraction of members substantially
              disapprove of the Alliance, then it would likely be good for the
              Alliance to change.
            </p>

            <p>
              As a result, the Alliance runs a regular, membership-wide
              oversight process, which currently consists of a single oversight
              question that measures overall approval of the Alliance:
            </p>

            <div className="flex flex-col gap-y-2 bg-zinc-50 p-6 rounded border border-zinc-200 my-2">
              <p>Which do you prefer?</p>
              <ul className="list-disc list-inside pl-4 space-y-2">
                <li>I prefer the Alliance to continue to operate.</li>
                <li>
                  I prefer the Alliance to stop planning and running all actions
                  until it changes how it operates.
                </li>
              </ul>
            </div>
            <p>
              If more than 1/4th of members prefer the Alliance to stop planning
              and running all actions until it changes how it operates, the
              Alliance will do so until less than 1/4th of members have this
              preference. In extreme cases, this might involve the office, and
              approving members, concluding that it is better to part ways with
              those members than to continue to pause actions.
            </p>
            <p>
              It is inevitable that some members will be assigned tasks whose
              justifications they do not agree with. Given the urgency of global
              crises, it is important that we collectively prioritize action
              over perfect consensus. However, as per the membership contract,
              if a member believes the task to be immoral, they can choose to
              withdraw from the task.
            </p>
            <p>
              In addition to formal governance, the office incorporates member
              input by other means. For instance, the office regularly hosts
              membership-wide discussions, randomly samples members for opinions
              on internal procedures, solicits open-ended feedback on tasks, and
              so on.
            </p>
          </section>
        </div>
      </div>
    </InfoSubpage>
  );
};

export default GovernancePage;
