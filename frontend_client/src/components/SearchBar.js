import React from "react";

// PUBLIC_INTERFACE
export function SearchBar({ value, onChange, placeholder = "Search recipes…" }) {
  /** Controlled search input. */
  return (
    <div>
      <label className="label" htmlFor="searchInput">
        Search
      </label>
      <input
        id="searchInput"
        className="input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        type="search"
        autoComplete="off"
      />
      <div className="help">
        Tip: Try keywords like <span className="kbdHint">pasta</span>, <span className="kbdHint">salad</span>, or <span className="kbdHint">breakfast</span>.
      </div>
    </div>
  );
}
