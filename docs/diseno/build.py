# Generador de pantallas SVG (390x844 @3x = 1170x2532) - Gestor de misiones mecha
import base64, os, sys, math
from xml.sax.saxutils import escape as esc

W,H=390,844
C=dict(navy='#070B14', panel='#0A1424', line='#2A4466', cyan='#6CC4FF', cyan2='#3D8BD9',
       amber='#FFB23E', orange='#FF6B35', text='#EAF1FA', muted='#93A7C0', dim='#5D708A', green='#5BE3A6')
PRI={'ALTA':C['orange'],'MEDIA':C['amber'],'BAJA':C['cyan']}
F_T="Orbitron, sans-serif"; F_B="Rajdhani, sans-serif"; F_M="'Share Tech Mono', monospace"

def bg_data():
    p=os.path.join(os.path.dirname(__file__),'cockpit_bg.jpg')
    return 'data:image/jpeg;base64,'+base64.b64encode(open(p,'rb').read()).decode()

def t(x,y,s,size,fill=None,font=F_B,weight=400,anchor='start',ls=0,op=1,id=None):
    fill=fill or C['text']
    a=f' id="{id}"' if id else ''
    return (f'<text{a} x="{x:.1f}" y="{y:.1f}" font-family="{font}" font-size="{size}" font-weight="{weight}" '
            f'fill="{fill}" text-anchor="{anchor}" letter-spacing="{ls}" opacity="{op}">{esc(s)}</text>')

def tl(x,y,lines,size,lh,**k):
    return ''.join(t(x,y+i*lh,l,size,**k) for i,l in enumerate(lines))

def head(title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1170" height="2532" viewBox="0 0 {W} {H}">
<title>{esc(title)}</title>
<defs>
<style>@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800&amp;family=Rajdhani:wght@400;500;600;700&amp;family=Share+Tech+Mono&amp;display=swap');</style>
<pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#9FD3FF" opacity="0.05"/></pattern>
<linearGradient id="shadeTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03060C" stop-opacity="0.92"/><stop offset="1" stop-color="#03060C" stop-opacity="0"/></linearGradient>
<linearGradient id="shadeBot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03060C" stop-opacity="0"/><stop offset="1" stop-color="#03060C" stop-opacity="0.95"/></linearGradient>
<radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.7"/></radialGradient>
<linearGradient id="cardG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1C33" stop-opacity="0.90"/><stop offset="1" stop-color="#060C18" stop-opacity="0.94"/></linearGradient>
<linearGradient id="amberG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF8A2B"/><stop offset="1" stop-color="#FFC24D"/></linearGradient>
<linearGradient id="glassHi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9FD3FF" stop-opacity="0.10"/><stop offset="0.4" stop-color="#9FD3FF" stop-opacity="0"/></linearGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
<clipPath id="screen"><rect width="{W}" height="{H}"/></clipPath>
</defs>
<g clip-path="url(#screen)">'''

def background(dark=0.35, blur=False, bgsrc=None):
    f=' filter="url(#blur6)"' if blur else ''
    return f'''<g id="Fondo">
<rect width="{W}" height="{H}" fill="{C['navy']}"/>
<image id="Fondo_cabina" href="{bgsrc}" x="0" y="0" width="{W}" height="{H}" preserveAspectRatio="xMidYMid slice"{f}/>
<rect id="Oscurecer" width="{W}" height="{H}" fill="#03060C" opacity="{dark}"/>
<rect width="{W}" height="200" fill="url(#shadeTop)"/>
<rect y="560" width="{W}" height="284" fill="url(#shadeBot)"/>
<rect width="{W}" height="{H}" fill="url(#vig)"/>
</g>'''

def hud(reticle=(195,400), r=150, scale_ticks=True, bottom=True):
    cx,cy=reticle
    s=[f'<g id="HUD" opacity="0.9">']
    s.append(f'<rect width="{W}" height="{H}" fill="url(#scan)"/>')
    # retícula
    s.append(f'<g id="Reticula" stroke="{C["cyan"]}" fill="none" opacity="0.22">'
             f'<circle cx="{cx}" cy="{cy}" r="{r}" stroke-width="0.8" stroke-dasharray="2 5"/>'
             f'<circle cx="{cx}" cy="{cy}" r="{r*0.72:.0f}" stroke-width="0.6"/>')
    for a in range(0,360,30):
        ra=math.radians(a); r1=r-6 if a%90 else r-12
        s.append(f'<line x1="{cx+r1*math.cos(ra):.1f}" y1="{cy+r1*math.sin(ra):.1f}" x2="{cx+(r+4)*math.cos(ra):.1f}" y2="{cy+(r+4)*math.sin(ra):.1f}" stroke-width="1"/>')
    s.append('</g>')
    # esquinas de pantalla
    s.append(f'<g id="Esquinas" stroke="{C["cyan"]}" stroke-width="1.4" fill="none" opacity="0.55">'
             f'<path d="M12 70 V56 H26"/><path d="M378 70 V56 H364"/>'+('<path d="M12 720 V734 H26"/><path d="M378 720 V734 H364"/>' if bottom else '')+'</g>')
    if scale_ticks:
        s.append(f'<g id="Escalas" stroke="{C["cyan"]}" opacity="0.35">')
        for i in range(0,26):
            y=230+i*14; l=8 if i%5==0 else 4
            s.append(f'<line x1="4" y1="{y}" x2="{4+l}" y2="{y}" stroke-width="0.8"/><line x1="{W-4}" y1="{y}" x2="{W-4-l}" y2="{y}" stroke-width="0.8"/>')
        s.append('</g>')
    s.append('</g>')
    return ''.join(s)

def statusbar():
    return (f'<g id="Barra_de_estado">'
            + t(28,33,'09:41',15,font=F_M,fill=C['text'])
            + t(276,33,'LNK',10,font=F_M,fill=C['muted'])
            + ''.join(f'<rect x="{298+i*4}" y="{25+ (3-i)*2}" width="2.5" height="{4+i*2}" fill="{C["cyan"]}"/>' for i in range(4))
            + t(320,33,'PWR',10,font=F_M,fill=C['muted'])
            + f'<rect x="343" y="23" width="26" height="12" rx="2" fill="none" stroke="{C["amber"]}" stroke-width="1"/>'
            + f'<rect x="345" y="25" width="19" height="8" fill="{C["amber"]}"/><rect x="370" y="27" width="2" height="4" fill="{C["amber"]}"/>'
            + '</g>')

def chip(x,y,label,color,filled=False,size=9.5,pad=7,h=18,w=None):
    w=w or (len(label)*size*0.62+pad*2)
    fill=color if filled else 'none'
    tc=C['navy'] if filled else color
    return (f'<g><path d="M{x+5} {y} H{x+w} V{y+h-5} L{x+w-5} {y+h} H{x} V{y+5} Z" fill="{fill if filled else '#050A14'}" fill-opacity="{0.95 if filled else 0.8}" stroke="{color}" stroke-width="1"/>'
            + t(x+w/2,y+h/2+size*0.36,label,size,fill=tc,font=F_B,weight=700,anchor='middle',ls=1)+'</g>'), w

def gauge(x,y,w,pct,segs=20,h=10,color='url(#amberG)'):
    g=2; sw=(w-(segs-1)*g)/segs; on=round(pct/100*segs)
    out=[f'<g id="Medidor_energia">']
    for i in range(segs):
        out.append(f'<rect x="{x+i*(sw+g):.2f}" y="{y}" width="{sw:.2f}" height="{h}" fill="{color if i<on else "#1A2A40"}" {"filter=\"url(#glow)\"" if i==on-1 else ""}/>')
    out.append('</g>')
    return ''.join(out)

def panel_path(x,y,w,h,c=12):
    return f'M{x+c} {y} H{x+w} V{y+h-c} L{x+w-c} {y+h} H{x} V{y+c} Z'

def card(x,y,w,h,m,active=True,op=1.0,scale=1.0,idx=0):
    cx=x+w/2; cy=y+h/2
    tr=f'translate({cx} {cy}) scale({scale}) translate({-cx} {-cy})'
    pc=PRI[m['pri']]
    s=[f'<g id="Tarjeta_mision_{idx+1:02d}" transform="{tr}" opacity="{op}">']
    s.append(f'<path d="{panel_path(x,y,w,h,16)}" fill="url(#cardG)" stroke="{C["cyan2"] if active else C["line"]}" stroke-width="1"/>')
    s.append(f'<path d="{panel_path(x,y,w,h,16)}" fill="url(#glassHi)"/>')
    # acento lateral prioridad
    s.append(f'<rect x="{x}" y="{y+40}" width="3" height="70" fill="{pc}"/>')
    # brackets
    s.append(f'<g stroke="{C["cyan"]}" stroke-width="1.5" fill="none" opacity="{0.9 if active else 0.4}"><path d="M{x+w-22} {y+6} H{x+w-6} V{y+22}"/><path d="M{x+6} {y+h-22} V{y+h-6} H{x+22}"/></g>')
    px=x+20
    s.append(t(px,y+30,f'MISIÓN {m["code"]}',10.5,font=F_M,fill=C['cyan'],ls=1.5))
    c,cw=chip(x+w-20-118,y+17,f'PRIORIDAD {m["pri"]}',pc,filled=(m['pri']=='ALTA'),w=118)
    s.append(c)
    s.append(tl(px,y+66,m['name'],25,27,font=F_B,weight=700,fill=C['text']))
    ny=y+66+(len(m['name'])-1)*27
    s.append(t(px,ny+28,'OBJETIVO',9.5,font=F_M,fill=C['muted'],ls=1.5))
    s.append(tl(px,ny+46,m['obj'],14.5,18,font=F_B,weight=500,fill='#C9D6E6'))
    oy=ny+46+(len(m['obj'])-1)*18
    # fila datos
    ry=oy+22
    s.append(f'<line x1="{px}" y1="{ry}" x2="{x+w-20}" y2="{ry}" stroke="{C["line"]}" stroke-width="1"/>')
    s.append(t(px,ry+20,'FECHA LÍMITE',9,font=F_M,fill=C['muted'],ls=1.2))
    s.append(t(px,ry+40,m['due'],15,font=F_B,weight=700))
    s.append(t(px,ry+56,m['tminus'],10.5,font=F_M,fill=pc))
    mx=x+w/2+14
    s.append(t(mx,ry+20,'SUB-OBJETIVOS',9,font=F_M,fill=C['muted'],ls=1.2))
    s.append(t(mx,ry+40,f'{m["done"]}/{m["total"]}',15,font=F_B,weight=700))
    for i in range(m['total']):
        s.append(f'<rect x="{mx+i*9}" y="{ry+49}" width="7" height="7" fill="{C["cyan"] if i<m["done"] else "none"}" stroke="{C["cyan"]}" stroke-width="0.8"/>')
    # medidor
    gy=ry+78
    pct=round(m['done']/m['total']*100)
    s.append(t(px,gy,'ENERGÍA DE MISIÓN',9,font=F_M,fill=C['muted'],ls=1.2))
    s.append(t(x+w-20,gy,f'{pct}%',14,font=F_T,weight=700,fill=C['amber'],anchor='end'))
    s.append(gauge(px,gy+8,w-40,pct))
    # siguiente objetivo
    if m.get('next'):
        s.append(t(px,gy+44,'SIGUIENTE OBJETIVO',9,font=F_M,fill=C['muted'],ls=1.2))
        s.append(f'<path d="M{px} {gy+54} l6 5 l-6 5 Z" fill="{C["cyan"]}"/>')
        s.append(t(px+12,gy+64,m['next'],14.5,font=F_B,weight=600,fill=C['text']))
    # boton
    by=y+h-52
    s.append(f'<path d="{panel_path(px,by,w-40,36,8)}" fill="{C["cyan"]}" fill-opacity="0.12" stroke="{C["cyan"]}" stroke-width="1"/>')
    s.append(t(x+w/2,by+23,'ABRIR MISIÓN  ›',13,font=F_T,weight=700,fill=C['cyan'],anchor='middle',ls=1.5))
    s.append('</g>')
    return ''.join(s)

def icon(kind,x,y,color,sw=1.6):
    p={'mis':f'<circle cx="{x}" cy="{y}" r="9"/><circle cx="{x}" cy="{y}" r="4"/><path d="M{x} {y-13} V{y-7} M{x} {y+7} V{y+13} M{x-13} {y} H{x-7} M{x+7} {y} H{x+13}"/>',
       'obj':f'<path d="M{x-10} {y-8} l3 3 l5 -6 M{x-10} {y+4} l3 3 l5 -6 M{x+2} {y-6} H{x+11} M{x+2} {y+6} H{x+11}"/>',
       'stats':f'<path d="M{x-10} {y+10} V{y+2} M{x-3} {y+10} V{y-4} M{x+4} {y+10} V{y-1} M{x+11} {y+10} V{y-9} M{x-12} {y+10} H{x+13}"/>',
       'perfil':f'<path d="M{x-9} {y-10} H{x+9} L{x+11} {y-2} L{x+6} {y+3} H{x-6} L{x-11} {y-2} Z M{x-12} {y+12} Q{x} {y+3} {x+12} {y+12}"/><rect x="{x-6}" y="{y-6}" width="12" height="3"/>'}[kind]
    return f'<g fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{p}</g>'

def bottom_nav(active='mis'):
    y=748
    s=[f'<g id="Navegacion_inferior">']
    s.append(f'<path d="M0 {y+14} L22 {y} H140 L156 {y+10} H234 L250 {y} H368 L390 {y+14} V{H} H0 Z" fill="#050A14" fill-opacity="0.92" stroke="{C["line"]}" stroke-width="1"/>')
    s.append(f'<path d="M22 {y} H140 L156 {y+10} H234 L250 {y} H368" fill="none" stroke="{C["cyan"]}" stroke-width="1" opacity="0.6"/>')
    items=[('mis','Misiones',48),('obj','Objetivos',116),('stats','Hangar',274),('perfil','Perfil',342)]
    for k,l,x in items:
        col=C['cyan'] if k==active else C['dim']
        s.append(f'<g id="Nav_{l}">'+icon(k,x,y+32,col)+t(x,y+62,l.upper(),9.5,font=F_B,weight=700,fill=col,anchor='middle',ls=1)+'</g>')
        if k==active: s.append(f'<rect x="{x-14}" y="{y+2}" width="28" height="2" fill="{C["cyan"]}" filter="url(#glow)"/>')
    # boton central hexagonal
    cx,cy=195,y+12
    hexp=' '.join(f'{cx+30*math.cos(math.radians(a+30)):.1f},{cy+30*math.sin(math.radians(a+30)):.1f}' for a in range(0,360,60))
    hexi=' '.join(f'{cx+24*math.cos(math.radians(a+30)):.1f},{cy+24*math.sin(math.radians(a+30)):.1f}' for a in range(0,360,60))
    s.append(f'<g id="Boton_nueva_mision"><polygon points="{hexp}" fill="#050A14" stroke="{C["amber"]}" stroke-width="1.2"/>'
             f'<polygon points="{hexi}" fill="url(#amberG)" filter="url(#glow)"/>'
             f'<path d="M{cx} {cy-9} V{cy+9} M{cx-9} {cy} H{cx+9}" stroke="{C["navy"]}" stroke-width="3" stroke-linecap="square"/>'
             + t(cx,y+62,'NUEVA MISIÓN',9.5,font=F_B,weight=700,fill=C['amber'],anchor='middle',ls=1)+'</g>')
    s.append(f'<rect id="Indicador_inicio" x="128" y="831" width="134" height="5" rx="2.5" fill="{C["text"]}" opacity="0.85"/>')
    s.append('</g>')
    return ''.join(s)

MISSIONS=[
 dict(code='01',name=['Portafolio web'],obj=['Maquetar home, proyectos y','contacto en Figma.'],pri='MEDIA',due='28 NOV · 12:00',tminus='T-05D 21H',done=3,total=8,next='Maquetar sección de proyectos'),
 dict(code='02',name=['Entregar etiquetas','Edén Botánico'],obj=['Exportar las 9 etiquetas finales','en PNG y SVG para impresión.'],pri='ALTA',due='25 NOV · 18:00',tminus='T-02D 03H',done=6,total=9,next='Exportar SVG editables'),
 dict(code='03',name=['Rediseño de logo'],obj=['Presentar 3 propuestas de','isotipo al cliente.'],pri='MEDIA',due='30 NOV · 10:00',tminus='T-06D 19H',done=2,total=6,next='Bocetos de isotipo (3 rutas)'),
 dict(code='04',name=['Fondo app hangar'],obj=['Entregar versiones móvil y','escritorio con overlay.'],pri='BAJA',due='02 DIC · 17:00',tminus='T-09D 02H',done=4,total=5,next='Exportar versión escritorio'),
 dict(code='05',name=['Brief cafetería'],obj=['Reunión y moodboard de','identidad visual.'],pri='BAJA',due='04 DIC · 09:00',tminus='T-10D 18H',done=0,total=4,next='Agendar reunión con el cliente'),
]

def carousel(active=1, offset=0.0, y=196, w=284, h=430, gap=12):
    step=w*0.92+gap; s=[f'<g id="Carrusel_misiones">']
    order=sorted(range(len(MISSIONS)), key=lambda i: -abs((i-active)*step+offset))
    for i in order:
        dx=(i-active)*step+offset
        if abs(dx)>step*1.6: continue
        d=min(abs(dx)/step,1)
        sc=1-0.08*d; op=1-0.55*d
        s.append(card((W-w)/2+dx,y,w,h,MISSIONS[i],active=d<0.5,op=op,scale=sc,idx=i))
    s.append('</g>')
    return ''.join(s)

def screen_misiones(bgsrc, offset=0.0, active=1, frame_dot=None):
    s=[head('01 - Misiones'), background(0.22,bgsrc=bgsrc), hud((195,410),165), statusbar()]
    # cabecera
    s.append('<g id="Cabecera">'
             + t(24,74,'PILOTO // UNIDAD',9.5,font=F_M,fill=C['muted'],ls=1.5)
             + t(24,98,'YJ-07 HALCÓN',20,font=F_T,weight=800,fill=C['text'],ls=1)
             + t(366,74,'LUN 23 NOV 2026',10,font=F_M,fill=C['muted'],anchor='end',ls=1)
             + f'<circle cx="248" cy="94" r="3.5" fill="{C["green"]}" filter="url(#glow)"/>'
             + t(366,98,'SISTEMAS EN LÍNEA',11,font=F_B,weight=700,fill=C['green'],anchor='end',ls=1)
             + f'<line x1="24" y1="112" x2="366" y2="112" stroke="{C["line"]}" stroke-width="1"/>'
             + f'<rect x="24" y="111" width="60" height="2" fill="{C["cyan"]}"/>'
             + '</g>')
    s.append('<g id="Titulo_seccion">'
             + t(24,146,'MISIONES ACTIVAS',17,font=F_T,weight=700,fill=C['text'],ls=1.5)
             + t(366,146,f'{active+1:02d} / {len(MISSIONS):02d}',13,font=F_M,fill=C['cyan'],anchor='end')
             + '</g>')
    fx=24; fs=[]
    for lab,on in [('TODAS',True),('ALTA',False),('HOY',False),('ESTA SEMANA',False)]:
        c,w=chip(fx,160,lab,C['cyan'] if on else C['dim'],filled=on,size=10,h=20)
        fs.append(c); fx+=w+8
    s.append('<g id="Filtros">'+''.join(fs)+'</g>')
    s.append(carousel(active,offset))
    # flechas de deslizamiento
    s.append(f'<g id="Pistas_deslizar" fill="none" stroke="{C["cyan"]}" stroke-width="2" opacity="0.85" filter="url(#glow)">'
             f'<path d="M14 400 l-6 11 l6 11"/><path d="M22 400 l-6 11 l6 11" opacity="0.5"/>'
             f'<path d="M376 400 l6 11 l-6 11"/><path d="M368 400 l6 11 l-6 11" opacity="0.5"/></g>')
    # indicador de páginas
    act = active if frame_dot is None else frame_dot
    dots=[]; total=len(MISSIONS); dw=[]
    xs=195-((total-1)*14+18)/2; xx=xs
    for i in range(total):
        if i==act: dots.append(f'<rect x="{xx:.1f}" y="644" width="26" height="4" fill="{C["amber"]}" filter="url(#glow)"/>'); xx+=34
        else: dots.append(f'<rect x="{xx:.1f}" y="644" width="8" height="4" fill="{C["dim"]}"/>'); xx+=16
    s.append('<g id="Indicador_paginas">'+''.join(dots)+t(195,668,'◂  DESLIZA PARA CAMBIAR DE MISIÓN  ▸',9.5,font=F_M,fill=C['muted'],anchor='middle',ls=1)+'</g>')
    # mini estado piloto
    s.append('<g id="Estado_piloto">')
    for i,(lab,val,col) in enumerate([('COMPLETADAS','12',C['text']),('RACHA','5 DÍAS',C['amber']),('XP PILOTO','2.480',C['cyan'])]):
        x=24+i*118
        s.append(f'<path d="{panel_path(x,684,108,48,7)}" fill="#050A14" fill-opacity="0.75" stroke="{C["line"]}" stroke-width="1"/>')
        s.append(t(x+10,700,lab,8.5,font=F_M,fill=C['muted'],ls=1)+t(x+10,722,val,16,font=F_T,weight=700,fill=col))
    s.append('</g>')
    s.append(bottom_nav('mis'))
    s.append('</g></svg>')
    return ''.join(s)

def checkbox(x,y,done):
    if done:
        return (f'<rect x="{x}" y="{y}" width="16" height="16" fill="{C["cyan"]}" fill-opacity="0.18" stroke="{C["cyan"]}" stroke-width="1.2"/>'
                f'<path d="M{x+3.5} {y+8} l3 3 l6 -7" fill="none" stroke="{C["cyan"]}" stroke-width="2"/>')
    return f'<rect x="{x}" y="{y}" width="16" height="16" fill="none" stroke="{C["dim"]}" stroke-width="1.2"/>'

def screen_detalle(bgsrc):
    m=MISSIONS[1]; pc=PRI[m['pri']]
    s=[head('02 - Detalle de misión'), background(0.55,bgsrc=bgsrc), hud((300,210),70,scale_ticks=False,bottom=False), statusbar()]
    s.append('<g id="Cabecera">'
             + f'<path d="{panel_path(20,58,104,30,7)}" fill="#050A14" fill-opacity="0.8" stroke="{C["line"]}"/>'
             + t(72,78,'‹  MISIONES',12,font=F_B,weight=700,fill=C['cyan'],anchor='middle',ls=1)
             + t(370,78,'MISIÓN 02',11,font=F_M,fill=C['cyan'],anchor='end',ls=1.5)
             + '</g>')
    c,_=chip(24,104,'PRIORIDAD ALTA',pc,filled=True,w=118)
    s.append('<g id="Titulo">'+c+tl(24,150,m['name'],30,32,font=F_B,weight=700)
             + tl(24,212,m['obj'],15,19,font=F_B,weight=500,fill='#C9D6E6')+'</g>')
    # bloque estado
    s.append('<g id="Estado_mision">')
    s.append(f'<path d="{panel_path(20,256,350,112,12)}" fill="url(#cardG)" stroke="{C["cyan2"]}"/>')
    # gauge radial
    cx,cy,r=78,312,36; pct=67
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#1A2A40" stroke-width="7"/>')
    for i in range(24):
        a0=-90+i*15+1.5; a1=a0+12; on=i<round(pct/100*24)
        x0=cx+r*math.cos(math.radians(a0)); y0=cy+r*math.sin(math.radians(a0)); x1=cx+r*math.cos(math.radians(a1)); y1=cy+r*math.sin(math.radians(a1))
        if on: s.append(f'<path d="M{x0:.2f} {y0:.2f} A{r} {r} 0 0 1 {x1:.2f} {y1:.2f}" fill="none" stroke="{C["amber"]}" stroke-width="7"/>')
    s.append(t(cx,cy+6,'67%',17,font=F_T,weight=800,fill=C['amber'],anchor='middle'))
    s.append(t(cx,cy+22,'ENERGÍA',7.5,font=F_M,fill=C['muted'],anchor='middle',ls=1))
    for j,(lab,val,sub,col) in enumerate([('FECHA LÍMITE','25 NOV · 18:00','T-02D 03H',pc),('SUB-OBJETIVOS','6 / 9','3 PENDIENTES',C['cyan'])]):
        y=282+j*46
        s.append(t(138,y,lab,9,font=F_M,fill=C['muted'],ls=1.2)+t(138,y+20,val,17,font=F_B,weight=700)+t(352,y+20,sub,10.5,font=F_M,fill=col,anchor='end'))
    s.append('</g>')
    # checklist
    items=[('Estructura base de etiqueta',1),('Ilustraciones de ingredientes',1),('Mayúsculas en nombres ("De Avena")',1),
           ('Sábila en jabón para piel grasa',1),('Revisión final de textos',1),('Exportar PNG para impresión',1),
           ('Exportar SVG editables',0),('Enviar a Mery para aprobación',0),('Imprimir pruebas de color',0)]
    s.append('<g id="Lista_objetivos">'+t(24,398,'OBJETIVOS',13,font=F_T,weight=700,ls=1.5)+t(366,398,'6/9 COMPLETADOS',10,font=F_M,fill=C['cyan'],anchor='end'))
    s.append(f'<path d="{panel_path(20,410,350,9*29+12,12)}" fill="#050A14" fill-opacity="0.78" stroke="{C["line"]}"/>')
    for i,(lab,d) in enumerate(items):
        y=420+i*29
        s.append(f'<g id="Objetivo_{i+1:02d}">'+checkbox(36,y+2,d)+t(62,y+15,lab,14.5,font=F_B,weight=600 if not d else 500,fill=C['text'] if not d else '#9FB2C9'))
        if d: s.append(f'<line x1="62" y1="{y+10}" x2="{62+len(lab)*5.75:.0f}" y2="{y+10}" stroke="#9FB2C9" stroke-width="0.8" opacity="0.6"/>')
        s.append(t(352,y+15,'OK' if d else '--',10,font=F_M,fill=C['green'] if d else C['dim'],anchor='end')+'</g>')
        if i<8: s.append(f'<line x1="36" y1="{y+26}" x2="354" y2="{y+26}" stroke="{C["line"]}" stroke-width="0.5" opacity="0.6"/>')
    s.append('</g>')
    # notas
    s.append('<g id="Notas">'+t(24,710,'NOTAS DE CAMPO',11,font=F_M,fill=C['muted'],ls=1.5))
    s.append(f'<path d="{panel_path(20,718,350,48,8)}" fill="#050A14" fill-opacity="0.78" stroke="{C["line"]}"/>')
    s.append(tl(34,738,['Confirmar con Mery el peso neto antes de','imprimir. Papel adhesivo mate.'],13,16,font=F_B,weight=500,fill='#C9D6E6')+'</g>')
    # boton completar
    s.append(f'<g id="Boton_completar"><path d="{panel_path(20,778,350,46,10)}" fill="url(#amberG)" filter="url(#glow)"/>'
             + t(195,807,'COMPLETAR MISIÓN',15,font=F_T,weight=800,fill=C['navy'],anchor='middle',ls=2)+'</g>')
    s.append(f'<rect id="Indicador_inicio" x="128" y="834" width="134" height="5" rx="2.5" fill="{C["text"]}" opacity="0.85"/>')
    s.append('</g></svg>')
    return ''.join(s)

def field(x,y,w,label,value,h=44,active=False,lines=None):
    s=t(x,y,label,9.5,font=F_M,fill=C['muted'],ls=1.5)
    s+=f'<path d="{panel_path(x,y+8,w,h,8)}" fill="#050A14" fill-opacity="0.82" stroke="{C["cyan"] if active else C["line"]}" stroke-width="1"/>'
    if lines: s+=tl(x+14,y+31,lines,15,19,font=F_B,weight=600)
    else: s+=t(x+14,y+36,value,17,font=F_B,weight=700)
    if active: s+=f'<rect x="{x+14+len(value)*7.9:.0f}" y="{y+21}" width="1.6" height="19" fill="{C["cyan"]}"/>'
    return s

def screen_nueva(bgsrc):
    s=[head('03 - Nueva misión'), background(0.6,bgsrc=bgsrc), hud((195,420),150,scale_ticks=False), statusbar()]
    s.append('<g id="Cabecera">'
             + t(24,80,'✕',18,font=F_B,weight=700,fill=C['muted'])
             + t(195,80,'NUEVA MISIÓN',15,font=F_T,weight=800,anchor='middle',ls=2)
             + t(366,80,'BORRADOR',10,font=F_M,fill=C['amber'],anchor='end',ls=1)
             + f'<line x1="24" y1="96" x2="366" y2="96" stroke="{C["line"]}"/><rect x="24" y="95" width="60" height="2" fill="{C["amber"]}"/></g>')
    s.append('<g id="Formulario">')
    s.append(t(24,124,'CÓDIGO ASIGNADO: MISIÓN 06',10,font=F_M,fill=C['cyan'],ls=1.2))
    s.append(field(20,146,350,'NOMBRE DE LA MISIÓN','Rediseño de logo',active=True))
    s.append(field(20,216,350,'OBJETIVO','',h=56,lines=['Presentar 3 propuestas de isotipo','y paleta de color al cliente.']))
    # prioridad
    s.append(t(20,298,'NIVEL DE PRIORIDAD',9.5,font=F_M,fill=C['muted'],ls=1.5))
    for i,p in enumerate(['ALTA','MEDIA','BAJA']):
        x=20+i*120; sel=p=='MEDIA'; col=PRI[p]
        s.append(f'<path d="{panel_path(x,306,110,40,8)}" fill="{col if sel else "#050A14"}" fill-opacity="{0.95 if sel else 0.82}" stroke="{col}" stroke-width="1"/>'
                 + t(x+55,331,p,14,font=F_T,weight=800,fill=C['navy'] if sel else col,anchor='middle',ls=1.5))
    # fecha y hora
    s.append(field(20,368,170,'FECHA LÍMITE','30 NOV 2026'))
    s.append(field(200,368,170,'HORA','10:00'))
    s.append(f'<g stroke="{C["cyan"]}" fill="none" stroke-width="1.4"><rect x="166" y="389" width="12" height="11"/><path d="M166 393 H178"/><circle cx="352" cy="398" r="7"/><path d="M352 394 V398 H356"/></g>')
    # sub objetivos
    s.append(t(20,442,'SUB-OBJETIVOS',9.5,font=F_M,fill=C['muted'],ls=1.5)+t(370,442,'3',10,font=F_M,fill=C['cyan'],anchor='end'))
    s.append(f'<path d="{panel_path(20,450,350,3*36+44,10)}" fill="#050A14" fill-opacity="0.82" stroke="{C["line"]}"/>')
    for i,lab in enumerate(['Investigar referencias del cliente','Bocetos de isotipo (3 rutas)','Preparar presentación en PDF']):
        y=460+i*36
        s.append(f'<g id="Subobjetivo_{i+1:02d}">'+checkbox(36,y+6,0)+t(62,y+19,lab,15,font=F_B,weight=600)+f'<path d="M346 {y+10} l8 8 M354 {y+10} l-8 8" stroke="{C["dim"]}" stroke-width="1.4"/></g>')
        s.append(f'<line x1="36" y1="{y+32}" x2="354" y2="{y+32}" stroke="{C["line"]}" stroke-width="0.5"/>')
    s.append(t(36,586,'+  AÑADIR SUB-OBJETIVO',13,font=F_B,weight=700,fill=C['cyan'],ls=1))
    # recompensa
    s.append(f'<path d="{panel_path(20,612,350,58,10)}" fill="url(#cardG)" stroke="{C["cyan2"]}"/>')
    s.append(t(36,634,'RECOMPENSA ESTIMADA',9.5,font=F_M,fill=C['muted'],ls=1.5)+t(36,658,'+250 XP',18,font=F_T,weight=800,fill=C['amber']))
    s.append(t(354,634,'CARGA DE ENERGÍA',9.5,font=F_M,fill=C['muted'],ls=1.5,anchor='end')+gauge(222,646,132,0,segs=12,h=9))
    s.append('</g>')
    s.append(f'<g id="Boton_desplegar"><path d="{panel_path(20,770,350,48,10)}" fill="url(#amberG)" filter="url(#glow)"/>'
             + t(195,800,'DESPLEGAR MISIÓN',15,font=F_T,weight=800,fill=C['navy'],anchor='middle',ls=2)+'</g>')
    s.append(t(195,752,'Podrás editar todo después desde el detalle.',12,font=F_B,weight=500,fill=C['muted'],anchor='middle'))
    s.append(f'<rect id="Indicador_inicio" x="128" y="831" width="134" height="5" rx="2.5" fill="{C["text"]}" opacity="0.85"/>')
    s.append('</g></svg>')
    return ''.join(s)

def screen_completada(bgsrc):
    s=[head('04 - Misión completada'), background(0.45,bgsrc=bgsrc), statusbar()]
    cx,cy=195,300
    s.append(f'<g id="HUD"><rect width="{W}" height="{H}" fill="url(#scan)"/>'
             f'<g id="Esquinas" stroke="{C["cyan"]}" stroke-width="1.4" fill="none" opacity="0.55"><path d="M12 70 V56 H26"/><path d="M378 70 V56 H364"/></g></g>')
    s.append(f'<g id="Emblema_completada"><circle cx="{cx}" cy="{cy}" r="118" fill="#03060C" fill-opacity="0.55" stroke="{C["amber"]}" stroke-width="1" stroke-dasharray="3 6"/>'
             f'<circle cx="{cx}" cy="{cy}" r="96" fill="none" stroke="{C["amber"]}" stroke-width="2" filter="url(#glow)"/>'
             f'<circle cx="{cx}" cy="{cy}" r="80" fill="none" stroke="{C["amber"]}" stroke-width="0.8" opacity="0.6"/>')
    for a in range(0,360,45):
        ra=math.radians(a)
        s.append(f'<line x1="{cx+100*math.cos(ra):.1f}" y1="{cy+100*math.sin(ra):.1f}" x2="{cx+124*math.cos(ra):.1f}" y2="{cy+124*math.sin(ra):.1f}" stroke="{C["amber"]}" stroke-width="1.5"/>')
    s.append(f'<path d="M{cx-34} {cy+2} l22 22 l46 -50" fill="none" stroke="{C["amber"]}" stroke-width="9" stroke-linecap="square" filter="url(#glow)"/></g>')
    s.append('<g id="Mensaje">'+t(195,460,'MISIÓN COMPLETADA',22,font=F_T,weight=800,anchor='middle',ls=2)
             + t(195,486,'Entregar etiquetas Edén Botánico',17,font=F_B,weight=600,fill=C['cyan'],anchor='middle')
             + t(195,508,'Objetivo cumplido. Buen trabajo, piloto.',14,font=F_B,weight=500,fill=C['muted'],anchor='middle')+'</g>')
    s.append('<g id="Resumen">')
    for i,(lab,val,col) in enumerate([('XP GANADA','+350',C['amber']),('TIEMPO','4D 06H',C['text']),('SUB-OBJ.','9/9',C['cyan'])]):
        x=20+i*120
        s.append(f'<path d="{panel_path(x,536,110,64,8)}" fill="#050A14" fill-opacity="0.8" stroke="{C["line"]}"/>'
                 + t(x+55,558,lab,9,font=F_M,fill=C['muted'],anchor='middle',ls=1)+t(x+55,586,val,19,font=F_T,weight=800,fill=col,anchor='middle'))
    s.append(t(20,632,'NIVEL DE PILOTO 08',10,font=F_M,fill=C['muted'],ls=1.2)+t(370,632,'2.830 / 3.000 XP',10,font=F_M,fill=C['amber'],anchor='end'))
    s.append(gauge(20,642,350,94,segs=30,h=10))
    s.append('</g>')
    s.append(f'<g id="Boton_volver"><path d="{panel_path(20,700,350,48,10)}" fill="url(#amberG)" filter="url(#glow)"/>'
             + t(195,730,'VOLVER AL HANGAR',15,font=F_T,weight=800,fill=C['navy'],anchor='middle',ls=2)+'</g>')
    s.append(f'<g id="Boton_siguiente"><path d="{panel_path(20,758,350,44,10)}" fill="none" stroke="{C["cyan"]}"/>'
             + t(195,785,'SIGUIENTE MISIÓN  ›',13,font=F_T,weight=700,fill=C['cyan'],anchor='middle',ls=1.5)+'</g>')
    s.append(f'<rect id="Indicador_inicio" x="128" y="831" width="134" height="5" rx="2.5" fill="{C["text"]}" opacity="0.85"/>')
    s.append('</g></svg>')
    return ''.join(s)

def fingerprint(cx,cy,color):
    out=[f'<g id="Huella" fill="none" stroke="{color}" stroke-width="1.6" stroke-linecap="round">']
    for i,r in enumerate([4,8,12,16,20]):
        rx=r*0.78; ry=r
        a0=215+i*4; a1=-35-i*4 if i%2 else -20
        x0=cx+rx*math.cos(math.radians(a0)); y0=cy-ry*math.sin(math.radians(a0))
        x1=cx+rx*math.cos(math.radians(a1)); y1=cy-ry*math.sin(math.radians(a1))
        out.append(f'<path d="M{x0:.1f} {y0:.1f} A{rx:.1f} {ry} 0 1 1 {x1:.1f} {y1:.1f}"/>')
    out.append(f'<path d="M{cx} {cy-2} V{cy+10} M{cx-4} {cy+4} V{cy+16} M{cx+4} {cy+2} V{cy+14}" opacity="0.8"/>')
    out.append('</g>')
    return ''.join(out)

def screen_acceso(bgsrc):
    s=[head('05 - Acceso de piloto'), background(0.5,bgsrc=bgsrc),
       f'<rect id="Tinte_arranque" width="{W}" height="{H}" fill="#0B2A55" opacity="0.18"/>',
       hud((195,640),70,scale_ticks=True,bottom=False), statusbar()]
    # secuencia de arranque
    s.append('<g id="Secuencia_arranque">')
    rows=[('> INICIANDO SISTEMAS...','OK',C['green']),('> REACTOR PRINCIPAL','98%',C['cyan']),
          ('> SENSORES HUD','OK',C['green']),('> ENLACE NEURAL','EN ESPERA',C['amber'])]
    for i,(a,b,col) in enumerate(rows):
        y=78+i*15
        s.append(t(24,y,a,10,font=F_M,fill=C['muted'],ls=0.5))
        s.append(f'<line x1="{24+len(a)*6.1+6:.0f}" y1="{y-3}" x2="{366-len(b)*6.1-6:.0f}" y2="{y-3}" stroke="{C["dim"]}" stroke-width="0.8" stroke-dasharray="1 3"/>')
        s.append(t(366,y,b,10,font=F_M,fill=col,anchor='end',ls=0.5))
    s.append(f'<rect x="24" y="{78+3*15+6}" width="342" height="2" fill="#1A2A40"/><rect x="24" y="{78+3*15+6}" width="262" height="2" fill="{C["cyan"]}" filter="url(#glow)"/>')
    s.append('</g>')
    # logotipo
    cx,cy=195,196
    hexo=' '.join(f'{cx+30*math.cos(math.radians(a+30)):.1f},{cy+30*math.sin(math.radians(a+30)):.1f}' for a in range(0,360,60))
    hexi=' '.join(f'{cx+23*math.cos(math.radians(a+30)):.1f},{cy+23*math.sin(math.radians(a+30)):.1f}' for a in range(0,360,60))
    s.append(f'<g id="Logotipo"><polygon points="{hexo}" fill="#050A14" fill-opacity="0.8" stroke="{C["cyan"]}" stroke-width="1.4" filter="url(#glow)"/>'
             f'<polygon points="{hexi}" fill="none" stroke="{C["amber"]}" stroke-width="1"/>'
             f'<path d="M{cx-12} {cy+9} V{cy-9} L{cx} {cy+2} L{cx+12} {cy-9} V{cy+9}" fill="none" stroke="{C["amber"]}" stroke-width="3" stroke-linejoin="miter"/>'
             + t(195,254,'MISIÓN//CONTROL',22,font=F_T,weight=800,anchor='middle',ls=2)
             + t(195,274,'GESTOR TÁCTICO DE MISIONES',10.5,font=F_M,fill=C['cyan'],anchor='middle',ls=2)+'</g>')
    # formulario
    s.append('<g id="Formulario_acceso">')
    s.append(t(24,318,'ACCESO DE PILOTO',16,font=F_T,weight=700,ls=1.5))
    s.append(f'<line x1="24" y1="330" x2="366" y2="330" stroke="{C["line"]}"/><rect x="24" y="329" width="60" height="2" fill="{C["cyan"]}"/>')
    s.append(t(20,356,'ID DE PILOTO',9.5,font=F_M,fill=C['muted'],ls=1.5))
    s.append(f'<path d="{panel_path(20,364,350,46,8)}" fill="#050A14" fill-opacity="0.85" stroke="{C["cyan"]}"/>')
    s.append(f'<g fill="none" stroke="{C["cyan"]}" stroke-width="1.4"><circle cx="40" cy="383" r="4.5"/><path d="M32 396 Q40 388 48 396"/></g>')
    s.append(t(58,393,'piloto@correo.com',16,font=F_B,weight=600,fill=C['text'],id='Campo_id'))
    s.append(t(20,430,'CÓDIGO DE ACCESO',9.5,font=F_M,fill=C['muted'],ls=1.5))
    s.append(f'<path d="{panel_path(20,438,350,46,8)}" fill="#050A14" fill-opacity="0.85" stroke="{C["line"]}"/>')
    s.append(f'<g fill="none" stroke="{C["muted"]}" stroke-width="1.4"><rect x="34" y="458" width="12" height="9"/><path d="M36 458 V454 a4 4 0 0 1 8 0 V458"/></g>')
    s.append(''.join(f'<circle cx="{62+i*13}" cy="461" r="3.6" fill="{C["text"]}"/>' for i in range(8)))
    s.append(f'<g id="Mostrar_codigo"><path d="M302 461 Q311 451 320 461 Q311 471 302 461 Z" fill="none" stroke="{C["cyan"]}" stroke-width="1.4"/><circle cx="311" cy="461" r="2.6" fill="{C["cyan"]}"/>'
             + t(356,465,'VER',10,font=F_M,fill=C['cyan'],anchor='end',ls=1)+'</g>')
    s.append(t(370,508,'¿Olvidaste tu código?',13,font=F_B,weight=600,fill=C['cyan'],anchor='end',id='Link_olvido'))
    s.append(f'<g id="Boton_iniciar_enlace"><path d="{panel_path(20,522,350,50,10)}" fill="url(#amberG)" filter="url(#glow)"/>'
             + t(195,553,'INICIAR ENLACE',16,font=F_T,weight=800,fill=C['navy'],anchor='middle',ls=2.5)+'</g>')
    s.append('</g>')
    # biometrico
    s.append('<g id="Escaneo_biometrico">')
    s.append(f'<line x1="24" y1="591" x2="108" y2="591" stroke="{C["line"]}"/><line x1="282" y1="591" x2="366" y2="591" stroke="{C["line"]}"/>')
    s.append(t(195,595,'O ESCANEO BIOMÉTRICO',9.5,font=F_M,fill=C['muted'],anchor='middle',ls=1.2))
    bx,by=195,660
    s.append(f'<circle cx="{bx}" cy="{by}" r="40" fill="#050A14" fill-opacity="0.75" stroke="{C["cyan"]}" stroke-width="1.2"/>')
    s.append(f'<circle cx="{bx}" cy="{by}" r="46" fill="none" stroke="{C["cyan"]}" stroke-width="2" stroke-dasharray="40 250" transform="rotate(-60 {bx} {by})" filter="url(#glow)"/>')
    s.append(f'<circle cx="{bx}" cy="{by}" r="46" fill="none" stroke="{C["cyan"]}" stroke-width="0.8" stroke-dasharray="2 4" opacity="0.6"/>')
    s.append(fingerprint(bx,by,C['cyan']))
    s.append(f'<line x1="{bx-26}" y1="{by+6}" x2="{bx+26}" y2="{by+6}" stroke="{C["amber"]}" stroke-width="1.5" opacity="0.9" filter="url(#glow)"/>')
    s.append(t(195,726,'TOCA PARA ESCANEAR HUELLA',10,font=F_M,fill=C['cyan'],anchor='middle',ls=1.2))
    s.append('</g>')
    s.append('<g id="Registro">'+t(170,778,'¿Nuevo en la unidad?',13.5,font=F_B,weight=500,fill=C['muted'],anchor='end')
             + t(176,778,'Registrar nuevo piloto',13.5,font=F_B,weight=700,fill=C['amber'],id='Link_registro')
             + f'<line x1="176" y1="782" x2="309" y2="782" stroke="{C["amber"]}" stroke-width="0.8"/>'
             + t(195,806,'v1.0 · CANAL CIFRADO',9,font=F_M,fill=C['dim'],anchor='middle',ls=1.2)+'</g>')
    s.append(f'<rect id="Indicador_inicio" x="128" y="831" width="134" height="5" rx="2.5" fill="{C["text"]}" opacity="0.85"/>')
    s.append('</g></svg>')
    return ''.join(s)

if __name__=='__main__':
    out=sys.argv[1] if len(sys.argv)>1 else '.'
    bg=bg_data()
    for fn,f in [('01_misiones',screen_misiones),('02_detalle_mision',screen_detalle),('03_nueva_mision',screen_nueva),('04_mision_completada',screen_completada),('05_acceso_piloto',screen_acceso)]:
        open(os.path.join(out,fn+'.svg'),'w').write(f(bg))
    print('ok')
