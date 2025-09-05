import Card, { CardStyle } from "@alliance/shared/ui/Card";
import React from "react";

const ContractPage: React.FC = () => {
  return (
    <div className="flex flex-col max-w-3xl mx-auto p-3 pt-16 md:pt-12">
      <div className="gap-y-2 flex flex-col text-lg">
        <p className="font-adobe text-3xl font-semibold">Contract</p>
        <Card className="" style={CardStyle.LightGrey} id="contract">
          <div className="text-lg p-2">
            <p className="font-semibold mb-2">Membership contract</p>
            <ol className="list-decimal list-inside mb-2 flex flex-col gap-y-2">
              <li>
                Members will lend a dependable, finite amount of time/resources
                to the Alliance, which the strategic office can count on in
                planning future actions.
                <ol className="ml-6 list-[lower-roman] list-inside my-2 flex flex-col gap-y-2">
                  <li>
                    In this current experimental phase, the total time required
                    is{" "}
                    <span className="bg-amber-100">
                      1 hour/month, broken into 15-minute tasks per week
                    </span>
                    .
                  </li>
                  <li>
                    As the Alliance matures, the required time or resources may
                    increase, but it will do so with ample notice and democratic
                    input.
                  </li>
                </ol>
              </li>
              <li>
                Members will participate in all actions for which the strategic
                office deems they are needed. Members will not be required to
                take an action if they find it either immoral or they are
                incapable of fulfillment due to external circumstances(e.g.
                medical exemption, family emergency, or religious observance).
              </li>
              <li>
                Members, as defined by those who have a track record of reliable
                participation (participate in more than 80% of actions they are
                asked to complete), have a say in Alliance&nbsp;
                <a href="#governance" className="text-link">
                  governance
                </a>
                .
              </li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContractPage;
