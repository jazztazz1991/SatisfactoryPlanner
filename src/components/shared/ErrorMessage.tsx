interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert" className="rounded-xl border border-danger/30 bg-danger-muted p-4">
      <p className="text-sm text-danger-light">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-xs text-danger underline hover:text-danger-light transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
