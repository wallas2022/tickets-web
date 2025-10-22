import React, { useEffect, useState } from "react";
import axios from "axios";

export default function TicketComments({ ticketId, user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const API_URL = "http://localhost:3000/api"; // ajusta según tu backend

  // ✅ Cargar comentarios al abrir el ticket
  const loadComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/tickets/${ticketId}/comments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
    }
  };

  // ✅ Enviar nuevo comentario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `${API_URL}/tickets/${ticketId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setComments([...comments, res.data]);
      setNewComment("");
    } catch (err) {
      console.error("Error al agregar comentario:", err);
      alert("No tienes permiso para comentar este ticket.");
    }
  };

  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const canComment = ["CUSTOMER", "AGENT"].includes(user.role);

  return (
    <div className="comments-container">
      <h3>💬 Comentarios</h3>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p>No hay comentarios aún.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className={`comment ${
                c.author.role === "AGENT" ? "agent" : "customer"
              }`}
            >
              <strong>{c.author.name} ({c.author.role})</strong>
              <p>{c.content}</p>
              <small>{new Date(c.createdAt).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>

      {canComment ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            placeholder="Escribe tu comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit">Enviar</button>
        </form>
      ) : (
        <p className="no-access">Solo el cliente o el agente pueden comentar.</p>
      )}
    </div>
  );
}
