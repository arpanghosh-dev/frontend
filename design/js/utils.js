/* Shared helpers. Everything hangs off one global namespace: window.UI */
window.UI = window.UI || {};

(function (UI) {
  /** Turn an HTML string into a single DOM element. */
  UI.el = function (html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    return tpl.content.firstElementChild;
  };

  UI.escape = function (value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  };

  UI.formatBytes = function (bytes) {
    if (bytes < 1024) return bytes + " B";
    const units = ["KB", "MB", "GB", "TB"];
    let value = bytes / 1024;
    let i = 0;
    while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; }
    const n = value >= 100 || i === 0 ? Math.round(value) : Number(value.toFixed(1));
    return n + " " + units[i];
  };

  UI.formatDate = function (date) {
    const d = new Date(date);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return "Today, " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  /** File extension → normalized type used across the app. */
  UI.fileType = function (name) {
    const ext = String(name).split(".").pop().toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "png") return "png";
    if (ext === "jpg" || ext === "jpeg") return "jpg";
    return "other";
  };

  UI.MB = 1024 * 1024;
  UI.GB = 1024 * 1024 * 1024;
})(window.UI);
