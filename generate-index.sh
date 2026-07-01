#!/bin/bash
# Generates index.html by scanning all .html files in this directory (except index.html itself)

DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$DIR/index.html"

# Collect all .html files except index.html, sorted by modification date (newest first)
FILES=$(find "$DIR" -maxdepth 1 -name "*.html" ! -name "index.html" -exec stat -f "%m %N" {} \; | sort -rn | cut -d' ' -f2-)

# Count files
COUNT=0
ITEMS=""
for f in $FILES; do
  filename=$(basename "$f")
  name="${filename%.html}"
  # Pretty name: replace - and _ with spaces, capitalize first letter
  pretty=$(echo "$name" | sed 's/[-_]/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')
  mod_date=$(stat -f "%Sm" -t "%d %b %Y" "$f")
  COUNT=$((COUNT + 1))
  ITEMS="$ITEMS
        <a href=\"$filename\" class=\"proto\">
          <span class=\"proto-name\">$pretty</span>
          <span class=\"proto-meta\">
            <span class=\"proto-file\">$filename</span>
            <span class=\"proto-date\">$mod_date</span>
          </span>
        </a>"
done

cat > "$OUTPUT" << 'HEADER'
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protos</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      min-height: 100vh;
      padding: 3rem 1.5rem;
    }
    .container { max-width: 640px; margin: 0 auto; }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .subtitle {
      color: #737373;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    .empty {
      color: #525252;
      font-size: 0.875rem;
      text-align: center;
      padding: 3rem 0;
    }
    .list { display: flex; flex-direction: column; gap: 1px; }
    .proto {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1rem;
      background: #171717;
      color: #e5e5e5;
      text-decoration: none;
      transition: background 0.15s;
      border-radius: 0;
    }
    .proto:first-child { border-radius: 8px 8px 0 0; }
    .proto:last-child { border-radius: 0 0 8px 8px; }
    .proto:only-child { border-radius: 8px; }
    .proto:hover { background: #262626; }
    .proto-name { font-weight: 500; font-size: 0.9375rem; }
    .proto-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.8125rem;
      color: #525252;
    }
    .proto-file { font-family: "SF Mono", Monaco, monospace; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Protos</h1>
HEADER

echo "    <p class=\"subtitle\">$COUNT prototype(s)</p>" >> "$OUTPUT"
echo "    <div class=\"list\">" >> "$OUTPUT"

if [ $COUNT -eq 0 ]; then
  echo '      <p class="empty">Aucun prototype pour le moment.<br>Ajoute des fichiers .html ici et relance le script.</p>' >> "$OUTPUT"
else
  echo "$ITEMS" >> "$OUTPUT"
fi

cat >> "$OUTPUT" << 'FOOTER'
    </div>
  </div>
</body>
</html>
FOOTER

echo "✓ index.html généré avec $COUNT proto(s)"
