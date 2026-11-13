/**
 * StorageQuota — reusable usage meter.
 *
 * UI.StorageQuota({ title: "Storage Quota", used: bytes, total: bytes })
 *   → HTMLElement  (with .update(used, total))
 * Bar turns amber at 75% and red at 90%.
 */
(function (UI) {
  UI.StorageQuota = function ({ title = "Storage Quota", used = 0, total = 1 } = {}) {
    const root = UI.el(
      '<section class="quota" aria-label="' + UI.escape(title) + '">' +
        '<div class="quota__head">' +
          '<span class="quota__title">' + UI.escape(title) + "</span>" +
          '<span class="quota__percent"></span>' +
        "</div>" +
        '<div class="quota__track" role="progressbar" aria-valuemin="0" aria-valuemax="100">' +
          '<div class="quota__bar"></div>' +
        "</div>" +
        '<div class="quota__foot"><span class="quota__used"></span><span class="quota__total"></span></div>' +
      "</section>"
    );

    const percentEl = root.querySelector(".quota__percent");
    const track = root.querySelector(".quota__track");
    const bar = root.querySelector(".quota__bar");
    const usedEl = root.querySelector(".quota__used");
    const totalEl = root.querySelector(".quota__total");

    root.update = function (nextUsed, nextTotal = total) {
      used = Math.max(0, nextUsed);
      total = nextTotal;
      const pct = Math.min(100, (used / total) * 100);
      percentEl.textContent = pct.toFixed(1) + "%";
      bar.style.width = pct + "%";
      track.setAttribute("aria-valuenow", pct.toFixed(1));
      usedEl.textContent = UI.formatBytes(used) + " used";
      totalEl.textContent = UI.formatBytes(total) + " total";
      root.classList.toggle("is-warning", pct >= 75 && pct < 90);
      root.classList.toggle("is-critical", pct >= 90);
    };

    root.update(used, total);
    return root;
  };
})(window.UI);
