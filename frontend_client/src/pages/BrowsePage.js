import React, { useMemo } from "react";
import { Chips } from "../components/Chips";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RecipeGrid } from "../components/RecipeGrid";
import { useRecipeList } from "../hooks/useRecipes";

const TAGS = ["pasta", "quick", "vegetarian", "salad", "healthy", "vegan", "breakfast", "easy", "oats"];
const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "User"];

// PUBLIC_INTERFACE
export function BrowsePage() {
  /** Browse recipes with pagination and basic filters. */
  const {
    loading,
    error,
    items,
    total,
    page,
    totalPages,
    filters,
    setTag,
    setCategory,
    goToPage,
    retry,
  } = useRecipeList({ initialPageSize: 9 });

  const headerSubtitle = useMemo(() => {
    const parts = [];
    if (filters.tag) parts.push(`tag: ${filters.tag}`);
    if (filters.category) parts.push(`category: ${filters.category}`);
    const suffix = parts.length ? `Filtered by ${parts.join(" • ")}.` : "Pick a recipe to view details.";
    return `${total} recipes. ${suffix}`;
  }, [filters, total]);

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="h1">Browse</h1>
          <p className="subtle">{headerSubtitle}</p>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: 14 }}>
        <div className="gridCol8">
          <div className="card cardPad">
            <p style={{ margin: 0, fontWeight: 900 }}>Filter by tag</p>
            <div style={{ marginTop: 10 }}>
              <Chips items={TAGS} active={filters.tag} onChange={setTag} label="Tag filter" />
            </div>
          </div>
        </div>
        <div className="gridCol4">
          <div className="card cardPad">
            <p style={{ margin: 0, fontWeight: 900 }}>Category</p>
            <div style={{ marginTop: 10 }}>
              <Chips items={CATEGORIES} active={filters.category} onChange={setCategory} label="Category filter" />
            </div>
          </div>
        </div>
      </div>

      {loading ? <LoadingState label="Loading recipes…" /> : null}
      {error ? <ErrorState error={error} onRetry={retry} /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState title="No recipes match your filters" description="Try a different tag or category." />
      ) : null}
      {!loading && !error && items.length > 0 ? <RecipeGrid recipes={items} /> : null}

      {!loading && !error && totalPages > 1 ? (
        <div className="btnRow" style={{ marginTop: 14, justifyContent: "space-between" }}>
          <button className="btn" type="button" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
            ← Prev
          </button>
          <div style={{ alignSelf: "center", color: "var(--color-muted)", fontWeight: 700 }}>
            Page {page} of {totalPages}
          </div>
          <button className="btn" type="button" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
            Next →
          </button>
        </div>
      ) : null}
    </div>
  );
}
