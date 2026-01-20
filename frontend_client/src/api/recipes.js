import { apiRequest } from "./client";

/**
 * PUBLIC_INTERFACE
 */
export async function listRecipes({ q = "", page = 1, limit = 12 } = {}) {
  /** Fetch list of recipes with optional search/pagination */
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/recipes${suffix}`, { method: "GET" });
}

/**
 * PUBLIC_INTERFACE
 */
export async function getRecipeById(id) {
  /** Fetch a single recipe by id */
  return apiRequest(`/recipes/${encodeURIComponent(id)}`, { method: "GET" });
}

/**
 * PUBLIC_INTERFACE
 */
export async function listUserRecipes() {
  /** Fetch user-created recipes */
  return apiRequest("/user-recipes", { method: "GET" });
}

/**
 * PUBLIC_INTERFACE
 */
export async function createUserRecipe(recipe) {
  /** Create a new user recipe */
  return apiRequest("/user-recipes", {
    method: "POST",
    body: JSON.stringify(recipe),
  });
}

/**
 * PUBLIC_INTERFACE
 */
export async function listFavorites() {
  /** List saved recipes */
  return apiRequest("/favorites", { method: "GET" });
}

/**
 * PUBLIC_INTERFACE
 */
export async function addFavorite(recipeId) {
  /** Save (favorite) a recipe */
  return apiRequest("/favorites", {
    method: "POST",
    // FastAPI backend expects snake_case per FavoriteCreate(recipe_id: str)
    body: JSON.stringify({ recipe_id: recipeId }),
  });
}

/**
 * PUBLIC_INTERFACE
 */
export async function removeFavorite(recipeId) {
  /** Remove favorite */
  return apiRequest(`/favorites/${encodeURIComponent(recipeId)}`, { method: "DELETE" });
}
