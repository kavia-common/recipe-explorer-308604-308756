import React from "react";

// PUBLIC_INTERFACE
export function LoadingState({ label = "Loading…" }) {
  /** Simple skeleton loader for page areas. */
  return (
    <div className="card cardPad" role="status" aria-live="polite" aria-busy="true">
      <p style={{ margin: 0, fontWeight: 800 }}>{label}</p>
      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
        <div className="skeleton" style={{ width: "65%" }} />
        <div className="skeleton" style={{ width: "95%" }} />
        <div className="skeleton" style={{ width: "80%" }} />
      </div>
    </div>
  );
}
