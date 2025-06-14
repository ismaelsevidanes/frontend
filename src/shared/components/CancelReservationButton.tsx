import React, { useState, useMemo } from "react";
import Modal from "./Modal";
import "./CancelReservationButton.css";

interface CancelReservationButtonProps {
  reservationId: number;
  createdAt: string | Date;
  creatorId?: number; // opcional, si quieres forzar el id del creador
  onCancelSuccess?: () => void;
  className?: string;
}

// No se necesita username ni lógica visual de usuario aquí, solo el token para la petición.
function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

const CancelReservationButton: React.FC<CancelReservationButtonProps> = ({
  reservationId,
  createdAt,
  creatorId,
  onCancelSuccess,
  className = "summary-ticket-btn cancel"
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const user = useMemo(getUserFromToken, []);
  const isAdmin = user?.role === "admin";
  const isCreator = creatorId !== undefined && creatorId !== null && Number(user?.id) === Number(creatorId);
  const canCancel = useMemo(() => {
    if (isAdmin) return true;
    if (!createdAt || !user) return false;
    if (isCreator) {
      const created = new Date(createdAt);
      const now = new Date();
      const diffMinutes = (now.getTime() - created.getTime()) / 60000;
      return diffMinutes <= 15;
    }
    return false;
  }, [isAdmin, isCreator, createdAt, user]);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cancelar la reserva");
      setSuccess(true);
      if (onCancelSuccess) onCancelSuccess();
    } catch (err: any) {
      setError(err.message || "Error al cancelar la reserva");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  if (success) return <span className="cancel-success">Reserva cancelada</span>;
  if (!canCancel) return null;

  return (
    <>
      <button className={className} onClick={() => setShowModal(true)} disabled={loading}>
        {loading ? "Cancelando..." : "Cancelar reserva"}
        {error && <span className="cancel-error">{error}</span>}
      </button>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="delete-modal-content-custom">
          <button className="delete-modal-close-custom" onClick={() => setShowModal(false)}>&times;</button>
          <div className="delete-modal-header-custom">Cancelar Reserva</div>
          <div className="delete-modal-body-custom">
            ¿Estás seguro que quieres cancelar la reserva?<br />
            Se devolverá el pago.
          </div>
          <div className="delete-modal-actions-custom">
            <button className="delete-modal-confirm-custom" onClick={handleCancel} disabled={loading}>
              {loading ? "Cancelando..." : "Confirmar"}
            </button>
            <button className="delete-modal-cancel-custom" onClick={() => setShowModal(false)} disabled={loading}>
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CancelReservationButton;
