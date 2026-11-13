/**
 * FileCard — reusable document card.
 *
 * UI.FileCard({
 *   file: {
 *     id, name, size, addedAt,
 *     icon: "file-text",           // icon name
 *     tone: "red",                 // red | sky | purple | blue | indigo
 *     badge: "PDF Document",
 *     note: "Synced to Cloud"      // footer text
 *   },
 *   onPreview: (file) => {},
 *   onDelete: (file) => {}
 * }) → HTMLElement
 *
 * Clicking the card (or the eye icon) previews; the trash icon deletes.
 */
(function (UI) {
  UI.FileCard = function ({ file, onPreview, onDelete, isNew = false }) {
    const card = UI.el(
      '<article class="file-card' + (isNew ? " is-new" : "") + '" tabindex="0" role="button" ' +
        'aria-label="Preview ' + UI.escape(file.name) + '">' +
        '<div class="file-card__body">' +
          '<span class="file-card__thumb tone-' + file.tone + '">' + UI.icon(file.icon, 18) + "</span>" +
          '<div class="file-card__info">' +
            '<h3 class="file-card__name" title="' + UI.escape(file.name) + '">' + UI.escape(file.name) + "</h3>" +
            '<p class="file-card__meta">' + UI.formatBytes(file.size) + " &bull; " + UI.escape(UI.formatDate(file.addedAt)) + "</p>" +
            '<span class="file-card__badge tone-' + file.tone + '">' + UI.escape(file.badge) + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="file-card__footer">' +
          '<span class="file-card__note">' + UI.escape(file.note || "") + "</span>" +
          '<div class="file-card__actions"></div>' +
        "</div>" +
      "</article>"
    );

    const actions = card.querySelector(".file-card__actions");
    actions.append(
      UI.Button({
        variant: "icon", icon: "eye", ariaLabel: "Preview " + file.name,
        onClick: (e) => { e.stopPropagation(); onPreview && onPreview(file); },
      }),
      UI.Button({
        variant: "icon", icon: "trash", dangerHover: true, ariaLabel: "Delete " + file.name,
        onClick: (e) => { e.stopPropagation(); onDelete && onDelete(file); },
      })
    );

    card.addEventListener("click", () => onPreview && onPreview(file));
    card.addEventListener("keydown", (e) => {
      if (e.target !== card) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPreview && onPreview(file); }
      if (e.key === "Delete") { e.preventDefault(); onDelete && onDelete(file); }
    });

    return card;
  };
})(window.UI);
