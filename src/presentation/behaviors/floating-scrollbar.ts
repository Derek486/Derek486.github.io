export function initFloatingScrollbar() {
  const root = document.documentElement;
  const bar = document.querySelector<HTMLElement>("[data-floating-scrollbar]");
  const track = bar?.querySelector<HTMLElement>("[data-scroll-track]");
  if (!bar || !track) return;

  const enabled = matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine) and (forced-colors: none)");
  const range = () => Math.max(0, root.scrollHeight - root.clientHeight);
  let frame = 0;
  let thumbHeight = 0;
  let travel = 0;
  let offset = 0;
  let drag: { id: number; grab: number } | undefined;

  const update = () => {
    frame = 0;
    const distance = range();
    const active = enabled.matches && distance > 0;
    root.toggleAttribute("data-floating-scroll", active);
    bar.hidden = !active;
    if (!active) return;

    const height = track.clientHeight;
    const fraction = Math.min(1, Math.max(0, window.scrollY / distance));
    thumbHeight = Math.min(height, Math.max(34, height * root.clientHeight / root.scrollHeight));
    travel = height - thumbHeight;
    offset = travel * fraction;
    bar.style.setProperty("--thumb-height", `${thumbHeight}px`);
    bar.style.setProperty("--thumb-y", `${offset}px`);
    bar.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
  };

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  const moveTo = (y: number, grab: number) => {
    if (travel <= 0) return;
    const fraction = (y - track.getBoundingClientRect().top - grab) / travel;
    window.scrollTo({ top: Math.min(1, Math.max(0, fraction)) * range(), behavior: "instant" });
  };

  window.addEventListener("scroll", () => {
    if (enabled.matches) schedule();
  }, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  enabled.addEventListener("change", schedule);
  if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(document.body);

  bar.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || drag || travel <= 0) return;
    const relativeY = event.clientY - track.getBoundingClientRect().top - offset;
    const onThumb = relativeY >= 0 && relativeY <= thumbHeight;
    drag = { id: event.pointerId, grab: onThumb ? relativeY : thumbHeight / 2 };
    bar.setPointerCapture(event.pointerId);
    bar.setAttribute("data-dragging", "");
    if (!onThumb) moveTo(event.clientY, drag.grab);
  });
  bar.addEventListener("pointermove", (event) => {
    if (drag?.id === event.pointerId) moveTo(event.clientY, drag.grab);
  });
  bar.addEventListener("lostpointercapture", () => {
    drag = undefined;
    bar.removeAttribute("data-dragging");
  });

  bar.addEventListener("keydown", (event) => {
    const page = root.clientHeight * 0.88;
    const y = window.scrollY;
    const targets: Record<string, number> = {
      ArrowUp: y - 48,
      ArrowDown: y + 48,
      PageUp: y - page,
      PageDown: y + page,
      Home: 0,
      End: range(),
      " ": y + (event.shiftKey ? -page : page),
    };
    if (!Object.hasOwn(targets, event.key)) return;
    event.preventDefault();
    window.scrollTo({ top: targets[event.key], behavior: "instant" });
  });

  update();
}
