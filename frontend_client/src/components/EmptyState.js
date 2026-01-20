import React from "react";

// PUBLIC_INTERFACE
export function EmptyState({ title = "Nothing here yet", description = "Try adjusting your filters." }) {
  /** Generic empty state card. */
  return (
    <div className="card cardPad" role="status" aria-live="polite">
      <p style={{ margin: 0, fontWeight: 900 }}>{title}</p>
      <p style={{ margin: "8px 0 0", color: "var(--color-muted)" }}>{description}</p>
    </div>
  );
}
