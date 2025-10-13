const BasicErrorMessage = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
      <p>{children}</p>
    </div>
  );
};
export default BasicErrorMessage;
