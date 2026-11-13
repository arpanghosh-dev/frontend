/**
 * FileDropzone — reusable drag & drop / browse file input.
 *
 * UI.FileDropzone({
 *   accept: ".png,.jpg,.jpeg,.pdf",
 *   hint: "PNG, JPG, PDF up to 25MB",
 *   maxSize: 25 * 1024 * 1024,
 *   multiple: true,
 *   onFiles: (validFiles) => {}
 * }) → HTMLElement  (with .setAccept(accept, hint) / .setError(msg))
 */
(function (UI) {
  UI.FileDropzone = function ({
    accept = ".png,.jpg,.jpeg,.pdf",
    hint = "PNG, JPG, PDF up to 25MB",
    maxSize = 25 * UI.MB,
    multiple = true,
    onFiles,
  } = {}) {
    const root = UI.el(
      '<div class="dropzone" role="button" tabindex="0" aria-label="Upload files: drag and drop or browse">' +
        '<span class="dropzone__icon">' + UI.icon("upload-cloud", 22) + "</span>" +
        '<p class="dropzone__title">Drag &amp; drop your files here</p>' +
        '<p class="dropzone__sub">or <span class="dropzone__browse">browse from computer</span></p>' +
        '<span class="dropzone__hint"></span>' +
        '<p class="dropzone__error" role="alert"></p>' +
        '<input class="dropzone__input" type="file" />' +
      "</div>"
    );

    const input = root.querySelector(".dropzone__input");
    const hintEl = root.querySelector(".dropzone__hint");
    const errorEl = root.querySelector(".dropzone__error");
    input.multiple = multiple;

    let acceptList = [];
    function setAccept(nextAccept, nextHint) {
      accept = nextAccept;
      acceptList = accept.split(",").map((s) => s.trim().toLowerCase());
      input.accept = accept;
      if (nextHint !== undefined) hint = nextHint;
      hintEl.textContent = hint;
    }

    function setError(msg) { errorEl.textContent = msg || ""; }

    function handle(fileList) {
      const files = Array.from(fileList || []);
      if (!files.length) return;
      const valid = [];
      const rejected = [];
      files.forEach((f) => {
        const ext = "." + f.name.split(".").pop().toLowerCase();
        if (!acceptList.includes(ext)) rejected.push(f.name + " (type not allowed)");
        else if (f.size > maxSize) rejected.push(f.name + " (over " + UI.formatBytes(maxSize) + ")");
        else valid.push(f);
      });
      setError(rejected.length ? "Skipped: " + rejected.join(", ") : "");
      if (valid.length && onFiles) onFiles(valid);
    }

    root.addEventListener("click", () => input.click());
    root.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
    });
    input.addEventListener("click", (e) => e.stopPropagation());
    input.addEventListener("change", () => { handle(input.files); input.value = ""; });

    ["dragenter", "dragover"].forEach((evt) =>
      root.addEventListener(evt, (e) => { e.preventDefault(); root.classList.add("is-dragover"); })
    );
    ["dragleave", "drop"].forEach((evt) =>
      root.addEventListener(evt, (e) => {
        e.preventDefault();
        if (evt === "dragleave" && root.contains(e.relatedTarget)) return;
        root.classList.remove("is-dragover");
      })
    );
    root.addEventListener("drop", (e) => handle(e.dataTransfer.files));

    root.setAccept = setAccept;
    root.setError = setError;
    setAccept(accept, hint);
    return root;
  };
})(window.UI);
