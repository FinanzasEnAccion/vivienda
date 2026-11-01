# Publicar la web en somosfinanzasenaccion.es

Prompt para una sesión de Claude en vuestro ordenador, con Claude in Chrome
(ya hay sesión iniciada en GitHub, DonDominio y Cloudflare).

```
Necesito publicar la web de Finanzas en Acción en el dominio somosfinanzasenaccion.es.
El dominio está registrado en DonDominio, pero sus servidores DNS son de Cloudflare
(daniella.ns.cloudflare.com y sam.ns.cloudflare.com): los registros se crean en Cloudflare,
NO en DonDominio. No cambies los servidores DNS del dominio.
Usa mi Chrome. Antes de borrar o cambiar cualquier registro, enséñame qué vas a hacer y espera mi "sí".

## 1 · Repositorio en GitHub
1. https://github.com/new con la cuenta FinanzasEnAccion.
2. Nombre: finanzasenaccion.github.io (exactamente así). Public. Marca "Add a README file". Créalo.

## 2 · Subir la web
Los archivos están en el repo FinanzasEnAccion/vivienda, rama claude/web-personal, carpeta web-principal/:
index.html, CNAME (una línea: somosfinanzasenaccion.es), .nojekyll, logo.png, icon-192.png,
apple-touch-icon.png y la carpeta fonts/. (PUBLICAR.md no hace falta subirlo.)
- Con git:
    git clone --branch claude/web-personal --depth 1 https://github.com/FinanzasEnAccion/vivienda.git fa-tmp
    git clone https://github.com/FinanzasEnAccion/finanzasenaccion.github.io.git fa-web
    copia el contenido de fa-tmp/web-principal/ (incluidos .nojekyll y CNAME, sin PUBLICAR.md) a la raíz de fa-web/
    cd fa-web && git add -A && git commit -m "Web de Finanzas en Acción" && git push
- Sin git: en el repo nuevo, "Add file → Upload files" con los mismos archivos, manteniendo fonts/.
Si no puedes, para y dímelo.

## 3 · DNS en Cloudflare (dash.cloudflare.com → somosfinanzasenaccion.es → DNS → Records)
1. Enséñame los registros actuales. Si hay A, AAAA o CNAME en "@" o "www" que no sean los de abajo, pídeme permiso para quitarlos. No toques MX ni TXT.
2. Añade, con el proxy APAGADO (nube gris, "DNS only"):
   - A     @    185.199.108.153
   - A     @    185.199.109.153
   - A     @    185.199.110.153
   - A     @    185.199.111.153
   - CNAME www  finanzasenaccion.github.io
3. Enséñame cómo queda.

## 4 · GitHub Pages
Repo finanzasenaccion.github.io → Settings → Pages:
1. Source: Deploy from a branch, main, / (root).
2. Custom domain: somosfinanzasenaccion.es → Save (si ya sale por el archivo CNAME, bien).
3. Cuando diga que el DNS es correcto y el certificado esté listo, marca "Enforce HTTPS". Si aún no se puede, dímelo para hacerlo luego.

## 5 · Verificar el dominio en GitHub (seguridad)
https://github.com/settings/pages → "Add a domain" → somosfinanzasenaccion.es. Da un registro TXT
(_github-pages-challenge-FinanzasEnAccion…): añádelo en Cloudflare (DNS only) y pulsa "Verify".

## 6 · Correo info@somosfinanzasenaccion.es (gratis en Cloudflare)
Cloudflare → somosfinanzasenaccion.es → Email → Email Routing → empezar.
- Direcciones de destino: [MI GMAIL] y [GMAIL DE MI HERMANO] (cada uno confirma el correo que le llega).
- Regla: info@somosfinanzasenaccion.es → reenviar a esos Gmail.
- Deja que Cloudflare cree sus registros MX y TXT.
Si pide pagar algo, no lo contrates y dímelo.

## Al terminar
Resumen: qué está hecho, cómo quedan los DNS, si HTTPS está activo y qué falta.
Comprueba que https://somosfinanzasenaccion.es abre la web y https://somosfinanzasenaccion.es/vivienda/ las calculadoras
(puede tardar un rato).
```

Cambia `[MI GMAIL]` y `[GMAIL DE MI HERMANO]` antes de pegarlo.
