/**
 * Dropdown — reusable custom select (keyboard + outside-click aware).
 *
 * UI.Dropdown({
 *   options: [{ value: "all", label: "All File Types" }, ...],
 *   value: "all",
 *   prefix: "Sort by:",        // optional muted text before the value
 *   size: "md",                // md | sm
 *   block: false,              // full width
 *   align: "left",             // menu alignment: left | right
 *   ariaLabel: "",
 *   onChange: (value, option) => {}
 * }) → HTMLElement  (with .getValue() / .setValue(v))
 */
(function (UI) {
  let uid = 0;

  UI.Dropdown = function ({
    options = [],
    value,
    prefix = "",
    size = "md",
    block = false,
    align = "left",
    ariaLabel = "",
    onChange,
  } = {}) {
    const id = "dropdown-" + ++uid;
    let current = value ?? options[0]?.value;
    let activeIndex = -1;

    const classes = ["dropdown"];
    if (block) classes.push("dropdown--block");
    if (size === "sm") classes.push("dropdown--sm");
    if (align === "right") classes.push("dropdown--align-right");

    const root = UI.el(
      '<div class="' + classes.join(" ") + '">' +
        '<button type="button" class="dropdown__trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + id + '">' +
          '<span class="dropdown__text">' +
            (prefix ? '<span class="dropdown__prefix">' + UI.escape(prefix) + " </span>" : "") +
            '<span class="dropdown__value"></span>' +
          "</span>" +
          '<span class="dropdown__chevron">' + UI.icon("chevron-down", 16) + "</span>" +
        "</button>" +
        '<ul class="dropdown__menu" role="listbox" id="' + id + '" tabindex="-1"></ul>' +
      "</div>"
    );

    const trigger = root.querySelector(".dropdown__trigger");
    const valueEl = root.querySelector(".dropdown__value");
    const menu = root.querySelector(".dropdown__menu");
    if (ariaLabel) trigger.setAttribute("aria-label", ariaLabel);
    if (!prefix) valueEl.style.fontWeight = "500";

    options.forEach((opt, i) => {
      const li = UI.el(
        '<li class="dropdown__option" role="option" data-index="' + i + '">' +
          "<span>" + UI.escape(opt.label) + "</span>" + UI.icon("check", 14) +
        "</li>"
      );
      li.addEventListener("click", () => { select(i); close(); trigger.focus(); });
      li.addEventListener("mousemove", () => highlight(i));
      menu.appendChild(li);
    });

    const items = () => Array.from(menu.children);

    function render() {
      const opt = options.find((o) => o.value === current) || options[0];
      valueEl.textContent = opt ? opt.label : "";
      items().forEach((li, i) => li.setAttribute("aria-selected", String(options[i].value === current)));
    }

    function highlight(i) {
      activeIndex = i;
      items().forEach((li, idx) => li.classList.toggle("is-active", idx === i));
    }

    function select(i) {
      const opt = options[i];
      if (!opt) return;
      const changed = opt.value !== current;
      current = opt.value;
      render();
      if (changed && onChange) onChange(current, opt);
    }

    function open() {
      root.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      highlight(Math.max(0, options.findIndex((o) => o.value === current)));
      document.addEventListener("mousedown", onOutside);
    }

    function close() {
      root.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      document.removeEventListener("mousedown", onOutside);
    }

    function onOutside(e) { if (!root.contains(e.target)) close(); }

    trigger.addEventListener("click", () => (root.classList.contains("is-open") ? close() : open()));
    root.addEventListener("keydown", (e) => {
      const isOpen = root.classList.contains("is-open");
      if (e.key === "Escape" && isOpen) { e.stopPropagation(); close(); trigger.focus(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen) return open();
        const step = e.key === "ArrowDown" ? 1 : -1;
        highlight((activeIndex + step + options.length) % options.length);
      } else if ((e.key === "Enter" || e.key === " ") && isOpen) {
        e.preventDefault(); select(activeIndex); close(); trigger.focus();
      } else if (e.key === "Tab" && isOpen) close();
    });

    root.getValue = () => current;
    root.setValue = (v) => { current = v; render(); };

    render();
    return root;
  };
})(window.UI);
