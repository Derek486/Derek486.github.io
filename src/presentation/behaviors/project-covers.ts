export function initProjectCovers() {
  const tiltEnabled = window.matchMedia("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)");

  document.querySelectorAll<HTMLElement>("[data-project-cover]").forEach((stage) => {
    const image = stage.querySelector("img");
    if (!image) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      image.style.removeProperty("--cover-tilt");
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;
        const { left, top, width, height } = stage.getBoundingClientRect();
        if (!width || !height) return;
        const horizontal = Math.max(0, Math.min(1, (x - left) / width)) - 0.5;
        const vertical = Math.max(0, Math.min(1, (y - top) / height)) - 0.5;
        image.style.setProperty(
          "--cover-tilt",
          `perspective(1400px) rotateX(${(-vertical * 11).toFixed(2)}deg) rotateY(${(horizontal * 13).toFixed(2)}deg)`,
        );
      });
    };

    const sync = () => {
      if (tiltEnabled.matches) {
        stage.addEventListener("pointermove", move, { passive: true });
        stage.addEventListener("pointerleave", reset);
        stage.addEventListener("pointercancel", reset);
      } else {
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerleave", reset);
        stage.removeEventListener("pointercancel", reset);
        reset();
      }
    };

    tiltEnabled.addEventListener("change", sync);
    sync();
  });
}
