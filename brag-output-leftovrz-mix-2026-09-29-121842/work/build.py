from PIL import Image
fonts=open('assets/fonts/fonts.css').read()
P=60/158
def k(n): return round(0.13+n*P,3)
D=30.2
W={'s1':(0,k(10)),'s2':(k(10),k(18)),'s3':(k(18),k(25)),'s4':(k(25),k(34)),'s5':(k(34),k(42)),'s6':(k(42),k(50)),'s7':(k(50),k(58)),'s8':(k(58),k(66)),'s9':(k(66),k(71)),'s10':(k(71),D)}
BG={'s1':'paper','s2':'yel','s3':'wall','s4':'dark','s5':'wall','s6':'paper','s7':'dark','s8':'dark','s9':'yel','s10':'wall'}
def sec(key,body):
    a,e=W[key]; return f'  <section id="{key}" class="clip {BG[key]}" data-start="{a}" data-duration="{round(e-a,3)}" data-track-index="{list(W).index(key)+1}">\n    <div id="{key}in" class="in">{body}</div>\n  </section>\n'
def kin(pfx,cls): return f'<div class="kin {cls}" data-layout-ignore aria-hidden="true"><div class="kr" id="{pfx}1"><span>LEFTOVRZ · DEADSTOCK · LEFTOVRZ · DEADSTOCK · LEFTOVRZ · DEADSTOCK ·</span></div><div class="kr kr--mid" id="{pfx}2"><span>SAMPLE RUNS · NEVER MADE THE FLOOR · SAMPLE RUNS · NEVER MADE THE FLOOR ·</span></div><div class="kr" id="{pfx}3"><span>CURATED GRAILS · ELUSIVE STYLES · CURATED GRAILS · ELUSIVE STYLES ·</span></div></div>'
def drips(n,seed,color):
    out=[];s=seed
    for i in range(n):
        s=(s*9301+49297)%233280; x=6+ (s%880)/10; s=(s*9301+49297)%233280; h=30+s%70
        out.append(f'<i class="drip" style="left:{x:.1f}%;height:{h}px;background:{color}"></i>')
    return ''.join(out)
blitz=[("stk2/downshifter","NIKE DOWNSHIFTER 10","RS.6,500 · 40.5"),("stk2/hoka","HOKA ONE ONE BONDI 7","RS.6,500 · 41.5"),("stk2/roshe","NIKE ROSHE RUN","RS.4,500 · 46"),
       ("stk2/lxcon","ADIDAS ORIGINALS LXCON","RS.5,000 · 40.5"),("stk2/stansmith","ADIDAS STAN SMITH CREPE","RS.6,500 · 46"),("stk2/hoka-sole","HOKA ONE ONE BONDI 7","RS.6,500 · 41.5"),
       ("stk2/downshifter-sole","NIKE DOWNSHIFTER 10","RS.6,500 · 40.5"),("stk/nike-air-max-200-winter","NIKE AIR MAX 200 WINTER","RS.5,000 · 42")]
spots=[(720,420),(1330,380),(420,660),(1120,660),(820,600),(1560,620),(330,360),(1010,330)]
bh=[]
for i,((f,nm,pr),(cx,cy)) in enumerate(zip(blitz,spots)):
    im=Image.open(f'assets/{f}.png'); w=500; h=round(w*im.height/im.width)
    if h>400: w=round(400*im.width/im.height); h=400
    x=max(40,min(1880-w,cx-w//2)); y=max(230,min(960-h,cy-h//2))       # every sticker whole, inside the frame
    bh.append(f'<img class="stk" id="k{i}" src="assets/{f}.png" alt="" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">')
tags=''.join(f'<div class="ptag" id="t{i}"><b>{nm}</b><span>{pr}</span></div>' for i,(f,nm,pr) in enumerate(blitz))
cards=[("stk2/downshifter","NIKE DOWNSHIFTER 10","40.5","RS.6,500","01"),("stk2/hoka","HOKA ONE ONE BONDI 7","41.5","RS.6,500","02"),("stk2/roshe","NIKE ROSHE RUN","46","RS.4,500","03")]
ch=''.join(f'<div class="card" id="card{i}"><div class="face back"><img src="assets/img/logo-0.png" alt=""></div><div class="face front"><div class="cnum">No. {n} · JUST LANDED</div><div class="cph"><img src="assets/{im}.png" alt=""></div><b>{nm}</b><dl><dt>SIZE</dt><dd>{sz}</dd><dt>PRICE</dt><dd>{pr}</dd></dl></div></div>' for i,(im,nm,sz,pr,n) in enumerate(cards))
grades=[("UNWORN","Factory fresh. Never worn, box included.","g0",1080,560,-6),("EXCELLENT","Worn a handful of times. No visible wear.","g1",1230,715,5),("GOOD","Light visible wear. Fully broken in, honestly.","g2",1040,870,-3)]
gh=''.join(f'<div data-layout-allow-overlap class="grade" id="{g}" style="left:{x}px;top:{y}px;--r:{r}deg"><b data-layout-allow-overlap>{t}</b><span>{d}</span></div>' for t,d,g,x,y,r in grades)
tally=lambda idn,n: f'<svg class="tally" id="{idn}" width="260" height="120" viewBox="0 0 260 120">'+''.join(f'<path d="M{20+i*40} 10 L{24+i*40} 110"/>' for i in range(min(n,4)))+('<path d="M4 90 L190 20"/>' if n>=5 else '')+'</svg>'
tpl=open('../work/template.html').read()
for key in W: tpl=tpl.replace('{{SEC_'+key+'}}',sec(key,'{{BODY_'+key+'}}'))
import re
bodies=dict(re.findall(r'<!--BODY (\w+)-->(.*?)<!--/BODY-->',open('../work/bodies.html').read(),re.S))
for key,b in bodies.items(): tpl=tpl.replace('{{BODY_'+key+'}}',b.strip())
for key,val in dict(FONTS=fonts,D=str(D),BLITZ=''.join(bh),TAGS=tags,CARDS=ch,GRADES=gh,TALLYA=tally('tA',5),TALLYB=tally('tB',4),
        KINY=kin('ky1','kin--y'),KIND=kin('kd1','kin--dark'),DRIP1=drips(5,3,'#fff'),DRIP2=drips(4,7,'#F8C038'),DRIP3=drips(6,11,'#E8352A'),
        FRAMES=str(int(D*30))).items():
    tpl=tpl.replace('{{'+key+'}}',val)
open('index.html','w').write(tpl)
print('ok')
