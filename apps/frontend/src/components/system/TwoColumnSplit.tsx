export interface TwoColumnSplitProps {
  left: React.ReactNode;
  right: React.ReactNode;
  coloredLeft?: boolean;
  coloredRight?: boolean;
  collapseRight?: boolean;
  bg?: string;
  border?: boolean;
}

const TwoColumnSplit = ({
  left,
  right,
  coloredLeft = false,
  coloredRight = false,
  collapseRight = true,
  border = true,
  bg = "bg-page",
}: TwoColumnSplitProps) => {
  return (
    <div className={bg}>
      <div
        className={`flex flex-row w-full h-full px-4 md:px-0 gap-x-4 md:gap-x-6 lg:gap-x-10 justify-center max-w-[1250px] mx-auto py-10 ${
          coloredRight ? "bg-green" : ""
        }`}
      >
        <div
          className={`flex flex-col flex-1 ${
            border ? "sm:border-r border-stone-300" : ""
          } items-stretch ${coloredLeft ? "bg-green" : ""}`}
        >
          {left}
        </div>
        <div
          className={`flex-col items-stretch w-[300px] lg:w-[400px] h-full ${
            coloredRight ? "bg-[#eee]" : ""
          } ${collapseRight ? "hidden sm:flex" : ""}`}
        >
          {right}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnSplit;
