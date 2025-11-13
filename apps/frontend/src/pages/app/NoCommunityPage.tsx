const NoCommunityPage = () => {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-var(--nav-height))]">
      <div className="flex flex-col gap-y-2">
        <p className="font-medium">You are not a member of a community yet</p>
        <p>Check back in later to be added!</p>
      </div>
    </div>
  );
};

export default NoCommunityPage;
