import api from "./api";

export interface SnapOrderItem {
  menuId: number;
  jumlah: number;
}

export interface SnapOrderPayload {
  mejaId: number;
  pelangganId?: number;
  namaTamu: string;
  nomerHpTamu?: string;
  diskon: number;
  items: SnapOrderItem[];
}

interface SnapTokenResponse {
  message: string;
  data: {
    token: string;
    redirectUrl: string;
    orderKode: string;
  };
}

export const createSnapToken = async (payload: SnapOrderPayload) => {
  const response = await api.post<SnapTokenResponse>(
    "/midtrans/token",
    payload,
  );

  return response.data;
};
