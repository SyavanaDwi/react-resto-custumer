import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import type { Menu } from "@/types/menu";
import type { CartItem } from "@/types/cartItem";
import { Input } from "@/components/ui/input";
import { Button } from "@base-ui/react/button";
import { useCart } from "./CartContext";

import { ArrowRight } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [kategori, setKategori] = useState("Semua");
  const [searchParams] = useSearchParams();

  const meja = searchParams.get("meja");
  const mejaId = meja ? Number(meja) : null;

  const {
    cartItems,
    addCartItem,
    increaseQty,
    decreaseQty,
    totalQtyCart,
    subTotalPrice,
    setMejaId,
  } = useCart();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (mejaId) {
      setMejaId(mejaId);
    }
  }, [mejaId, setMejaId]);

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

  const handleDetailOrder = () => {
    if (cartItems.length === 0) {
      alert("Keranjang masih kosong");
      return;
    }

    navigate("/detail-order");
  };

  return (
    <div>
      <h1>list menu restoran</h1>
      <p>Meja: {mejaId}</p>
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
          <span>Rp. {subTotalPrice.toLocaleString("id-ID")}</span>
          <Button onClick={handleDetailOrder}>
            Lihat detail pesanan <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;
