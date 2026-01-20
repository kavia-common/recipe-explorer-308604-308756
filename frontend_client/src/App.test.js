import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

test("renders top navigation", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  expect(screen.getByText(/Recipe Explorer/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Browse/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Search/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Saved/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Create/i })).toBeInTheDocument();
});
