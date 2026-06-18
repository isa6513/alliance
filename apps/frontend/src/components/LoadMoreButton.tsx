import Spinner from "@alliance/sharedweb/ui/Spinner";

export interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
}

const LoadMoreButton = ({ onClick, loading = false }: LoadMoreButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-[15px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-default disabled:opacity-60"
  >
    {loading && <Spinner size="small" />}
    Load more
  </button>
);

export default LoadMoreButton;
