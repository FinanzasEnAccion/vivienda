# Finanzas en Acción · Calculadoras de vivienda

Web: https://finanzasenaccion.github.io/vivienda/

Seis calculadoras de vivienda en una sola página (`index.html`). Sin registro y sin cookies: lo que escribes no sale de tu navegador. Cada cifra se pincha y enseña su cálculo y su fuente. Se puede instalar en el móvil y funciona sin conexión.

## Dos modos

- **Estándar**: lo justo para saber cuánto puedes comprar y qué pagarías. Dos pestañas: «Comprar casa» (precio máximo, cuota, lo que ofrecen hoy los bancos y comprar o alquilar) y «Mi hipoteca».
- **Profesional**: todo el detalle, en cuatro pestañas: Comprar, Hipotecas, Invertir y Mi hipoteca.

## Las seis calculadoras

| Pestaña en Profesional | Calculadora | Qué responde |
|---|---|---|
| Comprar | **Mi presupuesto** | Cuánto puedes comprar con tus ahorros y tus ingresos: lo que mira el banco, los impuestos de la compra en tu comunidad y el aval ICO. |
| Comprar | **Comprar o alquilar** | Tu patrimonio año a año en cada caso y desde qué año gana comprar. |
| Hipotecas | **Bancos hoy** | Euríbor, tipo medio y ofertas publicadas, con su fuente y su fecha, calculadas para tu hipoteca. |
| Hipotecas | **Comparar ofertas** | Coste total de hasta 3 ofertas: intereses, seguros y productos vinculados, y comisiones. |
| Invertir | **Un piso** | Rentabilidad bruta, neta, de tu dinero y total (TIR) de un piso para alquilar, tras impuestos. |
| Mi hipoteca | **Mi hipoteca** | Cuánto cambia tu cuota en la revisión con el Euríbor oficial, y si te conviene amortizar o invertir. |

En Profesional hay además tres herramientas: informe para el bróker, revisar la FEIN y cartera de pisos. En los dos modos: informe en PDF e imagen para compartir, con o sin importes.

## Datos de mercado

`data.json` guarda el Euríbor, el tipo medio del INE, el tipo del BCE y las ofertas de los bancos, cada una con su fuente y su fecha. La página lo lee cada vez que se abre. Si no puede (sin conexión), usa la copia que lleva dentro: la constante `DATA0` de `index.html`. Una tarea programada revisa `data.json` cada semana.

Para actualizar los datos a mano:

1. Cambia `data.json`, con sus campos `actualizado` y `fecha`.
2. Lleva lo mismo a `DATA0`, desde la carpeta del repositorio:

```bash
python3 - <<'EOF'
import json, re
datos = json.dumps(json.load(open('data.json', encoding='utf-8')), ensure_ascii=False)
html = open('index.html', encoding='utf-8').read()
html, n = re.subn(r'(?m)^const DATA0=.*;$', lambda m: 'const DATA0=' + datos + ';', html, count=1)
assert n == 1, 'no encuentro la línea de DATA0'
open('index.html', 'w', encoding='utf-8').write(html)
EOF
```

De cada oferta se guardan también los ingresos mínimos que pide (`ingMin`, `ingMin2`, `ingReq`), el préstamo mínimo (`minImp`), la comisión de apertura (`apPct` o `apEur`) y el TIN según el plazo cuando cambia (`tramos`).

## Analítica

Está escrita y apagada. Usa GoatCounter, sin cookies, y solo cuenta qué se usa (pestañas y botones), nunca importes ni datos personales. Se activa poniendo el código del sitio de GoatCounter en la constante `GC_CODE` de `index.html`.

## Bróker

Los datos del bróker (nombre, empresa, número de registro en el Banco de España, honorarios y el acuerdo que tiene con Finanzas en Acción) irán en la constante `BROKER_INFO` de `index.html`. Mientras esté vacía, la web no enseña nada de eso.

## Qué revisar cuando cambie una norma

Todo está en constantes de `index.html`, cada una con su fuente al lado:

| Qué | Constante |
|---|---|
| ITP de cada comunidad (tipo general, rebajas y sus requisitos) | `ITP` |
| AJD, IVA e IGIC de obra nueva | `AJD`, `AJD_ESC`, `AJD_RED`, `IND`, `IND_RED` |
| Aval ICO: precio máximo, tope de ingresos por provincia, patrimonio | `ICO_PRECIO`, `ICO_ING`, `ICO_PAT`, `ICO_MENOR` |
| Avisos del Real Decreto-ley 29/2026 (pendiente de convalidación) | `RDL29` |
| Préstamo TU CASA y ayudas de las comunidades, con su fecha | `AYUDA_TUCASA`, `AYUDAS_CCAA`, `AYUDAS_FECHA` |
| Precio supuesto de los productos que exigen los bancos | `VK_COSTE` |
| Topes legales de la comisión por cambiar de banco o de tipo | `CB_LEY` |

Cuando se vote la convalidación del Real Decreto-ley 29/2026 hay que actualizar `RDL29` y `AYUDA_TUCASA` (o quitarlos si decae). Las ayudas con fecha de cierre (`fin`) dejan de anunciarse como abiertas ellas solas al pasar la fecha.

## Para publicar

GitHub Pages publica la rama `main`. Las tipografías (Instrument Sans y Bricolage Grotesque, licencia OFL) se sirven desde `fonts/`. Si cambias un icono o una tipografía, sube el número de `CACHE` en `sw.js`.

Cálculos orientativos: no son asesoramiento financiero ni fiscal.

Por [@BuscandolaLF](https://x.com/BuscandolaLF).
