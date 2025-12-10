import CenterLayout from "@alliance/shared/ui/CenterLayout";
import CheckIcon from "@alliance/shared/ui/icons/CheckIcon";

const PublicActionCompletedPage = () => {
  return (
    <CenterLayout className="h-screen">
      <div className="flex flex-col items-center justify-center flex-1 gap-y-2">
        <CheckIcon size="large" />
        <p className="text-xl font-bold">Action Completed</p>
        <p>Thanks for participating!</p>
      </div>
    </CenterLayout>
  );
};

export default PublicActionCompletedPage;
