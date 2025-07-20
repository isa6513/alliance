export interface CompletedBarProps {
  percentage: number;
}

const CompletedBar: React.FC<CompletedBarProps> = ({
  percentage,
}: CompletedBarProps) => {
  return (
    <div className="w-full h-3 bg-zinc-100 rounded-[3px] mt-1">
      <div
        className="h-3 bg-green-600 rounded-[3px]"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default CompletedBar;
