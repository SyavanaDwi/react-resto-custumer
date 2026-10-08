import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import QrScanner from "@/components/QrScanner";

function ScanQr() {
  const navigate = useNavigate();

  const handleScan = useCallback(
    (result: string) => {
      console.log("QR TERBACA:", result);

      const url = new URL(result);
      const meja = url.searchParams.get("meja");

      if (!meja) {
        alert("QR meja tidak valid");
        return;
      }

      navigate(`/?meja=${meja}`);
    },
    [navigate],
  );

  return (
    <div>
      <h1>Scan QR Meja</h1>

      <QrScanner onScan={handleScan} />
    </div>
  );
}

export default ScanQr;
