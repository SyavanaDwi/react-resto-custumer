import type { Customer } from "./customer";

export type Member = {
  id: number;
  pelangganId: number;
  pelanggan: Customer;
  memberKode: string;
  diskon: string;
  statusMember: boolean;
};
