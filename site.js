/* ==========================================================================
   jmburdett · page behaviour (Jack, 22 Sep: no smooth-scroll, nothing that
   follows the pointer; keep the Lead Assistant animation and the rail).

     1. the field     the light behind the page, painted once as a still frame
                      (WebGL) and again only when the window changes size
     2. the examples  four enquiries land in turn beside Michael's quote
     3. the bar       gains its glass once the page moves
   The services rail is the engine's (data-sc-act="pan"); nothing here.
   ========================================================================== */
(function () {
  'use strict';

  var d = document, html = d.documentElement;
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ 3. the bar */
  var bar = d.getElementById('bar');
  function onScroll() { bar.classList.toggle('is-scrolled', scrollY > 40); }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------- 1. the field
     The same interference light as the scroll build, stopped at one moment:
     no clock, no pointer, no scroll. The light pools top right.             */
  (function () {
    var cv = d.getElementById('field');
    var gl = null;
    try {
      gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false,
        premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    } catch (e) { gl = null; }
    if (!gl) { html.classList.add('no-webgl'); return; }

    var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    var FS = [
      '#ifdef GL_FRAGMENT_PRECISION_HIGH',
      'precision highp float;',
      '#else',
      'precision mediump float;',
      '#endif',
      'uniform vec2 uRes;',
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
      '  float t = 1.26;',   // the old clock, stopped at 18 seconds
      '  vec2 q = p * 1.9;',
      '  float c = clamp(ridges(q, t) * 0.8 + ridges(q * 1.6 + vec2(4.1, 1.3), t * 1.25) * 0.55, 0.0, 1.0);',
      '  c = smoothstep(0.12, 0.85, c);',
      '  float pool = smoothstep(1.95, 0.05, length(p - vec2(0.58, 0.32)));',
      '  vec3 col = vec3(0.949, 0.945, 0.933) + vec3(0.010, 0.008, 0.003) * (1.0 - uv.y);',
      '  vec3 soft = vec3(0.310, 0.702, 0.737);',
      '  vec3 teal = vec3(0.055, 0.486, 0.525);',
      '  col = mix(col, soft, 0.09 * pool * pool);',
      '  col = mix(col, soft, c * 0.42 * pool);',
      '  col = mix(col, teal, c * c * 0.15 * pool);',
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
      html.classList.add('no-webgl'); return;
    }
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uRes = gl.getUniformLocation(prog, 'uRes');

    // The light is soft, so half resolution is invisible and a quarter of the cost.
    function paint() {
      var s = 0.5 * Math.min(devicePixelRatio || 1, 1.5);
      var w = Math.max(1, Math.round(innerWidth * s)), h = Math.max(1, Math.round(innerHeight * s));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    var queued = false;
    addEventListener('resize', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; paint(); });
    });
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); html.classList.add('no-webgl'); });
    paint();
  })();

  /* -------------------------------------------------------- 2. the examples
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

  // Fonts change every measured box (the rail's width among them); let the
  // engine measure again once they land.
  function relayout() { dispatchEvent(new Event('resize')); }
  addEventListener('load', relayout);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(relayout);
})();
