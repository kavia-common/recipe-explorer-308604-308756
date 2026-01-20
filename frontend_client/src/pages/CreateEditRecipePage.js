import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "../components/ErrorState";
import { LoadingState } from "../components/LoadingState";
import { RecipeForm } from "../components/RecipeForm";
import { useRecipeDetail, useRecipeMutations } from "../hooks/useRecipes";

// PUBLIC_INTERFACE
export function CreateEditRecipePage() {
  /** Create a new recipe or edit an existing (user-created) recipe. */
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { create, update } = useRecipeMutations();

  const detail = useRecipeDetail(id);
  const recipe = detail.data;

  const canEdit = useMemo(() => {
    if (!isEdit) return true;
    return recipe?.isUserRecipe;
  }, [isEdit, recipe]);

  const onSubmit = async payload => {
    if (isEdit) {
      const updated = await update(id, payload);
      navigate(`/recipes/${updated.id}`);
    } else {
      const created = await create(payload);
      navigate(`/recipes/${created.id}`);
    }
  };

  if (isEdit && detail.loading) return <div className="container"><LoadingState label="Loading recipe…" /></div>;
  if (isEdit && detail.error) return <div className="container"><ErrorState error={detail.error} onRetry={detail.retry} /></div>;

  if (isEdit && !canEdit) {
    return (
      <div className="container">
        <ErrorState error={{ message: "This recipe can't be edited (only user-created recipes are editable in this demo)." }} />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="pageHeader">
        <div>
          <h1 className="h1">{isEdit ? "Edit Recipe" : "Create Recipe"}</h1>
          <p className="subtle">
            {isEdit ? "Update your recipe details and save." : "Create a new recipe with ingredients and instructions."}
          </p>
        </div>
        <button className="btn" type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <RecipeForm
        initialValue={isEdit ? recipe : null}
        onSubmit={onSubmit}
        submitLabel={isEdit ? "Update Recipe" : "Create Recipe"}
      />
    </div>
  );
}
