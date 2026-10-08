import type { Member } from "./member";

export type Customer = {
  id: number;
  nama: string;
  nomer_hp: string;
  alamat: string;
  statusPelanggan: boolean;
  member: Member | null;
};
