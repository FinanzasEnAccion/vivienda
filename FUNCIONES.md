# Funciones de la web y dónde están

## Web principal (somosfinanzasenaccion.es)

Se edita en `inicio/index.html` (rama `claude/web-personal`). `/tmp/build.sh` genera `web-principal/index.html`, que se copia al repo `finanzasenaccion.github.io` para publicar.

### Sección «Herramientas» (`#herramientas`)

Cambia en la rama `claude/web-herramientas-capturas` (sin publicar todavía):

- **Antes:** una tarjeta verde «Calculadoras de vivienda» con un dibujo de una casa y seis etiquetas. Toda la tarjeta llevaba a `/vivienda/`.
- **Ahora:**
  - **Tarjeta verde:** pantallazos reales de la herramienta. En ordenador, un portátil con «Bancos hoy» y delante un móvil con «¿Cuánto me puedo permitir?». En móvil, un carrusel con el medio reloj, la cascada de «¿Me renta alquilarla?» y «Bancos hoy».
  - **Botones:** cada herramienta tiene el suyo, además de «Hablar con un bróker» y el botón principal «Usar gratis, sin registro».
  - **Tarjeta crema del PRO:** «Próximamente · PRO», con la vista previa de la demo. Su único enlace es «Avísame cuando esté», que lleva a la suscripción de Substack.
- **Capturas:** están en `web-principal/capturas/`:
  - `app-cuanto-me-puedo-permitir.webp`
  - `app-me-renta-alquilarla.webp`
  - `app-bancos-hoy.webp`
  - `pro-analizador-demo.webp`
- **Enlaces:** todos salen del objeto `HERRAMIENTAS_LINKS` de `inicio/index.html`, en un solo sitio. Si una entrada se deja vacía, su botón se oculta.
- **Clics en GoatCounter:**
  - Con el prefijo `herramientas/`: `permitir`, `alquiler`, `bancos`, `comprar-o-alquilar`, `broker`, `abrir-calculadoras` y `captura-*`.
  - Además, `pro/avisame`.
- **Cifra de la comunidad:** «+2.250 miembros en El Club de la Hipoteca».
