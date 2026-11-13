/**
 * Modal — ONE reusable modal instance shared by the whole app.
 * Both the file preview and the delete confirmation render through it.
 *
 * UI.Modal.open({
 *   title: "q3_financial_report.pdf",
 *   subtitle: "2.4 MB • PDF Document",
 *   icon: "file-text", tone: "red",    // optional header icon tile
 *   size: "lg",                         // sm | md | lg
 *   body: Node | htmlString,
 *   footer: [Node, Node],               // usually UI.Button(...)s
 *   onClose: () => {}
 * })
 * UI.Modal.close()
 *
 * UI.Modal.confirm({
 *   title, message (html), note, confirmLabel, cancelLabel,
 *   variant: "danger", icon: "trash", onConfirm: () => {}
 * })
 */
(function (UI) {
  let root, dialog, iconEl, titleEl, subtitleEl, bodyEl, footerEl;
  let onCloseCb = null;
  let lastFocused = null;

  function mount() {
    if (root) return;
    root = UI.el(
      '<div class="modal" aria-hidden="true">' +
        '<div class="modal__backdrop" data-close></div>' +
        '<div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
          '<header class="modal__header">' +
            '<span class="modal__icon"></span>' +
            '<div class="modal__titles">' +
              '<h2 class="modal__title" id="modal-title"></h2>' +
              '<p class="modal__subtitle"></p>' +
            "</div>" +
          "</header>" +
          '<div class="modal__body"></div>' +
          '<footer class="modal__footer"></footer>' +
        "</div>" +
      "</div>"
    );
    dialog = root.querySelector(".modal__dialog");
    iconEl = root.querySelector(".modal__icon");
    titleEl = root.querySelector(".modal__title");
    subtitleEl = root.querySelector(".modal__subtitle");
    bodyEl = root.querySelector(".modal__body");
    footerEl = root.querySelector(".modal__footer");

    const closeBtn = UI.Button({ variant: "icon", icon: "x", ariaLabel: "Close", onClick: close });
    root.querySelector(".modal__header").appendChild(closeBtn);

    root.querySelector("[data-close]").addEventListener("click", close);
    document.body.appendChild(root);
  }

  function onKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    // Simple focus trap
    const focusables = dialog.querySelectorAll(
      'button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open({
    title = "",
    subtitle = "",
    icon = "",
    tone = "indigo",
    size = "md",
    body = "",
    footer = [],
    onClose = null,
    initialFocus = null,
  } = {}) {
    mount();
    if (root.classList.contains("is-open") && onCloseCb) onCloseCb(); // replacing content
    lastFocused = root.classList.contains("is-open") ? lastFocused : document.activeElement;
    onCloseCb = onClose;

    root.className = "modal modal--" + size;
    titleEl.textContent = title;
    subtitleEl.textContent = subtitle;
    iconEl.className = "modal__icon" + (icon ? " tone-" + tone : "");
    iconEl.innerHTML = icon ? UI.icon(icon, 18) : "";

    bodyEl.replaceChildren();
    if (typeof body === "string") bodyEl.innerHTML = body;
    else if (body) bodyEl.appendChild(body);

    footerEl.replaceChildren(...footer);

    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.addEventListener("keydown", onKeydown);
    requestAnimationFrame(() => {
      root.classList.add("is-open");
      const target = initialFocus || footerEl.querySelector("button") || dialog.querySelector("button");
      if (target) target.focus();
    });
  }

  function close() {
    if (!root || !root.classList.contains("is-open")) return;
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onKeydown);
    const cb = onCloseCb;
    onCloseCb = null;
    if (cb) cb();
    // Clear heavy content (iframes/images) after the fade-out
    setTimeout(() => { if (!root.classList.contains("is-open")) bodyEl.replaceChildren(); }, 200);
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  function confirm({
    title = "Are you sure?",
    message = "",
    note = "",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    icon = "alert",
    tone = "red",
    onConfirm,
  } = {}) {
    const body = UI.el(
      "<div>" +
        '<p class="confirm__text">' + message + "</p>" +
        (note ? '<p class="confirm__note">' + UI.escape(note) + "</p>" : "") +
      "</div>"
    );
    const cancelBtn = UI.Button({ label: cancelLabel, variant: "secondary", onClick: close });
    const confirmBtn = UI.Button({
      label: confirmLabel,
      variant,
      icon: variant === "danger" ? "trash" : "check",
      onClick: () => { close(); if (onConfirm) onConfirm(); },
    });
    open({ title, icon, tone, size: "sm", body, footer: [cancelBtn, confirmBtn], initialFocus: cancelBtn });
  }

  UI.Modal = { open, close, confirm };
})(window.UI);
