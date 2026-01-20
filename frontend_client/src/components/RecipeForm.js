import React, { useMemo, useState } from "react";

function normalizeCommaList(value) {
  return String(value || "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);
}

function validate({ title, description, ingredients, instructions }) {
  const errors = {};
  if (!title || title.trim().length < 2) errors.title = "Title must be at least 2 characters.";
  if (!description || description.trim().length < 10) errors.description = "Description must be at least 10 characters.";
  if (!ingredients || ingredients.filter(x => x.trim()).length < 1) errors.ingredients = "Add at least one ingredient.";
  if (!instructions || instructions.trim().length < 10) errors.instructions = "Instructions must be at least 10 characters.";
  return errors;
}

// PUBLIC_INTERFACE
export function RecipeForm({ initialValue, onSubmit, submitLabel = "Save Recipe" }) {
  /** Create/Edit recipe form. */
  const [title, setTitle] = useState(initialValue?.title || "");
  const [description, setDescription] = useState(initialValue?.description || "");
  const [category, setCategory] = useState(initialValue?.category || "");
  const [tagsText, setTagsText] = useState((initialValue?.tags || []).join(", "));
  const [imageUrl, setImageUrl] = useState(initialValue?.imageUrl || "");
  const [instructions, setInstructions] = useState(initialValue?.instructions || "");
  const [ingredients, setIngredients] = useState(
    initialValue?.ingredients?.length ? initialValue.ingredients : [""]
  );

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const errors = useMemo(
    () => validate({ title, description, ingredients, instructions }),
    [title, description, ingredients, instructions]
  );

  const canSubmit = Object.keys(errors).length === 0 && !submitting;

  const updateIngredient = (idx, val) => {
    setIngredients(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const addIngredient = () => setIngredients(prev => [...prev, ""]);
  const removeIngredient = idx => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitError("");

    const currentErrors = validate({ title, description, ingredients, instructions });
    if (Object.keys(currentErrors).length) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || "User",
      tags: normalizeCommaList(tagsText),
      imageUrl: imageUrl.trim(),
      ingredients: ingredients.map(x => x.trim()).filter(Boolean),
      instructions: instructions.trim(),
    };

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } catch (err) {
      setSubmitError(err?.message || "Failed to save recipe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card cardPad" aria-label="Recipe form">
      {submitError ? (
        <div className="alert alertError" role="alert" style={{ marginBottom: 12 }}>
          <p className="alertTitle">Could not save</p>
          <p className="alertBody">{submitError}</p>
        </div>
      ) : null}

      <div className="formGrid">
        <div>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input id="title" className="input" value={title} onChange={e => setTitle(e.target.value)} />
          {errors.title ? <div className="help" style={{ color: "var(--color-danger)" }}>{errors.title}</div> : null}
        </div>

        <div>
          <label className="label" htmlFor="description">
            Short description
          </label>
          <textarea
            id="description"
            className="textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          {errors.description ? <div className="help" style={{ color: "var(--color-danger)" }}>{errors.description}</div> : null}
        </div>

        <div className="grid">
          <div className="gridCol8">
            <label className="label" htmlFor="tags">
              Tags (comma-separated)
            </label>
            <input id="tags" className="input" value={tagsText} onChange={e => setTagsText(e.target.value)} />
          </div>
          <div className="gridCol4">
            <label className="label" htmlFor="category">
              Category
            </label>
            <input id="category" className="input" value={category} onChange={e => setCategory(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="imageUrl">
            Image URL (optional)
          </label>
          <input id="imageUrl" className="input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          <div className="help">Leave blank to use a gradient placeholder.</div>
        </div>

        <div>
          <div className="pageHeader" style={{ marginBottom: 8 }}>
            <div>
              <label className="label">Ingredients</label>
              {errors.ingredients ? (
                <div className="help" style={{ color: "var(--color-danger)" }}>{errors.ingredients}</div>
              ) : (
                <div className="help">Add one ingredient per line.</div>
              )}
            </div>
            <button type="button" className="btn" onClick={addIngredient}>
              + Add
            </button>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {ingredients.map((ing, idx) => (
              <li key={idx} className="grid" style={{ alignItems: "center" }}>
                <div className="gridCol8">
                  <input
                    className="input"
                    value={ing}
                    onChange={e => updateIngredient(idx, e.target.value)}
                    aria-label={`Ingredient ${idx + 1}`}
                  />
                </div>
                <div className="gridCol4" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => removeIngredient(idx)}
                    disabled={ingredients.length <= 1}
                    aria-label={`Remove ingredient ${idx + 1}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label className="label" htmlFor="instructions">
            Instructions
          </label>
          <textarea
            id="instructions"
            className="textarea"
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
          />
          {errors.instructions ? <div className="help" style={{ color: "var(--color-danger)" }}>{errors.instructions}</div> : null}
        </div>

        <div className="btnRow" style={{ justifyContent: "flex-end" }}>
          <button className="btn btnPrimary" type="submit" disabled={!canSubmit}>
            {submitting ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
