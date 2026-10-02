import { useState, useEffect } from "react";
import api from "../services/api";
import type { Menu } from "@/types/menu";
import type { CartItem } from "@/types/cartItem";
import { Input } from "@/components/ui/input";
import { Button } from "@base-ui/react/button";

import { ArrowRight } from "lucide-react";

function Home() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [kategori, setKategori] = useState("Semua");
  const [cartItems, setcartItems] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fechMenu = async () => {
      try {
        const menu = await api.get("/menu");

        setMenus(menu.data);
      } catch (error) {
        console.log("gagal menampilkan menu", error);
      } finally {
        setLoading(false);
      }
    };
    fechMenu();
  }, []);

  const increaseQty = (menuId: number) => {
    const updateCart = cartItems.map((item) =>
      item.menuId === menuId ? { ...item, jumlah: item.jumlah + 1 } : item,
    );

    setcartItems(updateCart);
  };

  const decreaseQty = (menuId: number) => {
    const updateCart = cartItems
      .map((item) =>
        item.menuId === menuId ? { ...item, jumlah: item.jumlah - 1 } : item,
      )

      .filter((item) => item.jumlah > 0);

    setcartItems(updateCart);
  };

  const totalQtyCart = cartItems.reduce(
    (total, item) => total + item.jumlah,
    0,
  );

  const totalPriceCart = cartItems.reduce(
    (total, item) => total + item.harga * item.jumlah,
    0,
  );

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

  const filerSearch = menus.filter((item) =>
    item.menu.toLowerCase().includes(search.toLowerCase()),
  );

  const filterMenu =
    kategori === "Semua"
      ? filerSearch
      : filerSearch.filter((item) => item.kategori === kategori);

  if (loading) {
    return <div>memuat...</div>;
  }

  return (
    <div>
      <h1>list menu restoran</h1>
      <div>
        <Input
          type="text"
          placeholder="cari menu disini.."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div>
        <Button onClick={() => setKategori("Semua")}>Semua</Button>
        <Button onClick={() => setKategori("MAKANAN")}>Makanan</Button>
        <Button onClick={() => setKategori("MINUMAN")}>Minuman</Button>
      </div>

      {filterMenu.map((item) => {
        const cartItem = cartItems.find((cart) => cart.menuId === item.id);

        return (
          <div key={item.id}>
            <h2>{item.menu}</h2>
            <p>{item.kategori}</p>
            <p>{item.deskripsi}</p>
            <p>{item.harga}</p>

            {!cartItem ? (
              <Button onClick={() => addCartItem(item)}>Tambah</Button>
            ) : (
              <div>
                <Button onClick={() => decreaseQty(item.id)}> - </Button>
                <span>{cartItem.jumlah}</span>
                <Button onClick={() => increaseQty(item.id)}> + </Button>
              </div>
            )}
          </div>
        );
      })}

      <div>
        <div>
          <h2>Cart Item</h2>
          <span>{totalQtyCart}</span>
          <span>Rp. {totalPriceCart.toLocaleString("id-ID")}</span>
          <Button>
            Lihat detail pesanan <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;
