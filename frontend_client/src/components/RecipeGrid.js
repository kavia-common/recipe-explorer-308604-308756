import React from "react";
import { RecipeCard } from "./RecipeCard";

// PUBLIC_INTERFACE
export function RecipeGrid({ recipes }) {
  /** Responsive grid for recipe cards. */
  return (
    <section aria-label="Recipe results">
      <div className="recipeGrid">
        {recipes.map(r => (
          <div key={r.id} className="recipeGridItem">
            <RecipeCard recipe={r} />
          </div>
        ))}
      </div>
    </section>
  );
}
