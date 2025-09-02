import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import posthog from "posthog-js";
import { useState } from "react";

const BugReportButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async () => {
    posthog.capture("bug-report", {
      description,
    });
    setIsOpen(false);
    setDescription("");

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="fixed bottom-4 left-4">
      {isOpen ? (
        <div className="padding-2 bg-white border border-zinc-300 rounded-md">
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
          />
          <div className="flex justify-between">
            <p
              className="text-sm text-zinc-500 cursor-pointer px-3 font-avenir"
              onClick={() => setIsOpen(false)}
            >
              x
            </p>
            <Button
              color={ButtonColor.Black}
              className="!p-1 !px-2 !bg-[#222]"
              onClick={onSubmit}
            >
              Submit
            </Button>
          </div>
        </div>
      ) : (
        <Button
          color={ButtonColor.White}
          className="border-black text-black"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          {submitted ? "Thanks!" : "Report issue"}
        </Button>
      )}
    </div>
  );
};

export default BugReportButton;
