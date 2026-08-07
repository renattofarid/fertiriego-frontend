import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProductionOrders,
  getProductionOrdersSearch,
  findProductionOrderById,
  storeProductionOrder,
  updateProductionOrder,
  deleteProductionOrder,
  submitProductionOrder,
  approveProductionOrder,
  rejectProductionOrder,
  cancelProductionOrder,
  getProductionOrdersSummary,
  getProductionOrdersPending,
  getProductionOrderItemHistory,
} from "./production-order.actions";
import { PRODUCTION_ORDER, PRODUCTION_ORDER_QUERY_KEY } from "./production-order.interface";
import type {
  GetProductionOrdersParams,
  CreateProductionOrderRequest,
  UpdateProductionOrderRequest,
} from "./production-order.interface";
import type { ProductionOrderSchema } from "./production-order.schema";
import { ERROR_MESSAGE, SUCCESS_MESSAGE, errorToast, successToast } from "@/lib/core.function";

const { MODEL } = PRODUCTION_ORDER;
const QUERY_KEY = PRODUCTION_ORDER_QUERY_KEY;

const buildItemsRequest = (items: ProductionOrderSchema["items"]) =>
  items.map((item) => ({
    product_id: Number(item.product_id),
    quantity_requested: Number(item.quantity_requested),
    labor_cost: item.labor_cost ? Number(item.labor_cost) : 0,
    // ⚠️ overhead_cost NO se envía: el backend lo calcula automáticamente,
    // no es un campo que el usuario ingrese manualmente.
    notes: item.notes || undefined,
    // ✅ Si el usuario no agregó componentes manualmente, no se envía el
    // arreglo y el backend autocompleta desde el combo (BOM) del producto.
    components:
      item.components && item.components.length > 0
        ? item.components.map((c) => ({
            component_id: Number(c.component_id),
            quantity_required: Number(c.quantity_required),
            unit_cost: c.unit_cost ? Number(c.unit_cost) : undefined,
            // ⚠️ waste_quantity/waste_percentage NO se envían: el backend
            // los calcula automáticamente, igual que overhead_cost.
            notes: c.notes || undefined,
          }))
        : undefined,
  }));

// Invalidación amplia: cualquier mutación puede afectar el listado, el
// detalle, el resumen y el reporte de pendientes a la vez, así que se
// invalida todo el árbol de queries de la entidad en vez de listarlas una
// por una.
const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

// ===== Queries =====

export function useProductionOrders(params?: GetProductionOrdersParams) {
  const query = useQuery({
    queryKey: [QUERY_KEY, "list", params],
    queryFn: () => getProductionOrders(params),
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data.data ?? null,
    meta: query.data?.data.meta ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useProductionOrdersSearch(params?: Record<string, any>) {
  return useQuery({
    queryKey: [QUERY_KEY, "search", params],
    queryFn: () => getProductionOrdersSearch(params),
    refetchOnWindowFocus: false,
  });
}

export function useProductionOrderById(id: number) {
  const query = useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => findProductionOrderById(id),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useProductionOrdersSummary() {
  const query = useQuery({
    queryKey: [QUERY_KEY, "summary"],
    queryFn: () => getProductionOrdersSummary(),
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useProductionOrdersPending() {
  const query = useQuery({
    queryKey: [QUERY_KEY, "pending"],
    queryFn: () => getProductionOrdersPending(),
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useProductionOrderItemHistory(itemId: number | null) {
  const query = useQuery({
    queryKey: [QUERY_KEY, "item-history", itemId],
    queryFn: () => getProductionOrderItemHistory(itemId!),
    enabled: !!itemId,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.data.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

// ===== Mutations =====

export function useCreateProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductionOrderSchema) => {
      const request: CreateProductionOrderRequest = {
        warehouse_origin_id: Number(data.warehouse_origin_id),
        warehouse_dest_id: Number(data.warehouse_dest_id),
        responsible_id: Number(data.responsible_id),
        requested_date: data.requested_date,
        currency: data.currency || "PEN",
        observations: data.observations || undefined,
        items: buildItemsRequest(data.items),
      };
      return storeProductionOrder(request);
    },
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      invalidateAll(queryClient);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || ERROR_MESSAGE(MODEL, "create"));
    },
  });
}

export function useUpdateProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductionOrderSchema> }) => {
      const request: UpdateProductionOrderRequest = {
        ...(data.warehouse_origin_id && { warehouse_origin_id: Number(data.warehouse_origin_id) }),
        ...(data.warehouse_dest_id && { warehouse_dest_id: Number(data.warehouse_dest_id) }),
        ...(data.responsible_id && { responsible_id: Number(data.responsible_id) }),
        ...(data.requested_date && { requested_date: data.requested_date }),
        ...(data.currency !== undefined && { currency: data.currency || "PEN" }),
        ...(data.observations !== undefined && { observations: data.observations || undefined }),
        ...(data.items && { items: buildItemsRequest(data.items) }),
      };
      return updateProductionOrder(id, request);
    },
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "edit"));
      invalidateAll(queryClient);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || ERROR_MESSAGE(MODEL, "edit"));
    },
  });
}

export function useDeleteProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProductionOrder(id),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      invalidateAll(queryClient);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || ERROR_MESSAGE(MODEL, "delete"));
    },
  });
}

export function useSubmitProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => submitProductionOrder(id),
    onSuccess: () => {
      successToast("Orden enviada a revisión correctamente");
      invalidateAll(queryClient);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || "Error al enviar la orden");
    },
  });
}

export function useApproveProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => approveProductionOrder(id),
    onSuccess: () => {
      successToast("Orden aprobada correctamente");
      invalidateAll(queryClient);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || "Error al aprobar la orden");
    },
  });
}

export function useRejectProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: number; rejection_reason: string }) =>
      rejectProductionOrder(id, { rejection_reason }),
    onSuccess: () => {
      successToast("Orden rechazada correctamente");
      invalidateAll(queryClient);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || "Error al rechazar la orden");
    },
  });
}

export function useCancelProductionOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelProductionOrder(id),
    onSuccess: () => {
      successToast("Orden anulada correctamente");
      invalidateAll(queryClient);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || "Error al anular la orden");
    },
  });
}
