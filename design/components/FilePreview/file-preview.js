/**
 * FilePreview — body content rendered INSIDE the shared Modal.
 * Supports exactly three types: PNG, JPG/JPEG (images) and PDF.
 *
 * UI.FilePreview(file) → HTMLElement
 * UI.isPreviewable(file) → boolean
 *
 * file: { name, url, size, addedAt, type: "png" | "jpg" | "pdf", dimensions?, badge }
 */
(function (UI) {
  const LABELS = { png: "PNG Image", jpg: "JPG Image", pdf: "PDF Document" };

  UI.isPreviewable = (file) => ["png", "jpg", "pdf"].includes(file.type) && !!file.url;

  UI.FilePreview = function (file) {
    const root = UI.el('<div class="preview"></div>');
    let stage;

    if (!UI.isPreviewable(file)) {
      stage = UI.el(
        '<div class="preview__stage"><div class="preview__unsupported">' +
          UI.icon("file", 28) +
          "<strong>Preview not available</strong>" +
          "<span>Only PNG, JPG and PDF files can be previewed.</span>" +
        "</div></div>"
      );
    } else if (file.type === "pdf") {
      stage = UI.el('<div class="preview__stage preview__stage--pdf"></div>');
      const frame = document.createElement("iframe");
      frame.className = "preview__pdf";
      frame.title = "PDF preview of " + file.name;
      frame.src = file.url + "#toolbar=1&view=FitH";
      stage.appendChild(frame);
    } else {
      stage = UI.el('<div class="preview__stage"></div>');
      const img = new Image();
      img.className = "preview__image";
      img.alt = "Preview of " + file.name;
      img.src = file.url;
      img.addEventListener("load", () => {
        const dim = root.querySelector('[data-detail="dimensions"]');
        if (dim && !file.dimensions) dim.textContent = img.naturalWidth + " × " + img.naturalHeight;
      });
      stage.appendChild(img);
    }

    const details = [
      ["Type", LABELS[file.type] || "Unknown"],
      ["Size", UI.formatBytes(file.size)],
      ["Uploaded", UI.formatDate(file.addedAt)],
      file.type === "pdf"
        ? ["Format", "Portable Document"]
        : ["Dimensions", file.dimensions || "—", "dimensions"],
    ];

    const dl = UI.el('<dl class="preview__details"></dl>');
    details.forEach(([k, v, key]) => {
      dl.appendChild(UI.el(
        '<div class="preview__detail"><dt>' + k + "</dt><dd" +
          (key ? ' data-detail="' + key + '"' : "") + ">" + UI.escape(v) + "</dd></div>"
      ));
    });

    root.append(stage, dl);
    return root;
  };
})(window.UI);
