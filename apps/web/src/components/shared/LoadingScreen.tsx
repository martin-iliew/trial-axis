type LoadingScreenProps = {
  label?: string;
};

export default function LoadingScreen({
  label = "Loading session...",
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6">
      <div className="rounded-full border border-primary bg-surface-level-1 px-4 py-2 text-sm font-medium text-secondary">
        {label}
      </div>
    </div>
  );
}
