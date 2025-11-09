// On-screen mobile debugging console
// Only load on mobile devices
if (/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)) {
  // Load Eruda from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.min.js';
  script.onload = function() {
    eruda.init({
      // Auto show console on errors
      autoScale: true,
      defaults: {
        displaySize: 50,
        transparency: 0.9
      }
    });
    console.log('📱 Mobile Debug Console Loaded - Check bottom right corner');
  };
  document.head.appendChild(script);
}
