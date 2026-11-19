(function ($) {
	'use strict';

	// 6.EM MOBILE MENU
	$('.mobile-menu nav').meanmenu({
		meanScreenWidth: "991",
		meanMenuContainer: ".mobile-menu",
		onePage: true,
	});


	
	//project Scroll tigger Demo Main
        gsap.registerPlugin(ScrollTrigger);
        
        let sv = gsap.matchMedia();
        
        sv.add("(min-width: 1199px)", () => {
        
            let panels = document.querySelectorAll('.project-panel');
        
            let baseOffset = 150;
            let gap = 220; // exact gap
        
            panels.forEach((section, index) => {
        
                let topOffset = baseOffset + (index * gap);
        
                gsap.to(section, {
                    scrollTrigger: {
                        trigger: section,
                        pin: true,
                        scrub: 1,
                        start: `top ${topOffset}px`,
                        end: "bottom 100%",
                        endTrigger: '.project-area-pin',
                        pinSpacing: false,
                    },
                });
        
            });
        
        });
    

	// sidebar
	jQuery(document).ready(function (o) {
		0 < o(".offset-side-bar").length &&
			o(".offset-side-bar").on("click", function (e) {
				e.preventDefault(), e.stopPropagation(), o(".cart-group").addClass("isActive");
			}),
			0 < o(".bar-close").length &&
				o(".bar-close").on("click", function (e) {
					e.preventDefault(), o(".cart-group").removeClass("isActive");
				}),
			0 < o(".navSidebar-button").length &&
				o(".navSidebar-button").on("click", function (e) {
					e.preventDefault(), e.stopPropagation(), o(".info-group").addClass("isActive");
				}),
			0 < o(".bar-close").length &&
				o(".bar-close").on("click", function (e) {
					e.preventDefault(), o(".info-group").removeClass("isActive");
				}),
			o("body").on("click", function (e) {
				o(".info-group").removeClass("isActive"), o(".cart-group").removeClass("isActive");
			}),
			o(".dt-sidebar-widget").on("click", function (e) {
				e.stopPropagation();
			}),
			0 < o(".xs-modal-popup").length &&
				o(".xs-modal-popup").magnificPopup({
					type: "inline",
					fixedContentPos: !1,
					fixedBgPos: !0,
					overflowX: "auto",
					closeBtnInside: !1,
					callbacks: {
						beforeOpen: function () {
							this.st.mainClass = "my-mfp-slide-bottom xs-promo-popup";
						},
					},
				});
	});

	// Script nav
        $(".team-share").click(function(){
            $(this).siblings(".social-icon").toggleClass('active');
        });
	// 6.HOME 2 HERO CAROUSEL
	$('.em-slick-slider-new').slick({
		dots: false,
		speed: 900,
		arrows: true,
		autoplay: true,
		fade: false,
		autoplaySpeed: 6000,
		responsive: [{
			breakpoint: 769,
			settings: {
				arrows: false,
			}
		}]
	});
		
	// 6.EM SLICK SLIDER
	$('.em-slick-testi-description').slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		dots: true,
		fade: true,
		asNavFor: '.em-slick-testi-wraper'
	});
	$('.em-slick-testi-wraper').slick({
		slidesToShow: 3,
		slidesToScroll: 1,
		asNavFor: '.em-slick-testi-description',
		dots: false,
		arrows: false,
		centerMode: true,
		focusOnSelect: true
	});		
		
	//* Parallaxmouse js
	function parallaxMouse() {
		if ($('#parallax').length) {
			var scene = document.getElementById('parallax');
			var parallax = new Parallax(scene);
		};
	};	
	parallaxMouse();
	
	
	// 6.EM WOW ACTIVE JS
	    new WOW().init();
	
	
	// 6.SCROLLUP JS
		$.scrollUp({
			scrollText: '<i class="fa fa-angle-up"></i>',
			easingType: 'linear',
			scrollSpeed: 900,
			animation: 'fade'
		});
		
		
    //images gird box active 
        document.addEventListener('DOMContentLoaded', function () {
            const panels = document.querySelectorAll('.dreamit-image-panel');
        
            panels.forEach(panel => {
                panel.addEventListener('mouseenter', () => {
                    panels.forEach(p => p.classList.remove('active'));
                    panel.classList.add('active');
                });
            });
        });
        
        
        //tab list 1 home 4tab use
        document.addEventListener("DOMContentLoaded", function(){
            document.querySelectorAll(".dynamic-tab-wrapper").forEach(wrapper => {
                
                const buttons = wrapper.querySelectorAll(".tab-buttons li");
                const contents = wrapper.querySelectorAll(".tab-content");
        
                buttons.forEach((btn) => {
                    btn.addEventListener("click", () => {
                        let tabId = btn.getAttribute("data-tab");
        
                        contents.forEach(c => c.classList.remove("active"));
                        buttons.forEach(b => b.classList.remove("active"));
        
                        wrapper.querySelector("#" + tabId).classList.add("active");
                        btn.classList.add("active");
                    });
                });
                if(contents.length > 0){
                    contents[0].classList.add("active");
                    buttons[0].classList.add("active");
                }
            });
        });	
		
		
	// VenuboX
		$('.venobox').venobox({
			numeratio: true,
			infinigall: true
		});
		
	// 6.ONEPAGE MENU
	var top_offset = $('.one_page').height() + 0;
	$('.one_page .techno_menu .nav_scroll').onePageNav({
		currentClass: 'current',
		changeHash: false,
		scrollSpeed: 1000,
		scrollOffset: top_offset,
		scrollThreshold: 0.5,
		filter: '',
		easing: 'swing',
	});

	$(".nav_scroll li:first-child").addClass("current");
	/* sticky nav 1 */
	$('.one_page').scrollToFixed({
		preFixed: function () {
			$(this).find('.scroll_fixed').addClass('prefix');
		},
		postFixed: function () {
			$(this).find('.scroll_fixed').addClass('postfix').removeClass('prefix');
		}
	});
	
	// 6.EM STIKY NAV
	var headers1 = $('.trp_nav_area');
	$(window).on('scroll', function () {

		if ($(window).scrollTop() > 200) {
			headers1.addClass('hbg2');
		} else {
			headers1.removeClass('hbg2');
		}

	});
	
	// 6.EM COUNTARUP 
	$('.countr_text').counterUp({
		delay: 10,
		time: 1000
	});
	

	
	// 6.EM PORTFOLIO
	$('.em_load').imagesLoaded(function () {

		if ($.fn.isotope) {

			var $portfolio = $('.em_load');

			$portfolio.isotope({

				itemSelector: '.grid-item',

				filter: '*',

				resizesContainer: true,

				layoutMode: 'masonry',

				transitionDuration: '0.8s'

			});
			$('.filters li').on('click', function () {

				$('.filters li').removeClass('current_menu_item');

				$(this).addClass('current_menu_item');

				var selector = $(this).attr('data-filter');

				$portfolio.isotope({

					filter: selector,

				});

			});

		};

	});
	
	//educate all button
    $(function() {  
        $('.loginet-button')
        .on('mouseenter', function(e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
                $(this).find('span').css({top:relY, left:relX})
        })
        .on('mouseout', function(e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
            $(this).find('span').css({top:relY, left:relX})
        });
    });

	$(function() {  
        $('a')
        .on('mouseenter', function(e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
                $(this).find('span').css({top:relY, left:relX})
        })
        .on('mouseout', function(e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
            $(this).find('span').css({top:relY, left:relX})
        });
    });


    	// project-solar-active
	var slider = new Swiper(".project-solar-active", {
			speed: 1500,
			slidesPerView: 4,
			spaceBetween: 30,
			loop: true,
			autoplay:true,
			center:true,
			breakpoints: {
			1920: {
				slidesPerView: 3,
			},
			1400: {
				slidesPerView: 2,
			},
			1200: {
				slidesPerView: 2,
			},
			992: {
				slidesPerView: 2,
			},
			768: {
				slidesPerView: 1,
			},
			576: {
				slidesPerView: 1,
			},
			0: {
				slidesPerView: 1,
			},
			},

			// Navigation arrows
			navigation: {
			nextEl: ".slider-next",
			prevEl: ".slider-prev",
			},
	});

	
	  //List Active js
     const tabs = document.querySelectorAll('.controls');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Add active class to the clicked tab
        tab.classList.add('active');
      });
    }); 
	
	// 6.EM BLOG MASONARY
	$('.bgimgload').imagesLoaded(function () {
		if ($.fn.isotope) {
			var $blogmassonary = $('.blog-messonary');
			$blogmassonary.isotope({
				itemSelector: '.grid-item',
				filter: '*',
				resizesContainer: true,
				layoutMode: 'masonry',
				transitionDuration: '0.8s'
			});

		};
	});

	/* Simple Text Reveal Animation using GSAP (no SplitText required) */
// 	if ($('.text-anime-3').length) {
// 		gsap.registerPlugin(ScrollTrigger);
// 		document.querySelectorAll('.text-anime-3').forEach(function(element) {
// 			gsap.from(element, {
// 				scrollTrigger: { trigger: element, start: "top 90%" },
// 				x: 50,
// 				opacity: 0,
// 				duration: 1,
// 				ease: "back.out(1.7)",
// 			});
// 		});
// 	}


	// 6.EM TESTIMONIAL
	$('.client-testimonial').owlCarousel({
		loop: true,
		autoplay: false,
		autoplayTimeout: 10000,
		dots: false,
		nav: false,
		navText: ["<i class='flaticon-back''></i>", "<i class='flaticon-next-1''></i>"],
		responsive: {
			0: {
				items: 1
			},
			768: {
				items: 2
			},
			992: {
				items: 2
			},
			1000: {
				items: 3
			},
			1920: {
				items: 3
			}
		}
	})
	
		// 6.EM TESTIMONIAL
	$('.blog_carousel').owlCarousel({
        loop: true,
        margin: 0,
        center: true,
        dots: false,
        nav: false,
        autoplay: true,
		navText: ["<i class='flaticon-back''></i>", "<i class='flaticon-next-1''></i>"],
		responsive: {
			0: {
				items: 1
			},
			768: {
				items: 2
			},
			992: {
				items: 3
			},
			1000: {
				items: 3
			},
			1920: {
				items: 3
			}
		}
	})

	
	// 6.EM TESTIMONIAL
	$('.brand_carousel').owlCarousel({
        autoplay: true,
        loop: true,
        margin:15,
        dots:false,
        slideTransition:'linear',
        autoplayTimeout:4500,
        autoplayHoverPause:true,
        autoplaySpeed:4500,
		navText: ["<i class='flaticon-back''></i>", "<i class='flaticon-next-1''></i>"],
		responsive: {
			0: {
				items: 2
			},
			768: {
				items: 3
			},
			992: {
				items: 5
			},
			1000: {
				items: 5
			},
			1920: {
				items: 6
			}
		}
	})
	


    jQuery('.next-slide').on('click', function() {

    var img_src = "";

    jQuery('.next-slide.nav-active').removeClass('nav-active');

    jQuery(this).addClass('nav-active');

    img_src = jQuery(this).html();

    jQuery('.slider-main-img').html(img_src);

    var slideno = jQuery(this).data('slide');

    jQuery('.c-slider').slick('slickGoTo', slideno - 1, true);

    });





window.addEventListener("load", () => {
  gsap.registerPlugin(ScrollTrigger);

  const width = window.innerWidth; 
  const endEl = ".project-section-one"; 

  const panels = gsap.utils.toArray(".project-box-item");

  panels.forEach((panel, i) => {
    gsap.set(panel, { zIndex: 0 + i });

    ScrollTrigger.create({
      trigger: panel,
      start: "top 10%",
      end:
        width >= 1600
          ? "bottom 90%"
          : width >= 1400
          ? "bottom 160%"
          : "bottom 170%",
      endTrigger: endEl,
      pin: true,
      pinSpacing: false,
      scrub: true
    });
  });

  ScrollTrigger.refresh();
});




// 
(function () {
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  const forceRefresh = () => {
    document.body.style.transform = "scale(1)";
    setTimeout(() => {
      document.body.style.transform = "";
      ScrollTrigger.refresh();
    }, 100);
  };

  setInterval(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (Math.abs(width - lastWidth) > 100 || Math.abs(height - lastHeight) > 100) {
      lastWidth = width;
      lastHeight = height;
      forceRefresh();
    }
  }, 500);
})();

window.addEventListener("keydown", (e) => {
  if (e.key === "F12") {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
  }
});


	// give donation form
	  document.addEventListener("DOMContentLoaded", function () {
    const amountButtons = document.querySelectorAll(".preset-buttons .amount");
    const input = document.getElementById("donationAmount");

    if (!input || amountButtons.length === 0) {
      return;
    }

    amountButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        amountButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        if (!btn.classList.contains("custom")) {
          input.value = btn.dataset.amount;
          input.placeholder = "";
          input.classList.remove("placeholder-active");
        } else {
          input.value = "";
          input.placeholder = "Enter amount";
          input.classList.add("placeholder-active");
          input.focus();
        }
      });
    });

    input.addEventListener("input", () => {
      amountButtons.forEach(b => b.classList.remove("active"));
      input.classList.remove("placeholder-active");
    });
  });



/* Text Effect Animation */
	if ($('.text-anime-3').length) {		
		let	animatedTextElements = document.querySelectorAll('.text-anime-3');
		
		animatedTextElements.forEach((element) => {
			//Reset if needed
			if (element.animation) {
				element.animation.progress(1).kill();
				element.split.revert();
			}

			element.split = new SplitText(element, {
				type: "lines,words,chars",
				linesClass: "split-line",
			});
			gsap.set(element, { perspective: 400 });

			gsap.set(element.split.chars, {
				opacity: 0,
				x: "50",
			});

			element.animation = gsap.to(element.split.chars, {
				scrollTrigger: { trigger: element,	start: "top 90%" },
				x: "0",
				y: "0",
				rotateX: "0",
				opacity: 1,
				duration: 1,
				ease: Back.easeOut,
				stagger: 0.02,
			});
		});		
	}




/* Image Reveal Animation */
	if ($('.reveal').length) {
        gsap.registerPlugin(ScrollTrigger);
        let revealContainers = document.querySelectorAll(".reveal");
        revealContainers.forEach((container) => {
            let image = container.querySelector("img");
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    toggleActions: "play none none none"
                }
            });
            tl.set(container, {
                autoAlpha: 1
            });
            tl.from(container, 1, {
                xPercent: -100,
                ease: Power2.out
            });
            tl.from(image, 1, {
                xPercent: 100,
                scale: 1,
                delay: -1,
                ease: Power2.out
            });
        });
    }



// Sticky Section Scroll Demo Two
var el = document.querySelector(".sticky-section");
if (el) {
    for (var i = 0; i < 5; i++) {
        el = el.parentElement;
        if (!el) break;

        el.style.overflow = "visible";
        console.log("Changed:", el.tagName, el.className);
    }
}
document.querySelectorAll('*').forEach(function(el) {
    if (el.offsetWidth > document.documentElement.clientWidth) {
        console.log('Overflow element:', el);
    }
});







})(jQuery);
