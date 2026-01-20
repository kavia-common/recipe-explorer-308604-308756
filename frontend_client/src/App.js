import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";
import { BrowsePage } from "./pages/BrowsePage";
import { CreateEditRecipePage } from "./pages/CreateEditRecipePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RecipeDetailPage } from "./pages/RecipeDetailPage";
import { SavedPage } from "./pages/SavedPage";
import { SearchPage } from "./pages/SearchPage";
import { isMockMode } from "./services/apiClient";

function navLinkClass({ isActive }) {
  return `navLink ${isActive ? "navLinkActive" : ""}`;
}

// PUBLIC_INTERFACE
function App() {
  /** Main app shell with top navigation + routes. */
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
              <> — set <code>REACT_APP_API_BASE</code> to enable real API calls.</>
            ) : null}
          </div>
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
