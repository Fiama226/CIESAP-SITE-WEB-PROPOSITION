(function($){
    // =================================
    // GSAP & ScrollTrigger
    // =================================
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
  

    // =================================
    // Elementor Animations
    // =================================
    var easyel_runAnimations = function($scope){

        function splitTextNodes($el, mode){
            $el.contents().each(function(){
                if(this.nodeType === 3){ // Text node
                    if(mode === 'chars'){
                        var chars = this.nodeValue.split('').map(l => '<em class="easy-split-letter">'+(l===' ' ? '&nbsp;' : l)+'</em>').join('');
                        $(this).replaceWith(chars);
                    } else if(mode === 'words'){
                        var words = this.nodeValue.split(' ').map(w => '<em class="easy-split-word">'+w+'</em>').join(' ');
                        $(this).replaceWith(words);
                    }
                } else if(this.nodeType === 1){ // Element node
                    splitTextNodes($(this), mode);
                }
            });
        }

        $scope.find('[data-eel-animation]').each(function(){
            var $wrap = $(this);
            var target = $wrap.find('.e-e-title');
            var animType = $wrap.data('eel-animation');

            let stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
            let scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
            let startPos = $wrap.data('scroll-start') || 'top 70%';
            let endPos   = $wrap.data('scroll-end') || 'top 10%';
            let easeChars = $wrap.data('fill-ease-chars') || 'power4';
            let ease = $wrap.data('fill-ease') || 'Power2.out'; 

            function splitLinesFallback(target) {
                const html = target.html();
                const lines = html
                .split("<br>")
                .map((line) => `<div class="fake-line">${line}</div>`);
                target.html(lines.join(""));
                return target.find(".fake-line");
            }
            if(!animType || animType==='default' || !target.length) return;

            switch(animType){
                
                case 'split-text':
                    splitTextNodes(target,'chars');                    
                    if(target.find('.easy-split-letter').length){
                        stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                        scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                        startPos = $wrap.data('scroll-start') || 'top 70%';
                        endPos   = $wrap.data('scroll-end') || 'top 10%';
                        easeChars = $wrap.data('fill-ease-chars') || 'power4';
                        gsap.from(target.find('.easy-split-letter'), {
                            y:50, opacity:0, stagger:stagger, duration:scrub,
                            ease:easeChars,
                            scrollTrigger:{trigger:$wrap[0], start:startPos, end:endPos}
                        });                        
                    }
                    break;

                case 'text-reveal':
                    if(typeof SplitType !== "undefined"){
                        target.addClass('eel-text-reveal');
                        const revealText = new SplitType(target[0], { types: 'chars' });
                        stagger  = parseFloat($wrap.data('fill-stagger')) || 0.01;                        
                        scrub    = parseFloat($wrap.data('fill-scrub')) || 0.1;
                        startPos = $wrap.data('scroll-start') || 'top 70%';
                        endPos   = $wrap.data('scroll-end') || 'top 10%';
                        easeChars = $wrap.data('fill-ease-chars') || 'power4';
                        gsap.to(revealText.chars, {
                            y: 0,
                            opacity: 1,
                            stagger: stagger,
                            delay: 0,
                            duration: scrub,
                            scrollTrigger: {
                                trigger: $wrap[0],
                                start: startPos,
                                end: endPos
                            }
                        });
                    }
                break;
                    

                case "split-lines-leftv2": {
                    if (!target.length) return;
                    easeChars = $wrap.data('fill-ease-chars') || 'Back.easeOut';
                    stagger  = parseFloat($wrap.data('fill-stagger')) || 0.02;                        
                    scrub    = parseFloat($wrap.data('fill-scrub')) || 1;
                    startPos = $wrap.data('scroll-start') || 'top 70%';
                    endPos   = $wrap.data('scroll-end') || 'top 10%';
                    const element = target[0];
                    // Reset previous animation
                    if (element.animation) {
                        element.animation.progress(1).kill();
                        if (element.split && element.split.revert) element.split.revert();
                    }

                    if (elementorFrontend && elementorFrontend.isEditMode()) {
                        // Editor mode → animation without scrollTrigger
                        let lines = splitLinesFallback(target);
                        gsap.set(element, { perspective: 400 });
                        gsap.set(lines, { opacity: 0, x: 50 });
                        element.animation = gsap.to(lines, {
                            x: 0,
                            y: 0,
                            rotateX: 0,
                            opacity: 1,
                            duration: scrub,
                            ease: ease,
                            stagger: stagger,
                        });

                    } else if (typeof SplitText !== "undefined") {
                        // Frontend → splitText + scrollTrigger
                        document.fonts.ready.then(() => {
                            element.split = new SplitText(element, {
                                type: "lines,words,chars",
                                linesClass: "split-line",
                            });

                            let lines = element.split.lines;

                            gsap.set(element, { perspective: 400 });
                            gsap.set(element.split.chars, { opacity: 0, x: 50 });

                            element.animation = gsap.to(element.split.chars, {
                                scrollTrigger: { trigger: element, start: startPos },
                                x: 0,
                                y: 0,
                                rotateX: 0,
                                opacity: 1,
                                duration: scrub,
                                ease: easeChars,
                                stagger: stagger,
                            });
                        });
                    } else {
                        // Pure fallback
                        let lines = splitLinesFallback(target);
                        gsap.from(lines, {
                            x: 0,
                            y: 0,
                            rotateX: 0,
                            opacity: 1,
                            duration: scrub,
                            ease: easeChars,
                            stagger: stagger,
                        });
                    }
                }
                break;

                case 'characters':
                    if(typeof SplitType !== "undefined"){
                        document.fonts.ready.then(()=>{
                            target.addClass('eel-text-characters');
                            const split = new SplitType(target[0], { types: 'chars' });
                            stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                            scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                            startPos = $wrap.data('scroll-start') || 'top 70%';
                            endPos   = $wrap.data('scroll-end') || 'top 10%';
                            easeChars = $wrap.data('fill-ease-chars') || 'power4';
                            gsap.from(split.chars, {
                                x: 150,
                                opacity: 0,
                                duration: scrub,
                                ease: easeChars,
                                stagger: stagger,
                                scrollTrigger: { trigger: $wrap[0], start: startPos, end: endPos }
                            });                           
                        });
                    }
                break;
              
                
                case 'split-lines-bottom-v2':
                    if(typeof SplitType !== "undefined"){
                        document.fonts.ready.then(()=>{
                            target.addClass('eel-lines-bottom-v2');
                            const split = new SplitType(target[0], { types: 'lines' });
                            stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                            scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                            startPos = $wrap.data('scroll-start') || 'top 70%';
                            endPos   = $wrap.data('scroll-end') || 'top 10%';
                            easeChars = $wrap.data('fill-ease-chars') || 'power4';
                            let animation = gsap.from(split.lines, {
                                rotationX: -100,
                                transformOrigin: "50% 50% -160px",
                                opacity: 0,
                                duration: scrub,
                                ease: easeChars,
                                stagger: stagger,
                                scrollTrigger: { trigger: $wrap[0], start: startPos, end: endPos }
                            });
                        });
                    }
                    break;

                case 'text-word':
                    if (typeof SplitType !== "undefined") {
                        document.fonts.ready.then(() => {
                            target.addClass('eel-text-word');
                            const split = new SplitType(target[0], { types: 'words' });
                            stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                            scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                            startPos = $wrap.data('scroll-start') || 'top 70%';
                            endPos   = $wrap.data('scroll-end') || 'top 10%';
                            easeChars = $wrap.data('fill-ease-chars') || 'power4';
                            gsap.from(split.words, {
                                y: -100,
                                opacity: 0,
                                rotation: "random(-80, 80)",
                                duration: scrub,
                                ease: easeChars,
                                stagger: stagger,
                                scrollTrigger: { trigger: $wrap[0], start: startPos, end: endPos }
                            });
                        });
                    }
                    break;
                

                case 'words-slide-up':                   

                    if (typeof SplitType !== "undefined") {
                        document.fonts.ready.then(() => {
                            target.addClass('eel-words-slide-up');
                            const split = new SplitType(target[0], { types: 'words' });
                            const words = split.words;
                            const tl = gsap.timeline({ paused: true });
                            easeChars = $wrap.data('fill-ease-chars') || 'back.out(2)'; 
                            scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                            tl.from(words, {
                                opacity: 0,
                                yPercent: 100,
                                duration: scrub,
                                ease: easeChars,
                                stagger: { amount: 0.5 },
                            });
                            ScrollTrigger.create({
                                trigger: $wrap[0],
                                start: startPos,
                                onEnter: () => tl.play(),
                                onLeaveBack: () => tl.progress(0).pause()
                            });
                        });
                    }
                    break;

                case 'words-rotate-in':
                    if (typeof SplitType !== "undefined") {
                        document.fonts.ready.then(() => {
                            target.addClass('eel-words-rotate-in');
                            const split = new SplitType(target[0], { types: 'words' });
                            const words = split.words;
                            const tl = gsap.timeline({ paused: true });
                            stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                            scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                            startPos = $wrap.data('scroll-start') || 'top 70%';                         
                            easeChars = $wrap.data('fill-ease-chars') || 'power4'; 
                            tl.set(words, { transformPerspective: 1000 });
                            tl.from(words, {
                                rotationX: -90,
                                opacity: 0,
                                duration:scrub,
                                ease: easeChars,
                                stagger: { amount: stagger },
                            });
                            ScrollTrigger.create({
                                trigger: $wrap[0],
                                start: startPos,
                                onEnter: () => tl.play(),
                                onLeaveBack: () => tl.progress(0).pause()
                            });
                        });
                    }
                    break;

                    
                    case 'text-reveal-scroll-1':
                    if (typeof SplitType !== "undefined" && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {

                        gsap.registerPlugin(ScrollTrigger);

                        document.fonts.ready.then(() => {
                            target.addClass('eel-text-reveal-scroll-1');

                            // SplitType revert if exists
                            if (target[0].splitType) target[0].splitType.revert();

                            const split = new SplitType(target[0], { types: 'chars' });
                            const bgColor = $wrap.data('bg-color') || "#121212";
                            const fgColor = $wrap.data('fg-color') || "#ff0000";                            
                            stagger  = parseFloat($wrap.data('fill-stagger')) || 0.035;
                            scrub    = parseFloat($wrap.data('fill-scrub')) || 1.6;
                            startPos = $wrap.data('scroll-start') || 'top 40%';
                            endPos   = $wrap.data('scroll-end') || 'top 10%';
                            ease = $wrap.data('fill-ease') || 'Power2.out';

                            // GSAP Scroll animation
                            gsap.fromTo(split.chars,
                                { color: bgColor, opacity: 1 },
                                {
                                    color: fgColor,
                                    opacity: 1,
                                    ease: ease,
                                    stagger: {
                                        each: stagger,
                                        from: 'start',
                                    },                                  
                                    scrollTrigger: {
                                        trigger: $wrap[0],
                                        start: startPos,
                                        end: endPos,
                                        scrub: scrub,
                                        markers: false,
                                    }
                                }
                            );
                        });
                    }
                    break;
                    

                    case 'text-reveal-scroll-2':
                    if (typeof SplitType !== "undefined" && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {

                        gsap.registerPlugin(ScrollTrigger);

                        document.fonts.ready.then(() => {
                            target.addClass('eel-text-reveal-scroll-2');

                            if (target[0].splitType) target[0].splitType.revert();

                            const split = new SplitType(target[0], { types: 'chars' });
                            const bgColor = $wrap.data('bg-color') || "#121212";
                            const fgColor = $wrap.data('fg-color') || "#ffaa00ff";

                            stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                            scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                            startPos = $wrap.data('scroll-start') || 'top 70%';
                            endPos   = $wrap.data('scroll-end') || 'top 10%';
                            easeChars = $wrap.data('fill-ease-chars') || 'power2.out';

                            gsap.fromTo(split.chars,
                                { y: "100%", color: bgColor, opacity: 0 },
                                {
                                    y: "0%",
                                    color: fgColor,
                                    opacity: 1,
                                    duration: scrub,
                                    stagger: stagger,
                                    ease: easeChars,
                                    scrollTrigger: {
                                        trigger: $wrap[0],
                                        start: startPos,
                                        end: endPos,
                                        scrub: true,
                                        markers: false,
                                    }
                                }
                            );
                        });
                    }
                    break;

                    case 'text-fade-upscroll':
                        if(typeof SplitType !== "undefined"){
                            document.fonts.ready.then(()=>{
                                target.addClass('eel-text-fade-upscroll');
                                const split = new SplitType(target[0], { types: 'chars' });
                                stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                                scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                                startPos = $wrap.data('scroll-start') || 'top 70%';
                                endPos   = $wrap.data('scroll-end') || 'top 10%';
                                easeChars = $wrap.data('fill-ease-chars') || 'power1.out'; 
                                gsap.from(split.chars, {
                                    opacity: 0,    
                                    duration: scrub,
                                    ease: easeChars,
                                    stagger: stagger,
                                    scrollTrigger: {
                                        trigger: $wrap[0],
                                        start: startPos,
                                        end: endPos,
                                        scrub: true
                                    }
                                });
                            });
                        }
                        break;



                case 'text-zoom-in':
                    if(typeof SplitType !== "undefined"){
                        document.fonts.ready.then(()=>{
                            target.addClass('eel-text-zoom-in');
                            const split = new SplitType(target[0], { types: 'chars' });
                            stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                            scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                            startPos = $wrap.data('scroll-start') || 'top 70%';
                            endPos   = $wrap.data('scroll-end') || 'top 10%';
                            easeChars = $wrap.data('fill-ease-chars') || 'back.out(1.7)'; 
                            gsap.from(split.chars, {
                                scale: 0,
                                opacity: 0,
                                duration: scrub,
                                ease: easeChars,
                                stagger: stagger,
                                scrollTrigger: {
                                    trigger: $wrap[0],
                                    start: startPos,
                                    end: endPos,
                                    scrub: true
                                }
                            });
                        });
                    }
                break;                
                

                case 'split-words':
                    splitTextNodes(target,'words');
                    if(target.find('.easy-split-word').length){
                        stagger  = parseFloat($wrap.data('fill-stagger')) || 0.5;                        
                        scrub    = parseFloat($wrap.data('fill-scrub')) || 0.6;
                        startPos = $wrap.data('scroll-start') || 'top 70%';
                        endPos   = $wrap.data('scroll-end') || 'top 10%';
                        easeChars = $wrap.data('fill-ease-chars') || 'power4';
                        gsap.from(target.find('.easy-split-word'), {
                            y:50, opacity:0, stagger:stagger, duration:scrub,
                            scrollTrigger:{trigger:$wrap[0], start:startPos, end:endPos, ease:easeChars}
                        });
                    }
                    break;

                case 'typewriter':                    
                    var t = target.text(); target.text('');
                    scrub    = parseFloat($wrap.data('fill-scrub')) || 1.7;
                    stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                    startPos = $wrap.data('scroll-start') || 'top 70%';
                    endPos   = $wrap.data('scroll-end') || 'top 10%';
                    gsap.to({length:0},{length:t.length,duration:scrub,ease:"none",
                        scrollTrigger:{trigger:$wrap[0], start:startPos, end:endPos},
                        onUpdate:function(){ target.text(t.substr(0, Math.floor(this.targets()[0].length))); }
                    });
                    break;

                case 'text-bounce':
                    easeChars = $wrap.data('fill-ease-chars') || 'bounce.out'; 

                    scrub    = parseFloat($wrap.data('fill-scrub')) || 1.7;
                    stagger  = parseFloat($wrap.data('fill-stagger')) || 0.04;                        
                    startPos = $wrap.data('scroll-start') || 'top 70%';
                    endPos   = $wrap.data('scroll-end') || 'top 10%';

                    gsap.from(target,{y:20, opacity:0, ease:easeChars, duration:scrub,
                        scrollTrigger:{trigger:$wrap[0], start:startPos, end:endPos}});
                    break;

                case "split-lines": {
                    const runSplitLines = () => {
                        let lines;

                        if (elementorFrontend && elementorFrontend.isEditMode()) {
                            lines = splitLinesFallback(target); 
                        } else {
                            lines = new SplitText(target, {
                                type: "lines,words",
                                wordsClass: "split-words",
                                linesClass: "split-lines",
                                charsClass: "split-chars",
                            }).lines; 
                        }

                        const stagger  = parseFloat($wrap.data('fill-stagger')) || 0.4;                        
                        const scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                        const startPos = $wrap.data('scroll-start') || 'top 70%';
                        const endPos   = $wrap.data('scroll-end') || 'top 10%';
                        const ease = $wrap.data('fill-ease-chars') || 'power4';

                        gsap.from(lines, {
                            y: 60,
                            opacity: 0,
                            stagger: stagger,                   
                            duration: scrub,                      
                            ease: ease,                          
                            scrollTrigger: {
                                trigger: $wrap[0] || target[0],  
                                start: startPos,                 
                                end: endPos,                
                            },
                        });
                    };

                    // wait for fonts to load before calling SplitText
                    if (document.fonts && document.fonts.ready) {
                        document.fonts.ready.then(runSplitLines);
                    } else {
                        runSplitLines();
                    }
                }
                break;

                case "split-lines-left": {
                    let lines;
                    document.fonts.ready.then(() => {                       
                        if (elementorFrontend && elementorFrontend.isEditMode()) {
                            lines = splitLinesFallback(target);
                        }                        
                        else if (typeof SplitText !== "undefined") {
                            const element = target[0];
                            if (element.split) {
                                try { element.split.revert(); } catch (e) {}
                            }
                            element.split = new SplitText(element, {
                                type: "lines,words",
                                linesClass: "split-lines",
                                wordsClass: "split-words",
                                charsClass: "split-chars",
                            });
                            lines = element.split.lines;
                        } 
                        else {
                            lines = splitLinesFallback(target);
                        }
                        const stagger  = parseFloat($wrap.data('fill-stagger')) || 0.4;                        
                        const scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                        const startPos = $wrap.data('scroll-start') || 'top 70%';
                        const endPos   = $wrap.data('scroll-end') || 'top 10%';
                        const ease = $wrap.data('fill-ease-chars') || 'power4';
                        gsap.from(lines, {
                            x: 80,
                            opacity: 0,
                            duration: scrub,
                            stagger: stagger,
                            ease: ease,
                            scrollTrigger: {
                                trigger: target[0], 
                                start: startPos,
                                end: endPos,
                            },
                        });
                    });
                }
                break;

                // split-lines-up
                case "split-lines-up":
                {
                    let lines;
                    const stagger  = parseFloat($wrap.data('fill-stagger')) || 0.4;                        
                    const scrub    = parseFloat($wrap.data('fill-scrub')) || 0.7;
                    const startPos = $wrap.data('scroll-start') || 'top 70%';
                    const endPos   = $wrap.data('scroll-end') || 'top 10%';
                    const ease = $wrap.data('fill-ease-chars') || 'power4';
                    if (elementorFrontend && elementorFrontend.isEditMode()) {
                    lines = splitLinesFallback(target);
                    } else {
                        lines = new SplitText(target, {
                            type: "lines,words",
                            wordsClass: "split-words",
                            linesClass: "split-lines",
                            charsClass: "split-chars",
                        }).lines; // frontend
                    }

                    gsap.from(lines, {
                    y: -40,
                    opacity: 0,
                    stagger: stagger,
                    duration: scrub,
                    ease: ease,
                    scrollTrigger: { trigger: $wrap[0], start: startPos, end: endPos },
                    });
                }
                break;
            }
        });
    };


    // =================================
    // DOM Content Loaded Global Animations
    // =================================
    document.addEventListener('DOMContentLoaded', function(){
        // Horizontal text scroll
        gsap.utils.toArray('.eel-hr-scroll-text').forEach(text=>{
            let dir=text.dataset.parallaxDirection||"left";
            let percent=text.dataset.parallaxPercent||36;
            let startX = dir==="left"? percent+"%" : "-"+percent+"%";
            gsap.set(text,{x:startX});
            gsap.to(text,{x:"0%", ease:"none", scrollTrigger:{trigger:text,start:"top bottom",end:"bottom top",scrub:0.5}});
        });


        // Image width animation
        gsap.utils.toArray('.eel-hr-scroll-image-size').forEach(img=>{
            gsap.set(img,{width:"0%",margin:"0 auto",display:"block"});
            gsap.to(img,{width:"100%", ease:"none", scrollTrigger:{trigger:img,start:"top 80%",end:"top 30%",scrub:0.5}});
        });

        // Custom cursor
        if(document.querySelector(".eel-cursor") && document.querySelector(".eel-cursor2")){
            let cursor = document.querySelector(".eel-cursor");
            let cursor2 = document.querySelector(".eel-cursor2");
            let mouseX=0, mouseY=0;
            let cursorScale = document.querySelectorAll(".e-e-title, a");

            gsap.to({},0.016,{repeat:-1,onRepeat:()=>{
                gsap.set(cursor,{css:{left:mouseX,top:mouseY}});
                gsap.to(cursor2,{duration:0.3,css:{left:mouseX,top:mouseY}});
            }});

            window.addEventListener("mousemove", e=>{ mouseX=e.clientX; mouseY=e.clientY; });

            cursorScale.forEach(el=>{
                el.addEventListener("mouseenter", ()=>{
                    cursor.classList.add("eel-grow");
                    if(el.classList.contains("ee-small")){ cursor.classList.remove("eel-grow"); cursor.classList.add("eel-grow-small"); }
                });
                el.addEventListener("mouseleave", ()=>{
                    cursor.classList.remove("eel-grow");
                    cursor.classList.remove("eel-grow-small");
                });
            });
        }
    });

    // =================================
    // Elementor Hook
    // =================================
    $(window).on('elementor/frontend/init', function(){
        // Run on widgets
        elementorFrontend.hooks.addAction('frontend/element_ready/widget', easyel_runAnimations);
        // Run on sections
        elementorFrontend.hooks.addAction('frontend/element_ready/section', easyel_runAnimations);
        // Run on columns
        elementorFrontend.hooks.addAction('frontend/element_ready/column', easyel_runAnimations);
    });


    function initEasyelCursorHover($scope){
        var cursor = $scope.find(".easyel-cursor-hover")[0];
        var projects = $scope.find(".easyel-cursor-hover-list");
        if(!cursor || !projects.length) return;
        if(cursor._eelCursorInit) return;
        cursor._eelCursorInit = true;

        // out of the widget wrapper, Elementor's wrapper-scoped CSS no longer matches,
        // so the controlled properties are snapshotted inline before moving.
        var cursorStyle = window.getComputedStyle(cursor);
        [
            "width", "height",
            "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
            "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
            "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
            "border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius",
            "box-shadow"
        ].forEach(function(prop){
            cursor.style.setProperty(prop, cursorStyle.getPropertyValue(prop));
        });
        document.body.appendChild(cursor);

        gsap.set(cursor, {scale: 0.1, autoAlpha: 0, transformOrigin: "top left", position: "fixed", top:0, left:0, xPercent:0, yPercent:0});

        let mouseX = 0, mouseY = 0;
        let posX = 0, posY = 0;

        window.addEventListener("mousemove", e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        gsap.ticker.add(() => {
            posX += (mouseX - posX) * 0.9;
            posY += (mouseY - posY) * 0.9;
            gsap.set(cursor, {x: posX + 20, y: posY + 20});
        });

        projects.each(function(){
            const project = this;
            const image = project.dataset.image;

            project.addEventListener("mouseenter", ()=>{
                cursor.style.backgroundImage = `url(${image})`;
                cursor.style.backgroundSize = "cover";
                cursor.style.backgroundPosition = "center";
                gsap.to(cursor, { scale:1, autoAlpha:1, duration:0.3, ease:"power3.out" });
            });

            project.addEventListener("mouseleave", ()=>{
                gsap.to(cursor, { scale:0.1, autoAlpha:0, duration:0.3, ease:"power3.out" });
            });
        });
    }

    // Elementor frontend init
    $(window).on('elementor/frontend/init', function(){
        elementorFrontend.hooks.addAction('frontend/element_ready/widget', initEasyelCursorHover);
        elementorFrontend.hooks.addAction('frontend/element_ready/section', initEasyelCursorHover);
    });


    // =================================
    // Image Scale on Scroll (.eel-scale-img-from-to)
    // on the frontend, and re-runs when a widget is edited.
    // =================================
    function eelInitScaleImgFromTo($scope){
        var $els = $scope.find('.eel-scale-img-from-to');
        if($scope.hasClass('eel-scale-img-from-to')) $els = $els.add($scope);
        if(!$els.length) return;

        var vw = window.innerWidth;

        $els.each(function(){
            var wrap = this;
            var img = wrap.querySelector('img');
            if(!img) return;

            // Clip the scaled image so the zoom stays inside the box (works in
            // the editor too, where the PHP inline style is not applied).
            wrap.style.overflow = 'hidden';

            // Kill any previous trigger so editing the widget doesn't stack tweens.
            if(wrap._eelScaleST){ wrap._eelScaleST.kill(); wrap._eelScaleST = null; }

            var value1 = parseFloat(wrap.getAttribute('data-value-1'));
            var value2 = parseFloat(wrap.getAttribute('data-value-2'));
            if(isNaN(value1)) value1 = 1;
            if(isNaN(value2)) value2 = 1.5;
            if(vw < 1200) value1 = Math.max(0.95, value1);

            var tween = gsap.fromTo(img,
                { scale: value1, transformOrigin: 'center center' },
                {
                    scale: value2,
                    transformOrigin: 'center center',
                    scrollTrigger: {
                        // Start scaling the moment the image enters the viewport
                        // from the bottom, finishing as it leaves the top.
                        trigger: wrap,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                        // Recompute start/end on refresh so a mid-page reload
                        // (restored scroll position / late layout) stays correct.
                        invalidateOnRefresh: true
                    }
                }
            );
            wrap._eelScaleST = tween.scrollTrigger;

            // Recalculate once a lazy-loaded image reports its real size.
            if(!img.complete){
                img.addEventListener('load', function(){ ScrollTrigger.refresh(); });
            }
        });

        ScrollTrigger.refresh();
    }

    $(window).on('elementor/frontend/init', function(){
        var scaleHooks = [
            'frontend/element_ready/widget',
            'frontend/element_ready/section',
            'frontend/element_ready/column',
            'frontend/element_ready/container'
        ];
        scaleHooks.forEach(function(hook){
            elementorFrontend.hooks.addAction(hook, function($scope){
                // Small delay so the editor finishes laying out the widget
                // before ScrollTrigger measures it.
                setTimeout(function(){ eelInitScaleImgFromTo($scope); }, 100);
            });
        });
    });

    // =================================
    // Advance Image scroll animations (.eel-img-advance-wrap)
    // Vertical / Horizontal scroll and Small→Big / Big→Small zoom.
    // Hooked into Elementor's element_ready so it runs on the frontend and
    // initializes in the editor.
    // =================================
    function eelInitAdvanceImageScroll($scope){
        var $wraps = $scope.find('.eel-img-advance-wrap');
        if($scope.hasClass('eel-img-advance-wrap')) $wraps = $wraps.add($scope);
        if(!$wraps.length) return;

        $wraps.each(function(){
            var wrap = this;
            var img  = wrap.querySelector('img');

            // Don't stack a second trigger if this runs again on the same node.
            if(wrap._eelScrollST){ wrap._eelScrollST.kill(); wrap._eelScrollST = null; }

            if(wrap.classList.contains('eel-vertical-scroll-img')){
                gsap.set(wrap, { y: 0 });
                wrap._eelScrollST = gsap.to(wrap, {
                    y: wrap.dataset.verticalPos || '20%', ease: 'none',
                    scrollTrigger: { trigger: wrap, scrub: 0.6 }
                }).scrollTrigger;

            } else if(wrap.classList.contains('eel-horizontal-scroll-img')){
                var raw  = wrap.dataset.horizontalPos || '20%';
                var mag  = Math.abs(parseFloat(raw)) || 0;
                var unit = raw.toString().replace(/[-0-9.]/g, '') || '%';
                gsap.set(wrap, { x: 0 });
                wrap._eelScrollST = gsap.to(wrap, {
                    x: (wrap.dataset.horizontalDir === 'left' ? -mag : mag) + unit, ease: 'none',
                    scrollTrigger: { trigger: wrap, scrub: 0.6 }
                }).scrollTrigger;

            } else if(img && wrap.classList.contains('eel-scroll-zoom-type-out')){
                gsap.set(img, { width: (parseFloat(wrap.dataset.zoomStartWidth) || 70) + '%', margin: '0 auto' });
                wrap._eelScrollST = gsap.to(img, {
                    width: (parseFloat(wrap.dataset.zoomWidth) || 100) + '%', ease: 'none',
                    scrollTrigger: { trigger: img, start: wrap.dataset.zoomStart || 'top 80%', end: wrap.dataset.zoomEnd || 'top 30%', scrub: 0.5 }
                }).scrollTrigger;

            } else if(img && wrap.classList.contains('eel-scroll-zoom-type-in')){
                gsap.set(img, { width: '100%', margin: '0 auto' });
                wrap._eelScrollST = gsap.to(img, {
                    width: (parseFloat(wrap.dataset.zoomWidth) || 90) + '%', ease: 'none',
                    scrollTrigger: { trigger: img, start: wrap.dataset.zoomStart || 'top 80%', end: wrap.dataset.zoomEnd || 'top 30%', scrub: 0.5 }
                }).scrollTrigger;
            }
        });

        // One recalculation so triggers measure correctly when the widget is
        // injected after the initial page load (e.g. in the editor).
        ScrollTrigger.refresh();
    }

    $(window).on('elementor/frontend/init', function(){
        elementorFrontend.hooks.addAction('frontend/element_ready/widget', eelInitAdvanceImageScroll);
    });

    // After the full page load, recompute every ScrollTrigger position. This
    // fixes mid-page reloads where the browser restores the scroll offset (and
    // lazy content above shifts the layout) after the triggers were created.
    $(window).on('load', function(){
        ScrollTrigger.refresh();
        setTimeout(function(){ ScrollTrigger.refresh(); }, 350);
    });


})(jQuery);

// mouse move parallax js
(function($){
    "use strict";

    function getAllParallaxContainers($scope) {
        let $containers = $scope.find('.eel-mouse-move-paralax-yes');
        if($scope.hasClass('eel-mouse-move-paralax-yes')) {
            $containers = $containers.add($scope);
        }

        const isEditor = typeof elementorFrontend !== "undefined" && elementorFrontend.isEditMode && elementorFrontend.isEditMode();

        if (isEditor && $containers.length === 0) {
            const $iframe = $('#elementor-preview-iframe');
            if ($iframe.length) {
                const iframeDoc = $iframe[0].contentDocument || $iframe[0].contentWindow.document;
                $containers = $(iframeDoc).find('.eel-mouse-move-paralax-yes');
            }
        }

        return $containers;
    }

    function initParallaxHover($scope) {
        const $containers = getAllParallaxContainers($scope);

        $containers.each(function(){
            const $container = $(this);
            if($container.data('eelParallaxInit')) return;
            $container.data('eelParallaxInit', true);

            if(window.getComputedStyle($container[0]).position === 'static'){
                $container.css('position', 'relative');
            }

            let rect = $container[0].getBoundingClientRect();
            let mouseX = 0, mouseY = 0;
            let frameScheduled = false;

            function applyMove(){
                frameScheduled = false;
                if(!$container.data('hoverActive')) return;
                const $images = $container.find('img');
                $images.each(function(){
                    const $img = $(this);
                    let depth = parseFloat($img.attr('data-depth')) || 0.15;
                    const parentDepth = parseFloat($container.attr('data-parallax-depth'));
                    if(!isNaN(parentDepth)) depth = parentDepth;

                    const factorX = (mouseX - rect.width/2)/rect.width;
                    const factorY = (mouseY - rect.height/2)/rect.height;

                    const moveX = factorX * (-100) * depth;
                    const moveY = factorY * (-100) * depth;

                    gsap.to($img[0], {
                        x: moveX,
                        y: moveY,
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: "auto",
                        force3D: true
                    });
                });
            }

            $container
                .on('mouseenter.eelParallax', () => $container.data('hoverActive', true))
                .on('mouseleave.eelParallax', () => $container.data('hoverActive', false))
                .on('mousemove.eelParallax touchmove.eelParallax', function(e){
                    if(!$container.data('hoverActive')) return;

                    let clientX, clientY;
                    if(e.type.indexOf('touch') === 0){
                        const t = e.originalEvent && e.originalEvent.touches ? e.originalEvent.touches[0] : null;
                        if(!t) return;
                        clientX = t.clientX;
                        clientY = t.clientY;
                    } else {
                        clientX = e.clientX;
                        clientY = e.clientY;
                    }

                    rect = $container[0].getBoundingClientRect();
                    mouseX = clientX - rect.left;
                    mouseY = clientY - rect.top;

                    if(!frameScheduled){
                        frameScheduled = true;
                        requestAnimationFrame(applyMove);
                    }
                });

            $(window).on('resize.eelParallax', () => {
                rect = $container[0].getBoundingClientRect();
            });
        });
    }

    $(window).on('elementor/frontend/init', function(){
        const hooks = [
            'frontend/element_ready/global',
            'frontend/element_ready/container',
            'frontend/element_ready/section',
            'frontend/element_ready/widget',
            'frontend/element_ready/column'
        ];
        hooks.forEach(hook => {
            elementorFrontend.hooks.addAction(hook, $scope => {
                setTimeout(() => initParallaxHover($scope), 100);
            });
        });

        setTimeout(() => initParallaxHover($(document)), 300);
    });

})(jQuery);

// mouse move parallax js

(function($){
    "use strict";

    function initMouseMoveAttributeSync(){
        const observer = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation){
                // Detect added nodes
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(function(node){
                        if (!(node instanceof HTMLElement)) return;

                        if (node.classList && node.classList.contains("eel-mouse-move-paralax-yes")) {
                            copyChildHoverAttributesMouseMove(node);
                        }

                        node.querySelectorAll && node.querySelectorAll(".eel-mouse-move-paralax-yes").forEach(function(inner){
                            copyChildHoverAttributesMouseMove(inner);
                        });
                    });
                }

                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const el = mutation.target;
                    if (el.classList.contains("eel-mouse-move-paralax-yes")) {
                        copyChildHoverAttributesMouseMove(el);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    function copyChildHoverAttributesMouseMove(parent){
        const inner = parent.querySelector(".eel-mouse-move-paralax-yes.container, .eel-mouse-move-paralax-yes.section, .eel-mouse-move-paralax-yes.widget");
        if(!inner) return;

        const attrs = [
            "data-parallax-strength",
            "data-parallax-depth",
        ];

        attrs.forEach(attr => {
            if (inner.hasAttribute(attr)) {
                parent.setAttribute(attr, inner.getAttribute(attr));
            }
        });
    }

    $(document).ready(function(){
        initMouseMoveAttributeSync();
    });

    $(window).on("elementor/frontend/init", function(){
        initMouseMoveAttributeSync();
    });

})(jQuery);


(function($){
    "use strict";

    function initTypewriter($scope) {
        var $typewriterWrap = $scope.find('.eel-typewriter-wrap');

        if (!$typewriterWrap.length) return;

        $typewriterWrap.each(function() {
            var $this = $(this);
            var wordsData = $this.data('words');
            var speed = $this.data('speed') || 0.1;
            var delay = $this.data('delay') || 1;
            var variant = ($this.data('variant') || 'classic').toString();
            
            if (!wordsData) return;
            
            var words = wordsData.split(',');
            var textClass = $this.find('.typewriter-text');
            var cursor = $this.find('.cursor');

            if (!textClass.length || !cursor.length) return;

            // Clear any existing animations
            gsap.killTweensOf([textClass, cursor]);

            // Cursor blink animation
            gsap.to(cursor, {
                opacity: 0,
                duration: 0.5,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut"
            });

            // Smooth typewriter with GSAP timeline
            var currentWordIndex = 0;
            var timeline = gsap.timeline({ repeat: -1 });

            function buildWordSequence(word){
                word = word.trim();
                var lengthProxy = { i: 0 };

                if (variant === 'fade') {
                    // Fade out current, switch text, fade in
                    timeline.to(textClass, { autoAlpha: 0, duration: 0.15, ease: "power2.out" });
                    timeline.call(function(){ textClass.text(word); });
                    timeline.to(textClass, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
                    timeline.to({}, { duration: delay });
                } else if (variant === 'slide') {
                    // Slide bottom -> center (in), then center -> top (out)
                    timeline.to(textClass, { yPercent: -60, autoAlpha: 0, duration: 0.25, ease: "power2.in" });
                    timeline.call(function(){ textClass.text(word); });
                    timeline.fromTo(textClass, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" });
                    timeline.to({}, { duration: delay });
                } else if (variant === 'instant_clear') {
                    // Type only, then instantly clear before next word
                    timeline.to(lengthProxy, {
                        i: word.length,
                        duration: Math.max(0.01, word.length * speed),
                        ease: "none",
                        onUpdate: function(){
                            var n = Math.round(lengthProxy.i);
                            textClass.text(word.substring(0, n));
                        }
                    });
                    timeline.to({}, { duration: delay });
                    timeline.call(function(){ textClass.text(''); });
                } else {
                    // classic: type, hold, delete
                    timeline.to(lengthProxy, {
                        i: word.length,
                        duration: Math.max(0.01, word.length * speed),
                        ease: "none",
                        onUpdate: function(){
                            var n = Math.round(lengthProxy.i);
                            textClass.text(word.substring(0, n));
                        }
                    });
                    timeline.to({}, { duration: delay });
                    timeline.to(lengthProxy, {
                        i: 0,
                        duration: Math.max(0.01, (word.length * speed) / 2),
                        ease: "none",
                        onUpdate: function(){
                            var n = Math.round(lengthProxy.i);
                            textClass.text(word.substring(0, n));
                        }
                    });
                }
            }

            // build full loop
            words.forEach(function(w){ buildWordSequence(w); });
        });
    }

    // Initialize on document ready
    $(document).ready(function() {
        initTypewriter($(document));
    });

    // Initialize on Elementor frontend
    $(window).on('elementor/frontend/init', function(){
        if (typeof elementorFrontend !== 'undefined') {
            elementorFrontend.hooks.addAction('frontend/element_ready/eel-typewriter.default', initTypewriter);
        }
    });

})(jQuery);


// mouse move cursor hover
(function($){
    "use strict";

    let cursorFollower = null;
    let hoverSpan = null; 
    let followerRAF = null;
    let mouseX = 0, mouseY = 0;
    let setXFollower = null, setYFollower = null;

    /** ---------- Cursor Follower Create ---------- **/
    function createCursorFollower(){
        if(cursorFollower && document.body.contains(cursorFollower)) return cursorFollower;

        $('body').find('.eel-hover-cursor-follower').remove();
        const $cursor = $('<span class="eel-hover-cursor eel-hover-cursor-follower"></span>');
        $('body').append($cursor);
        cursorFollower = $cursor[0];

        gsap.set(cursorFollower, {
            position:'fixed', top:0, left:0, x:0, y:0,
            xPercent:-50, yPercent:-50, zIndex:999,
            pointerEvents:'none', opacity:1, force3D:true
        });

        setXFollower = gsap.quickTo(cursorFollower, "x", {duration:0.15, ease:"power2.out"});
        setYFollower = gsap.quickTo(cursorFollower, "y", {duration:0.15, ease:"power2.out"});

        $(document).off('mousemove.eelFollower').on('mousemove.eelFollower', function(e){
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        if(followerRAF) cancelAnimationFrame(followerRAF);
        const updateFollower = () => {
            if(setXFollower && setYFollower) {
                setXFollower(mouseX);
                setYFollower(mouseY);
            }
            followerRAF = requestAnimationFrame(updateFollower);
        };
        followerRAF = requestAnimationFrame(updateFollower);
        return cursorFollower;
    }

    /** ---------- Create or reuse single hover span ---------- **/
    function createHoverSpan(){
        // remove extra spans if any
        $('body').find('.eel-hover-cursor.eel-cursor-hover').not(hoverSpan).remove();

        if(hoverSpan && document.body.contains(hoverSpan)) return hoverSpan;

        const $span = $('<span class="eel-hover-cursor eel-cursor-hover"></span>');
        $('body').append($span);
        hoverSpan = $span[0];

        gsap.set(hoverSpan, {
            position:'fixed', 
            top:0, 
            left:0, 
            x:0, 
            y:0, 
            xPercent:-50, 
            yPercent:-50,
            zIndex:999, 
            pointerEvents:'none', 
            opacity:0, 
            scale:0,
            width: '120px',
            height: '120px',
            borderRadius:'100%', 
            fontSize:'13px', 
            transformOrigin:'center center'
        });

        return hoverSpan;
    }


    /** ---------- Update hover span ---------- **/
    function updateHoverSpan($el){
        if(!hoverSpan || !$el || !$el.length) return;

        if(!$el.hasClass('eel-mouse-hover-preview-yes')){
            gsap.to(hoverSpan, {scale:0, opacity:0, duration:0.2, ease:"sine.in"});
            return;
        }

        const text = $el.attr('data-hover-text') || '';
        const bg = $el.attr('data-hover-bg') || '#000';
        const color = $el.attr('data-hover-color') || '#fff';

        const width = $el.attr('data-cursor-width') || '120px';
        const height = $el.attr('data-cursor-height') || '120px';
        const borderradius = $el.attr('data-cursor-borderradius') || '100%';


        hoverSpan.innerHTML = text;
        hoverSpan.style.backgroundColor = bg;
        hoverSpan.style.color = color;

        hoverSpan.style.width = width;
        hoverSpan.style.height = height;
        hoverSpan.style.borderRadius = borderradius;
    }


    /** ---------- Init hover per element ---------- **/
    function initCursorHover($scope){
        if(!$scope || !$scope.length) return;

        createCursorFollower();
        createHoverSpan();

        const selectors = '.eel-mouse-hover-preview-yes, .eel-cursor-hover, [class*="eel-cursor-hover"]';
        let $targets = $scope.find(selectors);
        if($scope.is(selectors)) $targets = $targets.add($scope);

        $targets.each(function(){
            const $el = $(this);

            if($el.data('hoverInit')) return; 
            $el.data('hoverInit', true);

            const namespace = 'eelHover_' + Date.now();
            $el.data('hoverNamespace', namespace);

            const setX = gsap.quickTo(hoverSpan, "x", {duration:0.15, ease:"power2.out"});
            const setY = gsap.quickTo(hoverSpan, "y", {duration:0.15, ease:"power2.out"});

            // observe attribute changes
            const observer = new MutationObserver(() => {
                if($el.is(':hover')){
                    updateHoverSpan($el);
                }
            });

            observer.observe($el[0], { attributes: true, attributeFilter: ['data-hover-text','data-hover-bg','data-hover-color','data-cursor-width','data-cursor-height','data-cursor-borderradius'] });

            $el.on('mouseenter.'+namespace, function(){
                updateHoverSpan($el);
                gsap.to(hoverSpan, {scale:1, opacity:1, duration:0.25, ease:"sine.out"});
            });

            $el.on('mouseleave.'+namespace, function(){
                gsap.to(hoverSpan, {scale:0, opacity:0, duration:0.25, ease:"sine.in"});
            });

            $el.on('mousemove.' + namespace, function(e) {
                const rect = $el[0].getBoundingClientRect();

                let x = e.clientX || (e.touches && e.touches[0].clientX);
                let y = e.clientY || (e.touches && e.touches[0].clientY);

                x = Math.max(rect.left, Math.min(x, rect.right));
                y = Math.max(rect.top, Math.min(y, rect.bottom));

                const spanHalfWidth = hoverSpan.offsetWidth / 2;
                const spanHalfHeight = hoverSpan.offsetHeight / 2;

                const hoverX = Math.max(rect.left + spanHalfWidth, Math.min(x, rect.right - spanHalfWidth));
                const hoverY = Math.max(rect.top + spanHalfHeight, Math.min(y, rect.bottom - spanHalfHeight));

                setX(hoverX);
                setY(hoverY);

                updateHoverSpan($el);
            });

        });
    }

    // Expose function
    window.easyelInitCursorHover = initCursorHover;

    $(document).ready(function(){
        initCursorHover($(document));
    });

    // Elementor hooks
    $(window).on('elementor/frontend/init', function(){
        const hooks = [
            'frontend/element_ready/global',
            'frontend/element_ready/container',
            'frontend/element_ready/section',
            'frontend/element_ready/widget',
            'frontend/element_ready/column'
        ];
        hooks.forEach(function(hook){
            elementorFrontend.hooks.addAction(hook, function($scope){
                setTimeout(function(){
                    initCursorHover($scope);
                }, 100);
            });
        });

        if(elementorFrontend.isEditMode && elementorFrontend.isEditMode()){
            createCursorFollower();
            createHoverSpan();
        }
    });


    /** ---------- Cleanup if no hover elements exist ---------- **/
    function monitorHoverElements() {
        const cleanup = () => {
            const hasHoverElements = document.querySelector('.eel-mouse-hover-preview-yes');
            const hoverSpanEl = document.querySelector('.eel-hover-cursor.eel-cursor-hover');
            const followerEl = document.querySelector('.eel-hover-cursor-follower');

            if (!hasHoverElements) {
                if (hoverSpanEl && hoverSpanEl.parentNode) hoverSpanEl.parentNode.removeChild(hoverSpanEl);
                if (followerEl && followerEl.parentNode) followerEl.parentNode.removeChild(followerEl);

                // Stop the per-frame RAF loop so it doesn't compete with Lenis
                // smooth scroll for frame budget when no hover elements exist.
                if (followerRAF) {
                    cancelAnimationFrame(followerRAF);
                    followerRAF = null;
                }

                hoverSpan = null;
                cursorFollower = null;
            }
        };

        const observer = new MutationObserver(() => {
            cleanup();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        cleanup();
    }

    $(document).ready(function() {
        monitorHoverElements();
    });

    $(window).on('elementor/frontend/init', function(){
        monitorHoverElements();
    });

})(jQuery);


(function($){
    "use strict";

    function initHoverAttributeSync(){
        const observer = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation){
                // Detect added nodes
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(function(node){
                        if (!(node instanceof HTMLElement)) return;

                        if (node.classList && node.classList.contains("eel-mouse-hover-preview-yes")) {
                            copyChildHoverAttributes(node);
                        }

                        node.querySelectorAll && node.querySelectorAll(".eel-mouse-hover-preview-yes").forEach(function(inner){
                            copyChildHoverAttributes(inner);
                        });
                    });
                }

                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const el = mutation.target;
                    if (el.classList.contains("eel-mouse-hover-preview-yes")) {
                        copyChildHoverAttributes(el);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    function copyChildHoverAttributes(parent){
        const inner = parent.querySelector(".eel-mouse-hover-preview-yes.container, .eel-mouse-hover-preview-yes.section, .eel-mouse-hover-preview-yes.widget");
        if(!inner) return;

        const attrs = [
            "data-hover-text",
            "data-hover-bg",
            "data-hover-color",
            "data-cursor-width",
            "data-cursor-height",
            "data-cursor-borderradius"
        ];

        attrs.forEach(attr => {
            if (inner.hasAttribute(attr)) {
                parent.setAttribute(attr, inner.getAttribute(attr));
            }
        });
    }

    $(document).ready(function(){
        initHoverAttributeSync();
    });

    $(window).on("elementor/frontend/init", function(){
        initHoverAttributeSync();
    });

})(jQuery);

// scroll trigger js animation

(function($){
    "use strict";
    // Elementor frontend hook
    $(window).on('elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction('frontend/element_ready/eel-hr-image-scroll.default', function($scope, $){
            // GSAP plugin register
            gsap.registerPlugin(ScrollTrigger);
            // Save original styles
            ScrollTrigger.saveStyles(".eel-gsap-marq-first, .eel-gsap-marq-second, .eel-gsap-marq-container");
            // MatchMedia
            ScrollTrigger.matchMedia({
                "(max-width: 768px)": function() {
                    let eelGsapMarqMobileTL = gsap.timeline({
                        scrollTrigger: {
                            trigger: $scope.find(".eel-gsap-marq-wrapper")[0],
                            start: "-100% bottom",
                            scrub: 1,
                        }
                    });
                    eelGsapMarqMobileTL
                        .to($scope.find(".eel-gsap-marq-first")[0], { xPercent: -100 })
                        .to($scope.find(".eel-gsap-marq-second")[0], { xPercent: 100 }, "<");
                },
                "(min-width: 769px)": function() {
                    let eelGsapMarqDesktopTL = gsap.timeline({
                        scrollTrigger: {
                            trigger: $scope.find(".eel-gsap-marq-wrapper")[0],
                            start: "-300% bottom",
                            scrub: 2,
                        }
                    });
                    eelGsapMarqDesktopTL
                    .to($scope.find(".eel-gsap-marq-first")[0], { xPercent: -100 })
                    .to($scope.find(".eel-gsap-marq-second")[0], { xPercent: 80 }, "<");
                }
            });
        });
    });
})(jQuery);





(function($){
    "use strict";
    $(window).on('elementor/frontend/init', function() {
        elementorFrontend.hooks.addAction('frontend/element_ready/eel-content-scroll.default', function($scope, $){
            gsap.registerPlugin(ScrollTrigger);
            const $wrapper = $scope.find(".eel-gsap-marksc-scrolling-text");
            const $railItems = $scope.find(".eel-gsap-marksc-rail div.eel-gsap-marksc-rails-item");
            if (!$wrapper.length || !$railItems.length) return;
            ScrollTrigger.getAll().forEach(st => {
                if(st.trigger && $wrapper[0].contains(st.trigger)) st.kill();
            });
            const tl = horizontalLoop($railItems, { repeat: -1, paused: false });
            
            // Start the animation
            tl.play();
            
            let speedTween;
            let lastTargetScale = null;

            ScrollTrigger.create({
                trigger: $wrapper[0],
                start: "top bottom",
                end: "bottom top",
                onUpdate: self => {
                    const velocity = self.getVelocity();
                    const direction = Math.sign(velocity);
                    let targetScale;

                    if (direction === 0) {
                        targetScale = 1;
                    } else {
                        const magnitude = gsap.utils.clamp(0.5, 3, Math.abs(velocity) / 500);
                        targetScale = magnitude * direction;
                    }

                    // Skip recreating tween if target barely changed — prevents tween spam per frame
                    if (lastTargetScale !== null && Math.abs(targetScale - lastTargetScale) < 0.1) return;
                    lastTargetScale = targetScale;

                    if (speedTween) speedTween.kill();
                    speedTween = gsap.to(tl, {
                        timeScale: targetScale,
                        duration: 0.2,
                        ease: "power1.out"
                    });
                },
                onEnter: () => {
                    tl.play();
                },
                onEnterBack: () => {
                    tl.play();
                },
                onLeave: () => {
                    // Reset to normal speed when out of view
                    if (speedTween) speedTween.kill();
                    lastTargetScale = null;
                    gsap.to(tl, {
                        timeScale: 1,
                        duration: 0.3,
                        ease: "power1.out"
                    });
                },
                onLeaveBack: () => {
                    // Reset to normal speed when out of view
                    if (speedTween) speedTween.kill();
                    lastTargetScale = null;
                    gsap.to(tl, {
                        timeScale: 1,
                        duration: 0.3,
                        ease: "power1.out"
                    });
                }
            });
            function horizontalLoop(items, config){
                items = gsap.utils.toArray(items);
                config = config || {};
                
                // Get parent container and set it to relative positioning
                const parent = items[0].parentNode;
                gsap.set(parent, { position: "relative" });
                
                // Remove any margins/padding and set items positioning
                gsap.set(items, {
                    marginLeft: 0,
                    marginRight: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    position: "absolute",
                    left: 0,
                    top: 0
                });
                
                // Force reflow to get accurate measurements
                items[0].offsetHeight;

                // Set parent min-height based on tallest item
                let maxHeight = 0;
                items.forEach(item => {
                    const rect = item.getBoundingClientRect();
                    if (rect.height > maxHeight) {
                        maxHeight = rect.height;
                    }
                });
                if (maxHeight) {
                    gsap.set(parent, {
                        minHeight: maxHeight,
                        height: maxHeight
                    });
                }
                
                // Calculate total width and set sequential positions with no gaps
                let totalWidth = 0;
                let positions = [];
                
                items.forEach((item, i) => {
                    let rect = item.getBoundingClientRect();
                    let w = rect.width;
                    positions.push(totalWidth);
                    totalWidth += w;
                });
                
                // Set initial positions sequentially (each item immediately after the previous one)
                gsap.set(items, {
                    x: (i) => positions[i],
                    xPercent: 0,
                    y: 0,
                    yPercent: 0
                });
                
                // Duplicate items for seamless loop
                let clones = [];
                items.forEach((item, i) => {
                    let clone = item.cloneNode(true);
                    gsap.set(clone, {
                        marginLeft: 0,
                        marginRight: 0,
                        marginTop: 0,
                        marginBottom: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                        position: "absolute",
                        left: 0,
                        top: 0
                    });
                    parent.appendChild(clone);
                    gsap.set(clone, {
                        x: positions[i] + totalWidth,
                        xPercent: 0,
                        y: 0,
                        yPercent: 0
                    });
                    clones.push(clone);
                });
                
                // Combine original items and clones
                let allItems = items.concat(clones);
                
                // Create timeline that moves all items together as one group
                let tl = gsap.timeline({repeat: config.repeat, paused: config.paused, defaults:{ease:"none", autoRound:true}});
                tl.to(allItems, {
                    x: `-=${totalWidth}`,
                    duration: 30,
                    ease: "none",
                    autoRound: true
                }, 0);
                
                // Start from the middle so content appears centered on load
                tl.progress(0.5);
                
                return tl;
            }
        });
    });
})(jQuery);




(function($){
    "use strict";

    $(window).on('elementor/frontend/init', function() {

        elementorFrontend.hooks.addAction('frontend/element_ready/eel-hr-image-scroll.default', function($scope, $){

            gsap.registerPlugin(ScrollTrigger);

            let horizontalScrollInstances = [];

            function killHorizontalScroll() {
                horizontalScrollInstances.forEach(instance => {
                    if(instance && instance.kill) instance.kill();
                });
                horizontalScrollInstances = [];

                gsap.utils.toArray('.eel-scroll-image').forEach(section => {
                    if(section._skewTimeout) clearTimeout(section._skewTimeout);
                });
            }

            function initHorizontalScroll() {

                // MatchMedia for desktop/mobile
                ScrollTrigger.matchMedia({

                    "(min-width: 768px)": function() {
                        killHorizontalScroll();

                        gsap.utils.toArray($scope.find('.eel-scroll-image')).forEach(section => {
                            const images = section.querySelectorAll('.per-item');
                            if(images.length === 0) return;

                            // calculate total width
                            let totalWidth = 0;
                            images.forEach(img => {
                                const style = getComputedStyle(img);
                                const marginRight = parseFloat(style.marginRight) || 0;
                                totalWidth += img.offsetWidth + marginRight;
                            });

                            section.style.width = totalWidth + "px";
                            section.style.height = "auto";

                            const parent = section.parentElement;
                            if(!parent) return;

                            const scrollDistance = totalWidth - parent.offsetWidth;
                            if(scrollDistance <= 0) return;

                            const calculateScrollDistance = () => {
                                return Array.from(images).reduce((sum, img) => {
                                    const style = getComputedStyle(img);
                                    const marginRight = parseFloat(style.marginRight) || 0;
                                    return sum + img.offsetWidth + marginRight;
                                }, 0) - parent.offsetWidth;
                            };

                            const animation = gsap.to(section, {
                                x: () => {
                                    const dist = calculateScrollDistance();
                                    return dist > 0 ? `-${dist}px` : 0;
                                },
                                ease: "none",
                                scrollTrigger: {
                                    trigger: parent,
                                    start: "center center",
                                    end: () => {
                                        const dist = calculateScrollDistance();
                                        return dist > 0 ? `+=${dist}` : "+=1";
                                    },
                                    pin: true,
                                    pinType: "transform",
                                    scrub: 1.8,
                                    anticipatePin: 1,
                                    invalidateOnRefresh: true,
                                    pinSpacing: true,
                                    onRefresh: self => {
                                        if(self.pin && section) {
                                            const sectionHeight = section.offsetHeight;
                                            if(sectionHeight > 0) self.pin.style.height = sectionHeight + "px";
                                        }
                                    }
                                }
                            });

                            if(animation.scrollTrigger) horizontalScrollInstances.push(animation.scrollTrigger);
                        });

                        ScrollTrigger.refresh();
                    },

                    "(max-width: 767px)": function() {
                        killHorizontalScroll();
                        gsap.utils.toArray($scope.find('.eel-scroll-image')).forEach(section => {
                            section.style.width = "100%";
                            section.style.transform = "none";
                        });
                    }

                });

            }

            // Init scroll when editor or frontend
            initHorizontalScroll();

            // Reinit after Elementor editor changes
            if(elementorFrontend.isEditMode()) {
                elementor.channels.editor.on('section:activated', initHorizontalScroll);
                elementor.channels.editor.on('panel:open', initHorizontalScroll);
            }

        });

    });

})(jQuery);



(function($){
    "use strict";

    let activeTriggers = []; 

    function initScrollTrigger() {
        const isEditor = typeof elementorFrontend !== "undefined" 
                         && elementorFrontend.isEditMode 
                         && elementorFrontend.isEditMode();

        function clearTriggers() {
            activeTriggers.forEach(st => {
                if (st && st.kill) st.kill(); 
            });
            activeTriggers = [];
        }

        function applyZoomEffect() {
            clearTriggers(); 

            // Zoom Out
            gsap.utils.toArray('.eel-scroll-zoom-type-out').forEach(div => {
                const zoomWidth = div.dataset.zoomWidth || 90;
                const start     = div.dataset.zoomStart || "top 80%";
                const end       = div.dataset.zoomEnd   || "top 30%";

                gsap.set(div, { width: zoomWidth + "%", margin: "0 auto" });
                const st = gsap.to(div, {
                    width: "100%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: div,
                        start: start,
                        end: end,
                        scrub: 0.5
                    }
                });
                activeTriggers.push(st.scrollTrigger);
            });

            // Zoom In
            gsap.utils.toArray('.eel-scroll-zoom-type-in').forEach(div => {
                const zoomWidth = div.dataset.zoomWidth || 90;
                const start     = div.dataset.zoomStart || "top 80%";
                const end       = div.dataset.zoomEnd   || "top 30%";

                gsap.set(div, { width: "100%", margin: "0 auto" });
                const st = gsap.to(div, {
                    width: zoomWidth + "%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: div,
                        start: start,
                        end: end,
                        scrub: 0.5
                    }
                });
                activeTriggers.push(st.scrollTrigger);
            });
        }

        if (isEditor) {
           
            elementorFrontend.hooks.addAction('frontend/element_ready/global', function($scope){
                applyZoomEffect();
            });

            const observer = new MutationObserver(() => {
                applyZoomEffect();
            });
            observer.observe(document.body, { childList: true, subtree: true });

        } else {
          
            $(window).on('load', function(){
                applyZoomEffect();
            });
        }
    }

    $(document).ready(function(){
        initScrollTrigger();
    });

})(jQuery);



(function($){
    "use strict";

    function initScrollTriggerAttributeSync(){
        const observer = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation){
              
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(function(node){
                        if (!(node instanceof HTMLElement)) return;

                        if (node.classList && hasScrollTriggerClass(node)) {
                            copyChildScrolltrigger(node);
                        }

                        node.querySelectorAll && node.querySelectorAll(".eel-scroll-zoom-type-in, .eel-scroll-zoom-type-out").forEach(function(inner){
                            copyChildScrolltrigger(inner);
                        });
                    });
                }

                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const el = mutation.target;
                    if (hasScrollTriggerClass(el)) {
                        copyChildScrolltrigger(el);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    function hasScrollTriggerClass(el){
        return el.classList.contains("eel-scroll-zoom-type-in") || el.classList.contains("eel-scroll-zoom-type-out");
    }

    function copyChildScrolltrigger(parent){
        const inner = parent.querySelector(".eel-scroll-zoom-type-in.container, .eel-scroll-zoom-type-out.container, .eel-scroll-zoom-type-in.section, .eel-scroll-zoom-type-out.section, .eel-scroll-zoom-type-in.widget, .eel-scroll-zoom-type-out.widget");
        if(!inner) return;

        const attrs = [
            "data-zoom-type",
            "data-zoom-width",
            "data-zoom-start",
            "data-zoom-end",
        ];

        attrs.forEach(attr => {
            if (inner.hasAttribute(attr)) {
                parent.setAttribute(attr, inner.getAttribute(attr));
            }
        });
    }

    $(document).ready(function(){
        initScrollTriggerAttributeSync();
    });

    $(window).on("elementor/frontend/init", function(){
        initScrollTriggerAttributeSync();
    });

})(jQuery);


// background parallax

(function($){
    "use strict";

    let activeTriggers = [];
    let activeTickers = [];

    function initParallaxBG() {
        const isEditor = typeof elementorFrontend !== "undefined"
                        && elementorFrontend.isEditMode
                        && elementorFrontend.isEditMode();

        function clearTriggers() {
            activeTriggers.forEach(st => {
                if (st && st.kill) st.kill();
            });
            activeTriggers = [];
            activeTickers.forEach(fn => {
                if (fn) gsap.ticker.remove(fn);
            });
            activeTickers = [];
        }

        function applyParallaxEffect($scope) {
            clearTriggers();

            const sections = gsap.utils.toArray(".eel-parallax-bg-yes", $scope[0] || document );

         
            if (!sections.length) return;

            sections.forEach( section => {
                 let size = section.dataset.parallaxSize || "180%";
                section.style.backgroundSize = size;

              

                section.style.backgroundSize = size;

                let y = { value: 0 },
                    smooth = { value: 0 };

                let scroller = null;
                if (isEditor) {
                    const iframe = document.querySelector('.elementor-preview-iframe');
                    if (iframe && iframe.contentWindow) {
                        scroller = iframe.contentWindow.document.querySelector('#elementor-preview')
                                || iframe.contentWindow.document.querySelector('.elementor-edit-area')
                                || iframe.contentWindow;
                    }
                }

                let lastPos = null;
                const tickerFn = () => {
                    smooth.value += (y.value - smooth.value) * 0.12;
                    const rounded = Math.round(smooth.value);
                    if (rounded === lastPos) return;
                    lastPos = rounded;
                    section.style.backgroundPosition = `center ${rounded}px`;
                };

                // Gate the ticker on visibility — only burn frame budget while
                // the section is actually on screen. Saves significant cost on
                // pages with multiple parallax backgrounds + Lenis smooth scroll.
                let tickerActive = false;
                const startTicker = () => {
                    if ( ! tickerActive ) {
                        gsap.ticker.add( tickerFn );
                        tickerActive = true;
                    }
                };
                const stopTicker = () => {
                    if ( tickerActive ) {
                        gsap.ticker.remove( tickerFn );
                        tickerActive = false;
                    }
                };

                const st = ScrollTrigger.create({
                    trigger: section,
                    scroller: scroller || window,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 0.6,
                    onUpdate: self => y.value = -self.progress * 80,
                    onEnter: startTicker,
                    onEnterBack: startTicker,
                    onLeave: stopTicker,
                    onLeaveBack: stopTicker
                });

                // Track for cleanup in clearTriggers(). The tickerFn reference
                // is what gsap.ticker.remove() needs — keep it findable.
                activeTickers.push(tickerFn);
                activeTriggers.push(st);
            });
        }

        if (isEditor) {
            elementorFrontend.hooks.addAction('frontend/element_ready/global', function($scope){
                applyParallaxEffect($scope);
            });

            const observer = new MutationObserver(() => {
                applyParallaxEffect($(document));
            });
            observer.observe(document.body, { childList: true, subtree: true });

        } else {
           
            $(window).on('load', function(){
                applyParallaxEffect($(document));
            });
        }
    }

    $(document).ready(function(){
        initParallaxBG();
    });

})(jQuery);


(function($){
    "use strict";

    function ParallaxAttributeSync(){
        const observer = new MutationObserver(function(mutations){
            mutations.forEach(function(mutation){
              
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(function(node){
                        if (!(node instanceof HTMLElement)) return;

                        if (node.classList && hasScrollTriggerClass(node)) {
                            copyChildScrolltrigger(node);
                        }

                        node.querySelectorAll && node.querySelectorAll(".eel-parallax-bg-yes").forEach(function(inner){
                            copyChildScrolltrigger(inner);
                        });
                    });
                }

                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const el = mutation.target;
                    if (hasScrollTriggerClass(el)) {
                        copyChildScrolltrigger(el);
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    }

    function hasScrollTriggerClass(el){
        return el.classList.contains("eel-parallax-bg-yes");
    }

    function copyChildScrolltrigger(parent){
        const inner = parent.querySelector(".eel-parallax-bg-yes");
        if(!inner) return;

        const attrs = [
            "data-parallax-size",
        ];

        attrs.forEach(attr => {
            if (inner.hasAttribute(attr)) {
                parent.setAttribute(attr, inner.getAttribute(attr));
            }
        });
    }

    $(document).ready(function(){
        ParallaxAttributeSync();
    });

    $(window).on("elementor/frontend/init", function(){
        ParallaxAttributeSync();
    });

    
    jQuery(window).on('elementor/frontend/init', function() {
    // List of widget names to target
    const widgets = ['eel-animated-text.default', 'eel-animated-title.default'];

    widgets.forEach(function(widgetName) {
        elementorFrontend.hooks.addAction('frontend/element_ready/' + widgetName, function($scope, $) {
            const target = $scope.find('.text-3d-effect');
            if (!target.length) return;

            // Read data attributes safely
            const direction = target.data('text-3d-direction') || 'top';
            const duration  = parseFloat(target.data('text-3d-duration')) || 3;
            const scrub     = parseFloat(target.data('text-3d-scrub')) || 1.5;
            const startPos  = target.data('scroll-start') || 'top 85%';
            const endPos    = target.data('scroll-end') || 'top 15%';

            // Add class
            target.addClass('eel-text-3d-effect');

            // Wrap inner text if not already wrapped
            if (!target.find('.eel-3d-line').length) {
                target.wrapInner('<div class="eel-3d-line"></div>');
            }

            const wrapper = target.find('.eel-3d-line');

            // Set 3D perspective
            target.css({
                perspective: '1200px',
                transformStyle: 'preserve-3d'
            });

            // Set initial vars based on direction
            let fromVars = {
                opacity: 0,
                transformOrigin: "center center",
                rotationX: 0,
                rotationY: 0,
                x: 0,
                y: 0
            };

            switch (direction) {
                case 'bottom':
                    fromVars.rotationX = 70;
                    fromVars.y = -60;
                    break;
                case 'left':
                    fromVars.rotationY = -70;
                    fromVars.x = 60;
                    break;
                case 'right':
                    fromVars.rotationY = 70;
                    fromVars.x = -60;
                    break;
                case 'top':
                default:
                    fromVars.rotationX = -70;
                    fromVars.y = 60;
                    break;
            }

            // Set initial state
            gsap.set(wrapper, fromVars);

            // Animate to final state
            gsap.to(wrapper, {
                opacity: 1,
                rotationX: 0,
                rotationY: 0,
                x: 0,
                y: 0,
                duration: duration,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: target[0],
                    start: startPos,
                    end: endPos,
                    scrub: scrub
                }
            });
        });
    });
});



// Bounce Animation

jQuery(window).on('elementor/frontend/init', function () {
    function runBounce($scope) {
        if (typeof gsap === 'undefined') return;

        // Find all bounce elements inside scope OR scope itself
        const elements = $scope.find('.easy-bounce-yes').add($scope.filter('.easy-bounce-yes'));

        if (!elements.length) return;

        const isEditor = elementorFrontend.isEditMode();

        elements.each(function () {
            const el = this;
            const $el = jQuery(el);

            const dropDistance = parseFloat($el.data('distance')) || 300;
            const dropDuration = parseFloat($el.data('duration')) || 1.2;

            if (!dropDistance || !dropDuration) return;

            let tlConfig = {};
            if (!isEditor && typeof ScrollTrigger !== 'undefined') {
                tlConfig.scrollTrigger = {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none none"
                };
            }

            const tl = gsap.timeline(tlConfig);
            tl.fromTo(el, { y: -dropDistance, opacity: 0 }, { y: 0, opacity: 1, duration: dropDuration, ease: "power3.in" });

            // Bounce anim
            const bounces = [
                { height: dropDistance / 4, dur: 0.6 },
                { height: dropDistance / 8, dur: 0.5 },
                { height: dropDistance / 16, dur: 0.4 }
            ];
            bounces.forEach(b => {
                tl.to(el, { y: -b.height, duration: b.dur / 2, ease: "power1.out" });
                tl.to(el, { y: 0, duration: b.dur / 2, ease: "power2.in" });
            });

            // Editor handling
            if (isEditor) {
                tl.pause();
                const observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            tl.play();
                            obs.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                observer.observe(el);
            }
        });
    }
    elementorFrontend.hooks.addAction('frontend/element_ready/global', runBounce);
    elementorFrontend.hooks.addAction('editor/element_ready/global', runBounce);
});


jQuery(window).on('elementor/frontend/init', function () {
    function initFlipScroll($scope) {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        const containers = $scope.find('.eel-flip-img-scroll').add($scope.filter('.eel-flip-img-scroll'));
        if (!containers.length) return;
        const isEditor = elementorFrontend.isEditMode();
        containers.each(function () {
            const container = this;
            const img = container.querySelector('img');
            if (!img) return;
            const rotateX = parseFloat(container.dataset.flipRotateX) || 30;
            let tlConfig = { ease: "none" };
            if (!isEditor) {
                tlConfig.scrollTrigger = {
                    trigger: container,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                };
            }
            gsap.fromTo(img, { rotateX: -10 }, { rotateX: rotateX, ...tlConfig });
            // ---- Editor Mode ----
            if (isEditor) {
                const observer = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            gsap.to(img, { rotateX: rotateX, duration: 1 });
                            obs.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                observer.observe(container);
            }
        });
    }

    // Attach to your specific widget
    elementorFrontend.hooks.addAction(
        'frontend/element_ready/eel-advance-image.default',
        initFlipScroll
    );

    elementorFrontend.hooks.addAction(
        'editor/element_ready/eel-advance-image.default',
        initFlipScroll
    );
});

})(jQuery);


(function ($) {
    let lenis = null;
    $(window).on('elementor/frontend/init', function () {
        if (typeof SmoothScrollSettings === 'undefined' || SmoothScrollSettings.enable_smooth_scroller != 1) return;
        if (SmoothScrollSettings.disableMobile && window.innerWidth < 768) return;
        if (typeof Lenis === 'undefined' || lenis) return;

        const isEditor = typeof elementorFrontend !== 'undefined' && elementorFrontend.isEditMode();
        if (isEditor && SmoothScrollSettings.disableEditorMode != 1) return;

        // On a mid-page reload the browser restores the scroll offset before
        // Lenis can sync to it, which leaves ScrollTrigger animations stuck at
        // the wrong position. Disable native scroll restoration so the page
        // always starts at the top and Lenis + every trigger stay in sync.
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        function init() {
            if (lenis) return;

            // Make sure we begin at the very top before Lenis reads the scroll
            // (skip when the URL targets an anchor so #links still work).
            if (!window.location.hash) {
                window.scrollTo(0, 0);
            }

            var lenisOptions = {
                wheelMultiplier: 1.4,
                prevent: function (node) {
                    return node.closest(
                        '.easy-elements-toc__body, .betterdocs-articles-list, .easyel-compare-popup-front, .easyel-search-result-list, .eel-mini-cart-content, .sidebar-on-mobile-single-nav, .sidebar-on-mobile-mega-nav, .sidebar-on-mobile, [data-lenis-prevent]'
                    );
                },
            };

            // Apply the saved "Speed" option as Lenis easing duration (seconds).
            // Higher value = slower, smoother scrolling. Falls back to Lenis'
            // default smoothing when the option is unset/zero.
            var smoothSpeed = parseFloat(SmoothScrollSettings.smooth);
            if (!isNaN(smoothSpeed) && smoothSpeed > 0) {
                lenisOptions.duration = smoothSpeed;
            }

            lenis = new Lenis(lenisOptions);

            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                lenis.on('scroll', ScrollTrigger.update);
                gsap.ticker.add((time) => {
                    lenis.raf(time * 1000);
                });
                // Prevent GSAP from compensating after tab switch / inactivity
                // — without this, ScrollTrigger animations "jump" to catch up
                // when the user returns, which feels broken with smooth scroll.
                gsap.ticker.lagSmoothing(0);
                // Recalculate all ScrollTrigger positions now that Lenis is
                // driving the scroll — without this, triggers may fire at
                // wrong scroll positions on big sections.
                ScrollTrigger.refresh();
            } else {
                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);
            }
            window.lenis = lenis;
        }

        if (document.readyState === 'complete') {
            requestAnimationFrame(init);
        } else {
            window.addEventListener('load', () => requestAnimationFrame(init));
        }
    });
})(jQuery);