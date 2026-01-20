/**
 * API client with optional mock fallback.
 *
 * - If REACT_APP_API_BASE or REACT_APP_BACKEND_URL is set, requests are sent to that base URL.
 * - If unset, we use an in-memory mock store to keep the UI functional.
 *
 * Backend expects routes under /api:
 * - /api/recipes
 * - /api/favorites
 * Healthcheck: /health (no /api prefix)
 */

const RAW_API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL;

/**
 * Normalize base URL so callers can set either:
 * - http://localhost:3010        (we will append /api)
 * - http://localhost:3010/api    (we will keep /api)
 */
function normalizeApiBase(base) {
  if (!base) return "";
  const trimmed = String(base).trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const API_BASE = normalizeApiBase(RAW_API_BASE);

/**
 * Small helper to simulate latency in mock mode.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function makeId(prefix = "r") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean).map(t => String(t).trim()).filter(Boolean);
  return String(tags)
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * In-memory mock database. Persist favorites + user recipes in localStorage.
 */
const LS_KEYS = {
  favorites: "recipeExplorer.favorites",
  userRecipes: "recipeExplorer.userRecipes",
};

const seededRecipes = [
  {
    id: "seed_1",
    title: "Lemon Garlic Pasta",
    description: "A bright, weeknight pasta with lemon, garlic, and herbs.",
    ingredients: ["Spaghetti", "Garlic", "Lemon", "Olive oil", "Parsley", "Parmesan"],
    instructions:
      "Cook pasta. Sauté garlic in olive oil. Toss with lemon zest/juice, herbs, and pasta water. Finish with parmesan.",
    tags: ["pasta", "quick", "vegetarian"],
    category: "Dinner",
    imageUrl: "",
    isUserRecipe: false,
  },
  {
    id: "seed_2",
    title: "Crispy Chickpea Salad",
    description: "Crunchy chickpeas over greens with a tangy dressing.",
    ingredients: ["Chickpeas", "Mixed greens", "Cucumber", "Cherry tomatoes", "Lemon", "Tahini"],
    instructions: "Roast chickpeas until crisp. Whisk dressing. Toss greens and top with chickpeas.",
    tags: ["salad", "healthy", "vegan"],
    category: "Lunch",
    imageUrl: "",
    isUserRecipe: false,
  },
  {
    id: "seed_3",
    title: "Blueberry Oat Breakfast Bowl",
    description: "A cozy oat bowl with blueberries and nuts.",
    ingredients: ["Rolled oats", "Milk (or alt)", "Blueberries", "Honey", "Walnuts", "Cinnamon"],
    instructions: "Simmer oats with milk. Top with blueberries, walnuts, and cinnamon. Drizzle honey.",
    tags: ["breakfast", "oats", "easy"],
    category: "Breakfast",
    imageUrl: "",
    isUserRecipe: false,
  },
];

function loadUserRecipes() {
  return safeJsonParse(localStorage.getItem(LS_KEYS.userRecipes) || "[]", []);
}

function saveUserRecipes(recipes) {
  localStorage.setItem(LS_KEYS.userRecipes, JSON.stringify(recipes));
}

function loadFavorites() {
  return safeJsonParse(localStorage.getItem(LS_KEYS.favorites) || "[]", []);
}

function saveFavorites(ids) {
  localStorage.setItem(LS_KEYS.favorites, JSON.stringify(ids));
}

const mockDb = {
  getAllRecipes() {
    const userRecipes = loadUserRecipes();
    return [...userRecipes, ...seededRecipes];
  },
  getRecipeById(id) {
    return this.getAllRecipes().find(r => r.id === id) || null;
  },
  searchRecipes(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return this.getAllRecipes();
    return this.getAllRecipes().filter(r => {
      const hay = `${r.title} ${r.description} ${(r.tags || []).join(" ")} ${(r.ingredients || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  },
  listRecipes({ page = 1, pageSize = 9, tag = "", category = "" } = {}) {
    let items = this.getAllRecipes();
    if (tag) items = items.filter(r => (r.tags || []).includes(tag));
    if (category) items = items.filter(r => (r.category || "").toLowerCase() === category.toLowerCase());

    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { items: paged, total, page, pageSize };
  },
  getFavorites() {
    const favIds = loadFavorites();
    const all = this.getAllRecipes();
    return favIds.map(id => all.find(r => r.id === id)).filter(Boolean);
  },
  isFavorite(id) {
    const favIds = loadFavorites();
    return favIds.includes(id);
  },
  toggleFavorite(id) {
    const favIds = loadFavorites();
    const exists = favIds.includes(id);
    const next = exists ? favIds.filter(x => x !== id) : [...favIds, id];
    saveFavorites(next);
    return !exists;
  },
  createRecipe(payload) {
    const userRecipes = loadUserRecipes();
    const recipe = {
      id: makeId("user"),
      title: payload.title,
      description: payload.description,
      ingredients: payload.ingredients || [],
      instructions: payload.instructions || "",
      tags: normalizeTags(payload.tags),
      category: payload.category || "User",
      imageUrl: payload.imageUrl || "",
      isUserRecipe: true,
    };
    const next = [recipe, ...userRecipes];
    saveUserRecipes(next);
    return recipe;
  },
  updateRecipe(id, payload) {
    const userRecipes = loadUserRecipes();
    const idx = userRecipes.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Recipe not found or not editable.");
    const updated = {
      ...userRecipes[idx],
      title: payload.title,
      description: payload.description,
      ingredients: payload.ingredients || [],
      instructions: payload.instructions || "",
      tags: normalizeTags(payload.tags),
      category: payload.category || userRecipes[idx].category || "User",
      imageUrl: payload.imageUrl || "",
      isUserRecipe: true,
    };
    const next = [...userRecipes];
    next[idx] = updated;
    saveUserRecipes(next);
    return updated;
  },
  deleteRecipe(id) {
    const userRecipes = loadUserRecipes();
    const next = userRecipes.filter(r => r.id !== id);
    saveUserRecipes(next);

    // Also remove from favorites if present
    const favIds = loadFavorites();
    if (favIds.includes(id)) {
      saveFavorites(favIds.filter(x => x !== id));
    }
    return true;
  },
};

/**
 * Fetch wrapper for real backend mode.
 */
async function httpRequest(path, { method = "GET", headers = {}, body } = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `Request failed with status ${res.status}`);
    err.status = res.status;
    throw err;
  }

  // Some endpoints may return empty body
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  return res.json();
}

// PUBLIC_INTERFACE
export function isMockMode() {
  /** Returns true if we are running without a configured API base URL. */
  return !API_BASE;
}

// PUBLIC_INTERFACE
export function getConfiguredApiBase() {
  /** Returns the normalized API base URL (including /api) or empty string in mock mode. */
  return API_BASE;
}

// PUBLIC_INTERFACE
export async function healthcheck() {
  /**
   * Best-effort backend availability check.
   *
   * Default backend path is `/health` at the server root (no `/api` prefix).
   * Some deployments may expose a different health path; allow overriding via:
   * - REACT_APP_HEALTHCHECK_PATH (e.g. "/health" or "/api/health")
   *
   * Returns: { ok: boolean, service?: string } or throws on network errors.
   */
  if (isMockMode()) return { ok: true, mode: "mock" };

  const root = API_BASE.replace(/\/api$/, "");
  const configuredPath = (process.env.REACT_APP_HEALTHCHECK_PATH || "/health").trim() || "/health";

  // Try configured path first, then a small fallback list for common setups.
  const candidates = [
    configuredPath.startsWith("/") ? configuredPath : `/${configuredPath}`,
    "/health",
    "/api/health",
  ].filter((v, idx, arr) => arr.indexOf(v) === idx);

  let lastErr = null;

  for (const path of candidates) {
    const url = `${root}${path}`;
    try {
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const err = new Error(`Healthcheck failed with status ${res.status}`);
        err.status = res.status;
        lastErr = err;
        continue;
      }
      return res.json().catch(() => ({ ok: true }));
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr || new Error("Healthcheck failed.");
}

// PUBLIC_INTERFACE
export const recipesApi = {
  /** List recipes with optional pagination/filtering. */
  async list({ page = 1, pageSize = 9, tag = "", category = "" } = {}) {
    if (isMockMode()) {
      await sleep(250);
      return mockDb.listRecipes({ page, pageSize, tag, category });
    }
    // Backend supports /api/recipes?search=&q=&page=&pageSize=&tag=&category=
    return httpRequest(
      `/recipes?page=${page}&pageSize=${pageSize}&tag=${encodeURIComponent(tag)}&category=${encodeURIComponent(category)}`
    );
  },

  /** Search recipes by text query. */
  async search(query) {
    if (isMockMode()) {
      await sleep(250);
      const items = mockDb.searchRecipes(query);
      return { items, total: items.length };
    }
    // Compatibility endpoint exists: GET /api/recipes/search?q=
    return httpRequest(`/recipes/search?q=${encodeURIComponent(query || "")}`);
  },

  /** Get a recipe by id. */
  async getById(id) {
    if (isMockMode()) {
      await sleep(200);
      const r = mockDb.getRecipeById(id);
      if (!r) {
        const err = new Error("Recipe not found.");
        err.status = 404;
        throw err;
      }
      return r;
    }
    return httpRequest(`/recipes/${encodeURIComponent(id)}`);
  },

  /** Create a new user recipe. */
  async create(payload) {
    if (isMockMode()) {
      await sleep(250);
      return mockDb.createRecipe(payload);
    }
    return httpRequest(`/recipes`, { method: "POST", body: payload });
  },

  /** Update an existing user recipe. */
  async update(id, payload) {
    if (isMockMode()) {
      await sleep(250);
      return mockDb.updateRecipe(id, payload);
    }
    return httpRequest(`/recipes/${encodeURIComponent(id)}`, { method: "PUT", body: payload });
  },

  /** Delete an existing user recipe. */
  async remove(id) {
    if (isMockMode()) {
      await sleep(200);
      return mockDb.deleteRecipe(id);
    }
    return httpRequest(`/recipes/${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};

// PUBLIC_INTERFACE
export const favoritesApi = {
  /** List favorited recipes. */
  async list() {
    if (isMockMode()) {
      await sleep(150);
      return mockDb.getFavorites();
    }
    // Backend: GET /api/favorites -> Recipe[]
    return httpRequest(`/favorites`);
  },

  /** Toggle favorite status for a recipe id; returns new boolean state. */
  async toggle(id) {
    if (isMockMode()) {
      await sleep(100);
      return { isFavorite: mockDb.toggleFavorite(id) };
    }
    // Backend: POST /api/favorites/:id -> { isFavorite }
    return httpRequest(`/favorites/${encodeURIComponent(id)}`, { method: "POST" });
  },

  /** Get favorite status for recipe id. */
  async isFavorite(id) {
    if (isMockMode()) {
      await sleep(50);
      return { isFavorite: mockDb.isFavorite(id) };
    }
    // Backend: GET /api/favorites/:id -> { isFavorite }
    return httpRequest(`/favorites/${encodeURIComponent(id)}`);
  },
};
