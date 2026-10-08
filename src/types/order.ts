export type StatusOrder =
  | "MENUNGGU"
  | "DIKONFIRMASI"
  | "DISIAPKAN"
  | "SIAP"
  | "SELESAI"
  | "DIBATALKAN";

export type Order = {
  id: number;
  orderKode: string;
  mejaId: number | null;
  pelangganId: number | null;
  namaTamu: string | null;
  nomerHpTamu: string | null;
  status: StatusOrder;
  statusPembayaran: "SUDAH_DIBAYAR" | "BELUM_DIBAYAR";
  subTotal: string;
  diskon: string;
  total: string;
  createAt: string;
  updateAt: string;

  isPendingPayment?: boolean;

  meja?: {
    id: number;
    nomerMeja: number;
    statusMeja: boolean;
  } | null;

  pelanggan?: {
    id: number;
    nama: string;
    nomer_hp: string;
    alamat: string;
  } | null;
};
