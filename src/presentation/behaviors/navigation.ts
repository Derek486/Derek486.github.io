export function initNavigation() {
  const header = document.querySelector<HTMLElement>("[data-header]");
  const menu = document.querySelector<HTMLDetailsElement>("[data-mobile-menu]");
  const links = document.querySelectorAll<HTMLAnchorElement>("[data-nav-link]");
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-section]"));
  const desktop = window.matchMedia("(min-width: 1024px)");
  let frame = 0;

  const update = () => {
    frame = 0;
    if (header) header.dataset.scrolled = String(window.scrollY > 24);
    const trigger = Math.min(window.innerHeight * 0.4, 300);
    const active = sections.filter((section) => section.getBoundingClientRect().top <= trigger).at(-1);
    links.forEach((link) => {
      if (active && link.hash === `#${active.id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };
  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  update();

  if (!menu) return;
  const summary = menu.querySelector("summary");
  const close = (restoreFocus = false) => {
    menu.open = false;
    if (restoreFocus) summary?.focus();
  };
  menu.addEventListener("toggle", () => {
    summary?.setAttribute("aria-label", menu.open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  });
  menu.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) close();
  });
  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !menu.contains(event.target)) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) close(true);
  });
  document.addEventListener("focusin", (event) => {
    if (event.target instanceof Node && !menu.contains(event.target)) close();
  });
  desktop.addEventListener("change", () => {
    if (desktop.matches) close();
  });
}
