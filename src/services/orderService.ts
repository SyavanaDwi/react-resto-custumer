import api from "./api";
import type { Order } from "@/types/order";

interface OrderDetailResponse {
  message: string;
  data: Order;
}

export const getOrderByKode = async (orderKode: string) => {
  const response = await api.get<OrderDetailResponse>(
    `/customer/order/kode/${orderKode}`,
  );

  return response.data;
};
