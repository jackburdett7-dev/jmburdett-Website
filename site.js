/* ==========================================================================
   jmburdett · page behaviour. Everything bespoke lives here; the engine is
   untouched and is only ever READ (the --sc-p it publishes on each act).

     0. the glide     Lenis smooths the wheel and slows it a touch (not under
                      reduced motion, and never on touch: phones scroll natively)
     1. the field     a real-time light-field (WebGL), the page's one material;
                      it gathers around the system as it switches on
     2. the signature the system map wires itself up from the hero's scroll,
                      then keeps flowing once it is running
     3. depth         pointer parallax on the hero's map (fine pointers only)
     4. the enquiry   four examples land in turn beside Michael's quote
     5. keyboard      pinned acts parked where their controls are visible
     6. the bar       gains its glass once the page moves
   ========================================================================== */
(function () {
  'use strict';

  var d = document, html = d.documentElement;
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;

  var hero = d.getElementById('hero');
  var figure = d.getElementById('how');

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(a, b, x) { var t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function actP(act) { return parseFloat(act.style.getPropertyValue('--sc-p')) || 0; }

  /* ---------------------------------------------------------- 0. the glide
     The wheel travels 80% as far per notch and eases in behind the hand, so
     the page reads at a walk rather than a run. Driven from the one frame
     loop below; the engine still just listens for scroll, as it always has. */
  var lenis = null;
  if (!REDUCE && typeof window.Lenis === 'function') {
    try { lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.8, smoothWheel: true, syncTouch: false }); }
    catch (e) { lenis = null; }
  }
  function goTo(y, glide) {
    y = Math.max(0, Math.round(y));
    if (lenis) lenis.scrollTo(y, glide ? { duration: 2.6, easing: easeInOut, force: true } : { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: glide && !REDUCE ? 'smooth' : 'instant' });
  }

  /* ------------------------------------------------------------ 6. the bar */
  var bar = d.getElementById('bar');
  function onScroll() { bar.classList.toggle('is-scrolled', scrollY > 40); }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------ 2. the signature
     Two drawings of the same system (wide for desktop, tall for phones); only
     the one on screen is driven. Each live path carries data-draw="from to"
     in hero progress; each node lights at data-on.                         */
  var maps = Array.prototype.map.call(d.querySelectorAll('.map__svg'), function (svg) {
    var pulses = svg.querySelectorAll('.map__pulse');
    var trails = svg.querySelectorAll('.map__trail');
    var paths = Array.prototype.map.call(svg.querySelectorAll('.map__path'), function (el, i) {
      var w = el.getAttribute('data-draw').split(/\s+/).map(parseFloat);
      return { el: el, a: w[0], b: w[1], len: 0, c: 0, pulse: pulses[i] || null, trail: trails[i] || null };
    });
    var nodes = Array.prototype.map.call(svg.querySelectorAll('[data-on]'), function (el) {
      return { el: el, at: parseFloat(el.getAttribute('data-on')) };
    });
    return { svg: svg, paths: paths, nodes: nodes, ring: svg.querySelector('.map__ring'),
             core: svg.querySelector('.map__coreBox'), glow: svg.querySelector('.map__glow'),
             measured: false, sig: '' };
  });
  function visibleMap() {
    for (var i = 0; i < maps.length; i++) if (maps[i].svg.getBoundingClientRect().width > 0) return maps[i];
    return null;
  }
  function measure(m) {
    m.paths.forEach(function (pp) {
      pp.len = pp.el.getTotalLength();
      pp.el.style.strokeDasharray = pp.len.toFixed(1);
      // the comet: one short bright dash, the rest of the pattern a gap longer than the line
      pp.c = Math.min(30, pp.len * 0.32);
      if (pp.trail) pp.trail.style.strokeDasharray = pp.c.toFixed(1) + ' ' + (pp.len + pp.c + 10).toFixed(1);
    });
    m.measured = true;
  }
  addEventListener('resize', function () { maps.forEach(function (m) { m.measured = false; }); });

  // the status pill in the console's bar
  var status = d.getElementById('status');
  var statusText = status && status.querySelector('span');
  var lastStatus = '';
  function setStatus(s) {
    if (!status || s === lastStatus) return;
    lastStatus = s;
    status.classList.toggle('is-wiring', s === 'Connecting');
    status.classList.toggle('is-run', s === 'Running');
    statusText.textContent = s;
  }

  var FLOW = 100;   // idle flow, in drawing units per second
  function renderMap(p, now) {
    var m = visibleMap();
    if (!m) return null;
    if (!m.measured) measure(m);
    var ink = 0, lit = 0;
    for (var i = 0; i < m.paths.length; i++) {
      var pp = m.paths[i];
      // reduced motion: a line is either there or not; nothing travels
      var t = REDUCE ? (p >= pp.b ? 1 : 0) : clamp01((p - pp.a) / (pp.b - pp.a));
      pp.el.style.strokeDashoffset = (pp.len * (1 - t)).toFixed(1);
      ink += t;
      // Where the bright head is: at the drawing tip while a line draws, then
      // riding the finished line on a loop, so a running system keeps moving.
      var head = -1;
      if (!REDUCE) {
        if (t > 0 && t < 1) head = pp.len * t;
        else if (t >= 1) {
          var cycle = pp.len + pp.c + 90;
          var s = ((now / 1000) * FLOW + i * 67) % cycle;
          if (s <= pp.len + pp.c) head = s;
        }
      }
      if (pp.trail) {
        pp.trail.style.opacity = head >= 0 ? '1' : '0';
        if (head >= 0) pp.trail.style.strokeDashoffset = (pp.c - head).toFixed(1);
      }
      if (pp.pulse) {
        var show = head >= 0 && head <= pp.len;
        pp.pulse.style.opacity = show ? '1' : '0';
        if (show) {
          var pt = pp.el.getPointAtLength(head);
          pp.pulse.setAttribute('cx', pt.x.toFixed(1));
          pp.pulse.setAttribute('cy', pt.y.toFixed(1));
        }
      }
    }
    for (var j = 0; j < m.nodes.length; j++) {
      var n = m.nodes[j], on = p >= n.at;
      if (on) lit++;
      if (on !== n.el.classList.contains('is-on')) n.el.classList.toggle('is-on', on);
    }
    // the moment it switches on: one ring leaves the core
    if (m.ring) {
      var r = REDUCE ? 0 : clamp01((p - 0.33) / 0.14);
      m.ring.style.opacity = (r > 0 && r < 1 ? 0.55 * (1 - r) : 0).toFixed(3);
      m.ring.style.transform = 'scale(' + (1 + 0.3 * r).toFixed(3) + ')';
    }
    // the light inside the console gathers with the core, then breathes
    var e = REDUCE ? (p >= 0.33 ? 1 : 0) : smooth(0.28, 0.40, p);
    if (m.glow) m.glow.style.opacity = (0.3 + 0.6 * e + (REDUCE ? 0 : 0.1 * e * Math.sin(now / 1100))).toFixed(3);
    setStatus(p < 0.04 ? 'Standby' : p < 0.33 ? 'Connecting' : 'Running');
    // What actually paints (line drawn, nodes lit), for the harness's dead-scroll
    // check. Never raw progress (verify.md). Once the map is complete the page
    // deliberately holds on it for a beat: that hold is declared, not hidden.
    var sig = ink.toFixed(1) + '|' + lit;
    if (sig !== m.sig) { figure.setAttribute('data-sc-verify-state', sig); m.sig = sig; }
    var hold = p >= 0.8 ? 'true' : 'false';
    if (figure.getAttribute('data-sc-verify-hold') !== hold) figure.setAttribute('data-sc-verify-hold', hold);
    return m;
  }

  /* ------------------------------------------------------------ 3. depth */
  var depthEls = Array.prototype.slice.call(hero.querySelectorAll('[data-depth]'));
  var ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  if (FINE && !REDUCE) {
    addEventListener('pointermove', function (e) {
      ptr.tx = (e.clientX / innerWidth - 0.5) * 2;
      ptr.ty = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
  }
  function renderDepth() {
    ptr.x += (ptr.tx - ptr.x) * 0.07;
    ptr.y += (ptr.ty - ptr.y) * 0.07;
    for (var i = 0; i < depthEls.length; i++) {
      var f = parseFloat(depthEls[i].getAttribute('data-depth')) || 0;
      depthEls[i].style.transform =
        'translate3d(' + (ptr.x * f * -14).toFixed(2) + 'px,' + (ptr.y * f * -10).toFixed(2) + 'px,0)';
    }
  }

  /* ------------------------------------------------------------ 1. the field */
  var field = (function () {
    var cv = d.getElementById('field');
    var gl = null;
    try {
      gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false,
        premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
    } catch (e) { gl = null; }
    if (!gl) { html.classList.add('no-webgl'); return null; }

    var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    var FS = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH',
      'precision highp float;',
      '#else',
      'precision mediump float;',
      '#endif',
      'uniform vec2 uRes; uniform float uTime; uniform vec2 uPtr; uniform float uEnergy; uniform vec2 uCore; uniform float uScroll;',
      // warped interference ridges: thin bright lines, like light through water
      'float ridges(vec2 p, float t){',
      '  float v = 0.0;',
      '  for (int i = 0; i < 4; i++) {',
      '    float fi = float(i);',
      '    p += 0.42 * vec2(sin(p.y * 1.35 + t * 0.9 + fi * 1.7), cos(p.x * 1.15 - t * 0.7 + fi * 2.3));',
      '    v += pow(1.0 - abs(sin(p.x * 1.55 + p.y * 0.85 + fi * 0.9)), 9.0);',
      '  }',
      '  return v * 0.25;',
      '}',
      'void main(){',
      '  vec2 uv = gl_FragCoord.xy / uRes;',
      '  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);',
      '  float t = uTime * 0.07;',
      '  vec2 q = p * 1.9 + uPtr * 0.10 + vec2(0.0, uScroll * 1.4);',
      '  float c = clamp(ridges(q, t) * 0.8 + ridges(q * 1.6 + vec2(4.1, 1.3), t * 1.25) * 0.55, 0.0, 1.0);',
      '  c = smoothstep(0.12, 0.85, c);',
      // the light gathers around the system once it is on
      '  vec2 poolAt = mix(vec2(0.58, 0.32), uCore, uEnergy);',
      '  float pool = smoothstep(mix(1.95, 1.15, uEnergy), 0.05, length(p - poolAt));',
      '  vec3 col = vec3(0.949, 0.945, 0.933) + vec3(0.010, 0.008, 0.003) * (1.0 - uv.y);',
      '  vec3 soft = vec3(0.310, 0.702, 0.737);',
      '  vec3 teal = vec3(0.055, 0.486, 0.525);',
      '  col = mix(col, soft, mix(0.09, 0.17, uEnergy) * pool * pool);',
      '  col = mix(col, soft, c * mix(0.42, 0.64, uEnergy) * pool);',
      '  col = mix(col, teal, c * c * mix(0.15, 0.30, uEnergy) * pool);',
      '  col *= 1.0 - 0.035 * pow(length(uv - 0.5) * 1.3, 2.0);',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n');

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(s)); }
      return s;
    }
    var prog;
    try {
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    } catch (e) {
      if (window.console) console.warn('field: falling back to CSS', e);
      html.classList.add('no-webgl'); return null;
    }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {};
    ['uRes', 'uTime', 'uPtr', 'uEnergy', 'uCore', 'uScroll'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

    // The light is soft, so half resolution is invisible and a quarter of the cost.
    function size() {
      var s = 0.5 * Math.min(devicePixelRatio || 1, 1.5);
      var w = Math.max(1, Math.round(innerWidth * s)), h = Math.max(1, Math.round(innerHeight * s));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    }
    size();
    addEventListener('resize', size);
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); html.classList.add('no-webgl'); });

    var t0 = performance.now(), frozen = 18.0;
    return function draw(now, energy, core, scroll) {
      gl.uniform2f(U.uRes, cv.width, cv.height);
      gl.uniform1f(U.uTime, REDUCE ? frozen : (now - t0) / 1000);
      gl.uniform2f(U.uPtr, ptr.x, -ptr.y);
      gl.uniform1f(U.uEnergy, energy);
      gl.uniform2f(U.uCore, core[0], core[1]);
      gl.uniform1f(U.uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
  })();

  // the core's centre in the shader's coordinates (centred, shortest side = 1, y up)
  var core = [0.58, 0.32];
  function trackCore(m) {
    if (!m || !m.core) return;
    var b = m.core.getBoundingClientRect();
    var s = Math.min(innerWidth, innerHeight);
    core[0] = (b.left + b.width / 2 - innerWidth / 2) / s;
    core[1] = -(b.top + b.height / 2 - innerHeight / 2) / s;
  }

  /* ------------------------------------------------------------ 4. the enquiry
     Four examples share one panel. Each lands when it comes up; they take
     turns on a timer that is the lit tab's own thin bar (CSS), so hovering or
     focusing the panel pauses it for free. Picking a tab stops the rotation
     for good: the reader has taken over. Nothing rotates under reduced motion,
     or while the panel is off screen.                                        */
  var enq = d.getElementById('enq');
  if (enq) {
    var scenes = enq.querySelectorAll('.enq__scene');
    var tabs = enq.querySelectorAll('.enq__tabs button');
    var cur = 0, stopped = REDUCE;
    var showScene = function (i) {
      if (i === cur) return;
      scenes[cur].classList.remove('is-active');
      tabs[cur].setAttribute('aria-pressed', 'false');
      cur = i;
      scenes[cur].classList.add('is-active');
      tabs[cur].setAttribute('aria-pressed', 'true');
    };
    Array.prototype.forEach.call(tabs, function (b, i) {
      b.addEventListener('click', function () {
        stopped = true;
        enq.classList.remove('is-rotating');
        enq.classList.add('is-live');
        showScene(i);
      });
    });
    enq.addEventListener('animationend', function (e) {
      if (e.animationName !== 'tabfill' || stopped) return;
      showScene((cur + 1) % scenes.length);
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            enq.classList.add('is-live');
            if (!stopped) enq.classList.add('is-rotating');
          }
          enq.classList.toggle('is-paused', !e.isIntersecting);
        });
      }, { threshold: 0.45 });
      io.observe(enq);
    } else { enq.classList.add('is-live'); }
  }

  /* The proof holds for a beat (site.css) only where it fits one screen under
     the bar. Measured, not a media query: its height follows width and fonts.
     When that flips, the page below moves, so the engine measures again.    */
  var proof = d.querySelector('.proof');
  var proofGrid = proof && proof.querySelector('.proof__grid');
  function fitProof() {
    if (!proofGrid) return false;
    var fits = innerWidth > 860 && proofGrid.offsetHeight + 64 + 16 <= innerHeight;
    if (fits === proof.classList.contains('is-held')) return false;
    proof.classList.toggle('is-held', fits);
    return true;
  }
  addEventListener('resize', function () { if (fitProof()) dispatchEvent(new Event('resize')); });

  /* --------------------------------------------------------- 5. keyboard
     The engine centres focus inside a faded cue, and says plainly that it
     cannot fix a PINNED act (verify.md). Each pinned act with a control is
     parked where that control is visible. Registered after the engine's
     handler, so this one has the last word.                                */
  function parkAct(act, p, glide) {
    var top = act.getBoundingClientRect().top + scrollY;
    var travel = Math.max(1, act.offsetHeight - innerHeight);
    goTo(top + clamp01(p) * travel, glide);
  }
  var range = d.querySelector('.range');
  var rail = range && range.querySelector('[data-sc-pan]');
  var book = d.getElementById('book');
  d.addEventListener('focusin', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    // the hero's controls are fully visible at the start of the act (it fades on phones)
    if (t.closest('.hero-copy')) { parkAct(hero, 0); return; }
    // a rail card: slide the rail until that card sits in the middle of the screen
    if (rail && rail.contains(t)) {
      var item = t.closest('.card, .rail__lead, .rail__note') || t;
      var over = Math.max(1, rail.scrollWidth - innerWidth);
      var extra = parseFloat(rail.getAttribute('data-sc-pan')) || 0;
      var want = item.offsetLeft + item.offsetWidth / 2 - innerWidth / 2;
      parkAct(range, want / (over * (1 + extra)));
      return;
    }
    // the close holds for its whole span; land in the middle of it, instantly
    if (book && book.contains(t)) parkAct(book, 0.5);
  });

  // "See how it works": glide through the hero so the system wires itself up.
  var see = d.getElementById('see-it');
  if (see) see.addEventListener('click', function (e) { e.preventDefault(); parkAct(hero, 0.82, true); });
  // the wordmark glides home rather than jumping (Lenis owns the wheel now)
  var brand = d.querySelector('.bar .brand');
  if (brand && lenis) brand.addEventListener('click', function (e) { e.preventDefault(); goTo(0, true); });

  /* ------------------------------------------------------------ the loop */
  var hidden = false;
  d.addEventListener('visibilitychange', function () { hidden = d.hidden; });
  var lastKey = '';
  function frame(now) {
    requestAnimationFrame(frame);
    if (hidden) return;
    if (lenis) lenis.raf(now);
    var p = actP(hero);
    // the map only moves while the hero is on screen
    var hr = hero.getBoundingClientRect();
    var m = hr.bottom > 0 && hr.top < innerHeight ? renderMap(p, now) : null;
    renderDepth();
    if (field) {
      trackCore(m);
      var max = Math.max(1, html.scrollHeight - innerHeight);
      var scroll = scrollY / max;
      // on when the core switches on; settles to a glow once the hero has gone
      var energy = smooth(0.30, 0.46, p) * (1 - 0.65 * smooth(0.9, 1, p));
      // under reduced motion the field only redraws when something changed
      var key = REDUCE ? energy.toFixed(3) + '|' + scroll.toFixed(3) + '|' + innerWidth : '';
      if (!REDUCE || key !== lastKey) { field(now, energy, core, scroll); lastKey = key; }
    }
  }
  requestAnimationFrame(frame);

  // Fonts change every measured box; let the engine measure once they land.
  function relayout() { dispatchEvent(new Event('resize')); }
  addEventListener('load', relayout);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(relayout);
})();
