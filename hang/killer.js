if(document.fonts&&document.fonts.load){document.fonts.load('400 16px "Comic Neue"');document.fonts.load('700 16px "Comic Neue"')}
(function () {
  'use strict';
  var MAN = {"boy_loop": [384, 444, 66, 266], "boy_arm_l": [384, 444, 66, 266], "boy_arm_r": [595, 438, 75, 266], "boy_chest": [411, 383, 226, 266], "boy_coat_back": [381, 575, 292, 259], "boy_coat_l": [378, 586, 90, 334], "boy_coat_r": [594, 583, 87, 332], "boy_face_dizzy": [407, 248, 201, 138], "boy_face_love": [401, 254, 210, 141], "boy_face_scared": [407, 248, 201, 140], "boy_hair_ahoge": [327, 6, 207, 133], "boy_hair_front": [291, 49, 422, 333], "boy_head": [363, 63, 314, 347], "boy_leg_l": [415, 612, 115, 376], "boy_leg_r": [522, 612, 118, 371], "face_blink": [457, 271, 231, 146], "face_effort": [461, 286, 228, 144], "face_idle": [446, 271, 250, 146], "face_joy": [455, 263, 231, 161], "puller_arm_lower": [622, 543, 116, 185], "puller_arm_rest": [408, 482, 109, 283], "puller_arm_upper": [606, 471, 66, 116], "puller_body": [383, 441, 383, 524], "puller_glasses": [455, 281, 262, 127], "puller_hair_back": [159, 96, 633, 765], "puller_hair_front": [320, 63, 437, 470], "puller_head": [351, 89, 361, 368]};

  
  var W = 600, H = 800, GROUND = 740, CEIL = 14, K = 0.33;
  var GRAV = 1900, DT = 1 / 480, ITER = 10, DAMP = 0.9996, PXM = 180;   
  var PUL = { x: 400, y: 147 }, WR = 26, MS = 0.5;
  var LEFT = { x: PUL.x - WR, y: PUL.y }, RIGHT = { x: PUL.x + WR, y: PUL.y };
  var SLOPE = 0.285, ROPEK = Math.hypot(1, SLOPE), YH = 535, YL = 645;
  var NSEG = 18;
  var BTOP = -70, BBOT = 990, BX0 = 372, BX1 = 672, BCX = 522;
  var LEN_REST = (GROUND - (BBOT - BTOP) * K) - RIGHT.y, LEN_MIN = 62, LEN_MAX = LEN_REST + 34;
  var GX = 172;

  
  var LOOP_CX = 510, LOOP_CY = 100, LOOP_W = 1100;
  var LOOP_AFTER = 'boy_chest';
  
  var MODES = ['hoist', 'bungee', 'spin', 'slam'];
  var MODE_TIPS = ['hold to pull, let go and he slips oops', 'let go and he drops on a stretchy rope lolol',
    'hold to pull AND spin him', 'let go and he gets slammed into the floor'];
  var POP_TIPS = ['kill him more', 'torture', 'keep spinning him', 'let go to slam him hard'];
  var BUNGEE_LEN = LEN_REST - 45, BUNGEE_STIFF = 0.09, BOUNCE = 0.45;
  var SPIN_ACC = 5200, SLAM_SPEED = 450;
  var CONFUSED_AFTER = 3;  
  var DEAD_AFTER = 6;   
  var DEAD_PULL = 30;   
  var DEAD_FACE_AT = 0.5;   /* once the dark head is this far faded in (0..1), his face becomes X-X for good i thiknkd*/
  var mode = 0, spinOn = false, shx = 0, shy = 0;

  var reduceMotion = false;
  try { reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function lineX(y) { return LEFT.x - SLOPE * (y - LEFT.y); }
  function wrap(a) { return ((a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; }

  
  var SPR = {}, NAMES = Object.keys(MAN).concat(['pulley_wheel', 'pulley_mount', 'boy_face_confused', 'boy_headdead']);
  function trimBox(im) {
    try {
      var c = document.createElement('canvas'), w = c.width = im.naturalWidth || im.width, h = c.height = im.naturalHeight || im.height;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0);
      var d = x.getImageData(0, 0, w, h).data, x0 = w, y0 = h, x1 = -1, y1 = -1, i, j;
      for (j = 0; j < h; j++) for (i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 10) {
        if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j;
      }
      return x1 < 0 ? null : [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
    } catch (e) { return null; }
  }
  function loadAll(done) {
    var left = NAMES.length;
    NAMES.forEach(function (n) {
      var im = new Image();
      function fin() { if (--left === 0) done(); }
      im.onload = function () {
        var m = MAN[n];
        SPR[n] = { img: im, x: m ? m[0] : 0, y: m ? m[1] : 0, w: m ? m[2] : im.width, h: m ? m[3] : im.height };
        if (n === 'boy_face_confused') {   /* same spot as the scared face */
          /* the png is a 1024x1024 canvas with the face only in a small patch: crop to that patch [sx,sy,sw,sh]
             so it fills the same slot as the other faces (otherwise it looks tiny) */
          var fm = MAN.boy_face_scared, cr = trimBox(im) || [416, 248, 183, 126];
          SPR[n].crop = cr;
          SPR[n].x = fm[0]; SPR[n].y = fm[1]; SPR[n].w = fm[2]; SPR[n].h = Math.round(fm[2] * cr[3] / cr[2]);
        }
        if (n === 'boy_loop') {
          var lw = LOOP_W, lh = Math.round(LOOP_W * im.height / im.width);
          SPR[n].x = LOOP_CX - lw / 2; SPR[n].y = LOOP_CY - lh / 2; SPR[n].w = lw; SPR[n].h = lh;
        }
        fin();
      };
      im.onerror = fin;
      im.src = 'assets/' + n + '.png';
    });
  }

  
  var C = { paper: '#fff', ink: '#111', accent: '#e44', muted: '#777' };
  function readColors() {
    var s = getComputedStyle(document.documentElement);
    ['paper', 'ink', 'accent', 'muted'].forEach(function (k) { C[k] = s.getPropertyValue('--' + k).trim() || C[k]; });
  }

  
  function Dang(fr, root, L, o) {
    this.fr = fr; this.root = root; this.L = L;
    this.k = o.k; this.gr = o.gr; this.damp = o.damp || 0.998;
    this.lo = o.lo; this.hi = o.hi; this.wind = reduceMotion ? 0 : (o.wind || 0);
    this.sign = o.sign || 1; this.extra = 0; this.rel = 0; this.ph = Math.random() * 6;
    this.init();
  }
  Dang.prototype.init = function () {
    var J = this.fr.pt(this.root), a = this.fr.ang(), Lw = this.L * this.fr.s();
    this.x = J.x - Math.sin(a) * Lw; this.y = J.y + Math.cos(a) * Lw;
    this.px = this.x; this.py = this.y; this.rel = 0;
  };
  Dang.prototype.step = function (dt, t) {
    var fr = this.fr, J = fr.pt(this.root), fa = fr.ang(), Lw = this.L * fr.s();
    var ta = fa + this.extra, tx = J.x - Math.sin(ta) * Lw, ty = J.y + Math.cos(ta) * Lw;
    var vx = (this.x - this.px) * this.damp, vy = (this.y - this.py) * this.damp;
    this.px = this.x; this.py = this.y;
    var ax = this.k * (tx - this.x) + this.wind * Math.sin(t * 1.7 + this.ph);
    var ay = GRAV * this.gr + this.k * (ty - this.y);
    this.x += vx + ax * dt * dt; this.y += vy + ay * dt * dt;
    var dx = this.x - J.x, dy = this.y - J.y, d = Math.hypot(dx, dy) || 1;
    this.x = J.x + dx * Lw / d; this.y = J.y + dy * Lw / d;
    var r = wrap(Math.atan2(-(this.x - J.x), this.y - J.y) - fa);
    var cr = Math.min(this.hi, Math.max(this.lo, r));
    if (cr !== r) {
      var aa = fa + cr;
      this.x = J.x - Math.sin(aa) * Lw; this.y = J.y + Math.cos(aa) * Lw;
      this.px = this.x - (this.x - this.px) * 0.3; this.py = this.y - (this.y - this.py) * 0.3;
      r = cr;
    }
    this.rel = r;
  };

  /*this is drm-mei */
  var g = { ox: GX, oy: GROUND, ang: 0 }, gEff = { ox: GX, oy: GROUND, ang: 0 };
  function gpt(ax, ay, f) {
    f = f || g;
    var dx = (ax - 531) * K, dy = (ay - 965) * K, c = Math.cos(f.ang), s = Math.sin(f.ang);
    return { x: f.ox + dx * c - dy * s, y: f.oy + dx * s + dy * c };
  }
  function gInv(wx, wy) {
    var dx = wx - g.ox, dy = wy - g.oy, c = Math.cos(g.ang), s = Math.sin(g.ang);
    return [(dx * c + dy * s) / K + 531, (-dx * s + dy * c) / K + 965];
  }
  var fg = { pt: function (a) { return gpt(a[0], a[1], gEff); }, ang: function () { return gEff.ang; }, s: function () { return K; } };

  /* the boy*/
  var parts = [], cons = [], iT, iTL, iTR, iBR, iBL;
  var b = { x: 0, y: 0, ang: 0, s: K };
  function bpt(ax, ay) {
    var fx = (ax - BX0) * b.s, fy = (ay - BTOP) * b.s, c = Math.cos(b.ang), s = Math.sin(b.ang);
    return { x: b.x + fx * c - fy * s, y: b.y + fx * s + fy * c };
  }
  function bInv(wx, wy) {
    var dx = wx - b.x, dy = wy - b.y, c = Math.cos(b.ang), s = Math.sin(b.ang);
    return [(dx * c + dy * s) / b.s + BX0, (-dx * s + dy * c) / b.s + BTOP];
  }
  function updB() {
    var TL = parts[iTL], TR = parts[iTR], dx = TR.x - TL.x, dy = TR.y - TL.y;
    b.x = TL.x; b.y = TL.y; b.ang = Math.atan2(dy, dx); b.s = Math.hypot(dx, dy) / (BX1 - BX0);
  }
  var fb = { pt: function (a) { return bpt(a[0], a[1]); }, ang: function () { return b.ang; }, s: function () { return b.s; } };

  function mk(x, y, im) { parts.push({ x: x, y: y, px: x, py: y, im: im }); return parts.length - 1; }
  function addC(a, b2) { cons.push([a, b2, Math.hypot(parts[a].x - parts[b2].x, parts[a].y - parts[b2].y)]); }

  var D = {}; /* dingl */
  function makeDanglers() {
    D.back = new Dang(fb, [527, 585], 250, { k: 22, gr: 0.7, damp: 0.9985, lo: -0.5, hi: 0.5 });
    D.cl = new Dang(fb, [458, 590], 330, { k: 26, gr: 0.8, damp: 0.9985, lo: -0.3, hi: 1.0 });
    D.cr = new Dang(fb, [596, 590], 330, { k: 26, gr: 0.8, damp: 0.9985, lo: -1.0, hi: 0.3 });
    D.al = new Dang(fb, [425, 462], 248, { k: 5, gr: 1, damp: 0.9988, lo: -0.3, hi: 1.5 });
    D.ar = new Dang(fb, [620, 458], 248, { k: 5, gr: 1, damp: 0.9988, lo: -1.5, hi: 0.3 });
    D.ll = new Dang(fb, [475, 665], 323, { k: 5, gr: 1, damp: 0.9988, lo: -0.3, hi: 1.3 });
    D.lr = new Dang(fb, [578, 665], 323, { k: 5, gr: 1, damp: 0.9988, lo: -1.3, hi: 0.3 });
    D.hf = new Dang(fb, [534, 85], 297, { k: 150, gr: 0.25, damp: 0.9975, lo: -0.4, hi: 0.4, wind: 300 });
    D.ah = new Dang(fb, [455, 105], 150, { k: 120, gr: 0.2, damp: 0.997, lo: -0.8, hi: 0.8, sign: -1, wind: 240 });
    D.gb = new Dang(fg, [525, 125], 736, { k: 45, gr: 0.5, damp: 0.9985, lo: -0.45, hi: 0.45, wind: 130 });
    D.gf = new Dang(fg, [544, 100], 433, { k: 90, gr: 0.35, damp: 0.998, lo: -0.4, hi: 0.4, wind: 220 });
    D.gr = new Dang(fg, [478, 495], 270, { k: 7, gr: 1, damp: 0.9988, lo: -0.25, hi: 0.9 });
  }

  var drag = null, fx = [], st = {};

  function initSim() {
    parts.length = 0; cons.length = 0;
    var seg = LEN_REST / (NSEG - 1), i;
    for (i = 0; i < NSEG; i++) mk(RIGHT.x, RIGHT.y + seg * i, i === 0 ? 0 : 1);
    iT = NSEG - 1; parts[iT].im = 0.25;
    var tx = RIGHT.x, ty = RIGHT.y + LEN_REST, hw = (BCX - BX0) * K, hh = (BBOT - BTOP) * K;
    iTL = mk(tx - hw, ty, 0.25); iTR = mk(tx + hw, ty, 0.25);
    iBR = mk(tx + hw, ty + hh, 0.25); iBL = mk(tx - hw, ty + hh, 0.25);
    addC(iT, iTL); addC(iT, iTR); addC(iTL, iTR); addC(iTL, iBL); addC(iTR, iBR);
    addC(iBL, iBR); addC(iTL, iBR); addC(iTR, iBL); addC(iT, iBL); addC(iT, iBR);
    updB();
  }

  function resetState() {
    var best = st.best == null ? null : st.best;
    st = {
      len: LEN_REST, slip: 0, stamina: 1, hand: { y: 640, mode: 'idle' }, grab: 0,
      lifts: 0, timer: 0, timing: false, armed: true, celebrate: 0, dust: 0, last: null, best: best,
      touched: false, slammed: false, kickDir: 1, kick: 0, dizzy: 0, prog: 0, blink: 2.5, wheel: 0, shake: 0,
      lean: 0, bob: 0, prevAng: 0, omega: 0, cx: 0, cy: 0, speed: 0, slideG: 0, pullT: 0, dead: 0
    };
    fx.length = 0; drag = null; spinOn = false;
    initSim();
    g.ox = GX; g.oy = GROUND; g.ang = 0; gEff.ox = GX; gEff.oy = GROUND; gEff.ang = 0;
    makeDanglers();
    st.prevAng = b.ang;
  }

  function step() {
    var g2 = GRAV * DT * DT, i, p, it, bungee = mode === 1, stiff = bungee ? BUNGEE_STIFF : 1;
    var P0 = parts[0]; P0.x = P0.px = RIGHT.x; P0.y = P0.py = RIGHT.y;
    var vy0 = [];
    for (i = iT; i < parts.length; i++) vy0.push(parts[i].y - parts[i].py + g2);
    for (i = 0; i < parts.length; i++) {
      p = parts[i]; if (!p.im) continue;
      var vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
      p.px = p.x; p.py = p.y; p.x += vx; p.y += vy + g2;
    }
    [parts[iBL], parts[iBR]].forEach(function (q) {
      if (mode === 3 && q.y > GROUND && (q.y - q.py) / DT > SLAM_SPEED && st.shake <= 0.05) { st.shake = 0.45; st.slammed = true; }
      if (q.y > GROUND && (q.y - q.py) / DT > 260 && st.dust <= 0) {
        st.dust = 0.3;
        fx.push({ k: 'dust', x: q.x, t: 0, life: 0.5 });
      }
    });
    if (spinOn) {
      var ccx = (parts[iTL].x + parts[iBR].x) / 2, ccy = (parts[iTL].y + parts[iBR].y) / 2, sa = SPIN_ACC * DT * DT;
      [iTL, iTR, iBR, iBL].forEach(function (k) {
        var q = parts[k], rx = q.x - ccx, ry = q.y - ccy, r = Math.hypot(rx, ry) || 1;
        q.x -= ry / r * sa; q.y += rx / r * sa;
      });
    }
    if (drag) {
      var d0 = parts[drag.i];
      d0.x += (drag.tx - d0.x) * 0.3; d0.y += (drag.ty - d0.y) * 0.3;
    } else if (parts[iBL].y >= GROUND - 1 && parts[iBR].y >= GROUND - 1) {
      parts[iTL].x += (parts[iBL].x - parts[iTL].x) * 0.004;
      parts[iTR].x += (parts[iBR].x - parts[iTR].x) * 0.004;
    }
    var seg = st.len / (NSEG - 1);
    for (it = 0; it < ITER; it++) {
      for (i = 0; i < NSEG - 1; i++) solveRope(i, i + 1, seg, stiff);
      for (i = NSEG - 2; i >= 0; i--) solveRope(i, i + 1, seg, stiff);
      for (i = 0; i < cons.length; i++) solveRigid(cons[i]);
      for (i = 1; i < parts.length; i++) {
        p = parts[i];
        if (p.y > GROUND) p.y = GROUND;
        if (p.y < CEIL + 3) p.y = CEIL + 3;
        if (p.x < 6) p.x = 6;
        if (p.x > W - 6) p.x = W - 6;
      }
    }
    for (i = 1; i < parts.length; i++) {
      p = parts[i];
      if (p.y >= GROUND - 0.01) {
        p.px = p.x - (p.x - p.px) * 0.5;
        var vyi = i >= iT ? vy0[i - iT] : 0;
        p.py = (bungee && vyi / DT > 190) ? GROUND + vyi * BOUNCE : p.y;
      }
    }
  }
  function solveRope(a, c, rest, k0) {
    var A = parts[a], B = parts[c], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
    if (d <= rest || d === 0) return;
    var w = A.im + B.im; if (!w) return;
    var k = (d - rest) / d * k0;
    A.x += dx * k * A.im / w; A.y += dy * k * A.im / w;
    B.x -= dx * k * B.im / w; B.y -= dy * k * B.im / w;
  }
  function solveRigid(c) {
    var A = parts[c[0]], B = parts[c[1]], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
    if (d === 0) return;
    var w = A.im + B.im; if (!w) return;
    var k = (d - c[2]) / d;
    A.x += dx * k * A.im / w; A.y += dy * k * A.im / w;
    B.x -= dx * k * B.im / w; B.y -= dy * k * B.im / w;
  }

  function onGround() { return Math.max(parts[iBL].y, parts[iBR].y) >= GROUND - 4; }
  function feetY() { return (parts[iBL].y + parts[iBR].y) / 2; }
  function heightM() { return Math.max(0, (GROUND - feetY()) / PXM); }
  function kick() {
    st.kickDir *= -1;
    var k = 0.07 * st.kickDir;
    for (var i = NSEG - 1; i < parts.length; i++) parts[i].px -= k;
  }

  
  var keyDown = false, ptrDown = false, ptrId = null;
  var cv = document.getElementById('c'), ctx = cv.getContext('2d');
  var scale = 1;
  function toL(e) {
    var r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  }
  function hitBoy(p) {
    var a = bInv(p.x, p.y);
    if (a[0] < BX0 - 50 || a[0] > BX1 + 50 || a[1] < -40 || a[1] > BBOT + 10) return -1;
    var best = -1, bd = 1e9;
    [iTL, iTR, iBR, iBL].forEach(function (i) {
      var d = Math.hypot(parts[i].x - p.x, parts[i].y - p.y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  function clampT(p) {
    return { x: Math.min(W - 10, Math.max(10, p.x)), y: Math.min(GROUND, Math.max(CEIL + 12, p.y)) };
  }
  cv.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    var p = toL(e), i = hitBoy(p);
    if (i >= 0) { var t = clampT(p); drag = { i: i, tx: t.x, ty: t.y, id: e.pointerId }; }
    else { ptrDown = true; ptrId = e.pointerId; }
  });
  cv.addEventListener('pointermove', function (e) {
    var p = toL(e);
    if (drag && drag.id === e.pointerId) { var t = clampT(p); drag.tx = t.x; drag.ty = t.y; }
    else if (!ptrDown && !drag) cv.style.cursor = hitBoy(p) >= 0 ? 'grab' : 'pointer';
  });
  function up(e) {
    if (drag && drag.id === e.pointerId) drag = null;
    if (ptrDown && e.pointerId === ptrId) ptrDown = false;
  }
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('lostpointercapture', up);
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  function nextMode() { mode = (mode + 1) % MODES.length; resetState(); }
  function toggleDark() {
    var root = document.documentElement, dark;
    var cur = root.getAttribute('data-theme');
    if (cur) dark = cur === 'dark';
    else { try { dark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { dark = false; } }
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    readColors();
  }
  window.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowDown') { e.preventDefault(); keyDown = true; }
    else if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    else {
      var key = (e.key || '').toLowerCase();  
      if (key === 'r') resetState();
      else if (key === 'm') nextMode();
      else if (key === 'd') toggleDark();
    }
  });
  window.addEventListener('keyup', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowDown') keyDown = false;
  });
  function releaseAll() { keyDown = false; ptrDown = false; drag = null; }
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', function () { if (document.hidden) releaseAll(); });


  function update(dt) {
    var holding = (keyDown || ptrDown) && !drag, gnd = onGround(), h = st.hand;
    var eff = 0.3 + 0.7 * st.stamina;

    if (holding) {
      st.touched = true; st.slip = 0;
      if (!st.timing && st.armed) { st.timing = true; st.timer = 0; }
      if (h.mode === 'idle') h.mode = (h.y >= YL - 1) ? 'reach' : 'pull';
      if (h.mode === 'pull') {
        var dy = Math.min(120 * eff * dt, YL - h.y);
        h.y += dy;
        st.len = Math.max(LEN_MIN, st.len - dy * ROPEK * 0.85);
        if (h.y >= YL - 0.01) h.mode = 'reach';
      } else {
        h.y -= 520 * dt;
        if (h.y <= YH) { h.y = YH; h.mode = 'pull'; kick(); }
      }
      st.stamina = Math.max(0, st.stamina - 0.12 * dt);
    } else {
      h.mode = 'idle';
      h.y += (YL - h.y) * Math.min(1, dt * 8);
      if (drag) st.slip = 0;
      else if (mode === 1 && st.len < BUNGEE_LEN) st.len = BUNGEE_LEN;            
      else if (mode === 3 && !gnd && st.len < LEN_MAX) st.len = LEN_MAX;          /* die lol */
      else if ((mode === 0 || mode === 2) && !gnd && st.len < LEN_MAX) {
        st.slip = Math.min(st.slip + 900 * dt, 420);
        st.len = Math.min(LEN_MAX, st.len + st.slip * dt);
      } else st.slip = 0;
      st.stamina = Math.min(1, st.stamina + 0.28 * dt);
    }
    spinOn = mode === 2 && holding && !gnd;
    if (st.shake > 0) st.shake -= dt;
    st.grab += ((holding ? 1 : 0) - st.grab) * Math.min(1, dt * (holding ? 14 : 6));
    if (holding) st.pullT += dt;   /* the more you pull, the deader his head gets (slowly) */
    st.dead += (Math.min(1, Math.max(st.pullT / DEAD_PULL, st.lifts / DEAD_AFTER)) - st.dead) * Math.min(1, dt * 1.2);
    st.prog = Math.min(1, Math.max(0, (h.y - YH) / (YL - YH)));

    if (st.timing) { st.timer += dt; if ((gnd || mode === 1) && !holding) st.timing = false; }

    if (st.armed && holding && st.len <= LEN_MIN + 8) {
      st.armed = false; st.timing = false; st.lifts++;
      st.last = st.timer; st.celebrate = 2.0;
      if (st.best == null || st.timer < st.best) st.best = st.timer;
      fx.push({ k: 'pop', t: 0, life: 2.6, a: 'lift ' + st.lifts + '! omg ' + st.timer.toFixed(1) + ' s', b: POP_TIPS[mode] });
    }
    if (!st.armed && (gnd || mode === 1) && st.len > LEN_REST - 80) st.armed = true;
    if (st.celebrate > 0) st.celebrate -= dt;
    if (st.dust > 0) st.dust -= dt;
    for (var i = fx.length - 1; i >= 0; i--) { fx[i].t += dt; if (fx[i].t > fx[i].life) fx.splice(i, 1); }

    
    var tl = holding ? -0.03 - 0.02 * st.prog : 0, tb = holding ? 3 * st.prog : 0;
    st.lean += (tl - st.lean) * Math.min(1, dt * 7);
    st.bob += (tb - st.bob) * Math.min(1, dt * 9);
    var breath = reduceMotion ? 0 : Math.sin(T * 2.4);
    g.ang = st.lean + breath * 0.002;
    g.oy = GROUND + st.bob * 0.4 + breath * 0.8;
    g.ox = GX + st.lean * 40;
    st.slideG += ((holding ? 9 : 0) - st.slideG) * Math.min(1, dt * 6);
    if (st.blink > 0) st.blink -= dt; else st.blink = 2.4 + Math.random() * 2.2;

    
    updB();
    var da = wrap(b.ang - st.prevAng); st.prevAng = b.ang;
    st.omega = da / Math.max(dt, 1e-4);
    var c = { x: (parts[iTL].x + parts[iBR].x) / 2, y: (parts[iTL].y + parts[iBR].y) / 2 };
    st.speed = Math.hypot(c.x - st.cx, c.y - st.cy) / Math.max(dt, 1e-4); st.cx = c.x; st.cy = c.y;
    var swing = Math.abs(st.omega) * 0.7 + st.speed / 260;
    if (swing > 3.2 && !gnd) st.dizzy = 0.7; else if (st.dizzy > 0) st.dizzy -= dt;

    var kt = (holding && !gnd && !drag) ? 1 : 0;
    st.kick += (kt - st.kick) * Math.min(1, dt * (kt ? 8 : 1.8));
    var e = st.kick, ph = T * 9;
    D.ll.extra = e * (0.2 + 0.2 * Math.sin(ph)); D.lr.extra = -e * (0.2 + 0.2 * Math.sin(ph + Math.PI));
    D.ll.k = D.lr.k = 5 + 40 * e * e;
    D.al.extra = e * 0.1 * Math.sin(ph + 1); D.ar.extra = -e * 0.1 * Math.sin(ph + 2);
  }

  
  function base() { ctx.setTransform(scale, 0, 0, scale, shx * scale, shy * scale); }
  function drawStatic(n, dx, dy) {
    var sp = SPR[n]; if (!sp) return;
    if (sp.crop) ctx.drawImage(sp.img, sp.crop[0], sp.crop[1], sp.crop[2], sp.crop[3], sp.x + (dx || 0), sp.y + (dy || 0), sp.w, sp.h);
    else ctx.drawImage(sp.img, sp.x + (dx || 0), sp.y + (dy || 0), sp.w, sp.h);
  }
  function drawRot(n, J, a) {
    var sp = SPR[n]; if (!sp) return;
    ctx.save(); ctx.translate(J[0], J[1]); ctx.rotate(a);
    ctx.drawImage(sp.img, sp.x - J[0], sp.y - J[1], sp.w, sp.h);
    ctx.restore();
  }
  function drawChain(n, J, a, bend, N) {
    var sp = SPR[n]; if (!sp) return;
    var img = sp.img, sy = img.height / sp.h, capH = J[1] - sp.y;
    if (capH > 0.5) ctx.drawImage(img, 0, 0, img.width, capH * sy, sp.x, sp.y, sp.w, capH);
    var rem = sp.y + sp.h - J[1]; if (rem < 1) return;
    var h = rem / N, prev = 0;
    ctx.save(); ctx.translate(J[0], J[1]);
    for (var i = 0; i < N; i++) {
      var f = 1 + bend * (2 * (i + 0.5) / N - 1), c = a * f;
      ctx.rotate(c - prev); prev = c;
      var s0 = (capH + i * h) * sy, sh = h * sy, ex = i < N - 1 ? 5 * sy : 0;
      var sh2 = Math.min(sh + ex, img.height - s0);
      if (sh2 > 0) ctx.drawImage(img, 0, s0, img.width, sh2, sp.x - J[0], 0, sp.w, sh2 / sy);
      ctx.translate(0, h);
    }
    ctx.restore();
  }

  var ROPE_O = '#6a4b38', ROPE_F = '#d8b98f';
  function ropeStroke(pathFn, ow, fw) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = ROPE_O; ctx.lineWidth = ow; pathFn(); ctx.stroke();
    ctx.strokeStyle = ROPE_F; ctx.lineWidth = fw; pathFn(); ctx.stroke();
  }

  
  function drawBackdrop() {
    ctx.fillStyle = C.ink; ctx.globalAlpha = 0.1;
    ctx.fillRect(0, 0, W, CEIL);
    ctx.fillRect(0, GROUND + 2, W, H - GROUND);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(0, CEIL); ctx.lineTo(W, CEIL); ctx.moveTo(0, GROUND + 2); ctx.lineTo(W, GROUND + 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function drawRuler() {
    var rx = 542, step = PXM / 2;   /* a tick every 0.5 m */
    ctx.strokeStyle = C.muted; ctx.fillStyle = C.muted; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(rx, GROUND); ctx.lineTo(rx, GROUND - 6 * step); ctx.stroke();
    ctx.font = '15px "Comic Sans MS","Comic Sans","Comic Neue",sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (var m = 0; m <= 6; m++) {
      var y = GROUND - m * step;
      ctx.beginPath(); ctx.moveTo(rx - 3, y); ctx.lineTo(rx + 9, y); ctx.stroke();
      if (m > 0) ctx.fillText((m / 2) + ' m', rx + 13, y);
    }
    var topY = RIGHT.y + LEN_MIN + (BBOT - BTOP) * K;
    ctx.strokeStyle = C.accent; ctx.fillStyle = C.accent; ctx.lineWidth = 2;
    ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.moveTo(rx - 70, topY); ctx.lineTo(rx, topY); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = 'right'; ctx.fillText('top', rx - 76, topY); ctx.textAlign = 'left';
    var by = feetY();
    ctx.beginPath(); ctx.moveTo(rx - 2, by); ctx.lineTo(rx - 14, by - 8); ctx.lineTo(rx - 14, by + 8); ctx.closePath(); ctx.fill();
  }
  function shadow(x, y, rx, a) {
    ctx.fillStyle = C.ink; ctx.globalAlpha = a;
    ctx.beginPath(); ctx.ellipse(x, y, rx, rx * 0.12, 0, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
  }
  function drawPulley() {
    var m = SPR.pulley_mount, w = SPR.pulley_wheel;
    if (m) ctx.drawImage(m.img, PUL.x - 130 * MS, PUL.y - 263 * MS, 256 * MS, 384 * MS);
    if (w) { ctx.save(); ctx.translate(PUL.x, PUL.y); ctx.rotate(st.wheel); ctx.drawImage(w.img, -27, -27, 54, 54); ctx.restore(); }
  }

  function ropeHand() { return { x: lineX(st.hand.y), y: st.hand.y }; }
  function drawRopeLeft() {
    var hp = ropeHand(), sway = reduceMotion ? 0 : Math.sin(T * 1.3) * 2;
    ropeStroke(function () {
      ctx.beginPath(); ctx.moveTo(LEFT.x - 0.5, LEFT.y); ctx.lineTo(hp.x, hp.y);
      ctx.quadraticCurveTo(hp.x + 3, (hp.y + GROUND) / 2 + 10, hp.x + 14 + sway, GROUND - 8);
      ctx.quadraticCurveTo(hp.x + 30, GROUND - 4, hp.x + 24, GROUND - 12);
    }, 5.8, 3.8);
  }
  function drawRopeArc() {
    ropeStroke(function () { ctx.beginPath(); ctx.arc(PUL.x, PUL.y, WR + 0.5, Math.PI, 2 * Math.PI); }, 5.8, 3.8);
  }
  function drawRopeRight() {
    ropeStroke(function () {
      ctx.beginPath(); ctx.moveTo(RIGHT.x + 0.5, RIGHT.y);
      for (var i = 1; i < NSEG; i++) ctx.lineTo(parts[i].x, parts[i].y);
    }, 5.8, 3.8);
  }

  /* the mei */
  function meiFace() {
    var holding = (keyDown || ptrDown) && !drag;
    if (st.celebrate > 0) return 'face_joy';
    if (holding) return 'face_effort';
    if (st.blink < 0.12) return 'face_blink';
    return 'face_idle';
  }
  function drawPullArm() {
    var S = [630, 485], E0 = [652, 568], G0 = [712, 708];
    var L1 = Math.hypot(E0[0] - S[0], E0[1] - S[1]), L2 = Math.hypot(G0[0] - E0[0], G0[1] - E0[1]);
    var hp = ropeHand(), ra = gInv(hp.x, hp.y);
    var tx = G0[0] + (ra[0] - G0[0]) * st.grab, ty = G0[1] + (ra[1] - G0[1]) * st.grab;
    var dx = tx - S[0], dy = ty - S[1], d = Math.hypot(dx, dy) || 1;
    var dc = Math.min(Math.max(d, Math.abs(L1 - L2) + 2), L1 + L2 - 0.5);
    var a = (L1 * L1 - L2 * L2 + dc * dc) / (2 * dc), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    var ux = dx / d, uy = dy / d, px = -uy, py = ux;
    if (py < 0) { px = -px; py = -py; }
    var E = [S[0] + ux * a + px * hh, S[1] + uy * a + py * hh], G = [S[0] + ux * dc, S[1] + uy * dc];
    var a1 = Math.atan2(E[1] - S[1], E[0] - S[0]) - Math.atan2(E0[1] - S[1], E0[0] - S[0]);
    var a2 = Math.atan2(G[1] - E[1], G[0] - E[0]) - Math.atan2(G0[1] - E0[1], G0[0] - E0[0]);
    var up = SPR.puller_arm_upper, lo = SPR.puller_arm_lower;
    if (lo) { ctx.save(); ctx.translate(E[0], E[1]); ctx.rotate(a2); ctx.drawImage(lo.img, lo.x - E0[0], lo.y - E0[1], lo.w, lo.h); ctx.restore(); }
    if (up) { ctx.save(); ctx.translate(S[0], S[1]); ctx.rotate(a1); ctx.drawImage(up.img, up.x - S[0], up.y - S[1], up.w, up.h); ctx.restore(); }
  }
  function drawmei() {
    shadow(GX, GROUND + 5, 78, 0.16);
    ctx.save();
    ctx.translate(g.ox, g.oy); ctx.rotate(g.ang); ctx.scale(K, K); ctx.translate(-531, -965);
    drawChain('puller_hair_back', [525, 125], D.gb.rel, 0.8, 12);
    ctx.save(); base(); drawRopeLeft(); ctx.restore();
    drawPullArm();
    drawStatic('puller_body');
    drawChain('puller_arm_rest', [478, 495], D.gr.rel, 0.3, 6);
    drawStatic('puller_head');
    drawChain('puller_hair_front', [544, 100], D.gf.rel, 0.8, 10);
    drawStatic(meiFace());
    drawStatic('puller_glasses', 0, st.slideG);
    ctx.restore();
  }

  /* the kevin */
  function kevinFace() {
    if (st.dead > DEAD_FACE_AT && SPR.boy_face_scared) return 'boy_face_scared';   /* dead = X-X */
    if (onGround()) {
      var hurt = st.lifts >= CONFUSED_AFTER || (mode === 3 && st.slammed);   
      return (hurt && SPR.boy_face_confused) ? 'boy_face_confused' : 'boy_face_love';
    }
    return st.dizzy > 0 ? 'boy_face_dizzy' : 'boy_face_scared';
  }
  function harness(col, w) {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(BCX, -58); ctx.quadraticCurveTo(262, 130, 350, 455); ctx.lineTo(418, 525); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(BCX, -58); ctx.quadraticCurveTo(782, 130, 694, 455); ctx.lineTo(626, 525); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(418, 525); ctx.quadraticCurveTo(BCX, 562, 626, 525); ctx.stroke();
  }
  function drawKevin() {
    var fx0 = (parts[iBL].x + parts[iBR].x) / 2, air = Math.max(0, (GROUND - feetY()) / 200);
    shadow(fx0, GROUND + 5, 46 - Math.min(18, air * 30), 0.16 * (1 - Math.min(0.7, air)));
    ctx.save();
    ctx.translate(b.x, b.y); ctx.rotate(b.ang); ctx.scale(b.s, b.s); ctx.translate(-BX0, -BTOP);
    var hasLoop = !!SPR.boy_loop;
    function after(n) { if (hasLoop && LOOP_AFTER === n) drawStatic('boy_loop'); }
    drawRot('boy_arm_r', [620, 458], D.ar.rel); after('boy_arm_r');
    drawChain('boy_coat_back', [527, 585], D.back.rel, 0.9, 8); after('boy_coat_back');
    drawRot('boy_leg_r', [578, 665], D.lr.rel); after('boy_leg_r');
    drawRot('boy_leg_l', [475, 665], D.ll.rel); after('boy_leg_l');
    drawStatic('boy_chest'); after('boy_chest');
    if (!hasLoop) { harness(ROPE_O, 18); harness(ROPE_F, 11.5); }   
    drawChain('boy_coat_l', [458, 590], D.cl.rel, 0.7, 8); after('boy_coat_l');
    drawChain('boy_coat_r', [596, 590], D.cr.rel, 0.7, 8); after('boy_coat_r');
    drawRot('boy_arm_l', [425, 462], D.al.rel); after('boy_arm_l');
    drawStatic('boy_head');
    if (st.dead > 0.002 && SPR.boy_headdead) { ctx.globalAlpha = st.dead; drawStatic('boy_headdead'); ctx.globalAlpha = 1; }
    after('boy_head');
    drawChain('boy_hair_front', [534, 85], D.hf.rel, 0.8, 8); after('boy_hair_front');
    drawStatic(kevinFace()); after('boy_face');
    drawRot('boy_hair_ahoge', [455, 105], D.ah.rel * D.ah.sign); after('boy_hair_ahoge');
    ctx.restore();
  }

  function drawFx() {
    fx.forEach(function (f) {
      var k = f.t / f.life;
      if (f.k === 'dust') {
        ctx.fillStyle = C.muted; ctx.globalAlpha = 0.5 * (1 - k);
        [-1, 1].forEach(function (s) {
          for (var j = 0; j < 3; j++) {
            ctx.beginPath(); ctx.arc(f.x + s * (10 + k * 40 + j * 9), GROUND - 4 - k * 10 - j * 3, 4 + k * 7 - j, 0, 6.2832); ctx.fill();
          }
        });
        ctx.globalAlpha = 1;
      } else if (f.k === 'pop') {
        var a = Math.min(1, (f.life - f.t) / 0.6), y = 330 - f.t * 18;
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = C.accent; ctx.font = 'bold 36px "Comic Sans MS","Comic Sans","Comic Neue",sans-serif';
        ctx.fillText(f.a, 290, y);
        ctx.fillStyle = C.ink; ctx.font = '20px "Comic Sans MS","Comic Sans","Comic Neue",sans-serif';
        ctx.fillText(f.b, 290, y + 32);
        ctx.globalAlpha = 1;
      }
    });
    ctx.fillStyle = C.muted; ctx.font = '14px "Comic Sans MS","Comic Sans","Comic Neue",sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('mode: ' + MODES[mode] + ' [m]  -  ' + MODE_TIPS[mode], 10, GROUND + 28);
    if (!st.touched) {
      ctx.save(); ctx.translate(26, 400); ctx.rotate(-0.06);
      ctx.fillStyle = C.accent; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = 'bold 36px "Comic Sans MS","Comic Sans","Comic Neue",sans-serif';
      ctx.fillText('hold to pull', 0, 0);
      ctx.restore();
    }
  }

  function draw() {
    if (st.shake > 0) {
      var amp = Math.min(1, st.shake / 0.45) * 12;
      shx = (Math.random() * 2 - 1) * amp; shy = (Math.random() * 2 - 1) * amp;
    } else { shx = shy = 0; }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    base();
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    drawBackdrop();
    drawRuler();
    drawPulley();
    drawmei();
    drawRopeRight();
    drawRopeArc();
    drawKevin();
    drawFx();
  }


  var elH = document.getElementById('vH'), elL = document.getElementById('vL'), elT = document.getElementById('vT'),
    elB = document.getElementById('vB'), elS = document.getElementById('stam'), elM = document.getElementById('mode');
  var hudAcc = 0;
  function hud(dt) {
    hudAcc += dt; if (hudAcc < 0.1) return; hudAcc = 0;
    elH.textContent = heightM().toFixed(1);
    elL.textContent = st.lifts;
    elT.textContent = st.timing ? st.timer.toFixed(1) : (st.last != null ? st.last.toFixed(1) : '-');
    elB.textContent = st.best != null ? st.best.toFixed(1) : '-';
    elS.style.transform = 'scaleX(' + st.stamina.toFixed(3) + ')';
    elM.textContent = 'mode: ' + MODES[mode];
  }
  function fit() {
    var stage = cv.parentElement, r = stage.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    var s = Math.min(r.width / W, r.height / H);
    var cw = Math.floor(W * s), ch = Math.floor(H * s), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    scale = cv.width / W;
  }
  if (window.ResizeObserver) new ResizeObserver(fit).observe(cv.parentElement);
  window.addEventListener('resize', fit);
  document.getElementById('reset').addEventListener('click', function () { resetState(); this.blur(); });
  elM.addEventListener('click', function () { nextMode(); this.blur(); });

  var T = 0, last = 0, acc = 0, frameN = 0, gPrev = { ox: GX, oy: GROUND, ang: 0 };
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    T += dt;
    if (frameN++ % 20 === 0) readColors();
    gPrev.ox = g.ox; gPrev.oy = g.oy; gPrev.ang = g.ang;
    update(dt);
    acc += dt;
    var n = Math.min(24, Math.floor(acc / DT));
    for (var s = 0; s < n; s++) {
      var f = (s + 1) / n;
      gEff.ox = gPrev.ox + (g.ox - gPrev.ox) * f; gEff.oy = gPrev.oy + (g.oy - gPrev.oy) * f; gEff.ang = gPrev.ang + (g.ang - gPrev.ang) * f;
      step(); updB();
      for (var k in D) D[k].step(DT, T);
    }
    acc -= n * DT; if (acc > DT * 24) acc = 0;
    updB();
    draw(); hud(dt);
    requestAnimationFrame(frame);
  }

  readColors();
  fit();
  loadAll(function () {
    resetState();
    requestAnimationFrame(function (t0) { last = t0; frame(t0); });
  });
})();

window.addEventListener('keydown', function (e) {
  var k = e.key.toLowerCase();
  if (k === 'escape' || k === 'q') location.href = 'index.html';
});
