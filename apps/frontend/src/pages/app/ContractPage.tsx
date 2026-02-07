import { userSignContract, userSuspendContract } from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import React, { useEffect, useState } from "react";
import MemberContract from "../../components/MemberContract";
import FormInput from "@alliance/sharedweb/ui/FormInput";
import { useAuth } from "../../lib/AuthContext";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";
import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import {
  ContractEventState,
  getLastContractEvent,
  getSuspensionMessage,
  getSignedMessage,
} from "@alliance/shared/lib/contract";
import { suspendContractConfirmation } from "@alliance/shared/lib/copy";

const ContractPage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [editName, setEditName] = useState("");

  const [lastContractEvent, setLastContractEvent] =
    useState<ContractEventState>(null);

  useEffect(() => {
    if (user) {
      setLastContractEvent(getLastContractEvent(user.contractEvents));
    }
  }, [user]);

  const handleContractSign = async () => {
    try {
      const res = await userSignContract();
      if (res.data) {
        setLastContractEvent({
          type: "signed",
          date: res.data,
          automatic: false,
        });
        await refreshUser();
      }
    } catch (error) {
      console.error("Error signing contract:", error);
      alert("There was an error signing the contract. Please try again.");
    }
  };

  const handleContractSuspend = async () => {
    try {
      if (!window.confirm(suspendContractConfirmation)) {
        return;
      }

      const res = await userSuspendContract();
      if (res.data) {
        setLastContractEvent({
          type: "suspended",
          date: res.data,
          automatic: false,
        });
        await refreshUser();
      }
    } catch (error) {
      console.error("Error suspending contract:", error);
      alert("There was an error suspending the contract. Please try again.");
    }
  };

  return (
    <CenterLayout>
      <div className="gap-y-2 flex flex-col text-base md:text-lg">
        <p className="font-serif text-3xl md:text-4xl font-semibold mb-4">
          Membership contract
        </p>

        <MemberContract />

        {lastContractEvent?.type !== "signed" && (
          <div className="flex flex-row mt-2 w-full">
            <FormInput
              name="name"
              type="text"
              placeholder="Type your full name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleContractSign}
              color={ButtonColor.Black}
              className="ml-2 !h-auto px-6"
            >
              Sign
            </Button>
          </div>
        )}
        {lastContractEvent?.type === "signed" && (
          <div className="mt-4 flex flex-col gap-y-2 sm:flex-row justify-between sm:items-center">
            <p className="text-green">
              {getSignedMessage(lastContractEvent.date)}
            </p>
          </div>
        )}
        <div className="mt-4 flex flex-col gap-y-2 text-[16px]">
          <div>
            <h2 className="font-semibold mt-2 text-black">
              What happens if I don&apos;t follow the contract?
            </h2>
            <p className="text-zinc-900">
              If you miss 3 or more of the last 10 tasks you were assigned, your
              contract will be suspended automatically. You can re-sign the
              contract to re-join the Alliance.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mt-2 text-black">
              How do I end my membership?
            </h2>
            <p className="text-zinc-900">
              You can end your membership at any time by suspending your
              contract.
            </p>
            {lastContractEvent?.type === "signed" && (
              <Button
                onClick={handleContractSuspend}
                color={ButtonColor.Red}
                className="mt-4"
              >
                Suspend contract
              </Button>
            )}
            {lastContractEvent?.type === "suspended" && (
              <Card style={CardStyle.Red} className="mt-4 text-base">
                <p>
                  {getSuspensionMessage(
                    lastContractEvent.date,
                    lastContractEvent.automatic
                  )}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </CenterLayout>
  );
};

export default ContractPage;
