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
      className={`w-full ${height} ${dark ? "bg-zinc-200" : "bg-zinc-100"
        } rounded-full outline outline-zinc-200 mt-0.5`}
    >
      {percentage > 0 && (
        <div
          className={`${height} bg-green outline outline-green rounded-full overflow-hidden`}
          style={{ width: `${percentage}%` }}
        ></div>
      )}
    </div>
  );
};

export default CompletedBar;
