import { authMe, authRegister, SignUpDto } from "@alliance/shared/client";
import { Features } from "@alliance/shared/lib/features";
import Card, { CardStyle } from "@alliance/shared/ui/Card";
import posthog from "posthog-js";
import React, { useState } from "react";
import { Link, useSearchParams } from "react-router";
import SignupForm from "../../components/SignupForm";
import { isFeatureEnabled } from "../../lib/config";

const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const referralCode = searchParams.get("ref");

  const handleSubmit = async (formData: SignUpDto) => {
    setError(null);
    setLoading(true);

    try {
      const resp = await authRegister({ body: formData });
      if (resp.response.ok) {
        const checkAuth = await authMe();

        if (checkAuth.response.ok) {
          const user = checkAuth.data;
          if (user) {
            posthog.identify(user.id.toString(), {
              email: user.email,
              name: user.name,
            });
            posthog.capture("new_user", {
              email: user.email,
              name: user.name,
            });
          }
          window.location.href = "/tasks";
        } else {
          setError("please try again");
        }
      } else {
        setError((resp.error as Error).message || "Registration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isFeatureEnabled(Features.PublicSignup) && !referralCode) {
    return (
      <div className="min-h-screen flex flex-col bg-page">
        <div className="flex flex-col flex-grow items-center justify-center ">
          <div className="w-full max-w-md px-8">
            <p className="font-bold !mb-2">
              The Alliance is currently invite-only.
            </p>
            <p>If you recieved an invite link, please use it to sign up.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <div className="flex flex-col flex-grow items-center justify-center ">
        <div className="w-full max-w-md px-8">
          <h2 className="font-serif !text-3xl text-center mb-8">
            Create an account
          </h2>

          {error && (
            <Card
              style={CardStyle.Alert}
              className="border-red-400 bg-red-50 mb-6"
            >
              <span className="text-red-700">{error}</span>
            </Card>
          )}

          <Card className="p-8 relative" style={CardStyle.White}>
            <SignupForm
              onSubmit={handleSubmit}
              loading={loading}
              referralCode={referralCode}
            />
          </Card>
          <div className="mt-6 text-center">
            <p className="text-[11pt] text-zinc-600">
              Already have an account?{" "}
              <Link to="/login" className="text-green hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
