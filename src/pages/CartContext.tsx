import { createContext, useContext, useState } from "react";

import type {
  CartItem,
  CartContext,
  CartProviderProps,
} from "@/types/cartItem";
import type { Menu } from "@/types/menu";

const CartContext = createContext<CartContext | undefined>(undefined);

export default function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setcartItems] = useState<CartItem[]>([]);
  const [mejaId, setMejaId] = useState<number | null>(null);

  const addCartItem = (menu: Menu) => {
    const existingItem = cartItems.find((item) => item.menuId === menu.id);

    if (existingItem) {
      increaseQty(menu.id);
      return;
    }

    setcartItems([
      ...cartItems,
      {
        menuId: menu.id,
        menu: menu.menu,
        jumlah: 1,
        harga: menu.harga,
      },
    ]);
  };

  const increaseQty = (menuId: number) => {
    setcartItems((cartItems) =>
      cartItems
        .map((item) =>
          item.menuId === menuId ? { ...item, jumlah: item.jumlah + 1 } : item,
        )
        .filter((item) => item.jumlah > 0),
    );
  };

  const decreaseQty = (menuId: number) => {
    setcartItems((cartItems) =>
      cartItems
        .map((item) =>
          item.menuId === menuId ? { ...item, jumlah: item.jumlah - 1 } : item,
        )
        .filter((item) => item.jumlah > 0),
    );
  };

  const totalQtyCart = cartItems.reduce(
    (total, item) => total + item.jumlah,
    0,
  );

  const subTotalPrice = cartItems.reduce(
    (total, item) => total + item.harga * item.jumlah,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addCartItem,
        increaseQty,
        decreaseQty,
        totalQtyCart,
        subTotalPrice,
        mejaId,
        setMejaId,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart harus digunakan di dalam cartProvider");
  }

  return context;
}
