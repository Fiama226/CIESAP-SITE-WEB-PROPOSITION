#!/usr/bin/env bash
# Deploie le site CIESAP depuis GitHub vers public_html (a lancer sur le VPS, en tant que `ciesap`).
# Usage : bash deploy-vps.sh
set -euo pipefail

REPO_URL="https://github.com/Fiama226/CIESAP-SITE-WEB-PROPOSITION.git"
BRANCH="${BRANCH:-ciesap-qa-cleanup}"
REPO_DIR="${REPO_DIR:-$HOME/repo}"
SITE_SUBDIR="CIESAP/products/wordpress/finbiz-main"
DOCROOT="${DOCROOT:-$HOME/public_html}"

if [ -d "$REPO_DIR/.git" ]; then
  git -C "$REPO_DIR" fetch --quiet origin "$BRANCH"
  git -C "$REPO_DIR" checkout --quiet "$BRANCH"
  git -C "$REPO_DIR" reset --quiet --hard "origin/$BRANCH"
else
  git clone --quiet -b "$BRANCH" "$REPO_URL" "$REPO_DIR"
fi

SRC="$REPO_DIR/$SITE_SUBDIR/"
[ -f "${SRC}index.html" ] || { echo "ERREUR: $SRC introuvable" >&2; exit 1; }

# Pas de --delete : .htaccess (redirection https) et fichiers serveur restent intacts.
EXCL=(--exclude='.git' --exclude='example_backup' --exclude='wordpress-bundle' --exclude='.htaccess' --exclude='*.sh')
if command -v rsync >/dev/null 2>&1; then
  rsync -a "${EXCL[@]}" "$SRC" "$DOCROOT/"
else
  cp -a "$SRC". "$DOCROOT/"
fi

echo "OK: $(git -C "$REPO_DIR" log --oneline -1) -> $DOCROOT"
