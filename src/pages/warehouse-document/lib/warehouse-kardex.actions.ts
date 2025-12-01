import { api } from "@/lib/config";
import type {
  GetWarehouseKardexProps,
  WarehouseKardexResponse,
  KardexByProductResponse,
  ValuatedInventoryResponse,
} from "./warehouse-kardex.interface";
import type { AxiosRequestConfig } from "axios";
import { DEFAULT_PER_PAGE } from "@/lib/core.constants";

const KARDEX_ENDPOINT = "/warehousekardex";

// Get warehouse kardex with filters
export async function getWarehouseKardex({
  params,
}: GetWarehouseKardexProps = {}): Promise<WarehouseKardexResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: params?.per_page || DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<WarehouseKardexResponse>(
    KARDEX_ENDPOINT,
    config
  );
  return data;
}

// Get kardex by product
export async function getKardexByProduct(
  productId: number
): Promise<KardexByProductResponse> {
  const { data } = await api.get<KardexByProductResponse>(
    `${KARDEX_ENDPOINT}/product/${productId}`
  );
  return data;
}

// Get valuated inventory
export async function getValuatedInventory(
  params?: Record<string, unknown>
): Promise<ValuatedInventoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      per_page: DEFAULT_PER_PAGE,
    },
  };
  const { data } = await api.get<ValuatedInventoryResponse>(
    `${KARDEX_ENDPOINT}/valuated-inventory`,
    config
  );
  return data;
}
