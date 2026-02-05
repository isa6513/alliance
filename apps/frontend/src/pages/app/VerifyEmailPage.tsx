import { userVerifyEmail } from "@alliance/shared/client";
import { useEffect, useState } from "react";
import { Link, href } from "react-router";

const VerifyEmailPage = () => {
  const token = new URLSearchParams(window.location.search).get("token");
  console.log(token);

  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (token) {
      const verifyEmail = async () => {
        const resp = await userVerifyEmail({ body: { token } });
        if (resp.response.ok) {
          setVerified(true);
        } else {
          console.error(resp.error);
        }
      };
      verifyEmail();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {verified ? (
        <p>Your email has been verified.</p>
      ) : (
        <p>Verifying email...</p>
      )}
      <Link to={href("/tasks")} className="text-link">
        Go home
      </Link>
    </div>
  );
};

export default VerifyEmailPage;
