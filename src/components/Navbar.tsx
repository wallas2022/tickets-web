import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast(
      (t) => (
        <span>
          ¿Cerrar sesión?
          <button
            onClick={() => {
              toast.dismiss(t.id);
              logout();
              toast.success("Sesión cerrada correctamente 👋");
            }}
            style={{
              marginLeft: "10px",
              color: "#fff",
              background: "#ef4444",
              border: "none",
              borderRadius: "5px",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Sí
          </button>
        </span>
      ),
      {
        duration: 4000,
        style: { background: "#333", color: "#fff" },
      }
    );
  };

  return (
    <nav
      style={{
        background: "#0f172a",
        color: "white",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/tickets")}
      >
        🎟️ Sistema de Tickets
      </h2>
      <button
        onClick={handleLogout}
        style={{
          background: "#f43f5e",
          color: "white",
          border: "none",
          padding: "6px 10px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </nav>
  );
}
