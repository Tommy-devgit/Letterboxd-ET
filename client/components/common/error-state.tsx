import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ErrorStateProps = {
  message?: string;
  retry?: () => void;
  className?: string;
};

export function ErrorState({
  message = 'Something went wrong.',
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-xl border border-red-900/30 bg-red-950/20 py-12 text-center',
        className,
      )}
    >
      <AlertCircle className="h-8 w-8 text-red-400" />
      <div>
        <p className="font-semibold text-red-300">Error</p>
        <p className="mt-1 text-sm text-red-400/80">{message}</p>
      </div>
      {retry && (
        <button
          onClick={retry}
          className="rounded-md bg-red-900/40 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-900/60 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
