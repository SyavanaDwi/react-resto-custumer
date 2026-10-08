import type { ReactNode } from "react";
import type { Menu } from "./menu";

export type CartItem = {
  menuId: number;
  menu: string;
  jumlah: number;
  harga: number;
};

export type CartContext = {
  cartItems: CartItem[];
  addCartItem: (menu: Menu) => void;
  increaseQty: (menuId: number) => void;
  decreaseQty: (menuId: number) => void;
  totalQtyCart: number;
  subTotalPrice: number;
  mejaId: number | null;
  setMejaId: (mejaId: number | null) => void;
};

export type CartProviderProps = {
  children: ReactNode;
};
