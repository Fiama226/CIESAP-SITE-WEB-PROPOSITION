(function ($) {
	"use strict";

	/***
	 * MObile Menu
	 */
	$('#transpi-mobile-menu').metisMenu();

    $('#transpi-mobile-menu .dropdown > a').on('click', function (e) {
        e.preventDefault();
    });
	$(".hamburger_menu").on("click", function (e) {
		e.preventDefault();
		$(".slide-bar").toggleClass("show");
		$("body").addClass("on-side");
		$('.body-overlay').addClass('active');
		$(this).addClass('active');
	});

    $(".close-mobile-menu > a").on("click", function (e) {
		e.preventDefault();
		$(".slide-bar").removeClass("show");
		$("body").removeClass("on-side");
		$('.body-overlay').removeClass('active');
		$('.hamburger_menu > a').removeClass('active');
	});

	$('.body-overlay').on('click', function () {
		$(this).removeClass('active');
		$(".slide-bar").removeClass("show");
		$("body").removeClass("on-side");
		$('.hamburger-menu > a').removeClass('active');
	});

	$(".search__open-btn").on("click", function () {
		$(".search__popup").addClass("search-opened");
	});

	
	$(".search-close-btn").on("click", function () {
		$(".search__popup").removeClass("search-opened");
	});

	$('.video-popup').magnificPopup({
		disableOn: 200,
		type: 'iframe',
		mainClass: 'mfp-fade',
		removalDelay: 160,
		preloader: false,
		fixedContentPos: false,
	});
	$(window).on("load", function () {
        $("#transpiPreloader").fadeOut(800);
    });

	if($('.wow').length){
		var wow = new WOW(
		{
			boxClass:     'wow',
			animateClass: 'animated',
			offset:       0,
			mobile:       true,
			live:         true
		}
		);
		wow.init();
	}
	
		if(window.innerWidth> 550){
			const textanim = document.querySelectorAll(".spilit__text_item");
			function setupSplits() {
				$(document).ready(function(){
					$(".split-line").wrap('<div class="split-parent"></div>');
				});
				textanim.forEach(spilit__text_item => {
					spilit__text_item.split = new SplitText(spilit__text_item, { 
						type: "lines,words,chars",
						linesClass: "split-line"
					});
					spilit__text_item.anim = gsap.from(spilit__text_item.split.lines, {
						scrollTrigger: {
							trigger: spilit__text_item,
							scrub: false,
							toggleActions: "play none none none",
							start: "bottom 100%",
							markers: false,
						},
						duration: 0.6, 
						yPercent: 100, 
						stagger: 0.2,
						ease: Power2.out
					});
				});
			}
			setupSplits();
		};
		let splitTextLines = gsap.utils.toArray(".ptx-text-anim p");
		splitTextLines.forEach(splitTextLine => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: splitTextLine,
					start: 'top 90%',
					duration: 2,
					end: 'bottom 60%',
					scrub: false,
					markers: false,
					toggleActions: 'play none none none'
				}
			});
			const itemSplitted = new SplitText(splitTextLine, { type: "lines" });
			gsap.set(splitTextLine, { perspective: 400 });
			itemSplitted.split({ type: "lines" })
			tl.from(itemSplitted.lines, { duration: 1, delay: 0.5, opacity: 0, rotationX: -80, force3D: true, transformOrigin: "top center -50", stagger: 0.1 });
		});
		$(window).on('load', function(){
			const boxes = gsap.utils.toArray('.tx-animation-style1, .ptx-img-animation');
			boxes.forEach(img => {
				gsap.to(img, {
					scrollTrigger: {
						trigger: img,
						start: "top 70%",
						end: "bottom bottom",
						toggleClass: "active",
						once: true,
					}
				});
			});
		});
		
		$(document).ready(function() {
			var st = $(".spilit__enable");
			if(st.length == 0) return;
			gsap.registerPlugin(SplitText);
			st.each(function(index, el) {
				el.split = new SplitText(el, { 
					type: "lines,words,chars",
					linesClass: "split-line"
				});
				gsap.set(el, { perspective: 400 });

				if( $(el).hasClass('split-in-fade') ){
					gsap.set(el.split.chars, {
						opacity: 0,
						ease: "Back.easeOut",
					});
				}
				if( $(el).hasClass('split-in-right') ){
					gsap.set(el.split.chars, {
						opacity: 0,
						x: "50",
						ease: "Back.easeOut",
					});
				}
				if( $(el).hasClass('split-in-left') ){
					gsap.set(el.split.chars, {
						opacity: 0,
						x: "-50",
						ease: "circ.out",
					});
				}
				if( $(el).hasClass('split-in-up') ){
					gsap.set(el.split.chars, {
						opacity: 0,
						y: "80",
						ease: "circ.out",
					});
				}
				if( $(el).hasClass('split-in-down') ){
					gsap.set(el.split.chars, {
						opacity: 0,
						y: "-80",
						ease: "circ.out",
					});
				}
				if( $(el).hasClass('split-in-rotate') ){
					gsap.set(el.split.chars, {
						opacity: 0,
						rotateX: "50deg",
						ease: "circ.out",
					});
				}
				if( $(el).hasClass('split-in-scale') ){
					gsap.set(el.split.chars, {
						opacity: 0,
						scale: "0.5",
						ease: "circ.out",
					});
				}
				el.anim = gsap.to(el.split.chars, {
					scrollTrigger: {
						trigger: el,
						start: "top 90%",
					},
					x: "0",
					y: "0",
					rotateX: "0",
					scale: 1,
					opacity: 1,
					duration: 0.8, 
					stagger: 0.02,
				});
			});
		});

	if ($(".odometer").length) {
		$('.odometer').appear();
		$(document.body).on('appear', '.odometer', function(e) {
			var odo = $(".odometer");
			odo.each(function() {
				var countNumber = $(this).attr("data-count");
				$(this).html(countNumber);
			});
			window.odometerOptions = {
				format: 'd',
			};
		});
	}

	

	$(".project__item-contetn").each(function() {
		$(this).on("mouseover", function() {
		  $(".project__wrapper-area").addClass("hover");
		  $(".project__item-box").removeClass("active");
		  $(this).parent().addClass("active");
		}).on("mouseleave", function() {
		  $(".project__wrapper-area").removeClass("hover");
		});
	  });


	  function sliderOneActive($scope, $) {

		var slider = new Swiper('.thm-swiper__slider', {
			"slidesPerView": 1, 
			"loop": true,
			"effect": "fade",
			"speed": 2000,
			"autoplay": {
				"delay": 5000
			},
			"pagination": {
				"el": "#swiper-dot-style1",
				"type": "bullets",
				"clickable": true
			},
		});
	}
	function serviceSliderActive($scope, $) {

		var slider = new Swiper('.thm-swiper__service', {
			spaceBetween: 30,
			slidesPerView: 3,
			loop: true,
			autoplay:450,
			loopAdditionalSlides: 30,
			speed: 1e3,
			navigation: {
				nextEl: ".hap-team-button-next",
				prevEl: ".hap-team-button-prev"
			},
			"pagination": {
				"el": "#swiper-dot-style2",
				"type": "bullets",
				"clickable": true
			},
			breakpoints: {
				1600: {
					slidesPerView: 3
				},
				1500: {
					slidesPerView: 3
				},
				1400: {
					slidesPerView: 3
				},
				1300: {
					slidesPerView: 3
				},
				992: {
					slidesPerView: 2
				},
				768: {
					slidesPerView: 2
				},
				576: {
					slidesPerView: 1
				},
				0: {
					slidesPerView: 1
				}
			}
		});
	}
	function teamSliderActive($scope, $) {

		var slider = new Swiper('.thm-swiper__team', {
			spaceBetween: 30,
			slidesPerView: 3,
			loop: true,
			autoplay:450,
			loopAdditionalSlides: 30,
			speed: 1e3,
			navigation: {
				nextEl: ".tr-tm-button-next",
				prevEl: ".tr-tm-button-prev"
			},
			breakpoints: {
				1600: {
					slidesPerView: 3
				},
				1500: {
					slidesPerView: 3
				},
				1400: {
					slidesPerView: 3
				},
				1300: {
					slidesPerView: 3
				},
				992: {
					slidesPerView: 2
				},
				768: {
					slidesPerView: 2
				},
				576: {
					slidesPerView: 1
				},
				0: {
					slidesPerView: 1
				}
			}
		});
	}

	
	  function brandSliderActive($scope, $) {

		var brands = new Swiper('.thm-swiper__brand', {
			slidesPerView: 6,
			loop: true,
			autoplay: {
				"delay": 5000
			},
			//centeredSlides: true,
			speed: 1e3,
			breakpoints: {
				1600: {
					slidesPerView: 6
				},
				1500: {
					slidesPerView: 4
				},
				1400: {
					slidesPerView: 4
				},
				1300: {
					slidesPerView: 4
				},
				992: {
					slidesPerView: 3
				},
				768: {
					slidesPerView: 3
				},
				576: {
					slidesPerView: 2
				},
				0: {
					slidesPerView: 2
				}
			}
		});
	}

	function testimonialSliderActive($scope, $) {
		var slider = new Swiper('.thm-swiper__testimonial', {
			spaceBetween: 30,
			slidesPerView: 3,
			loop: true,
			autoplay: {
				"delay": 5000
			},
			centeredSlides: true,
			loopAdditionalSlides: 30,
			speed: 1e3,
			"pagination": {
				"el": "#swiper-dot-style3",
				"type": "bullets",
				"clickable": true
			},
			breakpoints: {
				1600: {
					slidesPerView: 3
				},
				1500: {
					slidesPerView: 3
				},
				1400: {
					slidesPerView: 3
				},
				1300: {
					slidesPerView: 2
				},
				1024: {
					slidesPerView: 2
				},
				992: {
					slidesPerView: 2
				},
				768: {
					slidesPerView: 2
				},
				576: {
					slidesPerView: 1
				},
				0: {
					slidesPerView: 1
				}
			}
		});
	}

	if ($("#slider-range").length) {
		$( "#slider-range" ).slider({
			range: true,
			min: 0,
			max: 6000,
			values: [ 0, 3000 ],
			slide: function( event, ui ) {
				$( "#amount" ).val( "" + ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			}
		});
	};
	if ($("#amount").length) {
		$( "#amount" ).val( "" + $( "#slider-range" ).slider( "values", 0 ) +
			" - " + $( "#slider-range" ).slider( "values", 1 ) );
	};
	$('.count').prop('disabled', true);
	$(document).on('click','.plus',function(){
		$('.count').val(parseInt($('.count').val()) + 1 );
	});
	$(document).on('click','.minus',function(){
		$('.count').val(parseInt($('.count').val()) - 1 );
		if ($('.count').val() == 0) {
			$('.count').val(1);
		}
	});

	/**
	 * smooth scroll
	 */
	gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

	ScrollTrigger.normalizeScroll(true)

	// create the smooth scroller FIRST!
	let smoother = ScrollSmoother.create({
	smooth: 2,
	effects: true,
	normalizeScroll: true
	});

	var slider = new Swiper('.thm-swiper__testimonial-two', {
		"slidesPerView": 1, 
		"loop": true,
		"speed": 2000,
		"autoplay": {
			"delay": 5000
		},
		speed: 800,
		mousewheelControl: true,
		watchSlidesProgress: true,
		navigation: {
			prevEl: ".testi-sl-prev",
			nextEl: ".testi-sl-nxt",
		},
	});
	
	const dropdownElementList = document.querySelectorAll('.dropdown-toggle')
	const dropdownList = [...dropdownElementList].map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl))

	var $progress_bar = $('.progress-bar');
	$progress_bar.appear();
	$(document.body).on('appear', '.progress-bar', function() {
		var current_item = $(this);
		if (!current_item.hasClass('appeared')) {
			var percent = current_item.data('percent');
			current_item.css('width', percent + '%').addClass('appeared').parent().append('<span>' + percent + '%' + '</span>');
		}

	});

	/**
	 * back to top
	 */
	$(window).on('scroll', function() {
		var scrolled = $(window).scrollTop();
		if (scrolled > 300) $('.back-top-btn').addClass('active');
		if (scrolled < 300) $('.back-top-btn').removeClass('active');
	});
	$('.back-top-btn').on('click', function() {
		$('html, body').animate(
			{
				scrollTop: '0'
			},
			1200
		);
	});
	

	$(window).on('elementor/frontend/init', function () {
		elementorFrontend.hooks.addAction('frontend/element_ready/transpi-slider.default', sliderOneActive);
		elementorFrontend.hooks.addAction('frontend/element_ready/transpi-service-carousel.default', serviceSliderActive);
		elementorFrontend.hooks.addAction('frontend/element_ready/transpi-brand.default', brandSliderActive);
		elementorFrontend.hooks.addAction('frontend/element_ready/transpi-testimonial-carousel.default', testimonialSliderActive);
		elementorFrontend.hooks.addAction('frontend/element_ready/transpi-team-carousel.default', teamSliderActive);

	});

	
})(jQuery);