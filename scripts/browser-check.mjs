import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir, readFile } from "node:fs/promises";

const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chrome",
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
  reducedMotion: "reduce",
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.TEST_URL || "http://127.0.0.1:5173";
const resources = JSON.parse(
  await readFile(new URL("../resources.json", import.meta.url)),
);
const count = () => page.locator(".resource-card").count();
await page.goto(base);
await page.waitForSelector(".resource-card");
assert.equal(await count(), 264);
await page.evaluate(() => {
  localStorage.setItem("rishaanHubFavorites", '["GitHub"]');
  localStorage.setItem("rishaanHubTheme", "light");
});
await page.reload();
await page
  .getByRole("group", { name: "Resource collection" })
  .getByRole("button", { name: "Favorites", exact: true })
  .click();
assert.equal(await count(), 1);
assert.equal(
  await page.locator(".resource-link h3").first().innerText(),
  "GitHub",
);
await page
  .getByRole("button", { name: "Remove GitHub from favorites" })
  .click();
await page.waitForSelector(".empty-state");
await page.getByRole("button", { name: "Explore all resources" }).click();
await page.getByRole("button", { name: "Save GitHub to favorites" }).click();
await page.reload();
await page.waitForSelector(".resource-card");
assert.deepEqual(
  await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rishaanHubFavorites")),
  ),
  ["GitHub"],
);

await page.keyboard.press("/");
assert.equal(
  await page
    .getByRole("textbox", { name: "Search resources" })
    .evaluate((el) => el === document.activeElement),
  true,
);
await page.getByRole("textbox", { name: "Search resources" }).fill("geogebra");
assert.ok((await count()) > 0 && (await count()) < 264);
assert.equal(
  await page.getByRole("article", { name: "GeoGebra", exact: true }).count(),
  1,
);
await page
  .getByRole("textbox", { name: "Search resources" })
  .fill("zzzzzzzzzzzzzzzz");
await page.waitForSelector(".empty-state");
await page.keyboard.press("Escape");
assert.equal(await count(), 264);
await page
  .getByRole("navigation", { name: "Resource categories" })
  .getByRole("button", { name: /Coding/ })
  .click();
assert.equal(await count(), 38);
await page.getByRole("button", { name: "Trending", exact: true }).click();
await page.getByRole("button", { name: "No login", exact: true }).click();
assert.equal(
  await count(),
  resources.filter(
    (r) => r.category === "Coding" && r.popular > 760 && r.noLogin,
  ).length,
);
await page.getByRole("button", { name: "Reset filters" }).click();
for (const [sort, first] of [
  ["az", [...resources].sort((a, b) => a.name.localeCompare(b.name))[0].name],
  ["rating", [...resources].sort((a, b) => b.rating - a.rating)[0].name],
  ["newest", "GitHub"],
]) {
  await page
    .getByRole("combobox", { name: "Sort resources" })
    .selectOption(sort);
  assert.equal(
    await page.locator(".resource-link h3").first().innerText(),
    first,
  );
}
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "Export favorites" }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), "rishaan-hub-favorites.json");
const exported = JSON.parse(await readFile(await download.path(), "utf8"));
assert.deepEqual(
  exported.map((r) => r.name),
  ["GitHub"],
);
await page.evaluate(() => {
  window.open = (...args) => {
    window.__lastOpened = args;
    return null;
  };
});
await page
  .locator(".hero-actions")
  .getByRole("button", { name: "Surprise me" })
  .click();
const opened = await page.evaluate(() => window.__lastOpened);
assert.ok(resources.some((r) => r.url === opened[0]));
assert.equal(opened[2], "noopener,noreferrer");
await page.getByRole("button", { name: "Switch to dark theme" }).click();
await page.reload();
await page.waitForSelector(".resource-card");
assert.equal(
  await page.locator("html").evaluate((el) => el.classList.contains("dark")),
  true,
);

await mkdir("test-results", { recursive: true });
for (const theme of ["dark", "light"]) {
  if (theme === "light")
    await page.getByRole("button", { name: "Switch to light theme" }).click();
  await page.screenshot({ path: `test-results/desktop-${theme}.png` });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const serious = results.violations.filter((v) =>
    ["critical", "serious"].includes(v.impact),
  );
  assert.deepEqual(
    serious.map((v) => ({
      id: v.id,
      description: v.description,
      nodes: v.nodes.slice(0, 3).map((n) => n.target),
    })),
    [],
    `${theme} accessibility violations`,
  );
  await page.screenshot({ path: `test-results/desktop-${theme}.png` });
}
for (const width of [1024, 768, 740, 390, 320]) {
  await page.setViewportSize({ width, height: 900 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    `No horizontal overflow at ${width}px`,
  );
  if (width === 390) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation", { name: "Resource categories" })
      .getByRole("button", { name: /Creative/ })
      .click();
    assert.equal(await count(), 38);
    assert.equal(
      await page
        .getByRole("button", { name: "Open navigation" })
        .getAttribute("aria-expanded"),
      "false",
    );
    await page.screenshot({ path: "test-results/mobile.png", fullPage: false });
    await page.getByRole("button", { name: "Reset filters" }).click();
  }
}
await page.setViewportSize({ width: 1440, height: 1000 });
await page.evaluate(() => {
  localStorage.setItem("rishaanHubFavorites", "invalid json");
});
await page.reload();
await page.waitForSelector(".resource-card");
assert.equal(await count(), 264);
assert.deepEqual(errors, []);
console.log(
  "Browser checks passed: legacy storage, search, filters, sorting, favorites, export, random, themes, accessibility, mobile menu, five responsive widths, malformed storage, and runtime errors.",
);
await browser.close();
