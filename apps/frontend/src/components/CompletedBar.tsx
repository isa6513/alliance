export interface CompletedBarProps {
  percentage: number;
  dark?: boolean;
}

const CompletedBar: React.FC<CompletedBarProps> = ({
  percentage,
  dark = false,
}: CompletedBarProps) => {
  return (
    <div
      className={`w-full h-3 ${
        dark ? "bg-zinc-200" : "bg-zinc-100"
      } rounded-[3px] mt-1`}
    >
      <div
        className="h-3 bg-green rounded-[3px]"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default CompletedBar;
