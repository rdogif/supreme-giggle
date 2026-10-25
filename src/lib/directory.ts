import data from "../../resources.json";

export const resources = data;
export type Resource = (typeof data)[number];
export type Filters = {
  category: string;
  q: string;
  favorites: boolean;
  trending: boolean;
  free: boolean;
  noLogin: boolean;
  sort: string;
};
export const initialFilters: Filters = {
  category: "All",
  q: "",
  favorites: false,
  trending: false,
  free: false,
  noLogin: false,
  sort: "popular",
};
export const categories = ["All", ...new Set(resources.map((r) => r.category))];
export function fuzzy(text: string, query: string) {
  const q = query.trim().toLowerCase();
  const hay = text.toLowerCase();
  if (hay.includes(q)) return true;
  let i = 0;
  for (const c of hay) if (c === q[i]) i++;
  return i === q.length;
}
export function filterResources(filters: Filters, favorites: string[]) {
  return resources
    .filter(
      (r) =>
        (filters.category === "All" || r.category === filters.category) &&
        fuzzy(
          [r.name, r.category, r.description, ...r.tags].join(" "),
          filters.q,
        ) &&
        (!filters.favorites || favorites.includes(r.name)) &&
        (!filters.trending || r.popular > 760) &&
        (!filters.free || r.free) &&
        (!filters.noLogin || r.noLogin),
    )
    .sort((a, b) =>
      filters.sort === "az"
        ? a.name.localeCompare(b.name)
        : filters.sort === "rating"
          ? b.rating - a.rating
          : filters.sort === "newest"
            ? b.added - a.added
            : b.popular - a.popular,
    );
}
export function readFavorites(): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("rishaanHubFavorites") || "[]",
    );
    return Array.isArray(value)
      ? [...new Set(value.filter((v): v is string => typeof v === "string"))]
      : [];
  } catch {
    return [];
  }
}
