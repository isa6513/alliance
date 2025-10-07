import { useEffect } from "react";

const TestError = () => {
  useEffect(() => {
    throw new Error(`Test error ${Date.now().toString()}`);
  }, []);

  return <div>Test error</div>;
};

export default TestError;
