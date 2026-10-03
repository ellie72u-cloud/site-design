"""LEFTOVRZ Premium+ — "The Premium+ Mixtape", a 9:16 short. Run from ../composition: python3 ../work/build.py

Everything sits on JET SET's measured grid: ~110 BPM, beat n = 0.017 + n*0.5458s, the drop is beat 7 (3.838s),
the big kick lands every 4 beats (7, 11, 15 ...), the track drops out on beat 24 and comes back on 25.
"""
import random

B = 0.5458
def k(n): return round(0.017 + n * B, 3)
D = 25.2
W, H = 1080, 1920
TAPS = [0.04, 0.564, 1.112, 1.651, 2.205, 2.469, 3.218, 3.482]   # the intro's own hits, measured from the track

# id, first beat, side/no, paper, ink, vinyl, label, sticker, brand, name, price, size, photos (file, beat), event offsets
TRACKS = [
    dict(id='t1', s0=11, no='A1', bg='#141210', ink='#F3E9D8', vin='#FF6A1A', lab='#F3E9D8', stk='#F8C038',
         brand='Hoka One One', name='BONDI 7', price='6,500', size='41.5', photos=[('i06', 11), ('i07', 13), ('i35', 14)], stick=1.5),
    dict(id='t2', s0=15, no='A2', bg='#EFE6D2', ink='#141210', vin='#B78BF0', lab='#F8E36B', stk='#E8352A',
         brand='Adidas', name='CLOUDFOAM PURE SPW', price='6,500', size='42.5', photos=[('i27', 15), ('i71', 17), ('i72', 18)], stick=1.5),
    dict(id='t3', s0=19, no='B1', bg='#1E2A47', ink='#F3E9D8', vin='#D49A5B', lab='#F3E9D8', stk='#F8C038',
         brand='Adidas', name='STAN SMITH CREPE', price='6,500', size='46', photos=[('i10', 19), ('i11', 21), ('i39', 22)], stick=1.5),
    dict(id='t4', s0=23, no='B2', bg='#F8C038', ink='#0A0806', vin='#161616', lab='#FFFFFF', stk='#E8352A',
         brand='Nike', name='ZOOM FLY', price='6,500', size='42', photos=[('i16', 23), ('i17', 25), ('i45', 26)], stick=2.0),
]
CRATE = [('i02', 'HOKA BONDI 7', 'RS.5,500', '40'), ('i24', 'NIKE AIR WINFLO 9', 'RS.6,500', '44'), ('i25', 'ADIDAS PUREMOTION', 'RS.6,500', '38.5')]

rnd = random.Random(7)
secs = []


def sec(sid, a, e, z, body, bg, zi=None):
    secs.append(f'  <section id="{sid}" class="clip" data-start="{round(a,3)}" data-duration="{round(e-a,3)}" data-track-index="{z}" style="z-index:{zi or z}">'
                f'\n    <div id="{sid}in" class="in" style="background:{bg}">{body}</div>\n  </section>')


def vinyl(vid, size, vin, lab, inner=''):
    return (f'<div class="vin" id="{vid}" style="width:{size}px;height:{size}px;--v:{vin};--l:{lab}">'
            f'<div class="disc" id="{vid}-d"><div class="lab">{inner}</div></div><div class="sheen"></div><i class="hole"></i></div>')


NOTES = '♪♫♬♩'
def notes(prefix, n, x0, x1, y0, y1, col):
    out = []
    for i in range(n):
        out.append(f'<span class="note" id="{prefix}{i}" data-layout-ignore aria-hidden="true" style="left:{rnd.randint(x0,x1)}px;top:{rnd.randint(y0,y1)}px;'
                   f'font-size:{rnd.randint(64,120)}px;color:{col[i % len(col)]}">{NOTES[i % 4]}</span>')
    return ''.join(out)


# ---------- 0 intro: the orange record, the clamp stepping down on each hit, then the needle ----------
sec('s0', 0, k(7) + 0.4, 1,
    '<div class="bokeh"></div>'
    '<div id="i-top"><span id="i1" class="mono">LEFTOVRZ RECORDS PRESENTS</span><b id="i2">the premium+</b><b id="i3">mixtape</b></div>'
    + notes('n0-', 16, 60, 960, 760, 1150, ['#FFFFFF', '#F3E9D8', '#F8C038'])
    + '<div id="persp"><div id="plane"><div id="platter"></div>' + vinyl('v0', 1180, '#FF5A14', '#FF5A14',
        '<b class="ltxt">LEFTOVRZ</b>') + '</div></div>'
    '<svg id="clamp" viewBox="0 0 240 190" width="240" height="190"><defs>'
    '<linearGradient id="cyl" x1="0" x2="1"><stop offset="0" stop-color="#5d6268"/><stop offset=".3" stop-color="#f4f6f8"/><stop offset=".55" stop-color="#9aa0a6"/><stop offset=".8" stop-color="#e3e6e9"/><stop offset="1" stop-color="#4b4f54"/></linearGradient>'
    '<radialGradient id="topc" cx=".45" cy=".4" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#c9cdd1"/><stop offset="1" stop-color="#7c8187"/></radialGradient></defs>'
    '<path d="M20 70 L20 150 A100 30 0 0 0 220 150 L220 70 Z" fill="url(#cyl)"/>'
    '<ellipse cx="120" cy="70" rx="100" ry="30" fill="url(#topc)"/>'
    '<g fill="none" stroke="#8a9096" stroke-width="2"><ellipse cx="120" cy="70" rx="80" ry="24"/><ellipse cx="120" cy="70" rx="56" ry="17"/></g>'
    '<ellipse cx="120" cy="66" rx="34" ry="10" fill="#3fbf6a"/><ellipse cx="120" cy="64" rx="22" ry="6" fill="#c6f5d3"/>'
    '<g stroke="#6d7379" stroke-width="3">' + ''.join(f'<line x1="{x}" y1="{100 + (abs(x-120)/100)**2*28:.0f}" x2="{x}" y2="{158 + (1-((x-120)/100)**2)**.5*28:.0f}"/>' for x in range(36, 205, 14)) + '</g>'
    '</svg>'
    '<svg id="arm0" viewBox="0 0 520 760" width="520" height="760"><defs><linearGradient id="tube0" x1="0" x2="1"><stop offset="0" stop-color="#8b9096"/><stop offset=".4" stop-color="#ffffff"/><stop offset="1" stop-color="#6e737a"/></linearGradient></defs>'
    '<circle cx="420" cy="90" r="64" fill="#2a2a2a" stroke="#555" stroke-width="4"/><circle cx="420" cy="90" r="30" fill="url(#tube0)"/>'
    '<path d="M420 90 C 420 300, 330 470, 205 600" fill="none" stroke="url(#tube0)" stroke-width="22" stroke-linecap="round"/>'
    '<path d="M222 572 L150 660 L188 690 L252 602 Z" fill="#1c1c1c" stroke="#666" stroke-width="3"/><rect x="150" y="652" width="44" height="34" rx="4" fill="#F8C038" transform="rotate(38 172 669)"/>'
    '<line x1="160" y1="684" x2="150" y2="700" stroke="#eee" stroke-width="4"/></svg>'
    '<div id="spark0"><i></i></div>',
    'radial-gradient(ellipse 90% 50% at 50% 72%,#2a1a12,#0A0806 70%)')

# ---------- 1 title: dive through the label into a giant spinning label + the tracklist ----------
ring = 'BRANDED SHOES · GRADED HONEST · THE TOP GRADE AT LEFTOVRZ · '
tl_rows = ''.join(f'<div class="tr" id="tr{j}"><b>{t["no"]}</b><span>{(t["brand"].split()[0].upper()+" "+t["name"]) if t["id"]!="t2" else "CLOUDFOAM PURE SPW"}</span><em>RS.{t["price"]}</em></div>' for j, t in enumerate(TRACKS))
sec('s1', k(7) - 0.02, k(11) + 0.35, 2,
    '<div class="dots" style="--dot:#000"></div>'
    '<div id="biglab"><svg viewBox="0 0 800 800" width="800" height="800" id="ringsvg"><defs><path id="rp" d="M400 400 m-330 0 a330 330 0 1 1 660 0 a330 330 0 1 1 -660 0"/></defs>'
    '<circle cx="400" cy="400" r="398" fill="#F3E9D8"/><circle cx="400" cy="400" r="380" fill="none" stroke="#141210" stroke-width="3"/>'
    '<circle cx="400" cy="400" r="290" fill="none" stroke="#141210" stroke-width="2" stroke-dasharray="6 10"/>'
    f'<text font-family="Space Mono" font-weight="700" font-size="34" fill="#141210" textLength="2060" lengthAdjust="spacing"><textPath href="#rp" textLength="2060" lengthAdjust="spacing">{ring}</textPath></text>'
    '<circle cx="400" cy="400" r="16" fill="#141210"/></svg></div>'
    '<div id="pp"><span class="pplus">PREMIUM<em>+</em></span></div>'
    '<div id="tl"><div class="side" id="sa">SIDE A</div>' + tl_rows[:tl_rows.index('<div class="tr" id="tr2">')] +
    '<div class="side" id="sb">SIDE B</div>' + tl_rows[tl_rows.index('<div class="tr" id="tr2">'):] + '</div>'
    '<div id="heavy" class="tag">heavy rotation</div>',
    '#FF5A14')

# ---------- 2-5 the tracks ----------
TR_START = {'t1': k(11) - 0.36, 't2': k(15) - 0.01, 't3': k(19), 't4': k(23) - 0.3}
TR_END = {'t1': k(15) + 0.16, 't2': k(19) + 0.02, 't3': k(23) + 0.36, 't4': k(27) + 0.3}
TR_Z = {'t1': 3, 't2': 4, 't3': 5, 't4': 6}
for t in TRACKS:
    i = t['id']
    imgs = ''.join(f'<img class="ang" id="{i}-p{j}" src="assets/ph/{p}.png" alt="">' for j, (p, _) in enumerate(t['photos']))
    long = ' long' if len(t['name']) > 10 else ''
    tape = ' · '.join(['LEFTOVRZ', 'PREMIUM+', 'GRADED HONEST'] * 4)
    body = (f'<div class="dots" style="--dot:{t["ink"]}"></div>'
            f'<div class="hdr" style="color:{t["ink"]}"><span>SIDE {t["no"][0]} · TRACK {t["no"]}</span><span>33⅓ RPM</span></div>'
            + f'<div class="recw" id="{i}-rw">' + vinyl(f'{i}-v', 820, t['vin'], t['lab'], '<img src="assets/img/logo-0.png" alt=""><small>PREMIUM+ · ' + t['no'] + '</small>') + '</div>'
            f'<div class="sleeve" id="{i}-sl"><div class="ph">{imgs}</div><div class="slv">LEFTOVRZ · PREMIUM+ SERIES · {t["no"]}</div><i class="tp tp1"></i><i class="tp tp2"></i></div>'
            f'<div class="stk" id="{i}-st" style="background:{t["stk"]}"><small>RS.</small><b>{t["price"]}</b></div>'
            f'<div class="info" style="color:{t["ink"]}"><div class="tag" id="{i}-br">{t["brand"]}</div>'
            f'<h2 id="{i}-n" class="{long}">{t["name"]}</h2>'
            f'<div class="meta" id="{i}-m"><span class="sz">SIZE {t["size"]}</span><span class="stamp" style="color:{t["ink"]}">PREMIUM+</span></div></div>'
            f'<div class="prog" style="color:{t["ink"]}"><b>{t["no"]}</b><i class="bar"><i class="fill" id="{i}-f" style="background:{t["ink"]}"></i><i class="knob" id="{i}-k" style="background:{t["ink"]}"></i></i><b>▶</b></div>'
            f'<div class="tape" data-layout-ignore aria-hidden="true"><span id="{i}-tp">{tape}</span></div>')
    sec(i, TR_START[i], TR_END[i], TR_Z[i], body, t['bg'], 7 if i == 't4' else None)

# ---------- 6 the crate ----------
cards = ''.join(f'<div class="card" id="c{j}" style="z-index:{10-j}"><img src="assets/ph/{p}.png" alt=""></div>' for j, (p, _, _, _) in enumerate(CRATE))
tags = ''.join(f'<div class="ctag" id="ct{j}"><b>{n}</b><span>{pr} · SIZE {s}</span></div>' for j, (_, n, pr, s) in enumerate(CRATE))
sec('s6', k(27) - 0.34, k(35) + 0.5, 7,
    '<div class="dots" style="--dot:#000"></div>'
    '<div id="ch"><b>MORE IN THE CRATE</b><span class="mono">PREMIUM+ · DIG IN</span></div>'
    '<div id="crate"><div class="back" id="bk2"></div><div class="back" id="bk1"></div>' + cards + '</div>'
    '<div id="cfront"><i class="plank"></i><i class="plank"></i><i class="plank"></i><span class="mono stencil">LEFTOVRZ RECORDS · PREMIUM+</span>' + tags + '</div>',
    'radial-gradient(ellipse 80% 60% at 50% 40%,#4a2f1e,#1f140d)', 6)

# ---------- 7 side B: the crate shrinks into the label of the last record ----------
ring2 = 'PREMIUM+ · BRANDED SHOES · GRADED HONEST · EVERY FRIDAY, 6PM · '
sec('s7', k(35) - 0.25, k(39) + 0.05, 8,
    '<div class="bokeh"></div>'
    '<div id="o-top"><b id="ob1">THE PREMIUM+</b><b id="ob2" class="tag">mixtape</b></div>'
    '<svg id="ring2" viewBox="0 0 1180 1180" width="1180" height="1180"><defs><path id="rp2" d="M590 590 m-516 0 a516 516 0 1 1 1032 0 a516 516 0 1 1 -1032 0"/></defs>'
    f'<text font-family="Space Mono" font-weight="700" font-size="28" fill="#F3E9D8" textLength="3220" lengthAdjust="spacing"><textPath href="#rp2" textLength="3220" lengthAdjust="spacing">{ring2}{ring2}</textPath></text></svg>'
    + vinyl('v7', 1000, '#FF5A14', '#F8C038', '<div class="lsplit"><img src="assets/img/logo-0.png" alt=""><small>THE PREMIUM+ MIXTAPE</small></div>') +
    '<div id="clamp7"></div>'
    + notes('n7-', 14, 40, 980, 420, 1500, ['#FFFFFF', '#F8C038', '#FF7A3A']) +
    '<div id="o-bot" class="mono">OUT NOW · LEFTOVRZ.COM</div>',
    'radial-gradient(ellipse 80% 60% at 50% 50%,#2a160d,#0A0806 75%)', 5)

# ---------- 8 the poster ----------
sec('s8', k(39) - 0.22, D, 9,
    '<div class="dots" style="--dot:#000"></div>'
    + vinyl('v8', 760, '#FF5A14', '#F3E9D8', '<img src="assets/img/logo-0.png" alt="">') +
    '<div class="wm" id="wm8"></div>'
    '<div id="p1"><span class="pplus">PREMIUM<em>+</em></span></div>'
    '<div id="p2" class="tag">branded shoes,<br>graded honest.</div>'
    '<div id="p3" class="stk big"><small>FROM RS.</small><b>5,500</b></div>'
    '<div id="p4" class="mono">EVERY FRIDAY, 6PM · LEFTOVRZ.COM</div>'
    '<i class="tp tpA"></i><i class="tp tpB"></i>',
    '#EFE6D2', 10)

fonts = open('assets/fonts/fonts.css').read()
html = open('../work/template.html.tpl').read()
pairjs = '\n  '.join(f'track("{t["id"]}", {t["s0"]}, {[b for _, b in t["photos"]]}, {t["stick"]});' for t in TRACKS)
html = (html.replace('{{FONTS}}', fonts).replace('{{SECS}}', '\n'.join(secs)).replace('{{TRACKJS}}', pairjs)
        .replace('{{TAPS}}', str(TAPS)).replace('{{D}}', str(D)).replace('{{FRAMES}}', str(int(D * 30)))
        .replace('{{W}}', str(W)).replace('{{H}}', str(H)))
open('index.html', 'w').write(html)
print('ok')
