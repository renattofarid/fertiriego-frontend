# Implementación de Guías de Remisión - Resumen

## ✅ Completado

### 1. Actualización de Interfaces y Schemas

#### Guide (Guía de Remisión Remitente - GRR)
- ✅ **guide.interface.ts**: Agregados campos `order_id`, `transport_modality`, y campos de vehículo
- ✅ **guide.schema.ts**: Validaciones condicionales según modalidad (PÚBLICO/PRIVADO)
- ✅ **guide.store.ts**: Lógica de envío actualizada con nuevos campos

#### Shipping Guide Carrier (Guía de Transportista - GRT)
- ✅ **shipping-guide-carrier.interface.ts**: Agregados mismos campos
- ✅ **shipping-guide-carrier.schema.ts**: Validaciones condicionales

### 2. Componentes Creados

#### OrderProductSelector
- ✅ Componente nuevo en `src/pages/guide/components/OrderProductSelector.tsx`
- Permite seleccionar productos del pedido con cantidades parciales
- Muestra cantidades: total, enviado, pendiente
- Control de cantidades para no exceder lo pendiente
- Indicadores visuales de estado (Pendiente/Parcial/Completado)

#### GuideForm Actualizado
- ✅ Nuevo archivo: `src/pages/guide/components/GuideFormUpdated.tsx`
- Selector de pedido (order_id)
- Integración con OrderProductSelector
- Modalidad de transporte (PÚBLICO/PRIVADO) con campos condicionales
- Direcciones editables manualmente

## 🔧 Pendiente de Completar Manualmente

### ShippingGuideCarrierForm.tsx

El archivo `src/pages/shipping-guide-carrier/components/ShippingGuideCarrierForm.tsx` necesita las siguientes modificaciones manuales:

#### 1. Agregar importaciones necesarias

```tsx
import { OrderProductSelector } from "@/pages/guide/components/OrderProductSelector";
import { findOrderById } from "@/pages/order/lib/order.actions";
import type { OrderResource } from "@/pages/order/lib/order.interface";
import { Package2 } from "lucide-react";
```

#### 2. Agregar MODALITIES constante

```tsx
const MODALITIES = [
  { value: "PUBLICO", label: "Transporte Público" },
  { value: "PRIVADO", label: "Transporte Privado" },
];
```

#### 3. Actualizar props del componente

Agregar `orders` a las props:

```tsx
interface ShippingGuideCarrierFormProps {
  mode?: "create" | "update";
  onSubmit: (values: ShippingGuideCarrierFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  initialValues?: ShippingGuideCarrierFormValues;
  carriers: PersonResource[];
  remittents: PersonResource[];
  recipients: PersonResource[];
  drivers: PersonResource[];
  vehicles: VehicleResource[];
  products: ProductResource[];
  orders: OrderResource[];  // <-- AGREGAR ESTO
}
```

#### 4. Agregar estados dentro del componente

Después de los estados existentes, agregar:

```tsx
// Estado para pedido seleccionado
const [selectedOrder, setSelectedOrder] = useState<OrderResource | null>(null);
const [loadingOrder, setLoadingOrder] = useState(false);

// Watch para modalidad y order_id
const transportModality = form.watch("transport_modality");
const orderId = form.watch("order_id");
```

#### 5. Agregar useEffect para cargar pedido

```tsx
// Cargar orden cuando se selecciona
useEffect(() => {
  const loadOrder = async () => {
    if (orderId && orderId !== "") {
      setLoadingOrder(true);
      try {
        const response = await findOrderById(Number(orderId));
        setSelectedOrder(response.data);
      } catch (error) {
        console.error("Error loading order:", error);
        setSelectedOrder(null);
      } finally {
        setLoadingOrder(false);
      }
    } else {
      setSelectedOrder(null);
    }
  };

  loadOrder();
}, [orderId]);
```

#### 6. Agregar manejador de productos del pedido

```tsx
// Manejar selección de productos desde el pedido
const handleOrderProductsSelected = (selections: any[]) => {
  const orderDetails: DetailRow[] = selections.map((sel) => ({
    product_id: sel.product_id,
    product_name: sel.product_name,
    description: sel.product_name,
    quantity: sel.quantity_to_ship.toString(),
    unit: "UND",
    weight: "0",
  }));
  setDetails(orderDetails);
};
```

#### 7. Modificar sección "Información General" del formulario

**REEMPLAZAR** la sección actual (líneas ~408-509) con:

```tsx
{/* Información General */}
<GroupFormSection
  icon={Truck}
  title="Información General"
  cols={{ sm: 1 }}
>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Modalidad de Transporte */}
    <FormSelect
      control={form.control}
      name="transport_modality"
      label="Modalidad de Transporte"
      placeholder="Seleccione modalidad"
      options={MODALITIES.map((mod) => ({
        value: mod.value,
        label: mod.label,
      }))}
    />

    <FormSelect
      control={form.control}
      name="remittent_id"
      label="Remitente"
      placeholder="Seleccione remitente"
      options={remittents.map((p) => ({
        value: p.id.toString(),
        label:
          p.business_name || `${p.names} ${p.father_surname}`,
        description: p.number_document,
      }))}
      withValue
    />

    <FormSelect
      control={form.control}
      name="recipient_id"
      label="Destinatario (Opcional)"
      placeholder="Seleccione destinatario"
      options={recipients.map((p) => ({
        value: p.id.toString(),
        label:
          p.business_name || `${p.names} ${p.father_surname}`,
        description: p.number_document,
      }))}
      withValue
    />

    {/* TRANSPORTE PÚBLICO: Solo Transportista */}
    {transportModality === "PUBLICO" && (
      <FormSelect
        control={form.control}
        name="carrier_id"
        label="Transportista"
        placeholder="Seleccione transportista"
        options={carriers.map((c) => ({
          value: c.id.toString(),
          label: c.business_name || `${c.names} ${c.father_surname}`,
          description: c.number_document,
        }))}
        withValue
      />
    )}

    {/* TRANSPORTE PRIVADO: Conductor y Vehículo */}
    {transportModality === "PRIVADO" && (
      <>
        <FormSelect
          control={form.control}
          name="driver_id"
          label="Conductor"
          placeholder="Seleccione conductor"
          options={drivers.map((d) => ({
            value: d.id.toString(),
            label: `${d.names} ${d.father_surname}`,
            description: d.number_document,
          }))}
          withValue
        />

        <FormField
          control={form.control}
          name="driver_license"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Licencia del Conductor</FormLabel>
              <FormControl>
                <Input placeholder="Ej: B12345678" {...field} value={field.value || ""} maxLength={20} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSelect
          control={form.control}
          name="vehicle_id"
          label="Vehículo"
          placeholder="Seleccione vehículo"
          options={vehicles.map((v) => ({
            value: v.id.toString(),
            label: v.plate,
            description: `${v.brand} ${v.model}`,
          }))}
          withValue
        />

        <FormField
          control={form.control}
          name="vehicle_plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa del Vehículo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: ABC-123" {...field} value={field.value || ""} maxLength={20} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicle_brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca del Vehículo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Toyota" {...field} value={field.value || ""} maxLength={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicle_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo del Vehículo</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Hilux" {...field} value={field.value || ""} maxLength={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vehicle_mtc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certificado MTC</FormLabel>
              <FormControl>
                <Input placeholder="Ej: MTC123456" {...field} value={field.value || ""} maxLength={50} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSelect
          control={form.control}
          name="secondary_vehicle_id"
          label="Vehículo Secundario (Opcional)"
          placeholder="Seleccione vehículo secundario"
          options={vehicles.map((v) => ({
            value: v.id.toString(),
            label: v.plate,
            description: `${v.brand} ${v.model}`,
          }))}
          withValue
        />
      </>
    )}
  </div>
</GroupFormSection>
```

#### 8. Agregar sección de Selección de Pedido

**INSERTAR** después de "Información General" y antes de "Fechas y Direcciones":

```tsx
{/* Selección de Pedido (Nuevo) */}
<GroupFormSection
  title="Selección de Pedido (Opcional)"
  icon={Package2}
  cols={{ sm: 1 }}
>
  <FormSelect
    control={form.control}
    name="order_id"
    label="Pedido"
    placeholder="Seleccione un pedido"
    options={orders.map((order) => ({
      value: order.id.toString(),
      label: `#${order.order_number} - ${order.customer.full_name}`,
      description: `Fecha: ${order.order_date}`,
    }))}
    withValue
  />

  {loadingOrder && <div>Cargando productos del pedido...</div>}

  {selectedOrder && !loadingOrder && (
    <div className="col-span-full">
      <OrderProductSelector
        order={selectedOrder}
        onProductsSelected={handleOrderProductsSelected}
      />
    </div>
  )}
</GroupFormSection>
```

#### 9. Actualizar direcciones para hacerlas editables

En la sección "Fechas y Direcciones", asegúrate que los campos `origin_address` y `destination_address` tengan `maxLength={500}`:

```tsx
<FormField
  control={form.control}
  name="origin_address"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Dirección de Origen</FormLabel>
      <FormControl>
        <Input placeholder="Calle, número, ciudad" {...field} value={field.value || ""} maxLength={500} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="destination_address"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Dirección de Destino</FormLabel>
      <FormControl>
        <Input placeholder="Calle, número, ciudad" {...field} value={field.value || ""} maxLength={500} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## 📋 Actualizar páginas que usan los formularios

Asegúrate de pasar la prop `orders` a los componentes de formulario:

### Para GuideForm

Archivo: `src/pages/guide/GuideCreate.tsx` o similar

```tsx
import { useOrder } from "@/pages/order/lib/order.hook";

// Dentro del componente:
const { data: orders } = useOrder({ all: true });

<GuideForm
  // ... otras props
  orders={orders || []}
/>
```

### Para ShippingGuideCarrierForm

Archivo: `src/pages/shipping-guide-carrier/ShippingGuideCarrierCreate.tsx` o similar

```tsx
import { useOrder } from "@/pages/order/lib/order.hook";

// Dentro del componente:
const { data: orders } = useOrder({ all: true });

<ShippingGuideCarrierForm
  // ... otras props
  orders={orders || []}
/>
```

## 🔍 Funcionalidades Implementadas

### 1. Selección de Pedido
- ✅ Selector dropdown con pedidos disponibles
- ✅ Carga automática de productos del pedido
- ✅ Componente OrderProductSelector integrado

### 2. Selección Parcial de Productos
- ✅ Tabla con productos del pedido
- ✅ Columnas: Total, Enviado, Pendiente, A Enviar
- ✅ Validación: no permitir enviar más de lo pendiente
- ✅ Estados visuales: Pendiente/Parcial/Completado
- ✅ Badge con total de unidades seleccionadas

### 3. Modalidad de Transporte

#### Transporte PÚBLICO:
- Solo muestra campo `carrier_id` (Transportista)
- Oculta todos los campos de conductor y vehículo

#### Transporte PRIVADO:
- Muestra campos de conductor:
  - driver_id
  - driver_license
- Muestra campos de vehículo:
  - vehicle_id
  - vehicle_plate
  - vehicle_brand
  - vehicle_model
  - vehicle_mtc
- Oculta campo de transportista

### 4. Direcciones Editables
- Campos `origin_address` y `destination_address` son inputs de texto libre
- Máximo 500 caracteres
- Mantienen selectores de ubigeo para complementar

## ⚠️ Importante - Backend

Asegúrate que el backend esté preparado para:

1. **Recibir** el campo `order_id` en las requests de ambas guías
2. **Trackear** las cantidades enviadas por producto en cada pedido
3. **Retornar** las cantidades ya enviadas al consultar un pedido (para OrderProductSelector)
4. **Validar** que la suma de cantidades en todas las guías no exceda el total del pedido
5. **Manejar** correctamente los campos condicionales según `transport_modality`

## 📝 Nota sobre OrderProductSelector

Actualmente el componente asume `shipped_quantity = 0` porque necesita que el backend retorne esta información.

**Modificar cuando el backend esté listo:**

En `OrderProductSelector.tsx`, línea ~49-51:

```tsx
// TODO: Obtener la cantidad ya enviada desde el backend
// Por ahora asumimos 0, pero esto debe venir del backend
const shippedQty = 0;
```

Cambiar por:

```tsx
// Obtener la cantidad ya enviada desde la respuesta del backend
const shippedQty = detail.shipped_quantity || 0;
```

## ✅ Checklist Final

- [ ] Completar modificaciones en ShippingGuideCarrierForm.tsx
- [ ] Agregar prop `orders` en páginas que usan GuideForm
- [ ] Agregar prop `orders` en páginas que usan ShippingGuideCarrierForm
- [ ] Actualizar GuideForm.tsx (ya creado como GuideFormUpdated.tsx, reemplazar el original)
- [ ] Coordinar con backend para trackeo de cantidades enviadas
- [ ] Probar flujo completo: crear pedido → crear guías parciales → completar
- [ ] Verificar validaciones en ambas modalidades de transporte
- [ ] Verificar que direcciones se puedan digitar manualmente

## 🎯 Resultado Esperado

Al finalizar, deberías poder:

1. Crear una guía seleccionando un pedido
2. Ver los productos del pedido con sus cantidades
3. Seleccionar solo algunos productos o cantidades parciales
4. Crear múltiples guías del mismo pedido hasta completarlo
5. Elegir entre transporte público o privado
6. Ver solo los campos relevantes según la modalidad elegida
7. Digitar direcciones manualmente (además de los ubigeos)

¡Éxito con la implementación! 🚀
