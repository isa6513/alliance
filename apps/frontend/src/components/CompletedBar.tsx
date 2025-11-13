export interface CompletedBarProps {
  percentage: number;
  dark?: boolean;
  height?: string;
}

const CompletedBar: React.FC<CompletedBarProps> = ({
  percentage,
  dark = false,
  height = "h-3",
}: CompletedBarProps) => {
  return (
    <div
      className={`w-full ${height} ${
        dark ? "bg-zinc-200" : "bg-zinc-100"
      } rounded-[3px] mt-1`}
    >
      <div
        className={`${height} bg-green rounded-[3px]`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default CompletedBar;
