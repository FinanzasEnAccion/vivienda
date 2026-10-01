# Finanzas en Acción · Calculadoras de vivienda

Web: https://alejandrovicente97.github.io/finanzas-en-accion-vivienda/

Cinco calculadoras en una página:

1. **¿Cuánto puedo comprar?** Precio máximo según ahorros e ingresos, con lo que mira el banco (entrada mínima, tasación, esfuerzo, lo que te queda para vivir, edad y prueba de estrés), ITP reducido, aval ICO y lista de pasos y papeles.
2. **Comparar hipotecas.** Coste real, coste comparado y TAE del banco de hasta 3 ofertas, incluida la trampa de los seguros vinculados que el banco sube cada año, y qué pasa si el Euríbor sube 2 puntos.
3. **¿Comprar o alquilar?** Patrimonio año a año en cada caso, con el IRPF de lo invertido y la revalorización que hace falta para que gane comprar.
4. **Qué ofrecen los bancos.** Condiciones públicas, actualizadas cada semana y ordenadas con tus datos.
5. **Invertir para alquilar.** Rentabilidad bruta, neta, de tu dinero y total (TIR) de un piso en alquiler, con IRPF del alquiler y de la venta, plusvalía municipal, zona tensionada, precio máximo para tu objetivo y pruebas de estrés.

Descarga de informe en PDF.

## Datos de mercado

`data.json` guarda el Euríbor, el tipo medio del INE, el tipo del BCE y las ofertas de los bancos, cada una con su fuente y fecha, los ingresos mínimos que piden (`ingMin`, `ingMin2`, `ingReq`) y el TIN según el plazo cuando cambia (`tramos`). Una tarea programada lo revisa cada semana y lo actualiza; la página lo lee al abrirse y, si no puede, usa la copia que lleva dentro. Cálculos orientativos: no son asesoramiento financiero ni fiscal.

Por [@BuscandolaLF](https://x.com/BuscandolaLF).
