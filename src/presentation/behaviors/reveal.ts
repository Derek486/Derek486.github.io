export function initReveals() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) return;
  const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
  const animations = new Set<Animation>();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      // Content stays visible without JS and when animations are unsupported.
      const animation = entry.target.animate(
        [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }],
        { duration: 700, delay: Math.min(index * 65, 195), easing: "cubic-bezier(0.2, 0, 0, 1)", fill: "backwards" },
      );
      animations.add(animation);
      animation.addEventListener("finish", () => animations.delete(animation), { once: true });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });

  elements.forEach((element) => observer.observe(element));
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    observer.disconnect();
    animations.forEach((animation) => animation.finish());
    animations.clear();
  });
}
