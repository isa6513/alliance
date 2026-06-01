import { SignUpDto } from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/sharedweb/ui/Button";
import FormInput from "@alliance/sharedweb/ui/FormInput";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useCallback, useRef, useState } from "react";
import { getTurnstileSiteKey } from "../lib/config";

export interface SignupFormProps {
  onSubmit: (formData: SignUpDto) => void;
  loading: boolean;
  submitButtonText?: string;
  referralCode?: string | null;
  /** When true, inputs and submit are non-interactive (e.g. invite link preview). */
  disabled?: boolean;
}
const SignupForm = ({
  onSubmit,
  loading,
  submitButtonText = "Sign up",
  referralCode,
  disabled = false,
}: SignupFormProps) => {
  const [formData, setFormData] = useState<
    SignUpDto & { confirmPassword: string }
  >({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mode: "cookie",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const turnstileSiteKey = getTurnstileSiteKey();
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(
    undefined,
  );
  const [turnstileError, setTurnstileError] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const retryTurnstile = useCallback(() => {
    setTurnstileError(false);
    setTurnstileToken(undefined);
    turnstileRef.current?.reset();
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (disabled) {
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setFieldErrors({
          confirmPassword: "Passwords do not match",
        });
        console.log("Passwords do not match");
        return;
      }

      onSubmit({
        ...formData,
        referralCode: referralCode || undefined,
        turnstileToken,
      });

      // Turnstile tokens are single-use; fetch a fresh one for any retry.
      if (turnstileSiteKey) {
        setTurnstileToken(undefined);
        turnstileRef.current?.reset();
      }
    },
    [
      onSubmit,
      formData,
      referralCode,
      disabled,
      turnstileToken,
      turnstileSiteKey,
    ],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormInput
        label="Full name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        placeholder="John Doe"
        required
        name="name"
        error={fieldErrors.name}
        className="text-[16px]"
        inputClassName="text-[16px]"
        disabled={disabled}
      />

      <FormInput
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="your@email.com"
        required
        name="email"
        error={fieldErrors.email}
        className="text-[16px]"
        inputClassName="text-[16px]"
        disabled={disabled}
      />

      <FormInput
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        name="password"
        error={fieldErrors.password}
        className="text-[16px]"
        inputClassName="text-[16px]"
        disabled={disabled}
      />

      <FormInput
        label="Confirm password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        name="confirmPassword"
        error={fieldErrors.confirmPassword}
        className="text-[16px]"
        inputClassName="text-[16px]"
        disabled={disabled}
      />

      {turnstileSiteKey && (
        <div>
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={(token) => {
              setTurnstileToken(token);
              setTurnstileError(false);
            }}
            onExpire={() => setTurnstileToken(undefined)}
            onError={() => {
              setTurnstileToken(undefined);
              setTurnstileError(true);
            }}
            options={{ size: "flexible" }}
          />
          {turnstileError && (
            <p className="mt-2 text-[14px] text-red-600">
              Couldn&apos;t load the verification challenge. Check your
              connection or any ad blockers, then{" "}
              <button
                type="button"
                onClick={retryTurnstile}
                className="underline"
              >
                try again
              </button>
              .
            </p>
          )}
        </div>
      )}

      <div className="pt-2">
        <Button
          color={ButtonColor.Black}
          className="w-full flex justify-center text-center  justify-self-center pb-2 text-[16px]"
          type="submit"
          disabled={
            loading ||
            disabled ||
            (Boolean(turnstileSiteKey) && !turnstileToken)
          }
        >
          {loading ? "Creating account..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default SignupForm;
