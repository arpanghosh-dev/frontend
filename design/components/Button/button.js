/**
 * Button — reusable button.
 *
 * UI.Button({
 *   label: "Upload Files",
 *   icon: "upload",                 // optional icon name from js/icons.js
 *   variant: "primary",             // primary | secondary | danger | ghost | icon
 *   size: "md",                     // md | sm
 *   block: false,                   // full width
 *   ariaLabel: "",                  // required for variant "icon"
 *   dangerHover: false,             // icon variant turns red on hover (delete)
 *   disabled: false,
 *   onClick: (event) => {}
 * }) → HTMLButtonElement
 */
(function (UI) {
  UI.Button = function ({
    label = "",
    icon = "",
    variant = "primary",
    size = "md",
    block = false,
    ariaLabel = "",
    dangerHover = false,
    disabled = false,
    type = "button",
    onClick,
  } = {}) {
    const classes = ["btn", "btn--" + variant];
    if (size === "sm") classes.push("btn--sm");
    if (block) classes.push("btn--block");
    if (dangerHover) classes.push("btn--danger-hover");

    const iconSize = variant === "icon" ? 15 : 16;
    const btn = UI.el(
      '<button type="' + type + '" class="' + classes.join(" ") + '">' +
        (icon ? UI.icon(icon, iconSize) : "") +
        (label ? '<span class="btn__label">' + UI.escape(label) + "</span>" : "") +
      "</button>"
    );
    if (ariaLabel) { btn.setAttribute("aria-label", ariaLabel); btn.title = ariaLabel; }
    btn.disabled = disabled;
    if (onClick) btn.addEventListener("click", onClick);

    /** Update the visible label after creation. */
    btn.setLabel = (text) => {
      const span = btn.querySelector(".btn__label");
      if (span) span.textContent = text;
    };
    return btn;
  };
})(window.UI);
