import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import TicketsList from "./pages/TicketsList";
import type { JSX } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminUsersPage from "./pages/AdminUsersPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
       {/* Solo ADMIN puede acceder al Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
       <Route
  path="/admin/users"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminUsersPage />
    </ProtectedRoute>
  }
/> 
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
