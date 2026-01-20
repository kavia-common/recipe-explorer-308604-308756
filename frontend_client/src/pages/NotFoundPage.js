import React from "react";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
export function NotFoundPage() {
  /** 404 fallback page for unknown routes. */
  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Page not found</h1>
          <p className="subtle">That route doesn’t exist.</p>
        </div>
      </div>

      <div className="card cardPad">
        <p style={{ margin: 0 }}>
          Go back to <Link to="/">Browse</Link>.
        </p>
      </div>
    </div>
  );
}
