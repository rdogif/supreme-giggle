import { describe, expect, it } from "vitest";
import { filterResources, fuzzy, initialFilters, resources } from "./directory";

describe("preserved directory behavior", () => {
  it("retains every resource and defaults to popularity order", () => {
    const result = filterResources(initialFilters, []);
    expect(result).toHaveLength(264);
    expect(result.map((r) => r.popular)).toEqual(
      resources.map((r) => r.popular).sort((a, b) => b - a),
    );
  });
  it("supports case-insensitive fuzzy search and category/tag matches", () => {
    expect(fuzzy("GitHub", "GTHB")).toBe(true);
    expect(
      filterResources({ ...initialFilters, q: "geogebra" }, []).some(
        (r) => r.name === "GeoGebra",
      ),
    ).toBe(true);
    expect(
      filterResources({ ...initialFilters, q: "neural networks" }, []).some(
        (r) => r.name === "TensorFlow Playground",
      ),
    ).toBe(true);
    expect(
      filterResources({ ...initialFilters, q: "zzzzzzzzzzzzzzzz" }, []),
    ).toHaveLength(0);
  });
  it("combines category, favorites, trending, free, and no-login filters", () => {
    const expected = resources.filter(
      (r) => r.category === "Tools" && r.popular > 760 && r.free && r.noLogin,
    );
    const favorites = expected.map((r) => r.name);
    expect(expected.length).toBeGreaterThan(0);
    expect(
      filterResources(
        {
          ...initialFilters,
          category: "Tools",
          favorites: true,
          trending: true,
          free: true,
          noLogin: true,
        },
        favorites,
      ),
    ).toEqual(expected.sort((a, b) => b.popular - a.popular));
    expect(
      filterResources({ ...initialFilters, favorites: true }, []),
    ).toHaveLength(0);
  });
  it.each(["rating", "newest", "az"])("preserves %s sorting", (sort) => {
    const result = filterResources({ ...initialFilters, sort }, []);
    const expected = [...resources].sort((a, b) =>
      sort === "az"
        ? a.name.localeCompare(b.name)
        : sort === "rating"
          ? b.rating - a.rating
          : b.added - a.added,
    );
    expect(result).toEqual(expected);
  });
});
