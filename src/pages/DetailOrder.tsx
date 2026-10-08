import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import api from "@/services/api";
import { createSnapToken } from "@/services/midtransService";
import type { Customer } from "@/types/customer";
import { Button } from "@base-ui/react/button";

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
    <div>
      <h2>Detail Pesanan</h2>

      {cartItems.map((item) => (
        <div key={item.menuId}>
          <h2>{item.menu}</h2>

          <Button onClick={() => decreaseQty(item.menuId)}>-</Button>

          <span>{item.jumlah}</span>

          <Button onClick={() => increaseQty(item.menuId)}>+</Button>

          <p>Rp. {(item.harga * item.jumlah).toLocaleString("id-ID")}</p>
        </div>
      ))}

      <div>
        <label>Nama *</label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukan Nama Anda..."
          required
        />

        <label>Nomer Handphone (opsional)</label>

        <input
          type="text"
          value={numberHP}
          onChange={(e) => setNumberHp(e.target.value)}
          onBlur={findCustomer}
          placeholder="Masukan Nomer Handphone Anda..."
        />
      </div>

      <div>
        <p>Subtotal: Rp. {subTotalPrice.toLocaleString("id-ID")}</p>

        <p>
          Diskon {discountPercent}%: Rp. {discount.toLocaleString("id-ID")}
        </p>

        <p>Setelah diskon: Rp. {discountPrice.toLocaleString("id-ID")}</p>

        <p>PPN 10%: Rp. {ppnPrice.toLocaleString("id-ID")}</p>

        <h3>Total Bayar: Rp. {totalPrice.toLocaleString("id-ID")}</h3>

        <Button
          onClick={handleContinuePayment}
          disabled={loadingPayment}>
          Lanjut ke pembayaran
        </Button>
      </div>

      {showPaymentModal && (
        <div>
          <div>
            <h3>Pilih Metode Pembayaran</h3>

            <Button
              onClick={handleCashPayment}
              disabled={loadingPayment}>
              Bayar di Kasir
            </Button>

            <Button
              onClick={handleOnlinePayment}
              disabled={loadingPayment}>
              Bayar Sekarang
            </Button>

            <Button
              onClick={() => setShowPaymentModal(false)}
              disabled={loadingPayment}>
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailOrder;
