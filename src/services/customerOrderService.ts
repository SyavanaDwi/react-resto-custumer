import api from "./api";

export interface CreateCustomerOrderPayload {
  mejaId: number;
  pelangganId?: number;
  namaTamu?: string;
  nomerHpTamu?: string;
  diskon?: number;
  items: {
    menuId: number;
    jumlah: number;
    harga: number;
  }[];
}

export interface CustomerOrderResponse {
  message: string;
  data: {
    id: number;
    orderKode: string;
    total: number;
  };
}

export const createCustomerOrder = async (
  payload: CreateCustomerOrderPayload,
) => {
  const response = await api.post<CustomerOrderResponse>(
    "/customer/order",
    payload,
  );

  return response.data;
};
