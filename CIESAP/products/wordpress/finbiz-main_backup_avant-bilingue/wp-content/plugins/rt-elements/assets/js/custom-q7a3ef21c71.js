/**
 *
 * --------------------------------------------------------------------
 *
 * Template : Custom Js Template
 * Author : reacthemes
 * Author URI : http://www.reactheme.com/
 *
 * --------------------------------------------------------------------
 *
 **/
(function ($) {
    "use strict";

    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    $.fn.skillBars = function (options) {
        var settings = $.extend({
            from: 0, // number start
            to: false, // number end
            speed: 1000, // how long it should take to count between the target numbers
            interval: 100, // how often the element should be updated
            decimals: 0, // the number of decimal places to show
            onUpdate: null, // callback method for every time the element is updated,
            onComplete: null, // callback method for when the element finishes updating
            /*onComplete: function(from) {
                console.debug(this);
            }*/
            classes: {
                skillBarBar: '.skillbar-bar',
                skillBarPercent: '.skill-bar-percent',
            }
        }, options);

        return this.each(function () {

            var obj = $(this),
                to = (settings.to != false) ? settings.to : parseInt(obj.attr('data-percent'));
            if (to > 100) {
                to = 100;
            };
            var from = settings.from,
                loops = Math.ceil(settings.speed / settings.interval),
                increment = (to - from) / loops,
                loopCount = 0,
                interval = setInterval(updateValue, settings.interval);

            obj.find(settings.classes.skillBarBar).animate({
                width: parseInt(obj.attr('data-percent')) + '%'
            }, settings.speed);

            function updateValue() {
                from += increment;
                loopCount++;
                $(obj).find(settings.classes.skillBarPercent).text(from.toFixed(settings.decimals) + '%');

                if (typeof (settings.onUpdate) == 'function') {
                    settings.onUpdate.call(obj, from);
                }

                if (loopCount >= loops) {
                    clearInterval(interval);
                    from = to;

                    if (typeof (settings.onComplete) == 'function') {
                        settings.onComplete.call(obj, from);
                    }
                }
            }

        });
    };

    // Cart show & hide
    $(document).on('click', '.menu-cart-area i', function () {
        $(".cart-icon-total-products").addClass("visible-cart");
        $(".body-overlay-cart").addClass("overlayshow");
    });
    $(document).on('click', '.body-overlay-cart', function () {
        $(this).removeClass("overlayshow");
        $(".cart-icon-total-products").removeClass("visible-cart");
    });
    $(document).on('click', '.close-cart', function () {
        $(".cart-icon-total-products").removeClass("visible-cart");
        $(".body-overlay-cart").removeClass("overlayshow");
    });

    // Portfolio Grid Item style 7 Sticky gao
    const items = document.querySelectorAll('.rt-portfolio-style7 .rt-sticky-enabled');
	items.forEach((item, index) => {
		item.style.top = `${140 + index * 120}px`;
	});

    // Gsap Animation 
    function titleAnimation() {
        if (typeof SplitText === "undefined") return;
        if (!$('.react-heading .word-line').length) return;
        const animations = [
            { selector: '.skew-left',  gsapFrom: { opacity: 0, x: 50,  y: 0,  rotateX: 0 } },
            { selector: '.skew-right', gsapFrom: { opacity: 0, x: -50, y: 0,  rotateX: 0 } },
            { selector: '.skew-up',    gsapFrom: { opacity: 0, x: 0,   y: 50, rotateX: 0 } },
            { selector: '.skew-down',  gsapFrom: { opacity: 0, x: 0,   y: -50, rotateX: 0 } },
        ];
        animations.forEach(({ selector, gsapFrom }) => {
            document.querySelectorAll(selector).forEach((element) => {
                if (element.animation) {
                    element.animation.progress(1).kill();
                    element.split.revert();
                }
                element.split = new SplitText(element, {
                    type: "lines,words,chars",
                    linesClass: "split-line",
                });
                gsap.set(element, { perspective: 400 });
                gsap.set(element.split.chars, gsapFrom);

                element.animation = gsap.to(element.split.chars, {
                    scrollTrigger: { trigger: element, start: "top 95%", once: true },
                    x: 0,
                    y: 0,
                    rotateX: 0,
                    opacity: 1,
                    duration: 1,
                    ease: Back.easeOut,
                    stagger: 0.02,
                });
            });
        });
    };

    // Editor Elementor widget is availabl
    $(window).on('elementor/frontend/init', function (){
        elementorFrontend.hooks.addAction('frontend/element_ready/react-heading.default', () => {
            document.fonts.ready.then(() => {
                titleAnimation();
            });
        });
    });
  
})(jQuery);