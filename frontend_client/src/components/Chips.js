import React from "react";

// PUBLIC_INTERFACE
export function Chips({ items, active, onChange, label }) {
  /** A selectable chip row. items: string[] */
  return (
    <div className="chips" aria-label={label}>
      {items.map(item => {
        const isActive = active === item;
        return (
          <button
            key={item}
            type="button"
            className={`chip chipButton ${isActive ? "chipActive" : ""}`}
            onClick={() => onChange(isActive ? "" : item)}
            aria-pressed={isActive}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
