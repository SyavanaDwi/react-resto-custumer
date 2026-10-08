import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrderByKode } from "@/services/orderService";
import socket from "@/services/socket";
import type { Order, StatusOrder } from "@/types/order";

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
    return <div>Memuat status pesanan...</div>;
  }

  if (!order) {
    return <div>Pesanan tidak ditemukan</div>;
  }

  const subTotal = Number(order.subTotal);
  const diskon = Number(order.diskon);
  const setelahDiskon = subTotal - diskon;
  const ppn = Math.round(setelahDiskon * 0.1);
  const totalBayar = setelahDiskon + ppn;

  if (order.isPendingPayment) {
    return (
      <div>
        <h1>Menunggu Pembayaran</h1>

        <p>Order: {order.orderKode}</p>

        <p>Nama: {order.namaTamu}</p>

        {order.nomerHpTamu && <p>Nomor HP: {order.nomerHpTamu}</p>}

        <p>Silakan selesaikan pembayaran terlebih dahulu.</p>

        <div>
          <p>Subtotal: Rp. {subTotal.toLocaleString("id-ID")}</p>

          {diskon > 0 && (
            <p>Diskon Member: -Rp. {diskon.toLocaleString("id-ID")}</p>
          )}

          <p>Setelah Diskon: Rp. {setelahDiskon.toLocaleString("id-ID")}</p>

          <p>PPN 10%: Rp. {ppn.toLocaleString("id-ID")}</p>

          <h3>Total Bayar: Rp. {totalBayar.toLocaleString("id-ID")}</h3>
        </div>

        <p>Status pembayaran: Belum dibayar</p>
      </div>
    );
  }

  const currentIndex = statusList.indexOf(order.status);

  return (
    <div>
      <h1>Status Pesanan</h1>

      <p>Order: {order.orderKode}</p>

      <p>Nama: {order.namaTamu}</p>

      {order.nomerHpTamu && <p>Nomor HP: {order.nomerHpTamu}</p>}

      <p>Status: {statusLabel[order.status]}</p>

      <div>
        <p>Subtotal: Rp. {subTotal.toLocaleString("id-ID")}</p>

        {diskon > 0 && (
          <p>Diskon Member: -Rp. {diskon.toLocaleString("id-ID")}</p>
        )}

        <p>Setelah Diskon: Rp. {setelahDiskon.toLocaleString("id-ID")}</p>

        <p>PPN 10%: Rp. {ppn.toLocaleString("id-ID")}</p>

        <h3>Total Bayar: Rp. {totalBayar.toLocaleString("id-ID")}</h3>
      </div>

      {statusList.map((status, index) => (
        <div key={status}>
          <p>
            {index <= currentIndex ? "✓" : "○"} {statusLabel[status]}
          </p>
        </div>
      ))}
    </div>
  );
}

export default StatusOrderPage;
