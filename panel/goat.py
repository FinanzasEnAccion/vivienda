"""Lee GoatCounter (últimos 30 días) y deja en /tmp/web.json el documento para el panel interno.
Horas y días en hora de Madrid. Los recuentos de GoatCounter de 'total' incluyen visitas y clics."""
import json, subprocess, datetime as dt
from zoneinfo import ZoneInfo
B='https://finanzasenaccion.goatcounter.com/api/v0'; MAD=ZoneInfo('Europe/Madrid'); UTC=dt.timezone.utc
ahora=dt.datetime.now(UTC); hoy=ahora.date(); ini=hoy-dt.timedelta(days=29); fin=hoy+dt.timedelta(days=1)
def get(path):
    import time
    for i in range(4):  # GoatCounter a veces responde vacío: reintenta
        out=subprocess.run(['curl','-s','--max-time','30','-H','Accept: application/json',f'{B}{path}'],capture_output=True,text=True).stdout
        try: return json.loads(out)
        except ValueError:
            if i==3: raise
            time.sleep(2*(i+1))
q=f'start={ini}&end={fin}'
t=get(f'/stats/total?{q}')
hits=[];more=True;excl=''
while more:
    h=get(f'/stats/hits?{q}&limit=100'+excl); hits+=h.get('hits',[]); more=h.get('more',False)
    if more: excl='&exclude_paths='+','.join(str(x['path_id']) for x in hits)
def lista(p,n=10):
    try: return get(f'/stats/{p}?{q}&limit={n}').get('stats',[])
    except Exception: return []
dias={d['day']:d.get('daily',0) for d in t.get('stats',[])}
# horas (UTC -> Madrid) y días de la semana
horas=[0]*24; semana=[0]*7
for d in t.get('stats',[]):
    base=dt.datetime.fromisoformat(d['day']).replace(tzinfo=UTC)
    for hh,n in enumerate(d.get('hourly') or []):
        if n:
            m=(base+dt.timedelta(hours=hh)).astimezone(MAD); horas[m.hour]+=n; semana[m.weekday()]+=n
def origen(name):
    n=(name or '').lower()
    if not n: return 'Directo o sin origen'
    for k,v in [('t.co','X / Twitter'),('twitter','X / Twitter'),('x.com','X / Twitter'),('google','Google'),('bing','Bing'),('substack','Newsletter (Substack)'),('whatsapp','WhatsApp'),('linkedin','LinkedIn'),('facebook','Facebook'),('instagram','Instagram'),('telegram','Telegram'),('github','GitHub (calculadoras)'),('somosfinanzasenaccion','La propia web')]:
        if k in n: return v
    return name
orig={}
for r in lista('toprefs',30): orig[origen(r.get('name'))]=orig.get(origen(r.get('name')),0)+r.get('count',0)
tam={'phone':'Móvil','tablet':'Tablet','desktop':'Ordenador','desktophd':'Ordenador','unknown':'Desconocido'}
disp={}
for r in lista('sizes',10): k=tam.get(r.get('id'),'Desconocido'); disp[k]=disp.get(k,0)+r.get('count',0)
# Web o calculadora: por la página vista y, en los clics, por el nombre del evento
WEBEV=('atajo','newsletter','contacto','calculadoras/','jose/','canal/','mini-calc','promo-','mejores/')
def fuente(x):
    p=x['path']
    if not x.get('event'): return 'calc' if p.startswith('/vivienda') else 'web'
    e=p.replace('evento/','',1)
    return 'web' if e.startswith(WEBEV) else 'calc'
def diario(x): return {s['day']:s.get('daily',0) for s in x.get('stats') or []}
DIAS=[str(ini+dt.timedelta(days=i)) for i in range(30)]
fuentes={f:{'visitas':0,'clics':0,'dias':[{'d':d,'v':0,'c':0} for d in DIAS]} for f in ('web','calc')}
# Clics a José: en la web, el bloque de José; en la calculadora, cualquier botón «Reservar con José / Pide que te mejoren la tuya».
# «cta-jose/web-principal» era el botón «Nuestra web» medido por error antes del 01/11: no cuenta.
JLUGAR={'hipoteca':'Web · bloque de José','bancos-aviso':'Calc · aviso de ofertas (Bancos hoy)','bancos-detalle':'Calc · ficha de una oferta','estandar-bancos':'Calc · ofertas estándar',
 'informe':'Calc · informe para el bróker','financiacion':'Calc · financiar más del 80 %','caso':'Calc · tu caso (viable)','caso-lejos':'Calc · tu caso (lejos)','fein':'Calc · revisar la FEIN','banner':'Calc · ventana del bróker'}
PEST={'simple':'Sencilla','cuanto':'¿Cuánto me puedo permitir?','hipotecas':'Comparar hipotecas','alquilar':'Comprar o alquilar','bancos':'Bancos hoy','invertir':'Invertir','mihipo':'Mi hipoteca','pro':'Pro'}
def jose_de(e):
    if e.startswith('jose/'): return 'web',e[5:]
    if e.startswith('cta-jose/') and e!='cta-jose/web-principal': return 'calc',e[9:]
    return None,None
jose={'total':0,'web':0,'calc':0,'dias':[0]*30,'donde':{},'reservas':{}}
for x in hits:
    if x['path']=='evento/cta-jose/web-principal': continue
    f=fuente(x);dd=diario(x);k='c' if x.get('event') else 'v'
    fuentes[f]['clics' if x.get('event') else 'visitas']+=x['count']
    for i,d in enumerate(DIAS): fuentes[f]['dias'][i][k]+=dd.get(d,0)
    e=x['path'].replace('evento/','',1)
    if x.get('event'):
        src,ctx=jose_de(e)
        if src:
            jose['total']+=x['count'];jose[src]+=x['count']
            for i,d in enumerate(DIAS): jose['dias'][i]+=dd.get(d,0)
            base=ctx.split('/')[0]
            if base in JLUGAR: lugar=JLUGAR[base]
            elif src=='calc':
                t,_,det=base.partition('-')  # p. ej. «simple-justo»: pestaña y resultado del caso
                lugar='Calc · botón principal · '+PEST.get(t,t)+(f' ({det.replace("-"," ")})' if det else '')
            else: lugar='Web · '+base
            jose['donde'][lugar]=jose['donde'].get(lugar,0)+x['count']
        elif e.startswith('reserva/'):
            r='Con su caso adjunto' if 'con-caso' in e else 'Sin datos'
            jose['reservas'][r]=jose['reservas'].get(r,0)+x['count']
jose['donde']=[{'k':k,'n':v} for k,v in sorted(jose['donde'].items(),key=lambda x:-x[1])]
jose['reservas']=[{'k':k,'n':v} for k,v in sorted(jose['reservas'].items(),key=lambda x:-x[1])]
paginas=[{'p':x['path'],'n':x['count']} for x in hits if not x.get('event')]
eventos=[{'e':x['path'].replace('evento/','',1),'n':x['count'],'s':fuente(x)} for x in hits if x.get('event') and x['path']!='evento/cta-jose/web-principal']
doc={'visitas':sum(p['n'] for p in paginas),'clics':sum(e['n'] for e in eventos),'periodo':'últimos 30 días',
     'actualizado':ahora.astimezone(MAD).strftime('%d/%m/%Y %H:%M'),
     'dias':[{'d':str(ini+dt.timedelta(days=i)),'n':dias.get(str(ini+dt.timedelta(days=i)),0)} for i in range(30)],
     'horas':horas,'semana':semana,
     'origen':[{'k':k,'n':v} for k,v in sorted(orig.items(),key=lambda x:-x[1]) if v],
     'dispositivos':[{'k':k,'n':v} for k,v in sorted(disp.items(),key=lambda x:-x[1]) if v],
     'paises':[{'k':r.get('id') or r.get('name'),'n':r.get('count',0)} for r in lista('locations',8) if r.get('count')],
     'sistemas':[{'k':r.get('name') or r.get('id'),'n':r.get('count',0)} for r in lista('systems',6) if r.get('count')],
     'paginas':sorted(paginas,key=lambda x:-x['n'])[:20],'eventos':sorted(eventos,key=lambda x:-x['n'])[:80],'fuentes':fuentes,'jose':jose}
# Calendario del año en curso (visitas + clics por día, hora UTC de GoatCounter) y mejores días
ia=dt.date(hoy.year,1,1)
try: ta=get(f'/stats/total?start={ia}&end={fin}')
except Exception: ta={}
anual={d['day']:d.get('daily',0) for d in ta.get('stats',[])}
doc['anual']={'ano':hoy.year,'dias':[anual.get(str(ia+dt.timedelta(days=i)),0) for i in range((hoy-ia).days+1)]}
doc['mejores']=[{'d':k,'n':v} for k,v in sorted(anual.items(),key=lambda x:-x[1]) if v][:5]
json.dump(doc,open('/tmp/web.json','w'),ensure_ascii=False)
print(json.dumps({k:doc[k] for k in ('visitas','clics','actualizado','horas','semana','origen','dispositivos','paises')},ensure_ascii=False))
