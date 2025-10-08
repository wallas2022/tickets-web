import { useState } from "react";
import { useCreateTicket } from "../hooks/useTickets";

export default function TicketCreate() {
  const createTicket = useCreateTicket();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate({ title, description, priority });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear nuevo Ticket</h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
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
      <button type="submit" disabled={createTicket.isPending}>
        {createTicket.isPending ? "Creando..." : "Crear Ticket"}
      </button>
    </form>
  );
}
