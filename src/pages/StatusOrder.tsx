import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrderByKode } from "@/services/orderService";
import socket from "@/services/socket";
import type { Order, StatusOrder } from "@/types/order";
import { Check, Clock, ShoppingBag, User, Phone } from "lucide-react";

const statusList: StatusOrder[] = [
  "MENUNGGU",
  "DIKONFIRMASI",
  "DISIAPKAN",
  "SIAP",
  "SELESAI",
];

const statusLabel: Record<StatusOrder, string> = {
  MENUNGGU: "Menunggu",
  DIKONFIRMASI: "Dikonfirmasi",
  DISIAPKAN: "Sedang Disiapkan",
  SIAP: "Siap Disajikan",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

function StatusOrderPage() {
  const [searchParams] = useSearchParams();

  const orderKode = searchParams.get("order_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderKode) {
        setLoading(false);
        return;
      }

      try {
        const response = await getOrderByKode(orderKode);
        setOrder(response.data);
      } catch (error) {
        console.error("Gagal mengambil detail order:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderKode]);

  useEffect(() => {
    const handleOrderCreated = (newOrder: Order) => {
      console.log("Order baru:", newOrder);

      if (newOrder.orderKode === orderKode) {
        setOrder(newOrder);
      }
    };

    const handleStatusUpdated = (updatedOrder: Order) => {
      console.log("Status order berubah:", updatedOrder);

      if (updatedOrder.orderKode === orderKode) {
        setOrder((prev) => {
          if (!prev) return updatedOrder;

          return {
            ...prev,
            ...updatedOrder,
          };
        });
      }
    };

    socket.on("order:new", handleOrderCreated);
    socket.on("order:statusUpdated", handleStatusUpdated);

    return () => {
      socket.off("order:new", handleOrderCreated);
      socket.off("order:statusUpdated", handleStatusUpdated);
    };
  }, [orderKode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100/75 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#D3D4C0] border-t-[#0A2947] animate-spin mx-auto" />

          <p className="text-sm font-medium text-[#0A2947] mt-4">
            Memuat status pesanan...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-100/75 flex items-center justify-center px-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#D3D4C0] shadow-sm p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F3E4C9]/60 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-6 w-6 text-[#8B5E3C]" />
          </div>

          <h1 className="text-lg font-bold text-[#0A2947] mt-4">
            Pesanan Tidak Ditemukan
          </h1>

          <p className="text-xs font-medium text-slate-400 mt-1">
            Data pesanan tidak dapat ditemukan.
          </p>
        </div>
      </div>
    );
  }

  const subTotal = Number(order.subTotal);
  const diskon = Number(order.diskon);
  const setelahDiskon = subTotal - diskon;
  const ppn = Math.round(setelahDiskon * 0.1);
  const totalBayar = setelahDiskon + ppn;

  if (order.isPendingPayment) {
    return (
      <div className="min-h-screen bg-slate-100/75 pb-8 font-sans">
        <header className="bg-[#0A2947] text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
              Restoran
            </p>

            <h1 className="text-xl sm:text-2xl font-bold mt-1">
              Menunggu Pembayaran
            </h1>

            <p className="text-xs font-medium text-white/70 mt-1">
              Silakan selesaikan pembayaran untuk melanjutkan pesanan.
            </p>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <div className="bg-white rounded-2xl border border-[#D3D4C0] shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#F3E4C9]/60 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-[#8B5E3C]" />
                </div>

                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Status Pembayaran
                  </p>

                  <p className="text-sm font-bold text-[#8B5E3C] mt-0.5">
                    Belum Dibayar
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 mt-5 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400">
                      Kode Order
                    </p>

                    <p className="text-sm font-bold text-[#0A2947] mt-1">
                      {order.orderKode}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-medium text-slate-400">
                      Nama
                    </p>

                    <p className="text-sm font-bold text-[#0A2947] mt-1">
                      {order.namaTamu || "-"}
                    </p>
                  </div>
                </div>

                {order.nomerHpTamu && (
                  <div className="flex items-center gap-2 mt-4">
                    <Phone className="h-4 w-4 text-[#8B5E3C]" />

                    <p className="text-xs font-medium text-slate-500">
                      {order.nomerHpTamu}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50/70 border-t border-slate-100 p-5 sm:p-6">
              <p className="text-sm font-bold text-[#0A2947] mb-4">
                Rincian Pembayaran
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-slate-500">Subtotal</p>

                  <p className="text-xs font-bold text-[#0A2947]">
                    Rp {subTotal.toLocaleString("id-ID")}
                  </p>
                </div>

                {diskon > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium text-slate-500">
                      Diskon Member
                    </p>

                    <p className="text-xs font-bold text-[#8B5E3C]">
                      -Rp {diskon.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-slate-500">
                    Setelah Diskon
                  </p>

                  <p className="text-xs font-bold text-[#0A2947]">
                    Rp {setelahDiskon.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-slate-500">PPN 10%</p>

                  <p className="text-xs font-bold text-[#0A2947]">
                    Rp {ppn.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#D3D4C0] mt-4 pt-4 flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-[#0A2947]">Total Bayar</p>

                <p className="text-base font-bold text-[#8B5E3C]">
                  Rp {totalBayar.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentIndex = statusList.indexOf(order.status);

  return (
    <div className="min-h-screen bg-slate-100/75 pb-8 font-sans">
      <header className="bg-[#0A2947] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <p className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
            Restoran
          </p>

          <h1 className="text-xl sm:text-2xl font-bold mt-1">Status Pesanan</h1>

          <p className="text-xs font-medium text-white/70 mt-1">
            Pantau proses pesanan Anda secara langsung.
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="bg-white rounded-2xl border border-[#D3D4C0] shadow-sm p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Kode Order
              </p>

              <h2 className="text-base sm:text-lg font-bold text-[#0A2947] mt-1">
                {order.orderKode}
              </h2>
            </div>

            <div className="shrink-0 px-3 py-1.5 rounded-full bg-[#F3E4C9]/60">
              <p className="text-[10px] font-bold text-[#8B5E3C]">
                {statusLabel[order.status]}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-5 pt-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#8B5E3C]" />

              <p className="text-xs font-bold text-[#0A2947]">
                {order.namaTamu || "-"}
              </p>
            </div>

            {order.nomerHpTamu && (
              <div className="flex items-center gap-2 mt-2">
                <Phone className="h-4 w-4 text-slate-400" />

                <p className="text-xs font-medium text-slate-500">
                  {order.nomerHpTamu}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D3D4C0] shadow-sm p-5 sm:p-6">
          <p className="text-sm font-bold text-[#0A2947] mb-6">
            Proses Pesanan
          </p>

          <div className="overflow-x-auto pb-2">
            <div className="min-w-[520px] flex items-start">
              {statusList.map((status, index) => {
                const isDone = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div
                    key={status}
                    className="flex-1 relative text-center">
                    {index < statusList.length - 1 && (
                      <div
                        className={`absolute top-5 left-1/2 w-full h-0.5 ${
                          index < currentIndex ? "bg-[#0A2947]" : "bg-[#D3D4C0]"
                        }`}
                      />
                    )}

                    <div className="relative z-10 flex justify-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          isDone
                            ? "bg-[#0A2947] border-[#0A2947] text-white"
                            : "bg-white border-[#D3D4C0] text-slate-300"
                        } ${isCurrent ? "ring-4 ring-[#F3E4C9]/60" : ""}`}>
                        {isDone ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                    </div>

                    <p
                      className={`text-[10px] font-bold mt-3 px-1 ${
                        isDone ? "text-[#0A2947]" : "text-slate-400"
                      }`}>
                      {statusLabel[status]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D3D4C0] shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6">
            <p className="text-sm font-bold text-[#0A2947]">
              Rincian Pembayaran
            </p>

            <div className="space-y-3 mt-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-500">Subtotal</p>

                <p className="text-xs font-bold text-[#0A2947]">
                  Rp {subTotal.toLocaleString("id-ID")}
                </p>
              </div>

              {diskon > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-slate-500">
                    Diskon Member
                  </p>

                  <p className="text-xs font-bold text-[#8B5E3C]">
                    -Rp {diskon.toLocaleString("id-ID")}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-500">
                  Setelah Diskon
                </p>

                <p className="text-xs font-bold text-[#0A2947]">
                  Rp {setelahDiskon.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-slate-500">PPN 10%</p>

                <p className="text-xs font-bold text-[#0A2947]">
                  Rp {ppn.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="border-t border-[#D3D4C0] mt-5 pt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium text-slate-400">
                  Total Bayar
                </p>

                <p className="text-base font-bold text-[#0A2947] mt-1">
                  Rp {totalBayar.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#F3E4C9]/60 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-[#8B5E3C]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StatusOrderPage;
