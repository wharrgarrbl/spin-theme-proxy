(function () {
  'use strict';

  var PALETTE = [
    { key: '--spin-bg-page',      label: 'Page BG',        def: '#080808', group: 'BACKGROUNDS' },
    { key: '--spin-bg-nav',       label: 'Nav / Header',   def: '#000000' },
    { key: '--spin-bg-section',   label: 'Section BG',     def: '#0a0a0a' },
    { key: '--spin-bg-card',      label: 'Card BG',        def: '#111111' },
    { key: '--spin-bg-secondary', label: 'Secondary BG',   def: '#1a1a1a' },
    { key: '--spin-bg-input',     label: 'Input BG',       def: '#1e1e1e' },
    { key: '--spin-bg-overlay',   label: 'Overlay BG',     def: '#212121' },
    { key: '--spin-text',         label: 'Text',           def: '#ffffff', group: 'TEXT' },
    { key: '--spin-text-muted',   label: 'Text muted',     def: '#555555' },
    { key: '--spin-text-subtle',  label: 'Text subtle',    def: '#888888' },
    { key: '--spin-accent',       label: 'Accent (Cyan)',  def: '#00FFF0', group: 'ACCENT', isAccent: true },
    { key: '--spin-accent-hover', label: 'Accent hover',   def: '#4dfff5' },
    { key: '--spin-on-accent',    label: 'On-Accent Text', def: '#000000' },
  ];

  var STORE_KEY = 'spin-palette';

  /* Map spin variables → shadcn/ui HSL tokens that also need updating */
  var TOKEN_MAP = {
    '--spin-bg-page':      ['--background', '--taltech-grey100', '--taltech-dark'],
    '--spin-bg-nav':       ['--taltech-primary', '--taltech-primary-dark', '--sidebar-background'],
    '--spin-bg-section':   ['--taltech-grey200'],
    '--spin-bg-card':      ['--card', '--popover'],
    '--spin-bg-secondary': ['--secondary', '--muted', '--border'],
    '--spin-bg-input':     ['--input'],
    '--spin-bg-overlay':   [],
    '--spin-text':         ['--foreground', '--card-foreground', '--popover-foreground', '--secondary-foreground'],
    '--spin-text-muted':   ['--muted-foreground'],
    '--spin-accent':       ['--primary', '--accent', '--ring'],
    '--spin-on-accent':    ['--primary-foreground', '--accent-foreground'],
  };

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function(c){ return c+c; }).join('');
    return parseInt(hex.slice(0,2),16) + ', ' + parseInt(hex.slice(2,4),16) + ', ' + parseInt(hex.slice(4,6),16);
  }

  /* Returns "H S% L%" string for use in hsl(var(--token)) */
  function hexToHsl(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function(c){ return c+c; }).join('');
    var r = parseInt(hex.slice(0,2),16)/255;
    var g = parseInt(hex.slice(2,4),16)/255;
    var b = parseInt(hex.slice(4,6),16)/255;
    var max = Math.max(r,g,b), min = Math.min(r,g,b);
    var h=0, s=0, l=(max+min)/2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      if (max===r) h = ((g-b)/d + (g<b?6:0))/6;
      else if (max===g) h = ((b-r)/d + 2)/6;
      else h = ((r-g)/d + 4)/6;
    }
    return Math.round(h*360) + ' ' + Math.round(s*100) + '% ' + Math.round(l*100) + '%';
  }

  function applyVar(key, value) {
    document.documentElement.style.setProperty(key, value);
    if (key === '--spin-accent') {
      try { document.documentElement.style.setProperty('--spin-accent-rgb', hexToRgb(value)); } catch(e){}
    }
    /* Mirror value to related shadcn HSL tokens */
    var hsl = hexToHsl(value);
    (TOKEN_MAP[key] || []).forEach(function(token) {
      document.documentElement.style.setProperty(token, hsl);
    });
  }

  function loadSaved() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch(e) { return {}; }
  }

  function savePalette(obj) { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); }

  function applyAll() {
    var saved = loadSaved();
    PALETTE.forEach(function(p) { applyVar(p.key, saved[p.key] || p.def); });
  }

  applyAll();

  function createPanel() {
    if (document.getElementById('spin-color-panel')) return;

    var isOpen = false;
    var saved = loadSaved();

    var panel = document.createElement('div');
    panel.id = 'spin-color-panel';
    panel.style.cssText = 'position:fixed;bottom:70px;right:24px;z-index:2147483646;font-family:inherit;font-size:11px;font-weight:300;letter-spacing:0.05em;';

    /* ── toggle chip ── */
    var chip = document.createElement('button');
    chip.textContent = '⊕ PALETTE';
    chip.style.cssText = 'display:block;margin-left:auto;background:transparent;border:1px solid rgba(0,255,240,0.4);border-radius:50px;padding:5px 13px;color:#00FFF0;font-family:inherit;font-size:10px;font-weight:300;letter-spacing:0.1em;cursor:pointer;opacity:0.65;transition:opacity 0.2s;';
    chip.addEventListener('mouseenter', function(){ chip.style.opacity='1'; });
    chip.addEventListener('mouseleave', function(){ chip.style.opacity='0.65'; });

    /* ── drawer ── */
    var drawer = document.createElement('div');
    drawer.style.cssText = 'display:none;background:#0a0a0a;border:1px solid rgba(0,255,240,0.2);border-radius:14px;padding:18px;margin-bottom:8px;width:268px;box-shadow:0 12px 40px rgba(0,0,0,0.85);';

    var heading = document.createElement('div');
    heading.textContent = 'SPIN PALETTE';
    heading.style.cssText = 'color:#00FFF0;font-size:10px;letter-spacing:0.18em;margin-bottom:16px;opacity:0.75;';
    drawer.appendChild(heading);

    var lastGroup = null;
    PALETTE.forEach(function(p) {
      if (p.group && p.group !== lastGroup) {
        var grpLabel = document.createElement('div');
        grpLabel.textContent = p.group;
        grpLabel.style.cssText = 'color:#333;font-size:9px;letter-spacing:0.14em;margin:' + (lastGroup ? '14px' : '0') + ' 0 8px;';
        drawer.appendChild(grpLabel);
        lastGroup = p.group;
      }

      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:7px;';

      var swatch = document.createElement('input');
      swatch.type = 'color';
      swatch.value = saved[p.key] || p.def;
      swatch.style.cssText = 'width:26px;height:20px;border:none;border-radius:4px;padding:1px;cursor:pointer;background:none;flex-shrink:0;';

      var lbl = document.createElement('span');
      lbl.textContent = p.label;
      lbl.style.cssText = 'color:#666;flex:1;font-size:10px;';

      var hex = document.createElement('input');
      hex.type = 'text';
      hex.value = (saved[p.key] || p.def).toUpperCase();
      hex.maxLength = 7;
      hex.style.cssText = 'width:68px;background:#161616;border:1px solid #2a2a2a;border-radius:5px;padding:3px 7px;color:#ccc;font-family:monospace;font-size:10px;text-align:right;';

      (function(pLocal, swatchEl, hexEl) {
        function update(val) {
          if (!/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(val)) return;
          swatchEl.value = val;
          hexEl.value = val.toUpperCase();
          applyVar(pLocal.key, val);
          var s = loadSaved(); s[pLocal.key] = val; savePalette(s);
        }
        swatchEl.addEventListener('input',  function(){ update(swatchEl.value); });
        swatchEl.addEventListener('change', function(){ update(swatchEl.value); });
        hexEl.addEventListener('blur',    function(){ update(hexEl.value); });
        hexEl.addEventListener('keydown', function(e){ if(e.key==='Enter') update(hexEl.value); });
      })(p, swatch, hex);

      row.appendChild(swatch);
      row.appendChild(lbl);
      row.appendChild(hex);
      drawer.appendChild(row);
    });

    /* ── separator ── */
    var sep = document.createElement('div');
    sep.style.cssText = 'border-top:1px solid #1e1e1e;margin:14px 0 12px;';
    drawer.appendChild(sep);

    /* ── action buttons ── */
    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:8px;';

    var copyBtn = document.createElement('button');
    copyBtn.textContent = 'COPY CSS';
    copyBtn.style.cssText = 'flex:1;background:transparent;border:1px solid rgba(0,255,240,0.3);border-radius:6px;padding:7px;color:#00FFF0;font-family:inherit;font-size:10px;letter-spacing:0.08em;cursor:pointer;';

    var resetBtn = document.createElement('button');
    resetBtn.textContent = 'RESET';
    resetBtn.style.cssText = 'background:transparent;border:1px solid #2a2a2a;border-radius:6px;padding:7px 11px;color:#444;font-family:inherit;font-size:10px;letter-spacing:0.08em;cursor:pointer;';

    copyBtn.addEventListener('click', function() {
      var s = loadSaved();
      var lines = PALETTE.map(function(p){ return '  ' + p.key + ': ' + (s[p.key] || p.def) + ';'; }).join('\n');
      navigator.clipboard.writeText(':root {\n' + lines + '\n}').then(function() {
        copyBtn.textContent = 'COPIED ✓';
        setTimeout(function(){ copyBtn.textContent = 'COPY CSS'; }, 2000);
      });
    });

    resetBtn.addEventListener('click', function() {
      localStorage.removeItem(STORE_KEY);
      PALETTE.forEach(function(p){ applyVar(p.key, p.def); });
      document.getElementById('spin-color-panel').remove();
      setTimeout(createPanel, 80);
    });

    actions.appendChild(copyBtn);
    actions.appendChild(resetBtn);
    drawer.appendChild(actions);

    chip.addEventListener('click', function() {
      isOpen = !isOpen;
      drawer.style.display = isOpen ? 'block' : 'none';
      chip.textContent = isOpen ? '⊖ PALETTE' : '⊕ PALETTE';
    });

    panel.appendChild(drawer);
    panel.appendChild(chip);
    document.body.appendChild(panel);
  }

  setTimeout(createPanel, 1200);
})();
