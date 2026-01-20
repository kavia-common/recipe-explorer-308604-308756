import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { useFavorites, useRecipeDetail, useRecipeMutations } from "../hooks/useRecipes";
import { favoritesApi } from "../services/apiClient";

// PUBLIC_INTERFACE
export function RecipeDetailPage() {
  /** Show full recipe details + actions (save/edit/delete). */
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data: recipe, retry } = useRecipeDetail(id);
  const { remove } = useRecipeMutations();
  const { refresh: refreshFavorites } = useFavorites();

  const [favState, setFavState] = useState({ loading: true, isFavorite: false, error: null });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setFavState({ loading: true, isFavorite: false, error: null });
        const res = await favoritesApi.isFavorite(id);
        if (!mounted) return;
        setFavState({ loading: false, isFavorite: Boolean(res?.isFavorite), error: null });
      } catch (e) {
        if (!mounted) return;
        setFavState({ loading: false, isFavorite: false, error: e });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const canEdit = useMemo(() => Boolean(recipe?.isUserRecipe), [recipe]);

  const toggleFavorite = async () => {
    const res = await favoritesApi.toggle(id);
    setFavState(prev => ({ ...prev, isFavorite: Boolean(res?.isFavorite) }));
    await refreshFavorites();
  };

  const onDelete = async () => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm("Delete this recipe? This cannot be undone.");
    if (!ok) return;
    await remove(id);
    await refreshFavorites();
    navigate("/");
  };

  if (loading) return <div className="container"><LoadingState label="Loading recipe…" /></div>;
  if (error) return <div className="container"><ErrorState error={error} onRetry={retry} /></div>;
  if (!recipe) return <div className="container"><EmptyState title="Recipe not found" description="Try going back to Browse." /></div>;

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="h1">{recipe.title}</h1>
          <p className="subtle">{recipe.description}</p>
        </div>
        <div className="btnRow">
          <Link className="btn" to="/">
            Browse
          </Link>
        </div>
      </div>

      <div className="grid">
        <div className="gridCol8">
          <div className="card">
            {recipe.imageUrl ? (
              <img className="recipeCardMedia" src={recipe.imageUrl} alt={`${recipe.title} image`} style={{ height: 240 }} />
            ) : (
              <div className="recipeCardMedia" role="img" aria-label={`${recipe.title} placeholder image`} style={{ height: 240 }} />
            )}
            <div className="cardPad">
              <div className="btnRow" style={{ justifyContent: "space-between", alignItems: "center" }}>
                <div className="chips" aria-label="Recipe tags">
                  {(recipe.tags || []).map(t => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className="btnRow">
                  <button
                    type="button"
                    className={`btn ${favState.isFavorite ? "btnAccent" : "btnPrimary"}`}
                    onClick={toggleFavorite}
                    disabled={favState.loading}
                    aria-label={favState.isFavorite ? "Unsave recipe" : "Save recipe"}
                  >
                    {favState.isFavorite ? "Unsave" : "Save"}
                  </button>

                  {canEdit ? (
                    <Link className="btn" to={`/recipes/${recipe.id}/edit`}>
                      Edit
                    </Link>
                  ) : null}

                  {canEdit ? (
                    <button type="button" className="btn btnDanger" onClick={onDelete}>
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>

              {favState.error ? (
                <div className="help" style={{ marginTop: 10, color: "var(--color-danger)" }}>
                  Could not load favorite status.
                </div>
              ) : null}

              <div className="hr" />

              <h2 style={{ margin: "0 0 8px" }}>Ingredients</h2>
              <ul>
                {(recipe.ingredients || []).map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>

              <div className="hr" />

              <h2 style={{ margin: "0 0 8px" }}>Instructions</h2>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>{recipe.instructions}</p>
            </div>
          </div>
        </div>

        <div className="gridCol4">
          <aside className="card cardPad" aria-label="Recipe meta">
            <p style={{ margin: 0, fontWeight: 900 }}>Category</p>
            <p style={{ margin: "6px 0 0", color: "var(--color-muted)" }}>{recipe.category || "—"}</p>

            <div className="hr" />

            <p style={{ margin: 0, fontWeight: 900 }}>Actions</p>
            <div className="btnRow" style={{ marginTop: 10 }}>
              <Link className="btn btnPrimary" to="/recipes/new">
                Create new
              </Link>
              <button className="btn" type="button" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>

            <div className="hr" />

            <div className="help">
              {canEdit ? (
                <>This is a user recipe: you can edit and delete it.</>
              ) : (
                <>This is a seeded recipe: edit/delete are disabled in mock mode.</>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
