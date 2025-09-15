export interface ExampleActionCategoryCardProps {
  title: string;
  description: string;
}

const ExampleActionCategoryCard: React.FC<ExampleActionCategoryCardProps> = ({
  title,
  description,
}: ExampleActionCategoryCardProps) => {
  return (
    <div className="flex flex-col border border-zinc-200 rounded p-4 md:p-5 bg-white">
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-lg text-zinc-900">{description}</p>
    </div>
  );
};

export default ExampleActionCategoryCard;
