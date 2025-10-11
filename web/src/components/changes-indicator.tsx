interface ChangesIndicatorProps {
  isVisible: boolean;
  className?: string;
}

/**
 * A small visual indicator that shows when code has been updated.
 */
export function ChangesIndicator({ isVisible, className = '' }: ChangesIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`w-3 h-3 bg-green-500 rounded-full animate-pulse ${className}`}
      title="Project files have been updated"
      aria-label="Project files have been updated"
    />
  );
}
