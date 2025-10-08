import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import TicketsList from "./pages/TicketsList";
import type { JSX } from "react";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/tickets"
        element={
          <PrivateRoute>
            <TicketsList />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/tickets" replace />} />
    </Routes>
  );
}
