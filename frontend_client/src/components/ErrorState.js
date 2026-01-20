import React from "react";

function getFriendlyMessage(err) {
  if (!err) return "Something went wrong.";
  if (err.status === 404) return "We couldn't find that recipe.";
  if (err.status >= 500) return "The server had a hiccup. Please try again.";
  return err.message || "Something went wrong.";
}

// PUBLIC_INTERFACE
export function ErrorState({ error, onRetry }) {
  /** Friendly error UI with optional retry. */
  return (
    <div className="alert alertError" role="alert" aria-live="polite">
      <p className="alertTitle">Unable to load</p>
      <p className="alertBody">{getFriendlyMessage(error)}</p>
      {onRetry ? (
        <div style={{ marginTop: 10 }}>
          <button className="btn btnPrimary" onClick={onRetry} type="button">
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}
