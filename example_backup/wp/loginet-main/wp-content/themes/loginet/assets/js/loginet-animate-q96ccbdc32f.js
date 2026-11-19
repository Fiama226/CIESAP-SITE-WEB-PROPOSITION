/*!
 * loginet-animate.js v1.0.0
 * Lightweight scroll animation library for loginet theme
 * License: GNU General Public License v2 or later
 * Replaces GSAP + ScrollTrigger (commercial license required)
 * Uses CSS transitions + Intersection Observer API (free, built-in browsers)
 */
(function(window) {
    'use strict';

    /* ── Easing map ───────────────────────────────────────────── */
    var EASE = {
        'power2.out'    : 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'power2.in'     : 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        'power2.inout'  : 'cubic-bezier(0.645, 0.045, 0.355, 1.0)',
        'power1.out'    : 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'back.out(1.7)' : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'back.easeout'  : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'linear'        : 'linear',
        'ease'          : 'ease',
        'ease-out'      : 'ease-out',
    };

    function getEase(e) {
        if (!e) return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        return EASE[String(e).toLowerCase()] || 'ease-out';
    }

    /* ── Helpers ─────────────────────────────────────────────── */
    function toArray(targets) {
        if (!targets && targets !== 0) return [];
        if (typeof targets === 'string') return Array.from(document.querySelectorAll(targets));
        if (targets instanceof Element)  return [targets];
        if (targets && targets.length !== undefined) return Array.from(targets);
        return [targets];
    }

    function observe(el, cb) {
        if (!el) return;
        var io = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) { cb(entry.target); io.unobserve(entry.target); }
            });
        }, { threshold: 0.1 });
        io.observe(el);
    }

    function num(v, fallback) { return isNaN(parseFloat(v)) ? (fallback || 0) : parseFloat(v); }

    /* ── Apply CSS prop helper ────────────────────────────────── */
    function applyProps(el, props, transition) {
        if (!el || !el.style) return;
        if (transition) el.style.transition = transition;

        var tx = 0, ty = 0, txp = 0, typ = 0, sc = 1, rx = 0;
        var hasTransform = false;

        Object.keys(props).forEach(function(p) {
            var v = props[p];
            switch (p) {
                case 'opacity':    el.style.opacity    = v; break;
                case 'visibility': el.style.visibility = v; break;
                case 'zIndex':     el.style.zIndex     = v; break;
                case 'autoAlpha':
                    el.style.opacity    = v;
                    el.style.visibility = num(v) === 0 ? 'hidden' : 'visible';
                    break;
                case 'x':         tx  = num(v); hasTransform = true; break;
                case 'y':         ty  = num(v); hasTransform = true; break;
                case 'xPercent':  txp = num(v); hasTransform = true; break;
                case 'yPercent':  typ = num(v); hasTransform = true; break;
                case 'scale':     sc  = num(v, 1); hasTransform = true; break;
                case 'rotateX':   rx  = num(v); hasTransform = true; break;
                case 'perspective':el.style.perspective = num(v) + 'px'; break;
            }
        });

        if (hasTransform) {
            var t = '';
            if (txp !== 0) t += 'translateX(' + txp + '%) ';
            if (tx  !== 0) t += 'translateX(' + tx  + 'px) ';
            if (typ !== 0) t += 'translateY(' + typ + '%) ';
            if (ty  !== 0) t += 'translateY(' + ty  + 'px) ';
            if (sc  !== 1) t += 'scale(' + sc + ') ';
            if (rx  !== 0) t += 'rotateX(' + rx + 'deg) ';
            el.style.transform = t.trim() || 'none';
        }
    }

    function resetTransform(el) {
        if (!el || !el.style) return;
        el.style.transform  = 'none';
        el.style.opacity    = '1';
        el.style.visibility = 'visible';
    }

    /* ── gsap.from() ─────────────────────────────────────────── */
    function gsapFrom(targets, durOrCfg, cfg) {
        var config   = (typeof durOrCfg === 'number') ? (cfg || {}) : (durOrCfg || {});
        var duration = (typeof durOrCfg === 'number') ? durOrCfg * 1000 : num(config.duration, 1) * 1000;
        var delay    = num(config.delay, 0) * 1000;
        var ease     = getEase(config.ease);
        var stagger  = num(config.stagger, 0) * 1000;
        var els      = toArray(targets);
        var st       = config.scrollTrigger;

        function run(el, idx) {
            setTimeout(function() {
                // Set FROM state
                applyProps(el, config, null);
                // Force reflow
                void el.offsetWidth;
                // Animate TO natural state
                setTimeout(function() {
                    var tr = 'opacity ' + duration + 'ms ' + ease +
                             ', transform ' + duration + 'ms ' + ease +
                             ', visibility ' + duration + 'ms ' + ease;
                    el.style.transition = tr;
                    resetTransform(el);
                }, 30);
            }, delay + (stagger * idx));
        }

        els.forEach(function(el, idx) {
            if (st) {
                var trigEl = typeof st.trigger === 'string' ? document.querySelector(st.trigger) : (st.trigger || el);
                observe(trigEl, function() { run(el, idx); });
            } else {
                run(el, idx);
            }
        });

        return gsap;
    }

    /* ── gsap.to() ───────────────────────────────────────────── */
    function gsapTo(targets, durOrCfg, cfg) {
        var config   = (typeof durOrCfg === 'number') ? (cfg || {}) : (durOrCfg || {});
        var duration = (typeof durOrCfg === 'number') ? durOrCfg * 1000 : num(config.duration, 1) * 1000;
        var delay    = num(config.delay, 0) * 1000;
        var ease     = getEase(config.ease);
        var stagger  = num(config.stagger, 0) * 1000;
        var els      = toArray(targets);

        els.forEach(function(el, idx) {
            setTimeout(function() {
                var tr = 'opacity ' + duration + 'ms ' + ease +
                         ', transform ' + duration + 'ms ' + ease;
                applyProps(el, config, tr);
            }, delay + stagger * idx);
        });

        return gsap;
    }

    /* ── gsap.set() ──────────────────────────────────────────── */
    function gsapSet(targets, props) {
        toArray(targets).forEach(function(el) { applyProps(el, props, null); });
        return gsap;
    }

    /* ── gsap.timeline() ─────────────────────────────────────── */
    function gsapTimeline(config) {
        var cfg = config || {};
        var st  = cfg.scrollTrigger;
        var tweens = [];

        var tl = {
            from : function(t, d, p) { tweens.push({fn: gsapFrom, args: [t, d, p]}); return tl; },
            to   : function(t, d, p) { tweens.push({fn: gsapTo,   args: [t, d, p]}); return tl; },
            set  : function(t, p)    { tweens.push({fn: function(){ gsapSet(t, p); }, args: []}); return tl; },
        };

        function run() {
            tweens.forEach(function(tw) { tw.fn.apply(null, tw.args); });
        }

        if (st) {
            var trigEl = typeof st.trigger === 'string' ? document.querySelector(st.trigger) : st.trigger;
            observe(trigEl, run);
        } else {
            setTimeout(run, 0);
        }

        return tl;
    }

    /* ── ScrollTrigger shim ──────────────────────────────────── */
    var ScrollTrigger = {
        create  : function(cfg) {
            if (!cfg || !cfg.trigger) return;
            var el = typeof cfg.trigger === 'string' ? document.querySelector(cfg.trigger) : cfg.trigger;
            if (!el) return;
            // Pinning: add a simple sticky-like class; full GSAP pinning not replicated
            // because it required paid GSAP. Widgets still visible, just not pinned.
            observe(el, function(target) {
                target.style.transition = 'opacity 0.5s ease';
                target.style.opacity    = '1';
            });
        },
        refresh : function() { /* no-op */ },
    };

    /* ── Main gsap object ────────────────────────────────────── */
    var gsap = {
        registerPlugin : function() { /* no-op */ },
        set            : gsapSet,
        from           : gsapFrom,
        to             : gsapTo,
        timeline       : gsapTimeline,
        utils          : { toArray : toArray },
    };

    /* ── Power/Back easing aliases used in theme.js ──────────── */
    var Power2 = { out: 'power2.out', in: 'power2.in', inOut: 'power2.inout' };
    var Power1 = { out: 'power1.out', in: 'ease-in',   inOut: 'ease-in-out'  };
    var Back   = { easeOut: 'back.out(1.7)', easeIn: 'ease-in', easeInOut: 'ease-in-out' };
    var Linear = { easeNone: 'linear' };

    /* ── Expose globals ──────────────────────────────────────── */
    window.gsap          = gsap;
    window.ScrollTrigger = ScrollTrigger;
    window.Power2        = Power2;
    window.Power1        = Power1;
    window.Back          = Back;
    window.Linear        = Linear;

})(window);
