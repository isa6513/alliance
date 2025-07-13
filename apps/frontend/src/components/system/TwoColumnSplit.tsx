export interface TwoColumnSplitProps {
  left: React.ReactNode;
  right: React.ReactNode;
  coloredLeft?: boolean;
  coloredRight?: boolean;
  bg?: string;
  border?: boolean;
}

const TwoColumnSplit = ({
  left,
  right,
  coloredLeft = false,
  coloredRight = false,
  border = true,
  bg = "bg-page",
}: TwoColumnSplitProps) => {
  return (
    <div className={bg}>
      <div
        className={`flex flex-row min-h-[calc(100vh-49px)] w-full h-full justify-center max-w-[1100px] mx-auto ${
          coloredRight ? "bg-agreen" : ""
        }`}
      >
        <div
          className={`flex flex-col flex-2 ${
            border ? "sm:border-r border-stone-300" : ""
          } items-stretch ${coloredLeft ? "bg-agreen" : ""}`}
        >
          {left}
        </div>
        <div
          className={`flex-col items-stretch flex-1 max-w-[350px] h-full ${
            coloredRight ? "bg-[#eee]" : ""
          } min-h-[calc(100vh-49px)] hidden sm:flex`}
        >
          {right}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnSplit;
