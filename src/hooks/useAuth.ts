import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();

  const login = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post("/auth/login", data);
      localStorage.setItem("access_token", res.data.accessToken);
      localStorage.setItem("refresh_token", res.data.refreshToken);
      return res.data.user;
    },
    onSuccess: (user) => {
      toast.success(`Bienvenido, ${user.name}`);
      navigate("/tickets"); // ✅ redirige al listado
    },
    onError: () => toast.error("Credenciales incorrectas "),
  });

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return { login, logout };
};
