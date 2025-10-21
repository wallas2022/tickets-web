import type { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("access_token");

  if (!token) return <Navigate to="/login" replace />;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const userRole = payload.role;

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // redirige a home si no tiene permisos
  }

  return children;
};
