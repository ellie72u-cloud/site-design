import sys
V=len(sys.argv)>1 and sys.argv[1]=='vertical'
fonts=open('assets/fonts/fonts.css').read()
B=0.5458  # JET SET is ~110 BPM; beat 7 (3.838s) is the drop, the big kick lands every 4 beats
def k(n): return round(0.017+n*B,3)
D=25.2
PAIRS=[  # id, start beat, bg, fg, accent, brand, name, price, size, photos with the beat each lands on, swatches
 ('hoka', 11,'#F2894A','#141210','#141210','HOKA ONE ONE','BONDI 7','RS.6,500','41.5',[('i06',11),('i07',12),('i35',13),('i36',14)],['#AEB9B2','#F6B48F','#F2F2EE']),
 ('cloud',15,'#C7A6F2','#141210','#141210','ADIDAS','CLOUDFOAM PURE SPW','RS.6,500','42.5',[('i27',15),('i72',16),('i73',17),('i71',18)],['#F7F5EF','#BFD7EE','#8A5A3B']),
 ('stan', 19,'#1E2A47','#F3E9D8','#D49A5B','ADIDAS','STAN SMITH CREPE','RS.6,500','46',[('i10',19),('i11',20),('i39',21),('i40',22)],['#3B4257','#C58A4E','#F2F2EE']),
 ('zoom', 23,'#0A0806','#FFFFFF','#F8C038','NIKE','ZOOM FLY','RS.6,500','42',[('i16',23),('i17',24.5),('i45',25),('i46',26)],['#111111','#F2F2EE','#8A8D91'])]
secs=[]; js=[]
def sec(i,a,e,body,style=''):
    secs.append(f'  <section id="s{i}" class="clip" data-start="{a}" data-duration="{round(e-a,3)}" data-track-index="{i+1}" style="{style}">\n    <div id="s{i}in" class="in">{body}</div>\n  </section>')
# 0 intro
sec(0,0,round(k(7)+0.1,3),'''<div id="intro"><b id="i1">Branded shoes,</b><b id="i2">graded honest.</b><span id="i3" class="mono">THE TOP GRADE AT LEFTOVRZ</span></div>
<svg id="deck" viewBox="230 430 1460 500" width="{DW}" height="{DH}">
 <defs>
  <linearGradient id="plat" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d9d6d0"/><stop offset=".5" stop-color="#8d8a85"/><stop offset="1" stop-color="#4a4844"/></linearGradient>
  <linearGradient id="plin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2a2622"/><stop offset="1" stop-color="#110f0d"/></linearGradient>
  <radialGradient id="vin" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#1b1917"/><stop offset="1" stop-color="#070605"/></radialGradient>
  <linearGradient id="tube" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f1efea"/><stop offset=".6" stop-color="#9c9993"/><stop offset="1" stop-color="#5d5b57"/></linearGradient>
 </defs>
 <ellipse cx="960" cy="900" rx="760" ry="40" fill="#000" opacity=".55"/>
 <rect x="300" y="710" width="1320" height="150" rx="14" fill="url(#plin)"/>
 <rect x="300" y="710" width="1320" height="6" rx="3" fill="#4a443d"/>
 <rect x="340" y="860" width="90" height="26" rx="6" fill="#0c0b0a"/><rect x="1490" y="860" width="90" height="26" rx="6" fill="#0c0b0a"/>
 <circle cx="1500" cy="785" r="16" fill="#F8C038"/><text x="1530" y="792" fill="#8a847b" font-family="Space Mono" font-size="20" letter-spacing="3">33 · 45</text>
 <g id="rec">
  <rect x="440" y="668" width="840" height="44" fill="url(#plat)"/>
  <g id="strobe" fill="#2b2926" opacity=".7"></g>
  <ellipse cx="860" cy="668" rx="420" ry="44" fill="#5d5b57"/>
  <ellipse cx="860" cy="652" rx="410" ry="42" fill="url(#vin)"/>
  <ellipse cx="860" cy="652" rx="370" ry="37" fill="none" stroke="#24211e" stroke-width="2"/>
  <ellipse cx="860" cy="652" rx="320" ry="32" fill="none" stroke="#24211e" stroke-width="2"/>
  <ellipse cx="860" cy="652" rx="265" ry="26.5" fill="none" stroke="#24211e" stroke-width="2"/>
  <ellipse cx="860" cy="652" rx="210" ry="21" fill="none" stroke="#24211e" stroke-width="2"/>
  <path d="M520 640 Q 700 618 900 618" fill="none" stroke="#ffffff" stroke-opacity=".18" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="860" cy="652" rx="130" ry="13" fill="#F8C038"/>
  <circle id="dust" cx="860" cy="652" r="5" fill="#d8d3c8" opacity=".8"/>
  <rect id="lmark" x="855" y="648" width="22" height="7" rx="2" fill="#141210"/>
  <ellipse cx="860" cy="651" rx="9" ry="3" fill="#cfcac0"/>
 </g>
 <g id="spark" opacity="0"><ellipse id="ring" cx="975" cy="642" rx="20" ry="4" fill="none" stroke="#F8C038" stroke-width="6"/><circle cx="975" cy="642" r="14" fill="#fff6d6"/><g stroke="#F8C038" stroke-width="5" stroke-linecap="round"><line x1="975" y1="620" x2="975" y2="590"/><line x1="950" y1="628" x2="925" y2="608"/><line x1="1000" y1="628" x2="1025" y2="608"/><line x1="940" y1="640" x2="905" y2="638"/><line x1="1010" y1="640" x2="1045" y2="638"/></g></g>
 <rect x="1404" y="560" width="52" height="150" rx="8" fill="#8d8a85"/>
 <rect x="1394" y="690" width="72" height="20" rx="6" fill="#4a4844"/>
 <g id="tarm">
  <circle cx="1430" cy="560" r="30" fill="#c9c6c0" stroke="#3a3835" stroke-width="3"/>
  <rect x="1470" y="546" width="70" height="30" rx="8" fill="#3a3835"/>
  <path d="M1430 560 L1080 572 L1000 596" fill="none" stroke="url(#tube)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M1012 586 L944 604 L948 620 L1018 602 Z" fill="#141210"/>
  <rect x="955" y="612" width="40" height="18" rx="3" fill="#F8C038"/>
  <line x1="975" y1="628" x2="975" y2="641" stroke="#e8e4dc" stroke-width="3"/>
 </g>
</svg>''','background:radial-gradient(ellipse 70% 60% at 50% 70%,#23201c,#0A0806)')
# 1 drop
sec(1,k(7),k(11),'<div class="dots"></div><div id="pp"><span class="pplus">PREMIUM<em>+</em></span></div><div class="wm" id="wm1"></div>','background:#F8C038')
for n,(pid,s0,bg,fg,ac,brand,name,pr,sz,photos,sw) in enumerate(PAIRS):
    imgs=''.join(f'<img class="ang" id="{pid}-{j}" src="assets/ph/{p}.png" alt="">' for j,(p,_) in enumerate(photos))
    sws=''.join(f'<i id="{pid}-sw{j}" style="background:{c}"></i>' for j,c in enumerate(sw))
    marq=(' · '.join([name]*4))
    body=(f'<div class="marq" data-layout-ignore aria-hidden="true" id="{pid}-mq" style="-webkit-text-stroke-color:{fg}">{marq}</div>'
          f'<div class="info" style="color:{fg}"><span class="badge" id="{pid}-b" style="border-color:{ac};color:{ac}">PREMIUM+</span>'
          f'<div class="brand" id="{pid}-br">{brand}</div><h2 id="{pid}-n" class="{"long" if len(name)>10 else ""}">{name}</h2>'
          f'<div class="meta" id="{pid}-m"><b>{pr}</b><span>SIZE {sz}</span></div><div class="sw">{sws}</div></div>'
          f'<div class="win" id="{pid}-w">{imgs}</div>')
    e=s0+4
    sec(2+n,k(s0),k(e),body,f'background:{bg}')
    js.append(f'pair("{pid}",{s0},{[b for _,b in photos]},{len(sw)});')
# 6 more premium+
cuts=[('i02','HOKA ONE ONE BONDI 7','RS.5,500 · 40',48,(160,420)),('i24','NIKE AIR WINFLO 9','RS.6,500 · 44',49,(720,470)),('i25','ADIDAS PUREMOTION','RS.6,500 · 38.5',50,(1280,420))]
mb=''.join(f'<div class="mp" id="mp{j}" style="left:{x}px;top:{y}px"><img src="assets/cut/{c}.png" alt=""><b>{nm}</b><span>{pr}</span></div>' for j,(c,nm,pr,b,(x,y)) in enumerate(cuts))
sec(6,k(27),k(31),'<div class="dots"></div><div id="more">MORE <span class="pplus sm">PREMIUM<em>+</em></span></div>'+mb,'background:#F8C038')
# 7 line-up
line=[('i06','HOKA BONDI 7','RS.6,500'),('i27','CLOUDFOAM PURE SPW','RS.6,500'),('i10','STAN SMITH CREPE','RS.6,500'),('i16','ZOOM FLY','RS.6,500'),('i02','HOKA BONDI 7','RS.5,500'),('i24','AIR WINFLO 9','RS.6,500'),('i25','PUREMOTION','RS.6,500')]
lb=''.join(f'<div class="lc" id="lc{j}"><img src="assets/ph/{p}.png" alt=""><b>{nm}</b><span>{pr}</span></div>' for j,(p,nm,pr) in enumerate(line))
sec(7,k(31),k(39),'<div id="lh">THE <span class="pplus sm">PREMIUM<em>+</em></span> LINE-UP</div><div id="lineup">'+lb+'</div>','background:#0A0806')
# 8 outro
sec(8,k(39),D,'<div class="wm" id="wm8"></div><div id="o1"><span class="pplus">PREMIUM<em>+</em></span></div><div id="o2">BRANDED SHOES, GRADED HONEST.</div><div id="o3" class="mono">EVERY FRIDAY, 6PM · LEFTOVRZ.COM</div>','background:#0A0806')
tpl=open('../work/template.html').read()
tpl=tpl.replace('{{FONTS}}',fonts).replace('{{SECS}}','\n'.join(secs)).replace('{{PAIRJS}}','\n  '.join(js)).replace('{{D}}',str(D)).replace('{{FRAMES}}',str(int(D*30)))
VCSS='''
/* ---- 9:16 short ---- */
#intro{top:520px}#intro b{font-size:112px}
#deck{left:-110px;top:1060px}#deck text{display:none}
#pp{top:640px;font-size:210px}
#wm1{left:140px;top:1000px;width:800px;height:185px}
.marq{top:auto;bottom:-40px}
.info{left:80px;top:110px;width:920px}
.info h2{font-size:200px;margin-top:40px}
.info h2.long{font-size:130px;margin-top:30px}
.meta{margin-top:28px}.sw{position:absolute;right:0;top:0;margin:0;gap:14px}.sw i{width:60px;height:60px}
.win{left:150px;top:830px;width:780px;height:1040px}
#more{top:120px;font-size:130px}
.mp{width:560px}.mp img{width:560px;height:340px}.mp b{font-size:50px}
#lh{top:110px;left:60px;right:60px;font-size:100px;line-height:1.05}
#lineup{left:60px;top:400px;width:960px;flex-wrap:wrap;justify-content:center;gap:34px 30px}
.lc{width:300px}.lc img{width:300px;height:400px}.lc b{font-size:34px}.lc span{font-size:24px}
#wm8{left:90px;top:470px;width:900px;height:210px}
#o1{top:760px;font-size:170px}
#o2{top:1010px;left:60px;right:60px;font-size:84px;line-height:1.1}
#o3{top:1300px;font-size:22px}
''' if V else ''
W,H,DW,DH,DORG=(1080,1920,1300,445,'1000px 200px') if V else (1920,1080,1920,658,'1080px 300px')
if V:
    tpl=tpl.replace('id="mp0" style="left:160px;top:420px"','id="mp0" style="left:60px;top:330px"').replace('id="mp1" style="left:720px;top:470px"','id="mp1" style="left:460px;top:830px"').replace('id="mp2" style="left:1280px;top:420px"','id="mp2" style="left:60px;top:1330px"')
tpl=tpl.replace('{{VCSS}}',VCSS).replace('{{W}}',str(W)).replace('{{H}}',str(H)).replace('{DW}',str(DW)).replace('{DH}',str(DH)).replace('{{DORG}}',DORG)
open('index.html','w').write(tpl); print('ok', 'vertical' if V else 'landscape')
