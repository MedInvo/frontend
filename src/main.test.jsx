import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";
import App from "./App.jsx";

describe("Pharma frontend", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the inventory and order forms", async () => {
    globalThis.fetch.mockImplementation(async (url) => ({
      ok: true,
      status: 200,
      json: async () => (url === "/api/products" ? [] : []),
    }));

    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Inventory & orders" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Add inventory" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Create order" }),
    ).toBeInTheDocument();

    await screen.findByText("No products yet. Add your first item above.");
  });

  it("displays products returned by the API", async () => {
    globalThis.fetch.mockImplementation(async (url) => ({
      ok: true,
      status: 200,
      json: async () =>
        url === "/api/products"
          ? [
              {
                id: 1,
                name: "Paracetamol",
                category: "Medicine",
                quantity: 100,
                price: 25,
              },
            ]
          : [],
    }));

    render(<App />);

    expect(await screen.findByText("Paracetamol")).toBeInTheDocument();

    expect(screen.getByText("Medicine")).toBeInTheDocument();
    expect(screen.getByText("₹25.00")).toBeInTheDocument();
  });

  it("displays an error when the API request fails", async () => {
    globalThis.fetch.mockRejectedValue(new Error("API unavailable"));

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "API unavailable",
    );
  });

  it("submits a new product with numeric quantity and price", async () => {
    globalThis.fetch.mockImplementation(async (url, options = {}) => {
      if (options.method === "POST") {
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: 1 }),
        };
      }

      return {
        ok: true,
        status: 200,
        json: async () => [],
      };
    });

    render(<App />);

    await screen.findByText("No products yet. Add your first item above.");

    // Select the Add inventory form only.
    const inventoryForm = screen
      .getByRole("heading", { name: "Add inventory" })
      .closest("form");

    expect(inventoryForm).not.toBeNull();

    const inventory = within(inventoryForm);

    fireEvent.change(inventory.getByLabelText("Name"), {
      target: { value: "Paracetamol" },
    });

    fireEvent.change(inventory.getByLabelText("Category"), {
      target: { value: "Medicine" },
    });

    // This no longer conflicts with Create order's Quantity field.
    fireEvent.change(inventory.getByLabelText("Quantity"), {
      target: { value: "100" },
    });

    fireEvent.change(inventory.getByLabelText("Price (₹)"), {
      target: { value: "25.50" },
    });

    fireEvent.click(inventory.getByRole("button", { name: "Add product" }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/products",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Paracetamol",
            category: "Medicine",
            quantity: 100,
            price: 25.5,
          }),
        }),
      );
    });

    expect(
      await screen.findByText("Product added to inventory."),
    ).toBeInTheDocument();
  });
});
