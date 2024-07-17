(() => {
  if (typeof window === 'undefined') return;
  if (window.__ESBUILD_LR_PLUGIN__) return;
  window.__ESBUILD_LR_PLUGIN__ = 'http://127.0.0.1:53099/';
  const script = document.createElement('script');
  script.setAttribute('src', 'http://127.0.0.1:53099/livereload-event-source.js');
  script.setAttribute('type', 'module');
  document.head.appendChild(script);
})();

(() => {
  // app/javascript/application.js
  console.info("Loading: server/app/javascript/application.js (i.e. esbuild)");
})();
//# sourceMappingURL=application.js.map
