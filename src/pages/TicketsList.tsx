import Navbar from "../components/Navbar";
import { useTickets, useCreateTicket } from "../hooks/useTickets";
import { useState } from "react";
import toast from "react-hot-toast";

export default function TicketsList() {
  const { data: tickets, isLoading } = useTickets();
  const createTicket = useCreateTicket();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate(
      { title, description, priority },
      {
        onSuccess: () => {
          toast.success("Ticket creado con éxito ✅");
          setTitle("");
          setDescription("");
        },
        onError: () => toast.error("Error al crear el ticket "),
      }
    );
  };

  if (isLoading) return <p>Cargando tickets...</p>;

  return (
    <div>
      <Navbar /> {/* ✅ Nueva barra superior */}
      <div style={{ padding: "20px" }}>
        <h1>Mis Tickets</h1>

        <form onSubmit={handleCreate} style={{ marginBottom: "20px" }}>
          <input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
          <button type="submit">Crear ticket</button>
        </form>

        <ul>
          {tickets?.map((t: any) => (
            <li key={t.id}>
              <strong>{t.code}</strong> — {t.title} ({t.status})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
