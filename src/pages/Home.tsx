import { useState, useEffect } from "react";
import api from "../services/api";
import type { Menu } from "@/types/menu";
import type { CartItem } from "@/types/cartItem";
import { Input } from "@/components/ui/input";
import { Button } from "@base-ui/react/button";

function Home() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [kategori, setKategori] = useState("Semua");
  const [cartitems, setCartItems] = useState<CartItem[]>([]);

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

  const addCartItem = (menu: Menu) => {
    const existingItem = cartitems.find((item) => item.menuId === menu.id);

    if (existingItem) {
      const updateCart = cartitems.map((item) =>
        item.menuId === menu.id ? { ...item, jumlah: item.jumlah + 1 } : item,
      );

      setCartItems(updateCart);
      return;
    }

    setCartItems([
      ...cartitems,
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

      {filterMenu.map((item) => (
        <div key={item.id}>
          <p>{item.menu}</p>
          <p> Rp. {Number(item.harga).toLocaleString("id-ID")}</p>
          <p>{item.deskripsi}</p>
          <p>{item.kategori}</p>

          <Button onClick={() => addCartItem(item)}>Tambah </Button>
        </div>
      ))}
    </div>
  );
}

export default Home;
