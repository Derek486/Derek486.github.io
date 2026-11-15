export function initPlayground() {
  const playground = document.querySelector<HTMLElement>("[data-playground]");
  if (!playground) return;
  const buttons = playground.querySelectorAll<HTMLButtonElement>("[data-layer-button]");
  const panels = playground.querySelectorAll<HTMLElement>("[data-layer-panel]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animation: Animation | undefined;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;
      animation?.cancel();
      const id = button.dataset.layerButton;
      buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.layerPanel !== id;
        if (!panel.hidden && !reducedMotion.matches) {
          animation = panel.animate(
            [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
            { duration: 280, easing: "ease-out" },
          );
        }
      });
    });
  });

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) animation?.finish();
  });
}
