export function initSpotlight() {
  const enabled = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)");
  const resets: Array<() => void> = [];

  document.querySelectorAll<HTMLElement>("[data-spotlight]").forEach((panel) => {
    const glow = panel.querySelector<HTMLElement>(":scope > [data-spotlight-glow]");
    if (!glow) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    panel.addEventListener("pointermove", (event) => {
      if (!enabled.matches || event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const { left, top } = glow.getBoundingClientRect();
        glow.style.setProperty("--pointer-x", `${x - left}px`);
        glow.style.setProperty("--pointer-y", `${y - top}px`);
        glow.dataset.active = "true";
        frame = 0;
      });
    }, { passive: true });

    const hide = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      glow.dataset.active = "false";
    };
    panel.addEventListener("pointerleave", hide);
    panel.addEventListener("pointercancel", hide);
    resets.push(hide);
  });

  enabled.addEventListener("change", () => resets.forEach((hide) => hide()));
}
