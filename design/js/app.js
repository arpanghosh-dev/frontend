/* App — composes the reusable components into the single File Manager screen. */
(function (UI) {
  const TOTAL_QUOTA = 50 * UI.GB;
  const BASE_USED = 14.2 * UI.GB; // storage used by everything outside this list

  const TYPE_FILTERS = {
    all: { accept: ".png,.jpg,.jpeg,.pdf", hint: "PNG, JPG, PDF up to 25MB" },
    pdf: { accept: ".pdf", hint: "PDF only, up to 25MB" },
    png: { accept: ".png", hint: "PNG only, up to 25MB" },
    jpg: { accept: ".jpg,.jpeg", hint: "JPG / JPEG only, up to 25MB" },
  };

  const TYPE_META = {
    pdf: { icon: "file-text", tone: "red", badge: "PDF Document" },
    png: { icon: "image", tone: "sky", badge: "PNG Image" },
    jpg: { icon: "image", tone: "blue", badge: "JPG Image" },
  };

  const state = {
    files: UI.getSampleFiles(),
    staged: [],
    tab: "all",
    sort: "recent",
    newIds: new Set(),
  };
  const initialListBytes = state.files.reduce((s, f) => s + f.size, 0);

  const $ = (sel) => document.querySelector(sel);

  /* ---------- Sidebar ---------- */
  const dropzone = UI.FileDropzone({
    ...TYPE_FILTERS.all,
    onFiles: (files) => {
      files.forEach((file) => {
        const dup = state.staged.some((s) => s.name === file.name && s.size === file.size);
        if (!dup) state.staged.push(file);
      });
      renderStaged();
    },
  });
  $("#slot-dropzone").appendChild(dropzone);

  const typeFilter = UI.Dropdown({
    block: true,
    ariaLabel: "File type pre-filter",
    options: [
      { value: "all", label: "All File Types" },
      { value: "pdf", label: "PDF Documents" },
      { value: "png", label: "PNG Images" },
      { value: "jpg", label: "JPG Images" },
    ],
    value: "all",
    onChange: (value) => {
      const f = TYPE_FILTERS[value];
      dropzone.setAccept(f.accept, f.hint);
      // Drop staged files that no longer match the pre-filter
      const exts = f.accept.split(",");
      const before = state.staged.length;
      state.staged = state.staged.filter((file) => exts.includes("." + file.name.split(".").pop().toLowerCase()));
      dropzone.setError(before !== state.staged.length ? "Removed selected files that don't match the new filter." : "");
      renderStaged();
    },
  });
  $("#slot-type-filter").appendChild(typeFilter);

  const uploadBtn = UI.Button({ label: "Upload Files", icon: "upload", block: true, onClick: uploadStaged });
  $("#slot-upload").appendChild(uploadBtn);

  const quota = UI.StorageQuota({ used: BASE_USED, total: TOTAL_QUOTA });
  $("#slot-quota").appendChild(quota);

  function renderStaged() {
    const list = $("#staged");
    list.replaceChildren();
    if (state.staged.length) {
      list.appendChild(UI.el('<p class="staged__title">Ready to upload (' + state.staged.length + ")</p>"));
      state.staged.forEach((file, i) => {
        const row = UI.el(
          '<div class="staged__item">' +
            UI.icon(UI.fileType(file.name) === "pdf" ? "file-text" : "image", 15) +
            '<span class="staged__name" title="' + UI.escape(file.name) + '">' + UI.escape(file.name) + "</span>" +
            '<span class="staged__size">' + UI.formatBytes(file.size) + "</span>" +
          "</div>"
        );
        row.appendChild(UI.Button({
          variant: "icon", icon: "x", ariaLabel: "Remove " + file.name,
          onClick: () => { state.staged.splice(i, 1); renderStaged(); },
        }));
        list.appendChild(row);
      });
    }
    const n = state.staged.length;
    uploadBtn.setLabel(n > 1 ? "Upload " + n + " Files" : "Upload Files");
  }

  function setStatus(busy) {
    const pill = $("#status");
    pill.classList.toggle("is-busy", busy);
    pill.textContent = busy ? "Uploading…" : "Ready";
  }

  function uploadStaged() {
    // Nothing selected yet → open the file browser instead
    if (!state.staged.length) return dropzone.querySelector("input").click();
    const batch = state.staged.splice(0);
    renderStaged();
    uploadBtn.disabled = true;
    setStatus(true);

    // Simulated network delay — replace with a real API call later
    setTimeout(() => {
      state.newIds.clear();
      batch.forEach((file) => {
        const type = UI.fileType(file.name);
        const meta = TYPE_META[type];
        const record = {
          id: "u" + Date.now() + Math.random().toString(16).slice(2, 6),
          name: file.name, type, size: file.size, addedAt: new Date(),
          ...meta, note: type === "pdf" ? "Uploaded just now" : "Reading dimensions…",
          url: URL.createObjectURL(file),
        };
        if (type !== "pdf") {
          const img = new Image();
          img.onload = () => {
            record.dimensions = img.naturalWidth + " × " + img.naturalHeight;
            record.note = record.dimensions;
            renderFiles();
          };
          img.src = record.url;
        }
        state.files.unshift(record);
        state.newIds.add(record.id);
      });
      setStatus(false);
      uploadBtn.disabled = false;
      renderFiles();
    }, 700);
  }

  /* ---------- Main ---------- */
  const sortDropdown = UI.Dropdown({
    prefix: "Sort by:",
    size: "sm",
    align: "right",
    ariaLabel: "Sort files",
    options: [
      { value: "recent", label: "Recent" },
      { value: "oldest", label: "Oldest" },
      { value: "name", label: "Name (A–Z)" },
      { value: "size", label: "Size" },
    ],
    value: state.sort,
    onChange: (v) => { state.sort = v; renderFiles(); },
  });
  $("#slot-sort").appendChild(sortDropdown);

  const tabs = UI.Tabs({
    ariaLabel: "Filter files by type",
    items: [
      { value: "all", label: "All Files" },
      { value: "pdf", label: "PDFs" },
      { value: "png", label: "PNGs" },
      { value: "image", label: "Images" },
    ],
    value: state.tab,
    onChange: (v) => { state.tab = v; renderFiles(); },
  });
  $("#slot-tabs").appendChild(tabs);

  function visibleFiles() {
    const filtered = state.files.filter((f) => {
      if (state.tab === "all") return true;
      if (state.tab === "image") return f.type === "png" || f.type === "jpg";
      return f.type === state.tab;
    });
    const sorters = {
      recent: (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
      oldest: (a, b) => new Date(a.addedAt) - new Date(b.addedAt),
      name: (a, b) => a.name.localeCompare(b.name),
      size: (a, b) => b.size - a.size,
    };
    return filtered.sort(sorters[state.sort]);
  }

  function renderFiles() {
    const grid = $("#file-grid");
    const files = visibleFiles();
    grid.replaceChildren();

    if (!files.length) {
      grid.appendChild(UI.el(
        '<div class="empty-state" style="grid-column: 1 / -1">' +
          '<span class="empty-state__icon">' + UI.icon("inbox", 22) + "</span>" +
          '<p class="empty-state__title">No files here yet</p>' +
          '<p class="empty-state__text">Upload a file from the panel on the left, or switch filters.</p>' +
        "</div>"
      ));
    }

    files.forEach((file) => {
      grid.appendChild(UI.FileCard({
        file,
        isNew: state.newIds.has(file.id),
        onPreview: openPreview,
        onDelete: confirmDelete,
      }));
    });

    const total = state.files.length;
    $("#file-count").textContent = total + (total === 1 ? " file" : " files");

    const listBytes = state.files.reduce((s, f) => s + f.size, 0);
    quota.update(BASE_USED + listBytes - initialListBytes);
  }

  /* ---------- Modals (one shared instance) ---------- */
  function openPreview(file) {
    UI.Modal.open({
      title: file.name,
      subtitle: UI.formatBytes(file.size) + " • " + file.badge,
      icon: file.icon,
      tone: file.tone,
      size: file.type === "pdf" ? "lg" : "md",
      body: UI.FilePreview(file),
      footer: [
        UI.Button({
          label: "Delete", icon: "trash", variant: "ghost",
          onClick: () => confirmDelete(file),
        }),
        downloadLink(file),
        UI.Button({ label: "Close", variant: "primary", onClick: UI.Modal.close }),
      ],
    });
  }

  function downloadLink(file) {
    const a = UI.el('<a class="btn btn--secondary">' + UI.icon("download", 16) + "<span>Download</span></a>");
    a.href = file.url;
    a.download = file.name;
    return a;
  }

  function confirmDelete(file) {
    UI.Modal.confirm({
      title: "Delete file?",
      message: "Are you sure you want to delete <strong>" + UI.escape(file.name) + "</strong>?",
      note: "This will free up " + UI.formatBytes(file.size) + ". This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
      onConfirm: () => {
        state.files = state.files.filter((f) => f.id !== file.id);
        state.newIds.delete(file.id);
        if (file.url && file.url.startsWith("blob:")) URL.revokeObjectURL(file.url);
        renderFiles();
      },
    });
  }

  renderStaged();
  renderFiles();
})(window.UI);
