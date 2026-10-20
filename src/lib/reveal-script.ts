// Inline in <head> (plain JS, about 1.3 KB), so scroll reveals work before
// hydration and with the app's JS blocked (docs/cross-device.md §2).
//
// - Adds `html.js`; the hidden start state in globals.css applies only under it.
// - A MutationObserver hands every [data-reveal] element to one
//   IntersectionObserver, as the parser or a client navigation adds it.
// - Entering view sets [data-revealed]; elements in the same batch get
//   [data-reveal-i] 0–5 for the stagger.
// - Elements first seen above the viewport (back navigation, scroll
//   restoration) reveal instantly. The observer's root reaches far above
//   the viewport, so a jump that skips past an element (End, a restored
//   scroll position) still counts as seeing it.
// - Bento micro-demos (§10.10, cross-device §3): unless the primary pointer
//   is fine and hovers (that plays them on hover), a [data-demo] tile gets
//   [data-demo-play] once it is half in view, which plays its demo once.
export const revealScript = `(function(){var h=document.documentElement;if(!("IntersectionObserver"in window))return;h.classList.add("js");var q="[data-reveal]:not([data-revealed])";var io=new IntersectionObserver(function(es){var n=0;es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;if(e.boundingClientRect.bottom<0)t.setAttribute("data-revealed","instant");else{t.setAttribute("data-reveal-i",String(Math.min(n++,5)));t.setAttribute("data-revealed","")}io.unobserve(t)})},{rootMargin:"100000px 0px -8% 0px"});var fine=matchMedia("(hover:hover) and (pointer:fine)");var dq="[data-demo]:not([data-demo-play])";var dio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.intersectionRatio<.49||fine.matches)return;e.target.setAttribute("data-demo-play","");dio.unobserve(e.target)})},{threshold:.5});function scan(r){if(r.nodeType!==1)return;[[q,io],[dq,dio]].forEach(function(p){if(r.matches(p[0]))p[1].observe(r);r.querySelectorAll(p[0]).forEach(function(e){p[1].observe(e)})})}new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(scan)})}).observe(h,{childList:true,subtree:true})})();`;
