import { expect, test } from "@playwright/test";
import profile from "../src/data/profile.json" with { type: "json" };
import projects from "../src/data/projects.json" with { type: "json" };
import experience from "../src/data/experience.json" with { type: "json" };
import playground from "../src/data/playground.json" with { type: "json" };
import site from "../src/data/site.json" with { type: "json" };

test("the full-screen code mark opens into the hero animations once per tab", async ({ page }) => {
  await page.addInitScript(() => {
    document.addEventListener("animationstart", (event) => {
      if (event.animationName === "expand-halo") document.documentElement.dataset.entryHaloStarted = "true";
      if (event.animationName !== "draw-mark" || !(event.target instanceof SVGPathElement)) return;
      const entry = event.target.closest("#portfolio-entry")!;
      const bounds = entry.getBoundingClientRect();
      if (bounds.top === 0 && bounds.left === 0 && bounds.width === innerWidth && bounds.height === innerHeight) {
        document.documentElement.dataset.entryCoveredViewport = "true";
      }
      const heading = document.querySelector("#inicio h1");
      const path = heading?.querySelector("svg path");
      if (path && getComputedStyle(path).animationPlayState === "paused" && !heading?.getAnimations().length) {
        document.documentElement.dataset.heroWaitedForEntry = "true";
      }
    });
    document.addEventListener("portfolio:entry-reveal", () => {
      const heading = document.querySelector("#inicio h1")!;
      const path = document.querySelector("#inicio h1 svg path")!;
      if (getComputedStyle(path).animationPlayState === "running") {
        document.documentElement.dataset.underlineStarted = "true";
      }
      const recordHeroReveal = () => {
        if (heading.getAnimations().length) {
          document.documentElement.dataset.heroRevealStarted = "true";
        } else if (document.querySelector("#portfolio-entry:not([hidden])")) {
          requestAnimationFrame(recordHeroReveal);
        }
      };
      requestAnimationFrame(recordHeroReveal);
    });
  });
  await page.goto("./");
  const root = page.locator("html");
  const entry = page.locator("#portfolio-entry");
  await expect(root).toHaveAttribute("data-entry-covered-viewport", "true");
  await expect(root).toHaveAttribute("data-entry-halo-started", "true");
  await expect(root).toHaveAttribute("data-hero-waited-for-entry", "true");
  await expect(root).toHaveAttribute("data-underline-started", "true");
  await expect(root).toHaveAttribute("data-hero-reveal-started", "true");
  await expect(entry).toBeHidden();
  await expect(entry.locator("button, a")).toHaveCount(0);
  await page.reload();
  await expect(root).not.toHaveAttribute("data-entry-covered-viewport");
  await expect(entry).toBeHidden();
});

test("the decorative intro does not block keyboard access to content", async ({ page }) => {
  await page.goto("./", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#portfolio-entry")).toBeHidden();
  await expect(page.locator("#contenido")).toBeFocused();
});

test("a direct link to projects does not play the intro", async ({ page }) => {
  await page.goto("./#proyectos");
  await expect(page.locator("#portfolio-entry")).toBeHidden();
  await expect(page.locator("#proyectos")).toBeInViewport();
});

test("the matte floating scrollbar supports native scroll, dragging and keyboard", async ({ page }) => {
  await page.goto("./#inicio");
  const rail = page.getByRole("scrollbar", { name: "Desplazamiento de página" });
  const root = page.locator("html");
  const desktop = await page.evaluate(() => matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)").matches);
  const scroll = (fraction: number) => page.evaluate((position) => {
    const distance = document.documentElement.scrollHeight - innerHeight;
    window.scrollTo({ top: position * distance, behavior: "instant" });
  }, fraction);

  await expect(page.locator("nav [data-reading-progress]")).toHaveCount(0);
  if (!desktop) {
    await expect(rail).toBeHidden();
    await expect(root).not.toHaveCSS("scrollbar-width", "none");
    await scroll(0.5);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    return;
  }

  await expect(rail).toBeVisible();
  await expect(root).toHaveCSS("scrollbar-width", "none");
  await expect(rail).toHaveCSS("right", "8px");
  await expect(rail).toHaveCSS("width", "6px");
  await expect(rail).toHaveCSS("backdrop-filter", "none");
  await expect(rail).toHaveCSS("box-shadow", "none");
  const handle = rail.locator("[data-scroll-thumb]");
  const color = await handle.evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(rail).toHaveAttribute("aria-valuenow", "0");
  await scroll(0.5);
  await expect(rail).toHaveAttribute("aria-valuenow", "50");
  await expect(handle).toHaveCSS("background-color", color);

  const bounds = (await rail.boundingBox())!;
  const thumb = (await handle.boundingBox())!;
  const cursor = page.locator("[data-technical-cursor]");
  const thumbY = thumb.y + thumb.height / 2;
  await page.mouse.move(bounds.x + bounds.width + 4, thumbY);
  await expect(cursor).toBeVisible();
  await expect(cursor).toHaveAttribute("data-mode", "action");
  await expect(rail).toHaveCSS("cursor", "none");
  expect(await rail.evaluate((element) => getComputedStyle(element, "::before").cursor)).toBe("none");

  await page.mouse.move(thumb.x + thumb.width / 2, thumbY);
  await page.mouse.down();
  await expect(rail).toHaveAttribute("data-dragging", "");
  await expect(cursor).toHaveAttribute("data-pressed", "");
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height, { steps: 6 });
  await expect(rail).toHaveAttribute("aria-valuenow", "100");
  await expect(cursor).toBeVisible();
  await page.mouse.up();
  await expect(rail).not.toHaveAttribute("data-dragging");
  await rail.press("Home");
  await expect(rail).toHaveAttribute("aria-valuenow", "0");
  await rail.press("PageDown");
  await expect(rail).not.toHaveAttribute("aria-valuenow", "0");
});

test("the inline crosshair follows mouse capabilities", async ({ page }) => {
  await page.goto("./#inicio");
  const panel = page.locator("[data-playground]");
  const cursor = page.locator("[data-technical-cursor]");
  const tab = panel.getByRole("button", { name: "Backend", exact: true });
  const mouse = await page.evaluate(() => matchMedia("(any-hover: hover) and (any-pointer: fine)").matches);
  if (mouse) {
    await expect(cursor).toBeHidden();
    await page.mouse.move(20, 140);
    await expect(cursor).toBeVisible();
    await expect(cursor).toHaveAttribute("data-mode", "base");
    await expect(cursor).toHaveCSS("color", "rgb(32, 32, 36)");
    await expect(cursor.locator("feFlood")).toHaveCSS("flood-color", "rgb(250, 250, 250)");
    await expect(cursor.locator(".dot")).toHaveCSS("transform", "none");
    await tab.hover();
    await expect(tab).toHaveCSS("cursor", "none");
    await expect(cursor).toHaveAttribute("data-mode", "action");
    await expect(cursor.locator(".dot")).toHaveCSS("transform", "matrix(1.67, 0, 0, 1.67, 0, 0)");
    await page.mouse.down();
    await expect(cursor).toHaveAttribute("data-pressed", "");
    await expect(cursor.locator(".axes")).toHaveCSS("transform", "matrix(0.7, 0, 0, 0.7, 0, 0)");
    await page.mouse.up();
    await expect(cursor).not.toHaveAttribute("data-pressed");
    await tab.evaluate((element) => element.setAttribute("disabled", ""));
    await page.mouse.move(21, 140);
    await tab.hover();
    await expect(cursor).toHaveAttribute("data-mode", "disabled");
    await expect(cursor.locator(".disabled-mark")).toHaveCSS("opacity", "0.86");
    await page.getByRole("link", { name: "Explorar proyectos" }).hover();
    await expect(cursor).toHaveAttribute("data-mode", "link");
    await expect(cursor.locator(".link-mark")).toHaveCSS("opacity", "0.94");
    const point = await page.locator("h1").evaluate((heading) => {
      const range = document.createRange();
      range.selectNodeContents(heading.firstChild!);
      const rect = range.getClientRects()[0];
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    await page.mouse.move(point.x, point.y);
    await expect(cursor).toHaveAttribute("data-mode", "text");
    await expect(cursor.locator(".beam")).toHaveCSS("opacity", "1");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(cursor).toBeHidden();
    await expect(tab).not.toHaveCSS("cursor", "none");
    await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
    await expect(cursor).toBeHidden();
    await expect(page.locator("[data-floating-scrollbar]")).toBeHidden();
  } else {
    await panel.tap();
    await expect(cursor).toBeHidden();
  }
});

test("ambient cursor light reaches the glass from outside the cards while shadows stay fixed", async ({ page }) => {
  await page.goto("./#inicio");
  const heroCard = page.locator("[data-playground] > div").first();
  const projects = page.locator("#proyectos");
  for (const card of [heroCard, ...await projects.locator("article").all()]) {
    await expect(card).toHaveCSS("backdrop-filter", /blur\([1-9]\d*(?:\.\d+)?px\)/);
    await expect(card).toHaveCSS("box-shadow", /inset.+?, .+?, .+/);
    await expect(card.locator("[data-cursor-light], [data-spotlight]")).toHaveCount(0);
  }
  const heroLight = page.locator("#inicio > [data-cursor-light]");
  const projectLight = projects.locator(":scope > [data-cursor-light]");
  const mouse = await page.evaluate(() => matchMedia("(any-hover: hover) and (any-pointer: fine)").matches);
  if (!mouse) {
    await expect(heroLight).toBeHidden();
    await expect(projectLight).toBeHidden();
    return;
  }

  const verifyOutside = async (card: typeof heroCard, light: typeof heroLight, side: "left" | "top") => {
    const bounds = (await card.boundingBox())!;
    const shadow = await card.evaluate((element) => getComputedStyle(element).boxShadow);
    const x = Math.round(bounds.x + (side === "left" ? -28 : bounds.width / 2));
    const y = Math.round(bounds.y + (side === "top" ? -28 : bounds.height / 2));
    await page.mouse.move(x, y);
    const glow = light.locator("span");
    await expect(light).toHaveAttribute("data-lit", "");
    await expect(glow).toHaveCSS("opacity", "1");
    await expect.poll(async () => {
      const rect = (await glow.boundingBox())!;
      return Math.hypot(rect.x + rect.width / 2 - x, rect.y + rect.height / 2 - y);
    }).toBeLessThan(1);
    await page.mouse.move(bounds.x + 8, bounds.y + 8);
    await expect(card).toHaveCSS("box-shadow", shadow);
  };
  await verifyOutside(heroCard, heroLight, "left");
  await projects.evaluate((section) => section.scrollIntoView({ behavior: "instant" }));
  await verifyOutside(projects.locator("[data-primary-projects] article").first(), projectLight, "top");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(projectLight).toBeHidden();
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  await expect(projectLight).toBeHidden();
});

test("contact footer aligns its introduction, contact details and social links", async ({ page }) => {
  await page.goto("./");
  const footer = page.getByRole("contentinfo");
  await footer.scrollIntoViewIfNeeded();
  const title = footer.getByRole("heading", { level: 2 });
  await expect(title).toContainText(site.contact.eyebrow);
  await expect(title).toContainText(site.contact.title);
  const description = footer.getByText(site.contact.description);
  await expect(description).toBeVisible();
  const email = footer.getByRole("region", { name: site.contact.emailLabel });
  const phone = footer.getByRole("region", { name: "Teléfono" });
  const emailLink = email.getByRole("link", { name: profile.email });
  const phoneLink = phone.getByRole("link", { name: profile.phone });
  await expect(emailLink).toHaveAttribute("href", `mailto:${profile.email}`);
  await expect(phoneLink).toHaveAttribute("href", "tel:+51957806344");
  const linkSize = (element: Element) => parseFloat(getComputedStyle(element).fontSize);
  expect(await emailLink.evaluate(linkSize)).toBeGreaterThan(await phoneLink.evaluate(linkSize));
  const mutedColor = await phone.getByRole("heading").evaluate((element) => getComputedStyle(element).color);
  await expect(email.getByRole("heading")).toHaveCSS("color", mutedColor);
  await expect(footer.getByText("Datos de contacto", { exact: true })).toHaveCount(0);
  await expect(footer.getByText("Correo", { exact: true })).toHaveCount(0);
  const socials = footer.getByRole("navigation", { name: "Redes" });
  for (const { label, href } of profile.socials) {
    await expect(socials.getByRole("link", { name: label })).toHaveAttribute("href", href);
    await expect(socials.getByRole("link", { name: label })).toHaveAttribute("rel", "noopener noreferrer");
  }
  const bottom = footer.locator(":scope > div").last();
  await expect(bottom.getByRole("link")).toHaveCount(1);
  await expect(bottom.getByRole("link", { name: "Volver arriba" })).toHaveAttribute("href", "#inicio");
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 393, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    const section = await page.locator("#sobre-mi > div").boundingBox();
    for (const container of await footer.locator(":scope > div").all()) {
      const bounds = await container.boundingBox();
      expect(bounds!.x).toBe(section!.x);
      expect(bounds!.width).toBe(section!.width);
    }
    const sectionHeading = await page.locator("#sobre-mi h2").evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(await title.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeLessThan(sectionHeading);
    const titleBounds = (await title.boundingBox())!;
    const descriptionBounds = (await description.boundingBox())!;
    const emailBounds = (await email.boundingBox())!;
    const phoneBounds = (await phone.boundingBox())!;
    const socialsBounds = (await socials.boundingBox())!;
    expect(emailBounds.y).toBeGreaterThan(descriptionBounds.y + descriptionBounds.height);
    expect(phoneBounds.y).toBe(socialsBounds.y);
    expect(socialsBounds.x).toBeGreaterThan(phoneBounds.x);
    if (width >= 768) {
      expect(descriptionBounds.x).toBeGreaterThan(titleBounds.x);
      expect(emailBounds.x).toBe(titleBounds.x);
      expect(phoneBounds.x).toBe(descriptionBounds.x);
      expect(phoneBounds.y).toBe(emailBounds.y);
    } else {
      expect(descriptionBounds.y).toBeGreaterThan(titleBounds.y + titleBounds.height);
      expect(phoneBounds.y).toBeGreaterThan(emailBounds.y + emailBounds.height);
    }
  }
});

test("renders full stack content from JSON without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
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
  await page.goto("./");
  const primary = page.locator("[data-primary-projects] article");
  const other = page.locator("[data-other-projects] article");
  await expect(page.locator("#proyectos article")).toHaveCount(6);
  await expect(primary).toHaveCount(3);
  await expect(other).toHaveCount(3);
  await expect(primary.first()).toHaveAttribute("data-project", "engine-alert-manager");
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

test("primary project covers share a width and alternate sides on wide screens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./#proyectos");
  await expect(page.getByRole("complementary", { name: "Áreas de trabajo" })).toHaveCount(0);
  const narrow = page.viewportSize()!.width < 768;
  const cards = await page.locator("[data-primary-projects] article").evaluateAll((elements) => elements.map((card) => ({
    row: card.getBoundingClientRect().toJSON(),
    contentWidth: card.clientWidth - parseFloat(getComputedStyle(card).paddingLeft) - parseFloat(getComputedStyle(card).paddingRight),
    cover: card.querySelector("a")!.getBoundingClientRect().toJSON(),
    details: card.querySelector("[data-reveal='project-details']")!.getBoundingClientRect().toJSON(),
  })));

  cards.forEach(({ row, contentWidth, cover, details }, index) => {
    expect(cover.width).toBeCloseTo(cards[0].cover.width);
    if (narrow) {
      expect(cover.width).toBeCloseTo(contentWidth);
      expect(cover.bottom).toBeLessThan(details.top);
    } else {
      expect(cover.width).toBeLessThan(row.width * 0.55);
      if (index % 2 === 0) expect(details.right).toBeLessThan(cover.left);
      else expect(cover.right).toBeLessThan(details.left);
    }
  });
});

const hasPerspectiveAnimation = (element: Element) => element.getAnimations().some((animation) =>
  (animation.effect as KeyframeEffect | null)?.getKeyframes().some((keyframe) =>
    typeof keyframe.transform === "string" && keyframe.transform.includes("perspective"),
  ),
);

test("reveals project images in perspective as they enter the viewport", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#portfolio-entry")).toBeHidden();
  const media = page.locator("[data-primary-projects] [data-reveal='project-media']");
  const scrollToMedia = (element: Element) => {
    window.scrollBy({ top: element.getBoundingClientRect().top - window.innerHeight * 0.75, behavior: "instant" });
  };
  const first = media.nth(0);
  const second = media.nth(1);

  await first.evaluate(scrollToMedia);
  await expect.poll(() => first.evaluate(hasPerspectiveAnimation)).toBe(true);
  expect(await second.evaluate(hasPerspectiveAnimation)).toBe(false);
  await expect(first).toHaveCSS("transform", "none");

  await second.evaluate(scrollToMedia);
  await expect.poll(() => second.evaluate(hasPerspectiveAnimation)).toBe(true);
  await expect(second).toHaveCSS("transform", "none");
});

test("each project image leads to a shareable case study instead of GitHub", async ({ page, baseURL }) => {
  for (const project of projects) {
    await page.goto("./");
    const card = page.locator(`[data-project="${project.id}"]`);
    const cover = card.getByRole("link", { name: `Ver proyecto: ${project.title}` });
    const url = new URL(`proyectos/${project.id}/`, baseURL);
    await expect(cover).toHaveJSProperty("href", url.href);
    await cover.getByRole("img").click();
    await expect(page).toHaveURL(url.href);
    await expect(page.getByRole("heading", { level: 1, name: project.title })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Qué resuelve" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Qué permite hacer" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aprendizajes" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver código en GitHub" })).toHaveAttribute("href", project.github);
    await expect(page.getByRole("link", { name: /Ampliar imagen/ })).toHaveCount(0);
    const showcase = page.getByRole("region", { name: "Vista del proyecto" });
    await expect(showcase.getByRole("img")).toHaveJSProperty("src", new URL(`.${project.image}`, baseURL).href);
    await expect(showcase.getByRole("link")).toHaveCount(0);
  }
});

test("frameless showcase cover keeps perspective motion and respects reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 360 });
  await page.goto(`./proyectos/${projects[0].id}/`);
  const surface = page.locator("[data-reveal='showcase-media']");
  const image = surface.getByRole("img");
  await expect(image).toHaveCSS("border-radius", "0px");
  await expect(image).not.toHaveCSS("box-shadow", "none");
  await surface.evaluate((element) => {
    window.scrollBy({ top: element.getBoundingClientRect().top - 130, behavior: "instant" });
  });
  await expect.poll(() => surface.evaluate(hasPerspectiveAnimation)).toBe(true);
  await expect(surface).toHaveCSS("transform", "none");

  if (await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)) {
    await page.locator("[data-project-cover]").hover({ position: { x: 45, y: 45 } });
    await expect(image).toHaveCSS("transform", /^matrix3d\(/);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(image).toHaveCSS("transform", "none");
  await expect(image).toHaveCSS("view-transition-name", "none");
});

test("project showcase expands architecture by keyboard and links to the next case", async ({ page, baseURL }) => {
  const [first, second] = projects;
  await page.goto(`./proyectos/${first.id}/`);
  const modules = page.getByRole("region", { name: "Arquitectura" }).locator("details");
  await expect(modules).toHaveCount(first.caseStudy.architecture.length);
  await expect(modules.first()).toHaveAttribute("open", "");
  await modules.nth(1).locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(modules.nth(1)).toHaveAttribute("open", "");
  await expect(modules.first()).not.toHaveAttribute("open");
  await expect(modules.nth(1).getByText(first.caseStudy.architecture[1].summary)).toBeVisible();

  const cover = page.getByRole("region", { name: "Vista del proyecto" }).getByRole("img");
  await expect(cover).toHaveCSS("view-transition-name", `project-${first.id}`);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cover).toHaveCSS("view-transition-name", "none");

  await page.getByRole("navigation", { name: "Navegación entre proyectos" }).getByRole("link").click();
  await expect(page).toHaveURL(new URL(`proyectos/${second.id}/`, baseURL).href);
  await page.getByRole("link", { name: "Volver a proyectos" }).click();
  await expect(page).toHaveURL(new URL(`#proyecto-${second.id}`, baseURL).href);
  await expect(page.locator(`[data-project="${second.id}"]`)).toBeInViewport();
});

test("experience sets a 22/45/33 layout with one continuous axis and icon badges", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./#experiencia");
  const list = page.locator("[data-experience-timeline] > li");
  await expect(list).toHaveCount(experience.length);
  for (const [index, entry] of experience.entries()) {
    const row = list.nth(index);
    await expect(row.getByText(entry.date, { exact: true })).toBeVisible();
    await expect(row.getByText(entry.company, { exact: true })).toBeVisible();
    await expect(row.getByRole("heading", { name: entry.title, exact: true })).toHaveCSS("font-weight", "700");
    await expect(row.getByRole("heading", { name: "Tecnologías", exact: true })).toBeVisible();
    const badges = row.getByRole("list", { name: "Tecnologías" }).getByRole("listitem");
    await expect(badges).toHaveCount(entry.technologies.length);
    await expect(badges.locator("svg[aria-hidden=true]")).toHaveCount(entry.technologies.length);
  }

  for (const width of [320, 768, 960, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    const entries = await list.evaluateAll((elements) => elements.map((entry) => ({
      row: entry.getBoundingClientRect().toJSON(),
      node: entry.querySelector("[data-timeline-node]")!.getBoundingClientRect().toJSON(),
      meta: entry.querySelector("[data-experience-meta]")!.getBoundingClientRect().toJSON(),
      details: entry.querySelector("[data-experience-details]")!.getBoundingClientRect().toJSON(),
      tech: entry.querySelector("[data-experience-technologies]")!.getBoundingClientRect().toJSON(),
      track: entry.querySelector("[data-timeline-segment]")?.parentElement?.getBoundingClientRect().toJSON(),
      marks: entry.querySelectorAll(":scope > span").length,
    })));

    for (const [index, { row, node, meta, details, tech, track, marks }] of entries.entries()) {
      const axis = node.left + node.width / 2;
      expect(marks).toBe(track ? 2 : 1);
      expect(meta.top).toBeCloseTo(row.top);
      if (width < 960) {
        expect(axis).toBeCloseTo(row.left + 8);
        expect(meta.left).toBeGreaterThan(node.right);
        expect(details.left).toBeCloseTo(meta.left);
        expect(tech.left).toBeCloseTo(meta.left);
        expect(meta.bottom).toBeLessThan(details.top);
        expect(details.bottom).toBeLessThan(tech.top);
      } else {
        expect(axis).toBeCloseTo(row.left + row.width * 0.22, 0);
        expect(meta.width / row.width).toBeCloseTo(0.22);
        expect(details.width / row.width).toBeCloseTo(0.45);
        expect(tech.width / row.width).toBeCloseTo(0.33);
        expect(details.left).toBeCloseTo(meta.right);
        expect(tech.left).toBeCloseTo(details.right);
        expect(details.top).toBeCloseTo(meta.top);
        expect(tech.top).toBeCloseTo(meta.top);
      }
      if (track) {
        const next = entries[index + 1].node;
        expect(track.top).toBeCloseTo(node.top + node.height / 2);
        expect(track.bottom).toBeCloseTo(next.top + next.height / 2);
      }
    }
  }
});

test("experience timeline connects entries in sync with scroll", async ({ page }) => {
  await page.goto("./");
  const timeline = page.locator("[data-experience-timeline]");
  const nodes = timeline.locator("[data-timeline-node]");
  const segments = timeline.locator("[data-timeline-segment]");
  await expect(nodes).toHaveCount(experience.length);
  await expect(segments).toHaveCount(experience.length - 1);
  await expect(timeline.locator("[data-reached]")).toHaveCount(0);

  const scrollToProgress = (progress: number) => nodes.evaluateAll(([first, second], fraction) => {
    const center = (element: Element) => {
      const { top, height } = element.getBoundingClientRect();
      return top + height / 2;
    };
    const start = center(first);
    window.scrollBy({
      top: start + (center(second) - start) * fraction - window.innerHeight * 0.7,
      behavior: "instant",
    });
  }, progress);
  const currentProgress = () => segments.first().evaluate((element) => {
    const scale = getComputedStyle(element).scale.split(" ");
    return Number(scale[1] ?? scale[0]);
  });

  await scrollToProgress(0.5);
  await expect.poll(currentProgress).toBeCloseTo(0.5, 2);
  await expect(timeline.locator("[data-reached]")).toHaveCount(1);
  await scrollToProgress(1.05);
  await expect.poll(currentProgress).toBe(1);
  await expect(timeline.locator("[data-reached]")).toHaveCount(2);
  await scrollToProgress(0.25);
  await expect.poll(currentProgress).toBeCloseTo(0.25, 2);
  await expect(timeline.locator("[data-reached]")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(segments.first()).toBeHidden();
  await expect(timeline.locator("[data-reached]")).toHaveCount(0);
});

test("navbar becomes a compact frosted pill on scroll", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("[data-header]")).toHaveAttribute("data-scrolled", "false");
  await page.locator("#proyectos").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-header]")).toHaveAttribute("data-scrolled", "true");
  const nav = page.getByRole("navigation", { name: "Navegación principal" });
  await expect.poll(() => nav.evaluate((element) => parseFloat(getComputedStyle(element).maxWidth))).toBe(768);
  await expect.poll(() => nav.evaluate((element) => getComputedStyle(element).backdropFilter)).toContain("blur");
});

test("theme toggles and persists across reloads", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: "Activar tema oscuro" }).click();
  await expect(page.locator("html")).toHaveClass(/(?:^|\s)dark(?:\s|$)/);
  await page.reload();
  await expect(page.getByRole("button", { name: "Activar tema claro" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Activar tema claro" }).click();
  await expect(page.locator("html")).not.toHaveClass(/(?:^|\s)dark(?:\s|$)/);
});

test("playground supports keyboard and each layer shows matching content", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#portfolio-entry")).toBeHidden();
  await expect(page.locator("[data-layer-controls]")).toHaveCSS("box-shadow", /inset/);
  for (const layer of playground) {
    const button = page.getByRole("button", { name: layer.label, exact: true });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
    const panel = page.locator(`#layer-${layer.id}`);
    await expect(panel).toBeVisible();
    await expect(panel).toContainText(layer.description);
    await expect(panel).toContainText(layer.example);
    const chips = panel.getByRole("list", { name: "Tecnologías" }).locator("li");
    for (const [index, id] of layer.technologies.entries()) {
      await expect(chips.nth(index)).toHaveCSS("font-weight", layer.keyTechnologies.includes(id) ? "700" : "400");
    }
    await expect(panel.getByRole("link", { name: "Ver experiencia relacionada" })).toHaveAttribute("href", `#experiencia-${layer.experienceId}`);
    await expect(page.locator("[data-layer-panel]:visible")).toHaveCount(1);
  }
});

test("shows verified experience and the expanded technology stack", async ({ page }) => {
  await page.goto("./");
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

test("applies the neutral editorial and Obsidian palettes", async ({ page }) => {
  await page.goto("./");
  const backgrounds = [
    ["#inicio", "255, 255, 255", "16, 16, 18"],
    ["#proyectos", "245, 245, 246", "24, 24, 28"],
    ["#mi-stack", "250, 250, 250", "16, 16, 18"],
    ["#experiencia", "245, 245, 246", "24, 24, 28"],
    ["#sobre-mi", "250, 250, 250", "16, 16, 18"],
    ["#contacto", "250, 250, 250", "16, 16, 18"],
  ];
  for (const [selector, light] of backgrounds) {
    await expect(page.locator(selector)).toHaveCSS("background-color", `rgb(${light})`);
  }
  const panel = page.locator("[data-playground] > div:first-child");
  const heading = page.locator("#proyectos h2").first();
  const footer = page.getByRole("contentinfo");
  const ambientSurfaces = ["#proyectos", "#mi-stack", "#sobre-mi"].map((selector) => page.locator(selector));
  const lightWashes = await Promise.all(ambientSurfaces.map(async (surface) => {
    await expect(surface).toHaveCSS("background-image", /^radial-gradient/);
    return surface.evaluate((element) => getComputedStyle(element).backgroundImage);
  }));
  const lightSurface = await panel.evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(panel).toHaveCSS("border-top-color", "rgb(228, 228, 231)");
  await expect(heading).toHaveCSS("color", "rgb(32, 32, 36)");
  await expect(footer).toHaveCSS("color-scheme", "light");
  await expect(page.locator("#contact-title")).toHaveCSS("color", "rgb(32, 32, 36)");
  await page.getByRole("button", { name: "Activar tema oscuro" }).click();
  for (const [selector, , dark] of backgrounds) {
    await expect(page.locator(selector)).toHaveCSS("background-color", `rgb(${dark})`);
  }
  for (const [index, surface] of ambientSurfaces.entries()) {
    await expect(surface).toHaveCSS("background-image", /^radial-gradient/);
    await expect(surface).not.toHaveCSS("background-image", lightWashes[index]);
  }
  await expect(panel).toHaveCSS("border-top-color", "rgb(53, 53, 59)");
  await expect(panel).not.toHaveCSS("background-color", lightSurface);
  await expect(heading).toHaveCSS("color", "rgb(245, 245, 246)");
  await expect(footer).toHaveCSS("color-scheme", "dark");
  await expect(page.locator("#contact-title")).toHaveCSS("color", "rgb(245, 245, 246)");
});

test("images and local downloads exist; viewport has no horizontal overflow", async ({ page, request }) => {
  await page.goto("./");
  for (const project of projects) {
    expect((await request.get(`.${project.image}`)).ok()).toBeTruthy();
  }
  expect((await request.get(`.${profile.resume}`)).ok()).toBeTruthy();
  expect((await request.get(`.${profile.image}`)).ok()).toBeTruthy();
  for (const width of [320, 393, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `Horizontal overflow at ${width}px`).toBe(false);
  }
});

test("content remains accessible with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator("#portfolio-entry")).toBeHidden();
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
  await expect(page.locator("#portfolio-entry")).toBeHidden();
  await expect(page.locator("[data-technical-cursor]")).toBeHidden();
  await expect(page.locator("[data-floating-scrollbar]")).toBeHidden();
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#proyectos article")).toHaveCount(projects.length);
  await expect(page.locator("[data-timeline-node]")).toHaveCount(experience.length);
  await expect(page.locator("[data-timeline-node]").first()).toBeVisible();
  await expect(page.locator("#experiencia").getByRole("heading", { name: experience[0].title, exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: profile.email })).toHaveAttribute("href", `mailto:${profile.email}`);
  if (testInfo.project.name === "mobile") {
    await page.getByLabel("Abrir menú de navegación").click();
    await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("open", "");
  }
  const project = projects[0];
  await page.getByRole("link", { name: `Ver proyecto: ${project.title}` }).click();
  await expect(page.getByRole("heading", { level: 1, name: project.title })).toBeVisible();
  const module = page.locator("details").filter({ hasText: project.caseStudy.architecture[1].name });
  await module.locator("summary").click();
  await expect(module).toHaveAttribute("open", "");
  await expect(module.getByText(project.caseStudy.architecture[1].summary)).toBeVisible();
  await context.close();
});

test("mobile menu closes on Escape, outside click and navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile navigation only");
  await page.goto("./");
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
