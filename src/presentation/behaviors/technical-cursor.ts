const link = "a[href], area[href], [role='link']";
const action = "button, summary, label[for], input:is([type='button'], [type='submit'], [type='reset'], [type='checkbox'], [type='radio'], [type='image']), [role='button'], [role='tab'], [role='switch'], [role='scrollbar']";
const editable = "textarea, input:not([type]), input:is([type='text'], [type='email'], [type='search'], [type='password'], [type='tel'], [type='url'], [type='number']), [contenteditable]:not([contenteditable='false'])";
const native = "iframe, video[controls], select, input:is([type='range'], [type='color'], [type='date'], [type='file'], [type='time'])";

export function initTechnicalCursor() {
  const cursor = document.querySelector<SVGSVGElement>("[data-technical-cursor]");
  if (!cursor) return;

  const root = document.documentElement;
  const legacyCaret: { caretRangeFromPoint?: (x: number, y: number) => Range | null } = document;
  const enabled = matchMedia("(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)");
  let point: { x: number; y: number } | undefined;
  let frame = 0;
  let pressedAt = 0;
  let releaseTimer = 0;

  function isSelectable(target: Element, x: number, y: number) {
    const caret = document.caretPositionFromPoint?.(x, y);
    const node = caret?.offsetNode ?? legacyCaret.caretRangeFromPoint?.(x, y)?.startContainer;
    if (!(node instanceof Text) || !node.parentElement || !target.contains(node)) return false;
    if (getComputedStyle(node.parentElement).userSelect === "none") return false;

    const range = document.createRange();
    range.selectNodeContents(node);
    return Array.from(range.getClientRects()).some((rect) =>
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom,
    );
  }

  function clearPress() {
    clearTimeout(releaseTimer);
    cursor?.removeAttribute("data-pressed");
  }

  function hide() {
    point = undefined;
    cancelAnimationFrame(frame);
    frame = 0;
    root.removeAttribute("data-technical-pointer");
    clearPress();
  }

  function update() {
    frame = 0;
    if (!enabled.matches || !point || !cursor) return;
    const { x, y } = point;
    const target = document.elementFromPoint(x, y);
    if (!target || x >= root.clientWidth || y >= root.clientHeight || target.closest(native)) {
      root.removeAttribute("data-technical-pointer");
      return;
    }

    let mode = "base";
    if (target.closest(":disabled, [aria-disabled='true']")) mode = "disabled";
    else if (target.closest(link)) mode = "link";
    else if (target.closest(action)) mode = "action";
    else if (target.closest(editable) || isSelectable(target, x, y)) mode = "text";

    cursor.style.setProperty("--cursor-x", `${x}px`);
    cursor.style.setProperty("--cursor-y", `${y}px`);
    if (cursor.dataset.mode !== mode) cursor.dataset.mode = mode;
    if (mode === "disabled" || mode === "text") clearPress();
    root.toggleAttribute("data-technical-pointer", true);
  }

  function schedule() {
    if (point && !frame) frame = requestAnimationFrame(update);
  }

  function move(event: PointerEvent) {
    if (!enabled.matches || event.pointerType !== "mouse") return;
    point = { x: event.clientX, y: event.clientY };
    schedule();
  }

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") {
      hide();
      return;
    }
    if (!enabled.matches || event.button !== 0) return;
    point = { x: event.clientX, y: event.clientY };
    cancelAnimationFrame(frame);
    update();
    if (!root.hasAttribute("data-technical-pointer") || cursor.dataset.mode === "disabled" || cursor.dataset.mode === "text") return;
    clearTimeout(releaseTimer);
    pressedAt = performance.now();
    cursor.setAttribute("data-pressed", "");
  }, { passive: true, capture: true });
  window.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !cursor.hasAttribute("data-pressed")) return;
    releaseTimer = window.setTimeout(clearPress, Math.max(0, 135 - (performance.now() - pressedAt)));
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", hide);
  window.addEventListener("pointercancel", hide);
  window.addEventListener("blur", hide);
  window.addEventListener("contextmenu", hide);
  window.addEventListener("pageswap", hide);
  window.addEventListener("pagehide", hide);
  window.addEventListener("scroll", schedule, { passive: true });
  enabled.addEventListener("change", hide);
}
