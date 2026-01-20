import React from "react";
import { Link } from "react-router-dom";

function truncate(text, max = 110) {
  if (!text) return "";
  const t = String(text);
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

// PUBLIC_INTERFACE
export function RecipeCard({ recipe }) {
  /** Small clickable card for a recipe summary. */
  return (
    <article className="card" aria-label={`Recipe: ${recipe.title}`}>
      {recipe.imageUrl ? (
        <img className="recipeCardMedia" src={recipe.imageUrl} alt={`${recipe.title} image`} />
      ) : (
        <div className="recipeCardMedia" role="img" aria-label={`${recipe.title} placeholder image`} />
      )}

      <div className="cardPad">
        <h3 className="recipeCardTitle">
          <Link to={`/recipes/${recipe.id}`}>{recipe.title}</Link>
        </h3>
        <p className="recipeCardDesc">{truncate(recipe.description, 120)}</p>

        <div style={{ marginTop: 10 }} className="chips" aria-label="Recipe tags">
          {(recipe.tags || []).slice(0, 4).map(t => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
