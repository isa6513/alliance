const CornerDecorations = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="p-2 border-zinc-300 border rounded-xl relative">
      <div className="absolute -top-2 -right-2 w-3/4 h-3/4 bg-page z-0"></div>
      <div className="absolute -bottom-2 -left-2 w-3/4 h-3/4 bg-page z-0"></div>
      {children}
    </div>
  );
};

export default CornerDecorations;
