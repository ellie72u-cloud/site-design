fonts=open('assets/fonts/fonts.css').read()
P=60/158
def k(n): return round(0.13+n*P,3)
D=25.2
PAIRS=[  # id, start beat, bg, fg, accent, brand, name, price, size, photos with the beat each lands on, swatches
 ('hoka', 14,'#F2894A','#141210','#141210','HOKA ONE ONE','BONDI 7','RS.6,500','41.5',[('i06',14),('i07',16),('i35',18),('i36',20)],['#AEB9B2','#F6B48F','#F2F2EE']),
 ('cloud',22,'#C7A6F2','#141210','#141210','ADIDAS','CLOUDFOAM PURE SPW','RS.6,500','42.5',[('i27',22),('i72',25),('i73',26),('i71',27)],['#F7F5EF','#BFD7EE','#8A5A3B']),
 ('stan', 30,'#1E2A47','#F3E9D8','#D49A5B','ADIDAS','STAN SMITH CREPE','RS.6,500','46',[('i10',30),('i11',32),('i39',34),('i40',36)],['#3B4257','#C58A4E','#F2F2EE']),
 ('zoom', 38,'#0A0806','#FFFFFF','#F8C038','NIKE','ZOOM FLY','RS.6,500','42',[('i16',38),('i17',40),('i45',42),('i46',44)],['#111111','#F2F2EE','#8A8D91'])]
secs=[]; js=[]
def sec(i,a,e,body,style=''):
    secs.append(f'  <section id="s{i}" class="clip" data-start="{a}" data-duration="{round(e-a,3)}" data-track-index="{i+1}" style="{style}">\n    <div id="s{i}in" class="in">{body}</div>\n  </section>')
# 0 intro
sec(0,0,k(10),'<div id="intro"><b id="i1">Branded shoes,</b><b id="i2">graded honest.</b><span id="i3" class="mono">THE TOP GRADE AT LEFTOVRZ ↓</span></div>','background:#0A0806')
# 1 drop
sec(1,k(10),k(14),'<div class="dots"></div><div id="pp"><span class="pplus">PREMIUM<em>+</em></span></div><div class="wm" id="wm1"></div>','background:#F8C038')
for n,(pid,s0,bg,fg,ac,brand,name,pr,sz,photos,sw) in enumerate(PAIRS):
    imgs=''.join(f'<img class="ang" id="{pid}-{j}" src="assets/ph/{p}.png" alt="">' for j,(p,_) in enumerate(photos))
    sws=''.join(f'<i id="{pid}-sw{j}" style="background:{c}"></i>' for j,c in enumerate(sw))
    marq=(' · '.join([name]*4))
    body=(f'<div class="marq" data-layout-ignore aria-hidden="true" id="{pid}-mq" style="-webkit-text-stroke-color:{fg}">{marq}</div>'
          f'<div class="info" style="color:{fg}"><span class="badge" id="{pid}-b" style="border-color:{ac};color:{ac}">PREMIUM+</span>'
          f'<div class="brand" id="{pid}-br">{brand}</div><h2 id="{pid}-n" class="{"long" if len(name)>10 else ""}">{name}</h2>'
          f'<div class="meta" id="{pid}-m"><b>{pr}</b><span>SIZE {sz}</span></div><div class="sw">{sws}</div></div>'
          f'<div class="win" id="{pid}-w">{imgs}</div>')
    e=s0+8
    sec(2+n,k(s0),k(e),body,f'background:{bg}')
    js.append(f'pair("{pid}",{s0},{[b for _,b in photos]},{len(sw)});')
# 6 more premium+
cuts=[('i02','HOKA ONE ONE BONDI 7','RS.5,500 · 40',48,(160,420)),('i24','NIKE AIR WINFLO 9','RS.6,500 · 44',49,(720,470)),('i25','ADIDAS PUREMOTION','RS.6,500 · 38.5',50,(1280,420))]
mb=''.join(f'<div class="mp" id="mp{j}" style="left:{x}px;top:{y}px"><img src="assets/cut/{c}.png" alt=""><b>{nm}</b><span>{pr}</span></div>' for j,(c,nm,pr,b,(x,y)) in enumerate(cuts))
sec(6,k(46),k(51),'<div class="dots"></div><div id="more">MORE <span class="pplus sm">PREMIUM<em>+</em></span></div>'+mb,'background:#F8C038')
# 7 line-up
line=[('i06','HOKA BONDI 7','RS.6,500'),('i27','CLOUDFOAM PURE SPW','RS.6,500'),('i10','STAN SMITH CREPE','RS.6,500'),('i16','ZOOM FLY','RS.6,500'),('i02','HOKA BONDI 7','RS.5,500'),('i24','AIR WINFLO 9','RS.6,500'),('i25','PUREMOTION','RS.6,500')]
lb=''.join(f'<div class="lc" id="lc{j}"><img src="assets/ph/{p}.png" alt=""><b>{nm}</b><span>{pr}</span></div>' for j,(p,nm,pr) in enumerate(line))
sec(7,k(51),k(58),'<div id="lh">THE <span class="pplus sm">PREMIUM<em>+</em></span> LINE-UP</div><div id="lineup">'+lb+'</div>','background:#0A0806')
# 8 outro
sec(8,k(58),D,'<div class="wm" id="wm8"></div><div id="o1"><span class="pplus">PREMIUM<em>+</em></span></div><div id="o2">BRANDED SHOES, GRADED HONEST.</div><div id="o3" class="mono">EVERY FRIDAY, 6PM · LEFTOVRZ.COM</div>','background:#0A0806')
tpl=open('../work/template.html').read()
tpl=tpl.replace('{{FONTS}}',fonts).replace('{{SECS}}','\n'.join(secs)).replace('{{PAIRJS}}','\n  '.join(js)).replace('{{D}}',str(D)).replace('{{FRAMES}}',str(int(D*30)))
open('index.html','w').write(tpl); print('ok')
