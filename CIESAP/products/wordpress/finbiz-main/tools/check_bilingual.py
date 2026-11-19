#!/usr/bin/env python3
"""Verifie le site bilingue : liens/assets relatifs resolus sur disque (FR et EN),
equivalence FR<->EN, 1 selecteur de langue par page, hreflang, balises equilibrees.
Usage : python tools/check_bilingual.py   (code retour 1 si erreur)"""
import os, re, sys, urllib.parse
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_en as B

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr", "command", "keygen"}
SKIP = ("#", "http:", "https:", "//", "mailto:", "tel:", "data:", "javascript:", "sms:", "blob:")


class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.stack, s.errs, s.refs = [], [], []

    def handle_starttag(s, tag, attrs):
        for k, v in attrs:
            if v is None:
                continue
            if k in ("href", "src", "data-src", "data-bg", "poster", "action"):
                s.refs.append((k, v))
            elif k == "srcset":
                s.refs += [(k, c.strip().split()[0]) for c in v.split(",") if c.strip()]
            elif k == "content" and re.search(r"\.(png|jpe?g|webp|svg|gif)$", v):
                s.refs.append((k, v))
            elif k == "style":
                s.refs += [("style-url", u) for u in re.findall(r"url\(['\"]?([^'\")]+)", v)]
        if tag not in VOID:
            s.stack.append((tag, s.getpos()[0]))

    def handle_startendtag(s, tag, attrs):
        t = len(s.stack)
        s.handle_starttag(tag, attrs)
        del s.stack[t:]

    def handle_endtag(s, tag):
        if tag in VOID:
            return
        if s.stack and s.stack[-1][0] == tag:
            s.stack.pop()
        elif tag in [t for t, _ in s.stack]:
            while s.stack and s.stack[-1][0] != tag:
                s.errs.append("<%s> non ferme (l.%d)" % s.stack.pop())
            s.stack.pop()
        else:
            s.errs.append("</%s> orphelin (l.%d)" % (tag, s.getpos()[0]))

    def handle_data(s, d):
        pass


def check(path, html):
    p = P()
    p.feed(html)
    p.close()
    errs = list(p.errs) + ["<%s> non ferme (l.%d)" % t for t in p.stack]
    refs = list(p.refs)
    for m in re.finditer(r"<style[^>]*>(.*?)</style>", html, re.S):
        refs += [("css-url", u) for u in re.findall(r"url\(\s*['\"]?([^'\")\s]+)", m.group(1)) if not u.startswith("$")]
    dead = []
    for k, v in refs:
        v = v.strip()
        if not v or v.startswith(SKIP) or "${" in v:
            continue
        if v.startswith("/"):
            dead.append((k, v + "  [chemin absolu]"))
            continue
        t = os.path.normpath(os.path.join(os.path.dirname(path), urllib.parse.unquote(re.split(r"[?#]", v, maxsplit=1)[0])))
        if os.path.isdir(t):
            t = os.path.join(t, "index.html")
        if not os.path.isfile(t):
            dead.append((k, v))
    return errs, dead


def main():
    pages = B.fr_pages()
    bad = 0
    stat = dict(fr=0, en=0, dead=0, known=0, sw=0, unb=0, hl=0, eq=0)
    for lang, pth in (("fr", B.src_path), ("en", B.en_path)):
        for pg in pages:
            f = pth(pg)
            name = ("en/" if lang == "en" else "") + (pg or "") + "/"
            if not os.path.isfile(f):
                print("MANQUANT", name); bad += 1; stat["eq"] += 1; continue
            stat[lang] += 1
            h = B.rd(f)
            errs, dead = check(f, h)
            if errs:
                stat["unb"] += 1; bad += 1; print("BALISES", name, errs[:3])
            for d in dead:
                if d[1].endswith("wp-comments-post.php"):
                    stat["known"] += 1; continue  # formulaire de commentaires WP sans backend (herite du clone)
                stat["dead"] += 1; bad += 1; print("MORT", name, d)
            n = len(re.findall(r'class="ciesap-lang"', h))
            cur = re.findall(r'aria-current="true"', h)
            if n != 1 or len(cur) != 1:
                stat["sw"] += 1; bad += 1; print("SELECTEUR", name, n, len(cur))
            fr, en = B.urls(pg, lang)
            ok = ('<html lang="%s"' % ("fr-FR" if lang == "fr" else "en-US")) in h and all(
                s in h for s in ('hreflang="fr" href="%s"' % fr, 'hreflang="en" href="%s"' % en, 'hreflang="x-default" href="%s"' % fr))
            if not ok:
                stat["hl"] += 1; bad += 1; print("HREFLANG/LANG", name)
            for u in (fr, en):
                if not os.path.isfile(os.path.normpath(os.path.join(os.path.dirname(f), u))):
                    stat["eq"] += 1; bad += 1; print("EQUIVALENT INTROUVABLE", name, u)
    en_found = sum(1 for d, _, fs in os.walk(os.path.join(ROOT, "en")) if "index.html" in fs)
    print("pages FR: %(fr)d | pages EN: %(en)d (en/ contient %%d index.html) | liens/assets morts: %(dead)d (+%(known)d action wp-comments-post.php connus) | "
          "selecteur != 1: %(sw)d | hreflang/lang KO: %(hl)d | balises desequilibrees: %(unb)d | equivalents manquants: %(eq)d" % stat % en_found)
    print("RESULTAT:", "OK" if not bad else "%d PROBLEME(S)" % bad)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
