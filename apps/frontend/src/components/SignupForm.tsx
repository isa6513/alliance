import Button from "@alliance/shared/ui/Button";

import { SignUpDto } from "@alliance/shared/client";
import { ButtonColor } from "@alliance/shared/ui/Button";
import { useCallback, useState } from "react";
import FormInput from "./system/FormInput";

export interface SignupFormProps {
  onSubmit: (formData: SignUpDto) => void;
  loading: boolean;
  submitButtonText?: string;
  referralCode?: string | null;
}
const SignupForm = ({
  onSubmit,
  loading,
  submitButtonText = "Register",
  referralCode,
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

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

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
      });
    },
    [onSubmit, formData, referralCode]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        placeholder="John Doe"
        required
        name="name"
        error={fieldErrors.name}
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
      />

      <FormInput
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        name="password"
        error={fieldErrors.password}
      />

      <FormInput
        label="Confirm password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        name="confirmPassword"
        error={fieldErrors.confirmPassword}
      />

      <div className="pt-2">
        <Button
          color={ButtonColor.Stone}
          className="w-full flex justify-center text-center  justify-self-center pb-2"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default SignupForm;
