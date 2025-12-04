import { useQuery } from "@tanstack/react-query";
import type { GetOrdersParams } from "./order.actions";
import { getOrders, getAllOrders } from "./order.actions";
import { ORDER_QUERY_KEY } from "./order.interface";

export const useOrder = (params?: GetOrdersParams) => {
  return useQuery({
    queryKey: [ORDER_QUERY_KEY, params],
    queryFn: () => getOrders(params),
    select: (data) => data.data,
  });
};

export const useAllOrders = () => {
  return useQuery({
    queryKey: [ORDER_QUERY_KEY, "all"],
    queryFn: getAllOrders,
  });
};
