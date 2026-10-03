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
sec(0,0,round(k(7)+0.1,3),'''<div id="bokeh"></div><div id="intro"><b id="i1">Branded shoes,</b><b id="i2">graded honest.</b><span id="i3" class="mono">THE TOP GRADE AT LEFTOVRZ</span></div>
<svg id="deck" viewBox="{VB}" width="{DW}" height="{DH}">
 <defs>
  <linearGradient id="teal" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1c5f5c"/><stop offset=".35" stop-color="#2b8b86"/><stop offset="1" stop-color="#174d4a"/></linearGradient>
  <linearGradient id="chrome" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fbfbfb"/><stop offset=".45" stop-color="#b9bcc0"/><stop offset=".55" stop-color="#7d8186"/><stop offset="1" stop-color="#d9dbde"/></linearGradient>
  <linearGradient id="chromeV" x1="0" x2="1"><stop offset="0" stop-color="#6f7378"/><stop offset=".35" stop-color="#f2f3f4"/><stop offset=".7" stop-color="#9a9ea3"/><stop offset="1" stop-color="#4c4f53"/></linearGradient>
  <radialGradient id="shade" cx=".5" cy=".5" r=".5"><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
  <filter id="mb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="1.2"/></filter>
 </defs>
 <path d="M-200 300 L2120 300 L2120 1300 L-200 1300 Z" fill="url(#teal)"/>
 <rect x="-200" y="296" width="2320" height="6" fill="#3fb3ad" opacity=".5"/>
 <g id="rec">
  <ellipse cx="900" cy="760" rx="975" ry="356" fill="#0b0b0b" opacity=".6"/>
  <ellipse cx="900" cy="742" rx="962" ry="350" fill="#141414" stroke="#3a3a3a" stroke-width="3"/>
  <ellipse cx="900" cy="730" rx="950" ry="344" fill="#2a2a2a"/>
  <ellipse cx="900" cy="722" rx="944" ry="340" fill="none" stroke="#4a4a4a" stroke-width="2"/>
  <ellipse cx="900" cy="712" rx="922" ry="324" fill="#0d0d0d"/>
  <g transform="translate(900 700) scale(1 .35)">
   <g id="spinner" filter="url(#mb)"><path d="M0 0 L920.0 0.0 A920 920 0 0 1 314.7 864.5 Z" fill="#FF7A1A"/><path d="M0 0 L314.7 864.5 A920 920 0 0 1 -80.2 916.5 Z" fill="#FFD84D"/><path d="M0 0 L-80.2 916.5 A920 920 0 0 1 -796.7 460.0 Z" fill="#20B9B3"/><path d="M0 0 L-796.7 460.0 A920 920 0 0 1 -864.5 -314.7 Z" fill="#F0368A"/><path d="M0 0 L-864.5 -314.7 A920 920 0 0 1 -314.7 -864.5 Z" fill="#FF8A2A"/><path d="M0 0 L-314.7 -864.5 A920 920 0 0 1 -0.0 -920.0 Z" fill="#FFE9C2"/><path d="M0 0 L-0.0 -920.0 A920 920 0 0 1 704.8 -591.4 Z" fill="#1FA9A6"/><path d="M0 0 L704.8 -591.4 A920 920 0 0 1 920.0 -0.0 Z" fill="#FF4F9A"/><circle r="232" fill="#E62E8A"/><circle r="232" fill="none" stroke="#b81f6c" stroke-width="10"/><rect x="60" y="-14" width="120" height="28" rx="8" fill="#ff7cbc" opacity=".8"/></g>
   <circle r="270" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="296" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="322" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="348" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="374" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="400" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="426" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="452" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="478" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="504" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="530" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="556" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="582" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="608" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="634" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="660" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="686" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="712" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="738" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="764" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="790" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="816" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="842" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="868" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle r="894" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
   <g opacity=".22"><path d="M0 0 L911.0 128.0 A920 920 0 0 1 853.0 344.6 Z" fill="#fff"/><path d="M0 0 L-911.0 -128.0 A920 920 0 0 1 -853.0 -344.6 Z" fill="#fff"/></g>
   <circle r="920" fill="url(#shade)"/>
   <circle r="919" fill="none" stroke="#111" stroke-width="10"/>
  </g>
  <rect x="893" y="672" width="14" height="28" fill="url(#chromeV)"/><ellipse cx="900" cy="672" rx="7" ry="2.6" fill="#f4f4f4"/>
 </g>
 <g id="spark" opacity="0"><ellipse id="ring" cx="1082" cy="592" rx="20" ry="7" fill="none" stroke="#FFF2B3" stroke-width="6"/><circle cx="1082" cy="592" r="12" fill="#fffbe6"/><g stroke="#FFD84D" stroke-width="5" stroke-linecap="round"><line x1="1082" y1="572" x2="1082" y2="540"/><line x1="1058" y1="580" x2="1030" y2="560"/><line x1="1106" y1="580" x2="1134" y2="560"/><line x1="1046" y1="592" x2="1008" y2="590"/><line x1="1118" y1="592" x2="1156" y2="590"/></g></g>
 <ellipse cx="1760" cy="362" rx="78" ry="26" fill="#0e0e0e" opacity=".7"/>
 <rect x="1722" y="296" width="76" height="62" fill="url(#chromeV)"/><ellipse cx="1760" cy="358" rx="38" ry="12" fill="#6d7075"/><ellipse cx="1760" cy="296" rx="38" ry="12" fill="#eef0f2"/>
 <g id="tarm">
  <rect x="1790" y="268" width="150" height="46" rx="14" fill="url(#chrome)" stroke="#55585c" stroke-width="2"/>
  <circle cx="1760" cy="300" r="22" fill="url(#chromeV)" stroke="#55585c" stroke-width="2"/>
  <path d="M1760 300 C 1650 300, 1580 356, 1500 390 L 1316 438" fill="none" stroke="#3e4246" stroke-width="26" stroke-linecap="round"/>
  <path d="M1760 300 C 1650 300, 1580 356, 1500 390 L 1316 438" fill="none" stroke="url(#chrome)" stroke-width="20" stroke-linecap="round"/>
  <path d="M1760 295 C 1650 295, 1582 350, 1502 384 L 1318 432" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
  <g transform="translate(1082 592) scale(1.8) translate(-1082 -592)"><path d="M1214 498 L1066 538 L1058 568 L1222 526 Z" fill="#2b2c2e" stroke="#5a5c60" stroke-width="2"/>
  <path d="M1214 498 L1066 538 L1068 546 L1216 506 Z" fill="#8d9095"/>
  <path d="M1108 552 L1062 564 L1064 584 L1110 572 Z" fill="#d9a441" stroke="#8a6420" stroke-width="2"/>
  <line x1="1082" y1="578" x2="1082" y2="592" stroke="#eaeaea" stroke-width="3"/></g>
 </g>
</svg>''','background:linear-gradient(#120d10,#1a1216 40%,#0d0a0b)')
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
#deck{left:-110px;top:1244px}#bokeh{top:840px;height:440px}
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
W,H,DW,DH,DORG,VB=(1080,1920,1300,676,'497px 225px','420 300 1500 780') if V else (1920,1080,1920,1080,'1082px 592px','0 0 1920 1080')
if V:
    tpl=tpl.replace('id="mp0" style="left:160px;top:420px"','id="mp0" style="left:60px;top:330px"').replace('id="mp1" style="left:720px;top:470px"','id="mp1" style="left:460px;top:830px"').replace('id="mp2" style="left:1280px;top:420px"','id="mp2" style="left:60px;top:1330px"')
tpl=tpl.replace('{{VCSS}}',VCSS).replace('{{W}}',str(W)).replace('{{H}}',str(H)).replace('{VB}',VB).replace('{DW}',str(DW)).replace('{DH}',str(DH)).replace('{{DORG}}',DORG)
open('index.html','w').write(tpl); print('ok', 'vertical' if V else 'landscape')
