import { authRegister, SignUpDto } from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import Card from "@alliance/shared/ui/Card";
import { useCallback, useEffect, useRef, useState } from "react";
import SignupForm from "./SignupForm";

export interface ActionCommitButtonProps {
  committed: boolean;
  isAuthenticated: boolean;
  onCommit: () => void;
}

const ActionCommitButton = ({
  committed,
  isAuthenticated,
  onCommit,
}: ActionCommitButtonProps) => {
  const handleClick = () => {
    if (committed) {
      return;
    }
    if (isAuthenticated) {
      onCommit();
    } else {
      setPanelOpen(true);
    }
  };

  const cardRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setPanelOpen(false);
    }
  };

  const onSignupSubmit = useCallback(
    async (formData: SignUpDto) => {
      setLoading(true);

      const registerResponse = await authRegister({ body: formData });

      if (registerResponse.response.ok) {
        onCommit();
        setPanelOpen(false);
      } else {
        console.error(registerResponse);
      }

      setLoading(false);
    },
    [onCommit]
  );

  useEffect(() => {
    if (isAuthenticated) {
      setPanelOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAuthenticated]);

  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (committed) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={committed}
        color={ButtonColor.Black}
        className={`${
          committed ? "!bg-[#008000]" : ""
        } w-full !py-3 !text-base`}
      >
        {committed
          ? "Participation confirmed"
          : isAuthenticated
          ? "Confirm participation"
          : "Participate in this action"}
      </Button>
      {panelOpen && (
        <Card
          className="absolute top-[100%] right-0 mt-2 min-w-[400px] p-8 shadow-md/5"
          ref={cardRef}
        >
          <p className="">
            To join this action on the Alliance, we&apos;ll need some basic info
            from you first{" "}
            <span className="text-gray-500">
              (or{" "}
              <a href="/login" className="text-blue-500">
                login
              </a>{" "}
              if you&apos;re already a member)
            </span>
          </p>
          <SignupForm
            onSubmit={onSignupSubmit}
            loading={loading}
            submitButtonText="Sign up and join"
          />
        </Card>
      )}
    </div>
  );
};

export default ActionCommitButton;
