interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="rounded border border-red-700 bg-red-900/30 p-4">
      <p className="text-sm text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-xs text-red-400 underline hover:text-red-200"
        >
          Try again
        </button>
      )}
    </div>
  );
}
