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
        className={`flex flex-row w-full h-full justify-center max-w-[1100px] mx-auto py-10 ${
          coloredRight ? "bg-green-1" : ""
        }`}
      >
        <div
          className={`flex flex-col flex-1 ${
            border ? "sm:border-r border-stone-300" : ""
          } items-stretch ${coloredLeft ? "bg-green-1" : ""}`}
        >
          {left}
        </div>
        <div
          className={`flex-col items-stretch max-w-[375px] h-full ${
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
