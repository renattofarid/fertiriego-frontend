import { useQuery } from "@tanstack/react-query";
import { getSuggestedLots } from "./purchase-order-batch.actions";
import type { GetSuggestedLotsParams } from "./purchase-order-batch.interface";

export function useSuggestedLots(
  params: GetSuggestedLotsParams,
  enabled = false
) {
  return useQuery({
    queryKey: ["suggested-lots", params],
    queryFn: () => getSuggestedLots(params),
    enabled,
  });
}
