(function($) {
    "use strict";
  	function initBackPostSlider($scope) {
  	    var $slider = $scope.find('.eel-all-slider');
  	    if (!$slider.length) {
  	        return;
  	    }
  	    var loop = $slider.data('loop') === true || $slider.data('loop') === 'true';
  	    var autoplay = $slider.data('autoplay') === true || $slider.data('autoplay') === 'true';
  	    var autoplayDelay = parseInt($slider.data('autoplay-delay'), 10) || 3000;
  	    var slidesPerView = parseInt($slider.data('slides-per-view'), 10) || 3;
  	    var speed = parseInt($slider.data('speed'), 10) || 600;
  	    var centeredSlides = $slider.data('centered-slides') === true || $slider.data('centered-slides') === 'true';
  	    var freeMode = $slider.data('free-mode') === true || $slider.data('free-mode') === 'true';
  	    var spaceBetween = parseInt($slider.data('space-between'), 10) || 0;
  	    var slidesPerViewTablet = parseInt($slider.data('slides-per-view-tablet'), 10) || 2;
  	    var slidesPerViewMobile = parseInt($slider.data('slides-per-view-mobile'), 10) || 1;
  	    	    	    var paginationType = $slider.data('pagination') !== 'none' ? $slider.data('pagination') : false;
	    var navigation = $slider.data('navigation') === true || $slider.data('navigation') === 'true';
	    var effect = $slider.data('effect') || 'slide';
	    var cubeShadow = $slider.data('cube-shadow') === true || $slider.data('cube-shadow') === 'true';
	    var coverflowRotate = parseInt($slider.data('coverflow-rotate'), 10) || 50;
	    var coverflowStretch = parseInt($slider.data('coverflow-stretch'), 10) || 0;
	    
	    // Find navigation elements within the scope
	    var $nextButton = $scope.find('.swiper-next');
	    var $prevButton = $scope.find('.swiper-prev');
	    var $pagination = $scope.find('.swiper-pagination');
	    
	    // Prevent multiple instances and duplicated handlers if Elementor re-runs init
	    if ($slider[0] && $slider[0].swiper) {
	        try { $slider[0].swiper.destroy(true, true); } catch (e) {}
	    }
	    if ($nextButton.length) { $nextButton.off('click.easyStopAuto click.easyFadeNav'); }
	    if ($prevButton.length) { $prevButton.off('click.easyStopAuto click.easyFadeNav'); }
	    
	    var hasProgressBar = $pagination.hasClass('swiper-pagination-progressbar');
  	    
  	    var effectOptions = {};
  	    
  	    if (effect === 'cube') {
  	        effectOptions = {
  	            cubeEffect: {
  	                shadow: cubeShadow,
  	                slideShadows: cubeShadow,
  	                shadowOffset: 20,
  	                shadowScale: 0.94,
  	            }
  	        };
  	    } else if (effect === 'coverflow') {
  	        effectOptions = {
  	            coverflowEffect: {
  	                rotate: coverflowRotate,
  	                stretch: coverflowStretch,
  	                depth: 100,
  	                modifier: 1,
  	                slideShadows: true,
  	            }
  	        };
  	    } else if (effect === 'flip') {
  	        effectOptions = {
  	            flipEffect: {
  	                slideShadows: true,
  	                limitRotation: true,
  	            }
  	        };
  	    } else if (effect === 'cards') {
  	        effectOptions = {
  	            cardsEffect: {
  	                slideShadows: true,
  	                rotate: true,
  	                perSlideOffset: 8,
  	            }
  	        };
	    } else if (effect === 'creative') {
			var creativeStyle = $slider.data('creative-style') || 'default';
			if (creativeStyle === 'zoom') {
				effectOptions = {
					creativeEffect: {
						limitProgress: true,
						prev: { scale: 1.1, opacity: 0, translate: [0, 0, 0] },
						next: { scale: 1.6, opacity: 0, translate: [0, 0, 0] },
					},
				};
			} else {
				effectOptions = {
					creativeEffect: {
						limitProgress: true,
						prev: { shadow: true, translate: [0, 0, -400] },
						next: { translate: ['100%', 0, 0] },
					},
				};
			}
		} else if (effect === 'fade') {
			effectOptions = {
				fadeEffect: { crossFade: true }
			};
		}
	    
	    // Loop handling tuned to avoid double-advance on loop edges
	    var totalSlides = $slider.find('.swiper-slide').length;
	    var isFade = effect === 'fade';
	    var visibleSlides = isFade ? 1 : slidesPerView;
	    var canLoop = totalSlides > visibleSlides;
	    var loopConfig = {};
	    if (loop && (canLoop || isFade)) {
	        loopConfig = {
	            loop: true,
	            loopAdditionalSlides: isFade ? totalSlides : 20,
	            loopedSlides: isFade ? totalSlides : Math.max(Math.ceil(visibleSlides), Math.min(totalSlides, 10))
	        };
	    } else {
	        loopConfig = { loop: false, rewind: !!loop };
	    }
  	    
	    var swiper = new Swiper($slider[0], {
	        ...loopConfig,
  	        speed: speed,
  	        effect: effect,
	        normalizeSlideIndex: true,
	        preventInteractionOnTransition: true,
  	        simulateTouch: true,    
  	        touchRatio: 1, 
  	        grabCursor: true,
  	        mousewheel: hasProgressBar ? {
	            enabled: true,
	            sensitivity: 1,
	            thresholdDelta: 50,
	            thresholdTime: 200,
	            releaseOnEdges: true,
	            invert: false,
	            forceToAxis: false,
	            eventsTarget: 'container'
	        } : false,
	        autoplay: autoplay ? {
  	            delay: autoplayDelay,
	            disableOnInteraction: isFade ? true : false,
  	        } : false,
	        slidesPerView: visibleSlides,
	        spaceBetween: isFade ? 0 : spaceBetween,
	        centeredSlides: isFade ? false : centeredSlides,
  	        freeMode: freeMode,            
  	        pagination: paginationType && $pagination.length ? {
				el: $pagination[0],
				clickable: true,
				type: paginationType,
				renderBullet: function (index, className) {
					let num = (index + 1).toString().padStart(2, '0');
					return `<span class="${className}">${num}</span>`;
				}
			} : false,
			
        // Progress bar for mouse scroll - only when swiper-pagination-progressbar class is present
        progressbar: hasProgressBar ? {
            el: '.swiper-progressbar',
            type: 'progressbar',
        } : false,			
			
	        navigation: (!isFade) && navigation && ($nextButton.length || $prevButton.length) ? {
  	            nextEl: $nextButton.length ? $nextButton[0] : null,
  	            prevEl: $prevButton.length ? $prevButton[0] : null,
  	        } : false,
  	        breakpoints: {
  	            0: {
	                slidesPerView: isFade ? 1 : slidesPerViewMobile,
  	            },
  	            768: {
	                slidesPerView: isFade ? 1 : slidesPerViewTablet,
  	            },
  	            1024: {
	                slidesPerView: isFade ? 1 : slidesPerView,
  	            },
  	        },
  	        ...effectOptions,
	    });
	    
	    // Fade: attach custom navigation so Next/Prev work
	    if (isFade && ($nextButton.length || $prevButton.length)) {
	        var isTransitioning = false;
	        swiper.on('transitionStart', function () { isTransitioning = true; });
	        swiper.on('transitionEnd', function () { isTransitioning = false; });
	        if ($nextButton.length) {
	            $nextButton.off('click.easyFadeNav').on('click.easyFadeNav', function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                if (swiper && swiper.autoplay && swiper.autoplay.stop) { swiper.autoplay.stop(); }
	                if (isTransitioning || (swiper && swiper.animating)) return;
	                swiper.slideNext();
	            });
	        }
	        if ($prevButton.length) {
	            $prevButton.off('click.easyFadeNav').on('click.easyFadeNav', function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                if (swiper && swiper.autoplay && swiper.autoplay.stop) { swiper.autoplay.stop(); }
	                if (isTransitioning || (swiper && swiper.animating)) return;
	                swiper.slidePrev();
	            });
	        }
	    }

	    // Non-fade: if loop+autoplay, stop autoplay on manual nav to avoid double-advance
	    if (!isFade && loop && autoplay) {
	        if ($nextButton.length) {
	            $nextButton.on('click.easyStopAuto', function () {
	                if (swiper && swiper.autoplay && swiper.autoplay.stop) {
	                    swiper.autoplay.stop();
	                }
	            });
	        }
	        if ($prevButton.length) {
	            $prevButton.on('click.easyStopAuto', function () {
	                if (swiper && swiper.autoplay && swiper.autoplay.stop) {
	                    swiper.autoplay.stop();
	                }
	            });
	        }
	    }
  	}

    function addWidgetTypeToBody($scope) {
        var widgetType = $scope.data('widget_type');
        if (widgetType) {
            var className = 'easy-eel-has-widget-' + widgetType.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
            document.body.classList.add(className);
        }
    }

	$(window).on('elementor/frontend/init', function () {

        function checkStickySection() {
            const stickySection = document.querySelector('.eel-sticky-section');
            if (stickySection) {
                document.body.classList.add('sticky-enabled-overlap');
            } else {
                document.body.classList.remove('sticky-enabled-overlap');
            }
        }

        checkStickySection();

        const observer = new MutationObserver(checkStickySection);
        observer.observe(document.body, { childList: true, subtree: true });
    });

	
	function initReveal() {
		const revealElements = document.querySelectorAll(".eel-img-reveal-wrap, .eel-img-advance-wrap");

		const revealAnimate = (el) => {
			const target = el.querySelector(".eel-reveal-img-main, .eel-advance-img-main");
			if(target) target.classList.add("el-reveal-animate");
		};

		const isEditor = window.elementorFrontend && elementorFrontend.isEditMode && elementorFrontend.isEditMode();

		if(isEditor){
			
			revealElements.forEach(el => revealAnimate(el));
		} else {
			
			const observer = new IntersectionObserver((entries, obs) => {
					entries.forEach(entry => {
						if(entry.isIntersecting){
							revealAnimate(entry.target);
							obs.unobserve(entry.target);
						}
					});
			}, { threshold: 0.3 });

			revealElements.forEach(el => observer.observe(el));
		}
	}

   $(window).on('elementor/frontend/init', function () {
      elementorFrontend.hooks.addAction('frontend/element_ready/global', initBackPostSlider);
      elementorFrontend.hooks.addAction('frontend/element_ready/global', addWidgetTypeToBody);
		elementorFrontend.hooks.addAction('frontend/element_ready/global', initReveal);
   });
	
})(jQuery);