import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import { BrowsePage } from "./pages/BrowsePage";
import { CreateEditRecipePage } from "./pages/CreateEditRecipePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";
import { SavedPage } from "./pages/SavedPage";
import { SearchPage } from "./pages/SearchPage";
import { getConfiguredApiBase, healthcheck, isMockMode } from "./services/apiClient";

function navLinkClass({ isActive }) {
  return `navLink ${isActive ? "navLinkActive" : ""}`;
}

// PUBLIC_INTERFACE
function App() {
  /** Main app shell with top navigation + routes. */
  const [apiStatus, setApiStatus] = React.useState({ state: "idle", message: "" });

  React.useEffect(() => {
    let mounted = true;

    // Best-effort: don't block the UI, just surface status for easier debugging.
    (async () => {
      if (isMockMode()) {
        if (!mounted) return;
        setApiStatus({ state: "mock", message: "" });
        return;
      }

      try {
        if (!mounted) return;
        setApiStatus({ state: "checking", message: "" });
        const res = await healthcheck();
        if (!mounted) return;
        if (res?.ok) setApiStatus({ state: "ok", message: "" });
        else setApiStatus({ state: "degraded", message: "Backend responded but did not report ok." });
      } catch (err) {
        if (!mounted) return;
        setApiStatus({
          state: "down",
          message: err?.message || "Unable to reach backend. Check REACT_APP_API_BASE / REACT_APP_BACKEND_URL.",
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="appShell">
      <header className="topNav">
        <div className="container topNavInner">
          <div className="brand" aria-label="Recipe Explorer">
            <div className="brandMark" aria-hidden="true" />
            <span>Recipe Explorer</span>
          </div>

          <nav className="navLinks" aria-label="Primary navigation">
            <NavLink to="/" end className={navLinkClass}>
              Browse
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              Search
            </NavLink>
            <NavLink to="/saved" className={navLinkClass}>
              Saved
            </NavLink>
            <NavLink to="/recipes/new" className={navLinkClass}>
              Create
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container" style={{ marginBottom: 12 }}>
          <div className="help">
            Mode: <strong>{isMockMode() ? "Mock (no backend configured)" : "API"}</strong>
            {isMockMode() ? (
              <> — set <code>REACT_APP_API_BASE</code> (or <code>REACT_APP_BACKEND_URL</code>) to enable real API calls.</>
            ) : (
              <>
                {" "}
                — base: <code>{getConfiguredApiBase()}</code>
              </>
            )}
          </div>

          {!isMockMode() && apiStatus.state === "down" ? (
            <div className="alert alertError" role="alert" style={{ marginTop: 10 }}>
              <p className="alertTitle">Backend unavailable</p>
              <p className="alertBody">{apiStatus.message}</p>
            </div>
          ) : null}
        </div>

        <Routes>
          <Route path="/" element={<BrowsePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/saved" element={<SavedPage />} />

          <Route path="/recipes/new" element={<CreateEditRecipePage />} />
          <Route path="/recipes/:id/edit" element={<CreateEditRecipePage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
