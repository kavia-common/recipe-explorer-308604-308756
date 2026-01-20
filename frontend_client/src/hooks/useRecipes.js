import { useCallback, useMemo, useState } from "react";
import { favoritesApi, recipesApi } from "../services/apiClient";
import { useAsync } from "./useAsync";

// PUBLIC_INTERFACE
export function useRecipeList({ initialPageSize = 9 } = {}) {
  /** Hook for paginated recipe browsing with tag/category filtering. */
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [tag, setTag] = useState("");
  const [category, setCategory] = useState("");

  const { loading, error, data, retry } = useAsync(
    () => recipesApi.list({ page, pageSize, tag, category }),
    [page, pageSize, tag, category]
  );

  const total = data?.total || 0;
  const items = data?.items || [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goToPage = useCallback(
    next => {
      const p = Math.max(1, Math.min(totalPages, next));
      setPage(p);
    },
    [totalPages]
  );

  const filters = useMemo(
    () => ({ tag, category }),
    [tag, category]
  );

  return {
    loading,
    error,
    items,
    total,
    page,
    totalPages,
    pageSize,
    filters,
    setTag: t => {
      setPage(1);
      setTag(t);
    },
    setCategory: c => {
      setPage(1);
      setCategory(c);
    },
    goToPage,
    retry,
  };
}

// PUBLIC_INTERFACE
export function useRecipeDetail(id) {
  /** Hook for loading a single recipe by id. */
  return useAsync(() => recipesApi.getById(id), [id]);
}

// PUBLIC_INTERFACE
export function useFavorites() {
  /** Hook for listing favorites and toggling favorite status. */
  const { loading, error, data, retry } = useAsync(() => favoritesApi.list(), []);
  const favorites = data || [];

  const toggle = useCallback(async id => {
    await favoritesApi.toggle(id);
    // refresh list after toggle
    await retry();
  }, [retry]);

  return { loading, error, favorites, toggle, refresh: retry };
}

// PUBLIC_INTERFACE
export function useRecipeMutations() {
  /** Hook to create/update/delete recipes. */
  const create = useCallback(payload => recipesApi.create(payload), []);
  const update = useCallback((id, payload) => recipesApi.update(id, payload), []);
  const remove = useCallback(id => recipesApi.remove(id), []);
  return { create, update, remove };
}
