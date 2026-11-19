(function($){
    "use strict";

    // Run after the DOM is ready so it works even when a server optimizer defers / moves the script,
    // while the popup markup lives in the footer. Without this the .each() could run before the markup.
    $(function(){

    // Handle EVERY popup on the page independently, each scoped to its own overlay/box + settings.
    $('.easyel-popup-box-overlay').each(function(){

    var $overlay = $(this);
    var settings = $overlay.data('popupbuildersettings');
    if(!settings) return;

    // Match the box to this overlay by the shared scoped id ( "easyel-popup-<id>-overlay" → "-box" ).
    var overlayId = $overlay.attr('id') || '';
    var $popup = $('#' + overlayId.replace(/-overlay$/, '-box'));
    if(!$popup.length) return;

    var $closeBtn = $popup.find('.easyel-popup-box-close');

    var popupId = settings.eapb_popup_template_id || overlayId || 'default';
    var storagePrefix = 'easyel_popup_' + popupId + '_';
    var popupOpened = false;

    /* -------------------------
    STORAGE HELPERS
    --------------------------*/

    function getStorage(key, fallback){
        try {
            var val = localStorage.getItem(storagePrefix + key);
            return val !== null ? val : fallback;
        } catch(e){ return fallback; }
    }

    function setStorage(key, val){
        try { localStorage.setItem(storagePrefix + key, val); } catch(e){}
    }

    function getSession(key, fallback){
        try {
            var val = sessionStorage.getItem(storagePrefix + key);
            return val !== null ? val : fallback;
        } catch(e){ return fallback; }
    }

    function setSession(key, val){
        try { sessionStorage.setItem(storagePrefix + key, val); } catch(e){}
    }

    /* -------------------------
    PAGE VIEW TRACKING
    --------------------------*/

    var pageViews = parseInt(getStorage('page_views', 0)) + 1;
    setStorage('page_views', pageViews);

    /* -------------------------
    SESSION TRACKING
    --------------------------*/

    if(!getSession('session_active', '')){
        setSession('session_active', '1');
        var sessions = parseInt(getStorage('sessions', 0)) + 1;
        setStorage('sessions', sessions);
    }
    var totalSessions = parseInt(getStorage('sessions', 0));

    /* -------------------------
    DEVICE DETECTION
    --------------------------*/

    function getDeviceType(){
        var width = window.innerWidth;
        if(width <= 767) return 'mobile';
        if(width <= 1024) return 'tablet';
        if(width <= 1280) return 'tablet_extra';
        if(width <= 1440) return 'laptop';
        return 'desktop';
    }

    function deviceAllowed(){
        if(settings.easyel_devices_enable != '1') return true;
        if(!settings.easyel_devices || !settings.easyel_devices.length) return true;
        return settings.easyel_devices.includes(getDeviceType());
    }

    /* -------------------------
    BROWSER DETECTION
    --------------------------*/

    function getBrowserName(){
        var ua = navigator.userAgent;
        if(ua.indexOf('Edg') > -1) return 'edge';
        if(ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'ie';
        if(ua.indexOf('Chrome') > -1) return 'chrome';
        if(ua.indexOf('Safari') > -1) return 'safari';
        if(ua.indexOf('Firefox') > -1) return 'firefox';
        return 'unknown';
    }

    function browserAllowed(){
        if(settings.easyel_browsers_enable != '1') return true;
        if(!settings.easyel_browser_type || settings.easyel_browser_type === 'all') return true;
        if(!settings.easyel_browsers || !settings.easyel_browsers.length) return true;
        return settings.easyel_browsers.includes(getBrowserName());
    }

    /* -------------------------
    SCHEDULE CHECK
    --------------------------*/

    function scheduleAllowed(){
       
        if( settings.easyel_schedule_enable != '1' ) return true;

        var now;

        if(settings.easyel_timezone === 'visitor'){
            now = new Date();
        } else {
            now = new Date(
                new Date().toLocaleString('en-US', { timeZone: settings.easyel_site_timezone || Intl.DateTimeFormat().resolvedOptions().timeZone })
            );
        }

        if(settings.easyel_start_time){
            var start = new Date(settings.easyel_start_time);
            if(now < start) return false;
        }

        if(settings.easyel_end_time){
            var end = new Date(settings.easyel_end_time);
            if(now > end) return false;
        }

        return true;
    }

    /* -------------------------
    SHOW TIMES CHECK
    --------------------------*/

    function showTimesAllowed(){
        if(settings.easyel_show_times_enable != '1') return true;

        var maxTimes = parseInt(settings.easyel_show_times) || 0;
        if(!maxTimes) return true;

        var period = settings.easyel_times_period || 'persisting';
        var shownCount = 0;

        if(period === 'session'){
            shownCount = parseInt(getSession('show_count')) || 0;
        } else if(period === 'persisting'){
            shownCount = parseInt(getStorage('show_count')) || 0;
        } else {
            let data = {};
            try {
                data = JSON.parse(getStorage('show_period_data')) || {};
            } catch(e) {
                data = {};
            }
            var now = new Date();
            var periodStart;

            if(period === 'day'){
                periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            } else if(period === 'week'){
                var day = now.getDay();
                var diff = now.getDate() - day + (day === 0 ? -6 : 1);
                periodStart = new Date(now.getFullYear(), now.getMonth(), diff).getTime();
            } else if(period === 'month'){
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            }

            if(data.period_start && data.period_start >= periodStart){
                shownCount = parseInt(data.count || 0);
            }
        }

        return shownCount < maxTimes;
    }

    function trackShowTime(event){
        if(settings.easyel_show_times_enable != '1') return;

        var countOn = settings.easyel_times_count || 'open';
        if(countOn !== event) return;

        var period = settings.easyel_times_period || 'persisting';

        if(period === 'session'){
            var c = parseInt(getSession('show_count', 0));
            setSession('show_count', c + 1);
        } else if(period === 'persisting'){
            var c2 = parseInt(getStorage('show_count', 0));
            setStorage('show_count', c2 + 1);
        } else {
            var data = JSON.parse(getStorage('show_period_data', '{}'));
            var now = new Date();
            var periodStart;

            if(period === 'day'){
                periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            } else if(period === 'week'){
                var day = now.getDay();
                var diff = now.getDate() - day + (day === 0 ? -6 : 1);
                periodStart = new Date(now.getFullYear(), now.getMonth(), diff).getTime();
            } else if(period === 'month'){
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
            }

            if(!data.period_start || data.period_start < periodStart){
                data = { period_start: periodStart, count: 0 };
            }

            data.count = (parseInt(data.count) || 0) + 1;
            setStorage('show_period_data', JSON.stringify(data));
        }
    }

    /* -------------------------
    ADBLOCK DETECTION
    --------------------------*/

    function detectAdBlock(callback){
        var testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox ad-placement ad-banner textads banner-ads';
        testAd.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;';
        document.body.appendChild(testAd);

        setTimeout(function(){
            var blocked = testAd.offsetHeight === 0 || testAd.clientHeight === 0;
            document.body.removeChild(testAd);
            callback(blocked);
        }, 100);
    }

    /* -------------------------
    POPUP OPEN / CLOSE
    --------------------------*/

    function openPopup(){
        if(popupOpened) return;
        if(!deviceAllowed()) return;
        if(!browserAllowed()) return;
        if(!scheduleAllowed()) return;
        if(!showTimesAllowed()) return;

        // Avoid Multiple Popups
        if(settings.eapby_avoid_multiple_popups_enable == '1'){
            if(getSession('popup_shown', '')) return;
            setSession('popup_shown', '1');
        }

        popupOpened = true;

        // Force display inline ( bulletproof against class-based display:none in jQuery 3.x ) and drop
        // the initial -hidden classes from the markup.
        $popup.css('display', 'block')
            .removeClass('easyel-popup-box-hide easyel-popup-box-hidden')
            .addClass('easyel-popup-box-show');

        $overlay.css('display', 'block')
            .removeClass('easyel-popup-box-overlay-hide easyel-popup-box-overlay-hidden')
            .addClass('easyel-popup-box-overlay-show');

        // Transparent overlay when prevent overlay close is enabled
        if(settings.eapby_prevent_overlay_close_enable == '1'){
            $overlay.css('background', 'transparent');
        }

        trackShowTime('open');

        // Disable Page Scrolling
        if(settings.eapby_disable_page_scroll_enable == '1' ){
            $('html, body').css('overflow', 'hidden');
            $('html, body').css('max-height', '100vh');
        }

        // Automatically Close Popup After X seconds
        if(settings.eapby_automatically_after){
            var autoClose = parseFloat(settings.eapby_automatically_after) || 0;
            if(autoClose > 0){
                setTimeout(function(){
                    closePopup();
                }, autoClose * 1000);
            }
        }

        // Accessible Navigation (Keyboard Tab)
        if(settings.eapby_accessible_navigation_enable == '1'){
            trapFocus();
        }
    }

    // Stop any playing media inside the popup so it does not keep playing after the popup is closed.
    // ( Hiding the box does not stop an iframe / <video>; HTML5 media is paused and iframes are reloaded
    // by re-setting their src, which stops YouTube / Vimeo / self-hosted embeds. )
    function stopMedia(){
        $popup.find('video, audio').each(function(){
            try { this.pause(); this.currentTime = 0; } catch(e){}
        });
        $popup.find('iframe').each(function(){
            var src = this.getAttribute('src');
            if ( src ){ this.setAttribute('src', src); }
        });
    }

    function closePopup(){
        popupOpened = false;

        $popup.removeClass('easyel-popup-box-show')
            .addClass('easyel-popup-box-hide');

        $overlay.removeClass('easyel-popup-box-overlay-show');

        trackShowTime('close');
        stopMedia();

        // Restore Page Scrolling
        if(settings.eapby_disable_page_scroll_enable == '1'){
            $('body').css('overflow', '');
        }

        setTimeout(function(){
            $popup.hide().removeClass('easyel-popup-box-hide');
            $overlay.hide();
        }, 300);
    }

    function forceClosePopup(){
        popupOpened = false;

        $popup.hide().removeClass('easyel-popup-box-show easyel-popup-box-hide');
        $overlay.hide().removeClass('easyel-popup-box-overlay-show');

        stopMedia();

        if(settings.eapby_disable_page_scroll_enable == '1'){
            $('body').css('overflow', '');
        }
    }

    // Accessible Navigation - Trap focus inside popup
    function trapFocus(){
        var focusableSelectors = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
        var $focusable = $popup.find(focusableSelectors).filter(':visible');
        if(!$focusable.length) return;

        $focusable.first().focus();

        $popup.on('keydown.easyelTrapFocus', function(e){
            if(e.key !== 'Tab') return;

            var $current = $popup.find(focusableSelectors).filter(':visible');
            var $first = $current.first();
            var $last = $current.last();

            if(e.shiftKey){
                if(document.activeElement === $first[0]){
                    e.preventDefault();
                    $last.focus();
                }
            } else {
                if(document.activeElement === $last[0]){
                    e.preventDefault();
                    $first.focus();
                }
            }
        });
    }

    // Prevent Closing on Overlay
    $overlay.on('click', closePopup);
    

    if($closeBtn.length){
        $closeBtn.on('click', closePopup);
    }

    // Prevent Closing on ESC Key
    if(settings.eapby_prevent_esc_close_enable != '1'){
        $(document).on('keyup.easyelPopupEsc', function(e){
            if(e.key === 'Escape' && popupOpened){
                closePopup();
            }
        });
    }

    /* -------------------------
    DEVICE LIVE CHANGE CHECK
    --------------------------*/

    function watchDeviceChange(){
        var breakpoints = [
            { mq: window.matchMedia("(max-width: 767px)") },
            { mq: window.matchMedia("(min-width: 768px) and (max-width: 1024px)") },
            { mq: window.matchMedia("(min-width: 1025px) and (max-width: 1280px)") },
            { mq: window.matchMedia("(min-width: 1281px) and (max-width: 1440px)") },
            { mq: window.matchMedia("(min-width: 1441px)") }
        ];

        breakpoints.forEach(function(bp){
            bp.mq.addEventListener("change", function(){
                if(!deviceAllowed()){
                    forceClosePopup();
                }
            });
        });
    }

    watchDeviceChange();

    /* -------------------------
    OPEN BY SELECTOR
    Bound before the gate returns so a manual click always opens this popup, and with a per-popup
    namespace ( + off first ) so each popup opens only itself and never binds twice ( no double open ).
    --------------------------*/
    if( settings.eapb_open_by_selector ){
        var eapbSelectors = settings.eapb_open_by_selector;
        var eapbSelectorNs = 'click.eapbSelector_' + popupId;
        $(document).off(eapbSelectorNs).on(eapbSelectorNs, eapbSelectors, function(e){
            e.preventDefault();
            openPopup();
        });
    }

    /* -------------------------
    GATE CONDITIONS (early return)
    --------------------------*/

    // URL condition
    if(settings.easyel_specific_url_enable == '1' && settings.easyel_specific_url){
        var urls = settings.easyel_specific_url.split(',');
        var match = urls.some(function(url){
            url = url.trim();
            if(settings.easyel_specific_url_action === 'contains'){
                return window.location.href.indexOf(url) !== -1;
            }
            return window.location.href === url;
        });
        if(!match) return;
    }

    // Arriving from specific URL (Referrer) condition
    if(settings.easyel_arriving_url_enable == '1' && settings.easyel_arriving_url){
        var referrer = document.referrer || '';
        var arrivingAction = settings.easyel_arriving_url_action || 'show';
        var arrivingUrls = settings.easyel_arriving_url.split(',');
        var referrerMatch = arrivingUrls.some(function(url){
            url = url.trim();
            if(arrivingAction === 'regex'){
                try {
                    var re = new RegExp(url);
                    return re.test(referrer);
                } catch(e){
                    return false;
                }
            }
            return referrer.indexOf(url) !== -1;
        });
        if(arrivingAction === 'show' && !referrerMatch) return;
        if(arrivingAction === 'hide' && referrerMatch) return;
        if(arrivingAction === 'regex' && !referrerMatch) return;
    }

    // Arriving from sources condition
    if(settings.easyel_arriving_sources_enable == '1' && settings.easyel_arriving_sources && settings.easyel_arriving_sources.length > 0){
        var referrer = document.referrer || '';

        var currentHost = window.location.hostname;
        var sources = settings.easyel_arriving_sources;

        var searchEngines = ['google.', 'bing.com', 'yahoo.com', 'duckduckgo.com', 'baidu.com', 'yandex.', 'ask.com', 'ecosia.org', 'startpage.com'];
        var socialNetworks = ['facebook.com', 'fb.com', 'twitter.com', 'x.com', 'instagram.com', 'linkedin.com', 'pinterest.com', 'reddit.com', 'tiktok.com', 'youtube.com', 'tumblr.com', 't.co'];

        var sourceType = 'unknown';
        if(!referrer){
            sourceType = 'direct';
        } else {
            try {
                var refHost = new URL(referrer).hostname;
                if(refHost === currentHost){
                    sourceType = 'internal';
                } else if(searchEngines.some(function(se){ return refHost.indexOf(se) !== -1; })){
                    sourceType = 'search_engines';
                } else if(socialNetworks.some(function(sn){ return refHost.indexOf(sn) !== -1; })){
                    sourceType = 'social';
                } else {
                    sourceType = 'external';
                }
            } catch(e){
                sourceType = 'external';
            }
        }

        if(sources.indexOf(sourceType) === -1) return;
    }

    // Page Views - "Show after X page views" means don't show until user has X views
    if(settings.easyel_page_views_enable == '1'){
        var requiredViews = parseInt(settings.easyel_page_views) || 0;
        if(requiredViews && pageViews < requiredViews) return;
    }

    // Sessions - "Show after X sessions" means don't show until user has X sessions
    if(settings.easyel_sessions_enable == '1'){
       
        var requiredSessions = parseInt(settings.easyel_sessions) || 0;
        if(requiredSessions && totalSessions < requiredSessions) return;
    }

    // Schedule gate - if outside schedule, don't set up triggers at all
    if(!scheduleAllowed()) return;

    // Show times gate - if already maxed out, don't set up triggers
    if(!showTimesAllowed()) return;

    /* -------------------------
    TRIGGERS
    --------------------------*/

    // Page Load
    if(settings.eapb_page_load_enable == '1'){
        var delay = parseFloat(settings.eapb_page_load_time) || 0.8;
        setTimeout(function(){
            openPopup();
        }, delay * 1000);
    }

    // Scroll percentage
    if(settings.eapb_scroll_enable == '1'){
        var lastScroll = $(window).scrollTop();

        $(window).on('scroll.easyelPopup', function(){
            var percent = parseInt(settings.eapb_scroll_percent) || 50;
            var direction = settings.eapb_scroll_direction || 'down';
            var scrollTop = $(window).scrollTop();
            var docHeight = $(document).height() - $(window).height();
            var scrolled = (scrollTop / docHeight) * 100;

            var isCorrectDirection =
                (direction === 'down' && scrollTop > lastScroll) ||
                (direction === 'up' && scrollTop < lastScroll);

            lastScroll = scrollTop;

            if(isCorrectDirection && scrolled >= percent){
                openPopup();
                $(window).off('scroll.easyelPopup');
            }
        });
    }

    // Scroll to element
    if(settings.eapb_scroll_selector_enable == '1' && settings.eapb_scroll_selector){
        var $target = $(settings.eapb_scroll_selector);

        if($target.length){
            $(window).on('scroll.easyelPopupSelector', function(){
                var scrollTop = $(window).scrollTop();
                var windowHeight = $(window).height();
                var elementTop = $target.offset().top;

                if(scrollTop + windowHeight >= elementTop){
                    openPopup();
                    $(window).off('scroll.easyelPopupSelector');
                }
            });
        }
    }

    // Click
    if(settings.eapb_click_enable == '1'){
        var clickCount = 0;

        $(document).on('click.easyelPopup', function(){
            clickCount++;
            if(clickCount >= parseInt(settings.eapb_click_count || 1)){
                openPopup();
                $(document).off('click.easyelPopup');
            }
        });
    }

    // Inactivity
    if(settings.eapb_inactive_enable == '1'){
        var inactiveTime = (parseInt(settings.eapb_inactive_time) || 30 ) * 1000;
        var timer;

        function resetTimer(){
            clearTimeout(timer);
            timer = setTimeout(openPopup, inactiveTime);
        }

        $(document).on('mousemove keydown scroll click', resetTimer);
        resetTimer();
    }

    // Exit Intent
    if(settings.eapb_exit_intent_enable == '1'){
        $(document).on('mouseleave.easyelPopup', function(e){
            if(e.clientY < 10){
                openPopup();
            }
        });
    }

    // AdBlock Detection
    if(settings.eapb_adblock_enable == '1'){
        var adblockDelay = (parseInt(settings.eapb_adblock_delay) || 0) * 1000;

        detectAdBlock(function(blocked){
            if(blocked){
                setTimeout(function(){
                    openPopup();
                }, adblockDelay);
            }
        });
    }

    }); // each popup on the page

    }); // DOM ready

})(jQuery);
