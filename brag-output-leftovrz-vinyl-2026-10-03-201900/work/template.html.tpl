<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width={{W}}, height={{H}}">
<title>LEFTOVRZ — The Premium+ Mixtape</title>
<script src="assets/gsap.min.js"></script>
<script src="assets/audio-energy.js"></script>
<style>
{{FONTS}}
:root{--ink:#141210;--bg:#0A0806;--acc:#F8C038;--cream:#F3E9D8;--disp:'Barlow Condensed',Impact,sans-serif;--mono:'Space Mono',monospace;--tag:'Sedgwick Ave Display',cursive}
*{box-sizing:border-box;margin:0;padding:0}
body{margin:0;background:var(--bg);font-family:'Barlow',sans-serif}
#root{position:relative;width:100%;height:100%;overflow:hidden;background:var(--bg)}
.clip{position:absolute;inset:0;overflow:hidden;background:transparent}
.in{position:absolute;inset:0;overflow:hidden}
.mono{font:700 28px/1 var(--mono);letter-spacing:.2em;text-transform:uppercase}
.tag{font:400 76px/1.1 var(--tag)}
.dots{position:absolute;inset:0;background-image:radial-gradient(var(--dot) 24%,transparent 27%);background-size:13px 13px;opacity:.09}
.bokeh{position:absolute;inset:0;opacity:.45;filter:blur(9px);background:
 radial-gradient(circle 26px at 12% 9%,#ffb347 60%,transparent 72%),radial-gradient(circle 18px at 30% 5%,#ffd27a 60%,transparent 72%),
 radial-gradient(circle 30px at 55% 11%,#ff9f3a 60%,transparent 72%),radial-gradient(circle 20px at 76% 6%,#ffc46b 60%,transparent 72%),
 radial-gradient(circle 34px at 92% 12%,#ffb347 60%,transparent 72%)}
.pplus{font:900 1em/1 var(--disp);letter-spacing:-.01em}
.pplus em{font-style:normal;color:#E8352A}
.note{position:absolute;font-family:'Barlow',serif;line-height:1;opacity:0;text-shadow:0 0 18px rgba(255,200,120,.55)}
.tp{position:absolute;width:150px;height:46px;background:rgba(246,236,206,.78);box-shadow:0 2px 6px rgba(0,0,0,.15)}

/* vinyl: the disc spins, the sheen stays put */
.vin{position:absolute;border-radius:50%}
.vin .disc{position:absolute;inset:0;border-radius:50%;background:
  radial-gradient(circle,transparent 0 31.5%,rgba(0,0,0,.4) 31.8% 32.6%,transparent 33%),
  repeating-radial-gradient(circle,rgba(0,0,0,0) 0 5px,rgba(0,0,0,.17) 5px 6px),
  radial-gradient(circle,rgba(255,255,255,.1),rgba(0,0,0,.28)),var(--v);
  box-shadow:inset 0 0 0 8px rgba(0,0,0,.35),0 30px 70px rgba(0,0,0,.5)}
.lab{position:absolute;left:34%;top:34%;width:32%;height:32%;border-radius:50%;background:var(--l);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8%;overflow:hidden;color:#141210}
.lab img{width:66%}
.lab small{font:700 1em/1 var(--mono);letter-spacing:.08em;white-space:nowrap}
.lab .ltxt{font:900 3em/1 var(--disp);letter-spacing:.02em;color:#141210;opacity:.85}
.lsplit{position:absolute;inset:14% 0;display:flex;flex-direction:column;align-items:center;justify-content:space-between}
.vin .sheen{position:absolute;inset:0;border-radius:50%;pointer-events:none;mix-blend-mode:screen;opacity:.8;background:conic-gradient(from 0deg,transparent 0 5%,rgba(255,255,255,.3) 10%,transparent 15% 52%,rgba(255,255,255,.22) 58%,transparent 64%)}
.vin .hole{position:absolute;left:49%;top:49%;width:2%;height:2%;border-radius:50%;background:#d9d9d9}

/* 0 intro */
#i-top{position:absolute;left:0;right:0;top:250px;display:flex;flex-direction:column;align-items:center;color:#fff;text-align:center}
#i1{color:rgba(243,233,216,.85)}
#i2{margin-top:26px;font:400 140px/1 var(--tag)}
#i3{font:400 176px/1 var(--tag);color:var(--acc);margin-top:-6px}
#persp{position:absolute;left:0;top:830px;width:1080px;height:1180px;perspective:1300px}
#plane{position:absolute;left:-50px;top:0;width:1180px;height:1180px;transform:rotateX(62deg);transform-style:preserve-3d}
#platter{position:absolute;inset:-34px;border-radius:50%;background:radial-gradient(circle,#2a2a2a 60%,#111 70%,#3a3a3a 71%,#0b0b0b 74%);transform:translateZ(-36px)}
#v0{left:0;top:0;font-size:26px}
#clamp{position:absolute;left:420px;top:1250px;opacity:0}
#i1,#i2,#i3{opacity:0}
#arm0{position:absolute;left:550px;top:630px}
#spark0{position:absolute;left:700px;top:1330px;width:0;height:0}
#spark0 i{position:absolute;left:-60px;top:-22px;width:120px;height:44px;border-radius:50%;border:6px solid #FFE9A8;opacity:0}

/* 1 title */
#biglab{position:absolute;left:140px;top:170px;width:800px;height:800px}
#ringsvg{position:absolute;inset:0;filter:drop-shadow(0 30px 40px rgba(0,0,0,.35))}
#pp{position:absolute;left:0;right:0;top:470px;text-align:center;font-size:190px;color:#141210}
#tl{position:absolute;left:90px;right:90px;top:1070px;color:#141210}
#tl .side{margin:28px 0 8px;font:700 28px/1 var(--mono);letter-spacing:.3em;opacity:.75}
#tl .tr{display:flex;align-items:baseline;gap:22px;padding:8px 0;border-bottom:3px dotted rgba(20,18,16,.45)}
#tl .tr b{font:900 56px/1 var(--disp);width:70px}
#tl .tr span{flex:1;font:800 56px/1 var(--disp);white-space:nowrap}
#tl .tr em{font:700 30px/1 var(--mono);font-style:normal}
#heavy{position:absolute;left:0;right:0;top:1660px;text-align:center;font-size:118px;color:var(--cream);transform:rotate(-4deg);text-shadow:0 6px 0 rgba(0,0,0,.25)}

/* tracks */
.hdr{position:absolute;left:60px;right:60px;top:90px;display:flex;justify-content:space-between;font:700 28px/1 var(--mono);letter-spacing:.18em}
.recw .vin{left:280px;top:220px;font-size:18px}
.sleeve{position:absolute;left:60px;top:190px;width:660px;height:880px;background:var(--cream);box-shadow:0 30px 60px rgba(0,0,0,.45);transform:rotate(-2deg)}
.sleeve .ph{position:absolute;left:30px;top:30px;width:600px;height:800px;overflow:hidden;background:#EDE9E3}
.ang{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.slv{position:absolute;left:30px;right:30px;top:844px;font:700 18px/1 var(--mono);letter-spacing:.2em;color:#141210}
.tp1{left:-46px;top:-6px;transform:rotate(-35deg)}.tp2{right:-46px;top:-6px;transform:rotate(35deg)}
.stk{position:absolute;left:560px;top:880px;width:240px;height:240px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#141210;box-shadow:0 12px 24px rgba(0,0,0,.35)}
.stk small{font:700 30px/1 var(--mono)}
.stk b{font:900 84px/.95 var(--disp)}
.info{position:absolute;left:60px;right:60px;top:1130px}
.info h2{font:900 170px/.86 var(--disp);margin-top:8px}
.info h2.long{font-size:104px;line-height:.92}
.meta{margin-top:28px;display:flex;gap:28px;align-items:center}
.sz{font:700 34px/1 var(--mono);letter-spacing:.12em;padding:12px 16px;border:3px solid currentColor}
.stamp{font:900 46px/1 var(--disp);letter-spacing:.06em;padding:8px 16px;border:6px double currentColor;transform:rotate(-6deg)}
.prog{position:absolute;left:60px;right:60px;top:1600px;display:flex;align-items:center;gap:22px;font:700 30px/1 var(--mono)}
.prog .bar{position:relative;flex:1;height:6px;background:rgba(128,128,128,.45)}
.prog .fill{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:0 50%;transform:scaleX(0)}
.prog .knob{position:absolute;left:0;top:-9px;width:24px;height:24px;border-radius:50%;margin-left:-12px}
.tape{position:absolute;left:-60px;right:-60px;top:1724px;height:106px;background:#0A0806;transform:rotate(-3deg);overflow:hidden;display:flex;align-items:center}
.tape span{white-space:nowrap;font:900 60px/1 var(--disp);color:var(--acc);letter-spacing:.04em;padding-left:20px}
#t4 .tape{background:#E8352A}#t4 .tape span{color:#0A0806}

/* 6 crate */
#ch{position:absolute;top:110px;left:0;right:0;text-align:center;color:var(--cream)}
#ch b{display:block;font:900 112px/1 var(--disp)}
#ch span{display:block;margin-top:18px;color:var(--acc)}
#crate{position:absolute;inset:0;perspective:1600px}
.back{position:absolute;left:230px;width:620px;height:1000px;box-shadow:0 -6px 20px rgba(0,0,0,.45)}
#bk2{top:368px;background:#1E2A47}#bk1{top:404px;background:#B78BF0}
.card{position:absolute;left:200px;top:440px;width:680px;height:1060px;background:var(--cream);box-shadow:0 -10px 40px rgba(0,0,0,.5);transform-origin:50% 100%}
.card img{position:absolute;left:40px;top:40px;width:600px;height:800px;object-fit:contain;background:#EDE9E3}
#cfront{position:absolute;left:0;right:0;top:1460px;bottom:0;background:linear-gradient(#a8743f,#7a4f27);border-top:12px solid #5a3818;box-shadow:0 -20px 40px rgba(0,0,0,.45)}
#cfront .plank{position:absolute;left:0;right:0;height:4px;background:rgba(0,0,0,.25)}
#cfront .plank:nth-child(1){top:150px}#cfront .plank:nth-child(2){top:300px}#cfront .plank:nth-child(3){top:420px}
.stencil{position:absolute;left:0;right:0;top:34px;text-align:center;color:rgba(20,18,16,.8);font-size:24px}
.ctag{position:absolute;left:40px;right:40px;top:96px;text-align:center;color:var(--cream)}
.ctag b{display:block;font:900 92px/1 var(--disp);text-shadow:0 4px 0 rgba(0,0,0,.35)}
.ctag span{display:inline-block;margin-top:16px;font:700 36px/1 var(--mono);color:#141210;background:var(--acc);padding:10px 16px}

/* 7 side B record */
#o-top{position:absolute;top:90px;left:0;right:0;text-align:center;color:var(--cream)}
#o-top b{display:block;font:900 104px/1 var(--disp)}
#o-top .tag{font:400 112px/1 var(--tag);color:var(--acc);margin-top:-4px}
#ring2{position:absolute;left:-50px;top:370px}
#v7{left:40px;top:460px;font-size:16px}
#clamp7{position:absolute;left:485px;top:905px;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle at 38% 34%,#fff,#d3d6da 30%,#868b91 62%,#45494e);box-shadow:0 12px 26px rgba(0,0,0,.6),inset 0 0 0 8px rgba(255,255,255,.22)}
#o-bot{position:absolute;top:1660px;left:0;right:0;text-align:center;color:var(--cream)}

/* 8 poster */
#v8{left:-380px;top:1620px;font-size:16px}
.wm{position:absolute;-webkit-mask:url('assets/img/wordmark-1.png') center/contain no-repeat;mask:url('assets/img/wordmark-1.png') center/contain no-repeat}
#wm8{left:90px;top:330px;width:900px;height:208px;background:#141210}
#p1{position:absolute;left:0;right:0;top:610px;text-align:center;font-size:200px;color:#141210}
#p2{position:absolute;left:60px;right:60px;top:850px;text-align:center;font-size:88px;color:#141210}
#p3{left:560px;top:1080px;width:320px;height:320px;background:var(--acc)}
#p3 b{font-size:110px}
#p4{position:absolute;left:0;right:0;top:1470px;text-align:center;color:#141210}
.tpA{left:40px;top:330px;transform:rotate(-30deg)}.tpB{right:40px;top:330px;transform:rotate(30deg)}

/* fx */
#fx{z-index:50}
#disc{left:-1150px;top:-190px;font-size:40px}
#sideb{position:absolute;left:0;right:0;top:760px;text-align:center;font:900 300px/1 var(--disp);color:var(--acc);-webkit-text-stroke:8px #0A0806;opacity:0}
#torn{position:absolute;left:0;top:-70px;width:1080px;height:70px;opacity:0}
#flash{position:absolute;inset:0;background:#fff;opacity:0}
#grain{position:absolute;inset:-80px;opacity:.13;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)'/%3E%3C/svg%3E")}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="{{W}}" data-height="{{H}}" data-duration="{{D}}">
{{SECS}}
  <section id="fx" class="clip" data-start="0" data-duration="{{D}}" data-track-index="14">
    <div class="vin" id="disc" data-layout-allow-overflow data-layout-ignore style="width:2300px;height:2300px;--v:#FF6A1A;--l:#F3E9D8"><div class="disc" id="disc-d"><div class="lab"><img src="assets/img/logo-0.png" alt=""><small>PREMIUM+ · A1</small></div></div><div class="sheen"></div><i class="hole"></i></div>
    <div id="sideb" data-layout-ignore aria-hidden="true">SIDE B</div>
    <svg id="torn" viewBox="0 0 1080 70" preserveAspectRatio="none"><path d="M0 0 H1080 V34 L1050 52 L1020 30 L985 58 L950 36 L915 62 L880 34 L842 54 L806 28 L770 60 L735 38 L700 56 L662 30 L628 62 L590 36 L556 54 L520 26 L484 58 L450 34 L414 60 L378 32 L342 56 L306 30 L270 62 L234 38 L198 54 L162 28 L126 58 L90 34 L54 60 L18 36 L0 50 Z" fill="#EFE6D2"/></svg>
    <div id="grain"></div><div id="flash"></div>
  </section>
  <audio id="music" data-timeline-role="music" src="assets/music/jet-set.mp3" data-start="0" data-duration="{{D}}" data-track-index="20" data-volume="0.9"
    data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":1},{"t":24.3,"v":1},{"t":{{D}},"v":0}]}]}'></audio>
</div>
<script>
(function () {
  var tl = gsap.timeline({ paused: true });
  var B = 0.5458;
  function k(n) { return +(0.017 + n * B).toFixed(3); }        /* beat n of JET SET (~110 BPM, measured); the drop is beat 7 */
  var TAPS = {{TAPS}};
  var SL = "power4.out", E = "power3.out";
  function slap(sel, t, s, rot, endRot) { tl.set(sel, { opacity: 0 }, 0); tl.fromTo(sel, { opacity: 0, scale: s || 1.7, rotation: rot || 0 }, { opacity: 1, scale: 1, rotation: endRot || 0, duration: 0.15, ease: SL, immediateRender: false }, t); }
  function rise(sel, t, dy) { tl.set(sel, { opacity: 0 }, 0); tl.fromTo(sel, { opacity: 0, y: dy || 40 }, { opacity: 1, y: 0, duration: 0.24, ease: SL, immediateRender: false }, t); }
  function flash(t, o) { tl.fromTo("#flash", { opacity: o }, { opacity: 0, duration: 0.18, ease: "power2.out", immediateRender: false }, t); }
  var SH = [[14, -9], [-11, 7], [8, 9], [-5, -6], [3, 4], [0, 0]];
  function shake(t, w, m) { SH.forEach(function (p, i) { tl.set(w, { x: p[0] * m, y: p[1] * m }, t + i * 0.035); }); }
  function spin(sel, a, b, degPerSec) { tl.fromTo(sel, { rotation: 0 }, { rotation: (degPerSec || 250) * (b - a), duration: b - a, ease: "none", immediateRender: false }, a); }
  function note(sel, t) { tl.fromTo(sel, { opacity: 0, y: 0, rotation: -12, scale: 0.6 }, { opacity: 1, y: -90, rotation: 0, scale: 1, duration: 0.16, ease: "power2.out", immediateRender: false }, t);
                          tl.to(sel, { opacity: 0, y: -420, rotation: 16, duration: 0.9, ease: "power1.in" }, t + 0.16); }
  tl.set("#flash", { opacity: 0 }, 0);
  var seed = 9; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  for (var f = 0; f < {{FRAMES}}; f++) { (function (x, y) { tl.call(function () { gsap.set("#grain", { x: x, y: y }); }, [], f / 30); })(Math.round(rnd() * 80 - 40), Math.round(rnd() * 80 - 40)); }
  /* the kick lights up the vinyl sheen */
  var AB = window.AUDIO_B || [];
  for (var g = 0; g < AB.length; g++) { (function (v) { tl.call(function () { gsap.set(".sheen", { opacity: 0.55 + v * 0.45 }); }, [], g / 30); })(AB[g]); }

  /* ---------- 0 intro: the clamp steps down on each hit, the arm swings in, the needle drops on the kick ---------- */
  var DROP = k(7);
  spin("#v0-d", 0, DROP + 0.4, 230);
  rise("#i1", TAPS[1], 20); slap("#i2", TAPS[3], 1.5, -4); slap("#i3", TAPS[4], 1.7, 5, -3);
  tl.set("#clamp", { y: -420, opacity: 0 }, 0);
  tl.fromTo("#clamp", { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.14, ease: "back.out(2)", immediateRender: false }, TAPS[0]);
  for (var c = 1; c <= 4; c++) {
    tl.to("#clamp", { y: -420 + c * 105, duration: 0.09, ease: "power3.in" }, TAPS[c] - 0.09);
    tl.fromTo("#clamp", { scaleY: 0.86 }, { scaleY: 1, transformOrigin: "50% 100%", duration: 0.2, ease: "back.out(3)", immediateRender: false }, TAPS[c]);
  }
  tl.fromTo("#clamp", { filter: "brightness(1.9)" }, { filter: "brightness(1)", duration: 0.35, immediateRender: false }, TAPS[5]);
  TAPS.forEach(function (t, i) {
    note("#n0-" + (2 * i), t); note("#n0-" + (2 * i + 1), t + 0.03);
    tl.fromTo("#persp", { y: 0 }, { y: 7, duration: 0.05, yoyo: true, repeat: 1, immediateRender: false }, t);
  });
  tl.set("#arm0", { rotation: -34, svgOrigin: "420 90" }, 0);
  tl.to("#arm0", { rotation: -16, svgOrigin: "420 90", duration: 0.14, ease: "power3.out" }, TAPS[6] - 0.03);
  tl.to("#arm0", { rotation: -6, svgOrigin: "420 90", duration: 0.14, ease: "power3.out" }, TAPS[7] - 0.03);
  tl.to("#arm0", { rotation: 0, svgOrigin: "420 90", duration: 0.11, ease: "power3.in" }, DROP - 0.12);
  tl.fromTo("#spark0 i", { opacity: 1, scale: 0.3 }, { opacity: 0, scale: 3.4, duration: 0.4, ease: "power2.out", immediateRender: false }, DROP);
  flash(DROP, 0.6); shake(DROP, "#persp", 1);
  /* transition: dive through the label */
  tl.to("#s0in", { scale: 5, transformOrigin: "540px 1420px", duration: 0.45, ease: "power3.in" }, DROP - 0.03);
  tl.set("#s1in", { clipPath: "circle(0px at 540px 1420px)" }, 0);
  tl.to("#s1in", { clipPath: "circle(2300px at 540px 1420px)", duration: 0.42, ease: "power2.in" }, DROP);

  /* ---------- 1 title ---------- */
  spin("#ringsvg", DROP - 0.02, k(11) + 0.35, 40);
  slap("#pp", k(8), 1.8, -6);
  rise("#sa", k(8.5), 20); rise("#tr0", k(8.5), 30); rise("#tr1", k(9), 30);
  rise("#sb", k(9.5), 20); rise("#tr2", k(9.5), 30); rise("#tr3", k(10), 30);
  slap("#heavy", k(10.5), 1.6, 6, -4);

  /* transition: a giant record rolls across and wipes in track A1 */
  var V = 6145, R = 1150, t0 = k(11) - 0.36;
  tl.set("#disc", { x: 2230 }, 0);
  tl.set("#t1in", { clipPath: "inset(0px 0px 0px 1080px)" }, 0);
  tl.to("#disc", { x: 1080, duration: 1150 / V, ease: "none" }, t0);
  tl.to("#disc", { x: 0, duration: 1080 / V, ease: "none" }, t0 + 1150 / V);
  tl.to("#t1in", { clipPath: "inset(0px 0px 0px 0px)", duration: 1080 / V, ease: "none" }, t0 + 1150 / V);
  tl.to("#disc", { x: -1150, duration: 1150 / V, ease: "none" }, t0 + 2230 / V);
  tl.fromTo("#disc-d", { rotation: 0 }, { rotation: -3380 / R * 57.3, duration: 3380 / V, ease: "none", immediateRender: false }, t0);

  /* ---------- the tracks ---------- */
  var SEC = {};
  ["t1", "t2", "t3", "t4"].forEach(function (id) { var el = document.getElementById(id); SEC[id] = [+el.dataset.start, +el.dataset.start + +el.dataset.duration]; });
  function track(id, s0, beats, stick) {
    var a = SEC[id][0], b = SEC[id][1];
    if (id !== "t4") spin("#" + id + "-v-d", a, b, 260);
    tl.set("#" + id + "-v", { x: -300 }, 0);
    tl.to("#" + id + "-v", { x: 0, duration: 0.36, ease: "power3.out" }, k(s0 + 0.5));
    rise("#" + id + "-br", k(s0 + 0.5), 0);
    tl.from("#" + id + "-br", { x: -40, duration: 0.22, ease: E, immediateRender: false }, k(s0 + 0.5));
    rise("#" + id + "-n", k(s0 + 0.5) + 0.04, 50);
    tl.set("#" + id + "-st", { opacity: 0 }, 0);
    tl.fromTo("#" + id + "-st", { opacity: 0, scale: 2.2, rotation: -30 }, { opacity: 1, scale: 1, rotation: 10, duration: 0.16, ease: SL, immediateRender: false }, k(s0 + stick));
    shake(k(s0 + stick), "#" + id + "-sl", 0.4);
    rise("#" + id + "-m", k(s0 + 2.5), 24);
    beats.forEach(function (bt, j) {
      var el = "#" + id + "-p" + j;
      tl.set(el, { opacity: j === 0 ? 1 : 0 }, 0);
      if (j > 0) tl.fromTo(el, { opacity: 1, scale: 1.14, rotation: j % 2 ? 2 : -2 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: E, immediateRender: false }, k(bt));
      if (j < beats.length - 1) tl.set(el, { opacity: 0 }, k(beats[j + 1]));
    });
    tl.fromTo("#" + id + "-f", { scaleX: 0 }, { scaleX: 1, duration: k(s0 + 4) - k(s0), ease: "none", immediateRender: false }, k(s0));
    var bw = document.querySelector("#" + id + " .bar").offsetWidth;
    tl.fromTo("#" + id + "-k", { x: 0 }, { x: bw, duration: k(s0 + 4) - k(s0), ease: "none", immediateRender: false }, k(s0));
    tl.fromTo("#" + id + "-tp", { x: 0 }, { x: -700, duration: b - a, ease: "none", immediateRender: false }, a);
  }
  {{TRACKJS}}

  /* transition A1 -> A2: scratch it back and forth on the 16ths, then whip */
  var sc = k(14.5);
  [[-56, 9], [40, -7], [-74, 11], [30, -5]].forEach(function (p, i) { tl.to("#t1in", { x: p[0], skewX: p[1], duration: 0.06, ease: "power2.inOut" }, sc + i * 0.068); });
  tl.to("#t1in", { x: 1150, skewX: -24, duration: 0.13, ease: "power2.in" }, k(15) - 0.12);
  tl.set("#t2in", { x: -1150, skewX: 24 }, 0);
  tl.to("#t2in", { x: 0, skewX: 0, duration: 0.22, ease: "power3.out" }, k(15) - 0.01);
  flash(k(15), 0.25);

  /* transition A2 -> B1: flip the record over to side B */
  tl.to("#t2in", { rotationY: 90, transformPerspective: 1400, duration: 0.2, ease: "power2.in" }, k(19) - 0.2);
  tl.set("#t3in", { rotationY: -90, transformPerspective: 1400 }, 0);
  tl.to("#t3in", { rotationY: 0, transformPerspective: 1400, duration: 0.26, ease: "power2.out" }, k(19));
  tl.fromTo("#sideb", { opacity: 1, scale: 1.8, rotation: -14 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.16, ease: SL, immediateRender: false }, k(19));
  tl.to("#sideb", { opacity: 0, scale: 1.15, duration: 0.25, ease: "power2.in" }, k(19) + 0.5);
  flash(k(19), 0.45);

  /* transition B1 -> B2: dive into the spinning label */
  tl.to("#t3in", { scale: 4.5, transformOrigin: "690px 630px", duration: 0.4, ease: "power3.in" }, k(23) - 0.38);
  tl.set("#t4in", { clipPath: "circle(0px at 690px 630px)" }, 0);
  tl.to("#t4in", { clipPath: "circle(2300px at 690px 630px)", duration: 0.32, ease: "power2.in" }, k(23) - 0.3);
  flash(k(23), 0.3);

  /* B2 spins, the track drops out on beat 24 and the record stops; it slams back on 25 */
  var a4 = SEC.t4[0], b4 = SEC.t4[1];
  tl.fromTo("#t4-v-d", { rotation: 0 }, { rotation: 260 * (k(24) - a4), duration: k(24) - a4, ease: "none", immediateRender: false }, a4);
  tl.to("#t4-v-d", { rotation: "+=70", duration: 0.5, ease: "power2.out" }, k(24));
  tl.to("#t4-v-d", { rotation: "+=" + Math.round(260 * (b4 - k(25))), duration: b4 - k(25), ease: "none" }, k(25));
  tl.to("#t4in", { filter: "grayscale(1) brightness(0.72)", rotation: -2.5, scale: 0.95, duration: 0.45, ease: "power2.out" }, k(24));
  tl.to("#t4in", { filter: "grayscale(0) brightness(1)", rotation: 0, scale: 1, duration: 0.12, ease: "power3.out" }, k(25));
  flash(k(25), 0.4); shake(k(25), "#t4-sl", 1);

  /* transition B2 -> crate: the sleeve tips forward into the crate */
  tl.to("#t4in", { rotationX: -95, transformOrigin: "50% 100%", transformPerspective: 1500, duration: 0.36, ease: "power2.in" }, k(27) - 0.34);

  /* ---------- 6 the crate: flip through, a pair a flip ---------- */
  rise("#ch", k(27) + 0.12, -40);
  rise("#ct0", k(28), 30);
  [[0, 29], [1, 31]].forEach(function (p) {
    tl.to("#c" + p[0], { rotationX: -78, transformOrigin: "50% 100%", duration: 0.26, ease: "power2.in" }, k(p[1]) - 0.2);
    tl.to("#c" + p[0], { opacity: 0, duration: 0.08 }, k(p[1]) + 0.04);
    tl.set("#ct" + p[0], { opacity: 0 }, k(p[1]));
    slap("#ct" + (p[0] + 1), k(p[1]), 1.5, -3);
  });

  /* transition crate -> side B record: the crate shrinks into the record's label */
  tl.fromTo("#s6in", { clipPath: "circle(1400px at 540px 960px)" }, { clipPath: "circle(552px at 540px 960px)", duration: 0.36, ease: "power3.in", immediateRender: false }, k(35) - 0.22);
  tl.to("#s6in", { scale: 0.29, transformOrigin: "540px 960px", duration: 0.36, ease: "power3.in" }, k(35) - 0.22);
  tl.to("#s6in", { opacity: 0, duration: 0.3 }, k(35) + 0.2);

  /* ---------- 7 the mixtape record ---------- */
  spin("#v7-d", k(35) - 0.25, k(39) + 0.05, 230);
  spin("#ring2", k(35) - 0.25, k(39) + 0.05, -14);
  tl.set("#clamp7", { opacity: 0 }, 0);
  tl.fromTo("#clamp7", { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.16, ease: "power3.in", immediateRender: false }, k(36) - 0.14);
  rise("#ob1", k(36), -30); slap("#ob2", k(36.5), 1.6, -5);
  rise("#o-bot", k(37.5), 20);
  for (var n = 0; n < 14; n++) note("#n7-" + n, k(35.5 + Math.floor(n / 2) * 0.5) + (n % 2) * 0.04);

  /* transition: a wheat-pasted poster tears down over it */
  tl.set("#s8in", { clipPath: "inset(0px 0px 1920px 0px)" }, 0);
  tl.to("#s8in", { clipPath: "inset(0px 0px 0px 0px)", duration: 0.22, ease: "power2.in" }, k(39) - 0.22);
  tl.set("#torn", { y: 0, opacity: 1 }, k(39) - 0.22);
  tl.to("#torn", { y: 1990, duration: 0.22, ease: "power2.in" }, k(39) - 0.22);
  tl.set("#torn", { opacity: 0 }, k(39) + 0.01);

  /* ---------- 8 the poster ---------- */
  spin("#v8-d", k(39) - 0.22, {{D}}, 120);
  flash(k(39), 0.7); shake(k(39), "#s8in", 1);
  slap("#wm8", k(39), 1.5);
  slap("#p1", k(40), 1.7, -4);
  rise("#p2", k(41), 30);
  tl.set("#p3", { opacity: 0 }, 0);
  tl.fromTo("#p3", { opacity: 0, scale: 2.2, rotation: -40 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.16, ease: SL, immediateRender: false }, k(42));
  rise("#p4", k(43), 16);
  window.__timelines["main"] = tl;
})();
</script>
</body>
</html>
