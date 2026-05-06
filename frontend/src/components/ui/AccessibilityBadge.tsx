type AccessibilityBadgeProps = {
  isPublic: boolean;
};

export function AccessibilityBadge({ isPublic }: AccessibilityBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-pill border border-sand bg-light-sand px-3 py-1 text-micro font-semibold uppercase tracking-label text-dark-charcoal">
      {isPublic ? "Public" : "Private"}
    </span>
  );
}
