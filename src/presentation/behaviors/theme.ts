export function initTheme() {
  const root = document.documentElement;
  const button = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!button) return;

  const sync = () => {
    const isDark = root.classList.contains("dark");
    const label = isDark ? "Activar tema claro" : "Activar tema oscuro";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(isDark));
  };

  button.addEventListener("click", () => {
    const isDark = root.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // The control still works when persistent storage is unavailable.
    }
    sync();
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== "theme" && event.key !== null) return;
    root.classList.toggle("dark", event.newValue === "dark");
    sync();
  });
  sync();
}
