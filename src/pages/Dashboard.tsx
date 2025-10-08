import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Panel principal</h1>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/tickets" style={{ marginRight: "10px" }}>
          Tickets
        </Link>
        <button onClick={logout}>Cerrar sesión</button>
      </nav>
      <p>Bienvenido al sistema de tickets de Galácticos S.A.</p>
    </div>
  );
}
