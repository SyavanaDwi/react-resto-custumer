import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import api from "@/services/api";
import { createSnapToken } from "@/services/midtransService";
import type { Customer } from "@/types/customer";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  User,
  Phone,
  CreditCard,
  Store,
  X,
  Tag,
  ReceiptText,
} from "lucide-react";

function DetailOrder() {
  const navigate = useNavigate();

  const { cartItems, increaseQty, decreaseQty, subTotalPrice, mejaId } =
    useCart();

  const [name, setName] = useState("");
  const [numberHP, setNumberHp] = useState("");
  const [customers, setCustomers] = useState<Customer | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const paymentOpened = useRef(false);

  const discountPercent = customers?.member?.statusMember
    ? Number(customers.member.diskon)
    : 0;

  const discount = subTotalPrice * (discountPercent / 100);
  const discountPrice = subTotalPrice - discount;

  const ppnPrice = discountPrice * 0.1;
  const totalPrice = discountPrice + ppnPrice;

  const findCustomer = async () => {
    if (!numberHP) {
      setCustomers(null);
      return;
    }

    try {
      const response = await api.get("/pelanggan");

      const customer = response.data.data;

      const foundCustomer = customer.find(
        (item: Customer) => item.nomer_hp === numberHP,
      );

      setCustomers(foundCustomer || null);
    } catch (error) {
      console.log("Gagal mencari pelanggan", error);
    }
  };

  const handleContinuePayment = () => {
    if (cartItems.length === 0) {
      alert("Keranjang masih kosong");
      return;
    }

    if (!name.trim()) {
      alert("Nama wajib diisi!");
      return;
    }

    if (!mejaId) {
      alert("Meja belum dipilih");
      return;
    }

    setShowPaymentModal(true);
  };

  const handleCashPayment = async () => {
    try {
      setLoadingPayment(true);

      const response = await api.post("/customer/order", {
        mejaId,
        pelangganId: customers?.id,
        namaTamu: name,
        nomerHpTamu: numberHP,
        diskon: discount,
        items: cartItems.map((item) => ({
          menuId: item.menuId,
          jumlah: item.jumlah,
        })),
      });

      const orderKode = response.data.data.orderKode;

      navigate(`/status-order?order_id=${orderKode}`);
    } catch (error) {
      console.error("Gagal membuat order:", error);
      alert("Gagal membuat pesanan");
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleOnlinePayment = async () => {
    try {
      setLoadingPayment(true);

      const response = await createSnapToken({
        mejaId: mejaId!,
        pelangganId: customers?.id,
        namaTamu: name,
        nomerHpTamu: numberHP,
        diskon: discount,
        items: cartItems.map((item) => ({
          menuId: item.menuId,
          jumlah: item.jumlah,
        })),
      });

      const { token, orderKode } = response.data;

      setShowPaymentModal(false);

      paymentOpened.current = true;

      window.snap.pay(token, {
        onSuccess: () => {
          console.log("Pembayaran berhasil");

          paymentOpened.current = false;

          navigate(`/status-order?order_id=${orderKode}`);
        },

        onPending: () => {
          console.log("Pembayaran masih pending");

          paymentOpened.current = false;

          navigate(`/status-order?order_id=${orderKode}`);
        },

        onError: (result) => {
          console.log("Pembayaran gagal:", result);

          paymentOpened.current = false;

          alert("Pembayaran gagal");
        },

        onClose: () => {
          console.log("Midtrans ditutup");

          paymentOpened.current = false;
        },
      });
    } catch (error) {
      console.error("Gagal membuka pembayaran:", error);
      alert("Gagal membuka pembayaran");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/75 pb-8 font-sans">
      <header className="bg-[#0A2947] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>

          <div className="flex items-center justify-between gap-3 mt-5">
            <div>
              <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
                Pesanan Anda
              </p>

              <h1 className="text-xl font-bold tracking-tight mt-1">
                Detail Pesanan
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-2">
              <ShoppingBag className="h-4 w-4" />

              <div>
                <p className="text-[9px] font-medium text-white/60">MEJA</p>

                <p className="text-sm font-bold">{mejaId ?? "-"}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <section className="bg-white rounded-2xl border border-[#D3D4C0] shadow-sm overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Keranjang
                </p>

                <h2 className="text-base font-bold text-[#0A2947] mt-1">
                  Menu yang dipesan
                </h2>
              </div>

              <div className="flex items-center gap-1.5 text-[#8B5E3C]">
                <ShoppingBag className="h-4 w-4" />

                <span className="text-xs font-bold">
                  {cartItems.length} Menu
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {cartItems.map((item) => (
              <div
                key={item.menuId}
                className="p-4 flex gap-3">
                <div className="w-16 h-16 shrink-0 rounded-xl bg-[#F3E4C9]/40 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-[#8B5E3C]/60" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#0A2947] truncate">
                        {item.menu}
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        Rp {Number(item.harga).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-[#0A2947] shrink-0">
                      Rp {(item.harga * item.jumlah).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center h-9 rounded-lg overflow-hidden border border-[#D3D4C0]">
                      <button
                        type="button"
                        onClick={() => decreaseQty(item.menuId)}
                        className="h-9 w-9 flex items-center justify-center bg-white hover:bg-[#F3E4C9] text-[#0A2947] transition-colors cursor-pointer">
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <span className="h-9 w-9 flex items-center justify-center border-x border-[#D3D4C0] text-xs font-bold text-[#0A2947]">
                        {item.jumlah}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseQty(item.menuId)}
                        className="h-9 w-9 flex items-center justify-center bg-[#0A2947] hover:bg-[#8B5E3C] text-white transition-colors cursor-pointer">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#D3D4C0] shadow-sm mt-4 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#8B5E3C]" />

              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Data Pemesan
                </p>

                <h2 className="text-base font-bold text-[#0A2947] mt-1">
                  Informasi Anda
                </h2>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0A2947] mb-2">
                Nama <span className="text-[#8B5E3C]">*</span>
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  required
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#D3D4C0] bg-slate-50 text-sm font-medium text-[#0A2947] placeholder:text-slate-400 outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A2947] mb-2">
                Nomor Handphone
                <span className="font-normal text-slate-400 ml-1">
                  (opsional)
                </span>
              </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

                <input
                  type="text"
                  value={numberHP}
                  onChange={(e) => setNumberHp(e.target.value)}
                  onBlur={findCustomer}
                  placeholder="Masukkan nomor handphone..."
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#D3D4C0] bg-slate-50 text-sm font-medium text-[#0A2947] placeholder:text-slate-400 outline-none focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/10"
                />
              </div>
            </div>

            {customers?.member?.statusMember && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F3E4C9]/40 border border-[#D3D4C0]">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-[#F3E4C9] flex items-center justify-center">
                  <Tag className="h-4 w-4 text-[#8B5E3C]" />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#0A2947]">
                    Member terdeteksi
                  </p>

                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    Anda mendapatkan diskon member sebesar{" "}
                    <span className="font-bold text-[#8B5E3C]">
                      {discountPercent}%
                    </span>
                  </p>
                </div>
              </div>
            )}

            {numberHP && !customers && (
              <p className="text-[11px] font-medium text-slate-400">
                Nomor belum terdaftar sebagai member.
              </p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-[#D3D4C0] shadow-sm mt-4 overflow-hidden">
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-[#8B5E3C]" />

              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Ringkasan
                </p>

                <h2 className="text-base font-bold text-[#0A2947] mt-1">
                  Rincian Pembayaran
                </h2>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-500">Subtotal</span>

                <span className="font-bold text-[#0A2947]">
                  Rp {subTotalPrice.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-500">
                  Diskon Member
                  {discountPercent > 0 && (
                    <span className="font-bold text-[#8B5E3C] ml-1">
                      ({discountPercent}%)
                    </span>
                  )}
                </span>

                <span className="font-bold text-[#8B5E3C]">
                  - Rp {discount.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-500">
                  Setelah Diskon
                </span>

                <span className="font-bold text-[#0A2947]">
                  Rp {discountPrice.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-500">PPN 10%</span>

                <span className="font-bold text-[#0A2947]">
                  Rp {ppnPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-[#D3D4C0] mt-4 pt-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Total Pembayaran
                  </p>

                  <h3 className="text-xl font-bold text-[#0A2947] mt-1">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[#F3E4C9]/60 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-[#8B5E3C]" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinuePayment}
              disabled={loadingPayment}
              className="w-full h-12 mt-5 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer">
              Lanjut ke Pembayaran
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-[#0A2947]/60 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Pembayaran
                </p>

                <h3 className="text-lg font-bold text-[#0A2947] mt-1">
                  Pilih Metode Pembayaran
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                disabled={loadingPayment}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#F3E4C9] flex items-center justify-center text-slate-500 hover:text-[#0A2947] transition-colors cursor-pointer disabled:opacity-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="bg-[#F3E4C9]/40 border border-[#D3D4C0] rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-500">
                    Total yang harus dibayar
                  </span>

                  <span className="text-base font-bold text-[#0A2947]">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCashPayment}
                  disabled={loadingPayment}
                  className="w-full min-h-14 px-4 rounded-xl border border-[#D3D4C0] bg-white hover:bg-[#F3E4C9]/30 flex items-center gap-3 text-left transition-colors cursor-pointer disabled:opacity-50">
                  <div className="w-10 h-10 rounded-xl bg-[#F3E4C9]/60 flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5 text-[#8B5E3C]" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0A2947]">
                      Bayar di Kasir
                    </p>

                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Bayar langsung kepada kasir restoran
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={handleOnlinePayment}
                  disabled={loadingPayment}
                  className="w-full min-h-14 px-4 rounded-xl bg-[#0A2947] hover:bg-[#8B5E3C] flex items-center gap-3 text-left transition-colors cursor-pointer disabled:opacity-50">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">
                      Bayar Sekarang
                    </p>

                    <p className="text-[11px] font-medium text-white/60 mt-0.5">
                      QRIS, transfer bank, dan metode online lainnya
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 text-white/60" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={loadingPayment}
                  className="w-full h-11 rounded-xl text-sm font-bold text-slate-500 hover:text-[#0A2947] hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50">
                  Batal
                </button>
              </div>
            </div>

            <div className="h-1.5 w-12 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailOrder;
