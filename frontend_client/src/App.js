import React, { useEffect, useMemo, useState } from "react";
import { checkHealth } from "./api/health";
import {
  addFavorite,
  getRecipeById,
  listFavorites,
  listRecipes,
  removeFavorite,
} from "./api/recipes";

function normalizeRecipesResponse(payload) {
  // Backend may return either array or {items: [], ...}. Handle both.
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.recipes)) return payload.recipes;
  return [];
}

function normalizeFavoritesResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.favorites)) return payload.favorites;
  return [];
}

export default function App() {
  const [health, setHealth] = useState({ status: "unknown" });
  const [q, setQ] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const favoriteIds = useMemo(() => {
    // favorites may be list of ids or objects; normalize to set of ids
    const ids = new Set();
    for (const f of favorites) {
      if (typeof f === "string" || typeof f === "number") ids.add(String(f));
      else if (f && (f.recipeId || f.id)) ids.add(String(f.recipeId || f.id));
    }
    return ids;
  }, [favorites]);

  useEffect(() => {
    let cancelled = false;

    async function runHealthCheck() {
      try {
        const res = await checkHealth();
        if (cancelled) return;
        setHealth({ status: "ok", details: res });
      } catch (err) {
        if (cancelled) return;
        setHealth({ status: "unhealthy" });
        // Requirement: console warn if unhealthy.
        // eslint-disable-next-line no-console
        console.warn("Backend health check failed:", err);
      }
    }

    runHealthCheck();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setLoading(true);
      setErrorMsg("");
      try {
        const [recipesRes, favRes] = await Promise.all([
          listRecipes({ q: "", page: 1, limit: 12 }),
          listFavorites(),
        ]);
        if (cancelled) return;
        setRecipes(normalizeRecipesResponse(recipesRes));
        setFavorites(normalizeFavoritesResponse(favRes));
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(
          err?.body?.detail ||
            err?.body?.message ||
            err?.message ||
            "Failed to load data from backend."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSearchSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await listRecipes({ q, page: 1, limit: 24 });
      setRecipes(normalizeRecipesResponse(res));
      setSelectedId(null);
      setSelectedRecipe(null);
    } catch (err) {
      setErrorMsg(
        err?.body?.detail || err?.body?.message || err?.message || "Search failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function onSelectRecipe(id) {
    setSelectedId(id);
    setSelectedRecipe(null);
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getRecipeById(id);
      setSelectedRecipe(res);
    } catch (err) {
      setErrorMsg(
        err?.body?.detail ||
          err?.body?.message ||
          err?.message ||
          "Failed to load recipe details."
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(recipeId) {
    const idStr = String(recipeId);
    setErrorMsg("");
    try {
      if (favoriteIds.has(idStr)) {
        await removeFavorite(idStr);
      } else {
        await addFavorite(idStr);
      }
      const favRes = await listFavorites();
      setFavorites(normalizeFavoritesResponse(favRes));
    } catch (err) {
      setErrorMsg(
        err?.body?.detail ||
          err?.body?.message ||
          err?.message ||
          "Failed to update favorites."
      );
    }
  }

  const backendBadge =
    health.status === "ok" ? (
      <span className="badge badge-ok">Backend: OK</span>
    ) : health.status === "unhealthy" ? (
      <span className="badge badge-bad">Backend: Unhealthy</span>
    ) : (
      <span className="badge">Backend: Checking…</span>
    );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            R
          </div>
          <div>
            <div className="title">Recipe Explorer</div>
            <div className="subtitle">Browse, search, and save recipes</div>
          </div>
        </div>
        <div className="right">{backendBadge}</div>
      </header>

      <main className="layout">
        <section className="panel">
          <h2>Browse & Search</h2>

          <form className="search" onSubmit={onSearchSubmit}>
            <label className="sr-only" htmlFor="q">
              Search recipes
            </label>
            <input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search recipes (e.g., pasta, chicken)…"
            />
            <button type="submit" disabled={loading}>
              Search
            </button>
          </form>

          {errorMsg ? <div className="error">{errorMsg}</div> : null}

          <div className="grid" role="list" aria-busy={loading ? "true" : "false"}>
            {recipes.map((r) => {
              const id = String(r.id ?? r.recipeId ?? r._id ?? "");
              const name = r.title || r.name || "Untitled recipe";
              const desc = r.description || r.summary || "";
              const isFav = favoriteIds.has(id);

              return (
                <div key={id || name} className="card" role="listitem">
                  <div className="card-head">
                    <div className="card-title">{name}</div>
                    {id ? (
                      <button
                        type="button"
                        className={isFav ? "fav active" : "fav"}
                        onClick={() => toggleFavorite(id)}
                        aria-label={isFav ? "Remove from saved" : "Save recipe"}
                        title={isFav ? "Saved" : "Save"}
                      >
                        {isFav ? "Saved" : "Save"}
                      </button>
                    ) : null}
                  </div>

                  {desc ? <div className="card-desc">{desc}</div> : null}

                  <div className="card-actions">
                    <button
                      type="button"
                      onClick={() => onSelectRecipe(id)}
                      disabled={!id || loading}
                    >
                      View details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <h2>Details</h2>
          {!selectedId ? (
            <div className="muted">Select a recipe to view details.</div>
          ) : loading && !selectedRecipe ? (
            <div className="muted">Loading details…</div>
          ) : selectedRecipe ? (
            <div className="details">
              <h3>{selectedRecipe.title || selectedRecipe.name || "Recipe"}</h3>

              {selectedRecipe.description ? (
                <p className="muted">{selectedRecipe.description}</p>
              ) : null}

              <div className="details-grid">
                <div>
                  <h4>Ingredients</h4>
                  <ul>
                    {(selectedRecipe.ingredients || []).map((ing, idx) => (
                      <li key={idx}>{String(ing)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Instructions</h4>
                  <ol>
                    {(selectedRecipe.instructions || []).map((step, idx) => (
                      <li key={idx}>{String(step)}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="muted">No details available.</div>
          )}

          <h2 style={{ marginTop: 24 }}>Saved</h2>
          {favorites.length === 0 ? (
            <div className="muted">No saved recipes yet.</div>
          ) : (
            <ul className="saved">
              {favorites.map((f, idx) => {
                const id = String(
                  (typeof f === "object" && (f.recipeId || f.id)) || f || idx
                );
                const label =
                  (typeof f === "object" && (f.title || f.name)) || `Recipe ${id}`;
                return (
                  <li key={id}>
                    <button type="button" className="link" onClick={() => onSelectRecipe(id)}>
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      <footer className="footer">
        <span className="muted">
          API base: <code>{process.env.REACT_APP_API_BASE || "http://localhost:3011/api"}</code>
        </span>
      </footer>
    </div>
  );
}
