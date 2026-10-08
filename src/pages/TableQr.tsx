import { useEffect, useState } from "react";
import api from "@/services/api";
import type { TableQr } from "@/types/tableQr";

function TableQrResto() {
  const [tables, setTables] = useState<TableQr[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTableQr = async () => {
      try {
        const response = await api.get("/table/qr");
        setTables(response.data.data);
      } catch (error) {
        console.log("Gagal mengambil QR meja", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTableQr();
  }, []);

  if (loading) {
    return <div>Memuat QR meja...</div>;
  }

  return (
    <div>
      <h1>QR Meja</h1>

      {tables.map((table) => (
        <div key={table.id}>
          <h2>Meja {table.nomerMeja}</h2>

          <img
            src={table.qrCode}
            alt={`QR Meja ${table.nomerMeja}`}
            width={250}
            height={250}
          />

          <p>{table.url}</p>
        </div>
      ))}
    </div>
  );
}

export default TableQrResto;
