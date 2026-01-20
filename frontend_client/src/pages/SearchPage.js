import React, { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RecipeGrid } from "../components/RecipeGrid";
import { SearchBar } from "../components/SearchBar";
import { useDebounce } from "../hooks/useDebounce";
import { useAsync } from "../hooks/useAsync";
import { recipesApi } from "../services/apiClient";

// PUBLIC_INTERFACE
export function SearchPage() {
  /** Search for recipes via text query. */
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 350);

  const { loading, error, data, retry } = useAsync(
    () => recipesApi.search(debounced),
    [debounced]
  );

  const items = data?.items || [];
  const title = useMemo(() => (debounced.trim() ? `Results for "${debounced.trim()}"` : "Search"), [debounced]);

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="h1">{title}</h1>
          <p className="subtle">Type to search titles, descriptions, tags, and ingredients.</p>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: 14 }}>
        <div className="gridCol12">
          <div className="card cardPad">
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </div>
      </div>

      {loading ? <LoadingState label="Searching…" /> : null}
      {error ? <ErrorState error={error} onRetry={retry} /> : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title={debounced.trim() ? "No matches found" : "Start typing to search"}
          description={debounced.trim() ? "Try fewer keywords or a different query." : "We’ll show results as you type."}
        />
      ) : null}
      {!loading && !error && items.length > 0 ? <RecipeGrid recipes={items} /> : null}
    </div>
  );
}
