(function () {
  'use strict';

  function applyMode(light) {
    document.body.classList.toggle('light-mode', light);
  }

  // Apply saved preference immediately — body is available (script is in </body>)
  var saved = localStorage.getItem('spin-theme-mode');
  if (saved === 'light') applyMode(true);

  function createToggle() {
    if (document.getElementById('spin-theme-toggle')) return;

    var btn = document.createElement('button');
    btn.id = 'spin-theme-toggle';

    function update() {
      var light = document.body.classList.contains('light-mode');
      btn.textContent = light ? 'DARK MODE' : 'LIGHT MODE';
      btn.style.color = light ? '#111' : '#fff';
      btn.style.borderColor = light ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)';
    }

    btn.style.cssText = [
      'position:fixed',
      'bottom:28px',
      'right:28px',
      'z-index:2147483647',
      'background:transparent',
      'border:1px solid',
      'border-radius:50px',
      'padding:6px 14px',
      'font-family:inherit',
      'font-size:10px',
      'font-weight:300',
      'letter-spacing:0.1em',
      'cursor:pointer',
      'opacity:0.6',
      'transition:opacity 0.2s',
      'pointer-events:auto',
    ].join(';');

    update();

    btn.addEventListener('mouseenter', function () { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', function () { btn.style.opacity = '0.6'; });

    btn.addEventListener('click', function () {
      var nowLight = !document.body.classList.contains('light-mode');
      applyMode(nowLight);
      update();
      localStorage.setItem('spin-theme-mode', nowLight ? 'light' : 'dark');
    });

    document.body.appendChild(btn);
  }

  // Delay to let React fully mount before appending the button
  setTimeout(createToggle, 1000);
})();
