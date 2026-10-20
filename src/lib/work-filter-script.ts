/**
 * Applies ?filter= on /work before first paint, so a shared link never
 * flashes the whole list (the index and its chips, work-index.tsx). The
 * allow-list is the validation; anything else leaves "All".
 */
export const workFilterScript = (ids: readonly string[]) =>
  `(function(){var f=new URLSearchParams(location.search).get("filter");if(${JSON.stringify(ids)}.indexOf(f)<0)return;document.getElementById("work-index").setAttribute("data-filter",f);document.querySelectorAll("[data-chip]").forEach(function(c){c.setAttribute("aria-pressed",String(c.getAttribute("data-chip")===f))})})()`;
