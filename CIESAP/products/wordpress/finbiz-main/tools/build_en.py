#!/usr/bin/env python3
"""
build_en.py - infrastructure bilingue FR/EN du site statique CIESAP.

Architecture
  * Francais a la racine : /index.html, /about-us/index.html, ...
  * Anglais sous /en/ avec la MEME arborescence : /en/index.html, /en/about-us/index.html, ...
  * Assets (wp-content, wp-includes) UNIQUES a la racine, partages par les 2 langues.
  * Tous les chemins restent RELATIFS (pas de <base>, pas de "/..." absolu).

Ce que fait le script (idempotent)
  1. Injecte dans CHAQUE page (FR et EN) trois blocs delimites par des marqueurs
     <!--ciesap-lang:...--> ... <!--/ciesap-lang:...--> :
       - le selecteur de langue "FR | EN" (dans l'en-tete, a cote du menu hamburger),
       - les <link rel="alternate" hreflang="fr|en|x-default"> (+ og:locale si des
         balises og: existent deja),
       - l'attribut <html lang="fr-FR"> (FR) ou <html lang="en-US"> (EN).
     Re-executer remplace ces blocs, jamais de doublon.
  2. Cree en/<chemin>/index.html pour chaque page FR dont la copie n'existe pas encore,
     en recalculant les chemins pour la profondeur +1 :
       - toute reference a wp-content/ ou wp-includes/ (href, src, srcset, data-*,
         url() inline ou en <style>, content, JS/JSON...) recoit un prefixe "../" ;
       - les liens vers d'autres pages (.../index.html, "../", ".") restent inchanges :
         grace a l'arborescence identique ils pointent deja vers les pages anglaises ;
       - jamais touches : #ancre, mailto:, tel:, http(s)://, //, data:, javascript:, "/abs".

MODES
  python tools/build_en.py            Par defaut : cree seulement les pages EN absentes ;
                                      pour les pages EN existantes (deja traduites) ne
                                      rafraichit QUE les 3 blocs de langue, jamais le contenu.
  python tools/build_en.py --force    Regenere TOUT en/ depuis le francais : ECRASE les
                                      traductions existantes (avertissement + confirmation
                                      "oui" requise, ou --yes).
  python tools/build_en.py --dry-run  N'ecrit rien, indique ce qui serait fait.

Au deploiement (domaine connu) : remplacer les href hreflang relatifs par des URL
absolues (https://domaine/... et https://domaine/en/...), cf. fonction hreflang_block.
"""
import argparse
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EN_DIR = "en"
M = "ciesap-lang"


def rd(p):
    with open(p, encoding="utf-8", newline="") as f:
        return f.read()


def wr(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(s)


def fr_pages():
    out = []
    for d, dirs, files in os.walk(ROOT):
        rel = os.path.relpath(d, ROOT).replace(os.sep, "/")
        top = rel.split("/")[0]
        if top in (EN_DIR, "wp-content", "wp-includes", "tools", ".git") or (top.startswith(".") and top != "."):
            dirs[:] = []
            continue
        if "index.html" in files:
            out.append("" if rel == "." else rel)  # "" = accueil
    return sorted(out)


def parts(page):
    return page.split("/") if page else []


def src_path(page):
    return os.path.join(ROOT, *parts(page), "index.html")


def en_path(page):
    return os.path.join(ROOT, EN_DIR, *parts(page), "index.html")


# ---------------------------------------------------------------- blocs de langue
def urls(page, lang):
    """Chemins relatifs (depuis la page courante) vers la version FR et la version EN."""
    depth = len(parts(page)) + (1 if lang == "en" else 0)
    up = "../" * depth
    tail = (page + "/" if page else "") + "index.html"
    fr = up + tail
    en = up + EN_DIR + "/" + tail
    if lang == "fr" and not page:
        fr = "index.html"
    if lang == "en" and not page:
        en = "index.html"
    return fr, en


def switcher_block(page, lang):
    fr, en = urls(page, lang)
    if lang == "fr":
        a = '<span class="ciesap-lang__item is-current" lang="fr" aria-current="true" aria-label="Français">FR</span>'
        b = '<a class="ciesap-lang__item" href="%s" hreflang="en" lang="en" aria-label="English">EN</a>' % en
    else:
        a = '<a class="ciesap-lang__item" href="%s" hreflang="fr" lang="fr" aria-label="Français">FR</a>' % fr
        b = '<span class="ciesap-lang__item is-current" lang="en" aria-current="true" aria-label="English">EN</span>'
    # ordre visuel constant : FR | EN
    return ('<!--%s:switcher--><div class="elementor-element elementor-widget__width-auto elementor-widget ciesap-lang-widget">'
            '<nav class="ciesap-lang" aria-label="Langue / Language">%s<span class="ciesap-lang__sep" aria-hidden="true">|</span>%s</nav>'
            '</div><!--/%s:switcher-->') % (M, a, b, M)


def hreflang_block(page, lang, html):
    fr, en = urls(page, lang)
    s = ('<!--%s:hreflang-->\n<link rel="alternate" hreflang="fr" href="%s"/>\n<link rel="alternate" hreflang="en" href="%s"/>\n'
         '<link rel="alternate" hreflang="x-default" href="%s"/>\n') % (M, fr, en, fr)
    # og:locale uniquement si des balises og: existent deja (hors de notre bloc)
    base = re.sub(r"<!--%s:hreflang-->.*?<!--/%s:hreflang-->" % (M, M), "", html, flags=re.S)
    if re.search(r'<meta[^>]+property=["\']og:', base):
        loc, alt = ("fr_FR", "en_US") if lang == "fr" else ("en_US", "fr_FR")
        s += '<meta property="og:locale" content="%s"/>\n<meta property="og:locale:alternate" content="%s"/>\n' % (loc, alt)
    return s + "<!--/%s:hreflang-->" % M


ANCHOR = '<div class="elementor-element elementor-element-aeb0485 '  # widget hamburger de l'en-tete


def apply_lang_blocks(html, page, lang):
    html = re.sub(r"<!--%s:switcher-->.*?<!--/%s:switcher-->" % (M, M), "", html, flags=re.S)
    html = re.sub(r"\n?<!--%s:hreflang-->.*?<!--/%s:hreflang-->" % (M, M), "", html, flags=re.S)
    if html.count(ANCHOR) != 1:
        raise RuntimeError("ancre du hamburger introuvable/ambigue (%d) dans %s" % (html.count(ANCHOR), page or "/"))
    html = html.replace(ANCHOR, switcher_block(page, lang) + ANCHOR, 1)
    if "</head>" not in html:
        raise RuntimeError("</head> manquant : " + (page or "/"))
    html = html.replace("</head>", hreflang_block(page, lang, html) + "\n</head>", 1)
    code = "fr-FR" if lang == "fr" else "en-US"
    html, n = re.subn(r'<html lang="[^"]*"', '<html lang="%s"' % code, html, count=1)
    if n != 1:
        raise RuntimeError("<html lang> manquant : " + (page or "/"))
    return html


# ---------------------------------------------------------------- chemins pour profondeur +1
ASSET_RE = re.compile(r"(?<![\w/.:\\-])((?:\.\.?/)*)(wp-content|wp-includes)/")
ATTR_RE = re.compile(r"""(\s(?:href|action)=)(["'])([^"']*)\2""")
SKIP = ("#", "/", "http:", "https:", "mailto:", "tel:", "data:", "javascript:", "sms:")


def shift_paths(html):
    html = ASSET_RE.sub(lambda m: "../" + m.group(1) + m.group(2) + "/", html)

    def attr(m):
        v = m.group(3)
        if not v or v.startswith(SKIP) or "wp-content/" in v or "wp-includes/" in v:
            return m.group(0)
        path = re.split(r"[?#]", v, maxsplit=1)[0]
        last = path.rsplit("/", 1)[-1]
        # fichier (extension, hors index.html) = ressource a la racine -> +1 niveau ; sinon page : inchange
        if "." in last and last not in (".", "..", "index.html") and not last.startswith("."):
            return m.group(1) + m.group(2) + "../" + v + m.group(2)
        return m.group(0)

    return ATTR_RE.sub(attr, html)


# ---------------------------------------------------------------- principal
def main():
    ap = argparse.ArgumentParser(description="Genere/maintient la version anglaise (en/) du site.")
    ap.add_argument("--force", action="store_true", help="regenere TOUT en/ (ecrase les traductions)")
    ap.add_argument("--yes", action="store_true", help="confirme --force sans question")
    ap.add_argument("--dry-run", action="store_true", help="n'ecrit rien")
    a = ap.parse_args()

    pages = fr_pages()
    if a.force and not a.dry_run:
        print("ATTENTION : --force ecrase TOUTES les pages en/ (traductions comprises).")
        if not a.yes and input("Taper 'oui' pour continuer : ").strip().lower() != "oui":
            print("Abandon.")
            return 1
    created = refreshed = fr_updated = 0
    for page in pages:
        src = rd(src_path(page))
        fr_html = apply_lang_blocks(src, page, "fr")
        if fr_html != src:
            fr_updated += 1
            if not a.dry_run:
                wr(src_path(page), fr_html)
        dst = en_path(page)
        if a.force or not os.path.exists(dst):
            created += 1
            if not a.dry_run:
                wr(dst, apply_lang_blocks(shift_paths(fr_html), page, "en"))
        else:  # traduction existante : seuls les blocs de langue sont rafraichis
            cur = rd(dst)
            new = apply_lang_blocks(cur, page, "en")
            if new != cur:
                refreshed += 1
                if not a.dry_run:
                    wr(dst, new)
    orphans = []
    en_root = os.path.join(ROOT, EN_DIR)
    for d, _, files in os.walk(en_root):
        if "index.html" in files:
            rel = os.path.relpath(d, en_root).replace(os.sep, "/")
            rel = "" if rel == "." else rel
            if rel not in pages:
                orphans.append(rel or "/")
    print("%d pages FR | FR mises a jour: %d | EN creees: %d | EN existantes rafraichies (blocs de langue): %d | orphelines EN: %s"
          % (len(pages), fr_updated, created, refreshed, orphans or "aucune"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
