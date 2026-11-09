#!/usr/bin/env bash
# Publishes the barbecue ordering demo.
# Source: https://github.com/thomasg42/barbecue-food-restaurant
# Menu:   https://thomasg42.github.io/barbecue-food-restaurant/
#
# Run from Thomas's Mac Terminal:
#   bash "$HOME/Documents/FGA-Brain/FGA-AIOS/clients/montana-mac-bbq/website/publish-pages.sh"
#
# The public page is the menu. An order stays on the phone that opened it.
# The iPad and the kitchen computer share tickets through the Mac server.
set -euo pipefail

SRC="$HOME/Documents/FGA-Brain/FGA-AIOS/clients/montana-mac-bbq/website"
REPO="thomasg42/barbecue-food-restaurant"
WORK="$HOME/Documents/barbecue-food-restaurant-site"
URL="https://thomasg42.github.io/barbecue-food-restaurant/"
MARKER="Montana Mac BBQ"

echo "1/6 Testing (stops here if anything fails; nothing is published)..."
cd "$SRC"
npm test >/tmp/bbq-order-pages-tests.txt 2>&1 \
  || { tail -40 /tmp/bbq-order-pages-tests.txt; echo "Tests failed. Nothing was published."; exit 1; }
echo "   tests passed"

echo "2/6 Building the menu..."
rm -rf "$SRC/dist"
GITHUB_PAGES=true npm run build -- --outDir dist >/tmp/bbq-order-pages-build.txt 2>&1 \
  || { tail -40 /tmp/bbq-order-pages-build.txt; echo "Build failed. Nothing was published."; exit 1; }
cp "$SRC/dist/index.html" "$SRC/dist/404.html"
printf '\n' > "$SRC/dist/.nojekyll"
if ! grep -q "$MARKER" "$SRC/dist/index.html"; then
  echo "   Built page is missing the demo line. Nothing was published."
  exit 1
fi

echo "3/6 GitHub repo..."
gh auth status >/dev/null 2>&1 || { echo "GitHub CLI is not logged in. Run: gh auth login   then run this script again."; exit 1; }
if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "   Repo exists: https://github.com/$REPO"
else
  gh repo create "$REPO" --public --description "Montana Mac BBQ ordering demo."
  echo "   Created https://github.com/$REPO"
fi
if [ ! -d "$WORK/.git" ]; then
  rm -rf "$WORK"
  gh repo clone "$REPO" "$WORK" -- -q 2>/dev/null || {
    mkdir -p "$WORK"
    git -C "$WORK" init -q -b main
    git -C "$WORK" remote add origin "https://github.com/$REPO.git"
  }
fi
gh auth setup-git >/dev/null 2>&1 || true

echo "4/6 Pushing the source..."
rsync -a --delete \
  --exclude .git --exclude .DS_Store --exclude node_modules --exclude dist --exclude data \
  "$SRC/" "$WORK/"
if grep -R -n -E 'sk-ant-|sk-proj-|sk_live|AKIA' "$WORK" --exclude-dir .git --exclude publish-pages.sh; then
  echo "   A secret was found. Nothing was published."
  exit 1
fi
cd "$WORK"
git checkout -q -B main
git add -- 00-START-HERE.md .gitignore index.html package.json package-lock.json publish-pages.sh server.mjs tsconfig.json vite.config.ts public src tests
if git diff --cached --quiet && git rev-parse -q --verify HEAD >/dev/null; then
  echo "   No source changes since the last push."
else
  git -c user.name="thomasg42" -c user.email="thomasg@forevergoldai.com" commit -q -m "Add the barbecue ordering demo."
fi
git push -u origin main
SHA=$(git rev-parse --short HEAD)
echo "   Pushed source $SHA"

echo "5/6 Pushing the menu pages..."
if git show-ref --verify --quiet refs/remotes/origin/gh-pages; then
  git checkout -q -B gh-pages origin/gh-pages
else
  git checkout -q --orphan gh-pages
fi
git rm -rfq . >/dev/null 2>&1 || true
rsync -a --delete --exclude .git "$SRC/dist/" "$WORK/"
cp "$SRC/dist/index.html" "$WORK/404.html"
printf '\n' > "$WORK/.nojekyll"
git add -- index.html 404.html .nojekyll favicon.svg assets photos
if git diff --cached --quiet && git rev-parse -q --verify HEAD >/dev/null; then
  echo "   No page changes since the last push."
else
  git -c user.name="thomasg42" -c user.email="thomasg@forevergoldai.com" commit -q -m "Publish the barbecue demo menu."
fi
git push -u origin gh-pages
git checkout -q main
echo "   Pages branch pushed"

echo "6/6 GitHub Pages (gh-pages branch, site root)..."
if gh api "repos/$REPO/pages" >/dev/null 2>&1; then
  gh api -X PUT "repos/$REPO/pages" -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null
  echo "   Pages set to gh-pages."
else
  gh api -X POST "repos/$REPO/pages" -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null \
    || gh api -X PUT "repos/$REPO/pages" -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null
  echo "   Pages turned on. First build takes 1 to 3 minutes."
fi

served=""
for _ in $(seq 1 30); do
  page=$(curl -fsS "${URL}?check=$(date +%s)" || true)
  if [[ "$page" == *"$MARKER"* && "$page" == *"Cory Skinner"* ]]; then
    served=yes
    break
  fi
  echo "   not yet, waiting 10s"
  sleep 10
done
if [ -n "$served" ]; then
  echo "LIVE: $URL"
  echo "Repo: https://github.com/$REPO   (source $SHA)"
  echo "The link is the menu. Register and kitchen on that link stay on the same phone."
else
  echo "Pushed, but $URL is not serving the demo yet. GitHub Pages can lag. Open the URL again in a few minutes."
  exit 1
fi
