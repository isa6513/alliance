export interface ExampleActionCategoryCardProps {
  title: string;
  description: string;
  example: string;
}

const ExampleActionCategoryCard: React.FC<ExampleActionCategoryCardProps> = ({
  title,
  description,
  example,
}: ExampleActionCategoryCardProps) => {
  return (
    <div className="flex flex-col border border-zinc-200 rounded p-4 md:p-5 bg-white">
      <p className="text-base text-green font-semibold">{title}</p>
      <p className="text-base text-zinc-900">{description}</p>

      <p className="text-base text-zinc-500 mt-4">{example}</p>
    </div>
  );
};

export default ExampleActionCategoryCard;
