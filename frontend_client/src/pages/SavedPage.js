import React from "react";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RecipeGrid } from "../components/RecipeGrid";
import { useFavorites } from "../hooks/useRecipes";

// PUBLIC_INTERFACE
export function SavedPage() {
  /** Show favorite recipes. */
  const { loading, error, favorites, toggle, refresh } = useFavorites();

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Saved</h1>
          <p className="subtle">Your favorite recipes, all in one place.</p>
        </div>
        <button className="btn" type="button" onClick={refresh}>
          Refresh
        </button>
      </div>

      {loading ? <LoadingState label="Loading favorites…" /> : null}
      {error ? <ErrorState error={error} onRetry={refresh} /> : null}
      {!loading && !error && favorites.length === 0 ? (
        <EmptyState title="No saved recipes yet" description="Open a recipe and tap Save to add it here." />
      ) : null}

      {!loading && !error && favorites.length > 0 ? (
        <div>
          <RecipeGrid recipes={favorites} />
          <div className="help" style={{ marginTop: 12 }}>
            To remove a favorite: open the recipe detail and click Unsave.
          </div>
          {/* Note: toggling from this page is intentionally via detail for simplicity; hook is ready if needed */}
          <button
            style={{ display: "none" }}
            className="btn"
            type="button"
            onClick={() => toggle(favorites[0]?.id)}
          >
            Hidden toggle
          </button>
        </div>
      ) : null}
    </div>
  );
}
