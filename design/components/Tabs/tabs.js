/**
 * Tabs — reusable segmented filter.
 *
 * UI.Tabs({
 *   items: [{ value: "all", label: "All Files" }, ...],
 *   value: "all",
 *   onChange: (value) => {}
 * }) → HTMLElement  (with .setValue(v))
 */
(function (UI) {
  UI.Tabs = function ({ items = [], value, ariaLabel = "Filter", onChange } = {}) {
    let current = value ?? items[0]?.value;
    const root = UI.el('<div class="tabs" role="tablist" aria-label="' + UI.escape(ariaLabel) + '"></div>');

    items.forEach((item) => {
      const tab = UI.el('<button type="button" class="tabs__tab" role="tab">' + UI.escape(item.label) + "</button>");
      tab.dataset.value = item.value;
      tab.addEventListener("click", () => {
        if (item.value === current) return;
        current = item.value;
        render();
        if (onChange) onChange(current);
      });
      root.appendChild(tab);
    });

    function render() {
      root.querySelectorAll(".tabs__tab").forEach((t) => {
        const on = t.dataset.value === current;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
    }

    // Arrow-key navigation between tabs
    root.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const tabs = Array.from(root.children);
      const i = tabs.findIndex((t) => t.dataset.value === current);
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      next.focus();
      next.click();
    });

    root.setValue = (v) => { current = v; render(); };
    render();
    return root;
  };
})(window.UI);
