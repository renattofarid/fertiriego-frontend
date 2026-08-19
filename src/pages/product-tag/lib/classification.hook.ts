import { useQuery } from "@tanstack/react-query";
import { getProductClassifications } from "./classification.actions";

export function useProductClassifications(productId: number) {
  return useQuery({
    queryKey: ["product-classifications", productId],
    queryFn: () => getProductClassifications(productId),
    refetchOnWindowFocus: false,
    enabled: productId > 0,
  });
}
