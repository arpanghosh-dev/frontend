/* Demo data for the static design: builds real PNG images (canvas) and real
   PDF files (hand-written PDF syntax) in the browser, so preview works with
   no asset files. Replace with API data when wiring up the real app. */
(function (UI) {
  /* ---------- Minimal one-page PDF generator ---------- */
  function pdfEscape(s) { return String(s).replace(/[\\()]/g, (c) => "\\" + c); }

  function makePdf(title, subtitle, lines) {
    let y = 640;
    const body = lines.map((line) => {
      const out = line.heading
        ? "0.06 0.09 0.16 rg BT /F1 13 Tf 56 " + y + " Td (" + pdfEscape(line.text) + ") Tj ET"
        : "0.2 0.25 0.33 rg BT /F2 11 Tf 56 " + y + " Td (" + pdfEscape(line.text) + ") Tj ET";
      y -= line.heading ? 24 : 18;
      return out;
    }).join("\n");

    const content = [
      "0.31 0.27 0.9 rg 0 702 612 90 re f",
      "1 1 1 rg BT /F1 22 Tf 56 748 Td (" + pdfEscape(title) + ") Tj ET",
      "0.88 0.9 1 rg BT /F2 11 Tf 56 726 Td (" + pdfEscape(subtitle) + ") Tj ET",
      "0.9 0.91 0.93 RG 1 w 56 668 m 556 668 l S",
      body,
      "0.58 0.64 0.72 rg BT /F2 9 Tf 56 40 Td (Generated sample document - File Manager design preview) Tj ET",
    ].join("\n");

    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R " +
        "/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
      "<< /Length " + content.length + " >>\nstream\n" + content + "\nendstream",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ];

    let pdf = "%PDF-1.4\n";
    const offsets = [];
    objects.forEach((obj, i) => {
      offsets.push(pdf.length);
      pdf += (i + 1) + " 0 obj\n" + obj + "\nendobj\n";
    });
    const xref = pdf.length;
    pdf += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
    offsets.forEach((o) => { pdf += String(o).padStart(10, "0") + " 00000 n \n"; });
    pdf += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";

    return URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  }

  /* ---------- Canvas image generators ---------- */
  function canvas(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    draw(c.getContext("2d"), w, h);
    return c.toDataURL("image/png");
  }

  function heroBanner() {
    return canvas(1280, 720, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#4f46e5"); g.addColorStop(1, "#0ea5e9");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.15; ctx.fillStyle = "#fff";
      [[1050, 140, 260], [1150, 600, 180], [180, 650, 140]].forEach(([x, y, r]) => {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff"; ctx.font = "700 76px Inter, sans-serif";
      ctx.fillText("Meet the new Hero.", 96, 320);
      ctx.font = "400 32px Inter, sans-serif"; ctx.globalAlpha = 0.85;
      ctx.fillText("Faster, lighter and built for teams.", 96, 380);
      ctx.globalAlpha = 1; ctx.fillStyle = "#fff";
      roundRect(ctx, 96, 440, 230, 64, 14); ctx.fill();
      ctx.fillStyle = "#4f46e5"; ctx.font = "600 26px Inter, sans-serif";
      ctx.fillText("Shop now", 150, 482);
    });
  }

  function architectureDiagram() {
    return canvas(1200, 800, (ctx, w, h) => {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#eef2f7"; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      const boxes = [
        ["Web Client", 120, 120, "#4f46e5"], ["Mobile App", 120, 520, "#4f46e5"],
        ["API Gateway", 480, 320, "#9333ea"],
        ["File Service", 840, 160, "#0284c7"], ["Auth Service", 840, 480, "#0284c7"],
      ];
      const centers = {};
      boxes.forEach(([label, x, y]) => { centers[label] = [x + 120, y + 60]; });
      ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 3;
      [["Web Client", "API Gateway"], ["Mobile App", "API Gateway"],
       ["API Gateway", "File Service"], ["API Gateway", "Auth Service"]].forEach(([a, b]) => {
        ctx.beginPath(); ctx.moveTo(...centers[a]); ctx.lineTo(...centers[b]); ctx.stroke();
      });
      boxes.forEach(([label, x, y, color]) => {
        ctx.fillStyle = "#fff"; ctx.strokeStyle = color; ctx.lineWidth = 3;
        roundRect(ctx, x, y, 240, 120, 16); ctx.fill(); ctx.stroke();
        ctx.fillStyle = color; roundRect(ctx, x, y, 240, 10, 4); ctx.fill();
        ctx.fillStyle = "#0f172a"; ctx.font = "600 26px Inter, sans-serif";
        ctx.textAlign = "center"; ctx.fillText(label, x + 120, y + 72); ctx.textAlign = "left";
      });
      ctx.fillStyle = "#64748b"; ctx.font = "500 22px Inter, sans-serif";
      ctx.fillText("Cloud Architecture — v3", 40, 60);
    });
  }

  function profilePhoto() {
    return canvas(800, 800, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#e0e7ff"); g.addColorStop(1, "#bae6fd");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#6366f1";
      ctx.beginPath(); ctx.arc(400, 320, 140, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(400, 760, 280, 260, 0, Math.PI, 0); ctx.fill();
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ---------- Seed list (matches the design mock) ---------- */
  UI.getSampleFiles = function () {
    const today = new Date(); today.setHours(10, 24, 0, 0);
    return [
      {
        id: "f1", name: "q3_financial_report.pdf", type: "pdf", size: 2.4 * UI.MB, addedAt: today,
        icon: "file-text", tone: "red", badge: "PDF Document", note: "Synced to Cloud",
        url: makePdf("Q3 Financial Report", "Fiscal quarter ending September 30, 2024", [
          { heading: true, text: "Executive Summary" },
          { text: "Revenue grew 18% quarter over quarter to $4.2M." },
          { text: "Operating margin improved to 21%, up from 17% in Q2." },
          { heading: true, text: "Highlights" },
          { text: "- Enterprise subscriptions up 32%" },
          { text: "- Customer churn reduced to 2.1%" },
          { text: "- Cloud infrastructure costs down 9%" },
        ]),
      },
      {
        id: "f2", name: "hero_product_banner_v2.png", type: "png", size: 4.8 * UI.MB,
        addedAt: new Date("2024-10-14T09:00:00"), icon: "image", tone: "sky", badge: "PNG Asset",
        note: "2560 × 1440", dimensions: "2560 × 1440", url: heroBanner(),
      },
      {
        id: "f3", name: "app_architecture_diagram.png", type: "png", size: 1.9 * UI.MB,
        addedAt: new Date("2024-10-12T09:00:00"), icon: "chart", tone: "purple", badge: "Architecture",
        note: "Cloud Schematics", url: architectureDiagram(),
      },
      {
        id: "f4", name: "profile_photo_hd.png", type: "png", size: 3.2 * UI.MB,
        addedAt: new Date("2024-09-29T09:00:00"), icon: "camera", tone: "blue", badge: "PNG Image",
        note: "Original HD", url: profilePhoto(),
      },
      {
        id: "f5", name: "contract_agreement_v2.pdf", type: "pdf", size: 840 * 1024,
        addedAt: new Date("2024-09-15T09:00:00"), icon: "shield-check", tone: "indigo", badge: "Signed PDF",
        note: "Verified Signature",
        url: makePdf("Service Agreement", "Contract ref. SA-2024-0915 - Signed", [
          { heading: true, text: "1. Parties" },
          { text: "This agreement is entered into by the Client and the Provider." },
          { heading: true, text: "2. Term" },
          { text: "Twelve (12) months from the effective date, renewing annually." },
          { heading: true, text: "3. Signatures" },
          { text: "Digitally signed and verified on September 15, 2024." },
        ]),
      },
    ];
  };
})(window.UI);
