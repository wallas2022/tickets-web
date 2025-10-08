import { type Ticket } from "../types/ticket";
import { useUpdateTicketStatus } from "../hooks/useTickets";

export const TicketItem = ({ ticket }: { ticket: Ticket }) => {
  const updateStatus = useUpdateTicketStatus();

  return (
    <div>
      <h3>{ticket.title}</h3>
      <p>Estado actual: {ticket.status}</p>
      <button
        onClick={() =>
          updateStatus.mutate({ id: ticket.id, status: "IN_PROGRESS" })
        }
      >
        Marcar en progreso
      </button>
    </div>
  );
};
