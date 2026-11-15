import { expect, test } from "@playwright/test";
import profile from "../src/data/profile.json" with { type: "json" };
import projects from "../src/data/projects.json" with { type: "json" };
import experience from "../src/data/experience.json" with { type: "json" };
import playground from "../src/data/playground.json" with { type: "json" };
import site from "../src/data/site.json" with { type: "json" };

test("contact footer matches the centered sections and offers direct contact channels", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByRole("heading", { level: 2 })).toContainText(site.contact.eyebrow);
  await expect(footer.getByRole("heading", { level: 2 })).toContainText(site.contact.title);
  await expect(footer.getByText(site.contact.description)).toBeVisible();
  await expect(footer.getByText(site.contact.directLabel)).toBeVisible();
  const action = footer.getByRole("link", { name: site.contact.action });
  await expect(action).toHaveAttribute("href", `mailto:${profile.email}`);
  await expect(footer.getByRole("link", { name: profile.email })).toHaveAttribute("href", `mailto:${profile.email}`);
  const linkedIn = footer.getByRole("link", { name: "LinkedIn" });
  await expect(linkedIn).toHaveAttribute("href", profile.socials.find((social) => social.label === "LinkedIn")!.href);
  await expect(linkedIn).toHaveAttribute("rel", "noopener noreferrer");
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 393, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const section = await page.locator("#sobre-mi > div").boundingBox();
    for (const container of await footer.locator(":scope > div").all()) {
      const bounds = await container.boundingBox();
      expect(bounds!.x).toBe(section!.x);
      expect(bounds!.width).toBe(section!.width);
    }
    const sectionHeading = await page.locator("#sobre-mi h2").evaluate((element) => getComputedStyle(element).fontSize);
    await expect(footer.getByRole("heading", { level: 2 })).toHaveCSS("font-size", sectionHeading);
  }
  await expect(footer).toHaveCSS("min-height", "0px");
  await action.hover();
  const colors = await action.evaluate((element) => {
    const style = getComputedStyle(element);
    return { text: style.color, background: style.backgroundColor };
  });
  expect(colors.text).not.toBe(colors.background);
});

test("renders full stack content from JSON without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Full Stack/);
  await expect(page.locator("h1")).toContainText(profile.headlineAccent);
  await expect(page.locator("#proyectos article")).toHaveCount(projects.length);
  await expect(page.locator("#experiencia ol > li")).toHaveCount(experience.length);
  for (const project of projects) {
    await expect(page.getByRole("heading", { name: project.title, exact: true })).toBeVisible();
  }
  await page.getByRole("button", { name: "Backend", exact: true }).click();
  await expect(page.locator("#layer-backend")).toBeVisible();
  expect(errors).toEqual([]);
});

test("prioritizes the three new projects and preserves the original collection", async ({ page }) => {
  await page.goto("/");
  const primary = page.locator("[data-primary-projects] article");
  const other = page.locator("[data-other-projects] article");
  await expect(page.locator("#proyectos article")).toHaveCount(6);
  await expect(primary).toHaveCount(3);
  await expect(other).toHaveCount(3);
  await expect(primary.first()).toHaveAttribute("data-project", "engine-alert-manager");
  await expect(primary.first()).toHaveAttribute("data-featured", "true");
  await expect(primary.nth(1)).toHaveAttribute("data-project", "psis-storage-engine");
  await expect(primary.nth(2)).toHaveAttribute("data-project", "os-simulator");
  await expect(other.nth(0)).toHaveAttribute("data-project", "vallesur");
  await expect(other.nth(1)).toHaveAttribute("data-project", "events");
  await expect(other.nth(2)).toHaveAttribute("data-project", "employee");
  for (const article of await primary.all()) {
    await expect(article.getByRole("list", { name: /^Aspectos destacados/ }).locator("li")).toHaveCount(3);
    const image = article.getByRole("img");
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
});

test("navbar becomes a compact frosted pill on scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-header]")).toHaveAttribute("data-scrolled", "false");
  await page.locator("#proyectos").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-header]")).toHaveAttribute("data-scrolled", "true");
  const nav = page.getByRole("navigation", { name: "Navegación principal" });
  await expect.poll(() => nav.evaluate((element) => parseFloat(getComputedStyle(element).maxWidth))).toBe(768);
  await expect.poll(() => nav.evaluate((element) => getComputedStyle(element).backdropFilter)).toContain("blur");
});

test("theme toggles and persists across reloads", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Activar tema oscuro" }).click();
  await expect(page.locator("html")).toHaveClass(/(?:^|\s)dark(?:\s|$)/);
  await page.reload();
  await expect(page.getByRole("button", { name: "Activar tema claro" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Activar tema claro" }).click();
  await expect(page.locator("html")).not.toHaveClass(/(?:^|\s)dark(?:\s|$)/);
});

test("playground supports keyboard and each layer shows matching content", async ({ page }) => {
  await page.goto("/");
  for (const layer of playground) {
    const button = page.getByRole("button", { name: layer.label, exact: true });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const panel = page.locator(`#layer-${layer.id}`);
    await expect(panel).toBeVisible();
    await expect(panel).toContainText(layer.description);
    await expect(panel).toContainText(layer.example);
    await expect(panel.getByRole("link", { name: "Ver experiencia relacionada" })).toHaveAttribute("href", `#experiencia-${layer.experienceId}`);
    await expect(page.locator("[data-layer-panel]:visible")).toHaveCount(1);
  }
});

test("shows verified experience and the expanded technology stack", async ({ page }) => {
  await page.goto("/");
  const entries = page.locator("#experiencia ol > li");
  await expect(entries.first()).toContainText("Smart Reasons");
  await expect(entries.first()).toContainText("Jun. 2025");
  await expect(entries.nth(1)).toContainText("Lead Full Stack Developer");
  for (const name of ["C#", ".NET", "AWS", "Vue 3", "SQL Server"]) {
    await expect(page.locator("#mi-stack li").getByText(name, { exact: true })).toBeVisible();
  }
  await expect(page.locator("[data-playground] pre")).toHaveCount(0);
  const panel = page.locator("#layer-frontend");
  await panel.getByRole("link", { name: "Ver experiencia relacionada" }).click();
  await expect(page).toHaveURL(/#experiencia-smart-reasons$/);
});

test("alternates exactly two neutral backgrounds in each theme", async ({ page }) => {
  await page.goto("/");
  const selectors = ["#inicio", "#proyectos", "#mi-stack", "#experiencia", "#sobre-mi", "#contacto"];
  const colors = await Promise.all(selectors.map((selector) => page.locator(selector).evaluate(
    (element) => {
      const color = getComputedStyle(element).backgroundColor;
      return color === "rgba(0, 0, 0, 0)" ? getComputedStyle(document.body).backgroundColor : color;
    },
  )));
  expect(new Set(colors)).toEqual(new Set(["rgb(255, 255, 255)", "rgb(32, 32, 36)"]));
  for (let index = 1; index < colors.length; index++) {
    expect(colors[index]).not.toBe(colors[index - 1]);
  }
  for (const selector of ["#proyectos", "#experiencia", "#contacto"]) {
    await expect(page.locator(selector).getByRole("heading", { level: 2 }).first()).toHaveCSS("color", "rgb(255, 255, 255)");
  }
  await page.getByRole("button", { name: "Activar tema oscuro" }).click();
  const darkColors: string[] = [];
  for (const selector of selectors) {
    const color = await page.locator(selector).evaluate((element) => getComputedStyle(element).backgroundColor);
    const resolvedColor = color === "rgba(0, 0, 0, 0)"
      ? await page.locator("body").evaluate((element) => getComputedStyle(element).backgroundColor)
      : color;
    darkColors.push(resolvedColor);
    const channels = resolvedColor.match(/\d+/g)!.slice(0, 3).map(Number);
    expect(Math.max(...channels)).toBeLessThan(80);
  }
  expect(new Set(darkColors)).toEqual(new Set(["rgb(16, 16, 18)", "rgb(24, 24, 28)"]));
  for (let index = 1; index < darkColors.length; index++) {
    expect(darkColors[index]).not.toBe(darkColors[index - 1]);
  }
});

test("images and local downloads exist; viewport has no horizontal overflow", async ({ page, request }) => {
  await page.goto("/");
  for (const project of projects) {
    expect((await request.get(project.image)).ok()).toBeTruthy();
  }
  expect((await request.get(profile.resume)).ok()).toBeTruthy();
  expect((await request.get(profile.image)).ok()).toBeTruthy();
  for (const width of [320, 393, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `Horizontal overflow at ${width}px`).toBe(false);
  }
});

test("content remains accessible with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Infra", exact: true }).click();
  await expect(page.locator("#layer-infra")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
});

test("main content and native menu work without JavaScript", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.name === "mobile" ? { width: 393, height: 851 } : { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#proyectos article")).toHaveCount(projects.length);
  await expect(page.getByRole("link", { name: "Hablemos de tu proyecto" })).toHaveAttribute("href", `mailto:${profile.email}`);
  if (testInfo.project.name === "mobile") {
    await page.getByLabel("Abrir menú de navegación").click();
    await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("open", "");
  }
  await context.close();
});

test("mobile menu closes on Escape, outside click and navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile navigation only");
  await page.goto("/");
  const menu = page.locator("[data-mobile-menu]");
  await page.getByLabel("Abrir menú de navegación").click();
  await expect(menu).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(menu.locator("summary")).toBeFocused();
  await page.getByLabel("Abrir menú de navegación").click();
  await page.locator("h1").click({ position: { x: 10, y: 20 } });
  await expect(menu).not.toHaveAttribute("open", "");
  await page.getByLabel("Abrir menú de navegación").click();
  await menu.getByRole("link", { name: "Experiencia", exact: true }).click();
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(page).toHaveURL(/#experiencia$/);
});
