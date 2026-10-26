# Cambios nuevos

Última actualización: 26/10/2026

Estados: ✅ hecho · 🟡 parcial · ⏳ pendiente · ❓ por definir

## Pedidos y ventas

| # | Cambio | Lado | Estado | Notas |
|---|---|---|---|---|
| 1 | CxC: filtro por nombre de cliente | Front y back | ✅ | Ya funciona con el backend actual. |
| 2 | Pedidos: agregar el campo N° de OC al generar el pedido, para tener trazabilidad | Front y back | ⏳ | Confirmado: el pedido sí lleva su propio campo (Jorge, 22/10, 8:21 a. m.). La cotización ya lo tiene y el PDF de la cotización ya lo muestra. |
| 3 | Bajas: relacionar la baja solo con una guía, sin pedido | Front y back | ⏳ | Las guías ya no se jalan desde el pedido. |
| 4 | Bajas: filtro adicional por OC | Por definir | ❓ | Confirmar dónde va el filtro y de dónde sale el dato si la guía no tiene OC. |
| 5 | Compras / ingresos: asociar 5 a 6 documentos a una misma OC | Front y back | ⏳ | Relación de uno a muchos entre OC y documentos. |

## Costos de productos (pedido de Jorge, 25 y 26/10/2026)

| # | Cambio | Lado | Estado | Notas |
|---|---|---|---|---|
| 6 | Registrar el costo (precio de compra) de cada producto manualmente, sin depender de una factura | Front y back | ✅ | Ya se puede registrar el costo de cada producto a mano. |
| 7 | Moneda con la que se ingresa el costo | Front y back | ⏳ | Pedido el 26/10. Falta definir si el backend guarda la moneda del costo y con qué nombre de campo. Hoy `cost` no tiene moneda. |
| 8 | Carga masiva: poder cargar datos de forma masiva y poder ver lo cargado | Front y back | ⏳ | Es un requerimiento no hecho: el front no tiene ninguna pantalla de carga masiva (solo exportaciones a Excel). Jorge (25/10, 9:53 a. m.) ha pedido cargues masivos y no puede visualizarlos. Falta definir qué se carga (productos, costos, precios), el formato del archivo y qué se ve después (listado, errores, resultado). |
| 9 | Costos de importación y factor de importación calculado por el sistema, que se suma al costo del producto | Front y back | ⏳ | Se solicitó y no se pudo usar. Falta definir qué costos se cargan (flete, aduana, seguro), cómo se prorratean entre productos y dónde se muestra el costo final. |
| 10 | Motor predictivo: lograr que el usuario lo utilice | No depende del equipo de desarrollo | ➖ | Jorge (25/10, 9:55 a. m.) dijo que no lo han utilizado. Se retira de las tareas del equipo. |

## Hechos recientemente (referencia)

- Producto, detalle: reorganizado en columnas (stock, información general, componentes, lista de precios; galería y fichas aparte) con botón de regreso y de editar. Muestra costo, peso, IGV y observaciones.
- Pedidos: filtro por cliente en la lista y en el Excel (`customer_id`).
- NC y ND: selector de venta rápido con `saleCredit`, y la venta anterior ya no queda cargada al reabrir.
- Formulario de venta, Detalles: el producto se carga por id al editar.
- Botón de regreso en los formularios de agregar/editar de 10 módulos.

## Preguntas abiertas

- ¿La moneda del costo es una por producto o una por compra?
- ¿Los costos de importación se cargan por producto o por embarque?
- ¿El factor de importación se recalcula automáticamente cuando cambia un costo?
- ¿Qué necesita Jorge ver exactamente en los cargues masivos?
