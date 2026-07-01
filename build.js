const fs = require("fs");
const path = require("path");

const dir = __dirname;
const folder = path.join(dir, "folder");
const meta = JSON.parse(fs.readFileSync(path.join(dir, "protos.json"), "utf8"));

const statusConfig = {
  "en cours design": { color: "#9a6700", bg: "#fff8e1" },
  "en cours dev":    { color: "#0969da", bg: "#e8f0fe" },
  "a valider":       { color: "#0969da", bg: "#e8f0fe" },
  "valide":          { color: "#6e40c9", bg: "#f0ebfe" },
  "deploye":         { color: "#1a7f37", bg: "#e6f4ea" },
};

function normalizeStatus(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getStatusStyle(status) {
  const key = normalizeStatus(status);
  return statusConfig[key] || { color: "#666", bg: "#f0f0f0" };
}

const files = fs
  .readdirSync(folder)
  .filter((f) => f.endsWith(".html"))
  .map((f) => {
    const stats = fs.statSync(path.join(folder, f));
    const sizeKb = Math.round(stats.size / 1024);
    return {
      file: f,
      name: f
        .replace(/\.html$/, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      mtime: stats.mtime,
      size: sizeKb < 1 ? "<1 KB" : `${sizeKb} KB`,
      status: meta[f] || "",
    };
  })
  .sort((a, b) => {
    const aDeployed = normalizeStatus(a.status) === "deploye" ? 1 : 0;
    const bDeployed = normalizeStatus(b.status) === "deploye" ? 1 : 0;
    if (aDeployed !== bDeployed) return aDeployed - bDeployed;
    return b.mtime - a.mtime;
  });

const rows = files
  .map((f, i) => {
    const style = f.status ? getStatusStyle(f.status) : null;
    const badge = style
      ? `<span class="badge" style="color:${style.color};background:${style.bg}">${f.status}</span>`
      : `<span class="badge none">--</span>`;
    return `    <tr onclick="window.location='folder/${f.file}'">
      <td class="idx">${i + 1}</td>
      <td class="name">${f.name}</td>
      <td class="status">${badge}</td>
      <td class="file">${f.file}</td>
      <td class="size">${f.size}</td>
      <td class="date">${f.mtime.toISOString().slice(0, 10)}</td>
    </tr>`;
  })
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%237c3aed'/><text x='16' y='23' text-anchor='middle' font-family='system-ui,sans-serif' font-weight='700' font-size='20' fill='white'>K</text></svg>">
  <title>kapptiDrafts — index</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "SF Mono", "Fira Code", "Cascadia Code", Menlo, monospace;
      background: #fff;
      color: #1a1a1a;
      padding: 2.5rem 3rem;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      font-size: 13px;
      margin-bottom: 0.125rem;
    }
    .header a { color: #0969da; text-decoration: none; }
    .header span { color: #b0b0b0; }
    .meta {
      color: #b0b0b0;
      font-size: 11px;
      margin-bottom: 1.25rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead th {
      text-align: left;
      color: #b0b0b0;
      font-weight: 400;
      font-size: 11px;
      padding: 0.375rem 1rem 0.375rem 0;
      border-bottom: 1px solid #e8e8e8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    thead th:first-child { width: 2rem; }
    tbody tr { border-bottom: 1px solid #f5f5f5; cursor: pointer; }
    tbody tr:hover { background: #f8f8f8; }
    td { padding: 0.5rem 1rem 0.5rem 0; }
    .idx { color: #ccc; width: 2rem; }
    .name { color: #0969da; }
    .file { color: #b0b0b0; }
    input[type="search"] {
      font-family: inherit;
      font-size: 13px;
      padding: 0.375rem 0.5rem;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      outline: none;
      width: 240px;
      margin-bottom: 1rem;
      color: #1a1a1a;
      background: #fafafa;
    }
    input[type="search"]:focus { border-color: #0969da; }
    input[type="search"]::placeholder { color: #ccc; }
    .size { color: #b0b0b0; white-space: nowrap; text-align: right; padding-right: 1.5rem; }
    .date { color: #b0b0b0; white-space: nowrap; }
    .empty { color: #b0b0b0; padding: 2rem 0; }
    thead th.size { text-align: right; padding-right: 1.5rem; }
    .badge {
      display: inline-block;
      font-size: 11px;
      padding: 0.125rem 0.5rem;
      border-radius: 3px;
      white-space: nowrap;
    }
    .badge.none { color: #ccc; background: none; }
  </style>
</head>
<body>
  <div class="header"><a href="/">kapptiDrafts</a> <span>/index</span></div>
  <div class="meta">${files.length} file${files.length !== 1 ? "s" : ""}</div>
  <input type="search" id="search" placeholder="search..." autofocus>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>name</th>
        <th>status</th>
        <th>file</th>
        <th class="size">size</th>
        <th>modified</th>
      </tr>
    </thead>
    <tbody>
${files.length ? rows : '    <tr><td colspan="6" class="empty">no prototypes yet</td></tr>'}
    </tbody>
  </table>
  <script>
    document.getElementById("search").addEventListener("input", function(e) {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll("tbody tr").forEach(function(row) {
        row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(dir, "index.html"), html);
console.log(`index.html generated (${files.length} files)`);
