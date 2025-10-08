import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast"; // ✅

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onSuccess: () => toast.success("Inicio de sesión exitoso "),
        onError: () => toast.error("Credenciales incorrectas "),
      }
    );
  };

  return (
    <div className="login">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={login.isPending}>
          {login.isPending ? "Cargando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
