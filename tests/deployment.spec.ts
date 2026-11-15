import { expect, test } from "@playwright/test";
import profile from "../src/data/profile.json" with { type: "json" };

test("public assets, styles, scripts and CV respect the deployment base path", async ({ page, request, baseURL }) => {
  await page.goto("./");
  const basePath = new URL(baseURL!).pathname;
  const assets = await page.locator('img[src], link[rel="icon"], link[rel="stylesheet"], script[src]').evaluateAll(
    (elements) => elements.map((element) => element.getAttribute("src") ?? element.getAttribute("href")!),
  );

  expect(assets.length).toBeGreaterThan(0);
  for (const asset of assets) {
    expect(asset.startsWith(basePath), `${asset} must start with ${basePath}`).toBe(true);
    const response = await request.get(asset);
    expect(response.ok(), `${asset} must return a successful response`).toBe(true);
  }

  const resume = `${basePath}${profile.resume.slice(1)}`;
  await expect(page.locator("a[download]")).toHaveAttribute("href", resume);
  expect((await request.get(resume)).headers()["content-type"]).toContain("application/pdf");
});
