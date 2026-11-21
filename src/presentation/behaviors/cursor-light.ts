export function initCursorLight() {
  const lights = Array.from(document.querySelectorAll<HTMLElement>("[data-cursor-light]"), (area) => ({
    area,
    glow: area.querySelector("span")!,
  }));
  if (!lights.length) return;

  const enabled = matchMedia("(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)");
  const suppressed = matchMedia("(prefers-reduced-transparency: reduce), (forced-colors: active)");
  let point: { x: number; y: number } | undefined;
  let frame = 0;

  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }

  function paint() {
    frame = 0;
    if (!point || !enabled.matches || suppressed.matches) {
      lights.forEach(({ area }) => area.removeAttribute("data-lit"));
      return;
    }

    const { x, y } = point;
    // Read all section bounds before moving the light behind their cards.
    const bounds = lights.map(({ area }) => area.getBoundingClientRect());
    lights.forEach(({ area, glow }, index) => {
      const { left, top } = bounds[index];
      glow.style.translate = `${x - left}px ${y - top}px`;
      area.setAttribute("data-lit", "");
    });
  }

  function clear() {
    if (!point) return;
    point = undefined;
    schedule();
  }

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !enabled.matches || suppressed.matches) return;
    point = { x: event.clientX, y: event.clientY };
    schedule();
  }, { passive: true });

  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") clear();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", clear);
  window.addEventListener("pointercancel", clear);
  window.addEventListener("blur", clear);
  window.addEventListener("pagehide", clear);
  enabled.addEventListener("change", clear);
  suppressed.addEventListener("change", clear);
  window.addEventListener("scroll", () => { if (point) schedule(); }, { passive: true });
  window.addEventListener("resize", () => { if (point) schedule(); }, { passive: true });
}
