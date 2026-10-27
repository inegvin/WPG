/* WPG landing page — interactions.
   Plain JavaScript, no libraries. Every block works on its own:
   if one element is missing, the others still run. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* Swap an image's source with a short fade, after the new one has loaded. */
  function swapImage(img, src, alt) {
    if (!img || img.getAttribute('src') === src) { if (img && alt) img.alt = alt; return; }
    var next = new Image();
    img.classList.add('is-swapping');
    next.onload = next.onerror = function () {
      img.src = src;
      if (alt) img.alt = alt;
      requestAnimationFrame(function () { img.classList.remove('is-swapping'); });
    };
    next.src = src;
  }
  function preload(list) { list.forEach(function (src) { var i = new Image(); i.src = src; }); }

  /* ---------- Footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Reveal on scroll (elements move into place; colours never fade) ---------- */
  var revealables = $$('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Hero: the background zooms in slightly as you scroll away ---------- */
  var heroBg = $('.hero__bg');
  var hero = $('.hero');
  if (heroBg && hero && !reduceMotion) {
    var ticking = false;
    var updateHero = function () {
      ticking = false;
      var h = hero.offsetHeight || 1;
      var p = Math.min(Math.max(window.scrollY / h, 0), 1);
      heroBg.style.transform = 'scale(' + (1 + p * 0.12).toFixed(4) + ')';
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateHero); }
    }, { passive: true });
    updateHero();
  }

  /* ---------- 01 Outline: Rectangle / Free shape ---------- */
  var outlineShot = $('#outline-shot');
  var OUTLINES = {
    rectangle: { src: 'assets/img/flow-veins-rectangle.jpg', alt: 'Flow Veins relief wall with a rectangular outline, on a dining-room wall' },
    free: { src: 'assets/img/flow-veins-free-shape.jpg', alt: 'Flow Veins relief wall with a free-shape outline, on a dining-room wall' }
  };
  var outlineButtons = $$('[data-outline]');
  if (outlineShot && outlineButtons.length) {
    preload([OUTLINES.free.src]);
    outlineButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-outline');
        outlineButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        swapImage(outlineShot, OUTLINES[key].src, OUTLINES[key].alt);
      });
    });
  }

  /* ---------- 01 Slicer: Parallel slats / Cross-slices (switches by itself; a click takes over) ---------- */
  var slicer = $('#slicer');
  if (slicer) {
    var SLICES = {
      parallel: { name: 'Parallel slats', src: 'assets/img/ceiling-parallel.jpg', alt: 'Suspended baffle ceiling made of parallel slats' },
      cross: { name: 'Cross-slices', src: 'assets/img/ceiling-cross.jpg', alt: 'Suspended baffle ceiling made of cross-slices' }
    };
    var slicerShot = $('#slicer-shot');
    var slicerName = $('#slicer-name');
    var sliceOptions = $$('[data-slice]', slicer);
    var slicePanels = $$('[data-slice-panel]', slicer);
    var current = 'parallel';
    var holdUntil = 0;
    var slicerVisible = false;
    preload([SLICES.cross.src]);

    var setSlice = function (key) {
      current = key;
      sliceOptions.forEach(function (o) { o.setAttribute('aria-checked', String(o.getAttribute('data-slice') === key)); });
      slicePanels.forEach(function (p) { p.hidden = p.getAttribute('data-slice-panel') !== key; });
      if (slicerName) slicerName.textContent = SLICES[key].name;
      swapImage(slicerShot, SLICES[key].src, SLICES[key].alt);
    };
    sliceOptions.forEach(function (o) {
      o.addEventListener('click', function () {
        holdUntil = Date.now() + 12000; // the visitor's choice stays for 12 s
        setSlice(o.getAttribute('data-slice'));
      });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { slicerVisible = e[0].isIntersecting; }, { threshold: 0.2 }).observe(slicer);
    } else { slicerVisible = true; }
    if (!reduceMotion) {
      setInterval(function () {
        if (slicerVisible && Date.now() > holdUntil && !document.hidden) {
          setSlice(current === 'parallel' ? 'cross' : 'parallel');
        }
      }, 3600);
    }
  }

  /* ---------- 02 Materials ---------- */
  var materialShot = $('#material-shot');
  var materials = $$('.material');
  if (materialShot && materials.length) {
    preload(['assets/img/bench-pet-felt.jpg']);
    materials.forEach(function (btn) {
      btn.addEventListener('click', function () {
        materials.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        materialShot.style.filter = btn.getAttribute('data-filter') || 'none';
        swapImage(materialShot, btn.getAttribute('data-src'), 'Sliced wave bench in ' + btn.getAttribute('data-name'));
      });
    });
  }

  /* ---------- 04 Nesting ----------
     Every piece is drawn the same way up: flat side on top, number at the flat corner.
     A piece that nesting turns over is rotated as a whole, so its number turns with it. */
  var sheets = $$('.sheet[data-sheet]');
  var nestBtn = $('#nest-btn');
  var pieces = [];
  function rand(seed) { var x = Math.sin(seed) * 43758.5453; return x - Math.floor(x); }

  function buildPiece(sheetIndex, i) {
    var k = sheetIndex * 9 + i;
    var isStrip = sheetIndex === 1 && i >= 7;
    var el = document.createElement('div');
    el.className = 'piece';
    el.style.top = (3 + i * 10.6).toFixed(1) + '%';

    var face = document.createElement('div');
    face.className = 'piece__face';
    if (isStrip) {
      face.style.clipPath = 'polygon(0% 22%, 100% 22%, 100% 78%, 0% 78%)';
      el.appendChild(face);
      for (var t = 9; t <= 89; t += 8) {
        var tooth = document.createElement('span');
        tooth.className = 'piece__tooth';
        tooth.style.left = t + '%';
        el.appendChild(tooth);
      }
    } else {
      var pts = [];
      for (var j = 12; j >= 0; j--) {
        var x = j / 12;
        var w = 0.5 + 0.5 * Math.sin(2 * Math.PI * (x * 1.3 + k * 0.17));
        pts.push((x * 100).toFixed(1) + '% ' + (58 + 40 * w).toFixed(1) + '%');
      }
      face.style.clipPath = 'polygon(0% 0%, 100% 0%, ' + pts.join(', ') + ')';
      el.appendChild(face);
      [20, 50, 80].forEach(function (left) {
        var notch = document.createElement('span');
        notch.className = 'piece__notch';
        notch.style.left = left + '%';
        el.appendChild(notch);
      });
    }
    var num = document.createElement('span');
    num.className = 'piece__num';
    num.textContent = isStrip ? 'F' + (i - 6) : String(k + 1);
    if (isStrip) num.style.top = '36%';
    el.appendChild(num);

    var r1 = rand(k * 12.9898), r2 = rand(k * 78.233);
    pieces.push({
      el: el,
      packed: (!isStrip && i % 2 === 1) ? 'rotate(180deg)' : 'none',
      scattered: 'translate(' + ((r1 - 0.5) * 60).toFixed(0) + '%, ' + ((r2 - 0.5) * 900).toFixed(0) + '%) rotate(' + ((r1 - 0.5) * 70).toFixed(0) + 'deg)',
      delay: i * 0.05
    });
    return el;
  }

  function setNested(packed) {
    pieces.forEach(function (p) {
      p.el.style.transitionDelay = packed ? p.delay + 's' : '0s';
      p.el.style.transform = packed ? p.packed : p.scattered;
    });
  }

  if (sheets.length) {
    sheets.forEach(function (sheet) {
      var s = Number(sheet.getAttribute('data-sheet'));
      for (var i = 0; i < 9; i++) sheet.appendChild(buildPiece(s, i));
    });
    setNested(true);
    var nestTimer;
    if (nestBtn) {
      nestBtn.addEventListener('click', function () {
        clearTimeout(nestTimer);
        setNested(false);
        nestTimer = setTimeout(function () { setNested(true); }, reduceMotion ? 0 : 900);
      });
    }
  }

  /* ---------- 05 Make files ---------- */
  var makeBtn = $('#make-btn');
  var fileItems = $$('#files-list .file');
  var filesCount = $('#files-count');
  var check = $('#files-check');
  var checkTitle = $('#check-title');
  var checkNote = $('#check-note');
  if (makeBtn && fileItems.length) {
    var makeTimer;
    makeBtn.addEventListener('click', function () {
      clearInterval(makeTimer);
      var made = 0, total = fileItems.length;
      fileItems.forEach(function (f) { f.classList.remove('is-done'); });
      check.classList.remove('is-ok');
      checkTitle.textContent = 'Checking files…';
      checkNote.textContent = 'cut paths · bridges · sizes';
      filesCount.textContent = '0 / ' + total;
      makeBtn.disabled = true;
      makeTimer = setInterval(function () {
        if (made < total) {
          fileItems[made].classList.add('is-done');
          made++;
          filesCount.textContent = made + ' / ' + total;
        } else {
          clearInterval(makeTimer);
          setTimeout(function () {
            check.classList.add('is-ok');
            checkTitle.textContent = 'Checks passed';
            checkNote.textContent = '0 errors found';
            makeBtn.disabled = false;
          }, 700);
        }
      }, 280);
    });
  }

  /* ---------- Products slideshow: endless loop + pause ---------- */
  $$('.marquee__track').forEach(function (track) {
    // Copy the cards once so the loop has no gap; copies are hidden from screen readers.
    $$('.card', track).forEach(function (card) {
      var copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  });
  var marquees = $('#marquees');
  var marqueeToggle = $('#marquee-toggle');
  if (marquees && marqueeToggle) {
    if (reduceMotion) { marqueeToggle.hidden = true; }
    marqueeToggle.addEventListener('click', function () {
      var paused = marquees.classList.toggle('is-paused');
      marqueeToggle.setAttribute('aria-pressed', String(paused));
      marqueeToggle.textContent = paused ? 'Play slideshow' : 'Pause slideshow';
    });
  }

  /* ---------- Early-access form → Google Sheet (via Google Apps Script) ---------- */
  var form = $('#signup-form');
  if (form) {
    var msg = $('#signup-msg');
    var email = $('#signup-email');
    var submit = form.querySelector('button[type="submit"]');
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
    var say = function (text, kind) {
      msg.textContent = text;
      msg.className = 'signup-form__msg' + (kind ? ' is-' + kind : '');
    };

    email.addEventListener('input', function () { email.removeAttribute('aria-invalid'); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = email.value.trim();
      if (!emailOk(value)) {
        email.setAttribute('aria-invalid', 'true');
        say('Please enter a valid email address.', 'error');
        email.focus();
        return;
      }
      var endpoint = (window.WPG_CONFIG && window.WPG_CONFIG.formEndpoint) || '';
      if (!endpoint) {
        say('The sign-up is not connected yet. Please write to inegvin@gmail.com instead.', 'error');
        return;
      }
      var data = new FormData(form);
      data.set('email', value);
      data.set('source', location.hostname || 'local');
      submit.disabled = true;
      submit.textContent = 'Sending…';
      say('');

      fetch(endpoint, { method: 'POST', body: new URLSearchParams(data) })
        .then(function (r) { return r.json().catch(function () { return { result: r.ok ? 'ok' : 'error' }; }); })
        .then(function (res) {
          if (res && res.result === 'ok') {
            form.reset();
            say("You're on the list. We'll email you when your invite is ready.", 'ok');
          } else {
            say('Something went wrong. Please try again, or write to inegvin@gmail.com.', 'error');
          }
        })
        .catch(function () {
          say('Could not reach the server. Please check your connection and try again.', 'error');
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = 'Join early access';
        });
    });
  }
})();
