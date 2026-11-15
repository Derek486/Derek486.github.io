export function initSpotlight() {
  const hero = document.querySelector<HTMLElement>("[data-spotlight]");
  const glow = hero?.querySelector<HTMLElement>("[data-spotlight-glow]");
  if (!hero || !glow) return;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let x = 0;
  let y = 0;

  hero.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const bounds = hero.getBoundingClientRect();
    x = event.clientX - bounds.left;
    y = event.clientY - bounds.top;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      glow.style.setProperty("--pointer-x", `${x}px`);
      glow.style.setProperty("--pointer-y", `${y}px`);
      glow.dataset.active = "true";
      frame = 0;
    });
  });
  const hide = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    glow.dataset.active = "false";
  };
  hero.addEventListener("pointerleave", hide);
  reducedMotion.addEventListener("change", hide);
  finePointer.addEventListener("change", hide);
}
