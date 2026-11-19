const easeOut = "cubic-bezier(0.2, 0, 0, 1)";
const standard: Keyframe[] = [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }];
const cover: Keyframe[] = [
  { opacity: 0.55, transform: "perspective(1600px) translateY(24px) rotateX(12deg) rotateY(-9deg) scale(0.94)" },
  { opacity: 1, transform: "none" },
];
const scrollReveals = {
  "project-media": { keyframes: cover, duration: 720, delay: 0 },
  "showcase-media": { keyframes: cover, duration: 720, delay: 0 },
  "project-details": {
    keyframes: [{ opacity: 0.25, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
    duration: 560,
    delay: 65,
  },
  experience: {
    keyframes: [{ opacity: 0.38, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
    duration: 560,
    delay: 0,
  },
} satisfies Record<string, { keyframes: Keyframe[]; duration: number; delay: number }>;

export function initReveals() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches || !("IntersectionObserver" in window) || !Element.prototype.animate) return;
  const animations = new Set<Animation>();

  const observe = (selector: string, threshold: number, onlyBelowViewport = false) => {
    const observer = new IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach(({ target }, index) => {
        observer.unobserve(target);
        // Covers animate inside their link so the clickable area and focus ring stay still.
        const focusTarget = target.closest("a") ?? target;
        if (reducedMotion.matches || focusTarget.contains(document.activeElement)) return;

        const kind = target.getAttribute("data-reveal");
        // A shared-image transition already covers the visible arrival from the gallery.
        if (kind === "showcase-media" && CSS.supports("selector(:active-view-transition)") &&
            document.documentElement.matches(":active-view-transition")) return;

        const profile = scrollReveals[kind as keyof typeof scrollReveals];
        const animation = target.animate(profile?.keyframes ?? standard, {
          duration: profile?.duration ?? 700,
          delay: (profile?.delay ?? 0) + Math.min(index * 45, 135),
          easing: easeOut,
          fill: "backwards",
        });
        animations.add(animation);

        // Never keep a focused control faded or displaced while using the keyboard.
        const showOnFocus = () => animation.cancel();
        const cleanUp = () => {
          animations.delete(animation);
          focusTarget.removeEventListener("focusin", showOnFocus);
        };
        focusTarget.addEventListener("focusin", showOnFocus, { once: true });
        void animation.finished.then(cleanUp, cleanUp);
      });
    }, { threshold });

    document.querySelectorAll(selector).forEach((element) => {
      // Keep already visible content stable on load, including at deep links.
      if (!onlyBelowViewport || element.getBoundingClientRect().top >= window.innerHeight) {
        observer.observe(element);
      }
    });
    return observer;
  };

  const standardObserver = observe('[data-reveal=""]', 0.08);
  const scrollObserver = observe('[data-reveal]:not([data-reveal=""], [data-reveal="showcase-media"])', 0, true);
  const showcaseObserver = observe('[data-reveal="showcase-media"]', 0);
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    standardObserver.disconnect();
    scrollObserver.disconnect();
    showcaseObserver.disconnect();
    animations.forEach((animation) => animation.cancel());
  });
}
