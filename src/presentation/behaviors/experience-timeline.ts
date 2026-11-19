export function initExperienceTimeline() {
  const timeline = document.querySelector<HTMLOListElement>("[data-experience-timeline]");
  if (!timeline) return;

  const entries = Array.from(timeline.children).flatMap((item) => {
    const node = item.querySelector<HTMLElement>("[data-timeline-node]");
    const segment = item.querySelector<HTMLElement>("[data-timeline-segment]");
    return node ? [{ node, segment }] : [];
  });
  if (entries.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;

  const update = () => {
    frame = 0;
    const readingLine = window.innerHeight * 0.7;
    const positions = entries.map(({ node }) => {
      const { top, height } = node.getBoundingClientRect();
      return top + height / 2;
    });

    entries.forEach(({ node, segment }, index) => {
      const start = positions[index];
      node.toggleAttribute("data-reached", readingLine >= start);
      if (!segment) return;

      const length = positions[index + 1] - start;
      const progress = length > 0 ? Math.max(0, Math.min(1, (readingLine - start) / length)) : 0;
      segment.style.setProperty("--timeline-progress", progress.toFixed(4));
    });
  };

  const requestUpdate = () => {
    if (!reducedMotion.matches && !frame) frame = requestAnimationFrame(update);
  };
  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(requestUpdate) : undefined;
  const syncMotion = () => {
    if (reducedMotion.matches) {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      resizeObserver?.disconnect();
      cancelAnimationFrame(frame);
      frame = 0;
      entries.forEach(({ node, segment }) => {
        node.removeAttribute("data-reached");
        segment?.style.removeProperty("--timeline-progress");
      });
    } else {
      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate, { passive: true });
      resizeObserver?.observe(timeline);
      requestUpdate();
    }
  };

  reducedMotion.addEventListener("change", syncMotion);
  syncMotion();
}
