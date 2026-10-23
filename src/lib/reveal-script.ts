// Inline in <head> (plain JS, about 1 KB), so scroll reveals work before
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
// - `window.__painted` resolves after the first paint (or 5 s, or at once
//   where Paint Timing is missing). The analytics scripts and the
//   after-load module wait for it as well as for load: on a fast connection
//   load can come first, and anything fetched before the first paint counts
//   against it in Lighthouse (docs/decisions.md, Phase 8).
export const revealScript = `(function(){window.__painted=new Promise(function(r){setTimeout(r,5e3);try{if(PerformanceObserver.supportedEntryTypes.indexOf("paint")<0)return r();new PerformanceObserver(function(l,o){o.disconnect();r()}).observe({type:"paint",buffered:true})}catch(e){r()}});var h=document.documentElement;if(!("IntersectionObserver"in window))return;h.classList.add("js");var q="[data-reveal]:not([data-revealed])";var io=new IntersectionObserver(function(es){var n=0;es.forEach(function(e){if(!e.isIntersecting)return;var t=e.target;if(e.boundingClientRect.bottom<0)t.setAttribute("data-revealed","instant");else{t.setAttribute("data-reveal-i",String(Math.min(n++,5)));t.setAttribute("data-revealed","")}io.unobserve(t)})},{rootMargin:"100000px 0px -8% 0px"});function scan(r){if(r.nodeType!==1)return;if(r.matches(q))io.observe(r);r.querySelectorAll(q).forEach(function(e){io.observe(e)})}new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(scan)})}).observe(h,{childList:true,subtree:true})})();`;

declare global {
  interface Window {
    __painted: Promise<void>;
  }
}
