import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import DetailOrder from "./pages/DetailOrder";
import TableQrResto from "./pages/TableQr";
import ScanQr from "./pages/ScanQr";
import StatusOrder from "./pages/StatusOrder";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />
      <Route
        path="/detail-order"
        element={<DetailOrder />}
      />

      <Route
        path="/table-qr"
        element={<TableQrResto />}
      />
      <Route
        path="/scan-qr"
        element={<ScanQr />}
      />
      <Route
        path="/status-order"
        element={<StatusOrder />}
      />
    </Routes>
  );
}
