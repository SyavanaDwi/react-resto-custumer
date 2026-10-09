import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import type { Menu } from "@/types/menu";
import { useCart } from "./CartContext";
import { ArrowRight, Search, ShoppingBag, Minus, Plus } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-slate-100/75 flex items-center justify-center font-sans">
        <p className="text-sm font-medium text-[#0A2947]">Memuat menu...</p>
      </div>
    );
  }

  const handleDetailOrder = () => {
    if (cartItems.length === 0) {
      alert("Keranjang masih kosong");
      return;
    }

    navigate("/detail-order");
  };

  return (
    <div className="min-h-screen bg-slate-100/75 pb-28 font-sans">
      <header className="bg-[#0A2947] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
                Restoran
              </p>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                Pilih Menu
              </h1>

              <p className="text-xs font-medium text-white/70 mt-1">
                Silakan pilih menu yang ingin dipesan
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-2">
              <div>
                <p className="text-[9px] font-medium text-white/60 uppercase">
                  Meja
                </p>

                <p className="text-sm text-center font-bold">{mejaId ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className="relative mt-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Cari menu di sini..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-white text-sm font-medium text-[#0A2947] placeholder:text-slate-400 outline-none border border-white/10 focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setKategori("Semua")}
            className={`shrink-0 h-10 px-5 rounded-full border text-sm font-bold transition-colors cursor-pointer ${
              kategori === "Semua"
                ? "bg-[#0A2947] border-[#0A2947] text-white"
                : "bg-white border-[#D3D4C0] text-[#0A2947] hover:bg-[#F3E4C9]/40"
            }`}>
            Semua
          </button>

          <button
            type="button"
            onClick={() => setKategori("MAKANAN")}
            className={`shrink-0 h-10 px-5 rounded-full border text-sm font-bold transition-colors cursor-pointer ${
              kategori === "MAKANAN"
                ? "bg-[#0A2947] border-[#0A2947] text-white"
                : "bg-white border-[#D3D4C0] text-[#0A2947] hover:bg-[#F3E4C9]/40"
            }`}>
            Makanan
          </button>

          <button
            type="button"
            onClick={() => setKategori("MINUMAN")}
            className={`shrink-0 h-10 px-5 rounded-full border text-sm font-bold transition-colors cursor-pointer ${
              kategori === "MINUMAN"
                ? "bg-[#0A2947] border-[#0A2947] text-white"
                : "bg-white border-[#D3D4C0] text-[#0A2947] hover:bg-[#F3E4C9]/40"
            }`}>
            Minuman
          </button>
        </div>

        {filterMenu.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D3D4C0] shadow-sm mt-4 p-8 text-center">
            <ShoppingBag className="h-8 w-8 mx-auto text-[#8B5E3C]/50" />

            <h2 className="text-base font-bold text-[#0A2947] mt-3">
              Menu tidak ditemukan
            </h2>

            <p className="text-xs font-medium text-slate-400 mt-1">
              Coba gunakan kata kunci pencarian yang lain.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {filterMenu.map((item) => {
              const cartItem = cartItems.find(
                (cart) => cart.menuId === item.id,
              );

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#D3D4C0] shadow-sm overflow-hidden">
                  <div className="flex items-stretch min-h-36">
                    <div className="w-32 sm:w-40 shrink-0 bg-[#F3E4C9]/35 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.menu}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center px-2">
                          <ShoppingBag className="h-8 w-8 mx-auto text-[#8B5E3C]/60" />

                          <p className="text-[10px] font-medium text-[#8B5E3C] mt-2">
                            Tidak ada gambar
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 p-3.5 sm:p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#F3E4C9]/60 text-[9px] font-bold text-[#8B5E3C]">
                            {item.kategori}
                          </span>
                        </div>

                        <h2 className="text-sm sm:text-base font-bold text-[#0A2947] mt-2">
                          {item.menu}
                        </h2>

                        <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-1 line-clamp-2">
                          {item.deskripsi || "Menu pilihan restoran"}
                        </p>
                      </div>

                      <div className="flex items-end justify-between gap-2 mt-3">
                        <div>
                          <p className="text-[9px] font-medium text-slate-400">
                            Harga
                          </p>

                          <p className="text-xs sm:text-sm font-bold text-[#0A2947] mt-0.5">
                            Rp {Number(item.harga).toLocaleString("id-ID")}
                          </p>
                        </div>

                        {!cartItem ? (
                          <button
                            type="button"
                            onClick={() => addCartItem(item)}
                            className="h-9 px-3 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                            <Plus className="h-3.5 w-3.5" />
                            Tambah
                          </button>
                        ) : (
                          <div className="flex items-center h-9 rounded-xl overflow-hidden border border-[#D3D4C0]">
                            <button
                              type="button"
                              onClick={() => decreaseQty(item.id)}
                              className="h-9 w-8 flex items-center justify-center bg-white hover:bg-[#F3E4C9] text-[#0A2947] transition-colors cursor-pointer">
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span className="h-9 min-w-8 px-1.5 flex items-center justify-center border-x border-[#D3D4C0] bg-white text-xs font-bold text-[#0A2947]">
                              {cartItem.jumlah}
                            </span>

                            <button
                              type="button"
                              onClick={() => increaseQty(item.id)}
                              className="h-9 w-8 flex items-center justify-center bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors cursor-pointer">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {cartItems.length > 0 && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-4xl z-40">
          <div className="bg-[#0A2947] text-white rounded-2xl shadow-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5" />
                </div>

                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-[#8B5E3C] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalQtyCart}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
                  Keranjang
                </p>

                <p className="text-sm font-bold mt-0.5">{totalQtyCart} Item</p>
              </div>

              <div className="text-right mr-1">
                <p className="text-[10px] font-medium text-white/60">
                  Subtotal
                </p>

                <p className="text-sm font-bold mt-0.5">
                  Rp {subTotalPrice.toLocaleString("id-ID")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetailOrder}
                className="w-11 h-11 shrink-0 rounded-xl bg-white text-[#0A2947] hover:bg-[#F3E4C9] flex items-center justify-center transition-colors cursor-pointer">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
